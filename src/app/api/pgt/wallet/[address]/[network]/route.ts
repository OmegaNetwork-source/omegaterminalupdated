/**
 * PGT Wallet Details API Route
 * Server-side proxy for specific wallet data with caching
 */

import { NextRequest, NextResponse } from "next/server";

const PGT_API_KEY =
  process.env.PGT_API_KEY || "pgt-partner-omega-terminal-2-25";
const PGT_BASE_URL = "https://www.pgtools.tech/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string; network: string }> }
) {
  try {
    const { address, network } = await params;

    const response = await fetch(
      `${PGT_BASE_URL}/wallet/${address}/${network}`,
      {
        headers: {
          "X-API-Key": PGT_API_KEY,
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `PGT API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch wallet from PGT",
      },
      { status: 500 }
    );
  }
}
