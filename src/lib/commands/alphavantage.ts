/**
 * Alpha Vantage Commands
 *
 * Provides stock market data including quotes, historical data, company info, and macro economics.
 * Rate limits: 5 requests/minute, 500/day
 */

import type { Command, CommandContext } from "@/types/commands";
import { alphavantage } from "@/lib/api";
import { formatNumber, escapeHtml } from "@/lib/utils";
import { createCommandLine, createUsageError } from "./command-output-helpers";

/**
 * Alpha Vantage command
 * Stock market and economic data
 */
export const alphaCommand: Command = {
  name: "alpha",
  description: "Alpha Vantage stock market data",
  usage: "alpha <quote|daily|overview|inflation|cpi|gdp> <symbol>",
  aliases: ["stock"],
  category: "api",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand) {
      context.log("📈 Alpha Vantage - Stock Market Data");
      context.log("");
      context.log("Available Commands:");
      context.log("  Stock Data:");
      context.log("    alpha quote <symbol>     - Real-time stock quote");
      context.log("    alpha daily <symbol>     - Daily historical data");
      context.log("    alpha overview <symbol>  - Company overview");
      context.log("");
      context.log("  Economic Data:");
      context.log("    alpha inflation          - Inflation data");
      context.log("    alpha cpi                - Consumer Price Index");
      context.log("    alpha gdp                - GDP data");
      context.log("");
      context.log("Examples:");
      context.log("  alpha quote AAPL");
      context.log("  alpha daily GOOGL");
      context.log("  alpha overview TSLA");
      context.log("  alpha inflation");
      context.log("");
      context.log("API Info:");
      context.log("  • Rate Limits: 5 requests/minute, 500/day");
      context.log("  • Data Source: Alpha Vantage API");
      context.log("  • API Key: Managed by relayer");
      return;
    }

    switch (subcommand) {
      case "quote":
        await getQuote(context, args);
        break;
      case "daily":
        await getDaily(context, args);
        break;
      case "overview":
        await getOverview(context, args);
        break;
      case "inflation":
        await getMacro(context, "inflation");
        break;
      case "cpi":
        await getMacro(context, "cpi");
        break;
      case "gdp":
        await getMacro(context, "gdp");
        break;
      case "alphakey":
        await showApiKeyInfo(context);
        break;
      default:
        context.log(`Unknown subcommand: ${subcommand}`, "error");
        const helpHtml = createCommandLine("alpha", "See available commands");
        context.logHtml(helpHtml);
    }
  },
};

/**
 * Get real-time stock quote
 */
