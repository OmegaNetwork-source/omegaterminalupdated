"use client";

import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardStatsPanel } from "./DashboardStatsPanel";
import { TerminalContainer } from "@/components/Terminal";
import { useCustomizer } from "@/hooks/useCustomizer";
import dynamic from "next/dynamic";
import styles from "./DashboardLayout.module.css";

const SomniaArcadeModal = dynamic(
  () =>
    import("./SomniaArcadeModal").then((mod) => ({
      default: mod.SomniaArcadeModal,
    })),
  {
    ssr: false,
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
  const [isSomniaArcadeOpen, setIsSomniaArcadeOpen] = useState(false);

  const dashboardClassName = [
    styles.dashboard,
    !sidebarVisible && statsVisible ? styles.sidebarHidden : "",
    sidebarVisible && !statsVisible ? styles.statsHidden : "",
    !sidebarVisible && !statsVisible ? styles.bothHidden : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Expose modal state to window for sidebar access
  if (typeof window !== "undefined") {
    (window as any).openSomniaArcade = () => setIsSomniaArcadeOpen(true);
  }

  return (
    <div className={dashboardClassName}>
      {sidebarVisible && <DashboardSidebar />}
      <main className={styles.terminalArea}>
        <TerminalContainer />
        {/* Somnia Arcade Modal - rendered in terminal area */}
        <SomniaArcadeModal
          isOpen={isSomniaArcadeOpen}
          onClose={() => setIsSomniaArcadeOpen(false)}
        />
      </main>
      {statsVisible && <DashboardStatsPanel />}
      {/* Media panels are now rendered INSIDE DashboardStatsPanel as sections */}
      {/* This matches the vanilla version where panels are appended to .omega-stats */}
    </div>
  );
}

export default DashboardLayout;
