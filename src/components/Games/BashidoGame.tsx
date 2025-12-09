"use client";

/**
 * Bashido Game Component
 * 
 * Iframe-based samurai code game from bushidogame.solarstudios.co
 * Immersive text-based combat scenarios following "The Way of the Warrior"
 * Uniform design matching PerpsPanel and other media panels
 */

import React, { useEffect, useRef, useState } from "react";
import styles from "./BashidoGame.module.css";

export interface BashidoGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

const BASHIDO_GAME_URL = "https://bushidogame.solarstudios.co/";

export function BashidoGame({ onScoreUpdate, onGameEnd }: BashidoGameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  useEffect(() => {
    const onLoad = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const onError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", onLoad);
      iframe.addEventListener("error", onError);
    }

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        // Don't set error if it's still loading, might just be slow
      }
    }, 10000);

    return () => {
      if (iframe) {
        iframe.removeEventListener("load", onLoad);
        iframe.removeEventListener("error", onError);
      }
      clearTimeout(timeout);
    };
  }, [isLoading]);

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = BASHIDO_GAME_URL;
    }
  };

  const handleOpenInNewTab = () => {
    window.open(BASHIDO_GAME_URL, "_blank", "noopener,noreferrer");
  };

  // Listen for postMessage from iframe (if the game supports it)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from the game origin
      if (event.origin !== "https://bushidogame.solarstudios.co") {
        return;
      }

      // Handle score updates from the game
      if (event.data && typeof event.data === "object") {
        if (event.data.type === "score" && typeof event.data.score === "number") {
          const newScore = event.data.score;
          setScore(newScore);
          onScoreUpdate(newScore);
        }
        if (event.data.type === "gameEnd" && typeof event.data.finalScore === "number") {
          onGameEnd(event.data.finalScore);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onScoreUpdate, onGameEnd]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>⚔️</span>
          <div>
            <h2 className={styles.title}>Bashido</h2>
            <div className={styles.subtitle}>The Way of the Warrior</div>
          </div>
        </div>
        <div className={styles.headerButtons}>
          <button
            className={styles.headerButton}
            onClick={handleRefresh}
            aria-label="Refresh"
            title="Refresh game"
          >
            ⟳
          </button>
          <button
            className={styles.headerButton}
            onClick={handleOpenInNewTab}
            aria-label="Open in new tab"
            title="Open in new tab"
          >
            ⛶
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Game Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Score</div>
            <div className={styles.statValue}>{score}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Status</div>
            <div className={styles.statValue}>
              {isLoading ? "Loading..." : hasError ? "Error" : "Playing"}
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Mode</div>
            <div className={styles.statValue}>Terminal</div>
          </div>
        </div>

        {/* Iframe Container */}
        <div className={styles.iframeContainer}>
          {!hasError && (
            <iframe
              ref={iframeRef}
              src={BASHIDO_GAME_URL}
              className={styles.iframe}
              title="Bashido - The Way of the Warrior"
              allow="clipboard-read; clipboard-write; gamepad; fullscreen"
              allowFullScreen
              style={{
                width: "100%",
                height: "100%",
                minHeight: "500px",
              }}
            />
          )}

          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <div className={styles.loadingText}>Loading Bashido...</div>
              <div className={styles.loadingSubtext}>Embrace the samurai code - Honor, loyalty, discipline</div>
            </div>
          )}

          {hasError && (
            <div className={styles.error}>
              <div className={styles.errorIcon}>⚠️</div>
              <div className={styles.errorTitle}>Failed to load game</div>
              <div className={styles.errorText}>
                Unable to connect to Bashido game server.
              </div>
              <button className={styles.retryButton} onClick={handleRefresh}>
                ⟳ Retry
              </button>
              <button
                className={styles.openButton}
                onClick={handleOpenInNewTab}
              >
                ⛶ Open in New Tab
              </button>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className={styles.infoBar}>
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>⌨️</div>
            <div className={styles.infoText}>
              Type commands as fast as you can
            </div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>⚡</div>
            <div className={styles.infoText}>
              Speed and accuracy matter
            </div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>🏆</div>
            <div className={styles.infoText}>
              Compete for high scores
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span>ℹ️ The Way of the Warrior - Samurai Code Game</span>
      </div>
    </div>
  );
}
