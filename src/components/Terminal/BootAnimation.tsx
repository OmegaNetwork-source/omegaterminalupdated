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
} from "@/lib/constants";
import styles from "./BootAnimation.module.css";

// Feature badges with SVG icons instead of emojis
const FEATURE_BADGES = [
  { 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" fill="currentColor" />
      </svg>
    ),
    label: "AI"
  },
  { 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2,3H22C23.05,3 24,3.95 24,5V19C24,20.05 23.05,21 22,21H2C0.95,21 0,20.05 0,19V5C0,3.95 0.95,3 2,3M14,6V7H22V6H14M14,8V9H21.5L22,9V8H14M14,10V11H21V10H14M8,13.91C6,13.91 2,15 2,17V18H14V17C14,15 10,13.91 8,13.91M8,6A3,3 0 0,0 5,9A3,3 0 0,0 8,12A3,3 0 0,0 11,9A3,3 0 0,0 8,6Z" fill="currentColor" />
      </svg>
    ),
    label: "Multi-Chain"
  },
  { 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13,2.03V2.05L13,4.05C17.39,4.59 20.5,8.58 19.96,12.97C19.5,16.61 16.64,19.5 13,19.93V21.93C18.5,21.38 22.5,16.5 21.95,11C21.5,6.25 17.73,2.5 13,2.03M11,2.06C9.05,2.25 7.19,3 5.67,4.26L7.1,5.74C8.22,4.84 9.57,4.26 11,4.06V2.06M4.26,5.67C3,7.19 2.25,9.04 2.05,11H4.05C4.24,9.58 4.8,8.23 5.69,7.1L4.26,5.67M2.06,13C2.26,14.96 3.03,16.81 4.27,18.33L5.69,16.9C4.81,15.77 4.24,14.42 4.06,13H2.06M7.1,18.37L5.67,19.74C7.18,21 9.04,21.79 11,22V20C9.58,19.82 8.23,19.25 7.1,18.37M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" fill="currentColor" />
      </svg>
    ),
    label: "Productivity"
  },
  { 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.6C8,12.1 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z" fill="currentColor" />
      </svg>
    ),
    label: "Security"
  },
  { 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19C8.13,19 5,15.87 5,12C5,8.13 8.13,5 12,5C15.87,5 19,8.13 19,12C19,15.87 15.87,19 12,19M12.5,11.03L11.41,10.4C10.85,10.08 10.5,9.5 10.5,8.86V7.5C10.5,6.67 11.17,6 12,6C12.83,6 13.5,6.67 13.5,7.5V8.86L13.03,9.14L15.15,10.69L16.35,9.35L12.5,7.1V11.03M16.5,16.5L14.5,14.5L12.5,16.5L10.5,14.5L8.5,16.5L10.5,18.5L8.5,20.5L10.5,22.5L12.5,20.5L14.5,22.5L16.5,20.5L14.5,18.5L16.5,16.5Z" fill="currentColor" />
      </svg>
    ),
    label: "Themes"
  },
] as const;

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
              <div className={styles.badgeIcon}>{badge.icon}</div>
              <span className={styles.badgeLabel}>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
