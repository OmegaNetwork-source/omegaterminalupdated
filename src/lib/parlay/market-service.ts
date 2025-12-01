/**
 * Market Data Service for Parlay Builder
 * 
 * Fetches and normalizes market data from Polymarket and Kalshi.
 * Provides search, filtering, and caching capabilities.
 */

import type { ParlayMarket, ParlayVenue } from "@/types/parlay";

// =============================================================================
// Venue Logo URLs (static assets)
// =============================================================================

export const VENUE_LOGOS = {
  polymarket: "/logos/polymarket-logo.svg",
  kalshi: "/logos/kalshi-logo.svg",
} as const;

// =============================================================================
// API Configuration
// =============================================================================

const POLYMARKET_GAMMA_API = "https://gamma-api.polymarket.com";
const KALSHI_API_BASE = "https://api.elections.kalshi.com/trade-api/v2";

// =============================================================================
// Types
// =============================================================================

export interface MarketSearchParams {
  query?: string;
  venue?: ParlayVenue | "all";
  category?: string;
  tags?: string[];
  sortBy?: "volume" | "newest" | "closing" | "trending";
  limit?: number;
  offset?: number;
  includeResolved?: boolean;
  minDays?: number;  // Minimum days until resolution
  maxDays?: number;  // Maximum days until resolution
}

export interface MarketSearchResult {
  markets: ParlayMarket[];
  total: number;
  hasMore: boolean;
  categories: string[];
  venues: { polymarket: number; kalshi: number };
}

export interface TrendingMarket extends ParlayMarket {
  trendScore: number;
  volumeChange24h: number;
  priceChange24h: number;
}

// =============================================================================
// Cache
// =============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T, ttlMs: number = 60000): void {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
}

// =============================================================================
// Polymarket API (Direct API calls to Gamma API)
// =============================================================================

interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  closed?: boolean;
  active?: boolean;
  volume?: number;
  volume24hr?: number;
  liquidity?: number;
  outcomes?: string[];
  outcomePrices?: string[] | string;
  tags?: Array<{ label?: string; slug?: string } | string>;
  image?: string;
  category?: string;
  markets?: Array<{
    id: string;
    question: string;
    outcomePrices?: string[] | string;
    volume?: number;
    volume24hr?: number;
  }>;
}

async function fetchPolymarketEvents(params: {
  limit?: number;
  offset?: number;
  active?: boolean;
  closed?: boolean;
  order?: string;
  tag?: string;
}): Promise<PolymarketEvent[]> {
  const url = new URL(`${POLYMARKET_GAMMA_API}/events`);
  
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.offset) url.searchParams.set("offset", String(params.offset));
  if (params.active !== undefined) url.searchParams.set("active", String(params.active));
  // Exclude closed markets by default for active queries
  if (params.active && params.closed === undefined) {
    url.searchParams.set("closed", "false");
  } else if (params.closed !== undefined) {
    url.searchParams.set("closed", String(params.closed));
  }
  if (params.order) url.searchParams.set("order", params.order);
  if (params.tag) url.searchParams.set("tag_slug", params.tag);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url.toString(), {
      headers: { 
        "Accept": "application/json",
      },
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[Polymarket] API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    // Handle both array response and object with value/data/events properties
    if (Array.isArray(data)) return data;
    return data.value || data.data || data.events || [];
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[Polymarket] Request timed out after 10s");
    } else {
      console.error("[Polymarket] Fetch error:", error);
    }
    return [];
  }
}

async function searchPolymarketEvents(query: string): Promise<PolymarketEvent[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Gamma API supports text search via query param
    const url = new URL(`${POLYMARKET_GAMMA_API}/events`);
    url.searchParams.set("title_contains", query);
    url.searchParams.set("active", "true");
    url.searchParams.set("closed", "false");
    url.searchParams.set("limit", "50");
    
    const response = await fetch(url.toString(), {
      headers: { 
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      const events = Array.isArray(data) ? data : data.value || data.data || data.events || [];
      return events;
    }
    
    // Fallback: fetch all and filter
    const events = await fetchPolymarketEvents({ limit: 100, active: true });
    const lowerQuery = query.toLowerCase();
    return events.filter(e => 
      e.title?.toLowerCase().includes(lowerQuery) ||
      e.description?.toLowerCase().includes(lowerQuery)
    );
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[Polymarket] Search request timed out");
    } else {
      console.error("[Polymarket] Search error:", error);
    }
    return [];
  }
}

