"use client";

/**
 * TelegramProvider
 * React Context provider for Web3Telegram integration
 * Manages global state for Web3Telegram SDK, account setup, contacts, and messaging
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";

// Import API client functions
import {
  initializeSDK,
  createProtectedData,
  fetchContacts,
  grantAccess,
  revokeAccess,
  sendMessage,
  addContact,
  removeContact,
  getContactByLabel,
  getAllContacts,
  getConfig,
  updateConfig,
  getProtectedData,
} from "@/lib/api/web3telegram";

// Import types
import type {
  TelegramState,
  TelegramContact,
  ProtectedDataInfo,
  GrantedAccessInfo,
  TelegramConfig,
  SendMessageParams,
  CreateProtectedDataParams,
} from "@/types/telegram";

// Import wallet hook
import { useWallet } from "@/hooks/useWallet";

/**
 * TelegramContext value interface
 * Defines the shape of the context value provided to consumers
 */
interface TelegramContextValue {
  /** Current state of the Telegram provider */
  state: TelegramState;

  /**
   * Initialize SDK and create protected data for user's Telegram account
   * @param params - Account setup parameters including chatId and name
   * @returns Promise with success status and protectedDataAddress
   */
  setupAccount: (params: CreateProtectedDataParams) => Promise<{
    success: boolean;
    protectedDataAddress?: string;
    error?: string;
  }>;

  /**
   * Add a contact to local storage
   * @param contact - Contact information without timestamp fields
   * @returns Result with success status
   */
  addContact: (
    contact: Omit<TelegramContact, "addedAt" | "lastMessageSent">
  ) => {
    success: boolean;
    error?: string;
  };

  /**
   * Remove a contact from local storage
   * @param protectedDataAddress - Address of the protected data to remove
   * @returns Result with success status
   */
  removeContact: (protectedDataAddress: string) => {
    success: boolean;
    error?: string;
  };

  /**
   * Send a Telegram message to a contact by label
   * @param params - Message parameters including label and content
   * @returns Promise with success status and taskId
   */
  sendMessage: (params: {
    label: string;
    message: string;
    dataMaxPrice?: number;
    appMaxPrice?: number;
    workerpoolMaxPrice?: number;
  }) => Promise<{
    success: boolean;
    taskId?: string;
    error?: string;
  }>;

