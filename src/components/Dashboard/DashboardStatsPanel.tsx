"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { useWallet } from "@/hooks/useWallet";
import { useCommandExecution } from "@/hooks/useCommandExecution";
import styles from "./DashboardStatsPanel.module.css";

type TradingViewWidget = {
  remove?: () => void;
};

/**
 * DashboardStatsPanel
 * System monitoring side panel with connection, uptime, and activity log.
 */
export function DashboardStatsPanel(): JSX.Element {
  const { state: walletState } = useWallet();
  const { terminalLines } = useCommandExecution();

  const [uptime, setUptime] = useState<number>(0);
  const [isChartOpen, setIsChartOpen] = useState<boolean>(false);
  const [chartSymbol, setChartSymbol] = useState<string>("—");
  const [isTradingViewReady, setIsTradingViewReady] = useState<boolean>(false);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const tradingViewWidgetRef = useRef<TradingViewWidget | null>(null);
  const chartContainerId = useMemo(
    () => `tv-chart-${Math.random().toString(36).slice(2)}`,
    []
  );

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(
      () => setUptime(Math.floor((Date.now() - start) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isChartOpen && tradingViewWidgetRef.current) {
      tradingViewWidgetRef.current.remove?.();
      tradingViewWidgetRef.current = null;
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = "";
      }
    }
  }, [isChartOpen]);

  useEffect(() => {
    if (!isChartOpen || !isTradingViewReady) {
      return;
    }

    const tv = (
      window as typeof window & {
        TradingView?: {
          widget?: (config: Record<string, unknown>) => TradingViewWidget;
        };
      }
    ).TradingView;

    if (!tv?.widget || !chartContainerRef.current) {
      return;
    }

    tradingViewWidgetRef.current?.remove?.();

    tradingViewWidgetRef.current = tv.widget({
      symbol: chartSymbol,
      container_id: chartContainerId,
      autosize: true,
      theme: "dark",
    });

    return () => {
      tradingViewWidgetRef.current?.remove?.();
      tradingViewWidgetRef.current = null;
    };
  }, [chartSymbol, chartContainerId, isChartOpen, isTradingViewReady]);

  // Subscribe to chart open events from command execution
  useEffect(() => {
    function onOpenChart(e: Event) {
      const ev = e as CustomEvent<{ symbol?: string }>;
      const symbol = (ev.detail?.symbol || "BTC").toUpperCase();
      setChartSymbol(symbol);
      setIsChartOpen(true);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("omega:openChart", onOpenChart as EventListener);
      return () => {
        window.removeEventListener(
          "omega:openChart",
          onOpenChart as EventListener
        );
      };
    }
    return () => {};
  }, []);

  const recentCommands = useMemo(() => {
    return terminalLines
      .filter((l) => l.type === "command")
      .slice(-10)
      .map((l) => l.content);
  }, [terminalLines]);

  const formatUptime = (secs: number): string => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <aside className={styles.statsPanel}>
      <div className={styles.header}>SYSTEM MONITORING</div>

      {/* Connection Status */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Connection Status</div>
        <div className={styles.sectionContent}>
          <div className={styles.statItem}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                className={`${styles.statusIndicator} ${
                  walletState.isConnected
                    ? styles.statusConnected
                    : styles.statusDisconnected
                }`}
              />
              <span>
                {walletState.isConnected ? "CONNECTED" : "DISCONNECTED"} • Omega
                Network
              </span>
            </div>
            <div className={styles.statValue}>
              {walletState.isConnected && walletState.address
                ? `${walletState.address.slice(
                    0,
                    6
                  )}…${walletState.address.slice(-4)}`
                : ""}
            </div>
          </div>
        </div>
      </section>

      {/* System Stats */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>System Stats</div>
        <div className={styles.sectionContent}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Uptime</div>
            <div className={styles.statValue}>{formatUptime(uptime)}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Commands Executed</div>
            <div className={styles.statValue}>
              {terminalLines.filter((l) => l.type === "command").length}
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Active Sessions</div>
            <div className={styles.statValue}>1</div>
          </div>
        </div>
      </section>

      {/* Activity Log */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Activity Log</div>
        <div className={`${styles.sectionContent} ${styles.activityLog}`}>
          {recentCommands.length === 0 && (
            <div className={styles.activityEntry}>No recent commands</div>
          )}
          {recentCommands.map((c, idx) => (
            <div key={`${c}-${idx}`} className={styles.activityEntry}>
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* Chart Panel - visibility controlled via omega:openChart events */}
      {
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Chart Viewer</div>
          <div
            className={styles.chartPanel}
            style={{ display: isChartOpen ? "block" : "none" }}
          >
            {isChartOpen && (
              <Script
                src="https://s3.tradingview.com/tv.js"
                strategy="lazyOnload"
                onLoad={() => setIsTradingViewReady(true)}
              />
            )}
            <div className={styles.chartHeader}>
              <span className={styles.chartSymbol}>Symbol: {chartSymbol}</span>
              <button
                className={styles.closeButton}
                aria-label="Close Chart"
                onClick={() => setIsChartOpen(false)}
              >
                ✕
              </button>
            </div>
            <div
              ref={chartContainerRef}
              id={chartContainerId}
              className={styles.chartContainer}
            />
          </div>
        </section>
      }
    </aside>
  );
}

export default DashboardStatsPanel;
