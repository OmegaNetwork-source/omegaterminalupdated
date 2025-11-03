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
    if (!res.ok) throw new Error(`Kalshi markets failed: ${res.status}`);
    return (await res.json()) as KalshiApiResponse<KalshiMarket>;
  } catch (e: any) {
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
    return (await res.json()) as KalshiApiResponse<KalshiMarket>;
  } catch (_) {
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
    return (await res.json()) as KalshiApiResponse<KalshiOrderbook>;
  } catch (_) {
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
    return (await res.json()) as KalshiApiResponse<KalshiTrade>;
  } catch (_) {
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
    return (await res.json()) as KalshiApiResponse<KalshiEvent>;
  } catch (_) {
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
    return (await res.json()) as KalshiApiResponse<KalshiEvent>;
  } catch (_) {
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
    return (await res.json()) as KalshiApiResponse<KalshiSeries>;
  } catch (_) {
    return { series: undefined };
  }
}
