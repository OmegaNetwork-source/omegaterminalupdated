/**
 * Market Search API for Parlay Builder
 * 
 * Provides search, filtering, and discovery for prediction markets
 * across Polymarket and Kalshi.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  fetchAllMarkets,
  searchMarkets,
  getTrendingMarkets,
  getClosingSoonMarkets,
  getMarketsByCategory,
  MARKET_CATEGORIES,
} from "@/lib/parlay/market-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const query = searchParams.get("q") || searchParams.get("query") || "";
  const venue = searchParams.get("venue") || "all";
  const category = searchParams.get("category") || undefined;
  const sortBy = searchParams.get("sort") || searchParams.get("sortBy") || "volume";
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const mode = searchParams.get("mode"); // trending, closing, category
  
  // Days to close filter
  const minDays = searchParams.get("minDays") ? parseInt(searchParams.get("minDays")!, 10) : undefined;
  const maxDays = searchParams.get("maxDays") ? parseInt(searchParams.get("maxDays")!, 10) : undefined;

  try {
    // Handle special modes
    if (mode === "trending") {
      const trending = await getTrendingMarkets(limit);
      return NextResponse.json({
        success: true,
        markets: trending,
        total: trending.length,
        mode: "trending",
      });
    }

    if (mode === "closing") {
      const days = parseInt(searchParams.get("days") || "7", 10);
      const closing = await getClosingSoonMarkets(days, limit);
      return NextResponse.json({
        success: true,
        markets: closing,
        total: closing.length,
        mode: "closing",
        days,
      });
    }

    if (mode === "categories") {
      return NextResponse.json({
        success: true,
        categories: MARKET_CATEGORIES,
      });
    }

    // Standard search/fetch
    const result = await searchMarkets({
      query,
      venue: venue as any,
      category,
      sortBy: sortBy as any,
      limit,
      offset,
      minDays,
      maxDays,
    });

    return NextResponse.json({
      success: true,
      ...result,
      query,
      venue,
      category,
      sortBy,
      limit,
      offset,
      minDays,
      maxDays,
    });
  } catch (error) {
    console.error("[Markets API] Error:", error);
    console.error("[Markets API] Stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Return more detailed error info for debugging
    const errorDetails = {
      success: false,
      error: "Failed to fetch markets",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      params: {
        query,
        venue,
        category,
        sortBy,
        limit,
        offset,
        mode,
        minDays,
        maxDays,
      },
    };
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}

