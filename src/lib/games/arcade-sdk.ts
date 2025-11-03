/**
 * Omega Arcade SDK
 *
 * TypeScript module for interacting with the Omega Arcade smart contract
 * Migrated from js/plugins/omega-arcade-sdk.js to TypeScript with ethers v6
 *
 * Features:
 * - Submit scores to on-chain leaderboard
 * - Fetch leaderboards for specific games
 * - Get player statistics
 * - Game information queries
 * - Username management
 */

import { Contract, BrowserProvider } from "ethers";
import config from "@/lib/config";
import { GameType, LeaderboardEntry, PlayerStats } from "@/types/games";
import { shortenAddress } from "@/lib/utils";

/**
 * Game names mapping for contract integration
 * Matches the GameType enum values to human-readable names
 */
const GAME_NAMES: Record<GameType, string> = {
  [GameType.FLAPPY_OMEGA]: "Flappy Omega",
  [GameType.OMEGA_BREAKER]: "Omega Breaker",
  [GameType.OMEGA_INVADERS]: "Omega Invaders",
  [GameType.OMEGA_IO]: "Omega.io",
  [GameType.OMEGA_PONG]: "Omega Pong",
  [GameType.SPACE_OMEGA]: "Space Omega",
  [GameType.NUMBER_GUESS]: "Number Guessing",
  [GameType.COOKIE_CLICKER]: "Cookie Clicker",
  [GameType.SPEED_CLICKER]: "Speed Clicker",
  [GameType.SNAKE]: "Snake",
  [GameType.PERFECT_CIRCLE]: "Perfect Circle",
  [GameType.PACMAN]: "Pac-Man",
  [GameType.BRICK_BREAKER]: "Brick Breaker",
};

/**
 * Initialize the Arcade SDK with a wallet provider
 *
 * @param provider - BrowserProvider from ethers v6
 * @returns Contract instance and account address, or null if initialization fails
 *
 * @example
 * ```typescript
 * const provider = new BrowserProvider(window.ethereum);
 * const sdk = await initializeSDK(provider);
 * if (sdk) {
 *   const { contract, account } = sdk;
 *   // Use contract to interact with leaderboard
 * }
 * ```
 */
export async function initializeSDK(
  provider: BrowserProvider
): Promise<{ contract: Contract; account: string } | null> {
  try {
    // Create contract instance with ABI and address from config
    const contract = new Contract(
      config.ARCADE_CONTRACT_ADDRESS,
      config.ARCADE_CONTRACT_ABI,
      provider
    );

    // Get signer (ethers v6 async API)
    const signer = await provider.getSigner();

    // Get account address
    const account = await signer.getAddress();

    // Connect contract to signer for write operations
    const contractWithSigner = contract.connect(signer) as Contract;

    return {
      contract: contractWithSigner,
      account,
    };
  } catch (error: any) {
    console.error("[Arcade SDK] Initialization failed:", error.message);
    return null;
  }
}

/**
 * Submit a score to the on-chain leaderboard
 *
 * @param contract - Contract instance from initializeSDK
 * @param gameType - Game type enum value
 * @param score - Player's score (must be positive)
 * @param username - Player's username (3-20 characters)
 * @param gameData - Optional additional game data (e.g., level, time)
 * @returns Result object with success status, transaction hash, and block number
 *
 * @example
 * ```typescript
 * const result = await submitScore(
 *   contract,
 *   GameType.SNAKE,
 *   1250,
 *   'Player123',
 *   { level: 5, time: 180 }
 * );
 * if (result.success) {
 *   console.log('Score submitted! TX:', result.transactionHash);
 * }
 * ```
 */
