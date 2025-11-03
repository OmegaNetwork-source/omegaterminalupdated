/**
 * Media Player Types
 *
 * Type definitions for Spotify, YouTube, and News Reader media player systems.
 * These types support OAuth authentication, playback control, search, and content management.
 */

// ============================================================================
// Spotify Types
// ============================================================================

/**
 * Spotify authentication state with OAuth token management
 */
export interface SpotifyAuthState {
  /** Whether user is authenticated with Spotify */
  isAuthenticated: boolean;
  /** OAuth access token for Spotify API calls */
  accessToken: string | null;
  /** OAuth refresh token for obtaining new access tokens */
  refreshToken: string | null;
  /** Timestamp when access token expires */
  expiresAt: number | null;
  /** Spotify Web Playback SDK device ID */
  deviceId: string | null;
}

/**
 * Spotify track metadata
 */
export interface SpotifyTrack {
  /** Spotify track ID */
  id: string;
  /** Track name */
  name: string;
  /** Array of artist objects */
  artists: Array<{ name: string }>;
  /** Album object with name and images */
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  /** Track duration in milliseconds */
  duration_ms: number;
  /** Spotify URI for playback */
  uri: string;
}

/**
 * Spotify playlist metadata
 */
export interface SpotifyPlaylist {
  /** Spotify playlist ID */
  id: string;
  /** Playlist name */
  name: string;
  /** Array of playlist cover images */
  images: Array<{ url: string; height: number; width: number }>;
  /** Tracks info */
  tracks: {
    total: number;
  };
  /** Spotify URI for playback */
  uri: string;
}

/**
 * Spotify player state for playback control
 */
export interface SpotifyPlayerState {
  /** Whether track is currently playing */
  isPlaying: boolean;
  /** Currently playing track */
  currentTrack: SpotifyTrack | null;
  /** Current playback position in milliseconds */
  position: number;
  /** Track duration in milliseconds */
  duration: number;
  /** Volume level (0-100) */
  volume: number;
  /** Whether panel is open */
  isPanelOpen: boolean;
}

// ============================================================================
// YouTube Types
// ============================================================================

/**
 * YouTube video metadata from Data API v3
 */
export interface YouTubeVideo {
  /** Video ID object */
  id: {
    videoId: string;
  };
  /** Video snippet with metadata */
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

/**
 * YouTube player state for playback control
 */
export interface YouTubePlayerState {
  /** Currently playing video ID */
  currentVideoId: string | null;
  /** Whether video is currently playing */
  isPlaying: boolean;
  /** Playlist of videos */
  playlist: Array<{
    id: string;
    title: string;
    channel: string;
  }>;
  /** Current video index in playlist */
  currentIndex: number;
  /** Whether panel is open */
  isPanelOpen: boolean;
}

// ============================================================================
// News Reader Types
// ============================================================================

/**
 * Crypto news article from CryptoPanic/CryptoCompare
 */
export interface NewsArticle {
  /** Article ID */
  id: string;
  /** Article title */
  title: string;
  /** Article URL */
  url: string;
  /** News source info */
  source: {
    title: string;
    domain: string;
  };
  /** Publication timestamp (ISO 8601) */
  published_at: string;
  /** Creation timestamp (ISO 8601) - CryptoPanic specific */
  created_at?: string;
  /** Vote counts for sentiment analysis - CryptoPanic specific */
  votes?: {
    positive: number;
    negative: number;
    important: number;
    liked: number;
    disliked: number;
    lol: number;
    toxic: number;
    saved: number;
    comments: number;
  };
  /** Related cryptocurrencies - CryptoPanic specific */
  currencies?: Array<{
    code: string;
    title: string;
    slug: string;
    url: string;
  }>;
  /** Article domain */
  domain?: string;
}

/**
 * News filter categories
 */
export type NewsFilter = "hot" | "latest" | "bullish" | "bearish";

/**
 * News reader state for content management
 */
export interface NewsReaderState {
  /** Array of news articles */
  articles: NewsArticle[];
  /** Current filter category */
  currentFilter: NewsFilter;
  /** Whether panel is open */
  isPanelOpen: boolean;
  /** Whether news is loading */
  isLoading: boolean;
}
