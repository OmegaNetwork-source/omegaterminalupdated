/**
 * DexScreener Search API Route
 * Direct integration with DexScreener API (no relayer needed)
 * TTL: 60 seconds (1 minute)
 */

import { NextRequest, NextResponse } from "next/server";

const DEXSCREENER_API_URL = "https://api.dexscreener.com/latest/dex";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Use DexScreener's direct search API
    // Format: https://api.dexscreener.com/latest/dex/search?q={query}
    // Note: DexScreener search works with token symbols, names, or addresses
    const apiUrl = `${DEXSCREENER_API_URL}/search?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 60 }, // Cache for 1 minute
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      return NextResponse.json(
        { 
          pairs: [],
          success: false,
          error: `DexScreener API error (${response.status}): ${errorText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // DexScreener returns { pairs: [...] }
    const pairs = data.pairs || [];
    
    // If no pairs found, try alternative search methods for common tokens
    if (pairs.length === 0) {
      // For common tokens, try alternatives
      const commonTokenMap: Record<string, string[]> = {
        "BTC": ["WBTC", "Bitcoin", "bitcoin"],
        "ETH": ["WETH", "Ethereum", "ethereum"],
        "SOL": ["Solana", "solana", "SOL"],
      };
      
      const queryUpper = query.toUpperCase();
      const alternatives = commonTokenMap[queryUpper] || [];
      
      for (const altQuery of alternatives) {
        if (altQuery === query) continue; // Skip if already tried
        
        try {
          const altResponse = await fetch(
            `${DEXSCREENER_API_URL}/search?q=${encodeURIComponent(altQuery)}`,
            {
              next: { revalidate: 60 },
              headers: { "Accept": "application/json" },
            }
          );
          
          if (altResponse.ok) {
            const altData = await altResponse.json();
            const altPairs = altData.pairs || [];
            if (altPairs.length > 0) {
              return NextResponse.json({
                pairs: altPairs,
                success: true,
              });
            }
          }
        } catch (altError) {
          // Continue with next alternative
          continue;
        }
      }
    }

    return NextResponse.json({
      pairs,
      success: true,
    });
  } catch (error) {
    console.error("DexScreener search error:", error);
    return NextResponse.json(
      {
        pairs: [],
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to search DexScreener",
      },
      { status: 500 }
    );
  }
}
