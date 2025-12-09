"use client";

import React, { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { isAppMode } from "@/lib/utils/url-utils";
import Link from "next/link";
import { useTerminal } from "@/providers/TerminalProvider";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { usePerps } from "@/hooks/usePerps";
import { useNewsReader } from "@/hooks/useNewsReader";
import { useWallet } from "@/hooks/useWallet";
import { useViewMode } from "@/hooks/useViewMode";
import { useTheme } from "@/hooks/useTheme";
import { useCustomizer } from "@/hooks/useCustomizer";
import { SOCIAL_LINKS } from "@/lib/constants";
import type { AIProvider } from "@/types";
import { getMenuIcon } from "./MobileMenuIcons";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeCycle?: () => void;
  onPaletteCycle?: () => void;
  onDashboardToggle?: () => void;
  onAiProviderChange?: (provider: AIProvider) => void;
  aiProvider?: AIProvider;
  connectionStatus?: string;
  walletAddress?: string;
}

interface MenuItem {
  id: string;
  label: string;
  iconId: string;
  action: () => void;
  badge?: string | number;
  isConnected?: boolean;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

/**
 * MobileMenu Component
 * Slide-in drawer menu for quick access to terminal features on mobile devices
 */
export function MobileMenu({
  isOpen,
  onClose,
  onThemeCycle,
  onPaletteCycle,
  onDashboardToggle,
  onAiProviderChange,
  aiProvider,
  connectionStatus,
  walletAddress,
}: MobileMenuProps) {
  const {
    executeCommand,
    aiProvider: terminalAiProvider,
    setAiProvider,
  } = useTerminal();
  // Use prop aiProvider if provided, otherwise use terminal context
  const currentAiProvider =
    aiProvider !== undefined ? aiProvider : terminalAiProvider;
  const spotify = useSpotify();
  const youtube = useYouTube();
  const perps = usePerps();
  const news = useNewsReader();
  const wallet = useWallet();
  const viewMode = useViewMode();
  const theme = useTheme();
  const customizer = useCustomizer();

  // Swipe gesture state
  const menuRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Minimum swipe distance (in px) to trigger close
  const minSwipeDistance = 50;

  // Handle ESC key to close menu
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
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

  // Swipe gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || touchStart === null) return;

      const currentTouch = e.targetTouches[0].clientX;
      const diff = touchStart - currentTouch;

      // Only allow leftward swipes (to close)
      if (diff > 0) {
        setDragOffset(Math.min(diff, 320)); // Max offset is menu width
      }
      setTouchEnd(currentTouch);
    },
    [isDragging, touchStart]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    if (isLeftSwipe) {
      onClose();
    }

    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, onClose]);

  // Reset drag state when menu closes
  useEffect(() => {
    if (!isOpen) {
      setIsDragging(false);
      setDragOffset(0);
      setTouchStart(null);
      setTouchEnd(null);
    }
  }, [isOpen]);

  const handleSpotify = useCallback(() => {
    spotify.openPanel();
    onClose();
  }, [spotify, onClose]);

  const handleYouTube = useCallback(() => {
    youtube.openPanel();
    onClose();
  }, [youtube, onClose]);

  const handlePerps = useCallback(() => {
    perps.openPanel();
    onClose();
  }, [perps, onClose]);

  const handleNews = useCallback(() => {
    news.openPanel();
    onClose();
  }, [news, onClose]);

  const handleConnectWallet = useCallback(() => {
    void executeCommand("connect");
    onClose();
  }, [executeCommand, onClose]);

  const handleGames = useCallback(() => {
    void executeCommand("games");
    onClose();
  }, [executeCommand, onClose]);

  const handleMining = useCallback(() => {
    void executeCommand("mining");
    onClose();
  }, [executeCommand, onClose]);

  const handleMarkets = useCallback(() => {
    void executeCommand("markets");
    onClose();
  }, [executeCommand, onClose]);

  const handleCycleTheme = useCallback(() => {
    if (onThemeCycle) {
      onThemeCycle();
    } else {
      theme.toggleTheme();
    }
  }, [theme, onThemeCycle]);

  const handleCyclePalette = useCallback(() => {
    if (onPaletteCycle) {
      onPaletteCycle();
    } else {
      customizer.cycleColorPalette();
    }
  }, [customizer, onPaletteCycle]);

  const handleToggleAI = useCallback(() => {
    const providers: ("off" | "near" | "openai")[] = ["off", "near", "openai"];
    const currentProvider = currentAiProvider || "off";
    const currentIndex = providers.indexOf(currentProvider);
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + 1) % providers.length;
    const nextProvider = providers[nextIndex] || "off";
    if (onAiProviderChange) {
      onAiProviderChange(nextProvider);
    } else {
      setAiProvider(nextProvider);
    }
  }, [currentAiProvider, setAiProvider, onAiProviderChange]);

  const dynamicSections = useMemo(() => {
    const allDynamicSections: MenuSection[] = [
      {
        id: "media",
        title: "Media Players",
        items: [
          {
            id: "spotify",
            label: "Spotify",
            iconId: "spotify",
            action: handleSpotify,
          },
          {
            id: "youtube",
            label: "YouTube",
            iconId: "youtube",
            action: handleYouTube,
          },
          {
            id: "news",
            label: "News Reader",
            iconId: "news",
            action: handleNews,
          },
        ],
      },
      {
        id: "trading",
        title: "Trading",
        items: [
          {
            id: "markets",
            label: "Markets",
            iconId: "markets",
            action: handleMarkets,
          },
          {
            id: "perps",
            label: "Perps",
            iconId: "perps",
            action: handlePerps,
          },
          {
            id: "chart",
            label: "Charts",
            iconId: "chart",
            action: () => {
              void executeCommand("chart");
              onClose();
            },
          },
        ],
      },
    ];

    if (isAppMode()) {
      return allDynamicSections
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) =>
              item.id !== "youtube" && item.id !== "spotify" && item.id !== "perps"
          ),
        }))
        .filter((section) => section.items.length > 0);
    }

    return allDynamicSections;
  }, [handleSpotify, handleYouTube, handleNews, handleMarkets, handlePerps, executeCommand, onClose]);

  const sections: MenuSection[] = [
    {
      id: "navigation",
      title: "Navigation",
      items: [
        {
          id: "terminal",
          label: "Terminal",
          iconId: "terminal",
          action: () => {
            window.location.href = "/";
            onClose();
          },
        },
        {
          id: "games",
          label: "Games",
          iconId: "games",
          action: () => {
            window.location.href = "/games";
            onClose();
          },
        },
        {
          id: "nft",
          label: "NFT",
          iconId: "nft",
          action: () => {
            window.location.href = "/nft";
            onClose();
          },
        },
        {
          id: "media",
          label: "Media",
          iconId: "media",
          action: () => {
            window.location.href = "/media";
            onClose();
          },
        },
      ],
    },
    ...dynamicSections,
    {
      id: "quick",
      title: "Quick Actions",
      items: [
        {
          id: "wallet",
          label: wallet.state.isConnected
            ? "Wallet Connected"
            : "Connect Wallet",
          iconId: "wallet",
          action: handleConnectWallet,
          badge: wallet.state.isConnected ? "✓" : undefined,
        },
        {
          id: "games",
          label: "Games",
          iconId: "games",
          action: handleGames,
        },
        {
          id: "mining",
          label: "Mining",
          iconId: "mining",
          action: handleMining,
        },
      ],
    },
    {
      id: "settings",
      title: "Settings",
      items: [
        {
          id: "theme",
          label: "Cycle Theme",
          iconId: "theme",
          action: handleCycleTheme,
        },
        {
          id: "palette",
          label: "Cycle Palette",
          iconId: "palette",
          action: handleCyclePalette,
        },
        {
          id: "ai",
          label: `AI: ${currentAiProvider || "off"}`,
          iconId: "ai",
          action: handleToggleAI,
        },
        {
          id: "help",
          label: "Help",
          iconId: "help",
          action: () => {
            void executeCommand("help");
            onClose();
          },
        },
      ],
    },
    {
      id: "links",
      title: "Links",
      items: [
        {
          id: "website",
          label: "Website",
          iconId: "website",
          action: () => {
            window.open(SOCIAL_LINKS.website, "_blank");
            onClose();
          },
        },
        {
          id: "discord",
          label: "Discord",
          iconId: "discord",
          action: () => {
            window.open(SOCIAL_LINKS.discord, "_blank");
            onClose();
          },
        },
        {
          id: "twitter",
          label: "Twitter",
          iconId: "twitter",
          action: () => {
            window.open(SOCIAL_LINKS.twitter, "_blank");
            onClose();
          },
        },
        {
          id: "docs",
          label: "Documentation",
          iconId: "docs",
          action: () => {
            window.open(SOCIAL_LINKS.docs, "_blank");
            onClose();
          },
        },
      ],
    },
    {
      id: "status",
      title: "Status",
      items: [
        {
          id: "connection",
          label:
            connectionStatus === "connected" && walletAddress
              ? `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(
                  -4
                )}`
              : `Status: ${connectionStatus?.toUpperCase() || "DISCONNECTED"}`,
          iconId: "connection",
          action: handleConnectWallet,
          badge: connectionStatus === "connected" ? "✓" : undefined,
          isConnected: connectionStatus === "connected",
        },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close menu"
      />

      {/* Menu Drawer */}
      <aside
        ref={menuRef}
        className={`${styles.menu} ${isOpen ? styles.open : ""}`}
        aria-hidden={!isOpen}
        role="navigation"
        aria-label="Mobile menu"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(-${dragOffset}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        <header className={styles.menuHeader}>
          <h2 className={styles.menuTitle}>Omega Terminal</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
        </header>

        <nav className={styles.menuContent}>
          {sections.map((section) => (
            <section key={section.id} className={styles.menuSection}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              <ul className={styles.menuItems}>
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      className={styles.menuItem}
                      onClick={item.action}
                      type="button"
                      aria-label={item.label}
                    >
                      <span className={styles.menuIcon} aria-hidden="true">
                        {getMenuIcon(
                          item.iconId,
                          styles.menuIconSvg,
                          item.isConnected
                        )}
                      </span>
                      <span className={styles.menuLabel}>{item.label}</span>
                      {item.badge && (
                        <span className={styles.menuBadge} aria-label="Status">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </aside>
    </>
  );
}
