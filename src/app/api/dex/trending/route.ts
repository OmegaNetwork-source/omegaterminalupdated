/**
 * DexScreener Trending API Route
 * Direct integration with DexScreener API for trending tokens
 * Uses search with empty query to get popular tokens, or searches for common trending tokens
 * TTL: 120 seconds (2 minutes)
 */

import { NextRequest, NextResponse } from "next/server";

const DEXSCREENER_API_URL = "https://api.dexscreener.com/latest/dex";

export async function GET(request: NextRequest) {
  try {
    // DexScreener doesn't have a direct "trending" endpoint
    // We'll search for popular tokens that are typically trending
    // Or use the pairs endpoint with popular token addresses
    // For now, let's search for a mix of popular tokens
    const popularTokens = ["WETH", "USDC", "USDT", "WBTC", "DAI", "UNI", "LINK", "AAVE"];
    
    // Fetch multiple popular tokens and combine results
    const allPairs: any[] = [];
    
    for (const token of popularTokens.slice(0, 3)) {
      try {
        const response = await fetch(
          `${DEXSCREENER_API_URL}/search?q=${encodeURIComponent(token)}`,
          {
            next: { revalidate: 120 },
            headers: {
              "Accept": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.pairs && Array.isArray(data.pairs)) {
            // Take top 2 pairs per token (highest volume)
            const topPairs = data.pairs
              .sort((a: any, b: any) => {
                const volumeA = a.volume?.h24 || 0;
                const volumeB = b.volume?.h24 || 0;
                return volumeB - volumeA;
              })
              .slice(0, 2);
            allPairs.push(...topPairs);
          }
        }
      } catch (err) {
        // Continue with other tokens if one fails
        console.error(`Failed to fetch ${token}:`, err);
      }
    }

    // Sort by 24h volume and return top results
    const sortedPairs = allPairs
      .sort((a: any, b: any) => {
        const volumeA = a.volume?.h24 || 0;
        const volumeB = b.volume?.h24 || 0;
        return volumeB - volumeA;
      })
      .slice(0, 10);

    return NextResponse.json({
      pairs: sortedPairs,
      success: true,
    });
  } catch (error) {
    console.error("DexScreener trending error:", error);
    return NextResponse.json(
      {
        pairs: [],
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch trending tokens",
      },
      { status: 500 }
    );
  }
}
