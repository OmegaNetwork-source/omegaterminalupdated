"use client";

/**
 * Companion Panel Component
 *
 * Renders the AI companion interface with looping video and chat functionality.
 */

import React, { useState, useRef, useEffect } from "react";
import { useCompanion } from "@/hooks/useCompanion";
import styles from "./CompanionPanel.module.css";

interface CompanionPanelProps {
  mobile?: boolean;
}

export function CompanionPanel({ mobile = false }: CompanionPanelProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    closePanel,
  } = useCompanion();

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue("");
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleAIOff = () => {
    // Change AI provider to "off" and close companion panel
    if (typeof window !== "undefined") {
      // Set AI provider to "off" via global function
      (window as any).__omegaSetAIProvider?.("off");
    }
    closePanel();
  };

  return (
    <div className={`${styles.container} ${mobile ? styles.mobile : ""}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Companion</h2>
        <div className={styles.headerButtons}>
          <button
            className={styles.actionButton}
            onClick={clearChat}
            title="Clear chat history"
            type="button"
          >
            Clear
          </button>
          <button
            className={styles.actionButton}
            onClick={handleAIOff}
            title="Turn AI off and return to system overview"
            type="button"
          >
            AI Off
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Video Player */}
        <div className={styles.videoContainer}>
          <video
            className={styles.video}
            src="/videos/companion.mp4"
            autoPlay
            loop
            muted
            playsInline
            title="AI Companion Video"
            onError={(e) => {
              console.error("[Companion] Video error:", e);
              const video = e.currentTarget;
              console.error("[Companion] Video error details:", {
                error: video.error,
                networkState: video.networkState,
                readyState: video.readyState,
                src: video.src,
              });
            }}
            onLoadStart={() => {
              console.log("[Companion] Video load started");
            }}
            onLoadedData={() => {
              console.log("[Companion] Video data loaded");
            }}
            onCanPlay={() => {
              console.log("[Companion] Video can play");
            }}
          />
        </div>

        {/* Chat Messages - ONLY THIS AREA SCROLLS */}
        <div className={styles.messagesContainer}>
          {error && (
            <div className={styles.error}>
              ⚠️ {error}
            </div>
          )}
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Start a conversation with your AI companion!</p>
              <p className={styles.hint}>Ask questions, get help, or just chat.</p>
            </div>
          ) : (
            <div className={styles.messages}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles[message.role]}`}
                >
                  <div className={styles.messageContent}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.messageContent}>
                    <span className={styles.typingIndicator}>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <form className={styles.inputContainer} onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={styles.input}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

