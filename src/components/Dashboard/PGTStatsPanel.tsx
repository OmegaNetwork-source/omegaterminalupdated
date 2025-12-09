"use client";

/**
 * PGT Stats Panel
 * Displays portfolio tracking statistics in the sidebar
 * Based on vanilla pgt-stats-panel structure
 */

import React from "react";
import { usePGT } from "@/hooks/usePGT";
import styles from "./PGTStatsPanel.module.css";

export function PGTStatsPanel(): JSX.Element {
  const { portfolio, wallets } = usePGT();

  // This component is only rendered when wallets.length > 0 (checked in parent)
  // But we still need to handle the case where portfolio might be null
  if (!portfolio) {
    return (
      <div className={styles.pgtStatsPanel}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Loading...</span>
        </div>
      </div>
    );
  }

  const { totalValue, totalChange24hPercent, walletCount } = portfolio;

  const changePercent = totalChange24hPercent || 0;
  const changeText = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;

  return (
    <div className={styles.pgtStatsPanel}>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>Total Value</span>
        <span className={styles.statValue} id="pgt-total-value">
          ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>24h Change</span>
        <span
          className={`${styles.statValue} ${changePercent >= 0 ? styles.positive : styles.negative}`}
          id="pgt-24h-change"
        >
          {changeText}
        </span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>Wallets</span>
        <span className={styles.statValue} id="pgt-wallet-count">
          {walletCount}
        </span>
      </div>
    </div>
  );
}

