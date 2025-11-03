"use client";

/**
 * ThemeProvider Component
 * React Context provider for managing theme state across the application
 * Handles theme switching, localStorage persistence, and CSS class management
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ThemeContextValue, ThemeProviderProps } from "@/types/theme";
import { Theme } from "@/types/index";
import {
  THEME_DESCRIPTIONS,
  getThemeClassNames,
  isValidTheme,
  THEME_STORAGE_KEY,
} from "@/lib/themes";
import { AVAILABLE_THEMES } from "@/lib/constants";
import { useSoundEffects } from "@/hooks/useSoundEffects";

/**
 * Theme context for providing theme state and methods to child components
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ThemeProvider component that wraps the application to provide theme context
 * Must be used on the client side only (uses localStorage and document APIs)
 *
 * @param props - Component props with children and optional initialTheme
 * @returns Provider component wrapping children with theme context
 *
 * @example
 * <ThemeProvider initialTheme="dark">
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({
  children,
  initialTheme = "dark",
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(initialTheme);
  const soundEffects = useSoundEffects();

  /**
   * Load saved theme from localStorage on mount
   * Applies theme classes to document.body
   */
  useEffect(() => {
    // Client-side only
    if (typeof window === "undefined") return;

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && isValidTheme(savedTheme)) {
      setCurrentTheme(savedTheme);
      applyThemeClasses(savedTheme);
    } else {
      applyThemeClasses(currentTheme);
    }
  }, []);

  /**
   * Apply theme CSS classes to document.body and terminal element
   * @param theme - Theme to apply
   */
  const applyThemeClasses = useCallback((theme: Theme) => {
    if (typeof document === "undefined") return;

    // Remove all existing theme classes from body
    document.body.classList.remove(
      ...AVAILABLE_THEMES.map((t) => `theme-${t}`),
      "modern-ui-futuristic",
      "modern-terminal-ui",
      "apple-ui"
    );

    // Remove theme classes from terminal element if it exists
    const terminal = document.getElementById("terminal");
    if (terminal) {
      terminal.classList.remove(
        ...AVAILABLE_THEMES.map((t) => `theme-${t}`),
        "modern-ui",
        "futuristic-theme",
        "apple-ui"
      );
    }

    // Add new theme classes
    const themeClasses = getThemeClassNames(theme);
    document.body.classList.add(...themeClasses);

    // Add special classes for modern theme to terminal element
    if (theme === "modern" && terminal) {
      terminal.classList.add("modern-ui", "futuristic-theme");
    } else if (terminal) {
      terminal.classList.add(`theme-${theme}`);
    }
  }, []);

  /**
   * Set a specific theme
   * @param theme - Theme to set
   * @param silent - If true, suppress console logging (default: false)
   */
  const setTheme = useCallback(
    (theme: Theme, silent: boolean = false) => {
      // Validate theme
      if (!isValidTheme(theme)) {
        console.warn(
          `Theme "${theme}" not found. Available themes:`,
          AVAILABLE_THEMES
        );
        return;
      }

      // Apply theme classes
      applyThemeClasses(theme);

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      }

      // Update state
      setCurrentTheme(theme);

      // Log theme change
      if (!silent) {
        console.log(`Theme set to ${theme} mode`);
      }

      // Play sound for modern UI theme selection (non-blocking)
      if (theme === "modern") {
        try {
          soundEffects.playModernUIThemeSound();
        } catch {}
      }
    },
    [applyThemeClasses, soundEffects]
  );

  /**
   * Toggle to the next theme in the cycle
   * @returns The new theme name
   */
  const toggleTheme = useCallback((): Theme => {
    const currentIndex = AVAILABLE_THEMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
    const nextTheme = AVAILABLE_THEMES[nextIndex] as Theme;
    setTheme(nextTheme, true);
    return nextTheme;
  }, [currentTheme, setTheme]);

  /**
   * Get descriptions for all available themes
   * @returns Record mapping theme names to descriptions
   */
  const getThemeDescriptions = useCallback(() => {
    return THEME_DESCRIPTIONS;
  }, []);

  // Context value
  const value: ThemeContextValue = {
    currentTheme,
    setTheme,
    toggleTheme,
    getThemeDescriptions,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export { ThemeContext };
