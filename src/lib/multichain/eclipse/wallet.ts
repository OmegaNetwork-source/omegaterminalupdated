/**
 * Eclipse Wallet Management Module
 * Handles Eclipse network wallet operations (Solana-compatible)
 * Eclipse uses Solana-compatible wallets but different RPC endpoint and native currency (ETH)
 */

import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";
import { config } from "@/lib/config";

/**
 * Connect to Phantom wallet for Eclipse network
 * @returns Object with success status, public key, and optional error message
 */
export async function connectPhantom(): Promise<{
  success: boolean;
  publicKey?: string;
  error?: string;
}> {
  try {
    // Check if running in browser
    if (typeof window === "undefined") {
      return {
        success: false,
        error: "Wallet connection only available in browser environment",
      };
    }

    // Check if Phantom is installed
    const solana = (window as any).solana;
    if (!solana || !solana.isPhantom) {
      return {
        success: false,
        error:
          "Phantom wallet not found. Please install Phantom from https://phantom.app",
      };
    }

    // Request connection
    const response = await solana.connect();
    const publicKey = response.publicKey.toString();

    console.log("[Eclipse Wallet] Connected to Phantom:", publicKey);

    return {
      success: true,
      publicKey,
    };
  } catch (error: any) {
    console.error("[Eclipse Wallet] Error connecting to Phantom:", error);

    // Handle user rejection
    if (error.code === 4001 || error.message?.includes("User rejected")) {
      return {
        success: false,
        error: "Connection rejected by user",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to connect to Phantom wallet",
    };
  }
}

/**
 * Generate a new Eclipse browser wallet (keypair)
 * @returns Object with public key, secret key (base58 encoded), and keypair object
 */
export function generateWallet(): {
  publicKey: string;
  secretKey: string;
  keypair: Keypair;
} {
  try {
    // Generate new keypair
    const keypair = Keypair.generate();

    // Convert to base58 strings
    const publicKey = keypair.publicKey.toString();
    const secretKey = bs58.encode(keypair.secretKey);

    console.log("[Eclipse Wallet] Generated new browser wallet:", publicKey);

    return {
      publicKey,
      secretKey,
      keypair,
    };
  } catch (error: any) {
    console.error("[Eclipse Wallet] Error generating wallet:", error);
    throw error;
  }
}

/**
 * Get ETH balance for a public key on Eclipse network
 * Eclipse uses ETH as native currency (not SOL)
 * @param publicKey - Base58 encoded public key
 * @returns Balance in ETH, or null on error
 */
export async function getBalance(publicKey: string): Promise<number | null> {
  try {
    // Create connection to Eclipse RPC
    const connection = new Connection(config.ECLIPSE_RPC_URL, "confirmed");

    // Get balance in lamports
    const balanceLamports = await connection.getBalance(
      new PublicKey(publicKey)
    );

    // Convert lamports to ETH (Eclipse uses same denomination as Solana but currency is ETH)
    const balanceETH = balanceLamports / LAMPORTS_PER_SOL;

    console.log(`[Eclipse Wallet] Balance for ${publicKey}: ${balanceETH} ETH`);

    return balanceETH;
  } catch (error: any) {
    console.error("[Eclipse Wallet] Error getting balance:", error);
    return null;
  }
}

/**
 * Test Eclipse RPC connectivity and get network info
 * @returns Object with success status, version, slot, and optional error
 */
export async function testRpcConnectivity(): Promise<{
  success: boolean;
  version?: string;
  slot?: number;
  error?: string;
}> {
  try {
    const connection = new Connection(config.ECLIPSE_RPC_URL, "confirmed");

    // Get version and slot to test connectivity
    const [version, slot] = await Promise.all([
      connection.getVersion(),
      connection.getSlot(),
    ]);

    console.log("[Eclipse Wallet] RPC connectivity test successful");
    console.log(`  Version: ${version["solana-core"]}`);
    console.log(`  Current slot: ${slot}`);

    return {
      success: true,
      version: version["solana-core"],
      slot,
    };
  } catch (error: any) {
    console.error("[Eclipse Wallet] RPC connectivity test failed:", error);
    return {
      success: false,
      error: error.message || "Failed to connect to Eclipse RPC",
    };
  }
}

/**
 * Import a wallet from a base58 encoded secret key
 * @param secretKey - Base58 encoded secret key
 * @returns Keypair object or null on error
 */
export function importWallet(secretKey: string): Keypair | null {
  try {
    const secretKeyBytes = bs58.decode(secretKey);
    const keypair = Keypair.fromSecretKey(secretKeyBytes);

    console.log(
      "[Eclipse Wallet] Imported wallet:",
      keypair.publicKey.toString()
    );

    return keypair;
  } catch (error: any) {
    console.error("[Eclipse Wallet] Error importing wallet:", error);
    return null;
  }
}
