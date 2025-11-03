/**
 * Perps Trading Commands
 * Perpetual futures trading interface
 * Based on vanilla js/commands/perps-commands.js
 */

import type { Command, CommandContext } from "@/types/commands";

/**
 * Perps command - Perpetual futures trading
 */
export const perpsCommand: Command = {
  name: "perps",
  description: "Perpetual futures trading interface",
  usage: "perps <open|close|help> [pair]",
  aliases: ["perp"],
  category: "trading",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "open") {
      const pair = args[2] || "ETH_USDC";
      openPerpsInterface(context, pair);
      return;
    }

    switch (subcommand) {
      case "close":
        closePerpsInterface(context);
        break;
      case "help":
        showPerpsHelp(context);
        break;
      default:
        // Default to opening with pair
        openPerpsInterface(context, subcommand.toUpperCase());
    }
  },
};

function openPerpsInterface(context: CommandContext, pair: string): void {
  context.log("📊 Opening Omega Perps trading interface...", "info");

  const pairFormatted = pair.replace("_", "/");
  const perpsUrl = `https://omegaperps.omeganetwork.co/perp/PERP_${pair.toUpperCase()}/`;

  const html = `
    <div style="position: fixed; top: 0; right: 0; width: 600px; height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%); border-left: 2px solid #00bcf2; z-index: 9000; display: flex; flex-direction: column; box-shadow: -4px 0 16px rgba(0, 188, 242, 0.3);">
      <!-- Header -->
      <div style="background: rgba(0, 188, 242, 0.1); padding: 16px; border-bottom: 1px solid #00bcf2; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px;">📊</div>
          <div>
            <div style="font-size: 18px; font-weight: bold; color: #00bcf2;">Omega Perps</div>
            <div style="font-size: 12px; color: #888;">${pairFormatted} Perpetual</div>
          </div>
        </div>
        <button onclick="window.__omegaPerpsClose?.()" style="background: rgba(255, 255, 255, 0.1); border: 1px solid #00bcf2; color: #00bcf2; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Close</button>
      </div>
      
      <!-- Trading Interface -->
      <div style="flex: 1; overflow-y: auto; padding: 16px;">
        <div style="background: rgba(0, 188, 242, 0.05); padding: 20px; border-radius: 12px; border: 1px solid #00bcf2; margin-bottom: 16px;">
          <div style="font-size: 16px; font-weight: bold; color: #00bcf2; margin-bottom: 12px;">📈 ${pairFormatted} Perpetual Futures</div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
            <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px;">
              <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Mark Price</div>
              <div style="color: #00ff88; font-size: 20px; font-weight: bold;">$--,---</div>
            </div>
            <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px;">
              <div style="color: #888; font-size: 12px; margin-bottom: 4px;">24h Change</div>
              <div style="color: #00ff88; font-size: 20px; font-weight: bold;">+--.--%</div>
            </div>
            <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px;">
              <div style="color: #888; font-size: 12px; margin-bottom: 4px;">24h Volume</div>
              <div style="color: #00bcf2; font-size: 16px; font-weight: bold;">$---M</div>
            </div>
            <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px;">
              <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Funding Rate</div>
              <div style="color: #00bcf2; font-size: 16px; font-weight: bold;">0.---%</div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${perpsUrl}" target="_blank" style="display: inline-block; background: #00bcf2; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 8px;">
              Open Full Trading Interface →
            </a>
          </div>
        </div>
        
        <div style="background: rgba(255, 193, 7, 0.1); padding: 16px; border-radius: 8px; border: 1px solid rgba(255, 193, 7, 0.3);">
          <div style="color: #FFC107; font-weight: bold; margin-bottom: 8px;">⚠️ Risk Warning</div>
          <div style="color: #ffffff; font-size: 13px;">
            Perpetual futures trading involves significant risk. Only trade with funds you can afford to lose.
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div style="background: rgba(0, 188, 242, 0.1); padding: 16px; border-top: 1px solid #00bcf2;">
        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">Quick Commands:</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button onclick="window.__omegaPerpsCommand?.('perps ETH_USDC')" style="background: rgba(0, 188, 242, 0.2); border: 1px solid #00bcf2; color: #00bcf2; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">ETH/USDC</button>
          <button onclick="window.__omegaPerpsCommand?.('perps BTC_USDC')" style="background: rgba(0, 188, 242, 0.2); border: 1px solid #00bcf2; color: #00bcf2; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">BTC/USDC</button>
          <button onclick="window.__omegaPerpsCommand?.('perps SOL_USDC')" style="background: rgba(0, 188, 242, 0.2); border: 1px solid #00bcf2; color: #00bcf2; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">SOL/USDC</button>
        </div>
      </div>
    </div>
  `;

  context.logHtml(html);
  setupPerpsHandlers(context);
}

function closePerpsInterface(context: CommandContext): void {
  if (typeof document !== "undefined") {
    const panel = document.querySelector('[style*="Omega Perps"]');
    if (panel) {
      panel.remove();
    }
  }
  context.log("✅ Perps interface closed", "success");
}

function showPerpsHelp(context: CommandContext): void {
  context.log("📊 Omega Perps Commands:", "info");
  context.log("", "output");
  context.log(
    "  perps                   Open perps trading interface",
    "output"
  );
  context.log("  perps open              Same as above", "output");
  context.log("  perps close             Close perps interface", "output");
  context.log("  perp                    Alias for perps", "output");
  context.log("", "output");
  context.log("📊 Available Pairs:", "info");
  context.log("  • ETH/USDC - Ethereum perpetual", "output");
  context.log("  • BTC/USDC - Bitcoin perpetual", "output");
  context.log("  • SOL/USDC - Solana perpetual", "output");
  context.log("", "output");
  context.log("💡 Opens a trading interface in the sidebar panel", "success");
  context.log("🌐 Network: Omega Network", "info");
}

function setupPerpsHandlers(context: CommandContext): void {
  if (typeof window === "undefined") return;

  (window as any).__omegaPerpsClose = () => {
    closePerpsInterface(context);
  };

  (window as any).__omegaPerpsCommand = (cmd: string) => {
    // Would execute perps commands
    context.log(`Switching to ${cmd}...`, "info");
  };
}

/**
 * Perp command alias
 */
export const perpCommand: Command = {
  name: "perp",
  description: "Perpetual futures trading (alias)",
  usage: "perp <open|close|help> [pair]",
  category: "trading",
  handler: async (context: CommandContext, args: string[]) => {
    await perpsCommand.handler(context, args);
  },
};

export const perpsCommands: Command[] = [perpsCommand, perpCommand];
