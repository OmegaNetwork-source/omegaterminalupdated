/**
 * DexScreener Trending API Route
 * Server-side proxy for DexScreener trending tokens with caching
 * TTL: 120 seconds (2 minutes)
 */

import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

const RELAYER_URL = config.relayerUrl;

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${RELAYER_URL}/dex/trending`, {
      next: { revalidate: 120 }, // Cache for 2 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `DexScreener API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Normalize response format
    const pairs = Array.isArray(data) ? data : data.pairs || [];

    return NextResponse.json({
      pairs,
      success: true,
    });
  } catch (error) {
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
