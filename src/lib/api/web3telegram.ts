/**
 * Web3Telegram API Client
 *
 * SDK wrapper for iExec Web3Telegram and DataProtector integration.
 * Provides contact management, message sending, and access control
 * with localStorage persistence for contacts, config, and protected data.
 *
 * This client encapsulates both IExecWeb3telegram and IExecDataProtectorCore
 * functionality, providing a clean API for secure Telegram messaging through
 * blockchain infrastructure.
 */

import { IExecWeb3telegram } from "@iexec/web3telegram";
import { IExecDataProtectorCore } from "@iexec/dataprotector";
import type {
  TelegramContact,
  TelegramConfig,
  ProtectedDataInfo,
  GrantedAccessInfo,
  SendMessageParams,
  SendMessageResult,
  CreateProtectedDataParams,
  CreateProtectedDataResult,
} from "@/types/telegram";

// ============================================================================
// Constants
// ============================================================================

/** localStorage key for contacts */
const TELEGRAM_CONTACTS_KEY = "web3telegram-contacts";

/** localStorage key for config */
const TELEGRAM_CONFIG_KEY = "web3telegram-config";

/** localStorage key for user's protected data */
const TELEGRAM_PROTECTED_DATA_KEY = "web3telegram-protected-data";

/** Official Web3Telegram dApp address (ENS name for Bellecour) */
const WEB3TELEGRAM_DAPP_ADDRESS = "web3telegram.apps.iexec.eth";

/** Whitelist smart contract addresses by network */
const WEB3TELEGRAM_WHITELIST_ADDRESSES: Record<number, string> = {
  134: "0x192C6f5AccE52c81Fcc2670f10611a3665AAA98F", // Bellecour
  421614: "0x7291ff96100DA6CF97933C225B86124ef95aEc9b", // Arbitrum Sepolia
  42161: "0x53AFc09a647e7D5Fa9BDC784Eb3623385C45eF89", // Arbitrum Mainnet
};

/** Default sender name */
const DEFAULT_SENDER_NAME = "Omega Terminal";

/** Default max prices for iExec orders (in nRLC) */
const DEFAULT_DATA_MAX_PRICE = 0; // Dataset order max price
const DEFAULT_APP_MAX_PRICE = 0; // App order max price
const DEFAULT_WORKERPOOL_MAX_PRICE = 100000000; // 0.1 nRLC - Workerpool requires payment

// ============================================================================
// Module-level variables
// ============================================================================

/** Cached Web3Telegram SDK instance */
let web3telegramInstance: IExecWeb3telegram | null = null;

/** Cached DataProtector SDK instance */
let dataProtectorInstance: IExecDataProtectorCore | null = null;

/** Current ethers provider */
let currentProvider: any = null;

// ============================================================================
// Helper functions for localStorage
// ============================================================================

/**
 * Retrieve contacts from localStorage
 *
 * @returns Array of contacts, or empty array if none exist or parsing fails
 */
function getStoredContacts(): TelegramContact[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(TELEGRAM_CONTACTS_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save contacts array to localStorage
 *
 * @param contacts - Array of contacts to save
 */
function saveContacts(contacts: TelegramContact[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      TELEGRAM_CONTACTS_KEY,
      JSON.stringify(contacts)
    );
  } catch (error) {
    console.error("Failed to save contacts:", error);
  }
}

/**
 * Retrieve config from localStorage
 *
 * @returns Config object, or default config if none exists
 */
function getStoredConfig(): TelegramConfig {
  if (typeof window === "undefined") {
    return {
      defaultSenderName: DEFAULT_SENDER_NAME,
      defaultMaxPrice: DEFAULT_WORKERPOOL_MAX_PRICE,
      autoConfirmPrice: false,
      priceConfirmThreshold: 0,
    };
  }

  try {
    const stored = window.localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (!stored) {
      return {
        defaultSenderName: DEFAULT_SENDER_NAME,
        defaultMaxPrice: DEFAULT_WORKERPOOL_MAX_PRICE,
        autoConfirmPrice: false,
        priceConfirmThreshold: 0,
      };
    }
    return JSON.parse(stored) as TelegramConfig;
  } catch {
    return {
      defaultSenderName: DEFAULT_SENDER_NAME,
      defaultMaxPrice: DEFAULT_WORKERPOOL_MAX_PRICE,
      autoConfirmPrice: false,
      priceConfirmThreshold: 0,
    };
  }
}

/**
 * Save config to localStorage
 *
 * @param config - Config object to save
 */
function saveConfig(config: TelegramConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save config:", error);
  }
}

