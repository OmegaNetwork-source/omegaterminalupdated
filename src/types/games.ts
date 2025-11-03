/**
 * Games System Type Definitions
 *
 * Type definitions for the Omega Arcade games system including:
 * - Game types and metadata
 * - Leaderboard entries and scoring
 * - Arcade SDK configuration
 * - Game state management
 */

/**
 * Game types enum matching the on-chain leaderboard contract
 * Each game type corresponds to a specific game ID in the smart contract
 */
export enum GameType {
  FLAPPY_OMEGA = 0,
  OMEGA_BREAKER = 1,
  OMEGA_INVADERS = 2,
  OMEGA_IO = 3,
  OMEGA_PONG = 4,
  SPACE_OMEGA = 5,
  NUMBER_GUESS = 6,
  COOKIE_CLICKER = 7,
  SPEED_CLICKER = 8,
  SNAKE = 9,
  PERFECT_CIRCLE = 10,
  PACMAN = 11,
  BRICK_BREAKER = 12,
}

/**
 * Metadata for a single game
 * Contains all information needed to display and launch a game
 */
export interface GameMetadata {
  /** Unique identifier for the game (kebab-case) */
  id: string;
  /** Display name of the game */
  name: string;
  /** Game type enum value for contract integration */
  type: GameType;
  /** Category for organizing games */
  category: "arcade" | "casual" | "puzzle" | "action";
  /** Short description of the game */
  description: string;
  /** Terminal command to launch the game */
  command: string;
  /** Alternative command aliases */
  aliases: string[];
  /** Emoji icon for display */
  icon: string;
  /** Difficulty rating */
  difficulty: "easy" | "medium" | "hard";
  /** Whether the game supports on-chain leaderboard submission */
  hasOnChainLeaderboard: boolean;
}

/**
 * Score entry for local leaderboards (stored in localStorage)
 */
export interface GameScore {
  /** Game identifier */
  gameId: string;
  /** Player's score */
  score: number;
  /** Player's username or display name */
  username: string;
  /** Unix timestamp when score was achieved */
  timestamp: number;
  /** Optional additional game-specific data (e.g., level reached, time taken) */
  gameData?: Record<string, any>;
}

/**
 * Leaderboard entry from on-chain contract
 * Represents a score submitted to the blockchain
 */
export interface LeaderboardEntry {
  /** Rank position (1-based) */
  rank: number;
  /** Player's wallet address */
  player: string;
  /** Player's username */
  username: string;
  /** Score achieved */
  score: number;
  /** Unix timestamp when score was submitted */
  timestamp: number;
  /** Game type identifier */
  gameType: GameType;
  /** Serialized game data (JSON string) */
  gameData: string;
}

/**
 * Player statistics for a specific game
 * Retrieved from the on-chain contract
 */
export interface PlayerStats {
  /** Player's highest score */
  highScore: number;
  /** Total number of games played */
  gamesPlayed: number;
  /** Total cumulative score across all plays */
  totalScore: number;
  /** Unix timestamp of last play */
  lastPlayed: number;
  /** Current rank on leaderboard */
  rank: number;
}

/**
 * Games system state
 * Managed by GamesProvider for React state management
 */
export interface GamesState {
  /** Currently active game (null if no game is open) */
  currentGame: string | null;
  /** Whether a game modal is currently open */
  isGameOpen: boolean;
  /** Local leaderboards stored in localStorage (keyed by gameId) */
  localLeaderboards: Record<string, GameScore[]>;
  /** On-chain leaderboards fetched from contract (keyed by GameType) */
  onChainLeaderboards: Record<GameType, LeaderboardEntry[]>;
}

/**
 * Configuration for Arcade SDK initialization
 * Includes contract details and network configuration
 */
export interface ArcadeSDKConfig {
  /** Smart contract address on Omega Network */
  contractAddress: string;
  /** Contract ABI for ethers.js integration */
  contractABI: any[];
  /** Network configuration for wallet connection */
  networkConfig: {
    chainId: number;
    chainName: string;
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
}
