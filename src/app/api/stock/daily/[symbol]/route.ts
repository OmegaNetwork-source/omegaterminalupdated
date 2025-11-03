/**
 * Alpha Vantage Daily Time Series API Route
 * Server-side proxy for Alpha Vantage daily historical data with caching
 * TTL: 300 seconds (5 minutes)
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

    const response = await fetch(`${RELAYER_URL}/stock/daily/${symbol}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return createSecureResponse(
        { error: `Alpha Vantage API error: ${response.statusText}` },
        response.status
      );
    }

    const data = await response.json();

    // Normalize response format
    const timeSeries = data["Time Series (Daily)"] || null;

    return createSecureResponse({
      timeSeries,
      success: true,
    });
  } catch (error) {
    return createSecureResponse(
      {
        timeSeries: null,
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch daily data",
      },
      500
    );
  }
}
