/**
 * Session Wallet Module
 *
 * Handles creation and import of ephemeral session wallets using ethers v6.
 *
 * WARNING: Session wallets are ephemeral and should NOT be used for large amounts
 * or long-term storage. They are intended for testing and development purposes.
 * Private keys should be handled securely and never exposed.
 */

import { Wallet, JsonRpcProvider } from "ethers";
import config from "@/lib/config";

/**
 * Create a new random session wallet
 *
 * Generates a new random wallet using ethers Wallet.createRandom() and connects
 * it to the Omega Network RPC provider.
 *
 * @returns Object containing wallet, address, private key, and provider
 */
export async function createSessionWallet(): Promise<{
  wallet: Wallet;
  address: string;
  privateKey: string;
  provider: JsonRpcProvider;
}> {
  try {
    // Create RPC provider for Omega Network
    const provider = new JsonRpcProvider(config.OMEGA_RPC_URL);

    // Create random wallet
    const wallet = Wallet.createRandom();

    // Connect wallet to provider
    const connectedWallet = wallet.connect(provider);

    // Extract wallet information
    const address = await connectedWallet.getAddress();
    const privateKey = wallet.privateKey;

    return {
      wallet: connectedWallet,
      address,
      privateKey,
      provider,
    };
  } catch (error: any) {
    console.error("Failed to create session wallet:", error);
    throw new Error(error.message || "Failed to create session wallet");
  }
}

/**
 * Import a wallet using a private key
 *
 * Creates a wallet instance from a private key and connects it to the
 * Omega Network RPC provider.
 *
 * @param privateKey - Private key (must start with 0x and be 66 characters)
 * @returns Object containing wallet, address, provider, or error message
 */
export async function importSessionWallet(privateKey: string): Promise<{
  wallet: Wallet;
  address: string;
  provider: JsonRpcProvider;
  error?: string;
}> {
  try {
    // Validate private key format
    const validation = validatePrivateKey(privateKey);
    if (!validation.valid) {
      return {
        wallet: null as any,
        address: "",
        provider: null as any,
        error: validation.error,
      };
    }

    // Create RPC provider for Omega Network
    const provider = new JsonRpcProvider(config.OMEGA_RPC_URL);

    // Create wallet from private key
    const wallet = new Wallet(privateKey, provider);

    // Get address
    const address = await wallet.getAddress();

    return {
      wallet,
      address,
      provider,
    };
  } catch (error: any) {
    console.error("Failed to import wallet:", error);
    return {
      wallet: null as any,
      address: "",
      provider: null as any,
      error: error.message || "Failed to import wallet",
    };
  }
}

/**
 * Validate private key format
 *
 * Checks if the private key:
 * - Starts with 0x
 * - Is 66 characters long (0x + 64 hex characters)
 * - Contains only valid hex characters
 *
 * @param privateKey - Private key to validate
 * @returns Validation result with error message if invalid
 */
export function validatePrivateKey(privateKey: string): {
  valid: boolean;
  error?: string;
} {
  // Check if key starts with 0x
  if (!privateKey.startsWith("0x")) {
    return {
      valid: false,
      error: "Private key must start with 0x",
    };
  }

  // Check if key length is correct (0x + 64 hex characters = 66 total)
  if (privateKey.length !== 66) {
    return {
      valid: false,
      error: "Private key must be 66 characters long (0x + 64 hex characters)",
    };
  }

  // Check if key contains only hex characters
  const hexPattern = /^0x[0-9a-fA-F]{64}$/;
  if (!hexPattern.test(privateKey)) {
    return {
      valid: false,
      error: "Private key must contain only valid hexadecimal characters",
    };
  }

  return { valid: true };
}
