import { faker } from "@faker-js/faker";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import {
  generateMockNFT,
  generateMockToken,
  generateMockNewsArticle,
  generateMockGameScore,
  generateMockReferralData,
  MOCK_COMMANDS,
  MOCK_PRIVATE_KEYS,
  MOCK_WALLET_ADDRESSES,
} from "./mock-data";

const jsonResponse = (data: unknown, init?: ResponseInit) =>
  HttpResponse.json(data, init);

export const handlers = [
  // Jupiter quote & swap endpoints (Solana liquidity)
  http.post("https://quote-api.jup.ag/v6/quote", async ({ request }) => {
    const body = (await request.json()) as {
      inputMint: string;
      outputMint: string;
      amount: number;
    };
    return jsonResponse({
      data: {
        inputMint: body.inputMint,
        outputMint: body.outputMint,
        amount: body.amount,
        outAmount: body.amount * 0.98,
        priceImpactPct: 0.01,
        routes: [],
      },
    });
  }),
  http.post("https://quote-api.jup.ag/v6/swap", async () =>
    jsonResponse({
      data: {
        signature: MOCK_PRIVATE_KEYS[0].replace("0x", "").slice(0, 64),
        slot: Date.now(),
      },
    })
  ),
  http.get("https://quote-api.jup.ag/v6/tokens", () =>
    jsonResponse({
      data: Array.from({ length: 5 }).map((_, index) => ({
        address: MOCK_WALLET_ADDRESSES[index % MOCK_WALLET_ADDRESSES.length],
        name: `Token ${index + 1}`,
        symbol: `TOK${index + 1}`,
        decimals: 9,
        chains: ["solana"],
      })),
    })
  ),

  // Kalshi markets
  http.get("https://trading-api.kalshi.com/v1/markets", () =>
    jsonResponse({
      markets: [
        {
          ticker: "OMEGA2025",
          title: "Will Omega reach 1M users by 2025?",
          yes_ask: 60,
          no_bid: 40,
          category: "crypto",
        },
      ],
    })
  ),
  http.get("https://trading-api.kalshi.com/v1/events", () =>
    jsonResponse({
      events: [
        {
          event_ticker: "OMEGA2025",
          title: "Omega Adoption 2025",
          close_date: new Date().toISOString(),
        },
      ],
    })
  ),
  http.get("https://trading-api.kalshi.com/v1/series", () =>
    jsonResponse({
      series: [
        {
          series_ticker: "OMEGA",
          title: "Omega Milestones",
          description: "Predict Omega milestones.",
        },
      ],
    })
  ),

  // DexScreener search & trending
  http.get("https://api.dexscreener.com/latest/dex/search", () =>
    jsonResponse({
      totalResults: 1,
      pairs: [generateMockToken()],
    })
  ),
  http.get("https://api.dexscreener.com/latest/dex/tokens", () =>
    jsonResponse({
      schemaVersion: "1.0",
      pairs: [generateMockToken(), generateMockToken()],
    })
  ),

  // DeFi Llama data
  http.get("https://api.llama.fi/protocols", () =>
    jsonResponse(
      Array.from({ length: 3 }).map((_, index) => ({
        id: `protocol-${index}`,
        name: `Protocol ${index}`,
        symbol: `PR${index}`,
        slug: `protocol-${index}`,
        url: "https://omega.network",
        description: "Mock DeFi protocol",
        chain: "Ethereum",
        chains: ["Ethereum"],
        category: "Dexes",
        tvl: 100_000 * (index + 1),
      }))
    )
  ),
  http.get("https://api.llama.fi/chains", () =>
    jsonResponse(
      Array.from({ length: 3 }).map((_, index) => ({
        name: `Chain ${index}`,
        tokenSymbol: `C${index}`,
        tvl: 10_000 * (index + 1),
      }))
    )
  ),
  http.get("https://coins.llama.fi/prices/current/:chain/:address", () =>
    jsonResponse({
      coins: {
        "ethereum:0x000": {
          price: 123.45,
          timestamp: Date.now(),
          confidence: 0.99,
        },
      },
    })
  ),

  // Magic Eden listings & stats
  http.get(
    "https://api-mainnet.magiceden.dev/v2/collections/:collection/listings",
    () =>
      jsonResponse({
        results: Array.from({ length: 4 }).map(() => ({
          token: {
            name: faker.commerce.productName(),
            image: faker.image.url(),
          },
          price: faker.number.float({ min: 0.5, max: 5, fractionDigits: 2 }),
        })),
      })
  ),
  http.get(
    "https://api-mainnet.magiceden.dev/v2/collections/:collection/stats",
    () =>
      jsonResponse({
        floorPrice: 1.5,
        volumeAll: 10_000,
        listedCount: 150,
      })
  ),
  http.get(
    "https://api-mainnet.magiceden.dev/v2/collections/:collection/activities",
    () =>
      jsonResponse({
        activities: Array.from({ length: 3 }).map(() => ({
          type: "buyNow",
          price: faker.number.float({ min: 0.5, max: 3, fractionDigits: 2 }),
          blockTime: Date.now() / 1000,
        })),
      })
  ),

  // OpenSea collections & assets
  http.get("https://api.opensea.io/api/v2/collections", () =>
    jsonResponse({
      collections: Array.from({ length: 3 }).map(() => ({
        collection: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        image_url: faker.image.url(),
      })),
    })
  ),
  http.get("https://api.opensea.io/api/v2/collection/:collectionId/nfts", () =>
    jsonResponse({
      nfts: [generateMockNFT(), generateMockNFT()],
    })
  ),

  // PGT portfolio tracking
  http.get("https://api.pgt.track/v1/wallets", () =>
    jsonResponse({
      wallets: MOCK_WALLET_ADDRESSES.map((address) => ({
        address,
        network: "ethereum",
        totalValue: 1_000,
      })),
    })
  ),
  http.get("https://api.pgt.track/v1/portfolio", () =>
    jsonResponse({
      totalValue: 10_000,
      change24hPercent: 5.6,
      wallets: MOCK_WALLET_ADDRESSES,
    })
  ),

  // Referral program endpoints
  http.post(
    "https://api.omega.network/referral/create",
    async ({ request }) => {
      const body = (await request.json()) as { walletAddress: string };
      return jsonResponse({
        success: true,
        referralUrl: `https://omega.network/ref/${body.walletAddress.slice(
          2,
          8
        )}`,
      });
    }
  ),
  http.get("https://api.omega.network/referral/stats", () =>
    jsonResponse({
      success: true,
      stats: {
        totalReferrals: 42,
        totalEarned: 123.45,
        pendingRewards: 12.34,
        confirmedRewards: 111.11,
      },
    })
  ),
  http.get("https://api.omega.network/referral/leaderboard", () =>
    jsonResponse({
      success: true,
      leaderboard: Array.from({ length: 3 }).map((_, index) => ({
        rank: index + 1,
        wallet: MOCK_WALLET_ADDRESSES[index % MOCK_WALLET_ADDRESSES.length],
        referrals: 100 - index * 10,
        earned: 500 - index * 50,
      })),
    })
  ),

  // REF Finance (NEAR) endpoints
  http.get("https://app.ref.finance/api/list-token", () =>
    jsonResponse({
      tokens: Array.from({ length: 3 }).map((_, index) => ({
        token_id: `token-${index}`,
        symbol: `REF${index}`,
        name: `REF Token ${index}`,
        decimals: 24,
      })),
    })
  ),
  http.get("https://app.ref.finance/api/list-pools", () =>
    jsonResponse({
      pools: Array.from({ length: 2 }).map((_, index) => ({
        id: index,
        token_account_ids: [`token-${index}`, `token-${index + 1}`],
        total_liquidity: faker.number.float({
          min: 10_000,
          max: 100_000,
          fractionDigits: 2,
        }),
      })),
    })
  ),
  http.get("https://app.ref.finance/api/estimate-swap", () =>
    jsonResponse({
      estimate: {
        amount: 100,
        fee: 0.3,
        pool_id: 0,
      },
    })
  ),

  // AI chat endpoint
  http.post("https://api.gemini.google.com/v1/chat", () =>
    jsonResponse({
      choices: [
        {
          message: {
            role: "assistant",
            content: "Omega Terminal mock AI response.",
          },
        },
      ],
    })
  ),

  // Relayer status endpoint
  http.get("https://relayer.omega.network/status", () =>
    jsonResponse({
      status: "online",
      queueDepth: 0,
      lastHeartbeat: new Date().toISOString(),
    })
  ),

  // News endpoint placeholder
  http.get("https://api.omega.network/news/latest", () =>
    jsonResponse({
      articles: [generateMockNewsArticle(), generateMockNewsArticle()],
    })
  ),

  // Games leaderboard endpoint placeholder
  http.get("https://api.omega.network/games/leaderboard", () =>
    jsonResponse({ scores: [generateMockGameScore(), generateMockGameScore()] })
  ),

  // Command registry metadata endpoint placeholder
  http.get("https://api.omega.network/commands", () =>
    jsonResponse({ commands: MOCK_COMMANDS })
  ),
];

export const server = setupServer(...handlers);

export const setupMockServer = () =>
  server.listen({ onUnhandledRequest: "error" });

export const resetMockServer = () => server.resetHandlers();

export const closeMockServer = () => server.close();
