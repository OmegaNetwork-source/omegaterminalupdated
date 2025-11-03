/**
 * Eclipse Transaction Handling Module
 * Handles transaction signing and sending for both Phantom and browser wallets on Eclipse network
 * Eclipse uses Solana-compatible transactions but with different RPC endpoint
 */

import {
  Connection,
  Transaction,
  VersionedTransaction,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import bs58 from "bs58";
import { config } from "@/lib/config";

// Browser-compatible Buffer polyfill
const BufferPolyfill =
  typeof Buffer !== "undefined"
    ? Buffer
    : {
        from: (data: string, encoding: string) => {
          if (encoding === "base64") {
            // Convert base64 to Uint8Array
            const binaryString = atob(data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
          }
          throw new Error(`Unsupported encoding: ${encoding}`);
        },
      };

/**
 * Send a transaction using Phantom or browser wallet on Eclipse network
 * @param serializedTransaction - Base64 or base58 encoded transaction
 * @param walletType - Type of wallet ('phantom' or 'browser')
 * @param keypair - Keypair for browser wallet (optional)
 * @returns Object with transaction signature or error
 */
export async function sendTransaction(
  serializedTransaction: string,
  walletType: "phantom" | "browser",
  keypair?: Keypair
): Promise<{ signature: string; error?: string }> {
  try {
    // Deserialize transaction
    let transaction: Transaction | VersionedTransaction;

    try {
      // Try deserializing as base64 (common format)
      const transactionBuf = BufferPolyfill.from(
        serializedTransaction,
        "base64"
      );
      transaction = VersionedTransaction.deserialize(transactionBuf);
    } catch {
      // Try deserializing as base58
      try {
        const transactionBuf = bs58.decode(serializedTransaction);
        transaction = VersionedTransaction.deserialize(transactionBuf);
      } catch {
        throw new Error("Failed to deserialize transaction");
      }
    }

    // Send transaction based on wallet type
    if (walletType === "phantom") {
      return await sendWithPhantom(transaction);
    } else if (walletType === "browser" && keypair) {
      return await sendWithBrowserWallet(transaction, keypair);
    } else {
      throw new Error("Invalid wallet type or missing keypair");
    }
  } catch (error: any) {
    console.error("[Eclipse Transaction] Error sending transaction:", error);
    return {
      signature: "",
      error: error.message || "Failed to send transaction",
    };
  }
}

/**
 * Send transaction using Phantom wallet on Eclipse network
 * @param transaction - Transaction or VersionedTransaction
 * @returns Object with signature or error
 */
async function sendWithPhantom(
  transaction: Transaction | VersionedTransaction
): Promise<{ signature: string; error?: string }> {
  try {
    if (typeof window === "undefined") {
      throw new Error("Phantom wallet only available in browser");
    }

    const solana = (window as any).solana;
    if (!solana || !solana.isPhantom) {
      throw new Error("Phantom wallet not found");
    }

    // Sign and send transaction
    const { signature } = await solana.signAndSendTransaction(transaction);

    console.log(
      "[Eclipse Transaction] Transaction sent via Phantom:",
      signature
    );

    return { signature };
  } catch (error: any) {
    console.error("[Eclipse Transaction] Phantom error:", error);

    // Handle user rejection
    if (error.code === 4001 || error.message?.includes("User rejected")) {
      return {
        signature: "",
        error: "Transaction rejected by user",
      };
    }

    return {
      signature: "",
      error: error.message || "Failed to send transaction with Phantom",
    };
  }
}

/**
 * Send transaction using browser wallet (keypair) on Eclipse network
 * @param transaction - Transaction or VersionedTransaction
 * @param keypair - Signer keypair
 * @returns Object with signature or error
 */
async function sendWithBrowserWallet(
  transaction: Transaction | VersionedTransaction,
  keypair: Keypair
): Promise<{ signature: string; error?: string }> {
  try {
    // Use Eclipse RPC URL instead of Solana RPC
    const connection = new Connection(config.ECLIPSE_RPC_URL, "confirmed");

    let signature: string;

    // Handle VersionedTransaction
    if (transaction instanceof VersionedTransaction) {
      transaction.sign([keypair]);
      signature = await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
    } else {
      // Handle legacy Transaction
      transaction.sign(keypair);
      signature = await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
    }

    console.log(
      "[Eclipse Transaction] Transaction sent via browser wallet:",
      signature
    );

    return { signature };
  } catch (error: any) {
    console.error("[Eclipse Transaction] Browser wallet error:", error);
    return {
      signature: "",
      error: error.message || "Failed to send transaction with browser wallet",
    };
  }
}

/**
 * Confirm a transaction on Eclipse network
 * @param signature - Transaction signature
 * @param commitment - Commitment level (default: 'confirmed')
 * @returns Object with confirmation status or error
 */
export async function confirmTransaction(
  signature: string,
  commitment: "processed" | "confirmed" | "finalized" = "confirmed"
): Promise<{ confirmed: boolean; error?: string }> {
  try {
    // Use Eclipse RPC URL instead of Solana RPC
    const connection = new Connection(config.ECLIPSE_RPC_URL, commitment);

    // Confirm transaction with timeout
    const confirmation = await connection.confirmTransaction(
      signature,
      commitment
    );

    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
      );
    }

    console.log("[Eclipse Transaction] Transaction confirmed:", signature);

    return { confirmed: true };
  } catch (error: any) {
    console.error("[Eclipse Transaction] Confirmation error:", error);
    return {
      confirmed: false,
      error: error.message || "Failed to confirm transaction",
    };
  }
}

/**
 * Get transaction status on Eclipse network
 * @param signature - Transaction signature
 * @returns Transaction status object or null
 */
export async function getTransactionStatus(
  signature: string
): Promise<any | null> {
  try {
    // Use Eclipse RPC URL instead of Solana RPC
    const connection = new Connection(config.ECLIPSE_RPC_URL, "confirmed");

    const status = await connection.getSignatureStatus(signature);

    console.log("[Eclipse Transaction] Transaction status:", status);

    return status;
  } catch (error: any) {
    console.error("[Eclipse Transaction] Error getting status:", error);
    return null;
  }
}