function parseOutcomePrices(outcomePrices: string[] | string | undefined): [number, number] {
  if (!outcomePrices) return [0.5, 0.5];
  
  // Handle JSON string format
  let prices: string[];
  if (typeof outcomePrices === "string") {
    try {
      prices = JSON.parse(outcomePrices);
    } catch {
      return [0.5, 0.5];
    }
  } else {
    prices = outcomePrices;
  }
  
  if (prices.length >= 2) {
    const yesPrice = parseFloat(prices[0]) || 0.5;
    const noPrice = parseFloat(prices[1]) || 0.5;
    return [yesPrice, noPrice];
  }
  
  return [0.5, 0.5];
}

function normalizePolymarketEvent(event: PolymarketEvent): ParlayMarket {
  // Parse outcome prices from event or first market
  let yesPrice = 0.5;
  let noPrice = 0.5;
  
  // Try event-level prices first
  if (event.outcomePrices) {
    [yesPrice, noPrice] = parseOutcomePrices(event.outcomePrices);
  } 
  // Fall back to first market's prices
  else if (event.markets && event.markets.length > 0 && event.markets[0].outcomePrices) {
    [yesPrice, noPrice] = parseOutcomePrices(event.markets[0].outcomePrices);
  }
  
  // Get volume from event or first market
  const volume24h = event.volume24hr || 
    (event.markets?.[0]?.volume24hr) || 
    event.volume || 
    (event.markets?.[0]?.volume) || 
    0;
  const totalVolume = event.volume || (event.markets?.[0]?.volume) || 0;
  
  // Determine category from tags or category field
  let category = "general";
  const categoryLower = event.category?.toLowerCase() || "";
  
  // Check category field first
  const categoryMap: Record<string, string> = {
    politics: "politics",
    crypto: "crypto",
    sports: "sports",
    elections: "politics",
    finance: "economics",
    financials: "economics",
    tech: "tech",
    entertainment: "culture",
    science: "science",
    business: "economics",
  };
  
  for (const [key, cat] of Object.entries(categoryMap)) {
    if (categoryLower.includes(key)) {
      category = cat;
      break;
    }
  }
  
  // Extract tag strings
  const tagStrings: string[] = [];
  if (event.tags) {
    for (const tag of event.tags) {
      if (typeof tag === "string") {
        tagStrings.push(tag.toLowerCase());
      } else if (tag.label) {
        tagStrings.push(tag.label.toLowerCase());
      } else if (tag.slug) {
        tagStrings.push(tag.slug.toLowerCase());
      }
    }
  }
  
  // Also check tags for category hints
  if (category === "general") {
    for (const tag of tagStrings) {
      for (const [key, cat] of Object.entries(categoryMap)) {
        if (tag.includes(key)) {
          category = cat;
          break;
        }
      }
      if (category !== "general") break;
    }
  }

  return {
    id: `pm-${event.id}`,
    venue: "polymarket",
    question: event.title || event.slug || "Unknown Market",
    description: event.description,
    category,
    tags: tagStrings,
    yesPrice: Math.max(0.01, Math.min(0.99, yesPrice)),
    noPrice: Math.max(0.01, Math.min(0.99, noPrice)),
    volume24h,
    totalVolume,
    liquidity: event.liquidity || 0,
    createdAt: event.startDate ? new Date(event.startDate).getTime() : Date.now(),
    resolutionDate: event.endDate ? new Date(event.endDate).getTime() : Date.now() + 90 * 24 * 60 * 60 * 1000,
    isActive: event.active !== false && !event.closed,
    isResolved: event.closed || false,
    imageUrl: event.image,
    sourceUrl: `https://polymarket.com/event/${event.slug}`,
  };
}

