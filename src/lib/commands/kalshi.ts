import { Command, CommandContext } from "@/types/commands";
import { kalshi } from "@/lib/api";

// Helper function to generate URL-friendly slug from text
function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')        // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
}

// Helper function to generate correct Kalshi market URL
// Format: https://kalshi.com/markets/{series_ticker_lowercase}/{slug}/{market_ticker}
// Example: https://kalshi.com/markets/kxtopalbumthird/third-best-album/kxtopalbumthird-25
function getKalshiMarketUrl(market: any): string {
  // Series ticker must be lowercase
  const seriesTicker = (market.series_ticker || '').toLowerCase();
  const marketTicker = market.ticker || '';
  
  // Get event title for slug generation - try multiple fields
  const eventTitle = market.event_title || market.title || market.subtitle || market.series_title || '';
  const slug = market.event_slug || market.slug || generateSlug(eventTitle);
  
  // Always use /markets/ format - never fall back to /trade/
  // Kalshi URL format: /markets/{series_ticker_lowercase}/{slug}/{market_ticker}
  if (seriesTicker && marketTicker) {
    // If we have a slug, use it; otherwise generate from title
    const urlSlug = slug || generateSlug(eventTitle) || 'market';
    return `https://kalshi.com/markets/${encodeURIComponent(seriesTicker)}/${encodeURIComponent(urlSlug)}/${encodeURIComponent(marketTicker)}`;
  }
  
  // If we only have market ticker, try to extract series from ticker
  // Kalshi tickers often start with series prefix (e.g., KXTOPALBUMTHIRD-25 -> kxtopalbumthird)
  if (marketTicker) {
    const tickerMatch = marketTicker.match(/^([A-Z]+)/);
    if (tickerMatch) {
      const extractedSeries = tickerMatch[1].toLowerCase();
      const urlSlug = slug || generateSlug(eventTitle) || 'market';
      return `https://kalshi.com/markets/${encodeURIComponent(extractedSeries)}/${encodeURIComponent(urlSlug)}/${encodeURIComponent(marketTicker)}`;
    }
  }
  
  // Last resort: return base URL
  return 'https://kalshi.com';
}

async function handleMarkets(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  // Parse arguments: kalshi markets [limit] [status]
  let limit = 10;
  let status = "open";
  
  if (args[2]) {
    const arg2 = args[2].toLowerCase();
    if (arg2 === "all" || arg2 === "open" || arg2 === "closed" || arg2 === "initialized") {
      // args[2] is a status, not a limit
      status = arg2;
    } else {
      // args[2] is a limit
      limit = Number(args[2]) || 10;
      if (args[3]) {
        status = args[3].toLowerCase();
      }
    }
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
        🔍 Fetching prediction markets...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  try {
    // Fetch more markets than needed so we can filter out test markets
    const fetchLimit = Math.max(limit * 3, 50);
    
    // Build API options - don't pass status if it's "all"
    const apiOptions: any = { limit: fetchLimit };
    if (status !== "all") {
      apiOptions.status = status;
    }
    
    const res = await kalshi.getMarkets(apiOptions);
    
    // Handle different response structures
    let markets: any[] = [];
    if (res) {
      if (Array.isArray(res)) {
        markets = res;
      } else if (res.markets && Array.isArray(res.markets)) {
        markets = res.markets;
      } else if (res.data && Array.isArray(res.data)) {
        markets = res.data;
      } else if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && 'markets' in res.data && Array.isArray(res.data.markets)) {
        markets = res.data.markets;
      }
    }
    
    console.log(`[Kalshi] Fetched ${markets.length} markets, status filter: ${status}`);
    console.log(`[Kalshi] Response structure:`, { 
      hasMarkets: !!res?.markets, 
      hasData: !!res?.data,
      isArray: Array.isArray(res),
      keys: res ? Object.keys(res) : []
    });
    
    // If no markets returned and we used a status filter, try without filter
    if (markets.length === 0 && status !== "all") {
      console.log("[Kalshi] No markets with status filter, trying without status...");
      const resAll = await kalshi.getMarkets({ limit: fetchLimit });
      markets = resAll.markets || [];
      console.log(`[Kalshi] Fetched ${markets.length} markets without status filter`);
    }
    
    // Filter out test markets (unless status is "all")
    if (status !== "all" && markets.length > 0) {
      const beforeFilter = markets.length;
      markets = markets.filter((market: any) => {
        const ticker = (market.ticker || "").toUpperCase();
        const title = (market.title || market.subtitle || "").toLowerCase();
        
        // Exclude test markets
        if (
          ticker.includes("QUICKSETTLE") ||
          ticker.includes("TEST") ||
          title.includes("1+1") ||
          title.includes("test market") ||
          title.includes("will 1+1")
        ) {
          return false;
        }
        
        // Only exclude zero volume if we have enough markets with volume
        // This prevents filtering everything out
        return true;
      });
      console.log(`[Kalshi] Filtered from ${beforeFilter} to ${markets.length} markets`);
    }
    
    // Sort by volume (24h first, then total volume) - but only if we have volume data
    markets.sort((a: any, b: any) => {
      const aVol = a.volume_24h || a.volume || 0;
      const bVol = b.volume_24h || b.volume || 0;
      return bVol - aVol;
    });
    
    // Take only the requested limit
    markets = markets.slice(0, limit);
    
    if (!markets.length) {
      const noMarketsHtml = `
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
            margin-bottom: 12px;
          ">
            <div style="color: var(--palette-text, #e0e0e0); font-size: 14px; margin-bottom: 8px;">
              No markets found. The API may be temporarily unavailable or there are no active markets.
            </div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
              Try: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">kalshi markets 10 all</code>
            </div>
          </div>
        </div>
      `;
      ctx.logHtml(noMarketsHtml);
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
        📊 Found ${markets.length} active markets (sorted by volume)
      </div>
  `;

  markets.forEach((market: any, index: number) => {
    // Parse prices correctly - Kalshi returns as strings
    const yesBid = market.yes_bid_dollars ? parseFloat(market.yes_bid_dollars) : null;
    const yesAsk = market.yes_ask_dollars ? parseFloat(market.yes_ask_dollars) : null;
    const yesPrice = yesBid ?? yesAsk ?? (market.last_price_dollars ? parseFloat(market.last_price_dollars) : 0);
    
    const noBid = market.no_bid_dollars ? parseFloat(market.no_bid_dollars) : null;
    const noAsk = market.no_ask_dollars ? parseFloat(market.no_ask_dollars) : null;
    const noPrice = noBid ?? noAsk ?? (yesPrice > 0 ? (1 - yesPrice) : 0);
    
    const volume = market.volume_24h || market.volume || 0;
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
            <span>🟢 Yes: <strong style="color: var(--palette-success, #16c782);">$${yesPrice.toFixed(2)}</strong></span>
            <span>🔴 No: <strong style="color: var(--palette-error, #ff4d4f);">$${noPrice.toFixed(2)}</strong></span>
            <span>💰 Volume (24h): <strong style="color: var(--palette-primary, #00bcf2);">$${Number(volume).toLocaleString()}</strong></span>
            <span style="color: ${statusColor};">Status: ${marketStatus}</span>
          </div>
          <div style="margin-top: 6px; color: color-mix(in srgb, var(--palette-text, #ffffff) 55%, transparent);">
            📅 Close: ${new Date(market.close_time).toLocaleString()}
          </div>
          <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
            <a 
              href="${getKalshiMarketUrl(market)}" 
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
              🔗 View on Kalshi →
            </a>
            <button
              class="omega-help-command"
              data-command="trade buy kalshi ${market.ticker} yes 1"
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
              title="Buy YES (1 share)"
            >
              🟢 Buy YES
            </button>
            <button
              class="omega-help-command"
              data-command="trade buy kalshi ${market.ticker} no 1"
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
              title="Buy NO (1 share)"
            >
              🔴 Buy NO
            </button>
          </div>
        </div>
      </div>
    `;
  });

  // Cursor removed - not needed for user display

  marketsHtml += `
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
        line-height: 1.5;
        margin-bottom: 8px;
      ">
        💡 Markets are sorted by volume and exclude test markets by default<br/>
        Use "kalshi markets ${limit} all" to see all markets including test/zero-volume
      </div>
      <div style="margin-top: 8px;">
        <a 
          href="https://kalshi.com/?category=all" 
          target="_blank"
          rel="noopener noreferrer"
          style="
            color: var(--palette-secondary, #00ff88);
            text-decoration: none;
            font-size: 12px;
            padding: 6px 12px;
            border: 1px solid var(--palette-secondary, #00ff88);
            border-radius: 4px;
            display: inline-block;
            transition: all 0.2s ease;
          "
          onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 20%, transparent)';"
          onmouseout="this.style.background = 'transparent';"
        >
          🔗 View All Markets on Kalshi →
        </a>
      </div>
    </div>
  `;

  marketsHtml += `</div>`;
  ctx.logHtml(marketsHtml);
  } catch (error: any) {
    console.error("[Kalshi] Error fetching markets:", error);
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
          margin-bottom: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching markets</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">${error.message || String(error)}</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
            💡 Make sure the relayer server is running and Kalshi credentials are configured
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }
}

