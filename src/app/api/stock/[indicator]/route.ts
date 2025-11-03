/**
 * Alpha Vantage Macroeconomic Indicators API Route
 * Server-side proxy for Alpha Vantage economic data with caching
 * TTL: 86400 seconds (24 hours) - macro data updates infrequently
 * Supported indicators: inflation, cpi, gdp
 * Note: Prevents API key exposure by handling requests server-side
 */

import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

const RELAYER_URL = config.relayerUrl;

// Valid economic indicators
const VALID_INDICATORS = ["inflation", "cpi", "gdp"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ indicator: string }> }
) {
  try {
    const { indicator } = await params;

    if (!indicator) {
      return NextResponse.json(
        { error: "Indicator parameter is required" },
        { status: 400 }
      );
    }

    // Validate indicator
    if (!VALID_INDICATORS.includes(indicator.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Invalid indicator. Must be one of: ${VALID_INDICATORS.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${RELAYER_URL}/stock/${indicator}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Alpha Vantage API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Normalize response format
    const data = result.data || [];

    return NextResponse.json({
      data,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch macroeconomic data",
      },
      { status: 500 }
    );
  }
}
