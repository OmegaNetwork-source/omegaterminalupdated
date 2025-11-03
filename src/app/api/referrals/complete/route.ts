import { NextRequest } from "next/server";
import config from "@/lib/config";
import { CompleteReferralSchema, validateRequest } from "@/lib/validation";
import {
  createSecureResponse,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";

const REFERRAL_API_BASE = (config as unknown as { REFERRAL_API_BASE?: string })
  .REFERRAL_API_BASE;

export const revalidate = 0;

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequest(CompleteReferralSchema, body);

    if (!validation.success) {
      return createSecureResponse(
        { success: false, error: validation.error },
        400
      );
    }

    if (REFERRAL_API_BASE) {
      try {
        const response = await fetch(
          `${REFERRAL_API_BASE}/referrals/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(validation.data),
          }
        );

        if (response.ok) {
          const data = await response.json();
          return createSecureResponse({ success: true, data });
        }

        const errorText = await response.text();
        console.warn(
          "Referral complete upstream failed, returning mock:",
          errorText
        );
      } catch (apiError) {
        console.warn(
          "Referral complete upstream error, returning mock:",
          apiError
        );
      }
    }

    return createSecureResponse({
      success: true,
      data: {
        message: "Referral completion processed in demonstration mode.",
        rewards: {
          amount: "0",
          token: "OMEGA",
        },
        mode: "mock",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withRateLimit(
  handler,
  "USER_MANAGEMENT",
  async (request) => {
    try {
      const body = await request.clone().json();
      return body.referredAddress ?? body.referralCode;
    } catch (error) {
      console.warn("Referral complete identifier resolver failed:", error);
      return undefined;
    }
  }
);
