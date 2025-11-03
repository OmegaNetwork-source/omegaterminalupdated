/**
 * DeFi Llama Multiple Token Prices API Route
 * Server-side proxy for batch token prices with caching
 */

import { NextRequest, NextResponse } from "next/server";

const TOKEN_MAPPINGS: Record<string, string> = {
  eth: "coingecko:ethereum",
  ethereum: "coingecko:ethereum",
  btc: "coingecko:bitcoin",
  bitcoin: "coingecko:bitcoin",
  sol: "coingecko:solana",
  solana: "coingecko:solana",
  usdc: "coingecko:usd-coin",
  usdt: "coingecko:tether",
  bnb: "coingecko:binancecoin",
  ada: "coingecko:cardano",
  dot: "coingecko:polkadot",
  avax: "coingecko:avalanche-2",
  matic: "coingecko:matic-network",
  link: "coingecko:chainlink",
  uni: "coingecko:uniswap",
  aave: "coingecko:aave",
  crv: "coingecko:curve-dao-token",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokensParam = searchParams.get("tokens");

    if (!tokensParam) {
      return NextResponse.json(
        { error: "tokens parameter is required" },
        { status: 400 }
      );
    }

    const tokenSymbols = tokensParam.split(",").map((t) => t.trim());

    // Map all symbols
    const mappedTokens = tokenSymbols.map((symbol) => {
      const normalized = symbol.toLowerCase();
      return TOKEN_MAPPINGS[normalized] || `coingecko:${normalized}`;
    });

    const response = await fetch(
      `https://coins.llama.fi/prices/current/${mappedTokens.join(",")}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `DeFi Llama API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Build price map
    const prices: Record<string, any> = {};

    tokenSymbols.forEach((symbol, index) => {
      const mappedToken = mappedTokens[index];
      const coinData = data.coins?.[mappedToken];

      if (coinData) {
        prices[symbol] = {
          symbol,
          price: coinData.price || 0,
          timestamp: coinData.timestamp || Date.now(),
          confidence: coinData.confidence || 0,
        };
      }
    });

    return NextResponse.json({
      prices,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch token prices from DeFi Llama",
      },
      { status: 500 }
    );
  }
}
