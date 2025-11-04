"use client";

/**
 * Spotify Provider
 *
 * Manages Spotify authentication, playback state, and API integration.
 * Implements OAuth 2.0 PKCE flow for secure authentication without client secret.
 * Integrates with Spotify Web Playback SDK for in-browser playback control.
 *
 * Features:
 * - OAuth PKCE authentication with popup flow
 * - Token management with automatic refresh
 * - Web Playback SDK integration
 * - Search tracks and playlists
 * - Playback controls (play, pause, skip, volume)
 * - Session persistence in localStorage
 *
 * Requirements:
 * - Spotify Premium account (required for Web Playback SDK)
 * - Valid Spotify OAuth client ID and redirect URI
 *
 * Usage:
 *   <SpotifyProvider>
 *     <YourApp />
 *   </SpotifyProvider>
 *
 *   const { authenticate, playTrack, togglePlayPause } = useSpotify();
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
import type {
  SpotifyAuthState,
  SpotifyPlayerState,
  SpotifyTrack,
  SpotifyPlaylist,
} from "@/types/media";
import type { SpotifyPlayer, SpotifyPlayerState as SDKPlayerState } from "@/types/spotify";

// ============================================================================
// Types
// ============================================================================

interface SpotifyContextValue {
  authState: SpotifyAuthState;
  playerState: SpotifyPlayerState;
  searchResults: SpotifyTrack[];
  playlists: SpotifyPlaylist[];
  error: string | null;
  clearError: () => void;
  authenticate: () => Promise<void>;
  logout: () => void;
  searchTracks: (query: string) => Promise<void>;
  getUserPlaylists: () => Promise<void>;
  playTrack: (uri: string) => Promise<void>;
  playPlaylist: (uri: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  transferPlayback: () => Promise<void>;
  openPanel: () => void;
  closePanel: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const SPOTIFY_STORAGE_KEYS = {
  AUTH_STATE: "spotify-auth-state",
  CODE_VERIFIER: "spotify-code-verifier",
};

// ============================================================================
// Context
// ============================================================================

const SpotifyContext = createContext<SpotifyContextValue | undefined>(
  undefined
);

// ============================================================================
// Provider Component
// ============================================================================

export function SpotifyProvider({ children }: { children: ReactNode }) {
  // Initialize state safely
  const [authState, setAuthState] = useState<SpotifyAuthState>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    deviceId: null,
  });

  const [playerState, setPlayerState] = useState<SpotifyPlayerState>({
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    volume: 100,
    isPanelOpen: false,
  });

  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [error, setError] = useState<string | null>(null);

  const playerRef = useRef<SpotifyPlayer | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const tokenRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const positionUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef<boolean>(false);
  const hasInitializedRef = useRef<boolean>(false);

  // ==========================================================================
  // PKCE Helper Functions
  // ==========================================================================

  const generateRandomString = (length: number): string => {
    if (typeof window === "undefined" || !window.crypto || !window.crypto.getRandomValues) {
      let result = "";
      const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < length; i++) {
        result += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return result;
    }

    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = window.crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  };

  const sha256 = async (plain: string): Promise<ArrayBuffer> => {
    if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
      throw new Error("Crypto API not available");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return await window.crypto.subtle.digest("SHA-256", data);
  };

  const base64encode = (input: ArrayBuffer): string => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const hashed = await sha256(verifier);
    return base64encode(hashed);
  };

  // ==========================================================================
  // Token Management
  // ==========================================================================

  const logout = useCallback(() => {
    if (tokenRefreshTimeoutRef.current) {
      clearTimeout(tokenRefreshTimeoutRef.current);
      tokenRefreshTimeoutRef.current = null;
    }

    if (positionUpdateIntervalRef.current) {
      clearInterval(positionUpdateIntervalRef.current);
      positionUpdateIntervalRef.current = null;
    }

    if (playerRef.current) {
      try {
        playerRef.current.disconnect();
      } catch (error) {
        console.warn("[Spotify] Error disconnecting player:", error);
      }
      playerRef.current = null;
    }

    isInitializingRef.current = false;
    hasInitializedRef.current = false;

    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      deviceId: null,
    });

    setPlayerState({
      isPlaying: false,
      currentTrack: null,
      position: 0,
      duration: 0,
      volume: 100,
      isPanelOpen: false,
    });

    setSearchResults([]);
    setPlaylists([]);
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(SPOTIFY_STORAGE_KEYS.AUTH_STATE);
    }
    deviceIdRef.current = null;
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = authState.refreshToken;
    if (!refreshToken) {
      console.error("[Spotify] No refresh token available");
      return false;
    }

    try {
      const response = await fetch(config.SPOTIFY_CONFIG.TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: config.SPOTIFY_CONFIG.CLIENT_ID,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) throw new Error("Token refresh failed");

      const tokens = await response.json();
      const expiresAt = Date.now() + tokens.expires_in * 1000;

      const newAuthState: SpotifyAuthState = {
        isAuthenticated: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || refreshToken,
        expiresAt,
        deviceId: authState.deviceId,
      };

      setAuthState(newAuthState);
      
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem(SPOTIFY_STORAGE_KEYS.AUTH_STATE, JSON.stringify(newAuthState));
        } catch (storageError) {
          console.warn("[Spotify] Failed to save state to localStorage:", storageError);
        }
      }

      // Schedule next refresh
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
      const refreshTime = (tokens.expires_in - 60) * 1000;
      if (refreshTime > 0) {
        tokenRefreshTimeoutRef.current = setTimeout(() => {
          void refreshAccessToken();
        }, refreshTime);
      }

      return true;
    } catch (error) {
      console.error("[Spotify] Token refresh failed:", error);
      logout();
      return false;
    }
  }, [authState.refreshToken, authState.deviceId, logout]);

  // ==========================================================================
  // Authentication
  // ==========================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const authenticate = useCallback(async () => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      setError("Authentication requires browser environment");
      return;
    }

    setError(null);

    if (!config.SPOTIFY_CONFIG.CLIENT_ID || config.SPOTIFY_CONFIG.CLIENT_ID.trim() === "") {
      setError("Spotify Client ID is not configured. Please set NEXT_PUBLIC_SPOTIFY_CLIENT_ID in your .env.local file.");
      return;
    }

    try {
      // Generate PKCE
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      localStorage.setItem(SPOTIFY_STORAGE_KEYS.CODE_VERIFIER, codeVerifier);

      // Build auth URL
      const params = new URLSearchParams({
        client_id: config.SPOTIFY_CONFIG.CLIENT_ID,
        response_type: "code",
        redirect_uri: config.SPOTIFY_CONFIG.REDIRECT_URI,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        scope: config.SPOTIFY_CONFIG.SCOPES.join(" "),
      });

      const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
      const popup = window.open(authUrl, "Spotify Authorization", "width=600,height=800");

      if (!popup) {
        setError("Failed to open authorization popup. Please allow popups for this site.");
        return;
      }

      // Listen for callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type !== "spotify-auth" || !event.data.code) return;
        if (event.origin !== window.location.origin) return;

        window.removeEventListener("message", handleMessage);
        popup.close();

        try {
          const codeVerifier = localStorage.getItem(SPOTIFY_STORAGE_KEYS.CODE_VERIFIER);
          if (!codeVerifier) throw new Error("Code verifier not found");

          const response = await fetch(config.SPOTIFY_CONFIG.TOKEN_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: config.SPOTIFY_CONFIG.CLIENT_ID,
              grant_type: "authorization_code",
              code: event.data.code,
              redirect_uri: config.SPOTIFY_CONFIG.REDIRECT_URI,
              code_verifier: codeVerifier,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error_description || errorData.error || "Token exchange failed");
          }

          const tokens = await response.json();
          const expiresAt = Date.now() + tokens.expires_in * 1000;

          const newAuthState: SpotifyAuthState = {
            isAuthenticated: true,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            deviceId: null,
          };

          setAuthState(newAuthState);
          localStorage.setItem(SPOTIFY_STORAGE_KEYS.AUTH_STATE, JSON.stringify(newAuthState));
          localStorage.removeItem(SPOTIFY_STORAGE_KEYS.CODE_VERIFIER);

          // Schedule token refresh
          const refreshTime = (tokens.expires_in - 60) * 1000;
          if (refreshTime > 0) {
            if (tokenRefreshTimeoutRef.current) {
              clearTimeout(tokenRefreshTimeoutRef.current);
            }
            tokenRefreshTimeoutRef.current = setTimeout(() => {
              void refreshAccessToken();
            }, refreshTime);
          }

          // Initialize player only if not already initialized
          if (!hasInitializedRef.current && !isInitializingRef.current) {
            await initializePlayer(tokens.access_token);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Token exchange failed";
          setError(errorMsg);
          console.error("[Spotify] Authentication failed:", error);
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Authentication failed";
      setError(errorMsg);
      console.error("[Spotify] Authentication failed:", error);
    }
  }, []);


  // ==========================================================================
  // SDK Loading
  // ==========================================================================

  const waitForSDK = useCallback((): Promise<void> => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return Promise.reject(new Error("SDK can only be loaded in browser"));
    }

    return new Promise((resolve) => {
      if (window.Spotify && window.Spotify.Player) {
        resolve();
        return;
      }

      if (!document.getElementById("spotify-web-playback-sdk")) {
        const script = document.createElement("script");
        script.id = "spotify-web-playback-sdk";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.head.appendChild(script);
      }

      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log("[Spotify] Web Playback SDK ready");
        resolve();
      };
    });
  }, []);

  // ==========================================================================
  // Transfer Playback (must be defined before initializePlayer)
  // ==========================================================================

  const transferPlayback = useCallback(async (): Promise<void> => {
    if (!authState.accessToken || !deviceIdRef.current) {
      return;
    }

    try {
      const response = await fetch(`${config.SPOTIFY_CONFIG.API_BASE_URL}/me/player`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authState.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device_ids: [deviceIdRef.current] }),
      });

      if (!response.ok && response.status !== 204) {
        console.warn("[Spotify] Transfer playback failed:", response.status);
      }
    } catch (error) {
      console.warn("[Spotify] Transfer playback error:", error);
    }
  }, [authState.accessToken]);

  // ==========================================================================
  // Player Initialization
  // ==========================================================================

  const initializePlayer = useCallback(async (token: string): Promise<void> => {
    // Prevent multiple simultaneous initializations
    if (isInitializingRef.current) {
      console.log("[Spotify] Player initialization already in progress, skipping");
      return;
    }

    // If player already exists and is connected, skip re-initialization
    if (playerRef.current && deviceIdRef.current) {
      console.log("[Spotify] Player already initialized, skipping");
      return;
    }

    isInitializingRef.current = true;

    try {
      await waitForSDK();

      if (!window.Spotify || !window.Spotify.Player) {
        throw new Error("Spotify Web Playback SDK not available");
      }

      // Disconnect existing player
      if (playerRef.current) {
        try {
          playerRef.current.disconnect();
        } catch (error) {
          console.warn("[Spotify] Error disconnecting existing player:", error);
        }
        playerRef.current = null;
      }

      const player = new window.Spotify.Player({
        name: "Omega Terminal",
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      // Add event listeners
      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("[Spotify] Player ready with device ID:", device_id);
        deviceIdRef.current = device_id;
        setAuthState((prev) => ({ ...prev, deviceId: device_id }));

        // Transfer playback to this device
        transferPlayback();
      });

      player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
        console.log("[Spotify] Player not ready:", device_id);
      });

      player.addListener("player_state_changed", (state: SDKPlayerState | null) => {
        if (!state) {
          setPlayerState((prev) => ({
            ...prev,
            isPlaying: false,
            currentTrack: null,
            position: 0,
            duration: 0,
          }));
          return;
        }

        const track = state.track_window.current_track;
        const spotifyTrack: SpotifyTrack | null = track
          ? {
              id: track.id,
              name: track.name,
              artists: track.artists.map((a) => ({ name: a.name })),
              album: {
                name: track.album.name,
                images: track.album.images,
              },
              duration_ms: track.duration_ms,
              uri: track.uri,
            }
          : null;

        setPlayerState((prev) => ({
          ...prev,
          isPlaying: !state.paused,
          currentTrack: spotifyTrack,
          position: state.position,
          duration: state.duration,
        }));
      });

      player.addListener("authentication_error", ({ message }: { message: string }) => {
        console.error("[Spotify] Authentication error:", message);
        setError(`Authentication error: ${message}`);
      });

      player.addListener("account_error", ({ message }: { message: string }) => {
        console.error("[Spotify] Account error:", message);
        setError(`Account error: ${message}. Spotify Premium required.`);
      });

      player.addListener("playback_error", ({ message }: { message: string }) => {
        console.error("[Spotify] Playback error:", message);
        setError(`Playback error: ${message}`);
      });

      // Connect player
      const connected = await player.connect();
      if (connected) {
        playerRef.current = player;
        hasInitializedRef.current = true;
        console.log("[Spotify] Player connected successfully");
      } else {
        throw new Error("Failed to connect player");
      }

      // Start position update interval
      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
      }
      positionUpdateIntervalRef.current = setInterval(async () => {
        if (playerRef.current) {
          try {
            const state = await playerRef.current.getCurrentState();
            if (state && !state.paused) {
              setPlayerState((prev) => ({
                ...prev,
                position: state.position,
                isPlaying: true,
              }));
            }
          } catch (error) {
            // Ignore errors
          }
        }
      }, 1000);
    } catch (error) {
      console.error("[Spotify] Failed to initialize player:", error);
      setError(error instanceof Error ? error.message : "Failed to initialize player");
      playerRef.current = null;
      deviceIdRef.current = null;
    } finally {
      isInitializingRef.current = false;
    }
  }, [waitForSDK, transferPlayback]);

  // ==========================================================================
  // API Functions
  // ==========================================================================

  const searchTracks = useCallback(
    async (query: string): Promise<void> => {
      if (!authState.accessToken) {
        setError("Not authenticated. Please connect to Spotify first.");
        return;
      }

      try {
        const response = await fetch(
          `${config.SPOTIFY_CONFIG.API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${authState.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired, try to refresh
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              return searchTracks(query);
            }
          }
          throw new Error("Search failed");
        }

        const data = await response.json();
        const tracks: SpotifyTrack[] = data.tracks.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          artists: item.artists.map((a: any) => ({ name: a.name })),
          album: {
            name: item.album.name,
            images: item.album.images,
          },
          duration_ms: item.duration_ms,
          uri: item.uri,
        }));

        setSearchResults(tracks);
      } catch (error) {
        console.error("[Spotify] Search failed:", error);
        setError(error instanceof Error ? error.message : "Search failed");
      }
    },
    [authState.accessToken, refreshAccessToken]
  );

  const getUserPlaylists = useCallback(async (): Promise<void> => {
    if (!authState.accessToken) {
      setError("Not authenticated. Please connect to Spotify first.");
      return;
    }

    try {
      const response = await fetch(`${config.SPOTIFY_CONFIG.API_BASE_URL}/me/playlists?limit=50`, {
        headers: {
          Authorization: `Bearer ${authState.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            return getUserPlaylists();
          }
        }
        throw new Error("Failed to fetch playlists");
      }

      const data = await response.json();
      const playlistsData: SpotifyPlaylist[] = data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        images: item.images,
        tracks: {
          total: item.tracks.total,
        },
        uri: item.uri,
      }));

      setPlaylists(playlistsData);
    } catch (error) {
      console.error("[Spotify] Failed to fetch playlists:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch playlists");
    }
  }, [authState.accessToken, refreshAccessToken]);

  // ==========================================================================
  // Playback Controls
  // ==========================================================================

  const playTrack = useCallback(
    async (uri: string): Promise<void> => {
      if (!authState.accessToken || !deviceIdRef.current) {
        setError("Player not ready. Please wait for device to connect.");
        return;
      }

      try {
        const response = await fetch(
          `${config.SPOTIFY_CONFIG.API_BASE_URL}/me/player/play?device_id=${deviceIdRef.current}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authState.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [uri] }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              return playTrack(uri);
            }
          }
          throw new Error("Failed to play track");
        }
      } catch (error) {
        console.error("[Spotify] Failed to play track:", error);
        setError(error instanceof Error ? error.message : "Failed to play track");
      }
    },
    [authState.accessToken, refreshAccessToken]
  );

  const playPlaylist = useCallback(
    async (uri: string): Promise<void> => {
      if (!authState.accessToken || !deviceIdRef.current) {
        setError("Player not ready. Please wait for device to connect.");
        return;
      }

      try {
        const response = await fetch(
          `${config.SPOTIFY_CONFIG.API_BASE_URL}/me/player/play?device_id=${deviceIdRef.current}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authState.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ context_uri: uri }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              return playPlaylist(uri);
            }
          }
          throw new Error("Failed to play playlist");
        }
      } catch (error) {
        console.error("[Spotify] Failed to play playlist:", error);
        setError(error instanceof Error ? error.message : "Failed to play playlist");
      }
    },
    [authState.accessToken, refreshAccessToken]
  );

  const togglePlayPause = useCallback(async (): Promise<void> => {
    if (!playerRef.current) {
      setError("Player not initialized");
      return;
    }

    try {
      await playerRef.current.togglePlay();
    } catch (error) {
      console.error("[Spotify] Toggle play/pause failed:", error);
      setError(error instanceof Error ? error.message : "Failed to toggle playback");
    }
  }, []);

  const skipNext = useCallback(async (): Promise<void> => {
    if (!playerRef.current) {
      setError("Player not initialized");
      return;
    }

    try {
      await playerRef.current.nextTrack();
    } catch (error) {
      console.error("[Spotify] Skip next failed:", error);
      setError(error instanceof Error ? error.message : "Failed to skip next");
    }
  }, []);

  const skipPrevious = useCallback(async (): Promise<void> => {
    if (!playerRef.current) {
      setError("Player not initialized");
      return;
    }

    try {
      await playerRef.current.previousTrack();
    } catch (error) {
      console.error("[Spotify] Skip previous failed:", error);
      setError(error instanceof Error ? error.message : "Failed to skip previous");
    }
  }, []);

  const setVolume = useCallback(
    async (volume: number): Promise<void> => {
      if (!playerRef.current) {
        setError("Player not initialized");
        return;
      }

      try {
        const volumeDecimal = Math.max(0, Math.min(1, volume / 100));
        await playerRef.current.setVolume(volumeDecimal);
        setPlayerState((prev) => ({ ...prev, volume }));
      } catch (error) {
        console.error("[Spotify] Set volume failed:", error);
        setError(error instanceof Error ? error.message : "Failed to set volume");
      }
    },
    []
  );

  // ==========================================================================
  // Panel Controls
  // ==========================================================================

  const openPanel = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPanelOpen: true }));
  }, []);

  const closePanel = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPanelOpen: false }));
  }, []);

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  useEffect(() => {
    // Only run once on mount - restore session from localStorage
    if (hasInitializedRef.current) {
      return;
    }

    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem(SPOTIFY_STORAGE_KEYS.AUTH_STATE);
        if (saved) {
          const savedAuthState: SpotifyAuthState = JSON.parse(saved);
          if (savedAuthState.accessToken && savedAuthState.expiresAt && savedAuthState.expiresAt > Date.now()) {
            setAuthState(savedAuthState);
            if (savedAuthState.accessToken && !hasInitializedRef.current) {
              hasInitializedRef.current = true;
              void initializePlayer(savedAuthState.accessToken);
            }
          } else if (savedAuthState.refreshToken) {
            // Token expired, try to refresh
            setAuthState(savedAuthState);
            void refreshAccessToken();
          }
        }
      } catch (error) {
        console.error("[Spotify] Failed to restore session:", error);
      }
    }

    return () => {
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.disconnect();
        } catch (error) {
          console.warn("[Spotify] Error disconnecting player:", error);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const value: SpotifyContextValue = {
    authState,
    playerState,
    searchResults,
    playlists,
    error,
    clearError,
    authenticate,
    logout,
    searchTracks,
    getUserPlaylists,
    playTrack,
    playPlaylist,
    togglePlayPause,
    skipNext,
    skipPrevious,
    setVolume,
    transferPlayback,
    openPanel,
    closePanel,
  };

  return (
    <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error("useSpotify must be used within a SpotifyProvider");
  }
  return context;
}

