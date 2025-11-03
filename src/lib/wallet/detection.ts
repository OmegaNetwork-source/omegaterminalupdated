/**
 * Wallet Detection Module
 *
 * Handles detection of browser-based Ethereum wallets (MetaMask, Phantom)
 * and provides utilities for forcing MetaMask provider in multi-wallet scenarios.
 *
 * NOTE: This module is client-side only and requires window to be available.
 */

import { EthereumProvider } from "@/types/wallet";

export interface WalletDetectionResult {
  provider: EthereumProvider | null;
  type: "metamask" | "phantom" | "other" | null;
  name: string;
}

export interface WaitForWalletOptions {
  timeout?: number;
  checkInterval?: number;
  requireMetaMask?: boolean;
}

function classifyProvider(
  provider: EthereumProvider | null
): WalletDetectionResult {
  if (!provider) {
    return {
      provider: null,
      type: null,
      name: "None",
    };
  }

  if (provider.isPhantom) {
    return {
      provider,
      type: "phantom",
      name: "Phantom",
    };
  }

  if (provider.isMetaMask === true && !provider.isPhantom) {
    return {
      provider,
      type: "metamask",
      name: "MetaMask",
    };
  }

  return {
    provider,
    type: "other",
    name: "Unknown Wallet",
  };
}

function isLikelyMetaMask(provider: EthereumProvider): boolean {
  if (!provider) return false;

  const providerInfo: { id?: string; name?: string } | undefined = (
    provider as any
  )?.providerInfo;

  if (providerInfo?.id === "metamask") {
    return true;
  }

  if (typeof (provider as any)?._metamask?.isUnlocked === "function") {
    return true;
  }

  if (providerInfo?.name?.toLowerCase().includes("metamask")) {
    return true;
  }

  if (provider.isMetaMask === true) {
    if ((provider as any).isPhantom === true) {
      return false;
    }
    if ((provider as any).isCoinbaseWallet === true) {
      return false;
    }
    if ((provider as any).isTrust === true) {
      return false;
    }
    if ((provider as any).isBraveWallet === true) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Get the Ethereum provider from window.ethereum if available
 *
 * @returns The Ethereum provider or null if not available
 */
export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }
  return window.ethereum;
}

/**
 * Check if MetaMask is available
 *
 * Verifies that window.ethereum exists and has the isMetaMask property set to true,
 * and is NOT Phantom (which also sets isMetaMask for compatibility).
 *
 * @returns True if MetaMask is detected
 */
export function isMetaMaskAvailable(): boolean {
  if (typeof window === "undefined" || !window.ethereum) {
    return false;
  }
  return window.ethereum.isMetaMask === true && !window.ethereum.isPhantom;
}

/**
 * Check if Phantom wallet is available
 *
 * @returns True if Phantom is detected
 */
export function isPhantomAvailable(): boolean {
  if (typeof window === "undefined" || !window.ethereum) {
    return false;
  }
  return window.ethereum.isPhantom === true;
}

/**
 * Force MetaMask provider in multi-wallet scenarios
 *
 * When both MetaMask and Phantom (or other wallets) are installed, window.ethereum
 * may point to the wrong provider. This function searches for MetaMask in the
 * providers array and replaces window.ethereum with the MetaMask provider.
 *
 * This is necessary because Phantom sets isMetaMask=true for compatibility,
 * causing detection issues when both wallets are installed.
 *
 * @returns The MetaMask provider if found, null otherwise
 */
export function forceMetaMaskProvider(): EthereumProvider | null {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  const { ethereum } = window;

  if (Array.isArray((ethereum as any).providers)) {
    const metaMaskProvider = (ethereum as any).providers.find(
      (provider: EthereumProvider) => isLikelyMetaMask(provider)
    );

    if (metaMaskProvider) {
      try {
        (window as typeof window & { ethereum: EthereumProvider }).ethereum =
          metaMaskProvider;
        Object.defineProperty(metaMaskProvider, "_forceMetaMask", {
          value: true,
          configurable: true,
          enumerable: false,
          writable: true,
        });
      } catch {
        // Ignore assignment errors
      }
      return metaMaskProvider;
    }
  }

  if (isLikelyMetaMask(ethereum)) {
    try {
      Object.defineProperty(ethereum, "_forceMetaMask", {
        value: true,
        configurable: true,
        enumerable: false,
        writable: true,
      });
    } catch {
      // Ignore
    }
    return ethereum;
  }

  return null;
}

/**
 * Detect wallet provider and return details
 *
 * Attempts to detect the installed wallet provider, prioritizing MetaMask
 * in multi-wallet scenarios. Returns information about the detected wallet.
 *
 * @returns Object containing provider, type, and name
 */
export function detectWalletProvider(): WalletDetectionResult {
  // First try to force MetaMask provider
  const metaMaskProvider = forceMetaMaskProvider();

  if (metaMaskProvider) {
    return classifyProvider(metaMaskProvider);
  }

  // Check window.ethereum if MetaMask forcing didn't work
  const provider = getEthereumProvider();

  return classifyProvider(provider);
}

/**
 * Wait for an Ethereum wallet provider to be injected into the page.
 * Helpful for scenarios where the extension takes time to initialize.
 */
export async function waitForWalletProvider(
  options: WaitForWalletOptions = {}
): Promise<WalletDetectionResult & { timedOut: boolean }> {
  const {
    timeout = 3000,
    checkInterval = 100,
    requireMetaMask = false,
  } = options;

  const immediate = detectWalletProvider();
  if (
    immediate.provider &&
    (!requireMetaMask || immediate.type === "metamask")
  ) {
    return { ...immediate, timedOut: false };
  }

  if (typeof window === "undefined") {
    return { provider: null, type: null, name: "None", timedOut: true };
  }

  return new Promise((resolve) => {
    let resolved = false;

    const finalize = (
      result: WalletDetectionResult,
      timedOut: boolean
    ): void => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve({ ...result, timedOut });
    };

    const attemptResolve = (): boolean => {
      const result = detectWalletProvider();
      if (result.provider && (!requireMetaMask || result.type === "metamask")) {
        finalize(result, false);
        return true;
      }
      return false;
    };

    const handleInitialized = () => {
      attemptResolve();
    };

    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    const cleanup = () => {
      window.removeEventListener("ethereum#initialized", handleInitialized);
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };

    window.addEventListener("ethereum#initialized", handleInitialized, {
      once: true,
    });

    if (attemptResolve()) {
      return;
    }

    intervalId = window.setInterval(() => {
      attemptResolve();
    }, checkInterval);

    timeoutId = window.setTimeout(() => {
      const snapshot = detectWalletProvider();
      finalize(snapshot, true);
    }, timeout);
  });
}
