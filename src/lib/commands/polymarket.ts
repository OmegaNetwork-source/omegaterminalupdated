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
  context.log("🎯 POLYMARKET PREDICTION MARKETS", "info");
  context.log("════════════════════════════════════", "output");
  context.log("📋 MAIN COMMANDS:", "info");
  context.log("polymarket help        Show this help", "output");
  context.log("polymarket markets     Get current active markets", "output");
  context.log("polymarket trending    Get top volume markets", "output");
  context.log(
    "polymarket events      Get recent events (last 6 months)",
    "output"
  );
  context.log(
    "polymarket recent      Get very recent events (last month)",
    "output"
  );
  context.log("polymarket search <q>  Search markets", "output");
  context.log("", "output");
  context.log("🔥 CATEGORY COMMANDS:", "info");
  context.log("polymarket breaking    Breaking news markets", "output");
  context.log("polymarket new         Newest markets", "output");
  context.log("polymarket politics    Political markets", "output");
  context.log("polymarket sports      Sports markets", "output");
  context.log("polymarket crypto      Crypto markets", "output");
  context.log("polymarket earnings    Earnings markets", "output");
  context.log("polymarket geopolitics Geopolitical markets", "output");
  context.log("polymarket tech        Technology markets", "output");
  context.log("polymarket culture     Culture markets", "output");
  context.log("polymarket world       World events", "output");
  context.log("polymarket economy     Economic markets", "output");
  context.log("polymarket trump       Trump-related markets", "output");
  context.log("polymarket elections   Election markets", "output");
  context.log("", "output");
  context.log("🎯 EXAMPLES:", "info");
  context.log("polymarket markets     # Current active markets", "output");
  context.log("polymarket trending    # Highest volume markets", "output");
  context.log("polymarket politics    # Political predictions", "output");
  context.log("polymarket crypto      # Crypto predictions", "output");
  context.log("polymarket breaking    # Breaking news markets", "output");
  context.log('polymarket search "AI" # Search for AI markets', "output");
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

  context.log(`📊 ${title}`, "info");
  context.log(
    "════════════════════════════════════════════════════════════════════════════════",
    "output"
  );
  context.log("", "output");

  markets.slice(0, 20).forEach((market: any, index: number) => {
    const num = (index + 1).toString().padStart(2, " ");

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

    context.log(`${num}. ${question}`, "output");
    context.log(
      `    💰 Volume: ${volume} | 📅 End: ${endDate} | ${status}`,
      "info"
    );

    // Try different field names for outcomes
    const outcomes = market.outcomes || market.markets || market.options || [];
    if (outcomes && outcomes.length > 0) {
      outcomes.forEach((outcome: any) => {
        const price =
          outcome.price || outcome.lastTradePrice || outcome.last_price
            ? `$${parseFloat(
                outcome.price || outcome.lastTradePrice || outcome.last_price
              ).toFixed(2)}`
            : "N/A";
        const name =
          outcome.name || outcome.title || outcome.outcome || "Unknown";
        context.log(`    📊 ${name}: ${price}`, "output");
      });
    }

    context.log("", "output");
  });

  if (markets.length > 20) {
    context.log(`... and ${markets.length - 20} more markets`, "info");
  }

  context.log('💡 Use "polymarket help" for more commands', "info");
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
