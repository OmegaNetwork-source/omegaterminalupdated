/**
 * Games Metadata Module
 *
 * Centralized game metadata for the Omega Arcade
 * Contains information about all available games including:
 * - Game IDs and names
 * - Categories and difficulty levels
 * - Command aliases
 * - Icons and descriptions
 * - Leaderboard support
 */

import { GameMetadata, GameType } from "@/types/games";

/**
 * Complete metadata for all available games in Omega Arcade
 * Includes both local games (localStorage leaderboards) and arcade games (on-chain leaderboards)
 */
export const GAMES_METADATA: GameMetadata[] = [
  // Working Games - Available Now
  
  // Action Games - Fast-paced combat
  {
    id: "bashido",
    name: "Bashido",
    type: GameType.BASHIDO,
    category: "action",
    description: "The Way of the Warrior - Master the samurai code through strategic terminal combat",
    command: "play bashido",
    aliases: ["bashido", "bash", "bushido", "samurai", "warrior"],
    icon: "⚔️",
    difficulty: "medium",
    hasOnChainLeaderboard: false,
  },
  {
    id: "pg-tanks",
    name: "PG Tanks (Ravaged Planet)",
    type: GameType.PG_TANKS,
    category: "action",
    description: "Scorched Earth-style artillery game - Destroy enemy tanks with precision shots",
    command: "play tanks",
    aliases: ["tanks", "tank", "pg", "ravaged", "ravaged-planet"],
    icon: "🎯",
    difficulty: "hard",
    hasOnChainLeaderboard: false,
  },
  {
    id: "forecast-arena",
    name: "Omega Forecast Arena",
    type: GameType.OMEGA_FORECAST_ARENA,
    category: "action",
    description: "Battle AI agents in prediction duels, join factions, and compete in forecasting challenges",
    command: "play forecast-arena",
    aliases: ["forecast", "arena", "omega-forecast", "forecast-arena"],
    icon: "🔮",
    difficulty: "medium",
    hasOnChainLeaderboard: false,
  },
  
  // Casual Games - Easy, relaxed gameplay
  {
    id: "number-guess",
    name: "Number Guessing",
    type: GameType.NUMBER_GUESS,
    category: "casual",
    description: "Guess the secret number between 1-100",
    command: "play guess",
    aliases: ["guess", "number"],
    icon: "🎲",
    difficulty: "easy",
    hasOnChainLeaderboard: false,
  },
  {
    id: "cookie-clicker",
    name: "Cookie Clicker",
    type: GameType.COOKIE_CLICKER,
    category: "casual",
    description: "Click cookies and buy upgrades",
    command: "play cookies",
    aliases: ["cookies", "clicker"],
    icon: "🍪",
    difficulty: "easy",
    hasOnChainLeaderboard: false,
  },

  // Arcade Games - Fast-paced action
  {
    id: "speed-clicker",
    name: "Speed Clicker",
    type: GameType.SPEED_CLICKER,
    category: "arcade",
    description: "Click as fast as you can in 10 seconds",
    command: "play speed",
    aliases: ["speed", "fast"],
    icon: "⚡",
    difficulty: "medium",
    hasOnChainLeaderboard: false,
  },
  {
    id: "yumi-pop",
    name: "Yumi Pop",
    type: GameType.YUMI_POP,
    category: "arcade",
    description: "Terminal-optimized bubble popping game - Pop bubbles before they reach the bottom!",
    command: "yumi start",
    aliases: ["yumi", "yumipop", "bubbles", "pop"],
    icon: "🫧",
    difficulty: "medium",
    hasOnChainLeaderboard: false,
  },
  {
    id: "snake",
    name: "Snake",
    type: GameType.SNAKE,
    category: "arcade",
    description: "Classic snake game with enemies",
    command: "play snake",
    aliases: ["snake"],
    icon: "🐍",
    difficulty: "medium",
    hasOnChainLeaderboard: false,
  },
  {
    id: "pacman",
    name: "Pac-Man",
    type: GameType.PACMAN,
    category: "arcade",
    description: "Classic maze game with ghosts",
    command: "play pacman",
    aliases: ["pacman", "pac"],
    icon: "👻",
    difficulty: "medium",
    hasOnChainLeaderboard: false,
  },
  {
    id: "brick-breaker",
    name: "Brick Breaker",
    type: GameType.BRICK_BREAKER,
    category: "arcade",
    description: "Break bricks with paddle and ball",
    command: "play bricks",
    aliases: ["bricks", "breaker"],
    icon: "🧱",
    difficulty: "medium",
    hasOnChainLeaderboard: false,
  },

  // Puzzle Games - Strategic thinking
  {
    id: "perfect-circle",
    name: "Perfect Circle",
    type: GameType.PERFECT_CIRCLE,
    category: "puzzle",
    description: "Draw the most perfect circle",
    command: "play circle",
    aliases: ["circle", "draw"],
    icon: "⭕",
    difficulty: "hard",
    hasOnChainLeaderboard: false,
  },

  // External Arcade Games (hosted on external platform)
  // These games have on-chain leaderboard support
  {
    id: "flappy-omega",
    name: "Flappy Omega",
    type: GameType.FLAPPY_OMEGA,
    category: "arcade",
    description: "Flappy Bird clone with Omega theme",
    command: "play flappy",
    aliases: ["flappy"],
    icon: "🐦",
    difficulty: "hard",
    hasOnChainLeaderboard: true,
  },
  {
    id: "omega-breaker",
    name: "Omega Breaker",
    type: GameType.OMEGA_BREAKER,
    category: "arcade",
    description: "Break bricks and collect power-ups",
    command: "play breaker",
    aliases: ["breaker"],
    icon: "🧱",
    difficulty: "medium",
    hasOnChainLeaderboard: true,
  },
  {
    id: "omega-invaders",
    name: "Omega Invaders",
    type: GameType.OMEGA_INVADERS,
    category: "action",
    description: "Space Invaders with Omega twist",
    command: "play invaders",
    aliases: ["invaders"],
    icon: "👾",
    difficulty: "medium",
    hasOnChainLeaderboard: true,
  },
  {
    id: "omega-io",
    name: "Omega.io",
    type: GameType.OMEGA_IO,
    category: "action",
    description: "Multiplayer arena survival",
    command: "play io",
    aliases: ["io"],
    icon: "⚔️",
    difficulty: "hard",
    hasOnChainLeaderboard: true,
  },
  {
    id: "omega-pong",
    name: "Omega Pong",
    type: GameType.OMEGA_PONG,
    category: "arcade",
    description: "Classic pong with modern graphics",
    command: "play pong",
    aliases: ["pong"],
    icon: "🏓",
    difficulty: "easy",
    hasOnChainLeaderboard: true,
  },
  {
    id: "space-omega",
    name: "Space Omega",
    type: GameType.SPACE_OMEGA,
    category: "action",
    description: "Space shooter with upgrades",
    command: "play space",
    aliases: ["space", "shooter"],
    icon: "🚀",
    difficulty: "hard",
    hasOnChainLeaderboard: true,
  },
];

