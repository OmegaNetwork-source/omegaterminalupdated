"use client";

/**
 * Spotify Panel Component
 *
 * Renders the Spotify music player interface with authentication, search, track playback,
 * and playlist controls. Integrates with SpotifyProvider for state management.
 * Based on Spotify Web Playback SDK example from GitHub.
 */

import React, { useState, useEffect } from "react";
import { useSpotify } from "@/hooks/useSpotify";
import config from "@/lib/config";
import styles from "./SpotifyPanel.module.css";

export function SpotifyPanel() {
  const {
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
    closePanel,
  } = useSpotify();

  const [searchQuery, setSearchQuery] = useState("");
  const [showPlaylists, setShowPlaylists] = useState(false);

  useEffect(() => {
    if (authState.isAuthenticated && showPlaylists) {
      void getUserPlaylists();
    }
  }, [authState.isAuthenticated, showPlaylists, getUserPlaylists]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchTracks(searchQuery);
    }
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.target.value, 10);
    void setVolume(volume);
  };

  // If not authenticated, show authentication UI
  if (!authState.isAuthenticated) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logo}>🎵</span>
            <h2 className={styles.title}>Spotify</h2>
          </div>
          <button
            className={styles.closeButton}
            onClick={closePanel}
            aria-label="Close Spotify panel"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.authContainer}>
            <div className={styles.authIcon}>🎧</div>
            <h3 className={styles.authTitle}>Connect to Spotify</h3>
            <p className={styles.authDescription}>
              Connect your Spotify Premium account to start playing music
            </p>
            {error && (
              <div className={styles.errorMessage}>
                <p>{error}</p>
                <button onClick={clearError} className={styles.errorClose}>
                  ✕
                </button>
              </div>
            )}
            <button
              className={styles.authButton}
              onClick={() => void authenticate()}
              disabled={!config.SPOTIFY_CONFIG.CLIENT_ID}
            >
              {config.SPOTIFY_CONFIG.CLIENT_ID ? "Connect to Spotify" : "Setup Required"}
            </button>
            {!config.SPOTIFY_CONFIG.CLIENT_ID && (
              <div className={styles.setupInfo}>
                <p className={styles.setupTitle}>Setup Instructions:</p>
                <ol className={styles.setupList}>
                  <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer">Spotify Developer Dashboard</a></li>
                  <li>Create a new app</li>
                  <li>Add redirect URI: <code>{config.SPOTIFY_CONFIG.REDIRECT_URI}</code></li>
                  <li>Set <code>NEXT_PUBLIC_SPOTIFY_CLIENT_ID</code> in .env.local</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>🎵</span>
          <h2 className={styles.title}>Spotify</h2>
        </div>
        <button
          className={styles.closeButton}
          onClick={closePanel}
          aria-label="Close Spotify panel"
        >
          ✕
        </button>
      </div>

      <div className={styles.content}>
        {/* Error Display */}
        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
            <button onClick={clearError} className={styles.errorClose}>
              ✕
            </button>
          </div>
        )}

        {/* Now Playing */}
        {playerState.currentTrack && (
          <div className={styles.nowPlaying}>
            <div className={styles.trackArtwork}>
              {playerState.currentTrack.album.images[0]?.url ? (
                <img
                  src={playerState.currentTrack.album.images[0].url}
                  alt={playerState.currentTrack.album.name}
                />
              ) : (
                <div className={styles.artworkPlaceholder}>🎵</div>
              )}
            </div>
            <div className={styles.trackInfo}>
              <div className={styles.trackName}>{playerState.currentTrack.name}</div>
              <div className={styles.trackArtist}>
                {playerState.currentTrack.artists.map((a) => a.name).join(", ")}
              </div>
              <div className={styles.trackAlbum}>{playerState.currentTrack.album.name}</div>
            </div>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${playerState.duration > 0 ? (playerState.position / playerState.duration) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className={styles.progressTime}>
                <span>{formatTime(playerState.position)}</span>
                <span>{formatDuration(playerState.duration)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Playback Controls */}
        <div className={styles.controls}>
          <button
            className={styles.controlButton}
            onClick={skipPrevious}
            aria-label="Previous track"
          >
            ⏮️
          </button>
          <button
            className={`${styles.controlButton} ${styles.playPauseButton}`}
            onClick={() => void togglePlayPause()}
            aria-label={playerState.isPlaying ? "Pause" : "Play"}
          >
            {playerState.isPlaying ? "⏸️" : "▶️"}
          </button>
          <button
            className={styles.controlButton}
            onClick={skipNext}
            aria-label="Next track"
          >
            ⏭️
          </button>
        </div>

        {/* Volume Control */}
        <div className={styles.volumeControl}>
          <label className={styles.volumeLabel}>Volume</label>
          <input
            type="range"
            min="0"
            max="100"
            value={playerState.volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
          />
          <span className={styles.volumeValue}>{playerState.volume}%</span>
        </div>

        {/* Search */}
        <div className={styles.searchContainer}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              🔍
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${!showPlaylists ? styles.tabActive : ""}`}
            onClick={() => setShowPlaylists(false)}
          >
            Search Results
          </button>
          <button
            className={`${styles.tab} ${showPlaylists ? styles.tabActive : ""}`}
            onClick={() => setShowPlaylists(true)}
          >
            My Playlists
          </button>
        </div>

        {/* Search Results */}
        {!showPlaylists && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <h3>
                {searchQuery ? `Results for "${searchQuery}"` : "Search for music"}
              </h3>
              <span className={styles.resultsCount}>
                {searchResults.length} tracks
              </span>
            </div>

            <div className={styles.trackList}>
              {searchResults.map((track) => (
                <div
                  key={track.id}
                  className={`${styles.trackItem} ${
                    playerState.currentTrack?.id === track.id ? styles.trackItemActive : ""
                  }`}
                  onClick={() => void playTrack(track.uri)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      void playTrack(track.uri);
                    }
                  }}
                  title={`Play ${track.name}`}
                >
                  <div className={styles.trackThumbnail}>
                    {track.album.images[0]?.url ? (
                      <img src={track.album.images[0].url} alt={track.album.name} />
                    ) : (
                      <div className={styles.trackPlaceholder}>🎵</div>
                    )}
                    {playerState.currentTrack?.id === track.id && (
                      <div className={styles.playingIndicator}>
                        {playerState.isPlaying ? "▶️" : "⏸️"}
                      </div>
                    )}
                  </div>
                  <div className={styles.trackInfo}>
                    <div className={styles.trackTitle}>{track.name}</div>
                    <div className={styles.trackArtist}>
                      {track.artists.map((a) => a.name).join(", ")}
                    </div>
                    <div className={styles.trackDuration}>
                      {formatDuration(track.duration_ms)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {searchResults.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎵</div>
                <p>Search for tracks to start playing</p>
              </div>
            )}
          </div>
        )}

        {/* Playlists */}
        {showPlaylists && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <h3>My Playlists</h3>
              <span className={styles.resultsCount}>
                {playlists.length} playlists
              </span>
            </div>

            <div className={styles.playlistList}>
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className={styles.playlistItem}
                  onClick={() => void playPlaylist(playlist.uri)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      void playPlaylist(playlist.uri);
                    }
                  }}
                  title={`Play ${playlist.name}`}
                >
                  <div className={styles.playlistThumbnail}>
                    {playlist.images[0]?.url ? (
                      <img src={playlist.images[0].url} alt={playlist.name} />
                    ) : (
                      <div className={styles.playlistPlaceholder}>🎵</div>
                    )}
                  </div>
                  <div className={styles.playlistInfo}>
                    <div className={styles.playlistName}>{playlist.name}</div>
                    <div className={styles.playlistTracks}>
                      {playlist.tracks.total} tracks
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {playlists.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎵</div>
                <p>No playlists found</p>
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <div className={styles.footer}>
          <button className={styles.logoutButton} onClick={logout}>
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