/**
 * Retrieve user's protected data info from localStorage
 *
 * @returns Protected data info or null if none exists
 */
function getStoredProtectedData(): ProtectedDataInfo | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(TELEGRAM_PROTECTED_DATA_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as ProtectedDataInfo;
  } catch {
    return null;
  }
}

/**
 * Save user's protected data info to localStorage
 *
 * @param data - Protected data info to save, or null to clear
 */
function saveProtectedData(data: ProtectedDataInfo | null): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (data === null) {
      window.localStorage.removeItem(TELEGRAM_PROTECTED_DATA_KEY);
    } else {
      window.localStorage.setItem(
        TELEGRAM_PROTECTED_DATA_KEY,
        JSON.stringify(data)
      );
    }
  } catch (error) {
    console.error("Failed to save protected data:", error);
  }
}

// ============================================================================
// Core SDK methods
// ============================================================================

/**
 * Fetch user's protected data from blockchain by owner address
 * This allows retrieving account info on different devices/browsers
 *
 * @param ownerAddress - Wallet address that owns the protected data
 * @returns Protected data info or null if not found
 */
async function fetchProtectedDataFromBlockchain(
  ownerAddress: string
): Promise<ProtectedDataInfo | null> {
  try {
    if (!dataProtectorInstance) {
      return null;
    }

    console.log(
      "[Web3Telegram] Fetching protected data for owner:",
      ownerAddress
    );

    // Fetch protected data owned by this address
    const protectedDataList = await dataProtectorInstance.getProtectedData({
      owner: ownerAddress,
    });

    console.log(
      "[Web3Telegram] Found protected data:",
      protectedDataList?.length || 0
    );

    if (!protectedDataList || protectedDataList.length === 0) {
      return null;
    }

    // Prefer protected data with correct Web3Telegram schema (telegram_chatId)
    // This avoids recovering old data created with wrong schema
    let latestProtectedData = protectedDataList.find(
      (pd: any) => pd.schema?.telegram_chatId || pd.schema?.["telegram_chatId"]
    );

    // If no correct schema found, use most recent (first in list)
    if (!latestProtectedData) {
      latestProtectedData = protectedDataList[0];
    }

    if (!latestProtectedData) {
      return null;
    }

    console.log(
      "[Web3Telegram] Selected protected data:",
      latestProtectedData.address
    );
    console.log("[Web3Telegram] Schema:", latestProtectedData.schema);

    // Get granted access count for this protected data
    let grantedAccessCount = 0;
    try {
      const grantedAccessList = await dataProtectorInstance.getGrantedAccess({
        protectedData: latestProtectedData.address,
      });
      grantedAccessCount = Array.isArray(grantedAccessList)
        ? grantedAccessList.length
        : 0;
    } catch (error) {
      console.warn("Could not fetch granted access count:", error);
    }

    const protectedDataInfo: ProtectedDataInfo = {
      address: latestProtectedData.address,
      name: latestProtectedData.name,
      owner: latestProtectedData.owner,
      createdAt: latestProtectedData.creationTimestamp
        ? new Date(
            Number(latestProtectedData.creationTimestamp) * 1000
          ).toISOString()
        : new Date().toISOString(),
      schema: latestProtectedData.schema,
      grantedAccessCount,
    };

    console.log(
      "[Web3Telegram] Protected data fetched successfully:",
      protectedDataInfo.address
    );

    // Save to localStorage for faster access next time
    saveProtectedData(protectedDataInfo);

    return protectedDataInfo;
  } catch (error) {
    console.error(
      "[Web3Telegram] Error fetching protected data from blockchain:",
      error
    );
    return null;
  }
}

