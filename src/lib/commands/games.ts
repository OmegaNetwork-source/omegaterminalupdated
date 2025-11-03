/**
 * Games Commands Module
 *
 * Command handlers for the Omega Arcade games system
 * Migrated from js/plugins/terminal-games-system.js
 *
 * Commands:
 * - games list: Show all available games
 * - games play <name>: Launch a game (placeholder for Phase 15)
 * - games scores [game]: View leaderboards
 * - games close: Close current game
 * - games help: Show help information
 */

import type { Command, CommandContext } from "@/types/commands";
import {
  GAMES_METADATA,
  getGameByIdOrAlias,
  getGamesByCategory,
} from "@/lib/games/metadata";

/**
 * Handle 'games list' command
 * Display all available games grouped by category
 */
async function handleList(context: CommandContext): Promise<void> {
  context.log("=".repeat(60), "info");
  context.log("🎮 OMEGA ARCADE - Available Games 🎮", "success");
  context.log("=".repeat(60), "info");

  const categories: Array<"casual" | "arcade" | "puzzle" | "action"> = [
    "casual",
    "arcade",
    "puzzle",
    "action",
  ];

  for (const category of categories) {
    const games = getGamesByCategory(category);

    if (games.length === 0) continue;

    context.log("", "info");
    context.log(`${category.toUpperCase()} GAMES (${games.length})`, "info");
    context.log("-".repeat(60), "info");

    for (const game of games) {
      // Create game card HTML
      const difficultyColor =
        game.difficulty === "easy"
          ? "#00ff88"
          : game.difficulty === "medium"
          ? "#ffaa00"
          : "#ff3333";

      const cardHtml = `
        <div style="
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(0, 255, 153, 0.2);
          border-radius: 8px;
          padding: 15px;
          margin: 10px 0;
          transition: all 0.3s ease;
        ">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 48px;">${game.icon}</div>
            <div style="flex: 1;">
              <div style="font-size: 18px; font-weight: bold; color: #ffffff; margin-bottom: 5px;">
                ${game.name}
              </div>
              <div style="color: #cccccc; margin-bottom: 8px;">
                ${game.description}
              </div>
              <div style="display: flex; gap: 15px; align-items: center;">
                <span style="
                  padding: 3px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: bold;
                  background: rgba(0, 255, 153, 0.2);
                  color: ${difficultyColor};
                  border: 1px solid ${difficultyColor};
                ">
                  ${game.difficulty.toUpperCase()}
                </span>
                ${
                  game.hasOnChainLeaderboard
                    ? '<span title="On-chain leaderboard">⛓️</span>'
                    : ""
                }
                <span style="color: #888888;">→</span>
                <code style="color: #00ff99;">${game.command}</code>
              </div>
            </div>
          </div>
        </div>
      `;

      context.logHtml(cardHtml);
    }
  }

  context.log("", "info");
  context.log(`Total Games: ${GAMES_METADATA.length}`, "info");
  context.log("", "info");
  context.log("Commands:", "info");
  context.log("  games play <name>  - Launch a game", "info");
  context.log("  games scores [game] - View leaderboards", "info");
  context.log("  games help         - Show detailed help", "info");
}

/**
 * Handle 'games play <name>' command
 * Launch a game (placeholder for Phase 15 integration)
 */
