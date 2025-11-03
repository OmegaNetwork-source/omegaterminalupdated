"use client";

/**
 * Multi-Chain Provider
 * Manages wallet state and operations for Solana, NEAR, and Eclipse blockchains
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type {
  MultiChainWalletState,
  SolanaWalletState,
  NEARWalletState,
  EclipseWalletState,
} from "@/types/multichain";
import * as solana from "@/lib/multichain/solana";
import * as near from "@/lib/multichain/near";
import * as eclipse from "@/lib/multichain/eclipse";

/**
 * Multi-chain context type definition
 */
interface MultiChainContextType {
  // Solana state and methods
  solanaState: SolanaWalletState;
  connectSolanaPhantom: () => Promise<boolean>;
  generateSolanaWallet: () => Promise<{
    publicKey: string;
    secretKey: string;
  } | null>;
  getSolanaBalance: (publicKey?: string) => Promise<number | null>;
  sendSolanaTransaction: (transaction: any) => Promise<string | null>;

  // NEAR state and methods
  nearState: NEARWalletState;
  connectNear: () => Promise<boolean>;
  disconnectNear: () => Promise<void>;
  getNearBalance: (accountId?: string) => Promise<string | null>;
  signAndSendNearTransaction: (transaction: any) => Promise<any>;

  // Eclipse state and methods
  eclipseState: EclipseWalletState;
  connectEclipsePhantom: () => Promise<boolean>;
  generateEclipseWallet: () => Promise<{
    publicKey: string;
    secretKey: string;
  } | null>;
  getEclipseBalance: (publicKey?: string) => Promise<number | null>;
  sendEclipseTransaction: (transaction: any) => Promise<string | null>;
}

// Create context
const MultiChainContext = createContext<MultiChainContextType | undefined>(
  undefined
);

/**
 * Multi-Chain Provider Component
 * Wraps the application to provide multi-chain wallet functionality
 */
