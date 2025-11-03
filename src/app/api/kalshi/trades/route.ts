import { NextRequest } from "next/server";
import {
  createSecureResponse,
  handleApiError,
  createApiError,
  withRateLimit,
} from "@/lib/middleware";
import { createKalshiHeaders, isKalshiConfigured } from "@/lib/utils/kalshi";

export const revalidate = 30;

const KALSHI_BASE_URL = "https://api.elections.kalshi.com/trade-api/v2";

async function handler(request: NextRequest) {
  try {
    if (!isKalshiConfigured()) {
      throw createApiError(
        "Kalshi credentials not configured",
        503,
        "KALSHI_UNAVAILABLE"
      );
    }

    const params = new URLSearchParams();
    const allowed = ["limit", "cursor", "ticker", "min_ts", "max_ts"];

    allowed.forEach((key) => {
      const value = request.nextUrl.searchParams.get(key);
      if (value) {
        params.set(key, value);
      }
    });

    const path = params.toString() ? `/trades?${params.toString()}` : "/trades";

    const response = await fetch(`${KALSHI_BASE_URL}${path}`, {
      method: "GET",
      headers: createKalshiHeaders("GET", path),
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw createApiError(
        "Kalshi trades request failed",
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
