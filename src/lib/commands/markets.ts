/**
 * Markets Commands - Predictive Intelligence Terminal
 * Commands: markets:list, markets:view, markets:heatmap, markets:similar
 * Aliases: m:ls, m:cat, m:heat, m:sim
 */

import type { Command, CommandContext } from "@/types/commands";
import { parseFlags, getFlagString, getFlagNumber } from "@/lib/terminal/flag-parser";
import { renderTable, renderCard } from "@/lib/terminal/renderers";
import { escapeHtml, formatCurrency } from "@/lib/utils";
import { setLastJSONOutput } from "@/lib/commands/export";
import { createCommandLine, createUsageError } from "./command-output-helpers";

// Context storage for default values
const marketContext: {
  venue?: string;
  tag?: string;
  sort?: string;
} = {};

/**
 * markets:list - List and filter prediction markets
 * Usage: markets:list [--venue <venue>] [--tag <tag>] [--closes <time>] [--sort <type>] [--limit <n>] [--q <query>]
 * Alias: m:ls
 */
async function handleMarketsList(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const venue = getFlagString(parsed.flags, "venue", marketContext.venue || "polymarket");
  const tag = getFlagString(parsed.flags, "tag", marketContext.tag);
  const closes = getFlagString(parsed.flags, "closes");
  const sort = getFlagString(parsed.flags, "sort", marketContext.sort || "vol");
  const limit = getFlagNumber(parsed.flags, "limit", 20);
  const query = getFlagString(parsed.flags, "q");

  context.log(`📊 Fetching markets from ${venue}...`, "info");

  try {
    // Use unified markets API
    const apiUrl = new URL("/api/markets", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    apiUrl.searchParams.set("venue", venue);
    if (tag) apiUrl.searchParams.set("tag", tag);
    apiUrl.searchParams.set("sort", sort);
    apiUrl.searchParams.set("limit", String(limit));
    if (query) apiUrl.searchParams.set("q", query);

    const response = await fetch(apiUrl.toString());
    let markets: any[] = [];

    if (response.ok) {
      const data = await response.json();
      markets = data.markets || [];
    } else {
      // Fallback to direct relayer calls
      if (venue === "polymarket" || venue === "pm") {
        const fallbackResponse = await fetch(
          `${context.config.RELAYER_URL}/polymarket/events?order=${sort === "vol" ? "volume" : "id"}&ascending=false&closed=false&limit=${limit}`
        );
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          markets = Array.isArray(data) ? data : data.data || data.events || [];
        }
      } else if (venue === "kalshi") {
        const fallbackResponse = await fetch(
          `${context.config.RELAYER_URL}/kalshi/markets?limit=${limit}`
        );
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          markets = data.markets || [];
        }
      }
    }

    // Filter by tag if provided
    if (tag) {
      markets = markets.filter((m: any) => {
        const tags = m.tags || m.categories || [];
        return tags.some((t: string) =>
          t.toLowerCase().includes(tag.toLowerCase())
        );
      });
    }

    // Filter by query if provided
    if (query) {
      markets = markets.filter((m: any) => {
        const question = m.question || m.title || m.subtitle || "";
        return question.toLowerCase().includes(query.toLowerCase());
      });
    }

    if (markets.length === 0) {
      context.log("❌ No markets found matching your criteria", "error");
      context.log("", "output");
      context.log("💡 Try:", "info");
      const helpHtml = `
        <div style="margin: 8px 0; padding-left: 20px;">
          <div style="color: var(--palette-text, #ccd4e0); margin: 4px 0; font-size: 0.95em;">• Adjust filters (--tag, --q)</div>
          <div style="color: var(--palette-text, #ccd4e0); margin: 4px 0; font-size: 0.95em;">• Try different venue: ${createCommandLine("markets:list --venue kalshi", "")}</div>
          <div style="color: var(--palette-text, #ccd4e0); margin: 4px 0; font-size: 0.95em;">• Check spelling and try again</div>
        </div>
      `;
      context.logHtml(helpHtml);
      return;
    }

    // Format volume values
    const formatVolume = (vol: any) => {
      if (!vol || vol === "N/A") return "N/A";
      const numVol = typeof vol === "string" ? parseFloat(vol) : vol;
      if (isNaN(numVol)) return String(vol);
      return numVol >= 1000 ? formatCurrency(numVol) : `$${numVol.toLocaleString()}`;
    };

    // Display as table
    const tableData = markets.slice(0, limit).map((market: any) => ({
      question: (market.question || market.title || market.subtitle || "N/A").substring(0, 60),
      venue: venue,
      volume: formatVolume(market.volume || market.volume24hr || market.volume_24h),
      closes: market.end_date_iso || market.close_time || "N/A",
      status: market.closed || market.status === "closed" ? "🔒 Closed" : "🟢 Active",
    }));

    const html = renderTable(tableData, [
      { key: "question", label: "Question", formatter: (v) => String(v) },
      { key: "venue", label: "Venue" },
      { key: "volume", label: "Volume", align: "right" },
      { key: "closes", label: "Closes", formatter: (v) => {
        if (v === "N/A") return v;
        try {
          return new Date(v as string).toLocaleDateString();
        } catch {
          return String(v);
        }
      }},
      { key: "status", label: "Status" },
    ]);

    // Add helpful tip footer
    let footerHtml = "";
    if (markets.length > limit) {
      footerHtml = `
        <div style="
          text-align: center;
          color: var(--palette-primary, #00bcf2);
          margin-top: 16px;
          font-size: 12px;
        ">
          ... and ${markets.length - limit} more markets
        </div>
      `;
    }

    footerHtml += `
      <div style="
        margin-top: 20px;
        padding: 12px;
        border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        border-radius: 4px;
        text-align: center;
      ">
        <div style="
          color: var(--palette-primary, #00d4ff);
          font-size: 11px;
        ">
          💡 Use <span class="omega-help-command" data-command="markets:view" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'markets:view' to terminal input">markets:view</span> to see details | <span class="omega-help-command" data-command="markets:list help" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'markets:list help' to terminal input">markets:list help</span> for more options
        </div>
      </div>
    `;

    context.logHtml(html + footerHtml);
    
    // Store output for export
    setLastJSONOutput(markets);
    
    context.log(`✓ Found ${markets.length} markets`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
      context.log("", "output");
      context.log("💡 Troubleshooting:", "info");
      const helpHtml = `
        <div style="margin: 8px 0; padding-left: 20px;">
          <div style="color: var(--palette-text, #ccd4e0); margin: 4px 0; font-size: 0.95em;">• Check network connection</div>
          <div style="color: var(--palette-text, #ccd4e0); margin: 4px 0; font-size: 0.95em;">• Verify relayer URL is configured</div>
          <div style="color: var(--palette-text, #ccd4e0); margin: 4px 0; font-size: 0.95em;">• Try: ${createCommandLine("markets:list --venue polymarket --limit 10", "")}</div>
        </div>
      `;
      context.logHtml(helpHtml);
  }
}

