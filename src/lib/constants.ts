/**
 * Omega Terminal - Application Constants
 * Central configuration and constant values for the application
 * These values are used throughout the application for consistency
 */

import type { Theme, AIProvider } from "@/types";

/**
 * Application version number
 * Displayed in boot animation and header
 */
export const APP_VERSION = "3.0.0";

/**
 * Application title - short form
 * Used in header and tab titles
 */
export const APP_TITLE = "OMEGA TERMINAL";

/**
 * Application full title with version
 * Used in boot animation and page metadata
 */
export const APP_FULL_TITLE =
  "OMEGA TERMINAL - CLASSIFIED ACCESS SYSTEM v3.0.0";

/**
 * Application description
 * Used in metadata and documentation
 */
export const APP_DESCRIPTION =
  "Multi-Chain Web3 Terminal with ChainGPT Integration";

/**
 * Boot animation duration in milliseconds
 * Controls how long the loading screen is displayed
 */
export const BOOT_ANIMATION_DURATION = 2500;

/**
 * Terminal command prompt symbol
 * Displayed before user input
 */
export const TERMINAL_PROMPT = "Ω Terminal:~)" as const;

/**
 * Terminal input placeholder text
 * Shown when input is empty
 */
export const TERMINAL_PLACEHOLDER = "Enter command...";

/**
 * Social media and documentation links
 * Used in terminal header for quick access
 */
export const SOCIAL_LINKS = {
  website: "https://omeganetwork.co/landing",
  discord: "https://discord.com/invite/omeganetwork",
  twitter: "https://x.com/omega_netw0rk",
  docs: "https://omega-6.gitbook.io/omega/",
} as const;

/**
 * Default theme on first load
 * Can be overridden by localStorage
 */
export const DEFAULT_THEME: Theme = "retro";

/**
 * Default AI provider on first load
 * Can be changed by user through selector
 */
export const DEFAULT_AI_PROVIDER: AIProvider = "off";

/**
 * Available terminal themes
 * Each theme has corresponding CSS styles
 */
export const AVAILABLE_THEMES = [
  "retro",
  "neo",
  "elite",
  "modern",
] as const;

/**
 * Feature badges displayed during boot animation
 * Highlights key capabilities of the terminal
 */
export const FEATURE_BADGES = [
  { emoji: "🤖", label: "AI" },
  { emoji: "⚡", label: "Multi-Chain" },
  { emoji: "🎯", label: "Productivity" },
  { emoji: "🛡️", label: "Security" },
  { emoji: "🎨", label: "Themes" },
] as const;
