/**
 * Local Leaderboard Management Module
 *
 * Handles localStorage-based leaderboards for local games
 * Features:
 * - Persistent storage using localStorage
 * - Automatic sorting and ranking
 * - Top 100 scores per game
 * - Cross-session persistence
 * - Safe JSON parsing with error handling
 */

import { GameScore } from "@/types/games";

/**
 * Storage key for leaderboards in localStorage
 */
const LEADERBOARD_STORAGE_KEY = "omega-games-leaderboards";

/**
 * Maximum number of scores to keep per game
 */
const MAX_SCORES_PER_GAME = 100;

/**
 * Load all leaderboards from localStorage
 *
 * @returns Object with leaderboards keyed by gameId
 *
 * @example
 * ```typescript
 * const leaderboards = loadLeaderboards();
 * const snakeScores = leaderboards['snake'] || [];
 * ```
 */
export function loadLeaderboards(): Record<string, GameScore[]> {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || !window.localStorage) {
      return {};
    }

    const stored = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);

    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored);

    // Validate structure
    if (typeof parsed !== "object" || parsed === null) {
      console.warn("[Leaderboard] Invalid leaderboard data, resetting");
      return {};
    }

    return parsed as Record<string, GameScore[]>;
  } catch (error: any) {
    console.error("[Leaderboard] Failed to load leaderboards:", error.message);
    return {};
  }
}

/**
 * Save leaderboards to localStorage
 *
 * @param leaderboards - Leaderboards object to save
 *
 * @example
 * ```typescript
 * const leaderboards = loadLeaderboards();
 * leaderboards['snake'] = [...newScores];
 * saveLeaderboards(leaderboards);
 * ```
 */
export function saveLeaderboards(
  leaderboards: Record<string, GameScore[]>
): void {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    const serialized = JSON.stringify(leaderboards);
    window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, serialized);
  } catch (error: any) {
    console.error("[Leaderboard] Failed to save leaderboards:", error.message);
  }
}

/**
 * Add a score to a game's leaderboard
 * Automatically sorts and limits to top 100
 *
 * @param gameId - Game identifier
 * @param score - Score object to add
 *
 * @example
 * ```typescript
 * addScore('snake', {
 *   gameId: 'snake',
 *   score: 1250,
 *   username: 'Player1',
 *   timestamp: Date.now(),
 *   gameData: { level: 5 }
 * });
 * ```
 */
export function addScore(gameId: string, score: GameScore): void {
  try {
    // Load current leaderboards
    const leaderboards = loadLeaderboards();

    // Get or create array for this game
    if (!leaderboards[gameId]) {
      leaderboards[gameId] = [];
    }

    // Add new score
    leaderboards[gameId].push(score);

    // Sort by score (descending)
    leaderboards[gameId].sort((a, b) => b.score - a.score);

    // Limit to top 100
    if (leaderboards[gameId].length > MAX_SCORES_PER_GAME) {
      leaderboards[gameId] = leaderboards[gameId].slice(0, MAX_SCORES_PER_GAME);
    }

    // Save updated leaderboards
    saveLeaderboards(leaderboards);

    console.log("[Leaderboard] Score added:", {
      gameId,
      score: score.score,
      username: score.username,
      totalScores: leaderboards[gameId].length,
    });
  } catch (error: any) {
    console.error("[Leaderboard] Failed to add score:", error.message);
  }
}

/**
 * Get leaderboard for a specific game
 *
 * @param gameId - Game identifier
 * @param limit - Maximum number of entries to return (default 10)
 * @returns Array of top scores, or empty array if game not found
 *
 * @example
 * ```typescript
 * const topScores = getLeaderboard('snake', 10);
 * topScores.forEach((score, i) => {
 *   console.log(`${i + 1}. ${score.username}: ${score.score}`);
 * });
 * ```
 */