/**
 * Initialize both IExecWeb3telegram and IExecDataProtectorCore SDK instances
 * Also attempts to fetch user's protected data from blockchain if not in localStorage
 *
 * Caches the instances and provider for future use. Must be called before
 * any other SDK operations.
 *
 * @param provider - Ethers provider instance
 * @returns Success status with optional error message
 *
 * @example
 * const provider = await wallet.getProvider();
 * const result = await initializeSDK(provider);
 * if (!result.success) {
 *   console.error('Failed to initialize:', result.error);
 * }
 */
export async function initializeSDK(
  provider: any
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!provider) {
      return {
        success: false,
        error: "Provider is required to initialize Web3Telegram SDK",
      };
    }

    // Initialize IExecWeb3telegram with experimental networks enabled
    // This is required for Arbitrum Sepolia and other testnets
    web3telegramInstance = new IExecWeb3telegram(provider, {
      allowExperimentalNetworks: true,
    });

    // Initialize IExecDataProtectorCore
    dataProtectorInstance = new IExecDataProtectorCore(provider);

    // Cache the provider
    currentProvider = provider;

    // Try to fetch user's protected data from blockchain
    // This enables account recovery across different devices/browsers
    try {
      const signer = await provider.getSigner();
      const ownerAddress = await signer.getAddress();

      // Check if we already have it in localStorage
      const storedData = getStoredProtectedData();

      // If not in localStorage or if stored data owner doesn't match current wallet,
      // fetch from blockchain
      if (!storedData || storedData.owner !== ownerAddress) {
        console.log(
          "[Web3Telegram] Attempting to fetch protected data from blockchain..."
        );
        const blockchainData = await fetchProtectedDataFromBlockchain(
          ownerAddress
        );

        if (blockchainData) {
          console.log("[Web3Telegram] ✅ Account recovered from blockchain!");
        } else {
          console.log(
            "[Web3Telegram] No existing protected data found on-chain"
          );
        }
      }
    } catch (error) {
      // Don't fail initialization if we can't fetch protected data
      console.warn(
        "[Web3Telegram] Could not fetch protected data from blockchain:",
        error
      );
    }

    return { success: true };
  } catch (error) {
    web3telegramInstance = null;
    dataProtectorInstance = null;
    currentProvider = null;

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to initialize Web3Telegram SDK",
    };
  }
}

/**
 * Ensure SDK is initialized
 *
 * Throws error if SDK instances are not initialized.
 * Use this as a guard in all methods that require initialized SDK.
 *
 * @throws {Error} If SDK is not initialized
 */
function ensureInitialized(): void {
  if (!web3telegramInstance || !dataProtectorInstance) {
    throw new Error(
      "Web3Telegram SDK not initialized. Call initializeSDK first."
    );
  }
}

/**
 * Create protected data containing Telegram Chat ID
 *
 * Uses DataProtector's protectData method to create protected data on-chain.
 * The Chat ID is encrypted and stored securely on the iExec infrastructure.
 * The resulting address can be shared with others to allow them to send messages.
 *
 * @param params - Chat ID and name for the protected data
 * @returns Success status with protected data address or error
 *
 * @example
 * const result = await createProtectedData({
 *   chatId: '123456789',
 *   name: 'My Telegram Chat ID'
 * });
 * if (result.success) {
 *   console.log('Protected data address:', result.protectedDataAddress);
 * }
 */
