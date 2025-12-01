import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

/**
 * Parlay Calculation API
 * 
 * POST /api/parlays/calculate - Calculate odds and risk for a potential parlay
 */

interface LegInput {
  marketId: string;
  venue: "polymarket" | "kalshi";
  side: "yes" | "no";
}

interface MarketData {
  id: string;
  venue: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  resolutionDate: number;
  category: string;
  volume24h: number;
}

/**
 * Fetch market data from venue APIs
 */
async function fetchMarketData(leg: LegInput): Promise<MarketData | null> {
  try {
    const relayerUrl = config.RELAYER_URL;
    let url: string;

    if (leg.venue === "polymarket") {
      url = `${relayerUrl}/polymarket/event/${leg.marketId}`;
    } else {
      url = `${relayerUrl}/kalshi/market/${leg.marketId}`;
    }

    const response = await fetch(url, { 
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      console.error(`[Calculate API] Failed to fetch ${leg.venue} market ${leg.marketId}`);
      return null;
    }

    const data = await response.json();

    // Normalize data from different venue formats
    if (leg.venue === "polymarket") {
      // Polymarket format
      const market = data.market || data;
      return {
        id: leg.marketId,
        venue: leg.venue,
        question: market.question || market.title || leg.marketId,
        yesPrice: market.outcomePrices?.[0] || market.yes_price || 0.5,
        noPrice: market.outcomePrices?.[1] || market.no_price || 0.5,
        resolutionDate: new Date(market.end_date || market.endDate || Date.now() + 30 * 24 * 60 * 60 * 1000).getTime(),
        category: market.tags?.[0] || market.category || "unknown",
        volume24h: market.volume24hr || market.volume || 0,
      };
    } else {
      // Kalshi format
      const market = data.market || data;
      return {
        id: leg.marketId,
        venue: leg.venue,
        question: market.title || market.question || leg.marketId,
        yesPrice: market.yes_ask || market.yes_bid || 0.5,
        noPrice: market.no_ask || market.no_bid || 0.5,
        resolutionDate: new Date(market.close_time || market.expiration_time || Date.now() + 30 * 24 * 60 * 60 * 1000).getTime(),
        category: market.category || "unknown",
        volume24h: market.volume_24h || market.volume || 0,
      };
    }
  } catch (error) {
    console.error(`[Calculate API] Error fetching market data:`, error);
    return null;
  }
}

/**
 * Calculate decimal odds for a leg
 */
function calculateLegOdds(price: number, side: "yes" | "no"): number {
  const effectivePrice = side === "yes" ? price : (1 - price);
  const clampedPrice = Math.max(0.01, Math.min(0.99, effectivePrice));
  return 1 / clampedPrice;
}

/**
 * Calculate risk score
 */
function calculateRiskScore(
  legs: MarketData[],
  leverage: number
): { score: number; level: string; warnings: string[]; suggestions: string[] } {
  let score = 0;
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Correlation risk
  const categories = new Map<string, number>();
  for (const leg of legs) {
    categories.set(leg.category, (categories.get(leg.category) || 0) + 1);
  }
  for (const count of categories.values()) {
    if (count > 1) {
      score += (count - 1) * 5;
    }
  }
  if (score > 15) {
    warnings.push("High market correlation detected");
    suggestions.push("Consider diversifying across categories");
  }

  // Time risk
  const now = Date.now();
  const resolutionDates = legs.map(l => l.resolutionDate).sort((a, b) => a - b);
  const latest = resolutionDates[resolutionDates.length - 1];
  const durationDays = Math.ceil((latest - now) / (1000 * 60 * 60 * 24));
  
  if (durationDays > 180) score += 10;
  else if (durationDays > 90) score += 7;
  else if (durationDays > 30) score += 4;

  if (durationDays > 90) {
    warnings.push("Long resolution window");
    suggestions.push("Consider shorter-term markets");
  }

  // Leverage risk
  score += (leverage - 1) * 6;
  if (leverage > 3) {
    warnings.push(`High leverage (${leverage}x)`);
    suggestions.push("Consider reducing leverage");
  }

  // Liquidity risk
  const avgVolume = legs.reduce((sum, l) => sum + l.volume24h, 0) / legs.length;
  if (avgVolume < 10000) {
    score += 15;
    warnings.push("Low liquidity in some markets");
    suggestions.push("Low liquidity may affect execution");
  } else if (avgVolume < 50000) {
    score += 10;
  } else if (avgVolume < 100000) {
    score += 5;
  }

  // Leg count risk
  if (legs.length > 6) {
    score += 10;
    warnings.push(`${legs.length} legs makes winning unlikely`);
    suggestions.push("Consider fewer legs for better odds");
  } else if (legs.length > 4) {
    score += 5;
  }

  score = Math.min(100, score);
  const level = score < 25 ? "low" : score < 50 ? "medium" : score < 75 ? "high" : "extreme";

  return { score, level, warnings, suggestions };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { legs, stake = 100, leverage = 1 } = body;

    // Validate input
    if (!Array.isArray(legs) || legs.length < 2) {
      return NextResponse.json(
        { error: "At least 2 legs are required" },
        { status: 400 }
      );
    }

    if (legs.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 legs allowed" },
        { status: 400 }
      );
    }

    // Fetch market data for each leg
    const marketDataPromises = legs.map((leg: LegInput) => fetchMarketData(leg));
    const marketDataResults = await Promise.all(marketDataPromises);

    // Build response with fallbacks for failed fetches
    const legsWithData = legs.map((leg: LegInput, index: number) => {
      const marketData = marketDataResults[index];
      
      if (marketData) {
        const price = leg.side === "yes" ? marketData.yesPrice : marketData.noPrice;
        return {
          marketId: leg.marketId,
          venue: leg.venue,
          side: leg.side,
          currentPrice: price,
          decimalOdds: calculateLegOdds(price, leg.side),
          question: marketData.question,
          resolutionDate: marketData.resolutionDate,
          category: marketData.category,
          volume24h: marketData.volume24h,
        };
      } else {
        // Fallback with default values
        return {
          marketId: leg.marketId,
          venue: leg.venue,
          side: leg.side,
          currentPrice: 0.5,
          decimalOdds: 2,
          question: `Market ${leg.marketId}`,
          resolutionDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          category: "unknown",
          volume24h: 0,
        };
      }
    });

    // Calculate total odds (multiply all leg odds)
    const totalOdds = legsWithData.reduce(
      (acc: number, leg: any) => acc * leg.decimalOdds,
      1
    );

    // Calculate implied probability
    const impliedProbability = 1 / totalOdds;

    // Calculate potential payout
    const potentialPayout = stake * totalOdds * leverage;

    // Calculate resolution window
    const resolutionDates = legsWithData
      .map((l: any) => l.resolutionDate)
      .sort((a: number, b: number) => a - b);
    
    const resolutionWindow = {
      earliest: resolutionDates[0],
      latest: resolutionDates[resolutionDates.length - 1],
      durationDays: Math.max(0, Math.ceil(
        (resolutionDates[resolutionDates.length - 1] - Date.now()) / (1000 * 60 * 60 * 24)
      )),
      spreadDays: Math.ceil(
        (resolutionDates[resolutionDates.length - 1] - resolutionDates[0]) / (1000 * 60 * 60 * 24)
      ),
    };

    // Calculate risk
    const validMarkets = marketDataResults.filter((m): m is MarketData => m !== null);
    const risk = calculateRiskScore(
      validMarkets.length > 0 ? validMarkets : legsWithData.map((l: any) => ({
        id: l.marketId,
        venue: l.venue,
        question: l.question,
        yesPrice: 0.5,
        noPrice: 0.5,
        resolutionDate: l.resolutionDate,
        category: l.category,
        volume24h: l.volume24h,
      })),
      leverage
    );

    return NextResponse.json({
      totalOdds: parseFloat(totalOdds.toFixed(2)),
      impliedProbability: parseFloat((impliedProbability * 100).toFixed(2)),
      potentialPayout: parseFloat(potentialPayout.toFixed(2)),
      resolutionWindow,
      risk,
      legs: legsWithData,
    });
  } catch (error: any) {
    console.error("[Calculate API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

