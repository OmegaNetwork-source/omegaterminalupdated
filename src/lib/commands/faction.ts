/**
 * Faction Commands
 *
 * Commands for managing faction membership and faction wars
 */

import type { Command, CommandContext } from "@/types/commands";
import { parseFlags } from "@/lib/terminal/flag-parser";
import { createCommandLine, createUsageError } from "./command-output-helpers";
import {
  getPlayerState,
  setFaction,
  getFactionStats,
  addFactionControlPoints,
  incrementFactionMembers,
} from "@/lib/games/forecast-arena-state";
import {
  type FactionName,
  FACTIONS,
  type Sector,
  SECTORS,
} from "@/types/forecast-arena";

/**
 * faction:join - Join a faction
 * Usage: faction:join [name]
 */
async function handleFactionJoin(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const factionName = args[1]?.toUpperCase() || "";

  if (!factionName) {
    const usageHtml = createUsageError("faction:join <faction-name>", [
      "faction:join BULLS",
      "faction:join BEARS",
    ]);
    context.logHtml(usageHtml);
    context.log("   Available factions:", "info");
    FACTIONS.forEach((f) => {
      context.log(`   - ${f}`, "output");
    });
    return;
  }

  const validFaction = FACTIONS.find(
    (f) => f.toUpperCase() === factionName.toUpperCase()
  ) as FactionName | undefined;

  if (!validFaction) {
    context.log(`❌ Invalid faction: ${factionName}`, "error");
    context.log("   Available factions:", "info");
    FACTIONS.forEach((f) => {
      context.log(`   - ${f}`, "output");
    });
    return;
  }

  const state = getPlayerState();
  if (state.faction === validFaction) {
    context.log(`ℹ️ You are already a member of ${validFaction}`, "info");
    return;
  }

  if (state.faction) {
    context.log(`⚠️ Leaving ${state.faction} to join ${validFaction}...`, "info");
  }

  setFaction(validFaction);
  incrementFactionMembers(validFaction);

  context.log(`✅ Joined ${validFaction}!`, "success");
  const helpHtml = createCommandLine("faction:status", "See your faction's stats");
  context.logHtml(helpHtml);
}

/**
 * faction:status - Show faction stats and control points
 * Usage: faction:status
 */
