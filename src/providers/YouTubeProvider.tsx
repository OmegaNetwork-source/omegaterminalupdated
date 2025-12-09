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
  resizePlayer: () => void;
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
  const playerReadyRef = useRef<boolean>(false);

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
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
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

    // Clear existing player if it exists
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.destroy();
      } catch (e) {
        // Ignore cleanup errors
      }
      ytPlayerRef.current = null;
    }
    playerReadyRef.current = false;

    try {
      // Get container element to determine responsive size
      const container = document.getElementById(elementId);
      if (!container) {
        console.warn("[YouTube] Container not found:", elementId);
        return;
      }
      
      // Use container's actual size, or fallback to reasonable defaults
      const containerWidth = container.clientWidth || container.offsetWidth || 640;
      const containerHeight = container.clientHeight || container.offsetHeight || 390;
      
      // Calculate responsive dimensions (16:9 aspect ratio)
      // Use container width, calculate height based on aspect ratio
      const width = containerWidth > 0 ? containerWidth : 640;
      const height = Math.round(width * 9 / 16); // 16:9 aspect ratio
      
      const player = new window.YT.Player(elementId, {
        height: height,
        width: width,
        playerVars: {
          playsinline: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
          autoplay: 0, // Don't autoplay - let user control
        },
        events: {
          onReady: (event: any) => {
            console.log("[YouTube] Player ready");
            playerReadyRef.current = true;
            setPlayerState((prev) => ({ ...prev, isPlaying: false }));
          },
          onStateChange: (event: any) => {
            const state = event.data;
            const isPlaying = window.YT ? state === window.YT.PlayerState.PLAYING : false;
            
            setPlayerState((prev) => {
              const newState = { ...prev, isPlaying };
              
              // Auto-play next video if current ended
              if (window.YT && state === window.YT.PlayerState.ENDED) {
                const { playlist, currentIndex } = prev;
                if (currentIndex < playlist.length - 1) {
                  setTimeout(() => {
                    const nextVideo = playlist[currentIndex + 1];
                    if (nextVideo && ytPlayerRef.current && playerReadyRef.current) {
                      try {
                        ytPlayerRef.current.loadVideoById(nextVideo.id);
                        setPlayerState((p) => ({
                          ...p,
                          currentVideoId: nextVideo.id,
                          currentIndex: currentIndex + 1,
                          isPlaying: true,
                        }));
                      } catch (err) {
                        console.error("[YouTube] Failed to auto-play next:", err);
                      }
                    }
                  }, 1000);
                }
              }
              
              return newState;
            });
          },
          onError: (event: any) => {
            console.error("[YouTube] Player error:", event.data);
            const errorCode = event.data;
            let errorMessage = "Unknown error";
            
            switch (errorCode) {
              case 2:
                errorMessage = "Invalid video ID";
                break;
              case 5:
                errorMessage = "HTML5 player error";
                break;
              case 100:
                errorMessage = "Video not found or removed";
                break;
              case 101:
              case 150:
                errorMessage = "Video not allowed to be played in embedded players";
                break;
              default:
                errorMessage = `Error code: ${errorCode}`;
            }
            
            console.error(`[YouTube] Playback error: ${errorMessage}`);
            setPlayerState((prev) => ({
              ...prev,
              isPlaying: false,
              currentVideoId: null,
            }));
          },
        },
      });

      ytPlayerRef.current = player;
    } catch (error) {
      console.error("[YouTube] Failed to create player:", error);
      playerReadyRef.current = false;
    }
  }, []);

  // ==========================================================================
  // Video Search
  // ==========================================================================

  const searchVideos = useCallback(async (query: string) => {
    try {
      const apiKey = config.YOUTUBE_CONFIG.API_KEY;
      const maxResults = config.YOUTUBE_CONFIG.SEARCH_RESULTS_LIMIT;

      // If no API key, show helpful message
      if (!apiKey || apiKey.trim() === "") {
        console.warn("[YouTube] API key not configured - search requires API key");
        console.warn("[YouTube] Please set NEXT_PUBLIC_YOUTUBE_API_KEY in your .env.local file");
        setSearchResults([]);
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query
        )}&type=video&maxResults=${maxResults}&key=${apiKey}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "YouTube search failed");
      }

      const data = await response.json();
      const videos: YouTubeVideo[] = data.items || [];

      setSearchResults(videos);

      // Create playlist from search results - filter out invalid video IDs
      const playlist = videos
        .filter((video) => {
          const videoId = video?.id?.videoId;
          if (!videoId || typeof videoId !== "string" || videoId.trim() === "") {
            console.warn("[YouTube] Skipping video with invalid ID:", video);
            return false;
          }
          // Validate YouTube video ID format (11 characters, alphanumeric and hyphens/underscores)
          if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            console.warn("[YouTube] Skipping video with invalid ID format:", videoId);
            return false;
          }
          return true;
        })
        .map((video) => ({
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
      throw error; // Re-throw so command can show error message
    }
  }, []);

  const getDefaultChannelVideos = useCallback(async () => {
    try {
      const apiKey = config.YOUTUBE_CONFIG.API_KEY;
      const channelId = config.YOUTUBE_CONFIG.DEFAULT_CHANNEL_ID;
      const maxResults = config.YOUTUBE_CONFIG.SEARCH_RESULTS_LIMIT;

      // If no API key, show helpful message but still allow player to work
      if (!apiKey || apiKey.trim() === "") {
        console.warn("[YouTube] API key not configured - default videos will not load");
        console.warn("[YouTube] Player will still work, but search and channel videos require API key");
        // Set empty results but don't throw error
        setSearchResults([]);
        setPlayerState((prev) => ({
          ...prev,
          playlist: [],
        }));
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}&key=${apiKey}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to fetch channel videos");
      }

      const data = await response.json();
      const videos: YouTubeVideo[] = data.items || [];

      setSearchResults(videos);

      // Create playlist from channel videos - filter out invalid video IDs
      const playlist = videos
        .filter((video) => {
          const videoId = video?.id?.videoId;
          if (!videoId || typeof videoId !== "string" || videoId.trim() === "") {
            console.warn("[YouTube] Skipping video with invalid ID:", video);
            return false;
          }
          // Validate YouTube video ID format (11 characters, alphanumeric and hyphens/underscores)
          if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            console.warn("[YouTube] Skipping video with invalid ID format:", videoId);
            return false;
          }
          return true;
        })
        .map((video) => ({
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
      // Set empty results on error so player can still work
      setSearchResults([]);
    }
  }, []);

  // ==========================================================================
  // Playback Controls
  // ==========================================================================

  const playVideo = useCallback((videoId: string, index: number) => {
    // Validate video ID format
    if (!videoId || typeof videoId !== "string" || videoId.trim() === "") {
      console.error("[YouTube] Invalid video ID:", videoId);
      return;
    }
    
    // Clean and validate YouTube video ID format (11 characters, alphanumeric and hyphens/underscores)
    const cleanVideoId = videoId.trim();
    if (!/^[a-zA-Z0-9_-]{11}$/.test(cleanVideoId)) {
      console.error("[YouTube] Invalid video ID format:", cleanVideoId);
      console.error("[YouTube] Video ID must be exactly 11 characters (alphanumeric, hyphens, underscores)");
      return;
    }

    // Check if player exists and is ready
    if (!ytPlayerRef.current) {
      console.warn("[YouTube] Player not initialized - initializing now...");
      // Try to initialize if API is ready
      if (apiReadyRef.current && typeof window !== "undefined" && window.YT) {
        // Find or create player container
        const containerId = "youtube-player-iframe";
        const container = document.getElementById(containerId);
        if (container) {
          try {
            createPlayer(containerId);
      // Wait for player to be ready, then try again
      const checkReady = setInterval(() => {
        if (playerReadyRef.current && ytPlayerRef.current) {
          clearInterval(checkReady);
          try {
            if (typeof ytPlayerRef.current.loadVideoById === "function") {
              ytPlayerRef.current.cueVideoById({
                videoId: cleanVideoId,
                startSeconds: 0,
              });
              setPlayerState((prev) => ({
                ...prev,
                currentVideoId: cleanVideoId,
                currentIndex: index,
                isPlaying: false,
              }));
              // Play after a short delay
              setTimeout(() => {
                if (ytPlayerRef.current && playerReadyRef.current) {
                  try {
                    ytPlayerRef.current.playVideo();
                  } catch (err) {
                    console.error("[YouTube] Failed to start playback:", err);
                  }
                }
              }, 300);
            }
          } catch (err) {
            console.error("[YouTube] Failed to play video after init:", err);
          }
        }
      }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
              clearInterval(checkReady);
            }, 5000);
          } catch (err) {
            console.error("[YouTube] Failed to create player:", err);
          }
        } else {
          console.error("[YouTube] Player container not found:", containerId);
        }
      } else {
        console.error("[YouTube] API not ready - cannot create player");
      }
      return;
    }

    // Check if player is ready
    if (!playerReadyRef.current) {
      console.warn("[YouTube] Player not ready yet - waiting...");
      // Wait for player to be ready
      const checkReady = setInterval(() => {
        if (playerReadyRef.current) {
          clearInterval(checkReady);
          playVideo(videoId, index); // Retry
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkReady);
      }, 3000);
      return;
    }

    // Check if player has the required methods
    if (typeof ytPlayerRef.current.loadVideoById !== "function") {
      console.warn("[YouTube] Player not ready yet - methods not available");
      return;
    }

    try {
      // Use cueVideoById first to load without autoplay, then play
      ytPlayerRef.current.cueVideoById({
        videoId: cleanVideoId,
        startSeconds: 0,
      });
      
      // Update state immediately
      setPlayerState((prev) => ({
        ...prev,
        currentVideoId: cleanVideoId,
        currentIndex: index,
        isPlaying: false, // Will be set to true when state changes
      }));
      
      // Play after a short delay to ensure video is loaded
      setTimeout(() => {
        if (ytPlayerRef.current && playerReadyRef.current) {
          try {
            ytPlayerRef.current.playVideo();
          } catch (err) {
            console.error("[YouTube] Failed to start playback:", err);
          }
        }
      }, 300);
    } catch (error: any) {
      console.error("[YouTube] Failed to play video:", error);
      setPlayerState((prev) => ({
        ...prev,
        currentVideoId: null,
        isPlaying: false,
      }));
    }
  }, [createPlayer]);

  const togglePlayPause = useCallback(() => {
    if (!ytPlayerRef.current || !playerReadyRef.current || !window.YT) {
      console.warn("[YouTube] Player not ready");
      return;
    }

    try {
      const currentState = ytPlayerRef.current.getPlayerState();
      if (currentState === window.YT.PlayerState.PLAYING) {
        ytPlayerRef.current.pauseVideo();
      } else if (currentState === window.YT.PlayerState.PAUSED || currentState === window.YT.PlayerState.CUED) {
        ytPlayerRef.current.playVideo();
      } else {
        // If video is ended or not loaded, try to play current video
        const { currentVideoId } = playerState;
        if (currentVideoId) {
          ytPlayerRef.current.loadVideoById(currentVideoId);
        }
      }
    } catch (error: any) {
      console.error("[YouTube] Toggle play/pause failed:", error);
    }
  }, [playerState]);

  const next = useCallback(() => {
    const { playlist, currentIndex } = playerState;
    if (currentIndex < playlist.length - 1) {
      const nextVideo = playlist[currentIndex + 1];
      if (nextVideo) {
        playVideo(nextVideo.id, currentIndex + 1);
      }
    }
  }, [playerState, playVideo]);

  const previous = useCallback(() => {
    const { playlist, currentIndex } = playerState;
    if (currentIndex > 0) {
      const prevVideo = playlist[currentIndex - 1];
      if (prevVideo) {
        playVideo(prevVideo.id, currentIndex - 1);
      }
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
    // Allow multiple panels to be open simultaneously
    setPlayerState((prev) => ({ ...prev, isPanelOpen: true }));
    if (!apiReadyRef.current) {
      void initializeAPI();
    }
  }, [initializeAPI]);

  const closePanel = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPanelOpen: false }));
  }, []);

  // Resize player to match container dimensions
  const resizePlayer = useCallback(() => {
    if (!ytPlayerRef.current || !playerReadyRef.current) return;
    
    try {
      const container = document.getElementById("youtube-player-iframe");
      if (!container) return;
      
      const containerWidth = container.clientWidth || container.offsetWidth;
      const containerHeight = container.clientHeight || container.offsetHeight;
      
      if (containerWidth > 0 && containerHeight > 0) {
        // YouTube IFrame API doesn't have a direct resize method
        // The iframe will scale with CSS (width: 100%, height: 100%)
        // But we can ensure the container has the right aspect ratio
        // The CSS aspect-ratio property on .playerContainer handles this
        
        // Trigger a resize event which some players listen to
        window.dispatchEvent(new Event("resize"));
        
        // The iframe itself should scale via CSS, so no need to recreate the player
      }
    } catch (error) {
      console.warn("[YouTube] Failed to resize player:", error);
    }
  }, []);

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  // Listen for close events (but allow multiple panels to be open)
  useEffect(() => {
    const handleClose = () => {
      setPlayerState((prev) => ({ ...prev, isPanelOpen: false }));
    };

    window.addEventListener("omega:closeYouTube", handleClose);

    return () => {
      window.removeEventListener("omega:closeYouTube", handleClose);
    };
  }, []);

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
    resizePlayer,
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
