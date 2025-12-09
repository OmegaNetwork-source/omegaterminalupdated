/**
 * Multi-Chain Type Definitions
 * Type definitions for multi-chain wallet and transaction systems
 * Supports Solana, NEAR, and Eclipse blockchain operations
 */

/**
 * Supported blockchain types
 * Used to identify which blockchain network is being used
 */
export type ChainType = "solana" | "near" | "eclipse" | "evm";

/**
 * Solana wallet state interface
 * Manages Solana wallet connection and balance
 */
export interface SolanaWalletState {
  /** Wallet type: 'phantom' for Phantom wallet extension, 'browser' for session wallet */
  type: "phantom" | "browser";
  /** Solana public key (base58 encoded) */
  publicKey: string | null;
  /** Whether wallet is currently connected */
  connected: boolean;
  /** Current balance in SOL (converted from lamports) */
  balance: number | null;
}

/**
 * NEAR wallet state interface
 * Manages NEAR Protocol wallet connection and balance
 */
export interface NEARWalletState {
  /** NEAR account ID (e.g., username.near) */
  accountId: string | null;
  /** Whether wallet is currently connected */
  connected: boolean;
  /** Current balance in NEAR */
  balance: string | null;
}

/**
 * Eclipse wallet state interface
 * Manages Eclipse network wallet connection and balance
 * Eclipse uses Solana-compatible wallets but different RPC endpoint
 */
export interface EclipseWalletState {
  /** Wallet type: 'phantom' for Phantom wallet extension, 'browser' for session wallet */
  type: "phantom" | "browser";
  /** Eclipse public key (base58 encoded, Solana-compatible) */
  publicKey: string | null;
  /** Whether wallet is currently connected */
  connected: boolean;
  /** Current balance in ETH (Eclipse uses ETH as native currency) */
  balance: number | null;
}

/**
 * Multi-chain wallet state interface
 * Aggregates wallet states for all supported chains
 */
export interface MultiChainWalletState {
  /** Solana wallet state */
  solana: SolanaWalletState;
  /** NEAR wallet state */
  near: NEARWalletState;
  /** Eclipse wallet state */
  eclipse: EclipseWalletState;
}

/**
 * Token information interface
 * Used for token search, swap interfaces, and display
 */
export interface TokenInfo {
  /** Token contract address or mint address */
  address: string;
  /** Token symbol (e.g., SOL, USDC, BONK) */
  symbol: string;
  /** Full token name */
  name: string;
  /** Number of decimals for token */
  decimals: number;
  /** Optional logo URI for token icon */
  logoURI?: string;
  /** Whether token is verified/trusted */
  verified?: boolean;
  /** Optional tags for categorization (e.g., 'meme', 'defi', 'stablecoin') */
  tags?: string[];
}

/**
 * Swap quote interface
 * Contains pricing and routing information for token swaps
 */
export interface SwapQuote {
  /** Input token mint address */
  inputMint: string;
  /** Output token mint address */
  outputMint: string;
  /** Input amount (in smallest token unit) */
  inAmount: string;
  /** Expected output amount (in smallest token unit) */
  outAmount: string;
  /** Price impact percentage (e.g., 0.5 for 0.5%) */
  priceImpactPct: number;
  /** Optional route plan showing swap path through DEXs */
  routePlan?: any[];
}

/**
 * Swap route interface
 * Contains detailed routing information for multi-hop swaps
 */
export interface SwapRoute {
  /** DEX name (e.g., 'Jupiter', 'Solar DEX', 'Deserialize') */
  dex: string;
  /** Input token information */
  inputToken: TokenInfo;
  /** Output token information */
  outputToken: TokenInfo;
  /** Swap quote with pricing and route details */
  quote: SwapQuote;
}
