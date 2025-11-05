"use client";

/**
 * Omega Trance Player Panel Component
 *
 * Renders the Omega Trance Player interface with YouTube iframe integration,
 * waveform animation, and playback controls. Plays a fixed Trance playlist.
 */

import React, { useState, useEffect, useRef } from "react";
import styles from "./OmegaTrancePlayerPanel.module.css";

const TRANCE_CONFIG = {
  VIDEO_ID: "T2QZpy07j4s",
  VIDEO_URL: "https://www.youtube.com/watch?v=T2QZpy07j4s&list=RDT2QZpy07j4s&start_radio=1",
};

interface OmegaTrancePlayerState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
}

export function OmegaTrancePlayerPanel() {
  const [playerState, setPlayerState] = useState<OmegaTrancePlayerState>({
    isPlaying: false,
    volume: 0.7,
    isMuted: false,
  });
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initialize iframe
    const iframe = document.createElement("iframe");
    iframe.id = "trance-audio-iframe";
    iframe.src = `https://www.youtube.com/embed/${TRANCE_CONFIG.VIDEO_ID}?autoplay=0&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&fs=0&cc_load_policy=0&playsinline=1&list=RDT2QZpy07j4s`;
    iframe.style.cssText =
      "position:absolute;width:0;height:0;border:none;opacity:0;pointer-events:none;";
    iframe.allow = "autoplay; encrypted-media";
    iframe.setAttribute("allowfullscreen", "");
    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    // Initialize waveform
    initializeWaveform();

    // Auto-play after panel opens
    const autoPlayTimer = setTimeout(() => {
      handlePlay();
    }, 500);

    // Listen for control events
    const handleControl = (e: CustomEvent) => {
      const { action, value } = e.detail;
      switch (action) {
        case "toggle":
          handleTogglePlayPause();
          break;
        case "pause":
          handlePause();
          break;
        case "volume":
          if (value !== undefined) {
            setPlayerState((prev) => ({ ...prev, volume: value / 100 }));
          }
          break;
      }
    };

    // Listen for close events to pause playback
    const handleCloseEvent = () => {
      handlePause();
    };

    window.addEventListener("omega:trancePlayerControl", handleControl as EventListener);
    window.addEventListener("omega:closeOmegaTrancePlayer", handleCloseEvent);

    return () => {
      clearTimeout(autoPlayTimer);
      window.removeEventListener("omega:trancePlayerControl", handleControl as EventListener);
      window.removeEventListener("omega:closeOmegaTrancePlayer", handleCloseEvent);
      if (iframeRef.current) {
        document.body.removeChild(iframeRef.current);
      }
    };
  }, []);

  const initializeWaveform = () => {
    if (!waveformRef.current) return;

    const waveBars = waveformRef.current.querySelectorAll(`.${styles.waveBar}`);
    waveBars.forEach((bar, index) => {
      const height = Math.random() * 60 + 20; // Random height 20-80px
      (bar as HTMLElement).style.height = `${height}px`;
      (bar as HTMLElement).style.animationDelay = `${index * 0.1}s`;
    });
  };

  const playViaIframe = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          "*"
        );
      } catch (e) {
        console.warn("Iframe play command failed:", e);
      }
    }
  };

  const pauseViaIframe = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          "*"
        );
      } catch (e) {
        console.warn("Iframe pause command failed:", e);
      }
    }
  };

  const handlePlay = () => {
    playViaIframe();
    setPlayerState((prev) => ({ ...prev, isPlaying: true }));
    startWaveformAnimation();
  };

  const handlePause = () => {
    pauseViaIframe();
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    stopWaveformAnimation();
  };

  const handleTogglePlayPause = () => {
    if (playerState.isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const startWaveformAnimation = () => {
    if (waveformRef.current && styles.waveformPlaying) {
      waveformRef.current.classList.add(styles.waveformPlaying);
    }
  };

  const stopWaveformAnimation = () => {
    if (waveformRef.current && styles.waveformPlaying) {
      waveformRef.current.classList.remove(styles.waveformPlaying);
    }
  };

  const handleClose = () => {
    handlePause();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("omega:closeOmegaTrancePlayer", {
          detail: {},
        })
      );
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>Ω</span>
          <h2 className={styles.title}>Omega Trance</h2>
        </div>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close Trance player"
        >
          ×
        </button>
      </div>

      <div className={styles.content}>
        {/* Track Info */}
        <div className={styles.trackInfo}>
          <div className={styles.trackTitle}>Trance Playlist</div>
          <div className={styles.trackArtist}>Omega Trance</div>
        </div>

        {/* Waveform */}
        <div className={styles.waveformContainer}>
          <div
            ref={waveformRef}
            className={styles.waveform}
            id="trance-waveform"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className={styles.waveBar} />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlButtons}>
            <button
              className={`${styles.btn} ${styles.playPause}`}
              onClick={handleTogglePlayPause}
              aria-label={playerState.isPlaying ? "Pause" : "Play"}
            >
              {playerState.isPlaying ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path d="M6,4H10V20H6V4M14,4H18V20H14V4Z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
