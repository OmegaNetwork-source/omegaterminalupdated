"use client";

/**
 * Companion Panel Component
 *
 * Renders the AI companion interface with interactive digital face and chat functionality.
 */

import React, { useState, useRef, useEffect } from "react";
import { useCompanion } from "@/hooks/useCompanion";
import { DigitalFace, type FaceExpression } from "@/components/AI";
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [faceExpression, setFaceExpression] = useState<FaceExpression>("matrix");
  const [currentSpeakingMessage, setCurrentSpeakingMessage] = useState("");
  const [speechIntensity, setSpeechIntensity] = useState(0.5);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessageCountRef = useRef(messages.length);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intensityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevErrorRef = useRef<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show surprised expression when error occurs
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      setFaceExpression("surprised");
      setIsSpeaking(false);
      
      // Return to matrix after 3 seconds
      const timeout = setTimeout(() => {
        setFaceExpression("matrix");
      }, 3000);
      
      prevErrorRef.current = error;
      return () => clearTimeout(timeout);
    } else if (!error) {
      prevErrorRef.current = null;
    }
  }, [error]);

  // Detect when AI responds and trigger speaking animation
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "assistant") {
        // AI just responded - trigger speaking animation
        setIsSpeaking(true);
        setFaceExpression("happy");
        setCurrentSpeakingMessage(lastMessage.content);
        
        // Calculate speech intensity based on message characteristics
        // - Longer messages = more varied intensity
        // - Questions (?) = higher intensity
        // - Exclamations (!) = highest intensity
        // - Short responses = lower intensity
        const content = lastMessage.content;
        let baseIntensity = 0.5;
        
        if (content.includes("!")) baseIntensity += 0.2;
        if (content.includes("?")) baseIntensity += 0.1;
        if (content.length > 200) baseIntensity += 0.15;
        if (content.length < 50) baseIntensity -= 0.1;
        if (content.toUpperCase() === content && content.length > 10) baseIntensity += 0.2; // All caps = excited
        
        baseIntensity = Math.max(0.3, Math.min(1, baseIntensity));
        setSpeechIntensity(baseIntensity);
        
        // Calculate speaking duration based on message length
        const speakDuration = Math.min(Math.max(content.length * 35, 2000), 10000);
        
        // Clear any existing timeouts/intervals
        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current);
        }
        if (intensityIntervalRef.current) {
          clearInterval(intensityIntervalRef.current);
        }
        
        // Vary intensity during speech for more natural feel
        let intensityTime = 0;
        intensityIntervalRef.current = setInterval(() => {
          intensityTime += 200;
          // Create natural variation in speech intensity
          const variation = Math.sin(intensityTime * 0.005) * 0.15 + Math.sin(intensityTime * 0.012) * 0.1;
          const punctuationBoost = (intensityTime % 2000 < 500) ? 0.1 : 0; // Periodic emphasis
          setSpeechIntensity(Math.max(0.3, Math.min(1, baseIntensity + variation + punctuationBoost)));
        }, 200);
        
        speakingTimeoutRef.current = setTimeout(() => {
          setIsSpeaking(false);
          setFaceExpression("matrix");
          setCurrentSpeakingMessage("");
          setSpeechIntensity(0.5);
          if (intensityIntervalRef.current) {
            clearInterval(intensityIntervalRef.current);
          }
        }, speakDuration);
      }
    }
    prevMessageCountRef.current = messages.length;

    return () => {
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
      if (intensityIntervalRef.current) {
        clearInterval(intensityIntervalRef.current);
      }
    };
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
        {/* Digital Face - Interactive AI Companion */}
        <div className={styles.faceContainer}>
          <DigitalFace
            isThinking={isLoading}
            isSpeaking={isSpeaking}
            expression={faceExpression}
            speechIntensity={speechIntensity}
            currentMessage={currentSpeakingMessage}
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

