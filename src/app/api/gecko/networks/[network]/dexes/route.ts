/**
 * GeckoTerminal Network DEXes API Route
 * Server-side proxy for GeckoTerminal network-specific DEX list with caching
 * TTL: 3600 seconds (1 hour)
 */

import type { NextRequest } from "next/server";
import { createSecureResponse } from "@/lib/middleware";
import { config } from "@/lib/config";

const RELAYER_URL = config.relayerUrl;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ network: string }> }
) {
  try {
    const { network } = await params;

    if (!network) {
      return createSecureResponse(
        { error: "Network parameter is required" },
        400
      );
    }

    const response = await fetch(
      `${RELAYER_URL}/gecko/networks/${network}/dexes`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      return createSecureResponse(
        { error: `GeckoTerminal API error: ${response.statusText}` },
        response.status
      );
    }

    const data = await response.json();

    // Normalize response format
    const dexes = data.data || data.dexes || [];

    return createSecureResponse({
      dexes,
      success: true,
    });
  } catch (error) {
    return createSecureResponse(
      {
        dexes: [],
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch DEXes",
      },
      500
    );
  }
}
