import { Command, CommandContext } from "@/types/commands";
import { kalshi } from "@/lib/api";

async function handleMarkets(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const limit = Number(args[2]) || 10;
  const status = (args[3] || "").toLowerCase();

  ctx.log("🔍 Fetching prediction markets...", "info");

  const res = await kalshi.getMarkets({ limit, status });
  const markets = res.markets || [];
  if (!markets.length) {
    ctx.log("No markets found matching your criteria", "output");
    return;
  }

  ctx.log(`📊 Found ${markets.length} markets:`, "info");
  ctx.log("", "output");

  markets.forEach((market: any, index: number) => {
    const yesPrice = market.yes_bid_dollars || "0.00";
    const noPrice = market.no_bid_dollars || "0.00";
    const volume = market.volume_24h || 0;
    const status = market.status || "unknown";

    ctx.log(`${index + 1}. ${market.subtitle || market.title}`, "output");
    ctx.log(`   Ticker: ${market.ticker}`, "output");
    ctx.log(
      `   Yes: $${yesPrice} | No: $${noPrice} | Volume: ${volume}`,
      "output"
    );
    ctx.log(
      `   Status: ${status} | Close: ${new Date(
        market.close_time
      ).toLocaleString()}`,
      "output"
    );
    ctx.log("", "output");
  });

  if (res.cursor) {
    ctx.log(`📄 More results available. Use cursor: ${res.cursor}`, "info");
  }
}

async function handleMarket(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const ticker = args[2];
  if (!ticker) {
    ctx.log("❌ Usage: kalshi market <ticker>", "error");
    ctx.log("   Example: kalshi market KXNFLMENTION-25OCT28-BARB", "output");
    ctx.log(
      "   Tip: Use 'kalshi markets 10 open' to list available tickers",
      "output"
    );
    return;
  }

  ctx.log(`🔍 Fetching market details for ${ticker}...`, "info");

  const res = await kalshi.getMarket(ticker);
  const market = res.market;
  if (!market) {
    ctx.log("Market not found", "error");
    return;
  }

  ctx.log(`📊 Market Details: ${market.subtitle || market.title}`, "info");
  ctx.log("", "output");
  ctx.log(`Ticker: ${market.ticker}`, "output");
  ctx.log(`Event: ${market.event_ticker}`, "output");
  ctx.log(`Type: ${market.market_type}`, "output");
  ctx.log(`Status: ${market.status}`, "output");
  ctx.log("", "output");

  ctx.log("💰 Current Prices:", "info");
  ctx.log(
    `Yes Bid: $${market.yes_bid_dollars || "0.00"} | Yes Ask: $${
      market.yes_ask_dollars || "0.00"
    }`,
    "output"
  );
  ctx.log(
    `No Bid: $${market.no_bid_dollars || "0.00"} | No Ask: $${
      market.no_ask_dollars || "0.00"
    }`,
    "output"
  );
  ctx.log(`Last Price: $${market.last_price_dollars || "0.00"}`, "output");
  ctx.log("", "output");

  ctx.log("📈 Market Stats:", "info");
  ctx.log(`Volume (24h): ${market.volume_24h || 0}`, "output");
  ctx.log(`Total Volume: ${market.volume || 0}`, "output");
  ctx.log(`Open Interest: ${market.open_interest || 0}`, "output");
  ctx.log(`Liquidity: $${market.liquidity_dollars || "0.00"}`, "output");
  ctx.log("", "output");

  ctx.log("⏰ Schedule:", "info");
  ctx.log(`Open: ${new Date(market.open_time).toLocaleString()}`, "output");
  ctx.log(`Close: ${new Date(market.close_time).toLocaleString()}`, "output");

  if (market.expiration_time) {
    ctx.log(
      `Expiration: ${new Date(market.expiration_time).toLocaleString()}`,
      "output"
    );
  }

  ctx.log("", "output");
  ctx.log(
    '💡 Tip: Use "kalshi orderbook ' + ticker + '" to see the full orderbook',
    "info"
  );
}

