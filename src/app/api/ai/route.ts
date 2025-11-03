import { NextRequest } from "next/server";
import { z } from "zod";
import { validateRequest } from "@/lib/validation";
import {
  createSecureResponse,
  createApiError,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";

export const revalidate = 0;

const AIRequestSchema = z.object({
  prompt: z.string().min(1).max(5000),
  userId: z.string().optional(),
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`
  : null;

/**
 * Proxies requests to the Gemini API, allowing terminal commands to generate
 * responses using Google's generative models without exposing the API key to
 * the client.
 */
async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequest(AIRequestSchema, body);

    if (!validation.success) {
      return createSecureResponse(
        { success: false, error: validation.error },
        400,
        undefined,
        { maxAge: 0 }
      );
    }

    if (!GEMINI_URL) {
      throw createApiError(
        "Gemini API key is not configured",
        500,
        "GEMINI_CONFIG_MISSING"
      );
    }

    const payload = {
      contents: [
        {
          parts: [
            {
              text: validation.data.prompt,
            },
          ],
        },
      ],
    };

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw createApiError(
        "Gemini API request failed",
        response.status,
        "GEMINI_UPSTREAM_ERROR",
        errorText
      );
    }

    const data = await response.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No response generated.";

    return createSecureResponse(
      {
        success: true,
        data: {
          answer,
          type: "response",
        },
      },
      200,
      undefined,
      { maxAge: 0 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

async function resolveAiIdentifier(
  request: NextRequest
): Promise<string | undefined> {
  try {
    const body = await request.clone().json();
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";

    if (userId) {
      return userId;
    }
  } catch (error) {
    console.warn("Failed to resolve AI identifier:", error);
  }

  return undefined;
}

export const POST = withRateLimit(handler, "API_PROXY", resolveAiIdentifier);
