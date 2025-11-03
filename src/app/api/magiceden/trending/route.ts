/**
 * Magic Eden Trending API Route
 *
 * Proxies Magic Eden trending collections through relayer.
 * Provides Next.js caching for better performance.
 *
 * GET /api/magiceden/trending?timeRange={1h|1d|7d|30d}
 */

import type { NextRequest } from "next/server";
import { createSecureResponse } from "@/lib/middleware";
import { RELAYER_URL } from "@/lib/config";

/**
 * GET handler - fetch trending collections
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const timeRange = searchParams.get("timeRange") || "1d";

    // Validate timeRange
    const validTimeRanges = ["1h", "1d", "7d", "30d"];
    if (!validTimeRanges.includes(timeRange)) {
      return createSecureResponse(
        { error: "Invalid timeRange. Must be one of: 1h, 1d, 7d, 30d" },
        400,
        undefined,
        { maxAge: 0 }
      );
    }

    // Fetch from relayer
    const response = await fetch(
      `${RELAYER_URL}/magiceden/trending?timeRange=${timeRange}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`Relayer API error: ${response.status}`);
    }

    const data = await response.json();

    return createSecureResponse(
      {
        collections: data || [],
        success: true,
      },
      200,
      undefined,
      { maxAge: 300, staleWhileRevalidate: 600 }
    );
  } catch (error) {
    console.error("Magic Eden trending error:", error);
    return createSecureResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch trending collections",
        success: false,
      },
      500,
      undefined,
      { maxAge: 0 }
    );
  }
}
