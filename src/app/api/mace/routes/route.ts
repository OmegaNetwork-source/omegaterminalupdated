/**
 * MACE API Routes Proxy Route
 * Server-side proxy for MACE best routes endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { getBestRoutes } from "@/lib/api/mace";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { in: inTokens, out: outTokens, from, maxRoutes, gasPrice, solver } = body;

    if (!inTokens || !outTokens) {
      return NextResponse.json(
        { error: "in and out tokens are required" },
        { status: 400 }
      );
    }

    const data = await getBestRoutes({
      in: inTokens,
      out: outTokens,
      from,
      maxRoutes,
      gasPrice,
      solver,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[MACE Routes API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get routes",
      },
      { status: 500 }
    );
  }
}

