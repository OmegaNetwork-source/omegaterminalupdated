"use client";

/**
 * ChainCard Component
 *
 * Displays DeFi Llama chain TVL information in a formatted card.
 * Matches styling from defillama-api-plugin.js
 */

import React from "react";
import styles from "./ChainCard.module.css";

export interface ChainCardProps {
  rank: number;
  name: string;
  tokenSymbol?: string;
  tvl: number;
  change_1d?: number;
}

export const ChainCard: React.FC<ChainCardProps> = ({
  rank,
  name,
  tokenSymbol,
  tvl,
  change_1d,
}) => {
  const formatTVL = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const isPositive = change_1d !== undefined && change_1d >= 0;
  const changeClass = isPositive
    ? styles.changePositive
    : styles.changeNegative;
  const changePrefix = isPositive ? "+" : "";

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.rank}>{rank}</div>
          <div className={styles.info}>
            <div className={styles.name}>{name}</div>
            {tokenSymbol && (
              <div className={styles.tokenSymbol}>{tokenSymbol}</div>
            )}
          </div>
        </div>
        <div className={styles.tvlSection}>
          <div className={styles.tvl}>{formatTVL(tvl)}</div>
          {change_1d !== undefined && (
            <div className={`${styles.change} ${changeClass}`}>
              {changePrefix}
              {change_1d.toFixed(2)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
