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
      <button 
        className={styles.button} 
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "copy";
          e.dataTransfer.setData("text/plain", "subaction:perps|Omega Perps|Open Omega Perps trading panel");
          if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = "0.5";
          }
        }}
        onDragEnd={(e) => {
          if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = "1";
          }
        }}
        onClick={() => perps.openPanel()}
        title="Drag to Quick Actions or click to execute"
      >
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
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:chart BTC|Bitcoin Chart|BTC/USD price chart");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("chart BTC")}
            title="Drag to Quick Actions or click to execute"
          >
            {getSubActionIcon("Bitcoin Chart")}
            <span>Bitcoin Chart</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:chart ETH|Ethereum Chart|ETH/USD price chart");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("chart ETH")}
            title="Drag to Quick Actions or click to execute"
          >
            {getSubActionIcon("Ethereum Chart")}
            <span>Ethereum Chart</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:chart SOL|Solana Chart|SOL/USD price chart");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("chart SOL")}
            title="Drag to Quick Actions or click to execute"
          >
            {getSubActionIcon("Solana Chart")}
            <span>Solana Chart</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:chart TVC:GOLD|Gold Chart|Gold price chart");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("chart TVC:GOLD")}
            title="Drag to Quick Actions or click to execute"
          >
            {getSubActionIcon("Gold Chart")}
            <span>Gold Chart</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:chart TVC:SILVER|Silver Chart|Silver price chart");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("chart TVC:SILVER")}
            title="Drag to Quick Actions or click to execute"
          >
            {getSubActionIcon("Silver Chart")}
            <span>Silver Chart</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:chart|Custom Chart|Open custom chart viewer");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("chart")}
            title="Drag to Quick Actions or click to execute"
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
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:ds search WBTC|BTC Analytics|Bitcoin analytics on DexScreener");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("ds search WBTC")}
            title="Drag to Quick Actions or click to execute"
          >
            {getSubActionIcon("BTC Analytics")}
            <span>BTC Analytics</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:ds search WETH|ETH Analytics|Ethereum analytics on DexScreener");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("ds search WETH")}
            title="Drag to Quick Actions or click to execute"
          >
            {getSubActionIcon("ETH Analytics")}
            <span>ETH Analytics</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:ds search SOL|SOL Analytics|Solana analytics on DexScreener");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("ds search SOL")}
            title="Drag to Quick Actions or click to execute"
          >
            {getSubActionIcon("SOL Analytics")}
            <span>SOL Analytics</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:ds trending|Trending Tokens|View trending tokens");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("ds trending")}
            title="Drag to Quick Actions or click to execute"
          >
            {getSubActionIcon("Trending Tokens")}
            <span>Trending Tokens</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:ds analytics|Token Analytics|Token analytics dashboard");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("ds analytics")}
            title="Drag to Quick Actions or click to execute"
          >
            {getSubActionIcon("Analytics")}
            <span>Token Analytics</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:ds|DexScreener Help|DexScreener command help");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("ds")}
            title="Drag to Quick Actions or click to execute"
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
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:defillama tvl|Total DeFi TVL|Total DeFi TVL across all chains");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("defillama tvl")}
            title="Drag to Quick Actions or click to execute"
          >
            <span>→ 📊 Total DeFi TVL</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:defillama protocols 5|Top 5 Protocols|Top 5 DeFi protocols by TVL");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("defillama protocols 5")}
            title="Drag to Quick Actions or click to execute"
          >
            <span>→ 🏛️ Top 5 Protocols</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:defillama chains 10|Top 10 Chains|Top 10 chains by TVL");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("defillama chains 10")}
            title="Drag to Quick Actions or click to execute"
          >
            <span>→ ⛓️ Top 10 Chains</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:defillama tvl|Protocol TVL|Search protocol TVL");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("defillama tvl")}
            title="Drag to Quick Actions or click to execute"
          >
            <span>→ 🔍 Protocol TVL</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:defillama price ethereum|ETH Price|Ethereum price from DeFi Llama");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("defillama price ethereum")}
            title="Drag to Quick Actions or click to execute"
          >
            <span>→ 💰 ETH Price</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:defillama tokens eth,btc,sol|Multi-Token Prices|Get prices for multiple tokens");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("defillama tokens eth,btc,sol")}
            title="Drag to Quick Actions or click to execute"
          >
            <span>→ 💎 Multi-Token Prices</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:defillama price|Custom Token Price|Get custom token price");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("defillama price")}
            title="Drag to Quick Actions or click to execute"
          >
            <span>→ 🔍 Custom Token Price</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:defillama trending|Trending Protocols|Trending DeFi protocols");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("defillama trending")}
            title="Drag to Quick Actions or click to execute"
          >
            <span>→ 📈 Trending Protocols</span>
          </button>
          <button
            className={styles.subButton}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", "subaction:defillama debug|Debug Token Price|Debug token price lookup");
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.5";
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
            onClick={() => handleCommand("defillama debug")}
            title="Drag to Quick Actions or click to execute"
          >
            <span>→ 🐛 Debug Token Price</span>
          </button>
        </div>
      </details>
    </div>
  );
}

export default TradingAnalyticsSection;
