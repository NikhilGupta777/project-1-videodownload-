import React, { useState, useEffect, createContext, useCallback } from 'react';
import type { SearchResult, DownloadItem, ActiveTab as ActiveTabType, VideoDetails, QualityOption } from './types';
import { ActiveTab } from './types';
import { useDownloader } from './hooks/useDownloader';
import Header from './components/Header';
import MainContent from './components/MainContent';

// --- APP CONTEXT ---
interface AppContextType {
    isDarkMode: boolean;
    setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
    activeTab: ActiveTabType;
    setActiveTab: React.Dispatch<React.SetStateAction<ActiveTabType>>;
    searchResult: SearchResult | null;
    isLoading: boolean;
    error: string | null;
    downloads: DownloadItem[];
    vaultFiles: DownloadItem[];
    fetchUrlDetails: (url: string) => Promise<void>;
    addDownload: (video: VideoDetails, quality: QualityOption) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

// --- APP COMPONENT ---
const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [activeTab, setActiveTab] = useState<ActiveTabType>(ActiveTab.Home);
    const [vaultFiles, setVaultFiles] = useState<DownloadItem[]>([]);

    const handleDownloadComplete = useCallback((item: DownloadItem) => {
        setVaultFiles(prev => {
            // Avoid duplicates
            if (prev.some(vf => vf.id === item.id)) {
                return prev;
            }
            return [item, ...prev];
        });
    }, []);
    
    const {
        searchResult,
        isLoading,
        error,
        downloads,
        fetchUrlDetails,
        addDownload
    } = useDownloader(handleDownloadComplete);

    // Load vault from localStorage on initial mount
    useEffect(() => {
        try {
            const storedVault = localStorage.getItem('snapstream-vault');
            if (storedVault) {
                setVaultFiles(JSON.parse(storedVault));
            }
        } catch (e) {
            console.error("Failed to load vault from localStorage", e);
            setVaultFiles([]);
        }
    }, []);

    // Save vault to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('snapstream-vault', JSON.stringify(vaultFiles));
        } catch (e) {
            console.error("Failed to save vault to localStorage", e);
        }
    }, [vaultFiles]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);
    
    const enhancedAddDownload = useCallback((video: VideoDetails, quality: QualityOption) => {
        addDownload(video, quality);
        setActiveTab(ActiveTab.Downloads);
    }, [addDownload, setActiveTab]);

    const contextValue: AppContextType = {
        isDarkMode,
        setIsDarkMode,
        activeTab,
        setActiveTab,
        searchResult,
        isLoading,
        error,
        downloads,
        vaultFiles,
        fetchUrlDetails,
        addDownload: enhancedAddDownload,
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="bg-slate-950 text-slate-300 min-h-screen font-sans">
                <style>{`
                  @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
                `}</style>
                <Header />
                <MainContent />
            </div>
        </AppContext.Provider>
    );
};

export default App;