/**
 * Mining Status Component
 * Displays real-time mining status with statistics and controls
 *
 * Shows active mining information including:
 * - Current mining status (ACTIVE/IDLE)
 * - Block count
 * - Total OMEGA earned
 * - Elapsed time
 * - Stop mining button
 */

"use client";

import React, { useEffect, useState } from "react";
import styles from "./MiningStatus.module.css";

/**
 * Props for MiningStatus component
 */
export interface MiningStatusProps {
  /** Whether mining is currently active */
  isMining: boolean;
  /** Current block count */
  mineCount: number;
  /** Total OMEGA earned in current session */
  totalEarned: number;
  /** Optional callback to stop mining */
  onStop?: () => void;
}

/**
 * MiningStatus Component
 * Provides real-time mining status display with statistics and controls
 *
 * @example
 * <MiningStatus
 *   isMining={true}
 *   mineCount={42}
 *   totalEarned={12.5}
 *   onStop={() => executeCommand('stop')}
 * />
 */
export function MiningStatus({
  isMining,
  mineCount,
  totalEarned,
  onStop,
}: MiningStatusProps) {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime] = useState<number>(() => Date.now());

  // Update elapsed time every second when mining is active
  useEffect(() => {
    if (!isMining) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isMining, startTime]);

  // Format elapsed time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Don't render if not mining
  if (!isMining) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.miningIndicator}>⛏️</span>
        <span>Mining Status</span>
      </div>

      <div className={styles.status}>
        <div
          className={`${styles.statusIndicator} ${styles.statusActive}`}
        ></div>
        <span className={styles.statusText}>ACTIVE</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Blocks Mined:</span>
          <span className={styles.statValue}>{mineCount}</span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>Total Earned:</span>
          <span className={styles.statValue}>
            {totalEarned.toFixed(4)} OMEGA
          </span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>Elapsed Time:</span>
          <span className={styles.statValue}>{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {onStop && (
        <button className={styles.stopButton} onClick={onStop}>
          Stop Mining
        </button>
      )}
    </div>
  );
}
