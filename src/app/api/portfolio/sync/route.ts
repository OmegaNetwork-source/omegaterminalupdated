import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

/**
 * Portfolio Sync API
 * Syncs portfolio positions from Polymarket/Kalshi
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { venue, address } = body;

    if (!venue || !address) {
      return NextResponse.json(
        { error: "venue and address are required" },
        { status: 400 }
      );
    }

    const relayerUrl = config.RELAYER_URL;
    let positions: any[] = [];

    if (venue === "polymarket" || venue === "pm") {
      // Polymarket positions - would need specific endpoint
      // For now, return placeholder
      return NextResponse.json({
        venue: "polymarket",
        address,
        positions: [],
        message: "Polymarket portfolio sync coming soon",
      });
    }

    if (venue === "kalshi") {
      // Kalshi positions - requires authentication
      try {
        const response = await fetch(`${relayerUrl}/kalshi/portfolio`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        });

        if (response.ok) {
          const data = await response.json();
          positions = data.positions || data.data || [];
        } else {
          // If not authenticated, return empty positions
          return NextResponse.json({
            venue: "kalshi",
            address,
            positions: [],
            message: "Kalshi authentication required for portfolio sync",
          });
        }
      } catch (error) {
        // If endpoint doesn't exist or fails, return empty
        return NextResponse.json({
          venue: "kalshi",
          address,
          positions: [],
          message: "Kalshi portfolio endpoint not available",
        });
      }
    }

    return NextResponse.json({
      venue,
      address,
      positions,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Portfolio Sync API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}












