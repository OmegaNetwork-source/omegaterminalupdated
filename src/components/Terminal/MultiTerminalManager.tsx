"use client";

/**
 * MultiTerminalManager Component
 * Manages multiple terminal instances with a modular grid layout
 * Allows users to run different commands simultaneously in separate terminals
 */

import { useState, useCallback, useMemo } from "react";
import { TerminalInstance } from "./TerminalInstance";
import styles from "./MultiTerminalManager.module.css";

export interface TerminalInstanceData {
  id: string;
  title: string;
  gridArea?: string;
  isActive?: boolean;
}

const DEFAULT_TERMINALS: TerminalInstanceData[] = [
  {
    id: "terminal-1",
    title: "Terminal 1",
    gridArea: "1 / 1 / 2 / 2",
  },
];

export function MultiTerminalManager() {
  const [terminals, setTerminals] = useState<TerminalInstanceData[]>(DEFAULT_TERMINALS);
  const [layout, setLayout] = useState<"grid" | "split">("grid");

  const addTerminal = useCallback(() => {
    const newId = `terminal-${terminals.length + 1}`;
    const newTerminal: TerminalInstanceData = {
      id: newId,
      title: `Terminal ${terminals.length + 1}`,
      gridArea: undefined, // Will be auto-positioned
    };
    setTerminals((prev) => [...prev, newTerminal]);
  }, [terminals.length]);

  const removeTerminal = useCallback((id: string) => {
    if (terminals.length <= 1) {
      // Don't allow removing the last terminal
      return;
    }
    setTerminals((prev) => prev.filter((term) => term.id !== id));
  }, [terminals.length]);

  const updateTerminalTitle = useCallback((id: string, title: string) => {
    setTerminals((prev) =>
      prev.map((term) => (term.id === id ? { ...term, title } : term))
    );
  }, []);

  const updateTerminalGridArea = useCallback((id: string, gridArea: string) => {
    setTerminals((prev) =>
      prev.map((term) => (term.id === id ? { ...term, gridArea } : term))
    );
  }, []);

  // Calculate grid template based on terminal count
  const gridTemplate = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(terminals.length));
    const rows = Math.ceil(terminals.length / cols);
    return {
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
    };
  }, [terminals.length]);

  return (
    <div className={styles.container}>
      {/* Control Bar */}
      <div className={styles.controlBar}>
        <div className={styles.controlGroup}>
          <button
            className={styles.controlButton}
            onClick={addTerminal}
            title="Add New Terminal"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Terminal
          </button>
          <span className={styles.terminalCount}>
            {terminals.length} Terminal{terminals.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className={styles.controlGroup}>
          <button
            className={`${styles.controlButton} ${layout === "grid" ? styles.active : ""}`}
            onClick={() => setLayout("grid")}
            title="Grid Layout"
          >
            Grid
          </button>
          <button
            className={`${styles.controlButton} ${layout === "split" ? styles.active : ""}`}
            onClick={() => setLayout("split")}
            title="Split Layout"
          >
            Split
          </button>
        </div>
      </div>

      {/* Terminal Grid */}
      <div
        className={`${styles.terminalGrid} ${styles[layout]}`}
        style={layout === "grid" ? gridTemplate : undefined}
      >
        {terminals.map((terminal) => (
          <TerminalInstance
            key={terminal.id}
            id={terminal.id}
            title={terminal.title}
            gridArea={terminal.gridArea}
            onRemove={removeTerminal}
            onTitleChange={updateTerminalTitle}
            onGridAreaChange={updateTerminalGridArea}
            canRemove={terminals.length > 1}
            executor={undefined}
          />
        ))}
      </div>
    </div>
  );
}

