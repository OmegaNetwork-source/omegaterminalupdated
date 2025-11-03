import { NextRequest } from "next/server";
import { z } from "zod";
import { validateRequest } from "@/lib/validation";
import {
  createSecureResponse,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";

export const revalidate = 0;

const JUPITER_API_URL = "https://quote-api.jup.ag/v6";

const JupiterSwapSchema = z.object({
  inputMint: z.string().min(1),
  outputMint: z.string().min(1),
  amount: z.string().regex(/^\d+$/u, "Amount must be an integer string"),
  userPublicKey: z.string().min(1),
  slippageBps: z.number().int().min(0).max(10_000).optional(),
});

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequest(JupiterSwapSchema, body);

    if (!validation.success) {
      return createSecureResponse(
        { success: false, error: validation.error },
        400
      );
    }

    const { inputMint, outputMint, amount, userPublicKey, slippageBps } =
      validation.data;

    const quoteParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps: String(slippageBps ?? 50),
      swapMode: "ExactIn",
    });

    const quoteResponse = await fetch(
      `${JUPITER_API_URL}/quote?${quoteParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text();
      throw new Error(`Failed to fetch Jupiter quote: ${errorText}`);
    }

    const quote = await quoteResponse.json();

    const swapResponse = await fetch(`${JUPITER_API_URL}/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicSlippage: { slippageBps: slippageBps ?? 50 },
      }),
      cache: "no-store",
    });

    if (!swapResponse.ok) {
      const errorText = await swapResponse.text();
      throw new Error(`Failed to build Jupiter swap: ${errorText}`);
    }

    const swapData = await swapResponse.json();

    return createSecureResponse({
      success: true,
      data: {
        swapTransaction: swapData.swapTransaction,
      },
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
    console.warn("Failed to resolve Jupiter swap identifier:", error);
  }

  return undefined;
}

export const POST = withRateLimit(
  handler,
  "API_PROXY",
  resolveJupiterIdentifier
);