export async function createProtectedData(
  params: CreateProtectedDataParams
): Promise<CreateProtectedDataResult> {
  try {
    ensureInitialized();

    if (!dataProtectorInstance) {
      return {
        success: false,
        error: "DataProtector instance not available",
      };
    }

    console.log("[Web3Telegram] Creating protected data:", {
      telegram_chatId: params.chatId,
      name: params.name,
    });

    // Create protected data with the Chat ID
    // IMPORTANT: Field must be named "telegram_chatId" (with underscore) as per Web3Telegram SDK requirements
    const result = await dataProtectorInstance.protectData({
      data: { telegram_chatId: params.chatId },
      name: params.name,
    });

    console.log("[Web3Telegram] Protected data created:", result);

    // Store the result in localStorage
    const protectedDataInfo: ProtectedDataInfo = {
      address: result.address,
      name: params.name,
      owner: result.owner,
      createdAt: new Date().toISOString(),
      schema: { telegram_chatId: "string" },
      grantedAccessCount: 0,
    };

    saveProtectedData(protectedDataInfo);

    return {
      success: true,
      protectedDataAddress: result.address,
      txHash: (result as any).txHash,
    };
  } catch (error) {
    console.error("[Web3Telegram] Create protected data error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create protected data",
    };
  }
}

/**
 * Fetch granted access info (addresses that have granted access to message them)
 *
 * Uses Web3Telegram's fetchMyContacts method to retrieve the list of
 * addresses that have granted the current user permission to message them.
 * Returns grant information including authorized users and apps.
 *
 * Note: This returns grant metadata, not full contact records. To get full
 * contact info with labels, use getAllContacts() which reads from localStorage.
 *
 * @returns List of granted access info or error
 *
 * @example
 * const result = await fetchContacts();
 * if (result.success) {
 *   console.log('Found grants:', result.contacts.length);
 * }
 */
export async function fetchContacts(): Promise<{
  contacts: GrantedAccessInfo[];
  success: boolean;
  error?: string;
}> {
  try {
    ensureInitialized();

    if (!web3telegramInstance) {
      return {
        contacts: [],
        success: false,
        error: "Web3Telegram instance not available",
      };
    }

    // Fetch contacts from the blockchain
    const result = await web3telegramInstance.fetchMyContacts();

    // Map results to GrantedAccessInfo format
    const contacts: GrantedAccessInfo[] = result.map((contact: any) => ({
      authorizedApp: contact.authorizedApp || WEB3TELEGRAM_DAPP_ADDRESS,
      authorizedUser: contact.authorizedUser || contact.user || "",
      grantedAt: contact.grantedAt || new Date().toISOString(),
      numberOfAccess: contact.numberOfAccess || 0,
    }));

    return {
      contacts,
      success: true,
    };
  } catch (error) {
    return {
      contacts: [],
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch contacts",
    };
  }
}

/**
 * Grant access to a wallet address to message the user
 *
 * Uses DataProtector's grantAccess method to authorize a specific address
 * to send messages to the user's Telegram account. The grant can be limited
 * to a specific number of uses.
 *
 * Note: grantAccess() creates a signed order object and does not produce
 * an on-chain transaction hash. The returned GrantedAccess object contains
 * the authorization details.
 *
 * @param walletAddress - Address to grant access to
 * @param numberOfAccess - Number of uses allowed (default: 1)
 * @returns Success status with GrantedAccess object or error
 *
 * @example
 * const result = await grantAccess('0x1234...', 1);
 * if (result.success) {
 *   console.log('Access granted:', result.grantedAccess);
 * }
 */
