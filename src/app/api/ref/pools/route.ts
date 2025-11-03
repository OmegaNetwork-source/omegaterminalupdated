import { NextRequest } from "next/server";
import {
  createSecureResponse,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";

export const revalidate = 120;

const REF_API_URL = "https://indexer.ref.finance";

async function handler(_request: NextRequest) {
  try {
    const response = await fetch(`${REF_API_URL}/list-pools`, {
      method: "GET",
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`REF Finance pools request failed: ${errorText}`);
    }

    const data = await response.json();

    return createSecureResponse({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withRateLimit(handler, "API_PROXY");
