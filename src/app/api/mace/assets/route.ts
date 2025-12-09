/**
 * MACE API Assets Proxy Route
 * Server-side proxy for MACE supported assets endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupportedAssets } from "@/lib/api/mace";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const pageSize = searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!) : undefined;
    const verification = searchParams.get("verification") as "any" | "verified" | "unverified" | undefined;
    const sortBy = searchParams.get("sortBy") as "volume24H" | "trades24H" | undefined;

    const data = await getSupportedAssets({
      page,
      pageSize,
      verification,
      sortBy,
    });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[MACE Assets API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch assets",
      },
      { status: 500 }
    );
  }
}

