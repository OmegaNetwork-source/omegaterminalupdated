/**
 * Wallet Connection Module
 *
 * Handles MetaMask connection, network management, and balance checking.
 * Migrated to ethers v6 API (BrowserProvider, async getSigner, formatEther).
 */

import { BrowserProvider, JsonRpcProvider, formatEther } from "ethers";
import { OMEGA_NETWORK, OMEGA_RPC_URL } from "@/lib/config";
import { waitForWalletProvider } from "./detection";

function extractErrorMessage(error: any): string | null {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return error;
  }

  const candidates = [
    error?.message,
    error?.data?.message,
    error?.data?.originalError?.message,
    error?.error?.message,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return null;
}

function normalizeMetaMaskError(error: any): string {
  const defaultMessage = "Failed to connect to MetaMask.";
  if (!error) {
    return defaultMessage;
  }

  const code =
    error?.code ?? error?.data?.originalError?.code ?? error?.data?.code;
  const rawMessage = extractErrorMessage(error);
  const message = rawMessage ? rawMessage.trim() : "";
  const lowered = message.toLowerCase();

  if (code === -32002 || lowered.includes("request already pending")) {
    return "MetaMask connection request already pending. Open the MetaMask extension and complete the request.";
  }

  if (code === 4001 || lowered.includes("user rejected")) {
    return "MetaMask connection request rejected by user.";
  }

  if (code === 4902 || lowered.includes("unrecognized chain")) {
    return "Omega Network is not added in MetaMask. Approve the network add request, then try again.";
  }

  if (lowered.includes("locked")) {
    return "Unlock MetaMask, then try connecting again.";
  }

  if (lowered.includes("extension not found")) {
    return "MetaMask extension not found. Ensure it is installed and enabled, then reload the page.";
  }

  if (message) {
    return message;
  }

  return defaultMessage;
}

/**
 * Connect to MetaMask wallet
 *
 * Detects MetaMask provider, requests account access, creates BrowserProvider,
 * gets signer, and attempts to switch to Omega Network (adding it if necessary).
 *
 * @returns Object with success status, address, provider, or error message
 */
export async function connectMetaMask(): Promise<{
  success: boolean;
  address?: string;
  provider?: BrowserProvider;
  error?: string;
}> {
  try {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[connectMetaMask] invoked");
    }
    // Detect wallet provider (wait for MetaMask injection if necessary)
    const {
      provider: ethereumProvider,
      type,
      timedOut,
    } = await waitForWalletProvider({
      timeout: 4000,
      checkInterval: 120,
      requireMetaMask: true,
    });

    // Block Phantom EVM
    if (type === "phantom") {
      return {
        success: false,
        error: "Phantom EVM detected - please use MetaMask",
      };
    }

    // Check if provider exists
    if (!ethereumProvider) {
      return {
        success: false,
        error: timedOut
          ? "MetaMask extension not detected. Ensure MetaMask is installed, enabled for this site, and refresh the page."
          : "No EVM wallet found. Please install MetaMask.",
      };
    }

    // Request account access
    const accounts = await ethereumProvider.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        error: "No accounts found. Please unlock your wallet.",
      };
    }

    // Create BrowserProvider (ethers v6)
    const browserProvider = new BrowserProvider(ethereumProvider);

    // Get signer (async in v6)
    const signer = await browserProvider.getSigner();

    // Get address
    const address = await signer.getAddress();

    // Check current network
    const network = await browserProvider.getNetwork();

    // Try to switch to Omega Network
    try {
      await ethereumProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: OMEGA_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // Network not added (error code 4902)
      if (switchError.code === 4902) {
        const addResult = await addOmegaNetwork(ethereumProvider);
        if (!addResult.success) {
          return {
            success: false,
            error: addResult.error || "Failed to add Omega Network",
          };
        }
      } else {
        // User rejected or other error
        console.warn("Failed to switch network:", switchError);
        // Don't fail connection if network switch fails
      }
    }

    return {
      success: true,
      address,
      provider: browserProvider,
    };
  } catch (error: any) {
    console.error("MetaMask connection error:", error);
    const message = normalizeMetaMaskError(error);
    return {
      success: false,
      error: message || "Failed to connect to MetaMask",
    };
  }
}

/**
 * Add Omega Network to MetaMask
 *
 * Requests MetaMask to add the Omega Network using wallet_addEthereumChain.
 *
 * @param provider - Ethereum provider (window.ethereum)
 * @returns Object with success status or error message
 */
export async function addOmegaNetwork(provider: any): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Prepare network config
    const networkConfig = {
      chainId: OMEGA_NETWORK.chainId,
      chainName: OMEGA_NETWORK.chainName,
      nativeCurrency: OMEGA_NETWORK.nativeCurrency,
      rpcUrls: OMEGA_NETWORK.rpcUrls,
      blockExplorerUrls: OMEGA_NETWORK.blockExplorerUrls,
    };

    // Request to add network
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [networkConfig],
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to add Omega Network:", error);
    return {
      success: false,
      error: error.message || "Failed to add Omega Network",
    };
  }
}

/**
 * Get wallet balance
 *
 * Fetches the balance of an address using the provider and formats it
 * using ethers v6 formatEther (top-level import).
 *
 * @param provider - Ethers provider (BrowserProvider or JsonRpcProvider)
 * @param address - Wallet address to check balance for
 * @returns Formatted balance string (e.g., "1.234567890123456789")
 */
export async function getBalance(
  provider: BrowserProvider | JsonRpcProvider,
  address: string
): Promise<string> {
  try {
    // Get balance (returns BigInt in v6)
    const balance = await provider.getBalance(address);

    // Format balance using ethers v6 formatEther
    const formattedBalance = formatEther(balance);

    return formattedBalance;
  } catch (error: any) {
    console.error("Failed to get balance:", error);
    throw new Error(error.message || "Failed to fetch balance");
  }
}
