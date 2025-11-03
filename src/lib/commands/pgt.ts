/**
 * Portfolio Tracker (PGT) Commands
 * Multi-chain portfolio tracking and analytics
 * Based on vanilla js/commands/api.js pgt implementation
 */

import type { Command, CommandContext } from "@/types/commands";
import { config } from "@/lib/config";

/**
 * PGT Command - Portfolio tracking and analytics
 */
export const pgtCommand: Command = {
  name: "pgt",
  description: "Portfolio tracking and analytics",
  usage: "pgt <track|portfolio|wallets|refresh|help> [params]",
  category: "api",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showPgtHelp(context);
      return;
    }

    switch (subcommand) {
      case "track":
        await trackWallet(context, args);
        break;
      case "portfolio":
        await showPortfolio(context);
        break;
      case "wallets":
        await showWallets(context);
        break;
      case "refresh":
        await refreshPortfolio(context);
        break;
      default:
        context.log(`Unknown pgt command: ${subcommand}`, "error");
        context.log('Type "pgt help" for available commands', "info");
    }
  },
};

function showPgtHelp(context: CommandContext): void {
  context.log("=== PORTFOLIO TRACKER (PGT) ===", "info");
  context.log("📊 Portfolio tracking and analytics", "info");
  context.log("", "output");
  context.log("📋 Available Commands:", "info");
  context.log("  pgt track <address>    Track a new wallet address", "output");
  context.log("  pgt portfolio          View portfolio overview", "output");
  context.log("  pgt wallets            List tracked wallets", "output");
  context.log("  pgt refresh            Refresh portfolio data", "output");
  context.log("  pgt help               Show detailed help", "output");
  context.log("", "info");
  context.log("💡 EXAMPLES:", "info");
  context.log("  pgt track 0x1234567890abcdef...", "output");
  context.log("  pgt portfolio", "output");
  context.log("  pgt wallets", "output");
}

async function trackWallet(
  context: CommandContext,
  args: string[]
): Promise<void> {
  if (args.length < 3) {
    context.log("Usage: pgt track <wallet-address>", "error");
    context.log("Example: pgt track 0x1234567890abcdef...", "info");
    return;
  }

  const address = args[2];
  context.log(`📊 Tracking wallet: ${address}`, "info");

  // Play balance/wealth sound effect
  if (context.sound) {
    context.sound.playWalletConnectSound().catch(() => {
      // Ignore sound errors
    });
  }

  // Store tracked wallet
  if (typeof localStorage !== "undefined") {
    const trackedWallets = JSON.parse(
      localStorage.getItem("pgt-tracked-wallets") || "[]"
    );
    if (!trackedWallets.includes(address)) {
      trackedWallets.push(address);
      localStorage.setItem(
        "pgt-tracked-wallets",
        JSON.stringify(trackedWallets)
      );
    }
  }

  context.log("✅ Wallet added to portfolio tracker", "success");
  context.log(
    "💡 This will track token balances and portfolio value across chains",
    "info"
  );
  context.log('💡 Use "pgt portfolio" to view your tracked wallets', "info");
}

async function showPortfolio(context: CommandContext): Promise<void> {
  context.log("📊 PORTFOLIO OVERVIEW", "info");

  if (typeof localStorage === "undefined") {
    context.log("❌ Portfolio tracking not available", "error");
    return;
  }

  const trackedWallets = JSON.parse(
    localStorage.getItem("pgt-tracked-wallets") || "[]"
  );

  if (trackedWallets.length === 0) {
    context.log("❌ No wallets tracked yet", "warning");
    context.log('💡 Use "pgt track <address>" to add a wallet', "info");
    return;
  }

  context.log(`📋 Tracked Wallets: ${trackedWallets.length}`, "info");
  context.log("", "info");

  trackedWallets.forEach((address: string, index: number) => {
    context.log(`${index + 1}. ${address}`, "output");
  });

  context.log("", "info");
  context.log("💡 Portfolio value calculation coming soon", "info");
  context.log(
    "📊 This will show total value, P&L, and asset breakdown",
    "info"
  );
}

async function showWallets(context: CommandContext): Promise<void> {
  context.log("📋 TRACKED WALLETS", "info");

  if (typeof localStorage === "undefined") {
    context.log("❌ Portfolio tracking not available", "error");
    return;
  }

  const trackedWallets = JSON.parse(
    localStorage.getItem("pgt-tracked-wallets") || "[]"
  );

  if (trackedWallets.length === 0) {
    context.log("❌ No wallets tracked yet", "warning");
    context.log('💡 Use "pgt track <address>" to add a wallet', "info");
    return;
  }

  context.log(`Total wallets: ${trackedWallets.length}`, "info");
  context.log("", "info");

  trackedWallets.forEach((address: string, index: number) => {
    context.log(`${index + 1}. ${address}`, "output");
  });
}

async function refreshPortfolio(context: CommandContext): Promise<void> {
  context.log("🔄 Refreshing portfolio data...", "info");

  if (typeof localStorage === "undefined") {
    context.log("❌ Portfolio tracking not available", "error");
    return;
  }

  const trackedWallets = JSON.parse(
    localStorage.getItem("pgt-tracked-wallets") || "[]"
  );

  if (trackedWallets.length === 0) {
    context.log("❌ No wallets to refresh", "warning");
    return;
  }

  context.log(`Refreshing ${trackedWallets.length} wallet(s)...`, "info");
  context.log("💡 Portfolio refresh functionality coming soon", "info");
  context.log("📊 This will update all portfolio values in real-time", "info");
}

export const pgtCommands: Command[] = [pgtCommand];
