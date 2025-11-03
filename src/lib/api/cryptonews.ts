/**
 * CryptoNews API Client
 *
 * Multi-source crypto news aggregator with fallback chain:
 * 1. CryptoPanic (primary) - comprehensive crypto news with sentiment
 * 2. CryptoCompare (fallback) - crypto market news
 * 3. Mock data (last resort) - ensures graceful degradation
 *
 * Features:
 * - Category filtering (hot, latest, bullish, bearish)
 * - Sentiment analysis from vote counts
 * - Cryptocurrency extraction and filtering
 * - Next.js caching with 2-minute revalidation
 * - Rate limit awareness
 */

import { NewsArticle, NewsFilter } from "@/types/media";

// ============================================================================
// Configuration
// ============================================================================

const CRYPTONEWS_CONFIG = {
  API_KEYS: {
    cryptopanic: "free", // Using free tier
    cryptocompare: "free",
    newsapi: "free",
  },
  ENDPOINTS: {
    cryptopanic: "https://cryptopanic.com/api/v1/posts/",
    cryptocompare: "https://min-api.cryptocompare.com/data/v2/news/",
    newsapi: "https://newsapi.org/v2/everything",
  },
  RATE_LIMITS: {
    cryptopanic: 100, // requests per day (free tier)
    cryptocompare: 50, // requests per hour (free tier)
    newsapi: 100, // requests per day (free tier)
  },
};

// ============================================================================
// Mock Data (Fallback)
// ============================================================================

const MOCK_NEWS: NewsArticle[] = [
  {
    id: "mock-1",
    title:
      "Bitcoin Reaches New All-Time High as Institutional Adoption Accelerates",
    url: "https://example.com/btc-ath",
    source: {
      title: "Crypto News",
      domain: "cryptonews.com",
    },
    published_at: new Date(Date.now() - 3600000).toISOString(),
    votes: {
      positive: 245,
      negative: 12,
      important: 89,
      liked: 156,
      disliked: 8,
      lol: 23,
      toxic: 2,
      saved: 67,
      comments: 45,
    },
    currencies: [
      {
        code: "BTC",
        title: "Bitcoin",
        slug: "bitcoin",
        url: "https://example.com/btc",
      },
    ],
  },
  {
    id: "mock-2",
    title: "Ethereum 2.0 Staking Surpasses 30 Million ETH",
    url: "https://example.com/eth-staking",
    source: {
      title: "Decrypt",
      domain: "decrypt.co",
    },
    published_at: new Date(Date.now() - 7200000).toISOString(),
    votes: {
      positive: 198,
      negative: 15,
      important: 67,
      liked: 123,
      disliked: 11,
      lol: 8,
      toxic: 1,
      saved: 54,
      comments: 32,
    },
    currencies: [
      {
        code: "ETH",
        title: "Ethereum",
        slug: "ethereum",
        url: "https://example.com/eth",
      },
    ],
  },
  {
    id: "mock-3",
    title: "Solana Network Processes Over 2,000 Transactions Per Second",
    url: "https://example.com/sol-tps",
    source: {
      title: "CoinDesk",
      domain: "coindesk.com",
    },
    published_at: new Date(Date.now() - 10800000).toISOString(),
    votes: {
      positive: 167,
      negative: 23,
      important: 45,
      liked: 98,
      disliked: 19,
      lol: 12,
      toxic: 3,
      saved: 41,
      comments: 28,
    },
    currencies: [
      {
        code: "SOL",
        title: "Solana",
        slug: "solana",
        url: "https://example.com/sol",
      },
    ],
  },
  {
    id: "mock-4",
    title: "SEC Delays Decision on Bitcoin ETF Applications",
    url: "https://example.com/sec-etf",
    source: {
      title: "Bloomberg",
      domain: "bloomberg.com",
    },
    published_at: new Date(Date.now() - 14400000).toISOString(),
    votes: {
      positive: 89,
      negative: 134,
      important: 112,
      liked: 67,
      disliked: 98,
      lol: 45,
      toxic: 12,
      saved: 34,
      comments: 67,
    },
    currencies: [
      {
        code: "BTC",
        title: "Bitcoin",
        slug: "bitcoin",
        url: "https://example.com/btc",
      },
    ],
  },
  {
    id: "mock-5",
    title: "DeFi Total Value Locked Reaches $100 Billion Milestone",
    url: "https://example.com/defi-tvl",
    source: {
      title: "The Block",
      domain: "theblock.co",
    },
    published_at: new Date(Date.now() - 18000000).toISOString(),
    votes: {
      positive: 212,
      negative: 18,
      important: 78,
      liked: 145,
      disliked: 13,
      lol: 19,
      toxic: 2,
      saved: 89,
      comments: 56,
    },
    currencies: [
      {
        code: "ETH",
        title: "Ethereum",
        slug: "ethereum",
        url: "https://example.com/eth",
      },
      {
        code: "BTC",
        title: "Bitcoin",
        slug: "bitcoin",
        url: "https://example.com/btc",
      },
    ],
  },
];

// ============================================================================
// Main API Functions
// ============================================================================

/**
 * Fetch crypto news from multiple sources with fallback chain
 *
 * @param options - Fetch options
 * @param options.limit - Number of articles to return (default: 20)
 * @param options.filter - News category filter (default: 'hot')
 * @param options.currencies - Filter by cryptocurrency symbols (default: ['BTC', 'ETH', 'SOL'])
 * @returns Promise resolving to array of news articles
 */
