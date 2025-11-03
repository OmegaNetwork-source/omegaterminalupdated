"use client";

/**
 * ProtocolCard Component
 *
 * Displays DeFi Llama protocol information in a formatted card.
 * Matches styling from defillama-api-plugin.js
 */

import React from "react";
import styles from "./ProtocolCard.module.css";

export interface ProtocolCardProps {
  rank: number;
  name: string;
  symbol?: string;
  logo?: string;
  category?: string;
  tvl: number;
  change_1d?: number;
  chains?: string[];
  url?: string;
  slug?: string;
}

export const ProtocolCard: React.FC<ProtocolCardProps> = ({
  rank,
  name,
  symbol,
  logo,
  category,
  tvl,
  change_1d,
  chains,
  url,
  slug,
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

  const handleDetailedTVL = () => {
    const event = new CustomEvent("terminal-command", {
      detail: `defillama tvl ${slug || name.toLowerCase()}`,
    });
    window.dispatchEvent(event);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <div className={styles.rank}>{rank}</div>
          {logo ? (
            <img src={logo} alt={name} className={styles.logo} />
          ) : (
            <div className={styles.logoPlaceholder}>{name[0]}</div>
          )}
          <div className={styles.info}>
            <div className={styles.name}>{name}</div>
            {category && <div className={styles.category}>{category}</div>}
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
      {chains && chains.length > 0 && (
        <div className={styles.chains}>
          Chains: {chains.slice(0, 5).join(", ")}
          {chains.length > 5 && "..."}
        </div>
      )}
      <div className={styles.actions}>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionButton}
          >
            Visit Protocol
          </a>
        )}
        <button
          onClick={handleDetailedTVL}
          className={`${styles.actionButton} ${styles.secondaryButton}`}
        >
          Detailed TVL
        </button>
      </div>
    </div>
  );
};
