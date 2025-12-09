import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import {
  LETTER_GLITCH_WORDS,
  normalizeLetterGlitchWord,
} from "@/lib/letterGlitchWords";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisConfigured = Boolean(redisUrl && redisToken);
const redisClient = redisConfigured
  ? new Redis({
      url: redisUrl as string,
      token: redisToken as string,
    })
  : null;

const allowedWords = new Set(
  LETTER_GLITCH_WORDS.map((word) => normalizeLetterGlitchWord(word))
);

const getWalletKey = (walletAddress: string) =>
  `letter-glitch:found:${walletAddress.toLowerCase()}`;

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress query parameter is required", foundWords: [] },
        { status: 400 }
      );
    }

    if (!redisClient) {
      console.warn(
        "[Letter Glitch Words API] Redis not configured. Returning empty list."
      );
      return NextResponse.json({ foundWords: [] });
    }

    const foundWords = (await redisClient.smembers(
      getWalletKey(walletAddress)
    )) as string[];

    return NextResponse.json({ foundWords: foundWords ?? [] });
  } catch (error: any) {
    console.error("[Letter Glitch Words API] GET error:", error);
    return NextResponse.json(
      { error: error.message ?? "Internal server error", foundWords: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const walletAddress = (body.walletAddress as string | undefined)?.trim();
    const word = (body.word as string | undefined)?.trim();

    if (!walletAddress || !word) {
      return NextResponse.json(
        { error: "walletAddress and word are required" },
        { status: 400 }
      );
    }

    const normalizedWord = normalizeLetterGlitchWord(word);
    if (!allowedWords.has(normalizedWord)) {
      return NextResponse.json(
        { error: "Invalid hidden word" },
        { status: 400 }
      );
    }

    if (!redisClient) {
      console.warn(
        "[Letter Glitch Words API] Redis not configured. Cannot persist data."
      );
      return NextResponse.json({
        success: false,
        message: "Redis not configured",
      });
    }

    await redisClient.sadd(getWalletKey(walletAddress), normalizedWord);

    return NextResponse.json({
      success: true,
      word: normalizedWord,
    });
  } catch (error: any) {
    console.error("[Letter Glitch Words API] POST error:", error);
    return NextResponse.json(
      { error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

