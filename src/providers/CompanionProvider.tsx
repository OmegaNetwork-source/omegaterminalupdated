"use client";

/**
 * Companion Provider
 *
 * Manages the AI companion panel state and chat functionality.
 * Integrates with ChainGPT, OpenAI, and NEAR AI for chat responses.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  provider?: "chaingpt" | "openai" | "near";
}

interface CompanionContextValue {
  isPanelOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  openPanel: () => void;
  closePanel: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

// ============================================================================
// Context
// ============================================================================

const CompanionContext = createContext<CompanionContextValue | undefined>(
  undefined
);

// ============================================================================
// Provider Component
// ============================================================================

export function CompanionProvider({ children }: { children: ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
    // Load chat history from localStorage
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("companion-chat-history");
        if (saved) {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
        }
      } catch (error) {
        console.error("[Companion] Failed to load chat history:", error);
      }
    }
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    // Save chat history to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("companion-chat-history", JSON.stringify(messages));
      } catch (error) {
        console.error("[Companion] Failed to save chat history:", error);
      }
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("companion-chat-history");
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Use the same AI endpoint that works when AI dropdown is set to OpenAI
      const url = process.env.NEXT_PUBLIC_AI_CHAT_URL || "https://ai.omeganetwork.co/chat";
      
      console.log("[Companion] Calling AI endpoint:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message.trim(),
          provider: "openai", // Use OpenAI provider (same as when dropdown is set to OpenAI)
          chatHistory: [], // Start fresh for companion
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const textResponse = await response.text();
        console.error("[Companion] Failed to parse JSON response. Raw response:", textResponse.substring(0, 500));
        throw new Error(`Invalid JSON response from AI endpoint. Server returned: ${textResponse.substring(0, 200)}`);
      }

      // Handle different response structures (same as callAI function in basic.ts)
      let answer = "";
      
      // Check for success flag first
      if (data.success === false) {
        throw new Error(data.error || "AI request failed");
      }
      
      // Primary: Check data.data structure (most common)
      if (data && data.data) {
        const d = data.data;
        
        // IMPORTANT: Check additionalInfo first (this is the actual AI response)
        if (d.additionalInfo && typeof d.additionalInfo === "string" && d.additionalInfo.trim()) {
          answer = d.additionalInfo.trim();
        } else if (d.answer && typeof d.answer === "string" && d.answer.trim()) {
          answer = d.answer.trim();
        } else if (d.bot && typeof d.bot === "string" && d.bot.trim()) {
          answer = d.bot.trim();
        } else if (d.response && typeof d.response === "string" && d.response.trim()) {
          answer = d.response.trim();
        } else if (d.message && typeof d.message === "string" && d.message.trim()) {
          answer = d.message.trim();
        }
      }
      
      // Fallback: Check top-level properties (but ignore top-level "message" as it's just a status)
      if (!answer) {
        if (data.answer && typeof data.answer === "string" && data.answer.trim()) {
          answer = data.answer.trim();
        } else if (data.bot && typeof data.bot === "string" && data.bot.trim()) {
          answer = data.bot.trim();
        } else if (data.response && typeof data.response === "string" && data.response.trim()) {
          answer = data.response.trim();
        } else if (typeof data === "string" && data.trim()) {
          answer = data.trim();
        }
        // NOTE: We intentionally skip data.message at top level as it's usually just a status message
      }
      
      // If still no answer, log and throw
      if (!answer || answer.trim() === "") {
        console.error("[Companion] Could not extract answer from response. Full response:", JSON.stringify(data, null, 2));
        throw new Error(`Could not extract answer from AI response. Response structure: ${Object.keys(data || {}).join(", ")}`);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answer,
        timestamp: Date.now(),
        provider: "openai",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("[Companion] Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: error instanceof Error 
          ? `Error: ${error.message}` 
          : "I'm sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: CompanionContextValue = {
    isPanelOpen,
    messages,
    isLoading,
    error,
    openPanel,
    closePanel,
    sendMessage,
    clearChat,
  };

  return (
    <CompanionContext.Provider value={value}>{children}</CompanionContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useCompanion() {
  const context = useContext(CompanionContext);
  if (context === undefined) {
    throw new Error("useCompanion must be used within a CompanionProvider");
  }
  return context;
}

