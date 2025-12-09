/**
 * YouTube IFrame API Type Definitions
 * 
 * Type declarations for the YouTube IFrame API
 * loaded from https://www.youtube.com/iframe_api
 */

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: YouTubePlayerOptions
      ) => YouTubePlayer;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YouTubePlayerOptions {
  videoId?: string;
  width?: number;
  height?: number;
  playerVars?: {
    autoplay?: 0 | 1;
    cc_lang_pref?: string;
    cc_load_policy?: 0 | 1;
    color?: "red" | "white";
    controls?: 0 | 1;
    disablekb?: 0 | 1;
    enablejsapi?: 0 | 1;
    end?: number;
    fs?: 0 | 1;
    hl?: string;
    iv_load_policy?: 1 | 3;
    list?: string;
    listType?: "playlist" | "user_uploads";
    loop?: 0 | 1;
    modestbranding?: 0 | 1;
    origin?: string;
    playlist?: string;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
    start?: number;
    widget_referrer?: string;
  };
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void;
    onStateChange?: (event: YouTubePlayerEvent) => void;
    onError?: (event: YouTubePlayerEvent) => void;
    onPlaybackQualityChange?: (event: YouTubePlayerEvent) => void;
    onPlaybackRateChange?: (event: YouTubePlayerEvent) => void;
  };
}

export interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoUrl: () => string;
  getVideoEmbedCode: () => string;
  getVideoData: () => {
    video_id: string;
    author: string;
    title: string;
  };
  getAvailableQualityLevels: () => string[];
  getPlaybackQuality: () => string;
  setPlaybackQuality: (quality: string) => void;
  getAvailablePlaybackRates: () => number[];
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  getPlayerState: () => number;
  getPlaylist: () => string[];
  getPlaylistIndex: () => number;
  getIframe: () => HTMLIFrameElement;
  destroy: () => void;
  addEventListener: (event: string, listener: (event: YouTubePlayerEvent) => void) => void;
  removeEventListener: (event: string, listener: (event: YouTubePlayerEvent) => void) => void;
}

export interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data?: number | string;
}

export {};

