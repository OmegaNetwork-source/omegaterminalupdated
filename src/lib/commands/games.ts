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
import { getGameIcon, getChainIcon } from "@/lib/games/icons";

/**
 * Handle 'games list' command
 * Display all available games grouped by category
 */
async function handleList(context: CommandContext): Promise<void> {
  // List of working games (with actual implementations)
  const workingGameIds = new Set([
    "bashido",
    "pg-tanks",
    "snake",
    "number-guess",
    "cookie-clicker",
    "speed-clicker",
    "pacman",
    "brick-breaker",
    "perfect-circle",
  ]);

  // Separate games into working and coming soon
  const workingGames: typeof GAMES_METADATA = [];
  const comingSoonGames: typeof GAMES_METADATA = [];

  GAMES_METADATA.forEach((game) => {
    if (workingGameIds.has(game.id)) {
      workingGames.push(game);
    } else {
      comingSoonGames.push(game);
    }
  });

  // Generate HTML output with uniform styling
  let gamesHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        font-size: 18px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 20px;
        text-align: center;
        padding: 8px;
        border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        border-radius: 4px;
      ">
        ═══ 🎮 OMEGA ARCADE - Available Games 🎮 ═══
      </div>
  `;

  // Display working games first, grouped by category
  gamesHtml += `
      <div style="
        font-size: 16px;
        font-weight: bold;
        color: var(--palette-success, #16c782);
        margin: 24px 0 16px 0;
        padding: 8px 0;
        border-bottom: 2px solid var(--palette-success, #16c782);
      ">
        ✅ WORKING GAMES (${workingGames.length})
      </div>
  `;

  const categories: Array<"casual" | "arcade" | "puzzle" | "action"> = [
    "action",
    "casual",
    "arcade",
    "puzzle",
  ];

  for (const category of categories) {
    const games = workingGames.filter((g) => g.category === category);
    if (games.length === 0) continue;

    gamesHtml += `
      <div style="
        font-size: 14px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin: 20px 0 12px 0;
        padding: 4px 0;
        border-bottom: 1px solid var(--palette-border, rgba(0, 212, 255, 0.2));
      ">
        ${category.toUpperCase()} GAMES (${games.length})
      </div>
      <div style="margin-bottom: 16px;">
    `;

    for (const game of games) {
      // Create game card HTML with SVG icons
      const difficultyColor =
        game.difficulty === "easy"
          ? "var(--palette-success, #16c782)"
          : game.difficulty === "medium"
          ? "var(--palette-warning, #ffaa00)"
          : "var(--palette-error, #ff4d4f)";

      const iconSvg = getGameIcon(game.id, 48);
      const chainIconSvg = game.hasOnChainLeaderboard ? getChainIcon(16) : "";

      gamesHtml += `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        ">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="
              width: 48px;
              height: 48px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--palette-primary, #00bcf2);
              flex-shrink: 0;
            ">
              ${iconSvg}
            </div>
            <div style="flex: 1;">
              <div style="
                font-size: 16px;
                font-weight: 600;
                color: var(--palette-text, #ffffff);
                margin-bottom: 6px;
              ">
                ${game.name}
              </div>
              <div style="
                color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
                margin-bottom: 10px;
                font-size: 13px;
              ">
                ${game.description}
              </div>
              <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                <span style="
                  padding: 4px 10px;
                  border-radius: 6px;
                  font-size: 10px;
                  font-weight: 600;
                  background: color-mix(in srgb, ${difficultyColor} 15%, transparent);
                  color: ${difficultyColor};
                  border: 1px solid ${difficultyColor};
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">
                  ${game.difficulty}
                </span>
                ${
                  game.hasOnChainLeaderboard
                    ? `<span style="
                        display: inline-flex;
                        align-items: center;
                        color: var(--palette-primary, #00bcf2);
                        cursor: help;
                      " title="On-chain leaderboard">
                        ${chainIconSvg}
                      </span>`
                    : ""
                }
                <span style="color: color-mix(in srgb, var(--palette-text, #ffffff) 40%, transparent);">→</span>
                <code 
                  class="omega-help-command"
                  data-command="${game.command}"
                  style="
                    color: var(--palette-secondary, #00ff88);
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    padding: 2px 6px;
                    background: color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent);
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                  "
                  onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 20%, transparent)'; this.style.textShadow = '0 0 8px var(--palette-secondary-glow, rgba(0, 255, 136, 0.5))';"
                  onmouseout="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent)'; this.style.textShadow = 'none';"
                  title="Click to add '${game.command}' to terminal input"
                >
                  ${game.command}
                </code>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    gamesHtml += `</div>`;
  }

  // Display coming soon games grouped together
  if (comingSoonGames.length > 0) {
    gamesHtml += `
      <div style="
        font-size: 16px;
        font-weight: bold;
        color: var(--palette-warning, #ffaa00);
        margin: 32px 0 16px 0;
        padding: 8px 0;
        border-bottom: 2px solid var(--palette-warning, #ffaa00);
      ">
        🚧 COMING SOON (${comingSoonGames.length})
      </div>
      <div style="margin-bottom: 16px;">
    `;

    for (const game of comingSoonGames) {
      const difficultyColor =
        game.difficulty === "easy"
          ? "var(--palette-success, #16c782)"
          : game.difficulty === "medium"
          ? "var(--palette-warning, #ffaa00)"
          : "var(--palette-error, #ff4d4f)";

      const iconSvg = getGameIcon(game.id, 48);
      const chainIconSvg = game.hasOnChainLeaderboard ? getChainIcon(16) : "";

      gamesHtml += `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-warning, #ffaa00) 3%, transparent) 0%, color-mix(in srgb, var(--palette-warning, #ffaa00) 1%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-warning, #ffaa00) 15%, transparent));
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          opacity: 0.7;
        ">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="
              width: 48px;
              height: 48px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--palette-warning, #ffaa00);
              flex-shrink: 0;
            ">
              ${iconSvg}
            </div>
            <div style="flex: 1;">
              <div style="
                font-size: 16px;
                font-weight: 600;
                color: color-mix(in srgb, var(--palette-text, #ffffff) 80%, transparent);
                margin-bottom: 6px;
              ">
                ${game.name}
              </div>
              <div style="
                color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);
                margin-bottom: 10px;
                font-size: 13px;
              ">
                ${game.description}
              </div>
              <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                <span style="
                  padding: 4px 10px;
                  border-radius: 6px;
                  font-size: 10px;
                  font-weight: 600;
                  background: color-mix(in srgb, ${difficultyColor} 15%, transparent);
                  color: ${difficultyColor};
                  border: 1px solid ${difficultyColor};
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">
                  ${game.difficulty}
                </span>
                ${
                  game.hasOnChainLeaderboard
                    ? `<span style="
                        display: inline-flex;
                        align-items: center;
                        color: var(--palette-warning, #ffaa00);
                        cursor: help;
                      " title="On-chain leaderboard">
                        ${chainIconSvg}
                      </span>`
                    : ""
                }
                <span style="
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 10px;
                  background: color-mix(in srgb, var(--palette-warning, #ffaa00) 15%, transparent);
                  color: var(--palette-warning, #ffaa00);
                  border: 1px solid var(--palette-warning, #ffaa00);
                  text-transform: uppercase;
                ">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    gamesHtml += `</div>`;
  }

  gamesHtml += `
      <div style="
        margin-top: 24px;
        padding: 12px;
        border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        border-radius: 4px;
        text-align: center;
      ">
        <div style="
          color: var(--palette-primary, #00d4ff);
          font-weight: 600;
          margin-bottom: 8px;
        ">
          Total Games: ${GAMES_METADATA.length} (${workingGames.length} working, ${comingSoonGames.length} coming soon)
        </div>
        <div style="
          color: var(--palette-text, #e0e0e0);
          font-size: 12px;
          margin-top: 12px;
        ">
          <div style="margin-bottom: 4px;"><strong>Commands:</strong></div>
          <div style="margin-bottom: 2px;">games play &lt;name&gt;  - Launch a game</div>
          <div style="margin-bottom: 2px;">games scores [game] - View leaderboards</div>
          <div>games help         - Show detailed help</div>
        </div>
      </div>
    </div>
  `;

  context.logHtml(gamesHtml);
}

/**
 * Handle 'games play <name>' command
 * Launch a game (placeholder for Phase 15 integration)
 */
async function handlePlay(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Handle both "games play <game>" and "play <game>" formats
  const gameName = args[0]?.toLowerCase() === "play" 
    ? args[1] // "play snake" -> args[1] is "snake"
    : args[2]; // "games play snake" -> args[2] is "snake"

  if (!gameName) {
    // Generate HTML for usage message
    let usageHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="color: var(--palette-error, #ff4d4f); font-weight: 600; margin-bottom: 12px;">
          Usage: games play &lt;game-name&gt; or play &lt;game-name&gt;
        </div>
        <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 12px;">
          Available games:
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
    `;

    for (const game of GAMES_METADATA) {
      const iconSvg = getGameIcon(game.id, 24);
      usageHtml += `
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: color-mix(in srgb, var(--palette-primary, #00bcf2) 3%, transparent);
          border-radius: 6px;
        ">
          <div style="width: 24px; height: 24px; color: var(--palette-primary, #00bcf2);">
            ${iconSvg}
          </div>
          <div style="flex: 1;">
            <div style="color: var(--palette-text, #ffffff); font-weight: 600;">${game.name}</div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent); font-size: 11px;">
              ${game.command}
            </div>
          </div>
        </div>
      `;
    }

    usageHtml += `
        </div>
      </div>
    `;

    context.logHtml(usageHtml);
    return;
  }

  // Find game by ID or alias
  const game = getGameByIdOrAlias(gameName);

  if (!game) {
    // Generate HTML for available games list
    let gamesListHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="color: var(--palette-error, #ff4d4f); font-weight: 600; margin-bottom: 12px;">
          Game '${gameName}' not found.
        </div>
        <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 12px;">
          Available games:
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
    `;

    for (const g of GAMES_METADATA) {
      const iconSvg = getGameIcon(g.id, 24);
      gamesListHtml += `
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: color-mix(in srgb, var(--palette-primary, #00bcf2) 3%, transparent);
          border-radius: 6px;
        ">
          <div style="width: 24px; height: 24px; color: var(--palette-primary, #00bcf2);">
            ${iconSvg}
          </div>
          <div style="flex: 1;">
            <div style="color: var(--palette-text, #ffffff); font-weight: 600;">${g.name}</div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent); font-size: 11px;">
              ${g.aliases.join(", ")}
            </div>
          </div>
        </div>
      `;
    }

    gamesListHtml += `
        </div>
      </div>
    `;

    context.logHtml(gamesListHtml);

    return;
  }

  // Generate HTML output with SVG icon
  const iconSvg = getGameIcon(game.id, 64);
  const difficultyColor =
    game.difficulty === "easy"
      ? "var(--palette-success, #16c782)"
      : game.difficulty === "medium"
      ? "var(--palette-warning, #ffaa00)"
      : "var(--palette-error, #ff4d4f)";

  let gameInfoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        font-size: 18px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 20px;
        text-align: center;
        padding: 12px;
        border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      ">
        <div style="
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--palette-primary, #00bcf2);
        ">
          ${iconSvg}
        </div>
        <div>
          <div style="font-size: 20px;">${game.name}</div>
        </div>
      </div>
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 80%, transparent);
          margin-bottom: 16px;
          font-size: 14px;
        ">
          ${game.description}
        </div>
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          font-size: 12px;
        ">
          <div>
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Category:</div>
            <div style="color: var(--palette-text, #e0e0e0); text-transform: capitalize;">${game.category}</div>
          </div>
          <div>
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Difficulty:</div>
            <div style="color: ${difficultyColor}; font-weight: 600; text-transform: uppercase;">${game.difficulty}</div>
          </div>
          <div style="grid-column: span 2;">
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">On-chain leaderboard:</div>
            <div style="color: var(--palette-text, #e0e0e0);">
              ${game.hasOnChainLeaderboard ? "Yes " + getChainIcon(16) : "No"}
            </div>
          </div>
        </div>
      </div>
  `;

  // Game-specific instructions (shown before opening)
  let instructions = "";
  if (game.id === "snake") {
    instructions = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 12px; font-size: 14px;">Game Instructions:</div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
          <div style="margin-bottom: 4px;"><strong>Controls:</strong> Arrow keys or WASD to move</div>
          <div style="margin-bottom: 4px;"><strong>Objective:</strong> Eat food, avoid walls and yourself</div>
          <div><strong>Scoring:</strong> +10 points per food eaten</div>
        </div>
      </div>
    `;
  } else if (game.id === "pacman") {
    instructions = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 12px; font-size: 14px;">Game Instructions:</div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
          <div style="margin-bottom: 4px;"><strong>Controls:</strong> Arrow keys to move</div>
          <div style="margin-bottom: 4px;"><strong>Objective:</strong> Eat all dots, avoid ghosts</div>
          <div><strong>Scoring:</strong> Points for dots and power-ups</div>
        </div>
      </div>
    `;
  } else if (game.id === "cookie-clicker") {
    instructions = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 12px; font-size: 14px;">Game Instructions:</div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
          <div style="margin-bottom: 4px;"><strong>Controls:</strong> Click to collect cookies</div>
          <div style="margin-bottom: 4px;"><strong>Objective:</strong> Get as many cookies as possible</div>
          <div><strong>Features:</strong> Buy upgrades to automate production</div>
        </div>
      </div>
    `;
  } else if (game.id === "bashido") {
    instructions = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-secondary, #00ff88) 8%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 4%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-secondary, #00ff88) 25%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-secondary, #00ff88); font-weight: 600; margin-bottom: 12px; font-size: 14px;">⚔️ Bashido - Game Instructions:</div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
          <div style="margin-bottom: 6px;"><strong>Controls:</strong> Type terminal commands as fast as you can!</div>
          <div style="margin-bottom: 6px;"><strong>Objective:</strong> Master terminal commands through speed and accuracy</div>
          <div style="margin-bottom: 6px;"><strong>Features:</strong></div>
          <div style="margin-left: 12px; margin-bottom: 4px;">
            • Real-time typing speed (WPM)<br/>
            • Accuracy tracking<br/>
            • Progressive difficulty<br/>
            • Terminal command mastery
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 255, 136, 0.3)) 50%, transparent);">
            <strong>💡 Tip:</strong> Practice regularly to improve your command typing speed!
          </div>
        </div>
      </div>
    `;
  } else if (game.id === "pg-tanks") {
    instructions = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 12px; font-size: 14px;">🎯 Ravaged Planet - Game Instructions:</div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
          <div style="margin-bottom: 4px;"><strong>Controls:</strong></div>
          <div style="margin-left: 12px; margin-bottom: 8px;">
            • Arrow Keys: Adjust angle and power<br/>
            • SPACE: Fire projectile<br/>
            • A/D: Move tank left/right<br/>
            • Mouse: Click to aim and adjust power
          </div>
          <div style="margin-bottom: 4px;"><strong>Objective:</strong> Destroy all enemy tanks using artillery!</div>
          <div style="margin-bottom: 4px;"><strong>Game Modes:</strong> Free-for-All, Team Battle, Campaign</div>
          <div><strong>Scoring:</strong> +100 points per kill, bonus for remaining health</div>
        </div>
      </div>
    `;
  }

  gameInfoHtml += instructions;

  // Open the game modal
  if (context.games) {
    context.games.openGame(game.id);
    gameInfoHtml += `
      <div style="
        margin-top: 16px;
        padding: 16px;
        border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        border-radius: 8px;
        text-align: center;
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-success, #16c782) 10%, transparent) 0%, color-mix(in srgb, var(--palette-success, #16c782) 5%, transparent) 100%);
      ">
        <div style="
          color: var(--palette-success, #16c782);
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        ">
          🎮 Launching ${game.name}...
        </div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 12px;
        ">
          Game modal opening. Press ESC to close.
        </div>
      </div>
    `;
  } else {
    gameInfoHtml += `
      <div style="
        margin-top: 16px;
        padding: 16px;
        border: 1px solid var(--palette-border, rgba(255, 170, 0, 0.3));
        border-radius: 8px;
        text-align: center;
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-warning, #ffaa00) 10%, transparent) 0%, color-mix(in srgb, var(--palette-warning, #ffaa00) 5%, transparent) 100%);
      ">
        <div style="
          color: var(--palette-warning, #ffaa00);
          font-weight: 600;
          font-size: 14px;
        ">
          ⚠️ Games system not available
        </div>
      </div>
    `;
  }

  gameInfoHtml += `</div>`;
  context.logHtml(gameInfoHtml);
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
    const iconSvg = getGameIcon(game.id, 48);

    // Generate HTML output with SVG icon
    let leaderboardHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          font-size: 18px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 20px;
          text-align: center;
          padding: 12px;
          border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        ">
          <div style="
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--palette-primary, #00bcf2);
          ">
            ${iconSvg}
          </div>
          <div>🏆 ${game.name} Leaderboard 🏆</div>
        </div>
    `;

    if (leaderboard.length === 0) {
      leaderboardHtml += `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        ">
          <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 12px;">
            No scores yet. Be the first to play!
          </div>
          <code 
            class="omega-help-command"
            data-command="${game.command}"
            style="
              color: var(--palette-secondary, #00ff88);
              font-family: 'Courier New', monospace;
              font-size: 12px;
              padding: 4px 8px;
              background: color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent);
              border-radius: 4px;
              cursor: pointer;
            "
            title="Click to add '${game.command}' to terminal input"
          >
            ${game.command}
          </code>
        </div>
      `;
      leaderboardHtml += `</div>`;
      context.logHtml(leaderboardHtml);
      return;
    }

    // Create leaderboard table HTML
    leaderboardHtml += `
      <table style="
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        overflow: hidden;
      ">
        <thead>
          <tr style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 15%, transparent); border-bottom: 2px solid var(--palette-border, rgba(0, 212, 255, 0.3));">
            <th style="padding: 12px; color: var(--palette-primary, #00bcf2); text-align: left; font-weight: 600;">Rank</th>
            <th style="padding: 12px; color: var(--palette-primary, #00bcf2); text-align: left; font-weight: 600;">Player</th>
            <th style="padding: 12px; color: var(--palette-primary, #00bcf2); text-align: right; font-weight: 600;">Score</th>
            <th style="padding: 12px; color: var(--palette-primary, #00bcf2); text-align: right; font-weight: 600;">Date</th>
          </tr>
        </thead>
        <tbody>
    `;

    leaderboard.forEach((entry, index) => {
      const rank = index + 1;
      const rankColor = rank === 1 
        ? "var(--palette-warning, #ffaa00)" 
        : rank === 2 
        ? "var(--palette-text, #cccccc)" 
        : rank === 3
        ? "var(--palette-warning, #cd7f32)"
        : "var(--palette-text, #888888)";
      
      const rankBadge = rank <= 3 
        ? `<span style="color: ${rankColor}; font-size: 16px;">${rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}</span>`
        : `<span style="color: ${rankColor};">${rank}.</span>`;

      const date = new Date(entry.timestamp);
      const formattedDate = date.toLocaleDateString();

      leaderboardHtml += `
        <tr style="border-bottom: 1px solid var(--palette-border, rgba(0, 212, 255, 0.1));">
          <td style="padding: 12px; color: var(--palette-text, #ffffff); font-weight: 600;">${rankBadge}</td>
          <td style="padding: 12px; color: var(--palette-text, #ffffff);">${entry.username}</td>
          <td style="padding: 12px; color: var(--palette-secondary, #00ff88); text-align: right; font-weight: bold;">${entry.score.toLocaleString()}</td>
          <td style="padding: 12px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent); text-align: right;">${formattedDate}</td>
        </tr>
      `;
    });

    leaderboardHtml += `
        </tbody>
      </table>
      <div style="
        text-align: center;
        color: var(--palette-primary, #00bcf2);
        margin-top: 16px;
        font-size: 12px;
      ">
        Top ${leaderboard.length} scores shown
      </div>
    </div>
    `;

    context.logHtml(leaderboardHtml);
  } else {
    // Show summary of all game leaderboards
    let allLeaderboardsHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          font-size: 18px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 20px;
          text-align: center;
          padding: 8px;
          border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
          border-radius: 4px;
        ">
          🏆 All Games Leaderboards 🏆
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
    `;

    for (const game of GAMES_METADATA) {
      const leaderboard = context.games.getLocalLeaderboard(game.id, 1);

      if (leaderboard.length > 0) {
        const topScore = leaderboard[0];
        const iconSvg = getGameIcon(game.id, 32);
        allLeaderboardsHtml += `
          <div style="
            background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
            border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
            border-radius: 8px;
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <div style="
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--palette-primary, #00bcf2);
            ">
              ${iconSvg}
            </div>
            <div style="flex: 1;">
              <div style="color: var(--palette-text, #ffffff); font-weight: 600; margin-bottom: 4px;">
                ${game.name}
              </div>
              <div style="color: var(--palette-secondary, #00ff88); font-weight: 600;">
                ${topScore.score.toLocaleString()}
              </div>
            </div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent); font-size: 11px;">
              by ${topScore.username}
            </div>
          </div>
        `;
      }
    }

    allLeaderboardsHtml += `
        </div>
        <div style="
          margin-top: 20px;
          padding: 12px;
          border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
          border-radius: 4px;
          text-align: center;
        ">
          <div style="color: var(--palette-primary, #00d4ff); font-size: 12px;">
            Use "games scores &lt;game-name&gt;" to see full leaderboard
          </div>
        </div>
      </div>
    `;

    context.logHtml(allLeaderboardsHtml);
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
    const commandName = args[0]?.toLowerCase();
    const subcommand = args[1]?.toLowerCase();

    // Handle "play <game>" shortcut (when games command is invoked via "play" alias)
    if (commandName === "play" && subcommand && subcommand !== "list" && subcommand !== "scores" && subcommand !== "close" && subcommand !== "help") {
      // This is a direct game play command like "play snake"
      await handlePlay(context, args);
      return;
    }

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
