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

// SVG Icons
const PickaxeIcon = ({ className }: { className?: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M14.531 12.469 6.619 4.557a2.5 2.5 0 0 0-3.536 3.536l7.912 7.912a2.5 2.5 0 0 0 3.536-3.536Z"></path>
    <path d="M17.619 21.557a2.5 2.5 0 0 0 3.536-3.536l-7.912-7.912a2.5 2.5 0 0 0-3.536 3.536Z"></path>
    <line x1="14" y1="5" x2="20" y2="11"></line>
    <line x1="16" y1="7" x2="22" y2="13"></line>
  </svg>
);

const CoinIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 6v12M6 12h12"></path>
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

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
        <PickaxeIcon className={styles.miningIcon} />
        <span className={styles.headerText}>MINING STATUS</span>
      </div>

      <div className={styles.status}>
        <div className={styles.statusIndicator}></div>
        <span className={styles.statusText}>ACTIVE</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.statRow}>
          <div className={styles.statContent}>
            <ActivityIcon className={styles.statIcon} />
            <span className={styles.statLabel}>Blocks Mined:</span>
          </div>
          <span className={styles.statValue}>{mineCount}</span>
        </div>

        <div className={styles.statRow}>
          <div className={styles.statContent}>
            <CoinIcon className={styles.statIcon} />
            <span className={styles.statLabel}>Total Earned:</span>
          </div>
          <span className={styles.statValue}>
            {totalEarned.toFixed(4)} OMEGA
          </span>
        </div>

        <div className={styles.statRow}>
          <div className={styles.statContent}>
            <ClockIcon className={styles.statIcon} />
            <span className={styles.statLabel}>Elapsed Time:</span>
          </div>
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
