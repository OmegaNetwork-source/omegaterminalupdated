"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import styles from "./page.module.css";

const NFTGallery = dynamic(
  () =>
    import("@/components/NFT").then((mod) => ({
      default: mod.NFTGallery,
    })),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loading}>Loading featured collection…</div>
    ),
  }
);

type NFTEntry = {
  identifier: string;
  name: string;
  image_url: string;
  collection: string;
};

const PLACEHOLDER_IMAGES = [
  "https://picsum.photos/seed/omega001/640/640",
  "https://picsum.photos/seed/omega002/640/640",
  "https://picsum.photos/seed/omega003/640/640",
  "https://picsum.photos/seed/omega004/640/640",
  "https://picsum.photos/seed/omega005/640/640",
  "https://picsum.photos/seed/omega006/640/640",
];

function createMockNfts(count: number, offset = 0): NFTEntry[] {
  return Array.from({ length: count }).map((_, index) => {
    const id = index + offset;
    return {
      identifier: `omega-${id}`,
      name: `Omega Artifact #${id.toString().padStart(3, "0")}`,
      image_url: PLACEHOLDER_IMAGES[id % PLACEHOLDER_IMAGES.length]!,
      collection: "omega-artifacts",
    };
  });
}

export default function NftPage(): JSX.Element {
  const initialNfts = useMemo(() => createMockNfts(24), []);
  const [nfts, setNfts] = useState<NFTEntry[]>(initialNfts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    const nextBatch = createMockNfts(12, nextPage * 12);
    setNfts((prev) => [...prev, ...nextBatch]);
    setPage(nextPage);
    if (nextPage >= 5) {
      setHasMore(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Omega NFT Collections</h1>
        <p>Explore curated drops without preloading the entire dashboard.</p>
      </header>
      <ErrorBoundary
        fallback={(error, reset) => (
          <div className={styles.galleryError}>
            <h2>Gallery unavailable</h2>
            <p>{error.message}</p>
            <button type="button" onClick={reset}>
              Retry loading gallery
            </button>
          </div>
        )}
      >
        <Suspense
          fallback={
            <div className={styles.loading}>Fetching NFT metadata…</div>
          }
        >
          <NFTGallery
            nfts={nfts}
            collectionSlug="omega-artifacts"
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
