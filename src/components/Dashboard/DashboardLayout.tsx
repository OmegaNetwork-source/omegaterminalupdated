"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardStatsPanel } from "./DashboardStatsPanel";
import { TerminalContainer } from "@/components/Terminal";
import { useCustomizer } from "@/hooks/useCustomizer";
import styles from "./DashboardLayout.module.css";
import { MediaPanelLoadingSkeleton } from "@/components/LoadingSkeletons";
import type { MediaPanelContainerProps } from "@/components/Media";

const SpotifyPanel = dynamic(
  () =>
    import("@/components/Media").then((mod) => ({
      default: mod.SpotifyPanel,
    })),
  {
    ssr: false,
    suspense: true,
  }
);

const YouTubePanel = dynamic(
  () =>
    import("@/components/Media").then((mod) => ({
      default: mod.YouTubePanel,
    })),
  {
    ssr: false,
    suspense: true,
  }
);

const NewsReaderPanel = dynamic(
  () =>
    import("@/components/Media").then((mod) => ({
      default: mod.NewsReaderPanel,
    })),
  {
    ssr: false,
    suspense: true,
  }
);

const MediaPanelContainer = dynamic<MediaPanelContainerProps>(
  () =>
    import("@/components/Media").then((mod) => ({
      default: mod.MediaPanelContainer,
    })),
  {
    ssr: false,
    suspense: true,
  }
);

/**
 * DashboardLayout
 * 3-panel futuristic dashboard (sidebar, terminal, stats panel).
 * Renders conditionally based on panel visibility from Customizer.
 */
export function DashboardLayout(): JSX.Element {
  const { settings } = useCustomizer();
  const sidebarVisible = settings.panels.sidebar !== false;
  const statsVisible = settings.panels.stats !== false;

  const dashboardClassName = [
    styles.dashboard,
    !sidebarVisible && statsVisible ? styles.sidebarHidden : "",
    sidebarVisible && !statsVisible ? styles.statsHidden : "",
    !sidebarVisible && !statsVisible ? styles.bothHidden : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={dashboardClassName}>
      {sidebarVisible && <DashboardSidebar />}
      <main className={styles.terminalArea}>
        <TerminalContainer />
      </main>
      {statsVisible && <DashboardStatsPanel />}
      {/* Media panels are lazy loaded because they depend on heavy external SDKs. */}
      <Suspense fallback={<MediaPanelLoadingSkeleton />}>
        <MediaPanelContainer
          SpotifyPanel={SpotifyPanel}
          YouTubePanel={YouTubePanel}
          NewsReaderPanel={NewsReaderPanel}
        />
      </Suspense>
    </div>
  );
}

export default DashboardLayout;
