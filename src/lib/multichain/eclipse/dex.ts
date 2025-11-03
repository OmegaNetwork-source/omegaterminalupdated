/**
 * Eclipse DEX Integration Module
 * Handles swaps via Solar DEX and Deserialize aggregator with smart routing
 */

import { config } from "@/lib/config";
import type { TokenInfo, SwapQuote } from "@/types/multichain";

/**
 * Get token list from Solar DEX and Deserialize
 * @returns Object with Solar tokens, Deserialize tokens, and merged list
 */
export async function getTokenList(): Promise<{
  solarTokens: TokenInfo[];
  deserializeTokens: TokenInfo[];
  merged: TokenInfo[];
}> {
  try {
    // Fetch from both APIs in parallel
    const [solarResponse, deserializeResponse] = await Promise.allSettled([
      fetch(`${config.SOLAR_DEX_API_URL}/mint/list`),
      fetch(`${config.DESERIALIZE_API_URL}/tokenList`),
    ]);

    // Parse Solar DEX tokens
    let solarTokens: TokenInfo[] = [];
    if (solarResponse.status === "fulfilled" && solarResponse.value.ok) {
      const solarData = await solarResponse.value.json();
      solarTokens = (solarData.tokens || solarData || []).map((token: any) => ({
        address: token.address || token.mint,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logoURI || token.logo,
        verified: token.verified,
        tags: [...(token.tags || []), "solar-dex"],
      }));
    }

    // Parse Deserialize tokens
    let deserializeTokens: TokenInfo[] = [];
    if (
      deserializeResponse.status === "fulfilled" &&
      deserializeResponse.value.ok
    ) {
      const deserializeData = await deserializeResponse.value.json();
      deserializeTokens = (deserializeData.tokens || deserializeData || []).map(
        (token: any) => ({
          address: token.address || token.mint,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logoURI || token.logo,
          verified: token.verified,
          tags: [...(token.tags || []), "deserialize"],
        })
      );
    }

    // Merge token lists (remove duplicates by address)
    const tokenMap = new Map<string, TokenInfo>();

    [...solarTokens, ...deserializeTokens].forEach((token) => {
      if (!tokenMap.has(token.address)) {
        tokenMap.set(token.address, token);
      } else {
        // Merge tags if token already exists
        const existing = tokenMap.get(token.address)!;
        existing.tags = Array.from(
          new Set([...(existing.tags || []), ...(token.tags || [])])
        );
      }
    });

    const merged = Array.from(tokenMap.values());

    console.log("[Eclipse DEX] Token list loaded:");
    console.log(`  Solar DEX: ${solarTokens.length} tokens`);
    console.log(`  Deserialize: ${deserializeTokens.length} tokens`);
    console.log(`  Merged: ${merged.length} tokens`);

    return {
      solarTokens,
      deserializeTokens,
      merged,
    };
  } catch (error: any) {
    console.error("[Eclipse DEX] Error getting token list:", error);
    return {
      solarTokens: [],
      deserializeTokens: [],
      merged: [],
    };
  }
}

/**
 * Get token price from Solar DEX and Deserialize
 * @param mint - Token mint address
 * @returns Object with prices from both sources
 */
export async function getTokenPrice(mint: string): Promise<{
  solarPrice?: number;
  deserializePrice?: number;
  source: string;
}> {
  try {
    // Fetch from both APIs in parallel
    const [solarResponse, deserializeResponse] = await Promise.allSettled([
      fetch(`${config.SOLAR_DEX_API_URL}/price/${mint}`),
      fetch(`${config.DESERIALIZE_API_URL}/price/${mint}`),
    ]);

    let solarPrice: number | undefined;
    let deserializePrice: number | undefined;

    // Parse Solar DEX price
    if (solarResponse.status === "fulfilled" && solarResponse.value.ok) {
      const solarData = await solarResponse.value.json();
      solarPrice = parseFloat(solarData.price || solarData.value || "0");
    }

    // Parse Deserialize price
    if (
      deserializeResponse.status === "fulfilled" &&
      deserializeResponse.value.ok
    ) {
      const deserializeData = await deserializeResponse.value.json();
      deserializePrice = parseFloat(
        deserializeData.price || deserializeData.value || "0"
      );
    }

    // Determine source based on availability
    let source = "none";
    if (solarPrice && deserializePrice) {
      source = "both";
    } else if (solarPrice) {
      source = "solar-dex";
    } else if (deserializePrice) {
      source = "deserialize";
    }

    console.log(`[Eclipse DEX] Price for ${mint}:`);
    console.log(`  Solar DEX: ${solarPrice || "N/A"}`);
    console.log(`  Deserialize: ${deserializePrice || "N/A"}`);

    return {
      solarPrice,
      deserializePrice,
      source,
    };
  } catch (error: any) {
    console.error("[Eclipse DEX] Error getting token price:", error);
    return {
      source: "error",
    };
  }
}