async function handleFactionStatus(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const state = getPlayerState();
  const factionStats = getFactionStats();

  if (!state.faction) {
    context.log("❌ You are not in a faction", "error");
    const helpHtml = createCommandLine("faction:join <name>", "Join a faction");
    context.logHtml(helpHtml);
    return;
  }

  const stats = factionStats[state.faction as FactionName];
  if (!stats) {
    context.log("❌ Faction stats not found", "error");
    return;
  }

  let html = `
    <div style="
      font-family: 'Courier New', monospace;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        font-size: 18px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
      ">
        ${stats.name} Faction Status
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
        <div>
          <div style="color: var(--palette-text-secondary, #888); margin-bottom: 4px;">Members</div>
          <div style="font-size: 20px;">${stats.members}</div>
        </div>
        <div>
          <div style="color: var(--palette-text-secondary, #888); margin-bottom: 4px;">Control Points</div>
          <div style="font-size: 20px; color: var(--palette-success, #16c782);">${stats.controlPoints}</div>
        </div>
      </div>
      <div style="
        font-size: 14px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(0, 212, 255, 0.3);
      ">
        Territory Control
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
  `;

  SECTORS.forEach((sector) => {
    const points = stats.territories[sector] || 0;
    html += `
      <div style="
        display: flex;
        justify-content: space-between;
        padding: 8px;
        background: rgba(0, 212, 255, 0.05);
        border-radius: 4px;
      ">
        <span style="text-transform: capitalize;">${sector}</span>
        <span style="font-weight: bold; color: var(--palette-primary, #00d4ff);">${points} CP</span>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  context.logHtml(html);
}

/**
 * faction:attack - Contribute to faction territory control
 * Usage: faction:attack [sector]
 */
async function handleFactionAttack(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const sector = (args[1]?.toLowerCase() || "") as Sector;

  const state = getPlayerState();
  if (!state.faction) {
    context.log("❌ You must be in a faction to contribute", "error");
    const helpHtml = createCommandLine("faction:join <name>", "Join a faction");
    context.logHtml(helpHtml);
    return;
  }

  const validSector = SECTORS.find(
    (s) => s.toLowerCase() === sector.toLowerCase()
  ) as Sector | undefined;

  if (!validSector) {
    context.log("❌ Invalid sector", "error");
    context.log("   Available sectors:", "info");
    SECTORS.forEach((s) => {
      context.log(`   - ${s}`, "output");
    });
    return;
  }

  // Award control points based on player's forecast accuracy
  const accuracyBonus = state.stats.totalForecasts > 0
    ? Math.round((state.stats.correctForecasts / state.stats.totalForecasts) * 10)
    : 5;

  const points = 10 + accuracyBonus;
  addFactionControlPoints(state.faction as FactionName, validSector, points);

  context.log(`⚔️ Contributing to ${state.faction} territory control...`, "info");
  context.log(`   Sector: ${validSector}`, "output");
  context.log(`   Control Points: +${points}`, "success");
    const helpHtml = createCommandLine("faction:status", "See updated stats");
    context.logHtml(helpHtml);
}

/**
 * faction:leaderboard - Show faction rankings
 * Usage: faction:leaderboard
 */
async function handleFactionLeaderboard(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const factionStats = getFactionStats();

  // Sort factions by control points
  const sorted = FACTIONS.map((f) => ({
    name: f,
    ...factionStats[f as FactionName],
  })).sort((a, b) => b.controlPoints - a.controlPoints);

  let html = `
    <div style="
      font-family: 'Courier New', monospace;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        font-size: 18px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 20px;
        text-align: center;
      ">
        Faction Rankings
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
  `;

  sorted.forEach((faction, index) => {
    const rank = index + 1;
    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
    
    html += `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: rgba(0, 212, 255, ${rank <= 3 ? "0.15" : "0.05"});
        border: 1px solid rgba(0, 212, 255, ${rank <= 3 ? "0.5" : "0.3"});
        border-radius: 4px;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 20px;">${medal}</span>
          <span style="font-weight: bold; font-size: 16px;">${faction.name}</span>
        </div>
        <div style="display: flex; gap: 24px; align-items: center;">
          <div>
            <div style="font-size: 12px; color: var(--palette-text-secondary, #888);">Members</div>
            <div>${faction.members}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--palette-text-secondary, #888);">Control Points</div>
            <div style="font-weight: bold; color: var(--palette-success, #16c782);">${faction.controlPoints}</div>
          </div>
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  context.logHtml(html);
}

// Export commands
export const factionJoinCommand: Command = {
  name: "faction:join",
  aliases: ["joinfaction", "factionjoin"],
  description: "Join a faction",
  usage: "faction:join <faction-name>",
  category: "entertainment",
  handler: handleFactionJoin,
};

export const factionStatusCommand: Command = {
  name: "faction:status",
  aliases: ["factionstatus", "factionstats"],
  description: "Show faction stats and control points",
  usage: "faction:status",
  category: "entertainment",
  handler: handleFactionStatus,
};

export const factionAttackCommand: Command = {
  name: "faction:attack",
  aliases: ["factionattack", "contribute"],
  description: "Contribute to faction territory control",
  usage: "faction:attack [sector]",
  category: "entertainment",
  handler: handleFactionAttack,
};

export const factionLeaderboardCommand: Command = {
  name: "faction:leaderboard",
  aliases: ["factionleaderboard", "factionrank"],
  description: "Show faction rankings",
  usage: "faction:leaderboard",
  category: "entertainment",
  handler: handleFactionLeaderboard,
};

export const factionCommands: Command[] = [
  factionJoinCommand,
  factionStatusCommand,
  factionAttackCommand,
  factionLeaderboardCommand,
];


