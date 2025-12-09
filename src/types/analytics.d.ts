/**
 * Type definitions for Firebase Analytics
 */

import type { Analytics } from "firebase/analytics";

/**
 * Analytics context interface
 */
export interface AnalyticsContext {
  analytics: Analytics | null;
  isReady: boolean;
  trackEvent: (eventName: string, params?: Record<string, any>) => void;
  trackCommand: (commandName: string, params?: CommandTrackingParams) => void;
  trackPageView: (path: string, title?: string) => void;
  setUserId: (userId: string) => void;
}

/**
 * Command tracking parameters
 */
export interface CommandTrackingParams {
  category?: string;
  success?: boolean;
  executionTimeMs?: number;
  errorMessage?: string;
  args?: string[];
}

/**
 * User tracking properties
 */
export interface UserProperties {
  theme?: string;
  viewMode?: string;
  guiTheme?: string;
  walletConnected?: boolean;
  walletType?: string;
  firstVisit?: string;
  lastVisit?: string;
  sessionCount?: number;
}

/**
 * Analytics event types
 */
export type AnalyticsEvent =
  | "command_executed"
  | "user_session_start"
  | "page_view"
  | "wallet_connected"
  | "wallet_disconnected"
  | "game_started"
  | "game_completed"
  | "swap_initiated"
  | "swap_completed"
  | "nft_minted"
  | "mining_started"
  | "error_occurred";

/**
 * Firebase configuration type
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}
