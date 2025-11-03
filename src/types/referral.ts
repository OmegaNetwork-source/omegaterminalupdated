/**
 * Referral system type definitions for Omega Ambassador program
 */

/**
 * Represents a created referral code and associated metadata.
 */
export interface ReferralCode {
  code: string;
  url: string;
  walletAddress: string;
  twitterHandle: string | null;
  discordId: string | null;
  createdAt: string;
}

/**
 * Aggregated referral performance statistics for a user.
 */
export interface ReferralStats {
  totalReferrals: number;
  totalEarned: number;
  pendingRewards: number;
  confirmedRewards: number;
}

/**
 * User profile information in the referral program.
 */
export interface ReferralUser {
  walletAddress: string;
  referralCode: string;
  referralUrl: string;
  twitterHandle: string | null;
  discordId: string | null;
  totalReferrals: number;
  totalEarned: number;
  rank: number | null;
}

/**
 * Leaderboard entry for top ambassadors.
 */
export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  twitterHandle: string;
  referrals: number;
  earned: number;
}

/**
 * Social sharing content (precomposed) for platforms.
 */
export interface SocialShareContent {
  twitter: string;
  discord: string;
}

/**
 * Standardized referral API response with optional fields depending on request.
 */
export interface ReferralApiResponse {
  success: boolean;
  referralCode?: string;
  referralUrl?: string;
  userInfo?: ReferralUser;
  stats?: ReferralStats;
  leaderboard?: LeaderboardEntry[];
  platformStats?: {
    totalUsers: number;
    totalReferrals: number;
    totalRewardsDistributed: number;
  };
  socialShare?: SocialShareContent;
  error?: string;
  message?: string;
}

export {};
