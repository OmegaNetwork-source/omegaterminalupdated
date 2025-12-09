import { NextRequest } from "next/server";
import {
  createSecureResponse,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";

export const revalidate = 300;

const REF_API_URL = "https://indexer.ref.finance";

async function handler(_request: NextRequest) {
  try {
    const response = await fetch(`${REF_API_URL}/list-token`, {
      method: "GET",
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`REF Finance tokens request failed: ${errorText}`);
    }

    const data = await response.json();
    const tokens = Array.isArray(data)
      ? data.map((token) => ({
          id: token?.id ?? token?.token_id ?? "",
          symbol: token?.symbol ?? "",
          name: token?.name ?? token?.symbol ?? "Unknown",
          decimals: Number(token?.decimals ?? 0),
          icon: token?.icon ?? null,
        }))
      : [];

    return createSecureResponse({ success: true, data: tokens });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withRateLimit(handler, "API_PROXY");
