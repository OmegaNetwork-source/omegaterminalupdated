/**
 * Polymarket Prediction Markets Commands
 * Based on vanilla js/commands/remaining.js polymarket implementation
 */

import type { Command, CommandContext } from "@/types/commands";

// Polymarket API endpoints
const POLYMARKET_API_BASE = "https://gamma-api.polymarket.com";

/**
 * Polymarket command - Prediction market data
 */
export const polymarketCommand: Command = {
  name: "polymarket",
  description: "Polymarket prediction markets",
  usage:
    "polymarket <markets|trending|events|politics|sports|crypto|search|help>",
  category: "markets",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showPolymarketHelp(context);
      return;
    }

    switch (subcommand) {
      case "markets":
        await getPolymarketMarkets(context);
        break;
      case "trending":
        await getPolymarketTrending(context);
        break;
      case "events":
        await getPolymarketEvents(context);
        break;
      case "recent":
        await getPolymarketRecent(context);
        break;
      case "new":
        await getPolymarketNew(context);
        break;
      case "breaking":
        await getPolymarketBreaking(context);
        break;
      case "politics":
        await getPolymarketPolitics(context);
        break;
      case "sports":
        await getPolymarketSports(context);
        break;
      case "crypto":
        await getPolymarketCrypto(context);
        break;
      case "earnings":
        await getPolymarketEarnings(context);
        break;
      case "geopolitics":
        await getPolymarketGeopolitics(context);
        break;
      case "tech":
        await getPolymarketTech(context);
        break;
      case "culture":
        await getPolymarketCulture(context);
        break;
      case "world":
        await getPolymarketWorld(context);
        break;
      case "economy":
        await getPolymarketEconomy(context);
        break;
      case "trump":
        await getPolymarketTrump(context);
        break;
      case "elections":
        await getPolymarketElections(context);
        break;
      case "search":
        if (args.length < 3) {
          context.log("❌ Usage: polymarket search <query>", "error");
          return;
        }
        await searchPolymarket(context, args.slice(2).join(" "));
        break;
      default:
        context.log(`❌ Unknown subcommand: ${subcommand}`, "error");
        showPolymarketHelp(context);
    }
  },
};

