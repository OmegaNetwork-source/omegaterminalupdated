/**
 * Rubic SDK Type Definitions
 *
 * Type definitions for Rubic SDK integration including trade calculation,
 * swap execution, and network configuration.
 */

/**
 * Supported blockchain networks for Rubic SDK
 */
export type RubicBlockchain =
  | "ethereum"
  | "bsc"
  | "polygon"
  | "arbitrum"
  | "optimism"
  | "base"
  | "solana"
  | "near";

/**
 * Network chain ID mapping
 */
export interface NetworkChainId {
  ethereum: 1;
  bsc: 56;
  polygon: 137;
  arbitrum: 42161;
  optimism: 10;
  base: 8453;
  solana: 0; // Non-EVM
  near: 0; // Non-EVM
}

/**
 * Token information for swap operations
 */
export interface RubicToken {
  blockchain: RubicBlockchain;
  address: string;
  symbol?: string;
  name?: string;
  decimals?: number;
}

/**
 * Trade calculation parameters
 */
export interface CalculateTradeParams {
  fromToken: RubicToken;
  fromAmount: string; // Amount in human-readable format (e.g., "1" for 1 token). SDK converts internally.
  toToken: RubicToken;
  slippageTolerance?: number; // Slippage tolerance in percentage (default: 1%)
}

/**
 * Trade result from calculation
 */
export interface RubicTrade {
  fromToken: RubicToken;
  toToken: RubicToken;
  fromAmount: string;
  toAmount: string;
  estimatedGas?: string;
  fee?: string;
  provider?: string;
  route?: string[];
  priceImpact?: number;
  executionTime?: number;
}

/**
 * Swap execution parameters
 */
export interface ExecuteSwapParams {
  trade: RubicTrade;
  userAddress: string;
  slippageTolerance?: number;
}

/**
 * Swap execution result
 */
export interface SwapResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  trade?: RubicTrade;
}

/**
 * SDK initialization result
 */
export interface RubicSDKInitResult {
  success: boolean;
  error?: string;
}

/**
 * Network configuration for Rubic SDK
 */
export interface RubicNetworkConfig {
  chainId: number;
  rpcUrl: string;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Rubic SDK configuration
 */
export interface RubicSDKConfig {
  provider?: any; // Web3 provider (ethers, web3, etc.)
  networks?: Record<RubicBlockchain, RubicNetworkConfig>;
  referrerAddress?: string; // Optional referrer address for fee sharing
  feePercent?: number; // Optional fee percentage
}

