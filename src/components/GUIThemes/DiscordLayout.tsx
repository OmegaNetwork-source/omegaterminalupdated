"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCommandExecution } from "@/hooks/useCommandExecution";
import { useGUITheme } from "@/hooks/useGUITheme";
import styles from "./DiscordLayout.module.css";

interface DiscordMsg {
  channel: string;
  author: string;
  text: string;
}

export function DiscordLayout(): JSX.Element {
  const { executeCommand, terminalLines } = useCommandExecution();
  const { setGUITheme } = useGUITheme();
  const [activeChannel, setActiveChannel] = useState<string>("terminal");
  const [messages, setMessages] = useState<DiscordMsg[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const latest = terminalLines.slice(-1)[0];
    if (latest && latest.type !== "command") {
      setMessages((prev) => [
        ...prev,
        {
          channel: activeChannel,
          author: "Omega",
          text: latest.htmlContent || latest.content,
        },
      ]);
    }
  }, [activeChannel, terminalLines]);

  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const [inputValue, setInputValue] = useState("");
  const handleSend = async (): Promise<void> => {
    const text = inputValue.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { channel: activeChannel, author: "You", text },
    ]);
    setInputValue("");
    await executeCommand(text);
  };

  const handleBack = (): void => setGUITheme("terminal");

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.server}>Ω</div>
        <div className={styles.channelsHeader}>OMEGA CHANNELS</div>
        {["terminal", "mining", "trading", "general"].map((ch) => (
          <button
            key={ch}
            className={`${styles.channel} ${
              activeChannel === ch ? styles.active : ""
            }`}
            onClick={() => setActiveChannel(ch)}
          >
            #{ch}
          </button>
        ))}
        <button className={styles.exit} onClick={handleBack}>
          Exit Discord
        </button>
      </aside>
      <main className={styles.main}>
        <div className={styles.header}># {activeChannel}</div>
        <div className={styles.messages} ref={listRef}>
          {messages
            .filter((m) => m.channel === activeChannel)
            .map((m, i) => (
              <div key={`${i}-${m.text}`} className={styles.message}>
                <strong>{m.author}</strong>: {m.text}
              </div>
            ))}
        </div>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Message #${activeChannel}`}
          />
          <button className={styles.send} onClick={handleSend}>
            Send
          </button>
        </div>
      </main>
    </div>
  );
}

export default DiscordLayout;