function showPolymarketHelp(context: CommandContext): void {
  const helpLines: string[] = [
    "polymarket",
    "",
    "Polymarket prediction markets",
    "",
    "→ Usage: polymarket <markets|trending|events|politics|sports|crypto|search|help>",
    "",
    "═ Main Commands ═",
    "",
    "polymarket markets",
    "",
    "Get current active markets",
    "",
    "→ Usage: polymarket markets",
    "",
    "polymarket trending",
    "",
    "Get top volume markets",
    "",
    "→ Usage: polymarket trending",
    "",
    "polymarket events",
    "",
    "Get recent events (last 6 months)",
    "",
    "→ Usage: polymarket events",
    "",
    "polymarket recent",
    "",
    "Get very recent events (last month)",
    "",
    "→ Usage: polymarket recent",
    "",
    "polymarket search",
    "",
    "Search markets",
    "",
    "→ Usage: polymarket search <query>",
    "",
    "═ Category Commands ═",
    "",
    "polymarket breaking",
    "",
    "Breaking news markets",
    "",
    "→ Usage: polymarket breaking",
    "",
    "polymarket new",
    "",
    "Newest markets",
    "",
    "→ Usage: polymarket new",
    "",
    "polymarket politics",
    "",
    "Political markets",
    "",
    "→ Usage: polymarket politics",
    "",
    "polymarket sports",
    "",
    "Sports markets",
    "",
    "→ Usage: polymarket sports",
    "",
    "polymarket crypto",
    "",
    "Crypto markets",
    "",
    "→ Usage: polymarket crypto",
    "",
    "polymarket earnings",
    "",
    "Earnings markets",
    "",
    "→ Usage: polymarket earnings",
    "",
    "polymarket geopolitics",
    "",
    "Geopolitical markets",
    "",
    "→ Usage: polymarket geopolitics",
    "",
    "polymarket tech",
    "",
    "Technology markets",
    "",
    "→ Usage: polymarket tech",
    "",
    "polymarket culture",
    "",
    "Culture markets",
    "",
    "→ Usage: polymarket culture",
    "",
    "polymarket world",
    "",
    "World events",
    "",
    "→ Usage: polymarket world",
    "",
    "polymarket economy",
    "",
    "Economic markets",
    "",
    "→ Usage: polymarket economy",
    "",
    "polymarket trump",
    "",
    "Trump-related markets",
    "",
    "→ Usage: polymarket trump",
    "",
    "polymarket elections",
    "",
    "Election markets",
    "",
    "→ Usage: polymarket elections",
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
        ═══ POLYMARKET PREDICTION MARKETS ═══
      </div>
  `;

  helpLines.forEach((line) => {
    if (line.trim() === "") {
      helpHtml += `<div style="margin: 4px 0;"></div>`;
    } else if (line.startsWith("═ ")) {
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
    } else if (line === "💡 Tip") {
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
            Use category commands to filter markets by topic. Example: polymarket crypto
          </div>
        </div>
      `;
    } else {
      // Check if line is a command (handles both "markets" and "polymarket markets" formats)
      const isFullCommand = line.startsWith("polymarket ") && line.length < 50;
      const isSubcommand = line.length > 0 && 
        line.trim().length < 50 &&
        !line.includes(" ") && 
        line === line.toLowerCase() &&
        !line.startsWith("Get") &&
        !line.startsWith("Search") &&
        !line.startsWith("Political") &&
        !line.startsWith("Sports") &&
        !line.startsWith("Crypto") &&
        !line.startsWith("Breaking") &&
        !line.startsWith("Newest") &&
        !line.startsWith("Earnings") &&
        !line.startsWith("Geopolitical") &&
        !line.startsWith("Technology") &&
        !line.startsWith("Culture") &&
        !line.startsWith("World") &&
        !line.startsWith("Economic") &&
        !line.startsWith("Trump") &&
        !line.startsWith("Election") &&
        line.match(/^[a-z0-9-]+$/);

      if (isFullCommand || isSubcommand) {
        // Extract command part (remove <query> or other parameters)
        let commandText = line;
        if (isFullCommand) {
          // Already has "polymarket " prefix, remove parameter placeholders
          commandText = line.replace(/ <[^>]+>/g, "").trim();
        } else if (isSubcommand) {
          // Add "polymarket " prefix
          commandText = `polymarket ${line}`;
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

async function makePolymarketRequest(
  context: CommandContext,
  endpoint: string
): Promise<any> {
  const fullUrl = `${context.config.RELAYER_URL}/polymarket${endpoint}`;
  console.log("🔧 DEBUG [Polymarket]: Making request to:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("🔧 DEBUG [Polymarket]: API response structure:", {
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : undefined,
      firstItem:
        Array.isArray(data) && data.length > 0
          ? Object.keys(data[0])
          : undefined,
      sampleData: Array.isArray(data) && data.length > 0 ? data[0] : data,
    });
    return data;
  } catch (error: any) {
    console.error("🔧 DEBUG [Polymarket]: Request failed:", error);
    throw new Error(`Polymarket API Error: ${error.message}`);
  }
}

async function getPolymarketMarkets(context: CommandContext): Promise<void> {
  context.log("📊 Fetching comprehensive Polymarket markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=100"
    );
    displayPolymarketMarkets(context, data, "Current Active Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
    context.log(
      "💡 Make sure the relayer server is running with Polymarket proxy",
      "info"
    );
  }
}

async function getPolymarketTrending(context: CommandContext): Promise<void> {
  context.log("🔥 Fetching trending Polymarket markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(
      context,
      data,
      "Trending Markets (Highest Volume)"
    );
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketEvents(context: CommandContext): Promise<void> {
  context.log("📅 Fetching recent Polymarket events...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=100"
    );
    displayPolymarketMarkets(context, data, "Recent Events (Last 6 Months)");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketRecent(context: CommandContext): Promise<void> {
  context.log("🆕 Fetching very recent Polymarket events...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Very Recent Events (Last Month)");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketNew(context: CommandContext): Promise<void> {
  context.log("🆕 Fetching newest markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=100"
    );
    displayPolymarketMarkets(context, data, "Newest Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketBreaking(context: CommandContext): Promise<void> {
  context.log("🚨 Fetching breaking news markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Breaking News Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketPolitics(context: CommandContext): Promise<void> {
  context.log("🏛️ Fetching political markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Political Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketSports(context: CommandContext): Promise<void> {
  context.log("⚽ Fetching sports markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Sports Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketCrypto(context: CommandContext): Promise<void> {
  context.log("₿ Fetching crypto markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Crypto Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketEarnings(context: CommandContext): Promise<void> {
  context.log("💰 Fetching earnings markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Earnings Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketGeopolitics(
  context: CommandContext
): Promise<void> {
  context.log("🌍 Fetching geopolitical markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Geopolitical Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketTech(context: CommandContext): Promise<void> {
  context.log("💻 Fetching technology markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Technology Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketCulture(context: CommandContext): Promise<void> {
  context.log("🎭 Fetching culture markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Culture Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketWorld(context: CommandContext): Promise<void> {
  context.log("🌎 Fetching world events markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "World Events Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketEconomy(context: CommandContext): Promise<void> {
  context.log("📈 Fetching economic markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Economic Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketTrump(context: CommandContext): Promise<void> {
  context.log("🗽 Fetching Trump-related markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Trump-Related Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketElections(context: CommandContext): Promise<void> {
  context.log("🗳️ Fetching election markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "Election Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function searchPolymarket(
  context: CommandContext,
  query: string
): Promise<void> {
  context.log(`🔍 Searching Polymarket for: "${query}"`, "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    // Filter results by query (client-side filtering)
    const filteredData = Array.isArray(data)
      ? data.filter(
          (event: any) =>
            event.question &&
            event.question.toLowerCase().includes(query.toLowerCase())
        )
      : [];

    displayPolymarketMarkets(
      context,
      filteredData,
      `Search Results for "${query}"`
    );
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

function displayPolymarketMarkets(
  context: CommandContext,
  data: any[] | any,
  title: string
): void {
  console.log(
    "🔧 DEBUG [displayPolymarketMarkets]: Received data type:",
    typeof data
  );
  console.log(
    "🔧 DEBUG [displayPolymarketMarkets]: Is Array?",
    Array.isArray(data)
  );
  console.log("🔧 DEBUG [displayPolymarketMarkets]: Data:", data);

  // Handle both array and object responses
  let markets: any[] = [];
  if (Array.isArray(data)) {
    markets = data;
  } else if (data && typeof data === "object") {
    // Check common response wrappers
    if (data.data && Array.isArray(data.data)) {
      markets = data.data;
    } else if (data.markets && Array.isArray(data.markets)) {
      markets = data.markets;
    } else if (data.events && Array.isArray(data.events)) {
      markets = data.events;
    } else {
      console.error("🔧 DEBUG: Unknown data structure:", Object.keys(data));
    }
  }

  if (!markets || markets.length === 0) {
    context.log("❌ No markets found", "error");
    console.log("🔧 DEBUG: No markets found in data");
    return;
  }

  console.log(`🔧 DEBUG: Processing ${markets.length} markets`);
  console.log("🔧 DEBUG: First market structure:", markets[0]);

  // Generate HTML output with theme-aware styling
  let marketsHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        font-size: 16px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
        padding: 8px;
        border-bottom: 2px solid var(--palette-border, rgba(0, 212, 255, 0.3));
      ">
        📊 ${title} (${markets.length} markets)
      </div>
  `;

  markets.slice(0, 20).forEach((market: any, index: number) => {
    const num = (index + 1).toString().padStart(2, "0");

    // Try different field names for question/title
    const question =
      market.question ||
      market.title ||
      market.name ||
      market.market ||
      "No question available";

    // Try different field names for volume
    const volume =
      market.volume ||
      market.volume24hr ||
      market.volumeNum ||
      market.totalVolume
        ? `$${parseFloat(
            market.volume ||
              market.volume24hr ||
              market.volumeNum ||
              market.totalVolume
          ).toLocaleString()}`
        : "N/A";

    // Try different field names for end date
    const endDate =
      market.end_date_iso ||
      market.endDate ||
      market.end_date ||
      market.expirationDate
        ? new Date(
            market.end_date_iso ||
              market.endDate ||
              market.end_date ||
              market.expirationDate
          ).toLocaleDateString()
        : "N/A";

    const status =
      market.closed || market.active === false ? "🔒 Closed" : "🟢 Active";
    const statusColor = market.closed || market.active === false 
      ? "var(--palette-error, #ff4d4f)" 
      : "var(--palette-success, #16c782)";

    marketsHtml += `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        transition: all 0.2s ease;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        ">
          <span style="
            color: var(--palette-primary, #00bcf2);
            font-weight: bold;
            font-size: 12px;
            min-width: 24px;
          ">${num}.</span>
          <div style="
            color: var(--palette-text, #e0e0e0);
            font-weight: 600;
            flex: 1;
            line-height: 1.4;
          ">${question}</div>
        </div>
        <div style="
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 11px;
          color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
          margin-left: 32px;
        ">
          <span>💰 Volume: <strong style="color: var(--palette-primary, #00bcf2);">${volume}</strong></span>
          <span>📅 End: ${endDate}</span>
          <span style="color: ${statusColor};">${status}</span>
        </div>
    `;

    // Try different field names for outcomes
    const outcomes = market.outcomes || market.markets || market.options || [];
    if (outcomes && outcomes.length > 0) {
      marketsHtml += `
        <div style="
          margin-top: 8px;
          margin-left: 32px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        ">
      `;
      outcomes.forEach((outcome: any) => {
        const price =
          outcome.price || outcome.lastTradePrice || outcome.last_price
            ? `$${parseFloat(
                outcome.price || outcome.lastTradePrice || outcome.last_price
              ).toFixed(2)}`
            : "N/A";
        const name =
          outcome.name || outcome.title || outcome.outcome || "Unknown";
        marketsHtml += `
          <span style="
            background: color-mix(in srgb, var(--palette-primary, #00bcf2) 15%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-primary, #00bcf2) 30%, transparent);
            color: var(--palette-primary, #00bcf2);
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
          ">${name}: ${price}</span>
        `;
      });
      marketsHtml += `</div>`;
    }

    marketsHtml += `</div>`;
  });

  if (markets.length > 20) {
    marketsHtml += `
      <div style="
        text-align: center;
        color: var(--palette-primary, #00bcf2);
        margin-top: 16px;
        font-size: 12px;
      ">
        ... and ${markets.length - 20} more markets
      </div>
    `;
  }

  marketsHtml += `
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
          💡 Use "polymarket help" for more commands
        </div>
      </div>
    </div>
  `;

  context.logHtml(marketsHtml);
}

/**
 * Crypto Command - Shortcut to Polymarket Crypto Markets
 */
export const cryptoCommand: Command = {
  name: "crypto",
  description: "Crypto prediction markets (shortcut to polymarket crypto)",
  category: "markets",
  handler: async (context: CommandContext) => {
    context.log("🔗 Opening Polymarket Crypto Markets...", "info");
    await getPolymarketCrypto(context);
  },
};

export const polymarketCommands: Command[] = [polymarketCommand, cryptoCommand];
