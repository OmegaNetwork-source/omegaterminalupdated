"use client";

import { useContext } from "react";
import { ViewModeContext } from "@/providers/ViewModeProvider";
import type { ViewModeContextValue } from "@/types/ui";

/**
 * useViewMode
 * Hook to access the view mode context (basic | futuristic).
 * Must be used within a ViewModeProvider.
 *
 * @returns ViewModeContextValue with viewMode, setViewMode, toggleViewMode, isBasicMode, isFuturisticMode
 *
 * @example
 * const { viewMode, toggleViewMode } = useViewMode();
 * if (viewMode === 'basic') toggleViewMode();
 */
export function useViewMode(): ViewModeContextValue {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return ctx;
}

export default useViewMode;
