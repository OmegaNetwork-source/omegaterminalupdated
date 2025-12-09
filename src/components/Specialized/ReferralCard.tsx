"use client";

import React from "react";
import styles from "./ReferralCard.module.css";

export interface ReferralCardProps {
  referralCode: string;
  referralUrl: string;
  totalReferrals: number;
  totalEarned: number;
  onShare?: (platform: "twitter" | "discord") => void;
}

/**
 * Displays referral info with sharing buttons. For Phase 15 integration.
 */
export function ReferralCard({
  referralCode,
  referralUrl,
  totalReferrals,
  totalEarned,
  onShare,
}: ReferralCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Your Referral Code</div>
        <div className={styles.codeBadge}>{referralCode}</div>
      </div>

      <div className={styles.urlSection}>
        <div className={styles.url}>
          <span>{referralUrl}</span>
          <button
            className={styles.copyButton}
            onClick={() => navigator.clipboard.writeText(referralUrl)}
          >
            Copy
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{totalReferrals}</div>
          <div className={styles.statLabel}>Total Referrals</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{totalEarned}</div>
          <div className={styles.statLabel}>OMEGA Earned</div>
        </div>
      </div>

      <div className={styles.socialButtons}>
        <button
          className={`${styles.socialButton} ${styles.twitterButton}`}
          onClick={() => onShare?.("twitter")}
        >
          Share on Twitter
        </button>
        <button
          className={`${styles.socialButton} ${styles.discordButton}`}
          onClick={() => onShare?.("discord")}
        >
          Share on Discord
        </button>
      </div>

      <div className={styles.rewardInfo}>
        Earn 10 OMEGA per referral. +2 OMEGA for social sharing.
      </div>
    </div>
  );
}
