import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { LockIcon } from './Icons';

const Vault: React.FC = () => {
    const context = useContext(AppContext);
    const [password, setPassword] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [error, setError] = useState('');

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would be a secure check.
        if (password === '1234') {
            setIsUnlocked(true);
            setError('');
        } else {
            setError('Incorrect password. Try "1234".');
        }
    };

    if (!isUnlocked) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in-up min-h-[calc(100vh-12rem)]">
                <div className="bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700 max-w-sm w-full">
                    <div className="mx-auto bg-slate-700 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <LockIcon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Private Vault</h2>
                    <p className="text-slate-400 mb-6">Enter your password to unlock your private files.</p>
                    <form onSubmit={handleUnlock}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-slate-900 border border-slate-600 rounded-md px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
                        />
                         {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
                            Unlock
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    
    if (!context || context.vaultFiles.length === 0) {
        return (
             <div className="p-4 sm:p-6 animate-fade-in-up text-center text-slate-500">
                <h2 className="text-2xl font-bold text-white mb-4">Your Private Files</h2>
                <p>Your completed downloads will be stored here.</p>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-4">Your Private Files</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {context.vaultFiles.map((file) => (
                    <div key={file.id} className="aspect-w-16 aspect-h-9 bg-slate-800 rounded-lg overflow-hidden group relative">
                        <img src={file.thumbnail} alt={file.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-2 w-full">
                             <p className="text-white text-sm font-semibold truncate">{file.title}</p>
                             <p className="text-xs text-slate-300">{file.quality} - {file.format}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Vault;