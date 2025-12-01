/**
 * Community Pools API for Parlay Builder
 * 
 * Manages community parlay pools where users can:
 * - Create pools with tier-based payouts
 * - Join existing pools by adding liquidity
 * - View featured ambassador pools
 * - Track big wins and leaderboards
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// =============================================================================
// Types
// =============================================================================

interface PoolCreator {
  id: string;
  name: string;
  avatar?: string;
  isAmbassador: boolean;
  winRate: number;
  totalPools: number;
  totalWins: number;
}

interface PoolLeg {
  marketId: string;
  venue: "polymarket" | "kalshi";
  question: string;
  side: "yes" | "no";
  odds: number;
}

interface TierPayout {
  tier: number;
  minContribution: number;
  multiplier: number;
}

interface CommunityPool {
  id: string;
  name: string;
  description?: string;
  creator: PoolCreator;
  legs: PoolLeg[];
  totalLiquidity: number;
  participants: number;
  maxParticipants: number;
  minEntry: number;
  maxEntry: number;
  potentialPayout: number;
  totalOdds: number;
  tierPayouts: TierPayout[];
  status: "open" | "locked" | "resolved" | "cancelled";
  createdAt: number;
  resolutionDate: number;
  tags: string[];
  isFeatured: boolean;
}

interface BigWin {
  id: string;
  poolId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  poolName: string;
  amountWon: number;
  amountStaked: number;
  multiplier: number;
  tier: number;
  timestamp: number;
  legs: number;
}

// =============================================================================
// Mock Data (would be replaced with database queries)
// =============================================================================

const mockCreators: PoolCreator[] = [
  {
    id: "creator-1",
    name: "OmegaTrader",
    isAmbassador: true,
    winRate: 67.5,
    totalPools: 48,
    totalWins: 32,
  },
  {
    id: "creator-2",
    name: "CryptoWhale",
    isAmbassador: true,
    winRate: 72.3,
    totalPools: 89,
    totalWins: 64,
  },
  {
    id: "creator-3",
    name: "PoliticalPundit",
    isAmbassador: false,
    winRate: 58.2,
    totalPools: 23,
    totalWins: 13,
  },
  {
    id: "creator-4",
    name: "SportsBettor99",
    isAmbassador: false,
    winRate: 61.8,
    totalPools: 156,
    totalWins: 96,
  },
];

const mockPools: CommunityPool[] = [
  {
    id: "pool-1",
    name: "Weekend Sports Parlay",
    description: "Multi-sport parlay focusing on NFL and NBA weekend games",
    creator: mockCreators[0],
    legs: [
      { marketId: "pm-1", venue: "polymarket", question: "Chiefs vs Bills - Chiefs Win", side: "yes", odds: 1.85 },
      { marketId: "pm-2", venue: "polymarket", question: "Lakers vs Celtics - Over 220.5", side: "yes", odds: 1.95 },
    ],
    totalLiquidity: 15420,
    participants: 48,
    maxParticipants: 100,
    minEntry: 25,
    maxEntry: 500,
    potentialPayout: 52000,
    totalOdds: 3.61,
    tierPayouts: [
      { tier: 1, minContribution: 250, multiplier: 1.25 },
      { tier: 2, minContribution: 100, multiplier: 1.1 },
      { tier: 3, minContribution: 25, multiplier: 1.0 },
    ],
    status: "open",
    createdAt: Date.now() - 3600000,
    resolutionDate: Date.now() + 86400000 * 2,
    tags: ["sports", "nfl", "nba"],
    isFeatured: true,
  },
  {
    id: "pool-2",
    name: "Crypto Momentum Play",
    description: "BTC and ETH price targets for end of year",
    creator: mockCreators[1],
    legs: [
      { marketId: "pm-3", venue: "polymarket", question: "BTC above $100k by Dec 31", side: "yes", odds: 2.1 },
      { marketId: "pm-4", venue: "polymarket", question: "ETH above $4k by Dec 31", side: "yes", odds: 1.75 },
    ],
    totalLiquidity: 89500,
    participants: 156,
    maxParticipants: 500,
    minEntry: 50,
    maxEntry: 2000,
    potentialPayout: 328000,
    totalOdds: 3.68,
    tierPayouts: [
      { tier: 1, minContribution: 1000, multiplier: 1.3 },
      { tier: 2, minContribution: 250, multiplier: 1.15 },
      { tier: 3, minContribution: 50, multiplier: 1.0 },
    ],
    status: "open",
    createdAt: Date.now() - 7200000,
    resolutionDate: Date.now() + 86400000 * 30,
    tags: ["crypto", "btc", "eth"],
    isFeatured: true,
  },
  {
    id: "pool-3",
    name: "Election Night Special",
    description: "Senate and House control predictions",
    creator: mockCreators[2],
    legs: [
      { marketId: "ks-1", venue: "kalshi", question: "Senate Control - Democrats", side: "no", odds: 2.2 },
      { marketId: "ks-2", venue: "kalshi", question: "House Control - Republicans", side: "yes", odds: 1.45 },
    ],
    totalLiquidity: 42100,
    participants: 89,
    maxParticipants: 200,
    minEntry: 20,
    maxEntry: 1000,
    potentialPayout: 134000,
    totalOdds: 3.19,
    tierPayouts: [
      { tier: 1, minContribution: 500, multiplier: 1.2 },
      { tier: 2, minContribution: 100, multiplier: 1.1 },
      { tier: 3, minContribution: 20, multiplier: 1.0 },
    ],
    status: "open",
    createdAt: Date.now() - 14400000,
    resolutionDate: Date.now() + 86400000 * 5,
    tags: ["politics", "elections"],
    isFeatured: false,
  },
  {
    id: "pool-4",
    name: "Tech Earnings Season",
    description: "FAANG stocks post-earnings moves",
    creator: mockCreators[3],
    legs: [
      { marketId: "pm-5", venue: "polymarket", question: "NVDA up after earnings", side: "yes", odds: 1.65 },
      { marketId: "pm-6", venue: "polymarket", question: "AAPL hits ATH in Q4", side: "yes", odds: 2.3 },
      { marketId: "pm-7", venue: "polymarket", question: "TSLA above $300 by EOY", side: "no", odds: 1.9 },
    ],
    totalLiquidity: 28750,
    participants: 67,
    maxParticipants: 150,
    minEntry: 50,
    maxEntry: 750,
    potentialPayout: 195000,
    totalOdds: 7.21,
    tierPayouts: [
      { tier: 1, minContribution: 400, multiplier: 1.2 },
      { tier: 2, minContribution: 150, multiplier: 1.1 },
      { tier: 3, minContribution: 50, multiplier: 1.0 },
    ],
    status: "open",
    createdAt: Date.now() - 28800000,
    resolutionDate: Date.now() + 86400000 * 45,
    tags: ["tech", "stocks", "earnings"],
    isFeatured: false,
  },
];

const mockBigWins: BigWin[] = [
  {
    id: "win-1",
    poolId: "pool-old-1",
    userId: "user-1",
    userName: "LuckyStriker",
    poolName: "NFL Sunday Slam",
    amountWon: 12450,
    amountStaked: 250,
    multiplier: 49.8,
    tier: 1,
    timestamp: Date.now() - 86400000,
    legs: 5,
  },
  {
    id: "win-2",
    poolId: "pool-old-2",
    userId: "user-2",
    userName: "CryptoKing",
    poolName: "BTC Moon Mission",
    amountWon: 8920,
    amountStaked: 500,
    multiplier: 17.84,
    tier: 1,
    timestamp: Date.now() - 172800000,
    legs: 4,
  },
  {
    id: "win-3",
    poolId: "pool-old-3",
    userId: "user-3",
    userName: "SportsBettor99",
    poolName: "March Madness Miracle",
    amountWon: 5600,
    amountStaked: 100,
    multiplier: 56.0,
    tier: 2,
    timestamp: Date.now() - 259200000,
    legs: 6,
  },
  {
    id: "win-4",
    poolId: "pool-old-4",
    userId: "user-4",
    userName: "PoliticsWatcher",
    poolName: "Election Sweep",
    amountWon: 3200,
    amountStaked: 200,
    multiplier: 16.0,
    tier: 1,
    timestamp: Date.now() - 345600000,
    legs: 3,
  },
  {
    id: "win-5",
    poolId: "pool-old-5",
    userId: "user-5",
    userName: "DeFiDegen",
    poolName: "Crypto Triple Play",
    amountWon: 15800,
    amountStaked: 750,
    multiplier: 21.07,
    tier: 1,
    timestamp: Date.now() - 432000000,
    legs: 4,
  },
];

// =============================================================================
// API Handler
// =============================================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const mode = searchParams.get("mode") || "all"; // all, featured, wins, pool
  const poolId = searchParams.get("poolId");
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const tag = searchParams.get("tag");
  const status = searchParams.get("status");

  try {
    // Get single pool
    if (mode === "pool" && poolId) {
      const pool = mockPools.find(p => p.id === poolId);
      if (!pool) {
        return NextResponse.json(
          { success: false, error: "Pool not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        pool,
      });
    }

    // Get featured pools (ambassador pools)
    if (mode === "featured") {
      const featured = mockPools
        .filter(p => p.isFeatured || p.creator.isAmbassador)
        .filter(p => !status || p.status === status)
        .slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        pools: featured,
        total: featured.length,
        mode: "featured",
      });
    }

    // Get big wins
    if (mode === "wins") {
      const wins = mockBigWins
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        wins,
        total: mockBigWins.length,
        mode: "wins",
      });
    }

    // Get leaderboard
    if (mode === "leaderboard") {
      const leaderboard = mockCreators
        .sort((a, b) => b.winRate - a.winRate)
        .slice(offset, offset + limit)
        .map((creator, index) => ({
          rank: index + 1,
          ...creator,
        }));

      return NextResponse.json({
        success: true,
        leaderboard,
        total: mockCreators.length,
        mode: "leaderboard",
      });
    }

    // Get all pools with optional filters
    let pools = [...mockPools];

    // Filter by tag
    if (tag) {
      pools = pools.filter(p => p.tags.includes(tag.toLowerCase()));
    }

    // Filter by status
    if (status) {
      pools = pools.filter(p => p.status === status);
    }

    // Sort by liquidity (most popular first)
    pools.sort((a, b) => b.totalLiquidity - a.totalLiquidity);

    // Paginate
    const paginatedPools = pools.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      pools: paginatedPools,
      total: pools.length,
      hasMore: offset + limit < pools.length,
      mode: "all",
    });

  } catch (error) {
    console.error("[Community API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch community data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Create a new pool
    if (action === "create") {
      const { name, description, legs, minEntry, maxEntry, maxParticipants, tierPayouts, initialLiquidity } = body;

      if (!name || !legs || legs.length < 2) {
        return NextResponse.json(
          { success: false, error: "Invalid pool data: name and at least 2 legs required" },
          { status: 400 }
        );
      }

      // Calculate total odds
      const totalOdds = legs.reduce((acc: number, leg: PoolLeg) => acc * leg.odds, 1);

      const newPool: CommunityPool = {
        id: `pool-${Date.now()}`,
        name,
        description,
        creator: mockCreators[0], // Would use authenticated user
        legs,
        totalLiquidity: initialLiquidity || minEntry,
        participants: 1,
        maxParticipants: maxParticipants || 100,
        minEntry: minEntry || 10,
        maxEntry: maxEntry || 1000,
        potentialPayout: (initialLiquidity || minEntry) * totalOdds,
        totalOdds,
        tierPayouts: tierPayouts || [
          { tier: 1, minContribution: maxEntry * 0.5, multiplier: 1.25 },
          { tier: 2, minContribution: maxEntry * 0.25, multiplier: 1.1 },
          { tier: 3, minContribution: minEntry, multiplier: 1.0 },
        ],
        status: "open",
        createdAt: Date.now(),
        resolutionDate: Math.max(...legs.map((l: PoolLeg) => Date.now() + 86400000 * 30)), // Would use actual market resolution dates
        tags: [],
        isFeatured: false,
      };

      // In production, would save to database
      mockPools.push(newPool);

      return NextResponse.json({
        success: true,
        pool: newPool,
        message: "Pool created successfully",
      });
    }

    // Join a pool
    if (action === "join") {
      const { poolId, amount } = body;

      const pool = mockPools.find(p => p.id === poolId);
      if (!pool) {
        return NextResponse.json(
          { success: false, error: "Pool not found" },
          { status: 404 }
        );
      }

      if (pool.status !== "open") {
        return NextResponse.json(
          { success: false, error: "Pool is not accepting new participants" },
          { status: 400 }
        );
      }

      if (amount < pool.minEntry || amount > pool.maxEntry) {
        return NextResponse.json(
          { success: false, error: `Entry must be between $${pool.minEntry} and $${pool.maxEntry}` },
          { status: 400 }
        );
      }

      if (pool.participants >= pool.maxParticipants) {
        return NextResponse.json(
          { success: false, error: "Pool is full" },
          { status: 400 }
        );
      }

      // Determine tier
      const tier = pool.tierPayouts.find(t => amount >= t.minContribution)?.tier || 3;

      // Update pool (in production, would use database transaction)
      pool.totalLiquidity += amount;
      pool.participants += 1;
      pool.potentialPayout = pool.totalLiquidity * pool.totalOdds;

      return NextResponse.json({
        success: true,
        pool,
        participation: {
          amount,
          tier,
          multiplier: pool.tierPayouts.find(t => t.tier === tier)?.multiplier || 1.0,
          potentialWin: amount * pool.totalOdds * (pool.tierPayouts.find(t => t.tier === tier)?.multiplier || 1.0),
        },
        message: "Successfully joined pool",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("[Community API] POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

