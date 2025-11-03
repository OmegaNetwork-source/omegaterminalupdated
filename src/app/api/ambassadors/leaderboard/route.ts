import { NextRequest } from "next/server";
import config from "@/lib/config";
import {
  createSecureResponse,
  handleApiError,
  withRateLimit,
} from "@/lib/middleware";

const AMBASSADOR_API_BASE = (
  config as unknown as { AMBASSADOR_API_BASE?: string }
).AMBASSADOR_API_BASE;
const REFERRAL_API_BASE = (config as unknown as { REFERRAL_API_BASE?: string })
  .REFERRAL_API_BASE;

export const revalidate = 120;

async function fetchLeaderboard(url: string) {
  const response = await fetch(url, { next: { revalidate: 120 } });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
  return response.json();
}

async function handler(request: NextRequest) {
  try {
    const params = new URLSearchParams();
    const limit = request.nextUrl.searchParams.get("limit") ?? "10";
    const offset = request.nextUrl.searchParams.get("offset") ?? "0";
    const includeStats =
      request.nextUrl.searchParams.get("includeStats") ?? "true";

    params.set("limit", limit);
    params.set("offset", offset);
    params.set("includeStats", includeStats);

    const pathsToTry = [
      AMBASSADOR_API_BASE
        ? `${AMBASSADOR_API_BASE}/leaderboard?${params.toString()}`
        : null,
      REFERRAL_API_BASE
        ? `${REFERRAL_API_BASE}/leaderboard?${params.toString()}`
        : null,
    ].filter((value): value is string => Boolean(value));

    for (const url of pathsToTry) {
      try {
        const data = await fetchLeaderboard(url);
        return createSecureResponse({
          success: true,
          data,
        });
      } catch (error) {
        console.warn("Ambassador leaderboard upstream error:", error);
      }
    }

    return createSecureResponse({
      success: true,
      data: {
        leaderboard: [],
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: 0,
        },
        platformStats: {
          totalAmbassadors: 0,
          totalReferrals: 0,
          totalRewardsDistributed: 0,
        },
        mode: "mock",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withRateLimit(handler, "USER_MANAGEMENT");