async function handleOrderbook(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const ticker = args[2];
  const depth = args[3] ? Number(args[3]) : undefined;
  if (!ticker) {
    ctx.log("❌ Usage: kalshi orderbook <ticker> [depth]", "error");
    ctx.log(
      "   Example: kalshi orderbook KXNFLMENTION-25OCT28-BARB 10",
      "output"
    );
    return;
  }

  ctx.log(`📖 Fetching orderbook for ${ticker}...`, "info");

  const res = await kalshi.getMarketOrderbook(ticker, depth);
  const ob = res.orderbook;
  if (!ob) {
    ctx.log("No orderbook data available", "error");
    return;
  }

  ctx.log("", "output");
  ctx.log("🟢 YES Side:", "info");
  if (ob.yes_dollars && ob.yes_dollars.length > 0) {
    ob.yes_dollars.forEach(([price, quantity]: [number, number]) => {
      ctx.log(`   Price: $${price} | Quantity: ${quantity}`, "output");
    });
  } else {
    ctx.log("   No YES orders", "output");
  }

  ctx.log("", "output");
  ctx.log("🔴 NO Side:", "info");
  if (ob.no_dollars && ob.no_dollars.length > 0) {
    ob.no_dollars.forEach(([price, quantity]: [number, number]) => {
      ctx.log(`   Price: $${price} | Quantity: ${quantity}`, "output");
    });
  } else {
    ctx.log("   No NO orders", "output");
  }

  ctx.log("", "output");
}

async function handleTrades(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const ticker = args[2];
  const limit = Number(args[3]) || 10;

  ctx.log("📊 Fetching recent trades...", "info");

  const res = await kalshi.getMarketTrades({ ticker, limit });
  const trades = res.trades || [];

  if (trades.length === 0) {
    ctx.log("No trades found", "output");
    return;
  }

  ctx.log(`💹 Found ${trades.length} recent trades:`, "info");
  ctx.log("", "output");

  trades.forEach((trade: any, index: number) => {
    const emoji = trade.taker_side === "yes" ? "🟢" : "🔴";
    const time = new Date(trade.created_time).toLocaleString();

    ctx.log(`${index + 1}. ${trade.ticker}`, "output");
    ctx.log(
      `   ${emoji} ${trade.taker_side.toUpperCase()} | Qty: ${
        trade.count
      } | Price: ${trade.yes_price_fixed || "N/A"}`,
      "output"
    );
    ctx.log(`   Time: ${time}`, "output");
    ctx.log("", "output");
  });
}

async function handleEvents(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const status = (args[2] || "").toLowerCase();
  const limit = Number(args[3]) || 10;

  ctx.log("🔍 Fetching events...", "info");

  const res = await kalshi.getEvents({ status, limit });
  const events = res.events || [];

  if (events.length === 0) {
    ctx.log("No events found", "output");
    return;
  }

  ctx.log(`📅 Found ${events.length} events:`, "info");
  ctx.log("", "output");

  events.forEach((event: any, index: number) => {
    ctx.log(`${index + 1}. ${event.title}`, "output");
    ctx.log(`   Ticker: ${event.event_ticker}`, "output");
    ctx.log(`   Series: ${event.series_ticker || "N/A"}`, "output");
    ctx.log("", "output");
  });

  if (res.cursor) {
    ctx.log(`📄 More results available. Use cursor: ${res.cursor}`, "info");
  }
}

async function handleEvent(ctx: CommandContext, args: string[]): Promise<void> {
  const ticker = args[2];
  if (!ticker) {
    ctx.log("❌ Usage: kalshi event <eventTicker>", "error");
    ctx.log("   Example: kalshi event KXNFLMENTION-25OCT28", "output");
    return;
  }

  ctx.log(`🔍 Fetching event details for ${ticker}...`, "info");

  const res = await kalshi.getEvent(ticker);
  const event = res.event;
  if (!event) {
    ctx.log("Event not found", "error");
    return;
  }

  ctx.log(`📅 Event Details: ${event.title}`, "info");
  ctx.log("", "output");
  ctx.log(`Ticker: ${event.event_ticker}`, "output");
  ctx.log(`Series: ${event.series_ticker || "N/A"}`, "output");
  ctx.log(
    `Type: ${event.mutually_exclusive ? "Mutually Exclusive" : "Independent"}`,
    "output"
  );
  ctx.log(`Return: ${event.collateral_return_type || "N/A"}`, "output");
  ctx.log("", "output");

  if (event.markets && event.markets.length > 0) {
    ctx.log("📊 Associated Markets:", "info");
    event.markets.forEach((market: any) => {
      ctx.log(
        `   ${market.ticker}: YES $${market.yes_bid_dollars || "N/A"} / NO $${
          market.no_bid_dollars || "N/A"
        }`,
        "output"
      );
    });
    ctx.log("", "output");
  }
}