/**
 * Get swap quote with smart routing
 * SOLAR token uses Solar DEX, other tokens use Deserialize
 * @param fromMint - Input token mint address
 * @param toMint - Output token mint address
 * @param amount - Amount in smallest token unit
 * @param slippageBps - Slippage tolerance in basis points
 * @returns SwapQuote object or null on error
 */
export async function getSwapQuote(
  fromMint: string,
  toMint: string,
  amount: string,
  slippageBps: number = 50
): Promise<SwapQuote | null> {
  try {
    // Determine routing based on token addresses
    const usesSolarDex =
      fromMint === config.SOLAR_TOKEN_ADDRESS ||
      toMint === config.SOLAR_TOKEN_ADDRESS;

    const dexName = usesSolarDex ? "Solar DEX" : "Deserialize";
    const apiUrl = usesSolarDex
      ? config.SOLAR_DEX_API_URL
      : config.DESERIALIZE_API_URL;

    console.log(`[Eclipse DEX] Using ${dexName} for quote`);

    // Build query parameters
    const params = new URLSearchParams({
      inputMint: fromMint,
      outputMint: toMint,
      amount,
      slippageBps: slippageBps.toString(),
    });

    const url = `${apiUrl}/quote?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`${dexName} API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Map response to SwapQuote format
    const quote: SwapQuote = {
      inputMint: fromMint,
      outputMint: toMint,
      inAmount: data.inAmount || amount,
      outAmount: data.outAmount,
      priceImpactPct: parseFloat(data.priceImpactPct || "0"),
      routePlan: data.routePlan || [],
    };

    console.log(`[Eclipse DEX] Quote received from ${dexName}:`);
    console.log(`  Input: ${quote.inAmount}`);
    console.log(`  Output: ${quote.outAmount}`);
    console.log(`  Price Impact: ${quote.priceImpactPct}%`);

    return quote;
  } catch (error: any) {
    console.error("[Eclipse DEX] Error getting swap quote:", error);
    return null;
  }
}

/**
 * Execute a swap on Eclipse with smart routing
 * @param fromMint - Input token mint address
 * @param toMint - Output token mint address
 * @param amount - Amount in smallest token unit
 * @param slippageBps - Slippage tolerance in basis points
 * @param userPublicKey - User's public key
 * @returns Object with serialized transaction or null on error
 */
export async function getSwapTransaction(
  fromMint: string,
  toMint: string,
  amount: string,
  slippageBps: number,
  userPublicKey: string
): Promise<{ swapTransaction: string } | null> {
  try {
    // Determine routing based on token addresses
    const usesSolarDex =
      fromMint === config.SOLAR_TOKEN_ADDRESS ||
      toMint === config.SOLAR_TOKEN_ADDRESS;

    const dexName = usesSolarDex ? "Solar DEX" : "Deserialize";
    const apiUrl = usesSolarDex
      ? config.SOLAR_DEX_API_URL
      : config.DESERIALIZE_API_URL;

    console.log(`[Eclipse DEX] Using ${dexName} for swap transaction`);

    // Get quote first
    const quote = await getSwapQuote(fromMint, toMint, amount, slippageBps);
    if (!quote) {
      throw new Error("Failed to get swap quote");
    }

    // Get swap transaction
    const url = `${apiUrl}/swap`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapUnwrapSOL: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`${dexName} API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.swapTransaction) {
      throw new Error(`No swap transaction returned from ${dexName}`);
    }

    console.log(`[Eclipse DEX] Swap transaction received from ${dexName}`);

    return {
      swapTransaction: data.swapTransaction,
    };
  } catch (error: any) {
    console.error("[Eclipse DEX] Error getting swap transaction:", error);
    return null;
  }
}

/**
 * Determine which DEX to use for a swap
 * @param fromMint - Input token mint address
 * @param toMint - Output token mint address
 * @returns DEX name ('solar-dex' or 'deserialize')
 */
export function determineSwapRoute(
  fromMint: string,
  toMint: string
): "solar-dex" | "deserialize" {
  // SOLAR token always uses Solar DEX
  if (
    fromMint === config.SOLAR_TOKEN_ADDRESS ||
    toMint === config.SOLAR_TOKEN_ADDRESS
  ) {
    return "solar-dex";
  }

  // All other tokens use Deserialize
  return "deserialize";
}
