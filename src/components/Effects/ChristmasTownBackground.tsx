"use client";

import React from "react";
import styles from "./ChristmasTownBackground.module.css";

/**
 * ChristmasTownBackground Component
 * Scenic Christmas town background inspired by classic holiday movies
 * Features houses with warm lights, snow-covered rooftops, mountains, and stars
 * Only visible when Xmas color palette is active
 * 
 * Movie References:
 * - It's a Wonderful Life (small town charm)
 * - Home Alone (cozy suburban houses)
 * - The Polar Express (winter wonderland)
 * - A Christmas Story (nostalgic neighborhood)
 */
export function ChristmasTownBackground(): JSX.Element {
  return (
    <div className={styles.townContainer}>
      <svg
        className={styles.townSvg}
        viewBox="0 0 400 300"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Night Sky Background */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="50%" stopColor="#1a2a3a" />
            <stop offset="100%" stopColor="#0f1a25" />
          </linearGradient>
          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a3a4a" />
            <stop offset="100%" stopColor="#1a2a3a" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Sky */}
        <rect width="400" height="300" fill="url(#skyGradient)" />

        {/* Stars */}
        <g className={styles.stars}>
          <circle cx="50" cy="40" r="1.5" className={styles.star} style={{ animationDelay: "0s" }} />
          <circle cx="120" cy="30" r="1.2" className={styles.star} style={{ animationDelay: "0.3s" }} />
          <circle cx="200" cy="50" r="1.8" className={styles.star} style={{ animationDelay: "0.6s" }} />
          <circle cx="280" cy="35" r="1.3" className={styles.star} style={{ animationDelay: "0.9s" }} />
          <circle cx="350" cy="45" r="1.5" className={styles.star} style={{ animationDelay: "1.2s" }} />
          <circle cx="80" cy="70" r="1" className={styles.star} style={{ animationDelay: "1.5s" }} />
          <circle cx="250" cy="65" r="1.4" className={styles.star} style={{ animationDelay: "1.8s" }} />
          <circle cx="320" cy="75" r="1.1" className={styles.star} style={{ animationDelay: "2.1s" }} />
        </g>

        {/* Moon */}
        <circle cx="360" cy="50" r="25" className={styles.moon} />
        <circle cx="355" cy="45" r="20" fill="#0a1628" />

        {/* Mountains in Background */}
        <g className={styles.mountains}>
          <path
            d="M 0 200 L 80 120 L 160 200 Z"
            fill="url(#mountainGradient)"
            className={styles.mountain}
          />
          <path
            d="M 120 200 L 200 100 L 280 200 Z"
            fill="url(#mountainGradient)"
            className={styles.mountain}
          />
          <path
            d="M 240 200 L 320 130 L 400 200 Z"
            fill="url(#mountainGradient)"
            className={styles.mountain}
          />
          {/* Snow caps on mountains */}
          <path
            d="M 60 140 L 80 120 L 100 140 Z"
            fill="#ffffff"
            opacity="0.8"
            className={styles.snowCap}
          />
          <path
            d="M 180 120 L 200 100 L 220 120 Z"
            fill="#ffffff"
            opacity="0.8"
            className={styles.snowCap}
          />
          <path
            d="M 300 150 L 320 130 L 340 150 Z"
            fill="#ffffff"
            opacity="0.8"
            className={styles.snowCap}
          />
        </g>

        {/* Left House */}
        <g className={styles.house} transform="translate(30, 180)">
          {/* House body */}
          <rect x="0" y="0" width="60" height="50" fill="#3d2817" stroke="#2a1a0f" strokeWidth="1" />
          {/* Roof */}
          <path d="M -5 -10 L 30 5 L 65 -10 Z" fill="#8b0000" stroke="#6b0000" strokeWidth="1" />
          {/* Snow on roof */}
          <path d="M -5 -10 L 30 0 L 65 -10 Z" fill="#ffffff" opacity="0.9" />
          {/* Window 1 */}
          <rect x="8" y="12" width="12" height="12" fill="#ffd700" className={styles.window} />
          <rect x="8" y="12" width="12" height="12" fill="none" stroke="#ffaa00" strokeWidth="1" />
          <line x1="14" y1="12" x2="14" y2="24" stroke="#ffaa00" strokeWidth="0.5" />
          <line x1="8" y1="18" x2="20" y2="18" stroke="#ffaa00" strokeWidth="0.5" />
          {/* Window 2 */}
          <rect x="40" y="12" width="12" height="12" fill="#ffd700" className={styles.window} />
          <rect x="40" y="12" width="12" height="12" fill="none" stroke="#ffaa00" strokeWidth="1" />
          <line x1="46" y1="12" x2="46" y2="24" stroke="#ffaa00" strokeWidth="0.5" />
          <line x1="40" y1="18" x2="52" y2="18" stroke="#ffaa00" strokeWidth="0.5" />
          {/* Door */}
          <rect x="22" y="30" width="16" height="20" fill="#654321" stroke="#4a2c0f" strokeWidth="1" />
          <circle cx="35" cy="40" r="1.5" fill="#ffd700" />
        </g>

        {/* Center House (larger) */}
        <g className={styles.house} transform="translate(150, 160)">
          {/* House body */}
          <rect x="0" y="0" width="80" height="70" fill="#4a3420" stroke="#3a2817" strokeWidth="1" />
          {/* Roof */}
          <path d="M -8 -15 L 40 8 L 88 -15 Z" fill="#a00000" stroke="#800000" strokeWidth="1" />
          {/* Snow on roof */}
          <path d="M -8 -15 L 40 2 L 88 -15 Z" fill="#ffffff" opacity="0.9" />
          {/* Window 1 */}
          <rect x="10" y="15" width="16" height="16" fill="#ffd700" className={styles.window} />
          <rect x="10" y="15" width="16" height="16" fill="none" stroke="#ffaa00" strokeWidth="1" />
          <line x1="18" y1="15" x2="18" y2="31" stroke="#ffaa00" strokeWidth="0.5" />
          <line x1="10" y1="23" x2="26" y2="23" stroke="#ffaa00" strokeWidth="0.5" />
          {/* Window 2 */}
          <rect x="54" y="15" width="16" height="16" fill="#ffd700" className={styles.window} />
          <rect x="54" y="15" width="16" height="16" fill="none" stroke="#ffaa00" strokeWidth="1" />
          <line x1="62" y1="15" x2="62" y2="31" stroke="#ffaa00" strokeWidth="0.5" />
          <line x1="54" y1="23" x2="70" y2="23" stroke="#ffaa00" strokeWidth="0.5" />
          {/* Window 3 (attic) */}
          <rect x="30" y="5" width="20" height="20" fill="#ffd700" className={styles.window} />
          <rect x="30" y="5" width="20" height="20" fill="none" stroke="#ffaa00" strokeWidth="1" />
          <line x1="40" y1="5" x2="40" y2="25" stroke="#ffaa00" strokeWidth="0.5" />
          <line x1="30" y1="15" x2="50" y2="15" stroke="#ffaa00" strokeWidth="0.5" />
          {/* Door */}
          <rect x="30" y="40" width="20" height="30" fill="#5a3a20" stroke="#4a2a10" strokeWidth="1" />
          <circle cx="47" cy="55" r="1.5" fill="#ffd700" />
          {/* Wreath on door */}
          <circle cx="40" cy="50" r="8" fill="none" stroke="#228b22" strokeWidth="2" />
          <circle cx="40" cy="50" r="6" fill="none" stroke="#228b22" strokeWidth="1" />
        </g>

        {/* Right House */}
        <g className={styles.house} transform="translate(280, 175)">
          {/* House body */}
          <rect x="0" y="0" width="55" height="55" fill="#3d2817" stroke="#2a1a0f" strokeWidth="1" />
          {/* Roof */}
          <path d="M -5 -10 L 27.5 5 L 60 -10 Z" fill="#8b0000" stroke="#6b0000" strokeWidth="1" />
          {/* Snow on roof */}
          <path d="M -5 -10 L 27.5 0 L 60 -10 Z" fill="#ffffff" opacity="0.9" />
          {/* Window 1 */}
          <rect x="8" y="12" width="12" height="12" fill="#ffd700" className={styles.window} />
          <rect x="8" y="12" width="12" height="12" fill="none" stroke="#ffaa00" strokeWidth="1" />
          <line x1="14" y1="12" x2="14" y2="24" stroke="#ffaa00" strokeWidth="0.5" />
          <line x1="8" y1="18" x2="20" y2="18" stroke="#ffaa00" strokeWidth="0.5" />
          {/* Window 2 */}
          <rect x="35" y="12" width="12" height="12" fill="#ffd700" className={styles.window} />
          <rect x="35" y="12" width="12" height="12" fill="none" stroke="#ffaa00" strokeWidth="1" />
          <line x1="41" y1="12" x2="41" y2="24" stroke="#ffaa00" strokeWidth="0.5" />
          <line x1="35" y1="18" x2="47" y2="18" stroke="#ffaa00" strokeWidth="0.5" />
          {/* Door */}
          <rect x="20" y="30" width="15" height="25" fill="#654321" stroke="#4a2c0f" strokeWidth="1" />
          <circle cx="32" cy="42" r="1.5" fill="#ffd700" />
        </g>

        {/* Street Lamps */}
        <g className={styles.streetLamp} transform="translate(100, 200)">
          {/* Pole */}
          <rect x="0" y="0" width="3" height="40" fill="#4a4a4a" />
          {/* Lamp */}
          <circle cx="1.5" cy="5" r="8" fill="#ffd700" className={styles.lampGlow} />
          <circle cx="1.5" cy="5" r="6" fill="#ffffff" />
        </g>
        <g className={styles.streetLamp} transform="translate(300, 200)">
          {/* Pole */}
          <rect x="0" y="0" width="3" height="40" fill="#4a4a4a" />
          {/* Lamp */}
          <circle cx="1.5" cy="5" r="8" fill="#ffd700" className={styles.lampGlow} />
          <circle cx="1.5" cy="5" r="6" fill="#ffffff" />
        </g>

        {/* Ground/Snow Base */}
        <rect x="0" y="230" width="400" height="70" fill="#ffffff" opacity="0.95" />
        <path
          d="M 0 230 Q 50 225, 100 230 T 200 230 T 300 230 T 400 230 L 400 300 L 0 300 Z"
          fill="#ffffff"
          opacity="0.9"
          className={styles.snowBase}
        />
      </svg>
    </div>
  );
}

export default ChristmasTownBackground;

