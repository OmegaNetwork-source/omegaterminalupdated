"use client";

import { useCallback } from "react";
import { useTerminal } from "@/providers/TerminalProvider";
import { usePerps } from "@/hooks/usePerps";
import styles from "../DashboardSidebar.module.css";
import { getSubActionIcon } from "../utils/subActionIcons";

/**
 * Trading & Analytics Section - Market data and analytics
 * Matches vanilla js/futuristic/futuristic-dashboard-transform.js trading-analytics section
 */
export function TradingAnalyticsSection(): JSX.Element {
  const { executeCommand } = useTerminal();
  const perps = usePerps();

  const handleCommand = useCallback(
    (command: string) => {
      void executeCommand(command);
    },
    [executeCommand]
  );

  return (
    <div className={styles.sectionContent}>
      {/* Omega Perps */}
      <button className={styles.button} onClick={() => perps.openPanel()}>
        <svg
          className={styles.buttonIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6M16,17V15H14V17M14,13V7H12V13M10,17V11H8V17H10Z" />
        </svg>
        <span>Omega Perps</span>
      </button>

      {/* Live Charts */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3.5,18.5L9.5,12.5L13.5,16.5L22,6.92L20.59,5.5L13.5,13.5L9.5,9.5L2,17L3.5,18.5Z" />
          </svg>
          <span>Live Charts</span>
          <svg
            className={styles.expandIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chart BTC")}
          >
            {getSubActionIcon("Bitcoin Chart")}
            <span>Bitcoin Chart</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chart ETH")}
          >
            {getSubActionIcon("Ethereum Chart")}
            <span>Ethereum Chart</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chart SOL")}
          >
            {getSubActionIcon("Solana Chart")}
            <span>Solana Chart</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chart TVC:GOLD")}
          >
            {getSubActionIcon("Gold Chart")}
            <span>Gold Chart</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chart TVC:SILVER")}
          >
            {getSubActionIcon("Silver Chart")}
            <span>Silver Chart</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chart")}
          >
            {getSubActionIcon("Custom Chart")}
            <span>Custom Chart</span>
          </button>
        </div>
      </details>

      {/* DexScreener */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
          </svg>
          <span>DexScreener</span>
          <svg
            className={styles.expandIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("ds search WBTC")}
          >
            {getSubActionIcon("BTC Analytics")}
            <span>BTC Analytics</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("ds search WETH")}
          >
            {getSubActionIcon("ETH Analytics")}
            <span>ETH Analytics</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("ds search SOL")}
          >
            {getSubActionIcon("SOL Analytics")}
            <span>SOL Analytics</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("ds trending")}
          >
            {getSubActionIcon("Trending Tokens")}
            <span>Trending Tokens</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("ds analytics")}
          >
            {getSubActionIcon("Analytics")}
            <span>Token Analytics</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("ds")}
          >
            {getSubActionIcon("DexScreener Help")}
            <span>DexScreener Help</span>
          </button>
        </div>
      </details>

      {/* DeFi Llama */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" />
          </svg>
          <span>DeFi Llama</span>
          <svg
            className={styles.expandIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("defillama tvl")}
          >
            <span>→ 📊 Total DeFi TVL</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("defillama protocols 5")}
          >
            <span>→ 🏛️ Top 5 Protocols</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("defillama chains 10")}
          >
            <span>→ ⛓️ Top 10 Chains</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("defillama tvl")}
          >
            <span>→ 🔍 Protocol TVL</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("defillama price ethereum")}
          >
            <span>→ 💰 ETH Price</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("defillama tokens eth,btc,sol")}
          >
            <span>→ 💎 Multi-Token Prices</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("defillama price")}
          >
            <span>→ 🔍 Custom Token Price</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("defillama trending")}
          >
            <span>→ 📈 Trending Protocols</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("defillama debug")}
          >
            <span>→ 🐛 Debug Token Price</span>
          </button>
        </div>
      </details>
    </div>
  );
}

export default TradingAnalyticsSection;
