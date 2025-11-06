"use client";

import { useState, useEffect } from "react";
import { usePGT } from "@/hooks/usePGT";
import styles from "./PortfolioTracker.module.css";

export interface PortfolioTrackerProps {
  totalValue?: string;
  change24h?: string;
  change24hPercent?: string;
  className?: string;
}

export function PortfolioTracker({
  totalValue: propTotalValue,
  change24h: propChange24h,
  change24hPercent: propChange24hPercent,
  className,
}: PortfolioTrackerProps) {
  const { portfolio } = usePGT();
  const [isPositive, setIsPositive] = useState(true);

  // Use real data from PGT if available, otherwise use props or defaults
  let totalValue: string;
  let change24h: string;
  let change24hPercent: string;

  if (portfolio && portfolio.walletCount > 0) {
    totalValue = `$${portfolio.totalValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    const changePercent = portfolio.totalChange24hPercent || 0;
    change24hPercent = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;
    change24h = change24hPercent;
  } else {
    totalValue = propTotalValue || "$0.00";
    change24h = propChange24h || "+0.00%";
    change24hPercent = propChange24hPercent || "+0.00%";
  }

  useEffect(() => {
    // Determine if change is positive or negative
    const isPos = change24h.startsWith("+") || parseFloat(change24hPercent.replace(/[+%]/g, "")) >= 0;
    setIsPositive(isPos);
  }, [change24h, change24hPercent]);

  const handleClick = () => {
    // Set terminal input to "pgt track " when clicked
    if (typeof window !== "undefined" && (window as any).__omegaSetTerminalInput) {
      (window as any).__omegaSetTerminalInput("pgt track ");
    }
  };

  return (
    <div 
      className={`${styles.portfolioTracker} ${className || ""}`}
      onClick={handleClick}
      title="Click to add 'pgt track' command to terminal input"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <span className={styles.portfolioTitle}>PGT</span>
      <div className={styles.portfolioContentWrapper}>
        <div className={styles.portfolioContent}>
          <span className={styles.portfolioLabel}>Total Value:</span>
          <span className={styles.portfolioValue}>{totalValue}</span>
        </div>
        <div className={styles.portfolioDivider}></div>
        <div className={styles.portfolioContent}>
          <span className={styles.portfolioLabel}>24h:</span>
          <span
            className={`${styles.portfolioChange} ${
              isPositive ? styles.positive : styles.negative
            }`}
          >
            {change24h}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PortfolioTracker;

