/**
 * Forecast Arena Game Commands
 *
 * Commands for the Omega Forecast Arena game system
 */

import type { Command, CommandContext } from "@/types/commands";
import { parseFlags, getFlagString } from "@/lib/terminal/flag-parser";
import { useGames } from "@/hooks/useGames";
import {
  getPlayerState,
  getDailyGauntletState,
} from "@/lib/games/forecast-arena-state";
import { AI_AGENTS } from "@/lib/games/forecast-arena-agents";
import { openLootBox, rewardToInventoryItem, type LootBoxTier } from "@/lib/games/forecast-arena-loot";
import { addInventoryItem, spendCredits, addCredits } from "@/lib/games/forecast-arena-state";

// Helper to get games context (will be called from terminal context)
function getGamesContext(): any {
  // This will be injected by the terminal system
  if (typeof window !== "undefined" && (window as any).omegaGamesContext) {
    return (window as any).omegaGamesContext;
  }
  return null;
}

/**
 * game:start - Start a game session
 * Usage: game:start [--mode ai|duel|gauntlet] [--sector crypto|tech|politics]
 */
async function handleGameStart(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const mode = getFlagString(parsed.flags, "mode", "ai").toLowerCase();
  const sector = getFlagString(parsed.flags, "sector", "").toLowerCase();

  const gamesContext = getGamesContext();
  if (!gamesContext) {
    context.log("🔮 Opening Forecast Arena...", "info");
    // Open the game via the games system
    try {
      // Use the useGames hook pattern - but we need to call it from terminal
      // For now, we'll use a direct approach
      if (typeof window !== "undefined") {
        const event = new CustomEvent("omega:openGame", {
          detail: { gameId: "forecast-arena", mode, sector },
        });
        window.dispatchEvent(event);
      }
      context.log("✅ Forecast Arena opened! Use the game interface to play.", "success");
    } catch (error: any) {
      context.log(`❌ Error: ${error.message}`, "error");
    }
    return;
  }

  context.log(`🎮 Starting game session...`, "info");
  context.log(`Mode: ${mode}`, "output");
  if (sector) {
    context.log(`Sector: ${sector}`, "output");
  }
}

/**
 * game:duel - Challenge a user to a duel (placeholder)
 * Usage: game:duel @user
 */
async function handleGameDuel(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const opponent = args[1];
  if (!opponent) {
    context.log("❌ Usage: game:duel @user", "error");
    context.log("   Example: game:duel @alice", "info");
    return;
  }

  context.log(`⚔️ Challenge sent to ${opponent}`, "info");
  context.log("💡 PvP duels coming soon! For now, use game:start --mode ai", "info");
}

/**
 * game:gauntlet - Start daily prediction gauntlet
 * Usage: game:gauntlet
 */
async function handleGameGauntlet(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const gauntletState = getDailyGauntletState();
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (gauntletState.completed && gauntletState.lastCompleted > 0) {
    const timeUntilReset = oneDayMs - (now - gauntletState.lastCompleted);
    const hoursUntilReset = Math.floor(timeUntilReset / (60 * 60 * 1000));
    context.log("❌ Daily gauntlet already completed!", "error");
    context.log(`   Next gauntlet available in ${hoursUntilReset} hours`, "info");
    return;
  }

  context.log("🔥 Starting Prediction Gauntlet...", "info");
  context.log("   Open the Forecast Arena game to play!", "info");

  if (typeof window !== "undefined") {
    const event = new CustomEvent("omega:openGame", {
      detail: { gameId: "forecast-arena", mode: "gauntlet" },
    });
    window.dispatchEvent(event);
  }
}

/**
 * game:rank - Show leaderboard
 * Usage: game:rank [--global]
 */
async function handleGameRank(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const global = parsed.flags.some((f) => f.name === "global");

  context.log("📊 Forecast Arena Leaderboard", "info");
  context.log("", "output");

  // For now, show local stats
  const state = getPlayerState();

  let html = `
    <div style="
      font-family: 'Courier New', monospace;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        font-size: 16px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
      ">
        Your Stats
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div>Level: ${state.level}</div>
        <div>XP: ${state.xp}</div>
        <div>Battles Won: ${state.stats.battlesWon}</div>
        <div>Battles Lost: ${state.stats.battlesLost}</div>
        <div>Win Rate: ${state.stats.battlesWon + state.stats.battlesLost > 0 ? Math.round((state.stats.battlesWon / (state.stats.battlesWon + state.stats.battlesLost)) * 100) : 0}%</div>
        <div>Total Forecasts: ${state.stats.totalForecasts}</div>
        <div>Accuracy: ${state.stats.totalForecasts > 0 ? Math.round((state.stats.correctForecasts / state.stats.totalForecasts) * 100) : 0}%</div>
        <div>Best Streak: ${state.stats.bestStreak}</div>
      </div>
    </div>
  `;

  context.logHtml(html);

  if (global) {
    context.log("", "output");
    context.log("🌐 Global leaderboard coming soon!", "info");
  }
}

