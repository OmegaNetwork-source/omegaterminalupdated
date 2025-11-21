"use client";

import React from "react";
import styles from "./SnowGround.module.css";

/**
 * SnowGround Component
 * White snow mounds/hills that appear under the Christmas tree
 * Only visible when Xmas color palette is active
 * 
 * Features:
 * - Multiple snow mounds for natural look
 * - Smooth curves using SVG paths
 * - Subtle glow effect
 * - Positioned below tree trunk
 */
export function SnowGround(): JSX.Element {
  return (
    <div className={styles.snowContainer}>
      <svg
        className={styles.snowSvg}
        viewBox="0 0 200 60"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Main snow mound - centered under tree */}
        <path
          d="M 0 60 L 0 45 Q 20 40, 40 42 Q 60 40, 80 42 Q 100 38, 120 42 Q 140 40, 160 42 Q 180 40, 200 45 L 200 60 Z"
          className={styles.snowMound}
        />
        
        {/* Additional smaller mounds for texture */}
        <path
          d="M 30 60 L 30 52 Q 35 50, 40 52 Q 45 50, 50 52 L 50 60 Z"
          className={styles.snowMoundSmall}
        />
        <path
          d="M 150 60 L 150 52 Q 155 50, 160 52 Q 165 50, 170 52 L 170 60 Z"
          className={styles.snowMoundSmall}
        />
        
        {/* Snow sparkles/glitter effect */}
        <circle cx="25" cy="48" r="1.5" className={styles.sparkle} style={{ animationDelay: "0s" }} />
        <circle cx="75" cy="46" r="1.2" className={styles.sparkle} style={{ animationDelay: "0.3s" }} />
        <circle cx="125" cy="48" r="1.5" className={styles.sparkle} style={{ animationDelay: "0.6s" }} />
        <circle cx="175" cy="46" r="1.2" className={styles.sparkle} style={{ animationDelay: "0.9s" }} />
        <circle cx="50" cy="50" r="1" className={styles.sparkle} style={{ animationDelay: "1.2s" }} />
        <circle cx="100" cy="44" r="1.3" className={styles.sparkle} style={{ animationDelay: "1.5s" }} />
        <circle cx="150" cy="50" r="1" className={styles.sparkle} style={{ animationDelay: "1.8s" }} />
      </svg>
    </div>
  );
}

export default SnowGround;

