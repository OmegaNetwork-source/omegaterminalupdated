/**
 * DeFi Llama Total TVL API Route
 * Server-side proxy for DeFi Llama total TVL with caching
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch("https://api.llama.fi/v2/chains", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `DeFi Llama API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const chains = await response.json();

    // Calculate total TVL
    const totalTVL = chains.reduce(
      (sum: number, chain: any) => sum + (chain.tvl || 0),
      0
    );

    return NextResponse.json({
      tvl: totalTVL,
      chainCount: chains.length,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch TVL from DeFi Llama",
      },
      { status: 500 }
    );
  }
}