async function getQuote(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const symbol = args[2]?.toUpperCase();

  if (!symbol) {
    const usageHtml = createUsageError("alpha quote <symbol>", [
      "alpha quote AAPL",
      "alpha quote GOOGL",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`Fetching quote for ${symbol}...`);
  context.log("");

  const result = await alphavantage.getStockQuote(symbol);

  if (!result.success || !result.quote) {
    context.log(result.error || "Quote not found");
    context.log("");
    context.log("Suggestions:");
    context.log("  • Check symbol spelling");
    context.log("  • Try US stock symbols (e.g., AAPL, GOOGL, TSLA)");
    context.log("  • Rate limit may be reached (5 req/min)");
    return;
  }

  const quote = result.quote;
  const change = parseFloat(quote.change);
  const changePercent = parseFloat(quote.changePercent);
  const changeColor = change >= 0 ? "#00ff88" : "#ff3333";
  const changePrefix = change >= 0 ? "+" : "";

  // Consolidate entire quote into a single HTML card
  const quoteHtml = `
    <div style="border: 1px solid #00ff88; border-radius: 8px; padding: 16px; margin: 10px 0; background: rgba(0, 255, 136, 0.05);">
      <div style="font-size: 18px; font-weight: bold; color: #00ff88; margin-bottom: 12px; text-align: center; border-bottom: 1px solid #00ff88; padding-bottom: 12px;">
        ${escapeHtml(quote.symbol)} - Stock Quote
      </div>
      <div style="margin-bottom: 16px; text-align: center;">
        <div style="font-size: 24px; color: #00ff88; font-weight: bold; margin-bottom: 8px;">$${escapeHtml(
          quote.price
        )}</div>
        <div style="font-size: 16px; color: ${changeColor}; font-weight: bold;">${changePrefix}$${Math.abs(
    change
  ).toFixed(2)} (${changePrefix}${changePercent.toFixed(2)}%)</div>
      </div>
      <div style="border-top: 1px solid #00ff88; padding-top: 12px;">
        <div style="margin-bottom: 6px;">Open: <span style="color: #00ff88; font-weight: bold;">$${escapeHtml(
          quote.open
        )}</span></div>
        <div style="margin-bottom: 6px;">High: <span style="color: #00ff88; font-weight: bold;">$${escapeHtml(
          quote.high
        )}</span></div>
        <div style="margin-bottom: 6px;">Low: <span style="color: #00ff88; font-weight: bold;">$${escapeHtml(
          quote.low
        )}</span></div>
        <div style="margin-bottom: 6px;">Previous Close: <span style="color: #00ff88; font-weight: bold;">$${escapeHtml(
          quote.previousClose
        )}</span></div>
        <div>Latest Trading Day: <span style="color: #00ff88; font-weight: bold;">${escapeHtml(
          quote.latestTradingDay
        )}</span></div>
      </div>
    </div>
  `;
  context.logHtml(quoteHtml);
}

/**
 * Get daily historical data
 */
async function getDaily(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const symbol = args[2]?.toUpperCase();

  if (!symbol) {
    const usageHtml = createUsageError("alpha daily <symbol>", [
      "alpha daily AAPL",
      "alpha daily TSLA",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`Fetching daily data for ${symbol}...`);
  context.log("");

  const result = await alphavantage.getDailyData(symbol);

  if (!result.success || !result.timeSeries) {
    context.log(result.error || "Daily data not found");
    return;
  }

  const timeSeries = result.timeSeries;
  const dates = Object.keys(timeSeries).sort().reverse().slice(0, 5);

  context.log(`${symbol} - Last 5 Trading Days`);
  context.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  dates.forEach((date) => {
    const data = timeSeries[date];
    context.log("");
    context.log(`Date: ${date}`);
    context.log(`  Open:   $${parseFloat(data.open).toFixed(2)}`);
    context.log(`  High:   $${parseFloat(data.high).toFixed(2)}`);
    context.log(`  Low:    $${parseFloat(data.low).toFixed(2)}`);
    context.log(`  Close:  $${parseFloat(data.close).toFixed(2)}`);
    context.log(`  Volume: ${formatNumber(parseFloat(data.volume))}`);
  });

  context.log("");
  context.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

/**
 * Get company overview
 */
async function getOverview(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const symbol = args[2]?.toUpperCase();

  if (!symbol) {
    const usageHtml = createUsageError("alpha overview <symbol>", [
      "alpha overview AAPL",
      "alpha overview MSFT",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`Fetching overview for ${symbol}...`);
  context.log("");

  const result = await alphavantage.getCompanyOverview(symbol);

  if (!result.success || !result.overview) {
    context.log(result.error || "Company overview not found");
    return;
  }

  const overview = result.overview;

  context.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  context.log(`${overview.Name || symbol} (${overview.Symbol || symbol})`);
  context.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  context.log("");

  if (overview.Sector) context.log(`Sector:         ${overview.Sector}`);
  if (overview.Industry) context.log(`Industry:       ${overview.Industry}`);
  if (overview.Country) context.log(`Country:        ${overview.Country}`);
  context.log("");

  if (overview.MarketCapitalization) {
    context.log(
      `Market Cap:     $${formatNumber(
        parseFloat(overview.MarketCapitalization)
      )}`
    );
  }
  if (overview.PERatio) context.log(`P/E Ratio:      ${overview.PERatio}`);
  if (overview.DividendYield) {
    context.log(
      `Dividend Yield: ${(parseFloat(overview.DividendYield) * 100).toFixed(
        2
      )}%`
    );
  }
  if (overview["52WeekHigh"])
    context.log(`52-Week High:   $${overview["52WeekHigh"]}`);
  if (overview["52WeekLow"])
    context.log(`52-Week Low:    $${overview["52WeekLow"]}`);

  if (overview.Description) {
    context.log("");
    context.log("Description:");
    const truncated = overview.Description.slice(0, 200);
    context.log(truncated + (overview.Description.length > 200 ? "..." : ""));
  }

  context.log("");
  context.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

/**
 * Get macroeconomic data
 */
async function getMacro(
  context: CommandContext,
  indicator: "inflation" | "cpi" | "gdp"
): Promise<void> {
  const labels = {
    inflation: "Inflation Rate",
    cpi: "Consumer Price Index (CPI)",
    gdp: "Gross Domestic Product (GDP)",
  };

  context.log(`Fetching ${labels[indicator]}...`);
  context.log("");

  const result = await alphavantage.getMacroData(indicator);

  if (!result.success || !result.data || result.data.length === 0) {
    context.log(result.error || "Data not found");
    return;
  }

  const data = result.data.slice(0, 5);

  context.log(`${labels[indicator]} - Recent Data`);
  context.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  data.forEach((point: any) => {
    context.log(`${point.date}: ${point.value}`);
  });

  context.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

/**
 * Show API key information
 */
async function showApiKeyInfo(context: CommandContext): Promise<void> {
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  context.log("Alpha Vantage API Information");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  context.log("");
  context.log("API Key: Configured on relayer");
  context.log("");
  context.log("Rate Limits:");
  context.log("  • 5 requests per minute");
  context.log("  • 500 requests per day");
  context.log("");
  context.log("Data Sources:");
  context.log("  • Real-time stock quotes");
  context.log("  • Daily/weekly/monthly historical data");
  context.log("  • Company fundamentals");
  context.log("  • Economic indicators");
  context.log("");
  context.log("Get your own API key:");
  context.log("  https://www.alphavantage.co/support/#api-key");
  context.log("");
  context.log("Note: In Next.js version, API keys are managed");
  context.log("by the relayer and not stored locally.");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

/**
 * Alpha Key Command
 * Displays information about API key management
 */
export const alphakeyCommand: Command = {
  name: "alphakey",
  description: "Alpha Vantage API key management",
  category: "api",
  handler: (context: CommandContext) => {
    context.log("🔑 Alpha Vantage API Key Management", "info");
    context.log("", "output");
    context.log("Alpha Vantage API key is managed by the relayer.", "info");
    context.log("No manual configuration needed.", "success");
    context.log("", "output");
    context.log(
      "✅ All API requests are proxied through the relayer",
      "output"
    );
    context.log("✅ Rate limits: 5 requests/minute, 500/day", "output");
    context.log("✅ No API key storage required in browser", "output");
  },
};

export const alphaCommands = [alphaCommand, alphakeyCommand];
