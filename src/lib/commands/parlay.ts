/**
 * Parlay Commands
 * 
 * Terminal commands for the Omega Parlay Builder system.
 * Commands: parlay, parlay:create, parlay:list, parlay:view, parlay:templates, parlay:leaderboard
 */

import type { Command, CommandContext } from "@/types/commands";
import { parseFlags, getFlagString, getFlagNumber, getFlagBoolean } from "@/lib/terminal/flag-parser";

// =============================================================================
// Helper Functions
// =============================================================================

function formatOdds(odds: number): string {
  return `${odds.toFixed(2)}x`;
}

function formatMoney(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

function getRiskColor(level: string): string {
  switch (level) {
    case "low": return "#00c896";
    case "medium": return "#ffaa00";
    case "high": return "#ff6464";
    case "extreme": return "#ff3333";
    default: return "#888888";
  }
}

// =============================================================================
// Command Handlers
// =============================================================================

/**
 * Show parlay help
 */
function showParlayHelp(context: CommandContext): void {
  const html = `
    <div style="background: linear-gradient(135deg, rgba(0, 255, 214, 0.1), rgba(0, 0, 0, 0.3)); border: 2px solid rgba(0, 255, 214, 0.3); border-radius: 16px; padding: 24px; margin: 10px 0;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <span style="font-size: 32px;">🎯</span>
        <div>
          <div style="font-size: 24px; font-weight: bold; color: #00ffd6;">OMEGA PARLAY BUILDER</div>
          <div style="font-size: 14px; color: rgba(255, 255, 255, 0.6);">Cross-platform prediction market parlays</div>
        </div>
      </div>
      
      <div style="display: grid; gap: 12px;">
        <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 10px;">
          <div style="color: #00ffd6; font-weight: bold; margin-bottom: 8px;">📊 BUILDER COMMANDS</div>
          <div style="display: grid; gap: 8px; font-size: 13px;">
            <div><code style="color: #ffaa00;">parlay create</code> - Open the parlay builder UI</div>
            <div><code style="color: #ffaa00;">parlay list</code> - Show your lineups</div>
            <div><code style="color: #ffaa00;">parlay view &lt;id&gt;</code> - View lineup details</div>
            <div><code style="color: #ffaa00;">parlay delete &lt;id&gt;</code> - Delete a lineup</div>
          </div>
        </div>
        
        <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 10px;">
          <div style="color: #00ffd6; font-weight: bold; margin-bottom: 8px;">📋 DISCOVERY</div>
          <div style="display: grid; gap: 8px; font-size: 13px;">
            <div><code style="color: #ffaa00;">parlay templates</code> - Browse preset templates</div>
            <div><code style="color: #ffaa00;">parlay leaderboard</code> - Top performers</div>
            <div><code style="color: #ffaa00;">parlay calculate</code> - Calculate odds for legs</div>
          </div>
        </div>
        
        <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 10px;">
          <div style="color: #00ffd6; font-weight: bold; margin-bottom: 8px;">💰 ACTIONS</div>
          <div style="display: grid; gap: 8px; font-size: 13px;">
            <div><code style="color: #ffaa00;">parlay cashout &lt;id&gt;</code> - Early cashout</div>
            <div><code style="color: #ffaa00;">parlay share &lt;id&gt;</code> - Share lineup publicly</div>
            <div><code style="color: #ffaa00;">parlay copy &lt;id&gt;</code> - Copy someone's lineup</div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 16px; padding: 12px; background: rgba(0, 255, 214, 0.05); border-radius: 8px; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
        <strong style="color: #00ffd6;">💡 Tip:</strong> Use <code>parlay create</code> to open the visual builder, 
        or use <code>parlay calculate --markets pm:id1,ks:id2 --stake 100 --leverage 2</code> for quick calculations.
      </div>
    </div>
  `;

  context.logHtml(html);
}

/**
 * Open the parlay builder
 */
function openParlayBuilder(context: CommandContext): void {
  // Emit event to open builder
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("omega:open-parlay-builder"));
  }

  context.log("🎯 Opening Parlay Builder...", "success");
  context.log("", "output");
  context.log("Use the visual builder to:", "info");
  context.log("  • Search markets from Polymarket and Kalshi", "output");
  context.log("  • Select YES/NO positions for each market", "output");
  context.log("  • Set your stake and leverage", "output");
  context.log("  • See real-time odds and risk calculations", "output");
}

/**
 * List user's lineups
 */
