"use client";

import React from "react";
import styles from "./ChristmasTree.module.css";

/**
 * ChristmasTree Component
 * Animated Christmas tree made of rotating lines
 * Inspired by intera-ui Tree component but built custom for Omega Terminal
 * 
 * Features:
 * - Rotating line segments creating tree shape
 * - Smooth CSS animations
 * - Festive colors that adapt to Xmas palette
 * - Non-interactive decorative element
 */
export function ChristmasTree(): JSX.Element {
  return (
    <div className={styles.treeContainer}>
      <svg
        className={styles.treeSvg}
        viewBox="0 0 200 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tree trunk */}
        <rect
          x="90"
          y="250"
          width="20"
          height="50"
          className={styles.trunk}
        />

        {/* Tree layers - bottom to top */}
        {/* Bottom layer */}
        <g className={styles.layer} style={{ animationDelay: "0s" }}>
          <line x1="100" y1="200" x2="60" y2="240" className={styles.branch} />
          <line x1="100" y1="200" x2="140" y2="240" className={styles.branch} />
          <line x1="100" y1="200" x2="50" y2="220" className={styles.branch} />
          <line x1="100" y1="200" x2="150" y2="220" className={styles.branch} />
        </g>

        {/* Middle layer */}
        <g className={styles.layer} style={{ animationDelay: "0.3s" }}>
          <line x1="100" y1="150" x2="70" y2="190" className={styles.branch} />
          <line x1="100" y1="150" x2="130" y2="190" className={styles.branch} />
          <line x1="100" y1="150" x2="55" y2="170" className={styles.branch} />
          <line x1="100" y1="150" x2="145" y2="170" className={styles.branch} />
        </g>

        {/* Top layer */}
        <g className={styles.layer} style={{ animationDelay: "0.6s" }}>
          <line x1="100" y1="100" x2="80" y2="140" className={styles.branch} />
          <line x1="100" y1="100" x2="120" y2="140" className={styles.branch} />
          <line x1="100" y1="100" x2="70" y2="120" className={styles.branch} />
          <line x1="100" y1="100" x2="130" y2="120" className={styles.branch} />
        </g>

        {/* Top section */}
        <g className={styles.layer} style={{ animationDelay: "0.9s" }}>
          <line x1="100" y1="50" x2="85" y2="90" className={styles.branch} />
          <line x1="100" y1="50" x2="115" y2="90" className={styles.branch} />
        </g>

        {/* Star/Topper */}
        <g className={styles.star}>
          <path
            d="M 100 20 L 105 35 L 120 35 L 108 45 L 113 60 L 100 50 L 87 60 L 92 45 L 80 35 L 95 35 Z"
            className={styles.starPath}
          />
        </g>

        {/* Decorative ornaments (small circles) */}
        <circle cx="80" cy="180" r="3" className={styles.ornament} style={{ animationDelay: "0.2s" }} />
        <circle cx="120" cy="200" r="3" className={styles.ornament} style={{ animationDelay: "0.4s" }} />
        <circle cx="70" cy="210" r="3" className={styles.ornament} style={{ animationDelay: "0.6s" }} />
        <circle cx="130" cy="220" r="3" className={styles.ornament} style={{ animationDelay: "0.8s" }} />
        <circle cx="90" cy="130" r="3" className={styles.ornament} style={{ animationDelay: "1s" }} />
        <circle cx="110" cy="140" r="3" className={styles.ornament} style={{ animationDelay: "1.2s" }} />
      </svg>
    </div>
  );
}

export default ChristmasTree;

