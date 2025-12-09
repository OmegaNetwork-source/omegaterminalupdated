/**
 * DeFi Llama Trending Protocols API Route
 * Server-side proxy for trending protocols with caching
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch("https://api.llama.fi/protocols", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `DeFi Llama API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const allProtocols = await response.json();

    // Filter and sort by 24h change
    const trending = allProtocols
      .filter((p: any) => p.change_1d && p.change_1d > 0)
      .sort((a: any, b: any) => (b.change_1d || 0) - (a.change_1d || 0))
      .slice(0, 10);

    return NextResponse.json({
      protocols: trending,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch trending protocols from DeFi Llama",
      },
      { status: 500 }
    );
  }
}
