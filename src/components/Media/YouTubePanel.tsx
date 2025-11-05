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
          <span className={styles.minimizedIcon}>🎥</span>
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
          <span className={styles.logo}>🎥</span>
          <h2 className={styles.title}>YouTube</h2>
        </div>
        <div className={styles.headerRight}>
          {mobile && (
            <button
              className={styles.minimizeButton}
              onClick={handleMinimize}
              aria-label="Minimize YouTube panel"
              type="button"
            >
              _
            </button>
          )}
          <button
            className={styles.closeButton}
            onClick={closePanel}
            aria-label="Close YouTube panel"
            type="button"
          >
            ✕
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
            <button type="submit" className={styles.searchButton}>
              🔍
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