// =============================================================================
// Kalshi API (Direct API calls to Kalshi Trading API)
// =============================================================================

interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle?: string;
  open_time?: string;
  close_time?: string;
  expiration_time?: string;
  status?: string;
  yes_bid?: number;
  yes_ask?: number;
  no_bid?: number;
  no_ask?: number;
  last_price?: number;
  volume?: number;
  volume_24h?: number;
  open_interest?: number;
  category?: string;
  series_ticker?: string;
  // Additional fields for URL generation
  event_title?: string;
  series_title?: string;
  event_slug?: string;
}

async function fetchKalshiMarkets(params: {
  limit?: number;
  cursor?: string;
  status?: string;
  series_ticker?: string;
}): Promise<KalshiMarket[]> {
  const url = new URL(`${KALSHI_API_BASE}/markets`);
  
  if (params.limit) url.searchParams.set("limit", String(Math.min(params.limit, 200)));
  if (params.cursor) url.searchParams.set("cursor", params.cursor);
  // Note: Kalshi API doesn't accept status filter, we filter client-side instead
  if (params.series_ticker) url.searchParams.set("series_ticker", params.series_ticker);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url.toString(), {
      headers: { 
        "Accept": "application/json",
      },
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[Kalshi] API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    let markets = data.markets || data.data || [];
    
    // Filter by status client-side if requested
    if (params.status) {
      markets = markets.filter((m: KalshiMarket) => m.status === params.status);
    }
    
    return markets;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[Kalshi] Request timed out after 10s");
    } else {
      console.error("[Kalshi] Fetch error:", error);
    }
    return [];
  }
}

async function fetchKalshiEvents(): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${KALSHI_API_BASE}/events?limit=100`, {
      headers: { 
        "Accept": "application/json",
      },
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const data = await response.json();
    return data.events || data.data || [];
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[Kalshi] Events request timed out");
    } else {
      console.error("[Kalshi] Events fetch error:", error);
    }
    return [];
  }
}

/**
 * Generate URL-friendly slug from text
 */
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

/**
 * Generate correct Kalshi market URL
 * Format: https://kalshi.com/markets/{series_ticker_lowercase}/{slug}/{market_ticker}
 */
function getKalshiMarketUrl(market: KalshiMarket): string {
  const seriesTicker = (market.series_ticker || '').toLowerCase();
  const marketTicker = market.ticker || '';
  const eventTitle = market.event_title || market.title || market.subtitle || market.series_title || '';
  const slug = market.event_slug || generateSlug(eventTitle) || 'market';
  
  if (seriesTicker && marketTicker) {
    return `https://kalshi.com/markets/${encodeURIComponent(seriesTicker)}/${encodeURIComponent(slug)}/${encodeURIComponent(marketTicker)}`;
  }
  
  // Fallback: extract series from ticker prefix
  if (marketTicker) {
    const tickerMatch = marketTicker.match(/^([A-Z]+)/);
    if (tickerMatch) {
      const extractedSeries = tickerMatch[1].toLowerCase();
      return `https://kalshi.com/markets/${encodeURIComponent(extractedSeries)}/${encodeURIComponent(slug)}/${encodeURIComponent(marketTicker)}`;
    }
  }
  
  return `https://kalshi.com/markets/${marketTicker || 'browse'}`;
}

