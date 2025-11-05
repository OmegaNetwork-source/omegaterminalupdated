"use client";

/**
 * Perps Panel Component
 *
 * Renders the Omega Perps trading interface with iframe embedding.
 * Integrates with PerpsProvider for state management.
 * Matches YouTube/Spotify panel design for uniformity.
 */

import React, { useEffect, useRef, useState } from "react";
import { usePerps } from "@/hooks/usePerps";
import styles from "./PerpsPanel.module.css";

interface PerpsPanelProps {
  mobile?: boolean;
}

export function PerpsPanel({ mobile = false }: PerpsPanelProps) {
  const {
    playerState,
    closePanel,
    setPair,
    refresh,
  } = usePerps();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
  }, [playerState.currentUrl]);

  useEffect(() => {
    const onLoad = () => setIsLoading(false);
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", onLoad);
    }
    return () => {
      if (iframe) {
        iframe.removeEventListener("load", onLoad);
      }
    };
  }, [playerState.currentUrl]);

  const handleRefresh = () => {
    refresh();
    setIsLoading(true);
  };

  const handlePairChange = (pair: string) => {
    setPair(pair);
    setIsLoading(true);
  };

  const handleOpenInNewTab = () => {
    if (playerState.currentUrl) {
      window.open(playerState.currentUrl, "_blank");
    }
  };

  const availablePairs = [
    { value: "ETH_USDC", label: "ETH/USDC" },
    { value: "BTC_USDC", label: "BTC/USDC" },
    { value: "SOL_USDC", label: "SOL/USDC" },
  ];

  return (
    <div className={`${styles.panel} ${mobile ? styles.mobile : ""}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>📊</span>
          <div>
            <h2 className={styles.title}>Omega Perps</h2>
            <div className={styles.subtitle}>
              {playerState.currentPair.replace("_", "/")} Perpetual
            </div>
          </div>
        </div>
        <div className={styles.headerButtons}>
          <button
            className={styles.headerButton}
            onClick={handleRefresh}
            aria-label="Refresh"
            title="Refresh"
          >
            ⟳
          </button>
          <button
            className={styles.headerButton}
            onClick={handleOpenInNewTab}
            aria-label="Open in new tab"
            title="Open in new tab"
          >
            ⛶
          </button>
          <button
            className={styles.closeButton}
            onClick={closePanel}
            aria-label="Close Perps panel"
          >
            ✕
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Pair Selector */}
        <div className={styles.pairSelector}>
          <div className={styles.pairSelectorLabel}>Trading Pair:</div>
          <div className={styles.pairButtons}>
            {availablePairs.map((pair) => (
              <button
                key={pair.value}
                className={`${styles.pairButton} ${
                  playerState.currentPair === pair.value
                    ? styles.pairButtonActive
                    : ""
                }`}
                onClick={() => handlePairChange(pair.value)}
              >
                {pair.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info Bar */}
        <div className={styles.infoBar}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Pair</div>
            <div className={styles.infoValue}>
              {playerState.currentPair.replace("_", "/")}
            </div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Network</div>
            <div className={styles.infoValue}>Omega</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Type</div>
            <div className={styles.infoValue}>Perpetual</div>
          </div>
        </div>

        {/* Iframe Container */}
        <div className={styles.iframeContainer}>
          {playerState.currentUrl && (
            <iframe
              ref={iframeRef}
              src={playerState.currentUrl}
              className={styles.iframe}
              title="Omega Perps Trading Interface"
              allow="clipboard-read; clipboard-write"
              style={{
                width: "100%",
                height: "100%",
                minHeight: "500px",
              }}
            />
          )}
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <div>Loading Omega Perps...</div>
            </div>
          )}
        </div>

        {/* Risk Warning */}
        <div className={styles.warning}>
          <div className={styles.warningIcon}>⚠️</div>
          <div className={styles.warningText}>
            Perpetual futures trading involves significant risk. Only trade with
            funds you can afford to lose.
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span>ℹ️ Omega Network Perpetual DEX</span>
      </div>
    </div>
  );
}

