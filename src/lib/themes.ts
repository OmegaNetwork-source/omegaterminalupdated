/**
 * Omega Terminal - Theme Configuration
 * Theme management utilities and configuration
 * Provides theme descriptions, class name mapping, and validation
 */

import type { Theme } from "@/types";
import { AVAILABLE_THEMES } from "@/lib/constants";

/**
 * Theme descriptions for UI display
 * Maps each theme to a human-readable description
 */
export const THEME_DESCRIPTIONS: Record<Theme, string> = {
  dark: "Default dark terminal theme",
  light: "Light mode with dark text on light background",
  matrix: "Green-on-black Matrix movie style",
  retro: "Retro amber terminal style",
  powershell: "Windows PowerShell blue theme",
  executive: "⭐ Premium professional theme with gold accents",
  modern: "🎨 Modern UI with sleek design and glass morphism",
};

/**
 * Get CSS class names to apply for a given theme
 * Returns array of class names that should be applied to the body element
 *
 * @param theme - The theme to get class names for
 * @returns Array of CSS class names
 *
 * @example
 * ```typescript
 * const classes = getThemeClassNames('dark');
 * // Returns: ['theme-dark']
 *
 * const modernClasses = getThemeClassNames('modern');
 * // Returns: ['modern-ui-futuristic', 'modern-terminal-ui']
 * ```
 */
export function getThemeClassNames(theme: Theme): string[] {
  if (theme === "dark") {
    return ["theme-dark"];
  }

  if (theme === "modern") {
    return ["modern-ui-futuristic", "modern-terminal-ui"];
  }

  return [`theme-${theme}`];
}

/**
 * Type guard to check if a string is a valid theme
 * Used for runtime validation of theme values from localStorage or API
 *
 * @param theme - String value to check
 * @returns True if the string is a valid Theme type
 *
 * @example
 * ```typescript
 * const userTheme = localStorage.getItem('theme');
 * if (isValidTheme(userTheme)) {
 *   setTheme(userTheme);
 * }
 * ```
 */
export function isValidTheme(theme: string): theme is Theme {
  return AVAILABLE_THEMES.includes(theme as Theme);
}

/**
 * LocalStorage key for theme persistence
 * Used to save and load user's theme preference
 */
export const THEME_STORAGE_KEY = "omega-terminal-theme";
