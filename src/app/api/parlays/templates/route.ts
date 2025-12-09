import { NextRequest, NextResponse } from "next/server";

/**
 * Parlay Templates API
 * 
 * GET /api/parlays/templates - Get available parlay templates
 */

const TEMPLATES = [
  {
    id: "crypto-bull",
    name: "Crypto Bull Run",
    description: "Bet on major crypto milestones hitting together",
    category: "crypto",
    icon: "🚀",
    slots: [
      { venue: "polymarket", category: "crypto", description: "BTC price target", tags: ["bitcoin", "btc"] },
      { venue: "polymarket", category: "crypto", description: "ETH milestone", tags: ["ethereum", "eth"] },
      { venue: "kalshi", category: "economics", description: "Fed rate decision", tags: ["fed", "rates"] },
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
  },
  {
    id: "election-sweep",
    name: "Election Sweep",
    description: "Multi-race election predictions for maximum payout",
    category: "politics",
    icon: "🗳️",
    slots: [
      { venue: "polymarket", category: "politics", description: "Presidential race", tags: ["president", "2024"] },
      { venue: "polymarket", category: "politics", description: "Senate control", tags: ["senate", "congress"] },
      { venue: "kalshi", category: "politics", description: "House control", tags: ["house", "congress"] },
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
  },
  {
    id: "tech-earnings",
    name: "Tech Earnings Season",
    description: "Predict tech company earnings outcomes",
    category: "tech",
    icon: "📈",
    slots: [
      { venue: "kalshi", category: "tech", description: "AAPL earnings beat", tags: ["apple", "earnings"] },
      { venue: "kalshi", category: "tech", description: "GOOGL earnings beat", tags: ["google", "earnings"] },
      { venue: "kalshi", category: "tech", description: "MSFT earnings beat", tags: ["microsoft", "earnings"] },
      { venue: "kalshi", category: "tech", description: "NVDA earnings beat", tags: ["nvidia", "earnings"] },
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
  },
  {
    id: "sports-parlay",
    name: "Championship Multi",
    description: "Multi-event sports championship predictions",
    category: "sports",
    icon: "🏆",
    slots: [
      { venue: "polymarket", category: "sports", description: "Championship winner", tags: ["nba", "nfl", "mlb"] },
      { venue: "polymarket", category: "sports", description: "MVP prediction", tags: ["mvp", "player"] },
      { venue: "polymarket", category: "sports", description: "Finals matchup", tags: ["finals", "playoff"] },
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
  },
  {
    id: "macro-thesis",
    name: "Macro Thesis",
    description: "Combine economic and market predictions",
    category: "economics",
    icon: "🌍",
    slots: [
      { venue: "kalshi", category: "economics", description: "GDP growth target", tags: ["gdp", "economy"] },
      { venue: "kalshi", category: "economics", description: "Inflation level", tags: ["cpi", "inflation"] },
      { venue: "kalshi", category: "economics", description: "Unemployment rate", tags: ["jobs", "unemployment"] },
      { venue: "polymarket", category: "crypto", description: "BTC as hedge", tags: ["bitcoin", "hedge"] },
    ],
    minLegs: 2,
    maxLegs: 6,
    suggestedStake: 150,
    suggestedLeverage: 1,
    riskLevel: "medium",
    popularity: 420,
    avgReturn: 35,
    successRate: 28,
    creator: "omega",
    isOfficial: true,
  },
  {
    id: "ai-revolution",
    name: "AI Revolution",
    description: "Bet on AI milestones and company performance",
    category: "tech",
    icon: "🤖",
    slots: [
      { venue: "polymarket", category: "tech", description: "AGI timeline", tags: ["agi", "ai"] },
      { venue: "kalshi", category: "tech", description: "NVDA market cap", tags: ["nvidia", "marketcap"] },
      { venue: "polymarket", category: "tech", description: "AI regulation", tags: ["ai", "regulation"] },
    ],
    minLegs: 2,
    maxLegs: 5,
    suggestedStake: 100,
    suggestedLeverage: 2,
    riskLevel: "medium",
    popularity: 780,
    avgReturn: 55,
    successRate: 25,
    creator: "omega",
    isOfficial: true,
  },
  {
    id: "world-events",
    name: "World Events Multi",
    description: "Combine geopolitical and global event predictions",
    category: "world",
    icon: "🌐",
    slots: [
      { venue: "polymarket", category: "geopolitics", description: "Conflict resolution", tags: ["war", "peace"] },
      { venue: "kalshi", category: "world", description: "Climate milestone", tags: ["climate", "environment"] },
      { venue: "polymarket", category: "world", description: "Global summit outcome", tags: ["summit", "diplomacy"] },
    ],
    minLegs: 2,
    maxLegs: 5,
    suggestedStake: 75,
    suggestedLeverage: 1,
    riskLevel: "high",
    popularity: 320,
    avgReturn: 150,
    successRate: 15,
    creator: "omega",
    isOfficial: true,
  },
  {
    id: "degen-yolo",
    name: "Degen YOLO",
    description: "High-risk, high-reward multi-leg parlay for degens",
    category: "degen",
    icon: "🎰",
    slots: [
      { venue: "any", category: "any", description: "Long shot #1", tags: [] },
      { venue: "any", category: "any", description: "Long shot #2", tags: [] },
      { venue: "any", category: "any", description: "Long shot #3", tags: [] },
      { venue: "any", category: "any", description: "Long shot #4", tags: [] },
      { venue: "any", category: "any", description: "Long shot #5", tags: [] },
    ],
    minLegs: 5,
    maxLegs: 10,
    suggestedStake: 25,
    suggestedLeverage: 5,
    riskLevel: "extreme",
    popularity: 1500,
    avgReturn: 500,
    successRate: 3,
    creator: "omega",
    isOfficial: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const riskLevel = searchParams.get("riskLevel");

    let filtered = [...TEMPLATES];

    if (category) {
      filtered = filtered.filter((t) => t.category === category);
    }

    if (riskLevel) {
      filtered = filtered.filter((t) => t.riskLevel === riskLevel);
    }

    // Sort by popularity
    filtered.sort((a, b) => b.popularity - a.popularity);

    return NextResponse.json({
      templates: filtered,
      total: filtered.length,
    });
  } catch (error: any) {
    console.error("[Templates API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