async function listLineups(context: CommandContext, args: string[]): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const status = getFlagString(parsed.flags, "status", "");
  const limit = getFlagNumber(parsed.flags, "limit", 10);

  context.log("🎯 Loading your lineups...", "info");

  try {
    // Try to get lineups from localStorage
    let lineups: any[] = [];
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("omega:parlays");
      if (saved) {
        const parsed = JSON.parse(saved);
        lineups = parsed.lineups || [];
      }
    }

    // Filter by status if provided
    if (status) {
      lineups = lineups.filter((l: any) => l.status === status);
    }

    // Limit results
    lineups = lineups.slice(0, limit);

    if (lineups.length === 0) {
      const html = `
        <div style="background: rgba(0, 0, 0, 0.2); border: 1px dashed rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;">🎯</div>
          <div style="font-size: 16px; color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">No Lineups Found</div>
          <div style="font-size: 13px; color: rgba(255, 255, 255, 0.4);">
            Create your first parlay with <code style="color: #00ffd6;">parlay create</code>
          </div>
        </div>
      `;
      context.logHtml(html);
      return;
    }

    // Build HTML table
    const rows = lineups.map((lineup: any) => {
      const pnlColor = lineup.pnl >= 0 ? "#00c896" : "#ff6464";
      const pnlSign = lineup.pnl >= 0 ? "+" : "";

      return `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
          <td style="padding: 12px;">${lineup.name}</td>
          <td style="padding: 12px; text-transform: uppercase; color: ${
            lineup.status === "active" ? "#00ffd6" :
            lineup.status === "won" ? "#00c896" :
            lineup.status === "lost" ? "#ff6464" : "#888"
          };">${lineup.status}</td>
          <td style="padding: 12px;">${lineup.legCount} legs</td>
          <td style="padding: 12px; color: #00ffd6;">${formatOdds(lineup.totalOdds)}</td>
          <td style="padding: 12px;">${formatMoney(lineup.stake)}</td>
          <td style="padding: 12px; color: ${pnlColor};">${pnlSign}${formatMoney(Math.abs(lineup.pnl))}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <div style="background: linear-gradient(135deg, rgba(0, 255, 214, 0.05), rgba(0, 0, 0, 0.2)); border: 1px solid rgba(0, 255, 214, 0.2); border-radius: 12px; overflow: hidden;">
        <div style="padding: 16px; border-bottom: 1px solid rgba(0, 255, 214, 0.2); background: rgba(0, 255, 214, 0.03);">
          <div style="font-size: 18px; font-weight: bold; color: #00ffd6;">🎯 Your Lineups</div>
          <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5);">${lineups.length} lineup(s) found</div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: rgba(0, 0, 0, 0.2); color: rgba(255, 255, 255, 0.5); font-size: 11px; text-transform: uppercase;">
              <th style="padding: 10px; text-align: left;">Name</th>
              <th style="padding: 10px; text-align: left;">Status</th>
              <th style="padding: 10px; text-align: left;">Legs</th>
              <th style="padding: 10px; text-align: left;">Odds</th>
              <th style="padding: 10px; text-align: left;">Stake</th>
              <th style="padding: 10px; text-align: left;">P&L</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    context.logHtml(html);
    context.log("", "output");
    context.log('💡 Use "parlay view <name>" to see lineup details', "info");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * View lineup details
 */
async function viewLineup(context: CommandContext, args: string[]): Promise<void> {
  const lineupId = args[2];

  if (!lineupId) {
    context.log("❌ Usage: parlay view <lineup-id>", "error");
    return;
  }

  context.log(`🔍 Loading lineup: ${lineupId}...`, "info");

  try {
    // Get lineup from localStorage
    let lineup: any = null;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("omega:parlays");
      if (saved) {
        const parsed = JSON.parse(saved);
        const lineups = parsed.lineups || [];
        lineup = lineups.find((l: any) => 
          l.id === lineupId || 
          l.name.toLowerCase() === lineupId.toLowerCase()
        );
      }
    }

    if (!lineup) {
      context.log(`❌ Lineup not found: ${lineupId}`, "error");
      return;
    }

    const pnlColor = lineup.pnl >= 0 ? "#00c896" : "#ff6464";
    const pnlSign = lineup.pnl >= 0 ? "+" : "";
    const riskColor = getRiskColor(lineup.risk?.level || "medium");

    // Build legs HTML
    const legsHtml = lineup.legs.map((leg: any) => {
      const statusIcon = leg.status === "won" ? "✓" : leg.status === "lost" ? "✗" : "○";
      const statusColor = leg.status === "won" ? "#00c896" : leg.status === "lost" ? "#ff6464" : "#888";
      const sideColor = leg.side === "yes" ? "#00c896" : "#ff6464";

      return `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255, 255, 255, 0.02); border-radius: 8px;">
          <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: ${statusColor}22; color: ${statusColor}; font-size: 12px; font-weight: bold;">
            ${statusIcon}
          </div>
          <div style="flex: 1;">
            <div style="font-size: 13px; color: #fff;">${leg.question}</div>
            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.5);">
              <span style="color: ${sideColor}; font-weight: bold;">${leg.side.toUpperCase()}</span>
              • ${leg.venue}
              • ${formatOdds(leg.decimalOdds)}
            </div>
          </div>
        </div>
      `;
    }).join("");

    const html = `
      <div style="background: linear-gradient(135deg, rgba(0, 255, 214, 0.08), rgba(0, 0, 0, 0.3)); border: 2px solid rgba(0, 255, 214, 0.3); border-radius: 16px; padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #ffffff;">${lineup.name}</div>
            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.4);">
              ID: ${lineup.id} • Created: ${new Date(lineup.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div style="padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; background: ${
            lineup.status === "active" ? "rgba(0, 255, 214, 0.2)" :
            lineup.status === "won" ? "rgba(0, 200, 150, 0.2)" :
            lineup.status === "lost" ? "rgba(255, 100, 100, 0.2)" : "rgba(255, 255, 255, 0.1)"
          }; color: ${
            lineup.status === "active" ? "#00ffd6" :
            lineup.status === "won" ? "#00c896" :
            lineup.status === "lost" ? "#ff6464" : "#888"
          };">${lineup.status}</div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; padding: 16px; background: rgba(0, 0, 0, 0.2); border-radius: 10px;">
          <div style="text-align: center;">
            <div style="font-size: 10px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; margin-bottom: 4px;">Stake</div>
            <div style="font-size: 18px; font-weight: bold; color: #fff;">${formatMoney(lineup.stake)}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 10px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; margin-bottom: 4px;">Leverage</div>
            <div style="font-size: 18px; font-weight: bold; color: #fff;">${lineup.leverage}x</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 10px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; margin-bottom: 4px;">Total Odds</div>
            <div style="font-size: 18px; font-weight: bold; color: #00ffd6;">${formatOdds(lineup.totalOdds)}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 10px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; margin-bottom: 4px;">Potential</div>
            <div style="font-size: 18px; font-weight: bold; color: #00c896;">${formatMoney(lineup.potentialPayout)}</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 16px; margin-bottom: 20px;">
          <div style="flex: 1; padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 8px;">
            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin-bottom: 4px;">Current P&L</div>
            <div style="font-size: 20px; font-weight: bold; color: ${pnlColor};">${pnlSign}${formatMoney(Math.abs(lineup.pnl))} (${pnlSign}${lineup.pnlPercent.toFixed(1)}%)</div>
          </div>
          <div style="flex: 1; padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 8px;">
            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin-bottom: 4px;">Risk Score</div>
            <div style="font-size: 20px; font-weight: bold; color: ${riskColor};">${lineup.risk?.score || 0}/100 <span style="font-size: 12px; text-transform: uppercase;">${lineup.risk?.level || "unknown"}</span></div>
          </div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <div style="font-size: 14px; font-weight: bold; color: #00ffd6; margin-bottom: 12px;">📊 Legs (${lineup.legs.length})</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${legsHtml}
          </div>
        </div>
        
        ${lineup.canCashout ? `
          <div style="padding: 12px; background: rgba(0, 255, 214, 0.05); border: 1px solid rgba(0, 255, 214, 0.2); border-radius: 8px;">
            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">
              💰 <strong style="color: #00ffd6;">Cashout Available:</strong> ${formatMoney(lineup.currentValue * 0.95)} (5% fee)
            </div>
            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin-top: 4px;">
              Use <code>parlay cashout ${lineup.id}</code> to cash out early
            </div>
          </div>
        ` : ""}
      </div>
    `;

    context.logHtml(html);
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Show templates
 */
async function showTemplates(context: CommandContext): Promise<void> {
  context.log("📋 Loading parlay templates...", "info");

  try {
    const response = await fetch("/api/parlays/templates");
    
    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }

    const data = await response.json();
    const templates = data.templates || [];

    const templatesHtml = templates.map((template: any) => `
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 16px; cursor: pointer;" onclick="window.dispatchEvent(new CustomEvent('omega:use-template', { detail: '${template.id}' }))">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">${template.icon}</span>
            <div>
              <div style="font-size: 15px; font-weight: bold; color: #fff;">${template.name}</div>
              <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5);">${template.description}</div>
            </div>
          </div>
          <div style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; background: ${getRiskColor(template.riskLevel)}22; color: ${getRiskColor(template.riskLevel)};">
            ${template.riskLevel}
          </div>
        </div>
        <div style="display: flex; gap: 16px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">
          <span>📊 ${template.slots.length} slots</span>
          <span>💰 $${template.suggestedStake} stake</span>
          <span>⚡ ${template.suggestedLeverage}x leverage</span>
          <span>📈 ${template.avgReturn}% avg return</span>
          <span>✓ ${template.successRate}% win rate</span>
        </div>
      </div>
    `).join("");

    const html = `
      <div style="background: linear-gradient(135deg, rgba(0, 255, 214, 0.05), rgba(0, 0, 0, 0.2)); border: 1px solid rgba(0, 255, 214, 0.2); border-radius: 12px; padding: 20px;">
        <div style="font-size: 20px; font-weight: bold; color: #00ffd6; margin-bottom: 16px;">📋 Parlay Templates</div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${templatesHtml}
        </div>
        <div style="margin-top: 16px; padding: 12px; background: rgba(0, 255, 214, 0.03); border-radius: 8px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">
          💡 Click a template to start building, or use <code style="color: #00ffd6;">parlay create</code> to build from scratch
        </div>
      </div>
    `;

    context.logHtml(html);
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Show leaderboard
 */
async function showLeaderboard(context: CommandContext, args: string[]): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const timeframe = getFlagString(parsed.flags, "timeframe", "30d");
  const limit = getFlagNumber(parsed.flags, "limit", 10);

  context.log(`🏆 Loading leaderboard (${timeframe})...`, "info");

  try {
    const response = await fetch(`/api/parlays/leaderboard?timeframe=${timeframe}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard");
    }

    const data = await response.json();
    const entries = data.leaderboard || [];

    const rows = entries.map((entry: any, index: number) => {
      const medalEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
      const pnlColor = entry.totalPnl >= 0 ? "#00c896" : "#ff6464";

      return `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
          <td style="padding: 12px; text-align: center; font-size: 16px;">${medalEmoji}</td>
          <td style="padding: 12px;">
            <div style="font-weight: bold; color: #fff;">${entry.displayName}</div>
            <div style="font-size: 10px; color: rgba(255, 255, 255, 0.4);">${entry.address.slice(0, 6)}...${entry.address.slice(-4)}</div>
          </td>
          <td style="padding: 12px; text-align: center;">${entry.totalLineups}</td>
          <td style="padding: 12px; text-align: center; color: #00c896;">${entry.winRate}%</td>
          <td style="padding: 12px; text-align: center; color: ${pnlColor};">${formatMoney(entry.totalPnl)}</td>
          <td style="padding: 12px; text-align: center;">${entry.avgReturn}%</td>
        </tr>
      `;
    }).join("");

    const html = `
      <div style="background: linear-gradient(135deg, rgba(0, 255, 214, 0.05), rgba(0, 0, 0, 0.2)); border: 1px solid rgba(0, 255, 214, 0.2); border-radius: 12px; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid rgba(0, 255, 214, 0.2); background: rgba(0, 255, 214, 0.03);">
          <div style="font-size: 20px; font-weight: bold; color: #00ffd6;">🏆 Parlay Leaderboard</div>
          <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5);">Top performers (${timeframe})</div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: rgba(0, 0, 0, 0.2); color: rgba(255, 255, 255, 0.5); font-size: 11px; text-transform: uppercase;">
              <th style="padding: 10px; width: 40px;">Rank</th>
              <th style="padding: 10px; text-align: left;">Trader</th>
              <th style="padding: 10px; text-align: center;">Lineups</th>
              <th style="padding: 10px; text-align: center;">Win Rate</th>
              <th style="padding: 10px; text-align: center;">Total P&L</th>
              <th style="padding: 10px; text-align: center;">Avg Return</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    context.logHtml(html);
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Calculate parlay odds
 */
async function calculateOdds(context: CommandContext, args: string[]): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const marketsArg = getFlagString(parsed.flags, "markets", "");
  const stake = getFlagNumber(parsed.flags, "stake", 100);
  const leverage = getFlagNumber(parsed.flags, "leverage", 1) as 1 | 2 | 3 | 4 | 5;

  if (!marketsArg) {
    context.log("❌ Usage: parlay calculate --markets pm:id1,ks:id2 --stake 100 --leverage 2", "error");
    context.log("", "output");
    context.log("Format: <venue>:<marketId>", "info");
    context.log("  pm: = Polymarket", "output");
    context.log("  ks: = Kalshi", "output");
    return;
  }

  // Parse markets
  const marketParts = marketsArg.split(",").map((m) => {
    const [venuePrefix, marketId] = m.split(":");
    const venue = venuePrefix === "pm" ? "polymarket" : venuePrefix === "ks" ? "kalshi" : venuePrefix;
    return { marketId, venue, side: "yes" as const };
  });

  context.log("🔢 Calculating parlay odds...", "info");

  try {
    const response = await fetch("/api/parlays/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ legs: marketParts, stake, leverage }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Calculation failed");
    }

    const data = await response.json();

    const html = `
      <div style="background: linear-gradient(135deg, rgba(0, 255, 214, 0.1), rgba(0, 0, 0, 0.3)); border: 2px solid rgba(0, 255, 214, 0.3); border-radius: 16px; padding: 24px;">
        <div style="font-size: 20px; font-weight: bold; color: #00ffd6; margin-bottom: 20px;">🔢 Parlay Calculation</div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
          <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 10px; text-align: center;">
            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; margin-bottom: 4px;">Total Odds</div>
            <div style="font-size: 28px; font-weight: bold; color: #00ffd6;">${data.totalOdds}x</div>
          </div>
          <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 10px; text-align: center;">
            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; margin-bottom: 4px;">Win Probability</div>
            <div style="font-size: 28px; font-weight: bold; color: #ffaa00;">${data.impliedProbability}%</div>
          </div>
          <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 10px; text-align: center;">
            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; margin-bottom: 4px;">Potential Payout</div>
            <div style="font-size: 28px; font-weight: bold; color: #00c896;">${formatMoney(data.potentialPayout)}</div>
          </div>
        </div>
        
        <div style="padding: 12px; background: rgba(${getRiskColor(data.risk.level).slice(1).match(/.{2}/g)?.map(h => parseInt(h, 16)).join(", ")}, 0.1); border: 1px solid ${getRiskColor(data.risk.level)}44; border-radius: 8px;">
          <div style="font-size: 12px; color: ${getRiskColor(data.risk.level)};">
            ⚠️ Risk Level: <strong>${data.risk.level.toUpperCase()}</strong> (${data.risk.score}/100)
          </div>
          ${data.risk.warnings.length > 0 ? `
            <div style="margin-top: 8px; font-size: 11px; color: rgba(255, 255, 255, 0.5);">
              ${data.risk.warnings.map((w: string) => `• ${w}`).join("<br/>")}
            </div>
          ` : ""}
        </div>
      </div>
    `;

    context.logHtml(html);
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

// =============================================================================
// Main Command
// =============================================================================

export const parlayCommand: Command = {
  name: "parlay",
  description: "Omega Parlay Builder - Cross-platform prediction market parlays",
  usage: "parlay <create|list|view|templates|leaderboard|calculate|help> [options]",
  category: "markets",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showParlayHelp(context);
      return;
    }

    switch (subcommand) {
      case "create":
      case "new":
      case "build":
        openParlayBuilder(context);
        break;

      case "list":
      case "ls":
        await listLineups(context, args);
        break;

      case "view":
      case "show":
      case "get":
        await viewLineup(context, args);
        break;

      case "templates":
      case "presets":
        await showTemplates(context);
        break;

      case "leaderboard":
      case "lb":
      case "top":
        await showLeaderboard(context, args);
        break;

      case "calculate":
      case "calc":
        await calculateOdds(context, args);
        break;

      case "cashout":
        context.log("💰 Cashout functionality coming soon!", "info");
        context.log("   Use the visual builder to cash out lineups", "output");
        break;

      case "share":
        context.log("📤 Share functionality coming soon!", "info");
        break;

      default:
        context.log(`❌ Unknown subcommand: ${subcommand}`, "error");
        context.log('   Use "parlay help" for available commands', "info");
    }
  },
};

// Aliases
export const parlayCreateCommand: Command = {
  name: "parlay:create",
  description: "Open the parlay builder",
  usage: "parlay:create",
  category: "markets",
  handler: async (context: CommandContext, args: string[]) => {
    openParlayBuilder(context);
  },
};

export const parlayListCommand: Command = {
  name: "parlay:list",
  description: "List your parlay lineups",
  usage: "parlay:list [--status <status>] [--limit <n>]",
  category: "markets",
  handler: async (context: CommandContext, args: string[]) => {
    await listLineups(context, ["parlay", "list", ...args.slice(1)]);
  },
};

