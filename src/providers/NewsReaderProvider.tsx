"use client";

/**
 * News Reader Provider
 *
 * Manages crypto news state and API integration.
 * Fetches news from multiple sources with fallback chain (CryptoPanic, CryptoCompare, mock data).
 *
 * Features:
 * - Multi-source news aggregation
 * - Category filtering (hot, latest, bullish, bearish)
 * - Sentiment analysis from vote counts
 * - Auto-refresh every 5 minutes
 * - Cryptocurrency-specific news filtering
 * - Graceful fallback to mock data
 *
 * Data Sources:
 * - CryptoPanic (primary) - comprehensive crypto news with sentiment
 * - CryptoCompare (fallback) - crypto market news
 * - Mock data (last resort) - ensures graceful degradation
 *
 * Usage:
 *   <NewsReaderProvider>
 *     <YourApp />
 *   </NewsReaderProvider>
 *
 *   const { loadNews, setFilter, readerState } = useNewsReader();
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { cryptonews } from "@/lib/api";
import type { NewsReaderState, NewsArticle, NewsFilter } from "@/types/media";

// ============================================================================
// Types
// ============================================================================

interface NewsReaderContextValue {
  readerState: NewsReaderState;
  loadNews: (filter: NewsFilter, limit?: number) => Promise<void>;
  refreshNews: (silent?: boolean) => Promise<void>;
  setFilter: (filter: NewsFilter) => void;
  openPanel: () => Promise<void>;
  closePanel: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// Context
// ============================================================================

const NewsReaderContext = createContext<NewsReaderContextValue | undefined>(
  undefined
);

// ============================================================================
// Provider Component
// ============================================================================

export function NewsReaderProvider({ children }: { children: ReactNode }) {
  const [readerState, setReaderState] = useState<NewsReaderState>({
    articles: [],
    currentFilter: "hot",
    isPanelOpen: false,
    isLoading: false,
  });

  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================================================
  // News Loading
  // ==========================================================================

  const loadNews = useCallback(
    async (filter: NewsFilter, limit: number = 20) => {
      setReaderState((prev) => ({ ...prev, isLoading: true }));

      try {
        const articles = await cryptonews.getNews({ filter, limit });

        setReaderState((prev) => ({
          ...prev,
          articles,
          currentFilter: filter,
          isLoading: false,
        }));

        console.log(
          `[NewsReader] Loaded ${articles.length} articles (${filter})`
        );
      } catch (error) {
        console.error("[NewsReader] Failed to load news:", error);
        setReaderState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    []
  );

  const refreshNews = useCallback(
    async (silent: boolean = false) => {
      if (!silent) {
        setReaderState((prev) => ({ ...prev, isLoading: true }));
      }

      try {
        const articles = await cryptonews.getNews({
          filter: readerState.currentFilter,
          limit: 20,
        });

        setReaderState((prev) => ({
          ...prev,
          articles,
          isLoading: false,
        }));

        console.log(
          `[NewsReader] Refreshed ${articles.length} articles (${readerState.currentFilter})`
        );
      } catch (error) {
        console.error("[NewsReader] Failed to refresh news:", error);
        setReaderState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [readerState.currentFilter]
  );

  const setFilter = useCallback(
    (filter: NewsFilter) => {
      setReaderState((prev) => ({ ...prev, currentFilter: filter }));
      loadNews(filter, 20);
    },
    [loadNews]
  );

  // ==========================================================================
  // Panel Controls
  // ==========================================================================

  const openPanel = useCallback(async () => {
    setReaderState((prev) => ({ ...prev, isPanelOpen: true }));

    // Load initial news if not already loaded
    if (readerState.articles.length === 0) {
      await loadNews("hot", 20);
    }

    // Set up auto-refresh
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
    }

    autoRefreshIntervalRef.current = setInterval(() => {
      refreshNews(true); // Silent refresh
    }, AUTO_REFRESH_INTERVAL);
  }, [readerState.articles.length, loadNews, refreshNews]);

  const closePanel = useCallback(() => {
    setReaderState((prev) => ({ ...prev, isPanelOpen: false }));

    // Clear auto-refresh
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
      autoRefreshIntervalRef.current = null;
    }
  }, []);

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  useEffect(() => {
    // Cleanup auto-refresh on unmount
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, []);

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const value: NewsReaderContextValue = {
    readerState,
    loadNews,
    refreshNews,
    setFilter,
    openPanel,
    closePanel,
  };

  return (
    <NewsReaderContext.Provider value={value}>
      {children}
    </NewsReaderContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useNewsReader() {
  const context = useContext(NewsReaderContext);
  if (context === undefined) {
    throw new Error("useNewsReader must be used within NewsReaderProvider");
  }
  return context;
}
