/**
 * PGT (Portfolio Global Tracker) API Client
 *
 * Provides integration with PGT for wallet tracking across multiple networks.
 * Uses internal API routes to keep API keys secure on the server.
 * Supports ethereum, polygon, bsc, arbitrum, optimism, base, solana networks.
 */

import type { PGTWallet, PGTPortfolio } from "@/types/api";

/**
 * Add a wallet to tracking
 * Registers a wallet address for portfolio monitoring
 *
 * @param address - Wallet address to track
 * @param network - Network (ethereum, polygon, bsc, arbitrum, optimism, base, solana)
 * @param label - Optional label for the wallet
 * @returns Success status
 */
export async function addWallet(
  address: string,
  network: string,
  label?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/pgt/wallet/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        network,
        label: label || `Omega Terminal - ${network}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `PGT API error: ${response.statusText}`
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add wallet to PGT",
    };
  }
}

/**
 * Get portfolio overview
 * Returns aggregated portfolio data across all tracked wallets
 *
 * @returns Portfolio overview with total value and wallet list
 */
export async function getPortfolio(): Promise<{
  portfolio: PGTPortfolio | null;
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/pgt/portfolio`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `PGT API error: ${response.statusText}`
      );
    }

    const portfolio = await response.json();

    return {
      portfolio,
      success: true,
    };
  } catch (error) {
    return {
      portfolio: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get list of tracked wallets
 * Returns all wallets currently being monitored
 *
 * @returns Array of tracked wallets
 */
export async function getTrackedWallets(): Promise<{
  wallets: PGTWallet[];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/pgt/wallets`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `PGT API error: ${response.statusText}`
      );
    }

    const wallets = await response.json();

    return {
      wallets: Array.isArray(wallets) ? wallets : [],
      success: true,
    };
  } catch (error) {
    return {
      wallets: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get specific wallet details
 * Returns detailed information about a single wallet
 *
 * @param address - Wallet address
 * @param network - Network
 * @returns Wallet details with token holdings
 */
export async function getWallet(
  address: string,
  network: string
): Promise<{ wallet: PGTWallet | null; success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/pgt/wallet/${address}/${network}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `PGT API error: ${response.statusText}`
      );
    }

    const wallet = await response.json();

    return {
      wallet,
      success: true,
    };
  } catch (error) {
    return {
      wallet: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Remove a wallet from tracking
 * Stops monitoring the specified wallet
 *
 * @param address - Wallet address
 * @param network - Network
 * @returns Success status
 */
export async function removeWallet(
  address: string,
  network: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/pgt/wallet/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        network,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `PGT API error: ${response.statusText}`
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test PGT API connection
 * Verifies API connectivity and authentication
 *
 * @returns Connection status
 */
export async function testConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`/api/pgt/health`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `PGT API error: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "PGT API connection failed",
    };
  }
}
