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
  retro: "Retro - Deep void terminal with vibrant accents",
  neo: "Neo Matrix - Digital rain with cyberpunk green glow",
  elite: "Elite Prestige - Luxury gold and premium serif typography",
  modern: "Modern Cyber - Futuristic glassmorphism with electric neon",
  crt: "CRT Terminal - Classic green-on-black with glassmorphism text effects",
  cosmic: "Cosmic - Deep space nebula with stellar purple and blue gradients",
  gio: "Gio - Vibrant pride theme with unicorn cursor and rainbow effects",
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
  // Map new theme names to CSS classes
  const themeClassMap: Record<Theme, string[]> = {
    retro: ["theme-dark"], // Uses existing dark theme CSS
    neo: ["theme-matrix"], // Uses existing matrix theme CSS
    elite: ["theme-executive"], // Uses existing executive theme CSS
    modern: ["modern-ui-futuristic", "modern-terminal-ui"], // Uses existing modern theme CSS
    crt: ["theme-crt"], // New CRT theme with glassmorphism
    cosmic: ["theme-cosmic"], // Cosmic space nebula theme
    gio: ["theme-gio"], // Gio pride theme with unicorn cursor
  };

  return themeClassMap[theme] || [`theme-${theme}`];
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
