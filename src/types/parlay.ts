/**
 * Omega Parlay Builder Types
 * 
 * Core data models for the cross-platform prediction market parlay system.
 * Supports Polymarket and Kalshi markets with leverage and risk management.
 */

// =============================================================================
// Core Enums
// =============================================================================

export type ParlayStatus = 'draft' | 'active' | 'won' | 'lost' | 'partial' | 'cancelled';
export type ParlayLegStatus = 'pending' | 'won' | 'lost' | 'void' | 'cancelled';
export type ParlayVenue = 'polymarket' | 'kalshi';
export type ParlaySide = 'yes' | 'no';
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';
export type LeverageLevel = 1 | 2 | 3 | 4 | 5;

// =============================================================================
// Market Types (from external sources)
// =============================================================================

// Market Outcome for multi-option markets (like ETH price ranges)
export interface MarketOutcome {
  id: string;
  label: string; // e.g., "2,600-2,700" or "<2,600"
  probability: number; // 0-1 (% chance)
  yesPrice: number; // Price to buy Yes
  noPrice: number; // Price to buy No
  volume: number;
}

// Price history point for charts
export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface ParlayMarket {
  id: string;
  venue: ParlayVenue;
  question: string;
  description?: string;
  category: string;
  tags: string[];
  
  // Pricing (for binary yes/no markets)
  yesPrice: number; // 0-1 (probability)
  noPrice: number; // 0-1 (1 - yesPrice)
  
  // Multi-outcome support (for markets like ETH price ranges)
  outcomes?: MarketOutcome[];
  isMultiOutcome?: boolean;
  
  // Price history for charts
  priceHistory?: PriceHistoryPoint[];
  
  // Volume & Liquidity
  volume24h: number;
  totalVolume: number;
  liquidity: number;
  
  // Timing
  createdAt: number;
  resolutionDate: number;
  closesAt?: number;
  
  // Status
  isActive: boolean;
  isResolved: boolean;
  resolution?: 'yes' | 'no' | 'void';
  
  // Additional metadata
  imageUrl?: string;
  sourceUrl?: string;
}

// =============================================================================
// Parlay Leg (Individual Market Selection)
// =============================================================================

export interface ParlayLeg {
  id: string;
  lineupId: string;
  
  // Market reference
  marketId: string;
  venue: ParlayVenue;
  
  // User's position
  side: ParlaySide;
  weight: number; // 0-1, allocation weight (optional for advanced mode)
  
  // Odds at creation
  entryOdds: number; // Price when added (0-1)
  currentOdds: number; // Real-time price (0-1)
  
  // Implied odds for payout calculation
  decimalOdds: number; // e.g., 1.54 for 65% probability
  
  // Resolution
  resolutionDate: number;
  status: ParlayLegStatus;
  resolvedAt?: number;
  
  // Market metadata (cached for display)
  question: string;
  category: string;
  volume24h: number;
  
  // Timestamps
  addedAt: number;
  updatedAt: number;
}

// =============================================================================
// Resolution Window
// =============================================================================

export interface ResolutionWindow {
  earliest: number; // Timestamp of first market resolution
  latest: number; // Timestamp of last market resolution
  durationDays: number; // Duration in days
  spreadDays: number; // Spread between earliest and latest
}

// =============================================================================
// Risk Metrics
// =============================================================================

export interface RiskMetrics {
  score: number; // 0-100
  level: RiskLevel;
  
  // Component scores
  correlationRisk: number; // 0-30
  timeRisk: number; // 0-20
  leverageRisk: number; // 0-25
  liquidityRisk: number; // 0-15
  legCountRisk: number; // 0-10
  
  // Insights
  warnings: string[];
  suggestions: string[];
}

// =============================================================================
// Parlay Lineup (Main Entity)
// =============================================================================

export interface ParlayLineup {
  id: string;
  name: string;
  description?: string;
  
  // Ownership
  creator: string; // Wallet address
  createdAt: number;
  updatedAt: number;
  
  // Status
  status: ParlayStatus;
  
  // Legs
  legs: ParlayLeg[];
  legCount: number;
  resolvedCount: number;
  wonCount: number;
  
  // Financials
  stake: number; // USD amount
  leverage: LeverageLevel;
  
  // Calculated odds
  totalOdds: number; // Combined decimal odds (e.g., 12.5)
  impliedProbability: number; // Combined probability (e.g., 0.08 for 8%)
  
  // Payouts
  potentialPayout: number; // stake * totalOdds * leverage
  currentValue: number; // Real-time value based on current prices
  
  // P&L
  pnl: number; // currentValue - stake
  pnlPercent: number; // pnl / stake * 100
  
  // Risk
  risk: RiskMetrics;
  resolutionWindow: ResolutionWindow;
  
  // Social
  isPublic: boolean;
  shares: number;
  likes: number;
  copies: number;
  comments: number;
  
  // Template reference (if created from template)
  templateId?: string;
  
  // Early cashout
  canCashout: boolean;
  cashoutValue?: number;
  cashoutAt?: number;
  
  // Final resolution
  resolvedAt?: number;
  finalPayout?: number;
}

// =============================================================================
// Parlay Template
// =============================================================================

export interface ParlayTemplateSlot {
  venue: ParlayVenue | 'any';
  category?: string;
  tags?: string[];
  description: string;
}