  /**
   * Grant access to a user's wallet address
   * @param walletAddress - Address to grant access to
   * @param numberOfAccess - Number of accesses to grant (default: 1)
   * @returns Promise with success status
   */
  grantAccessToUser: (
    walletAddress: string,
    numberOfAccess?: number
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Revoke access from a user
   * @param grantedAccess - The granted access object to revoke
   * @returns Promise with success status
   */
  revokeAccessFromUser: (grantedAccess: GrantedAccessInfo) => Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Refresh the granted access list from blockchain
   * @returns Promise that resolves when refresh is complete
   */
  refreshContacts: () => Promise<void>;

  /**
   * Find a contact by label
   * @param label - Contact label to search for
   * @returns Contact object or null if not found
   */
  getContactByLabel: (label: string) => TelegramContact | null;

  /**
   * Update configuration settings
   * @param updates - Partial config object with fields to update
   */
  updateConfiguration: (updates: Partial<TelegramConfig>) => void;

  /**
   * Clear the current error state
   */
  clearError: () => void;
}

/**
 * Telegram Context
 */
const TelegramContext = createContext<TelegramContextValue | undefined>(
  undefined
);

/**
 * TelegramProvider Component
 * Provides Web3Telegram state and methods to child components
 */
export function TelegramProvider({ children }: { children: ReactNode }) {
  // Initialize state
  const [state, setState] = useState<TelegramState>({
    isInitialized: false,
    userProtectedData: null,
    contacts: [],
    grantedAccess: [],
    config: {
      defaultSenderName: "Omega Terminal",
      defaultMaxPrice: 0,
      autoConfirmPrice: false,
      priceConfirmThreshold: 0,
    },
    isLoading: false,
    error: null,
  });

  // Get wallet context
  const wallet = useWallet();

  // Track if initialization was attempted
  const initializationAttempted = useRef(false);

  /**
   * Initialize SDK when wallet becomes available
   */
  useEffect(() => {
    const initializeWhenReady = async () => {
      // Check if wallet is connected and provider is available
      if (
        wallet.state.isConnected &&
        wallet.getProvider() &&
        !state.isInitialized &&
        !initializationAttempted.current
      ) {
        initializationAttempted.current = true;

        try {
          // Initialize SDK with wallet provider
          const provider = wallet.getProvider();
          const initResult = await initializeSDK(provider);

          if (initResult.success) {
            // Load persisted data
            const protectedData = getProtectedData();
            const contacts = getAllContacts();
            const config = getConfig();

            // Update state with loaded data
            setState((prev) => ({
              ...prev,
              isInitialized: true,
              userProtectedData: protectedData,
              contacts,
              config,
            }));
          } else {
            // Reset flag to allow retry
            initializationAttempted.current = false;
            setState((prev) => ({
              ...prev,
              error: initResult.error || "Failed to initialize SDK",
            }));
          }
        } catch (error) {
          // Reset flag to allow retry
          initializationAttempted.current = false;
          setState((prev) => ({
            ...prev,
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize SDK",
          }));
        }
      }
    };

    initializeWhenReady();
  }, [wallet.state.isConnected, state.isInitialized, wallet.getProvider]);

  /**
   * Setup account - Initialize SDK and create protected data
   */
  const setupAccount = useCallback(
    async (
      params: CreateProtectedDataParams
    ): Promise<{
      success: boolean;
      protectedDataAddress?: string;
      error?: string;
    }> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Check if wallet is connected
        if (!wallet.state.isConnected) {
          return { success: false, error: "Wallet not connected" };
        }

        // Get provider
        const provider = wallet.getProvider();
        if (!provider) {
          return { success: false, error: "Provider not available" };
        }

        // Initialize SDK if not already initialized
        if (!state.isInitialized) {
          const initResult = await initializeSDK(provider);
          if (!initResult.success) {
            return {
              success: false,
              error: initResult.error || "Failed to initialize SDK",
            };
          }
        }

        // Create protected data
        const result = await createProtectedData(params);

        if (result.success) {
          // Update state with new protected data
          const protectedData = getProtectedData();
          setState((prev) => ({
            ...prev,
            isInitialized: true,
            userProtectedData: protectedData,
            isLoading: false,
          }));

          return {
            success: true,
            protectedDataAddress: result.protectedDataAddress,
          };
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to setup account";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    [wallet, state.isInitialized]
  );

  /**
   * Add a contact to local storage
   */
  const addContactHandler = useCallback(
    (
      contact: Omit<TelegramContact, "addedAt" | "lastMessageSent">
    ): {
      success: boolean;
      error?: string;
    } => {
      try {
        const result = addContact(contact);

        if (result.success) {
          // Update state with new contacts
          const contacts = getAllContacts();
          setState((prev) => ({ ...prev, contacts }));
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to add contact";
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Remove a contact from local storage
   */
  const removeContactHandler = useCallback(
    (
      protectedDataAddress: string
    ): {
      success: boolean;
      error?: string;
    } => {
      try {
        const result = removeContact(protectedDataAddress);

        if (result.success) {
          // Update state with new contacts
          const contacts = getAllContacts();
          setState((prev) => ({ ...prev, contacts }));
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to remove contact";
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Send a Telegram message to a contact by label
   */
  const sendMessageHandler = useCallback(
    async (params: {
      label: string;
      message: string;
      dataMaxPrice?: number;
      appMaxPrice?: number;
      workerpoolMaxPrice?: number;
    }): Promise<{
      success: boolean;
      taskId?: string;
      error?: string;
    }> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Check if initialized
        if (!state.isInitialized) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return { success: false, error: "SDK not initialized" };
        }

        // Find contact by label
        const contact = getContactByLabel(params.label);
        if (!contact) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return {
            success: false,
            error: `Contact with label "${params.label}" not found`,
          };
        }

        // Build send message params
        const sendParams: SendMessageParams = {
          protectedData: contact.protectedDataAddress,
          telegramContent: params.message,
          senderName: state.config.defaultSenderName,
          dataMaxPrice: params.dataMaxPrice ?? state.config.defaultMaxPrice,
          appMaxPrice: params.appMaxPrice ?? state.config.defaultMaxPrice,
          workerpoolMaxPrice:
            params.workerpoolMaxPrice ?? state.config.defaultMaxPrice,
        };

        // Send message
        const result = await sendMessage(sendParams);

        if (result.success) {
          // Update contacts state to reflect lastMessageSent update
          const contacts = getAllContacts();
          setState((prev) => ({ ...prev, contacts, isLoading: false }));

          return { success: true, taskId: result.taskId };
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    [state.isInitialized, state.config]
  );

  /**
   * Refresh the granted access list from blockchain and contacts from localStorage
   */
  const refreshContacts = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Check if initialized
      if (!state.isInitialized) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Fetch granted access from blockchain
      const result = await fetchContacts();

      // Refresh contacts from localStorage
      const contacts = getAllContacts();

      if (result.success && result.contacts) {
        setState((prev) => ({
          ...prev,
          grantedAccess: result.contacts,
          contacts,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          contacts,
          isLoading: false,
          error: result.error || "Failed to refresh contacts",
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh contacts";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [state.isInitialized]);

  /**
   * Grant access to a user's wallet address
   */
  const grantAccessToUser = useCallback(
    async (
      walletAddress: string,
      numberOfAccess?: number
    ): Promise<{
      success: boolean;
      error?: string;
    }> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Check if initialized and userProtectedData exists
        if (!state.isInitialized || !state.userProtectedData) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return {
            success: false,
            error: "Account not setup or SDK not initialized",
          };
        }

        // Grant access
        const result = await grantAccess(walletAddress, numberOfAccess);

        if (result.success) {
          // Increment grantedAccessCount
          setState((prev) => ({
            ...prev,
            userProtectedData: prev.userProtectedData
              ? {
                  ...prev.userProtectedData,
                  grantedAccessCount:
                    prev.userProtectedData.grantedAccessCount + 1,
                }
              : null,
            isLoading: false,
          }));

          // Refresh contacts to update grantedAccess list
          await refreshContacts();

          return { success: true };
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to grant access";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    [state.isInitialized, state.userProtectedData, refreshContacts]
  );

  /**
   * Revoke access from a user
   */
  const revokeAccessFromUser = useCallback(
    async (
      grantedAccess: GrantedAccessInfo
    ): Promise<{
      success: boolean;
      error?: string;
    }> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Check if initialized
        if (!state.isInitialized) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return { success: false, error: "SDK not initialized" };
        }

        // Revoke access
        const result = await revokeAccess(grantedAccess);

        if (result.success) {
          // Remove from grantedAccess array and decrement count
          setState((prev) => ({
            ...prev,
            grantedAccess: prev.grantedAccess.filter(
              (grant) =>
                grant.authorizedApp !== grantedAccess.authorizedApp ||
                grant.authorizedUser !== grantedAccess.authorizedUser
            ),
            userProtectedData: prev.userProtectedData
              ? {
                  ...prev.userProtectedData,
                  grantedAccessCount: Math.max(
                    0,
                    prev.userProtectedData.grantedAccessCount - 1
                  ),
                }
              : null,
            isLoading: false,
          }));

          return { success: true };
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to revoke access";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    [state.isInitialized, state.grantedAccess, state.userProtectedData]
  );

  /**
   * Find a contact by label
   */
  const getContactByLabelHandler = useCallback(
    (label: string): TelegramContact | null => {
      return getContactByLabel(label);
    },
    []
  );

  /**
   * Update configuration settings
   */
  const updateConfiguration = useCallback(
    (updates: Partial<TelegramConfig>): void => {
      try {
        updateConfig(updates);
        const config = getConfig();
        setState((prev) => ({ ...prev, config }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update configuration";
        setState((prev) => ({ ...prev, error: errorMessage }));
      }
    },
    []
  );

  /**
   * Clear the current error state
   */
  const clearError = useCallback((): void => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Build context value
  const contextValue: TelegramContextValue = {
    state,
    setupAccount,
    addContact: addContactHandler,
    removeContact: removeContactHandler,
    sendMessage: sendMessageHandler,
    grantAccessToUser,
    revokeAccessFromUser,
    refreshContacts,
    getContactByLabel: getContactByLabelHandler,
    updateConfiguration,
    clearError,
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
}

/**
 * useTelegram Hook
 * Custom hook to access the Telegram context
 * @throws Error if used outside of TelegramProvider
 * @returns TelegramContextValue
 */
export function useTelegram(): TelegramContextValue {
  const context = useContext(TelegramContext);

  if (context === undefined) {
    throw new Error("useTelegram must be used within TelegramProvider");
  }

  return context;
}
