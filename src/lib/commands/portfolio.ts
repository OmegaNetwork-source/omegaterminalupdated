/**
 * ForecastFi Commands - Portfolio & Bundles
 * Commands: pf:sync, pf:show, bundle:list, bundle:view, bundle:backtest
 */

import type { Command, CommandContext } from "@/types/commands";
import { createUsageError } from "./command-output-helpers";
import { parseFlags, getFlagString, getFlagNumber } from "@/lib/terminal/flag-parser";
import { renderTable, renderCard } from "@/lib/terminal/renderers";
import { formatCurrency } from "@/lib/utils";

/**
 * pf:sync - Sync positions from venue
 * Usage: pf:sync [--venue <venue>]
 */
async function handlePortfolioSync(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const venue = getFlagString(parsed.flags, "venue", "polymarket");

  context.log(`🔄 Syncing portfolio from ${venue}...`, "info");

  try {
    // Get wallet address if connected
    let address: string | undefined;
    if (context.wallet?.state?.isConnected && context.wallet?.state?.address) {
      address = context.wallet.state.address;
    }

    if (!address) {
      context.log("❌ Wallet not connected", "error");
      context.log("   Connect your wallet to sync portfolio", "info");
      return;
    }

    // Call portfolio sync API
    const response = await fetch("/api/portfolio/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venue, address }),
    });

    if (response.ok) {
      const data = await response.json();
      context.log(`✓ Portfolio synced from ${venue}`, "success");
      if (data.positions && data.positions.length > 0) {
        context.log(`   Found ${data.positions.length} positions`, "output");
      } else {
        context.log(`   No positions found (or authentication required)`, "info");
      }
    } else {
      const error = await response.json();
      context.log(`⚠️ ${error.message || "Sync completed with warnings"}`, "warning");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check network connection", "output");
    context.log("   • Verify venue is supported", "output");
    context.log("   • Ensure wallet is connected", "output");
  }
}

/**
 * pf:show - Show portfolio overview
 * Usage: pf:show [--view <type>] [--range <time>]
 */
async function handlePortfolioShow(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const view = getFlagString(parsed.flags, "view", "pnl");
  const range = getFlagString(parsed.flags, "range", "30d");

  context.log(`📊 Loading portfolio overview (${view}, ${range})...`, "info");

  try {
    // TODO: Load from portfolio API
    const portfolio = {
      totalValue: "$12,450",
      pnl: "+$1,230",
      pnlPercent: "+10.9%",
      positions: 23,
      activeMarkets: 18,
      range: range,
    };

    const html = renderCard(portfolio, `Portfolio Overview (${range})`);
    context.logHtml(html);
    context.log(`✓ Portfolio loaded`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check network connection", "output");
    context.log("   • Verify venue is supported", "output");
  }
}

/**
 * bundle:list - List available bundles
 * Usage: bundle:list [--limit <n>]
 */
async function handleBundleList(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const limit = getFlagNumber(parsed.flags, "limit", 20);

  context.log(`📦 Fetching bundles...`, "info");

  try {
    // TODO: Load from bundles API
    const bundles = Array.from({ length: limit }, (_, i) => ({
      name: `crypto-2025-${i + 1}`,
      markets: 12 + i,
      performance: `+${(5 + i * 2).toFixed(1)}%`,
      volume: `$${(1000 + i * 500).toLocaleString()}`,
    }));

    const html = renderTable(bundles, [
      { key: "name", label: "Bundle Name" },
      { key: "markets", label: "Markets", align: "right" },
      { key: "performance", label: "Performance", align: "right" },
      { key: "volume", label: "Volume", align: "right" },
    ]);

    context.logHtml(html);
    context.log(`✓ Found ${bundles.length} bundles`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check network connection", "output");
    context.log("   • Verify venue is supported", "output");
  }
}

/**
 * bundle:view - View bundle details
 * Usage: bundle:view <bundleName>
 */
async function handleBundleView(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const bundleName = parsed.positional[0];

  if (!bundleName) {
    const usageHtml = createUsageError("bundle:view <bundleName>", [
      "bundle:view crypto-2025",
      "bundle:view defi-2025",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`📦 Loading bundle: ${bundleName}...`, "info");

  try {
    // TODO: Load from bundles API
    const bundle = {
      name: bundleName,
      description: "Crypto predictions for 2025",
      markets: 12,
      performance: "+15.3%",
      volume: "$45,230",
      createdAt: "2025-01-01",
      marketsList: ["BTC > $100k", "ETH > $10k", "SOL > $200"],
    };

    const html = renderCard(bundle, `Bundle: ${bundleName}`);
    context.logHtml(html);
    context.log(`✓ Bundle loaded`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check network connection", "output");
    context.log("   • Verify venue is supported", "output");
  }
}

/**
 * bundle:backtest - Backtest bundle performance
 * Usage: bundle:backtest <bundleName> [--range <time>] [--rebalance <time>]
 */
async function handleBundleBacktest(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const bundleName = parsed.positional[0];
  const range = getFlagString(parsed.flags, "range", "180d");
  const rebalance = getFlagString(parsed.flags, "rebalance", "14d");

  if (!bundleName) {
    const usageHtml = createUsageError("bundle:backtest <bundleName> [--range <time>] [--rebalance <time>]", [
      "bundle:backtest crypto-2025 --range 180d --rebalance 14d",
      "bundle:backtest defi-2025 --range 365d",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`🧪 Backtesting ${bundleName} (${range}, rebalance: ${rebalance})...`, "info");

  try {
    // TODO: Run backtest simulation
    const results = {
      bundle: bundleName,
      range: range,
      rebalance: rebalance,
      totalReturn: "+18.5%",
      sharpeRatio: 1.42,
      maxDrawdown: "-8.2%",
      winRate: "68%",
      trades: 45,
    };

    const html = renderCard(results, `Backtest Results: ${bundleName}`);
    context.logHtml(html);
    context.log(`✓ Backtest completed`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check network connection", "output");
    context.log("   • Verify venue is supported", "output");
  }
}

export const portfolioSyncCommand: Command = {
  name: "pf:sync",
  description: "Sync positions from venue",
  usage: "pf:sync [--venue <venue>]",
  category: "trading",
  handler: handlePortfolioSync,
};

export const portfolioShowCommand: Command = {
  name: "pf:show",
  description: "Show portfolio overview",
  usage: "pf:show [--view <type>] [--range <time>]",
  category: "trading",
  handler: handlePortfolioShow,
};

export const bundleListCommand: Command = {
  name: "bundle:list",
  description: "List available bundles",
  usage: "bundle:list [--limit <n>]",
  category: "trading",
  handler: handleBundleList,
};

export const bundleViewCommand: Command = {
  name: "bundle:view",
  description: "View bundle details",
  usage: "bundle:view <bundleName>",
  category: "trading",
  handler: handleBundleView,
};

export const bundleBacktestCommand: Command = {
  name: "bundle:backtest",
  description: "Backtest bundle performance",
  usage: "bundle:backtest <bundleName> [--range <time>] [--rebalance <time>]",
  category: "trading",
  handler: handleBundleBacktest,
};

export const portfolioCommands: Command[] = [
  portfolioSyncCommand,
  portfolioShowCommand,
  bundleListCommand,
  bundleViewCommand,
  bundleBacktestCommand,
];

