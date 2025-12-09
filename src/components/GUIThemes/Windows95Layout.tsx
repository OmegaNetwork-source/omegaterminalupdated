"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCommandExecution } from "@/hooks/useCommandExecution";
import { useGUITheme } from "@/hooks/useGUITheme";
import styles from "./Windows95Layout.module.css";

export function Windows95Layout(): JSX.Element {
  const { executeCommand, terminalLines } = useCommandExecution();
  const { setGUITheme } = useGUITheme();
  const [lines, setLines] = useState<string[]>([
    "Microsoft(R) Windows 95",
    "(C)Copyright Microsoft Corp 1981-1995.",
  ]);
  const [input, setInput] = useState<string>("");
  const outRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const latest = terminalLines.slice(-1)[0];
    if (latest && latest.type !== "command") {
      setLines((prev) => [...prev, latest.htmlContent || latest.content]);
    }
  }, [terminalLines]);

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [lines]);

  const handleSend = async (): Promise<void> => {
    const text = input.trim();
    if (!text) return;
    setLines((prev) => [...prev, `C:\\OMEGA> ${text}`]);
    setInput("");
    await executeCommand(text);
  };

  return (
    <div className={styles.desktop}>
      <div className={styles.window}>
        <div className={styles.titleBar}>
          <div>Omega Terminal - MS-DOS Prompt</div>
          <button
            className={styles.close}
            onClick={() => setGUITheme("terminal")}
          >
            X
          </button>
        </div>
        <div className={styles.menuBar}>File Edit View Help</div>
        <div className={styles.content}>
          <div className={styles.output} ref={outRef}>
            {lines.map((l, i) => (
              <div key={`${i}-${l}`}>{l}</div>
            ))}
          </div>
          <div className={styles.inputRow}>
            <span>C:\\OMEGA&gt; </span>
            <input
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
          </div>
        </div>
      </div>
      <div className={styles.taskbar}>
        <button className={styles.start}>Start</button>
        <div className={styles.taskItem}>Omega Terminal</div>
      </div>
    </div>
  );
}

export default Windows95Layout;
