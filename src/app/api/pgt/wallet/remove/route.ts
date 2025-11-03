/**
 * PGT Wallet Remove API Route
 * Server-side proxy for PGT wallet removal
 */

import { NextRequest, NextResponse } from "next/server";

const PGT_API_KEY =
  process.env.PGT_API_KEY || "pgt-partner-omega-terminal-2-25";
const PGT_BASE_URL = "https://www.pgtools.tech/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, network } = body;

    if (!address || !network) {
      return NextResponse.json(
        { error: "Address and network are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${PGT_BASE_URL}/wallet/remove`, {
      method: "POST",
      headers: {
        "X-API-Key": PGT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        network,
      }),
    });

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
            : "Failed to remove wallet from PGT",
      },
      { status: 500 }
    );
  }
}
