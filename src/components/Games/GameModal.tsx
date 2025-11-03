"use client";

/**
 * GameModal Component
 *
 * Reusable modal wrapper for rendering games in full-screen overlay
 * Features:
 * - Full-screen modal with backdrop blur
 * - Header with game title and control buttons
 * - Fullscreen toggle support
 * - Score display and submission
 * - Game container for mounting game UI
 * - Close button with onClose callback
 *
 * Note: Individual game implementations (Snake, Pac-Man, etc.) will be
 * separate components that render inside this modal's game container.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./GameModal.module.css";

/**
 * GameModal Props
 */
export interface GameModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Game identifier */
  gameId: string;
  /** Display name of the game */
  gameName: string;
  /** Close callback */
  onClose: () => void;
  /** Score submission callback */
  onScoreSubmit?: (score: number) => void;
  /** Children to render in game container */
  children?: React.ReactNode;
}

/**
 * GameModal Component
 * Full-screen modal for game rendering
 */
export function GameModal({
  isOpen,
  gameId,
  gameName,
  onClose,
  onScoreSubmit,
  children,
}: GameModalProps) {
  const [gameScore, setGameScore] = useState<number | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
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
   * Handle score submission
   */
  const handleScoreSubmit = useCallback(() => {
    if (gameScore !== null && onScoreSubmit) {
      onScoreSubmit(gameScore);
    }
  }, [gameScore, onScoreSubmit]);

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

  /**
   * Reset state when game changes
   */
  useEffect(() => {
    if (isOpen) {
      setGameScore(null);
      setIsGameActive(true);
    } else {
      setIsGameActive(false);
    }
  }, [isOpen, gameId]);

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
          <h2 className={styles.title}>{gameName}</h2>
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
              title="Close Game"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Game Container */}
        <div className={styles.gameContainer}>
          {children || (
            <div
              style={{ color: "#00ff99", textAlign: "center", padding: "40px" }}
            >
              <h3>Game UI Coming in Phase 15</h3>
              <p>
                Game canvas and controls will be integrated with futuristic UI
                system
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.scoreDisplay}>
            {gameScore !== null ? `Score: ${gameScore}` : "Play to set a score"}
          </div>
          {gameScore !== null && onScoreSubmit && (
            <button className={styles.submitBtn} onClick={handleScoreSubmit}>
              Submit Score
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
