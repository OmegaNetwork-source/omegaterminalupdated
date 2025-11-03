/**
 * News Commands
 *
 * Commands for crypto news reader with multi-source aggregation.
 * Integrates with CryptoNews API client (CryptoPanic, CryptoCompare, NewsAPI).
 *
 * Commands:
 * - news open - Open news reader panel
 * - news close - Close news reader panel
 * - news latest - Show latest crypto news
 * - news hot - Show hot/trending news
 * - news bullish - Show bullish sentiment news
 * - news bearish - Show bearish sentiment news
 * - news btc/eth/sol - Show cryptocurrency-specific news
 * - news search <query> - Search news
 * - news sources - Show news sources
 * - news help - Show help
 *
 * Note: News reader panel UI is deferred to Phase 15 (futuristic UI system).
 * For Phase 12, commands display news in terminal with styled HTML cards.
 */

import type { Command, CommandContext } from "@/types/commands";
import { cryptonews } from "@/lib/api";
import type { NewsFilter, NewsArticle } from "@/types/media";

// ============================================================================
// Helper Functions
// ============================================================================

function displayNewsArticles(
  context: CommandContext,
  articles: NewsArticle[],
  filter: string
) {
  if (articles.length === 0) {
    context.log("📰 No news articles found", "info");
    return;
  }

  context.log(
    `📰 ${filter.toUpperCase()} NEWS (${articles.length} articles)`,
    "success"
  );
  context.log(
    "═══════════════════════════════════════════════════════",
    "info"
  );
  context.log("", "info");

  articles.forEach((article, index) => {
    const sentiment = cryptonews.analyzeSentiment(article.votes);
    const timeAgo = cryptonews.formatTimeAgo(article.published_at);

    // Article card HTML
    const cardHtml = `
      <div style="
        background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 200, 100, 0.02) 100%);
        border: 1px solid rgba(0, 255, 136, 0.2);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      ">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 20px;">${sentiment.emoji}</span>
          <div style="flex: 1;">
            <div style="color: #00ff88; font-size: 11px; font-weight: 600; text-transform: uppercase;">
              ${article.source.title}
            </div>
            <div style="color: rgba(255, 255, 255, 0.4); font-size: 10px;">
              ${timeAgo}
            </div>
          </div>
          <div style="
            background: rgba(0, 255, 136, 0.15);
            color: #00ff88;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
          ">
            ${sentiment.label.toUpperCase()}
          </div>
        </div>
        
        <h3 style="
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 500;
          line-height: 1.4;
          margin: 0 0 8px 0;
        ">
          ${article.title}
        </h3>
        
        ${
          article.currencies && article.currencies.length > 0
            ? `
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
            ${article.currencies
              .map(
                (currency) => `
              <span style="
                background: rgba(0, 255, 136, 0.15);
                color: #00ff88;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 600;
                border: 1px solid rgba(0, 255, 136, 0.3);
              ">
                ${currency.code}
              </span>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <button onclick="window.open('${article.url}', '_blank')" style="
            flex: 1;
            padding: 6px 12px;
            background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 200, 100, 0.15) 100%);
            border: 1px solid rgba(0, 255, 136, 0.3);
            border-radius: 6px;
            color: #00ff88;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            📖 Read Full Article →
          </button>
          ${
            article.votes
              ? `
            <div style="display: flex; gap: 6px; font-size: 11px; margin-left: 8px;">
              <span style="color: #00ff88;">👍 ${article.votes.positive}</span>
              <span style="color: #ff4444;">👎 ${article.votes.negative}</span>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;

    context.logHtml(cardHtml);
  });

  context.log("", "info");
  context.log(
    '💡 Tip: Click "Read Full Article" buttons to open in new tab',
    "info"
  );
  context.log("   Panel UI with auto-refresh coming in Phase 15", "info");
}

// ============================================================================
// Command Handlers
// ============================================================================

async function handleOpen(context: CommandContext, args: string[]) {
  context.log(
    "╔═══════════════════════════════════════════════════════════╗",
    "info"
  );
  context.log(
    "║          📰 NEWS READER - PHASE 15 PREVIEW               ║",
    "info"
  );
  context.log(
    "╚═══════════════════════════════════════════════════════════╝",
    "info"
  );
  context.log("", "info");
  context.log(
    "📱 News reader panel will open as a sidebar in Phase 15",
    "info"
  );
  context.log("   (futuristic UI system integration)", "info");
  context.log("", "info");
  context.log("✨ Features:", "info");
  context.log("  • Multi-source crypto news aggregation", "info");
  context.log("  • Category filtering (hot, latest, bullish, bearish)", "info");
  context.log("  • Cryptocurrency-specific news (BTC, ETH, SOL)", "info");
  context.log("  • Sentiment analysis from vote counts", "info");
  context.log("  • Auto-refresh every 5 minutes", "info");
  context.log("  • Click to read full articles", "info");
  context.log("", "info");
  context.log("📊 Data Sources:", "info");
  context.log("  1. CryptoPanic (primary) - comprehensive crypto news", "info");
  context.log("  2. CryptoCompare (fallback) - crypto market news", "info");
  context.log("  3. Mock data (last resort) - graceful degradation", "info");
  context.log("", "info");
  context.log("🎯 Terminal Commands Available Now:", "info");
  context.log("  • news latest  - Show latest crypto news", "info");
  context.log("  • news hot     - Show hot/trending news", "info");
  context.log("  • news bullish - Show bullish sentiment news", "info");
  context.log("  • news bearish - Show bearish sentiment news", "info");
  context.log("  • news btc     - Show Bitcoin-specific news", "info");
  context.log("  • news eth     - Show Ethereum-specific news", "info");
  context.log("  • news sol     - Show Solana-specific news", "info");
  context.log("", "info");
  context.log(
    '💡 Tip: Try "news latest" to see styled news cards in terminal!',
    "info"
  );
}

async function handleClose(context: CommandContext, args: string[]) {
  context.log("📰 News reader panel will close (Phase 15)", "info");
}

async function handleLatest(context: CommandContext, args: string[]) {
  context.log("📡 Fetching latest crypto news...", "info");
  context.log("", "info");

  try {
    const articles = await cryptonews.getNews({ filter: "latest", limit: 10 });
    displayNewsArticles(context, articles, "LATEST");
  } catch (error) {
    context.log("Failed to fetch news articles", "error");
    console.error("[News] Error:", error);
  }
}

async function handleHot(context: CommandContext, args: string[]) {
  context.log("🔥 Fetching hot/trending crypto news...", "info");
  context.log("", "info");

  try {
    const articles = await cryptonews.getNews({ filter: "hot", limit: 10 });
    displayNewsArticles(context, articles, "HOT");
  } catch (error) {
    context.log("Failed to fetch news articles", "error");
    console.error("[News] Error:", error);
  }
}

async function handleBullish(context: CommandContext, args: string[]) {
  context.log("🚀 Fetching bullish crypto news...", "info");
  context.log("", "info");

  try {
    const articles = await cryptonews.getNews({ filter: "bullish", limit: 10 });
    displayNewsArticles(context, articles, "BULLISH");
  } catch (error) {
    context.log("Failed to fetch news articles", "error");
    console.error("[News] Error:", error);
  }
}

async function handleBearish(context: CommandContext, args: string[]) {
  context.log("📉 Fetching bearish crypto news...", "info");
  context.log("", "info");

  try {
    const articles = await cryptonews.getNews({ filter: "bearish", limit: 10 });
    displayNewsArticles(context, articles, "BEARISH");
  } catch (error) {
    context.log("Failed to fetch news articles", "error");
    console.error("[News] Error:", error);
  }
}

async function handleCryptoSpecific(
  context: CommandContext,
  args: string[],
  crypto: string
) {
  context.log(`📡 Fetching ${crypto.toUpperCase()}-specific news...`, "info");
  context.log("", "info");

  try {
    const articles = await cryptonews.getNews({
      currencies: [crypto.toUpperCase()],
      limit: 10,
    });
    displayNewsArticles(context, articles, crypto.toUpperCase());
  } catch (error) {
    context.log("Failed to fetch news articles", "error");
    console.error("[News] Error:", error);
  }
}

async function handleSearch(context: CommandContext, args: string[]) {
  const query = args.slice(2).join(" ");

  if (!query) {
    context.log("Usage: news search <query>", "error");
    context.log("Example: news search ethereum upgrade", "info");
    return;
  }

  context.log(`🔍 Searching news for "${query}"...`, "info");
  context.log("", "info");
  context.log("📱 Search functionality coming in Phase 15", "info");
  context.log(
    "   For now, use category filters: latest, hot, bullish, bearish",
    "info"
  );
}

async function handleSources(context: CommandContext, args: string[]) {
  context.log(
    "╔═══════════════════════════════════════════════════════════╗",
    "info"
  );
  context.log(
    "║                    NEWS DATA SOURCES                      ║",
    "info"
  );
  context.log(
    "╚═══════════════════════════════════════════════════════════╝",
    "info"
  );
  context.log("", "info");
  context.log("📊 Primary Source:", "info");
  context.log("  🔹 CryptoPanic", "info");
  context.log("     • Comprehensive crypto news aggregator", "info");
  context.log("     • Sentiment analysis from community votes", "info");
  context.log("     • Currency filtering (BTC, ETH, SOL, etc.)", "info");
  context.log("     • Rate Limit: 100 requests/day (free tier)", "info");
  context.log("     • API: https://cryptopanic.com/api/", "info");
  context.log("", "info");
  context.log("📊 Fallback Source:", "info");
  context.log("  🔹 CryptoCompare", "info");
  context.log("     • Crypto market news and analysis", "info");
  context.log("     • Latest articles from major sources", "info");
  context.log("     • Rate Limit: 50 requests/hour (free tier)", "info");
  context.log("     • API: https://min-api.cryptocompare.com/", "info");
  context.log("", "info");
  context.log("📊 Last Resort:", "info");
  context.log("  🔹 Mock Data", "info");
  context.log("     • Ensures graceful degradation", "info");
  context.log("     • Sample crypto news articles", "info");
  context.log("     • Used when all APIs fail", "info");
  context.log("", "info");
  context.log(
    "💡 Multi-source fallback chain ensures news is always available!",
    "info"
  );
}

async function handleHelp(context: CommandContext, args: string[]) {
  context.log(
    "╔═══════════════════════════════════════════════════════════╗",
    "info"
  );
  context.log(
    "║                   CRYPTO NEWS READER HELP                 ║",
    "info"
  );
  context.log(
    "╚═══════════════════════════════════════════════════════════╝",
    "info"
  );
  context.log("", "info");
  context.log("📱 PANEL COMMANDS (Phase 15):", "info");
  context.log("  news open                 Open news reader panel", "info");
  context.log("  news close                Close news reader panel", "info");
  context.log("", "info");
  context.log("📰 TERMINAL COMMANDS (Available Now):", "info");
  context.log("  news latest               Show latest crypto news", "info");
  context.log("  news hot                  Show hot/trending news", "info");
  context.log(
    "  news bullish              Show bullish sentiment news",
    "info"
  );
  context.log(
    "  news bearish              Show bearish sentiment news",
    "info"
  );
  context.log("  news btc                  Show Bitcoin-specific news", "info");
  context.log(
    "  news eth                  Show Ethereum-specific news",
    "info"
  );
  context.log("  news sol                  Show Solana-specific news", "info");
  context.log("  news search <query>       Search news (Phase 15)", "info");
  context.log("  news sources              Show news sources info", "info");
  context.log("  news help                 Show this help", "info");
  context.log("", "info");
  context.log("💡 EXAMPLES:", "info");
  context.log("  news latest               Get latest 10 articles", "info");
  context.log("  news hot                  Get trending articles", "info");
  context.log("  news btc                  Get Bitcoin news", "info");
  context.log(
    "  news bullish              Get positive sentiment news",
    "info"
  );
  context.log("", "info");
  context.log("✨ FEATURES:", "info");
  context.log(
    "  • Multi-source aggregation (CryptoPanic, CryptoCompare)",
    "info"
  );
  context.log(
    "  • Sentiment analysis (bullish 🚀, bearish 📉, neutral 📰)",
    "info"
  );
  context.log("  • Category filtering (hot, latest, bullish, bearish)", "info");
  context.log("  • Cryptocurrency tags (BTC, ETH, SOL, etc.)", "info");
  context.log("  • Clickable article links", "info");
  context.log("  • Styled HTML cards in terminal", "info");
  context.log("", "info");
  context.log("📊 DATA SOURCES:", "info");
  context.log("  1. CryptoPanic (primary)", "info");
  context.log("  2. CryptoCompare (fallback)", "info");
  context.log("  3. Mock data (graceful degradation)", "info");
  context.log("", "info");
  context.log(
    "💡 TIP: News reader panel with auto-refresh coming in Phase 15!",
    "info"
  );
}

// ============================================================================
// Main Command
// ============================================================================

export const newsCommand: Command = {
  name: "news",
  description: "Crypto news reader",
  usage:
    "news <open|close|latest|hot|bullish|bearish|btc|eth|sol|search|sources|help> [params]",
  category: "media",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    switch (subcommand) {
      case "open":
        await handleOpen(context, args);
        break;
      case "close":
        await handleClose(context, args);
        break;
      case "latest":
        await handleLatest(context, args);
        break;
      case "hot":
      case "trending":
        await handleHot(context, args);
        break;
      case "bullish":
        await handleBullish(context, args);
        break;
      case "bearish":
        await handleBearish(context, args);
        break;
      case "btc":
      case "bitcoin":
        await handleCryptoSpecific(context, args, "btc");
        break;
      case "eth":
      case "ethereum":
        await handleCryptoSpecific(context, args, "eth");
        break;
      case "sol":
      case "solana":
        await handleCryptoSpecific(context, args, "sol");
        break;
      case "search":
        await handleSearch(context, args);
        break;
      case "sources":
        await handleSources(context, args);
        break;
      case "help":
      case undefined:
        await handleHelp(context, args);
        break;
      default:
        context.log(`Unknown subcommand: ${subcommand}`, "error");
        context.log('Type "news help" for available commands', "info");
    }
  },
};

// ============================================================================
// Exports
// ============================================================================

export const newsCommands = [newsCommand];