export interface ParlayTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  
  // Template slots
  slots: ParlayTemplateSlot[];
  minLegs: number;
  maxLegs: number;
  
  // Suggested settings
  suggestedStake: number;
  suggestedLeverage: LeverageLevel;
  riskLevel: RiskLevel;
  
  // Metadata
  popularity: number; // Times used
  avgReturn: number; // Average return %
  successRate: number; // Win rate %
  
  // Creator
  creator: string;
  isOfficial: boolean;
  createdAt: number;
}

// =============================================================================
// Leaderboard Entry
// =============================================================================

export interface ParlayLeaderboardEntry {
  rank: number;
  address: string;
  displayName?: string;
  
  // Stats
  totalLineups: number;
  activeLineups: number;
  wonLineups: number;
  lostLineups: number;
  winRate: number;
  
  // Performance
  totalStaked: number;
  totalPayout: number;
  totalPnl: number;
  avgReturn: number;
  bestReturn: number;
  
  // Social
  followers: number;
  publicLineups: number;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface CreateParlayRequest {
  name: string;
  description?: string;
  stake: number;
  leverage: LeverageLevel;
  legs: Array<{
    marketId: string;
    venue: ParlayVenue;
    side: ParlaySide;
  }>;
  isPublic?: boolean;
}

export interface UpdateParlayRequest {
  name?: string;
  description?: string;
  stake?: number;
  leverage?: LeverageLevel;
  isPublic?: boolean;
}

export interface AddLegRequest {
  marketId: string;
  venue: ParlayVenue;
  side: ParlaySide;
}

export interface CalculateOddsRequest {
  legs: Array<{
    marketId: string;
    venue: ParlayVenue;
    side: ParlaySide;
  }>;
  stake?: number;
  leverage?: LeverageLevel;
}

export interface CalculateOddsResponse {
  totalOdds: number;
  impliedProbability: number;
  potentialPayout: number;
  risk: RiskMetrics;
  resolutionWindow: ResolutionWindow;
  legs: Array<{
    marketId: string;
    decimalOdds: number;
    currentPrice: number;
    question: string;
    resolutionDate: number;
  }>;
}

export interface CashoutRequest {
  lineupId: string;
}

export interface CashoutResponse {
  success: boolean;
  cashoutValue: number;
  message: string;
}

// =============================================================================
// Provider State
// =============================================================================

export interface ParlayState {
  // Active lineups
  lineups: ParlayLineup[];
  activeLineups: ParlayLineup[];
  draftLineups: ParlayLineup[];
  completedLineups: ParlayLineup[];
  
  // Current builder state
  builder: {
    isOpen: boolean;
    name: string;
    description: string;
    stake: number;
    leverage: LeverageLevel;
    selectedLegs: Array<{
      market: ParlayMarket;
      side: ParlaySide;
    }>;
    template?: ParlayTemplate;
  };
  
  // Templates
  templates: ParlayTemplate[];
  
  // Leaderboard
  leaderboard: ParlayLeaderboardEntry[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
}

export interface ParlayContextValue extends ParlayState {
  // Builder actions
  openBuilder: () => void;
  closeBuilder: () => void;
  setBuilderName: (name: string) => void;
  setBuilderDescription: (description: string) => void;
  setBuilderStake: (stake: number) => void;
  setBuilderLeverage: (leverage: LeverageLevel) => void;
  addMarketToBuilder: (market: ParlayMarket, side: ParlaySide) => void;
  removeMarketFromBuilder: (marketId: string) => void;
  clearBuilder: () => void;
  useTemplate: (template: ParlayTemplate) => void;
  
  // CRUD operations
  createLineup: (request: CreateParlayRequest) => Promise<ParlayLineup>;
  updateLineup: (id: string, request: UpdateParlayRequest) => Promise<ParlayLineup>;
  deleteLineup: (id: string) => Promise<void>;
  addLeg: (lineupId: string, request: AddLegRequest) => Promise<ParlayLeg>;
  removeLeg: (lineupId: string, legId: string) => Promise<void>;
  
  // Calculations
  calculateOdds: (request: CalculateOddsRequest) => Promise<CalculateOddsResponse>;
  
  // Cashout
  cashout: (lineupId: string) => Promise<CashoutResponse>;
  
  // Data fetching
  fetchLineups: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  fetchLeaderboard: (timeframe?: string) => Promise<void>;
  refreshLineup: (id: string) => Promise<void>;
  
  // Social
  shareLineup: (id: string) => Promise<string>;
  copyLineup: (id: string) => Promise<ParlayLineup>;
  likeLineup: (id: string) => Promise<void>;
}

// =============================================================================
// Utility Types
// =============================================================================

export interface ParlayFilter {
  status?: ParlayStatus[];
  venue?: ParlayVenue[];
  category?: string[];
  minStake?: number;
  maxStake?: number;
  minOdds?: number;
  maxOdds?: number;
  dateRange?: {
    start: number;
    end: number;
  };
}

export interface ParlaySort {
  field: 'createdAt' | 'stake' | 'totalOdds' | 'potentialPayout' | 'pnl' | 'risk';
  direction: 'asc' | 'desc';
}

// =============================================================================
// Event Types (for real-time updates)
// =============================================================================

export interface ParlayEvent {
  type: 'leg_resolved' | 'lineup_won' | 'lineup_lost' | 'odds_updated' | 'cashout_available';
  lineupId: string;
  legId?: string;
  data: Record<string, any>;
  timestamp: number;
}

