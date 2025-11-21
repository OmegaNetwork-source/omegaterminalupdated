"use client";

import { useCallback } from "react";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import styles from "./QuickCommandChips.module.css";

interface QuickCommandChipsProps {
  onCommandClick: (command: string) => void;
}

const COMMON_COMMANDS = [
  { label: "help", command: "help" },
  { label: "wallet", command: "wallet" },
  { label: "markets", command: "markets" },
  { label: "clear", command: "clear" },
  { label: "connect", command: "connect" },
  { label: "games", command: "games" },
];

/**
 * QuickCommandChips Component
 * Horizontal scrollable chips for quick command access on mobile
 * Based on mobile UI optimization guide recommendations
 */
export function QuickCommandChips({ onCommandClick }: QuickCommandChipsProps) {
  const mobile = useMobileDetection();

  const handleCommandClick = useCallback(
    (command: string) => {
      onCommandClick(command);
    },
    [onCommandClick]
  );

  if (!mobile.isMobile) {
    return null;
  }

  return (
    <div className={styles.chipsContainer}>
      <div className={styles.chipsScroll}>
        {COMMON_COMMANDS.map((cmd) => (
          <button
            key={cmd.command}
            className={styles.chip}
            onClick={() => handleCommandClick(cmd.command)}
            type="button"
            aria-label={`Execute ${cmd.label} command`}
          >
            {cmd.label}
          </button>
        ))}
      </div>
    </div>
  );
}

