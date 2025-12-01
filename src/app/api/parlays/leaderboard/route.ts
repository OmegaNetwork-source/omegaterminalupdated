import { NextRequest, NextResponse } from "next/server";

/**
 * Parlay Leaderboard API
 * 
 * GET /api/parlays/leaderboard - Get top parlay performers
 */

// Generate mock leaderboard data
function generateLeaderboard(timeframe: string, limit: number) {
  const multiplier = timeframe === "7d" ? 1 : timeframe === "30d" ? 3 : 10;
  
  return Array.from({ length: limit }, (_, i) => ({
    rank: i + 1,
    address: `0x${(1234567890 + i * 12345).toString(16).padStart(40, "0")}`,
    displayName: [
      "ParlayKing",
      "OddsWizard",
      "MarketMaster",
      "BetBaron",
      "PredictionPro",
      "AlphaHunter",
      "LineupLegend",
      "RiskRunner",
      "OddsOracle",
      "ParlayPrince",
      "MarketMaven",
      "BetBoss",
      "PredictorX",
      "AlphaAce",
      "LineupLord",
      "RiskRider",
      "OddsMaster",
      "ParlayPanda",
      "MarketMonk",
      "BetBeast",
    ][i] || `Trader${i + 1}`,
    
    // Performance stats
    totalLineups: Math.floor((50 - i * 2) * multiplier),
    activeLineups: Math.max(1, 8 - Math.floor(i / 2)),
    wonLineups: Math.floor((25 - i) * multiplier * 0.4),
    lostLineups: Math.floor((15 + i * 0.5) * multiplier * 0.3),
    winRate: parseFloat((65 - i * 3).toFixed(1)),
    
    // Financial performance
    totalStaked: parseFloat(((15000 - i * 800) * multiplier).toFixed(2)),
    totalPayout: parseFloat(((25000 - i * 1200) * multiplier).toFixed(2)),
    totalPnl: parseFloat(((10000 - i * 400) * multiplier).toFixed(2)),
    avgReturn: parseFloat((85 - i * 5).toFixed(1)),
    bestReturn: parseFloat((1200 - i * 80).toFixed(1)),
    
    // Social
    followers: Math.floor((2000 - i * 150)),
    publicLineups: Math.floor((35 - i * 2) * multiplier * 0.3),
    
    // Badge indicators
    badges: i < 3 ? ["top-performer", "verified"] : i < 7 ? ["verified"] : [],
    streak: Math.max(0, 5 - i),
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "30d";
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20", 10));
    const category = searchParams.get("category");

    // Validate timeframe
    if (!["7d", "30d", "all"].includes(timeframe)) {
      return NextResponse.json(
        { error: "Invalid timeframe. Use: 7d, 30d, or all" },
        { status: 400 }
      );
    }

    const leaderboard = generateLeaderboard(timeframe, limit);

    return NextResponse.json({
      timeframe,
      category: category || "all",
      leaderboard,
      total: leaderboard.length,
      updatedAt: Date.now(),
    });
  } catch (error: any) {
    console.error("[Leaderboard API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

