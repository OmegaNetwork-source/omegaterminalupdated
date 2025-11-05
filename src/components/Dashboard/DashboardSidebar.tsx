"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useTerminal } from "@/providers/TerminalProvider";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { useNewsReader } from "@/hooks/useNewsReader";
import { usePGT } from "@/hooks/usePGT";
import { useWallet } from "@/hooks/useWallet";
import { useViewMode } from "@/hooks/useViewMode";
import { useTheme } from "@/hooks/useTheme";
import { useCustomizer } from "@/hooks/useCustomizer";
import styles from "./DashboardSidebar.module.css";
import { getSubActionIcon } from "./utils/subActionIcons";

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

const PGTStatsPanel = dynamic(
  () =>
    import("./PGTStatsPanel").then((mod) => ({
      default: mod.PGTStatsPanel,
    })),
  {
    ssr: false,
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
  const pgt = usePGT();
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
    const providers: ("off" | "near" | "openai")[] = ["off", "near", "openai"];
    const currentProvider = aiProvider || "off";
    const currentIndex = providers.indexOf(currentProvider);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % providers.length;
    const nextProvider = providers[nextIndex] || "off";
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


  // Get SVG icon for section title
  const getSectionIcon = useCallback((sectionId: string) => {
    const icons: Record<string, JSX.Element> = {
      quick: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M11,21H13V19.93C15.83,19.43 18,17.03 18,14V10H6V14C6,17.03 8.17,19.43 11,19.93V21M7,8H17V10H7V8M7,12H17V14C17,15.1 16.1,16 15,16H9C7.9,16 7,15.1 7,14V12Z" fill="currentColor" />
        </svg>
      ),
      news: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M20,11H4V8H20M20,15H13V13H20M20,19H13V17H20M11,19H4V13H11M20.33,4.67L18.67,3L17,4.67L15.33,3L13.67,4.67L12,3L10.33,4.67L8.67,3L7,4.67L5.33,3L3.67,4.67L2,3V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V3L20.33,4.67Z" fill="currentColor" />
        </svg>
      ),
      media: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M15,6H3V8H15V6M15,10H3V12H15V10M3,16H11V14H3V16M17,6V14.18C16.69,14.07 16.35,14 16,14A3,3 0 0,0 13,17A3,3 0 0,0 16,20A3,3 0 0,0 19,17V8H22V6H17Z" fill="currentColor" />
        </svg>
      ),
      youtube: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" fill="currentColor" />
        </svg>
      ),
      trading: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" fill="currentColor" />
        </svg>
      ),
      nft: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" fill="currentColor" />
        </svg>
      ),
      portfolio: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18H21M12,16V8H21V16H12Z" fill="currentColor" />
        </svg>
      ),
      network: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M2,3H22C23.05,3 24,3.95 24,5V19C24,20.05 23.05,21 22,21H2C0.95,21 0,20.05 0,19V5C0,3.95 0.95,3 2,3M14,6V7H22V6H14M14,8V9H21.5L22,9V8H14M14,10V11H21V10H14M8,13.91C6,13.91 2,15 2,17V18H14V17C14,15 10,13.91 8,13.91M8,6A3,3 0 0,0 5,9A3,3 0 0,0 8,12A3,3 0 0,0 11,9A3,3 0 0,0 8,6Z" fill="currentColor" />
        </svg>
      ),
      tx: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" fill="currentColor" />
        </svg>
      ),
      chaingpt: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" fill="currentColor" />
        </svg>
      ),
      "advanced-trading": (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" fill="currentColor" />
        </svg>
      ),
      entertainment: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M15.5,12C15.5,10.34 14.16,9 12.5,9C10.84,9 9.5,10.34 9.5,12C9.5,13.66 10.84,15 12.5,15C14.16,15 15.5,13.66 15.5,12M6.5,9C8.16,9 9.5,10.34 9.5,12C9.5,13.66 8.16,15 6.5,15C4.84,15 3.5,13.66 3.5,12C3.5,10.34 4.84,9 6.5,9M17.5,9C19.16,9 20.5,10.34 20.5,12C20.5,13.66 19.16,15 17.5,15C15.84,15 14.5,13.66 14.5,12C14.5,10.34 15.84,9 17.5,9M6.5,11C5.67,11 5,11.67 5,12.5C5,13.33 5.67,14 6.5,14C7.33,14 8,13.33 8,12.5C8,11.67 7.33,11 6.5,11M17.5,11C16.67,11 16,11.67 16,12.5C16,13.33 16.67,14 17.5,14C18.33,14 19,13.33 19,12.5C19,11.67 18.33,11 17.5,11M12.5,11C11.67,11 11,11.67 11,12.5C11,13.33 11.67,14 12.5,14C13.33,14 14,13.33 14,12.5C14,11.67 13.33,11 12.5,11Z" fill="currentColor" />
        </svg>
      ),
      mining: (
        <svg
          className={styles.sectionTitleIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M12,2L15.09,8.26L22,9L15.09,9.74L12,16L8.91,9.74L2,9L8.91,8.26L12,2Z" fill="currentColor" />
        </svg>
      ),
    };
    return icons[sectionId] || null;
  }, []);

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
                fill="currentColor"
              >
                <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" fill="currentColor" />
              </svg>
              <span>System Help</span>
            </button>
            <button className={styles.button} onClick={handleConnectWallet}>
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18H21M12,16V8H21V16H12Z" fill="currentColor" />
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
                fill="currentColor"
              >
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" fill="currentColor" />
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
                  fill="currentColor"
                >
                  <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" fill="currentColor" />
                </svg>
                <span>AI Assistant</span>
                <svg
                  className={styles.expandIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" fill="currentColor" />
                </svg>
              </summary>
              <div className={styles.subActions}>
                <button
                  className={`${styles.subButton} ${
                    aiProvider === "off"
                      ? styles.aiToggleOff
                      : styles.aiToggleOn
                  }`}
                  onClick={handleToggleAI}
                >
                  {getSubActionIcon(
                    `AI: ${aiProvider === "off" ? "OFF" : aiProvider === "near" ? "NEAR" : "OPENAI"}`
                  )}
                  <span>
                    AI:{" "}
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
                  {getSubActionIcon("AI Help")}
                  <span>AI Help</span>
                </button>
              </div>
            </details>

            <button className={styles.button} onClick={handleToggleView}>
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M3,3H9V7H3V3M15,10H21V14H15V10M15,17H21V21H15V17M13,13H7V18H13V13Z" fill="currentColor" />
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
                fill="currentColor"
              >
                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" fill="currentColor" />
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
                  fill="currentColor"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" fill="currentColor" />
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
                  {getSubActionIcon("Cycle Palette")}
                  <span>Cycle Palette</span>
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
                  {getSubActionIcon("Reset Default")}
                  <span>Reset Default</span>
                </button>

                {/* Themes Subsection */}
                <div className={styles.subSectionHeader}>
                  <span>Themes</span>
                </div>
                <button className={styles.subButton} onClick={handleCycleTheme}>
                  {getSubActionIcon("Cycle Theme")}
                  <span>Cycle Theme</span>
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
                  fill="currentColor"
                >
                  <path d="M20,11H4V8H20M20,15H13V13H20M20,19H13V17H20M11,19H4V13H11M20.33,4.67L18.67,3L17,4.67L15.33,3L13.67,4.67L12,3L10.33,4.67L8.67,3L7,4.67L5.33,3L3.67,4.67L2,3V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V3L20.33,4.67Z" fill="currentColor" />
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
                fill="currentColor"
              >
                <path d="M4,6H20V8H4V6M4,11H20V13H4V11M4,16H20V18H4V16Z" fill="currentColor" />
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
                fill="currentColor"
              >
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" fill="currentColor" />
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
                  fill="currentColor"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" fill="currentColor" />
                </svg>
              </summary>
              <div className={styles.subActions}>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news btc")}
                >
                  {getSubActionIcon("Bitcoin News")}
                  <span>Bitcoin News</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news eth")}
                >
                  {getSubActionIcon("Ethereum News")}
                  <span>Ethereum News</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news sol")}
                >
                  {getSubActionIcon("Solana News")}
                  <span>Solana News</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news search")}
                >
                  {getSubActionIcon("Search News")}
                  <span>Search News</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news category news")}
                >
                  {getSubActionIcon("News Articles")}
                  <span>News Articles</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news sources")}
                >
                  {getSubActionIcon("News Sources")}
                  <span>News Sources</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news expand-all")}
                >
                  {getSubActionIcon("Expand All")}
                  <span>Expand All</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news collapse-all")}
                >
                  {getSubActionIcon("Collapse All")}
                  <span>Collapse All</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news clear-expansions")}
                >
                  {getSubActionIcon("Clear & Reload")}
                  <span>Clear & Reload</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("news help")}
                >
                  {getSubActionIcon("News Help")}
                  <span>News Help</span>
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
                fill="currentColor"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="currentColor" />
              </svg>
              <span>Open Spotify</span>
            </button>

            <button
              className={styles.button}
              onClick={() => handleCommandClick("blues")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" fill="currentColor" />
              </svg>
              <span>Omega Blues</span>
            </button>

            <button
              className={styles.button}
              onClick={() => handleCommandClick("lofi")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" fill="currentColor" />
              </svg>
              <span>Omega Lo-Fi</span>
            </button>

            <button
              className={styles.button}
              onClick={() => handleCommandClick("tech")}
            >
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                <path d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" fill="currentColor" />
                </svg>
              <span>Omega Tech</span>
            </button>

            <button
              className={styles.button}
              onClick={() => handleCommandClick("funky")}
            >
                <svg
                className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                <path d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" fill="currentColor" />
                </svg>
              <span>Omega Funky</span>
            </button>

                <button
              className={styles.button}
              onClick={() => handleCommandClick("trance")}
                >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" fill="currentColor" />
              </svg>
              <span>Omega Trance</span>
                </button>

                <button
              className={styles.button}
              onClick={() => handleCommandClick("melodies")}
                >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" fill="currentColor" />
              </svg>
              <span>Omega Melodies</span>
                </button>
          </div>
        ),
      },
      {
        id: "youtube",
        title: "YouTube Player",
        content: <YouTubePlayerSection />,
      },
      {
        id: "mining",
        title: "Mining & Rewards",
        content: (
          <div className={styles.sectionContent}>
                <button
              className={styles.button}
              onClick={() => handleCommandClick("mine")}
                >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" fill="currentColor" />
              </svg>
              <span>Start Mining</span>
                </button>

                <button
              className={styles.button}
              onClick={() => handleCommandClick("claim")}
                >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,5.5A6.5,6.5 0 0,1 18.5,12A6.5,6.5 0 0,1 12,18.5A6.5,6.5 0 0,1 5.5,12A6.5,6.5 0 0,1 12,5.5M11,8V10H9V12H11V14H13V12H15V10H13V8H11Z" fill="currentColor" />
              </svg>
              <span>Claim Rewards</span>
                </button>

                <button
              className={styles.button}
              onClick={() => handleCommandClick("stats")}
                >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V11H22V21Z" fill="currentColor" />
              </svg>
              <span>Mining Status</span>
            </button>

            <button
              className={styles.button}
              onClick={() => handleCommandClick("stats")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" fill="currentColor" />
              </svg>
              <span>Mining Stats</span>
                </button>
              </div>
        ),
      },
      {
        id: "advanced-trading",
        title: "Advanced Trading",
        content: (
          <div className={styles.sectionContent}>
            {/* Markets Commands */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" fill="currentColor" />
                </svg>
                <span>Markets</span>
                <svg
                  className={styles.expandIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" fill="currentColor" />
                </svg>
              </summary>
              <div className={styles.subActions}>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("markets:list")}
                >
                  {getSubActionIcon("List Markets")}
                  <span>List Markets</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("markets:view")}
                >
                  {getSubActionIcon("View Market")}
                  <span>View Market</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("markets:heatmap")}
                >
                  {getSubActionIcon("Heatmap")}
                  <span>Heatmap</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("markets:similar")}
                >
                  {getSubActionIcon("Similar Markets")}
                  <span>Similar Markets</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("markets:list help")}
                >
                  {getSubActionIcon("Markets Help")}
                  <span>Markets Help</span>
                </button>
              </div>
            </details>

            {/* Alpha Forecast Commands */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" fill="currentColor" />
                </svg>
                <span>AI Forecast</span>
                <svg
                  className={styles.expandIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" fill="currentColor" />
                </svg>
              </summary>
              <div className={styles.subActions}>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("alpha:infer")}
                >
                  {getSubActionIcon("Get Forecast")}
                  <span>Get Forecast</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("alpha:drops")}
                >
                  {getSubActionIcon("Daily Picks")}
                  <span>Daily Picks</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("alpha:submit")}
                >
                  {getSubActionIcon("Submit Forecast")}
                  <span>Submit Forecast</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("alpha:score")}
                >
                  {getSubActionIcon("My Score")}
                  <span>My Score</span>
                </button>
              </div>
            </details>

            {/* Portfolio Commands */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16V8H21V16H12Z" fill="currentColor" />
                </svg>
                <span>Portfolio</span>
                <svg
                  className={styles.expandIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" fill="currentColor" />
                </svg>
              </summary>
              <div className={styles.subActions}>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("pf:sync")}
                >
                  {getSubActionIcon("Sync Portfolio")}
                  <span>Sync Portfolio</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("pf:show")}
                >
                  {getSubActionIcon("Portfolio View")}
                  <span>Portfolio View</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("bundle:list")}
                >
                  {getSubActionIcon("List Bundles")}
                  <span>List Bundles</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("bundle:view")}
                >
                  {getSubActionIcon("View Bundle")}
                  <span>View Bundle</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("bundle:backtest")}
                >
                  {getSubActionIcon("Backtest")}
                  <span>Backtest</span>
                </button>
              </div>
            </details>

            {/* Social Commands */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M16,4C18.11,4 20,5.89 20,8C20,10.11 18.11,12 16,12C15.71,12 15.44,11.97 15.18,11.92L12,16L8.82,11.92C8.56,11.97 8.29,12 8,12C5.89,12 4,10.11 4,8C4,5.89 5.89,4 8,4C8.29,4 8.56,4.03 8.82,4.08L12,0L15.18,4.08C15.44,4.03 15.71,4 16,4M16,6C14.9,6 14,6.9 14,8C14,9.1 14.9,10 16,10C17.1,10 18,9.1 18,8C18,6.9 17.1,6 16,6M8,6C6.9,6 6,6.9 6,8C6,9.1 6.9,10 8,10C9.1,10 10,9.1 10,8C10,6.9 9.1,6 8,6M12,18.5L13.18,16.41C13.55,16.47 13.96,16.5 14.38,16.5C16.5,16.5 18.13,14.88 18.13,12.75C18.13,10.63 16.5,9 14.38,9C13.96,9 13.55,9.03 13.18,9.09L12,7L10.82,9.09C10.45,9.03 10.04,9 9.63,9C7.5,9 5.88,10.63 5.88,12.75C5.88,14.88 7.5,16.5 9.63,16.5C10.04,16.5 10.45,16.47 10.82,16.41L12,18.5Z" fill="currentColor" />
                </svg>
                <span>Social</span>
                <svg
                  className={styles.expandIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" fill="currentColor" />
                </svg>
              </summary>
              <div className={styles.subActions}>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("social:feed")}
                >
                  {getSubActionIcon("Activity Feed")}
                  <span>Activity Feed</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("social:follow")}
                >
                  {getSubActionIcon("Follow User")}
                  <span>Follow User</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("social:profile")}
                >
                  {getSubActionIcon("View Profile")}
                  <span>View Profile</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("social:leagues")}
                >
                  {getSubActionIcon("Leaderboards")}
                  <span>Leaderboards</span>
                </button>
              </div>
            </details>

            {/* Venues */}
            <button
              className={styles.button}
              onClick={() => handleCommandClick("polymarket")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" fill="currentColor" />
              </svg>
              <span>Polymarket</span>
            </button>

            <button
              className={styles.button}
              onClick={() => handleCommandClick("kalshi")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" fill="currentColor" />
              </svg>
              <span>Kalshi</span>
            </button>

            <button
              className={styles.button}
              onClick={() => handleCommandClick("hyperliquid")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" fill="currentColor" />
              </svg>
              <span>Hyperliquid</span>
            </button>
          </div>
        ),
      },
      {
        id: "entertainment",
        title: "Entertainment & Games",
        content: (
          <div className={styles.sectionContent}>
            <button
              className={styles.button}
              onClick={() => handleCommandClick("games")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M15.5,12C15.5,10.34 14.16,9 12.5,9C10.84,9 9.5,10.34 9.5,12C9.5,13.66 10.84,15 12.5,15C14.16,15 15.5,13.66 15.5,12M6.5,9C8.16,9 9.5,10.34 9.5,12C9.5,13.66 8.16,15 6.5,15C4.84,15 3.5,13.66 3.5,12C3.5,10.34 4.84,9 6.5,9M17.5,9C19.16,9 20.5,10.34 20.5,12C20.5,13.66 19.16,15 17.5,15C15.84,15 14.5,13.66 14.5,12C14.5,10.34 15.84,9 17.5,9M6.5,11C5.67,11 5,11.67 5,12.5C5,13.33 5.67,14 6.5,14C7.33,14 8,13.33 8,12.5C8,11.67 7.33,11 6.5,11M17.5,11C16.67,11 16,11.67 16,12.5C16,13.33 16.67,14 17.5,14C18.33,14 19,13.33 19,12.5C19,11.67 18.33,11 17.5,11M12.5,11C11.67,11 11,11.67 11,12.5C11,13.33 11.67,14 12.5,14C13.33,14 14,13.33 14,12.5C14,11.67 13.33,11 12.5,11Z" fill="currentColor" />
              </svg>
              <span>Games</span>
            </button>

            <button
              className={styles.button}
              onClick={() => handleCommandClick("screensaver")}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M21,3H3C1.89,3 1,3.89 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V5C23,3.89 22.1,3 21,3M21,19H3V5H21V19Z" fill="currentColor" />
              </svg>
              <span>Screensaver</span>
            </button>
          </div>
        ),
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
                fill="currentColor"
              >
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" fill="currentColor" />
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
                  fill="currentColor"
                >
                  <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H21V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" fill="currentColor" />
                </svg>
                <span>Track Wallet</span>
                <svg
                  className={styles.expandIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" fill="currentColor" />
                </svg>
              </summary>
              <div className={styles.subActions}>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("pgt track")}
                >
                  {getSubActionIcon("Track New Wallet")}
                  <span>Track New Wallet</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("pgt portfolio")}
                >
                  {getSubActionIcon("View Portfolio")}
                  <span>View Portfolio</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("pgt wallets")}
                >
                  {getSubActionIcon("List Wallets")}
                  <span>List Wallets</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("pgt refresh")}
                >
                  {getSubActionIcon("Refresh Data")}
                  <span>Refresh Data</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("pgt wallets")}
                  title="View tracked wallets to remove them"
                >
                  {getSubActionIcon("Remove Wallet")}
                  <span>Remove Wallet</span>
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
                fill="currentColor"
              >
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" fill="currentColor" />
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
                fill="currentColor"
              >
                <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" fill="currentColor" />
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
                fill="currentColor"
              >
                <path d="M19,15H15A3,3 0 0,1 12,18A3,3 0 0,1 9,15H5V5H19M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" fill="currentColor" />
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
              {getSectionIcon(s.id)}
              <span>{s.title}</span>
              <button className={styles.sectionToggle} aria-label="Toggle">
                <svg
                  className={styles.toggleIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M7 10l5 5 5-5z" fill="currentColor" />
                </svg>
              </button>
            </div>
            {isOpen && s.content}
          </div>
        );
      })}

      {/* PGT Portfolio Tracker Stats Panel - Shows when wallets are tracked */}
      {pgt.wallets.length > 0 && (
        <div
          id="pgt-stats-panel"
          className={styles.section}
          data-section="portfolio-tracker"
        >
          <div className={styles.sectionTitle}>
            <svg
              className={styles.sectionTitleIcon}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H21V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" fill="currentColor" />
            </svg>
            <span>PORTFOLIO TRACKER</span>
          </div>
          <div className={styles.sectionContent}>
            <Suspense fallback={null}>
              <PGTStatsPanel />
            </Suspense>
          </div>
        </div>
      )}
    </aside>
  );
}

export default DashboardSidebar;
