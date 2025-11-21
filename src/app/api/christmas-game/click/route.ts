import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

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

    // Get environment variables
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    // Check if Redis is configured
    const redisConfigured = Boolean(redisUrl && redisToken);

    if (redisConfigured) {
      try {
        // Initialize Redis client
        const redis = new Redis({
          url: redisUrl as string,
          token: redisToken as string,
        });

        // Increment global counter for the character
        await redis.incr(`christmas-game:${character}:clicks`);

        // Store individual click record (optional, for analytics)
        const clickRecord = {
          character,
          walletAddress: walletAddress || null,
          timestamp: new Date().toISOString(),
        };
        await redis.lpush(
          `christmas-game:${character}:clicks:list`,
          JSON.stringify(clickRecord)
        );

        // Keep only last 1000 records to prevent memory issues
        await redis.ltrim(`christmas-game:${character}:clicks:list`, 0, 999);
      } catch (redisError: any) {
        console.error("[Christmas Game] Redis connection error:", redisError.message);
        // Continue even if Redis fails - don't block the user
      }
    } else {
      // Debug: Log what's missing
      if (!redisUrl) {
        console.warn("[Christmas Game] UPSTASH_REDIS_REST_URL not found in environment variables");
      }
      if (!redisToken) {
        console.warn("[Christmas Game] UPSTASH_REDIS_REST_TOKEN not found in environment variables");
      }
    }

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

