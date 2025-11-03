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

export function YouTubePanel() {
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

  useEffect(() => {
    if (playerState.isPanelOpen && !playerReady) {
      initializeAPI().then(() => {
        if (playerContainerRef.current) {
          createPlayer("youtube-player-iframe");
          setPlayerReady(true);
          // Load default channel videos
          getDefaultChannelVideos();
        }
      });
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

  if (!playerState.isPanelOpen) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>🎥</span>
          <h2 className={styles.title}>YouTube</h2>
        </div>
        <button
          className={styles.closeButton}
          onClick={closePanel}
          aria-label="Close YouTube panel"
        >
          ✕
        </button>
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
            {searchResults.map((video, index) => (
              <div
                key={video.id.videoId}
                className={`${styles.videoItem} ${
                  playerState.currentVideoId === video.id.videoId
                    ? styles.videoItemActive
                    : ""
                }`}
                onClick={() => handlePlayVideo(video.id.videoId, index)}
              >
                <div className={styles.videoThumbnail}>
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                  />
                  {playerState.currentVideoId === video.id.videoId && (
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
                    {new Date(video.snippet.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
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
