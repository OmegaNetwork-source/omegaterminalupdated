/**
 * Stress Test Statistics Component
 * Displays real-time network stress test statistics
 *
 * Shows stress test information including:
 * - Test status (RUNNING/STOPPED)
 * - Duration
 * - Wallets created
 * - Transactions sent
 * - Success/failure counts
 * - Success rate with progress bar
 * - Transaction rate
 */

"use client";

import React, { useEffect, useState } from "react";
import styles from "./StressTestStats.module.css";

/**
 * Stress test statistics structure
 */
export interface StressTestStatsData {
  /** Number of wallets created for testing */
  walletsCreated: number;
  /** Total number of transactions sent */
  transactionsSent: number;
  /** Number of successful transactions */
  successfulTxs: number;
  /** Number of failed transactions */
  failedTxs: number;
  /** Test start timestamp */
  startTime: number;
}

/**
 * Props for StressTestStats component
 */
export interface StressTestStatsProps {
  /** Whether stress test is currently active */
  isActive: boolean;
  /** Stress test statistics */
  stats: StressTestStatsData;
  /** Optional callback to stop stress test */
  onStop?: () => void;
}

/**
 * StressTestStats Component
 * Provides real-time stress test statistics display
 *
 * @example
 * <StressTestStats
 *   isActive={true}
 *   stats={statsData}
 *   onStop={() => executeCommand('stopstress')}
 * />
 */
export function StressTestStats({
  isActive,
  stats,
  onStop,
}: StressTestStatsProps) {
  const [duration, setDuration] = useState<number>(0);

  // Update duration every second when test is active
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - stats.startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, stats.startTime]);

  // Format duration as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate success rate
  const successRate =
    stats.transactionsSent > 0
      ? (stats.successfulTxs / stats.transactionsSent) * 100
      : 0;

  // Calculate transaction rate (tx/second)
  const txRate = duration > 0 ? stats.transactionsSent / duration : 0;

  // Don't render if not active
  if (!isActive) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>🚀</span>
        <span>Network Stress Test</span>
      </div>

      <div className={styles.status}>
        <div
          className={`${styles.statusIndicator} ${
            isActive ? styles.statusRunning : styles.statusStopped
          }`}
        ></div>
        <span className={styles.statusText}>
          {isActive ? "RUNNING" : "STOPPED"}
        </span>
      </div>

      <div className={styles.stats}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Duration:</span>
          <span className={styles.statValue}>{formatTime(duration)}</span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>Wallets Created:</span>
          <span className={styles.statValue}>{stats.walletsCreated}</span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>Total Transactions:</span>
          <span className={styles.statValue}>{stats.transactionsSent}</span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>Successful:</span>
          <span className={`${styles.statValue} ${styles.statSuccess}`}>
            {stats.successfulTxs}
          </span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>Failed:</span>
          <span className={`${styles.statValue} ${styles.statError}`}>
            {stats.failedTxs}
          </span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>Success Rate:</span>
          <span className={styles.statValue}>{successRate.toFixed(1)}%</span>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${successRate}%` }}
          ></div>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>Transaction Rate:</span>
          <span className={styles.statValue}>{txRate.toFixed(2)} tx/s</span>
        </div>
      </div>

      {onStop && (
        <button className={styles.stopButton} onClick={onStop}>
          Stop Stress Test
        </button>
      )}
    </div>
  );
}
