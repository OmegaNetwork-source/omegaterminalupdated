/**
 * MagicEdenCard Component
 *
 * Displays Magic Eden Solana NFT listing in a compact grid card format.
 * Matches Magic Eden plugin styling with cyan/blue theme.
 */

"use client";

import React from "react";
import styles from "./MagicEdenCard.module.css";

interface MagicEdenCardProps {
  listing: {
    price?: number;
    priceInfo?: {
      solPrice?: number;
    };
    extra?: {
      img?: string;
    };
    token?: {
      name?: string;
      image?: string;
    };
    tokenName?: string;
    name?: string;
    img?: string;
    image?: string;
  };
  onView?: (tokenName: string) => void;
}

/**
 * Format SOL price from lamports or priceInfo object
 */
function formatSOL(price: number | object | undefined): string {
  if (typeof price === "number") {
    return `${(price / 1e9).toFixed(2)} SOL`;
  }

  if (typeof price === "object" && price !== null) {
    const priceInfo = price as any;
    const solPrice = priceInfo.solPrice || priceInfo.price || 0;
    return `${(solPrice / 1e9).toFixed(2)} SOL`;
  }

  return "-- SOL";
}

/**
 * MagicEdenCard - Compact NFT card for Magic Eden listings
 */
export function MagicEdenCard({ listing, onView }: MagicEdenCardProps) {
  // Get best image URL
  const imageUrl =
    listing.extra?.img || listing.token?.image || listing.img || listing.image;

  // Get token name
  const tokenName =
    listing.tokenName || listing.token?.name || listing.name || "Unknown";

  // Get price
  const price = listing.priceInfo || listing.price;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    e.currentTarget.nextElementSibling?.classList.add(styles.visible);
  };

  return (
    <div className={styles.card} onClick={() => onView?.(tokenName)}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={tokenName}
              className={styles.image}
              onError={handleImageError}
            />
            <div className={styles.imagePlaceholder}>◎</div>
          </>
        ) : (
          <div className={`${styles.imagePlaceholder} ${styles.visible}`}>
            ◎
          </div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.name} title={tokenName}>
          {tokenName}
        </div>
        <div className={styles.price}>{formatSOL(price)}</div>
      </div>
    </div>
  );
}