export async function grantAccess(
  walletAddress: string,
  numberOfAccess: number = 1
): Promise<{ success: boolean; grantedAccess?: any; error?: string }> {
  try {
    ensureInitialized();

    if (!dataProtectorInstance) {
      return {
        success: false,
        error:
          "DataProtector instance not available. Please refresh and try again.",
      };
    }

    // Get the user's protected data
    const protectedData = getStoredProtectedData();
    if (!protectedData) {
      return {
        success: false,
        error:
          "No protected data found. Run 'tg-setup' first to create your Chat ID.",
      };
    }

    // Validate wallet address format
    if (
      !walletAddress ||
      !walletAddress.startsWith("0x") ||
      walletAddress.length !== 42
    ) {
      return {
        success: false,
        error:
          "Invalid wallet address format. Must be a valid Ethereum address (0x...)",
      };
    }

    // Get the current network's whitelist contract address
    let authorizedAppAddress: string =
      WEB3TELEGRAM_WHITELIST_ADDRESSES[421614]!; // Default to Arbitrum Sepolia

    try {
      const network = await currentProvider.getNetwork();
      const chainId = Number(network.chainId);

      // Use the whitelist contract for the current network
      const networkWhitelist = WEB3TELEGRAM_WHITELIST_ADDRESSES[chainId];
      if (networkWhitelist) {
        authorizedAppAddress = networkWhitelist;
      }

      console.log(
        "[Web3Telegram] Using whitelist for chain",
        chainId,
        ":",
        authorizedAppAddress
      );
    } catch (error) {
      console.warn(
        "[Web3Telegram] Could not detect network, using Arbitrum Sepolia whitelist"
      );
    }

    console.log("[Web3Telegram] Granting access with params:", {
      protectedData: protectedData.address,
      authorizedApp: authorizedAppAddress,
      authorizedUser: walletAddress,
      numberOfAccess,
    });

    // Grant access - returns a GrantedAccess object, not a transaction hash
    const result = await dataProtectorInstance.grantAccess({
      protectedData: protectedData.address,
      authorizedApp: authorizedAppAddress,
      authorizedUser: walletAddress,
      numberOfAccess,
    });

    console.log("[Web3Telegram] Grant access successful:", result);

    return {
      success: true,
      grantedAccess: result,
    };
  } catch (error) {
    // Provide detailed error information
    console.error("[Web3Telegram] Grant access error (full):", error);

    let errorMessage = "Failed to grant access";

    if (error instanceof Error) {
      errorMessage = error.message;

      console.error("[Web3Telegram] Error message:", errorMessage);
      console.error("[Web3Telegram] Error stack:", error.stack);

      // Add context for common errors
      if (errorMessage.includes("insufficient")) {
        errorMessage += " - You may need more ETH for gas fees";
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("configuration")
      ) {
        errorMessage +=
          " - Network configuration issue. Check browser console for details.";
      } else if (
        errorMessage.includes("user rejected") ||
        errorMessage.includes("denied")
      ) {
        errorMessage = "Transaction rejected by user";
      } else if (errorMessage.includes("nonce")) {
        errorMessage += " - Try refreshing the page and trying again";
      } else if (
        errorMessage.includes("contract") ||
        errorMessage.includes("address")
      ) {
        errorMessage += " - Contract issue. Check console logs.";
      }
    } else {
      console.error("[Web3Telegram] Non-Error object:", error);
    }

    console.error("[Web3Telegram] Returning error:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Revoke access from a specific grant
 *
 * Uses DataProtector's revokeOneAccess method to remove a specific
 * authorization grant, preventing the address from sending future messages.
 *
 * This method fetches the full GrantedAccess object from DataProtector using
 * the provided grant information, then passes the complete object to revokeOneAccess.
 *
 * @param grantedAccess - The grant information to identify and revoke
 * @returns Success status with transaction hash or error
 *
 * @example
 * const result = await revokeAccess(grantInfo);
 * if (result.success) {
 *   console.log('Access revoked, tx:', result.txHash);
 * }
 */
export async function revokeAccess(
  grantedAccess: GrantedAccessInfo
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    ensureInitialized();

    if (!dataProtectorInstance) {
      return {
        success: false,
        error: "DataProtector instance not available",
      };
    }

    // Get the user's protected data
    const protectedData = getStoredProtectedData();
    if (!protectedData) {
      return {
        success: false,
        error: "No protected data found.",
      };
    }

    // Fetch the full GrantedAccess object using filters
    const grantedAccessList = await dataProtectorInstance.getGrantedAccess({
      protectedData: protectedData.address,
      authorizedApp: grantedAccess.authorizedApp,
      authorizedUser: grantedAccess.authorizedUser,
    });

    // Find the exact grant to revoke
    if (
      !grantedAccessList ||
      !Array.isArray(grantedAccessList) ||
      grantedAccessList.length === 0
    ) {
      return {
        success: false,
        error: "Grant not found. It may have already been revoked.",
      };
    }

    // Use the first match (should be unique for the given filters)
    const fullGrant = grantedAccessList[0];

    // Revoke the specific grant
    const result = await dataProtectorInstance.revokeOneAccess(fullGrant);

    return {
      success: true,
      txHash: result.txHash,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revoke access",
    };
  }
}

/**
 * Send a Telegram message
 *
 * Uses Web3Telegram's sendTelegram method to send a message to a recipient's
 * protected Chat ID. The message is processed securely through the iExec
 * infrastructure and delivered via Telegram bot.
 *
 * @param params - Message parameters including recipient, content, and pricing
 * @returns Success status with task ID or error
 *
 * @example
 * const result = await sendMessage({
 *   protectedData: '0x1234...',
 *   telegramContent: 'Hello from Omega Terminal!',
 *   senderName: 'Alice',
 *   dataMaxPrice: 0,
 *   appMaxPrice: 0,
 *   workerpoolMaxPrice: 0
 * });
 * if (result.success) {
 *   console.log('Message sent, task ID:', result.taskId);
 * }
 */
export async function sendMessage(
  params: SendMessageParams
): Promise<SendMessageResult> {
  try {
    ensureInitialized();

    if (!web3telegramInstance) {
      return {
        success: false,
        error: "Web3Telegram instance not available",
      };
    }

    // Build options object for sendTelegram
    const options: any = {
      protectedData: params.protectedData,
      telegramContent: params.telegramContent,
      senderName: params.senderName,
    };

    // Add optional parameters
    if (params.label) {
      options.label = params.label;
    }
    if (params.dataMaxPrice !== undefined) {
      options.dataMaxPrice = params.dataMaxPrice;
    }
    if (params.appMaxPrice !== undefined) {
      options.appMaxPrice = params.appMaxPrice;
    }
    if (params.workerpoolMaxPrice !== undefined) {
      options.workerpoolMaxPrice = params.workerpoolMaxPrice;
    }

    console.log("[Web3Telegram] Sending message with options:", options);
    console.log("[Web3Telegram] Web3Telegram instance state:", {
      hasInstance: !!web3telegramInstance,
      instanceType: web3telegramInstance?.constructor?.name,
    });

    // Send the message
    const result = await web3telegramInstance.sendTelegram(options);

    console.log("[Web3Telegram] Message sent successfully! Result:", result);

    // Update lastMessageSent timestamp for the contact
    const contacts = getStoredContacts();
    const contactIndex = contacts.findIndex(
      (c) => c.protectedDataAddress === params.protectedData
    );
    if (contactIndex !== -1 && contacts[contactIndex]) {
      contacts[contactIndex]!.lastMessageSent = new Date().toISOString();
      saveContacts(contacts);
    }

    return {
      success: true,
      taskId: result.taskId,
    };
  } catch (error: any) {
    // Provide more detailed error information
    console.error("[Web3Telegram] Send message error (full):", error);
    console.error("[Web3Telegram] Error type:", typeof error);
    console.error(
      "[Web3Telegram] Error constructor:",
      error?.constructor?.name
    );

    // Deep dive into error chain to find root cause
    console.group("[Web3Telegram] Error chain analysis:");
    let currentError: any = error;
    let depth = 0;
    while (currentError && depth < 10) {
      console.error(`--- Depth ${depth} ---`);
      console.error("Message:", currentError.message || "No message");
      console.error("Name:", currentError.name || "No name");

      if (currentError.cause) {
        console.error("Has cause:", true);
        currentError = currentError.cause;
      } else if (currentError.originalError) {
        console.error("Has originalError:", true);
        currentError = currentError.originalError;
      } else {
        console.error("No deeper error");
        break;
      }
      depth++;
    }
    console.groupEnd();

    let errorMessage = "Failed to send message";

    if (error instanceof Error) {
      errorMessage = error.message;

      console.error("[Web3Telegram] Primary error message:", errorMessage);
      console.error("[Web3Telegram] Error stack:", error.stack);

      // Add helpful context for common errors
      if (
        errorMessage.includes("not granted") ||
        errorMessage.includes("access")
      ) {
        errorMessage += " - The recipient needs to grant you access first";
      } else if (errorMessage.includes("insufficient")) {
        errorMessage += " - You may need more ETH for gas";
      } else if (errorMessage.includes("protectedData")) {
        errorMessage += " - Check that the protected data address is valid";
      } else if (
        errorMessage.includes("workerpool") ||
        errorMessage.includes("order")
      ) {
        errorMessage +=
          " - Issue with iExec workerpool or orderbook. See console for details.";
      } else if (
        errorMessage.includes("app") ||
        errorMessage.includes("dapp")
      ) {
        errorMessage +=
          " - Issue with Web3Telegram app configuration. See console for details.";
      }
    } else {
      console.error("[Web3Telegram] Non-Error object:", error);
    }

    console.error(
      "[Web3Telegram] Final error message being returned:",
      errorMessage
    );

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================================================
// Contact management methods
// ============================================================================

/**
 * Add a new contact to localStorage
 *
 * Validates the contact information and adds it to the stored contacts list.
 * Checks for duplicate protected data addresses to prevent conflicts.
 *
 * @param contact - Contact information (without addedAt and lastMessageSent)
 * @returns Success status with optional error message
 *
 * @example
 * const result = addContact({
 *   protectedDataAddress: '0x1234...',
 *   label: 'Alice',
 *   walletAddress: '0x5678...'
 * });
 * if (!result.success) {
 *   console.error('Failed to add contact:', result.error);
 * }
 */
export function addContact(
  contact: Omit<TelegramContact, "addedAt" | "lastMessageSent">
): { success: boolean; error?: string } {
  try {
    // Validate protectedDataAddress is a valid Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(contact.protectedDataAddress)) {
      return {
        success: false,
        error: "Invalid protected data address format",
      };
    }

    // Get existing contacts
    const contacts = getStoredContacts();

    // Check for duplicate
    const duplicate = contacts.find(
      (c) => c.protectedDataAddress === contact.protectedDataAddress
    );
    if (duplicate) {
      return {
        success: false,
        error: `Contact with address ${contact.protectedDataAddress} already exists`,
      };
    }

    // Create new contact with timestamps
    const newContact: TelegramContact = {
      ...contact,
      addedAt: new Date().toISOString(),
    };

    // Add to contacts and save
    contacts.push(newContact);
    saveContacts(contacts);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add contact",
    };
  }
}

/**
 * Remove a contact by protected data address
 *
 * @param protectedDataAddress - Address of the contact to remove
 * @returns Success status with optional error message
 *
 * @example
 * const result = removeContact('0x1234...');
 * if (result.success) {
 *   console.log('Contact removed');
 * }
 */
export function removeContact(protectedDataAddress: string): {
  success: boolean;
  error?: string;
} {
  try {
    const contacts = getStoredContacts();
    const filteredContacts = contacts.filter(
      (c) => c.protectedDataAddress !== protectedDataAddress
    );

    if (filteredContacts.length === contacts.length) {
      return {
        success: false,
        error: "Contact not found",
      };
    }

    saveContacts(filteredContacts);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to remove contact",
    };
  }
}

/**
 * Find and return contact by label (case-insensitive)
 *
 * @param label - Label to search for
 * @returns Contact object or null if not found
 *
 * @example
 * const contact = getContactByLabel('Alice');
 * if (contact) {
 *   console.log('Found contact:', contact.protectedDataAddress);
 * }
 */
export function getContactByLabel(label: string): TelegramContact | null {
  const contacts = getStoredContacts();
  const normalized = label.toLowerCase();
  return contacts.find((c) => c.label.toLowerCase() === normalized) || null;
}

/**
 * Find and return contact by protected data address
 *
 * @param protectedDataAddress - Address to search for
 * @returns Contact object or null if not found
 *
 * @example
 * const contact = getContactByAddress('0x1234...');
 * if (contact) {
 *   console.log('Found contact:', contact.label);
 * }
 */
export function getContactByAddress(
  protectedDataAddress: string
): TelegramContact | null {
  const contacts = getStoredContacts();
  return (
    contacts.find((c) => c.protectedDataAddress === protectedDataAddress) ||
    null
  );
}

/**
 * Update specific fields of a contact
 *
 * Prevents updating the addedAt timestamp and protectedDataAddress to preserve
 * creation date and contact identity.
 *
 * @param protectedDataAddress - Address of the contact to update
 * @param updates - Partial contact object with fields to update
 * @returns Success status with optional error message
 *
 * @example
 * const result = updateContact('0x1234...', { label: 'Alice (Work)' });
 * if (result.success) {
 *   console.log('Contact updated');
 * }
 */
export function updateContact(
  protectedDataAddress: string,
  updates: Partial<Omit<TelegramContact, "protectedDataAddress" | "addedAt">>
): { success: boolean; error?: string } {
  try {
    const contacts = getStoredContacts();
    const index = contacts.findIndex(
      (c) => c.protectedDataAddress === protectedDataAddress
    );

    if (index === -1) {
      return {
        success: false,
        error: "Contact not found",
      };
    }

    // Updates already exclude protectedDataAddress and addedAt via type
    // Apply updates while preserving required fields
    const currentContact = contacts[index]!;
    contacts[index] = {
      ...currentContact,
      ...updates,
    } as TelegramContact;

    saveContacts(contacts);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update contact",
    };
  }
}

