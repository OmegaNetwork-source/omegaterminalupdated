import { NextRequest } from "next/server";
import {
  createSecureResponse,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";

export const revalidate = 300;

const JUPITER_SEARCH_ENDPOINT = "https://token.jup.ag/strict";

async function handler(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q");

    if (!query) {
      return createSecureResponse(
        { success: false, error: 'Missing search query parameter "q"' },
        400
      );
    }

    const params = new URLSearchParams({ query });
    const response = await fetch(
      `${JUPITER_SEARCH_ENDPOINT}?${params.toString()}`,
      {
        method: "GET",
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jupiter token search failed: ${errorText}`);
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data.slice(0, 20) : [];

    return createSecureResponse({
      success: true,
      data: results,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withRateLimit(handler, "API_PROXY");
