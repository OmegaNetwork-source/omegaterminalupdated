"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./PerpsPanel.module.css";
import config from "@/lib/config";

export interface PerpsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pair?: string;
}

/**
 * Sidebar panel rendering Omega Perps trading interface via iframe.
 * Created for Phase 15 integration.
 */
export function PerpsPanel({
  isOpen,
  onClose,
  pair = "ETH_USDC",
}: PerpsPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const url = `${config.PERPS_BASE_URL}/perp/PERP_${pair.toUpperCase()}/`;
    setCurrentUrl(url);
    setIsLoading(true);
  }, [pair]);

  useEffect(() => {
    const onLoad = () => setIsLoading(false);
    const iframe = iframeRef.current;
    if (iframe) iframe.addEventListener("load", onLoad);
    return () => {
      if (iframe) iframe.removeEventListener("load", onLoad);
    };
  }, [currentUrl]);

  if (!isOpen) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#00bcf2" strokeWidth="2" />
            <path d="M6 12h12" stroke="#00bcf2" strokeWidth="2" />
          </svg>
          <span>Omega Perps</span>
        </div>
        <div className={styles.headerButtons}>
          <button
            className={styles.headerBtn}
            onClick={() => iframeRef.current?.contentWindow?.location.reload()}
            title="Refresh"
          >
            ⟳
          </button>
          <button
            className={styles.headerBtn}
            onClick={() => window.open(currentUrl, "_blank")}
            title="Open in new tab"
          >
            ⛶
          </button>
          <button className={styles.headerBtn} onClick={onClose} title="Close">
            ✕
          </button>
        </div>
      </div>
      <div className={styles.infoBar}>
        <div className={styles.infoItem}>
          <div className={styles.infoLabel}>Pair</div>
          <div className={styles.infoValue}>{pair.toUpperCase()}</div>
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
      <div className={styles.iframeContainer}>
        <iframe ref={iframeRef} src={currentUrl} className={styles.iframe} />
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <div>Loading Omega Perps...</div>
          </div>
        )}
      </div>
      <div className={styles.footer}>ℹ️ Omega Network Perpetual DEX</div>
    </div>
  );
}