/**
 * Get game metadata by ID or alias
 * Case-insensitive search through all games
 *
 * @param nameOrAlias - Game ID or any alias
 * @returns GameMetadata if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const game = getGameByIdOrAlias('snake');
 * // or
 * const game = getGameByIdOrAlias('pac'); // Finds pacman via alias
 * ```
 */
export function getGameByIdOrAlias(
  nameOrAlias: string
): GameMetadata | undefined {
  const searchTerm = nameOrAlias.toLowerCase().trim();

  return GAMES_METADATA.find(
    (game) =>
      game.id === searchTerm ||
      game.aliases.some((alias) => alias.toLowerCase() === searchTerm)
  );
}

/**
 * Get all games in a specific category
 *
 * @param category - Category to filter by ('arcade', 'casual', 'puzzle', 'action')
 * @returns Array of GameMetadata for the category
 *
 * @example
 * ```typescript
 * const arcadeGames = getGamesByCategory('arcade');
 * console.log(`Found ${arcadeGames.length} arcade games`);
 * ```
 */
export function getGamesByCategory(
  category: "arcade" | "casual" | "puzzle" | "action"
): GameMetadata[] {
  return GAMES_METADATA.filter((game) => game.category === category);
}

/**
 * Get all available games
 *
 * @returns Complete array of GameMetadata
 *
 * @example
 * ```typescript
 * const allGames = getAllGames();
 * console.log(`Total games: ${allGames.length}`);
 * ```
 */
export function getAllGames(): GameMetadata[] {
  return GAMES_METADATA;
}

/**
 * Get games by difficulty level
 *
 * @param difficulty - Difficulty level to filter by
 * @returns Array of GameMetadata for the difficulty
 *
 * @example
 * ```typescript
 * const easyGames = getGamesByDifficulty('easy');
 * ```
 */
export function getGamesByDifficulty(
  difficulty: "easy" | "medium" | "hard"
): GameMetadata[] {
  return GAMES_METADATA.filter((game) => game.difficulty === difficulty);
}

/**
 * Get games that support on-chain leaderboards
 *
 * @returns Array of GameMetadata with on-chain support
 *
 * @example
 * ```typescript
 * const competitiveGames = getOnChainGames();
 * ```
 */
export function getOnChainGames(): GameMetadata[] {
  return GAMES_METADATA.filter((game) => game.hasOnChainLeaderboard);
}

/**
 * Get local games (localStorage leaderboards only)
 *
 * @returns Array of GameMetadata for local games
 *
 * @example
 * ```typescript
 * const localGames = getLocalGames();
 * ```
 */
export function getLocalGames(): GameMetadata[] {
  return GAMES_METADATA.filter((game) => !game.hasOnChainLeaderboard);
}