export async function submitScore(
  contract: Contract,
  gameType: GameType,
  score: number,
  username: string,
  gameData: Record<string, any> = {}
): Promise<{
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
}> {
  try {
    // Validate inputs
    if (score <= 0) {
      return {
        success: false,
        error: "Score must be positive",
      };
    }

    if (username.length < 3 || username.length > 20) {
      return {
        success: false,
        error: "Username must be 3-20 characters",
      };
    }

    // Validate game type dynamically using GameType enum
    const validGameTypes = Object.values(GameType).filter(
      (v) => typeof v === "number"
    ) as number[];
    const minGameType = Math.min(...validGameTypes);
    const maxGameType = Math.max(...validGameTypes);

    if (
      gameType < minGameType ||
      gameType > maxGameType ||
      GameType[gameType] === undefined
    ) {
      return {
        success: false,
        error: "Invalid game type",
      };
    }

    // Stringify game data
    const gameDataString = JSON.stringify(gameData);

    console.log("[Arcade SDK] Submitting score:", {
      gameType,
      score,
      username,
      gameData: gameDataString,
    });

    // Call contract method
    const tx = await contract.submitScore(
      gameType,
      score,
      username,
      gameDataString
    );

    console.log("[Arcade SDK] Transaction sent:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();

    console.log("[Arcade SDK] Score submitted successfully:", {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error: any) {
    console.error("[Arcade SDK] Score submission failed:", error);

    // Handle user rejection
    if (error.code === "ACTION_REJECTED" || error.code === 4001) {
      return {
        success: false,
        error: "Transaction rejected by user",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to submit score",
    };
  }
}

/**
 * Get leaderboard for a specific game
 *
 * @param contract - Contract instance from initializeSDK
 * @param gameType - Game type enum value
 * @param limit - Maximum number of entries to return (1-100, default 10)
 * @returns Result object with leaderboard entries
 *
 * @example
 * ```typescript
 * const result = await getLeaderboard(contract, GameType.SNAKE, 10);
 * if (result.success) {
 *   result.leaderboard.forEach((entry, i) => {
 *     console.log(`${i + 1}. ${entry.username}: ${entry.score}`);
 *   });
 * }
 * ```
 */
export async function getLeaderboard(
  contract: Contract,
  gameType: GameType,
  limit: number = 10
): Promise<{
  success: boolean;
  leaderboard?: LeaderboardEntry[];
  error?: string;
}> {
  try {
    // Validate game type dynamically using GameType enum
    const validGameTypes = Object.values(GameType).filter(
      (v) => typeof v === "number"
    ) as number[];
    const minGameType = Math.min(...validGameTypes);
    const maxGameType = Math.max(...validGameTypes);

    if (
      gameType < minGameType ||
      gameType > maxGameType ||
      GameType[gameType] === undefined
    ) {
      return {
        success: false,
        error: "Invalid game type",
      };
    }

    if (limit < 1 || limit > 100) {
      return {
        success: false,
        error: "Limit must be between 1 and 100",
      };
    }

    console.log("[Arcade SDK] Fetching leaderboard:", { gameType, limit });

    // Call contract method
    const entries = await contract.getLeaderboard(gameType, limit);

    // Map results to LeaderboardEntry array
    const leaderboard: LeaderboardEntry[] = entries.map(
      (entry: any, index: number) => ({
        rank: index + 1,
        player: entry.player,
        username: entry.username,
        score: Number(entry.score), // Convert BigInt to number
        timestamp: Number(entry.timestamp),
        gameType: Number(entry.gameType) as GameType,
        gameData: entry.gameData,
      })
    );

    console.log(
      "[Arcade SDK] Leaderboard fetched:",
      leaderboard.length,
      "entries"
    );

    return {
      success: true,
      leaderboard,
    };
  } catch (error: any) {
    console.error("[Arcade SDK] Leaderboard fetch failed:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch leaderboard",
    };
  }
}

/**
 * Get player statistics for a specific game
 *
 * @param contract - Contract instance from initializeSDK
 * @param playerAddress - Player's wallet address
 * @param gameType - Game type enum value
 * @returns Result object with player stats
 *
 * @example
 * ```typescript
 * const result = await getPlayerStats(contract, playerAddress, GameType.SNAKE);
 * if (result.success) {
 *   console.log('High score:', result.stats.highScore);
 *   console.log('Games played:', result.stats.gamesPlayed);
 * }
 * ```
 */
export async function getPlayerStats(
  contract: Contract,
  playerAddress: string,
  gameType: GameType
): Promise<{
  success: boolean;
  stats?: PlayerStats;
  error?: string;
}> {
  try {
    console.log("[Arcade SDK] Fetching player stats:", {
      playerAddress,
      gameType,
    });

    // Call contract method
    const stats = await contract.getPlayerStats(playerAddress, gameType);

    // Parse BigInt values to numbers
    const playerStats: PlayerStats = {
      highScore: Number(stats.highScore),
      gamesPlayed: Number(stats.gamesPlayed),
      totalScore: Number(stats.totalScore),
      lastPlayed: Number(stats.lastPlayed),
      rank: Number(stats.rank),
    };

    console.log("[Arcade SDK] Player stats fetched:", playerStats);

    return {
      success: true,
      stats: playerStats,
    };
  } catch (error: any) {
    console.error("[Arcade SDK] Player stats fetch failed:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch player stats",
    };
  }
}

/**
 * Get game information from the contract
 *
 * @param contract - Contract instance from initializeSDK
 * @param gameType - Game type enum value
 * @returns Result object with game info
 *
 * @example
 * ```typescript
 * const result = await getGameInfo(contract, GameType.SNAKE);
 * if (result.success) {
 *   console.log('Game:', result.info.name);
 *   console.log('Total players:', result.info.totalPlayers);
 * }
 * ```
 */
export async function getGameInfo(
  contract: Contract,
  gameType: GameType
): Promise<{
  success: boolean;
  info?: {
    name: string;
    totalPlayers: number;
    totalScores: number;
    highestScore: number;
  };
  error?: string;
}> {
  try {
    console.log("[Arcade SDK] Fetching game info:", gameType);

    // Call contract method
    const info = await contract.getGameInfo(gameType);

    const gameInfo = {
      name: info[0] || GAME_NAMES[gameType] || "Unknown Game",
      totalPlayers: Number(info[1]),
      totalScores: Number(info[2]),
      highestScore: Number(info[3]),
    };

    console.log("[Arcade SDK] Game info fetched:", gameInfo);

    return {
      success: true,
      info: gameInfo,
    };
  } catch (error: any) {
    console.error("[Arcade SDK] Game info fetch failed:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch game info",
    };
  }
}

/**
 * Get username for a player address
 *
 * @param contract - Contract instance from initializeSDK
 * @param playerAddress - Player's wallet address
 * @returns Username or fallback display name
 *
 * @example
 * ```typescript
 * const username = await getUsername(contract, playerAddress);
 * console.log('Player:', username);
 * ```
 */
export async function getUsername(
  contract: Contract,
  playerAddress: string
): Promise<string> {
  try {
    const username = await contract.playerUsernames(playerAddress);

    if (username && username.length > 0) {
      return username;
    }

    // Fallback to shortened address
    return `Player${shortenAddress(playerAddress)}`;
  } catch (error: any) {
    console.error("[Arcade SDK] Username fetch failed:", error);
    // Fallback to shortened address on error
    return `Player${shortenAddress(playerAddress)}`;
  }
}

// Export GAME_NAMES for external use
export { GAME_NAMES };
