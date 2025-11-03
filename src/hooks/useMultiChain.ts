/**
 * Multi-Chain Hook
 * Custom React hook for accessing multi-chain wallet context
 *
 * Usage:
 * ```typescript
 * const multichain = useMultiChain();
 *
 * // Solana operations
 * await multichain.connectSolanaPhantom();
 * const balance = await multichain.getSolanaBalance();
 *
 * // NEAR operations
 * await multichain.connectNear();
 * const nearBalance = await multichain.getNearBalance();
 *
 * // Eclipse operations
 * await multichain.connectEclipsePhantom();
 * const eclipseBalance = await multichain.getEclipseBalance();
 * ```
 */

export { useMultiChain } from "@/providers/MultiChainProvider";
