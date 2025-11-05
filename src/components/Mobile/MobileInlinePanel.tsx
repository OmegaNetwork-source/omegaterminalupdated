"use client";

/**
 * MobileInlinePanel Component
 * Renders media panels inline within the terminal output on mobile devices
 * This provides a uniform, integrated experience within the terminal
 */

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { usePerps } from "@/hooks/usePerps";
import { useNewsReader } from "@/hooks/useNewsReader";
import { useBluesPlayer } from "@/hooks/useBluesPlayer";
import { useLoFiPlayer } from "@/hooks/useLoFiPlayer";
import { useTechPlayer } from "@/hooks/useTechPlayer";
import { useFunkyPlayer } from "@/hooks/useFunkyPlayer";
import { useOmegaTrancePlayer } from "@/hooks/useOmegaTrancePlayer";
import { useOmegaMelodiesPlayer } from "@/hooks/useOmegaMelodiesPlayer";
import styles from "./MobileInlinePanel.module.css";

// Dynamically import media panels
const SpotifyPanel = dynamic(
  () => import("@/components/Media/SpotifyPanel").then((mod) => ({ default: mod.SpotifyPanel })),
  { ssr: false }
);

const YouTubePanel = dynamic(
  () => import("@/components/Media/YouTubePanel").then((mod) => ({ default: mod.YouTubePanel })),
  { ssr: false }
);

const PerpsPanel = dynamic(
  () => import("@/components/Media/PerpsPanel").then((mod) => ({ default: mod.PerpsPanel })),
  { ssr: false }
);

const NewsReaderPanel = dynamic(
  () => import("@/components/Media/NewsReaderPanel").then((mod) => ({ default: mod.NewsReaderPanel })),
  { ssr: false }
);

const BluesPlayerPanel = dynamic(
  () => import("@/components/Media/BluesPlayerPanel").then((mod) => ({ default: mod.BluesPlayerPanel })),
  { ssr: false }
);

const LoFiPlayerPanel = dynamic(
  () => import("@/components/Media/LoFiPlayerPanel").then((mod) => ({ default: mod.LoFiPlayerPanel })),
  { ssr: false }
);

const TechPlayerPanel = dynamic(
  () => import("@/components/Media/TechPlayerPanel").then((mod) => ({ default: mod.TechPlayerPanel })),
  { ssr: false }
);

const FunkyPlayerPanel = dynamic(
  () => import("@/components/Media/FunkyPlayerPanel").then((mod) => ({ default: mod.FunkyPlayerPanel })),
  { ssr: false }
);

const OmegaTrancePlayerPanel = dynamic(
  () => import("@/components/Media/OmegaTrancePlayerPanel").then((mod) => ({ default: mod.OmegaTrancePlayerPanel })),
  { ssr: false }
);

const OmegaMelodiesPlayerPanel = dynamic(
  () => import("@/components/Media/OmegaMelodiesPlayerPanel").then((mod) => ({ default: mod.OmegaMelodiesPlayerPanel })),
  { ssr: false }
);

type PanelType =
  | "spotify"
  | "youtube"
  | "perps"
  | "news"
  | "blues"
  | "lofi"
  | "tech"
  | "funky"
  | "trance"
  | "melodies"
  | "chart"
  | null;

interface MobileInlinePanelProps {
  onPanelChange?: (isOpen: boolean) => void;
}

