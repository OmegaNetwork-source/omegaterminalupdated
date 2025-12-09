/**
 * Multi-Chain Operations
 * Main entry point for all multi-chain blockchain operations
 *
 * Usage:
 * ```typescript
 * import { solana, near, eclipse } from '@/lib/multichain';
 *
 * // Solana operations
 * await solana.connectPhantom();
 * await solana.searchTokens('BONK');
 *
 * // NEAR operations
 * const { wallet } = await near.initNear();
 * await near.connectWallet(wallet);
 *
 * // Eclipse operations
 * await eclipse.connectPhantom();
 * await eclipse.getTokenList();
 * ```
 */

export * as solana from "./solana";
export * as near from "./near";
export * as eclipse from "./eclipse";
