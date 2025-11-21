import { NextRequest, NextResponse } from "next/server";

/**
 * Christmas Game Click API
 * Records clicks for each character to track global scores
 * 
 * POST /api/christmas-game/click
 * Body: { character: "grinch" | "santa", walletAddress?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { character, walletAddress } = body;

    if (!character || (character !== "grinch" && character !== "santa")) {
      return NextResponse.json(
        { error: "Invalid character. Must be 'grinch' or 'santa'" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database/backend storage
    // For now, we'll use a simple in-memory store or external service
    // Example implementation:
    // await db.christmasGameClicks.create({
    //   character,
    //   walletAddress: walletAddress || null,
    //   timestamp: new Date(),
    // });

    // Placeholder: Log the click (replace with actual storage)
    console.log(`[Christmas Game] Click recorded: ${character}`, {
      walletAddress,
      timestamp: new Date().toISOString(),
    });

    // Return success
    return NextResponse.json({
      success: true,
      character,
      message: "Click recorded",
    });
  } catch (error: any) {
    console.error("[Christmas Game Click API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