async function handlePlay(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const gameName = args[2];

  if (!gameName) {
    context.log("Usage: games play <game-name>", "error");
    context.log("", "info");
    context.log("Available games:", "info");

    for (const game of GAMES_METADATA) {
      context.log(`  ${game.icon} ${game.name} - ${game.command}`, "info");
    }

    return;
  }

  // Find game by ID or alias
  const game = getGameByIdOrAlias(gameName);

  if (!game) {
    context.log(`Game '${gameName}' not found.`, "error");
    context.log("", "info");
    context.log("Available games:", "info");

    for (const g of GAMES_METADATA) {
      context.log(`  ${g.icon} ${g.name} - ${g.aliases.join(", ")}`, "info");
    }

    return;
  }

  // Log game info
  context.log("=".repeat(60), "info");
  context.log(`${game.icon} ${game.name} ${game.icon}`, "success");
  context.log("=".repeat(60), "info");
  context.log("", "info");
  context.log(game.description, "info");
  context.log("", "info");
  context.log("📋 Game Info:", "info");
  context.log(`  Category: ${game.category}`, "info");
  context.log(`  Difficulty: ${game.difficulty}`, "info");
  context.log(
    `  On-chain leaderboard: ${game.hasOnChainLeaderboard ? "Yes" : "No"}`,
    "info"
  );
  context.log("", "info");

  // Game modal UI placeholder message
  context.log("🎮 Game Modals Coming in Phase 15", "warning");
  context.log("", "info");
  context.log(
    "Full game integration with canvas rendering and interactive UI",
    "info"
  );
  context.log("will be available in Phase 15 (futuristic UI system).", "info");
  context.log("", "info");
  context.log("Features coming:", "info");
  context.log("  • Full-screen game modal with backdrop blur", "info");
  context.log("  • Canvas-based gameplay with smooth rendering", "info");
  context.log("  • Keyboard/mouse controls", "info");
  context.log("  • Real-time score tracking", "info");
  context.log("  • Local leaderboards (localStorage)", "info");
  context.log("  • Optional blockchain score submission", "info");
  context.log("", "info");
  context.log("Game instructions:", "info");

  // Game-specific instructions
  if (game.id === "snake") {
    context.log("  Controls: Arrow keys or WASD to move", "info");
    context.log("  Objective: Eat food, avoid walls and enemies", "info");
    context.log("  Scoring: +10 points per food eaten", "info");
  } else if (game.id === "pacman") {
    context.log("  Controls: Arrow keys to move", "info");
    context.log("  Objective: Eat all dots, avoid ghosts", "info");
    context.log("  Scoring: Points for dots and power-ups", "info");
  } else if (game.id === "cookie-clicker") {
    context.log("  Controls: Click to collect cookies", "info");
    context.log("  Objective: Get as many cookies as possible", "info");
    context.log("  Features: Buy upgrades to automate production", "info");
  } else {
    context.log("  See in-game instructions when launched", "info");
  }

  // Set game state (for future Phase 15 integration)
  if (context.games) {
    context.games.openGame(game.id);
    context.log("", "info");
    context.log(`Game state set: ${game.name} (${game.id})`, "success");
  }
}

/**
 * Handle 'games scores [game]' command
 * View leaderboards for a specific game or all games
 */
async function handleScores(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const gameName = args[2];

  if (!context.games) {
    context.log("Games system not available", "error");
    return;
  }

  if (gameName) {
    // Show leaderboard for specific game
    const game = getGameByIdOrAlias(gameName);

    if (!game) {
      context.log(`Game '${gameName}' not found.`, "error");
      return;
    }

    const leaderboard = context.games.getLocalLeaderboard(game.id, 10);

    context.log("=".repeat(60), "info");
    context.log(`🏆 ${game.name} Leaderboard 🏆`, "success");
    context.log("=".repeat(60), "info");

    if (leaderboard.length === 0) {
      context.log("", "info");
      context.log("No scores yet. Be the first to play!", "info");
      context.log("", "info");
      context.log(`Type: ${game.command}`, "info");
      return;
    }

    // Create leaderboard table HTML
    let tableHtml = `
      <table style="
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid rgba(0, 255, 153, 0.3);
      ">
        <thead>
          <tr style="background: rgba(0, 255, 153, 0.1); border-bottom: 2px solid rgba(0, 255, 153, 0.3);">
            <th style="padding: 10px; color: #00ff99; text-align: left;">Rank</th>
            <th style="padding: 10px; color: #00ff99; text-align: left;">Player</th>
            <th style="padding: 10px; color: #00ff99; text-align: right;">Score</th>
            <th style="padding: 10px; color: #00ff99; text-align: right;">Date</th>
          </tr>
        </thead>
        <tbody>
    `;

    leaderboard.forEach((entry, index) => {
      const rank = index + 1;
      const rankBadge =
        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;

      const date = new Date(entry.timestamp);
      const formattedDate = date.toLocaleDateString();

      tableHtml += `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
          <td style="padding: 10px; color: #ffffff;">${rankBadge}</td>
          <td style="padding: 10px; color: #ffffff;">${entry.username}</td>
          <td style="padding: 10px; color: #00ff99; text-align: right; font-weight: bold;">${entry.score.toLocaleString()}</td>
          <td style="padding: 10px; color: #888888; text-align: right;">${formattedDate}</td>
        </tr>
      `;
    });

    tableHtml += `
        </tbody>
      </table>
    `;

    context.logHtml(tableHtml);

    context.log("", "info");
    context.log(`Top ${leaderboard.length} scores shown`, "info");
  } else {
    // Show summary of all game leaderboards
    context.log("=".repeat(60), "info");
    context.log("🏆 All Games Leaderboards 🏆", "success");
    context.log("=".repeat(60), "info");

    for (const game of GAMES_METADATA) {
      const leaderboard = context.games.getLocalLeaderboard(game.id, 1);

      if (leaderboard.length > 0) {
        const topScore = leaderboard[0];
        context.log("", "info");
        context.log(
          `${game.icon} ${game.name}: ${topScore.score.toLocaleString()} by ${
            topScore.username
          }`,
          "info"
        );
      }
    }

    context.log("", "info");
    context.log(
      'Use "games scores <game-name>" to see full leaderboard',
      "info"
    );
  }
}

