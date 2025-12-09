/**
 * Single Market Details API
 */

import { NextRequest, NextResponse } from "next/server";
import { getMarketDetails } from "@/lib/parlay/market-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const market = await getMarketDetails(id);

    if (!market) {
      return NextResponse.json(
        { success: false, error: "Market not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      market,
    });
  } catch (error) {
    console.error("[Market Details API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch market details",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


