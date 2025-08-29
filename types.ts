
export enum Platform {
  YouTube = 'YouTube',
  Instagram = 'Instagram',
  Facebook = 'Facebook',
  TikTok = 'TikTok',
}

export interface QualityOption {
  quality: string;
  format: string;
  size: string;
  itag?: number;
  url?: string;
  note?: string;
}

export interface SubtitleOption {
  lang: string;
  langCode: string;
}

export interface VideoDetails {
  id: string;
  videoId: string | null;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  platform: Platform;
  videoQualities: QualityOption[];
  audioQualities: QualityOption[];
  subtitles: SubtitleOption[];
  isPlaylist: false;
}

export interface PlaylistDetails {
  id: string;
  title: string;
  thumbnail: string;
  videoCount: number;
  videos: VideoDetails[];
  isPlaylist: true;
}

export type SearchResult = VideoDetails | PlaylistDetails;

export enum DownloadStatus {
  Queued = 'Queued',
  Downloading = 'Downloading',
  Paused = 'Paused',
  Completed = 'Completed',
  Error = 'Error',
}

export interface DownloadItem {
  id: string;
  title: string;
  thumbnail: string;
  quality: string;
  format: string;
  size: string;
  status: DownloadStatus;
  progress: number; // 0-100
  speed: string; // e.g., "1.2 MB/s"
}

export enum ActiveTab {
    Home = 'Home',
    Downloads = 'Downloads',
    Vault = 'Vault'
}