/**
 * markets:view - View market details
 * Usage: markets:view <marketId> [--out <format>]
 * Alias: m:cat
 */
async function handleMarketsView(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const marketId = parsed.positional[0];

    if (!marketId) {
      const usageHtml = createUsageError("markets:view <marketId>", [
        "markets:view polymarket:12345",
        "markets:view kalshi:abc123",
      ]);
      context.logHtml(usageHtml);
      return;
    }

  const [venue, id] = marketId.includes(":") 
    ? marketId.split(":", 2)
    : ["polymarket", marketId];

  context.log(`📊 Fetching market details for ${venue}:${id}...`, "info");

  try {
    // Use unified market detail API
    const apiUrl = `/api/markets/${venue}/${id}`;
    let market: any = null;

    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      market = data.market;
    } else {
      // Fallback to direct relayer calls
      if (venue === "polymarket" || venue === "pm") {
        const fallbackResponse = await fetch(
          `${context.config.RELAYER_URL}/polymarket/event/${id}`
        );
        if (fallbackResponse.ok) {
          market = await fallbackResponse.json();
        }
      } else if (venue === "kalshi") {
        const fallbackResponse = await fetch(
          `${context.config.RELAYER_URL}/kalshi/market/${id}`
        );
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          market = data.market;
        }
      }
    }

    if (!market) {
      context.log("❌ Market not found", "error");
      context.log("", "output");
      context.log("💡 Tips:", "info");
      const helpHtml = `
        <div style="margin: 8px 0; padding-left: 20px;">
          <div style="color: var(--palette-text, #ccd4e0); margin: 4px 0; font-size: 0.95em;">• Verify market ID format: venue:id</div>
          <div style="color: var(--palette-text, #ccd4e0); margin: 4px 0; font-size: 0.95em;">• Use ${createCommandLine("markets:list", "to find available markets")}</div>
        </div>
      `;
      context.logHtml(helpHtml);
      return;
    }

    // Format dates
    const formatDate = (dateStr: any) => {
      if (!dateStr || dateStr === "N/A") return "N/A";
      try {
        return new Date(dateStr).toLocaleString();
      } catch {
        return String(dateStr);
      }
    };

    // Display as card
    const cardData: Record<string, any> = {
      question: market.question || market.title || market.subtitle || "N/A",
      venue: venue,
      volume: market.volume || market.volume24hr 
        ? formatCurrency(parseFloat(market.volume || market.volume24hr || "0"))
        : "N/A",
      liquidity: market.liquidity ? formatCurrency(parseFloat(market.liquidity)) : "N/A",
      status: market.closed || market.status === "closed" ? "🔒 Closed" : "🟢 Active",
      closes: formatDate(market.end_date_iso || market.close_time),
    };

    // Add outcomes if available
    const outcomes = market.outcomes || market.markets || [];
    if (outcomes.length > 0) {
      cardData.outcomes = outcomes.map((o: any) => ({
        name: o.name || o.title || "Unknown",
        price: o.price || o.lastTradePrice || "N/A",
      }));
    }

    const html = renderCard(cardData, `Market: ${venue}:${id}`);
    context.logHtml(html);
    context.log(`✓ Market details loaded`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
      context.log("", "output");
      context.log("💡 Troubleshooting:", "info");
      const helpHtml = `
        <div style="margin: 8px 0; padding-left: 20px;">
          <div style="color: var(--palette-text, #ccd4e0); margin: 4px 0; font-size: 0.95em;">• Check network connection</div>
          <div style="color: var(--palette-text, #ccd4e0); margin: 4px 0; font-size: 0.95em;">• Verify market ID is correct</div>
        </div>
      `;
      context.logHtml(helpHtml);
  }
}

