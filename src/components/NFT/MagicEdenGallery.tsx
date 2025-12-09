/**
 * MagicEdenGallery Component
 *
 * Displays Magic Eden Solana NFT listings in a compact grid format.
 * Optimized for displaying many small NFT cards.
 */

"use client";

import React from "react";
import { MagicEdenCard } from "./MagicEdenCard";
import styles from "./MagicEdenGallery.module.css";

interface MagicEdenGalleryProps {
  listings: Array<{
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
  }>;
  collectionSymbol: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

/**
 * MagicEdenGallery - Compact grid of Magic Eden NFT cards
 */
export function MagicEdenGallery({
  listings,
  collectionSymbol,
  onLoadMore,
  hasMore,
}: MagicEdenGalleryProps) {
  return (
    <>
      <div className={styles.gallery}>
        {listings.map((listing, index) => (
          <MagicEdenCard
            key={`${collectionSymbol}-${index}`}
            listing={listing}
          />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreButton} onClick={onLoadMore}>
            Show More
          </button>
        </div>
      )}
    </>
  );
}
