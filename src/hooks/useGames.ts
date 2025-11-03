/**
 * useGames Hook
 *
 * Custom React hook for accessing games context
 * Provides access to games state and management methods
 *
 * Must be used within GamesProvider component
 */

import { useContext } from "react";
import { GamesContext } from "@/providers/GamesProvider";

/**
 * Access games context and functionality
 *
 * @throws Error if used outside GamesProvider
 * @returns Games context value with state and methods
 *
 * @example
 * ```typescript
 * function GamesList() {
 *   const { gamesState, openGame, submitLocalScore } = useGames();
 *
 *   return (
 *     <div>
 *       <h2>Available Games</h2>
 *       <button onClick={() => openGame('snake')}>
 *         Play Snake
 *       </button>
 *       {gamesState.isGameOpen && (
 *         <div>Game is open: {gamesState.currentGame}</div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Submit local score
 * const { submitLocalScore } = useGames();
 *
 * submitLocalScore('snake', {
 *   gameId: 'snake',
 *   score: 1250,
 *   username: 'Player1',
 *   timestamp: Date.now(),
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Submit on-chain score
 * const { submitOnChainScore } = useGames();
 *
 * const result = await submitOnChainScore(
 *   GameType.SNAKE,
 *   1250,
 *   'Player1',
 *   { level: 5, time: 180 }
 * );
 *
 * if (result.success) {
 *   console.log('Score submitted! TX:', result.transactionHash);
 * }
 * ```
 */
export function useGames() {
  const context = useContext(GamesContext);

  if (context === undefined) {
    throw new Error(
      "useGames must be used within GamesProvider. " +
        "Make sure your component is wrapped with <GamesProvider>."
    );
  }

  return context;
}
