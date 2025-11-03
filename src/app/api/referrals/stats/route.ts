import { NextRequest } from "next/server";
import { z } from "zod";
import config from "@/lib/config";
import { validateRequest, ethereumAddressSchema } from "@/lib/validation";
import {
  createSecureResponse,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";

const REFERRAL_API_BASE = (config as unknown as { REFERRAL_API_BASE?: string })
  .REFERRAL_API_BASE;

export const revalidate = 60;

const StatsQuerySchema = z.object({
  walletAddress: ethereumAddressSchema,
});

async function handler(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get("walletAddress");
    const validation = validateRequest(StatsQuerySchema, { walletAddress });

    if (!validation.success) {
      return createSecureResponse(
        { success: false, error: validation.error },
        400
      );
    }

    if (REFERRAL_API_BASE) {
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch(
            `${REFERRAL_API_BASE}/user/profile?walletAddress=${encodeURIComponent(
              validation.data.walletAddress
            )}`,
            { next: { revalidate: 60 } }
          ),
          fetch(
            `${REFERRAL_API_BASE}/referrals/stats?walletAddress=${encodeURIComponent(
              validation.data.walletAddress
            )}`,
            { next: { revalidate: 60 } }
          ),
        ]);

        if (profileRes.ok && statsRes.ok) {
          const [profile, stats] = await Promise.all([
            profileRes.json(),
            statsRes.json(),
          ]);

          return createSecureResponse({
            success: true,
            data: {
              userInfo: profile,
              stats,
            },
          });
        }

        console.warn(
          "Referral stats upstream failure, falling back to mock data"
        );
      } catch (apiError) {
        console.warn(
          "Referral stats upstream error, falling back to mock data:",
          apiError
        );
      }
    }

    return createSecureResponse({
      success: true,
      data: {
        userInfo: {
          walletAddress: validation.success
            ? validation.data.walletAddress
            : walletAddress,
          tier: "Explorer",
        },
        stats: {
          totalReferrals: 0,
          totalEarned: 0,
          pendingRewards: 0,
          confirmedRewards: 0,
        },
        recentReferrals: [],
        socialShare: {
          twitter: "Join Omega Terminal and earn rewards by inviting friends!",
          discord:
            "Omega Terminal referral program is live — invite your frens!",
        },
        mode: "mock",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withRateLimit(
  handler,
  "USER_MANAGEMENT",
  (request) => request.nextUrl.searchParams.get("walletAddress") ?? undefined
);
