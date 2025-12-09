/**
 * DexScreener API Client
 *
 * Provides integration with DexScreener for token search and analytics.
 * Uses internal API routes for server-side caching.
 * Implements Next.js 15 caching strategies for optimal performance.
 *
 * Note: Advanced features (portfolio, watchlist, alerts, gem discovery) from
 * dexscreener-analytics-ultimate.js plugin are deferred to Phase 15 (futuristic UI system).
 */

import type { DexScreenerPair } from "@/types/api";

/**
 * Search for tokens on DexScreener
 * Returns up to 10 matching token pairs
 *
 * @param query - Token symbol or address to search
 * @returns Search results with token pairs
 */
export async function searchTokens(
  query: string
): Promise<{ pairs: DexScreenerPair[]; success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `/api/dex/search?q=${encodeURIComponent(query)}`,
      {
        cache: "no-store", // Don't use Next.js cache on client side
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle both array format and {pairs: []} format
    const pairs = Array.isArray(data) ? data : data.pairs || [];

    // Return up to 10 results
    return {
      pairs: pairs.slice(0, 10),
      success: true,
    };
  } catch (error) {
    console.error("DexScreener searchTokens error:", error);
    return {
      pairs: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get trending tokens from DexScreener
 * Returns currently trending token pairs
 *
 * @returns Trending token pairs
 */
export async function getTrendingTokens(): Promise<{
  pairs: DexScreenerPair[];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/dex/trending`, {
      cache: "no-store", // Don't use Next.js cache on client side
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const pairs = Array.isArray(data) ? data : data.pairs || [];

    return {
      pairs,
      success: true,
    };
  } catch (error) {
    console.error("DexScreener getTrendingTokens error:", error);
    return {
      pairs: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get detailed analytics for a specific token
 * Returns comprehensive pair data including liquidity, volume, and price changes
 *
 * @param tokenAddress - Token contract address
 * @returns Detailed token pair analytics
 */
export async function getTokenAnalytics(tokenAddress: string): Promise<{
  pair: DexScreenerPair | null;
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/dex/pairs/${tokenAddress}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.statusText}`);
    }

    const data = await response.json();
    const pair = data.pair || data;

    return {
      pair,
      success: true,
    };
  } catch (error) {
    return {
      pair: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
