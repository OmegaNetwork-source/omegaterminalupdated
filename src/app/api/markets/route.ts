import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

/**
 * Unified Markets API Endpoint
 * Routes to Polymarket or Kalshi via existing relayer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const venue = searchParams.get("venue") || "polymarket";
    const tag = searchParams.get("tag");
    const sort = searchParams.get("sort") || "vol";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const query = searchParams.get("q");
    const closed = searchParams.get("closed") === "true";

    const relayerUrl = config.RELAYER_URL;

    if (venue === "polymarket" || venue === "pm") {
      // Polymarket API
      const orderParam = sort === "vol" ? "volume" : "id";
      const url = new URL(`${relayerUrl}/polymarket/events`);
      url.searchParams.set("order", orderParam);
      url.searchParams.set("ascending", "false");
      url.searchParams.set("closed", String(closed));
      url.searchParams.set("limit", String(limit));

      const response = await fetch(url.toString());
      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to fetch Polymarket data" },
          { status: response.status }
        );
      }

      let data = await response.json();
      // Handle different response formats
      const markets = Array.isArray(data) ? data : data.data || data.events || [];

      // Filter by tag if provided
      let filtered = markets;
      if (tag) {
        filtered = markets.filter((m: any) => {
          const tags = m.tags || m.categories || [];
          return tags.some((t: string) =>
            t.toLowerCase().includes(tag.toLowerCase())
          );
        });
      }

      // Filter by query if provided
      if (query) {
        filtered = filtered.filter((m: any) => {
          const question = m.question || m.title || m.subtitle || "";
          return question.toLowerCase().includes(query.toLowerCase());
        });
      }

      return NextResponse.json({
        venue: "polymarket",
        markets: filtered.slice(0, limit),
        total: filtered.length,
      });
    }

    if (venue === "kalshi") {
      // Kalshi API
      const url = new URL(`${relayerUrl}/kalshi/markets`);
      url.searchParams.set("limit", String(limit));

      const response = await fetch(url.toString());
      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to fetch Kalshi data" },
          { status: response.status }
        );
      }

      const data = await response.json();
      let markets = data.markets || data.data || [];

      // Filter by query if provided
      if (query) {
        markets = markets.filter((m: any) => {
          const question = m.question || m.title || m.subtitle || "";
          return question.toLowerCase().includes(query.toLowerCase());
        });
      }

      return NextResponse.json({
        venue: "kalshi",
        markets: markets.slice(0, limit),
        total: markets.length,
      });
    }

    return NextResponse.json(
      { error: `Unsupported venue: ${venue}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Markets API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}









