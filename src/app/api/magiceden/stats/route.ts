/**
 * Magic Eden Stats API Route
 *
 * Proxies Magic Eden collection stats from their API.
 * Provides Next.js caching for better performance.
 *
 * GET /api/magiceden/stats?symbol={collectionSymbol}
 */

import type { NextRequest } from "next/server";
import { createSecureResponse } from "@/lib/middleware";

const MAGICEDEN_API_BASE = "https://api-mainnet.magiceden.dev/v2";

/**
 * GET handler - fetch collection statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const symbol = searchParams.get("symbol");

    // Validate required parameters
    if (!symbol) {
      return createSecureResponse(
        { error: "Collection symbol is required" },
        400,
        undefined,
        { maxAge: 0 }
      );
    }

    // Fetch from Magic Eden API directly
    const response = await fetch(
      `${MAGICEDEN_API_BASE}/collections/${symbol}/stats`,
      {
        next: { revalidate: 120 }, // Cache for 2 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.status}`);
    }

    const data = await response.json();

    return createSecureResponse(
      {
        stats: data,
        success: true,
      },
      200,
      undefined,
      { maxAge: 120, staleWhileRevalidate: 240 }
    );
  } catch (error) {
    console.error("Magic Eden stats error:", error);
    return createSecureResponse(
      {
        error: error instanceof Error ? error.message : "Failed to fetch stats",
        success: false,
      },
      500,
      undefined,
      { maxAge: 0 }
    );
  }
}
