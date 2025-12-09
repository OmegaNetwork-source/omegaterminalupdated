/**
 * Cosmic Theme Configuration
 * A new space-inspired theme with nebula colors and cosmic effects
 * Created as a separate file to avoid conflicts with existing themes
 */

import type { Theme } from "@/types";

/**
 * Cosmic theme description
 */
export const COSMIC_THEME_DESCRIPTION = "Cosmic - Deep space nebula with stellar purple and blue gradients";

/**
 * Get CSS class names for the cosmic theme
 */
export function getCosmicThemeClassNames(): string[] {
  return ["theme-cosmic"];
}

/**
 * Check if cosmic theme is valid
 */
export function isValidCosmicTheme(theme: string): boolean {
  return theme === "cosmic";
}

