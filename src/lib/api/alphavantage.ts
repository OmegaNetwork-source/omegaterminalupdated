/**
 * Alpha Vantage API Client
 *
 * Provides integration with Alpha Vantage for stock market data.
 * Uses internal API routes for server-side caching and to protect API keys.
 * Implements aggressive caching to minimize API usage (rate limits: 5 req/min, 500/day).
 */

import type { AlphaVantageQuote, AlphaVantageTimeSeries } from "@/types/api";

/**
 * Get real-time stock quote
 * Returns current price, change, and OHLC data
 *
 * @param symbol - Stock symbol (e.g., 'AAPL', 'GOOGL')
 * @returns Stock quote data
 */
export async function getStockQuote(symbol: string): Promise<{
  quote: AlphaVantageQuote | null;
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/stock/quote/${symbol}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle both formats (data.price or data['Global Quote'])
    let quote: AlphaVantageQuote | null = null;

    if (data["Global Quote"]) {
      const gq = data["Global Quote"];
      quote = {
        symbol: gq["01. symbol"] || symbol,
        price: gq["05. price"] || "0",
        change: gq["09. change"] || "0",
        changePercent: gq["10. change percent"]?.replace("%", "") || "0",
        open: gq["02. open"] || "0",
        high: gq["03. high"] || "0",
        low: gq["04. low"] || "0",
        previousClose: gq["08. previous close"] || "0",
        latestTradingDay: gq["07. latest trading day"] || "",
      };
    } else if (data.price) {
      quote = {
        symbol: data.symbol || symbol,
        price: data.price || "0",
        change: data.change || "0",
        changePercent: data.changePercent || "0",
        open: data.open || "0",
        high: data.high || "0",
        low: data.low || "0",
        previousClose: data.previousClose || "0",
        latestTradingDay: data.latestTradingDay || "",
      };
    }

    return {
      quote,
      success: true,
    };
  } catch (error) {
    return {
      quote: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get daily time series data for a stock
 * Returns historical OHLC data
 *
 * @param symbol - Stock symbol
 * @returns Daily time series data
 */
export async function getDailyData(symbol: string): Promise<{
  timeSeries: AlphaVantageTimeSeries | null;
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/stock/daily/${symbol}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse 'Time Series (Daily)' object
    const timeSeries = data["Time Series (Daily)"] || null;

    return {
      timeSeries,
      success: true,
    };
  } catch (error) {
    return {
      timeSeries: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get company overview
 * Returns comprehensive company information including fundamentals
 *
 * @param symbol - Stock symbol
 * @returns Company overview data
 */
export async function getCompanyOverview(symbol: string): Promise<{
  overview: any | null;
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/stock/overview/${symbol}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour (company data rarely changes)
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const overview = await response.json();

    return {
      overview,
      success: true,
    };
  } catch (error) {
    return {
      overview: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get macroeconomic data
 * Returns inflation, CPI, or GDP data
 *
 * @param indicator - Economic indicator ('inflation', 'cpi', 'gdp')
 * @returns Macroeconomic data points
 */
export async function getMacroData(
  indicator: "inflation" | "cpi" | "gdp"
): Promise<{ data: any[] | null; success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/stock/${indicator}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours (macro data updates infrequently)
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Parse data array
    const data = result.data || [];

    return {
      data,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
