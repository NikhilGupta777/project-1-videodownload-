
import React, { useContext } from 'react';
import { AppContext } from '../App';
import { SunIcon, MoonIcon, DownloadIcon } from './Icons';

const Header: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { isDarkMode, setIsDarkMode } = context;

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-slate-700">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                    <DownloadIcon className="w-8 h-8 text-cyan-500" />
                    <h1 className="text-xl font-bold text-white tracking-tight">SnapStream</h1>
                </div>
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-colors duration-200"
                >
                    {isDarkMode ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>
        </header>
    );
};

export default Header;
