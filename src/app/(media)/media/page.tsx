"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { useNewsReader } from "@/hooks/useNewsReader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MediaPanelLoadingSkeleton } from "@/components/LoadingSkeletons";
import type { MediaPanelContainerProps } from "@/components/Media";
import styles from "./page.module.css";

const SpotifyPanel = dynamic(
  () =>
    import("@/components/Media").then((mod) => ({
      default: mod.SpotifyPanel,
    })),
  {
    ssr: false,
    loading: () => <MediaPanelLoadingSkeleton />,
  }
);

const YouTubePanel = dynamic(
  () =>
    import("@/components/Media").then((mod) => ({
      default: mod.YouTubePanel,
    })),
  {
    ssr: false,
    loading: () => <MediaPanelLoadingSkeleton />,
  }
);

const NewsReaderPanel = dynamic(
  () =>
    import("@/components/Media").then((mod) => ({
      default: mod.NewsReaderPanel,
    })),
  {
    ssr: false,
    loading: () => <MediaPanelLoadingSkeleton />,
  }
);

const MediaPanelContainer = dynamic<MediaPanelContainerProps>(
  () =>
    import("@/components/Media").then((mod) => ({
      default: mod.MediaPanelContainer,
    })),
  {
    ssr: false,
    loading: () => <MediaPanelLoadingSkeleton />,
  }
);

export default function MediaPage(): JSX.Element {
  const spotify = useSpotify();
  const youtube = useYouTube();
  const news = useNewsReader();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Omega Media Hub</h1>
        <p>
          Select a panel to stream music, video, or news without touching the
          dashboard bundle.
        </p>
      </header>

      <section className={styles.controls}>
        <button type="button" onClick={() => spotify.openPanel()}>
          Open Spotify Panel
        </button>
        <button type="button" onClick={() => youtube.openPanel()}>
          Open YouTube Panel
        </button>
        <button type="button" onClick={() => news.openPanel()}>
          Open News Reader
        </button>
      </section>

      <ErrorBoundary
        fallback={(error, reset) => (
          <div className={styles.panelError}>
            <h2>Media panels unavailable</h2>
            <p>{error.message}</p>
            <button type="button" onClick={reset}>
              Retry loading panels
            </button>
          </div>
        )}
      >
        <Suspense fallback={<MediaPanelLoadingSkeleton />}>
          <MediaPanelContainer
            SpotifyPanel={SpotifyPanel}
            YouTubePanel={YouTubePanel}
            NewsReaderPanel={NewsReaderPanel}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
