/**
 * Chart Command
 *
 * Placeholder for chart functionality that will be implemented in Phase 15.
 * Charts require the futuristic dashboard view with TradingView widget integration.
 */

import type { Command, CommandContext } from "@/types/commands";

/**
 * Chart command
 * Display trading charts (deferred to Phase 15)
 */
export const chartCommand: Command = {
  name: "chart",
  description: "Display trading charts in the right panel",
  usage: "chart <symbol>",
  category: "api",
  handler: async (context: CommandContext, args: string[]) => {
    const symbol = args[1]?.toUpperCase() || "BTC";

    if (!symbol || symbol.length === 0) {
      context.log("Usage: chart <symbol>", "info");
      context.log("Example: chart BTC", "info");
      context.log("Example: chart ETH", "info");
      context.log("Example: chart AAPL", "info");
      return;
    }

    context.log(`📊 Opening chart for ${symbol} in right panel...`, "info");
    
    // Trigger the chart event to open in stats panel
    if (typeof window !== "undefined") {
      const event = new CustomEvent("omega:openChart", {
        detail: { symbol },
      });
      window.dispatchEvent(event);
      context.log(`✓ Chart opened for ${symbol}`, "success");
    } else {
      context.log("⚠ Chart viewer requires browser environment", "warning");
    }

    // Audio feedback for chart viewer activation
    try {
      await context.sound?.playChartViewerSound();
    } catch {}
  },
};

export const chartCommands = [chartCommand];
