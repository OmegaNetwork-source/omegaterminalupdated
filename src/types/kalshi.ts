/**
 * Kalshi prediction markets type definitions
 */

/** Market object returned from Kalshi */
export interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle?: string;
  event_ticker: string;
  series_ticker: string;
  market_type: string;
  status: string;
  yes_bid_dollars?: string;
  yes_ask_dollars?: string;
  no_bid_dollars?: string;
  no_ask_dollars?: string;
  last_price_dollars?: string;
  volume?: number;
  volume_24h?: number;
  open_interest?: number;
  liquidity_dollars?: string;
  open_time: string;
  close_time: string;
  expiration_time: string;
}

/** Event object aggregating markets */
export interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  title: string;
  mutually_exclusive: boolean;
  collateral_return_type: string;
  markets?: KalshiMarket[];
}

/** Series object */
export interface KalshiSeries {
  ticker: string;
  title: string;
  category: string;
  frequency: string;
  fee_type: string;
  fee_multiplier?: number;
  tags?: string[];
  settlement_sources?: Array<{
    name: string;
    url: string;
  }>;
}

/** Orderbook depth representation */
export interface KalshiOrderbook {
  yes_dollars: Array<[number, number]>;
  no_dollars: Array<[number, number]>;
}

/** Trade print */
export interface KalshiTrade {
  ticker: string;
  taker_side: "yes" | "no";
  count: number;
  yes_price_fixed?: string;
  created_time: string;
}

/** Generic Kalshi API response envelope */
export interface KalshiApiResponse<T> {
  markets?: T[];
  market?: T;
  events?: T[];
  event?: T;
  series?: T;
  orderbook?: KalshiOrderbook;
  trades?: KalshiTrade[];
  cursor?: string;
}

export {};
