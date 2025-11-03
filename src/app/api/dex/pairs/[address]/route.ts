/**
 * DexScreener Pair Analytics API Route
 * Server-side proxy for DexScreener token pair analytics with caching
 * TTL: 60 seconds (1 minute)
 */

import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

const RELAYER_URL = config.relayerUrl;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${RELAYER_URL}/dex/pairs/${address}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `DexScreener API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Normalize response format
    const pair = data.pair || data;

    return NextResponse.json({
      pair,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        pair: null,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch token analytics",
      },
      { status: 500 }
    );
  }
}
