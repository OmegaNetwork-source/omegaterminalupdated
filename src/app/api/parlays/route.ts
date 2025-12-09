import { NextRequest, NextResponse } from "next/server";

/**
 * Parlays API - List and Create Parlays
 * 
 * GET  /api/parlays - List public parlays
 * POST /api/parlays - Create a new parlay
 */

// Mock storage (in production, this would be a database)
let parlays: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const creator = searchParams.get("creator");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Filter parlays
    let filtered = parlays.filter((p) => p.isPublic);

    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    if (creator) {
      filtered = filtered.filter((p) => p.creator === creator);
    }

    // Paginate
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      parlays: paginated,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("[Parlays API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, stake, leverage, legs, isPublic } = body;

    // Validate required fields
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(legs) || legs.length < 2) {
      return NextResponse.json(
        { error: "At least 2 legs are required" },
        { status: 400 }
      );
    }

    if (legs.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 legs allowed" },
        { status: 400 }
      );
    }

    if (typeof stake !== "number" || stake <= 0) {
      return NextResponse.json(
        { error: "Stake must be a positive number" },
        { status: 400 }
      );
    }

    if (![1, 2, 3, 4, 5].includes(leverage)) {
      return NextResponse.json(
        { error: "Leverage must be 1, 2, 3, 4, or 5" },
        { status: 400 }
      );
    }

    // Validate each leg
    for (const leg of legs) {
      if (!leg.marketId || !leg.venue || !leg.side) {
        return NextResponse.json(
          { error: "Each leg must have marketId, venue, and side" },
          { status: 400 }
        );
      }
      if (!["polymarket", "kalshi"].includes(leg.venue)) {
        return NextResponse.json(
          { error: `Invalid venue: ${leg.venue}` },
          { status: 400 }
        );
      }
      if (!["yes", "no"].includes(leg.side)) {
        return NextResponse.json(
          { error: `Invalid side: ${leg.side}` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate markets
    const marketIds = legs.map((l: any) => l.marketId);
    if (new Set(marketIds).size !== marketIds.length) {
      return NextResponse.json(
        { error: "Duplicate markets are not allowed" },
        { status: 400 }
      );
    }

    // Create parlay
    const parlay = {
      id: `parlay-${Date.now()}`,
      name,
      description: description || "",
      stake,
      leverage,
      legs: legs.map((leg: any, i: number) => ({
        id: `leg-${Date.now()}-${i}`,
        ...leg,
        entryOdds: 0.5, // Would fetch from market API
        currentOdds: 0.5,
        status: "pending",
        addedAt: Date.now(),
      })),
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      creator: "anonymous",
      isPublic: isPublic ?? false,
      // Calculated fields would be populated by client or background job
      totalOdds: 1,
      potentialPayout: stake,
      currentValue: stake,
      pnl: 0,
      pnlPercent: 0,
    };

    parlays.push(parlay);

    return NextResponse.json(parlay, { status: 201 });
  } catch (error: any) {
    console.error("[Parlays API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


