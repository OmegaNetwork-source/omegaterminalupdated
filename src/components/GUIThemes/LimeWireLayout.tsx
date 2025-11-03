"use client";

import React, { useEffect, useState } from "react";
import { useCommandExecution } from "@/hooks/useCommandExecution";
import { useGUITheme } from "@/hooks/useGUITheme";
import styles from "./LimeWireLayout.module.css";

interface ResultItem {
  name: string;
  size: string;
  type: string;
}

export function LimeWireLayout(): JSX.Element {
  const { executeCommand, terminalLines } = useCommandExecution();
  const { setGUITheme } = useGUITheme();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [query, setQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("Search");

  useEffect(() => {
    const latest = terminalLines.slice(-1)[0];
    if (!latest || latest.type === "command") return;
    setResults((prev) => [
      ...prev,
      { name: latest.content || "Command Output", size: "—", type: "terminal" },
    ]);
  }, [terminalLines]);

  const handleSearch = async (): Promise<void> => {
    const text = query.trim();
    if (!text) return;
    await executeCommand(text);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>🔥 Omega Terminal - P2P Network</div>
        <button className={styles.exit} onClick={() => setGUITheme("terminal")}>
          Exit
        </button>
      </div>
      <div className={styles.tabs}>
        {["Search", "Monitor", "Library", "Connections"].map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${activeTab === t ? styles.active : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className={styles.searchSection}>
        <input
          className={styles.search}
          placeholder="Type a command to search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className={styles.searchBtn} onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className={styles.results}>
        <div className={styles.resultsHeader}>Network Commands Available:</div>
        {results.map((r, i) => (
          <div key={`${i}-${r.name}`} className={styles.result}>
            <div className={styles.fileName}>{r.name}</div>
            <div className={styles.fileMeta}>
              {r.type} • {r.size}
            </div>
            <button
              className={styles.exec}
              onClick={() => void executeCommand(r.name)}
            >
              Execute
            </button>
          </div>
        ))}
      </div>
      <div className={styles.status}>
        Connected to Omega Network | Terminal Commands Active
      </div>
    </div>
  );
}

export default LimeWireLayout;