export function MobileInlinePanel({ onPanelChange }: MobileInlinePanelProps) {
  const mobile = useMobileDetection();
  const spotify = useSpotify();
  const youtube = useYouTube();
  const perps = usePerps();
  const news = useNewsReader();
  const blues = useBluesPlayer();
  const lofi = useLoFiPlayer();
  const tech = useTechPlayer();
  const funky = useFunkyPlayer();
  const trance = useOmegaTrancePlayer();
  const melodies = useOmegaMelodiesPlayer();
  const panelRef = useRef<HTMLDivElement>(null);
  const [isChartOpen, setIsChartOpen] = useState<boolean>(false);
  const [chartSymbol, setChartSymbol] = useState<string>("BTC");
  const [isTradingViewReady, setIsTradingViewReady] = useState<boolean>(false);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const tradingViewWidgetRef = useRef<any>(null);
  const chartContainerId = `tv-chart-mobile-${Math.random().toString(36).slice(2)}`;

  // Listen for chart open events
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
        window.removeEventListener("omega:openChart", onOpenChart as EventListener);
      };
    }
    return () => {};
  }, []);

  // Determine which panel is open
  const getActivePanel = (): PanelType => {
    if (isChartOpen) return "chart";
    if (spotify.playerState.isPanelOpen) return "spotify";
    if (youtube.playerState.isPanelOpen) return "youtube";
    if (perps.playerState.isPanelOpen) return "perps";
    if (news.readerState.isPanelOpen) return "news";
    if (blues.playerState.isPanelOpen) return "blues";
    if (lofi.playerState.isPanelOpen) return "lofi";
    if (tech.playerState.isPanelOpen) return "tech";
    if (funky.playerState.isPanelOpen) return "funky";
    if (trance.playerState.isPanelOpen) return "trance";
    if (melodies.playerState.isPanelOpen) return "melodies";
    return null;
  };

  const activePanel = getActivePanel();
  const isOpen = activePanel !== null;

  // Notify parent of panel state changes
  useEffect(() => {
    onPanelChange?.(isOpen);
  }, [isOpen, onPanelChange]);

  // Scroll panel into view when it opens
  useEffect(() => {
    if (isOpen && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [isOpen, activePanel]);

  // Initialize TradingView chart when ready
  useEffect(() => {
    if (!isChartOpen || !isTradingViewReady || !chartContainerRef.current) return;

    const createWidget = () => {
      try {
        const TradingView = (window as any).TradingView;
        if (!TradingView || !TradingView.widget) return;

        if (tradingViewWidgetRef.current) {
          tradingViewWidgetRef.current.remove();
        }

        tradingViewWidgetRef.current = new TradingView.widget({
          autosize: true,
          symbol: chartSymbol,
          interval: "D",
          container_id: chartContainerId,
          datafeed: undefined,
          library_path: "/charting_library/",
          locale: "en",
          disabled_features: ["use_localstorage_for_settings", "volume_force_overlay"],
          enabled_features: ["study_templates"],
          charts_storage_url: "https://saveload.tradingview.com",
          charts_storage_api_version: "1.1",
          client_id: "tradingview.com",
          user_id: "public_user_id",
          fullscreen: false,
          autosize: true,
          theme: "dark",
        });

        return true;
      } catch (error) {
        console.error("[Chart] Failed to create TradingView widget:", error);
        return false;
      }
    };

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

  // Get panel title
  const getPanelTitle = (panel: PanelType): string => {
    const titles: Record<string, string> = {
      spotify: "Spotify",
      youtube: "YouTube",
      perps: "Perps Trading",
      news: "News Reader",
      blues: "Blues Player",
      lofi: "Lo-Fi Player",
      tech: "Tech Player",
      funky: "Funky Player",
      trance: "Omega Trance",
      melodies: "Omega Melodies",
      chart: `Chart: ${chartSymbol}`,
    };
    return titles[panel || ""] || "Panel";
  };

  // Close handler
  const handleClose = () => {
    switch (activePanel) {
      case "chart":
        setIsChartOpen(false);
        if (tradingViewWidgetRef.current) {
          try {
            tradingViewWidgetRef.current.remove?.();
          } catch (e) {
            // Ignore cleanup errors
          }
          tradingViewWidgetRef.current = null;
        }
        break;
      case "spotify":
        spotify.closePanel();
        break;
      case "youtube":
        youtube.closePanel();
        break;
      case "perps":
        perps.closePanel();
        break;
      case "news":
        news.closePanel();
        break;
      case "blues":
        blues.closePanel();
        break;
      case "lofi":
        lofi.closePanel();
        break;
      case "tech":
        tech.closePanel();
        break;
      case "funky":
        funky.closePanel();
        break;
      case "trance":
        trance.closePanel();
        break;
      case "melodies":
        melodies.closePanel();
        break;
    }
  };

  // Only render on mobile
  if (!mobile.isMobile || !isOpen) {
    return null;
  }

  return (
    <div ref={panelRef} className={styles.inlinePanel} data-panel-type={activePanel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>{getPanelTitle(activePanel)}</h3>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close panel"
          type="button"
        >
          ✕
        </button>
      </div>
      <div className={styles.panelContent}>
        {activePanel === "chart" && (
          <>
            <Script
              src="https://s3.tradingview.com/tv.js"
              strategy="afterInteractive"
              onLoad={() => {
                setIsTradingViewReady(true);
              }}
            />
            <div
              ref={chartContainerRef}
              id={chartContainerId}
              className={styles.chartContainer}
            />
          </>
        )}
        {activePanel === "spotify" && <SpotifyPanel mobile />}
        {activePanel === "youtube" && <YouTubePanel mobile />}
        {activePanel === "perps" && <PerpsPanel mobile />}
        {activePanel === "news" && <NewsReaderPanel mobile />}
        {activePanel === "blues" && <BluesPlayerPanel mobile />}
        {activePanel === "lofi" && <LoFiPlayerPanel mobile />}
        {activePanel === "tech" && <TechPlayerPanel mobile />}
        {activePanel === "funky" && <FunkyPlayerPanel mobile />}
        {activePanel === "trance" && <OmegaTrancePlayerPanel mobile />}
        {activePanel === "melodies" && <OmegaMelodiesPlayerPanel mobile />}
      </div>
    </div>
  );
}

