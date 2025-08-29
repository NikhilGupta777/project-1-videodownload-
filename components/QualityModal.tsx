import React, { useState } from 'react';
import type { VideoDetails, QualityOption } from '../types';
import { DownloadIcon, CloseIcon } from './Icons';

interface QualityModalProps {
  video: VideoDetails;
  onClose: () => void;
  onDownload: (video: VideoDetails, quality: QualityOption) => void;
}

const QualityModal: React.FC<QualityModalProps> = ({ video, onClose, onDownload }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'subs'>('video');

  const handleDownloadClick = (quality: QualityOption) => {
    onDownload(video, quality);
    onClose();
  };
  
  const TabButton = ({ tab, label }: { tab: 'video' | 'audio' | 'subs', label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        activeTab === tab 
          ? 'text-cyan-400 border-b-2 border-cyan-400' 
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-slate-700 animate-fade-in-up">
        <div className="p-4 flex items-start justify-between border-b border-slate-700">
            <div className="flex items-start space-x-4">
                <img src={video.thumbnail} alt={video.title} className="w-24 h-auto object-cover rounded-md" />
                <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{video.title}</h3>
                    <p className="text-sm text-slate-400">{video.author}</p>
                    <p className="text-xs text-slate-500">{video.duration}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="border-b border-slate-700">
          <nav className="flex space-x-2 px-4">
            <TabButton tab="video" label="Video" />
            <TabButton tab="audio" label="Audio" />
            {video.subtitles.length > 0 && <TabButton tab="subs" label="Subtitles" />}
          </nav>
        </div>
        
        <div className="p-4 max-h-64 overflow-y-auto">
          {activeTab === 'video' && (
            <ul className="space-y-2">
              {video.videoQualities.length > 0 ? video.videoQualities.map((q) => (
                <li key={`${q.quality}-${q.format}`} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                  <div>
                    <span className="font-semibold text-white">{q.quality}</span>
                    <span className="text-xs text-slate-400 ml-2">{q.format}</span>
                    {q.note && <span className="text-xs text-yellow-400 ml-2 bg-yellow-900/50 px-1.5 py-0.5 rounded-full">{q.note}</span>}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-300 w-20 text-right">{q.size}</span>
                    <button onClick={() => handleDownloadClick(q)} className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-full transition-colors"><DownloadIcon className="w-5 h-5" /></button>
                  </div>
                </li>
              )) : <p className="text-center text-slate-400">No video formats available.</p>}
            </ul>
          )}
          {activeTab === 'audio' && (
             <ul className="space-y-2">
                {video.audioQualities.length > 0 ? video.audioQualities.map((q) => (
                    <li key={`${q.quality}-${q.format}`} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                    <div>
                        <span className="font-semibold text-white">{q.quality}</span>
                        <span className="text-xs text-slate-400 ml-2">{q.format}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-slate-300 w-20 text-right">{q.size}</span>
                        <button onClick={() => handleDownloadClick(q)} className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-full transition-colors"><DownloadIcon className="w-5 h-5" /></button>
                    </div>
                    </li>
                )) : <p className="text-center text-slate-400">No audio formats available.</p>}
            </ul>
          )}
           {activeTab === 'subs' && (
             <ul className="space-y-2">
              {video.subtitles.map((sub) => (
                <li key={sub.langCode} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                  <span className="font-semibold text-white">{sub.lang}</span>
                   <button className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-full transition-colors"><DownloadIcon className="w-5 h-5" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityModal;