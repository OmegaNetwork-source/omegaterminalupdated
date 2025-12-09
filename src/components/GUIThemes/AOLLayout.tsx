"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCommandExecution } from "@/hooks/useCommandExecution";
import { useGUITheme } from "@/hooks/useGUITheme";
import styles from "./AOLLayout.module.css";

interface AOLMsg {
  sender: string;
  text: string;
}

export function AOLLayout(): JSX.Element {
  const { executeCommand, terminalLines } = useCommandExecution();
  const { setGUITheme } = useGUITheme();
  const [messages, setMessages] = useState<AOLMsg[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const latest = terminalLines.slice(-1)[0];
    if (latest && latest.type !== "command") {
      setMessages((prev) => [
        ...prev,
        { sender: "Omega", text: latest.htmlContent || latest.content },
      ]);
    }
  }, [terminalLines]);

  const handleSend = async (): Promise<void> => {
    const text = inputValue.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { sender: "You", text }]);
    setInputValue("");
    await executeCommand(text);
  };

  const handleBack = (): void => setGUITheme("terminal");

  const handleBuddy = (cmd: string): void => {
    void executeCommand(cmd);
  };

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <div className={styles.titleBar}>
          <div>Omega Terminal - AOL Instant Messenger</div>
          <button className={styles.close} onClick={handleBack}>
            X
          </button>
        </div>
        <div className={styles.content}>
          <aside className={styles.buddyList}>
            <div className={styles.sectionHeader}>Online</div>
            <div className={styles.buddy}>OmegaUser</div>
            <div className={styles.sectionHeader}>Commands</div>
            <button
              className={styles.buddy}
              onClick={() => handleBuddy("help")}
            >
              help
            </button>
            <button
              className={styles.buddy}
              onClick={() => handleBuddy("balance")}
            >
              balance
            </button>
            <button
              className={styles.buddy}
              onClick={() => handleBuddy("mine")}
            >
              mine
            </button>
            <button
              className={styles.buddy}
              onClick={() => handleBuddy("faucet")}
            >
              faucet
            </button>
          </aside>
          <section className={styles.chat}>
            <div className={styles.messages} ref={listRef}>
              {messages.map((m, i) => (
                <div key={`${i}-${m.sender}`} className={styles.message}>
                  <strong>{m.sender}:</strong> {m.text}
                </div>
              ))}
            </div>
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className={styles.send} onClick={handleSend}>
                Send
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AOLLayout;
