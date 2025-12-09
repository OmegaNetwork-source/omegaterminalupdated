import { NextRequest } from "next/server";
import {
  createSecureResponse,
  handleApiError,
  createApiError,
  withRateLimit,
} from "@/lib/middleware";
import { createKalshiHeaders, isKalshiConfigured } from "@/lib/utils/kalshi";

export const revalidate = 10;

const KALSHI_BASE_URL = "https://api.elections.kalshi.com/trade-api/v2";

interface RouteParams {
  params: Promise<{
    ticker: string;
  }>;
}

async function handler(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isKalshiConfigured()) {
      throw createApiError(
        "Kalshi credentials not configured",
        503,
        "KALSHI_UNAVAILABLE"
      );
    }

    const { ticker } = await params;

    if (!ticker) {
      return createSecureResponse(
        { success: false, error: "Ticker parameter is required" },
        400
      );
    }

    const query = new URLSearchParams();
    const depth = request.nextUrl.searchParams.get("depth");

    if (depth) {
      query.set("depth", depth);
    }

    const path = query.toString()
      ? `/markets/${encodeURIComponent(ticker)}/orderbook?${query.toString()}`
      : `/markets/${encodeURIComponent(ticker)}/orderbook`;

    const response = await fetch(`${KALSHI_BASE_URL}${path}`, {
      method: "GET",
      headers: createKalshiHeaders("GET", path),
      next: { revalidate: 10 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw createApiError(
        "Kalshi orderbook request failed",
        response.status,
        "KALSHI_UPSTREAM_ERROR",
        errorText
      );
    }

    const data = await response.json();

    return createSecureResponse({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withRateLimit(handler, "API_PROXY");
