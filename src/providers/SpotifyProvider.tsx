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

// ============================================================================
// Types
// ============================================================================

interface SpotifyContextValue {
  authState: SpotifyAuthState;
  playerState: SpotifyPlayerState;
  searchResults: SpotifyTrack[];
  playlists: SpotifyPlaylist[];
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
  AUTH_NONCE: "spotify-auth-nonce",
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

  const spotifyPlayerRef = useRef<any>(null);
  const deviceIdRef = useRef<string | null>(null);
  const sdkReadyPromiseRef = useRef<Promise<void> | null>(null);
  const tokenRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================================================
  // PKCE Helper Functions
  // ==========================================================================

  const generateRandomString = (length: number): string => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  };

  const sha256 = async (plain: string): Promise<ArrayBuffer> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return await crypto.subtle.digest("SHA-256", data);
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
  // Token Refresh
  // ==========================================================================

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = authState.refreshToken;

    if (!refreshToken) {
      console.error("[Spotify] No refresh token available");
      return false;
    }

    try {
      const tokenResponse = await fetch(config.SPOTIFY_CONFIG.TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: config.SPOTIFY_CONFIG.CLIENT_ID,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Token refresh failed");
      }

      const tokens = await tokenResponse.json();

      // Calculate expiry time
      const expiresAt = Date.now() + tokens.expires_in * 1000;

      // Update auth state with new token
      const newAuthState: SpotifyAuthState = {
        isAuthenticated: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || refreshToken, // Keep old refresh token if not provided
        expiresAt,
        deviceId: authState.deviceId,
      };

      setAuthState(newAuthState);
      localStorage.setItem(
        SPOTIFY_STORAGE_KEYS.AUTH_STATE,
        JSON.stringify(newAuthState)
      );

      // Reconnect player with new token
      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.disconnect();
        await initializePlayer(tokens.access_token);
      }

      // Schedule next refresh (60 seconds before expiry)
      scheduleTokenRefresh(tokens.expires_in);

      console.log("[Spotify] Token refreshed successfully");
      return true;
    } catch (error) {
      console.error("[Spotify] Token refresh failed:", error);
      // If refresh fails, log out user
      logout();
      return false;
    }
  }, [authState.refreshToken, authState.deviceId]);

  const scheduleTokenRefresh = useCallback(
    (expiresIn: number) => {
      // Clear existing timeout
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }

      // Schedule refresh 60 seconds before expiry
      const refreshTime = (expiresIn - 60) * 1000;
      if (refreshTime > 0) {
        tokenRefreshTimeoutRef.current = setTimeout(() => {
          refreshAccessToken();
        }, refreshTime);
      }
    },
    [refreshAccessToken]
  );

  // ==========================================================================
  // Authentication
  // ==========================================================================

  /**
   * Authenticate with Spotify using OAuth 2.0 PKCE flow with enhanced security
   * 
   * Security Measures:
   * 1. PKCE (Proof Key for Code Exchange) - Prevents authorization code interception
   * 2. State Parameter with Nonce - Prevents CSRF attacks and ensures request/response correlation
   * 3. Origin Validation - Ensures postMessage comes from our own origin
   * 4. Source Validation - Ensures postMessage comes from our authorization popup
   * 5. Timeout Protection - Cleans up resources if authorization doesn't complete
   * 
   * Flow:
   * 1. Generate PKCE code verifier and challenge
   * 2. Generate cryptographic nonce and create state parameter
   * 3. Open Spotify authorization popup with state parameter
   * 4. Spotify redirects to callback.html with code and state
   * 5. Callback.html posts message back to this window
   * 6. Validate origin, source, and state before processing
   * 7. Exchange authorization code for access token
   * 
   * Failure Paths:
   * - Invalid origin: Message is rejected (prevents origin spoofing)
   * - Invalid source: Message is rejected (prevents window hijacking)
   * - Invalid nonce: Message is rejected (prevents CSRF)
   * - Timeout: Popup closed and listener removed (prevents resource leaks)
   */
  const authenticate = useCallback(async () => {
    try {
      // Generate PKCE code verifier and challenge
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Store code verifier for token exchange
      localStorage.setItem(SPOTIFY_STORAGE_KEYS.CODE_VERIFIER, codeVerifier);

      // Generate cryptographically strong nonce for origin validation
      const nonce = generateRandomString(32);
      const expectedOrigin = window.location.origin;

      // Create state parameter with nonce and origin for security validation
      const state = JSON.stringify({
        nonce,
        origin: expectedOrigin,
      });

      // Store nonce temporarily for validation when callback returns
      sessionStorage.setItem(SPOTIFY_STORAGE_KEYS.AUTH_NONCE, nonce);

      // Build authorization URL with state parameter
      const params = new URLSearchParams({
        client_id: config.SPOTIFY_CONFIG.CLIENT_ID,
        response_type: "code",
        redirect_uri: config.SPOTIFY_CONFIG.REDIRECT_URI,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        state: state,
        scope: config.SPOTIFY_CONFIG.SCOPES.join(" "),
      });

      const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

      // Open popup for authorization
      const popup = window.open(
        authUrl,
        "Spotify Authorization",
        "width=600,height=800"
      );

      if (!popup) {
        throw new Error("Failed to open authorization popup. Please allow popups for this site.");
      }

      // Set up defensive timeout (3 minutes) to clean up if no valid message arrives
      const authTimeout = setTimeout(() => {
        console.warn("[Spotify] Authentication timeout - closing popup and cleaning up");
        window.removeEventListener("message", handleMessage);
        sessionStorage.removeItem(SPOTIFY_STORAGE_KEYS.AUTH_NONCE);
        if (popup && !popup.closed) {
          popup.close();
        }
      }, 3 * 60 * 1000); // 3 minutes

      // Listen for callback message with comprehensive security validations
      const handleMessage = async (event: MessageEvent) => {
        // Security Check 1: Validate message type and required data
        if (event.data.type !== "spotify-auth" || !event.data.code) {
          return; // Ignore unrelated messages
        }

        // Security Check 2: Validate message origin matches our window origin
        // This prevents malicious sites from sending fake authorization codes
        if (event.origin !== window.location.origin) {
          console.error("[Spotify] Message rejected: Invalid origin", {
            expected: window.location.origin,
            received: event.origin,
          });
          return;
        }

        // Security Check 3: Validate message source is the popup we opened
        // This ensures the message came from our authorization popup, not another window
        if (event.source !== popup) {
          console.error("[Spotify] Message rejected: Invalid source window");
          return;
        }

        // Security Check 4: Validate state parameter to prevent CSRF attacks
        // The state must contain our nonce and origin
        try {
          const storedNonce = sessionStorage.getItem(SPOTIFY_STORAGE_KEYS.AUTH_NONCE);
          
          if (!storedNonce) {
            console.error("[Spotify] Message rejected: No stored nonce found");
            return;
          }

          if (!event.data.state) {
            console.error("[Spotify] Message rejected: No state parameter in response");
            return;
          }

          const state = JSON.parse(event.data.state);
          
          if (state.nonce !== storedNonce) {
            console.error("[Spotify] Message rejected: Nonce mismatch");
            return;
          }

          if (state.origin !== window.location.origin) {
            console.error("[Spotify] Message rejected: Origin mismatch in state");
            return;
          }
        } catch (error) {
          console.error("[Spotify] Message rejected: Invalid state parameter", error);
          return;
        }

        // All security checks passed - clean up and proceed with token exchange
        clearTimeout(authTimeout);
        window.removeEventListener("message", handleMessage);
        sessionStorage.removeItem(SPOTIFY_STORAGE_KEYS.AUTH_NONCE);

        try {
          // Exchange code for tokens
          const storedVerifier = localStorage.getItem(
            SPOTIFY_STORAGE_KEYS.CODE_VERIFIER
          );

          if (!storedVerifier) {
            throw new Error("Code verifier not found");
          }

          const tokenResponse = await fetch(
            config.SPOTIFY_CONFIG.TOKEN_ENDPOINT,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                client_id: config.SPOTIFY_CONFIG.CLIENT_ID,
                grant_type: "authorization_code",
                code: event.data.code,
                redirect_uri: config.SPOTIFY_CONFIG.REDIRECT_URI,
                code_verifier: storedVerifier,
              }),
            }
          );

          if (!tokenResponse.ok) {
            throw new Error("Token exchange failed");
          }

          const tokens = await tokenResponse.json();

          // Calculate expiry time
          const expiresAt = Date.now() + tokens.expires_in * 1000;

          // Update auth state
          const newAuthState: SpotifyAuthState = {
            isAuthenticated: true,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            deviceId: null,
          };

          setAuthState(newAuthState);
          localStorage.setItem(
            SPOTIFY_STORAGE_KEYS.AUTH_STATE,
            JSON.stringify(newAuthState)
          );
          localStorage.removeItem(SPOTIFY_STORAGE_KEYS.CODE_VERIFIER);

          // Schedule token refresh
          scheduleTokenRefresh(tokens.expires_in);

          // Initialize player
          await initializePlayer(tokens.access_token);
        } catch (error) {
          console.error("[Spotify] Token exchange failed:", error);
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (error) {
      console.error("[Spotify] Authentication failed:", error);
    }
  }, [scheduleTokenRefresh]);

  const logout = useCallback(() => {
    // Clear token refresh timeout
    if (tokenRefreshTimeoutRef.current) {
      clearTimeout(tokenRefreshTimeoutRef.current);
      tokenRefreshTimeoutRef.current = null;
    }

    // Disconnect player
    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.disconnect();
      spotifyPlayerRef.current = null;
    }

    // Clear state
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

    // Clear localStorage
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.AUTH_STATE);
    deviceIdRef.current = null;
  }, []);

  // ==========================================================================
  // SDK Readiness
  // ==========================================================================

  const waitForSDK = useCallback((): Promise<void> => {
    if (sdkReadyPromiseRef.current) {
      return sdkReadyPromiseRef.current;
    }

    sdkReadyPromiseRef.current = new Promise((resolve) => {
      if (window.Spotify && window.Spotify.Player) {
        resolve();
        return;
      }

      // Set up callback for when SDK loads
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log("[Spotify] Web Playback SDK ready");
        resolve();
      };

      // Load SDK script if not already present
      if (!document.getElementById("spotify-player-sdk")) {
        const script = document.createElement("script");
        script.id = "spotify-player-sdk";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.head.appendChild(script);
      }
    });

    return sdkReadyPromiseRef.current;
  }, []);

  // ==========================================================================
  // Player Initialization
  // ==========================================================================

  const initializePlayer = useCallback(
    async (token: string) => {
      try {
        // Wait for SDK to be ready
        await waitForSDK();

        const player = new window.Spotify.Player({
          name: "Omega Terminal",
          getOAuthToken: (cb: (token: string) => void) => {
            cb(token);
          },
          volume: 1.0,
        });

        // Error handling
        player.addListener("initialization_error", ({ message }: any) => {
          console.error("[Spotify] Initialization error:", message);
        });

        player.addListener("authentication_error", ({ message }: any) => {
          console.error("[Spotify] Authentication error:", message);
          logout();
        });

        player.addListener("account_error", ({ message }: any) => {
          console.error("[Spotify] Account error:", message);
        });

        player.addListener("playback_error", ({ message }: any) => {
          console.error("[Spotify] Playback error:", message);
        });

        // Ready - transfer playback to this device
        player.addListener("ready", async ({ device_id }: any) => {
          console.log("[Spotify] Player ready with device ID:", device_id);
          deviceIdRef.current = device_id;
          setAuthState((prev) => ({ ...prev, deviceId: device_id }));

          // Transfer playback to this device
          await transferPlayback();
        });

        // Not ready
        player.addListener("not_ready", ({ device_id }: any) => {
          console.log("[Spotify] Device has gone offline:", device_id);
        });

        // Player state changed
        player.addListener("player_state_changed", (state: any) => {
          if (!state) return;

          setPlayerState((prev) => ({
            ...prev,
            isPlaying: !state.paused,
            currentTrack: state.track_window?.current_track || null,
            position: state.position,
            duration: state.duration,
          }));
        });

        // Connect player
        const connected = await player.connect();
        if (connected) {
          console.log("[Spotify] Player connected successfully");
          spotifyPlayerRef.current = player;
        }
      } catch (error) {
        console.error("[Spotify] Player initialization failed:", error);
      }
    },
    [logout, waitForSDK]
  );

  // ==========================================================================
  // Playback Controls
  // ==========================================================================

  const transferPlayback = useCallback(async () => {
    if (!authState.accessToken || !deviceIdRef.current) return;

    try {
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authState.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceIdRef.current],
          play: false,
        }),
      });
    } catch (error) {
      console.error("[Spotify] Transfer playback failed:", error);
    }
  }, [authState.accessToken]);

  const togglePlayPause = useCallback(async () => {
    if (spotifyPlayerRef.current) {
      await spotifyPlayerRef.current.togglePlay();
    }
  }, []);

  const skipNext = useCallback(async () => {
    if (spotifyPlayerRef.current) {
      await spotifyPlayerRef.current.nextTrack();
    }
  }, []);

  const skipPrevious = useCallback(async () => {
    if (spotifyPlayerRef.current) {
      await spotifyPlayerRef.current.previousTrack();
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    if (spotifyPlayerRef.current) {
      await spotifyPlayerRef.current.setVolume(volume / 100);
      setPlayerState((prev) => ({ ...prev, volume }));
    }
  }, []);

  // ==========================================================================
  // API Methods
  // ==========================================================================

  const searchTracks = useCallback(
    async (query: string) => {
      if (!authState.accessToken) return;

      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            query
          )}&type=track&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${authState.accessToken}`,
            },
          }
        );

        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();
        setSearchResults(data.tracks?.items || []);
      } catch (error) {
        console.error("[Spotify] Search failed:", error);
      }
    },
    [authState.accessToken]
  );

  const getUserPlaylists = useCallback(async () => {
    if (!authState.accessToken) return;

    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/playlists?limit=20",
        {
          headers: {
            Authorization: `Bearer ${authState.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch playlists");

      const data = await response.json();
      setPlaylists(data.items || []);
    } catch (error) {
      console.error("[Spotify] Failed to fetch playlists:", error);
    }
  }, [authState.accessToken]);

  const playTrack = useCallback(
    async (uri: string) => {
      if (!authState.accessToken || !deviceIdRef.current) return;

      try {
        await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authState.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uris: [uri],
            }),
          }
        );
      } catch (error) {
        console.error("[Spotify] Play track failed:", error);
      }
    },
    [authState.accessToken]
  );

  const playPlaylist = useCallback(
    async (uri: string) => {
      if (!authState.accessToken || !deviceIdRef.current) return;

      try {
        await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authState.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              context_uri: uri,
            }),
          }
        );
      } catch (error) {
        console.error("[Spotify] Play playlist failed:", error);
      }
    },
    [authState.accessToken]
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
    // Restore session from localStorage
    const savedState = localStorage.getItem(SPOTIFY_STORAGE_KEYS.AUTH_STATE);
    if (savedState) {
      try {
        const parsed: SpotifyAuthState = JSON.parse(savedState);

        // Check if token is still valid
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          setAuthState(parsed);

          // Calculate time until expiry and schedule refresh if needed
          const timeUntilExpiry = Math.floor(
            (parsed.expiresAt - Date.now()) / 1000
          );
          if (timeUntilExpiry > 60 && parsed.refreshToken) {
            scheduleTokenRefresh(timeUntilExpiry);
          }

          // Initialize player if token is valid
          if (parsed.accessToken) {
            initializePlayer(parsed.accessToken);
          }
        } else if (parsed.refreshToken) {
          // Token expired but we have refresh token - try to refresh
          setAuthState(parsed);
          refreshAccessToken();
        } else {
          // Token expired, clear storage
          localStorage.removeItem(SPOTIFY_STORAGE_KEYS.AUTH_STATE);
        }
      } catch (error) {
        console.error("[Spotify] Failed to restore session:", error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
    };
  }, [initializePlayer, scheduleTokenRefresh, refreshAccessToken]);

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const value: SpotifyContextValue = {
    authState,
    playerState,
    searchResults,
    playlists,
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
    throw new Error("useSpotify must be used within SpotifyProvider");
  }
  return context;
}