export function getLeaderboard(
  gameId: string,
  limit: number = 10
): GameScore[] {
  try {
    const leaderboards = loadLeaderboards();
    const scores = leaderboards[gameId] || [];

    // Return top N scores
    return scores.slice(0, limit);
  } catch (error: any) {
    console.error("[Leaderboard] Failed to get leaderboard:", error.message);
    return [];
  }
}

/**
 * Clear leaderboard for a specific game
 *
 * @param gameId - Game identifier
 *
 * @example
 * ```typescript
 * clearLeaderboard('snake');
 * ```
 */
export function clearLeaderboard(gameId: string): void {
  try {
    const leaderboards = loadLeaderboards();

    if (leaderboards[gameId]) {
      delete leaderboards[gameId];
      saveLeaderboards(leaderboards);
      console.log("[Leaderboard] Cleared leaderboard for:", gameId);
    }
  } catch (error: any) {
    console.error("[Leaderboard] Failed to clear leaderboard:", error.message);
  }
}

/**
 * Get all leaderboards
 *
 * @returns Complete leaderboards object
 *
 * @example
 * ```typescript
 * const allLeaderboards = getAllLeaderboards();
 * Object.keys(allLeaderboards).forEach(gameId => {
 *   console.log(`${gameId}: ${allLeaderboards[gameId].length} scores`);
 * });
 * ```
 */
export function getAllLeaderboards(): Record<string, GameScore[]> {
  return loadLeaderboards();
}

/**
 * Get player's best score for a game
 *
 * @param gameId - Game identifier
 * @param username - Player's username
 * @returns Highest score, or 0 if no scores found
 *
 * @example
 * ```typescript
 * const bestScore = getPlayerBestScore('snake', 'Player1');
 * console.log(`Your best: ${bestScore}`);
 * ```
 */
export function getPlayerBestScore(gameId: string, username: string): number {
  try {
    const leaderboard = getLeaderboard(gameId, MAX_SCORES_PER_GAME);
    const playerScores = leaderboard.filter(
      (score) => score.username === username
    );

    if (playerScores.length === 0) {
      return 0;
    }

    return Math.max(...playerScores.map((score) => score.score));
  } catch (error: any) {
    console.error(
      "[Leaderboard] Failed to get player best score:",
      error.message
    );
    return 0;
  }
}

/**
 * Get player's rank for a game
 *
 * @param gameId - Game identifier
 * @param username - Player's username
 * @returns Rank (1-based), or null if player has no scores
 *
 * @example
 * ```typescript
 * const rank = getPlayerRank('snake', 'Player1');
 * if (rank) {
 *   console.log(`Your rank: #${rank}`);
 * }
 * ```
 */
export function getPlayerRank(gameId: string, username: string): number | null {
  try {
    const leaderboard = getLeaderboard(gameId, MAX_SCORES_PER_GAME);
    const index = leaderboard.findIndex((score) => score.username === username);

    if (index === -1) {
      return null;
    }

    return index + 1; // Convert to 1-based rank
  } catch (error: any) {
    console.error("[Leaderboard] Failed to get player rank:", error.message);
    return null;
  }
}

/**
 * Get total number of scores across all games
 *
 * @returns Total count of all stored scores
 *
 * @example
 * ```typescript
 * const total = getTotalScoresCount();
 * console.log(`Total scores: ${total}`);
 * ```
 */
export function getTotalScoresCount(): number {
  try {
    const leaderboards = loadLeaderboards();
    return Object.values(leaderboards).reduce(
      (sum, scores) => sum + scores.length,
      0
    );
  } catch (error: any) {
    console.error(
      "[Leaderboard] Failed to get total scores count:",
      error.message
    );
    return 0;
  }
}

/**
 * Clear all leaderboards
 * WARNING: This cannot be undone!
 *
 * @example
 * ```typescript
 * clearAllLeaderboards();
 * ```
 */
export function clearAllLeaderboards(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
      console.log("[Leaderboard] All leaderboards cleared");
    }
  } catch (error: any) {
    console.error(
      "[Leaderboard] Failed to clear all leaderboards:",
      error.message
    );
  }
}
