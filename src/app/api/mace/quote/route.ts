/**
 * MACE API Quote Proxy Route
 * Server-side proxy for MACE exchange rate endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { getExchangeRate } from "@/lib/api/mace";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inToken, outToken, lastNSeconds } = body;

    if (!inToken || !outToken) {
      return NextResponse.json(
        { error: "inToken and outToken are required" },
        { status: 400 }
      );
    }

    const data = await getExchangeRate({
      inToken,
      outToken,
      lastNSeconds: lastNSeconds || 60,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[MACE Quote API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get quote",
      },
      { status: 500 }
    );
  }
}

