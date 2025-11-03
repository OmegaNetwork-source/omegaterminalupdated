"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTerminal } from "@/providers/TerminalProvider";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { useNewsReader } from "@/hooks/useNewsReader";
import { useWallet } from "@/hooks/useWallet";
import { useViewMode } from "@/hooks/useViewMode";
import { useTheme } from "@/hooks/useTheme";
import { useCustomizer } from "@/hooks/useCustomizer";
import styles from "./DashboardSidebar.module.css";

// Progressive disclosure: load complex section content only when the user expands it.
const SectionSkeleton = (): JSX.Element => (
  <div className={styles.sectionSkeleton}>
    <div className={styles.sectionSkeletonBar} />
    <div className={styles.sectionSkeletonBar} />
    <div className={styles.sectionSkeletonBar} />
  </div>
);

const TradingAnalyticsSection = dynamic(
  () =>
    import("./sidebar-sections/TradingAnalyticsSection").then((mod) => ({
      default: mod.TradingAnalyticsSection,
    })),
  {
    ssr: false,
    loading: SectionSkeleton,
  }
);

const NftExplorerSection = dynamic(
  () =>
    import("./sidebar-sections/NftExplorerSection").then((mod) => ({
      default: mod.NftExplorerSection,
    })),
  {
    ssr: false,
    loading: SectionSkeleton,
  }
);

const ChainGptToolsSection = dynamic(
  () =>
    import("./sidebar-sections/ChainGptToolsSection").then((mod) => ({
      default: mod.ChainGptToolsSection,
    })),
  {
    ssr: false,
    loading: SectionSkeleton,
  }
);

const NetworkSection = dynamic(
  () =>
    import("./sidebar-sections/NetworkSection").then((mod) => ({
      default: mod.NetworkSection,
    })),
  {
    ssr: false,
    loading: SectionSkeleton,
  }
);

const YouTubePlayerSection = dynamic(
  () =>
    import("./sidebar-sections/YouTubePlayerSection").then((mod) => ({
      default: mod.YouTubePlayerSection,
    })),
  {
    ssr: false,
    loading: SectionSkeleton,
  }
);

/**
 * DashboardSidebar
 * Collapsible sidebar with quick actions and command shortcuts.
 */
