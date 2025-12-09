import { NextRequest } from "next/server";
import {
  createSecureResponse,
  handleApiError,
  createApiError,
  withRateLimit,
} from "@/lib/middleware";
import { createKalshiHeaders, isKalshiConfigured } from "@/lib/utils/kalshi";

export const revalidate = 3600;

const KALSHI_BASE_URL = "https://api.elections.kalshi.com/trade-api/v2";

interface RouteParams {
  params: Promise<{
    seriesTicker: string;
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

    const { seriesTicker } = await params;

    if (!seriesTicker) {
      return createSecureResponse(
        { success: false, error: "seriesTicker parameter is required" },
        400
      );
    }

    const path = `/series/${encodeURIComponent(seriesTicker)}`;

    const response = await fetch(`${KALSHI_BASE_URL}${path}`, {
      method: "GET",
      headers: createKalshiHeaders("GET", path),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw createApiError(
        "Kalshi series request failed",
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
