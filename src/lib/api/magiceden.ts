/**
 * Magic Eden API Client
 *
 * Handles Magic Eden Solana NFT marketplace integration.
 * Uses Next.js API routes for caching benefits and CORS handling.
 * All prices in SOL (converted from lamports).
 */

import { RELAYER_URL } from "@/lib/config";
import {
  MagicEdenListing,
  MagicEdenStats,
  MagicEdenActivity,
} from "@/types/nft";

const MAGICEDEN_ENDPOINTS = {
  ACTIVITIES: "/api/magiceden/activities",
  STATS: "/api/magiceden/stats",
  LISTINGS: "/api/magiceden/listings",
  HOLDER_STATS: "/magiceden/holder_stats", // Direct relayer (no route yet)
  ATTRIBUTES: "/magiceden/attributes", // Direct relayer (no route yet)
  TRENDING: "/api/magiceden/trending",
};

/**
 * Fetch recent activities for a collection
 * Uses Next.js API route for caching benefits
 */
export async function fetchActivities(
  collectionSymbol: string,
  limit: number = 10
): Promise<{
  activities: MagicEdenActivity[];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${MAGICEDEN_ENDPOINTS.ACTIVITIES}?symbol=${collectionSymbol}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      activities: data.activities || [],
      success: data.success || true,
    };
  } catch (error) {
    return {
      activities: [],
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch activities",
    };
  }
}

/**
 * Fetch collection statistics
 * Uses Next.js API route for caching benefits
 */
export async function fetchStats(
  collectionSymbol: string
): Promise<{ stats: MagicEdenStats | null; success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${MAGICEDEN_ENDPOINTS.STATS}?symbol=${collectionSymbol}`
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      stats: data.stats || data,
      success: data.success || true,
    };
  } catch (error) {
    return {
      stats: null,
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
    };
  }
}

/**
 * Fetch current listings for a collection
 * Uses Next.js API route for caching benefits
 */
export async function fetchListings(
  collectionSymbol: string,
  limit: number = 20
): Promise<{ listings: MagicEdenListing[]; success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${MAGICEDEN_ENDPOINTS.LISTINGS}?symbol=${collectionSymbol}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      listings: data.listings || [],
      success: data.success || true,
    };
  } catch (error) {
    return {
      listings: [],
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch listings",
    };
  }
}

/**
 * Fetch holder statistics for a collection
 * Direct relayer call (no Next.js route yet - creates client-side fetch)
 */
export async function fetchHolderStats(
  collectionSymbol: string
): Promise<{ holderStats: any | null; success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${RELAYER_URL}${MAGICEDEN_ENDPOINTS.HOLDER_STATS}?symbol=${collectionSymbol}`
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      holderStats: data,
      success: true,
    };
  } catch (error) {
    return {
      holderStats: null,
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch holder stats",
    };
  }
}

/**
 * Fetch collection attributes/traits
 * Direct relayer call (no Next.js route yet - creates client-side fetch)
 */
export async function fetchAttributes(
  collectionSymbol: string
): Promise<{ attributes: any[]; success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${RELAYER_URL}${MAGICEDEN_ENDPOINTS.ATTRIBUTES}?symbol=${collectionSymbol}`
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      attributes: data || [],
      success: true,
    };
  } catch (error) {
    return {
      attributes: [],
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch attributes",
    };
  }
}

/**
 * Fetch trending collections
 * Uses Next.js API route for caching benefits
 */
export async function fetchTrending(
  timeRange: "1h" | "1d" | "7d" | "30d" = "1d"
): Promise<{ collections: any[]; success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${MAGICEDEN_ENDPOINTS.TRENDING}?timeRange=${timeRange}`
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      collections: data.collections || [],
      success: data.success || true,
    };
  } catch (error) {
    return {
      collections: [],
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch trending collections",
    };
  }
}

/**
 * Format SOL price from lamports or priceInfo object
 * Returns formatted string with SOL symbol
 */
export function formatSOL(price: number | object | undefined): string {
  if (typeof price === "number") {
    return `${(price / 1e9).toFixed(2)} ◎`;
  }

  if (typeof price === "object" && price !== null) {
    const priceInfo = price as any;
    const solPrice = priceInfo.solPrice || priceInfo.price || 0;
    return `${(solPrice / 1e9).toFixed(2)} ◎`;
  }

  return "-- ◎";
}

/**
 * Format Unix timestamp to relative time
 */
export function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Get emoji for activity type
 */
export function getActivityEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    list: "📋",
    delist: "❌",
    buyNow: "💰",
    bid: "🎯",
    acceptBid: "✅",
    cancelBid: "⛔",
  };

  return emojiMap[type] || "📝";
}
