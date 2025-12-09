/**
 * Games Module Barrel Export
 *
 * Main entry point for games system functionality
 * Exports all functions and constants from:
 * - arcade-sdk: On-chain leaderboard integration
 * - metadata: Game information and discovery
 * - leaderboard: Local leaderboard management
 */

// Export all functions from arcade SDK
export * from "./arcade-sdk";

// Export all functions from metadata
export * from "./metadata";

// Export all functions from leaderboard
export * from "./leaderboard";

// Export GAMES_METADATA constant for convenience
export { GAMES_METADATA } from "./metadata";