/**
 * Handle 'games close' command
 * Close the current game modal
 */
async function handleClose(context: CommandContext): Promise<void> {
  if (!context.games) {
    context.log("Games system not available", "error");
    return;
  }

  if (!context.games.state.isGameOpen) {
    context.log("No game is currently open", "warning");
    return;
  }

  context.games.closeGame();
  context.log("Game closed", "success");
}

/**
 * Handle 'games help' command
 * Show comprehensive help for games system
 */
async function handleHelp(context: CommandContext): Promise<void> {
  context.log("=".repeat(60), "info");
  context.log("🎮 OMEGA ARCADE - Help 🎮", "success");
  context.log("=".repeat(60), "info");
  context.log("", "info");

  context.log("📋 AVAILABLE COMMANDS", "info");
  context.log("-".repeat(60), "info");
  context.log("  games list           - Show all available games", "info");
  context.log("  games play <name>    - Launch a game", "info");
  context.log("  games scores [game]  - View leaderboards", "info");
  context.log("  games close          - Close current game", "info");
  context.log("  games help           - Show this help message", "info");
  context.log("", "info");

  context.log("🎯 GAME CATEGORIES", "info");
  context.log("-".repeat(60), "info");
  context.log(
    "  Casual: Easy, relaxed gameplay (Cookie Clicker, Number Guess)",
    "info"
  );
  context.log(
    "  Arcade: Fast-paced action (Snake, Pac-Man, Brick Breaker)",
    "info"
  );
  context.log("  Puzzle: Strategic thinking (Perfect Circle)", "info");
  context.log(
    "  Action: Intense gameplay (Space Omega, Omega Invaders)",
    "info"
  );
  context.log("", "info");

  context.log("🏆 LEADERBOARDS", "info");
  context.log("-".repeat(60), "info");
  context.log("  Local: Stored in browser localStorage (all games)", "info");
  context.log("  On-Chain: Blockchain leaderboards (select games)", "info");
  context.log("", "info");
  context.log("  Submission: Play games and submit high scores", "info");
  context.log("  Competition: Compete with players globally", "info");
  context.log("", "info");

  context.log("📝 EXAMPLES", "info");
  context.log("-".repeat(60), "info");
  context.log("  games list                  # Show all games", "info");
  context.log("  games play snake            # Play Snake game", "info");
  context.log("  games scores snake          # View Snake leaderboard", "info");
  context.log(
    "  play cookies                # Shortcut: play Cookie Clicker",
    "info"
  );
  context.log("", "info");

  context.log("💡 TIPS", "info");
  context.log("-".repeat(60), "info");
  context.log(
    '  • Use game aliases for quick access (e.g., "pac" for Pac-Man)',
    "info"
  );
  context.log("  • Scores are saved automatically in localStorage", "info");
  context.log("  • Some games support on-chain leaderboard submission", "info");
  context.log("  • Full game UI integration coming in Phase 15", "info");
}

/**
 * Games Command
 * Main command handler for games system
 */
export const gamesCommand: Command = {
  name: "games",
  aliases: ["play"],
  description: "Omega Arcade games system",
  usage: "games <list|play|scores|close|help> [game-name]",
  category: "entertainment",
  handler: async (context: CommandContext, args: string[]): Promise<void> => {
    const subcommand = args[1]?.toLowerCase();

    switch (subcommand) {
      case "list":
        await handleList(context);
        break;
      case "play":
        await handlePlay(context, args);
        break;
      case "scores":
        await handleScores(context, args);
        break;
      case "close":
        await handleClose(context);
        break;
      case "help":
        await handleHelp(context);
        break;
      default:
        // Default to list if no subcommand
        await handleList(context);
        break;
    }
  },
};

/**
 * Export games commands array
 */
export const gamesCommands: Command[] = [gamesCommand];
