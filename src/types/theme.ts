/**
 * Theme System Type Definitions
 * Type definitions for the theme management system
 */

import { ReactNode } from "react";

/**
 * Theme type representing available terminal themes
 * Used throughout the application for theme switching
 */
export type Theme =
  | "dark"
  | "light"
  | "matrix"
  | "retro"
  | "powershell"
  | "executive"
  | "modern";

/**
 * Theme context value providing theme state and methods
 */
export interface ThemeContextValue {
  /** Current active theme */
  currentTheme: Theme;
  /** Set a specific theme */
  setTheme: (theme: Theme, silent?: boolean) => void;
  /** Toggle to next theme in cycle */
  toggleTheme: () => Theme;
  /** Get descriptions for all available themes */
  getThemeDescriptions: () => Record<Theme, string>;
}

/**
 * Props for the ThemeProvider component
 */
export interface ThemeProviderProps {
  /** Child components to wrap with theme context */
  children: ReactNode;
  /** Optional initial theme (defaults to 'dark') */
  initialTheme?: Theme;
}
