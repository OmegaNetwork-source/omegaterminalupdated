"use client";

/**
 * Parlay Builder Component
 * 
 * Full-featured interface for creating cross-platform prediction market parlays.
 * Fetches real market data from Polymarket and Kalshi, allows users to search,
 * filter, and build parlays with real-time odds calculations.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useParlay } from "@/hooks/useParlay";
import { useTradingAccounts } from "@/providers/TradingAccountsProvider";
import { useWallet } from "@/hooks/useWallet";
import { useAppKitAccount } from "@reown/appkit/react";
import { appKitInstance } from "../../../context";
import type { ParlayMarket, ParlaySide, LeverageLevel, RiskLevel } from "@/types/parlay";
import type { KalshiAccountConfig, PolymarketAccountConfig } from "@/types/trading-accounts";
import {
  calculateParlayOdds,
  calculateImpliedProbability,
  calculatePotentialPayout,
  calculateRiskMetrics,
  calculateResolutionWindow,
  formatOdds,
  formatProbability,
  formatParlayValue,
} from "@/lib/parlay/calculations";
import { VENUE_LOGOS } from "@/lib/parlay/market-service";
import { TradingPanel, TradeOrder } from "./TradingPanel";
import { PredictionChart } from "./PredictionChart";
import styles from "./ParlayBuilder.module.css";
import Image from "next/image";
import type { MarketOutcome } from "@/types/parlay";

// =============================================================================
// Types
// =============================================================================

interface MarketCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

type ViewMode = "search" | "trending" | "closing" | "community";
type SortOption = "volume" | "newest" | "closing" | "trending";
type DaysFilter = "any" | "today" | "1-3" | "3-7" | "7-14" | "14-30" | "30+";
type LiquidityFilter = "any" | "low" | "medium" | "high";
type CommunitySubView = "featured" | "pools" | "wins" | "create";

// Community Types
interface CommunityPool {
  id: string;
  name: string;
  creator: {
    name: string;
    avatar?: string;
    isAmbassador: boolean;
    winRate: number;
  };
  legs: Array<{
    marketId: string;
    question: string;
    side: "yes" | "no";
    odds: number;
  }>;
  totalLiquidity: number;
  participants: number;
  maxParticipants: number;
  minEntry: number;
  maxEntry: number;
  potentialPayout: number;
  totalOdds: number;
  tierPayouts: Array<{
    tier: number;
    minContribution: number;
    multiplier: number;
  }>;
  status: "open" | "locked" | "resolved" | "cancelled";
  createdAt: number;
  resolutionDate: number;
  tags: string[];
}

interface BigWin {
  id: string;
  userName: string;
  userAvatar?: string;
  poolName: string;
  amountWon: number;
  amountStaked: number;
  multiplier: number;
  timestamp: number;
  legs: number;
}

interface AIPoolInsight {
  signal: "buy" | "sell" | "hold";
  confidence: number;
  summary: string;
  riskLevel: "low" | "medium" | "high";
  keyFactors: string[];
  timestamp: number;
}

interface DaysFilterOption {
  id: DaysFilter;
  label: string;
  minDays: number;
  maxDays: number | null;
}

interface LiquidityFilterOption {
  id: LiquidityFilter;
  label: string;
  icon: string;
  minLiquidity: number;
  maxLiquidity: number | null;
  color: string;
}

// =============================================================================
// Constants
// =============================================================================

const CATEGORIES: MarketCategory[] = [
  { id: "politics", name: "Politics", icon: "POL", description: "Elections, policy" },
  { id: "crypto", name: "Crypto", icon: "BTC", description: "BTC, ETH, DeFi" },
  { id: "economics", name: "Economics", icon: "ECO", description: "Fed, GDP" },
  { id: "sports", name: "Sports", icon: "SPT", description: "NFL, NBA" },
  { id: "tech", name: "Tech", icon: "TEC", description: "AI, companies" },
  { id: "culture", name: "Culture", icon: "CUL", description: "Entertainment" },
  { id: "science", name: "Science", icon: "SCI", description: "Climate, space" },
];

const DAYS_FILTERS: DaysFilterOption[] = [
  { id: "any", label: "Any Time", minDays: 0, maxDays: null },
  { id: "today", label: "Today", minDays: 0, maxDays: 1 },
  { id: "1-3", label: "1-3 Days", minDays: 1, maxDays: 3 },
  { id: "3-7", label: "3-7 Days", minDays: 3, maxDays: 7 },
  { id: "7-14", label: "1-2 Weeks", minDays: 7, maxDays: 14 },
  { id: "14-30", label: "2-4 Weeks", minDays: 14, maxDays: 30 },
  { id: "30+", label: "30+ Days", minDays: 30, maxDays: null },
];

const LIQUIDITY_FILTERS: LiquidityFilterOption[] = [
  { id: "any", label: "Any", icon: "💧", minLiquidity: 0, maxLiquidity: null, color: "#888" },
  { id: "low", label: "Low", icon: "🔹", minLiquidity: 0, maxLiquidity: 10000, color: "#3b82f6" },
  { id: "medium", label: "Medium", icon: "🔷", minLiquidity: 10000, maxLiquidity: 50000, color: "#8b5cf6" },
  { id: "high", label: "High", icon: "💎", minLiquidity: 50000, maxLiquidity: null, color: "#00ffd6" },
];

// =============================================================================
// Custom Hooks
// =============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// Component
// =============================================================================

export function ParlayBuilder() {
  const {
    builder,
    closeBuilder,
    setBuilderName,
    setBuilderStake,
    setBuilderLeverage,
    addMarketToBuilder,
    removeMarketFromBuilder,
    clearBuilder,
    createLineup,
    isLoading,
    error,
  } = useParlay();

  // Trading accounts
  const {
    accounts,
    connectKalshi,
    disconnectKalshi,
    connectPolymarket,
    disconnectPolymarket,
    isLoading: isAccountsLoading,
  } = useTradingAccounts();
  
  // Wallet connection (WalletConnect / Web3)
  const wallet = useWallet();
  const { address: appKitAddress, isConnected: isAppKitConnected } = useAppKitAccount();

  // Market state
  const [markets, setMarkets] = useState<ParlayMarket[]>([]);
  const [trendingMarkets, setTrendingMarkets] = useState<ParlayMarket[]>([]);
  const [closingMarkets, setClosingMarkets] = useState<ParlayMarket[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [venueFilter, setVenueFilter] = useState<"all" | "polymarket" | "kalshi">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [daysFilter, setDaysFilter] = useState<DaysFilter>("any");
  const [liquidityFilter, setLiquidityFilter] = useState<LiquidityFilter>("any");
  const [sortBy, setSortBy] = useState<SortOption>("volume");
  const [viewMode, setViewMode] = useState<ViewMode>("search");

  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  // Trading Panel state
  const [tradingMarket, setTradingMarket] = useState<ParlayMarket | null>(null);
  const [showTradingPanel, setShowTradingPanel] = useState(false);
  
  // Chart Panel state
  const [chartMarket, setChartMarket] = useState<ParlayMarket | null>(null);
  const [showChartPanel, setShowChartPanel] = useState(false);
  
  // Account connection modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectingVenue, setConnectingVenue] = useState<"kalshi" | "polymarket" | null>(null);
  const [connectMode, setConnectMode] = useState<"wallet" | "trading" | null>(null);
  const [kalshiApiKeyId, setKalshiApiKeyId] = useState("");
  const [kalshiPrivateKey, setKalshiPrivateKey] = useState("");
  const [polyPrivateKey, setPolyPrivateKey] = useState("");
  const [polyProxyWallet, setPolyProxyWallet] = useState("");
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  // Community state
  const [communitySubView, setCommunitySubView] = useState<CommunitySubView>("featured");
  const [communityPools, setCommunityPools] = useState<CommunityPool[]>([]);
  const [featuredPools, setFeaturedPools] = useState<CommunityPool[]>([]);
  const [bigWins, setBigWins] = useState<BigWin[]>([]);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(false);
  const [newPoolName, setNewPoolName] = useState("");
  const [newPoolMinEntry, setNewPoolMinEntry] = useState(10);
  const [newPoolMaxEntry, setNewPoolMaxEntry] = useState(1000);
  const [newPoolMaxParticipants, setNewPoolMaxParticipants] = useState(100);
  
  // Join pool modal state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedPoolToJoin, setSelectedPoolToJoin] = useState<CommunityPool | null>(null);
  const [joinEntryAmount, setJoinEntryAmount] = useState(0);
  
  // AI Insights state
  const [aiInsights, setAiInsights] = useState<Record<string, AIPoolInsight>>({});
  const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({});
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const marketListRef = useRef<HTMLDivElement>(null);
  
  // Check if any accounts are connected
  const isKalshiConnected = accounts.kalshi.status === "connected";
  const isPolymarketConnected = accounts.polymarket.status === "connected";
  const isWalletConnected = wallet.state.isConnected || isAppKitConnected;
  const hasAnyConnection = isKalshiConnected || isPolymarketConnected || isWalletConnected;
  const connectedWalletAddress = wallet.state.address || appKitAddress;
  
  // ===========================================================================
  // Account Connection Handlers
  // ===========================================================================
  
  const handleConnectKalshi = useCallback(async () => {
    if (!kalshiApiKeyId || !kalshiPrivateKey) {
      setConnectError("Please enter both API Key ID and Private Key");
      return;
    }
    
    setIsConnecting(true);
    setConnectError(null);
    
    try {
      const success = await connectKalshi({
        apiKeyId: kalshiApiKeyId,
        privateKey: kalshiPrivateKey,
      });
      
      if (success) {
        setShowConnectModal(false);
        setKalshiApiKeyId("");
        setKalshiPrivateKey("");
        setConnectingVenue(null);
      } else {
        setConnectError("Failed to connect. Check your credentials.");
      }
    } catch (err: any) {
      setConnectError(err.message || "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  }, [kalshiApiKeyId, kalshiPrivateKey, connectKalshi]);
  
  const handleConnectPolymarket = useCallback(async () => {
    if (!polyPrivateKey) {
      setConnectError("Please enter your wallet private key");
      return;
    }
    
    setIsConnecting(true);
    setConnectError(null);
    
    try {
      const success = await connectPolymarket({
        privateKey: polyPrivateKey,
        proxyWallet: polyProxyWallet || undefined,
      });
      
      if (success) {
        setShowConnectModal(false);
        setPolyPrivateKey("");
        setPolyProxyWallet("");
        setConnectingVenue(null);
      } else {
        setConnectError("Failed to connect. Check your credentials.");
      }
    } catch (err: any) {
      setConnectError(err.message || "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  }, [polyPrivateKey, polyProxyWallet, connectPolymarket]);
  
  // Handle WalletConnect / AppKit connection
  const handleWalletConnect = useCallback(async () => {
    setIsConnecting(true);
    setConnectError(null);
    
    try {
      if (appKitInstance) {
        // Open AppKit modal for WalletConnect
        await appKitInstance.open();
        setShowConnectModal(false);
      } else {
        // Fallback message
        setConnectError("WalletConnect is available on mobile. Use MetaMask on desktop.");
      }
    } catch (err: any) {
      setConnectError(err.message || "WalletConnect failed");
    } finally {
      setIsConnecting(false);
    }
  }, []);
  
  // Handle Google Sign-In
  const handleGoogleSignIn = useCallback(async () => {
    setIsConnecting(true);
    setConnectError(null);
    
    try {
      if (appKitInstance) {
        // Open AppKit with social login option
        await appKitInstance.open({ view: "Connect" });
        setShowConnectModal(false);
      } else {
        // Open a Google OAuth flow or show instructions
        window.open("https://accounts.google.com", "_blank");
        setConnectError("Please complete Google sign-in in the new window");
      }
    } catch (err: any) {
      setConnectError(err.message || "Google sign-in failed");
    } finally {
      setIsConnecting(false);
    }
  }, []);
  
  // Handle Email Sign-In
  const handleEmailSignIn = useCallback(async () => {
    if (!emailInput || !emailInput.includes("@")) {
      setConnectError("Please enter a valid email address");
      return;
    }
    
    setIsConnecting(true);
    setConnectError(null);
    
    try {
      if (appKitInstance) {
        // Open AppKit which supports email login
        await appKitInstance.open({ view: "Connect" });
        setIsEmailSent(true);
      } else {
        // Show email sent message (would need backend for magic link)
        setIsEmailSent(true);
        setConnectError("Email login requires mobile app or backend setup");
      }
    } catch (err: any) {
      setConnectError(err.message || "Email sign-in failed");
    } finally {
      setIsConnecting(false);
    }
  }, [emailInput]);
  
  // Handle wallet disconnect
  const handleWalletDisconnect = useCallback(async () => {
    try {
      await wallet.disconnect();
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  }, [wallet]);

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  // ==========================================================================
  // Data Fetching
  // ==========================================================================

  const fetchMarkets = useCallback(async (reset: boolean = false) => {
    setIsLoadingMarkets(true);
    setMarketError(null);

    const currentOffset = reset ? 0 : offset;

    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (venueFilter !== "all") params.set("venue", venueFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      
      // Add days filter parameters
      const selectedDaysFilter = DAYS_FILTERS.find(f => f.id === daysFilter);
      if (selectedDaysFilter && daysFilter !== "any") {
        params.set("minDays", String(selectedDaysFilter.minDays));
        if (selectedDaysFilter.maxDays !== null) {
          params.set("maxDays", String(selectedDaysFilter.maxDays));
        }
      }
      
      params.set("sort", sortBy);
      params.set("limit", "30");
      params.set("offset", String(currentOffset));

      const response = await fetch(`/api/parlays/markets?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch markets");
      }

      if (reset) {
        setMarkets(data.markets || []);
        setOffset(30);
      } else {
        setMarkets(prev => [...prev, ...(data.markets || [])]);
        setOffset(currentOffset + 30);
      }
      setHasMore(data.hasMore || false);
    } catch (err: any) {
      console.error("[ParlayBuilder] Market fetch error:", err);
      setMarketError(err.message || "Failed to load markets");
    } finally {
      setIsLoadingMarkets(false);
    }
  }, [debouncedSearch, venueFilter, categoryFilter, daysFilter, sortBy, offset]);

  const fetchTrending = useCallback(async () => {
    try {
      const response = await fetch("/api/parlays/markets?mode=trending&limit=10");
      const data = await response.json();
      if (data.success) {
        setTrendingMarkets(data.markets || []);
      }
    } catch (err) {
      console.error("[ParlayBuilder] Trending fetch error:", err);
    }
  }, []);

  const fetchClosingSoon = useCallback(async () => {
    try {
      const response = await fetch("/api/parlays/markets?mode=closing&days=7&limit=10");
      const data = await response.json();
      if (data.success) {
        setClosingMarkets(data.markets || []);
      }
    } catch (err) {
      console.error("[ParlayBuilder] Closing soon fetch error:", err);
    }
  }, []);

  const fetchCommunityData = useCallback(async () => {
    setIsLoadingCommunity(true);
    try {
      // Fetch all pools, featured pools, and big wins in parallel
      const [allPoolsRes, featuredRes, winsRes] = await Promise.all([
        fetch("/api/parlays/community?mode=all&limit=20"),
        fetch("/api/parlays/community?mode=featured&limit=10"),
        fetch("/api/parlays/community?mode=wins&limit=10"),
      ]);

      const [allPoolsData, featuredData, winsData] = await Promise.all([
        allPoolsRes.json(),
        featuredRes.json(),
        winsRes.json(),
      ]);

      if (allPoolsData.success) {
        setCommunityPools(allPoolsData.pools || []);
      }
      if (featuredData.success) {
        setFeaturedPools(featuredData.pools || []);
      }
      if (winsData.success) {
        setBigWins(winsData.wins || []);
      }
    } catch (err) {
      console.error("[ParlayBuilder] Community fetch error:", err);
    } finally {
      setIsLoadingCommunity(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (builder.isOpen) {
      fetchMarkets(true);
      fetchTrending();
      fetchClosingSoon();
      fetchCommunityData();
    }
  }, [builder.isOpen]);

  // Re-fetch when filters change
  useEffect(() => {
    if (builder.isOpen && viewMode === "search") {
      fetchMarkets(true);
    }
  }, [debouncedSearch, venueFilter, categoryFilter, daysFilter, sortBy, viewMode]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (!marketListRef.current || isLoadingMarkets || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = marketListRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      fetchMarkets(false);
    }
  }, [fetchMarkets, isLoadingMarkets, hasMore]);

  // ==========================================================================
  // Display Markets
  // ==========================================================================

  const displayMarkets = useMemo(() => {
    let baseMarkets: typeof markets;
    switch (viewMode) {
      case "trending":
        baseMarkets = trendingMarkets;
        break;
      case "closing":
        baseMarkets = closingMarkets;
        break;
      default:
        baseMarkets = markets;
    }
    
    // Apply liquidity filter
    if (liquidityFilter !== "any") {
      const selectedLiqFilter = LIQUIDITY_FILTERS.find(f => f.id === liquidityFilter);
      if (selectedLiqFilter) {
        baseMarkets = baseMarkets.filter(market => {
          const liquidity = market.liquidity || 0;
          const meetsMin = liquidity >= selectedLiqFilter.minLiquidity;
          const meetsMax = selectedLiqFilter.maxLiquidity === null || liquidity < selectedLiqFilter.maxLiquidity;
          return meetsMin && meetsMax;
        });
      }
    }
    
    return baseMarkets;
  }, [viewMode, markets, trendingMarkets, closingMarkets, liquidityFilter]);

  // ==========================================================================
  // Calculations
  // ==========================================================================

  const selectedLegs = builder.selectedLegs;

  const calculations = useMemo(() => {
    if (selectedLegs.length === 0) {
      return {
        totalOdds: 1,
        impliedProbability: 1,
        potentialPayout: builder.stake,
        risk: {
          score: 0,
          level: "low" as RiskLevel,
          correlationRisk: 0,
          timeRisk: 0,
          leverageRisk: 0,
          liquidityRisk: 0,
          legCountRisk: 0,
          warnings: [],
          suggestions: [],
        },
        resolutionWindow: {
          earliest: Date.now(),
          latest: Date.now(),
          durationDays: 0,
          spreadDays: 0,
        },
      };
    }

    const oddsLegs = selectedLegs.map((leg) => ({
      price: leg.side === "yes" ? leg.market.yesPrice : leg.market.noPrice,
      side: leg.side,
    }));

    // Calculate TRUE parlay odds without any leverage
    const totalOdds = calculateParlayOdds(oddsLegs);
    const impliedProbability = calculateImpliedProbability(oddsLegs);
    
    // Potential payout is stake * true odds (no leverage for regular parlays)
    // Leverage is only applied when creating community pools
    const potentialPayout = calculatePotentialPayout(
      builder.stake,
      totalOdds,
      1 // No leverage for regular parlay display
    );

    const resolutionWindow = calculateResolutionWindow(
      selectedLegs.map((l) => ({ resolutionDate: l.market.resolutionDate }))
    );

    // Risk metrics without leverage factor for regular parlays
    const risk = calculateRiskMetrics(
      selectedLegs.map((l) => ({
        category: l.market.category,
        venue: l.market.venue,
        volume24h: l.market.volume24h,
      })),
      resolutionWindow,
      1 // No leverage risk for regular parlays
    );

    return {
      totalOdds,
      impliedProbability,
      potentialPayout,
      risk,
      resolutionWindow,
    };
  }, [selectedLegs, builder.stake]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleMarketSelect = useCallback(
    (market: ParlayMarket, side: ParlaySide) => {
      const existingIndex = selectedLegs.findIndex(
        (l) => l.market.id === market.id
      );

      if (existingIndex >= 0) {
        if (selectedLegs[existingIndex].side === side) {
          removeMarketFromBuilder(market.id);
        } else {
          removeMarketFromBuilder(market.id);
          addMarketToBuilder(market, side);
        }
      } else {
        addMarketToBuilder(market, side);
      }
    },
    [selectedLegs, addMarketToBuilder, removeMarketFromBuilder]
  );

  // Open trading panel for a specific market
  const openTradingPanel = useCallback((market: ParlayMarket) => {
    setTradingMarket(market);
    setShowTradingPanel(true);
  }, []);

  // Close trading panel
  const closeTradingPanel = useCallback(() => {
    setShowTradingPanel(false);
    setTradingMarket(null);
  }, []);

  // Open chart panel for a specific market
  const openChartPanel = useCallback((market: ParlayMarket) => {
    setChartMarket(market);
    setShowChartPanel(true);
  }, []);

  // Close chart panel
  const closeChartPanel = useCallback(() => {
    setShowChartPanel(false);
    setChartMarket(null);
  }, []);

  // Handle outcome selection from chart (for multi-outcome markets)
  const handleOutcomeSelect = useCallback((market: ParlayMarket, outcome: MarketOutcome) => {
    // Create a modified market with the selected outcome's prices
    const modifiedMarket: ParlayMarket = {
      ...market,
      yesPrice: outcome.yesPrice,
      noPrice: outcome.noPrice,
      question: `${market.question} - ${outcome.label}`,
    };
    addMarketToBuilder(modifiedMarket, "yes");
    closeChartPanel();
  }, [addMarketToBuilder, closeChartPanel]);

  // Handle trade execution from trading panel
  const handleTradeExecution = useCallback(async (trade: TradeOrder) => {
    console.log("[TradingPanel] Executing trade:", trade);
    
    // Check if user is connected to the appropriate venue
    const venue = tradingMarket?.venue;
    
    if (venue === "kalshi" && !isKalshiConnected) {
      alert("Please connect your Kalshi account first");
      return;
    }
    if (venue === "polymarket" && !isPolymarketConnected) {
      alert("Please connect your Polymarket account first");
      return;
    }

    try {
      // In a real implementation, this would call the trading API
      // For now, we'll simulate the trade
      const response = await fetch("/api/parlays/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venue,
          marketId: trade.marketId,
          side: trade.side,
          action: trade.action,
          amount: trade.amount,
          price: trade.price,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Trade executed successfully! Order ID: ${data.orderId || "N/A"}`);
        closeTradingPanel();
      } else {
        alert(`Trade failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("[TradingPanel] Trade error:", error);
      alert("Trade execution failed. Please try again.");
    }
  }, [tradingMarket, isKalshiConnected, isPolymarketConnected, closeTradingPanel]);

  const handleCreate = useCallback(async () => {
    if (selectedLegs.length < 2) {
      setCreateError("Add at least 2 markets to create a parlay");
      return;
    }

    if (!builder.name.trim()) {
      setCreateError("Please enter a name for your lineup");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      await createLineup({
        name: builder.name,
        description: builder.description,
        stake: builder.stake,
        leverage: builder.leverage,
        legs: selectedLegs.map((leg) => ({
          marketId: leg.market.id,
          venue: leg.market.venue,
          side: leg.side,
        })),
        isPublic: false,
      });

      closeBuilder();
    } catch (err: any) {
      setCreateError(err.message || "Failed to create lineup");
    } finally {
      setIsCreating(false);
    }
  }, [selectedLegs, builder, createLineup, closeBuilder]);

  // ==========================================================================
  // Format Helpers
  // ==========================================================================

  const formatVolume = (vol: number): string => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
    return `$${vol.toFixed(0)}`;
  };

  const formatDaysLeft = (timestamp: number): string => {
    const days = Math.ceil((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return "Ended";
    if (days === 0) return "Today";
    if (days === 1) return "1 day";
    return `${days} days`;
  };

  const formatTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const handleCreatePool = async () => {
    if (!newPoolName.trim() || selectedLegs.length < 2) {
      setCreateError("Name your pool and add at least 2 markets");
      return;
    }
    
    setIsCreating(true);
    setCreateError(null);
    
    try {
      const legs = selectedLegs.map(leg => ({
        marketId: leg.market.id,
        venue: leg.market.venue,
        question: leg.market.question,
        side: leg.side,
        odds: 1 / (leg.side === "yes" ? leg.market.yesPrice : leg.market.noPrice),
      }));
      
      const response = await fetch("/api/parlays/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: newPoolName,
          legs,
          minEntry: newPoolMinEntry,
          maxEntry: newPoolMaxEntry,
          maxParticipants: newPoolMaxParticipants,
          initialLiquidity: builder.stake,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Reset form and refresh
        setNewPoolName("");
        clearBuilder();
        fetchCommunityData();
        setCommunitySubView("pools");
      } else {
        setCreateError(data.error || "Failed to create pool");
      }
    } catch (err) {
      console.error("[ParlayBuilder] Create pool error:", err);
      setCreateError("Failed to create pool");
    } finally {
      setIsCreating(false);
    }
  };

  // Open join modal
  const openJoinModal = (pool: CommunityPool) => {
    setSelectedPoolToJoin(pool);
    setJoinEntryAmount(pool.minEntry);
    setJoinModalOpen(true);
    // Auto-fetch AI insight when opening modal
    if (!aiInsights[pool.id]) {
      fetchAIInsight(pool);
    }
  };

  // Close join modal
  const closeJoinModal = () => {
    setJoinModalOpen(false);
    setSelectedPoolToJoin(null);
    setJoinEntryAmount(0);
  };

  // Confirm join with selected amount
  const confirmJoinPool = async () => {
    if (!selectedPoolToJoin) return;
    
    try {
      const response = await fetch("/api/parlays/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          poolId: selectedPoolToJoin.id,
          amount: joinEntryAmount,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchCommunityData();
        closeJoinModal();
      } else {
        setCreateError(data.error || "Failed to join pool");
      }
    } catch (err) {
      console.error("[ParlayBuilder] Join pool error:", err);
      setCreateError("Failed to join pool");
    }
  };

  // Calculate tier for entry amount
  const getEntryTier = (pool: CommunityPool, amount: number) => {
    for (const tier of pool.tierPayouts) {
      if (amount >= tier.minContribution) {
        return tier;
      }
    }
    return pool.tierPayouts[pool.tierPayouts.length - 1];
  };

  // Fetch AI insight for a pool
  const fetchAIInsight = async (pool: CommunityPool) => {
    if (loadingInsights[pool.id]) return;
    
    setLoadingInsights(prev => ({ ...prev, [pool.id]: true }));
    
    try {
      // Generate AI insight based on pool data
      // In production, this would call an AI endpoint
      const insight = generatePoolInsight(pool);
      setAiInsights(prev => ({ ...prev, [pool.id]: insight }));
    } catch (err) {
      console.error("[ParlayBuilder] AI insight error:", err);
    } finally {
      setLoadingInsights(prev => ({ ...prev, [pool.id]: false }));
    }
  };

  // Generate AI insight (simulated - would use actual AI in production)
  const generatePoolInsight = (pool: CommunityPool): AIPoolInsight => {
    // Calculate metrics
    const participationRate = pool.participants / pool.maxParticipants;
    const liquidityScore = Math.min(pool.totalLiquidity / 50000, 1);
    const oddsValue = pool.totalOdds > 3 ? "high" : pool.totalOdds > 2 ? "medium" : "low";
    const timeToClose = (pool.resolutionDate - Date.now()) / (1000 * 60 * 60 * 24);
    const creatorWinRate = pool.creator.winRate;
    
    // Determine signal based on factors
    let signalScore = 0;
    const factors: string[] = [];
    
    // Win rate factor
    if (creatorWinRate > 65) {
      signalScore += 30;
      factors.push(`Creator has ${creatorWinRate}% win rate`);
    } else if (creatorWinRate > 55) {
      signalScore += 15;
      factors.push(`Creator has decent ${creatorWinRate}% win rate`);
    } else {
      signalScore -= 10;
      factors.push(`Creator win rate below average at ${creatorWinRate}%`);
    }
    
    // Ambassador factor
    if (pool.creator.isAmbassador) {
      signalScore += 20;
      factors.push("Verified Ambassador creator");
    }
    
    // Liquidity factor
    if (liquidityScore > 0.5) {
      signalScore += 15;
      factors.push(`Strong pool liquidity (${formatVolume(pool.totalLiquidity)})`);
    }
    
    // Participation factor
    if (participationRate > 0.5) {
      signalScore += 10;
      factors.push("High community participation");
    } else if (participationRate < 0.2) {
      factors.push("Low participation - early entry opportunity");
    }
    
    // Time factor
    if (timeToClose < 3) {
      signalScore -= 5;
      factors.push("Resolves soon - limited time to join");
    } else if (timeToClose > 14) {
      factors.push("Longer resolution window");
    }
    
    // Odds factor
    if (pool.totalOdds > 4) {
      signalScore -= 10;
      factors.push(`High risk multiplier (${pool.totalOdds.toFixed(1)}x)`);
    } else if (pool.totalOdds > 2.5) {
      signalScore += 5;
      factors.push(`Attractive odds at ${pool.totalOdds.toFixed(1)}x`);
    }
    
    // Determine signal
    let signal: "buy" | "sell" | "hold" = "hold";
    if (signalScore >= 40) signal = "buy";
    else if (signalScore <= -10) signal = "sell";
    
    // Determine risk level
    let riskLevel: "low" | "medium" | "high" = "medium";
    if (pool.totalOdds > 5 || creatorWinRate < 50) riskLevel = "high";
    else if (pool.totalOdds < 2.5 && creatorWinRate > 60) riskLevel = "low";
    
    // Generate summary
    const summaries = {
      buy: [
        `Strong entry point. ${pool.creator.name}'s track record and pool fundamentals look solid.`,
        `Favorable conditions for this pool. Consider joining at Tier 1 or 2 for max multiplier.`,
        `AI analysis suggests positive expected value. Good risk-reward ratio.`,
      ],
      hold: [
        `Mixed signals. Monitor pool participation before committing.`,
        `Moderate opportunity. Entry could work but consider position sizing.`,
        `Wait for more clarity on market direction before joining.`,
      ],
      sell: [
        `Caution advised. Risk factors outweigh potential rewards.`,
        `Below-average creator metrics. Consider other pools.`,
        `High risk profile. Only for aggressive traders.`,
      ],
    };
    
    const summary = summaries[signal][Math.floor(Math.random() * 3)];
    
    return {
      signal,
      confidence: Math.min(Math.max(50 + signalScore, 30), 95),
      summary: summary || "Analysis in progress...",
      riskLevel,
      keyFactors: factors.slice(0, 4),
      timestamp: Date.now(),
    };
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  if (!builder.isOpen || !portalContainer) {
    return null;
  }

  const content = (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeBuilder()}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.title}>
              Omega Parlay Builder
            </div>
            <div className={styles.accountStatus}>
              {/* Wallet Badge */}
              <div 
                className={`${styles.accountBadge} ${isWalletConnected ? styles.connected : styles.disconnected}`}
                onClick={() => {
                  if (!isWalletConnected) {
                    setConnectMode("wallet");
                    setShowConnectModal(true);
                  }
                }}
                title={isWalletConnected ? `Wallet: ${connectedWalletAddress?.slice(0, 6)}...${connectedWalletAddress?.slice(-4)}` : "Click to connect wallet"}
              >
                <span className={styles.badgeIconWallet}>🔗</span>
                <span className={styles.badgeText}>{isWalletConnected ? "Wallet" : "Login"}</span>
              </div>
              {/* Kalshi Badge */}
              <div 
                className={`${styles.accountBadge} ${isKalshiConnected ? styles.connected : styles.disconnected}`}
                onClick={() => {
                  if (!isKalshiConnected) {
                    setConnectMode("trading");
                    setConnectingVenue("kalshi");
                    setShowConnectModal(true);
                  }
                }}
                title={isKalshiConnected ? "Kalshi Connected" : "Click to connect Kalshi"}
              >
                <span className={styles.badgeIcon}>K</span>
                <span className={styles.badgeText}>{isKalshiConnected ? "Kalshi" : "Kalshi"}</span>
              </div>
              {/* Polymarket Badge */}
              <div 
                className={`${styles.accountBadge} ${isPolymarketConnected ? styles.connected : styles.disconnected}`}
                onClick={() => {
                  if (!isPolymarketConnected) {
                    setConnectMode("trading");
                    setConnectingVenue("polymarket");
                    setShowConnectModal(true);
                  }
                }}
                title={isPolymarketConnected ? "Polymarket Connected" : "Click to connect Polymarket"}
              >
                <span className={styles.badgeIcon}>P</span>
                <span className={styles.badgeText}>{isPolymarketConnected ? "Poly" : "Poly"}</span>
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            {!hasAnyConnection && (
              <button 
                className={styles.connectAllButton}
                onClick={() => {
                  setConnectMode("wallet");
                  setShowConnectModal(true);
                }}
              >
                🔐 Login / Connect
              </button>
            )}
            <button className={styles.closeButton} onClick={closeBuilder}>
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Left Panel - Market Selection */}
          <div className={styles.leftPanel}>
            {/* View Mode Tabs */}
            <div className={styles.viewModeTabs}>
              <button
                className={`${styles.viewModeTab} ${viewMode === "search" ? styles.active : ""}`}
                onClick={() => setViewMode("search")}
              >
                Search
              </button>
              <button
                className={`${styles.viewModeTab} ${viewMode === "trending" ? styles.active : ""}`}
                onClick={() => setViewMode("trending")}
              >
                Trending
              </button>
              <button
                className={`${styles.viewModeTab} ${viewMode === "closing" ? styles.active : ""}`}
                onClick={() => setViewMode("closing")}
              >
                Closing Soon
              </button>
              <button
                className={`${styles.viewModeTab} ${styles.communityTab} ${viewMode === "community" ? styles.active : ""}`}
                onClick={() => setViewMode("community")}
              >
                Community
              </button>
            </div>

            {viewMode === "search" && (
              <div className={styles.searchSection}>
                <div className={styles.searchBar}>
                  <span className={styles.searchIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search markets by topic, keyword, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className={styles.clearSearch}
                      onClick={() => setSearchQuery("")}
                    >
                      x
                    </button>
                  )}
                </div>

                <div className={styles.filtersRow}>
                  <div className={styles.venueFilters}>
                    <button
                      className={`${styles.venueButton} ${venueFilter === "all" ? styles.active : ""}`}
                      onClick={() => setVenueFilter("all")}
                    >
                      All
                    </button>
                    <button
                      className={`${styles.venueButton} ${venueFilter === "polymarket" ? styles.active : ""}`}
                      onClick={() => setVenueFilter("polymarket")}
                    >
                      Poly
                    </button>
                    <button
                      className={`${styles.venueButton} ${venueFilter === "kalshi" ? styles.active : ""}`}
                      onClick={() => setVenueFilter("kalshi")}
                    >
                      Kalshi
                    </button>
                  </div>

                  <select
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                  >
                    <option value="volume">Volume</option>
                    <option value="trending">Trending</option>
                    <option value="newest">Newest</option>
                    <option value="closing">Closing</option>
                  </select>
                </div>

                {/* Days to Close Filter */}
                <div className={styles.daysFilterSection}>
                  <label className={styles.daysFilterLabel}>Days to Close:</label>
                  <div className={styles.daysFilterButtons}>
                    {DAYS_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        className={`${styles.daysFilterButton} ${daysFilter === filter.id ? styles.active : ""}`}
                        onClick={() => setDaysFilter(filter.id)}
                        title={`Filter markets closing ${filter.label.toLowerCase()}`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Liquidity Filter */}
                <div className={styles.liquidityFilterSection}>
                  <label className={styles.liquidityFilterLabel}>Liquidity:</label>
                  <div className={styles.liquidityFilterButtons}>
                    {LIQUIDITY_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        className={`${styles.liquidityFilterButton} ${liquidityFilter === filter.id ? styles.active : ""}`}
                        onClick={() => setLiquidityFilter(filter.id)}
                        title={filter.id === "any" 
                          ? "Show all markets" 
                          : filter.id === "low" 
                            ? "$0 - $10K liquidity" 
                            : filter.id === "medium" 
                              ? "$10K - $50K liquidity" 
                              : "$50K+ liquidity"
                        }
                        style={{ 
                          '--filter-color': filter.color 
                        } as React.CSSProperties}
                      >
                        <span className={styles.liquidityIcon}>{filter.icon}</span>
                        <span className={styles.liquidityLabel}>{filter.label}</span>
                        <span className={styles.liquidityRange}>
                          {filter.id === "any" ? "All" : 
                           filter.id === "low" ? "<$10K" : 
                           filter.id === "medium" ? "$10K-$50K" : 
                           "$50K+"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.categoryTabs}>
                  <button
                    className={`${styles.categoryTab} ${categoryFilter === null ? styles.active : ""}`}
                    onClick={() => setCategoryFilter(null)}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      className={`${styles.categoryTab} ${categoryFilter === cat.id ? styles.active : ""}`}
                      onClick={() => setCategoryFilter(cat.id)}
                      title={cat.description}
                    >
                      <span className={styles.categoryIcon}>{cat.icon}</span> {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Community Section */}
            {viewMode === "community" && (
              <div className={styles.communitySection}>
                {/* Community Sub-tabs */}
                <div className={styles.communitySubTabs}>
                  <button
                    className={`${styles.communitySubTab} ${communitySubView === "featured" ? styles.active : ""}`}
                    onClick={() => setCommunitySubView("featured")}
                  >
                    Featured Pools
                  </button>
                  <button
                    className={`${styles.communitySubTab} ${communitySubView === "pools" ? styles.active : ""}`}
                    onClick={() => setCommunitySubView("pools")}
                  >
                    All Pools
                  </button>
                  <button
                    className={`${styles.communitySubTab} ${communitySubView === "wins" ? styles.active : ""}`}
                    onClick={() => setCommunitySubView("wins")}
                  >
                    Big Wins
                  </button>
                  <button
                    className={`${styles.communitySubTab} ${communitySubView === "create" ? styles.active : ""}`}
                    onClick={() => setCommunitySubView("create")}
                  >
                    + Add Liquidity
                  </button>
                </div>

                {/* Featured Pools */}
                {communitySubView === "featured" && (
                  <div className={styles.poolsGrid}>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Ambassador Parlays</h3>
                      <span className={styles.sectionSubtitle}>Curated by top performers</span>
                    </div>
                    {isLoadingCommunity ? (
                      <div className={styles.loadingState}>
                        <div className={styles.spinner} />
                        <p>Loading community pools...</p>
                      </div>
                    ) : featuredPools.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p>No featured pools available</p>
                      </div>
                    ) : (
                      featuredPools.map((pool) => (
                        <div key={pool.id} className={styles.poolCard}>
                          <div className={styles.poolHeader}>
                            <div className={styles.poolCreator}>
                              <div className={styles.creatorAvatar}>
                                {pool.creator.name.charAt(0)}
                              </div>
                              <div className={styles.creatorInfo}>
                                <span className={styles.creatorName}>
                                  {pool.creator.name}
                                  {pool.creator.isAmbassador && (
                                    <span className={styles.ambassadorBadge}>AMB</span>
                                  )}
                                </span>
                                <span className={styles.creatorStats}>
                                  {pool.creator.winRate}% win rate
                                </span>
                              </div>
                            </div>
                            <span className={`${styles.poolStatus} ${styles[pool.status]}`}>
                              {pool.status}
                            </span>
                          </div>
                          
                          <h4 className={styles.poolName}>{pool.name}</h4>
                          
                          <div className={styles.poolLegs}>
                            {pool.legs.map((leg, i) => (
                              <div key={i} className={styles.poolLeg}>
                                <span className={`${styles.legSideSmall} ${styles[leg.side]}`}>
                                  {leg.side.toUpperCase()}
                                </span>
                                <span className={styles.poolLegQuestion}>
                                  {leg.question.length > 40 ? leg.question.slice(0, 40) + "..." : leg.question}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className={styles.poolStats}>
                            <div className={styles.poolStat}>
                              <span className={styles.poolStatLabel}>Pool Size</span>
                              <span className={styles.poolStatValue}>{formatVolume(pool.totalLiquidity)}</span>
                            </div>
                            <div className={styles.poolStat}>
                              <span className={styles.poolStatLabel}>Participants</span>
                              <span className={styles.poolStatValue}>{pool.participants}/{pool.maxParticipants}</span>
                            </div>
                            <div className={styles.poolStat}>
                              <span className={styles.poolStatLabel}>Total Odds</span>
                              <span className={styles.poolStatValue}>{pool.totalOdds.toFixed(2)}x</span>
                            </div>
                            <div className={styles.poolStat}>
                              <span className={styles.poolStatLabel}>Closes</span>
                              <span className={styles.poolStatValue}>{formatDaysLeft(pool.resolutionDate)}</span>
                            </div>
                          </div>

                          <div className={styles.poolTiers}>
                            <span className={styles.tiersLabel}>Tier Payouts:</span>
                            <div className={styles.tiersList}>
                              {pool.tierPayouts.map((tier) => (
                                <span key={tier.tier} className={styles.tierBadge}>
                                  T{tier.tier}: ${tier.minContribution}+ = {tier.multiplier}x
                                </span>
                              ))}
                            </div>
                          </div>

                        {/* AI Insight Toggle */}
                        <div className={styles.aiInsightSection}>
                          <button
                            className={styles.aiInsightToggle}
                            onClick={() => fetchAIInsight(pool)}
                            disabled={loadingInsights[pool.id]}
                          >
                            {loadingInsights[pool.id] ? (
                              <span className={styles.spinnerSmall} />
                            ) : aiInsights[pool.id] ? (
                              <span className={`${styles.signalDot} ${styles[aiInsights[pool.id].signal]}`} />
                            ) : null}
                            AI Insight
                          </button>
                          
                          {aiInsights[pool.id] && (
                            <div className={`${styles.aiInsightCard} ${styles[aiInsights[pool.id].signal]}`}>
                              <div className={styles.aiSignalHeader}>
                                <span className={`${styles.aiSignal} ${styles[aiInsights[pool.id].signal]}`}>
                                  {aiInsights[pool.id].signal.toUpperCase()}
                                </span>
                                <span className={styles.aiConfidence}>
                                  {aiInsights[pool.id].confidence}% confidence
                                </span>
                              </div>
                              <p className={styles.aiSummary}>{aiInsights[pool.id].summary}</p>
                              <div className={styles.aiFactors}>
                                {aiInsights[pool.id].keyFactors.map((factor, i) => (
                                  <span key={i} className={styles.aiFactor}>• {factor}</span>
                                ))}
                              </div>
                              <span className={`${styles.aiRisk} ${styles[aiInsights[pool.id].riskLevel]}`}>
                                {aiInsights[pool.id].riskLevel.toUpperCase()} RISK
                              </span>
                            </div>
                          )}
                        </div>

                        <div className={styles.poolActions}>
                          <span className={styles.entryRange}>
                            Entry: ${pool.minEntry} - ${pool.maxEntry}
                          </span>
                          <div className={styles.joinSection}>
                            <span className={styles.participantsBadge}>
                              {pool.participants}/{pool.maxParticipants} joined
                            </span>
                            <button 
                              className={styles.joinPoolButton}
                              onClick={() => openJoinModal(pool)}
                              disabled={pool.status !== "open" || pool.participants >= pool.maxParticipants}
                            >
                              {pool.participants >= pool.maxParticipants ? "Pool Full" : "Join Pool"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

                {/* All Pools */}
                {communitySubView === "pools" && (
                  <div className={styles.poolsGrid}>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Community Pools</h3>
                      <span className={styles.sectionSubtitle}>Join forces with other traders</span>
                    </div>
                    {communityPools.map((pool) => (
                      <div key={pool.id} className={styles.poolCard}>
                        <div className={styles.poolHeader}>
                          <div className={styles.poolCreator}>
                            <div className={styles.creatorAvatar}>
                              {pool.creator.name.charAt(0)}
                            </div>
                            <div className={styles.creatorInfo}>
                              <span className={styles.creatorName}>
                                {pool.creator.name}
                                {pool.creator.isAmbassador && (
                                  <span className={styles.ambassadorBadge}>AMB</span>
                                )}
                              </span>
                              <span className={styles.creatorStats}>
                                {pool.creator.winRate}% win rate
                              </span>
                            </div>
                          </div>
                          <span className={`${styles.poolStatus} ${styles[pool.status]}`}>
                            {pool.status}
                          </span>
                        </div>
                        
                        <h4 className={styles.poolName}>{pool.name}</h4>
                        
                        <div className={styles.poolLegs}>
                          {pool.legs.map((leg, i) => (
                            <div key={i} className={styles.poolLeg}>
                              <span className={`${styles.legSideSmall} ${styles[leg.side]}`}>
                                {leg.side.toUpperCase()}
                              </span>
                              <span className={styles.poolLegQuestion}>
                                {leg.question.length > 40 ? leg.question.slice(0, 40) + "..." : leg.question}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className={styles.poolStats}>
                          <div className={styles.poolStat}>
                            <span className={styles.poolStatLabel}>Pool Size</span>
                            <span className={styles.poolStatValue}>{formatVolume(pool.totalLiquidity)}</span>
                          </div>
                          <div className={styles.poolStat}>
                            <span className={styles.poolStatLabel}>Participants</span>
                            <span className={styles.poolStatValue}>{pool.participants}/{pool.maxParticipants}</span>
                          </div>
                          <div className={styles.poolStat}>
                            <span className={styles.poolStatLabel}>Total Odds</span>
                            <span className={styles.poolStatValue}>{pool.totalOdds.toFixed(2)}x</span>
                          </div>
                          <div className={styles.poolStat}>
                            <span className={styles.poolStatLabel}>Closes</span>
                            <span className={styles.poolStatValue}>{formatDaysLeft(pool.resolutionDate)}</span>
                          </div>
                        </div>

                        {/* AI Insight Toggle */}
                        <div className={styles.aiInsightSection}>
                          <button
                            className={styles.aiInsightToggle}
                            onClick={() => fetchAIInsight(pool)}
                            disabled={loadingInsights[pool.id]}
                          >
                            {loadingInsights[pool.id] ? (
                              <span className={styles.spinnerSmall} />
                            ) : aiInsights[pool.id] ? (
                              <span className={`${styles.signalDot} ${styles[aiInsights[pool.id].signal]}`} />
                            ) : null}
                            AI Insight
                          </button>
                          
                          {aiInsights[pool.id] && (
                            <div className={`${styles.aiInsightCard} ${styles[aiInsights[pool.id].signal]}`}>
                              <div className={styles.aiSignalHeader}>
                                <span className={`${styles.aiSignal} ${styles[aiInsights[pool.id].signal]}`}>
                                  {aiInsights[pool.id].signal.toUpperCase()}
                                </span>
                                <span className={styles.aiConfidence}>
                                  {aiInsights[pool.id].confidence}% confidence
                                </span>
                              </div>
                              <p className={styles.aiSummary}>{aiInsights[pool.id].summary}</p>
                              <div className={styles.aiFactors}>
                                {aiInsights[pool.id].keyFactors.map((factor, i) => (
                                  <span key={i} className={styles.aiFactor}>• {factor}</span>
                                ))}
                              </div>
                              <span className={`${styles.aiRisk} ${styles[aiInsights[pool.id].riskLevel]}`}>
                                {aiInsights[pool.id].riskLevel.toUpperCase()} RISK
                              </span>
                            </div>
                          )}
                        </div>

                        <div className={styles.poolActions}>
                          <span className={styles.entryRange}>
                            Entry: ${pool.minEntry} - ${pool.maxEntry}
                          </span>
                          <div className={styles.joinSection}>
                            <span className={styles.participantsBadge}>
                              {pool.participants}/{pool.maxParticipants} joined
                            </span>
                            <button 
                              className={styles.joinPoolButton}
                              onClick={() => openJoinModal(pool)}
                              disabled={pool.status !== "open" || pool.participants >= pool.maxParticipants}
                            >
                              {pool.participants >= pool.maxParticipants ? "Pool Full" : "Join Pool"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Big Wins */}
                {communitySubView === "wins" && (
                  <div className={styles.winsSection}>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Recent Big Wins</h3>
                      <span className={styles.sectionSubtitle}>Community success stories</span>
                    </div>
                    <div className={styles.winsList}>
                      {bigWins.map((win) => (
                        <div key={win.id} className={styles.winCard}>
                          <div className={styles.winAvatar}>
                            {win.userName.charAt(0)}
                          </div>
                          <div className={styles.winInfo}>
                            <div className={styles.winUser}>{win.userName}</div>
                            <div className={styles.winPool}>{win.poolName}</div>
                            <div className={styles.winMeta}>
                              {win.legs} legs · {formatTimeAgo(win.timestamp)}
                            </div>
                          </div>
                          <div className={styles.winAmount}>
                            <div className={styles.winPayout}>+${win.amountWon.toLocaleString()}</div>
                            <div className={styles.winMultiplier}>{win.multiplier.toFixed(1)}x</div>
                            <div className={styles.winStake}>from ${win.amountStaked}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create Pool / Add Liquidity */}
                {communitySubView === "create" && (
                  <div className={styles.createPoolSection}>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Create a Pool</h3>
                      <span className={styles.sectionSubtitle}>Add liquidity and let others join your parlay</span>
                    </div>
                    
                    <div className={styles.createPoolForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Pool Name</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          placeholder="Enter a catchy name for your pool..."
                          value={newPoolName}
                          onChange={(e) => setNewPoolName(e.target.value)}
                        />
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Min Entry ($)</label>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={newPoolMinEntry}
                            onChange={(e) => setNewPoolMinEntry(parseInt(e.target.value) || 0)}
                            min={1}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Max Entry ($)</label>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={newPoolMaxEntry}
                            onChange={(e) => setNewPoolMaxEntry(parseInt(e.target.value) || 0)}
                            min={1}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Max Participants</label>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={newPoolMaxParticipants}
                            onChange={(e) => setNewPoolMaxParticipants(parseInt(e.target.value) || 0)}
                            min={2}
                          />
                        </div>
                      </div>

                      <div className={styles.tierConfigSection}>
                        <h4 className={styles.tierConfigTitle}>Tier Payouts</h4>
                        <p className={styles.tierConfigDesc}>
                          Higher contributors get better multipliers on their winnings
                        </p>
                        <div className={styles.tierPreview}>
                          <div className={styles.tierPreviewItem}>
                            <span className={styles.tierLabel}>Tier 1</span>
                            <span className={styles.tierRange}>${newPoolMaxEntry * 0.5}+</span>
                            <span className={styles.tierMultiplier}>1.25x</span>
                          </div>
                          <div className={styles.tierPreviewItem}>
                            <span className={styles.tierLabel}>Tier 2</span>
                            <span className={styles.tierRange}>${newPoolMaxEntry * 0.25}+</span>
                            <span className={styles.tierMultiplier}>1.1x</span>
                          </div>
                          <div className={styles.tierPreviewItem}>
                            <span className={styles.tierLabel}>Tier 3</span>
                            <span className={styles.tierRange}>${newPoolMinEntry}+</span>
                            <span className={styles.tierMultiplier}>1.0x</span>
                          </div>
                        </div>
                      </div>

                      {/* Pool Leverage - Only for Pool Creation */}
                      <div className={styles.poolLeverageSection}>
                        <div className={styles.poolLeverageHeader}>
                          <h4 className={styles.poolLeverageTitle}>Pool Leverage</h4>
                          <span className={styles.poolLeverageWarning}>⚠️ Higher leverage = Higher risk</span>
                        </div>
                        <p className={styles.poolLeverageDesc}>
                          Apply leverage to multiply potential pool payouts. Only available for community pools.
                        </p>
                        <div className={styles.poolLeverageButtons}>
                          {([1, 2, 3, 4, 5] as LeverageLevel[]).map((lev) => (
                            <button
                              key={lev}
                              className={`${styles.poolLeverageButton} ${builder.leverage === lev ? styles.active : ""} ${lev >= 4 ? styles.high : ""}`}
                              onClick={() => setBuilderLeverage(lev)}
                            >
                              <span className={styles.leverageValue}>{lev}x</span>
                              <span className={styles.leverageLabel}>
                                {lev === 1 ? "Safe" : lev === 2 ? "Low" : lev === 3 ? "Med" : lev === 4 ? "High" : "Max"}
                              </span>
                            </button>
                          ))}
                        </div>
                        {builder.leverage > 1 && (
                          <div className={styles.leveragePreview}>
                            <div className={styles.leveragePreviewRow}>
                              <span>Base Odds:</span>
                              <span>{formatOdds(calculations.totalOdds)}</span>
                            </div>
                            <div className={styles.leveragePreviewRow}>
                              <span>With {builder.leverage}x Leverage:</span>
                              <span className={styles.leveragedOdds}>{formatOdds(calculations.totalOdds * builder.leverage)}</span>
                            </div>
                            <div className={styles.leveragePreviewRow}>
                              <span>Pool Payout Potential:</span>
                              <span className={styles.leveragedPayout}>
                                {formatParlayValue(builder.stake * calculations.totalOdds * builder.leverage)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={styles.selectedLegsPreview}>
                        <h4 className={styles.previewTitle}>
                          Selected Markets ({selectedLegs.length})
                        </h4>
                        {selectedLegs.length === 0 ? (
                          <p className={styles.previewEmpty}>
                            Select markets from Search, Trending, or Closing tabs to add to your pool
                          </p>
                        ) : (
                          <div className={styles.previewLegs}>
                            {selectedLegs.map((leg, i) => (
                              <div key={leg.market.id} className={styles.previewLeg}>
                                <span className={styles.previewLegNum}>{i + 1}</span>
                                <span className={`${styles.previewLegSide} ${styles[leg.side]}`}>
                                  {leg.side.toUpperCase()}
                                </span>
                                <span className={styles.previewLegQuestion}>
                                  {leg.market.question.length > 50 
                                    ? leg.market.question.slice(0, 50) + "..." 
                                    : leg.market.question}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        className={styles.createPoolButton}
                        onClick={handleCreatePool}
                        disabled={selectedLegs.length < 2 || !newPoolName.trim()}
                      >
                        Create Pool & Add Liquidity
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Market List */}
            <div
              className={`${styles.marketList} ${viewMode === "community" ? styles.hidden : ""}`}
              ref={marketListRef}
              onScroll={handleScroll}
            >
              {isLoadingMarkets && displayMarkets.length === 0 ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner} />
                  <p>Loading markets...</p>
                </div>
              ) : marketError && displayMarkets.length === 0 ? (
                <div className={styles.errorState}>
                  <p>{marketError}</p>
                  <button onClick={() => fetchMarkets(true)}>Retry</button>
                </div>
              ) : displayMarkets.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                  </span>
                  <p>No markets found</p>
                  <span className={styles.emptyHint}>
                    Try adjusting your search or filters
                  </span>
                </div>
              ) : (
                <>
                  {displayMarkets.map((market) => {
                    const selectedLeg = selectedLegs.find((l) => l.market.id === market.id);
                    const isSelected = !!selectedLeg;

                    return (
                      <div
                        key={market.id}
                        className={`${styles.marketCard} ${isSelected ? styles.selected : ""}`}
                      >
                        <div className={styles.marketCardContent}>
                          {market.imageUrl && (
                            <div className={styles.marketImageContainer}>
                              <img 
                                src={market.imageUrl} 
                                alt={market.question} 
                                className={styles.marketImage}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className={styles.marketInfo}>
                            <div className={styles.marketHeader}>
                              <div className={`${styles.marketVenue} ${market.venue === "kalshi" ? styles.kalshi : ""}`}>
                                <Image 
                                  src={VENUE_LOGOS[market.venue]} 
                                  alt={market.venue} 
                                  width={18} 
                                  height={18} 
                                  className={styles.venueLogo}
                                />
                                <span>{market.venue}</span>
                              </div>
                              <span className={styles.marketCategory}>
                                {market.category}
                              </span>
                            </div>

                            <div className={styles.marketQuestion}>{market.question}</div>
                          </div>
                        </div>

                        <div className={styles.marketMeta}>
                          <span className={styles.metaItem}>
                            <span className={styles.metaLabel}>VOL</span>
                            {formatVolume(market.volume24h)} 24h
                          </span>
                          <span className={styles.metaItem}>
                            <span className={styles.metaLabel}>LIQ</span>
                            {formatVolume(market.liquidity)}
                          </span>
                          <span className={styles.metaItem}>
                            <span className={styles.metaLabel}>ENDS</span>
                            {formatDaysLeft(market.resolutionDate)}
                          </span>
                        </div>

                        <div className={styles.marketPrices}>
                          <button
                            className={`${styles.priceButton} ${styles.yes} ${selectedLeg?.side === "yes" ? styles.selected : ""}`}
                            onClick={() => handleMarketSelect(market, "yes")}
                          >
                            <span className={styles.priceLabel}>YES</span>
                            <span className={styles.priceValue}>{(market.yesPrice * 100).toFixed(1)}¢</span>
                            <span className={styles.priceOdds}>{formatOdds(1 / market.yesPrice)}</span>
                          </button>
                          <button
                            className={`${styles.priceButton} ${styles.no} ${selectedLeg?.side === "no" ? styles.selected : ""}`}
                            onClick={() => handleMarketSelect(market, "no")}
                          >
                            <span className={styles.priceLabel}>NO</span>
                            <span className={styles.priceValue}>{(market.noPrice * 100).toFixed(1)}¢</span>
                            <span className={styles.priceOdds}>{formatOdds(1 / market.noPrice)}</span>
                          </button>
                        </div>

                        {/* Multi-Outcome Preview (for markets like ETH price ranges) */}
                        {market.isMultiOutcome && market.outcomes && market.outcomes.length > 0 && (
                          <div className={styles.multiOutcomePreview}>
                            <div className={styles.outcomesLabel}>
                              {market.outcomes.length} Outcomes Available
                            </div>
                            <div className={styles.topOutcomes}>
                              {market.outcomes.slice(0, 3).map((outcome) => (
                                <div key={outcome.id} className={styles.outcomeChip}>
                                  <span className={styles.outcomeChipLabel}>{outcome.label}</span>
                                  <span className={styles.outcomeChipProb}>
                                    {(outcome.probability * 100).toFixed(0)}%
                                  </span>
                                </div>
                              ))}
                              {market.outcomes.length > 3 && (
                                <div className={styles.outcomeChip}>
                                  +{market.outcomes.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Market Actions */}
                        <div className={styles.marketActions}>
                          {market.sourceUrl && (
                            <a
                              href={market.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.marketLink}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View on {market.venue} →
                            </a>
                          )}
                          <div className={styles.actionButtons}>
                            <button
                              className={styles.chartButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                openChartPanel(market);
                              }}
                              title="View Chart"
                            >
                              📊 Chart
                            </button>
                            <button
                              className={styles.quickTradeButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                openTradingPanel(market);
                              }}
                            >
                              Quick Trade
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isLoadingMarkets && (
                    <div className={styles.loadingMore}>
                      <div className={styles.spinnerSmall} />
                      <span>Loading more...</span>
                    </div>
                  )}

                  {!hasMore && displayMarkets.length > 0 && viewMode === "search" && (
                    <div className={styles.endOfList}>
                      <span>No more markets to load</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Lineup Builder */}
          <div className={styles.rightPanel}>
            <div className={styles.lineupHeader}>
              <input
                type="text"
                className={styles.lineupNameInput}
                placeholder="Name your lineup..."
                value={builder.name}
                onChange={(e) => setBuilderName(e.target.value)}
              />
            </div>

            {/* Settings */}
            <div className={styles.settingsStack}>
              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>Stake Amount ($)</label>
                <input
                  type="number"
                  className={styles.settingInput}
                  value={builder.stake}
                  onChange={(e) => setBuilderStake(parseFloat(e.target.value) || 0)}
                  min={1}
                  step={10}
                />
              </div>

              {/* Quick stake buttons */}
              <div className={styles.quickStakeButtons}>
                {[10, 25, 50, 100, 250].map((amount) => (
                  <button
                    key={amount}
                    className={`${styles.quickStakeButton} ${builder.stake === amount ? styles.active : ""}`}
                    onClick={() => setBuilderStake(amount)}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats - TRUE ODDS from Markets */}
            <div className={styles.statsCard}>
              <div className={styles.statsCardHeader}>
                <span className={styles.statsCardTitle}>True Parlay Odds</span>
                <span className={styles.statsCardSubtitle}>
                  Real market prices • Combined by multiplication
                </span>
              </div>
              
              {/* Odds Breakdown - Show how odds combine */}
              {selectedLegs.length > 0 && (
                <div className={styles.oddsBreakdown}>
                  <div className={styles.oddsBreakdownTitle}>Odds Calculation:</div>
                  {selectedLegs.map((leg, index) => {
                    const price = leg.side === "yes" ? leg.market.yesPrice : leg.market.noPrice;
                    const probability = leg.side === "yes" ? price : (1 - price);
                    const decimalOdds = 1 / Math.max(0.01, Math.min(0.99, probability));
                    const probPercent = (probability * 100).toFixed(1);
                    
                    return (
                      <div key={leg.market.id} className={styles.oddsBreakdownLeg}>
                        <span className={styles.oddsLegNumber}>Leg {index + 1}</span>
                        <span className={styles.oddsLegProb}>{probPercent}%</span>
                        <span className={styles.oddsLegOdds}>{formatOdds(decimalOdds)}</span>
                      </div>
                    );
                  })}
                  <div className={styles.oddsBreakdownSeparator}></div>
                  <div className={styles.oddsBreakdownTotal}>
                    <span>Combined:</span>
                    <span className={styles.oddsTotalProb}>
                      {formatProbability(calculations.impliedProbability)}
                    </span>
                    <span className={styles.oddsTotalOdds}>
                      {formatOdds(calculations.totalOdds)}
                    </span>
                  </div>
                </div>
              )}
              
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Combined Odds</span>
                <span className={`${styles.statValue} ${styles.highlight}`}>
                  {formatOdds(calculations.totalOdds)}
                </span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Win Probability</span>
                <span className={styles.statValue}>
                  {formatProbability(calculations.impliedProbability)}
                </span>
              </div>
              
              <div className={styles.payoutHighlight}>
                <div className={styles.payoutLabel}>
                  <span>Potential Payout</span>
                  <span className={styles.payoutNote}>(if all legs win)</span>
                </div>
                <span className={styles.payoutValue}>
                  {formatParlayValue(calculations.potentialPayout)}
                </span>
              </div>
              
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Net Profit</span>
                <span className={`${styles.statValue} ${styles.profit}`}>
                  {builder.stake > 0 
                    ? `+${formatParlayValue(calculations.potentialPayout - builder.stake)}`
                    : "—"
                  }
                </span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Return on Stake</span>
                <span className={`${styles.statValue} ${styles.roi}`}>
                  {builder.stake > 0 
                    ? `${(((calculations.potentialPayout - builder.stake) / builder.stake) * 100).toFixed(1)}%`
                    : "—"
                  }
                </span>
              </div>
            </div>

            {/* Risk */}
            <div className={styles.riskIndicator}>
              <div className={styles.riskHeader}>
                <span className={styles.riskTitle}>Risk Assessment</span>
                <span className={`${styles.riskBadge} ${styles[calculations.risk.level]}`}>
                  {calculations.risk.level.toUpperCase()}
                </span>
              </div>
              <div className={styles.riskBar}>
                <div
                  className={`${styles.riskFill} ${styles[calculations.risk.level]}`}
                  style={{ width: `${calculations.risk.score}%` }}
                />
              </div>
              <div className={styles.riskBreakdown}>
                <span title="Correlated markets risk">COR {calculations.risk.correlationRisk}</span>
                <span title="Time spread risk">TIM {calculations.risk.timeRisk}</span>
                <span title="Liquidity risk">LIQ {calculations.risk.liquidityRisk}</span>
                <span title="Number of legs risk">LEGS {calculations.risk.legCountRisk}</span>
              </div>
            </div>

            {/* Warnings */}
            {calculations.risk.warnings.length > 0 && (
              <div className={styles.warnings}>
                {calculations.risk.warnings.map((warning, i) => (
                  <div key={i} className={styles.warning}>
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Resolution Window */}
            {selectedLegs.length > 0 && (
              <div className={styles.resolutionWindow}>
                <span className={styles.resolutionLabel}>Resolution Window</span>
                <span className={styles.resolutionValue}>
                  {formatDaysLeft(calculations.resolutionWindow.earliest)} — {formatDaysLeft(calculations.resolutionWindow.latest)}
                </span>
              </div>
            )}

            {/* Selected Legs */}
            <div className={styles.legsSection}>
              <div className={styles.legsHeader}>
                <span className={styles.legsTitle}>Your Lineup</span>
                <span className={styles.legsCount}>{selectedLegs.length}/10 legs</span>
              </div>

              {selectedLegs.length > 0 ? (
                <div className={styles.legsList}>
                  {selectedLegs.map((leg, index) => (
                    <div key={leg.market.id} className={styles.legItem}>
                      <span className={styles.legNumber}>{index + 1}</span>
                      <div className={`${styles.legSide} ${styles[leg.side]}`}>
                        {leg.side.toUpperCase()}
                      </div>
                      <div className={styles.legInfo}>
                        <div className={styles.legQuestion}>
                          {leg.market.question.length > 35
                            ? leg.market.question.slice(0, 35) + "..."
                            : leg.market.question}
                        </div>
                        <div className={styles.legOdds}>
                          <span className={styles.legVenue}>{leg.market.venue}</span>
                          <span className={styles.legOddsValue}>
                            {formatOdds(1 / (leg.side === "yes" ? leg.market.yesPrice : leg.market.noPrice))}
                          </span>
                        </div>
                      </div>
                      <button
                        className={styles.legRemove}
                        onClick={() => removeMarketFromBuilder(leg.market.id)}
                        title="Remove from lineup"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyLegs}>
                  <svg className={styles.emptyLegsIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <p>Select markets from the left to build your lineup</p>
                  <span className={styles.emptyLegsHint}>
                    Add 2+ markets to create a parlay
                  </span>
                </div>
              )}
            </div>

            {/* Error */}
            {(createError || error) && (
              <div className={styles.error}>
                {createError || error}
              </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
              <button 
                className={`${styles.actionButton} ${styles.secondary}`} 
                onClick={clearBuilder}
                disabled={selectedLegs.length === 0}
              >
                Clear All
              </button>
              <button
                className={`${styles.actionButton} ${styles.primary}`}
                onClick={handleCreate}
                disabled={selectedLegs.length < 2 || isCreating || isLoading || !builder.name.trim()}
              >
                {isCreating ? (
                  <>
                    <span className={styles.buttonSpinner} />
                    Creating...
                  </>
                ) : (
                  <>Create Lineup</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Join Pool Modal */}
        {joinModalOpen && selectedPoolToJoin && (
          <div className={styles.joinModal} onClick={(e) => e.target === e.currentTarget && closeJoinModal()}>
            <div className={styles.joinModalContent}>
              <div className={styles.joinModalHeader}>
                <h3>Join Pool</h3>
                <button className={styles.closeModalButton} onClick={closeJoinModal}>x</button>
              </div>
              
              <div className={styles.joinModalBody}>
                <div className={styles.poolSummary}>
                  <h4>{selectedPoolToJoin.name}</h4>
                  <div className={styles.poolSummaryStats}>
                    <span>Creator: {selectedPoolToJoin.creator.name}</span>
                    <span>Odds: {selectedPoolToJoin.totalOdds.toFixed(2)}x</span>
                    <span>
                      {selectedPoolToJoin.participants}/{selectedPoolToJoin.maxParticipants} joined
                    </span>
                  </div>
                </div>

                {/* AI Insight in Modal */}
                {aiInsights[selectedPoolToJoin.id] && (
                  <div className={`${styles.modalAiInsight} ${styles[aiInsights[selectedPoolToJoin.id].signal]}`}>
                    <div className={styles.modalAiHeader}>
                      <span className={`${styles.modalAiSignal} ${styles[aiInsights[selectedPoolToJoin.id].signal]}`}>
                        AI: {aiInsights[selectedPoolToJoin.id].signal.toUpperCase()}
                      </span>
                      <span className={styles.modalAiConfidence}>
                        {aiInsights[selectedPoolToJoin.id].confidence}%
                      </span>
                    </div>
                    <p className={styles.modalAiSummary}>{aiInsights[selectedPoolToJoin.id].summary}</p>
                  </div>
                )}

                <div className={styles.entryAmountSection}>
                  <label className={styles.entryLabel}>Entry Amount</label>
                  <div className={styles.entryInputWrapper}>
                    <span className={styles.dollarSign}>$</span>
                    <input
                      type="number"
                      className={styles.entryInput}
                      value={joinEntryAmount}
                      onChange={(e) => setJoinEntryAmount(Math.max(selectedPoolToJoin.minEntry, Math.min(selectedPoolToJoin.maxEntry, parseInt(e.target.value) || 0)))}
                      min={selectedPoolToJoin.minEntry}
                      max={selectedPoolToJoin.maxEntry}
                    />
                  </div>
                  <div className={styles.entrySlider}>
                    <input
                      type="range"
                      min={selectedPoolToJoin.minEntry}
                      max={selectedPoolToJoin.maxEntry}
                      value={joinEntryAmount}
                      onChange={(e) => setJoinEntryAmount(parseInt(e.target.value))}
                      className={styles.slider}
                    />
                    <div className={styles.sliderLabels}>
                      <span>${selectedPoolToJoin.minEntry}</span>
                      <span>${selectedPoolToJoin.maxEntry}</span>
                    </div>
                  </div>

                  {/* Quick amount buttons */}
                  <div className={styles.quickAmounts}>
                    {[selectedPoolToJoin.minEntry, Math.floor((selectedPoolToJoin.minEntry + selectedPoolToJoin.maxEntry) / 4), Math.floor((selectedPoolToJoin.minEntry + selectedPoolToJoin.maxEntry) / 2), selectedPoolToJoin.maxEntry].map((amt) => (
                      <button
                        key={amt}
                        className={`${styles.quickAmountBtn} ${joinEntryAmount === amt ? styles.active : ""}`}
                        onClick={() => setJoinEntryAmount(amt)}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier calculation */}
                <div className={styles.tierCalculation}>
                  {(() => {
                    const tier = getEntryTier(selectedPoolToJoin, joinEntryAmount);
                    const potentialWin = joinEntryAmount * selectedPoolToJoin.totalOdds * (tier?.multiplier || 1);
                    return (
                      <>
                        <div className={styles.tierInfo}>
                          <span className={styles.tierLabel}>Your Tier</span>
                          <span className={styles.tierValue}>Tier {tier?.tier || 3}</span>
                        </div>
                        <div className={styles.tierInfo}>
                          <span className={styles.tierLabel}>Multiplier</span>
                          <span className={styles.tierValue}>{tier?.multiplier || 1}x</span>
                        </div>
                        <div className={styles.tierInfo}>
                          <span className={styles.tierLabel}>Potential Win</span>
                          <span className={styles.tierValue}>${potentialWin.toFixed(2)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Tier breakdown */}
                <div className={styles.tierBreakdown}>
                  <span className={styles.tierBreakdownTitle}>Tier Thresholds</span>
                  {selectedPoolToJoin.tierPayouts.map((tier) => (
                    <div 
                      key={tier.tier} 
                      className={`${styles.tierRow} ${joinEntryAmount >= tier.minContribution ? styles.active : ""}`}
                    >
                      <span>Tier {tier.tier}</span>
                      <span>${tier.minContribution}+</span>
                      <span>{tier.multiplier}x multiplier</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.joinModalFooter}>
                <button className={styles.cancelButton} onClick={closeJoinModal}>
                  Cancel
                </button>
                <button 
                  className={styles.confirmJoinButton}
                  onClick={confirmJoinPool}
                  disabled={joinEntryAmount < selectedPoolToJoin.minEntry || joinEntryAmount > selectedPoolToJoin.maxEntry}
                >
                  Confirm Join - ${joinEntryAmount}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Connect Modal */}
        {showConnectModal && (
          <div className={styles.connectModal} onClick={(e) => e.target === e.currentTarget && setShowConnectModal(false)}>
            <div className={styles.connectModalContent}>
              <div className={styles.connectModalHeader}>
                <h3 className={styles.connectModalTitle}>
                  {connectMode === "trading" ? "Connect Trading Account" : "Login / Connect Wallet"}
                </h3>
                <button 
                  className={styles.connectModalClose}
                  onClick={() => {
                    setShowConnectModal(false);
                    setConnectMode(null);
                    setConnectingVenue(null);
                    setConnectError(null);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className={styles.connectModalBody}>
                {/* Mode Selector Tabs */}
                <div className={styles.connectModeTabs}>
                  <button
                    className={`${styles.connectModeTab} ${connectMode === "wallet" || !connectMode ? styles.active : ""}`}
                    onClick={() => {
                      setConnectMode("wallet");
                      setConnectingVenue(null);
                    }}
                  >
                    🔐 Login
                  </button>
                  <button
                    className={`${styles.connectModeTab} ${connectMode === "trading" ? styles.active : ""}`}
                    onClick={() => {
                      setConnectMode("trading");
                      setConnectingVenue("kalshi");
                    }}
                  >
                    📈 Trading
                  </button>
                </div>

                {/* ========== WALLET / LOGIN MODE ========== */}
                {(connectMode === "wallet" || !connectMode) && (
                  <div className={styles.loginOptions}>
                    {/* Wallet Connected State */}
                    {isWalletConnected ? (
                      <div className={styles.connectedStatus}>
                        <div className={styles.connectedIcon}>✓</div>
                        <h4 className={styles.connectedTitle}>Wallet Connected</h4>
                        <p className={styles.connectedAddress}>
                          {connectedWalletAddress?.slice(0, 8)}...{connectedWalletAddress?.slice(-6)}
                        </p>
                        {wallet.state.balance && (
                          <p className={styles.connectedBalance}>
                            Balance: {parseFloat(wallet.state.balance).toFixed(4)} {wallet.state.network || "ETH"}
                          </p>
                        )}
                        <button className={styles.disconnectBtn} onClick={handleWalletDisconnect}>
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Social Login Options */}
                        <div className={styles.socialLoginSection}>
                          <button 
                            className={styles.googleButton}
                            onClick={handleGoogleSignIn}
                            disabled={isConnecting}
                          >
                            <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                          </button>
                        </div>

                        <div className={styles.loginDivider}>
                          <span>or</span>
                        </div>

                        {/* WalletConnect Options */}
                        <div className={styles.walletOptions}>
                          <button 
                            className={styles.walletConnectButton}
                            onClick={handleWalletConnect}
                            disabled={isConnecting}
                          >
                            <span className={styles.wcIcon}>🔗</span>
                            WalletConnect
                          </button>
                          
                          <button 
                            className={styles.metamaskButton}
                            onClick={() => {
                              wallet.connectMetaMask();
                              setShowConnectModal(false);
                            }}
                            disabled={isConnecting}
                          >
                            <span className={styles.mmIcon}>🦊</span>
                            MetaMask
                          </button>
                        </div>

                        <div className={styles.loginDivider}>
                          <span>or continue with email</span>
                        </div>

                        {/* Email Login */}
                        <div className={styles.emailLoginSection}>
                          <input
                            type="email"
                            className={styles.emailInput}
                            placeholder="Enter your email address"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                          />
                          <button 
                            className={styles.emailSubmitBtn}
                            onClick={handleEmailSignIn}
                            disabled={isConnecting || !emailInput.includes("@")}
                          >
                            {isConnecting ? (
                              <>
                                <span className={styles.connectSpinner} />
                                Sending...
                              </>
                            ) : (
                              "Continue with Email"
                            )}
                          </button>
                          {isEmailSent && (
                            <p className={styles.emailSentNote}>
                              Check your email for the login link!
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ========== TRADING ACCOUNTS MODE ========== */}
                {connectMode === "trading" && (
                  <>
                    {/* Venue Tabs */}
                    <div className={styles.connectVenueTabs}>
                      <button
                        className={`${styles.connectVenueTab} ${connectingVenue === "kalshi" ? styles.active : ""} ${isKalshiConnected ? styles.connected : ""}`}
                        onClick={() => setConnectingVenue("kalshi")}
                      >
                        <span className={styles.venueTabIcon} style={{ background: "linear-gradient(135deg, #00d4aa, #00a884)" }}>K</span>
                        <span className={styles.venueTabName}>Kalshi</span>
                        {isKalshiConnected && <span className={styles.connectedCheck}>✓</span>}
                      </button>
                      <button
                        className={`${styles.connectVenueTab} ${connectingVenue === "polymarket" ? styles.active : ""} ${isPolymarketConnected ? styles.connected : ""}`}
                        onClick={() => setConnectingVenue("polymarket")}
                      >
                        <span className={styles.venueTabIcon} style={{ background: "linear-gradient(135deg, #627eea, #4a5fc1)" }}>P</span>
                        <span className={styles.venueTabName}>Polymarket</span>
                        {isPolymarketConnected && <span className={styles.connectedCheck}>✓</span>}
                      </button>
                    </div>

                    {/* Connected Status */}
                    {((connectingVenue === "kalshi" && isKalshiConnected) || (connectingVenue === "polymarket" && isPolymarketConnected)) ? (
                      <div className={styles.connectedStatus}>
                        <div className={styles.connectedIcon}>✓</div>
                        <h4 className={styles.connectedTitle}>
                          {connectingVenue === "kalshi" ? "Kalshi" : "Polymarket"} Connected
                        </h4>
                        <p className={styles.connectedBalance}>
                          Balance: ${(connectingVenue === "kalshi" ? accounts.kalshi.balance?.total : accounts.polymarket.balance?.total)?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                        </p>
                        <button
                          className={styles.disconnectBtn}
                          onClick={() => {
                            if (connectingVenue === "kalshi") disconnectKalshi();
                            else disconnectPolymarket();
                          }}
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Kalshi Form */}
                        {connectingVenue === "kalshi" && !isKalshiConnected && (
                          <div className={styles.connectForm}>
                            <div className={styles.connectFormGroup}>
                              <label className={styles.connectLabel}>API Key ID</label>
                              <input
                                type="text"
                                className={styles.connectInput}
                                placeholder="Enter your Kalshi API Key ID"
                                value={kalshiApiKeyId}
                                onChange={(e) => setKalshiApiKeyId(e.target.value)}
                                autoComplete="off"
                              />
                            </div>
                            <div className={styles.connectFormGroup}>
                              <label className={styles.connectLabel}>Private Key (RSA)</label>
                              <textarea
                                className={styles.connectTextarea}
                                placeholder="Paste your RSA private key here..."
                                value={kalshiPrivateKey}
                                onChange={(e) => setKalshiPrivateKey(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <div className={styles.connectHelpText}>
                              Get your API credentials from{" "}
                              <a href="https://kalshi.com/settings/api" target="_blank" rel="noopener noreferrer">
                                Kalshi Settings → API
                              </a>
                            </div>
                            <button
                              className={styles.connectSubmitBtn}
                              onClick={handleConnectKalshi}
                              disabled={isConnecting || !kalshiApiKeyId || !kalshiPrivateKey}
                            >
                              {isConnecting ? (
                                <>
                                  <span className={styles.connectSpinner} />
                                  Connecting...
                                </>
                              ) : (
                                "Connect Kalshi"
                              )}
                            </button>
                          </div>
                        )}

                        {/* Polymarket Form */}
                        {connectingVenue === "polymarket" && !isPolymarketConnected && (
                          <div className={styles.connectForm}>
                            <div className={styles.connectFormGroup}>
                              <label className={styles.connectLabel}>Wallet Private Key</label>
                              <input
                                type="password"
                                className={styles.connectInput}
                                placeholder="Enter your Ethereum private key (0x...)"
                                value={polyPrivateKey}
                                onChange={(e) => setPolyPrivateKey(e.target.value)}
                                autoComplete="off"
                              />
                            </div>
                            <div className={styles.connectFormGroup}>
                              <label className={styles.connectLabel}>Proxy Wallet (Optional)</label>
                              <input
                                type="text"
                                className={styles.connectInput}
                                placeholder="CLOB proxy wallet address"
                                value={polyProxyWallet}
                                onChange={(e) => setPolyProxyWallet(e.target.value)}
                                autoComplete="off"
                              />
                            </div>
                            <div className={styles.connectHelpText}>
                              Use the wallet registered with Polymarket's CLOB.{" "}
                              <a href="https://polymarket.com/profile" target="_blank" rel="noopener noreferrer">
                                View Profile
                              </a>
                            </div>
                            <button
                              className={styles.connectSubmitBtn}
                              onClick={handleConnectPolymarket}
                              disabled={isConnecting || !polyPrivateKey}
                            >
                              {isConnecting ? (
                                <>
                                  <span className={styles.connectSpinner} />
                                  Connecting...
                                </>
                              ) : (
                                "Connect Polymarket"
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Error Message */}
                {connectError && (
                  <div className={styles.connectError}>
                    {connectError}
                  </div>
                )}

                {/* Security Note */}
                <div className={styles.connectSecurityNote}>
                  <span className={styles.securityLock}>🔒</span>
                  <span>Your credentials are stored locally and never sent to our servers.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trading Panel Modal */}
        {showTradingPanel && tradingMarket && (
          <div className={styles.tradingPanelOverlay} onClick={closeTradingPanel}>
            <div className={styles.tradingPanelContainer} onClick={(e) => e.stopPropagation()}>
              <TradingPanel
                market={tradingMarket}
                onTrade={handleTradeExecution}
                onClose={closeTradingPanel}
                isConnected={
                  (tradingMarket.venue === "kalshi" && isKalshiConnected) ||
                  (tradingMarket.venue === "polymarket" && isPolymarketConnected) ||
                  isWalletConnected
                }
                balance={1000} // This should come from actual balance
                onConnectWallet={() => {
                  closeTradingPanel();
                  setShowConnectModal(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Chart Panel Modal */}
        {showChartPanel && chartMarket && (
          <PredictionChart
            market={chartMarket}
            onClose={closeChartPanel}
            onSelectOutcome={(outcome) => handleOutcomeSelect(chartMarket, outcome)}
          />
        )}
      </div>
    </div>
  );

  return createPortal(content, portalContainer);
}

export default ParlayBuilder;
