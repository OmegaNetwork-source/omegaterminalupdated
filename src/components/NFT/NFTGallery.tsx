/**
 * NFTGallery Component
 *
 * Displays a responsive grid of NFT cards with optional load more functionality.
 * Used for OpenSea NFT collections.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NFTCard } from "./NFTCard";
import styles from "./NFTGallery.module.css";

interface NFTGalleryProps {
  nfts: Array<{
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
  }>;
  collectionSlug: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onView?: (collection: string, tokenId: string) => void;
  onBuy?: (collection: string, tokenId: string) => void;
  onBid?: (collection: string, tokenId: string) => void;
}

/**
 * NFTGallery - Responsive grid of NFT cards
 */
const MIN_CARD_WIDTH = 280;
const ITEM_GAP = 20;
const CARD_HEIGHT = 420;
const BUFFER_ROWS = 2;

export function NFTGallery({
  nfts,
  collectionSlug,
  onLoadMore,
  hasMore,
  onView,
  onBuy,
  onBid,
}: NFTGalleryProps) {
  const virtualizationEnabled = nfts.length > 30;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) {
      return;
    }
    setScrollTop(containerRef.current.scrollTop);
  }, []);

  useEffect(() => {
    if (!virtualizationEnabled) {
      return undefined;
    }

    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    const updateMeasurements = () => {
      setViewportHeight(element.clientHeight);
      setContainerWidth(element.clientWidth);
    };

    updateMeasurements();
    element.addEventListener("scroll", handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(updateMeasurements);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [handleScroll, virtualizationEnabled]);

  const columns = useMemo(() => {
    if (!virtualizationEnabled) {
      return 1;
    }
    if (containerWidth === 0) {
      return 1;
    }
    const effectiveWidth = containerWidth + ITEM_GAP;
    const columnWidth = MIN_CARD_WIDTH + ITEM_GAP;
    return Math.max(1, Math.floor(effectiveWidth / columnWidth));
  }, [containerWidth, virtualizationEnabled]);

  const rowHeight = CARD_HEIGHT + ITEM_GAP;
  const rowCount = Math.ceil(nfts.length / columns);
  const totalHeight = Math.max(rowCount * rowHeight - ITEM_GAP, 0);

  const { startIndex, endIndex, offsetY } = useMemo(() => {
    if (!virtualizationEnabled) {
      return { startIndex: 0, endIndex: nfts.length, offsetY: 0 };
    }

    const startRow = Math.max(
      0,
      Math.floor(scrollTop / rowHeight) - BUFFER_ROWS
    );
    const endRow = Math.min(
      rowCount,
      Math.ceil((scrollTop + viewportHeight) / rowHeight) + BUFFER_ROWS
    );

    return {
      startIndex: startRow * columns,
      endIndex: Math.min(nfts.length, endRow * columns),
      offsetY: startRow * rowHeight,
    };
  }, [
    columns,
    nfts.length,
    rowHeight,
    rowCount,
    scrollTop,
    viewportHeight,
    virtualizationEnabled,
  ]);

  const visibleItems = useMemo(() => {
    return nfts.slice(startIndex, endIndex).map((nft, visibleIndex) => {
      const absoluteIndex = startIndex + visibleIndex;
      return (
        <NFTCard
          key={nft.identifier}
          nft={nft}
          collectionSlug={collectionSlug}
          index={absoluteIndex + 1}
          onView={onView}
          onBuy={onBuy}
          onBid={onBid}
        />
      );
    });
  }, [collectionSlug, endIndex, nfts, onBid, onBuy, onView, startIndex]);

  const galleryContent = virtualizationEnabled ? (
    <div className={styles.virtualContainer} ref={containerRef}>
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          <div className={styles.gallery}>{visibleItems}</div>
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.gallery}>
      {nfts.map((nft, index) => (
        <NFTCard
          key={nft.identifier}
          nft={nft}
          collectionSlug={collectionSlug}
          index={index + 1}
          onView={onView}
          onBuy={onBuy}
          onBid={onBid}
        />
      ))}
    </div>
  );

  return (
    <>
      {galleryContent}

      {hasMore && onLoadMore && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreButton} onClick={onLoadMore}>
            Load More NFTs
          </button>
        </div>
      )}
    </>
  );
}
