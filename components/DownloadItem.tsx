
import React from 'react';
import type { DownloadItem } from '../types';
import { DownloadStatus } from '../types';

interface DownloadItemProps {
  item: DownloadItem;
}

const DownloadItemComponent: React.FC<DownloadItemProps> = ({ item }) => {
  const getStatusColor = () => {
    switch (item.status) {
      case DownloadStatus.Downloading:
        return 'text-cyan-400';
      case DownloadStatus.Completed:
        return 'text-green-400';
      case DownloadStatus.Error:
        return 'text-red-400';
      case DownloadStatus.Queued:
        return 'text-yellow-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="flex items-center space-x-4 p-3 bg-slate-800/50 rounded-lg">
      <img src={item.thumbnail} alt={item.title} className="w-24 h-14 object-cover rounded-md flex-shrink-0" />
      <div className="flex-grow overflow-hidden">
        <p className="text-sm font-semibold text-white truncate">{item.title}</p>
        <p className="text-xs text-slate-400">{item.quality} - {item.format} - {item.size}</p>
        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
          <div
            className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500 ease-linear"
            style={{ width: `${item.progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs font-mono ${getStatusColor()}`}>{item.status}</span>
          {item.status === DownloadStatus.Downloading && (
            <span className="text-xs text-slate-400 font-mono">{item.speed}</span>
          )}
          {item.status === DownloadStatus.Completed && (
             <span className="text-xs text-green-400 font-mono">Complete!</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadItemComponent;
