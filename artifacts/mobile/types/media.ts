export type MediaKind = 'music_video' | 'movie' | 'live_stream';

export interface MusicVideo {
  id: string;
  kind: 'music_video';
  title: string;
  artist: string;
  thumbnailUrl: string;
  videoUrl: string;          // direct stream URL or YouTube embed
  duration: string;          // "3:45"
  genre: string;
  publishedAt: Date;
  publishedBy: string;       // admin uid
  isExclusive: boolean;
  views: number;
}

export interface Movie {
  id: string;
  kind: 'movie';
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  genre: string;
  year: number;
  duration: string;          // "1h 42m"
  rating: string;            // "PG-13"
  publishedAt: Date;
  publishedBy: string;
  views: number;
}

export interface LiveStream {
  id: string;
  kind: 'live_stream';
  title: string;
  description: string;
  thumbnailUrl: string;
  streamUrl: string;         // HLS/RTMP stream URL
  isLive: boolean;
  startedAt: Date | null;
  scheduledFor: Date | null;
  hostName: string;
  viewerCount: number;
  publishedBy: string;
}

export type MediaItem = MusicVideo | Movie | LiveStream;

// Admin publish forms
export interface PublishMusicVideoForm {
  title: string;
  artist: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  genre: string;
  isExclusive: boolean;
}

export interface PublishMovieForm {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  genre: string;
  year: string;
  duration: string;
  rating: string;
}

export interface PublishLiveStreamForm {
  title: string;
  description: string;
  thumbnailUrl: string;
  streamUrl: string;
  hostName: string;
  scheduledFor: string;     // ISO datetime string
}
