import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

/**
 * Christmas Game Global Scores API
 * Returns the total number of clicks for each character from all users
 * 
 * GET /api/christmas-game/global-scores
 * Returns: { santa: number, grinch: number }
 */
export async function GET(request: NextRequest) {
  try {
    // Get environment variables
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    // Check if Redis is configured
    const redisConfigured = Boolean(redisUrl && redisToken);

    let scores = {
      santa: 0,
      grinch: 0,
    };

    if (redisConfigured) {
      try {
        // Initialize Redis client
        const redis = new Redis({
          url: redisUrl as string,
          token: redisToken as string,
        });

        // Get click counts for both characters
        const [santaCount, grinchCount] = await Promise.all([
          redis.get("christmas-game:santa:clicks"),
          redis.get("christmas-game:grinch:clicks"),
        ]);

        scores = {
          santa: Number(santaCount || 0),
          grinch: Number(grinchCount || 0),
        };
      } catch (redisError: any) {
        console.error("[Christmas Game] Redis connection error:", redisError.message);
        // Return zeros if Redis connection fails
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

    return NextResponse.json(scores, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[Christmas Game Global Scores API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

