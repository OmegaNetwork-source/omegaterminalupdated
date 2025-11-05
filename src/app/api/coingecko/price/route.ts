import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;

/**
 * Proxy route for CoinGecko price API to avoid CORS issues
 * GET /api/coingecko/price?ids=ethereum,solana&vs_currencies=usd
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get("ids") || "ethereum";
    const vsCurrencies = searchParams.get("vs_currencies") || "usd";
    const include24hrChange = searchParams.get("include_24hr_change") === "true";

    const url = new URL("https://api.coingecko.com/api/v3/simple/price");
    url.searchParams.set("ids", ids);
    url.searchParams.set("vs_currencies", vsCurrencies);
    if (include24hrChange) {
      url.searchParams.set("include_24hr_change", "true");
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `CoinGecko API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[CoinGecko Proxy] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch price data" },
      { status: 500 }
    );
  }
}

