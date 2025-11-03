/**
 * API Integration Type Definitions
 *
 * Type definitions for external API responses and analytics data.
 * Used across DexScreener, GeckoTerminal, Alpha Vantage, DeFi Llama, and PGT integrations.
 */

/**
 * DexScreener token pair data
 * Used for token search and analytics on DexScreener
 */
export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  priceNative: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  pairCreatedAt?: number;
}

/**
 * GeckoTerminal pair data
 * Used for DEX pair search on GeckoTerminal
 */
export interface GeckoTerminalPair {
  id: string;
  type: string;
  attributes: {
    name: string;
    base_token_price_usd: string;
    quote_token_price_usd: string;
    price_change_percentage: {
      h24: string;
    };
    volume_usd: {
      h24: string;
    };
    network_id: string;
    dex_id: string;
  };
}

/**
 * GeckoTerminal network data
 * Used for listing supported networks
 */
export interface GeckoTerminalNetwork {
  id: string;
  type: string;
  attributes: {
    name: string;
    coingecko_asset_platform_id?: string;
  };
}

/**
 * GeckoTerminal DEX data
 * Used for listing DEXes on a network
 */
export interface GeckoTerminalDex {
  id: string;
  type: string;
  attributes: {
    name: string;
  };
}

/**
 * Alpha Vantage stock quote data
 * Used for real-time stock quotes
 */
export interface AlphaVantageQuote {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  open: string;
  high: string;
  low: string;
  previousClose: string;
  latestTradingDay: string;
}

/**
 * Alpha Vantage time series data
 * Used for historical stock data
 * Maps date strings to OHLC data
 */
export interface AlphaVantageTimeSeries {
  [date: string]: {
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  };
}

/**
 * DeFi Llama protocol data
 * Used for protocol TVL and analytics
 */
export interface DeFiLlamaProtocol {
  id: string;
  name: string;
  symbol: string;
  slug?: string;
  logo?: string;
  url: string;
  description?: string;
  chain: string;
  chains: string[];
  category: string;
  tvl: number;
  chainTvls?: Record<string, number>;
  change_1d?: number;
  change_7d?: number;
  change_1m?: number;
  mcap?: number;
}

/**
 * DeFi Llama chain data
 * Used for chain TVL rankings
 */
export interface DeFiLlamaChain {
  name: string;
  tokenSymbol?: string;
  tvl: number;
  change_1d?: number;
  change_7d?: number;
}

/**
 * DeFi Llama token price data
 * Used for token price lookups
 */
export interface DeFiLlamaTokenPrice {
  symbol: string;
  price: number;
  timestamp: number;
  confidence: number;
}

/**
 * PGT wallet data
 * Used for individual wallet tracking
 */
export interface PGTWallet {
  address: string;
  network: string;
  label?: string;
  totalValue: number;
  change24hPercent?: number;
  tokens: Array<{
    symbol: string;
    balance: number;
    value: number;
  }>;
}

/**
 * PGT portfolio data
 * Used for multi-wallet portfolio overview
 */
export interface PGTPortfolio {
  totalValue: number;
  walletCount: number;
  totalChange24hPercent?: number;
  wallets: PGTWallet[];
}
