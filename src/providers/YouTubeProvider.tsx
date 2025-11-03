"use client";

/**
 * YouTube Provider
 *
 * Manages YouTube player state and API integration.
 * Integrates with YouTube IFrame API for video playback and YouTube Data API v3 for search.
 *
 * Features:
 * - YouTube IFrame API player integration
 * - Search videos via YouTube Data API v3
 * - Load default channel videos (Bloomberg Technology)
 * - Playlist management with next/previous
 * - Playback controls (play, pause, mute)
 * - No authentication required for basic playback
 *
 * Requirements:
 * - YouTube API key (optional, but recommended for search)
 * - Internet connection
 *
 * Usage:
 *   <YouTubeProvider>
 *     <YourApp />
 *   </YouTubeProvider>
 *
 *   const { searchVideos, playVideo, togglePlayPause } = useYouTube();
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import config from "@/lib/config";
import type { YouTubePlayerState, YouTubeVideo } from "@/types/media";

// ============================================================================
// Types
// ============================================================================

interface YouTubeContextValue {
  playerState: YouTubePlayerState;
  searchResults: YouTubeVideo[];
  initializeAPI: () => Promise<void>;
  createPlayer: (elementId: string) => void;
  searchVideos: (query: string) => Promise<void>;
  getDefaultChannelVideos: () => Promise<void>;
  playVideo: (videoId: string, index: number) => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  toggleMute: () => void;
  openPanel: () => void;
  closePanel: () => void;
}

// ============================================================================
// Context
// ============================================================================

const YouTubeContext = createContext<YouTubeContextValue | undefined>(
  undefined
);

// ============================================================================
// Provider Component
// ============================================================================

export function YouTubeProvider({ children }: { children: ReactNode }) {
  const [playerState, setPlayerState] = useState<YouTubePlayerState>({
    currentVideoId: null,
    isPlaying: false,
    playlist: [],
    currentIndex: 0,
    isPanelOpen: false,
  });

  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const ytPlayerRef = useRef<any>(null);
  const apiReadyRef = useRef<boolean>(false);

  // ==========================================================================
  // API Initialization
  // ==========================================================================

  const initializeAPI = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      // Check if API already loaded
      if (window.YT && window.YT.Player) {
        apiReadyRef.current = true;
        resolve();
        return;
      }

      // Load YouTube IFrame API
      if (!document.getElementById("youtube-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Set callback for when API is ready
      window.onYouTubeIframeAPIReady = () => {
        apiReadyRef.current = true;
        console.log("[YouTube] IFrame API ready");
        resolve();
      };
    });
  }, []);

  // ==========================================================================
  // Player Creation
  // ==========================================================================

  const createPlayer = useCallback((elementId: string) => {
    if (!window.YT || !apiReadyRef.current) {
      console.warn("[YouTube] API not ready yet");
      return;
    }

    try {
      const player = new window.YT.Player(elementId, {
        height: "100%",
        width: "100%",
        playerVars: {
          playsinline: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            console.log("[YouTube] Player ready");
          },
          onStateChange: (event: any) => {
            const isPlaying = event.data === window.YT.PlayerState.PLAYING;
            setPlayerState((prev) => ({ ...prev, isPlaying }));
          },
        },
      });

      ytPlayerRef.current = player;
    } catch (error) {
      console.error("[YouTube] Failed to create player:", error);
    }
  }, []);

  // ==========================================================================
  // Video Search
  // ==========================================================================

  const searchVideos = useCallback(async (query: string) => {
    try {
      const apiKey = config.YOUTUBE_CONFIG.API_KEY;
      const maxResults = config.YOUTUBE_CONFIG.SEARCH_RESULTS_LIMIT;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query
        )}&type=video&maxResults=${maxResults}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error("YouTube search failed");
      }

      const data = await response.json();
      const videos: YouTubeVideo[] = data.items || [];

      setSearchResults(videos);

      // Create playlist from search results
      const playlist = videos.map((video, index) => ({
        id: video.id.videoId,
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
      }));

      setPlayerState((prev) => ({
        ...prev,
        playlist,
      }));

      console.log(`[YouTube] Found ${videos.length} videos for "${query}"`);
    } catch (error) {
      console.error("[YouTube] Search failed:", error);
      setSearchResults([]);
    }
  }, []);

  const getDefaultChannelVideos = useCallback(async () => {
    try {
      const apiKey = config.YOUTUBE_CONFIG.API_KEY;
      const channelId = config.YOUTUBE_CONFIG.DEFAULT_CHANNEL_ID;
      const maxResults = config.YOUTUBE_CONFIG.SEARCH_RESULTS_LIMIT;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch channel videos");
      }

      const data = await response.json();
      const videos: YouTubeVideo[] = data.items || [];

      setSearchResults(videos);

      // Create playlist from channel videos
      const playlist = videos.map((video, index) => ({
        id: video.id.videoId,
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
      }));

      setPlayerState((prev) => ({
        ...prev,
        playlist,
      }));

      console.log(
        `[YouTube] Loaded ${videos.length} videos from ${config.YOUTUBE_CONFIG.DEFAULT_CHANNEL_NAME}`
      );
    } catch (error) {
      console.error("[YouTube] Failed to fetch channel videos:", error);
    }
  }, []);

  // ==========================================================================
  // Playback Controls
  // ==========================================================================

  const playVideo = useCallback((videoId: string, index: number) => {
    if (!ytPlayerRef.current) {
      console.warn("[YouTube] Player not initialized");
      return;
    }

    try {
      ytPlayerRef.current.loadVideoById(videoId);
      setPlayerState((prev) => ({
        ...prev,
        currentVideoId: videoId,
        currentIndex: index,
        isPlaying: true,
      }));
    } catch (error) {
      console.error("[YouTube] Failed to play video:", error);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!ytPlayerRef.current) return;

    try {
      const playerState = ytPlayerRef.current.getPlayerState();
      if (playerState === window.YT.PlayerState.PLAYING) {
        ytPlayerRef.current.pauseVideo();
      } else {
        ytPlayerRef.current.playVideo();
      }
    } catch (error) {
      console.error("[YouTube] Toggle play/pause failed:", error);
    }
  }, []);

  const next = useCallback(() => {
    const { playlist, currentIndex } = playerState;
    if (currentIndex < playlist.length - 1) {
      const nextVideo = playlist[currentIndex + 1];
      playVideo(nextVideo.id, currentIndex + 1);
    }
  }, [playerState, playVideo]);

  const previous = useCallback(() => {
    const { playlist, currentIndex } = playerState;
    if (currentIndex > 0) {
      const prevVideo = playlist[currentIndex - 1];
      playVideo(prevVideo.id, currentIndex - 1);
    }
  }, [playerState, playVideo]);

  const toggleMute = useCallback(() => {
    if (!ytPlayerRef.current) return;

    try {
      if (ytPlayerRef.current.isMuted()) {
        ytPlayerRef.current.unMute();
      } else {
        ytPlayerRef.current.mute();
      }
    } catch (error) {
      console.error("[YouTube] Toggle mute failed:", error);
    }
  }, []);

  // ==========================================================================
  // Panel Controls
  // ==========================================================================

  const openPanel = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPanelOpen: true }));
    if (!apiReadyRef.current) {
      void initializeAPI();
    }
  }, [initializeAPI]);

  const closePanel = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPanelOpen: false }));
  }, []);

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  useEffect(() => {
    return () => {
      window.onYouTubeIframeAPIReady = undefined as any;
    };
  }, []);

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const value: YouTubeContextValue = {
    playerState,
    searchResults,
    initializeAPI,
    createPlayer,
    searchVideos,
    getDefaultChannelVideos,
    playVideo,
    togglePlayPause,
    next,
    previous,
    toggleMute,
    openPanel,
    closePanel,
  };

  return (
    <YouTubeContext.Provider value={value}>{children}</YouTubeContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useYouTube() {
  const context = useContext(YouTubeContext);
  if (context === undefined) {
    throw new Error("useYouTube must be used within YouTubeProvider");
  }
  return context;
}
