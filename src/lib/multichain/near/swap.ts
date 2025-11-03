/**
 * NEAR Swap Integration Module
 * Handles token swaps on NEAR Protocol via Ref Finance or other DEXs
 */

import { config } from "@/lib/config";
import type { TokenInfo, SwapQuote } from "@/types/multichain";

/**
 * Get list of tokens available on NEAR
 * @returns Array of NEAR tokens
 */
export async function getNearTokens(): Promise<TokenInfo[]> {
  try {
    // Use relayer as proxy for NEAR token data
    const url = `${config.RELAYER_URL}/near/tokens`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn("[NEAR Swap] Failed to fetch tokens, using fallback list");
      return getFallbackTokens();
    }

    const data = await response.json();

    const tokens: TokenInfo[] = (data.tokens || data || []).map(
      (token: any) => ({
        address: token.address || token.contract_id,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals || 24,
        logoURI: token.logoURI || token.icon,
        verified: token.verified || false,
        tags: token.tags || [],
      })
    );

    console.log(`[NEAR Swap] Loaded ${tokens.length} tokens`);

    return tokens;
  } catch (error: any) {
    console.error("[NEAR Swap] Error fetching tokens:", error);
    return getFallbackTokens();
  }
}

/**
 * Get fallback token list for NEAR
 * @returns Array of common NEAR tokens
 */
function getFallbackTokens(): TokenInfo[] {
  return [
    {
      address: "wrap.near",
      symbol: "wNEAR",
      name: "Wrapped NEAR",
      decimals: 24,
      verified: true,
    },
    {
      address: "token.v2.ref-finance.near",
      symbol: "REF",
      name: "Ref Finance Token",
      decimals: 18,
      verified: true,
    },
    {
      address: "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      verified: true,
    },
    {
      address: "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      verified: true,
    },
  ];
}

/**
 * Get a swap quote for NEAR tokens
 * @param fromToken - Input token address
 * @param toToken - Output token address
 * @param amount - Amount in smallest token unit
 * @returns SwapQuote object or null on error
 */
export async function getSwapQuote(
  fromToken: string,
  toToken: string,
  amount: string
): Promise<SwapQuote | null> {
  try {
    // Use relayer as proxy for NEAR swap quotes
    const params = new URLSearchParams({
      fromToken,
      toToken,
      amount,
    });

    const url = `${config.RELAYER_URL}/near/quote?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NEAR swap API error: ${response.statusText}`);
    }

    const data = await response.json();

    const quote: SwapQuote = {
      inputMint: fromToken,
      outputMint: toToken,
      inAmount: amount,
      outAmount: data.outAmount || data.estimate || "0",
      priceImpactPct: parseFloat(data.priceImpact || "0"),
      routePlan: data.route || [],
    };

    console.log("[NEAR Swap] Quote received:");
    console.log(`  Input: ${quote.inAmount}`);
    console.log(`  Output: ${quote.outAmount}`);

    return quote;
  } catch (error: any) {
    console.error("[NEAR Swap] Error getting quote:", error);
    return null;
  }
}

/**
 * Execute a token swap on NEAR
 * @param fromToken - Input token address
 * @param toToken - Output token address
 * @param amount - Amount in smallest token unit
 * @param wallet - NEAR wallet connection instance
 * @returns Object with success status, transaction hash, and optional error
 */
export async function executeSwap(
  fromToken: string,
  toToken: string,
  amount: string,
  wallet: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Placeholder implementation
    // Full NEAR swap integration will be enhanced in future phases
    console.log("[NEAR Swap] Swap execution requested");
    console.log(`  From: ${fromToken}`);
    console.log(`  To: ${toToken}`);
    console.log(`  Amount: ${amount}`);

    return {
      success: false,
      error:
        "NEAR swap execution is currently a placeholder. Full integration coming in future phases. For now, use Ref Finance directly at ref.finance",
    };
  } catch (error: any) {
    console.error("[NEAR Swap] Error executing swap:", error);
    return {
      success: false,
      error: error.message || "Failed to execute NEAR swap",
    };
  }
}

/**
 * Get swap transaction for NEAR
 * @param fromToken - Input token address
 * @param toToken - Output token address
 * @param amount - Amount in smallest token unit
 * @param slippage - Slippage tolerance (default: 0.5%)
 * @returns Transaction object or null on error
 */
export async function getSwapTransaction(
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: number = 0.5
): Promise<any | null> {
  try {
    // Use relayer as proxy for NEAR swap transactions
    const url = `${config.RELAYER_URL}/near/swap-transaction`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fromToken,
        toToken,
        amount,
        slippage,
      }),
    });

    if (!response.ok) {
      throw new Error(`NEAR swap API error: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("[NEAR Swap] Swap transaction received");

    return data.transaction || null;
  } catch (error: any) {
    console.error("[NEAR Swap] Error getting swap transaction:", error);
    return null;
  }
}