export async function getNews(
  options: {
    limit?: number;
    filter?: NewsFilter;
    currencies?: string[];
  } = {}
): Promise<NewsArticle[]> {
  const {
    limit = 20,
    filter = "hot",
    currencies = ["BTC", "ETH", "SOL"],
  } = options;

  try {
    // Try CryptoPanic API first (primary source)
    const cryptoPanicUrl = `${
      CRYPTONEWS_CONFIG.ENDPOINTS.cryptopanic
    }?auth_token=${
      CRYPTONEWS_CONFIG.API_KEYS.cryptopanic
    }&filter=${filter}&currencies=${currencies.join(",")}&public=true`;

    const response = await fetch(cryptoPanicUrl, {
      next: { revalidate: 120 }, // Cache for 2 minutes
    });

    if (response.ok) {
      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        return normalizeCryptoPanicArticles(data.results).slice(0, limit);
      }
    }
  } catch (error) {
    console.warn(
      "[CryptoNews] CryptoPanic API failed, trying fallback:",
      error
    );
  }

  try {
    // Fallback to CryptoCompare API
    const cryptoCompareUrl = `${CRYPTONEWS_CONFIG.ENDPOINTS.cryptocompare}?lang=EN&sortOrder=latest`;

    const response = await fetch(cryptoCompareUrl, {
      next: { revalidate: 120 },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.Data && Array.isArray(data.Data)) {
        return normalizeCryptoCompareArticles(data.Data).slice(0, limit);
      }
    }
  } catch (error) {
    console.warn(
      "[CryptoNews] CryptoCompare API failed, using mock data:",
      error
    );
  }

  // Last resort: return mock data
  console.log("[CryptoNews] Using mock data as all APIs failed");
  return MOCK_NEWS.slice(0, limit);
}

/**
 * Extract cryptocurrency symbols from text
 *
 * @param text - Text to analyze
 * @returns Array of cryptocurrency symbols found
 */
export function extractCryptocurrencies(text: string): string[] {
  const cryptoRegex =
    /\b(BTC|ETH|SOL|ADA|DOT|LINK|UNI|MATIC|AVAX|ATOM|XRP|DOGE|SHIB|LTC|BCH|XLM|EOS|TRX|XTZ|ALGO|VET)\b/gi;
  const matches = text.match(cryptoRegex);
  return matches ? [...new Set(matches.map((m) => m.toUpperCase()))] : [];
}

/**
 * Analyze sentiment from article votes
 *
 * @param votes - Vote counts object
 * @returns Sentiment analysis result
 */
export function analyzeSentiment(votes: any): {
  score: number;
  label: string;
  emoji: string;
  class: string;
} {
  if (!votes) {
    return {
      score: 0.5,
      label: "neutral",
      emoji: "📰",
      class: "neutral",
    };
  }

  const positive = votes.positive || 0;
  const negative = votes.negative || 0;
  const total = positive + negative;

  if (total === 0) {
    return {
      score: 0.5,
      label: "neutral",
      emoji: "📰",
      class: "neutral",
    };
  }

  const score = positive / total;

  if (score > 0.6) {
    return {
      score,
      label: "bullish",
      emoji: "🚀",
      class: "bullish",
    };
  } else if (score < 0.4) {
    return {
      score,
      label: "bearish",
      emoji: "📉",
      class: "bearish",
    };
  } else {
    return {
      score,
      label: "neutral",
      emoji: "📰",
      class: "neutral",
    };
  }
}

/**
 * Format timestamp as relative time (e.g., '5m ago', '2h ago')
 *
 * @param timestamp - ISO 8601 timestamp string
 * @returns Formatted relative time string
 */
export function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return "just now";
  }
}

// ============================================================================
// Normalization Functions
// ============================================================================

/**
 * Normalize CryptoPanic API response to NewsArticle format
 */
function normalizeCryptoPanicArticles(results: any[]): NewsArticle[] {
  return results.map((item, index) => ({
    id: item.id?.toString() || `cryptopanic-${index}`,
    title: item.title || "Untitled",
    url: item.url || "",
    source: {
      title: item.source?.title || "Unknown Source",
      domain: item.source?.domain || "unknown.com",
    },
    published_at: item.published_at || new Date().toISOString(),
    created_at: item.created_at,
    votes: item.votes || {
      positive: 0,
      negative: 0,
      important: 0,
      liked: 0,
      disliked: 0,
      lol: 0,
      toxic: 0,
      saved: 0,
      comments: 0,
    },
    currencies: item.currencies || [],
    domain: item.domain,
  }));
}

/**
 * Normalize CryptoCompare API response to NewsArticle format
 */
function normalizeCryptoCompareArticles(results: any[]): NewsArticle[] {
  return results.map((item, index) => ({
    id: item.id?.toString() || `cryptocompare-${index}`,
    title: item.title || "Untitled",
    url: item.url || item.guid || "",
    source: {
      title: item.source_info?.name || item.source || "Unknown Source",
      domain: item.source_info?.domain || "unknown.com",
    },
    published_at: item.published_on
      ? new Date(item.published_on * 1000).toISOString()
      : new Date().toISOString(),
    currencies: extractCryptocurrencies(
      item.title + " " + (item.body || "")
    ).map((code) => ({
      code,
      title: code,
      slug: code.toLowerCase(),
      url: `https://www.cryptocompare.com/coins/${code.toLowerCase()}/`,
    })),
  }));
}