async function handleMarket(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const ticker = args[2];
  if (!ticker) {
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
          margin-bottom: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Usage Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">
            <strong>Usage:</strong> kalshi market &lt;ticker&gt;
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; margin-bottom: 4px;">
            <strong>Example:</strong> <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">kalshi market KXNFLMENTION-25OCT28-BARB</code>
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
            💡 Tip: Use <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">kalshi markets 10 open</code> to list available tickers
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
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
        🔍 Fetching market details for ${ticker}...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  try {
    const res = await kalshi.getMarket(ticker);
    const market = res.market;
    if (!market) {
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
            <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Market not found</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">Ticker: ${ticker}</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; margin-top: 8px;">
              💡 Use <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">kalshi markets</code> to find valid tickers
            </div>
          </div>
        </div>
      `;
      ctx.logHtml(errorHtml);
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
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        <div style="
          color: var(--palette-primary, #00d4ff);
          font-size: 11px;
          margin-bottom: 8px;
        ">
          💡 Tip: Use "kalshi orderbook ${ticker}" to see the full orderbook
        </div>
        <div>
          <a 
            href="${getKalshiMarketUrl(market)}" 
            target="_blank"
            rel="noopener noreferrer"
            style="
              color: var(--palette-primary, #00d4ff);
              text-decoration: none;
              font-size: 12px;
              padding: 6px 12px;
              border: 1px solid var(--palette-primary, #00d4ff);
              border-radius: 4px;
              display: inline-block;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)';"
            onmouseout="this.style.background = 'transparent';"
          >
            🔗 View on Kalshi →
          </a>
        </div>
      </div>
    </div>
  `;

    ctx.logHtml(marketHtml);
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching market</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

async function handleOrderbook(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const ticker = args[2];
  const depth = args[3] ? Number(args[3]) : undefined;
  if (!ticker) {
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Usage Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">
            <strong>Usage:</strong> kalshi orderbook &lt;ticker&gt; [depth]
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
            <strong>Example:</strong> <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">kalshi orderbook KXNFLMENTION-25OCT28-BARB 10</code>
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
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
        📖 Fetching orderbook for ${ticker}...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  try {
    const res = await kalshi.getMarketOrderbook(ticker, depth);
    const ob = res.orderbook;
    if (!ob) {
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
            <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ No orderbook data available</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">Ticker: ${ticker}</div>
          </div>
        </div>
      `;
      ctx.logHtml(errorHtml);
      return;
    }

  // Generate HTML output for orderbook with better formatting
  let orderbookHtml = `
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
        📖 Orderbook: ${ticker}
      </div>
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      ">
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-success, #16c782) 5%, transparent) 0%, color-mix(in srgb, var(--palette-success, #16c782) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-success, #16c782) 20%, transparent));
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="
            color: var(--palette-success, #16c782);
            font-weight: 600;
            margin-bottom: 12px;
            font-size: 14px;
          ">🟢 YES Side</div>
  `;

  if (ob.yes_dollars && ob.yes_dollars.length > 0) {
    ob.yes_dollars.slice(0, depth || 10).forEach(([price, quantity]: [number, number], idx: number) => {
      orderbookHtml += `
        <div style="
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.1)) 50%, transparent);
          font-size: 12px;
        ">
          <span style="color: var(--palette-success, #16c782); font-weight: 600;">$${price.toFixed(2)}</span>
          <span style="color: var(--palette-text, #e0e0e0);">${quantity}</span>
        </div>
      `;
    });
  } else {
    orderbookHtml += `
      <div style="
        color: color-mix(in srgb, var(--palette-text, #ffffff) 50%, transparent);
        font-size: 12px;
        padding: 8px;
      ">No YES orders</div>
    `;
  }

  orderbookHtml += `
        </div>
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-error, #ff4d4f) 5%, transparent) 0%, color-mix(in srgb, var(--palette-error, #ff4d4f) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-error, #ff4d4f) 20%, transparent));
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="
            color: var(--palette-error, #ff4d4f);
            font-weight: 600;
            margin-bottom: 12px;
            font-size: 14px;
          ">🔴 NO Side</div>
  `;

  if (ob.no_dollars && ob.no_dollars.length > 0) {
    ob.no_dollars.slice(0, depth || 10).forEach(([price, quantity]: [number, number], idx: number) => {
      orderbookHtml += `
        <div style="
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.1)) 50%, transparent);
          font-size: 12px;
        ">
          <span style="color: var(--palette-error, #ff4d4f); font-weight: 600;">$${price.toFixed(2)}</span>
          <span style="color: var(--palette-text, #e0e0e0);">${quantity}</span>
        </div>
      `;
    });
  } else {
    orderbookHtml += `
      <div style="
        color: color-mix(in srgb, var(--palette-text, #ffffff) 50%, transparent);
        font-size: 12px;
        padding: 8px;
      ">No NO orders</div>
    `;
  }

  orderbookHtml += `
        </div>
      </div>
    </div>
  `;

    ctx.logHtml(orderbookHtml);
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching orderbook</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

async function handleTrades(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const ticker = args[2];
  const limit = Number(args[3]) || 10;

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
        📊 Fetching recent trades${ticker ? ` for ${ticker}` : ''}...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  try {
    const res = await kalshi.getMarketTrades({ ticker, limit });
    const trades = res.trades || [];

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
            <div style="color: var(--palette-text, #e0e0e0); font-size: 14px;">No trades found${ticker ? ` for ${ticker}` : ''}</div>
          </div>
        </div>
      `;
      ctx.logHtml(noTradesHtml);
      return;
    }

  // Generate HTML output with theme-aware styling
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
        💹 Found ${trades.length} recent trades${ticker ? ` for ${ticker}` : ''}
      </div>
  `;

  trades.forEach((trade: any, index: number) => {
    const emoji = trade.taker_side === "yes" ? "🟢" : "🔴";
    const sideColor = trade.taker_side === "yes" 
      ? "var(--palette-success, #16c782)" 
      : "var(--palette-error, #ff4d4f)";
    const time = new Date(trade.created_time).toLocaleString();
    const price = parseFloat(trade.yes_price_fixed || "0") || 0;
    const marketTicker = trade.ticker || ticker || "";
    
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
          ">${index + 1}.</span>
          <div style="
            color: var(--palette-text, #e0e0e0);
            font-weight: 600;
            flex: 1;
          ">${marketTicker}</div>
        </div>
        <div style="
          margin-left: 32px;
          font-size: 11px;
          color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
        ">
          <div style="margin-bottom: 4px;">
            <span style="color: ${sideColor}; font-weight: 600;">${emoji} ${trade.taker_side.toUpperCase()}</span> | 
            Qty: <strong>${trade.count}</strong> | 
            Price: <strong style="color: var(--palette-primary, #00bcf2);">$${price.toFixed(2)}</strong>
          </div>
          <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 55%, transparent);">
            📅 ${time}
          </div>
          ${marketTicker ? `
          <div style="margin-top: 8px;">
            <a 
              href="${getKalshiMarketUrl({ ticker: marketTicker, series_ticker: '', event_title: '' })}" 
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
              🔗 View Market →
            </a>
          </div>
          ` : ''}
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
        💡 Browse all markets at <a href="https://kalshi.com" target="_blank" rel="noopener noreferrer" style="color: var(--palette-secondary, #00ff88);">kalshi.com</a>
      </div>
    </div>
  </div>
  `;

    ctx.logHtml(tradesHtml);
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
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

async function handleEvents(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const status = (args[2] || "").toLowerCase();
  const limit = Number(args[3]) || 10;

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
        🔍 Fetching events${status ? ` (${status})` : ''}...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  try {
    const res = await kalshi.getEvents({ status: status || undefined, limit });
    const events = res.events || [];

    if (events.length === 0) {
      const noEventsHtml = `
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
            <div style="color: var(--palette-text, #e0e0e0); font-size: 14px;">No events found${status ? ` with status: ${status}` : ''}</div>
          </div>
        </div>
      `;
      ctx.logHtml(noEventsHtml);
      return;
    }

  // Generate HTML output with theme-aware styling
  let eventsHtml = `
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
        📅 Found ${events.length} events
      </div>
  `;

  events.forEach((event: any, index: number) => {
    const eventTicker = event.event_ticker || "";
    const seriesTicker = event.series_ticker || "N/A";
    
    eventsHtml += `
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
          ">${event.title}</div>
        </div>
        <div style="
          margin-left: 32px;
          font-size: 11px;
          color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
        ">
          <div style="margin-bottom: 4px;">
            <strong style="color: var(--palette-primary, #00bcf2);">Ticker:</strong> ${eventTicker}
          </div>
          <div style="margin-bottom: 4px;">
            <strong style="color: var(--palette-primary, #00bcf2);">Series:</strong> ${seriesTicker}
          </div>
          ${eventTicker ? `
          <div style="margin-top: 8px;">
            <a 
              href="https://kalshi.com/events/${encodeURIComponent(eventTicker)}" 
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
              🔗 View on Kalshi →
            </a>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  eventsHtml += `
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
        💡 Browse all events at <a href="https://kalshi.com" target="_blank" rel="noopener noreferrer" style="color: var(--palette-secondary, #00ff88);">kalshi.com</a>
      </div>
    </div>
  </div>
  `;

    ctx.logHtml(eventsHtml);
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching events</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

async function handleEvent(ctx: CommandContext, args: string[]): Promise<void> {
  const ticker = args[2];
  if (!ticker) {
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Usage Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">
            <strong>Usage:</strong> kalshi event &lt;eventTicker&gt;
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
            <strong>Example:</strong> <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">kalshi event KXNFLMENTION-25OCT28</code>
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
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
        🔍 Fetching event details for ${ticker}...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  try {
    const res = await kalshi.getEvent(ticker);
    const event = res.event;
    if (!event) {
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
            <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Event not found</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">Event Ticker: ${ticker}</div>
          </div>
        </div>
      `;
      ctx.logHtml(errorHtml);
      return;
    }

  const eventTicker = event.event_ticker || ticker;
  
  // Generate HTML output with theme-aware styling
  let eventHtml = `
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
        📅 Event Details: ${event.title}
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
          <div style="color: var(--palette-text, #e0e0e0);">${eventTicker}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Series:</div>
          <div style="color: var(--palette-text, #e0e0e0);">${event.series_ticker || "N/A"}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Type:</div>
          <div style="color: var(--palette-text, #e0e0e0);">${event.mutually_exclusive ? "Mutually Exclusive" : "Independent"}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Return:</div>
          <div style="color: var(--palette-text, #e0e0e0);">${event.collateral_return_type || "N/A"}</div>
        </div>
        <div style="margin-top: 12px;">
          <a 
            href="https://kalshi.com/events/${eventTicker}" 
            target="_blank"
            rel="noopener noreferrer"
            style="
              color: var(--palette-primary, #00d4ff);
              text-decoration: none;
              font-size: 12px;
              padding: 6px 12px;
              border: 1px solid var(--palette-primary, #00d4ff);
              border-radius: 4px;
              display: inline-block;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)';"
            onmouseout="this.style.background = 'transparent';"
          >
            🔗 View on Kalshi →
          </a>
        </div>
      </div>
  `;

  if (event.markets && event.markets.length > 0) {
    eventHtml += `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 12px; font-size: 14px;">📊 Associated Markets</div>
    `;
    
    event.markets.forEach((market: any) => {
      // Parse prices correctly - Kalshi returns as strings
      const yesBid = market.yes_bid_dollars ? parseFloat(market.yes_bid_dollars) : null;
      const yesAsk = market.yes_ask_dollars ? parseFloat(market.yes_ask_dollars) : null;
      const yesPrice = yesBid ?? yesAsk ?? (market.last_price_dollars ? parseFloat(market.last_price_dollars) : 0);
      
      const noBid = market.no_bid_dollars ? parseFloat(market.no_bid_dollars) : null;
      const noAsk = market.no_ask_dollars ? parseFloat(market.no_ask_dollars) : null;
      const noPrice = noBid ?? noAsk ?? (yesPrice > 0 ? (1 - yesPrice) : 0);
      eventHtml += `
        <div style="
          padding: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.1)) 50%, transparent);
        ">
          <div style="color: var(--palette-text, #e0e0e0); font-weight: 600; margin-bottom: 4px;">${market.ticker}</div>
          <div style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);">
            🟢 Yes: <strong style="color: var(--palette-success, #16c782);">$${yesPrice.toFixed(2)}</strong> | 
            🔴 No: <strong style="color: var(--palette-error, #ff4d4f);">$${noPrice.toFixed(2)}</strong>
          </div>
        </div>
      `;
    });
    
    eventHtml += `</div>`;
  }

  eventHtml += `</div>`;
    ctx.logHtml(eventHtml);
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching event</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

async function handleSeries(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const ticker = args[2];
  if (!ticker) {
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Usage Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">
            <strong>Usage:</strong> kalshi series &lt;seriesTicker&gt;
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
            <strong>Example:</strong> <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">kalshi series KXNFLMENTION</code>
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
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
        🔍 Fetching series details for ${ticker}...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  try {
    const res = await kalshi.getSeries(ticker);
    const series = res.series;
    if (!series) {
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
            <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Series not found</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">Series Ticker: ${ticker}</div>
          </div>
        </div>
      `;
      ctx.logHtml(errorHtml);
      return;
    }

  // Generate HTML output with theme-aware styling
  let seriesHtml = `
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
        📚 Series Details: ${series.title}
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
          <div style="color: var(--palette-text, #e0e0e0);">${series.ticker}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Category:</div>
          <div style="color: var(--palette-text, #e0e0e0);">${series.category || "N/A"}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Frequency:</div>
          <div style="color: var(--palette-text, #e0e0e0);">${series.frequency || "N/A"}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Fee:</div>
          <div style="color: var(--palette-text, #e0e0e0);">${series.fee_type || "N/A"}${series.fee_multiplier ? ` x${series.fee_multiplier}` : ""}</div>
        </div>
        ${series.tags && series.tags.length > 0 ? `
        <div style="margin-bottom: 12px;">
          <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Tags:</div>
          <div style="color: var(--palette-text, #e0e0e0);">${series.tags.join(", ")}</div>
        </div>
        ` : ''}
        <div style="margin-top: 12px;">
          <a 
            href="https://kalshi.com/series/${encodeURIComponent(series.ticker)}" 
            target="_blank"
            rel="noopener noreferrer"
            style="
              color: var(--palette-primary, #00d4ff);
              text-decoration: none;
              font-size: 12px;
              padding: 6px 12px;
              border: 1px solid var(--palette-primary, #00d4ff);
              border-radius: 4px;
              display: inline-block;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)';"
            onmouseout="this.style.background = 'transparent';"
          >
            🔗 View Series on Kalshi →
          </a>
        </div>
      </div>
  `;

  if (series.settlement_sources && series.settlement_sources.length > 0) {
    seriesHtml += `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
        border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 12px; font-size: 14px;">📰 Settlement Sources</div>
    `;
    
    series.settlement_sources.forEach((source: any) => {
      seriesHtml += `
        <div style="
          padding: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.1)) 50%, transparent);
        ">
          <div style="color: var(--palette-text, #e0e0e0); font-weight: 600; margin-bottom: 4px;">${source.name}</div>
          <a 
            href="${source.url}" 
            target="_blank"
            rel="noopener noreferrer"
            style="
              color: var(--palette-primary, #00d4ff);
              text-decoration: none;
              font-size: 11px;
            "
          >
            ${source.url}
          </a>
        </div>
      `;
    });
    
    seriesHtml += `</div>`;
  }

  seriesHtml += `</div>`;
    ctx.logHtml(seriesHtml);
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching series</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

function handleHelp(ctx: CommandContext): void {
  const helpLines: string[] = [
    "kalshi",
    "",
    "Kalshi prediction markets",
    "",
    "→ Usage: kalshi <trending|new|all|politics|sports|culture|crypto|climate|economics|mentions|companies|financials|tech|science|health|world|markets|market|orderbook|trades|events|event|series|help> [params]",
    "",
    "═ Browse Markets ═",
    "",
    "kalshi trending",
    "",
    "Top trending markets by volume",
    "",
    "→ Usage: kalshi trending [limit]",
    "  Example: kalshi trending 20",
    "",
    "kalshi new",
    "",
    "Newest markets",
    "",
    "→ Usage: kalshi new [limit]",
    "  Example: kalshi new 20",
    "",
    "kalshi all",
    "",
    "All markets (including test/zero volume)",
    "",
    "→ Usage: kalshi all [limit]",
    "",
    "═ Category Commands ═",
    "",
    "kalshi politics",
    "",
    "Political markets",
    "",
    "→ Usage: kalshi politics [limit]",
    "",
    "kalshi sports",
    "",
    "Sports markets",
    "",
    "→ Usage: kalshi sports [limit]",
    "",
    "kalshi culture",
    "",
    "Culture & entertainment markets",
    "",
    "→ Usage: kalshi culture [limit]",
    "",
    "kalshi crypto",
    "",
    "Cryptocurrency markets",
    "",
    "→ Usage: kalshi crypto [limit]",
    "",
    "kalshi climate",
    "",
    "Climate & environment markets",
    "",
    "→ Usage: kalshi climate [limit]",
    "",
    "kalshi economics",
    "",
    "Economic markets",
    "",
    "→ Usage: kalshi economics [limit]",
    "",
    "kalshi mentions",
    "",
    "Trending mentions markets",
    "",
    "→ Usage: kalshi mentions [limit]",
    "",
    "kalshi companies",
    "",
    "Company & corporate markets",
    "",
    "→ Usage: kalshi companies [limit]",
    "",
    "kalshi financials",
    "",
    "Financial markets & earnings",
    "",
    "→ Usage: kalshi financials [limit]",
    "",
    "kalshi tech",
    "",
    "Technology markets",
    "",
    "→ Usage: kalshi tech [limit]",
    "",
    "kalshi science",
    "",
    "Science markets",
    "",
    "→ Usage: kalshi science [limit]",
    "",
    "kalshi tech-science",
    "",
    "Tech & science markets",
    "",
    "→ Usage: kalshi tech-science [limit]",
    "",
    "kalshi health",
    "",
    "Health & healthcare markets",
    "",
    "→ Usage: kalshi health [limit]",
    "",
    "kalshi world",
    "",
    "World events & global markets",
    "",
    "→ Usage: kalshi world [limit]",
    "",
    "═ Market Commands ═",
    "",
    "kalshi markets",
    "",
    "List active markets (default: open markets, sorted by volume, excludes test markets)",
    "",
    "→ Usage: kalshi markets [limit] [status]",
    "",
    "  Examples:",
    "    kalshi markets 10        - Top 10 active markets by volume",
    "    kalshi markets 20 open   - Top 20 open markets",
    "    kalshi markets 10 all    - All markets (including test/zero volume)",
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
            Examples: kalshi trending 20 | kalshi politics 10 | kalshi market KXNFLMENTION-25OCT28-BARB
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

// Helper function to filter markets by category keywords
function filterMarketsByCategory(markets: any[], category: string): any[] {
  const categoryLower = category.toLowerCase();
  
  // Exclusion prefixes - if market matches these, exclude from this category
  const exclusionPrefixes: Record<string, string[]> = {
    politics: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxbtc', 'kxeth', 'kxcoin', 'kxtech', 'kxapple', 'kxgoogle'],
    sports: ['kxbtc', 'kxeth', 'kxcoin', 'kxpres', 'kxelec', 'kxtech', 'kxapple', 'kxgoogle'],
    crypto: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxpres', 'kxelec', 'kxtech', 'kxapple', 'kxgoogle', 'kxclimate', 'kxweather'],
    climate: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxbtc', 'kxeth', 'kxcoin', 'kxpres', 'kxelec', 'kxtech', 'kxapple', 'kxgoogle'],
    economics: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxbtc', 'kxeth', 'kxcoin', 'kxpres', 'kxelec', 'kxtech', 'kxapple', 'kxgoogle', 'kxclimate'],
    tech: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxbtc', 'kxeth', 'kxcoin', 'kxpres', 'kxelec', 'kxclimate', 'kxweather'],
    companies: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxbtc', 'kxeth', 'kxcoin', 'kxpres', 'kxelec', 'kxclimate'],
    financials: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxbtc', 'kxeth', 'kxcoin', 'kxpres', 'kxelec', 'kxclimate'],
    science: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxbtc', 'kxeth', 'kxcoin', 'kxpres', 'kxelec', 'kxtech'],
    health: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxbtc', 'kxeth', 'kxcoin', 'kxpres', 'kxelec', 'kxtech'],
    world: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxbtc', 'kxeth', 'kxcoin', 'kxtech', 'kxapple', 'kxgoogle'],
    culture: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxbtc', 'kxeth', 'kxcoin', 'kxpres', 'kxelec', 'kxtech'],
  };

  // Use ticker prefixes for precise matching (Kalshi uses consistent prefixes)
  const tickerPrefixes: Record<string, string[]> = {
    politics: ['kxpres', 'kxelec', 'kxsen', 'kxhouse', 'kxgov', 'kxmayor', 'kxvote', 'kxballot', 'kxprimary', 'kxcaucus'],
    sports: ['kxnba', 'kxnfl', 'kxmlb', 'kxnhl', 'kxtennis', 'kxgolf', 'kxboxing', 'kxufc', 'kxmma', 'kxolympics', 'kxworldcup', 'kxsoccer', 'kxfootball', 'kxbaseball', 'kxhockey', 'kxmatch', 'kxgame'],
    crypto: ['kxbtc', 'kxeth', 'kxcoin', 'kxcrypto', 'kxbitcoin', 'kxethereum', 'kxblockchain'],
    climate: ['kxclimate', 'kxweather', 'kxtemp', 'kxwarming', 'kxemissions', 'kxrenewable', 'kxsolar', 'kxwind', 'kxenvironment'],
    economics: ['kxgdp', 'kxinflation', 'kxunemployment', 'kxfed', 'kxinterest', 'kxrecession', 'kxdow', 'kxsp500', 'kxnasdaq', 'kxtariff', 'kxcurrency'],
    tech: ['kxtech', 'kxai', 'kxsoftware', 'kxhardware', 'kxstartup', 'kxapple', 'kxgoogle', 'kxmicrosoft', 'kxamazon', 'kxmeta', 'kxtesla', 'kxnvidia'],
    companies: ['kxapple', 'kxgoogle', 'kxmicrosoft', 'kxamazon', 'kxmeta', 'kxtesla', 'kxnvidia', 'kxamd', 'kxintel', 'kxdisney', 'kxnetflix', 'kxspotify'],
    financials: ['kxearnings', 'kxrevenue', 'kxprofit', 'kxq1', 'kxq2', 'kxq3', 'kxq4', 'kxeps', 'kxipo', 'kxdividend'],
    science: ['kxscience', 'kxresearch', 'kxnasa', 'kxspace', 'kxastronomy', 'kxphysics', 'kxchemistry', 'kxbiology'],
    health: ['kxhealth', 'kxhealthcare', 'kxmedical', 'kxhospital', 'kxdoctor', 'kxtreatment', 'kxdisease', 'kxvaccine', 'kxpharma', 'kxfda', 'kxcovid', 'kxpandemic'],
    world: ['kxworld', 'kxglobal', 'kxun', 'kxnato', 'kxeurope', 'kxasia', 'kxafrica', 'kxwar', 'kxpeace', 'kxdiplomacy', 'kxgeopolitics', 'kxinternational'],
    culture: ['kxmovie', 'kxfilm', 'kxtv', 'kxmusic', 'kxoscar', 'kxgrammy', 'kxemmy', 'kxbook', 'kxfashion'],
  };

  // Title keywords (more specific, use word boundaries)
  const titleKeywords: Record<string, string[]> = {
    politics: ['president', 'election', 'congress', 'senate', 'house of representatives', 'democrat', 'republican', 'trump', 'biden', 'campaign', 'candidate', 'ballot', 'primary', 'caucus', 'governor', 'mayor', 'senator', 'representative', 'supreme court', 'scotus', 'legislation', 'bill becomes law'],
    sports: ['nfl game', 'nba game', 'mlb game', 'nhl game', 'tennis match', 'golf tournament', 'boxing match', 'ufc fight', 'mma fight', 'olympics', 'world cup', 'super bowl', 'championship game', 'playoff game', 'records', 'threes', 'assists', 'points', 'rebounds'],
    crypto: ['bitcoin price', 'ethereum price', 'btc price', 'eth price', 'cryptocurrency', 'blockchain', 'defi', 'nft', 'token price', 'coin price', 'price up', 'price down'],
    climate: ['global warming', 'climate change', 'carbon emissions', 'renewable energy', 'solar energy', 'wind energy', 'sea level', 'ice sheet', 'glacier', 'drought', 'flood', 'hurricane', 'tornado', 'temperature'],
    economics: ['gdp', 'inflation rate', 'unemployment rate', 'federal reserve', 'interest rate', 'recession', 'depression', 'stock market', 'dow jones', 's&p 500', 'nasdaq', 'trade war', 'tariff', 'currency'],
    tech: ['artificial intelligence', 'ai', 'software company', 'hardware company', 'tech company', 'startup', 'product launch', 'app release', 'platform', 'tech earnings'],
    companies: ['apple inc', 'google', 'microsoft', 'amazon', 'meta', 'tesla', 'nvidia', 'amd', 'intel', 'disney', 'netflix', 'spotify'],
    financials: ['earnings report', 'revenue', 'profit', 'quarterly earnings', 'q1 earnings', 'q2 earnings', 'q3 earnings', 'q4 earnings', 'eps', 'earnings per share', 'ipo', 'dividend'],
    science: ['scientific research', 'nasa', 'space mission', 'astronomy', 'physics', 'chemistry', 'biology', 'medical research'],
    health: ['healthcare', 'medical treatment', 'hospital', 'doctor', 'patient', 'disease', 'illness', 'vaccine', 'pharmaceutical', 'fda approval', 'covid', 'pandemic'],
    world: ['united nations', 'nato', 'european union', 'war', 'peace treaty', 'diplomacy', 'international', 'geopolitics', 'geopolitical', 'conflict', 'russia', 'ukraine', 'china', 'iran', 'israel', 'palestine', 'sanctions', 'alliance', 'military', 'defense', 'security', 'border', 'territory', 'world events', 'global events'],
    culture: ['movie', 'film', 'television show', 'tv show', 'music album', 'oscar', 'grammy', 'emmy', 'golden globe', 'book', 'author', 'fashion'],
  };

  const prefixes = tickerPrefixes[categoryLower] || [];
  const keywords = titleKeywords[categoryLower] || [];
  const exclusions = exclusionPrefixes[categoryLower] || [];
  
  if (prefixes.length === 0 && keywords.length === 0) return markets;

  // Categories that should ONLY use prefix matching (no keyword fallback to prevent false positives)
  const strictPrefixOnly: string[] = ['climate', 'crypto', 'tech', 'sports'];
  const isStrictPrefixOnly = strictPrefixOnly.includes(categoryLower) && prefixes.length > 0;

  return markets.filter((market: any) => {
    const ticker = (market.ticker || "").toUpperCase();
    const seriesTicker = (market.series_ticker || "").toUpperCase();
    const title = (market.title || market.subtitle || "").toLowerCase();
    const eventTitle = (market.event_title || "").toLowerCase();
    
    // First check exclusions - if market matches exclusion prefixes, exclude it immediately
    // This is the most important check to prevent cross-category contamination
    const matchesExclusion = exclusions.some(exclusion => {
      const upperExclusion = exclusion.toUpperCase();
      return ticker.startsWith(upperExclusion) || 
             seriesTicker.startsWith(upperExclusion) ||
             (ticker.length > 0 && ticker.includes(upperExclusion)) ||
             (seriesTicker.length > 0 && seriesTicker.includes(upperExclusion));
    });
    
    if (matchesExclusion) {
      return false; // Explicitly exclude this market - this prevents false matches
    }
    
    // Then check ticker prefixes (most reliable indicator)
    const matchesPrefix = prefixes.some(prefix => {
      const upperPrefix = prefix.toUpperCase();
      return ticker.startsWith(upperPrefix) || 
             seriesTicker.startsWith(upperPrefix) ||
             (ticker.length > 0 && ticker.includes(upperPrefix)) ||
             (seriesTicker.length > 0 && seriesTicker.includes(upperPrefix));
    });
    
    if (matchesPrefix) {
      return true; // Definitely belongs to this category
    }
    
    // For strict prefix-only categories (climate, crypto, tech, sports), don't use keyword fallback
    // This prevents false positives like "tech" keyword matching NBA markets
    if (isStrictPrefixOnly) {
      return false; // No prefix match, and this category requires prefix matching
    }
    
    // Finally check title keywords with word boundaries (for categories that allow it)
    if (keywords.length === 0) {
      return false; // No keywords defined, can't match
    }
    
    const searchText = `${title} ${eventTitle}`;
    const matchesKeyword = keywords.some(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      // Use word boundaries for better matching
      const regex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(searchText);
    });
    
    // Only return true if keyword matches AND we didn't exclude it
    return matchesKeyword;
  });
}

// Helper function to display markets (reusable for all categories)
async function displayKalshiMarkets(
  ctx: CommandContext,
  markets: any[],
  title: string,
  limit: number = 20
): Promise<void> {
  if (!markets || markets.length === 0) {
    const noMarketsHtml = `
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
          <div style="color: var(--palette-text, #e0e0e0); font-size: 14px;">No markets found for ${title}</div>
        </div>
      </div>
    `;
    ctx.logHtml(noMarketsHtml);
    return;
  }

  // Use the existing display logic from handleMarkets
  const displayMarkets = markets.slice(0, limit);
  
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
        📊 ${title} (${displayMarkets.length} markets)
      </div>
  `;

  displayMarkets.forEach((market: any, index: number) => {
    const num = (index + 1).toString().padStart(2, "0");
    const question = market.title || market.subtitle || market.event_title || "No question available";
    const ticker = market.ticker || "N/A";
    
    // Parse prices - Kalshi returns prices as strings in dollars
    // Use bid prices for display, fallback to ask, then last_price, then 0
    const yesBid = market.yes_bid_dollars ? parseFloat(market.yes_bid_dollars) : null;
    const yesAsk = market.yes_ask_dollars ? parseFloat(market.yes_ask_dollars) : null;
    const yesPrice = yesBid ?? yesAsk ?? (market.last_price_dollars ? parseFloat(market.last_price_dollars) : 0);
    
    const noBid = market.no_bid_dollars ? parseFloat(market.no_bid_dollars) : null;
    const noAsk = market.no_ask_dollars ? parseFloat(market.no_ask_dollars) : null;
    // For NO price, if YES price exists, NO = 1 - YES (since they must sum to $1)
    const noPrice = noBid ?? noAsk ?? (yesPrice > 0 ? (1 - yesPrice) : 0);
    
    const volume = market.volume_24h || market.volume || 0;
    const volumeFormatted = volume > 0 ? `$${volume.toLocaleString()}` : "$0";
    const openInterest = market.open_interest || 0;
    const liquidity = market.liquidity_dollars ? parseFloat(market.liquidity_dollars) : 0;
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
          margin-bottom: 8px;
        ">
          <span>🟢 Yes: <strong style="color: var(--palette-success, #16c782);">$${yesPrice.toFixed(2)}</strong>${yesBid && yesAsk ? ` (${((yesAsk - yesBid) * 100).toFixed(1)}% spread)` : ''}</span>
          <span>🔴 No: <strong style="color: var(--palette-error, #ff4d4f);">$${noPrice.toFixed(2)}</strong></span>
          <span>💰 Volume: <strong style="color: var(--palette-primary, #00bcf2);">${volumeFormatted}</strong></span>
          <span style="color: ${statusColor};">Status: ${marketStatus}</span>
        </div>
        <div style="
          margin-left: 32px;
          font-size: 11px;
          color: color-mix(in srgb, var(--palette-text, #ffffff) 55%, transparent);
          margin-bottom: 8px;
        ">
          <strong style="color: var(--palette-primary, #00bcf2);">Ticker:</strong> ${ticker}
          ${openInterest > 0 ? ` | 📊 OI: ${openInterest.toLocaleString()}` : ''}
          ${liquidity > 0 ? ` | 💧 Liquidity: $${liquidity.toLocaleString()}` : ''}
          ${market.close_time ? ` | 📅 Close: ${new Date(market.close_time).toLocaleString()}` : ''}
        </div>
        <div style="
          margin-top: 8px;
          margin-left: 32px;
          display: flex;
          gap: 8px;
        ">
          <a 
            href="${getKalshiMarketUrl(market)}" 
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
            🔗 View on Kalshi →
          </a>
          <button
            class="omega-help-command"
            data-command="trade buy kalshi ${ticker} yes 1"
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
            title="Buy YES ($1)"
          >
            🟢 Buy YES
          </button>
          <button
            class="omega-help-command"
            data-command="trade buy kalshi ${ticker} no 1"
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
            title="Buy NO ($1)"
          >
            🔴 Buy NO
          </button>
        </div>
      </div>
    `;
  });

  if (markets.length > limit) {
    marketsHtml += `
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
          margin-bottom: 8px;
        ">
          💡 Use "kalshi help" for more commands | 🔗 Trade at <a href="https://kalshi.com" target="_blank" rel="noopener noreferrer" style="color: var(--palette-secondary, #00ff88);">kalshi.com</a>
        </div>
        <div style="margin-top: 8px;">
          <a 
            href="https://kalshi.com/?category=all" 
            target="_blank"
            rel="noopener noreferrer"
            style="
              color: var(--palette-secondary, #00ff88);
              text-decoration: none;
              font-size: 11px;
              padding: 4px 8px;
              border: 1px solid var(--palette-secondary, #00ff88);
              border-radius: 4px;
              display: inline-block;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 20%, transparent)';"
            onmouseout="this.style.background = 'transparent';"
          >
            🔗 View All Markets on Kalshi →
          </a>
        </div>
      </div>
    </div>
  `;

  ctx.logHtml(marketsHtml);
}

// Helper function to deduplicate markets by event/series/title
function deduplicateMarkets(markets: any[]): any[] {
  const seen = new Map<string, any>();
  
  markets.forEach((market: any) => {
    const eventTicker = market.event_ticker || "";
    const seriesTicker = market.series_ticker || "";
    const title = (market.title || market.subtitle || "").toLowerCase().trim();
    
    // Create a key based on event/series first
    let key = eventTicker || seriesTicker || "";
    
    // If no event/series, use a normalized title (remove numbers, special chars, and common variations)
    if (!key && title) {
      // Remove numbers (like "168", "165", etc. from "Total Points 168")
      // Remove common suffixes like "Total Points", "Spread", etc.
      let normalized = title
        .replace(/\d+\.?\d*/g, "") // Remove all numbers
        .replace(/total points/gi, "")
        .replace(/spread/gi, "")
        .replace(/over|under/gi, "")
        .replace(/wins by/gi, "")
        .replace(/points/gi, "")
        .replace(/[^\w\s]/g, "") // Remove special chars
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
      
      // Extract the core event (e.g., "New Orleans at Tulane" from "New Orleans at Tulane: Total Points")
      const match = normalized.match(/^([^:]+)/);
      if (match) {
        normalized = match[1].trim();
      }
      
      key = normalized.substring(0, 100);
    }
    
    // If still no key, use ticker prefix (e.g., "KXNCAAMBTOTAL-25NOV14UNOTULN" from full ticker)
    if (!key && market.ticker) {
      const tickerParts = market.ticker.split("-");
      if (tickerParts.length >= 2) {
        // Use the base ticker without the final number
        key = tickerParts.slice(0, -1).join("-");
      } else {
        key = market.ticker;
      }
    }
    
    if (key) {
      const existing = seen.get(key);
      const currentVol = market.volume_24h || market.volume || 0;
      const existingVol = existing ? (existing.volume_24h || existing.volume || 0) : 0;
      
      // Keep the market with higher volume, or the first one if volumes are equal
      if (!existing || currentVol > existingVol) {
        seen.set(key, market);
      }
    } else {
      // If we can't create a key, just add it (shouldn't happen often)
      seen.set(market.ticker || Math.random().toString(), market);
    }
  });
  
  return Array.from(seen.values());
}

// Category handlers
async function handleTrending(ctx: CommandContext, args: string[]): Promise<void> {
  const limit = Number(args[2]) || 20;
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
        🔥 Fetching trending markets...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  try {
    // Fetch a larger set to ensure we get markets with volume
    const res = await kalshi.getMarkets({ limit: 500, status: "open" });
    
    // Handle different response structures
    let markets: any[] = [];
    if (res) {
      if (Array.isArray(res)) {
        markets = res;
      } else if (res.markets && Array.isArray(res.markets)) {
        markets = res.markets;
      } else if (res.data && Array.isArray(res.data)) {
        markets = res.data;
      } else if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && 'markets' in res.data && Array.isArray(res.data.markets)) {
        markets = res.data.markets;
      }
    }
    
    console.log(`[Kalshi Trending] Fetched ${markets.length} markets`);
    
    // Filter out test markets
    markets = markets.filter((market: any) => {
      const ticker = (market.ticker || "").toUpperCase();
      const title = (market.title || market.subtitle || "").toLowerCase();
      return !ticker.includes("QUICKSETTLE") && !ticker.includes("TEST") && 
             !title.includes("1+1") && !title.includes("test market");
    });
    
    console.log(`[Kalshi Trending] After test filter: ${markets.length} markets`);
    
    // Filter out markets with zero volume - trending should only show active markets
    markets = markets.filter((market: any) => {
      const volume = market.volume_24h || market.volume || 0;
      return volume > 0;
    });
    
    console.log(`[Kalshi Trending] After volume filter: ${markets.length} markets`);
    
    // Deduplicate similar markets (same event/series)
    markets = deduplicateMarkets(markets);
    
    console.log(`[Kalshi Trending] After deduplication: ${markets.length} markets`);
    
    // Sort by volume (trending = highest volume)
    markets.sort((a: any, b: any) => {
      const aVol = a.volume_24h || a.volume || 0;
      const bVol = b.volume_24h || b.volume || 0;
      return bVol - aVol;
    });
    
    // Take only the requested limit
    markets = markets.slice(0, limit);
    
    if (markets.length === 0) {
      const noMarketsHtml = `
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
            <div style="color: var(--palette-text, #e0e0e0); font-size: 14px; margin-bottom: 8px;">
              No trending markets found with trading volume
            </div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
              Try: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">kalshi markets 20</code> to see all markets
            </div>
          </div>
        </div>
      `;
      ctx.logHtml(noMarketsHtml);
      return;
    }
    
    await displayKalshiMarkets(ctx, markets, "🔥 Trending Markets");
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

async function handleNew(ctx: CommandContext, args: string[]): Promise<void> {
  const limit = Number(args[2]) || 20;
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
        🆕 Fetching newest markets...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  try {
    // Fetch a larger set to ensure we get diverse markets
    const res = await kalshi.getMarkets({ limit: 500, status: "open" });
    
    // Handle different response structures
    let markets: any[] = [];
    if (res) {
      if (Array.isArray(res)) {
        markets = res;
      } else if (res.markets && Array.isArray(res.markets)) {
        markets = res.markets;
      } else if (res.data && Array.isArray(res.data)) {
        markets = res.data;
      } else if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && 'markets' in res.data && Array.isArray(res.data.markets)) {
        markets = res.data.markets;
      }
    }
    
    console.log(`[Kalshi New] Fetched ${markets.length} markets`);
    
    // Filter out test markets
    markets = markets.filter((market: any) => {
      const ticker = (market.ticker || "").toUpperCase();
      const title = (market.title || market.subtitle || "").toLowerCase();
      return !ticker.includes("QUICKSETTLE") && !ticker.includes("TEST") && 
             !title.includes("1+1") && !title.includes("test market");
    });
    
    console.log(`[Kalshi New] After test filter: ${markets.length} markets`);
    
    // Filter out markets with zero volume - new markets should have some activity
    markets = markets.filter((market: any) => {
      const volume = market.volume_24h || market.volume || 0;
      return volume > 0;
    });
    
    console.log(`[Kalshi New] After volume filter: ${markets.length} markets`);
    
    // Deduplicate similar markets
    markets = deduplicateMarkets(markets);
    
    console.log(`[Kalshi New] After deduplication: ${markets.length} markets`);
    
    // Sort by creation time (newest first) - use ticker as proxy (newer tickers typically have later dates)
    markets.sort((a: any, b: any) => {
      const aTicker = (a.ticker || "").toUpperCase();
      const bTicker = (b.ticker || "").toUpperCase();
      // Compare tickers (newer markets often have later dates in ticker)
      return bTicker.localeCompare(aTicker);
    });
    
    // Take only the requested limit
    markets = markets.slice(0, limit);
    
    if (markets.length === 0) {
      const noMarketsHtml = `
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
            <div style="color: var(--palette-text, #e0e0e0); font-size: 14px; margin-bottom: 8px;">
              No new markets found with trading volume
            </div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
              Try: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">kalshi markets 20</code> to see all markets
            </div>
          </div>
        </div>
      `;
      ctx.logHtml(noMarketsHtml);
      return;
    }
    
    await displayKalshiMarkets(ctx, markets, "🆕 Newest Markets");
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

async function handleCategory(ctx: CommandContext, args: string[], category: string, emoji: string, displayName: string): Promise<void> {
  const limit = Number(args[2]) || 20;
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
        ${emoji} Fetching ${displayName} markets...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  try {
    // Fetch more markets to ensure we have enough to filter from
    const res = await kalshi.getMarkets({ limit: Math.max(limit * 10, 500), status: "open" });
    
    // Handle different response structures
    let markets: any[] = [];
    if (res) {
      if (Array.isArray(res)) {
        markets = res;
      } else if (res.markets && Array.isArray(res.markets)) {
        markets = res.markets;
      } else if (res.data && Array.isArray(res.data)) {
        markets = res.data;
      } else if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && 'markets' in res.data && Array.isArray(res.data.markets)) {
        markets = res.data.markets;
      }
    }
    
    // Filter by category (this must be precise)
    const beforeFilter = markets.length;
    markets = filterMarketsByCategory(markets, category);
    console.log(`[Kalshi ${category}] Filtered ${beforeFilter} markets to ${markets.length} for category "${category}"`);
    
    // Filter out test markets
    markets = markets.filter((market: any) => {
      const ticker = (market.ticker || "").toUpperCase();
      const title = (market.title || market.subtitle || "").toLowerCase();
      return !ticker.includes("QUICKSETTLE") && !ticker.includes("TEST") && 
             !title.includes("1+1") && !title.includes("test market");
    });
    
    // Deduplicate similar markets
    markets = deduplicateMarkets(markets);
    
    // Sort by volume
    markets.sort((a: any, b: any) => {
      const aVol = a.volume_24h || a.volume || 0;
      const bVol = b.volume_24h || b.volume || 0;
      return bVol - aVol;
    });
    
    await displayKalshiMarkets(ctx, markets.slice(0, limit), `${emoji} ${displayName} Markets`);
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

async function handleCategoryCombined(ctx: CommandContext, args: string[], categories: string[], emoji: string, displayName: string): Promise<void> {
  const limit = Number(args[2]) || 20;
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
        ${emoji} Fetching ${displayName} markets...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  try {
    const res = await kalshi.getMarkets({ limit: Math.max(limit * 5, 200), status: "open" });
    
    // Handle different response structures
    let markets: any[] = [];
    if (res) {
      if (Array.isArray(res)) {
        markets = res;
      } else if (res.markets && Array.isArray(res.markets)) {
        markets = res.markets;
      } else if (res.data && Array.isArray(res.data)) {
        markets = res.data;
      } else if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && 'markets' in res.data && Array.isArray(res.data.markets)) {
        markets = res.data.markets;
      }
    }
    
    // Filter by multiple categories (union)
    const filteredMarkets: any[] = [];
    categories.forEach(category => {
      const categoryMarkets = filterMarketsByCategory(markets, category);
      categoryMarkets.forEach(market => {
        if (!filteredMarkets.find(m => m.ticker === market.ticker)) {
          filteredMarkets.push(market);
        }
      });
    });
    markets = filteredMarkets;
    
    // Filter out test markets
    markets = markets.filter((market: any) => {
      const ticker = (market.ticker || "").toUpperCase();
      const title = (market.title || market.subtitle || "").toLowerCase();
      return !ticker.includes("QUICKSETTLE") && !ticker.includes("TEST") && 
             !title.includes("1+1") && !title.includes("test market");
    });
    
    // Deduplicate similar markets
    markets = deduplicateMarkets(markets);
    
    // Sort by volume
    markets.sort((a: any, b: any) => {
      const aVol = a.volume_24h || a.volume || 0;
      const bVol = b.volume_24h || b.volume || 0;
      return bVol - aVol;
    });
    
    await displayKalshiMarkets(ctx, markets.slice(0, limit), `${emoji} ${displayName} Markets`);
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

async function handler(ctx: CommandContext, args: string[]): Promise<void> {
  const sub = (args[1] || "").toLowerCase();
  switch (sub) {
    case "markets":
      await handleMarkets(ctx, args);
      break;
    case "trending":
      await handleTrending(ctx, args);
      break;
    case "new":
      await handleNew(ctx, args);
      break;
    case "all":
      await handleMarkets(ctx, [...args.slice(0, 1), "markets", args[2] || "50", "all"]);
      break;
    case "politics":
      await handleCategory(ctx, args, "politics", "🏛️", "Political");
      break;
    case "sports":
      await handleCategory(ctx, args, "sports", "⚽", "Sports");
      break;
    case "culture":
      await handleCategory(ctx, args, "culture", "🎭", "Culture");
      break;
    case "crypto":
      await handleCategory(ctx, args, "crypto", "₿", "Crypto");
      break;
    case "climate":
      await handleCategory(ctx, args, "climate", "🌍", "Climate");
      break;
    case "economics":
    case "economy":
      await handleCategory(ctx, args, "economics", "📈", "Economics");
      break;
    case "mentions":
      await handleCategory(ctx, args, "mentions", "💬", "Mentions");
      break;
    case "companies":
      await handleCategory(ctx, args, "companies", "🏢", "Companies");
      break;
    case "financials":
      await handleCategory(ctx, args, "financials", "💰", "Financials");
      break;
    case "tech":
      await handleCategory(ctx, args, "tech", "💻", "Tech");
      break;
    case "science":
      await handleCategory(ctx, args, "science", "🔬", "Science");
      break;
    case "tech-science":
    case "techscience":
      // Combine tech and science keywords
      await handleCategoryCombined(ctx, args, ["tech", "science"], "💻🔬", "Tech & Science");
      break;
    case "health":
      await handleCategory(ctx, args, "health", "🏥", "Health");
      break;
    case "world":
      await handleCategory(ctx, args, "world", "🌎", "World");
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
    "kalshi <trending|new|all|politics|sports|culture|crypto|climate|economics|mentions|companies|financials|tech|science|health|world|markets|market|orderbook|trades|events|event|series|help> [params]",
  category: "markets",
  handler,
};

export const kalshiCommands: Command[] = [kalshiCommand];
