/**
 * Magic Eden Activities API Route
 *
 * Proxies Magic Eden API from their API to avoid CORS issues.
 * Provides Next.js caching benefits for better performance.
 *
 * GET /api/magiceden/activities?symbol={collectionSymbol}&limit={limit}
 */

import type { NextRequest } from "next/server";
import { createSecureResponse } from "@/lib/middleware";

const MAGICEDEN_API_BASE = "https://api-mainnet.magiceden.dev/v2";

/**
 * GET handler - fetch collection activities
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const symbol = searchParams.get("symbol");
    const limit = searchParams.get("limit") || "10";

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
      `${MAGICEDEN_API_BASE}/collections/${symbol}/activities?limit=${limit}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.status}`);
    }

    const data = await response.json();

    return createSecureResponse(
      {
        activities: data || [],
        success: true,
      },
      200,
      undefined,
      { maxAge: 60, staleWhileRevalidate: 120 }
    );
  } catch (error) {
    console.error("Magic Eden activities error:", error);
    return createSecureResponse(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch activities",
        success: false,
      },
      500,
      undefined,
      { maxAge: 0 }
    );
  }
}
