/**
 * Alpha Vantage Company Overview API Route
 * Server-side proxy for Alpha Vantage company overview with caching
 * TTL: 3600 seconds (1 hour) - company data rarely changes
 * Note: Prevents API key exposure by handling requests server-side
 */

import type { NextRequest } from "next/server";
import { createSecureResponse } from "@/lib/middleware";
import { config } from "@/lib/config";

const RELAYER_URL = config.relayerUrl;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;

    if (!symbol) {
      return createSecureResponse(
        { error: "Symbol parameter is required" },
        400
      );
    }

    const response = await fetch(`${RELAYER_URL}/stock/overview/${symbol}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return createSecureResponse(
        { error: `Alpha Vantage API error: ${response.statusText}` },
        response.status
      );
    }

    const overview = await response.json();

    return createSecureResponse({
      overview,
      success: true,
    });
  } catch (error) {
    return createSecureResponse(
      {
        overview: null,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch company overview",
      },
      500
    );
  }
}
