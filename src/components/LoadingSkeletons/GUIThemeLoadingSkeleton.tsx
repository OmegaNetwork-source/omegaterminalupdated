"use client";

import styles from "./GUIThemeLoadingSkeleton.module.css";

/**
 * Generic GUI layout placeholder rendered while themed interfaces stream in via Suspense.
 */
export function GUIThemeLoadingSkeleton(): JSX.Element {
  return (
    <div className={styles.container}>
      <header className={`${styles.header} ${styles.shimmer}`} />

      <div className={styles.content}>
        <div
          className={`${styles.skeletonMessage} ${styles.left} ${styles.shimmer}`}
        />
        <div
          className={`${styles.skeletonMessage} ${styles.right} ${styles.shimmer}`}
        />
        <div
          className={`${styles.skeletonMessage} ${styles.leftTall} ${styles.shimmer}`}
        />
        <div
          className={`${styles.skeletonMessage} ${styles.rightShort} ${styles.shimmer}`}
        />
        <div
          className={`${styles.skeletonMessage} ${styles.left} ${styles.shimmer}`}
        />
      </div>

      <footer className={`${styles.inputSkeleton} ${styles.shimmer}`} />
    </div>
  );
}
