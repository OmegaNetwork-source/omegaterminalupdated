"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Script from "next/script";
import dynamic from "next/dynamic";
import { usePerps } from "@/hooks/usePerps";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { useNewsReader } from "@/hooks/useNewsReader";
import { useBluesPlayer } from "@/hooks/useBluesPlayer";
import { useLoFiPlayer } from "@/hooks/useLoFiPlayer";
import { useTechPlayer } from "@/hooks/useTechPlayer";
import { useFunkyPlayer } from "@/hooks/useFunkyPlayer";
import { useOmegaTrancePlayer } from "@/hooks/useOmegaTrancePlayer";
import { useOmegaMelodiesPlayer } from "@/hooks/useOmegaMelodiesPlayer";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { MobileStatsPanel } from "@/components/Mobile/MobileStatsPanel";
import Cubes, { CubesRef } from "@/components/Background/Cubes";
import { SystemOverview } from "./SystemOverview";
import styles from "./DashboardStatsPanel.module.css";

// Dynamically import media panels (heavy external SDKs)
const PerpsPanel = dynamic(
  () => import("@/components/Media/PerpsPanel").then((mod) => ({ default: mod.PerpsPanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading Perps...</div> }
);

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

const OmegaTrancePlayerPanel = dynamic(
  () => import("@/components/Media/OmegaTrancePlayerPanel").then((mod) => ({ default: mod.OmegaTrancePlayerPanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading Trance Player...</div> }
);

const OmegaMelodiesPlayerPanel = dynamic(
  () => import("@/components/Media/OmegaMelodiesPlayerPanel").then((mod) => ({ default: mod.OmegaMelodiesPlayerPanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading Melodies Player...</div> }
);

type TradingViewWidget = {
  remove?: () => void;
};

/**
 * DashboardStatsPanel
 * Side panel for charts and media players.
 */
export function DashboardStatsPanel(): JSX.Element | null {
  const mobile = useMobileDetection();
  
  // On mobile, don't render the sidebar - panels will show inline in terminal
  if (mobile.isMobile) {
    return null;
  }
  
  const perps = usePerps();
  const spotify = useSpotify();
  const youtube = useYouTube();
  const newsReader = useNewsReader();
  const bluesPlayer = useBluesPlayer();
  const lofiPlayer = useLoFiPlayer();
  const techPlayer = useTechPlayer();
  const funkyPlayer = useFunkyPlayer();
  const trancePlayer = useOmegaTrancePlayer();
  const melodiesPlayer = useOmegaMelodiesPlayer();

  const [isChartOpen, setIsChartOpen] = useState<boolean>(false);
  const [chartSymbol, setChartSymbol] = useState<string>("—");
  const [isTradingViewReady, setIsTradingViewReady] = useState<boolean>(false);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const tradingViewWidgetRef = useRef<TradingViewWidget | null>(null);
  const tradingViewScriptLoadedRef = useRef<boolean>(false);
  const cubesRef = useRef<CubesRef | null>(null);
  const chartContainerId = useMemo(
    () => `tv-chart-${Math.random().toString(36).slice(2)}`,
    []
  );

  // Track previous panel states to detect new components
  const prevPanelStatesRef = useRef({
    chart: false,
    perps: false,
    spotify: false,
    youtube: false,
    newsReader: false,
    bluesPlayer: false,
    lofiPlayer: false,
    techPlayer: false,
    funkyPlayer: false,
    trancePlayer: false,
    melodiesPlayer: false
  });

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
        // When using autosize, don't set explicit height/width - let it fill container
        tradingViewWidgetRef.current = new tv.widget({
          symbol: chartSymbol,
          container_id: chartContainerId,
          autosize: true,
          theme: "dark",
          interval: "D",
          locale: "en",
          toolbar_bg: "rgba(0, 0, 0, 0.3)", // Match panel background
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          studies_overrides: {},
          backgroundColor: "rgba(0, 0, 0, 0.4)", // Match container background
          // Don't set height/width when autosize is true - let it fill container naturally
        });
        
        console.log(`[Chart] TradingView widget created successfully for ${chartSymbol}`);
        return true;
      } catch (error) {
        console.error("[Chart] Failed to create TradingView widget:", error);
        return false;
      }
    };

    // Small delay to ensure DOM is ready and container has dimensions
    const timer = setTimeout(() => {
      if (isChartOpen && chartContainerRef.current) {
        // Force a reflow to ensure dimensions are calculated
        void chartContainerRef.current.offsetHeight;
        const created = createWidget();
        
        // If widget was created, wait a bit more for it to fully initialize
        if (created && tradingViewWidgetRef.current) {
          // Additional delay to let TradingView widget fully render and size itself
          setTimeout(() => {
            // Force a resize event to ensure widget sizes correctly
            if (chartContainerRef.current) {
              const resizeEvent = new Event('resize');
              window.dispatchEvent(resizeEvent);
            }
          }, 300);
        }
      }
    }, 150);

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

  // Detect when new components enter the panel and trigger pulse animation
  useEffect(() => {
    const currentStates = {
      chart: isChartOpen,
      perps: perps.playerState.isPanelOpen,
      spotify: spotify.playerState.isPanelOpen,
      youtube: youtube.playerState.isPanelOpen,
      newsReader: newsReader.readerState.isPanelOpen,
      bluesPlayer: bluesPlayer.playerState.isPanelOpen,
      lofiPlayer: lofiPlayer.playerState.isPanelOpen,
      techPlayer: techPlayer.playerState.isPanelOpen,
      funkyPlayer: funkyPlayer.playerState.isPanelOpen,
      trancePlayer: trancePlayer.playerState.isPanelOpen,
      melodiesPlayer: melodiesPlayer.playerState.isPanelOpen
    };

    // Check if any panel just opened (was false, now true)
    const panels = Object.keys(currentStates) as Array<keyof typeof currentStates>;
    const newPanelOpened = panels.some(
      panel => !prevPanelStatesRef.current[panel] && currentStates[panel]
    );

    if (newPanelOpened && cubesRef.current) {
      // Trigger pulse animation with a slight delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        cubesRef.current?.pulse({
          intensity: 1.2,
          duration: 1.0,
          origin: { row: 4, col: 4 } // Center of 8x8 grid
        });
      }, 100);

      // Update previous states
      prevPanelStatesRef.current = { ...currentStates };

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      // Update previous states even if no new panel opened
      prevPanelStatesRef.current = { ...currentStates };
    }
  }, [
    isChartOpen,
    perps.playerState.isPanelOpen,
    spotify.playerState.isPanelOpen,
    youtube.playerState.isPanelOpen,
    newsReader.readerState.isPanelOpen,
    bluesPlayer.playerState.isPanelOpen,
    lofiPlayer.playerState.isPanelOpen,
    techPlayer.playerState.isPanelOpen,
    funkyPlayer.playerState.isPanelOpen,
    trancePlayer.playerState.isPanelOpen,
    melodiesPlayer.playerState.isPanelOpen
  ]);

  return (
    <aside className={styles.statsPanel}>
      {/* Animated Cubes Background Effect */}
      <Cubes
        ref={cubesRef}
        gridSize={8}
        maxAngle={25}
        radius={2.5}
        duration={{ enter: 0.3, leave: 0.6 }}
        cellGap={4}
        borderStyle="1px solid var(--palette-border, rgba(0, 188, 242, 0.2))"
        faceColor="var(--palette-surface, rgba(6, 0, 16, 0.4))"
        shadow={false}
        autoAnimate={true}
        rippleOnClick={true}
        rippleColor="var(--palette-primary, #00bcf2)"
        rippleSpeed={2}
        className={styles.cubesBackground}
      />

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
          <div className={styles.chartPanel}>
            <div className={styles.chartHeader}>
              <div className={styles.chartHeaderLeft}>
                <svg
                  className={styles.chartIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 6 13.5 14.5 8.5 9.5 2 16" />
                  <polyline points="16 6 22 6 22 12" />
                </svg>
                <span className={styles.chartSymbol}>{chartSymbol}</span>
              </div>
              <button
                className={styles.chartCloseButton}
                aria-label="Close Chart"
                onClick={() => setIsChartOpen(false)}
                type="button"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.chartCloseIcon}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
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

      {/* Perps Panel - inside stats panel like chart viewer */}
      {perps.playerState.isPanelOpen && (
        <section className={`${styles.section} ${styles.mediaSection}`}>
          <div className={styles.mediaPanelWrapper}>
            <Suspense fallback={<div className={styles.panelLoading}>Loading Perps...</div>}>
              <PerpsPanel />
            </Suspense>
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

      {/* Omega Trance Player Panel - inside stats panel like chart viewer */}
      {trancePlayer.playerState.isPanelOpen && (
        <section className={`${styles.section} ${styles.mediaSection}`}>
          <div className={styles.mediaPanelWrapper}>
            <Suspense fallback={<div className={styles.panelLoading}>Loading Trance Player...</div>}>
              <OmegaTrancePlayerPanel />
            </Suspense>
          </div>
        </section>
      )}

      {/* Omega Melodies Player Panel - inside stats panel like chart viewer */}
      {melodiesPlayer.playerState.isPanelOpen && (
        <section className={`${styles.section} ${styles.mediaSection}`}>
          <div className={styles.mediaPanelWrapper}>
            <Suspense fallback={<div className={styles.panelLoading}>Loading Melodies Player...</div>}>
              <OmegaMelodiesPlayerPanel />
            </Suspense>
          </div>
        </section>
      )}

      {/* System Overview - shown when no panels are open */}
      {!isChartOpen &&
        !perps.playerState.isPanelOpen &&
        !spotify.playerState.isPanelOpen &&
        !youtube.playerState.isPanelOpen &&
        !newsReader.readerState.isPanelOpen &&
        !bluesPlayer.playerState.isPanelOpen &&
        !lofiPlayer.playerState.isPanelOpen &&
        !techPlayer.playerState.isPanelOpen &&
        !funkyPlayer.playerState.isPanelOpen &&
        !trancePlayer.playerState.isPanelOpen &&
        !melodiesPlayer.playerState.isPanelOpen && (
          <SystemOverview />
        )}
    </aside>
  );
}

export default DashboardStatsPanel;
