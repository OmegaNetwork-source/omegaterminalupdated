/**
 * Hyperliquid DEX Commands
 * Based on vanilla js/commands/remaining.js hyperliquid implementation
 */

import type { Command, CommandContext } from "@/types/commands";

/**
 * Hyperliquid command - Hyperliquid DEX integration
 */
export const hyperliquidCommand: Command = {
  name: "hyperliquid",
  description: "Hyperliquid DEX integration",
  usage: "hyperliquid <help>",
  category: "trading",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showHyperliquidHelp(context);
      return;
    }

    context.log(`🚀 Hyperliquid integration coming soon!`, "info");
    context.log("💡 This will support Hyperliquid trading operations", "info");
  },
};

function showHyperliquidHelp(context: CommandContext): void {
  const helpLines: string[] = [
    "hyperliquid",
    "",
    "Hyperliquid DEX integration",
    "",
    "→ Usage: hyperliquid [help]",
    "",
    "═ Planned Features ═",
    "",
    "• Connect to Hyperliquid",
    "• View markets and orderbook",
    "• Place limit and market orders",
    "• View positions and P&L",
    "• Manage leverage and collateral",
    "",
    "═ Subcommands ═",
    "",
    "hyperliquid perps",
    "",
    "List all available perpetuals",
    "",
    "→ Usage: hyperliquid perps",
    "",
    "hyperliquid perp <COIN>",
    "",
    "Show detailed perp information for specific coin",
    "",
    "→ Usage: hyperliquid perp BTC",
    "",
    "hyperliquid funding <COIN>",
    "",
    "Show funding rates and payment information",
    "",
    "→ Usage: hyperliquid funding ETH",
    "",
    "hyperliquid positions <ADDRESS>",
    "",
    "Display positions for specific address",
    "",
    "→ Usage: hyperliquid positions 0x123...",
    "",
    "hyperliquid orderbook <COIN>",
    "",
    "Show current orderbook depth",
    "",
    "→ Usage: hyperliquid orderbook BTC",
    "",
    "hyperliquid trades <COIN>",
    "",
    "Display recent trades and volume",
    "",
    "→ Usage: hyperliquid trades ETH",
    "",
    "💡 Tip",
    "",
  ];

  // Generate HTML output with uniform styling
  let helpHtml = `
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
        ═══ HYPERLIQUID DEX INTEGRATION ═══
      </div>
  `;

  helpLines.forEach((line) => {
    if (line.trim() === "") {
      helpHtml += `<div style="margin: 4px 0;"></div>`;
    } else if (line.startsWith("═ ")) {
      // Category header
      helpHtml += `
        <div style="
          font-size: 14px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin: 16px 0 8px 0;
          padding: 4px 0;
        ">
          ${line}
        </div>
      `;
    } else if (line.startsWith("→ Usage:")) {
      // Usage line
      helpHtml += `
        <div style="
          color: var(--palette-secondary, #00ff88);
          margin-left: 20px;
          margin-top: 2px;
          font-size: 0.9em;
        ">
          ${line}
        </div>
      `;
    } else if (line.startsWith("• ")) {
      // Feature bullet
      helpHtml += `
        <div style="
          color: var(--palette-text, #e0e0e0);
          margin-left: 20px;
          margin-top: 2px;
          line-height: 1.4;
        ">
          ${line}
        </div>
      `;
    } else if (line === "💡 Tip") {
      // Tip section
      helpHtml += `
        <div style="
          margin-top: 24px;
          padding: 12px;
          border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
          border-radius: 4px;
          text-align: center;
        ">
          <div style="
            color: var(--palette-primary, #00d4ff);
            font-weight: bold;
            margin-bottom: 8px;
          ">
            ${line}
          </div>
          <div style="
            color: var(--palette-text, #e0e0e0);
            font-size: 0.9em;
          ">
            Hyperliquid commands are being integrated. Full trading features coming soon!
          </div>
        </div>
      `;
    } else {
      // Check if line is a command (handles both "perps" and "hyperliquid perps" formats)
      const isFullCommand = line.startsWith("hyperliquid ") && line.length < 50;
      const isSubcommand = line.length > 0 && 
        line.trim().length < 50 &&
        !line.includes(" ") && 
        line === line.toLowerCase() &&
        !line.startsWith("Show") &&
        !line.startsWith("Connect") &&
        !line.startsWith("Display") &&
        !line.startsWith("Manage") &&
        !line.startsWith("View") &&
        !line.startsWith("List") &&
        !line.startsWith("Place") &&
        line.match(/^[a-z0-9-]+$/);

      if (isFullCommand || isSubcommand) {
        // Extract command part (remove <COIN> or other parameters)
        let commandText = line;
        if (isFullCommand) {
          // Already has "hyperliquid " prefix, remove parameter placeholders
          commandText = line.replace(/ <[^>]+>/g, "").trim();
        } else if (isSubcommand) {
          // Add "hyperliquid " prefix
          commandText = `hyperliquid ${line}`;
        }
        
        const escapedCommand = commandText.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        const displayText = isFullCommand ? line.replace(/ <[^>]+>/g, "") : line;
        
        helpHtml += `
          <div 
            class="omega-help-command" 
            data-command="${escapedCommand}"
            style="
              color: var(--palette-secondary, #00ff88);
              font-weight: bold;
              margin-left: 0;
              margin-top: 8px;
              font-family: 'Courier New', monospace;
              cursor: pointer;
              display: inline-block;
              padding: 2px 4px;
              border-radius: 3px;
              transition: all 0.2s ease;
              user-select: none;
            "
            onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)'; this.style.textShadow = '0 0 8px var(--palette-secondary-glow, rgba(0, 255, 136, 0.5))';"
            onmouseout="this.style.background = 'transparent'; this.style.textShadow = 'none';"
            title="Click to add '${escapedCommand}' to terminal input"
          >
            ${displayText}
          </div>
        `;
      } else {
        helpHtml += `
          <div style="
            color: var(--palette-text, #e0e0e0);
            margin-left: 0;
            margin-top: 2px;
            line-height: 1.4;
          ">
            ${line}
          </div>
        `;
      }
    }
  });

  helpHtml += `</div>`;
  context.logHtml(helpHtml);
}

export const hyperliquidCommands: Command[] = [hyperliquidCommand];
