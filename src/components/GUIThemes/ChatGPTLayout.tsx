"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCommandExecution } from "@/hooks/useCommandExecution";
import { useGUITheme } from "@/hooks/useGUITheme";
import styles from "./ChatGPTLayout.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * ChatGPTLayout
 * Chat-style interface that proxies terminal commands through chat input.
 */
export function ChatGPTLayout(): JSX.Element {
  const { executeCommand, terminalLines } = useCommandExecution();
  const { setGUITheme } = useGUITheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const convoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "Welcome to Omega Chat. Type a command or ask for 'help'.",
      },
    ]);
  }, []);

  useEffect(() => {
    // Convert new terminal lines to assistant messages (simple mapping)
    const latest = terminalLines.slice(-1)[0];
    if (latest && latest.type !== "command") {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: latest.htmlContent || latest.content },
      ]);
    }
  }, [terminalLines]);

  useEffect(() => {
    if (convoRef.current) {
      convoRef.current.scrollTop = convoRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (): Promise<void> => {
    const text = inputValue.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInputValue("");
    await executeCommand(text);
  };

  const handleBack = (): void => setGUITheme("terminal");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          ← Terminal
        </button>
      </div>
      <div className={styles.conversation} ref={convoRef}>
        <div className={styles.welcomeMessage}>
          <div className={styles.welcomeIcon}>Ω</div>
          <h2 className={styles.welcomeTitle}>Omega Chat</h2>
          <div className={styles.welcomeSubtitle}>
            Chat-driven terminal interface
          </div>
        </div>
        {messages.map((m, i) => (
          <div
            key={`${i}-${m.role}`}
            className={`${styles.message} ${
              m.role === "user" ? styles.messageUser : ""
            }`}
          >
            <div
              className={`${styles.avatar} ${
                m.role === "user" ? styles.avatarUser : styles.avatarAssistant
              }`}
            >
              {m.role === "user" ? "U" : "Ω"}
            </div>
            <div className={styles.messageContent}>{m.content}</div>
          </div>
        ))}
      </div>
      <div className={styles.inputSection}>
        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>＋</div>
            <input
              className={styles.input}
              placeholder="Ask anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <div className={styles.inputActions}>
              <button className={styles.sendButton} onClick={handleSend}>
                ➤
              </button>
            </div>
          </div>
          <div className={styles.disclaimer}>
            Omega Terminal can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatGPTLayout;
