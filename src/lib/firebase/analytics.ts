/**
 * Firebase Analytics Utilities
 * Provides functions to track events, commands, users, and page views
 */

import {
  logEvent,
  setUserId,
  setUserProperties,
  type Analytics,
} from "firebase/analytics";
import { getFirebaseAnalytics, initializeAnalytics } from "./firebase-config";

// Analytics event names
export const AnalyticsEvents = {
  COMMAND_EXECUTED: "command_executed",
  USER_SESSION_START: "user_session_start",
  PAGE_VIEW: "page_view",
  WALLET_CONNECTED: "wallet_connected",
  WALLET_DISCONNECTED: "wallet_disconnected",
  GAME_STARTED: "game_started",
  GAME_COMPLETED: "game_completed",
  SWAP_INITIATED: "swap_initiated",
  SWAP_COMPLETED: "swap_completed",
  NFT_MINTED: "nft_minted",
  MINING_STARTED: "mining_started",
  ERROR_OCCURRED: "error_occurred",
} as const;

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

// Event parameter types
export interface CommandEventParams extends EventParams {
  command_name: string;
  command_category?: string;
  success: boolean;
  execution_time_ms?: number;
  error_message?: string;
}

export interface PageViewParams extends EventParams {
  page_path: string;
  page_title?: string;
}

export interface WalletEventParams extends EventParams {
  wallet_type: string;
  network?: string;
  chain_id?: string;
}

export interface GameEventParams extends EventParams {
  game_name: string;
  score?: number;
  duration_seconds?: number;
}

export interface SwapEventParams extends EventParams {
  from_token: string;
  to_token: string;
  amount?: number;
  network: string;
  success?: boolean;
}

// Generic event parameters
export type EventParams = Record<string, string | number | boolean | undefined>;

/**
 * Initialize analytics
 * Call this once when the app starts
 */
export async function initAnalytics(): Promise<void> {
  try {
    await initializeAnalytics();
  } catch (error) {
    console.error("[Analytics] Initialization error:", error);
  }
}

/**
 * Track a generic event
 * @param eventName - Name of the event
 * @param params - Event parameters
 */
export function trackEvent(
  eventName: AnalyticsEventName | string,
  params?: EventParams
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const analytics = getFirebaseAnalytics();
    if (!analytics) {
      // Analytics not initialized - fail silently
      return;
    }

    // Remove undefined values
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== undefined)
        )
      : {};

    logEvent(analytics, eventName, cleanParams);
  } catch (error) {
    // Fail silently - don't break the app if analytics fails
    console.error("[Analytics] Error tracking event:", error);
  }
}

/**
 * Track command execution
 * @param commandName - Name of the command executed
 * @param params - Additional command parameters
 */
export function trackCommand(
  commandName: string,
  params?: {
    category?: string;
    success?: boolean;
    executionTimeMs?: number;
    errorMessage?: string;
  }
): void {
  const eventParams: CommandEventParams = {
    command_name: commandName,
    success: params?.success ?? true,
    command_category: params?.category,
    execution_time_ms: params?.executionTimeMs,
    error_message: params?.errorMessage,
  };

  trackEvent(AnalyticsEvents.COMMAND_EXECUTED, eventParams);
}

/**
 * Track user session start
 * Call this when a user session begins
 */
export function trackSessionStart(): void {
  trackEvent(AnalyticsEvents.USER_SESSION_START, {
    timestamp: Date.now(),
  });
}

/**
 * Track page view
 * @param path - Page path
 * @param title - Page title (optional)
 */
export function trackPageView(path: string, title?: string): void {
  const params: PageViewParams = {
    page_path: path,
    page_title: title,
  };

  trackEvent(AnalyticsEvents.PAGE_VIEW, params);
}

/**
 * Track wallet connection
 * @param walletType - Type of wallet (e.g., "metamask", "walletconnect")
 * @param network - Network name (optional)
 * @param chainId - Chain ID (optional)
 */
export function trackWalletConnected(
  walletType: string,
  network?: string,
  chainId?: string
): void {
  const params: WalletEventParams = {
    wallet_type: walletType,
    network,
    chain_id: chainId,
  };

  trackEvent(AnalyticsEvents.WALLET_CONNECTED, params);
}

/**
 * Track wallet disconnection
 */
export function trackWalletDisconnected(): void {
  trackEvent(AnalyticsEvents.WALLET_DISCONNECTED);
}

/**
 * Track game started
 * @param gameName - Name of the game
 */
export function trackGameStarted(gameName: string): void {
  trackEvent(AnalyticsEvents.GAME_STARTED, {
    game_name: gameName,
  });
}

/**
 * Track game completion
 * @param gameName - Name of the game
 * @param score - Final score
 * @param duration - Duration in seconds
 */
export function trackGameCompleted(
  gameName: string,
  score?: number,
  duration?: number
): void {
  const params: GameEventParams = {
    game_name: gameName,
    score,
    duration_seconds: duration,
  };

  trackEvent(AnalyticsEvents.GAME_COMPLETED, params);
}

/**
 * Track swap initiated
 * @param fromToken - Source token
 * @param toToken - Destination token
 * @param network - Network name
 */
export function trackSwapInitiated(
  fromToken: string,
  toToken: string,
  network: string
): void {
  const params: SwapEventParams = {
    from_token: fromToken,
    to_token: toToken,
    network,
  };

  trackEvent(AnalyticsEvents.SWAP_INITIATED, params);
}

/**
 * Track swap completion
 * @param fromToken - Source token
 * @param toToken - Destination token
 * @param network - Network name
 * @param success - Whether the swap was successful
 */
export function trackSwapCompleted(
  fromToken: string,
  toToken: string,
  network: string,
  success: boolean
): void {
  const params: SwapEventParams = {
    from_token: fromToken,
    to_token: toToken,
    network,
    success,
  };

  trackEvent(AnalyticsEvents.SWAP_COMPLETED, params);
}

/**
 * Track NFT minting
 * @param nftType - Type of NFT
 * @param network - Network name
 */
export function trackNFTMinted(nftType: string, network: string): void {
  trackEvent(AnalyticsEvents.NFT_MINTED, {
    nft_type: nftType,
    network,
  });
}

/**
 * Track mining started
 */
export function trackMiningStarted(): void {
  trackEvent(AnalyticsEvents.MINING_STARTED);
}

/**
 * Track error occurrence
 * @param errorType - Type of error
 * @param errorMessage - Error message
 * @param context - Additional context
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  context?: string
): void {
  trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
    error_type: errorType,
    error_message: errorMessage,
    context,
  });
}

/**
 * Set user ID for analytics
 * @param userId - Unique user identifier
 */
export function setAnalyticsUserId(userId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const analytics = getFirebaseAnalytics();
    if (!analytics) {
      return;
    }

    setUserId(analytics, userId);
  } catch (error) {
    console.error("[Analytics] Error setting user ID:", error);
  }
}

/**
 * Set user properties
 * @param properties - User properties object
 */
export function setAnalyticsUserProperties(
  properties: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const analytics = getFirebaseAnalytics();
    if (!analytics) {
      return;
    }

    setUserProperties(analytics, properties);
  } catch (error) {
    console.error("[Analytics] Error setting user properties:", error);
  }
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
