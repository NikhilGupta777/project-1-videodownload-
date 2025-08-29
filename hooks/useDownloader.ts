
import { useState, useCallback, useEffect } from 'react';
import type { SearchResult, DownloadItem, QualityOption, VideoDetails } from '../types';
import { DownloadStatus, Platform } from '../types';

// Helper to extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

// Generic download trigger
const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const useDownloader = (onDownloadComplete: (item: DownloadItem) => void) => {
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);

    const fetchUrlDetails = useCallback(async (url: string) => {
        setIsLoading(true);
        setError(null);
        setSearchResult(null);

        if (!url.trim()) {
            setError("Please enter a URL to search.");
            setIsLoading(false);
            return;
        }

        try {
            const videoId = getYouTubeVideoId(url);
            if (!videoId) {
                throw new Error("Invalid or unsupported YouTube URL.");
            }

            // Step 1: Fetch metadata from noembed via a CORS proxy
            const metaApiUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
            const metaResponse = await fetch(`https://api.codetabs.com/v1/proxy/?quest=${metaApiUrl}`);
            if (!metaResponse.ok) {
                 throw new Error(`Failed to fetch metadata (status: ${metaResponse.status})`);
            }
            const metaData = await metaResponse.json();
            if (metaData.error) {
                throw new Error(metaData.error);
            }

            // Step 2: Fetch download options from Cobalt API via a CORS proxy that supports POST
            const cobaltApiUrl = 'https://co.wuk.sh/api/json';
            const proxyUrl = 'https://cors.sh/';

            const cobaltResponse = await fetch(`${proxyUrl}${cobaltApiUrl}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // API key for cors.sh proxy (temporary for development)
                    'x-cors-api-key': 'temp_38896220a8451b6063b4b8b321a6037c'
                },
                body: JSON.stringify({ url: url })
            });

            if (!cobaltResponse.ok) throw new Error(`Failed to fetch download links (status: ${cobaltResponse.status})`);
            
            const cobaltData = await cobaltResponse.json();
            if (cobaltData.status === 'error') throw new Error(cobaltData.text || 'Failed to get download links.');
            if (!['picker', 'stream'].includes(cobaltData.status)) throw new Error('Could not find downloadable formats.');
            
            const videoQualities: QualityOption[] = [];
            const audioQualities: QualityOption[] = [];
            
            const pickerItems = cobaltData.picker || (cobaltData.status === 'stream' ? [cobaltData] : []);

            pickerItems.forEach((item: any) => {
                const size = item.size ? `${(item.size / 1024 / 1024).toFixed(1)} MB` : 'N/A';
                if (item.type === 'video' && item.quality !== 'audio') {
                     videoQualities.push({
                        quality: item.quality,
                        format: 'MP4',
                        size: size,
                        url: item.url,
                        note: item.audio === false ? 'Video Only' : undefined
                    });
                } else if (item.type === 'audio') {
                    audioQualities.push({
                        quality: item.quality,
                        format: 'MP3',
                        size: size,
                        url: item.url
                    });
                }
            });

            // Sort qualities descending for better UX
            videoQualities.sort((a, b) => {
                const aNum = parseInt(a.quality);
                const bNum = parseInt(b.quality);
                if (isNaN(aNum) || isNaN(bNum)) return 0;
                return bNum - aNum;
            });

            const videoDetails: VideoDetails = {
                id: url,
                videoId: videoId,
                title: metaData.title || 'Untitled Video',
                author: metaData.author_name || 'Unknown Author',
                duration: 'N/A', // oEmbed doesn't provide this
                platform: Platform.YouTube,
                thumbnail: metaData.thumbnail_url,
                videoQualities,
                audioQualities,
                subtitles: [],
                isPlaylist: false,
            };
            setSearchResult(videoDetails);

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "Could not fetch details. The URL may be invalid or the service is temporarily unavailable.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addDownload = useCallback((video: VideoDetails, quality: QualityOption) => {
        if (!quality.url) {
            console.error('No download URL for this quality option.');
            return;
        }
        
        const filename = `${video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${quality.format.toLowerCase()}`;
        triggerDownload(quality.url, filename);
        
        const newDownload: DownloadItem = {
            id: `${video.id}-${quality.quality}-${quality.format}-${Date.now()}`,
            title: video.title,
            thumbnail: video.thumbnail,
            quality: quality.quality,
            format: quality.format,
            size: quality.size,
            status: DownloadStatus.Queued,
            progress: 0,
            speed: '0 KB/s',
        };
        
        setDownloads(prev => [newDownload, ...prev]);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setDownloads(prevDownloads => {
                 let processedDownloads = [...prevDownloads];
                const activeDownload = processedDownloads.find(d => d.status === DownloadStatus.Downloading);
                
                if (activeDownload) {
                     return processedDownloads.map(d => {
                        if (d.id === activeDownload.id) {
                            const newProgress = 100; // Complete in one step
                            const isComplete = newProgress >= 100;
                            
                            if (isComplete) {
                                const completedItem = { ...d, progress: 100, status: DownloadStatus.Completed, speed: '' };
                                onDownloadComplete(completedItem);
                            }
                            
                            return {
                                ...d,
                                progress: newProgress,
                                speed: 'Complete!',
                                status: isComplete ? DownloadStatus.Completed : d.status,
                            };
                        }
                        return d;
                    });
                } else {
                    const queuedDownloadIndex = processedDownloads.findIndex(d => d.status === DownloadStatus.Queued);
                    if (queuedDownloadIndex > -1) {
                         processedDownloads[queuedDownloadIndex].status = DownloadStatus.Downloading;
                         return processedDownloads;
                    }
                }
                return prevDownloads;
            });
        }, 800);

        return () => clearInterval(interval);
    }, [onDownloadComplete]);

     useEffect(() => {
        downloads.forEach(d => {
            if (d.status === DownloadStatus.Completed) {
                // Remove completed item from view after a delay
                setTimeout(() => {
                    setDownloads(prev => prev.filter(item => item.id !== d.id));
                }, 4000);
            }
        });
    }, [downloads]);

    return {
        searchResult,
        isLoading,
        error,
        downloads,
        fetchUrlDetails,
        addDownload
    };
};
