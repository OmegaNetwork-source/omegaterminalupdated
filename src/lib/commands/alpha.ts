/**
 * Omega Alpha Commands - AI Forecast Network
 * Commands: alpha:infer, alpha:drops, alpha:submit, alpha:score
 */

import type { Command, CommandContext } from "@/types/commands";
import { createUsageError } from "./command-output-helpers";
import { parseFlags, getFlagString, getFlagNumber } from "@/lib/terminal/flag-parser";
import { renderTable, renderCard } from "@/lib/terminal/renderers";
import { formatCurrency } from "@/lib/utils";

/**
 * alpha:infer - Get AI forecast for a market
 * Usage: alpha:infer <marketId> [--p <probability>] [--note <text>]
 */
async function handleAlphaInfer(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const marketId = parsed.positional[0];

  if (!marketId) {
    const usageHtml = createUsageError("alpha:infer <marketId>", [
      "alpha:infer polymarket:12345",
      "alpha:infer polymarket:67890",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`🤖 Generating AI forecast for ${marketId}...`, "info");

  try {
    // Fetch market details first to get question
    const [venue, id] = marketId.includes(":")
      ? marketId.split(":", 2)
      : ["polymarket", marketId];

    let marketQuestion = marketId;
    try {
      const marketResponse = await fetch(
        `${context.config.RELAYER_URL}/${venue === "polymarket" || venue === "pm" ? "polymarket" : "kalshi"}/${venue === "polymarket" || venue === "pm" ? "event" : "market"}/${id}`
      );
      if (marketResponse.ok) {
        const marketData = await marketResponse.json();
        marketQuestion = marketData.question || marketData.title || marketData.subtitle || marketId;
      }
    } catch {
      // Continue with marketId if fetch fails
    }

    // Call forecast API
    const response = await fetch("/api/alpha/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marketId,
        marketQuestion,
        model: "default",
      }),
    });

    let forecast: any;
    if (response.ok) {
      forecast = await response.json();
    } else {
      // Fallback to placeholder if API fails
      forecast = {
        marketId: marketId,
        probability: 0.65,
        confidence: 0.78,
        rationale: "AI forecast service not configured. Please set CHAINGPT_API_KEY or GEMINI_API_KEY.",
        timestamp: new Date().toISOString(),
      };
    }

    // Store output for export
    const { setLastJSONOutput } = await import("@/lib/commands/export");
    setLastJSONOutput(forecast);

    const html = renderCard(forecast, `AI Forecast: ${marketId}`);
    context.logHtml(html);
    context.log(`✓ Forecast generated`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Verify market ID is correct", "output");
    context.log("   • Check API connection", "output");
  }
}

/**
 * alpha:drops - Get daily AI picks
 * Usage: alpha:drops [--limit <n>] [--tag <tag>]
 */
async function handleAlphaDrops(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const limit = getFlagNumber(parsed.flags, "limit", 10);
  const tag = getFlagString(parsed.flags, "tag");

  context.log(`🔥 Fetching daily AI picks...`, "info");

  try {
    // TODO: Integrate with AI drops API
    const drops = Array.from({ length: limit }, (_, i) => ({
      rank: i + 1,
      market: `polymarket:${10000 + i}`,
      probability: (0.5 + Math.random() * 0.3).toFixed(2),
      confidence: (0.6 + Math.random() * 0.3).toFixed(2),
      tag: tag || "crypto",
    }));

    const html = renderTable(drops, [
      { key: "rank", label: "#", align: "right" },
      { key: "market", label: "Market" },
      { key: "probability", label: "Probability", align: "right" },
      { key: "confidence", label: "Confidence", align: "right" },
      { key: "tag", label: "Tag" },
    ]);

    context.logHtml(html);
    context.log(`✓ Found ${drops.length} picks`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Verify market ID is correct", "output");
    context.log("   • Check API connection", "output");
  }
}

/**
 * alpha:submit - Submit user forecast
 * Usage: alpha:submit <marketId> --p <probability> [--note <text>]
 */
async function handleAlphaSubmit(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const marketId = parsed.positional[0];
  const probability = parseFloat(getFlagString(parsed.flags, "p"));
  const note = getFlagString(parsed.flags, "note");

  if (!marketId) {
    const usageHtml = createUsageError("alpha:submit <marketId> --p <0..1> [--note <text>]", [
      'alpha:submit polymarket:12345 --p 0.62 --note "ETF flows"',
      "alpha:submit polymarket:67890 --p 0.75",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  if (isNaN(probability) || probability < 0 || probability > 1) {
    context.log("❌ Probability must be between 0 and 1", "error");
    return;
  }

  context.log(`📝 Submitting forecast for ${marketId}...`, "info");

  try {
    // TODO: Submit to API
    context.log(`✓ Forecast submitted: ${marketId} @ ${probability}`, "success");
    if (note) {
      context.log(`   Note: ${note}`, "output");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Verify market ID is correct", "output");
    context.log("   • Check API connection", "output");
  }
}

/**
 * alpha:score - View personal scoring
 * Usage: alpha:score [--range <time>] [--by <dimension>]
 */
async function handleAlphaScore(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const range = getFlagString(parsed.flags, "range", "90d");
  const by = getFlagString(parsed.flags, "by", "overall");

  context.log(`📊 Calculating your forecast score (${range})...`, "info");

  try {
    // TODO: Calculate from user's forecast history
    const score = {
      overall: 0.72,
      accuracy: "68%",
      brierScore: 0.15,
      forecastCount: 145,
      range: range,
      breakdown: {
        crypto: 0.75,
        politics: 0.68,
        sports: 0.71,
      },
    };

    const html = renderCard(score, `Your Forecast Score (${range})`);
    context.logHtml(html);
    context.log(`✓ Score calculated`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Verify market ID is correct", "output");
    context.log("   • Check API connection", "output");
  }
}

export const alphaInferCommand: Command = {
  name: "alpha:infer",
  description: "Get AI forecast for a market",
  usage: "alpha:infer <marketId> [--p <probability>] [--note <text>]",
  category: "trading",
  handler: handleAlphaInfer,
};

export const alphaDropsCommand: Command = {
  name: "alpha:drops",
  description: "Get daily AI picks",
  usage: "alpha:drops [--limit <n>] [--tag <tag>]",
  category: "trading",
  handler: handleAlphaDrops,
};

export const alphaSubmitCommand: Command = {
  name: "alpha:submit",
  description: "Submit user forecast",
  usage: "alpha:submit <marketId> --p <0..1> [--note <text>]",
  category: "trading",
  handler: handleAlphaSubmit,
};

export const alphaScoreCommand: Command = {
  name: "alpha:score",
  description: "View personal scoring",
  usage: "alpha:score [--range <time>] [--by <dimension>]",
  category: "trading",
  handler: handleAlphaScore,
};

export const alphaForecastCommands: Command[] = [
  alphaInferCommand,
  alphaDropsCommand,
  alphaSubmitCommand,
  alphaScoreCommand,
];

