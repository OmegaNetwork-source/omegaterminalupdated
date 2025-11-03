"use client";

import { useContext } from "react";
import { GUIThemeContext } from "@/providers/GUIThemeProvider";
import type { GUIThemeContextValue } from "@/types/ui";

/**
 * useGUITheme
 * Hook to access GUI theme transformation context.
 * Must be used within a GUIThemeProvider.
 *
 * @returns GUIThemeContextValue with guiTheme, setGUITheme, isTerminalMode
 */
export function useGUITheme(): GUIThemeContextValue {
  const ctx = useContext(GUIThemeContext);
  if (!ctx) {
    throw new Error("useGUITheme must be used within a GUIThemeProvider");
  }
  return ctx;
}

export default useGUITheme;
