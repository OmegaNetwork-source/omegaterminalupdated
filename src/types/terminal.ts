/**
 * Terminal Component Type Definitions
 * Type definitions for all terminal-related components and their props
 */

import type { AIProvider, ConnectionStatus, Theme } from "@/types/index";

/**
 * Terminal line interface
 * Represents a single line of output in the terminal
 */
export interface TerminalLine {
  /** Unique identifier for the line */
  id: string;
  /**
   * Type of line determines styling and icon
   * 'html' type lines should render htmlContent as dangerouslySetInnerHTML for rich formatting
   * (used for wallet export, private key display with buttons, etc.)
   */
  type:
    | "command"
    | "output"
    | "error"
    | "success"
    | "warning"
    | "info"
    | "html";
  /** Text content of the line */
  content: string;
  /** Unix timestamp when line was created */
  timestamp: number;
  /**
   * Optional HTML content for rich formatting when type is 'html'
   * Should be sanitized to prevent XSS attacks
   */
  htmlContent?: string;
}

/**
 * TerminalOutput component props
 * Displays terminal command history and output
 */
export interface TerminalOutputProps {
  /** Array of terminal lines to display */
  lines: TerminalLine[];
  /** Whether to auto-scroll to bottom on new lines */
  isScrolling: boolean;
}

/**
 * TerminalInput component props
 * Handles user command input with history and autocomplete
 */
export interface TerminalInputProps {
  /** Callback when user submits a command (Enter key) */
  onSubmit: (command: string) => void;
  /** Callback to get previous command from history (ArrowUp) */
  onHistoryUp: () => string | null;
  /** Callback to get next command from history (ArrowDown) */
  onHistoryDown: () => string | null;
  /** Callback to get autocomplete matches (Tab key) */
  onAutocomplete: (partial: string) => string[];
  /** Placeholder text for empty input (optional) */
  placeholder?: string;
  /** Whether input is disabled (optional) */
  disabled?: boolean;
}

/**
 * TerminalHeader component props
 * Displays terminal header with controls and status
 */
export interface TerminalHeaderProps {
  /** Callback when theme cycle button is clicked */
  onThemeCycle: () => void;
  /** Callback when palette cycle button is clicked */
  onPaletteCycle: () => void;
  /** Callback when light/dark toggle button is clicked */
  onLightDarkToggle: () => void;
  /** Callback when dashboard toggle button is clicked */
  onDashboardToggle: () => void;
  /** Current AI provider selection */
  aiProvider: AIProvider;
  /** Callback when AI provider changes */
  onAiProviderChange: (provider: AIProvider) => void;
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  /** Optional wallet address to display when connected */
  walletAddress?: string;
}

/**
 * BootAnimation component props
 * Displays animated boot sequence on initial load
 */
export interface BootAnimationProps {
  /** Callback when boot animation completes */
  onComplete: () => void;
  /** Duration of boot animation in milliseconds (optional) */
  duration?: number;
}
