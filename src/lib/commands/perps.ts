/**
 * Perps Trading Commands
 * Perpetual futures trading interface
 * Based on vanilla js/commands/perps-commands.js
 * Updated to use PerpsProvider for uniform panel management
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

  if (context.media?.perps?.openPanel) {
    try {
      context.media.perps.openPanel(pair);
      context.log(`✅ Omega Perps panel opened for ${pair.replace("_", "/")}`, "success");
    } catch (error: any) {
      context.log(`❌ Error opening Perps panel: ${error.message}`, "error");
    }
  } else {
    context.log("❌ Perps panel not available", "error");
    context.log("💡 Make sure the app has loaded completely", "warning");
  }
}

function closePerpsInterface(context: CommandContext): void {
  if (context.media?.perps?.closePanel) {
    try {
      context.media.perps.closePanel();
      context.log("✅ Perps interface closed", "success");
    } catch (error: any) {
      context.log(`❌ Error closing Perps panel: ${error.message}`, "error");
    }
  } else {
    context.log("✅ Perps interface closed", "success");
  }
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
  context.log("  perps ETH_USDC          Open with ETH/USDC pair", "output");
  context.log("  perps BTC_USDC          Open with BTC/USDC pair", "output");
  context.log("  perps SOL_USDC          Open with SOL/USDC pair", "output");
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

export const perpsCommands: Command[] = [perpsCommand];