function normalizeKalshiMarket(market: KalshiMarket): ParlayMarket {
  // Calculate prices from bid/ask
  let yesPrice = 0.5;
  let noPrice = 0.5;
  
  if (market.yes_bid !== undefined && market.yes_ask !== undefined) {
    yesPrice = (market.yes_bid + market.yes_ask) / 2 / 100;
  } else if (market.last_price !== undefined) {
    yesPrice = market.last_price / 100;
  }
  noPrice = 1 - yesPrice;

  // Determine category
  let category = market.category?.toLowerCase() || "general";
  const categoryNormalize: Record<string, string> = {
    financials: "economics",
    financial: "economics",
    fed: "economics",
    politics: "politics",
    election: "politics",
    climate: "science",
    weather: "science",
    sports: "sports",
    entertainment: "culture",
    tech: "tech",
    crypto: "crypto",
  };
  
  for (const [key, cat] of Object.entries(categoryNormalize)) {
    if (category.includes(key) || market.series_ticker?.toLowerCase().includes(key)) {
      category = cat;
      break;
    }
  }

  return {
    id: `ks-${market.ticker}`,
    venue: "kalshi",
    question: market.title || market.subtitle || market.ticker,
    description: market.subtitle,
    category,
    tags: [market.series_ticker, market.category].filter(Boolean).map(t => t!.toLowerCase()),
    yesPrice: Math.max(0.01, Math.min(0.99, yesPrice)),
    noPrice: Math.max(0.01, Math.min(0.99, noPrice)),
    volume24h: market.volume_24h || market.volume || 0,
    totalVolume: market.volume || 0,
    liquidity: market.open_interest || 0,
    createdAt: market.open_time ? new Date(market.open_time).getTime() : Date.now(),
    resolutionDate: market.expiration_time 
      ? new Date(market.expiration_time).getTime() 
      : market.close_time 
        ? new Date(market.close_time).getTime()
        : Date.now() + 30 * 24 * 60 * 60 * 1000,
    isActive: market.status === "active" || market.status === "open",
    isResolved: market.status === "settled" || market.status === "closed",
    sourceUrl: getKalshiMarketUrl(market),
  };
}

// =============================================================================
// Combined Market Service
// =============================================================================

/**
 * Fetch all markets from both venues
 */
export async function fetchAllMarkets(params: MarketSearchParams = {}): Promise<MarketSearchResult> {
  const {
    venue = "all",
    limit = 50,
    offset = 0,
    includeResolved = false,
  } = params;

  const cacheKey = `markets:${venue}:${limit}:${offset}:${includeResolved}`;
  const cached = getCached<MarketSearchResult>(cacheKey);
  if (cached) return cached;

  const results: ParlayMarket[] = [];
  let polymarketCount = 0;
  let kalshiCount = 0;

  // Fetch from Polymarket
  if (venue === "all" || venue === "polymarket") {
    try {
      const pmEvents = await fetchPolymarketEvents({
        limit: Math.min(limit, 100),
        offset,
        active: !includeResolved,
        closed: includeResolved,
        order: "volume",
      });
      
      const normalized = pmEvents
        .filter(e => !e.closed || includeResolved)
        .map(normalizePolymarketEvent);
      results.push(...normalized);
      polymarketCount = normalized.length;
    } catch (error) {
      console.error("[Polymarket] Fetch all error:", error);
    }
  }

  // Fetch from Kalshi
  if (venue === "all" || venue === "kalshi") {
    try {
      const ksMarkets = await fetchKalshiMarkets({
        limit: Math.min(limit, 100),
        status: includeResolved ? undefined : "active",
      });
      
      const normalized = ksMarkets.map(normalizeKalshiMarket);
      results.push(...normalized);
      kalshiCount = normalized.length;
    } catch (error) {
      console.error("[Kalshi] Fetch all error:", error);
    }
  }

  // Extract categories
  const categorySet = new Set(results.map(m => m.category));
  const categories = Array.from(categorySet).sort();

  const result: MarketSearchResult = {
    markets: results.slice(0, limit),
    total: results.length,
    hasMore: results.length > limit,
    categories,
    venues: { polymarket: polymarketCount, kalshi: kalshiCount },
  };

  setCache(cacheKey, result, 60000); // Cache for 1 minute
  return result;
}

/**
 * Filter markets by days until resolution
 */
function filterByDays(markets: ParlayMarket[], minDays?: number, maxDays?: number): ParlayMarket[] {
  if (minDays === undefined && maxDays === undefined) {
    return markets;
  }

  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;

  return markets.filter(market => {
    const daysUntilResolution = (market.resolutionDate - now) / msPerDay;
    
    // Market already ended
    if (daysUntilResolution < 0) return false;
    
    // Check min days
    if (minDays !== undefined && daysUntilResolution < minDays) {
      return false;
    }
    
    // Check max days
    if (maxDays !== undefined && daysUntilResolution > maxDays) {
      return false;
    }
    
    return true;
  });
}

