/**
 * OpenSea API Client
 *
 * Handles OpenSea API v2 integration for NFT marketplace data.
 * Requires API key (free tier available at https://docs.opensea.io/reference/api-keys).
 * API key stored in browser localStorage for security.
 *
 * Note: Trading functionality (buy/bid/sell) requires OpenSea SDK integration
 * and is deferred to Phase 15.
 */

import { OpenSeaNFT, OpenSeaCollection, OpenSeaStats } from "@/types/nft";

const OPENSEA_CONFIG = {
  BASE_URL: "https://api.opensea.io/api/v2",
  V1_URL: "https://api.opensea.io/api/v1",
  CHAIN: "ethereum",
};

// Popular collections database for search (matches opensea-enhanced-plugin.js)
const POPULAR_COLLECTIONS = [
  {
    slug: "boredapeyachtclub",
    name: "Bored Ape Yacht Club",
    description: "Iconic NFT collection of unique ape avatars",
  },
  {
    slug: "mutant-ape-yacht-club",
    name: "Mutant Ape Yacht Club",
    description: "Mutant variants of the BAYC",
  },
  {
    slug: "azuki",
    name: "Azuki",
    description: "Anime-inspired avatar collection",
  },
  {
    slug: "clonex",
    name: "Clone X",
    description: "Next-gen avatars created by RTFKT and Takashi Murakami",
  },
  {
    slug: "cryptopunks",
    name: "CryptoPunks",
    description: "The original NFT collection on Ethereum",
  },
  {
    slug: "doodles-official",
    name: "Doodles",
    description: "Colorful characters by Burnt Toast",
  },
  {
    slug: "pudgypenguins",
    name: "Pudgy Penguins",
    description: "Collection of adorable penguin NFTs",
  },
  {
    slug: "proof-moonbirds",
    name: "Moonbirds",
    description: "Collection of 10,000 utility-enabled PFPs",
  },
  {
    slug: "otherdeed",
    name: "Otherdeed for Otherside",
    description: "Land plots for the Otherside metaverse",
  },
  {
    slug: "meebits",
    name: "Meebits",
    description: "3D voxel characters by Larva Labs",
  },
];

/**
 * Get OpenSea API key from localStorage
 */
export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("opensea_api_key");
}

/**
 * Set OpenSea API key in localStorage
 */
export function setApiKey(apiKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("opensea_api_key", apiKey);
}

/**
 * Search collections from popular collections database
 * Note: Direct OpenSea search API requires API key and has rate limits
 */
export async function searchCollections(
  query: string
): Promise<{ collections: any[]; success: boolean; error?: string }> {
  try {
    const lowerQuery = query.toLowerCase();
    const results = POPULAR_COLLECTIONS.filter(
      (collection) =>
        collection.slug.toLowerCase().includes(lowerQuery) ||
        collection.name.toLowerCase().includes(lowerQuery) ||
        collection.description.toLowerCase().includes(lowerQuery)
    );

    return {
      collections: results,
      success: true,
    };
  } catch (error) {
    return {
      collections: [],
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}

/**
 * Get collection details by slug
 */
export async function getCollection(slug: string): Promise<{
  collection: OpenSeaCollection | null;
  success: boolean;
  error?: string;
}> {
  try {
    const apiKey = getApiKey();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["X-API-KEY"] = apiKey;
    }

    const response = await fetch(
      `${OPENSEA_CONFIG.BASE_URL}/collections/${slug}`,
      {
        headers,
        // Note: next.revalidate is ignored on client-side fetches
        // Consider creating a server route proxy for better caching
      }
    );

    if (response.status === 401) {
      return {
        collection: null,
        success: false,
        error: 'API key required. Use "nft setup <your-api-key>" to configure.',
      };
    }

    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status}`);
    }

    const data = await response.json();

    // Defensive mapping: handle different response shapes
    const collection = data.collection ?? data;

    return {
      collection: collection,
      success: true,
    };
  } catch (error) {
    return {
      collection: null,
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch collection",
    };
  }
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(
  slug: string
): Promise<{ stats: OpenSeaStats | null; success: boolean; error?: string }> {
  try {
    const apiKey = getApiKey();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["X-API-KEY"] = apiKey;
    }

    const response = await fetch(
      `${OPENSEA_CONFIG.BASE_URL}/collections/${slug}/stats`,
      {
        headers,
        // Note: next.revalidate is ignored on client-side fetches
        // Consider creating a server route proxy for better caching
      }
    );

    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status}`);
    }

    const data = await response.json();

    // Defensive mapping: handle different response shapes
    const stats = data.stats ?? data;

    return {
      stats: stats,
      success: true,
    };
  } catch (error) {
    return {
      stats: null,
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
    };
  }
}

/**
 * Get NFTs from a collection
 */
export async function getCollectionNFTs(
  slug: string,
  limit: number = 12
): Promise<{ nfts: OpenSeaNFT[]; success: boolean; error?: string }> {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return {
        nfts: [],
        success: false,
        error: 'API key required. Use "nft setup <your-api-key>" to configure.',
      };
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    };

    const response = await fetch(
      `${OPENSEA_CONFIG.BASE_URL}/collection/${slug}/nfts?limit=${limit}`,
      {
        headers,
        // Note: next.revalidate is ignored on client-side fetches
        // Consider creating a server route proxy for better caching
      }
    );

    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      nfts: data.nfts || [],
      success: true,
    };
  } catch (error) {
    return {
      nfts: [],
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch NFTs",
    };
  }
}

/**
 * Get individual NFT details
 */
export async function getNFTDetails(
  collection: string,
  tokenId: string
): Promise<{ nft: OpenSeaNFT | null; success: boolean; error?: string }> {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return {
        nft: null,
        success: false,
        error: 'API key required. Use "nft setup <your-api-key>" to configure.',
      };
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    };

    const response = await fetch(
      `${OPENSEA_CONFIG.BASE_URL}/chain/${OPENSEA_CONFIG.CHAIN}/contract/${collection}/nfts/${tokenId}`,
      {
        headers,
        // Note: next.revalidate is ignored on client-side fetches
        // Consider creating a server route proxy for better caching
      }
    );

    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      nft: data.nft,
      success: true,
    };
  } catch (error) {
    return {
      nft: null,
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch NFT details",
    };
  }
}

/**
 * Test API key validity
 */
export async function testApiKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    };

    const response = await fetch(
      `${OPENSEA_CONFIG.BASE_URL}/collections/boredapeyachtclub`,
      { headers }
    );

    return {
      valid: response.ok,
      error: response.ok ? undefined : "Invalid API key",
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "API key test failed",
    };
  }
}
