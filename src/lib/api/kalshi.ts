import config from "@/lib/config";
import type {
  KalshiMarket,
  KalshiEvent,
  KalshiSeries,
  KalshiOrderbook,
  KalshiTrade,
  KalshiApiResponse,
} from "@/types/kalshi";

const KALSHI_BASE_PATH = "/kalshi"; // proxied through relayer

function buildQuery(params: Record<string, any>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
  });
  return usp.toString();
}

export async function getMarkets(
  options: {
    limit?: number;
    cursor?: string;
    event_ticker?: string;
    series_ticker?: string;
    status?: string;
    tickers?: string;
  } = {}
): Promise<KalshiApiResponse<KalshiMarket>> {
  const qs = buildQuery(options);
  const url = `${config.RELAYER_URL}${KALSHI_BASE_PATH}/markets${
    qs ? `?${qs}` : ""
  }`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Kalshi markets failed: ${res.status} - ${errorText}`);
    }
    const json = await res.json();
    
    // Handle different response structures:
    // 1. Wrapped: { success: true, data: { markets: [...] } }
    // 2. Direct: { markets: [...] }
    // 3. Direct array: [...]
    let data: any;
    if (json.success !== undefined) {
      data = json.data;
    } else {
      data = json;
    }
    
    // If data is an array, wrap it in markets property
    if (Array.isArray(data)) {
      return { markets: data, cursor: undefined };
    }
    
    // Ensure markets property exists
    if (!data.markets && data.market) {
      // Single market response
      return { market: data.market, cursor: undefined };
    }
    
    // Return with markets array (default to empty if missing)
    return {
      markets: data.markets || [],
      cursor: data.cursor,
    } as KalshiApiResponse<KalshiMarket>;
  } catch (e: any) {
    console.error("Kalshi getMarkets error:", e);
    return { markets: [], cursor: undefined };
  }
}

export async function getMarket(
  ticker: string
): Promise<KalshiApiResponse<KalshiMarket>> {
  const url = `${
    config.RELAYER_URL
  }${KALSHI_BASE_PATH}/markets/${encodeURIComponent(ticker)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Kalshi market failed: ${res.status}`);
    const json = await res.json();
    // Handle both wrapped ({ success, data }) and direct responses
    const data = json.success !== undefined ? json.data : json;
    return data as KalshiApiResponse<KalshiMarket>;
  } catch (e: any) {
    console.error("Kalshi getMarket error:", e);
    return { market: undefined };
  }
}

export async function getMarketOrderbook(
  ticker: string,
  depth?: number
): Promise<KalshiApiResponse<KalshiOrderbook>> {
  const qs = buildQuery({ depth });
  const url = `${
    config.RELAYER_URL
  }${KALSHI_BASE_PATH}/markets/${encodeURIComponent(ticker)}/orderbook${
    qs ? `?${qs}` : ""
  }`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Kalshi orderbook failed: ${res.status}`);
    const json = await res.json();
    // Handle both wrapped ({ success, data }) and direct responses
    const data = json.success !== undefined ? json.data : json;
    return data as KalshiApiResponse<KalshiOrderbook>;
  } catch (e: any) {
    console.error("Kalshi getMarketOrderbook error:", e);
    return { orderbook: { yes_dollars: [], no_dollars: [] } };
  }
}

export async function getMarketTrades(
  options: {
    limit?: number;
    cursor?: string;
    ticker?: string;
    min_ts?: number;
    max_ts?: number;
  } = {}
): Promise<KalshiApiResponse<KalshiTrade>> {
  const qs = buildQuery(options);
  const url = `${config.RELAYER_URL}${KALSHI_BASE_PATH}/trades${
    qs ? `?${qs}` : ""
  }`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Kalshi trades failed: ${res.status}`);
    const json = await res.json();
    // Handle both wrapped ({ success, data }) and direct responses
    const data = json.success !== undefined ? json.data : json;
    return data as KalshiApiResponse<KalshiTrade>;
  } catch (e: any) {
    console.error("Kalshi getMarketTrades error:", e);
    return { trades: [], cursor: undefined };
  }
}

export async function getEvents(
  options: {
    limit?: number;
    cursor?: string;
    status?: string;
    series_ticker?: string;
    with_nested_markets?: boolean;
  } = {}
): Promise<KalshiApiResponse<KalshiEvent>> {
  const qs = buildQuery(options);
  const url = `${config.RELAYER_URL}${KALSHI_BASE_PATH}/events${
    qs ? `?${qs}` : ""
  }`;
  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error(`Kalshi events failed: ${res.status}`);
    const json = await res.json();
    // Handle both wrapped ({ success, data }) and direct responses
    const data = json.success !== undefined ? json.data : json;
    return data as KalshiApiResponse<KalshiEvent>;
  } catch (e: any) {
    console.error("Kalshi getEvents error:", e);
    return { events: [], cursor: undefined };
  }
}

export async function getEvent(
  eventTicker: string
): Promise<KalshiApiResponse<KalshiEvent>> {
  const url = `${
    config.RELAYER_URL
  }${KALSHI_BASE_PATH}/events/${encodeURIComponent(eventTicker)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error(`Kalshi event failed: ${res.status}`);
    const json = await res.json();
    // Handle both wrapped ({ success, data }) and direct responses
    const data = json.success !== undefined ? json.data : json;
    return data as KalshiApiResponse<KalshiEvent>;
  } catch (e: any) {
    console.error("Kalshi getEvent error:", e);
    return { event: undefined };
  }
}

export async function getSeries(
  seriesTicker: string
): Promise<KalshiApiResponse<KalshiSeries>> {
  const url = `${
    config.RELAYER_URL
  }${KALSHI_BASE_PATH}/series/${encodeURIComponent(seriesTicker)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error(`Kalshi series failed: ${res.status}`);
    const json = await res.json();
    // Handle both wrapped ({ success, data }) and direct responses
    const data = json.success !== undefined ? json.data : json;
    return data as KalshiApiResponse<KalshiSeries>;
  } catch (e: any) {
    console.error("Kalshi getSeries error:", e);
    return { series: undefined };
  }
}
