"use client";

/**
 * Wallet Provider Component
 *
 * Provides global wallet state management using React Context.
 * Supports three wallet types:
 * - MetaMask: Browser extension wallet
 * - Session: Ephemeral wallet created in-session
 * - Imported: Wallet imported via private key
 *
 * Security Considerations:
 * - Session wallets are ephemeral and should not be used for large amounts
 * - Private keys should never be shared or committed to version control
 * - MetaMask is recommended for production use
 *
 * Usage:
 * ```tsx
 * import { WalletProvider } from '@/providers/WalletProvider';
 *
 * function App() {
 *   return (
 *     <WalletProvider>
 *       <YourApp />
 *     </WalletProvider>
 *   );
 * }
 * ```
 */

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { BrowserProvider, JsonRpcProvider, Wallet } from "ethers";
import {
  WalletState,
  WalletContextValue,
  WalletProviderProps,
  WalletConnectResult,
  InitializeExternalWalletParams,
} from "@/types/wallet";
import {
  connectMetaMask as connectMetaMaskModule,
  createSessionWallet as createSessionWalletModule,
  importSessionWallet as importSessionWalletModule,
  getBalance as getBalanceModule,
  addOmegaNetwork as addOmegaNetworkModule,
} from "@/lib/wallet";
import { getEthereumProvider } from "@/lib/wallet/detection";

// Create wallet context
export const WalletContext = createContext<WalletContextValue | undefined>(
  undefined
);

/**
 * WalletProvider component
 *
 * Manages wallet state and provides wallet methods to all child components.
 */
