"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Script from "next/script";
import dynamic from "next/dynamic";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { useNewsReader } from "@/hooks/useNewsReader";
import { useBluesPlayer } from "@/hooks/useBluesPlayer";
import { useLoFiPlayer } from "@/hooks/useLoFiPlayer";
import { useTechPlayer } from "@/hooks/useTechPlayer";
import { useFunkyPlayer } from "@/hooks/useFunkyPlayer";
import styles from "./DashboardStatsPanel.module.css";

// Dynamically import media panels (heavy external SDKs)
const SpotifyPanel = dynamic(
  () => import("@/components/Media/SpotifyPanel").then((mod) => ({ default: mod.SpotifyPanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading Spotify...</div> }
);

const YouTubePanel = dynamic(
  () => import("@/components/Media/YouTubePanel").then((mod) => ({ default: mod.YouTubePanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading YouTube...</div> }
);

const NewsReaderPanel = dynamic(
  () => import("@/components/Media/NewsReaderPanel").then((mod) => ({ default: mod.NewsReaderPanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading News Reader...</div> }
);

const BluesPlayerPanel = dynamic(
  () => import("@/components/Media/BluesPlayerPanel").then((mod) => ({ default: mod.BluesPlayerPanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading Blues Player...</div> }
);

const LoFiPlayerPanel = dynamic(
  () => import("@/components/Media/LoFiPlayerPanel").then((mod) => ({ default: mod.LoFiPlayerPanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading Lo-Fi Player...</div> }
);

const TechPlayerPanel = dynamic(
  () => import("@/components/Media/TechPlayerPanel").then((mod) => ({ default: mod.TechPlayerPanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading Tech Player...</div> }
);

const FunkyPlayerPanel = dynamic(
  () => import("@/components/Media/FunkyPlayerPanel").then((mod) => ({ default: mod.FunkyPlayerPanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading Funky Player...</div> }
);

type TradingViewWidget = {
  remove?: () => void;
};

/**
 * DashboardStatsPanel
 * Side panel for charts and media players.
 */
export function DashboardStatsPanel(): JSX.Element {
  const spotify = useSpotify();
  const youtube = useYouTube();
  const newsReader = useNewsReader();
  const bluesPlayer = useBluesPlayer();
  const lofiPlayer = useLoFiPlayer();
  const techPlayer = useTechPlayer();
  const funkyPlayer = useFunkyPlayer();

  const [isChartOpen, setIsChartOpen] = useState<boolean>(false);
  const [chartSymbol, setChartSymbol] = useState<string>("—");
  const [isTradingViewReady, setIsTradingViewReady] = useState<boolean>(false);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const tradingViewWidgetRef = useRef<TradingViewWidget | null>(null);
  const tradingViewScriptLoadedRef = useRef<boolean>(false);
  const chartContainerId = useMemo(
    () => `tv-chart-${Math.random().toString(36).slice(2)}`,
    []
  );

  useEffect(() => {
    if (!isChartOpen && tradingViewWidgetRef.current) {
      tradingViewWidgetRef.current.remove?.();
      tradingViewWidgetRef.current = null;
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = "";
      }
    }
  }, [isChartOpen]);

  // Create widget when chart opens and everything is ready
  useEffect(() => {
    if (!isChartOpen || !isTradingViewReady) {
      return;
    }

    // Function to create the widget
    const createWidget = () => {
      // Check for TradingView in window
      const tv = (window as typeof window & {
        TradingView?: {
          widget?: new (config: Record<string, unknown>) => TradingViewWidget;
        };
      }).TradingView;

      // Verify TradingView and widget constructor exist
      if (!tv || !tv.widget) {
        console.warn("[Chart] TradingView widget API not available", { 
          hasTradingView: !!tv, 
          hasWidget: !!(tv && tv.widget) 
        });
        return false;
      }

      // Ensure container exists and has the correct ID
      if (!chartContainerRef.current) {
        console.warn("[Chart] Chart container ref not found");
        return false;
      }

      // Verify the container element exists in DOM
      const containerElement = document.getElementById(chartContainerId);
      if (!containerElement) {
        console.warn(`[Chart] Container element with ID ${chartContainerId} not found in DOM`);
        return false;
      }

      // Verify container is visible
      if (containerElement.offsetWidth === 0 || containerElement.offsetHeight === 0) {
        console.warn("[Chart] Container element has zero dimensions");
        return false;
      }

      // Clean up existing widget
      if (tradingViewWidgetRef.current) {
        try {
          tradingViewWidgetRef.current.remove?.();
        } catch (e) {
          console.warn("[Chart] Error removing existing widget:", e);
        }
        tradingViewWidgetRef.current = null;
      }

      // Clear container innerHTML to ensure clean slate
      containerElement.innerHTML = "";

      try {
        console.log(`[Chart] Creating TradingView widget for ${chartSymbol}`);
        console.log(`[Chart] Container ID: ${chartContainerId}`);
        console.log(`[Chart] Container dimensions: ${containerElement.offsetWidth}x${containerElement.offsetHeight}`);
        
        // Use 'new' keyword to instantiate TradingView widget
        tradingViewWidgetRef.current = new tv.widget({
          symbol: chartSymbol,
          container_id: chartContainerId,
          autosize: true,
          theme: "dark",
          height: 500,
          width: "100%",
          interval: "D",
          locale: "en",
          toolbar_bg: "#1a1a2e",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          studies_overrides: {},
        });
        
        console.log(`[Chart] TradingView widget created successfully for ${chartSymbol}`);
        return true;
      } catch (error) {
        console.error("[Chart] Failed to create TradingView widget:", error);
        return false;
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (isChartOpen) {
        createWidget();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (tradingViewWidgetRef.current) {
        try {
          tradingViewWidgetRef.current.remove?.();
        } catch (e) {
          // Ignore cleanup errors
        }
        tradingViewWidgetRef.current = null;
      }
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

  return (
    <aside className={styles.statsPanel}>
      {/* TradingView Script - Load once, use many times */}
      <Script
        src="https://s3.tradingview.com/tv.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("[Chart] TradingView script loaded");
          tradingViewScriptLoadedRef.current = true;
          
                // Poll for TradingView.widget to be available
                const checkInterval = setInterval(() => {
                  const tv = (window as typeof window & {
                    TradingView?: {
                      widget?: new (config: Record<string, unknown>) => TradingViewWidget;
                    };
                  }).TradingView;
                  
                  if (tv && tv.widget) {
                    console.log("[Chart] TradingView widget API confirmed ready");
                    setIsTradingViewReady(true);
                    clearInterval(checkInterval);
                  }
                }, 100);
                
                // Timeout after 10 seconds
                const timeout = setTimeout(() => {
                  clearInterval(checkInterval);
                  const tv = (window as typeof window & {
                    TradingView?: {
                      widget?: new (config: Record<string, unknown>) => TradingViewWidget;
                    };
                  }).TradingView;
                  if (!tv || !tv.widget) {
                    console.warn("[Chart] TradingView widget API not available after timeout");
                  } else {
                    console.log("[Chart] TradingView widget API ready (after timeout check)");
                  }
                  // Set ready to allow widget creation attempt
                  setIsTradingViewReady(true);
                }, 10000);
        }}
        onError={(e) => {
          console.error("[Chart] Failed to load TradingView script:", e);
          setIsTradingViewReady(true); // Set ready to prevent blocking UI
        }}
      />

      {/* Chart Panel - visibility controlled via omega:openChart events */}
      {isChartOpen && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Chart Viewer</div>
          <div className={styles.chartPanel}>
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
      )}

      {/* Spotify Panel - inside stats panel like chart viewer */}
      {spotify.playerState.isPanelOpen && (
        <section className={`${styles.section} ${styles.mediaSection}`}>
          <div className={styles.mediaPanelWrapper}>
            <Suspense fallback={<div className={styles.panelLoading}>Loading Spotify...</div>}>
              <SpotifyPanel />
            </Suspense>
          </div>
        </section>
      )}

      {/* YouTube Panel - inside stats panel like chart viewer */}
      {youtube.playerState.isPanelOpen && (
        <section className={`${styles.section} ${styles.mediaSection}`}>
          <div className={styles.mediaPanelWrapper}>
            <Suspense fallback={<div className={styles.panelLoading}>Loading YouTube...</div>}>
              <YouTubePanel />
            </Suspense>
          </div>
        </section>
      )}

      {/* News Reader Panel - inside stats panel like chart viewer */}
      {newsReader.readerState.isPanelOpen && (
        <section className={`${styles.section} ${styles.mediaSection}`}>
          <div className={styles.mediaPanelWrapper}>
            <Suspense fallback={<div className={styles.panelLoading}>Loading News...</div>}>
              <NewsReaderPanel />
            </Suspense>
          </div>
        </section>
      )}

      {/* Blues Player Panel - inside stats panel like chart viewer */}
      {bluesPlayer.playerState.isPanelOpen && (
        <section className={`${styles.section} ${styles.mediaSection}`}>
          <div className={styles.mediaPanelWrapper}>
            <Suspense fallback={<div className={styles.panelLoading}>Loading Blues Player...</div>}>
              <BluesPlayerPanel />
            </Suspense>
          </div>
        </section>
      )}

      {/* Lo-Fi Player Panel - inside stats panel like chart viewer */}
      {lofiPlayer.playerState.isPanelOpen && (
        <section className={`${styles.section} ${styles.mediaSection}`}>
          <div className={styles.mediaPanelWrapper}>
            <Suspense fallback={<div className={styles.panelLoading}>Loading Lo-Fi Player...</div>}>
              <LoFiPlayerPanel />
            </Suspense>
          </div>
        </section>
      )}

      {/* Tech Player Panel - inside stats panel like chart viewer */}
      {techPlayer.playerState.isPanelOpen && (
        <section className={`${styles.section} ${styles.mediaSection}`}>
          <div className={styles.mediaPanelWrapper}>
            <Suspense fallback={<div className={styles.panelLoading}>Loading Tech Player...</div>}>
              <TechPlayerPanel />
            </Suspense>
          </div>
        </section>
      )}

      {/* Funky Player Panel - inside stats panel like chart viewer */}
      {funkyPlayer.playerState.isPanelOpen && (
        <section className={`${styles.section} ${styles.mediaSection}`}>
          <div className={styles.mediaPanelWrapper}>
            <Suspense fallback={<div className={styles.panelLoading}>Loading Funky Player...</div>}>
              <FunkyPlayerPanel />
            </Suspense>
          </div>
        </section>
      )}
    </aside>
  );
}

export default DashboardStatsPanel;
