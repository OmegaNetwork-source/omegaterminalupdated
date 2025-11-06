"use client";

import { useState, useEffect } from "react";
import styles from "./PortfolioTracker.module.css";

export interface PortfolioTrackerProps {
  totalValue?: string;
  change24h?: string;
  change24hPercent?: string;
  className?: string;
}

export function PortfolioTracker({
  totalValue = "$122,486.96",
  change24h = "+0.98%",
  change24hPercent = "+0.98%",
  className,
}: PortfolioTrackerProps) {
  const [isPositive, setIsPositive] = useState(true);

  useEffect(() => {
    // Determine if change is positive or negative
    const isPos = change24h.startsWith("+") || parseFloat(change24hPercent.replace(/[+%]/g, "")) >= 0;
    setIsPositive(isPos);
  }, [change24h, change24hPercent]);

  return (
    <div className={`${styles.portfolioTracker} ${className || ""}`}>
      <div className={styles.portfolioContent}>
        <div className={styles.portfolioLabel}>Total Value</div>
        <div className={styles.portfolioValue}>{totalValue}</div>
      </div>
      <div className={styles.portfolioDivider}></div>
      <div className={styles.portfolioContent}>
        <div className={styles.portfolioLabel}>24h Change</div>
        <div
          className={`${styles.portfolioChange} ${
            isPositive ? styles.positive : styles.negative
          }`}
        >
          {change24h}
        </div>
      </div>
    </div>
  );
}

export default PortfolioTracker;

