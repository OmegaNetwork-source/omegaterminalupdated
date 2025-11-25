"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./SomniaArcadeModal.module.css";

export interface SomniaArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SomniaArcadeModal({
  isOpen,
  onClose,
}: SomniaArcadeModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  /**
   * Handle fullscreen toggle
   */
  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      modalRef.current?.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  /**
   * Handle escape key to close modal
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  /**
   * Handle fullscreen change events
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Somnia Arcade</h2>
          <div className={styles.headerButtons}>
            <button
              className={styles.headerBtn}
              onClick={handleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? "🗗" : "⛶"}
            </button>
            <button
              className={styles.headerBtn}
              onClick={onClose}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className={styles.iframeContainer}>
          <iframe
            src="https://somniaarcade.solarstudios.co/"
            className={styles.iframe}
            title="Somnia Arcade"
            allow="clipboard-read; clipboard-write; fullscreen"
            allowFullScreen
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}


