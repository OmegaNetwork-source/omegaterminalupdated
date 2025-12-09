/**
 * Yumi Pop Game Command
 * Terminal-optimized bubble popping game
 */

import type { Command, CommandHandler } from "@/types/commands";

const YUMI_COMMAND: Command = {
  name: "yumi",
  description: "Launch Yumi Pop - A terminal-optimized bubble popping game",
  usage: "yumi [start|help]",
  category: "games",
  handler: yumiCommandHandler,
};

function yumiCommandHandler(
  context: Parameters<CommandHandler>[0],
  args: string[]
): void {
  const subcommand = args[0]?.toLowerCase() || "start";

  switch (subcommand) {
    case "start":
    case "play":
      startYumiGame(context);
      break;
    case "help":
      showYumiHelp(context);
      break;
    default:
      context.output.error(`Unknown subcommand: ${subcommand}`);
      context.output.info("Use 'yumi help' for available commands");
  }
}

function startYumiGame(context: Parameters<CommandHandler>[0]): void {
  context.output.info("🎮 Launching Yumi Pop...");
  context.output.info("Use arrow keys to move, spacebar to shoot");
  context.output.info("Pop bubbles to score points!");
  
  // Use games system to open the game
  if (context.games) {
    context.games.openGame("yumi-pop");
  } else {
    context.output.error("Games system not available");
  }
}

function showYumiHelp(context: Parameters<CommandHandler>[0]): void {
  context.output.html(`
    <div style="padding: 16px; background: rgba(0, 0, 0, 0.8); border-radius: 8px; border: 1px solid var(--palette-primary, #00d4ff);">
      <h3 style="color: var(--palette-primary, #00d4ff); margin-bottom: 12px;">🎮 Yumi Pop Game</h3>
      <div style="line-height: 1.6; color: var(--palette-text, #ffffff);">
        <p><strong>Commands:</strong></p>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li><code>yumi start</code> - Launch the game</li>
          <li><code>yumi play</code> - Alias for start</li>
          <li><code>yumi help</code> - Show this help</li>
        </ul>
        <p style="margin-top: 12px;"><strong>Controls:</strong></p>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li>← → Arrow Keys - Move player</li>
          <li>Spacebar - Shoot projectiles</li>
          <li>ESC - Pause/Resume</li>
        </ul>
        <p style="margin-top: 12px;"><strong>Gameplay:</strong></p>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li>Pop bubbles to score points</li>
          <li>Bubbles split into smaller bubbles when hit</li>
          <li>Don't let bubbles reach the bottom!</li>
          <li>Collect power-ups for special abilities</li>
        </ul>
      </div>
    </div>
  `);
}

export const yumiCommand = YUMI_COMMAND;

