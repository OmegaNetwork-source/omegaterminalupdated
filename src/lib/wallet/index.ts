/**
 * Wallet Module Barrel Export
 *
 * Main export point for wallet modules, providing a clean API for wallet operations
 * including detection, connection, and session management.
 *
 * Usage:
 * ```typescript
 * import { detectWalletProvider, connectMetaMask, createSessionWallet } from '@/lib/wallet';
 * ```
 */

// Export detection module functions
export * from "./detection";

// Export connection module functions
export * from "./connection";

// Export session module functions
export * from "./session";
