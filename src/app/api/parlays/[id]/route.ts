import { NextRequest, NextResponse } from "next/server";

/**
 * Single Parlay API
 * 
 * GET    /api/parlays/:id - Get parlay details
 * PATCH  /api/parlays/:id - Update parlay
 * DELETE /api/parlays/:id - Delete parlay
 */

// Mock storage reference (would be shared with main route in production)
let parlays: any[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const parlay = parlays.find((p) => p.id === id);
    
    if (!parlay) {
      return NextResponse.json(
        { error: "Parlay not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(parlay);
  } catch (error: any) {
    console.error("[Parlay API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const index = parlays.findIndex((p) => p.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: "Parlay not found" },
        { status: 404 }
      );
    }

    const parlay = parlays[index];

    // Only allow updates to certain fields
    const allowedUpdates = ["name", "description", "isPublic"];
    const updates: any = {};

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    // Can only update stake/leverage if parlay is still draft
    if (parlay.status === "draft") {
      if (body.stake !== undefined && typeof body.stake === "number" && body.stake > 0) {
        updates.stake = body.stake;
      }
      if (body.leverage !== undefined && [1, 2, 3, 4, 5].includes(body.leverage)) {
        updates.leverage = body.leverage;
      }
    }

    const updated = {
      ...parlay,
      ...updates,
      updatedAt: Date.now(),
    };

    parlays[index] = updated;

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[Parlay API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const index = parlays.findIndex((p) => p.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: "Parlay not found" },
        { status: 404 }
      );
    }

    parlays.splice(index, 1);

    return NextResponse.json({ success: true, message: "Parlay deleted" });
  } catch (error: any) {
    console.error("[Parlay API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

