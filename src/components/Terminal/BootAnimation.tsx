"use client";

/**
 * BootAnimation Component
 * Displays animated boot sequence on initial load with Omega logo, loading bar, and feature badges
 * Shows for a configurable duration before calling onComplete callback
 */

import { useState, useEffect } from "react";
import type { BootAnimationProps } from "@/types/terminal";
import {
  APP_VERSION,
  BOOT_ANIMATION_DURATION,
  FEATURE_BADGES,
} from "@/lib/constants";
import styles from "./BootAnimation.module.css";

export function BootAnimation({
  onComplete,
  duration = BOOT_ANIMATION_DURATION,
}: BootAnimationProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Increment progress bar by 2% every 50ms until 100%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Call onComplete after specified duration
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    // Cleanup on unmount
    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Omega Logo */}
        <div className={styles.logo}>Ω</div>

        {/* Title */}
        <h1 className={styles.title}>OMEGA TERMINAL</h1>

        {/* Version */}
        <div className={styles.version}>v{APP_VERSION}</div>

        {/* Subtitle */}
        <div className={styles.subtitle}>Multi-Chain Web3 Terminal</div>

        {/* Loading Bar */}
        <div className={styles.loadingBarContainer}>
          <div
            className={styles.loadingBar}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <div className={styles.loadingText}>Initializing Terminal...</div>

        {/* Feature Badges */}
        <div className={styles.featureBadges}>
          {FEATURE_BADGES.map((badge, index) => (
            <div key={index} className={styles.badge}>
              <span className={styles.badgeEmoji}>{badge.emoji}</span>
              <span className={styles.badgeLabel}>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
