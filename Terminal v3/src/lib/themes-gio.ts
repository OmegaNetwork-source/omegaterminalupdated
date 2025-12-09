/**
 * Gio Theme Configuration
 * A vibrant pride-themed theme with unicorn cursor and rainbow effects
 * Created as a separate file to avoid conflicts with existing themes
 */

import type { Theme } from "@/types";

/**
 * Gio theme description
 */
export const GIO_THEME_DESCRIPTION = "Gio - Vibrant pride theme with unicorn cursor and rainbow effects";

/**
 * Get CSS class names for the Gio theme
 */
export function getGioThemeClassNames(): string[] {
  return ["theme-gio"];
}

/**
 * Check if Gio theme is valid
 */
export function isValidGioTheme(theme: string): boolean {
  return theme === "gio";
}

