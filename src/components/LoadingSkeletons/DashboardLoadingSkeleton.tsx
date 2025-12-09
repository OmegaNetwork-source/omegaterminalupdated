"use client";

import styles from "./DashboardLoadingSkeleton.module.css";

/**
 * Lightweight loading UI that mirrors the dashboard layout while the real dashboard chunks
 * are streaming in through dynamic imports.
 */
export function DashboardLoadingSkeleton(): JSX.Element {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={`${styles.sidebarHeader} ${styles.shimmer}`} />
        <div className={styles.sidebarSection}>
          <div className={`${styles.skeletonBar} ${styles.shimmer}`} />
          <div className={`${styles.skeletonBar} ${styles.shimmer}`} />
          <div className={`${styles.skeletonBar} ${styles.shimmer}`} />
        </div>
        <div className={styles.sidebarFooter}>
          <div className={`${styles.skeletonLine} ${styles.shimmer}`} />
          <div className={`${styles.skeletonLine} ${styles.shimmer}`} />
        </div>
      </aside>

      <main className={styles.terminal}>
        <div className={`${styles.terminalHeader} ${styles.shimmer}`} />
        <div className={styles.terminalBody}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`terminal-line-${index}`}
              className={`${styles.outputLine} ${styles.shimmer}`}
            />
          ))}
        </div>
        <div className={`${styles.commandInput} ${styles.shimmer}`} />
      </main>

      <section className={styles.stats}>
        <div className={styles.statsHeader}>
          <div className={`${styles.statTitle} ${styles.shimmer}`} />
          <div className={`${styles.statSubtitle} ${styles.shimmer}`} />
        </div>
        <div className={styles.statCards}>
          {Array.from({ length: 4 }).map((_, cardIndex) => (
            <div
              key={`stat-card-${cardIndex}`}
              className={`${styles.statCard} ${styles.shimmer}`}
            />
          ))}
        </div>
        <div className={styles.activityFeed}>
          {Array.from({ length: 5 }).map((_, feedIndex) => (
            <div
              key={`activity-item-${feedIndex}`}
              className={`${styles.activityItem} ${styles.shimmer}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