/**
 * Search markets across both venues
 */
export async function searchMarkets(params: MarketSearchParams): Promise<MarketSearchResult> {
  const {
    query = "",
    venue = "all",
    category,
    sortBy = "volume",
    limit = 50,
    offset = 0,
    minDays,
    maxDays,
  } = params;

  // If no query, just fetch all with filters
  if (!query.trim()) {
    const all = await fetchAllMarkets({ venue, limit: 200 });
    let filtered = all.markets;

    // Filter by category
    if (category) {
      filtered = filtered.filter(m => m.category === category);
    }

    // Filter by days until close
    filtered = filterByDays(filtered, minDays, maxDays);

    // Sort
    filtered = sortMarkets(filtered, sortBy);

    return {
      markets: filtered.slice(offset, offset + limit),
      total: filtered.length,
      hasMore: filtered.length > offset + limit,
      categories: all.categories,
      venues: all.venues,
    };
  }

  const cacheKey = `search:${query}:${venue}:${category}:${sortBy}:${limit}:${offset}:${minDays}:${maxDays}`;
  const cached = getCached<MarketSearchResult>(cacheKey);
  if (cached) return cached;

  const results: ParlayMarket[] = [];
  const lowerQuery = query.toLowerCase();

  // Search Polymarket
  if (venue === "all" || venue === "polymarket") {
    try {
      const pmResults = await searchPolymarketEvents(query);
      results.push(...pmResults.map(normalizePolymarketEvent));
    } catch (error) {
      console.error("[Polymarket] Search error:", error);
    }
  }

  // Search Kalshi (fetch all and filter since search endpoint may not exist)
  if (venue === "all" || venue === "kalshi") {
    try {
      const ksMarkets = await fetchKalshiMarkets({ limit: 200 });
      const filtered = ksMarkets.filter(m =>
        m.title?.toLowerCase().includes(lowerQuery) ||
        m.subtitle?.toLowerCase().includes(lowerQuery) ||
        m.ticker?.toLowerCase().includes(lowerQuery) ||
        m.series_ticker?.toLowerCase().includes(lowerQuery)
      );
      results.push(...filtered.map(normalizeKalshiMarket));
    } catch (error) {
      console.error("[Kalshi] Search error:", error);
    }
  }

  // Filter by category
  let filtered = results;
  if (category) {
    filtered = filtered.filter(m => m.category === category);
  }

  // Filter by days until close
  filtered = filterByDays(filtered, minDays, maxDays);

  // Sort
  filtered = sortMarkets(filtered, sortBy);

  // Extract categories
  const categorySet = new Set(results.map(m => m.category));

  const result: MarketSearchResult = {
    markets: filtered.slice(offset, offset + limit),
    total: filtered.length,
    hasMore: filtered.length > offset + limit,
    categories: Array.from(categorySet).sort(),
    venues: {
      polymarket: results.filter(m => m.venue === "polymarket").length,
      kalshi: results.filter(m => m.venue === "kalshi").length,
    },
  };

  setCache(cacheKey, result, 30000); // Cache for 30 seconds
  return result;
}

/**
 * Get trending markets
 */
export async function getTrendingMarkets(limit: number = 10): Promise<TrendingMarket[]> {
  const cacheKey = `trending:${limit}`;
  const cached = getCached<TrendingMarket[]>(cacheKey);
  if (cached) return cached;

  const all = await fetchAllMarkets({ limit: 100 });
  
  // Calculate trend score based on volume and activity
  const trending = all.markets
    .filter(m => m.isActive && m.volume24h > 0)
    .map(m => ({
      ...m,
      trendScore: calculateTrendScore(m),
      volumeChange24h: 0, // Would need historical data
      priceChange24h: 0,
    }))
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, limit);

  setCache(cacheKey, trending, 120000); // Cache for 2 minutes
  return trending;
}

/**
 * Get markets by category
 */
export async function getMarketsByCategory(category: string, limit: number = 20): Promise<ParlayMarket[]> {
  const all = await fetchAllMarkets({ limit: 200 });
  return all.markets
    .filter(m => m.category === category && m.isActive)
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, limit);
}

