/**
 * DeFi Llama Protocol TVL API Route
 * Server-side proxy for specific protocol TVL with caching
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const response = await fetch(`https://api.llama.fi/protocol/${slug}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `DeFi Llama API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const protocol = await response.json();

    return NextResponse.json({
      protocol,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch protocol from DeFi Llama",
      },
      { status: 500 }
    );
  }
}
