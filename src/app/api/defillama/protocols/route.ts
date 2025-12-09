/**
 * DeFi Llama Protocols API Route
 * Server-side proxy for DeFi Llama top protocols with caching
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

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

    // Filter and sort protocols
    const topProtocols = allProtocols
      .filter((p: any) => p.tvl && p.tvl > 0)
      .sort((a: any, b: any) => b.tvl - a.tvl)
      .slice(0, limit);

    return NextResponse.json({
      protocols: topProtocols,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch protocols from DeFi Llama",
      },
      { status: 500 }
    );
  }
}
