/**
 * GioPridePanel Component
 * Shows YouTube video, rainbow emojis, and flashing pride messages when Gio theme is active
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import styles from "./GioPridePanel.module.css";

const PRIDE_MESSAGES = [
  "LGBTQ+",
  "Pride",
  "Gay lives matter!",
  "G in Gio stands for gay",
];

const RAINBOW_EMOJIS = ["🌈", "🏳️‍🌈", "🌈", "🏳️‍⚧️", "🌈", "💖", "💜", "💙", "💚", "💛", "🧡", "❤️"];

export function GioPridePanel() {
  const { currentTheme } = useTheme();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showMessage, setShowMessage] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);

  // Only render when Gio theme is active
  if (currentTheme !== "gio") {
    return null;
  }

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // YouTube video URL
  const videoUrl = "https://youtu.be/KhRkkNr-6V4?si=Le9D1cUfzRisjBKk";
  const videoId = videoUrl ? getVideoId(videoUrl) : null;

  // Initialize YouTube IFrame API and autoplay
  useEffect(() => {
    if (!videoId) return;

    // Load YouTube IFrame API if not already loaded
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Wait for API to load, then create player
    const checkYT = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player && iframeRef.current) {
        clearInterval(checkYT);
        
        // Create player
        playerRef.current = new (window as any).YT.Player(iframeRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            mute: 0,
            loop: 1,
            playlist: videoId,
            controls: 1,
            rel: 0,
            enablejsapi: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              // Try to play the video
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              // If video is paused or ended, try to play again
              if (event.data === (window as any).YT.PlayerState.PAUSED || 
                  event.data === (window as any).YT.PlayerState.ENDED) {
                setTimeout(() => {
                  event.target.playVideo();
                }, 100);
              }
            },
          },
        });
      }
    }, 100);

    return () => {
      clearInterval(checkYT);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [videoId]);

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setShowMessage(false);
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % PRIDE_MESSAGES.length);
        setShowMessage(true);
      }, 300);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.gioPridePanel}>
      {/* YouTube Video */}
      {videoId && (
        <div className={styles.videoContainer}>
          <div
            ref={iframeRef}
            id="gio-pride-video-player"
            className={styles.video}
          />
        </div>
      )}

      {/* Flashing Pride Messages */}
      <div className={styles.messageContainer}>
        <div
          className={`${styles.flashingMessage} ${showMessage ? styles.show : styles.hide}`}
        >
          {PRIDE_MESSAGES[currentMessage]}
        </div>
      </div>

      {/* Queer Theme Content - Fills the blank space */}
      <div className={styles.queerThemeSection}>
        <h2 className={styles.queerTitle}>🌈 QUEER PRIDE 🌈</h2>
        <div className={styles.queerContent}>
          <div className={styles.queerCard}>
            <div className={styles.queerIcon}>🏳️‍🌈</div>
            <div className={styles.queerText}>
              <strong>Love is Love</strong>
              <p>Celebrating diversity and inclusion</p>
            </div>
          </div>
          <div className={styles.queerCard}>
            <div className={styles.queerIcon}>🏳️‍⚧️</div>
            <div className={styles.queerText}>
              <strong>Trans Rights</strong>
              <p>Supporting the transgender community</p>
            </div>
          </div>
          <div className={styles.queerCard}>
            <div className={styles.queerIcon}>💖</div>
            <div className={styles.queerText}>
              <strong>Equality</strong>
              <p>Everyone deserves respect and dignity</p>
            </div>
          </div>
          <div className={styles.queerCard}>
            <div className={styles.queerIcon}>✨</div>
            <div className={styles.queerText}>
              <strong>Be Yourself</strong>
              <p>Authenticity is beautiful</p>
            </div>
          </div>
        </div>
        <div className={styles.queerQuote}>
          "G in Gio stands for Gay, Great, and Gorgeous! 🌈"
        </div>
      </div>

      {/* Rainbow Emojis at Bottom */}
      <div className={styles.rainbowEmojis}>
        {RAINBOW_EMOJIS.map((emoji, index) => (
          <span
            key={index}
            className={styles.emoji}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

