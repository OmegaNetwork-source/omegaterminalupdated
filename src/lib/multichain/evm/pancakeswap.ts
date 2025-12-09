/**
 * PancakeSwap Integration
 * Handles token swaps via PancakeSwap Router across EVM networks
 */

export interface PancakeSwapQuote {
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  route: any[];
  gasEstimate: string;
}

export interface PancakeSwapSwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  recipient: string;
  chainId: number;
  slippageTolerance?: number; // in basis points (default: 50 = 0.5%)
}

/**
 * Get swap quote from PancakeSwap API
 */
export async function getPancakeSwapQuote(
  params: PancakeSwapSwapParams
): Promise<PancakeSwapQuote | null> {
  try {
    const {
      tokenIn,
      tokenOut,
      amountIn,
      recipient,
      chainId,
      slippageTolerance = 50,
    } = params;

    // PancakeSwap API endpoint
    const apiUrl = `https://api.pancakeswap.info/api/v2/swap`;

    const requestBody = {
      amount: amountIn,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      chainId: chainId,
      recipient: recipient,
      slippageTolerance: slippageTolerance / 10000, // Convert bps to decimal
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PancakeSwap] Quote API error:", errorText);
      return null;
    }

    const data = await response.json();

    return {
      inputAmount: data.amountIn || amountIn,
      outputAmount: data.amountOut || "0",
      priceImpact: parseFloat(data.priceImpact || "0"),
      route: data.route || [],
      gasEstimate: data.gasEstimate || "0",
    };
  } catch (error: any) {
    console.error("[PancakeSwap] Error getting quote:", error);
    return null;
  }
}

/**
 * Build swap transaction using PancakeSwap Router
 * Note: This returns the transaction parameters that need to be executed via ethers.js
 */
export async function buildPancakeSwapTransaction(
  params: PancakeSwapSwapParams
): Promise<{
  to: string;
  data: string;
  value: string;
  gasLimit?: string;
} | null> {
  try {
    const quote = await getPancakeSwapQuote(params);
    if (!quote) {
      return null;
    }

    // PancakeSwap Router contract addresses by chain
    const ROUTER: Record<number, string> = {
      1: "0xEfF92A263d31888d860bD50809A8D171709b7b1c", // Ethereum Mainnet
      42161: "0xEfF92A263d31888d860bD50809A8D171709b7b1c", // Arbitrum
      10: "0xEfF92A263d31888d860bD50809A8D171709b7b1c", // Optimism
      8453: "0xEfF92A263d31888d860bD50809A8D171709b7b1c", // Base
      137: "0xEfF92A263d31888d860bD50809A8D171709b7b1c", // Polygon
      56: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // BNB Chain (main PancakeSwap router)
    };

    const routerAddress = ROUTER[params.chainId];
    if (!routerAddress) {
      console.error(`[PancakeSwap] Unsupported chain ID: ${params.chainId}`);
      return null;
    }

    // Use PancakeSwap API to get transaction calldata
    const apiUrl = `https://api.pancakeswap.info/api/v2/swap`;

    const requestBody = {
      amount: params.amountIn,
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      chainId: params.chainId,
      recipient: params.recipient,
      slippageTolerance: (params.slippageTolerance || 50) / 10000,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      to: routerAddress,
      data: data.calldata || "0x",
      value: params.tokenIn === "0x0000000000000000000000000000000000000000" ? params.amountIn : "0",
      gasLimit: quote?.gasEstimate,
    };
  } catch (error: any) {
    console.error("[PancakeSwap] Error building transaction:", error);
    return null;
  }
}

/**
 * Get token address for native token (BNB, ETH, MATIC, etc.)
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

