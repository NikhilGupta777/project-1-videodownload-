import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import type { VideoDetails } from '../types';
import { ActiveTab, Platform } from '../types';
import { DownloadIcon, SearchIcon, YoutubeIcon, TiktokIcon, InstagramIcon, FacebookIcon } from './Icons';
import QualityModal from './QualityModal';
import DownloadItemComponent from './DownloadItem';
import Vault from './Vault';

// --- SEARCH BAR ---
const SearchBar: React.FC = () => {
    const context = useContext(AppContext);
    const [url, setUrl] = useState('');

    if (!context) return null;
    const { isLoading, fetchUrlDetails } = context;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUrlDetails(url);
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste a video URL here..."
                    className="w-full pl-5 pr-12 py-4 bg-slate-800 border border-slate-700 rounded-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                />
                <button type="submit" disabled={isLoading} className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-slate-400 hover:text-cyan-400 disabled:text-slate-600 transition-colors">
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-t-cyan-400 border-slate-600 rounded-full animate-spin"></div>
                    ) : (
                        <SearchIcon className="w-6 h-6" />
                    )}
                </button>
            </form>
            <div className="flex items-center justify-center space-x-4 mt-4 text-slate-500">
                <YoutubeIcon className="w-8 h-8 hover:text-red-500 transition-colors cursor-pointer" />
                <TiktokIcon className="w-7 h-7 hover:text-white transition-colors cursor-pointer" />
                <InstagramIcon className="w-7 h-7 hover:text-pink-500 transition-colors cursor-pointer" />
                <FacebookIcon className="w-7 h-7 hover:text-blue-500 transition-colors cursor-pointer" />
            </div>
        </div>
    );
};

// --- RESULT DISPLAY ---
const ResultDisplay: React.FC = () => {
    const context = useContext(AppContext);
    const [selectedVideo, setSelectedVideo] = useState<VideoDetails | null>(null);

    if (!context) return null;
    const { searchResult, error, addDownload } = context;

    const openModal = (video: VideoDetails) => {
        setSelectedVideo(video);
    };
    
    if (error) {
        return <div className="text-center text-red-400 p-8">{error}</div>;
    }

    if (!searchResult) {
        return (
            <div className="text-center text-slate-500 p-8">
                <h3 className="text-xl font-semibold mb-2">Real Video & Audio Downloader</h3>
                <p>Paste a video link above to fetch available download formats.</p>
                <p className="text-xs mt-2 max-w-md mx-auto">This tool uses a third-party service to provide direct download links for video and audio files.</p>
            </div>
        );
    }
    
    // FIX: Using the `in` operator provides a more reliable type guard
    // to differentiate `PlaylistDetails` from `VideoDetails`. This ensures
    // TypeScript correctly narrows the type of `searchResult`.
    if ('videos' in searchResult) {
        // TODO: Implement playlist view
        return <div>Playlist display is not yet implemented.</div>;
    }
    
    return (
        <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in-up">
            <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col sm:flex-row border border-slate-700">
                <img src={searchResult.thumbnail} alt={searchResult.title} className="w-full sm:w-48 h-auto object-cover flex-shrink-0" />
                <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                        <p className="text-xs text-cyan-400 font-semibold">{searchResult.platform}</p>
                        <h3 className="text-lg font-bold text-white">{searchResult.title}</h3>
                        <p className="text-sm text-slate-400">{searchResult.author}</p>
                    </div>
                    <button onClick={() => openModal(searchResult)} className="mt-4 w-full sm:w-auto self-start sm:self-end bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2">
                        <DownloadIcon className="w-5 h-5" />
                        <span>Download Options</span>
                    </button>
                </div>
            </div>
            {selectedVideo && (
                <QualityModal 
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                    onDownload={addDownload}
                />
            )}
        </div>
    );
};

// --- HOME PAGE ---
const HomePage: React.FC = () => {
    return (
        <div className="space-y-8 py-8">
            <SearchBar />
            <ResultDisplay />
        </div>
    );
};

// --- DOWNLOADS PAGE ---
const DownloadsPage: React.FC = () => {
    const context = useContext(AppContext);
    if(!context) return null;
    const { downloads } = context;

    if (downloads.length === 0) {
        return (
            <div className="text-center text-slate-500 p-8 flex flex-col items-center justify-center h-full">
                <DownloadIcon className="w-16 h-16 mb-4 text-slate-600"/>
                <h3 className="text-xl font-semibold mb-2">No Active Downloads</h3>
                <p>Your download history will appear here briefly.</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-4">
            {downloads.map(item => <DownloadItemComponent key={item.id} item={item} />)}
        </div>
    )
};

// --- MAIN CONTENT ---
const MainContent: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { activeTab, setActiveTab, downloads } = context;
    
    const downloadsInProgress = downloads.filter(d => d.status === 'Downloading' || d.status === 'Queued').length;

    const TabButton = ({ tab, label }: { tab: ActiveTab, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm rounded-md transition-colors relative ${
                activeTab === tab 
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
        >
            {label}
            {tab === ActiveTab.Downloads && downloadsInProgress > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 text-white text-xs items-center justify-center">{downloadsInProgress}</span>
                </span>
            )}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case ActiveTab.Home:
                return <HomePage />;
            case ActiveTab.Downloads:
                return <DownloadsPage />;
            case ActiveTab.Vault:
                return <Vault />;
            default:
                return <HomePage />;
        }
    };
    
    return (
        <main className="container mx-auto px-0 sm:px-6 lg:px-8 flex-grow">
            <div className="bg-slate-900 border-b border-slate-700 sticky top-16 z-30">
                 <div className="p-2 flex justify-center space-x-2">
                    <TabButton tab={ActiveTab.Home} label="Home" />
                    <TabButton tab={ActiveTab.Downloads} label="Downloads" />
                    <TabButton tab={ActiveTab.Vault} label="Vault" />
                </div>
            </div>
            <div className="min-h-[calc(100vh-12rem)]">
                {renderContent()}
            </div>
        </main>
    );
};

export default MainContent;