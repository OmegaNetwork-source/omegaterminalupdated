"use client";

/**
 * TokenCard Component
 *
 * Displays DexScreener token information in a formatted card.
 * Can be used both via context.logHtml and as a standalone React component.
 */

import React from "react";
import styles from "./TokenCard.module.css";

export interface TokenCardProps {
  rank: number;
  symbol: string;
  name: string;
  chainId: string;
  priceUsd: string;
  tokenAddress: string;
  url?: string;
  volume24h?: string;
  priceChange24h?: number;
  liquidity?: number;
}

export const TokenCard: React.FC<TokenCardProps> = ({
  rank,
  symbol,
  name,
  chainId,
  priceUsd,
  tokenAddress,
  url,
  volume24h,
  priceChange24h,
  liquidity,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(tokenAddress);
  };

  const isPositive = priceChange24h !== undefined && priceChange24h >= 0;
  const changeColor = isPositive ? styles.statPositive : styles.statNegative;
  const changePrefix = isPositive ? "+" : "";

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.rank}>{rank}</div>
          <span className={styles.symbol}>{symbol}</span>
          <span className={styles.chain}>{chainId}</span>
        </div>
      </div>
      <div className={styles.name}>{name}</div>
      <div className={styles.price}>${priceUsd}</div>
      <div className={styles.address}>
        {tokenAddress}
        <button onClick={handleCopy} className={styles.copyButton}>
          Copy
        </button>
      </div>
      {(volume24h || priceChange24h !== undefined || liquidity) && (
        <div className={styles.stats}>
          {volume24h && <div>24h Volume: ${volume24h}</div>}
          {priceChange24h !== undefined && (
            <div className={changeColor}>
              24h Change: {changePrefix}
              {priceChange24h.toFixed(2)}%
            </div>
          )}
          {liquidity && <div>Liquidity: ${liquidity.toLocaleString()}</div>}
        </div>
      )}
      {url && (
        <div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            View on DexScreener
          </a>
        </div>
      )}
    </div>
  );
};
