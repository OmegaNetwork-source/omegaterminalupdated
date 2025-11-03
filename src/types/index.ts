/**
 * Omega Terminal - TypeScript Type Definitions
 * Central type definitions for the application
 * This is the main types barrel file for convenient imports
 */

/**
 * AI Provider type for AI-powered features
 * Controls which AI backend is used for command processing
 */
export type AIProvider = "off" | "near" | "openai";

/**
 * Connection status for wallet and network connections
 * Tracks the current state of blockchain connections
 */
export type ConnectionStatus = "connected" | "disconnected" | "connecting";

/**
 * Terminal tab interface for multi-tab support
 * Each tab represents an independent terminal session
 */
export interface TerminalTab {
  /** Unique identifier for the tab */
  id: string;
  /** Display title of the tab */
  title: string;
  /** Whether this tab is currently active */
  active: boolean;
}

/**
 * Boot animation state interface
 * Controls the display and progress of the boot animation
 */
export interface BootAnimationState {
  /** Whether the boot animation is currently visible */
  isVisible: boolean;
  /** Progress percentage (0-100) of the boot animation */
  progress: number;
}

/**
 * Feature badge for boot animation
 * Displays key features during the boot sequence
 */
export interface FeatureBadge {
  /** Emoji icon for the feature */
  emoji: string;
  /** Display label for the feature */
  label: string;
}

// Re-export types from other type definition files
export * from "./config";
export * from "./utils";
export * from "./theme";
export * from "./terminal";
export * from "./wallet";
export * from "./commands";
export * from "./multichain";
export * from "./api";
export * from "./nft";
export * from "./chaingpt";
export * from "./media";
export * from "./games";
export * from "./mixer";
export * from "./referral";
export * from "./kalshi";
export * from "./profile";
export * from "./ui";
export * from "./sound";
