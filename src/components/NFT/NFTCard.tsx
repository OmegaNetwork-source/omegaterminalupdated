/**
 * NFTCard Component
 *
 * Displays OpenSea NFT information in a formatted card with action buttons.
 * Matches OpenSea plugin display format with purple theme.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./NFTCard.module.css";

interface NFTCardProps {
  nft: {
    identifier: string;
    name?: string;
    image_url?: string;
    display_image_url?: string;
    animation_url?: string;
    collection: string;
    listing?: {
      price?: {
        current?: {
          value: number;
          decimals: number;
          currency: string;
        };
      };
    };
  };
  collectionSlug: string;
  index: number;
  onView?: (collection: string, tokenId: string) => void;
  onBuy?: (collection: string, tokenId: string) => void;
  onBid?: (collection: string, tokenId: string) => void;
}

/**
 * NFTCard - Displays an individual NFT with image, info, and action buttons
 */
export function NFTCard({
  nft,
  collectionSlug,
  index,
  onView,
  onBuy,
  onBid,
}: NFTCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = nft.display_image_url || nft.image_url || nft.animation_url;
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setHasImageError(false);
  }, [imageUrl]);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "250px",
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !imageRef.current) {
      return;
    }

    if (imageRef.current.complete && imageRef.current.naturalHeight > 0) {
      setImageLoaded(true);
    }
  }, [isVisible]);

  // Check if NFT has active listing
  const hasPrice = nft.listing?.price?.current?.value;
  const price = hasPrice
    ? `${(
        nft.listing!.price!.current!.value /
        Math.pow(10, nft.listing!.price!.current!.decimals)
      ).toFixed(4)} ${nft.listing!.price!.current!.currency}`
    : null;

  const handleImageError = () => {
    setHasImageError(true);
    setImageLoaded(false);
  };

  return (
    <div className={styles.card} ref={cardRef}>
      <div className={styles.imageContainer}>
        {isVisible && imageUrl && !hasImageError ? (
          <img
            ref={imageRef}
            src={imageUrl}
            alt={nft.name || nft.identifier}
            className={`${styles.image} ${
              imageLoaded ? styles.imageVisible : styles.imageHidden
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        ) : null}

        {!imageLoaded && !hasImageError && (
          <div className={styles.imageSkeleton}>
            <div className={styles.skeletonPulse} />
          </div>
        )}

        {(!imageUrl || hasImageError) && (
          <div className={`${styles.imagePlaceholder} ${styles.visible}`}>
            🖼️
          </div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.header}>
          <div>
            <div className={styles.name}>
              {nft.name || `#${nft.identifier}`}
            </div>
            <div className={styles.collection}>{collectionSlug}</div>
          </div>
          <div className={styles.indexBadge}>{index}</div>
        </div>

        <div
          className={`${styles.priceSection} ${
            price ? styles.forSale : styles.notForSale
          }`}
        >
          <div className={styles.priceLabel}>
            {price ? "FOR SALE" : "NOT FOR SALE"}
          </div>
          {price && <div className={styles.priceValue}>{price}</div>}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.button}
            onClick={() => onView?.(collectionSlug, nft.identifier)}
          >
            View
          </button>
          {price && (
            <button
              className={`${styles.button} ${styles.buyButton}`}
              onClick={() => onBuy?.(collectionSlug, nft.identifier)}
            >
              Buy
            </button>
          )}
          {!price && (
            <button
              className={`${styles.button} ${styles.bidButton}`}
              onClick={() => onBid?.(collectionSlug, nft.identifier)}
            >
              Bid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