export function MultiChainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Solana state
  const [solanaState, setSolanaState] = useState<SolanaWalletState>({
    type: "phantom",
    publicKey: null,
    connected: false,
    balance: null,
  });

  // NEAR state
  const [nearState, setNearState] = useState<NEARWalletState>({
    accountId: null,
    connected: false,
    balance: null,
  });

  // Eclipse state
  const [eclipseState, setEclipseState] = useState<EclipseWalletState>({
    type: "phantom",
    publicKey: null,
    connected: false,
    balance: null,
  });

  // Solana wallet connection stored in localStorage
  const [solanaKeypair, setSolanaKeypair] = useState<any>(null);

  // Eclipse wallet connection stored in localStorage
  const [eclipseKeypair, setEclipseKeypair] = useState<any>(null);

  // NEAR wallet instance
  const [nearWallet, setNearWallet] = useState<any>(null);

  /**
   * Connect to Solana Phantom wallet
   */
  const connectSolanaPhantom = useCallback(async (): Promise<boolean> => {
    try {
      const result = await solana.connectPhantom();

      if (result.success && result.publicKey) {
        // Get balance
        const balance = await solana.getBalance(result.publicKey);

        setSolanaState({
          type: "phantom",
          publicKey: result.publicKey,
          connected: true,
          balance,
        });

        console.log("[MultiChainProvider] Solana Phantom connected");
        return true;
      }

      console.error(
        "[MultiChainProvider] Solana connection failed:",
        result.error
      );
      return false;
    } catch (error: any) {
      console.error("[MultiChainProvider] Solana connection error:", error);
      return false;
    }
  }, []);

  /**
   * Generate a new Solana browser wallet
   */
  const generateSolanaWallet = useCallback(async (): Promise<{
    publicKey: string;
    secretKey: string;
  } | null> => {
    try {
      const wallet = solana.generateWallet();

      // Store keypair for transaction signing
      setSolanaKeypair(wallet.keypair);

      // Get balance
      const balance = await solana.getBalance(wallet.publicKey);

      setSolanaState({
        type: "browser",
        publicKey: wallet.publicKey,
        connected: true,
        balance,
      });

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("solana_browser_wallet", wallet.secretKey);
      }

      console.log("[MultiChainProvider] Solana browser wallet generated");

      return {
        publicKey: wallet.publicKey,
        secretKey: wallet.secretKey,
      };
    } catch (error: any) {
      console.error(
        "[MultiChainProvider] Solana wallet generation error:",
        error
      );
      return null;
    }
  }, []);

  /**
   * Get Solana balance
   */
  const getSolanaBalance = useCallback(
    async (publicKey?: string): Promise<number | null> => {
      try {
        const key = publicKey || solanaState.publicKey;
        if (!key) return null;

        const balance = await solana.getBalance(key);

        // Update state if checking current wallet
        if (!publicKey || publicKey === solanaState.publicKey) {
          setSolanaState((prev) => ({ ...prev, balance }));
        }

        return balance;
      } catch (error: any) {
        console.error("[MultiChainProvider] Solana get balance error:", error);
        return null;
      }
    },
    [solanaState.publicKey]
  );

  /**
   * Send Solana transaction
   */
  const sendSolanaTransaction = useCallback(
    async (transaction: any): Promise<string | null> => {
      try {
        const result = await solana.sendTransaction(
          transaction,
          solanaState.type,
          solanaKeypair
        );

        if (result.signature) {
          console.log(
            "[MultiChainProvider] Solana transaction sent:",
            result.signature
          );
          return result.signature;
        }

        console.error(
          "[MultiChainProvider] Solana transaction error:",
          result.error
        );
        return null;
      } catch (error: any) {
        console.error("[MultiChainProvider] Solana transaction error:", error);
        return null;
      }
    },
    [solanaState.type, solanaKeypair]
  );

  /**
   * Connect to NEAR wallet
   */
  const connectNear = useCallback(async (): Promise<boolean> => {
    try {
      // Initialize NEAR connection
      const initResult = await near.initNear();

      if (!initResult.success || !initResult.wallet) {
        console.error(
          "[MultiChainProvider] NEAR init failed:",
          initResult.error
        );
        return false;
      }

      setNearWallet(initResult.wallet);

      // Check if already signed in
      if (near.isSignedIn(initResult.wallet)) {
        const accountId = near.getAccountId(initResult.wallet);
        if (accountId) {
          const balance = await near.getBalance(accountId);

          setNearState({
            accountId,
            connected: true,
            balance,
          });

          console.log(
            "[MultiChainProvider] NEAR already connected:",
            accountId
          );
          return true;
        }
      }

      // Request sign in (redirects user, so return false as not yet completed)
      await near.connectWallet(initResult.wallet);

      console.log(
        "[MultiChainProvider] NEAR sign-in initiated (redirecting user)"
      );
      return false;
    } catch (error: any) {
      console.error("[MultiChainProvider] NEAR connection error:", error);
      return false;
    }
  }, []);

  /**
   * Disconnect from NEAR wallet
   */
  const disconnectNear = useCallback(async (): Promise<void> => {
    try {
      if (nearWallet) {
        await near.disconnectWallet(nearWallet);
      }

      setNearState({
        accountId: null,
        connected: false,
        balance: null,
      });

      console.log("[MultiChainProvider] NEAR disconnected");
    } catch (error: any) {
      console.error("[MultiChainProvider] NEAR disconnect error:", error);
    }
  }, [nearWallet]);

  /**
   * Get NEAR balance
   */
  const getNearBalance = useCallback(
    async (accountId?: string): Promise<string | null> => {
      try {
        const id = accountId || nearState.accountId;
        if (!id) return null;

        const balance = await near.getBalance(id);

        // Update state if checking current wallet
        if (!accountId || accountId === nearState.accountId) {
          setNearState((prev) => ({ ...prev, balance }));
        }

        return balance;
      } catch (error: any) {
        console.error("[MultiChainProvider] NEAR get balance error:", error);
        return null;
      }
    },
    [nearState.accountId]
  );

  /**
   * Sign and send NEAR transaction
   */
  const signAndSendNearTransaction = useCallback(
    async (transaction: any): Promise<any> => {
      try {
        if (!nearWallet) {
          throw new Error("NEAR wallet not initialized");
        }

        // Transaction signing and sending logic will be implemented
        // when specific transaction types are needed
        console.log("[MultiChainProvider] NEAR transaction requested");

        return null;
      } catch (error: any) {
        console.error("[MultiChainProvider] NEAR transaction error:", error);
        return null;
      }
    },
    [nearWallet]
  );

  /**
   * Connect to Eclipse Phantom wallet
   */
  const connectEclipsePhantom = useCallback(async (): Promise<boolean> => {
    try {
      const result = await eclipse.connectPhantom();

      if (result.success && result.publicKey) {
        // Get balance
        const balance = await eclipse.getBalance(result.publicKey);

        setEclipseState({
          type: "phantom",
          publicKey: result.publicKey,
          connected: true,
          balance,
        });

        console.log("[MultiChainProvider] Eclipse Phantom connected");
        return true;
      }

      console.error(
        "[MultiChainProvider] Eclipse connection failed:",
        result.error
      );
      return false;
    } catch (error: any) {
      console.error("[MultiChainProvider] Eclipse connection error:", error);
      return false;
    }
  }, []);

  /**
   * Generate a new Eclipse browser wallet
   */
  const generateEclipseWallet = useCallback(async (): Promise<{
    publicKey: string;
    secretKey: string;
  } | null> => {
    try {
      const wallet = eclipse.generateWallet();

      // Store keypair for transaction signing
      setEclipseKeypair(wallet.keypair);

      // Get balance
      const balance = await eclipse.getBalance(wallet.publicKey);

      setEclipseState({
        type: "browser",
        publicKey: wallet.publicKey,
        connected: true,
        balance,
      });

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("eclipse_browser_wallet", wallet.secretKey);
      }

      console.log("[MultiChainProvider] Eclipse browser wallet generated");

      return {
        publicKey: wallet.publicKey,
        secretKey: wallet.secretKey,
      };
    } catch (error: any) {
      console.error(
        "[MultiChainProvider] Eclipse wallet generation error:",
        error
      );
      return null;
    }
  }, []);

  /**
   * Get Eclipse balance
   */
  const getEclipseBalance = useCallback(
    async (publicKey?: string): Promise<number | null> => {
      try {
        const key = publicKey || eclipseState.publicKey;
        if (!key) return null;

        const balance = await eclipse.getBalance(key);

        // Update state if checking current wallet
        if (!publicKey || publicKey === eclipseState.publicKey) {
          setEclipseState((prev) => ({ ...prev, balance }));
        }

        return balance;
      } catch (error: any) {
        console.error("[MultiChainProvider] Eclipse get balance error:", error);
        return null;
      }
    },
    [eclipseState.publicKey]
  );

  /**
   * Send Eclipse transaction
   */
  const sendEclipseTransaction = useCallback(
    async (transaction: any): Promise<string | null> => {
      try {
        const result = await eclipse.sendTransaction(
          transaction,
          eclipseState.type,
          eclipseKeypair
        );

        if (result.signature) {
          console.log(
            "[MultiChainProvider] Eclipse transaction sent:",
            result.signature
          );
          return result.signature;
        }

        console.error(
          "[MultiChainProvider] Eclipse transaction error:",
          result.error
        );
        return null;
      } catch (error: any) {
        console.error("[MultiChainProvider] Eclipse transaction error:", error);
        return null;
      }
    },
    [eclipseState.type, eclipseKeypair]
  );

  // Load saved wallets on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load Solana browser wallet
      const solanaSecret = localStorage.getItem("solana_browser_wallet");
      if (solanaSecret) {
        const keypair = solana.importWallet(solanaSecret);
        if (keypair) {
          setSolanaKeypair(keypair);
          setSolanaState({
            type: "browser",
            publicKey: keypair.publicKey.toString(),
            connected: true,
            balance: null,
          });
          // Update balance asynchronously
          solana.getBalance(keypair.publicKey.toString()).then((balance) => {
            setSolanaState((prev) => ({ ...prev, balance }));
          });
        }
      }

      // Load Eclipse browser wallet
      const eclipseSecret = localStorage.getItem("eclipse_browser_wallet");
      if (eclipseSecret) {
        const keypair = eclipse.importWallet(eclipseSecret);
        if (keypair) {
          setEclipseKeypair(keypair);
          setEclipseState({
            type: "browser",
            publicKey: keypair.publicKey.toString(),
            connected: true,
            balance: null,
          });
          // Update balance asynchronously
          eclipse.getBalance(keypair.publicKey.toString()).then((balance) => {
            setEclipseState((prev) => ({ ...prev, balance }));
          });
        }
      }

      // Check NEAR connection on mount
      near.initNear().then((result) => {
        if (result.success && result.wallet && near.isSignedIn(result.wallet)) {
          setNearWallet(result.wallet);
          const accountId = near.getAccountId(result.wallet);
          if (accountId) {
            setNearState({
              accountId,
              connected: true,
              balance: null,
            });
            // Update balance asynchronously
            near.getBalance(accountId).then((balance) => {
              setNearState((prev) => ({ ...prev, balance }));
            });
          }
        }
      });
    }
  }, []);

  // Context value
  const value: MultiChainContextType = {
    // Solana
    solanaState,
    connectSolanaPhantom,
    generateSolanaWallet,
    getSolanaBalance,
    sendSolanaTransaction,

    // NEAR
    nearState,
    connectNear,
    disconnectNear,
    getNearBalance,
    signAndSendNearTransaction,

    // Eclipse
    eclipseState,
    connectEclipsePhantom,
    generateEclipseWallet,
    getEclipseBalance,
    sendEclipseTransaction,
  };

  return (
    <MultiChainContext.Provider value={value}>
      {children}
    </MultiChainContext.Provider>
  );
}

/**
 * Hook to access multi-chain context
 * Must be used within MultiChainProvider
 */
export function useMultiChain(): MultiChainContextType {
  const context = useContext(MultiChainContext);

  if (context === undefined) {
    throw new Error("useMultiChain must be used within MultiChainProvider");
  }

  return context;
}