/**
 * Get all stored contacts
 *
 * @returns Array of all contacts
 *
 * @example
 * const allContacts = getAllContacts();
 * console.log('Total contacts:', allContacts.length);
 */
export function getAllContacts(): TelegramContact[] {
  return getStoredContacts();
}

// ============================================================================
// Configuration methods
// ============================================================================

/**
 * Get current configuration
 *
 * @returns Current config object
 *
 * @example
 * const config = getConfig();
 * console.log('Default sender:', config.defaultSenderName);
 */
export function getConfig(): TelegramConfig {
  return getStoredConfig();
}

/**
 * Update configuration with partial updates
 *
 * Merges the provided updates with existing config and saves to localStorage.
 *
 * @param updates - Partial config object with fields to update
 *
 * @example
 * updateConfig({ defaultSenderName: 'My Name' });
 */
export function updateConfig(updates: Partial<TelegramConfig>): void {
  const currentConfig = getStoredConfig();
  const newConfig = {
    ...currentConfig,
    ...updates,
  };
  saveConfig(newConfig);
}

/**
 * Get stored protected data info
 *
 * @returns Protected data info or null if not set
 *
 * @example
 * const data = getProtectedData();
 * if (data) {
 *   console.log('Protected data address:', data.address);
 * }
 */
export function getProtectedData(): ProtectedDataInfo | null {
  return getStoredProtectedData();
}

/**
 * Clear all stored data
 *
 * Removes all contacts, config, and protected data from localStorage.
 * Useful for resetting the Web3Telegram integration.
 *
 * @example
 * clearAllData();
 * console.log('All Web3Telegram data cleared');
 */
export function clearAllData(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TELEGRAM_CONTACTS_KEY);
  window.localStorage.removeItem(TELEGRAM_CONFIG_KEY);
  window.localStorage.removeItem(TELEGRAM_PROTECTED_DATA_KEY);
}
