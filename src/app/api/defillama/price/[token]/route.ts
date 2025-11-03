/**
 * DeFi Llama Token Price API Route
 * Server-side proxy for token prices with caching
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const normalizedSymbol = token.toLowerCase();
    const mappedToken =
      TOKEN_MAPPINGS[normalizedSymbol] || `coingecko:${normalizedSymbol}`;

    const response = await fetch(
      `https://coins.llama.fi/prices/current/${mappedToken}`,
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
    const coinData = data.coins?.[mappedToken];

    if (!coinData) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    return NextResponse.json({
      price: {
        symbol: token,
        price: coinData.price || 0,
        timestamp: coinData.timestamp || Date.now(),
        confidence: coinData.confidence || 0,
      },
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch token price from DeFi Llama",
      },
      { status: 500 }
    );
  }
}