/**
 * Get markets closing soon
 */
export async function getClosingSoonMarkets(days: number = 7, limit: number = 10): Promise<ParlayMarket[]> {
  const all = await fetchAllMarkets({ limit: 200 });
  const now = Date.now();
  const cutoff = now + days * 24 * 60 * 60 * 1000;
  
  return all.markets
    .filter(m => m.isActive && m.resolutionDate > now && m.resolutionDate <= cutoff)
    .sort((a, b) => a.resolutionDate - b.resolutionDate)
    .slice(0, limit);
}

/**
 * Get single market details
 */
export async function getMarketDetails(marketId: string): Promise<ParlayMarket | null> {
  const [prefix, id] = marketId.split("-", 2);
  
  if (prefix === "pm") {
    // Polymarket - fetch event by slug or ID
    try {
      const response = await fetch(`${POLYMARKET_GAMMA_API}/events/${id}`, {
        headers: { 
          "Accept": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        return normalizePolymarketEvent(data);
      }
    } catch (error) {
      console.error("[Market Details] Polymarket error:", error);
    }
  } else if (prefix === "ks") {
    // Kalshi - fetch market by ticker
    try {
      const response = await fetch(`${KALSHI_API_BASE}/markets/${id}`, {
        headers: { 
          "Accept": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        const market = data.market || data;
        return normalizeKalshiMarket(market);
      }
    } catch (error) {
      console.error("[Market Details] Kalshi error:", error);
    }
  }
  
  return null;
}

// =============================================================================
// Helper Functions
// =============================================================================

function sortMarkets(markets: ParlayMarket[], sortBy: string): ParlayMarket[] {
  switch (sortBy) {
    case "volume":
      return [...markets].sort((a, b) => b.volume24h - a.volume24h);
    case "newest":
      return [...markets].sort((a, b) => b.createdAt - a.createdAt);
    case "closing":
      return [...markets].sort((a, b) => a.resolutionDate - b.resolutionDate);
    case "trending":
      return [...markets].sort((a, b) => calculateTrendScore(b) - calculateTrendScore(a));
    default:
      return markets;
  }
}

function calculateTrendScore(market: ParlayMarket): number {
  // Score based on multiple factors
  let score = 0;
  
  // Volume weight (log scale)
  score += Math.log10(Math.max(1, market.volume24h)) * 10;
  
  // Liquidity bonus
  score += Math.log10(Math.max(1, market.liquidity)) * 5;
  
  // Active market bonus
  if (market.isActive) score += 20;
  
  // Closing soon bonus (markets closing within 30 days get boost)
  const daysUntilClose = (market.resolutionDate - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntilClose > 0 && daysUntilClose < 30) {
    score += (30 - daysUntilClose) * 0.5;
  }
  
  // Competitive odds bonus (closer to 50/50 = more interesting)
  const competitiveness = 1 - Math.abs(market.yesPrice - 0.5) * 2;
  score += competitiveness * 15;
  
  return score;
}

// =============================================================================
// Category Definitions
// =============================================================================

export const MARKET_CATEGORIES = [
  { id: "politics", name: "Politics", icon: "🗳️", description: "Elections, policy, government" },
  { id: "crypto", name: "Crypto", icon: "₿", description: "Bitcoin, Ethereum, DeFi" },
  { id: "economics", name: "Economics", icon: "📊", description: "Fed, GDP, inflation, markets" },
  { id: "sports", name: "Sports", icon: "⚽", description: "NFL, NBA, MLB, Soccer" },
  { id: "tech", name: "Tech", icon: "💻", description: "AI, companies, products" },
  { id: "culture", name: "Culture", icon: "🎬", description: "Entertainment, media, trends" },
  { id: "science", name: "Science", icon: "🔬", description: "Climate, space, research" },
  { id: "general", name: "General", icon: "🌍", description: "World events, misc" },
];

export function getCategoryInfo(categoryId: string) {
  return MARKET_CATEGORIES.find(c => c.id === categoryId) || MARKET_CATEGORIES[MARKET_CATEGORIES.length - 1];
}
