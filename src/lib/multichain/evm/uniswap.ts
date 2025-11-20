/**
 * Uniswap Integration
 * Handles token swaps via Uniswap Universal Router across EVM networks
 */

export interface UniswapQuote {
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  route: any[];
  gasEstimate: string;
}

export interface UniswapSwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  recipient: string;
  chainId: number;
  slippageTolerance?: number; // in basis points (default: 50 = 0.5%)
}

/**
 * Get swap quote from Uniswap Universal Router API
 */
export async function getUniswapQuote(
  params: UniswapSwapParams
): Promise<UniswapQuote | null> {
  try {
    const {
      tokenIn,
      tokenOut,
      amountIn,
      recipient,
      chainId,
      slippageTolerance = 50,
    } = params;

    // Uniswap Universal Router API endpoint
    const apiUrl = `https://api.uniswap.org/v2/quote`;

    const queryParams = new URLSearchParams({
      tokenInAddress: tokenIn,
      tokenInChainId: chainId.toString(),
      tokenOutAddress: tokenOut,
      tokenOutChainId: chainId.toString(),
      amount: amountIn,
      type: "EXACT_INPUT",
      recipient: recipient,
      slippageTolerance: (slippageTolerance / 10000).toString(), // Convert bps to decimal
      deadline: Math.floor(Date.now() / 1000 + 1800).toString(), // 30 minutes
    });

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Uniswap] Quote API error:", errorText);
      return null;
    }

    const data = await response.json();

    return {
      inputAmount: data.quote.amountIn || amountIn,
      outputAmount: data.quote.amountOut || "0",
      priceImpact: parseFloat(data.quote.priceImpact || "0"),
      route: data.quote.route || [],
      gasEstimate: data.quote.gasUseEstimate || "0",
    };
  } catch (error: any) {
    console.error("[Uniswap] Error getting quote:", error);
    return null;
  }
}

/**
 * Build swap transaction using Uniswap Universal Router
 * Note: This returns the transaction parameters that need to be executed via ethers.js
 */
export async function buildUniswapSwapTransaction(
  params: UniswapSwapParams
): Promise<{
  to: string;
  data: string;
  value: string;
  gasLimit?: string;
} | null> {
  try {
    const quote = await getUniswapQuote(params);
    if (!quote) {
      return null;
    }

    // Uniswap Universal Router contract addresses by chain
    const UNIVERSAL_ROUTER: Record<number, string> = {
      1: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD", // Ethereum Mainnet
      42161: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD", // Arbitrum
      10: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD", // Optimism
      8453: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD", // Base
      137: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD", // Polygon
      56: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD", // BNB Chain
    };

    const routerAddress = UNIVERSAL_ROUTER[params.chainId];
    if (!routerAddress) {
      console.error(`[Uniswap] Unsupported chain ID: ${params.chainId}`);
      return null;
    }

    // For now, we'll use the quote API response which includes the calldata
    // In production, you'd use the Uniswap SDK to build the exact transaction
    const apiUrl = `https://api.uniswap.org/v2/quote`;

    const queryParams = new URLSearchParams({
      tokenInAddress: params.tokenIn,
      tokenInChainId: params.chainId.toString(),
      tokenOutAddress: params.tokenOut,
      tokenOutChainId: params.chainId.toString(),
      amount: params.amountIn,
      type: "EXACT_INPUT",
      recipient: params.recipient,
      slippageTolerance: ((params.slippageTolerance || 50) / 10000).toString(),
      deadline: Math.floor(Date.now() / 1000 + 1800).toString(),
    });

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // The API returns the transaction parameters
    return {
      to: routerAddress,
      data: data.quote?.calldata || "0x",
      value: params.tokenIn === "0x0000000000000000000000000000000000000000" ? params.amountIn : "0",
      gasLimit: quote?.gasEstimate,
    };
  } catch (error: any) {
    console.error("[Uniswap] Error building transaction:", error);
    return null;
  }
}

/**
 * Get token address for native token (ETH, MATIC, etc.)
 */
export function getNativeTokenAddress(chainId: number): string {
  return "0x0000000000000000000000000000000000000000";
}

/**
 * Check if address is native token
 */
export function isNativeToken(address: string): boolean {
  return address === "0x0000000000000000000000000000000000000000" || 
         address.toLowerCase() === "0x0000000000000000000000000000000000000000";
}

