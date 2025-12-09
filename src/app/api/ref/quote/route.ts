import { NextRequest } from "next/server";
import { z } from "zod";
import { validateRequest } from "@/lib/validation";
import {
  createSecureResponse,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";

export const revalidate = 10;

const REF_API_URL = "https://indexer.ref.finance";

const REFQuoteSchema = z.object({
  token_in: z.string().min(1),
  token_out: z.string().min(1),
  amount_in: z.string().min(1),
});

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequest(REFQuoteSchema, body);

    if (!validation.success) {
      return createSecureResponse(
        { success: false, error: validation.error },
        400
      );
    }

    const response = await fetch(`${REF_API_URL}/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validation.data),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`REF Finance quote request failed: ${errorText}`);
    }

    const data = await response.json();

    return createSecureResponse({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

async function resolveRefQuoteIdentifier(
  request: NextRequest
): Promise<string | undefined> {
  try {
    const body = await request.clone().json();
    const tokenIn =
      typeof body?.token_in === "string" ? body.token_in.trim() : "";
    const tokenOut =
      typeof body?.token_out === "string" ? body.token_out.trim() : "";

    if (tokenIn && tokenOut) {
      return `${tokenIn}:${tokenOut}`;
    }
  } catch (error) {
    console.warn("Failed to resolve REF quote identifier:", error);
  }

  return undefined;
}

export const POST = withRateLimit(
  handler,
  "API_PROXY",
  resolveRefQuoteIdentifier
);
