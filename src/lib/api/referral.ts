import config from "@/lib/config";
import type {
  ReferralApiResponse,
  ReferralUser,
  ReferralStats,
  LeaderboardEntry,
  SocialShareContent,
} from "@/types/referral";

/**
 * Generate a random 8-character alphanumeric referral code.
 */
export function generateMockReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * Create mock referral create result for demonstration when API is unavailable.
 */
export function getMockReferralResult(
  walletAddress: string,
  twitterHandle?: string,
  discordId?: string
): ReferralApiResponse {
  const code = generateMockReferralCode();
  const url = `https://omeganetwork.co/ambassador/${code}`;
  const socialShare: SocialShareContent = {
    twitter: `Join me on Omega Network! Use my code ${code} and earn OMEGA. ${url}`,
    discord: `Omega Network referral: ${url} (code: ${code}) — earn OMEGA with me!`,
  };
  return {
    success: true,
    referralCode: code,
    referralUrl: url,
    userInfo: {
      walletAddress,
      referralCode: code,
      referralUrl: url,
      twitterHandle: twitterHandle || null,
      discordId: discordId || null,
      totalReferrals: Math.floor(Math.random() * 5),
      totalEarned: Math.floor(Math.random() * 50),
      rank: null,
    },
    socialShare,
    message: "Mock referral created (Omega Network API unavailable)",
  };
}

/**
 * Create mock stats response when APIs fail.
 */
export function getMockStatsResult(walletAddress: string): ReferralApiResponse {
  const code = generateMockReferralCode();
  const url = `https://omeganetwork.co/ambassador/${code}`;
  const stats: ReferralStats = {
    totalReferrals: Math.floor(Math.random() * 20),
    totalEarned: Math.floor(Math.random() * 200),
    pendingRewards: Math.floor(Math.random() * 20),
    confirmedRewards: Math.floor(Math.random() * 180),
  };
  const user: ReferralUser = {
    walletAddress,
    referralCode: code,
    referralUrl: url,
    twitterHandle: null,
    discordId: null,
    totalReferrals: stats.totalReferrals,
    totalEarned: stats.totalEarned,
    rank: null,
  };
  return {
    success: true,
    userInfo: user,
    stats,
    socialShare: {
      twitter: `Join me on Omega Network! Use my code ${code} and earn OMEGA. ${url}`,
      discord: `Omega Network referral: ${url} (code: ${code}) — earn OMEGA with me!`,
    },
    message: "Mock stats (Omega Network API unavailable)",
  };
}

/**
 * Create mock leaderboard data when both APIs fail.
 */
export function getMockLeaderboardResult(limit: number): ReferralApiResponse {
  const leaderboard: LeaderboardEntry[] = Array.from({ length: limit }).map(
    (_, i) => ({
      rank: i + 1,
      wallet: `0xMOCK${(i + 1).toString().padStart(3, "0")}`,
      twitterHandle: i % 2 === 0 ? `@omega_user_${i + 1}` : "Anonymous",
      referrals: 50 - i * 2,
      earned: (50 - i * 2) * 10,
    })
  );
  return {
    success: true,
    leaderboard,
    platformStats: {
      totalUsers: 1000 + Math.floor(Math.random() * 500),
      totalReferrals: 5000 + Math.floor(Math.random() * 500),
      totalRewardsDistributed: 25000 + Math.floor(Math.random() * 5000),
    },
    message: "Mock leaderboard (Omega Ambassador API unavailable)",
  };
}

function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

/**
 * Create a referral code using Omega Network Wildcard API with graceful fallback.
 */
export async function createReferral(
  walletAddress: string,
  twitterHandle?: string,
  discordId?: string
): Promise<ReferralApiResponse> {
  if (!walletAddress || !isValidAddress(walletAddress)) {
    return { success: false, error: "Invalid or missing wallet address" };
  }

  try {
    const res = await fetch(`${config.REFERRAL_API_BASE}/referrals/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, twitterHandle, discordId }),
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        referralCode: data.referralCode,
        referralUrl: data.referralUrl,
        socialShare: data.socialShare,
        userInfo: data.userInfo,
        message: "Referral created via Omega Network API",
      };
    }
  } catch (_) {
    // fall through to mock
  }
  return getMockReferralResult(walletAddress, twitterHandle, discordId);
}

/**
 * Get referral stats combining profile and stats endpoints with fallback.
 */
export async function getReferralStats(
  walletAddress: string
): Promise<ReferralApiResponse> {
  if (!walletAddress || !isValidAddress(walletAddress)) {
    return { success: false, error: "Invalid or missing wallet address" };
  }
  try {
    const [profileRes, statsRes] = await Promise.all([
      fetch(
        `${config.REFERRAL_API_BASE}/user/profile?walletAddress=${walletAddress}`,
        { next: { revalidate: 60 } }
      ),
      fetch(
        `${config.REFERRAL_API_BASE}/referrals/stats?walletAddress=${walletAddress}`,
        { next: { revalidate: 60 } }
      ),
    ]);
    if (profileRes.ok && statsRes.ok) {
      const profile = await profileRes.json();
      const stats = await statsRes.json();
      return {
        success: true,
        userInfo: profile.userInfo,
        stats: stats.stats,
        socialShare: profile.socialShare,
        message: "Referral stats loaded",
      };
    }
  } catch (_) {
    // ignore and fallback
  }
  return getMockStatsResult(walletAddress);
}

/**
 * Get ambassador leaderboard, trying Ambassador API then Wildcard API, with mock fallback.
 */
export async function getLeaderboard(
  limit: number = 10
): Promise<ReferralApiResponse> {
  try {
    const resAmb = await fetch(
      `${config.AMBASSADOR_API_BASE}/leaderboard?limit=${limit}&includeStats=true`,
      { next: { revalidate: 120 } }
    );
    if (resAmb.ok) {
      const data = await resAmb.json();
      return {
        success: true,
        leaderboard: data.leaderboard as LeaderboardEntry[],
        platformStats: data.platformStats,
        message: "Leaderboard loaded via Ambassador API",
      };
    }
  } catch (_) {}

  try {
    const resWild = await fetch(
      `${config.REFERRAL_API_BASE}/leaderboard?limit=${limit}`,
      { next: { revalidate: 120 } }
    );
    if (resWild.ok) {
      const data = await resWild.json();
      return {
        success: true,
        leaderboard: data.leaderboard as LeaderboardEntry[],
        platformStats: data.platformStats,
        message: "Leaderboard loaded via Wildcard API",
      };
    }
  } catch (_) {}

  return getMockLeaderboardResult(limit);
}

/**
 * Complete a referral, distributing rewards, with error handling.
 */
export async function completeReferral(
  referralCode: string,
  newWalletAddress: string,
  sourcePlatform: string = "terminal"
): Promise<ReferralApiResponse> {
  if (!referralCode || !newWalletAddress || !isValidAddress(newWalletAddress)) {
    return { success: false, error: "Invalid inputs for referral completion" };
  }
  try {
    const res = await fetch(`${config.REFERRAL_API_BASE}/referrals/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode, newWalletAddress, sourcePlatform }),
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, ...data } as ReferralApiResponse;
    }
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Referral completion failed",
    };
  }
  return { success: false, error: "Referral completion failed" };
}

/**
 * Track a social campaign click/post.
 */
export async function trackSocialCampaign(
  walletAddress: string,
  platform: string
): Promise<void> {
  try {
    await fetch(`${config.REFERRAL_API_BASE}/campaign/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, platform }),
      next: { revalidate: 0 },
    });
  } catch (_) {
    // Non-critical
  }
}
