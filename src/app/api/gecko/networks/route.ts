/**
 * GeckoTerminal Networks API Route
 * Server-side proxy for GeckoTerminal networks list with caching
 * TTL: 3600 seconds (1 hour) - networks rarely change
 */

import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

const RELAYER_URL = config.relayerUrl;

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${RELAYER_URL}/gecko/networks`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `GeckoTerminal API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Normalize response format
    const networks = data.data || data.networks || [];

    return NextResponse.json({
      networks,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        networks: [],
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch networks",
      },
      { status: 500 }
    );
  }
}
