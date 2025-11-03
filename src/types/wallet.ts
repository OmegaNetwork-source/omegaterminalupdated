/**
 * Wallet type definitions for Omega Terminal wallet management system
 *
 * Defines types for wallet connections, states, and provider interfaces
 * supporting MetaMask, session wallets, and imported wallets.
 */

import { ReactNode } from "react";
import type { BrowserProvider, JsonRpcProvider } from "ethers";

/**
 * Type of wallet connection
 * - 'metamask': Browser extension wallet (MetaMask)
 * - 'session': Ephemeral wallet created in-session
 * - 'imported': Wallet imported via private key
 * - null: No wallet connected
 */
export type WalletType = "metamask" | "session" | "imported" | null;

/**
 * Wallet state interface containing all wallet-related state information
 */
export interface WalletState {
  /** Type of currently connected wallet */
  type: WalletType;
  /** Connected wallet address */
  address: string | null;
  /** Whether a wallet is currently connected */
  isConnected: boolean;
  /** Whether a connection attempt is in progress */
  isConnecting: boolean;
  /** Current wallet balance (formatted string) */
  balance: string | null;
  /** Current chain ID */
  chainId: number | null;
  /** Error message if connection or operation failed */
  error: string | null;
}

/**
 * Result of attempting to connect a wallet provider (MetaMask, etc.)
 */
export interface WalletConnectResult {
  success: boolean;
  error?: string;
  address?: string | null;
}

export interface InitializeExternalWalletParams {
  provider: BrowserProvider | JsonRpcProvider;
  address: string;
  chainId: number;
  walletType?: WalletType;
  networkName?: string;
}

/**
 * Session wallet information including sensitive data
 *
 * WARNING: Session wallets are ephemeral and should not be used for large amounts.
 * Private keys and mnemonics should be handled securely and never exposed.
 */
export interface SessionWallet {
  /** Wallet address */
  address: string;
  /** Private key (sensitive - handle with care) */
  privateKey: string;
  /** Mnemonic phrase if available (sensitive - handle with care) */
  mnemonic: string | null;
}

/**
 * Wallet context value providing wallet state and methods
 *
 * This interface defines the API exposed by WalletProvider through the useWallet hook.
 */
export interface WalletContextValue {
  /** Current wallet state */
  state: WalletState;

  /** Connect to MetaMask wallet */
  connectMetaMask: () => Promise<WalletConnectResult>;

  /** Initialize wallet state using an existing provider connection */
  initializeExternalConnection: (
    params: InitializeExternalWalletParams
  ) => Promise<void>;

  /** Create a new ephemeral session wallet */
  createSessionWallet: () => Promise<boolean>;

  /** Import a wallet using a private key */
  importSessionWallet: (privateKey: string) => Promise<boolean>;

  /** Disconnect current wallet */
  disconnect: () => Promise<void>;

  /** Get current wallet balance */
  getBalance: () => Promise<string | null>;

  /** Add Omega Network to MetaMask */
  addOmegaNetwork: () => Promise<boolean>;

  /** Get ethers signer instance */
  getSigner: () => Promise<any | null>;

  /** Get ethers provider instance */
  getProvider: () => any | null;
}

/**
 * Props for WalletProvider component
 */
export interface WalletProviderProps {
  children: ReactNode;
}

/**
 * EIP-1193 Ethereum provider interface
 *
 * Extended interface for browser-based Ethereum providers (MetaMask, Phantom, etc.)
 * following the EIP-1193 specification.
 */
export interface EthereumProvider {
  /** Whether this is MetaMask */
  isMetaMask?: boolean;

  /** Whether this is Phantom */
  isPhantom?: boolean;

  /** Array of providers if multiple wallets are installed */
  providers?: EthereumProvider[];

  /** Make RPC requests to the provider */
  request: (args: { method: string; params?: any[] }) => Promise<any>;

  /** Add event listener */
  on: (event: string, handler: (...args: any[]) => void) => void;

  /** Remove event listener */
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

/**
 * Extend Window interface to include ethereum provider
 */
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
