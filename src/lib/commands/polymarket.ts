/**
 * Polymarket Prediction Markets Commands
 * Based on vanilla js/commands/remaining.js polymarket implementation
 */

import type { Command, CommandContext } from "@/types/commands";
import { createUsageError } from "./command-output-helpers";

// Polymarket API endpoints
const POLYMARKET_API_BASE = "https://gamma-api.polymarket.com";
const POLYMARKET_BRIDGE_API = "https://bridge.polymarket.com";
const POLYMARKET_CLOB_API = "https://clob.polymarket.com";
const POLYMARKET_WS_URL = "wss://clob.polymarket.com"; // WebSocket URL for real-time data

/**
 * Polymarket WebSocket Authentication Helper
 * According to: https://docs.polymarket.com/developers/CLOB/websocket/wss-auth
 * Only connections to 'user' channel require authentication
 */
interface PolymarketWSAuth {
  apikey?: string; // Polygon account's CLOB api key
  secret?: string; // Polygon account's CLOB api secret
  passphrase?: string; // Polygon account's CLOB api passphrase
}

/**
 * Generate WebSocket authentication payload for Polymarket
 * @param auth - Authentication credentials
 * @returns Authentication object for WebSocket connection
 */
function getPolymarketWSAuth(auth: PolymarketWSAuth): PolymarketWSAuth {
  return {
    apikey: auth.apikey,
    secret: auth.secret,
    passphrase: auth.passphrase,
  };
}

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
      case "trades":
        await getPolymarketTrades(context, args);
        break;
      case "bridge":
      case "deposit":
        await getPolymarketBridgeDeposit(context, args);
        break;
      case "search":
        if (args.length < 3) {
          const usageHtml = createUsageError("polymarket search <query>", [
            "polymarket search bitcoin",
            "polymarket search ethereum",
          ]);
          context.logHtml(usageHtml);
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
    "polymarket trades",
    "",
    "Recent trades for a market",
    "",
    "→ Usage: polymarket trades [marketId] [limit]",
    "  Example: polymarket trades 0x123... 20",
    "",
    "polymarket bridge",
    "",
    "Get deposit addresses for bridging assets to Polymarket",
    "",
    "→ Usage: polymarket bridge [address]",
    "  Example: polymarket bridge 0x123...",
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
      "🔥 Trending Markets (Highest Volume)"
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
      "/events?order=id&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "🆕 Newest Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketBreaking(context: CommandContext): Promise<void> {
  context.log("🚨 Fetching breaking news markets...", "info");

  try {
    // Breaking news = high volume + recent
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "🚨 Breaking News Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

// Helper function to safely extract and normalize tags
function getNormalizedTags(event: any): string[] {
  const tags = event.tags || event.categories || [];
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t: any) => t != null) // Filter out null/undefined
    .map((t: any) => {
      // Handle string tags
      if (typeof t === 'string') return t.toLowerCase();
      // Handle object tags with name/title property
      if (typeof t === 'object' && t.name) return String(t.name).toLowerCase();
      if (typeof t === 'object' && t.title) return String(t.title).toLowerCase();
      // Fallback: convert to string
      return String(t).toLowerCase();
    })
    .filter((tag: string) => tag.length > 0); // Remove empty strings
}

async function getPolymarketPolitics(context: CommandContext): Promise<void> {
  context.log("🏛️ Fetching political markets...", "info");

  try {
    // Fetch markets and filter by politics-related keywords
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=200"
    );
    
    // Filter for politics-related markets
    const filtered = Array.isArray(data) ? data.filter((event: any) => {
      const question = (event.question || event.title || "").toLowerCase();
      const tags = getNormalizedTags(event);
      const politicsKeywords = ['politics', 'political', 'election', 'president', 'congress', 'senate', 'house', 'democrat', 'republican', 'trump', 'biden', 'vote', 'voting', 'campaign', 'candidate', 'ballot', 'primary', 'caucus', 'governor', 'mayor', 'senator', 'representative', 'policy', 'legislation', 'bill', 'law'];
      return politicsKeywords.some(keyword => 
        question.includes(keyword) || tags.some((tag: string) => tag.includes(keyword))
      );
    }) : [];
    
    displayPolymarketMarkets(context, filtered.slice(0, 50), "🏛️ Political Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketSports(context: CommandContext): Promise<void> {
  context.log("⚽ Fetching sports markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=200"
    );
    
    // Filter for sports-related markets
    const filtered = Array.isArray(data) ? data.filter((event: any) => {
      const question = (event.question || event.title || "").toLowerCase();
      const tags = getNormalizedTags(event);
      const sportsKeywords = ['sports', 'sport', 'nfl', 'nba', 'mlb', 'nhl', 'soccer', 'football', 'basketball', 'baseball', 'hockey', 'tennis', 'golf', 'boxing', 'ufc', 'mma', 'olympics', 'world cup', 'super bowl', 'championship', 'playoff', 'playoff', 'mvp', 'player', 'team', 'game', 'match', 'tournament', 'league'];
      return sportsKeywords.some(keyword => 
        question.includes(keyword) || tags.some((tag: string) => tag.includes(keyword))
      );
    }) : [];
    
    displayPolymarketMarkets(context, filtered.slice(0, 50), "⚽ Sports Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketCrypto(context: CommandContext): Promise<void> {
  context.log("₿ Fetching crypto markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=200"
    );
    
    // Filter for crypto-related markets
    const filtered = Array.isArray(data) ? data.filter((event: any) => {
      const question = (event.question || event.title || "").toLowerCase();
      const tags = getNormalizedTags(event);
      const cryptoKeywords = ['crypto', 'cryptocurrency', 'bitcoin', 'btc', 'ethereum', 'eth', 'blockchain', 'defi', 'nft', 'token', 'coin', 'altcoin', 'exchange', 'binance', 'coinbase', 'price', 'market cap', 'mining', 'staking', 'yield', 'protocol', 'dao', 'web3', 'metaverse', 'stablecoin', 'usdc', 'usdt', 'dai'];
      return cryptoKeywords.some(keyword => 
        question.includes(keyword) || tags.some((tag: string) => tag.includes(keyword))
      );
    }) : [];
    
    displayPolymarketMarkets(context, filtered.slice(0, 50), "₿ Crypto Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketEarnings(context: CommandContext): Promise<void> {
  context.log("💰 Fetching earnings markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=200"
    );
    
    // Filter for earnings-related markets
    const filtered = Array.isArray(data) ? data.filter((event: any) => {
      const question = (event.question || event.title || "").toLowerCase();
      const tags = getNormalizedTags(event);
      const earningsKeywords = ['earnings', 'revenue', 'profit', 'quarterly', 'q1', 'q2', 'q3', 'q4', 'financial', 'report', 'guidance', 'beat', 'miss', 'eps', 'earnings per share'];
      return earningsKeywords.some(keyword => 
        question.includes(keyword) || tags.some((tag: string) => tag.includes(keyword))
      );
    }) : [];
    
    displayPolymarketMarkets(context, filtered.slice(0, 50), "💰 Earnings Markets");
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
      "/events?order=volume&ascending=false&closed=false&limit=200"
    );
    
    // Filter for geopolitics-related markets
    const filtered = Array.isArray(data) ? data.filter((event: any) => {
      const question = (event.question || event.title || "").toLowerCase();
      const tags = getNormalizedTags(event);
      const geopoliticsKeywords = ['geopolitics', 'geopolitical', 'war', 'conflict', 'russia', 'ukraine', 'china', 'iran', 'israel', 'palestine', 'middle east', 'nato', 'united nations', 'sanctions', 'trade war', 'diplomacy', 'treaty', 'alliance', 'military', 'defense', 'security', 'border', 'territory'];
      return geopoliticsKeywords.some(keyword => 
        question.includes(keyword) || tags.some((tag: string) => tag.includes(keyword))
      );
    }) : [];
    
    displayPolymarketMarkets(context, filtered.slice(0, 50), "🌍 Geopolitical Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketTech(context: CommandContext): Promise<void> {
  context.log("💻 Fetching technology markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=200"
    );
    
    // Filter for tech-related markets
    const filtered = Array.isArray(data) ? data.filter((event: any) => {
      const question = (event.question || event.title || "").toLowerCase();
      const tags = getNormalizedTags(event);
      const techKeywords = ['tech', 'technology', 'ai', 'artificial intelligence', 'apple', 'google', 'microsoft', 'amazon', 'meta', 'facebook', 'tesla', 'nvidia', 'amd', 'intel', 'software', 'hardware', 'startup', 'ipo', 'earnings', 'stock', 'nasdaq', 'sp500', 'innovation', 'product', 'launch', 'release', 'update', 'app', 'platform', 'service'];
      return techKeywords.some(keyword => 
        question.includes(keyword) || tags.some((tag: string) => tag.includes(keyword))
      );
    }) : [];
    
    displayPolymarketMarkets(context, filtered.slice(0, 50), "💻 Technology Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketCulture(context: CommandContext): Promise<void> {
  context.log("🎭 Fetching culture markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=200"
    );
    
    // Filter for culture-related markets
    const filtered = Array.isArray(data) ? data.filter((event: any) => {
      const question = (event.question || event.title || "").toLowerCase();
      const tags = getNormalizedTags(event);
      const cultureKeywords = ['culture', 'entertainment', 'movie', 'film', 'tv', 'television', 'show', 'music', 'album', 'song', 'artist', 'celebrity', 'actor', 'actress', 'award', 'oscar', 'grammy', 'emmy', 'golden globe', 'book', 'author', 'fashion', 'trend', 'viral', 'meme', 'social media'];
      return cultureKeywords.some(keyword => 
        question.includes(keyword) || tags.some((tag: string) => tag.includes(keyword))
      );
    }) : [];
    
    displayPolymarketMarkets(context, filtered.slice(0, 50), "🎭 Culture Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketWorld(context: CommandContext): Promise<void> {
  context.log("🌎 Fetching world events markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=50"
    );
    displayPolymarketMarkets(context, data, "🌎 World Events Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketEconomy(context: CommandContext): Promise<void> {
  context.log("📈 Fetching economic markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=200"
    );
    
    // Filter for economy-related markets
    const filtered = Array.isArray(data) ? data.filter((event: any) => {
      const question = (event.question || event.title || "").toLowerCase();
      const tags = getNormalizedTags(event);
      const economyKeywords = ['economy', 'economic', 'gdp', 'inflation', 'unemployment', 'fed', 'federal reserve', 'interest rate', 'recession', 'depression', 'market', 'stock market', 'dow', 'sp500', 'nasdaq', 'trade', 'tariff', 'import', 'export', 'currency', 'dollar', 'euro', 'yen', 'pound'];
      return economyKeywords.some(keyword => 
        question.includes(keyword) || tags.some((tag: string) => tag.includes(keyword))
      );
    }) : [];
    
    displayPolymarketMarkets(context, filtered.slice(0, 50), "📈 Economic Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketTrump(context: CommandContext): Promise<void> {
  context.log("🗽 Fetching Trump-related markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=200"
    );
    
    // Filter for Trump-related markets
    const filtered = Array.isArray(data) ? data.filter((event: any) => {
      const question = (event.question || event.title || "").toLowerCase();
      const tags = getNormalizedTags(event);
      return question.includes('trump') || tags.some((tag: string) => tag.includes('trump'));
    }) : [];
    
    displayPolymarketMarkets(context, filtered.slice(0, 50), "🗽 Trump-Related Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketElections(context: CommandContext): Promise<void> {
  context.log("🗳️ Fetching election markets...", "info");

  try {
    const data = await makePolymarketRequest(
      context,
      "/events?order=volume&ascending=false&closed=false&limit=200"
    );
    
    // Filter for election-related markets
    const filtered = Array.isArray(data) ? data.filter((event: any) => {
      const question = (event.question || event.title || "").toLowerCase();
      const tags = getNormalizedTags(event);
      const electionKeywords = ['election', 'vote', 'voting', 'ballot', 'presidential', 'president', 'primary', 'caucus', 'candidate', 'campaign', 'poll', 'polls', 'polling', 'electoral', 'electoral college', 'swing state', 'battleground'];
      return electionKeywords.some(keyword => 
        question.includes(keyword) || tags.some((tag: string) => tag.includes(keyword))
      );
    }) : [];
    
    displayPolymarketMarkets(context, filtered.slice(0, 50), "🗳️ Election Markets");
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

async function getPolymarketTrades(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const marketId = args[2]; // Market ID (condition ID)
  const limit = Number(args[3]) || 20;

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        📊 Fetching recent trades${marketId ? ` for market ${marketId}` : ''}...
      </div>
    </div>
  `;
  context.logHtml(infoHtml);

  try {
    // Build trades endpoint - Polymarket CLOB API uses /trades
    // According to docs: https://docs.polymarket.com/developers/CLOB/trades/trades
    let endpoint = "/trades";
    const params = new URLSearchParams();
    if (marketId) {
      params.append("market", marketId);
    }
    params.append("limit", String(limit));
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const data = await makePolymarketRequest(context, endpoint);
    
    // Handle different response structures
    let trades: any[] = [];
    if (Array.isArray(data)) {
      trades = data;
    } else if (data.trades && Array.isArray(data.trades)) {
      trades = data.trades;
    } else if (data.data && Array.isArray(data.data)) {
      trades = data.data;
    }

    if (trades.length === 0) {
      const noTradesHtml = `
        <div style="
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          color: var(--palette-text, #e0e0e0);
          padding: 12px;
        ">
          <div style="
            background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
            border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
            border-radius: 8px;
            padding: 16px;
            text-align: center;
          ">
            <div style="color: var(--palette-text, #e0e0e0); font-size: 14px;">No trades found${marketId ? ` for market ${marketId}` : ''}</div>
            ${!marketId ? '<div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-top: 8px;">💡 Specify a market ID: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">polymarket trades 0x123...</code></div>' : ''}
          </div>
        </div>
      `;
      context.logHtml(noTradesHtml);
      return;
    }

    // Generate HTML output
    let tradesHtml = `
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
          💹 Recent Trades (${trades.length}${marketId ? ` for ${marketId.substring(0, 10)}...` : ''})
        </div>
    `;

    trades.slice(0, limit).forEach((trade: any, index: number) => {
      const side = trade.side || trade.type || 'BUY';
      const isBuy = side.toUpperCase() === 'BUY';
      const emoji = isBuy ? "🟢" : "🔴";
      const sideColor = isBuy 
        ? "var(--palette-success, #16c782)" 
        : "var(--palette-error, #ff4d4f)";
      
      const matchTime = trade.match_time || trade.last_update || trade.created_time;
      const time = matchTime ? new Date(matchTime).toLocaleString() : "N/A";
      const price = parseFloat(trade.price || "0") || 0;
      const size = parseFloat(trade.size || "0") || 0;
      const market = trade.market || marketId || "N/A";
      const outcome = trade.outcome || "N/A";
      const feeRate = trade.fee_rate_bps ? (parseFloat(trade.fee_rate_bps) / 100).toFixed(2) : "0.00";
      
      tradesHtml += `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
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
            ">${(index + 1).toString().padStart(2, "0")}.</span>
            <div style="
              color: var(--palette-text, #e0e0e0);
              font-weight: 600;
              flex: 1;
            ">${outcome}</div>
          </div>
          <div style="
            margin-left: 32px;
            font-size: 11px;
            color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
          ">
            <div style="margin-bottom: 4px;">
              <span style="color: ${sideColor}; font-weight: 600;">${emoji} ${side.toUpperCase()}</span> | 
              Size: <strong>${size.toLocaleString()}</strong> | 
              Price: <strong style="color: var(--palette-primary, #00bcf2);">$${price.toFixed(4)}</strong>
              ${trade.fee_rate_bps ? ` | Fee: ${feeRate}%` : ''}
            </div>
            <div style="margin-bottom: 4px; color: color-mix(in srgb, var(--palette-text, #ffffff) 55%, transparent);">
              Market: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px; font-size: 10px;">${market.substring(0, 20)}${market.length > 20 ? '...' : ''}</code>
            </div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 55%, transparent);">
              📅 ${time}
              ${trade.transaction_hash ? ` | <a href="https://polygonscan.com/tx/${trade.transaction_hash}" target="_blank" rel="noopener noreferrer" style="color: var(--palette-primary, #00d4ff); text-decoration: none;">View TX</a>` : ''}
            </div>
          </div>
        </div>
      `;
    });

    tradesHtml += `
      <div style="
        margin-top: 20px;
        padding: 12px;
        border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        border-radius: 4px;
        text-align: center;
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        <div style="
          color: var(--palette-primary, #00d4ff);
          font-size: 11px;
        ">
          💡 Use "polymarket help" for more commands | 🔗 Trade at <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" style="color: var(--palette-secondary, #00ff88);">polymarket.com</a>
        </div>
      </div>
    </div>
    `;

    context.logHtml(tradesHtml);
  } catch (error: any) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching trades</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
          ${!marketId ? '<div style="color: var(--palette-text, #e0e0e0); font-size: 11px; margin-top: 8px;">💡 Usage: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">polymarket trades &lt;marketId&gt; [limit]</code></div>' : ''}
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
  }
}

async function getPolymarketBridgeDeposit(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Get address from args or use connected wallet
  let address = args[2];
  
  if (!address && context.wallet?.address) {
    address = context.wallet.address;
  }

  if (!address) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 12px;">❌ Address Required</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 12px;">
            Please provide a wallet address or connect your wallet first.
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
            <strong>Usage:</strong> <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">polymarket bridge &lt;address&gt;</code>
          </div>
          ${!context.wallet?.address ? `
          <div style="margin-top: 12px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); border-radius: 4px;">
            <div style="color: var(--palette-primary, #00d4ff); font-size: 11px;">
              💡 Connect your wallet: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px; cursor: pointer;" class="omega-help-command" data-command="connect">connect</code>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
    return;
  }

  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Invalid Address Format</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">Address must be a valid Ethereum address (0x followed by 40 hex characters)</div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
    return;
  }

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        🌉 Generating deposit addresses for ${address.substring(0, 10)}...${address.substring(address.length - 8)}...
      </div>
    </div>
  `;
  context.logHtml(infoHtml);

  try {
    // Call Polymarket Bridge API: https://bridge.polymarket.com/deposit
    // According to docs: https://docs.polymarket.com/developers/misc-endpoints/bridge-deposit
    const bridgeUrl = "https://bridge.polymarket.com/deposit";
    
    const response = await fetch(bridgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        address: address,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    const depositAddresses = data.depositAddresses || [];

    if (depositAddresses.length === 0) {
      const noAddressesHtml = `
        <div style="
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          color: var(--palette-text, #e0e0e0);
          padding: 12px;
        ">
          <div style="
            background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
            border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
            border-radius: 8px;
            padding: 16px;
            text-align: center;
          ">
            <div style="color: var(--palette-text, #e0e0e0); font-size: 14px;">No deposit addresses available</div>
          </div>
        </div>
      `;
      context.logHtml(noAddressesHtml);
      return;
    }

    // Generate HTML output
    let bridgeHtml = `
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
          🌉 Polymarket Bridge Deposit Addresses
        </div>
        <div style="
          background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        ">
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">
            <strong>Your Polymarket Wallet:</strong> <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px; font-size: 11px;">${address}</code>
          </div>
          <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); font-size: 11px;">
            💡 Send assets to the addresses below. They will be automatically bridged and swapped to USDC.e on Polygon.
          </div>
        </div>
    `;

    depositAddresses.forEach((deposit: any, index: number) => {
      const chainName = deposit.chainName || "Unknown Chain";
      const tokenSymbol = deposit.tokenSymbol || "Unknown";
      const depositAddress = deposit.depositAddress || "";
      const chainId = deposit.chainId || "";
      const tokenAddress = deposit.tokenAddress || "";

      bridgeHtml += `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
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
            ">${(index + 1).toString().padStart(2, "0")}.</span>
            <div style="
              color: var(--palette-text, #e0e0e0);
              font-weight: 600;
              flex: 1;
            ">${chainName} - ${tokenSymbol}</div>
          </div>
          <div style="
            margin-left: 32px;
            font-size: 11px;
            color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
          ">
            <div style="margin-bottom: 8px;">
              <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Deposit Address:</div>
              <div style="
                background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent);
                border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
                border-radius: 4px;
                padding: 8px;
                font-family: 'Courier New', monospace;
                font-size: 10px;
                word-break: break-all;
                color: var(--palette-secondary, #00ff88);
                margin-bottom: 4px;
              ">
                ${depositAddress}
              </div>
              <button
                onclick="navigator.clipboard.writeText('${depositAddress}').then(() => { this.textContent = '✓ Copied!'; setTimeout(() => { this.textContent = '📋 Copy'; }, 2000); })"
                style="
                  background: color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent);
                  border: 1px solid var(--palette-primary, #00d4ff);
                  color: var(--palette-primary, #00d4ff);
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 10px;
                  cursor: pointer;
                  margin-top: 4px;
                "
              >
                📋 Copy
              </button>
            </div>
            ${chainId ? `<div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 55%, transparent); font-size: 10px;">Chain ID: ${chainId}</div>` : ''}
            ${tokenAddress ? `<div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 55%, transparent); font-size: 10px;">Token: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 4px; border-radius: 3px; font-size: 9px;">${tokenAddress.substring(0, 20)}...</code></div>` : ''}
          </div>
        </div>
      `;
    });

    bridgeHtml += `
      <div style="
        margin-top: 20px;
        padding: 12px;
        border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        border-radius: 4px;
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        <div style="
          color: var(--palette-primary, #00d4ff);
          font-size: 11px;
          margin-bottom: 8px;
          font-weight: bold;
        ">
          📋 How It Works:
        </div>
        <div style="
          color: var(--palette-text, #e0e0e0);
          font-size: 10px;
          line-height: 1.6;
        ">
          1. Send your assets (USDC, ETH, etc.) to the deposit address above<br/>
          2. Assets are automatically bridged to Polygon<br/>
          3. Assets are swapped to USDC.e on Polygon<br/>
          4. USDC.e is credited to your Polymarket wallet for trading<br/>
          5. Start trading on <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" style="color: var(--palette-secondary, #00ff88);">Polymarket.com</a>
        </div>
      </div>
      <div style="
        margin-top: 12px;
        padding: 12px;
        border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        border-radius: 4px;
        text-align: center;
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        <div style="
          color: var(--palette-primary, #00d4ff);
          font-size: 11px;
        ">
          💡 Use "polymarket help" for more commands | 🔗 <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" style="color: var(--palette-secondary, #00ff88);">Trade at polymarket.com</a>
        </div>
      </div>
    </div>
    `;

    context.logHtml(bridgeHtml);
  } catch (error: any) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error generating deposit addresses</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; margin-top: 8px;">
            💡 Usage: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">polymarket bridge &lt;address&gt;</code>
          </div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
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
    let outcomes = market.outcomes || market.markets || market.options || [];
    
    // Handle case where outcomes might be nested in a data property
    if (!Array.isArray(outcomes) && outcomes && typeof outcomes === 'object') {
      if (Array.isArray(outcomes.data)) {
        outcomes = outcomes.data;
      } else if (Array.isArray(outcomes.outcomes)) {
        outcomes = outcomes.outcomes;
      } else {
        outcomes = [];
      }
    }
    
    // Only show outcomes if we have valid array with items
    if (Array.isArray(outcomes) && outcomes.length > 0) {
      marketsHtml += `
        <div style="
          margin-top: 8px;
          margin-left: 32px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        ">
      `;
      outcomes.slice(0, 10).forEach((outcome: any) => {
        // Safely extract price
        let price = "N/A";
        const priceValue = outcome.price || outcome.lastTradePrice || outcome.last_price || outcome.currentPrice || outcome.volume;
        if (priceValue != null && !isNaN(parseFloat(String(priceValue)))) {
          price = `$${parseFloat(String(priceValue)).toFixed(2)}`;
        }
        
        // Safely extract name
        const name = outcome.name || outcome.title || outcome.outcome || outcome.label || outcome.option || "Unknown";
        
        // Only display if we have a valid name (not "Unknown" or empty)
        if (name && name !== "Unknown" && name.trim().length > 0) {
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
        }
      });
      marketsHtml += `</div>`;
    }

    // Add trading link if market slug/ID is available
    const marketSlug = market.slug || market.id || market.market_slug;
    if (marketSlug) {
      marketsHtml += `
        <div style="
          margin-top: 8px;
          margin-left: 32px;
        ">
          <a 
            href="https://polymarket.com/event/${marketSlug}" 
            target="_blank"
            rel="noopener noreferrer"
            style="
              color: var(--palette-primary, #00d4ff);
              text-decoration: none;
              font-size: 11px;
              padding: 4px 8px;
              border: 1px solid var(--palette-primary, #00d4ff);
              border-radius: 4px;
              display: inline-block;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)';"
            onmouseout="this.style.background = 'transparent';"
          >
            🔗 View on Polymarket →
          </a>
          ${marketSlug ? `
          <button
            class="omega-help-command"
            data-command="trade buy polymarket ${marketSlug} YES 10"
            style="
              color: var(--palette-success, #16c782);
              background: color-mix(in srgb, var(--palette-success, #16c782) 10%, transparent);
              border: 1px solid var(--palette-success, #16c782);
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 11px;
              cursor: pointer;
              font-family: 'Courier New', monospace;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-success, #16c782) 20%, transparent)';"
            onmouseout="this.style.background = 'color-mix(in srgb, var(--palette-success, #16c782) 10%, transparent)';"
            title="Buy YES ($10)"
          >
            🟢 Buy YES
          </button>
          <button
            class="omega-help-command"
            data-command="trade buy polymarket ${marketSlug} NO 10"
            style="
              color: var(--palette-error, #ff4d4f);
              background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
              border: 1px solid var(--palette-error, #ff4d4f);
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 11px;
              cursor: pointer;
              font-family: 'Courier New', monospace;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-error, #ff4d4f) 20%, transparent)';"
            onmouseout="this.style.background = 'color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent)';"
            title="Buy NO ($10)"
          >
            🔴 Buy NO
          </button>
          ` : ''}
        </div>
      `;
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
          💡 Use "polymarket help" for more commands | 🔗 Trade at <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" style="color: var(--palette-secondary, #00ff88);">polymarket.com</a>
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