export function WalletProvider({ children }: WalletProviderProps) {
  // Wallet state
  const [walletState, setWalletState] = useState<WalletState>({
    type: null,
    address: null,
    isConnected: false,
    isConnecting: false,
    balance: null,
    chainId: null,
    error: null,
  });

  // Provider and signer state
  const [provider, setProvider] = useState<
    BrowserProvider | JsonRpcProvider | null
  >(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [sessionWallet, setSessionWallet] = useState<Wallet | null>(null);

  // Refs for stable event listener wrappers (Comment 1)
  const accountsChangedHandlerRef = useRef<(accounts: string[]) => void>(
    () => {}
  );
  const chainChangedHandlerRef = useRef<(chainIdHex: string) => void>(() => {});

  /**
   * Debug helper: Log ethereum provider availability on mount
   */
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const checkEthereum = () => {
        const eth = (window as typeof window & { ethereum?: any }).ethereum;
        // eslint-disable-next-line no-console
        console.debug("[WalletProvider] Ethereum provider check on mount:", {
          exists: Boolean(eth),
          isMetaMask: eth?.isMetaMask,
          isPhantom: eth?.isPhantom,
          hasRequest: typeof eth?.request === "function",
          providers: eth?.providers,
        });
      };

      // Check immediately and after a delay (MetaMask might inject late)
      checkEthereum();
      const timer = setTimeout(checkEthereum, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const onAccountsChanged = useCallback((accounts: string[]) => {
    accountsChangedHandlerRef.current(accounts);
  }, []);

  const onChainChanged = useCallback((chainIdHex: string) => {
    chainChangedHandlerRef.current(chainIdHex);
  }, []);

  const handleGetBalance = useCallback(
    async (
      overrideProvider?: BrowserProvider | JsonRpcProvider,
      overrideAddress?: string
    ): Promise<string | null> => {
      try {
        const targetProvider = overrideProvider || provider;
        const targetAddress = overrideAddress || walletState.address;

        if (!targetProvider || !targetAddress) {
          return null;
        }

        if (typeof getBalanceModule !== "function") {
          console.error("[WalletProvider] getBalance module unavailable");
          setWalletState((prev) => ({
            ...prev,
            error: "Wallet module not available",
          }));
          return null;
        }

        const balance = await getBalanceModule(targetProvider, targetAddress);

        setWalletState((prev) => ({
          ...prev,
          balance,
        }));

        return balance;
      } catch (error: any) {
        console.error("Failed to get balance:", error);
        return null;
      }
    },
    [provider, walletState.address]
  );

  /**
   * Connect to MetaMask wallet
   */
  const handleConnectMetaMask =
    useCallback(async (): Promise<WalletConnectResult> => {
      try {
        // Set connecting state
        setWalletState((prev) => ({
          ...prev,
          isConnecting: true,
          error: null,
        }));

        if (typeof connectMetaMaskModule !== "function") {
          console.error("[WalletProvider] connectMetaMask module unavailable");
          setWalletState((prev) => ({
            ...prev,
            isConnecting: false,
            error: "Wallet module not available",
          }));
          return { success: false, error: "Wallet module not available" };
        }

        // Call connection module
        const result = await connectMetaMaskModule();

        if (!result.success) {
          setWalletState((prev) => ({
            ...prev,
            isConnecting: false,
            error: result.error || "Failed to connect to MetaMask",
          }));
          return {
            success: false,
            error: result.error || "Failed to connect to MetaMask",
          };
        }

        // Store provider
        if (result.provider) {
          setProvider(result.provider);

          // Get signer (async in v6)
          const newSigner = await result.provider.getSigner();
          setSigner(newSigner);

          // Get network info
          const network = await result.provider.getNetwork();

          // Update state
          setWalletState({
            type: "metamask",
            address: result.address || null,
            isConnected: true,
            isConnecting: false,
            balance: null,
            chainId: Number(network.chainId),
            error: null,
          });

          // Fetch balance (Comment 2: pass provider and address directly to avoid race condition)
          if (result.address) {
            handleGetBalance(result.provider, result.address);
          }

          // Set up event listeners (Comment 1: using stable wrapper functions)
          const ethereumProvider = getEthereumProvider();
          if (ethereumProvider) {
            ethereumProvider.on("accountsChanged", onAccountsChanged);
            ethereumProvider.on("chainChanged", onChainChanged);
          }

          // Save to localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("walletType", "metamask");
          }

          return {
            success: true,
            address: result.address || null,
          };
        }

        return {
          success: false,
          error: result.error || "MetaMask provider unavailable",
        };
      } catch (error: any) {
        console.error("MetaMask connection error:", error);
        setWalletState((prev) => ({
          ...prev,
          isConnecting: false,
          error: error.message || "Failed to connect to MetaMask",
        }));
        return {
          success: false,
          error: error.message || "Failed to connect to MetaMask",
        };
      }
    }, [onAccountsChanged, onChainChanged]);

  const handleInitializeExternalConnection = useCallback(
    async ({
      provider: externalProvider,
      address,
      chainId,
      walletType = "metamask",
      networkName,
    }: InitializeExternalWalletParams): Promise<void> => {
      setProvider(externalProvider);
      const newSigner = await externalProvider.getSigner();
      setSigner(newSigner);

      setWalletState({
        type: walletType,
        address,
        isConnected: true,
        isConnecting: false,
        balance: null,
        chainId,
        error: null,
      });

      if (address) {
        handleGetBalance(externalProvider, address);
      }

      const ethereumProvider = getEthereumProvider();
      if (ethereumProvider) {
        ethereumProvider.on("accountsChanged", onAccountsChanged);
        ethereumProvider.on("chainChanged", onChainChanged);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("walletType", walletType ?? "metamask");
        if (networkName) {
          localStorage.setItem("walletNetworkName", networkName);
        }
      }
    },
    [handleGetBalance, onAccountsChanged, onChainChanged]
  );

  /**
   * Create new session wallet
   */
  const handleCreateSessionWallet = useCallback(async (): Promise<boolean> => {
    try {
      // Set connecting state
      setWalletState((prev) => ({
        ...prev,
        isConnecting: true,
        error: null,
      }));

      if (typeof createSessionWalletModule !== "function") {
        console.error(
          "[WalletProvider] createSessionWallet module unavailable"
        );
        setWalletState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Wallet module not available",
        }));
        return false;
      }

      // Call session wallet module
      const result = await createSessionWalletModule();

      // Store provider, signer, and wallet
      setProvider(result.provider);
      setSigner(result.wallet);
      setSessionWallet(result.wallet);

      // Persist private key in sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("omega-session-wallet-key", result.privateKey);
      }

      // Update state
      setWalletState({
        type: "session",
        address: result.address,
        isConnected: true,
        isConnecting: false,
        balance: null,
        chainId: null,
        error: null,
      });

      // Fetch balance (Comment 2: pass provider and address directly to avoid race condition)
      handleGetBalance(result.provider, result.address);

      return true;
    } catch (error: any) {
      console.error("Session wallet creation error:", error);
      setWalletState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to create session wallet",
      }));
      return false;
    }
  }, []);

  /**
   * Import wallet using private key
   */
  const handleImportSessionWallet = useCallback(
    async (privateKey: string): Promise<boolean> => {
      try {
        // Set connecting state
        setWalletState((prev) => ({
          ...prev,
          isConnecting: true,
          error: null,
        }));

        if (typeof importSessionWalletModule !== "function") {
          console.error(
            "[WalletProvider] importSessionWallet module unavailable"
          );
          setWalletState((prev) => ({
            ...prev,
            isConnecting: false,
            error: "Wallet module not available",
          }));
          return false;
        }

        // Call import wallet module
        const result = await importSessionWalletModule(privateKey);

        if (result.error) {
          setWalletState((prev) => ({
            ...prev,
            isConnecting: false,
            error: result.error || "Failed to import wallet",
          }));
          return false;
        }

        // Store provider, signer, and wallet
        setProvider(result.provider);
        setSigner(result.wallet);
        setSessionWallet(result.wallet);

        // Persist private key in sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.setItem("omega-session-wallet-key", privateKey);
        }

        // Update state
        setWalletState({
          type: "imported",
          address: result.address,
          isConnected: true,
          isConnecting: false,
          balance: null,
          chainId: null,
          error: null,
        });

        // Fetch balance (Comment 2: pass provider and address directly to avoid race condition)
        handleGetBalance(result.provider, result.address);

        return true;
      } catch (error: any) {
        console.error("Wallet import error:", error);
        setWalletState((prev) => ({
          ...prev,
          isConnecting: false,
          error: error.message || "Failed to import wallet",
        }));
        return false;
      }
    },
    []
  );

  /**
   * Disconnect wallet
   */
  const handleDisconnect = useCallback(async (): Promise<void> => {
    try {
      // Remove event listeners if MetaMask (Comment 1: using stable wrapper functions)
      if (walletState.type === "metamask") {
        const ethereumProvider = getEthereumProvider();
        if (ethereumProvider) {
          ethereumProvider.removeListener("accountsChanged", onAccountsChanged);
          ethereumProvider.removeListener("chainChanged", onChainChanged);
        }
      }

      // Clear state
      setProvider(null);
      setSigner(null);
      setSessionWallet(null);
      setWalletState({
        type: null,
        address: null,
        isConnected: false,
        isConnecting: false,
        balance: null,
        chainId: null,
        error: null,
      });

      // Clear localStorage and sessionStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("walletType");
        sessionStorage.removeItem("omega-session-wallet-key");
        localStorage.removeItem("walletNetworkName");
      }
    } catch (error: any) {
      console.error("Disconnect error:", error);
    }
  }, [walletState.type, onAccountsChanged, onChainChanged]);

  /**
   * Add Omega Network to MetaMask
   */
  const handleAddOmegaNetwork = useCallback(async (): Promise<boolean> => {
    try {
      const ethereumProvider = getEthereumProvider();
      if (!ethereumProvider) {
        return false;
      }

      if (typeof addOmegaNetworkModule !== "function") {
        console.error("[WalletProvider] addOmegaNetwork module unavailable");
        return false;
      }

      const result = await addOmegaNetworkModule(ethereumProvider);
      return result.success;
    } catch (error: any) {
      console.error("Failed to add Omega Network:", error);
      return false;
    }
  }, []);

  /**
   * Get signer
   */
  const handleGetSigner = useCallback(async (): Promise<any | null> => {
    if (signer) {
      return signer;
    }

    if (provider && provider instanceof BrowserProvider) {
      const newSigner = await provider.getSigner();
      setSigner(newSigner);
      return newSigner;
    }

    return null;
  }, [provider, signer]);

  /**
   * Get provider
   */
  const handleGetProvider = useCallback((): any | null => {
    return provider;
  }, [provider]);

  /**
   * Handle accounts changed event (MetaMask)
   */
  const handleAccountsChanged = useCallback(
    (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        handleDisconnect();
      } else {
        // Account changed
        setWalletState((prev) => ({
          ...prev,
          address: accounts[0] ?? null,
        }));
        // Refresh balance
        handleGetBalance();
      }
    },
    [handleDisconnect, handleGetBalance]
  );

  /**
   * Handle chain changed event (MetaMask)
   */
  const handleChainChanged = useCallback((chainIdHex: string) => {
    // Reload page on chain change (recommended by MetaMask)
    window.location.reload();
  }, []);

  /**
   * Update ref functions to point to latest handlers (Comment 1)
   */
  useEffect(() => {
    accountsChangedHandlerRef.current = handleAccountsChanged;
    chainChangedHandlerRef.current = handleChainChanged;
  }, [handleAccountsChanged, handleChainChanged]);

  /**
   * Attempt to reconnect on mount if previously connected
   */
  useEffect(() => {
    const reconnect = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const savedWalletType = localStorage.getItem("walletType");

      if (savedWalletType === "metamask") {
        // Skip automatic reconnection to avoid triggering MetaMask errors on load.
        // The user can reconnect manually via the network selector.
        return;
      }
    };

    reconnect();
  }, [handleInitializeExternalConnection]);

  // Context value
  const value: WalletContextValue = {
    state: walletState,
    connectMetaMask: handleConnectMetaMask,
    initializeExternalConnection: handleInitializeExternalConnection,
    createSessionWallet: handleCreateSessionWallet,
    importSessionWallet: handleImportSessionWallet,
    disconnect: handleDisconnect,
    getBalance: handleGetBalance,
    addOmegaNetwork: handleAddOmegaNetwork,
    getSigner: handleGetSigner,
    getProvider: handleGetProvider,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
