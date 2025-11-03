/**
 * PGT Health Check API Route
 * Server-side proxy for PGT connection test
 */

import { NextRequest, NextResponse } from "next/server";

const PGT_API_KEY =
  process.env.PGT_API_KEY || "pgt-partner-omega-terminal-2-25";
const PGT_BASE_URL = "https://www.pgtools.tech/api";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${PGT_BASE_URL}/health`, {
      headers: {
        "X-API-Key": PGT_API_KEY,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `PGT API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "PGT API connection successful",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "PGT API connection failed",
      },
      { status: 500 }
    );
  }
}
