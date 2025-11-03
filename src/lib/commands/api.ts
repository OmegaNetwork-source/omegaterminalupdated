/**
 * API Commands Re-export Module
 *
 * Central module that re-exports all API-related commands for convenience.
 * This provides backward compatibility and a single import point for API commands.
 *
 * Includes commands for:
 * - DexScreener: Token search and analytics
 * - GeckoTerminal: DEX pair data
 * - Alpha Vantage: Stock market data
 * - DeFi Llama: TVL and protocol analytics
 * - PGT: Portfolio tracking
 * - Chart: Chart viewing
 */

// DexScreener and GeckoTerminal commands
export { dexscreenerCommand, geckoterminalCommand } from "./dexscreener";

// Alpha Vantage stock market commands
export { alphaCommands } from "./alphavantage";

// DeFi Llama TVL and protocol commands
export { defillamaCommands } from "./defillama";

// PGT portfolio tracking commands
export { pgtCommands } from "./pgt";

// Chart viewing commands
export { chartCommands } from "./chart";

// Combined export for easy registration
export const apiCommands = [
  // Individual commands will be expanded from arrays in index.ts
  // This is primarily for re-export convenience
];
