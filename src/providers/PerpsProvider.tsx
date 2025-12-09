"use client";

/**
 * Perps Provider
 *
 * Manages Omega Perps trading interface state and panel management.
 * Integrates with Omega Perps DEX via iframe embedding.
 *
 * Features:
 * - Panel open/close state management
 * - Trading pair selection (ETH/USDC, BTC/USDC, SOL/USDC)
 * - Iframe URL management
 * - Refresh functionality
 *
 * Usage:
 *   <PerpsProvider>
 *     <YourApp />
 *   </PerpsProvider>
 *
 *   const { openPanel, closePanel, setPair } = usePerps();
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import config from "@/lib/config";

// ============================================================================
// Types
// ============================================================================

export interface PerpsPlayerState {
  /** Whether panel is open */
  isPanelOpen: boolean;
  /** Currently selected trading pair */
  currentPair: string;
  /** Current iframe URL */
  currentUrl: string;
}

interface PerpsContextValue {
  playerState: PerpsPlayerState;
  openPanel: (pair?: string) => void;
  closePanel: () => void;
  setPair: (pair: string) => void;
  refresh: () => void;
}

// ============================================================================
// Context
// ============================================================================

const PerpsContext = createContext<PerpsContextValue | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function PerpsProvider({ children }: { children: ReactNode }) {
  const [playerState, setPlayerState] = useState<PerpsPlayerState>({
    isPanelOpen: false,
    currentPair: "ETH_USDC",
    currentUrl: "",
  });

  // ==========================================================================
  // Panel Controls
  // ==========================================================================

  const openPanel = useCallback((pair: string = "ETH_USDC"): void => {
    const formattedPair = pair.toUpperCase().replace("/", "_");
    const url = `${config.PERPS_BASE_URL}/perp/PERP_${formattedPair}/`;
    
    setPlayerState((prev) => ({
      ...prev,
      isPanelOpen: true,
      currentPair: formattedPair,
      currentUrl: url,
    }));
  }, []);

  const closePanel = useCallback((): void => {
    setPlayerState((prev) => ({
      ...prev,
      isPanelOpen: false,
    }));
  }, []);

  const setPair = useCallback((pair: string): void => {
    const formattedPair = pair.toUpperCase().replace("/", "_");
    const url = `${config.PERPS_BASE_URL}/perp/PERP_${formattedPair}/`;
    
    setPlayerState((prev) => ({
      ...prev,
      currentPair: formattedPair,
      currentUrl: url,
    }));
  }, []);

  const refresh = useCallback((): void => {
    // Trigger iframe refresh by updating URL with timestamp
    setPlayerState((prev) => ({
      ...prev,
      currentUrl: `${config.PERPS_BASE_URL}/perp/PERP_${prev.currentPair}/?t=${Date.now()}`,
    }));
    
    // Reset to normal URL after a moment
    setTimeout(() => {
      setPlayerState((prev) => ({
        ...prev,
        currentUrl: `${config.PERPS_BASE_URL}/perp/PERP_${prev.currentPair}/`,
      }));
    }, 100);
  }, []);

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const value: PerpsContextValue = {
    playerState,
    openPanel,
    closePanel,
    setPair,
    refresh,
  };

  return (
    <PerpsContext.Provider value={value}>{children}</PerpsContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function usePerps() {
  const context = useContext(PerpsContext);
  if (context === undefined) {
    throw new Error("usePerps must be used within a PerpsProvider");
  }
  return context;
}

