"use client";

import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardStatsPanel } from "./DashboardStatsPanel";
import { TerminalContainer } from "@/components/Terminal";
import { useCustomizer } from "@/hooks/useCustomizer";
import styles from "./DashboardLayout.module.css";

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
      {/* Media panels are now rendered INSIDE DashboardStatsPanel as sections */}
      {/* This matches the vanilla version where panels are appended to .omega-stats */}
    </div>
  );
}

export default DashboardLayout;
