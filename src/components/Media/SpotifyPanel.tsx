"use client";

/**
 * Spotify Panel Component
 *
 * Renders the Spotify player interface with authentication, search, playback controls,
 * and playlists. Integrates with SpotifyProvider for state management.
 */

import React, { useState } from "react";
import { useSpotify } from "@/hooks/useSpotify";
import styles from "./SpotifyPanel.module.css";

export function SpotifyPanel() {
  const {
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
    closePanel,
  } = useSpotify();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "playlists">("search");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && authState.isAuthenticated) {
      await searchTracks(searchQuery);
    }
  };

  const handlePlayTrack = async (uri: string) => {
    await playTrack(uri);
  };

  const handlePlayPlaylist = async (uri: string) => {
    await playPlaylist(uri);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!playerState.isPanelOpen) {
    return null;
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
        {!authState.isAuthenticated ? (
          <div className={styles.authPrompt}>
            <div className={styles.authIcon}>🔒</div>
            <h3>Connect to Spotify</h3>
            <p>
              Sign in with your Spotify Premium account to start playing music
            </p>
            <button className={styles.authButton} onClick={authenticate}>
              Connect Spotify
            </button>
            <p className={styles.authNote}>
              Note: Spotify Premium required for playback
            </p>
          </div>
        ) : (
          <>
            {/* Now Playing */}
            {playerState.currentTrack && (
              <div className={styles.nowPlaying}>
                <div className={styles.albumArt}>
                  {playerState.currentTrack.album?.images?.[0]?.url ? (
                    <img
                      src={playerState.currentTrack.album.images[0].url}
                      alt={playerState.currentTrack.album.name}
                    />
                  ) : (
                    <div className={styles.albumPlaceholder}>🎵</div>
                  )}
                </div>
                <div className={styles.trackInfo}>
                  <div className={styles.trackName}>
                    {playerState.currentTrack.name}
                  </div>
                  <div className={styles.trackArtist}>
                    {playerState.currentTrack.artists
                      ?.map((a: any) => a.name)
                      .join(", ")}
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
                onClick={togglePlayPause}
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

            {/* Progress Bar */}
            {playerState.currentTrack && (
              <div className={styles.progress}>
                <span className={styles.progressTime}>
                  {formatTime(playerState.position)}
                </span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${
                        (playerState.position / playerState.duration) * 100
                      }%`,
                    }}
                  />
                </div>
                <span className={styles.progressTime}>
                  {formatTime(playerState.duration)}
                </span>
              </div>
            )}

            {/* Volume Control */}
            <div className={styles.volume}>
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                value={playerState.volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
                aria-label="Volume"
              />
              <span>{playerState.volume}%</span>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${
                  activeTab === "search" ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab("search")}
              >
                Search
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "playlists" ? styles.tabActive : ""
                }`}
                onClick={() => {
                  setActiveTab("playlists");
                  if (playlists.length === 0) {
                    getUserPlaylists();
                  }
                }}
              >
                Playlists
              </button>
            </div>

            {/* Search Tab */}
            {activeTab === "search" && (
              <div className={styles.searchTab}>
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

                <div className={styles.results}>
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      className={styles.trackItem}
                      onClick={() => handlePlayTrack(track.uri)}
                    >
                      <div className={styles.trackItemArt}>
                        {track.album?.images?.[2]?.url ? (
                          <img src={track.album.images[2].url} alt="" />
                        ) : (
                          <div className={styles.trackItemPlaceholder}>🎵</div>
                        )}
                      </div>
                      <div className={styles.trackItemInfo}>
                        <div className={styles.trackItemName}>{track.name}</div>
                        <div className={styles.trackItemArtist}>
                          {track.artists?.map((a: any) => a.name).join(", ")}
                        </div>
                      </div>
                      <div className={styles.trackItemDuration}>
                        {formatTime(track.duration_ms)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Playlists Tab */}
            {activeTab === "playlists" && (
              <div className={styles.playlistsTab}>
                <div className={styles.results}>
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={styles.playlistItem}
                      onClick={() => handlePlayPlaylist(playlist.uri)}
                    >
                      <div className={styles.playlistArt}>
                        {playlist.images?.[0]?.url ? (
                          <img src={playlist.images[0].url} alt="" />
                        ) : (
                          <div className={styles.playlistPlaceholder}>📚</div>
                        )}
                      </div>
                      <div className={styles.playlistInfo}>
                        <div className={styles.playlistName}>
                          {playlist.name}
                        </div>
                        <div className={styles.playlistTracks}>
                          {playlist.tracks?.total || 0} tracks
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Info & Logout */}
            <div className={styles.footer}>
              <button className={styles.logoutButton} onClick={logout}>
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
