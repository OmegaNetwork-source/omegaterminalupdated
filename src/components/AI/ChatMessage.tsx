"use client";

/**
 * ChatMessage Component
 *
 * Displays a single chat message in AI conversation UI
 * Note: This component is for future Phase 15 (futuristic UI) integration
 * Phase 11 uses HTML output via context.logHtml for AI responses
 *
 * Features:
 * - Role-based styling (user vs assistant)
 * - Avatar/icon display
 * - Timestamp formatting
 * - Streaming indicator animation
 * - Responsive design
 */

import React, { useEffect, useState } from "react";
import styles from "./ChatMessage.module.css";

export interface ChatMessageProps {
  /** Role of the message sender */
  role: "user" | "assistant";
  /** Message content */
  content: string;
  /** Message timestamp (Unix timestamp in ms) */
  timestamp: number;
  /** Whether the message is currently streaming */
  isStreaming?: boolean;
}

/**
 * Format timestamp as relative time
 */
function formatRelativeTime(reference: number, timestamp: number): string {
  const diff = Math.max(0, reference - timestamp);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * ChatMessage Component
 */
export function ChatMessage({
  role,
  content,
  timestamp,
  isStreaming = false,
}: ChatMessageProps) {
  const [referenceTime, setReferenceTime] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => setReferenceTime(Date.now());
    updateTime();
    const interval = setInterval(updateTime, 60_000);
    return () => clearInterval(interval);
  }, []);

  const containerClass = `${styles.container} ${
    role === "user" ? styles.containerUser : styles.containerAssistant
  }`;

  const avatarClass = `${styles.avatar} ${
    role === "user" ? styles.avatarUser : styles.avatarAssistant
  }`;

  const bubbleClass = `${styles.bubble} ${
    role === "user" ? styles.bubbleUser : styles.bubbleAssistant
  }`;

  const avatarEmoji = role === "user" ? "👤" : "🤖";

  return (
    <div className={containerClass}>
      <div className={avatarClass}>{avatarEmoji}</div>
      <div>
        <div className={bubbleClass}>
          <div className={styles.content}>{content}</div>
          {isStreaming && (
            <div className={styles.streamingIndicator}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
          )}
        </div>
        <div className={styles.timestamp}>
          {formatRelativeTime(referenceTime || timestamp, timestamp)}
        </div>
      </div>
    </div>
  );
}
