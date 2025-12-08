"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTerminal } from "@/providers/TerminalProvider";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { useNewsReader } from "@/hooks/useNewsReader";
import { useWallet } from "@/hooks/useWallet";
import { useViewMode } from "@/hooks/useViewMode";
import { useTheme } from "@/hooks/useTheme";
import { useCustomizer } from "@/hooks/useCustomizer";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { commandRegistry } from "@/lib/commands";
import { isAppMode } from "@/lib/utils/url-utils";
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

// Sortable Section Component
interface SortableSectionProps {
  section: {
    id: string;
    title: string;
    content: JSX.Element;
  };
  isOpen: boolean;
  onToggle: (id: string) => void;
  getSectionIcon: (id: string) => JSX.Element | null;
  styles: any;
}

function SortableSection({
  section,
  isOpen,
  onToggle,
  getSectionIcon,
  styles: cssStyles,
}: SortableSectionProps): JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle HTML5 drag for dropping into quick actions
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", `section:${section.id}`);
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${cssStyles.section} ${isDragging ? cssStyles.sectionDragging : ""}`}
    >
      <div
        className={cssStyles.sectionTitle}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          // Don't toggle if clicking on drag handle
          const target = e.target as HTMLElement;
          if (!target.closest(`.${cssStyles.dragHandle}`)) {
            onToggle(section.id);
          }
        }}
        style={{ cursor: "grab" }}
        title="Drag to reorder sections or drag to Quick Actions area to add commands"
      >
        {/* Drag Handle */}
        <div
          className={cssStyles.dragHandle}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
        >
          <svg
            className={cssStyles.dragHandleIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M9,3V5H7V3H9M13,3V5H11V3H13M17,3V5H15V3H17M7,7V9H5V7H7M13,7V9H11V7H13M19,7V9H17V7H19M7,11V13H5V11H7M13,11V13H11V11H13M19,11V13H17V11H19M7,15V17H5V15H7M13,15V17H11V15H13M19,15V17H17V15H19M7,19V21H5V19H7M13,19V21H11V19H13M17,19V21H15V19H17Z" fill="currentColor" />
          </svg>
        </div>
        {getSectionIcon(section.id)}
        <span>{section.title}</span>
        <button
          className={cssStyles.sectionToggle}
          aria-label="Toggle"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(section.id);
          }}
        >
          <svg
            className={cssStyles.toggleIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M7 10l5 5 5-5z" fill="currentColor" />
          </svg>
        </button>
      </div>
      {isOpen && section.content}
    </div>
  );
}

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

const FarmingSection = dynamic(
  () =>
    import("./sidebar-sections/FarmingSectionNew").then((mod) => ({
      default: mod.FarmingSectionNew,
    })),
  {
    ssr: false,
    loading: SectionSkeleton,
  }
);

const BotSection = dynamic(
  () =>
    import("./sidebar-sections/BotSection").then((mod) => ({
      default: mod.BotSection,
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
  const soundEffects = useSoundEffects();

  const [isHydrated, setIsHydrated] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["quick"]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Searchable index of all quick actions
  // This includes section titles, common button labels, AND all registered commands/subcommands
  const searchableIndex = useMemo(() => {
    const index: Record<string, string[]> = {
      quick: [
        "System Help", "Connect Wallet", "Claim Faucet",
        "Basic View", "Clear Terminal", "Terminal Style", "Color Palettes", "Cycle Palette",
        "Crimson", "Anime", "Ocean", "Forest", "Sunset", "Purple", "Cyber", "Gold", "Ice", "Fire",
        "Reset Default", "Mute Sounds", "Unmute Sounds", "Themes", "Cycle Theme", "Retro", "Neo", "Elite", "Modern"
      ],
      news: [
        "Crypto News", "Open News Reader", "Latest News", "Trending News", "Bitcoin News",
        "Ethereum News", "Solana News", "Search News", "News Articles", "News Sources",
        "Expand All", "Collapse All", "Clear & Reload", "News Help"
      ],
      media: [],
      youtube: [],
      mining: [
        "Mining & Rewards", "Start Mining", "Claim Rewards", "Mining Status", "Mining Stats"
      ],
      "advanced-trading": [
        "Advanced Trading", "Open Trading UI", "Connect Account", "Polymarket", "Kalshi", "Hyperliquid",
        "Trending", "Events", "Politics", "Sports", "Crypto"
      ],
      entertainment: [
        "Entertainment & Games", "Somnia Arcade", "Games", "Screensaver", "Extract Sound", "Extract", "Audio"
      ],
      trading: [
        "Trading & Analytics", "Chart", "DexScreener", "GeckoTerminal", "Alpha Vantage"
      ],
      nft: [
        "NFT Explorer", "Generate NFT", "Magic Eden", "Search", "Collections"
      ],
      portfolio: [],
      network: [
        "Network", "EVM Networks", "Ethereum", "BNB Smart Chain", "Polygon", "Arbitrum",
        "Optimism", "Base", "Omega Network", "Rome Protocol", "Fair Testnet", "Monad",
        "Solana", "NEAR Protocol", "Connect Wallet", "Disconnect", "Check Balance",
        "Create Token", "Mint NFT", "Register ENS", "Account Info", "Token Swap"
      ],
      tx: [
        "Transactions", "Send Tokens", "Send Email", "View Inbox"
      ],
      chaingpt: [
        "ChainGPT Tools", "Chat", "NFT Generator", "Tutorials"
      ],
      farming: [
        "Farming", "Networks", "Stable Network", "Stable", "Website", "Faucet", 
        "Token Creator", "Transactions", "stable token create", "stable transactions",
        "stable.xyz", "faucet.stable.xyz", "Create Token", "Start Transactions"
      ],
    };

    // Add ALL registered commands and their aliases to the search index
    try {
      const allCommands = commandRegistry.getAllCommands();
      const allCommandNames = commandRegistry.getCommandNames();
      
      // Create a comprehensive search index with command names, aliases, descriptions, and usage
      const commandSearchTerms: string[] = [];
      
      allCommands.forEach((cmd) => {
        // Add command name
        commandSearchTerms.push(cmd.name);
        
        // Add aliases
        if (cmd.aliases && cmd.aliases.length > 0) {
          cmd.aliases.forEach((alias) => {
            commandSearchTerms.push(alias);
          });
        }
        
        // Add description words
        if (cmd.description) {
          const descWords = cmd.description
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => word.length > 3); // Only meaningful words
          commandSearchTerms.push(...descWords);
        }
        
        // Add usage patterns (extract subcommands)
        if (cmd.usage) {
          // Extract subcommands like "markets:list", "pgt track", etc.
          const usageParts = cmd.usage
            .split(/\s+/)
            .filter((part) => part.includes(":") || part.includes("-") || part.length > 2);
          commandSearchTerms.push(...usageParts);
          
          // Also add the full usage string
          commandSearchTerms.push(cmd.usage);
        }
        
        // Add category if available
        if (cmd.category) {
          commandSearchTerms.push(cmd.category);
        }
      });
      
      // Add all command names (including aliases) to a global search pool
      commandSearchTerms.push(...allCommandNames);
      
      // Add command search terms to ALL sections for comprehensive search
      Object.keys(index).forEach((sectionId) => {
        index[sectionId] = [...(index[sectionId] || []), ...commandSearchTerms];
      });
      
      // Also create a dedicated "all-commands" section for direct command search
      index["all-commands"] = commandSearchTerms;
    } catch (error) {
      console.error("Failed to build command search index:", error);
    }

    return index;
  }, []);

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

  // Load saved section order from localStorage
  useEffect(() => {
    if (!isHydrated) return;

    try {
      const savedOrder = localStorage.getItem("omega-sidebar-section-order");
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSectionOrder(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load section order:", error);
    }
  }, [isHydrated]);

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
      try {
      void executeCommand(cmd);
      // Auto-scroll terminal to bottom to show command output
      if (typeof window !== "undefined" && (window as any).__omegaScrollTerminalToBottom) {
        setTimeout(() => {
          (window as any).__omegaScrollTerminalToBottom();
        }, 100);
        setTimeout(() => {
          (window as any).__omegaScrollTerminalToBottom();
        }, 500);
        }
      } catch (error) {
        console.error("Error executing command:", cmd, error);
      }
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

            {/* Wallet Creation Expandable */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M17,14H19V17H22V19H19V22H17V19H14V17H17V14M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" fill="currentColor" />
                </svg>
                <span>Create Wallet</span>
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
                  onClick={async () => {
                    console.log("Create Test Wallet button clicked");
                    if (commandsInitialized && isCommandAvailable("test-wallet")) {
                      handleCommandClick("test-wallet");
                    } else {
                      console.warn("test-wallet command not available yet");
                      // Try anyway in case it's just not in the availability check
                      handleCommandClick("test-wallet");
                    }
                  }}
                  title="Create a temporary test wallet (session only)"
                >
                  {getSubActionIcon("Create Test Wallet")}
                  <span>Create Test Wallet</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => {
                    const privateKey = prompt("Enter private key to import:");
                    if (privateKey) {
                      handleCommandClick(`import ${privateKey}`);
                    }
                  }}
                  title="Import wallet from private key"
                >
                  {getSubActionIcon("Import Wallet")}
                  <span>Import Wallet</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => handleCommandClick("export")}
                  title="Export current session wallet details"
                >
                  {getSubActionIcon("Export Wallet")}
                  <span>Export Wallet</span>
                </button>
              </div>
            </details>

            <button
              className={styles.button}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData("text/plain", "subaction:faucet|Claim Faucet|Claim test tokens");
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.style.opacity = "0.5";
                }
              }}
              onDragEnd={(e) => {
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.style.opacity = "1";
                }
              }}
              onClick={() => handleCommandClick("faucet")}
              title="Drag to Quick Actions or click to execute"
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
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData("text/plain", "subaction:clear|Clear Terminal|Clear terminal output");
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.style.opacity = "0.5";
                }
              }}
              onDragEnd={(e) => {
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.style.opacity = "1";
                }
              }}
              onClick={() => handleCommandClick("clear")}
              title="Drag to Quick Actions or click to execute"
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
                  onClick={() => customizer.resetPalette?.()}
                >
                  {getSubActionIcon("Reset Default")}
                  <span>Reset Default</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => soundEffects.setEnabled(!soundEffects.state.isEnabled)}
                >
                  {soundEffects.state.isEnabled ? getSubActionIcon("Mute Sounds") : getSubActionIcon("Volume")}
                  <span>{soundEffects.state.isEnabled ? "Mute Sounds" : "Unmute Sounds"}</span>
                </button>
                
                {/* Compact Grid Layout for Palettes */}
                <div className={styles.paletteGrid}>
                  {/* Vibrant & Energetic */}
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("red")} title="Red">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}></span>
                    <span>Red</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("crimson")} title="Crimson">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #dc143c 0%, #b91c1c 100%)' }}></span>
                    <span>Crimson</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("anime")} title="Anime">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #ff6b9d 0%, #c471ed 50%, #12c2e9 100%)' }}></span>
                    <span>Anime</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("cyber")} title="Cyber">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)' }}></span>
                    <span>Cyber</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("neon")} title="Neon">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #00ff00 100%)' }}></span>
                    <span>Neon</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("fire")} title="Fire">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #ff3300 0%, #ff6600 50%, #ff9900 100%)' }}></span>
                    <span>Fire</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("flame")} title="Flame">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #ff00ff 0%, #ff6600 100%)' }}></span>
                    <span>Flame</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("toxic")} title="Toxic">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #b7ff2f 0%, #00ffa6 50%, #ff2fe3 100%)' }}></span>
                    <span>Toxic</span>
                  </button>
                  <button className={`${styles.paletteChip} ${styles.paletteChipLong}`} onClick={() => handleSetColorPalette("radioactive")} title="Radioactive">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #7fff00 0%, #00ffff 50%, #ffff00 100%)' }}></span>
                    <span>Radioactive</span>
                  </button>
                  <button className={`${styles.paletteChip} ${styles.paletteChipLong}`} onClick={() => handleSetColorPalette("infrared")} title="Infrared">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #ffff00 0%, #ff6600 50%, #ff3300 100%)' }}></span>
                    <span>Infrared</span>
                  </button>
                  
                  {/* Seasonal */}
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("xmas")} title="Xmas">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #dc2626 0%, #16a34a 50%, #fbbf24 100%)' }}></span>
                    <span>Xmas</span>
                  </button>
                  
                  {/* Cool Tones */}
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("ocean")} title="Ocean">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0891b2 100%)' }}></span>
                    <span>Ocean</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("blue")} title="Blue">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}></span>
                    <span>Blue</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("ice")} title="Ice">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)' }}></span>
                    <span>Ice</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("frost")} title="Frost">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)' }}></span>
                    <span>Frost</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("mint")} title="Mint">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)' }}></span>
                    <span>Mint</span>
                  </button>
                  <button className={`${styles.paletteChip} ${styles.paletteChipLong}`} onClick={() => handleSetColorPalette("turquoise")} title="Turquoise">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 50%, #5eead4 100%)' }}></span>
                    <span>Turquoise</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("slate")} title="Slate">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)' }}></span>
                    <span>Slate</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("silver")} title="Silver">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)' }}></span>
                    <span>Silver</span>
                  </button>
                  
                  {/* Warm Tones */}
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("sunset")} title="Sunset">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)' }}></span>
                    <span>Sunset</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("rose")} title="Rose">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #f472b6 100%)' }}></span>
                    <span>Rose</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("pink")} title="Pink">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)' }}></span>
                    <span>Pink</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("amber")} title="Amber">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)' }}></span>
                    <span>Amber</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("honey")} title="Honey">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)' }}></span>
                    <span>Honey</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("gold")} title="Gold">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 50%, #fde047 100%)' }}></span>
                    <span>Gold</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("luxury")} title="Luxury">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #f59e0b 100%)' }}></span>
                    <span>Luxury</span>
                  </button>
                  
                  {/* Mystical */}
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("purple")} title="Purple">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7e22ce 100%)' }}></span>
                    <span>Purple</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("violet")} title="Violet">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)' }}></span>
                    <span>Violet</span>
                  </button>
                  <button className={`${styles.paletteChip} ${styles.paletteChipLong}`} onClick={() => handleSetColorPalette("lavender")} title="Lavender">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #8b5cf6 100%)' }}></span>
                    <span>Lavender</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("lilac")} title="Lilac">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 50%, #c4b5fd 100%)' }}></span>
                    <span>Lilac</span>
                  </button>
                  
                  {/* Nature */}
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("forest")} title="Forest">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #166534 0%, #16a34a 50%, #22c55e 100%)' }}></span>
                    <span>Forest</span>
                  </button>
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("green")} title="Green">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)' }}></span>
                    <span>Green</span>
                  </button>
                  
                  {/* Light Mode */}
                  <button className={styles.paletteChip} onClick={() => handleSetColorPalette("light")} title="Light">
                    <span className={styles.paletteSwatch} style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%)' }}></span>
                    <span>Light</span>
                  </button>
                </div>

                {/* Themes Subsection */}
                <div className={styles.subSectionHeader}>
                  <span>Themes</span>
                </div>
                <button className={styles.subButton} onClick={handleCycleTheme}>
                  {getSubActionIcon("Cycle Theme")}
                  <span>Cycle Theme</span>
                </button>
                
                {/* Compact Grid Layout for Themes */}
                <div className={styles.themeGrid}>
                  <button className={`${styles.themeChip} ${styles.themeDark}`} onClick={() => handleSetTheme("retro")} title="Retro - Deep void terminal">
                    <span>Retro</span>
                  </button>
                  <button className={`${styles.themeChip} ${styles.themeMatrix}`} onClick={() => handleSetTheme("neo")} title="Neo - Matrix digital rain">
                    <span>Neo</span>
                  </button>
                  <button className={`${styles.themeChip} ${styles.themeExecutive}`} onClick={() => handleSetTheme("elite")} title="Elite - Premium luxury">
                    <span>Elite</span>
                  </button>
                  <button className={`${styles.themeChip} ${styles.themeModern}`} onClick={() => handleSetTheme("modern")} title="Modern - Futuristic cyber">
                    <span>Modern</span>
                  </button>
                  <button className={`${styles.themeChip} ${styles.themeCrt}`} onClick={() => handleSetTheme("crt")} title="CRT - Classic green-on-black with glassmorphism">
                    <span>CRT</span>
                  </button>
                </div>
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
            {/* Parlay Builder - Featured */}
            <button
              className={styles.subButton}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData("text/plain", "subaction:parlay create|Parlay Builder|Create cross-platform prediction parlays");
              }}
              onClick={() => handleCommandClick("parlay create")}
              style={{
                background: "linear-gradient(135deg, rgba(0, 255, 214, 0.15), rgba(0, 200, 150, 0.1))",
                border: "1px solid rgba(0, 255, 214, 0.3)",
                marginBottom: "12px",
                padding: "12px 14px",
              }}
            >
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                style={{ width: "16px", height: "16px", marginRight: "8px" }}
                >
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10Z" fill="currentColor" />
                </svg>
              <span style={{ fontWeight: 600 }}>Parlay Builder</span>
              <span style={{ marginLeft: "auto", fontSize: "9px", opacity: 0.7, textTransform: "uppercase", background: "rgba(0, 255, 214, 0.2)", padding: "2px 6px", borderRadius: "4px" }}>New</span>
                </button>

            {/* Polymarket */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" fill="currentColor" />
                </svg>
              <span>Polymarket</span>
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
                <div className={styles.subSectionHeader}>
                  <span>Trading</span>
              </div>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:parlay create|Open Trading UI|Open Polymarket trading interface");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("parlay create")}
                  title="Open the trading interface for Polymarket"
                >
                  {getSubActionIcon("Open Trading UI")}
                  <span>Open Trading UI</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:trade connect polymarket|Connect Account|Connect Polymarket account");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("trade connect polymarket")}
                  title="Connect your Polymarket account"
                >
                  {getSubActionIcon("Connect Account")}
                  <span>Connect Account</span>
                </button>
                <div className={styles.subSectionHeader}>
                  <span>Browse Markets</span>
                </div>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket markets|Markets|Get current active markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket markets")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Markets")}
                  <span>Markets</span>
            </button>
            <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket trending|Trending|Get top volume markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket trending")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Trending")}
                  <span>Trending</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket events|Events|Get recent events");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket events")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Events")}
                  <span>Events</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket recent|Recent|Get very recent events");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket recent")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Recent")}
                  <span>Recent</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket new|New Markets|Newest markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket new")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("New Markets")}
                  <span>New Markets</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket breaking|Breaking News|Breaking news markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket breaking")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Breaking News")}
                  <span>Breaking News</span>
                </button>
                <div className={styles.subSectionHeader}>
                  <span>Categories</span>
                </div>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket politics|Politics|Political markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket politics")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Politics")}
                  <span>Politics</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket sports|Sports|Sports markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket sports")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Sports")}
                  <span>Sports</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket crypto|Crypto|Crypto markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket crypto")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Crypto")}
                  <span>Crypto</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket earnings|Earnings|Earnings markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket earnings")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Earnings")}
                  <span>Earnings</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket geopolitics|Geopolitics|Geopolitical markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket geopolitics")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Geopolitics")}
                  <span>Geopolitics</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket tech|Tech|Technology markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket tech")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Tech")}
                  <span>Tech</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket culture|Culture|Culture markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket culture")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Culture")}
                  <span>Culture</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket world|World Events|World events markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket world")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("World Events")}
                  <span>World Events</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket economy|Economy|Economic markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket economy")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Economy")}
                  <span>Economy</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket trump|Trump|Trump-related markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket trump")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Trump")}
                  <span>Trump</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket elections|Elections|Election markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket elections")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Elections")}
                  <span>Elections</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:polymarket|Polymarket Help|Polymarket command help");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("polymarket help")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Polymarket Help")}
                  <span>Polymarket Help</span>
                </button>
              </div>
            </details>

            {/* Kalshi */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" fill="currentColor" />
              </svg>
              <span>Kalshi</span>
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
                <div className={styles.subSectionHeader}>
                  <span>Trading</span>
                </div>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:parlay create|Open Trading UI|Open Kalshi trading interface");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("parlay create")}
                  title="Open the trading interface for Kalshi"
                >
                  {getSubActionIcon("Open Trading UI")}
                  <span>Open Trading UI</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:trade connect kalshi|Connect Account|Connect Kalshi account");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("trade connect kalshi")}
                  title="Connect your Kalshi account"
                >
                  {getSubActionIcon("Connect Account")}
                  <span>Connect Account</span>
                </button>
                <div className={styles.subSectionHeader}>
                  <span>Browse Markets</span>
                </div>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi markets|Markets|List active markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi markets")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Markets")}
                  <span>Markets</span>
            </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi trending|Trending|Top trending markets by volume");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi trending")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Trending")}
                  <span>Trending</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi new|New Markets|Newest markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi new")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("New Markets")}
                  <span>New Markets</span>
                </button>
                <div className={styles.subSectionHeader}>
                  <span>Categories</span>
                </div>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi politics|Politics|Political markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi politics")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Politics")}
                  <span>Politics</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi sports|Sports|Sports markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi sports")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Sports")}
                  <span>Sports</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi culture|Culture|Culture & entertainment markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi culture")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Culture")}
                  <span>Culture</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi crypto|Crypto|Cryptocurrency markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi crypto")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Crypto")}
                  <span>Crypto</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi climate|Climate|Climate & environment markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi climate")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Climate")}
                  <span>Climate</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi economics|Economics|Economic markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi economics")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Economics")}
                  <span>Economics</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi tech|Tech|Technology markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi tech")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Tech")}
                  <span>Tech</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi world|World Events|World events & global markets");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi world")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("World Events")}
                  <span>World Events</span>
                </button>
                <div className={styles.subSectionHeader}>
                  <span>Market Tools</span>
                </div>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi events|Events|List events");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi events")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Events")}
                  <span>Events</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:kalshi|Kalshi Help|Kalshi command help");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("kalshi help")}
                  title="Drag to Quick Actions or click to execute"
                >
                  {getSubActionIcon("Kalshi Help")}
                  <span>Kalshi Help</span>
                </button>
              </div>
            </details>

            {/* Trading Account Management */}
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
                <span>Account</span>
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
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:parlay create|Open Trading UI|Open the unified trading interface");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("parlay create")}
                  title="Open the unified trading interface"
                >
                  {getSubActionIcon("Open Trading UI")}
                  <span>Open Trading UI</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:trade balance|Check Balance|Check your trading balance");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("trade balance")}
                  title="Check your trading balance across all accounts"
                >
                  {getSubActionIcon("Check Balance")}
                  <span>Check Balance</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:trade positions|View Positions|View your open positions");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("trade positions")}
                  title="View your open positions across all accounts"
                >
                  {getSubActionIcon("View Positions")}
                  <span>View Positions</span>
                </button>
                <button
                  className={styles.subButton}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("text/plain", "subaction:trade help|Trading Help|Trading commands help");
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onClick={() => handleCommandClick("trade help")}
                  title="View all trading commands and help"
                >
                  {getSubActionIcon("Trading Help")}
                  <span>Trading Help</span>
                </button>
              </div>
            </details>

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
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).openSomniaArcade) {
                  (window as any).openSomniaArcade();
                }
              }}
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10Z" fill="currentColor" />
              </svg>
              <span>Somnia Arcade</span>
            </button>
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

            {/* Extract Sound Expandable */}
            <details className={styles.expandable}>
              <summary className={styles.expandableButton}>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M12,3V12.26C11.5,12.09 11,12 10.5,12C8,12 6,14 6,16.5C6,19 8,21 10.5,21C13,21 15,19 15,16.5V6H19V3H12M10.5,19A2.5,2.5 0 0,1 8,16.5A2.5,2.5 0 0,1 10.5,14A2.5,2.5 0 0,1 13,16.5A2.5,2.5 0 0,1 10.5,19Z" fill="currentColor" />
                </svg>
                <span>Extract Sound</span>
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
                  onClick={() => handleCommandClick("extract help")}
                >
                  <svg className={styles.subButtonIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
                  </svg>
                  <span>How to Use</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => {
                    const url = prompt("Enter YouTube URL:");
                    if (url) {
                      handleCommandClick(`extract sound ${url}`);
                    }
                  }}
                >
                  <svg className={styles.subButtonIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,3V12.26C11.5,12.09 11,12 10.5,12C8,12 6,14 6,16.5C6,19 8,21 10.5,21C13,21 15,19 15,16.5V6H19V3H12Z" />
                  </svg>
                  <span>Extract Full Audio</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => {
                    const url = prompt("Enter YouTube URL:");
                    if (url) {
                      const start = prompt("Start time (e.g., 1:30 or 01:30:00):");
                      const end = prompt("End time (e.g., 2:00 or 01:32:00):");
                      if (start && end) {
                        handleCommandClick(`extract sound ${url} --start ${start} --end ${end}`);
                      }
                    }
                  }}
                >
                  <svg className={styles.subButtonIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                  </svg>
                  <span>Extract Timestamp</span>
                </button>
                <button
                  className={styles.subButton}
                  onClick={() => {
                    const url = prompt("Enter YouTube URL:");
                    if (url) {
                      const format = prompt("Format (mp3, wav, flac, aac, ogg):", "mp3");
                      if (format) {
                        handleCommandClick(`extract sound ${url} --format ${format}`);
                      }
                    }
                  }}
                >
                  <svg className={styles.subButtonIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M13,13V18H10V13H8L11.5,9.5L15,13H13Z" />
                  </svg>
                  <span>Custom Format</span>
                </button>
              </div>
            </details>
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
        id: "network",
        title: "Network",
        content: <NetworkSection />,
      },
      {
        id: "farming",
        title: "Farming",
        content: <FarmingSection />,
      },
      {
        id: "bots",
        title: "Bots (coming soon)",
        content: <BotSection />,
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

  // Apply custom section order
  const orderedSections = useMemo(() => {
    if (sectionOrder.length === 0) {
      return sections;
    }

    // Create a map for quick lookup
    const sectionMap = new Map(sections.map((s) => [s.id, s]));
    const ordered: typeof sections = [];

    // Add sections in the saved order
    sectionOrder.forEach((id) => {
      const section = sectionMap.get(id);
      if (section) {
        ordered.push(section);
        sectionMap.delete(id);
      }
    });

    // Add any remaining sections that weren't in the saved order (new sections)
    sectionMap.forEach((section) => {
      ordered.push(section);
    });

    return ordered;
  }, [sections, sectionOrder]);

  // Filter sections based on search query
  // Enhanced to search through ALL commands and subcommands
  const filteredSections = useMemo(() => {
    const sectionsToFilter = orderedSections;
    
    if (!searchQuery.trim()) {
      return sectionsToFilter;
    }

    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/).filter((w) => w.length > 0);
    const matching: typeof sectionsToFilter = [];

    // Get all command search terms for comprehensive matching
    const allCommandTerms = searchableIndex["all-commands"] || [];

    sectionsToFilter.forEach((section) => {
      // Check if section title matches
      if (section.title.toLowerCase().includes(query)) {
        matching.push(section);
        return;
      }

      // Check if any button in section matches using searchable index
      const sectionKeywords = searchableIndex[section.id] || [];
      
      // Enhanced matching: check for partial matches, word matches, and command matches
      const hasMatch = 
        // Direct keyword match (bidirectional - query in keyword OR keyword in query)
        sectionKeywords.some((keyword) => {
          const lowerKeyword = keyword.toLowerCase();
          return lowerKeyword.includes(query) || query.includes(lowerKeyword);
        }) ||
        // Multi-word search (all words must match somewhere, bidirectional)
        (queryWords.length > 1 && queryWords.every((word) =>
          sectionKeywords.some((keyword) => {
            const lowerKeyword = keyword.toLowerCase();
            return lowerKeyword.includes(word) || word.includes(lowerKeyword);
          })
        )) ||
        // Single word search - check if any keyword contains the word or vice versa
        (queryWords.length === 1 && sectionKeywords.some((keyword) => {
          const lowerKeyword = keyword.toLowerCase();
          const word = queryWords[0];
          return lowerKeyword.includes(word) || word.includes(lowerKeyword);
        })) ||
        // Command name match (exact or partial)
        allCommandTerms.some((term) => {
          const lowerTerm = term.toLowerCase();
          return lowerTerm === query || 
                 lowerTerm.includes(query) || 
                 query.includes(lowerTerm) ||
                 // Subcommand matching (e.g., "pgt track" matches "pgt" or "track")
                 (lowerTerm.includes(":") && lowerTerm.split(":").some((part) => part.includes(query))) ||
                 (lowerTerm.includes(" ") && lowerTerm.split(" ").some((part) => part.includes(query)));
        });

      if (hasMatch) {
        matching.push(section);
      }
    });

    return matching;
  }, [orderedSections, searchQuery, searchableIndex]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        setActiveId(null);
        return;
      }

      setSectionOrder((items) => {
        // If no saved order, use current section order
        const currentOrder =
          items.length > 0 ? items : sections.map((s) => s.id);

        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);

        if (oldIndex === -1 || newIndex === -1) {
          setActiveId(null);
          return items;
        }

        const newOrder = arrayMove(currentOrder, oldIndex, newIndex);

        // Save to localStorage
        try {
          localStorage.setItem(
            "omega-sidebar-section-order",
            JSON.stringify(newOrder)
          );
        } catch (error) {
          console.error("Failed to save section order:", error);
        }

        setActiveId(null);
        return newOrder;
      });
    },
    [sections]
  );

  // Auto-expand sections when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const matchingSectionIds = filteredSections.map((s) => s.id);
      setExpandedSections((prev) => {
        const combined = new Set([...prev, ...matchingSectionIds]);
        return Array.from(combined);
      });
    }
  }, [searchQuery, filteredSections]);

  if (!isHydrated) {
    return <aside className={styles.sidebar} />;
  }

  return (
    <aside className={styles.sidebar}>
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" fill="currentColor" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search quick actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              // Expand all sections when searching starts
              if (searchQuery.trim()) {
                const allIds = filteredSections.map((s) => s.id);
                setExpandedSections(allIds);
              }
            }}
          />
          {searchQuery && (
            <button
              className={styles.searchClear}
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              type="button"
            >
              <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <div className={styles.searchResults}>
            {filteredSections.length > 0 ? (
              <span>{filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} found</span>
            ) : (
              <span>No results found</span>
            )}
          </div>
        )}
      </div>

      {!commandsInitialized && (
        <div className={styles.disabledMessage}>
          Command shortcuts limited while modules load.
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredSections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredSections.map((s) => {
            const isOpen = expandedSections.includes(s.id);
            return (
              <SortableSection
                key={s.id}
                section={s}
                isOpen={isOpen}
                onToggle={handleSectionToggle}
                getSectionIcon={getSectionIcon}
                styles={styles}
              />
            );
          })}
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div className={styles.dragOverlay}>
              {filteredSections.find((s) => s.id === activeId)?.title || ""}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </aside>
  );
}

export default DashboardSidebar;