/**
 * markets:heatmap - Sentiment/flow heatmap
 * Usage: markets:heatmap [--by <dimension>] [--window <time>]
 * Alias: m:heat
 */
async function handleMarketsHeatmap(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const by = getFlagString(parsed.flags, "by", "tag");
  const window = getFlagString(parsed.flags, "window", "24h");

  context.log(`📊 Generating heatmap by ${by} (${window})...`, "info");

  // TODO: Implement actual heatmap data aggregation
  context.log("💡 Heatmap visualization coming soon", "info");
  context.log("", "output");
  context.log("   This will show sentiment/flow analysis across markets", "output");
  context.log("   Features:", "output");
  context.log("   • Sentiment analysis by tag/category", "output");
  context.log("   • Volume flow visualization", "output");
  context.log("   • Time-based aggregation", "output");
}

/**
 * markets:similar - Find similar markets
 * Usage: markets:similar "<query>" [--limit <n>]
 * Alias: m:sim
 */
async function handleMarketsSimilar(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const query = parsed.positional.join(" ") || getFlagString(parsed.flags, "q");
  const limit = getFlagNumber(parsed.flags, "limit", 10);

  if (!query) {
    const usageHtml = createUsageError('markets:similar "<query>"', [
      'markets:similar "ETH > $10k by 2026"',
      'markets:similar "Bitcoin price"',
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`🔍 Finding markets similar to: "${query}"...`, "info");

  // TODO: Implement vector similarity search
  context.log("💡 Similar markets search coming soon", "info");
  context.log("", "output");
  context.log("   This will use vector embeddings to find semantically similar markets", "output");
  context.log("   Features:", "output");
  context.log("   • Semantic similarity matching", "output");
  context.log("   • Related market recommendations", "output");
  context.log("   • Context-aware search", "output");
}

/**
 * Help function for markets commands
 */
function handleMarketsHelp(context: CommandContext): void {
  const helpHtml = `
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
        ═══ MARKETS HELP ═══
      </div>
      
      <div style="margin: 16px 0;">
        <div style="
          font-size: 14px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 12px;
          padding: 4px 0;
          border-bottom: 1px solid var(--palette-border, rgba(0, 212, 255, 0.2));
        ">
          MARKET COMMANDS
        </div>
        
        <div style="margin: 12px 0; padding-left: 20px;">
          ${createCommandLine("markets:list", "List and filter prediction markets")}
          <div style="
            color: var(--palette-primary, #00d4ff);
            font-size: 0.85em;
            margin-left: 20px;
            margin-top: 4px;
            font-style: italic;
          ">Alias: m:ls</div>
          <div style="
            color: var(--palette-text, #ccd4e0);
            margin-left: 0;
            margin-top: 4px;
            font-size: 11px;
            font-family: 'Courier New', monospace;
          ">
            → Usage: markets:list [--venue <venue>] [--tag <tag>] [--sort <type>] [--limit <n>] [--q <query>]
          </div>
        </div>

        <div style="margin: 12px 0; padding-left: 20px;">
          ${createCommandLine("markets:view <marketId>", "View market details")}
          <div style="
            color: var(--palette-primary, #00d4ff);
            font-size: 0.85em;
            margin-left: 20px;
            margin-top: 4px;
            font-style: italic;
          ">Alias: m:cat</div>
        </div>

        <div style="margin: 12px 0; padding-left: 20px;">
          ${createCommandLine("markets:heatmap", "Sentiment/flow heatmap")}
          <div style="
            color: var(--palette-primary, #00d4ff);
            font-size: 0.85em;
            margin-left: 20px;
            margin-top: 4px;
            font-style: italic;
          ">Alias: m:heat</div>
          <div style="
            color: var(--palette-text, #ccd4e0);
            margin-left: 0;
            margin-top: 4px;
            font-size: 11px;
            font-family: 'Courier New', monospace;
          ">
            → Usage: markets:heatmap [--by <dimension>] [--window <time>]
          </div>
        </div>

        <div style="margin: 12px 0; padding-left: 20px;">
          ${createCommandLine('markets:similar "<query>"', "Find similar markets")}
          <div style="
            color: var(--palette-primary, #00d4ff);
            font-size: 0.85em;
            margin-left: 20px;
            margin-top: 4px;
            font-style: italic;
          ">Alias: m:sim</div>
        </div>
      </div>

      <div style="
        margin-top: 25px;
        padding: 15px;
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        border-radius: 6px;
        text-align: center;
      ">
        <span style="color: var(--palette-primary, #00d4ff); font-weight: bold;">💡</span>
        <span style="color: var(--palette-text, #ccd4e0); margin-left: 8px;">
          Use <span class="omega-help-command" data-command="help" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 6px; border-radius: 3px; transition: all 0.2s ease; background: rgba(0, 255, 136, 0.1);" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 20%, transparent)';" onmouseout="this.style.background = 'rgba(0, 255, 136, 0.1)';" title="Click to add 'help' to terminal input">help</span> to see all commands
        </span>
      </div>
    </div>
  `;
  context.logHtml(helpHtml);
}

// Add help handler to list command
async function handleMarketsListWithHelp(
  context: CommandContext,
  args: string[]
): Promise<void> {
  if (args[1] === "help" || args[1] === "--help" || args[1] === "-h") {
    handleMarketsHelp(context);
    return;
  }
  return handleMarketsList(context, args);
}

// Export commands
export const marketsListCommand: Command = {
  name: "markets:list",
  aliases: ["m:ls"],
  description: "List and filter prediction markets",
  usage: "markets:list [--venue <venue>] [--tag <tag>] [--sort <type>] [--limit <n>] [--q <query>]",
  category: "trading",
  handler: handleMarketsListWithHelp,
};

export const marketsViewCommand: Command = {
  name: "markets:view",
  aliases: ["m:cat"],
  description: "View market details",
  usage: "markets:view <marketId>",
  category: "trading",
  handler: handleMarketsView,
};

export const marketsHeatmapCommand: Command = {
  name: "markets:heatmap",
  aliases: ["m:heat"],
  description: "Sentiment/flow heatmap",
  usage: "markets:heatmap [--by <dimension>] [--window <time>]",
  category: "trading",
  handler: handleMarketsHeatmap,
};

export const marketsSimilarCommand: Command = {
  name: "markets:similar",
  aliases: ["m:sim"],
  description: "Find similar markets",
  usage: 'markets:similar "<query>" [--limit <n>]',
  category: "trading",
  handler: handleMarketsSimilar,
};

export const marketsCommands: Command[] = [
  marketsListCommand,
  marketsViewCommand,
  marketsHeatmapCommand,
  marketsSimilarCommand,
];

