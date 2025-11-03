/**
 * Solana Wallet Management Module
 * Handles Phantom wallet connection, browser wallet generation, and balance queries
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
 * Connect to Phantom wallet extension
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

    console.log("[Solana Wallet] Connected to Phantom:", publicKey);

    return {
      success: true,
      publicKey,
    };
  } catch (error: any) {
    console.error("[Solana Wallet] Error connecting to Phantom:", error);

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
 * Generate a new Solana browser wallet (keypair)
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

    console.log("[Solana Wallet] Generated new browser wallet:", publicKey);

    return {
      publicKey,
      secretKey,
      keypair,
    };
  } catch (error: any) {
    console.error("[Solana Wallet] Error generating wallet:", error);
    throw error;
  }
}

/**
 * Get SOL balance for a public key with fallback RPC endpoints
 * @param publicKey - Base58 encoded public key
 * @returns Balance in SOL, or null on error
 */
export async function getBalance(publicKey: string): Promise<number | null> {
  const rpcEndpoints = [
    config.SOLANA_RPC_URL,
    ...(config.SOLANA_FALLBACK_RPCS || []),
  ];

  for (let i = 0; i < rpcEndpoints.length; i++) {
    const rpcUrl = rpcEndpoints[i];

    try {
      console.log(
        `[Solana Wallet] Trying RPC ${i + 1}/${rpcEndpoints.length}: ${rpcUrl}`
      );

      // Create connection to Solana RPC
      const connection = new Connection(rpcUrl, "confirmed");

      // Get balance in lamports with timeout
      const balanceLamports = await Promise.race([
        connection.getBalance(new PublicKey(publicKey)),
        new Promise<number>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000)
        ),
      ]);

      // Convert lamports to SOL
      const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;

      console.log(
        `[Solana Wallet] ✅ Balance for ${publicKey}: ${balanceSOL} SOL (via ${rpcUrl})`
      );

      return balanceSOL;
    } catch (error: any) {
      const isLastEndpoint = i === rpcEndpoints.length - 1;

      console.warn(
        `[Solana Wallet] ❌ RPC ${i + 1} failed (${rpcUrl}):`,
        error.message || error
      );

      // If this was the last endpoint, return null
      if (isLastEndpoint) {
        console.error("[Solana Wallet] All RPC endpoints failed");
        return null;
      }

      // Otherwise, try next endpoint
      console.log(`[Solana Wallet] Trying next RPC endpoint...`);
    }
  }

  return null;
}

/**
 * Test Solana RPC connectivity and get network info
 * @returns Object with success status, version, slot, and optional error
 */
export async function testRpcConnectivity(): Promise<{
  success: boolean;
  version?: string;
  slot?: number;
  error?: string;
}> {
  try {
    const connection = new Connection(config.SOLANA_RPC_URL, "confirmed");

    // Get version and slot to test connectivity
    const [version, slot] = await Promise.all([
      connection.getVersion(),
      connection.getSlot(),
    ]);

    console.log("[Solana Wallet] RPC connectivity test successful");
    console.log(`  Version: ${version["solana-core"]}`);
    console.log(`  Current slot: ${slot}`);

    return {
      success: true,
      version: version["solana-core"],
      slot,
    };
  } catch (error: any) {
    console.error("[Solana Wallet] RPC connectivity test failed:", error);
    return {
      success: false,
      error: error.message || "Failed to connect to Solana RPC",
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
      "[Solana Wallet] Imported wallet:",
      keypair.publicKey.toString()
    );

    return keypair;
  } catch (error: any) {
    console.error("[Solana Wallet] Error importing wallet:", error);
    return null;
  }
}
