import { NextRequest } from "next/server";
import config from "@/lib/config";
import { CreateReferralSchema, validateRequest } from "@/lib/validation";
import {
  createSecureResponse,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";

const REFERRAL_API_BASE = (config as unknown as { REFERRAL_API_BASE?: string })
  .REFERRAL_API_BASE;

export const revalidate = 0;

function generateMockReferralCode(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `OMEGA${suffix}`;
}

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequest(CreateReferralSchema, body);

    if (!validation.success) {
      return createSecureResponse(
        { success: false, error: validation.error },
        400
      );
    }

    const payload = validation.data;

    if (REFERRAL_API_BASE) {
      try {
        const response = await fetch(`${REFERRAL_API_BASE}/referrals/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          return createSecureResponse({ success: true, data });
        }

        const errorText = await response.text();
        console.warn(
          "Referral API create failed, falling back to mock data:",
          errorText
        );
      } catch (apiError) {
        console.warn("Referral API create error, using mock data:", apiError);
      }
    }

    const mockCode = generateMockReferralCode();
    const mockUrl = `https://omega.network/referral/${mockCode}`;

    return createSecureResponse({
      success: true,
      data: {
        mode: "mock",
        referralCode: mockCode,
        referralUrl: mockUrl,
        socialShare: {
          twitter: `Join me on Omega Terminal and earn rewards! Use my code ${mockCode}`,
          discord: `Omega Terminal referral code: ${mockCode} — claim your rewards now!`,
        },
        message:
          "Referral service unreachable, provided mock data for demonstration.",
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
      return body.walletAddress;
    } catch (error) {
      console.warn("Referral create identifier resolver failed:", error);
      return undefined;
    }
  }
);