export function DashboardSidebar(): JSX.Element {
  const {
    executeCommand,
    commandsInitialized,
    isCommandAvailable,
    aiProvider,
    setAiProvider,
  } = useTerminal();
  const spotify = useSpotify();
  const youtube = useYouTube();
  const news = useNewsReader();
  const wallet = useWallet();
  const viewMode = useViewMode();
  const theme = useTheme();
  const customizer = useCustomizer();

  const [isHydrated, setIsHydrated] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["quick"]);

  useEffect(() => {
    setIsHydrated(true);

    try {
      const saved = localStorage.getItem("omega-minimized-sections");
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed)) {
          setExpandedSections(parsed);
          return;
        }
        return;
      }
    } catch {}
    setExpandedSections(["quick", "news"]);
  }, []);

  const persistSections = useCallback((next: Set<string>) => {
    try {
      localStorage.setItem(
        "omega-minimized-sections",
        JSON.stringify(Array.from(next))
      );
    } catch {}
  }, []);

  const handleSectionToggle = useCallback(
    (sectionId: string) => {
      setExpandedSections((prev) => {
        const current = new Set(prev);
        if (current.has(sectionId)) {
          current.delete(sectionId);
        } else {
          current.add(sectionId);
        }
        persistSections(current);
        return Array.from(current);
      });
    },
    [persistSections]
  );

  const handleCommandClick = useCallback(
    (cmd: string) => {
      console.log("🔘 Sidebar button clicked:", cmd);
      void executeCommand(cmd);
    },
    [executeCommand]
  );

  // Special handlers for actions that don't use commands
  const handleConnectWallet = useCallback(() => {
    // Execute connect command, which handles everything internally
    void executeCommand("connect");
  }, [executeCommand]);

  const handleToggleView = useCallback(() => {
    viewMode.toggleViewMode();
  }, [viewMode]);

  const handleCycleTheme = useCallback(() => {
    theme.toggleTheme();
  }, [theme]);

  const handleCyclePalette = useCallback(() => {
    customizer.cycleColorPalette();
  }, [customizer]);

  const handleSetColorPalette = useCallback(
    (palette: string) => {
      customizer.setColorPalette(palette as any);
    },
    [customizer]
  );

  const handleSetTheme = useCallback(
    (themeName: string) => {
      // The theme hook might not have a setTheme method, so we'll use the command
      void executeCommand(`theme ${themeName}`);
    },
    [executeCommand]
  );

  const handleToggleAI = useCallback(() => {
    // Cycle through AI providers: off -> near -> openai -> off
    // Matches vanilla js/futuristic/futuristic-dashboard-transform.js toggleAI function
    const providers = ["off", "near", "openai"] as const;
    const currentIndex = providers.indexOf(aiProvider as any);
    const nextIndex = (currentIndex + 1) % providers.length;
    const nextProvider = providers[nextIndex];
    setAiProvider(nextProvider);
  }, [aiProvider, setAiProvider]);

  const renderCommandButton = useCallback(
    (label: string, cmd: string) => {
      const available = commandsInitialized && isCommandAvailable(cmd);
      const title = available
        ? undefined
        : commandsInitialized
        ? "Command unavailable in this build."
        : "Command system not ready yet.";

      return (
        <button
          className={`${styles.button} ${
            available ? "" : styles.buttonDisabled
          }`}
          onClick={() => handleCommandClick(cmd)}
          disabled={!available}
          title={title}
          aria-disabled={!available}
        >
          {label}
        </button>
      );
    },
    [commandsInitialized, handleCommandClick, isCommandAvailable]
  );

  const sections = useMemo(
    () => [
      {
        id: "quick",
        title: "Quick Actions",
        content: (
          <div className={styles.sectionContent}>
            <button
              className={styles.button}
              onClick={() => handleCommandClick("help")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
              </svg>
              <span>System Help</span>
            </button>
            <button className={styles.button} onClick={handleConnectWallet}>
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18H21M12,16V8H21V16H12Z" />
              </svg>
              <span>Connect Wallet</span>
            </button>
            <button
              className={styles.button}
              onClick={() => handleCommandClick("faucet")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
              </svg>
              <span>Claim Faucet</span>
            </button>

            {/* AI Assistant Expandable */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" />
                </svg>
                <span>AI Assistant</span>
                <svg
                  className={styles.expandIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
              </summary>
              <div className={styles.subActions}>
                <button className={styles.subButton} onClick={handleToggleAI}>
                  <span>
                    → AI:{" "}
                    {aiProvider === "off"
                      ? "OFF"
                      : aiProvider === "near"
                      ? "NEAR"
                      : "OPENAI"}
                  </span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("ai")}
                >
                  <span>→ 📚 AI Help</span>
                </button>
              </div>
            </details>

            <button className={styles.button} onClick={handleToggleView}>
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3,3H9V7H3V3M15,10H21V14H15V10M15,17H21V21H15V17M13,13H7V18H13V13Z" />
              </svg>
              <span>Basic View</span>
            </button>

            <button
              className={styles.button}
              onClick={() => handleCommandClick("clear")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
              </svg>
              <span>Clear Terminal</span>
            </button>

            {/* Terminal Style Expandable */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
                </svg>
                <span>Terminal Style</span>
                <svg
                  className={styles.expandIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
              </summary>
              <div className={styles.subActions}>
                {/* Color Palettes Subsection */}
                <div className={styles.subSectionHeader}>
                  <span>Color Palettes</span>
                </div>
                <button
                  className={styles.subButton}
                  onClick={handleCyclePalette}
                >
                  <span>🔄 Cycle Palette</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetColorPalette("crimson")}
                >
                  <span>Crimson</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetColorPalette("anime")}
                >
                  <span>Anime</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetColorPalette("ocean")}
                >
                  <span>Ocean</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetColorPalette("forest")}
                >
                  <span>Forest</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetColorPalette("sunset")}
                >
                  <span>Sunset</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetColorPalette("purple")}
                >
                  <span>Purple</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetColorPalette("cyber")}
                >
                  <span>Cyber</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetColorPalette("gold")}
                >
                  <span>Gold</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetColorPalette("ice")}
                >
                  <span>Ice</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetColorPalette("fire")}
                >
                  <span>Fire</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => customizer.resetPalette?.()}
                >
                  <span>Reset Default</span>
                </button>

                {/* Themes Subsection */}
                <div className={styles.subSectionHeader}>
                  <span>Themes</span>
                </div>
                <button className={styles.subButton} onClick={handleCycleTheme}>
                  <span>🔄 Cycle Theme</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetTheme("executive")}
                >
                  <span>Executive</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetTheme("modern")}
                >
                  <span>Modern UI</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetTheme("dark")}
                >
                  <span>Dark</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetTheme("light")}
                >
                  <span>Light</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetTheme("matrix")}
                >
                  <span>Matrix</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetTheme("retro")}
                >
                  <span>Retro</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleSetTheme("powershell")}
                >
                  <span>PowerShell</span>
                </button>
              </div>
            </details>
          </div>
        ),
      },
      {
        id: "news",
        title: "Crypto News",
        content: (
          <div className={styles.sectionContent}>
            <button className={styles.button} onClick={() => news.openPanel()}>
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20,11H4V8H20M20,15H13V13H20M20,19H13V17H20M11,19H4V13H11M20.33,4.67L18.67,3L17,4.67L15.33,3L13.67,4.67L12,3L10.33,4.67L8.67,3L7,4.67L5.33,3L3.67,4.67L2,3V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V3L20.33,4.67Z" />
              </svg>
              <span>Open News Reader</span>
            </button>
            <button
              className={styles.button}
              onClick={() => handleCommandClick("news latest")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4,6H20V8H4V6M4,11H20V13H4V11M4,16H20V18H4V16Z" />
              </svg>
              <span>Latest News</span>
            </button>
            <button
              className={styles.button}
              onClick={() => handleCommandClick("news hot")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
              </svg>
              <span>Trending News</span>
            </button>

            {/* Crypto News Expandable */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
                </svg>
                <span>Crypto News</span>
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
                  onClick={() => handleCommandClick("news btc")}
                >
                  <span>→ ₿ Bitcoin News</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news eth")}
                >
                  <span>→ Ξ Ethereum News</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news sol")}
                >
                  <span>→ ◎ Solana News</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news search")}
                >
                  <span>→ 🔍 Search News</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news category news")}
                >
                  <span>→ 📰 News Articles</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news sources")}
                >
                  <span>→ 📡 News Sources</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news expand-all")}
                >
                  <span>→ 📖 Expand All</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news collapse-all")}
                >
                  <span>→ 📄 Collapse All</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news clear-expansions")}
                >
                  <span>→ 🧹 Clear & Reload</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news help")}
                >
                  <span>→ ❓ News Help</span>
                </button>
              </div>
            </details>
          </div>
        ),
      },
      {
        id: "media",
        title: "Music Player",
        content: (
          <div className={styles.sectionContent}>
            <button
              className={styles.button}
              onClick={() => spotify.openPanel()}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <span>Open Spotify</span>
            </button>

            {/* Spotify Controls Expandable */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Spotify Controls</span>
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
                  onClick={() => void spotify.togglePlayPause()}
                >
                  <span>→ Play/Pause</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => void spotify.skipNext()}
                >
                  <span>→ Next Track</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => void spotify.skipPrevious()}
                >
                  <span>→ Previous Track</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("spotify search")}
                >
                  <span>→ Search Music</span>
                </button>
              </div>
            </details>
          </div>
        ),
      },
      {
        id: "youtube",
        title: "YouTube Player",
        content: <YouTubePlayerSection />,
      },
      {
        id: "trading",
        title: "Trading & Analytics",
        content: <TradingAnalyticsSection />,
      },
      {
        id: "nft",
        title: "NFT Explorer",
        content: <NftExplorerSection />,
      },
      {
        id: "portfolio",
        title: "Portfolio Tracker",
        content: (
          <div className={styles.sectionContent}>
            <button
              className={styles.button}
              onClick={() => handleCommandClick("balance")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
              </svg>
              <span>Check Balance</span>
            </button>

            {/* Track Wallet (PGT) Expandable */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H21V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" />
                </svg>
                <span>Track Wallet</span>
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
                  onClick={() => handleCommandClick("pgt track")}
                >
                  <span>→ Track New Wallet</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("pgt portfolio")}
                >
                  <span>→ View Portfolio</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("pgt wallets")}
                >
                  <span>→ List Wallets</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("pgt refresh")}
                >
                  <span>→ Refresh Data</span>
                </button>
              </div>
            </details>
          </div>
        ),
      },
      {
        id: "network",
        title: "Network",
        content: <NetworkSection />,
      },
      {
        id: "tx",
        title: "Transactions",
        content: (
          <div className={styles.sectionContent}>
            <button
              className={styles.button}
              onClick={() => handleCommandClick("send")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
              </svg>
              <span>Send Tokens</span>
            </button>
            <button
              className={styles.button}
              onClick={() => handleCommandClick("email")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
              </svg>
              <span>Send Email</span>
            </button>
            <button
              className={styles.button}
              onClick={() => handleCommandClick("inbox")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19,15H15A3,3 0 0,1 12,18A3,3 0 0,1 9,15H5V5H19M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" />
              </svg>
              <span>View Inbox</span>
            </button>
          </div>
        ),
      },
      {
        id: "chaingpt",
        title: "ChainGPT Tools",
        content: <ChainGptToolsSection />,
      },
    ],
    [handleCommandClick, news, spotify, youtube, renderCommandButton]
  );

  if (!isHydrated) {
    return <aside className={styles.sidebar} />;
  }

  return (
    <aside className={styles.sidebar}>
      {!commandsInitialized && (
        <div className={styles.disabledMessage}>
          Command shortcuts limited while modules load.
        </div>
      )}
      {sections.map((s) => {
        const isOpen = expandedSections.includes(s.id);
        return (
          <div key={s.id} className={styles.section}>
            <div
              className={styles.sectionTitle}
              onClick={() => handleSectionToggle(s.id)}
            >
              <span>{s.title}</span>
              <button className={styles.sectionToggle} aria-label="Toggle">
                <svg
                  className={styles.toggleIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
            </div>
            {isOpen && s.content}
          </div>
        );
      })}
    </aside>
  );
}

export default DashboardSidebar;
