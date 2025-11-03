/**
 * DeFi Llama API Client
 *
 * Provides integration with DeFi Llama for TVL and protocol data.
 * Uses internal API routes to leverage Next.js server-side caching.
 * DeFi Llama API is public and doesn't require API keys.
 */

import type {
  DeFiLlamaProtocol,
  DeFiLlamaChain,
  DeFiLlamaTokenPrice,
} from "@/types/api";

/**
 * Get total DeFi TVL across all chains
 * Returns aggregate TVL and chain count
 *
 * @returns Total TVL and chain count
 */
export async function getTotalTVL(): Promise<{
  tvl: number;
  chainCount: number;
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch("/api/defillama/tvl", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      tvl: data.tvl,
      chainCount: data.chainCount,
      success: true,
    };
  } catch (error) {
    return {
      tvl: 0,
      chainCount: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get TVL data for a specific protocol
 * Returns detailed protocol information including chain breakdowns
 *
 * @param protocolSlug - Protocol slug (e.g., 'uniswap', 'aave')
 * @returns Protocol TVL data
 */
export async function getProtocolTVL(protocolSlug: string): Promise<{
  protocol: DeFiLlamaProtocol | null;
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/defillama/protocol/${protocolSlug}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      protocol: data.protocol,
      success: true,
    };
  } catch (error) {
    return {
      protocol: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get top protocols by TVL
 * Returns sorted list of protocols
 *
 * @param limit - Number of protocols to return (default: 10)
 * @returns Top protocols by TVL
 */
export async function getTopProtocols(limit: number = 10): Promise<{
  protocols: DeFiLlamaProtocol[];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/defillama/protocols?limit=${limit}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      protocols: data.protocols,
      success: true,
    };
  } catch (error) {
    return {
      protocols: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get chain TVL rankings
 * Returns sorted list of chains by TVL
 *
 * @param limit - Number of chains to return (default: 15)
 * @returns Top chains by TVL
 */
export async function getChainTVLs(limit: number = 15): Promise<{
  chains: DeFiLlamaChain[];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/defillama/chains?limit=${limit}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      chains: data.chains,
      success: true,
    };
  } catch (error) {
    return {
      chains: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get current price for a token
 * Uses token mappings to convert symbols to CoinGecko IDs
 *
 * @param tokenSymbol - Token symbol (e.g., 'eth', 'btc')
 * @returns Token price data
 */
export async function getTokenPrice(tokenSymbol: string): Promise<{
  price: DeFiLlamaTokenPrice | null;
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/defillama/price/${tokenSymbol}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      price: data.price,
      success: true,
    };
  } catch (error) {
    return {
      price: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get prices for multiple tokens
 * Batch price lookup for efficiency
 *
 * @param tokenSymbols - Array of token symbols
 * @returns Price map keyed by original symbol
 */
export async function getMultipleTokenPrices(tokenSymbols: string[]): Promise<{
  prices: Record<string, DeFiLlamaTokenPrice>;
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(
      `/api/defillama/prices?tokens=${tokenSymbols.join(",")}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      prices: data.prices,
      success: true,
    };
  } catch (error) {
    return {
      prices: {},
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get trending protocols (top gainers by 24h TVL change)
 * Returns protocols with highest positive TVL changes
 *
 * @returns Trending protocols
 */
export async function getTrendingProtocols(): Promise<{
  protocols: DeFiLlamaProtocol[];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch("/api/defillama/trending", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      protocols: data.protocols,
      success: true,
    };
  } catch (error) {
    return {
      protocols: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
