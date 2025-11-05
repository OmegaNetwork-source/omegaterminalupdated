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
        📊 Found ${markets.length} markets
      </div>
  `;

  markets.forEach((market: any, index: number) => {
    const yesPrice = market.yes_bid_dollars || "0.00";
    const noPrice = market.no_bid_dollars || "0.00";
    const volume = market.volume_24h || 0;
    const marketStatus = market.status || "unknown";
    const statusColor = marketStatus === "open" 
      ? "var(--palette-success, #16c782)" 
      : "var(--palette-error, #ff4d4f)";

    marketsHtml += `
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
          ">${index + 1}.</span>
          <div style="
            color: var(--palette-text, #e0e0e0);
            font-weight: 600;
            flex: 1;
            line-height: 1.4;
          ">${market.subtitle || market.title}</div>
        </div>
        <div style="
          margin-left: 32px;
          font-size: 11px;
          color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
        ">
          <div style="margin-bottom: 4px;">
            <strong style="color: var(--palette-primary, #00bcf2);">Ticker:</strong> ${market.ticker}
          </div>
          <div style="
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 6px;
          ">
            <span>🟢 Yes: <strong style="color: var(--palette-success, #16c782);">$${yesPrice}</strong></span>
            <span>🔴 No: <strong style="color: var(--palette-error, #ff4d4f);">$${noPrice}</strong></span>
            <span>💰 Volume: <strong style="color: var(--palette-primary, #00bcf2);">${volume}</strong></span>
            <span style="color: ${statusColor};">Status: ${marketStatus}</span>
          </div>
          <div style="margin-top: 6px; color: color-mix(in srgb, var(--palette-text, #ffffff) 55%, transparent);">
            📅 Close: ${new Date(market.close_time).toLocaleString()}
          </div>
        </div>
      </div>
    `;
  });

  if (res.cursor) {
    marketsHtml += `
      <div style="
        text-align: center;
        color: var(--palette-primary, #00bcf2);
        margin-top: 16px;
        font-size: 12px;
      ">
        📄 More results available. Use cursor: ${res.cursor}
      </div>
    `;
  }

  marketsHtml += `</div>`;
  ctx.logHtml(marketsHtml);
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

  // Generate HTML output with theme-aware styling
  const statusColor = market.status === "open" 
    ? "var(--palette-success, #16c782)" 
    : "var(--palette-error, #ff4d4f)";

  let marketHtml = `
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
        📊 Market Details: ${market.subtitle || market.title}
      </div>
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="margin-bottom: 12px;">
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Ticker:</div>
          <div style="color: var(--palette-text, #e0e0e0);">${market.ticker}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Event:</div>
          <div style="color: var(--palette-text, #e0e0e0);">${market.event_ticker}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Type:</div>
          <div style="color: var(--palette-text, #e0e0e0);">${market.market_type}</div>
        </div>
        <div>
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Status:</div>
          <div style="color: ${statusColor}; font-weight: 600;">${market.status}</div>
        </div>
      </div>
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 12px; font-size: 14px;">💰 Current Prices</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
          <div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px;">Yes Bid:</div>
            <div style="color: var(--palette-success, #16c782); font-weight: 600;">$${market.yes_bid_dollars || "0.00"}</div>
          </div>
          <div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px;">Yes Ask:</div>
            <div style="color: var(--palette-success, #16c782); font-weight: 600;">$${market.yes_ask_dollars || "0.00"}</div>
          </div>
          <div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px;">No Bid:</div>
            <div style="color: var(--palette-error, #ff4d4f); font-weight: 600;">$${market.no_bid_dollars || "0.00"}</div>
          </div>
          <div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px;">No Ask:</div>
            <div style="color: var(--palette-error, #ff4d4f); font-weight: 600;">$${market.no_ask_dollars || "0.00"}</div>
          </div>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--palette-border, rgba(0, 212, 255, 0.2));">
          <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px; font-size: 12px;">Last Price:</div>
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600;">$${market.last_price_dollars || "0.00"}</div>
        </div>
      </div>
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 12px; font-size: 14px;">📈 Market Stats</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
          <div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px;">Volume (24h):</div>
            <div style="color: var(--palette-text, #e0e0e0); font-weight: 600;">${market.volume_24h || 0}</div>
          </div>
          <div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px;">Total Volume:</div>
            <div style="color: var(--palette-text, #e0e0e0); font-weight: 600;">${market.volume || 0}</div>
          </div>
          <div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px;">Open Interest:</div>
            <div style="color: var(--palette-text, #e0e0e0); font-weight: 600;">${market.open_interest || 0}</div>
          </div>
          <div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px;">Liquidity:</div>
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600;">$${market.liquidity_dollars || "0.00"}</div>
          </div>
        </div>
      </div>
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 12px; font-size: 14px;">⏰ Schedule</div>
        <div style="font-size: 12px;">
          <div style="margin-bottom: 8px;">
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px;">Open:</div>
            <div style="color: var(--palette-text, #e0e0e0);">${new Date(market.open_time).toLocaleString()}</div>
          </div>
          <div style="margin-bottom: 8px;">
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px;">Close:</div>
            <div style="color: var(--palette-text, #e0e0e0);">${new Date(market.close_time).toLocaleString()}</div>
          </div>
          ${market.expiration_time ? `
          <div>
            <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); margin-bottom: 4px;">Expiration:</div>
            <div style="color: var(--palette-text, #e0e0e0);">${new Date(market.expiration_time).toLocaleString()}</div>
          </div>
          ` : ''}
        </div>
      </div>
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
          💡 Tip: Use "kalshi orderbook ${ticker}" to see the full orderbook
        </div>
      </div>
    </div>
  `;

  ctx.logHtml(marketHtml);
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
  const helpLines: string[] = [
    "kalshi",
    "",
    "Kalshi prediction markets",
    "",
    "→ Usage: kalshi <markets|market|orderbook|trades|events|event|series|help> [params]",
    "",
    "═ Market Commands ═",
    "",
    "kalshi markets",
    "",
    "List markets with optional limit and status",
    "",
    "→ Usage: kalshi markets [limit] [status]",
    "",
    "kalshi market",
    "",
    "Get market details for specific ticker",
    "",
    "→ Usage: kalshi market <ticker>",
    "",
    "kalshi orderbook",
    "",
    "View orderbook depth for market",
    "",
    "→ Usage: kalshi orderbook <ticker> [depth]",
    "",
    "kalshi trades",
    "",
    "Recent trades for market",
    "",
    "→ Usage: kalshi trades [ticker] [limit]",
    "",
    "═ Event Commands ═",
    "",
    "kalshi events",
    "",
    "List events with optional status and limit",
    "",
    "→ Usage: kalshi events [status] [limit]",
    "",
    "kalshi event",
    "",
    "Get event details",
    "",
    "→ Usage: kalshi event <ticker>",
    "",
    "═ Series Commands ═",
    "",
    "kalshi series",
    "",
    "Get series information",
    "",
    "→ Usage: kalshi series <ticker>",
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
        ═══ KALSHI PREDICTION MARKETS ═══
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
            Examples: kalshi markets 20 open | kalshi market KXNFLMENTION-25OCT28-BARB
          </div>
        </div>
      `;
    } else {
      // Check if line is a command (handles both "markets" and "kalshi markets" formats)
      const isFullCommand = line.startsWith("kalshi ") && line.length < 50;
      const isSubcommand = line.length > 0 && 
        line.trim().length < 50 &&
        !line.includes(" ") && 
        line === line.toLowerCase() &&
        !line.startsWith("List") &&
        !line.startsWith("Get") &&
        !line.startsWith("View") &&
        !line.startsWith("Recent") &&
        line.match(/^[a-z0-9-]+$/);

      if (isFullCommand || isSubcommand) {
        // Extract command part (remove <ticker> or other parameters)
        let commandText = line;
        if (isFullCommand) {
          // Already has "kalshi " prefix, remove parameter placeholders
          commandText = line.replace(/ <[^>]+>/g, "").replace(/ \[[^\]]+\]/g, "").trim();
        } else if (isSubcommand) {
          // Add "kalshi " prefix
          commandText = `kalshi ${line}`;
        }
        
        const escapedCommand = commandText.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        const displayText = isFullCommand 
          ? line.replace(/ <[^>]+>/g, "").replace(/ \[[^\]]+\]/g, "") 
          : line;
        
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
  ctx.logHtml(helpHtml);
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
