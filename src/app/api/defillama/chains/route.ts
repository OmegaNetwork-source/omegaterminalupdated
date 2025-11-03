/**
 * DeFi Llama Chains API Route
 * Server-side proxy for DeFi Llama chain TVLs with caching
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "15");

    const response = await fetch("https://api.llama.fi/v2/chains", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `DeFi Llama API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const allChains = await response.json();

    // Filter and sort chains
    const topChains = allChains
      .filter((c: any) => c.tvl && c.tvl > 0)
      .sort((a: any, b: any) => b.tvl - a.tvl)
      .slice(0, limit);

    return NextResponse.json({
      chains: topChains,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch chains from DeFi Llama",
      },
      { status: 500 }
    );
  }
}
