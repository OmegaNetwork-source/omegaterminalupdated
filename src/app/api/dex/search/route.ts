/**
 * DexScreener Search API Route
 * Server-side proxy for DexScreener search with caching
 * TTL: 60 seconds (1 minute)
 */

import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

const RELAYER_URL = config.relayerUrl;

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

    const response = await fetch(
      `${RELAYER_URL}/dex/search?q=${encodeURIComponent(query)}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

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
            : "Failed to search DexScreener",
      },
      { status: 500 }
    );
  }
}
