/**
 * NEAR Wallet Management Module
 * Handles NEAR Protocol wallet connection and account operations
 */

import * as nearAPI from "near-api-js";
import { config } from "@/lib/config";

const { connect, keyStores, WalletConnection } = nearAPI;

// Global NEAR connection and wallet instances (client-side only)
let nearConnection: any = null;
let walletConnection: any = null;

/**
 * Initialize NEAR connection and wallet
 * @returns Object with connection, wallet, success status, and optional error
 */
export async function initNear(): Promise<{
  connection: any;
  wallet: any;
  success: boolean;
  error?: string;
}> {
  try {
    // Check if running in browser
    if (typeof window === "undefined") {
      return {
        connection: null,
        wallet: null,
        success: false,
        error: "NEAR wallet only available in browser environment",
      };
    }

    // Return existing connection if already initialized
    if (nearConnection && walletConnection) {
      return {
        connection: nearConnection,
        wallet: walletConnection,
        success: true,
      };
    }

    // Create keyStore using browser local storage
    const keyStore = new keyStores.BrowserLocalStorageKeyStore();

    // Configure NEAR connection
    const nearConfig = {
      networkId: "mainnet",
      keyStore,
      nodeUrl: config.NEAR_RPC_URL,
      walletUrl: config.NEAR_WALLET_URL,
      helperUrl: "https://helper.mainnet.near.org",
      explorerUrl: "https://nearblocks.io",
    };

    // Connect to NEAR
    nearConnection = await connect(nearConfig);

    // Create wallet connection
    walletConnection = new WalletConnection(nearConnection, "omega-terminal");

    console.log("[NEAR Wallet] Initialized successfully");

    return {
      connection: nearConnection,
      wallet: walletConnection,
      success: true,
    };
  } catch (error: any) {
    console.error("[NEAR Wallet] Initialization error:", error);
    return {
      connection: null,
      wallet: null,
      success: false,
      error: error.message || "Failed to initialize NEAR connection",
    };
  }
}

/**
 * Connect to NEAR wallet (triggers popup authentication)
 * @param wallet - Wallet connection instance from initNear
 * @returns Object with success status, account ID, and optional error
 */
export async function connectWallet(wallet: any): Promise<{
  success: boolean;
  accountId?: string;
  error?: string;
}> {
  try {
    if (!wallet) {
      throw new Error("Wallet not initialized. Call initNear first.");
    }

    // Check if already signed in
    if (wallet.isSignedIn()) {
      const accountId = wallet.getAccountId();
      console.log("[NEAR Wallet] Already signed in:", accountId);
      return {
        success: true,
        accountId,
      };
    }

    // Request sign in (opens popup)
    await wallet.requestSignIn({
      contractId: "", // Can specify contract if needed
      methodNames: [], // Methods to allow
      successUrl: window.location.href,
      failureUrl: window.location.href,
    });

    // After redirect, check if signed in
    if (wallet.isSignedIn()) {
      const accountId = wallet.getAccountId();
      console.log("[NEAR Wallet] Signed in successfully:", accountId);
      return {
        success: true,
        accountId,
      };
    }

    return {
      success: false,
      error: "Sign in process not completed",
    };
  } catch (error: any) {
    console.error("[NEAR Wallet] Connection error:", error);
    return {
      success: false,
      error: error.message || "Failed to connect NEAR wallet",
    };
  }
}

/**
 * Disconnect from NEAR wallet
 * @param wallet - Wallet connection instance
 */
export async function disconnectWallet(wallet: any): Promise<void> {
  try {
    if (wallet && wallet.isSignedIn()) {
      wallet.signOut();
      console.log("[NEAR Wallet] Signed out successfully");
    }
  } catch (error: any) {
    console.error("[NEAR Wallet] Disconnect error:", error);
  }
}

/**
 * Get NEAR balance for an account
 * @param accountId - NEAR account ID (e.g., username.near)
 * @returns Balance in NEAR or null on error
 */
export async function getBalance(accountId: string): Promise<string | null> {
  try {
    // Initialize connection if needed
    const { connection, success } = await initNear();
    if (!success || !connection) {
      throw new Error("Failed to initialize NEAR connection");
    }

    // Get account
    const account = await connection.account(accountId);

    // Get account balance
    const balance = await account.getAccountBalance();

    // Format balance (convert yoctoNEAR to NEAR)
    const balanceNEAR = nearAPI.utils.format.formatNearAmount(
      balance.available
    );

    console.log(`[NEAR Wallet] Balance for ${accountId}: ${balanceNEAR} NEAR`);

    return balanceNEAR;
  } catch (error: any) {
    console.error("[NEAR Wallet] Error getting balance:", error);
    return null;
  }
}

/**
 * Get current signed-in account ID
 * @param wallet - Wallet connection instance
 * @returns Account ID or null if not signed in
 */
export function getAccountId(wallet: any): string | null {
  try {
    if (wallet && wallet.isSignedIn()) {
      return wallet.getAccountId();
    }
    return null;
  } catch (error: any) {
    console.error("[NEAR Wallet] Error getting account ID:", error);
    return null;
  }
}

/**
 * Check if wallet is signed in
 * @param wallet - Wallet connection instance
 * @returns True if signed in, false otherwise
 */
export function isSignedIn(wallet: any): boolean {
  try {
    return wallet ? wallet.isSignedIn() : false;
  } catch (error: any) {
    console.error("[NEAR Wallet] Error checking sign in status:", error);
    return false;
  }
}
