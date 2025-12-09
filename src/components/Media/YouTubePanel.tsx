"use client";

/**
 * YouTube Panel Component
 *
 * Renders the YouTube video player interface with search, video playback,
 * and playlist controls. Integrates with YouTubeProvider for state management.
 */

import React, { useState, useEffect, useRef } from "react";
import { useYouTube } from "@/hooks/useYouTube";
import styles from "./YouTubePanel.module.css";

interface YouTubePanelProps {
  mobile?: boolean;
}

export function YouTubePanel({ mobile = false }: YouTubePanelProps) {
  const {
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
    closePanel,
  } = useYouTube();

  const [searchQuery, setSearchQuery] = useState("");
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const containerSizeRef = useRef({ width: 0, height: 0 });

  // Load minimized state from localStorage on mount (mobile only)
  useEffect(() => {
    if (mobile && typeof window !== "undefined") {
      const saved = localStorage.getItem("youtube-minimized");
      if (saved === "true") {
        setIsMinimized(true);
      }
    }
  }, [mobile]);

  // Save minimized state to localStorage
  useEffect(() => {
    if (mobile && typeof window !== "undefined") {
      localStorage.setItem("youtube-minimized", isMinimized.toString());
    }
  }, [isMinimized, mobile]);

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  useEffect(() => {
    if (playerState.isPanelOpen && !playerReady) {
      initializeAPI().then(() => {
        // Wait a bit for API to be fully ready
        setTimeout(() => {
          if (playerContainerRef.current && typeof window !== "undefined" && window.YT && window.YT.Player) {
            try {
              // Ensure container is empty before creating player
              const container = document.getElementById("youtube-player-iframe");
              if (container) {
                container.innerHTML = "";
              }
              
              createPlayer("youtube-player-iframe");
              // Wait for player to be created before marking as ready
              setTimeout(() => {
                setPlayerReady(true);
                // Load default channel videos
                getDefaultChannelVideos();
              }, 1500);
            } catch (error) {
              console.error("[YouTube] Failed to create player:", error);
            }
          } else {
            console.warn("[YouTube] API or container not ready");
          }
        }, 500);
      }).catch((error) => {
        console.error("[YouTube] Failed to initialize API:", error);
      });
    }
    
    // Reset player ready when panel closes
    if (!playerState.isPanelOpen) {
      setPlayerReady(false);
    }
  }, [
    playerState.isPanelOpen,
    playerReady,
    initializeAPI,
    createPlayer,
    getDefaultChannelVideos,
  ]);

  // Resize YouTube player when container size changes (for draggable window)
  useEffect(() => {
    if (!playerContainerRef.current || !playerReady) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const currentSize = containerSizeRef.current;
        
        // Only resize if size actually changed significantly (avoid unnecessary resizes)
        if (Math.abs(width - currentSize.width) > 5 || Math.abs(height - currentSize.height) > 5) {
          containerSizeRef.current = { width, height };
          
          // Call resize method to update player size
          resizePlayer();
        }
      }
    });

    resizeObserver.observe(playerContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [playerReady, resizePlayer]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchVideos(searchQuery);
    }
  };

  const handlePlayVideo = (videoId: string, index: number) => {
    playVideo(videoId, index);
  };

  // Panel is now conditionally rendered from DashboardStatsPanel
  // Remove early return check since parent handles visibility
  // if (!playerState.isPanelOpen) {
  //   return null;
  // }

  // If minimized on mobile, render minimized view
  if (mobile && isMinimized) {
    return (
      <div className={styles.minimizedContainer}>
        <button
          className={styles.minimizedButton}
          onClick={handleMaximize}
          aria-label="Restore YouTube panel"
          type="button"
        >
          <svg
            className={styles.minimizedIcon}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" />
          </svg>
          {playerState.currentVideoId && playerState.playlist.length > 0 && (
            <span className={styles.minimizedTrack}>
              {playerState.playlist[playerState.currentIndex]?.title || "YouTube"}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.panel} ${mobile ? styles.mobile : ""} ${isMinimized ? styles.minimized : ""}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <svg
            className={styles.logo}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" />
          </svg>
          <h2 className={styles.title}>YOUTUBE</h2>
        </div>
        <div className={styles.headerRight}>
          {mobile && (
            <button
              className={styles.minimizeButton}
              onClick={handleMinimize}
              aria-label="Minimize YouTube panel"
              type="button"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.minimizeIcon}
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
          <button
            className={styles.closeButton}
            onClick={closePanel}
            aria-label="Close YouTube panel"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.closeIcon}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Video Player */}
        <div className={styles.playerContainer}>
          <div
            id="youtube-player-iframe"
            ref={playerContainerRef}
            className={styles.playerIframe}
          />
          {!playerReady && (
            <div className={styles.playerPlaceholder}>
              <div className={styles.loadingSpinner}>Loading player...</div>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        {playerState.currentVideoId && (
          <div className={styles.controls}>
            <button
              className={styles.controlButton}
              onClick={previous}
              disabled={playerState.currentIndex === 0}
              aria-label="Previous video"
            >
              ⏮️
            </button>
            <button
              className={`${styles.controlButton} ${styles.playPauseButton}`}
              onClick={togglePlayPause}
              aria-label={playerState.isPlaying ? "Pause" : "Play"}
            >
              {playerState.isPlaying ? "⏸️" : "▶️"}
            </button>
            <button
              className={styles.controlButton}
              onClick={next}
              disabled={
                playerState.currentIndex >= playerState.playlist.length - 1
              }
              aria-label="Next video"
            >
              ⏭️
            </button>
            <button
              className={styles.controlButton}
              onClick={toggleMute}
              aria-label="Toggle mute"
            >
              🔊
            </button>
          </div>
        )}

        {/* Now Playing Info */}
        {playerState.currentVideoId && playerState.playlist.length > 0 && (
          <div className={styles.nowPlaying}>
            <div className={styles.nowPlayingTitle}>
              Now Playing:{" "}
              {playerState.playlist[playerState.currentIndex]?.title}
            </div>
            <div className={styles.nowPlayingChannel}>
              {playerState.playlist[playerState.currentIndex]?.channel}
            </div>
          </div>
        )}

        {/* Search */}
        <div className={styles.searchContainer}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search YouTube videos..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton} aria-label="Search">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.searchIcon}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>
        </div>

        {/* Video Results */}
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <h3>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : "Bloomberg Technology"}
            </h3>
            <span className={styles.resultsCount}>
              {searchResults.length} videos
            </span>
          </div>

          <div className={styles.videoList}>
            {searchResults
              .filter((video) => {
                const videoId = video?.id?.videoId;
                return videoId && typeof videoId === "string" && videoId.trim() !== "" && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
              })
              .map((video, index) => {
                const videoId = video.id.videoId;
                return (
                  <div
                    key={videoId}
                    className={`${styles.videoItem} ${
                      playerState.currentVideoId === videoId
                        ? styles.videoItemActive
                        : ""
                    }`}
                    onClick={() => handlePlayVideo(videoId, index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handlePlayVideo(videoId, index);
                      }
                    }}
                    title={`Play ${video.snippet.title}`}
                  >
                <div className={styles.videoThumbnail}>
                  {video.snippet.thumbnails.medium?.url ? (
                    <img
                      src={video.snippet.thumbnails.medium.url}
                      alt={video.snippet.title}
                    />
                  ) : (
                    <div className={styles.videoPlaceholder}>🎥</div>
                  )}
                  {playerState.currentVideoId === videoId && (
                    <div className={styles.playingIndicator}>
                      {playerState.isPlaying ? "▶️" : "⏸️"}
                    </div>
                  )}
                </div>
                <div className={styles.videoInfo}>
                  <div className={styles.videoTitle}>{video.snippet.title}</div>
                  <div className={styles.videoChannel}>
                    {video.snippet.channelTitle}
                  </div>
                  <div className={styles.videoDate}>
                    {video.snippet.publishedAt
                      ? new Date(video.snippet.publishedAt).toLocaleDateString()
                      : ""}
                  </div>
                </div>
              </div>
                );
              })}
          </div>

          {searchResults.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎬</div>
              <p>Search for videos to start watching</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
