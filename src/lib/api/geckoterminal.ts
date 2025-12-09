/**
 * GeckoTerminal API Client
 *
 * Provides integration with GeckoTerminal for DEX pair data.
 * Uses internal API routes for server-side caching.
 * Implements Next.js 15 caching strategies for optimal performance.
 */

import type {
  GeckoTerminalPair,
  GeckoTerminalNetwork,
  GeckoTerminalDex,
} from "@/types/api";

/**
 * Search for token pairs on GeckoTerminal
 * Returns up to 5 matching pairs across multiple DEXes
 *
 * @param query - Token symbol or address to search
 * @returns Search results with token pairs
 */
export async function searchPairs(
  query: string
): Promise<{ pairs: GeckoTerminalPair[]; success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `/api/gecko/search?q=${encodeURIComponent(query)}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`GeckoTerminal API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse nested response structure (data.data.attributes.pairs)
    let pairs: GeckoTerminalPair[] = [];
    if (data.data && Array.isArray(data.data)) {
      pairs = data.data;
    } else if (data.pairs && Array.isArray(data.pairs)) {
      pairs = data.pairs;
    }

    // Return up to 5 results
    return {
      pairs: pairs.slice(0, 5),
      success: true,
    };
  } catch (error) {
    return {
      pairs: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get list of supported networks on GeckoTerminal
 * Returns network information including IDs and platform mappings
 *
 * @returns List of supported networks
 */
export async function getNetworks(): Promise<{
  networks: GeckoTerminalNetwork[];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/gecko/networks`, {
      next: { revalidate: 3600 }, // Cache for 1 hour (networks rarely change)
    });

    if (!response.ok) {
      throw new Error(`GeckoTerminal API error: ${response.statusText}`);
    }

    const data = await response.json();
    const networks: GeckoTerminalNetwork[] = data.data || data.networks || [];

    return {
      networks,
      success: true,
    };
  } catch (error) {
    return {
      networks: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get list of DEXes for a specific network
 * Returns DEX information for the specified network
 *
 * @param network - Network ID (e.g., 'eth', 'bsc', 'polygon')
 * @returns List of DEXes on the network
 */
export async function getDexes(network: string): Promise<{
  dexes: GeckoTerminalDex[];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/gecko/networks/${network}/dexes`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`GeckoTerminal API error: ${response.statusText}`);
    }

    const data = await response.json();
    const dexes: GeckoTerminalDex[] = data.data || data.dexes || [];

    return {
      dexes,
      success: true,
    };
  } catch (error) {
    return {
      dexes: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