/**
 * game:xp - Display XP and credits
 * Usage: game:xp
 */
async function handleGameXP(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const state = getPlayerState();

  let html = `
    <div style="
      font-family: 'Courier New', monospace;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        font-size: 16px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
      ">
        Your Progress
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <div style="color: var(--palette-text-secondary, #888); margin-bottom: 4px;">Level</div>
          <div style="font-size: 24px; font-weight: bold; color: var(--palette-primary, #00d4ff);">${state.level}</div>
        </div>
        <div>
          <div style="color: var(--palette-text-secondary, #888); margin-bottom: 4px;">XP</div>
          <div style="font-size: 20px;">${state.xp.toLocaleString()}</div>
          <div style="font-size: 12px; color: var(--palette-text-secondary, #888);">
            Next level: ${Math.floor(Math.sqrt(state.xp / 100) + 1) * Math.floor(Math.sqrt(state.xp / 100) + 1) * 100 - state.xp} XP
          </div>
        </div>
        <div>
          <div style="color: var(--palette-text-secondary, #888); margin-bottom: 4px;">Credits</div>
          <div style="font-size: 20px; color: var(--palette-success, #16c782);">${state.credits.toLocaleString()}</div>
        </div>
        ${state.faction ? `<div><div style="color: var(--palette-text-secondary, #888); margin-bottom: 4px;">Faction</div><div>${state.faction}</div></div>` : ""}
      </div>
    </div>
  `;

  context.logHtml(html);
}

/**
 * loot:open - Open a loot box
 * Usage: loot:open [tier]
 */
async function handleLootOpen(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const tier = (args[1]?.toLowerCase() || "bronze") as LootBoxTier;
  const validTiers: LootBoxTier[] = ["bronze", "silver", "gold", "omega"];

  if (!validTiers.includes(tier)) {
    context.log("❌ Invalid tier. Use: bronze, silver, gold, or omega", "error");
    return;
  }

  const state = getPlayerState();
  const costs = { bronze: 100, silver: 250, gold: 500, omega: 1000 };
  const cost = costs[tier];

  if (state.credits < cost) {
    context.log(`❌ Insufficient credits! Need ${cost}, have ${state.credits}`, "error");
    return;
  }

  if (!spendCredits(cost)) {
    context.log("❌ Failed to spend credits", "error");
    return;
  }

  const reward = openLootBox(tier);
  const inventoryItem = rewardToInventoryItem(reward);
  addInventoryItem(inventoryItem);

  // Apply reward immediately if applicable
  if (reward.type === "credits") {
    addCredits(reward.value);
  }

  context.log(`📦 Opening ${tier} loot box...`, "info");
  context.log(`✅ Opened!`, "success");
  context.log(`   Reward: ${reward.name}`, "output");
  context.log(`   ${reward.description}`, "output");
  context.log(`   Value: ${reward.value}`, "output");

  if (reward.type === "credits") {
    context.log(`   +${reward.value} credits added to your account!`, "success");
  }
}

// Export commands
export const gameStartCommand: Command = {
  name: "game:start",
  aliases: ["gamestart"],
  description: "Start a Forecast Arena game session",
  usage: "game:start [--mode ai|duel|gauntlet] [--sector crypto|tech|politics]",
  category: "entertainment",
  handler: handleGameStart,
};

export const gameDuelCommand: Command = {
  name: "game:duel",
  aliases: ["duel"],
  description: "Challenge a user to a prediction duel",
  usage: "game:duel @user",
  category: "entertainment",
  handler: handleGameDuel,
};

export const gameGauntletCommand: Command = {
  name: "game:gauntlet",
  aliases: ["gauntlet"],
  description: "Start daily prediction gauntlet",
  usage: "game:gauntlet",
  category: "entertainment",
  handler: handleGameGauntlet,
};

export const gameRankCommand: Command = {
  name: "game:rank",
  aliases: ["rank"],
  description: "Show Forecast Arena leaderboard",
  usage: "game:rank [--global]",
  category: "entertainment",
  handler: handleGameRank,
};

export const gameXPCommand: Command = {
  name: "game:xp",
  aliases: ["xp", "stats"],
  description: "Display XP, credits, and progress",
  usage: "game:xp",
  category: "entertainment",
  handler: handleGameXP,
};

export const lootOpenCommand: Command = {
  name: "loot:open",
  aliases: ["loot", "openloot"],
  description: "Open a loot box",
  usage: "loot:open [bronze|silver|gold|omega]",
  category: "entertainment",
  handler: handleLootOpen,
};

export const gameArenaCommands: Command[] = [
  gameStartCommand,
  gameDuelCommand,
  gameGauntletCommand,
  gameRankCommand,
  gameXPCommand,
  lootOpenCommand,
];




