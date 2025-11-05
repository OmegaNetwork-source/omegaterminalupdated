import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

/**
 * Market Detail Endpoint
 * Get detailed information for a specific market
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { venue: string; id: string } }
) {
  try {
    const { venue, id } = params;
    const relayerUrl = config.RELAYER_URL;

    if (venue === "polymarket" || venue === "pm") {
      const response = await fetch(`${relayerUrl}/polymarket/event/${id}`);
      if (!response.ok) {
        return NextResponse.json(
          { error: "Market not found" },
          { status: response.status }
        );
      }
      const market = await response.json();
      return NextResponse.json({ venue: "polymarket", market });
    }

    if (venue === "kalshi") {
      const response = await fetch(`${relayerUrl}/kalshi/market/${id}`);
      if (!response.ok) {
        return NextResponse.json(
          { error: "Market not found" },
          { status: response.status }
        );
      }
      const data = await response.json();
      return NextResponse.json({ venue: "kalshi", market: data.market || data });
    }

    return NextResponse.json(
      { error: `Unsupported venue: ${venue}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Market Detail API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}