async function handleSeries(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const ticker = args[2];
  if (!ticker) {
    ctx.log("❌ Usage: kalshi series <seriesTicker>", "error");
    ctx.log("   Example: kalshi series KXNFLMENTION", "output");
    return;
  }

  ctx.log(`🔍 Fetching series details for ${ticker}...`, "info");

  const res = await kalshi.getSeries(ticker);
  const series = res.series;
  if (!series) {
    ctx.log("Series not found", "error");
    return;
  }

  ctx.log(`📚 Series Details: ${series.title}`, "info");
  ctx.log("", "output");
  ctx.log(`Ticker: ${series.ticker}`, "output");
  ctx.log(`Category: ${series.category}`, "output");
  ctx.log(`Frequency: ${series.frequency}`, "output");
  ctx.log(
    `Fee: ${series.fee_type}${
      series.fee_multiplier ? ` x${series.fee_multiplier}` : ""
    }`,
    "output"
  );

  if (series.tags && series.tags.length > 0) {
    ctx.log(`Tags: ${series.tags.join(", ")}`, "output");
  }

  ctx.log("", "output");

  if (series.settlement_sources && series.settlement_sources.length > 0) {
    ctx.log("📰 Settlement Sources:", "info");
    series.settlement_sources.forEach((source: any) => {
      ctx.log(`   ${source.name}`, "output");
      ctx.log(`   ${source.url}`, "output");
    });
  }
}

function handleHelp(ctx: CommandContext): void {
  ctx.log("🎯 KALSHI PREDICTION MARKETS", "info");
  ctx.log("", "output");
  ctx.log("📊 Market Commands:", "info");
  ctx.log(
    "  kalshi markets [limit] [status] - List markets (e.g., 'kalshi markets 10 open')",
    "output"
  );
  ctx.log(
    "  kalshi market <ticker>          - Get details (e.g., 'kalshi market KXNFL-25OCT28-BARB')",
    "output"
  );
  ctx.log("  kalshi orderbook <ticker>       - View orderbook depth", "output");
  ctx.log("  kalshi trades [ticker] [limit]  - Recent trades", "output");
  ctx.log("", "output");
  ctx.log("📅 Event Commands:", "info");
  ctx.log("  kalshi events [status] [limit]  - List events", "output");
  ctx.log("  kalshi event <ticker>           - Get event details", "output");
  ctx.log("", "output");
  ctx.log("📚 Series Commands:", "info");
  ctx.log(
    "  kalshi series <ticker>          - Get series information",
    "output"
  );
  ctx.log("", "output");
  ctx.log("💡 Examples:", "info");
  ctx.log("  kalshi markets 20 open", "output");
  ctx.log("  kalshi market KXNFLMENTION-25OCT28-BARB", "output");
  ctx.log("  kalshi trades KXNFLMENTION-25OCT28-BARB 25", "output");
  ctx.log("", "output");
}

async function handler(ctx: CommandContext, args: string[]): Promise<void> {
  const sub = (args[1] || "").toLowerCase();
  switch (sub) {
    case "markets":
      await handleMarkets(ctx, args);
      break;
    case "market":
      await handleMarket(ctx, args);
      break;
    case "orderbook":
      await handleOrderbook(ctx, args);
      break;
    case "trades":
      await handleTrades(ctx, args);
      break;
    case "events":
      await handleEvents(ctx, args);
      break;
    case "event":
      await handleEvent(ctx, args);
      break;
    case "series":
      await handleSeries(ctx, args);
      break;
    case "help":
    default:
      handleHelp(ctx);
  }
}

export const kalshiCommand: Command = {
  name: "kalshi",
  description: "Kalshi prediction markets",
  usage:
    "kalshi <markets|market|orderbook|trades|events|event|series|help> [params]",
  category: "markets",
  handler,
};

export const kalshiCommands: Command[] = [kalshiCommand];
