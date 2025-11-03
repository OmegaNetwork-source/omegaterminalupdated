import { NextRequest } from "next/server";
import {
  createSecureResponse,
  handleApiError,
  createApiError,
  withRateLimit,
} from "@/lib/middleware";
import { createKalshiHeaders, isKalshiConfigured } from "@/lib/utils/kalshi";

export const revalidate = 120;

const KALSHI_BASE_URL = "https://api.elections.kalshi.com/trade-api/v2";

interface RouteParams {
  params: Promise<{
    eventTicker: string;
  }>;
}

async function handler(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!isKalshiConfigured()) {
      throw createApiError(
        "Kalshi credentials not configured",
        503,
        "KALSHI_UNAVAILABLE"
      );
    }

    const { eventTicker } = await params;

    if (!eventTicker) {
      return createSecureResponse(
        { success: false, error: "eventTicker parameter is required" },
        400
      );
    }

    const path = `/events/${encodeURIComponent(eventTicker)}`;

    const response = await fetch(`${KALSHI_BASE_URL}${path}`, {
      method: "GET",
      headers: createKalshiHeaders("GET", path),
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw createApiError(
        "Kalshi event request failed",
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
