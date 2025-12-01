"use client";

/**
 * Parlay Provider
 * 
 * Manages parlay lineup state, builder UI, and CRUD operations.
 * Provides context for all parlay-related functionality.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import type {
  ParlayState,
  ParlayContextValue,
  ParlayLineup,
  ParlayLeg,
  ParlayMarket,
  ParlayTemplate,
  ParlayLeaderboardEntry,
  ParlaySide,
  LeverageLevel,
  CreateParlayRequest,
  UpdateParlayRequest,
  AddLegRequest,
  CalculateOddsRequest,
  CalculateOddsResponse,
  CashoutResponse,
} from "@/types/parlay";

import {
  calculateParlayOdds,
  calculateImpliedProbability,
  calculatePotentialPayout,
  calculateCurrentValue,
  calculateRiskMetrics,
  calculateResolutionWindow,
  validateParlay,
} from "@/lib/parlay/calculations";

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY = "omega:parlays";
const MAX_BUILDER_LEGS = 10;
const MIN_BUILDER_LEGS = 2;

// =============================================================================
// Default State
// =============================================================================

const defaultBuilderState: ParlayState["builder"] = {
  isOpen: false,
  name: "",
  description: "",
  stake: 100,
  leverage: 1,
  selectedLegs: [],
  template: undefined,
};

const defaultState: ParlayState = {
  lineups: [],
  activeLineups: [],
  draftLineups: [],
  completedLineups: [],
  builder: defaultBuilderState,
  templates: [],
  leaderboard: [],
  isLoading: false,
  error: null,
};

// =============================================================================
// Context
// =============================================================================

const ParlayContext = createContext<ParlayContextValue | undefined>(undefined);

// =============================================================================
// Provider Component
// =============================================================================

export function ParlayProvider({ children }: { children: ReactNode }) {
  // State
  const [lineups, setLineups] = useState<ParlayLineup[]>([]);
  const [builder, setBuilder] = useState(defaultBuilderState);
  const [templates, setTemplates] = useState<ParlayTemplate[]>([]);
  const [leaderboard, setLeaderboard] = useState<ParlayLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================================
  // Derived State
  // ==========================================================================

  const activeLineups = useMemo(
    () => lineups.filter((l) => l.status === "active"),
    [lineups]
  );

  const draftLineups = useMemo(
    () => lineups.filter((l) => l.status === "draft"),
    [lineups]
  );

  const completedLineups = useMemo(
    () => lineups.filter((l) => ["won", "lost", "partial", "cancelled"].includes(l.status)),
    [lineups]
  );

  // ==========================================================================
  // Persistence
  // ==========================================================================

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.lineups)) {
          setLineups(parsed.lineups);
        }
      }
    } catch (err) {
      console.error("[ParlayProvider] Failed to load from storage:", err);
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lineups }));
    } catch (err) {
      console.error("[ParlayProvider] Failed to save to storage:", err);
    }
  }, [lineups]);

  // ==========================================================================
  // Builder Actions
  // ==========================================================================

  const openBuilder = useCallback(() => {
    setBuilder((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const closeBuilder = useCallback(() => {
    setBuilder((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const setBuilderName = useCallback((name: string) => {
    setBuilder((prev) => ({ ...prev, name }));
  }, []);

  const setBuilderDescription = useCallback((description: string) => {
    setBuilder((prev) => ({ ...prev, description }));
  }, []);

  const setBuilderStake = useCallback((stake: number) => {
    setBuilder((prev) => ({ ...prev, stake: Math.max(0, stake) }));
  }, []);

  const setBuilderLeverage = useCallback((leverage: LeverageLevel) => {
    setBuilder((prev) => ({ ...prev, leverage }));
  }, []);

  const addMarketToBuilder = useCallback((market: ParlayMarket, side: ParlaySide) => {
    setBuilder((prev) => {
      // Check if already at max
      if (prev.selectedLegs.length >= MAX_BUILDER_LEGS) {
        return prev;
      }

      // Check if market already added
      if (prev.selectedLegs.some((leg) => leg.market.id === market.id)) {
        return prev;
      }

      return {
        ...prev,
        selectedLegs: [...prev.selectedLegs, { market, side }],
      };
    });
  }, []);

  const removeMarketFromBuilder = useCallback((marketId: string) => {
    setBuilder((prev) => ({
      ...prev,
      selectedLegs: prev.selectedLegs.filter((leg) => leg.market.id !== marketId),
    }));
  }, []);

  const clearBuilder = useCallback(() => {
    setBuilder(defaultBuilderState);
  }, []);

  const useTemplate = useCallback((template: ParlayTemplate) => {
    setBuilder((prev) => ({
      ...prev,
      name: template.name,
      description: template.description,
      stake: template.suggestedStake,
      leverage: template.suggestedLeverage,
      template,
      selectedLegs: [], // Clear legs, user will fill based on template
    }));
  }, []);

  // ==========================================================================
  // CRUD Operations
  // ==========================================================================

  const createLineup = useCallback(
    async (request: CreateParlayRequest): Promise<ParlayLineup> => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate
        const validation = validateParlay({
          legs: request.legs,
          stake: request.stake,
          leverage: request.leverage,
        });

        if (!validation.valid) {
          throw new Error(validation.errors.join(", "));
        }

        // Fetch market data for each leg
        const legsWithData: ParlayLeg[] = await Promise.all(
          request.legs.map(async (legRequest, index) => {
            // Fetch market data
            const response = await fetch(
              `/api/markets/${legRequest.venue}/${legRequest.marketId}`
            );
            
            let market: ParlayMarket;
            if (response.ok) {
              const data = await response.json();
              market = data.market;
            } else {
              // Fallback to mock data if API fails
              market = {
                id: legRequest.marketId,
                venue: legRequest.venue,
                question: `Market ${legRequest.marketId}`,
                description: "",
                category: "unknown",
                tags: [],
                yesPrice: 0.5,
                noPrice: 0.5,
                volume24h: 100000,
                totalVolume: 1000000,
                liquidity: 500000,
                createdAt: Date.now(),
                resolutionDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
                isActive: true,
                isResolved: false,
              };
            }

            const price = legRequest.side === "yes" ? market.yesPrice : market.noPrice;
            const decimalOdds = 1 / price;

            return {
              id: `leg-${Date.now()}-${index}`,
              lineupId: "", // Will be set after lineup creation
              marketId: legRequest.marketId,
              venue: legRequest.venue,
              side: legRequest.side,
              weight: 1 / request.legs.length,
              entryOdds: price,
              currentOdds: price,
              decimalOdds,
              resolutionDate: market.resolutionDate || Date.now() + 30 * 24 * 60 * 60 * 1000,
              status: "pending",
              question: market.question || `Market ${legRequest.marketId}`,
              category: market.category || "unknown",
              volume24h: market.volume24h || 0,
              addedAt: Date.now(),
              updatedAt: Date.now(),
            };
          })
        );

        // Calculate odds and risk
        const oddsLegs = legsWithData.map((leg) => ({
          price: leg.entryOdds,
          side: leg.side,
        }));
        const totalOdds = calculateParlayOdds(oddsLegs);
        const impliedProbability = calculateImpliedProbability(oddsLegs);
        const potentialPayout = calculatePotentialPayout(
          request.stake,
          totalOdds,
          request.leverage
        );

        const resolutionWindow = calculateResolutionWindow(legsWithData);
        const risk = calculateRiskMetrics(
          legsWithData.map((l) => ({
            category: l.category,
            venue: l.venue,
            volume24h: l.volume24h,
          })),
          resolutionWindow,
          request.leverage
        );

        // Create lineup
        const lineupId = `lineup-${Date.now()}`;
        const lineup: ParlayLineup = {
          id: lineupId,
          name: request.name,
          description: request.description,
          creator: "anonymous", // TODO: Get from wallet
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "active",
          legs: legsWithData.map((leg) => ({ ...leg, lineupId })),
          legCount: legsWithData.length,
          resolvedCount: 0,
          wonCount: 0,
          stake: request.stake,
          leverage: request.leverage,
          totalOdds,
          impliedProbability,
          potentialPayout,
          currentValue: request.stake, // Initial value equals stake
          pnl: 0,
          pnlPercent: 0,
          risk,
          resolutionWindow,
          isPublic: request.isPublic ?? false,
          shares: 0,
          likes: 0,
          copies: 0,
          comments: 0,
          canCashout: true,
        };

        // Add to state
        setLineups((prev) => [lineup, ...prev]);

        // Clear builder
        clearBuilder();

        return lineup;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearBuilder]
  );

  const updateLineup = useCallback(
    async (id: string, request: UpdateParlayRequest): Promise<ParlayLineup> => {
      setIsLoading(true);
      setError(null);

      try {
        setLineups((prev) =>
          prev.map((lineup) => {
            if (lineup.id !== id) return lineup;

            const updated = {
              ...lineup,
              ...request,
              updatedAt: Date.now(),
            };

            // Recalculate if stake or leverage changed
            if (request.stake !== undefined || request.leverage !== undefined) {
              const stake = request.stake ?? lineup.stake;
              const leverage = request.leverage ?? lineup.leverage;
              updated.potentialPayout = calculatePotentialPayout(
                stake,
                lineup.totalOdds,
                leverage
              );
              updated.risk = calculateRiskMetrics(
                lineup.legs.map((l) => ({
                  category: l.category,
                  venue: l.venue,
                  volume24h: l.volume24h,
                })),
                lineup.resolutionWindow,
                leverage
              );
            }

            return updated;
          })
        );

        const updated = lineups.find((l) => l.id === id);
        if (!updated) throw new Error("Lineup not found");
        return updated;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [lineups]
  );

  const deleteLineup = useCallback(async (id: string): Promise<void> => {
    setLineups((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addLeg = useCallback(
    async (lineupId: string, request: AddLegRequest): Promise<ParlayLeg> => {
      // Implementation similar to createLineup but for single leg
      const leg: ParlayLeg = {
        id: `leg-${Date.now()}`,
        lineupId,
        marketId: request.marketId,
        venue: request.venue,
        side: request.side,
        weight: 0.1, // Will be recalculated
        entryOdds: 0.5,
        currentOdds: 0.5,
        decimalOdds: 2,
        resolutionDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        status: "pending",
        question: request.marketId,
        category: "unknown",
        volume24h: 0,
        addedAt: Date.now(),
        updatedAt: Date.now(),
      };

      setLineups((prev) =>
        prev.map((lineup) => {
          if (lineup.id !== lineupId) return lineup;

          const newLegs = [...lineup.legs, leg];
          const oddsLegs = newLegs.map((l) => ({
            price: l.entryOdds,
            side: l.side,
          }));

          return {
            ...lineup,
            legs: newLegs,
            legCount: newLegs.length,
            totalOdds: calculateParlayOdds(oddsLegs),
            impliedProbability: calculateImpliedProbability(oddsLegs),
            updatedAt: Date.now(),
          };
        })
      );

      return leg;
    },
    []
  );

  const removeLeg = useCallback(
    async (lineupId: string, legId: string): Promise<void> => {
      setLineups((prev) =>
        prev.map((lineup) => {
          if (lineup.id !== lineupId) return lineup;

          const newLegs = lineup.legs.filter((l) => l.id !== legId);
          
          if (newLegs.length < MIN_BUILDER_LEGS) {
            throw new Error("Minimum 2 legs required");
          }

          const oddsLegs = newLegs.map((l) => ({
            price: l.entryOdds,
            side: l.side,
          }));

          return {
            ...lineup,
            legs: newLegs,
            legCount: newLegs.length,
            totalOdds: calculateParlayOdds(oddsLegs),
            impliedProbability: calculateImpliedProbability(oddsLegs),
            updatedAt: Date.now(),
          };
        })
      );
    },
    []
  );

  // ==========================================================================
  // Calculations
  // ==========================================================================

  const calculateOdds = useCallback(
    async (request: CalculateOddsRequest): Promise<CalculateOddsResponse> => {
      const stake = request.stake ?? 100;
      const leverage = request.leverage ?? 1;

      // Mock market data for now
      const legsData = request.legs.map((leg) => ({
        marketId: leg.marketId,
        price: 0.5, // Default
        side: leg.side,
        question: `Market ${leg.marketId}`,
        resolutionDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        category: "unknown",
        venue: leg.venue,
        volume24h: 100000,
      }));

      const oddsLegs = legsData.map((l) => ({ price: l.price, side: l.side }));
      const totalOdds = calculateParlayOdds(oddsLegs);
      const impliedProbability = calculateImpliedProbability(oddsLegs);
      const potentialPayout = calculatePotentialPayout(stake, totalOdds, leverage);

      const resolutionWindow = calculateResolutionWindow(
        legsData.map((l) => ({ resolutionDate: l.resolutionDate }))
      );

      const risk = calculateRiskMetrics(
        legsData.map((l) => ({
          category: l.category,
          venue: l.venue,
          volume24h: l.volume24h,
        })),
        resolutionWindow,
        leverage
      );

      return {
        totalOdds,
        impliedProbability,
        potentialPayout,
        risk,
        resolutionWindow,
        legs: legsData.map((l) => ({
          marketId: l.marketId,
          decimalOdds: 1 / l.price,
          currentPrice: l.price,
          question: l.question,
          resolutionDate: l.resolutionDate,
        })),
      };
    },
    []
  );

  // ==========================================================================
  // Cashout
  // ==========================================================================

  const cashout = useCallback(
    async (lineupId: string): Promise<CashoutResponse> => {
      const lineup = lineups.find((l) => l.id === lineupId);
      if (!lineup) {
        return { success: false, cashoutValue: 0, message: "Lineup not found" };
      }

      if (!lineup.canCashout) {
        return { success: false, cashoutValue: 0, message: "Cannot cashout this lineup" };
      }

      // Calculate cashout value (with 5% fee)
      const cashoutValue = lineup.currentValue * 0.95;

      // Update lineup status
      setLineups((prev) =>
        prev.map((l) =>
          l.id === lineupId
            ? {
                ...l,
                status: "cancelled" as const,
                cashoutAt: Date.now(),
                cashoutValue,
                canCashout: false,
              }
            : l
        )
      );

      return {
        success: true,
        cashoutValue,
        message: `Successfully cashed out for $${cashoutValue.toFixed(2)}`,
      };
    },
    [lineups]
  );

  // ==========================================================================
  // Data Fetching
  // ==========================================================================

  const fetchLineups = useCallback(async (): Promise<void> => {
    // Lineups are stored locally for now
    // In future, could sync with backend
  }, []);

  const fetchTemplates = useCallback(async (): Promise<void> => {
    // Load built-in templates
    const builtInTemplates: ParlayTemplate[] = [
      {
        id: "crypto-bull",
        name: "Crypto Bull Run",
        description: "Bet on major crypto milestones",
        category: "crypto",
        icon: "🚀",
        slots: [
          { venue: "polymarket", category: "crypto", description: "BTC price target" },
          { venue: "polymarket", category: "crypto", description: "ETH milestone" },
          { venue: "kalshi", category: "economics", description: "Fed rate decision" },
        ],
        minLegs: 2,
        maxLegs: 5,
        suggestedStake: 100,
        suggestedLeverage: 2,
        riskLevel: "medium",
        popularity: 1250,
        avgReturn: 45,
        successRate: 32,
        creator: "omega",
        isOfficial: true,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      },
      {
        id: "election-sweep",
        name: "Election Sweep",
        description: "Multi-race election predictions",
        category: "politics",
        icon: "🗳️",
        slots: [
          { venue: "polymarket", category: "politics", description: "Presidential race" },
          { venue: "polymarket", category: "politics", description: "Senate control" },
          { venue: "kalshi", category: "politics", description: "House control" },
        ],
        minLegs: 2,
        maxLegs: 6,
        suggestedStake: 50,
        suggestedLeverage: 1,
        riskLevel: "high",
        popularity: 890,
        avgReturn: 120,
        successRate: 18,
        creator: "omega",
        isOfficial: true,
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      },
      {
        id: "tech-earnings",
        name: "Tech Earnings Season",
        description: "Predict tech company earnings outcomes",
        category: "tech",
        icon: "📈",
        slots: [
          { venue: "kalshi", category: "tech", description: "AAPL earnings" },
          { venue: "kalshi", category: "tech", description: "GOOGL earnings" },
          { venue: "kalshi", category: "tech", description: "MSFT earnings" },
        ],
        minLegs: 2,
        maxLegs: 8,
        suggestedStake: 200,
        suggestedLeverage: 1,
        riskLevel: "low",
        popularity: 650,
        avgReturn: 25,
        successRate: 45,
        creator: "omega",
        isOfficial: true,
        createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      },
      {
        id: "sports-parlay",
        name: "Sports Multi",
        description: "Multi-event sports predictions",
        category: "sports",
        icon: "⚽",
        slots: [
          { venue: "polymarket", category: "sports", description: "Championship winner" },
          { venue: "polymarket", category: "sports", description: "MVP prediction" },
        ],
        minLegs: 2,
        maxLegs: 10,
        suggestedStake: 50,
        suggestedLeverage: 3,
        riskLevel: "high",
        popularity: 2100,
        avgReturn: 85,
        successRate: 12,
        creator: "omega",
        isOfficial: true,
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
      },
    ];

    setTemplates(builtInTemplates);
  }, []);

  const fetchLeaderboard = useCallback(async (timeframe?: string): Promise<void> => {
    // Mock leaderboard data
    const mockLeaderboard: ParlayLeaderboardEntry[] = Array.from(
      { length: 10 },
      (_, i) => ({
        rank: i + 1,
        address: `0x${(1234567890 + i).toString(16).padStart(40, "0")}`,
        displayName: `Trader${i + 1}`,
        totalLineups: 50 - i * 3,
        activeLineups: 5 - Math.floor(i / 3),
        wonLineups: 20 - i * 2,
        lostLineups: 10 + i,
        winRate: 60 - i * 4,
        totalStaked: 10000 - i * 500,
        totalPayout: 15000 - i * 800,
        totalPnl: 5000 - i * 300,
        avgReturn: 50 - i * 5,
        bestReturn: 500 - i * 30,
        followers: 1000 - i * 80,
        publicLineups: 30 - i * 2,
      })
    );

    setLeaderboard(mockLeaderboard);
  }, []);

  const refreshLineup = useCallback(async (id: string): Promise<void> => {
    // In future, fetch fresh market data and update prices
    setLineups((prev) =>
      prev.map((lineup) => {
        if (lineup.id !== id) return lineup;

        // Update current value based on "current" odds
        const currentValue = calculateCurrentValue(
          lineup.stake,
          lineup.leverage,
          lineup.legs
        );

        return {
          ...lineup,
          currentValue,
          pnl: currentValue - lineup.stake,
          pnlPercent: ((currentValue - lineup.stake) / lineup.stake) * 100,
          updatedAt: Date.now(),
        };
      })
    );
  }, []);

  // ==========================================================================
  // Social
  // ==========================================================================

  const shareLineup = useCallback(async (id: string): Promise<string> => {
    const lineup = lineups.find((l) => l.id === id);
    if (!lineup) throw new Error("Lineup not found");

    // Make public if not already
    if (!lineup.isPublic) {
      setLineups((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isPublic: true } : l))
      );
    }

    // Generate share URL
    return `https://omegaterminal.com/parlay/${id}`;
  }, [lineups]);

  const copyLineup = useCallback(
    async (id: string): Promise<ParlayLineup> => {
      const original = lineups.find((l) => l.id === id);
      if (!original) throw new Error("Lineup not found");

      const copy: ParlayLineup = {
        ...original,
        id: `lineup-${Date.now()}`,
        name: `${original.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "draft",
        isPublic: false,
        shares: 0,
        likes: 0,
        copies: 0,
        comments: 0,
      };

      setLineups((prev) => [copy, ...prev]);

      // Increment original's copy count
      setLineups((prev) =>
        prev.map((l) => (l.id === id ? { ...l, copies: l.copies + 1 } : l))
      );

      return copy;
    },
    [lineups]
  );

  const likeLineup = useCallback(async (id: string): Promise<void> => {
    setLineups((prev) =>
      prev.map((l) => (l.id === id ? { ...l, likes: l.likes + 1 } : l))
    );
  }, []);

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const value: ParlayContextValue = useMemo(
    () => ({
      lineups,
      activeLineups,
      draftLineups,
      completedLineups,
      builder,
      templates,
      leaderboard,
      isLoading,
      error,

      // Builder actions
      openBuilder,
      closeBuilder,
      setBuilderName,
      setBuilderDescription,
      setBuilderStake,
      setBuilderLeverage,
      addMarketToBuilder,
      removeMarketFromBuilder,
      clearBuilder,
      useTemplate,

      // CRUD
      createLineup,
      updateLineup,
      deleteLineup,
      addLeg,
      removeLeg,

      // Calculations
      calculateOdds,

      // Cashout
      cashout,

      // Fetching
      fetchLineups,
      fetchTemplates,
      fetchLeaderboard,
      refreshLineup,

      // Social
      shareLineup,
      copyLineup,
      likeLineup,
    }),
    [
      lineups,
      activeLineups,
      draftLineups,
      completedLineups,
      builder,
      templates,
      leaderboard,
      isLoading,
      error,
      openBuilder,
      closeBuilder,
      setBuilderName,
      setBuilderDescription,
      setBuilderStake,
      setBuilderLeverage,
      addMarketToBuilder,
      removeMarketFromBuilder,
      clearBuilder,
      useTemplate,
      createLineup,
      updateLineup,
      deleteLineup,
      addLeg,
      removeLeg,
      calculateOdds,
      cashout,
      fetchLineups,
      fetchTemplates,
      fetchLeaderboard,
      refreshLineup,
      shareLineup,
      copyLineup,
      likeLineup,
    ]
  );

  return (
    <ParlayContext.Provider value={value}>{children}</ParlayContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useParlay(): ParlayContextValue {
  const context = useContext(ParlayContext);
  if (!context) {
    throw new Error("useParlay must be used within a ParlayProvider");
  }
  return context;
}

