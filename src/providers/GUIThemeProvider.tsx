"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { GUITheme, GUIThemeContextValue } from "@/types/ui";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const GUI_THEME_STORAGE_KEY = "omega-gui-style";

/**
 * React context for GUI theme transformations.
 */
export const GUIThemeContext = createContext<GUIThemeContextValue | undefined>(
  undefined
);

const GUI_CLASS_PREFIX = "gui-";
const ALL_GUI_CLASSES = [
  "gui-chatgpt",
  "gui-aol",
  "gui-discord",
  "gui-windows95",
  "gui-limewire",
];

/**
 * Provider for GUI theme switching. Applies body classes and persists theme.
 */
export function GUIThemeProvider({ children }: { children: React.ReactNode }) {
  const [guiTheme, setGuiThemeState] = useState<GUITheme>("terminal");
  const soundEffects = useSoundEffects();

  const applyBodyClass = useCallback((theme: GUITheme): void => {
    if (typeof document === "undefined") return;
    const body = document.body;
    // Remove any existing gui-* classes
    ALL_GUI_CLASSES.forEach((cls) => body.classList.remove(cls));
    if (theme !== "terminal") {
      body.classList.add(`${GUI_CLASS_PREFIX}${theme}`);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(
        GUI_THEME_STORAGE_KEY
      ) as GUITheme | null;
      const initial: GUITheme =
        saved &&
        [
          "terminal",
          "chatgpt",
          "aol",
          "discord",
          "windows95",
          "limewire",
        ].includes(saved)
          ? saved
          : "terminal";
      setGuiThemeState(initial);
      applyBodyClass(initial);
    } catch {
      setGuiThemeState("terminal");
      applyBodyClass("terminal");
    }
  }, [applyBodyClass]);

  const setGUITheme = useCallback(
    (theme: GUITheme): void => {
      const valid: GUITheme[] = [
        "terminal",
        "chatgpt",
        "aol",
        "discord",
        "windows95",
        "limewire",
      ];
      const next: GUITheme = valid.includes(theme) ? theme : "terminal";
      setGuiThemeState(next);
      try {
        localStorage.setItem(GUI_THEME_STORAGE_KEY, next);
      } catch {}
      applyBodyClass(next);
      // eslint-disable-next-line no-console
      console.log(`[Omega] GUI theme set to: ${next}`);

      // Play interface selection sound for non-terminal GUI themes
      if (next !== "terminal") {
        try {
          soundEffects.playSound("interface-select");
        } catch {}
      }
    },
    [applyBodyClass, soundEffects]
  );

  const isTerminalMode = guiTheme === "terminal";

  const value: GUIThemeContextValue = {
    guiTheme,
    setGUITheme,
    isTerminalMode,
  };

  return (
    <GUIThemeContext.Provider value={value}>
      {children}
    </GUIThemeContext.Provider>
  );
}

/**
 * Hook to consume GUI theme context.
 */
export function useGUIThemeContext(): GUIThemeContextValue {
  const ctx = useContext(GUIThemeContext);
  if (!ctx) {
    throw new Error(
      "useGUIThemeContext must be used within a GUIThemeProvider"
    );
  }
  return ctx;
}

export default GUIThemeProvider;
