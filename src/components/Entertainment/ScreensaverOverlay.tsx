"use client";

/**
 * Screensaver Overlay Component
 *
 * Displays a fullscreen YouTube video playlist as a screensaver.
 * The video plays with sound enabled, starts at 10 seconds, cycles through the playlist,
 * and has close and mute toggle buttons.
 */

import React, { useEffect, useRef, useState } from "react";
import styles from "./ScreensaverOverlay.module.css";

const SCREENSAVER_CONFIG = {
  VIDEO_ID: "qeKmc0KYh-Q",
  PLAYLIST_ID: "RDqeKmc0KYh-Q", // Radio playlist that auto-plays related videos
  START_TIME: 10, // Start video at 10 seconds
};

export function ScreensaverOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isMuted, setIsMuted] = useState(false); // Start with sound enabled (not muted)
  const isMutedRef = useRef(false); // Keep ref for keyboard handler (synced with state)

  useEffect(() => {
    // Create YouTube iframe optimized for UHD/4K playback
    const iframe = document.createElement("iframe");
    iframe.id = "screensaver-iframe";
    // Configure for fullscreen, sound enabled (mute=0), no controls, auto-play playlist, high quality
    // start=10 starts video at 10 seconds
    // mute=0 enables sound by default
    // disablekb=1 disables keyboard controls (prevents spacebar pause)
    // vq=hd2160 requests 4K/UHD quality (YouTube will auto-select best available if 4K not available)
    iframe.src = `https://www.youtube.com/embed/${SCREENSAVER_CONFIG.VIDEO_ID}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&fs=0&cc_load_policy=0&playsinline=0&loop=1&disablekb=1&list=${SCREENSAVER_CONFIG.PLAYLIST_ID}&playlist=${SCREENSAVER_CONFIG.PLAYLIST_ID}&start=${SCREENSAVER_CONFIG.START_TIME}&vq=hd2160`;
    iframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("webkitallowfullscreen", "true");
    iframe.setAttribute("mozallowfullscreen", "true");
    iframe.style.border = "none";
    iframe.style.margin = "0";
    iframe.style.padding = "0";
    // Prevent pointer events on iframe to block clicks that might pause video
    iframe.style.pointerEvents = "none";
    if (styles.iframe) {
      iframe.className = styles.iframe;
    }
    
    if (containerRef.current) {
      containerRef.current.appendChild(iframe);
      iframeRef.current = iframe;
    }
    
    // Wait for iframe to load, then seek to start time
    const handleIframeLoad = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          // Seek to start time (10 seconds)
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({
              event: "command",
              func: "seekTo",
              args: [SCREENSAVER_CONFIG.START_TIME, true],
            }),
            "*"
          );
        } catch (e) {
          console.warn("Failed to seek video:", e);
        }
      }
    };
    
    iframe.addEventListener("load", handleIframeLoad);
    
    // Monitor video state and auto-resume if paused
    const checkVideoState = setInterval(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          // Request video state
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({
              event: "listening",
              id: "screensaver",
            }),
            "*"
          );
        } catch (e) {
          // Silently handle errors
        }
      }
    }, 2000); // Check every 2 seconds
    
    // Listen for YouTube player state changes
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from YouTube
      if (event.origin !== "https://www.youtube.com") return;
      
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        
        // If video is paused, resume it
        if (data?.event === "onStateChange" && data?.info === 2) {
          // State 2 = paused, resume it
          if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({
                event: "command",
                func: "playVideo",
                args: "",
              }),
              "*"
            );
          }
        }
      } catch (e) {
        // Silently handle parse errors
      }
    };
    
    window.addEventListener("message", handleMessage);

    // Prevent body and html scroll when screensaver is active
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyMargin = document.body.style.margin;
    const originalBodyPadding = document.body.style.padding;
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.documentElement.style.overflow = "hidden";

    // Listen for close events
    const handleCloseEvent = () => {
      handleClose();
    };

    window.addEventListener("omega:closeScreensaver", handleCloseEvent);

    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block spacebar and other play/pause keys
      if (e.key === " " || e.key === "Space" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "m" || e.key === "M") {
        // Toggle mute with M key
        if (iframeRef.current && iframeRef.current.contentWindow) {
          try {
            const newMuteState = !isMutedRef.current;
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({
                event: "command",
                func: newMuteState ? "mute" : "unMute",
                args: "",
              }),
              "*"
            );
            isMutedRef.current = newMuteState;
            setIsMuted(newMuteState);
          } catch (err) {
            console.warn("Failed to toggle mute:", err);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(checkVideoState);
      window.removeEventListener("message", handleMessage);
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.margin = originalBodyMargin;
      document.body.style.padding = originalBodyPadding;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener("omega:closeScreensaver", handleCloseEvent);
      window.removeEventListener("keydown", handleKeyDown);
      if (iframeRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(iframeRef.current);
        } catch (e) {
          console.warn("Failed to remove iframe:", e);
        }
      }
    };
  }, []);
  
  const handleToggleMute = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const newMuteState = !isMutedRef.current;
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: newMuteState ? "mute" : "unMute",
            args: "",
          }),
          "*"
        );
        isMutedRef.current = newMuteState;
        setIsMuted(newMuteState);
      } catch (e) {
        console.warn("Failed to toggle mute:", e);
      }
    }
  };

  const handleClose = () => {
    // Pause video before closing
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          "*"
        );
      } catch (e) {
        console.warn("Failed to pause video:", e);
      }
    }

    // Dispatch close event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("omega:closeScreensaver", {
          detail: {},
        })
      );
    }
  };

  return (
    <div className={styles.overlay}>
      <div ref={containerRef} className={styles.container} />
      <div className={styles.controls}>
        <button
          className={styles.muteButton}
          onClick={handleToggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute (M)" : "Mute (M)"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close Screensaver"
          title="Close Screensaver (ESC)"
        >
          ×
        </button>
      </div>
    </div>
  );
}
