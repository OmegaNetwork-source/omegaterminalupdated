"use client";

/**
 * useTerminalMode Hook
 * Manages single vs multi-terminal mode state
 */

import { useState, useEffect, useCallback } from "react";

export type TerminalMode = "single" | "multi";

const STORAGE_KEY = "omega-terminal-mode";

export function useTerminalMode() {
  const [mode, setMode] = useState<TerminalMode>("single");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load mode from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "multi" || saved === "single") {
        setMode(saved);
      }
    } catch (error) {
      console.error("Failed to load terminal mode:", error);
    }
    setIsHydrated(true);
  }, []);

  // Save mode to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch (error) {
        console.error("Failed to save terminal mode:", error);
      }
    }
  }, [mode, isHydrated]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "single" ? "multi" : "single"));
  }, []);

  const setTerminalMode = useCallback((newMode: TerminalMode) => {
    setMode(newMode);
  }, []);

  return {
    mode,
    isMultiMode: mode === "multi",
    isSingleMode: mode === "single",
    toggleMode,
    setTerminalMode,
    isHydrated,
  };
}

