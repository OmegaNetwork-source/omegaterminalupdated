/**
 * Jupiter Aggregator API Client Module
 * Handles token search and swap operations via Jupiter on Solana
 */

import { config } from "@/lib/config";
import type { TokenInfo, SwapQuote } from "@/types/multichain";

/**
 * Search for tokens by name or symbol using Jupiter API
 * @param query - Search query (token name or symbol)
 * @returns Array of matching tokens (up to 20 results)
 */
export async function searchTokens(query: string): Promise<TokenInfo[]> {
  try {
    // Use relayer as proxy for Jupiter API
    const url = `${
      config.JUPITER_API_URL
    }/jupiter/search?q=${encodeURIComponent(query)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Map response to TokenInfo format
    const tokens: TokenInfo[] = (data.tokens || data || [])
      .slice(0, 20)
      .map((token: any) => ({
        address: token.id || token.address || token.mint,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.icon || token.logoURI || token.logo,
        verified: token.isVerified || token.verified || token.strict,
        tags: token.tags || [],
      }));

    console.log(
      `[Jupiter API] Found ${tokens.length} tokens for query: ${query}`
    );

    return tokens;
  } catch (error: any) {
    console.error("[Jupiter API] Error searching tokens:", error);
    return [];
  }
}

/**
 * Get a swap quote from Jupiter aggregator
 * @param inputMint - Input token mint address
 * @param outputMint - Output token mint address
 * @param amount - Amount in smallest token unit (with decimals)
 * @param slippageBps - Slippage tolerance in basis points (default: 50 = 0.5%)
 * @returns SwapQuote object or null on error
 */
export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: string,
  slippageBps: number = 50
): Promise<SwapQuote | null> {
  try {
    console.log("[Jupiter getSwapQuote] Received parameters:", {
      inputMint,
      outputMint,
      amount,
      slippageBps,
    });

    // Build query parameters
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps: slippageBps.toString(),
    });

    console.log("[Jupiter getSwapQuote] Query params:", params.toString());

    // Use relayer as proxy for Jupiter API
    const url = `${config.JUPITER_API_URL}/jupiter/quote?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Map response to SwapQuote format
    const quote: SwapQuote = {
      inputMint,
      outputMint,
      inAmount: data.inAmount || amount,
      outAmount: data.outAmount,
      priceImpactPct: parseFloat(data.priceImpactPct || "0"),
      routePlan: data.routePlan || [],
    };

    console.log("[Jupiter API] Quote received:");
    console.log(`  Input: ${quote.inAmount}`);
    console.log(`  Output: ${quote.outAmount}`);
    console.log(`  Price Impact: ${quote.priceImpactPct}%`);

    return quote;
  } catch (error: any) {
    console.error("[Jupiter API] Error getting swap quote:", error);
    return null;
  }
}

/**
 * Get a serialized swap transaction from Jupiter
 * @param quoteResponse - Quote response from getSwapQuote
 * @param userPublicKey - User's public key (base58 string)
 * @returns Object with serialized transaction or null on error
 */
export async function getSwapTransaction(
  quoteResponse: any,
  userPublicKey: string
): Promise<{ swapTransaction: string } | null> {
  try {
    // Use relayer as proxy for Jupiter API
    const url = `${config.JUPITER_API_URL}/jupiter/swap`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapUnwrapSOL: true,
        computeUnitPriceMicroLamports: "auto",
      }),
    });

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.swapTransaction) {
      throw new Error("No swap transaction returned from Jupiter");
    }

    console.log("[Jupiter API] Swap transaction received");

    return {
      swapTransaction: data.swapTransaction,
    };
  } catch (error: any) {
    console.error("[Jupiter API] Error getting swap transaction:", error);
    return null;
  }
}

/**
 * Get token list from Jupiter
 * @returns Array of all tokens supported by Jupiter
 */
export async function getTokenList(): Promise<TokenInfo[]> {
  try {
    const url = `${config.JUPITER_API_URL}/jupiter/tokens`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.statusText}`);
    }

    const data = await response.json();

    const tokens: TokenInfo[] = (data.tokens || data || []).map(
      (token: any) => ({
        address: token.address || token.mint,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logoURI || token.logo,
        verified: token.verified || token.strict,
        tags: token.tags || [],
      })
    );

    console.log(`[Jupiter API] Loaded ${tokens.length} tokens`);

    return tokens;
  } catch (error: any) {
    console.error("[Jupiter API] Error getting token list:", error);
    return [];
  }
}
