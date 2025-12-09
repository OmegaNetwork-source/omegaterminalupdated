"use client";

import React, { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
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
import styles from "./MobileStatsPanel.module.css";

// Dynamically import media panels (heavy external SDKs)
const SpotifyPanel = dynamic(
  () => import("@/components/Media/SpotifyPanel").then((mod) => ({ default: mod.SpotifyPanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading Spotify...</div> }
);

const YouTubePanel = dynamic(
  () => import("@/components/Media/YouTubePanel").then((mod) => ({ default: mod.YouTubePanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading YouTube...</div> }
);

const PerpsPanel = dynamic(
  () => import("@/components/Media/PerpsPanel").then((mod) => ({ default: mod.PerpsPanel })),
  { ssr: false, loading: () => <div className={styles.panelLoading}>Loading Perps...</div> }
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
  | null;

/**
 * MobileStatsPanel Component
 * Full-screen overlay for media players and stats on mobile devices
 */
export function MobileStatsPanel() {
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
  
  // On mobile, panels now show inline in terminal output instead of full-screen overlay
  // This component is kept for backward compatibility but disabled on mobile
  if (mobile.isMobile) {
    return null;
  }

  // Determine which panel is open
  const getActivePanel = useCallback((): PanelType => {
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
  }, [
    spotify.playerState.isPanelOpen,
    youtube.playerState.isPanelOpen,
    perps.playerState.isPanelOpen,
    news.readerState.isPanelOpen,
    blues.playerState.isPanelOpen,
    lofi.playerState.isPanelOpen,
    tech.playerState.isPanelOpen,
    funky.playerState.isPanelOpen,
    trance.playerState.isPanelOpen,
    melodies.playerState.isPanelOpen,
  ]);

  const activePanel = getActivePanel();
  const isOpen = activePanel !== null;

  // Close handler
  const handleClose = useCallback(() => {
    switch (activePanel) {
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
  }, [
    activePanel,
    spotify,
    youtube,
    perps,
    news,
    blues,
    lofi,
    tech,
    funky,
    trance,
    melodies,
  ]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Get panel title
  const getPanelTitle = useCallback((panel: PanelType): string => {
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
    };
    return titles[panel || ""] || "Panel";
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close panel"
      />

      {/* Panel */}
      <div
        className={`${styles.panel} ${isOpen ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={getPanelTitle(activePanel)}
      >
        <header className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{getPanelTitle(activePanel)}</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close panel"
            type="button"
          >
            ✕
          </button>
        </header>

        <div className={styles.panelContent}>
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
    </>
  );
}

