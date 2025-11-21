import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

/**
 * Christmas Game Reset API
 * Resets all scores and click records for both Santa and Grinch
 * 
 * POST /api/christmas-game/reset
 * Body: { confirm?: boolean }
 * 
 * Returns: { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Optional confirmation flag for safety
    const body = await request.json().catch(() => ({}));
    const { confirm } = body;

    // Initialize Redis client
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      return NextResponse.json(
        { 
          error: "Redis not configured. UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set." 
        },
        { status: 500 }
      );
    }

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    // Delete all Christmas game keys
    const keysToDelete = [
      "christmas-game:santa:clicks",
      "christmas-game:grinch:clicks",
      "christmas-game:santa:clicks:list",
      "christmas-game:grinch:clicks:list",
    ];

    // Delete all keys in parallel
    const deleteResults = await Promise.all(
      keysToDelete.map((key) => redis.del(key))
    );

    // Count how many keys were actually deleted
    const deletedCount = deleteResults.filter((result) => result === 1).length;

    return NextResponse.json(
      {
        success: true,
        message: `Successfully reset Christmas game scores. Deleted ${deletedCount} key(s).`,
        deletedKeys: keysToDelete,
        deletedCount,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[Christmas Game Reset API] Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for reset - same functionality but can be called via GET
 * Note: In production, you might want to add authentication/authorization
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize Redis client
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      return NextResponse.json(
        { 
          error: "Redis not configured. UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set." 
        },
        { status: 500 }
      );
    }

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    // Delete all Christmas game keys
    const keysToDelete = [
      "christmas-game:santa:clicks",
      "christmas-game:grinch:clicks",
      "christmas-game:santa:clicks:list",
      "christmas-game:grinch:clicks:list",
    ];

    // Delete all keys in parallel
    const deleteResults = await Promise.all(
      keysToDelete.map((key) => redis.del(key))
    );

    // Count how many keys were actually deleted
    const deletedCount = deleteResults.filter((result) => result === 1).length;

    return NextResponse.json(
      {
        success: true,
        message: `Successfully reset Christmas game scores. Deleted ${deletedCount} key(s).`,
        deletedKeys: keysToDelete,
        deletedCount,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[Christmas Game Reset API] Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}
