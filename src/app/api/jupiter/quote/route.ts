import { NextRequest } from "next/server";
import { z } from "zod";
import { validateRequest } from "@/lib/validation";
import {
  createSecureResponse,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";

export const revalidate = 10;

const JUPITER_API_URL = "https://quote-api.jup.ag/v6";

const JupiterQuoteSchema = z.object({
  inputMint: z.string().min(1),
  outputMint: z.string().min(1),
  amount: z.string().regex(/^\d+$/u, "Amount must be an integer string"),
  slippageBps: z.number().int().min(0).max(10_000).optional().default(50),
});

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequest(JupiterQuoteSchema, body);

    if (!validation.success) {
      return createSecureResponse(
        { success: false, error: validation.error },
        400,
        undefined,
        { maxAge: 0 }
      );
    }

    const { inputMint, outputMint, amount, slippageBps } = validation.data;
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps: String(slippageBps ?? 50),
      swapMode: "ExactIn",
    });

    const url = `${JUPITER_API_URL}/quote?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 10 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jupiter quote request failed: ${errorText}`);
    }

    const data = await response.json();

    return createSecureResponse({ success: true, data }, 200, undefined, {
      maxAge: 10,
      staleWhileRevalidate: 20,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function resolveJupiterIdentifier(
  request: NextRequest
): Promise<string | undefined> {
  try {
    const body = await request.clone().json();
    const userPublicKey =
      typeof body?.userPublicKey === "string" ? body.userPublicKey.trim() : "";

    if (userPublicKey) {
      return userPublicKey;
    }
  } catch (error) {
    console.warn("Failed to resolve Jupiter quote identifier:", error);
  }

  return undefined;
}

export const POST = withRateLimit(
  handler,
  "API_PROXY",
  resolveJupiterIdentifier
);
