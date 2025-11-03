"use client";

/**
 * Media Panel Container Component
 *
 * Container component that conditionally renders media panels based on
 * provider state. Only one panel can be open at a time.
 *
 * Manages:
 * - SpotifyPanel (music player)
 * - YouTubePanel (video player)
 * - NewsReaderPanel (crypto news)
 */

import type { ComponentType } from "react";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { useNewsReader } from "@/hooks/useNewsReader";
import styles from "./MediaPanelContainer.module.css";

export interface MediaPanelContainerProps {
  SpotifyPanel: ComponentType;
  YouTubePanel: ComponentType;
  NewsReaderPanel: ComponentType;
}

export function MediaPanelContainer({
  SpotifyPanel,
  YouTubePanel,
  NewsReaderPanel,
}: MediaPanelContainerProps) {
  const spotify = useSpotify();
  const youtube = useYouTube();
  const newsReader = useNewsReader();

  // Determine which panel is open
  const isPanelOpen =
    spotify.playerState.isPanelOpen ||
    youtube.playerState.isPanelOpen ||
    newsReader.readerState.isPanelOpen;

  // Don't render anything if no panels are open
  if (!isPanelOpen) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Backdrop - clicks close the active panel */}
      <div
        className={styles.backdrop}
        onClick={() => {
          if (spotify.playerState.isPanelOpen) {
            spotify.closePanel();
          } else if (youtube.playerState.isPanelOpen) {
            youtube.closePanel();
          } else if (newsReader.readerState.isPanelOpen) {
            newsReader.closePanel();
          }
        }}
        aria-label="Close panel"
      />

      {/* Spotify Panel */}
      {spotify.playerState.isPanelOpen && <SpotifyPanel />}

      {/* YouTube Panel */}
      {youtube.playerState.isPanelOpen && <YouTubePanel />}

      {/* News Reader Panel */}
      {newsReader.readerState.isPanelOpen && <NewsReaderPanel />}
    </div>
  );
}
