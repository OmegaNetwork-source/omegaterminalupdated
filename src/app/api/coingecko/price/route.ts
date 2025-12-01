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

    if (!ids || ids.trim() === "") {
      return NextResponse.json(
        { error: "ids parameter is required" },
        { status: 400 }
      );
    }

    const url = new URL("https://api.coingecko.com/api/v3/simple/price");
    url.searchParams.set("ids", ids);
    url.searchParams.set("vs_currencies", vsCurrencies);
    if (include24hrChange) {
      url.searchParams.set("include_24hr_change", "true");
    }

    console.log("[CoinGecko Proxy] Fetching prices for:", ids);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Omega Terminal/1.0",
      },
      cache: "no-store",
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[CoinGecko Proxy] API error:", response.status, errorText);
      return NextResponse.json(
        { error: `CoinGecko API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== "object") {
      console.error("[CoinGecko Proxy] Invalid response format:", data);
      return NextResponse.json(
        { error: "Invalid response format from CoinGecko API" },
        { status: 500 }
      );
    }

    console.log("[CoinGecko Proxy] Successfully fetched prices for", Object.keys(data).length, "tokens");
    
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

