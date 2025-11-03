"use client";

import styles from "./MediaPanelLoadingSkeleton.module.css";

/**
 * Sidebar media placeholder that keeps spatial continuity while Spotify, YouTube or News
 * interfaces are dynamically imported.
 */
export function MediaPanelLoadingSkeleton(): JSX.Element {
  return (
    <div className={`${styles.panel} ${styles.shimmer}`}>
      <div className={`${styles.header} ${styles.shimmer}`} />
      <div className={styles.content}>
        <div className={`${styles.skeletonBar} ${styles.shimmer}`} />
        <div className={`${styles.skeletonBar} ${styles.shimmer}`} />
        <div className={`${styles.skeletonBar} ${styles.shimmer}`} />
        <div className={`${styles.progress} ${styles.shimmer}`} />
      </div>
    </div>
  );
}
