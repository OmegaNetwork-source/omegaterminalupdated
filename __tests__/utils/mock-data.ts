import { faker } from "@faker-js/faker";

import type { TerminalLine } from "@/types/terminal";
import type { OpenSeaNFT } from "@/types/nft";
import type { DexScreenerPair } from "@/types/api";
import type { NewsArticle } from "@/types/media";
import type { GameScore } from "@/types/games";
import type { ReferralUser } from "@/types/referral";

/**
 * Generate a valid Ethereum address for tests. Uses faker to produce a
 * deterministic looking hexadecimal string with the 0x prefix.
 */
export const generateMockWalletAddress = (): string =>
  `0x${faker.string.hexadecimal({ length: 40, casing: "lower", prefix: "" })}`;

/**
 * Generate a valid 256-bit private key for tests (64 hex characters with 0x prefix).
 */
export const generateMockPrivateKey = (): string =>
  `0x${faker.string.hexadecimal({ length: 64, casing: "lower", prefix: "" })}`;

/**
 * Create an array of terminal lines covering each display variant.
 */
export const generateMockTerminalLines = (count: number): TerminalLine[] =>
  Array.from({ length: count }).map((_, index) => {
    const types: TerminalLine["type"][] = [
      "command",
      "output",
      "error",
      "success",
      "warning",
      "info",
      "html",
    ];
    const type = types[index % types.length];

    return {
      id: `terminal-line-${index}`,
      type,
      content: faker.lorem.sentence(),
      timestamp: Date.now() - index * 1_000,
      htmlContent:
        type === "html"
          ? `<strong>${faker.lorem.sentence()}</strong>`
          : undefined,
    } satisfies TerminalLine;
  });

/**
 * Produce a mock OpenSea NFT record for marketplace rendering tests.
 */
export const generateMockNFT = (): OpenSeaNFT => ({
  identifier: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  image_url: faker.image.url(),
  collection: faker.company.name(),
  contract: generateMockWalletAddress(),
  listing: {
    price: {
      current: {
        value: faker.number.float({ min: 0.01, max: 10, fractionDigits: 2 }),
        decimals: 2,
        currency: "ETH",
      },
    },
  },
});

/**
 * Produce a mock DexScreener pair object with realistic numeric ranges.
 */
export const generateMockToken = (): DexScreenerPair => ({
  chainId: "ethereum",
  dexId: "uniswap-v3",
  url: faker.internet.url(),
  pairAddress: generateMockWalletAddress(),
  baseToken: {
    address: generateMockWalletAddress(),
    name: faker.company.name(),
    symbol: faker.string.alpha({ length: 4, casing: "upper" }),
  },
  quoteToken: {
    address: generateMockWalletAddress(),
    name: "USD Coin",
    symbol: "USDC",
  },
  priceUsd: faker.number
    .float({ min: 0.01, max: 500, fractionDigits: 2 })
    .toString(),
  priceNative: faker.number
    .float({ min: 0.0001, max: 1, fractionDigits: 6 })
    .toString(),
  txns: {
    m5: {
      buys: faker.number.int({ min: 0, max: 20 }),
      sells: faker.number.int({ min: 0, max: 20 }),
    },
    h1: {
      buys: faker.number.int({ min: 10, max: 200 }),
      sells: faker.number.int({ min: 10, max: 200 }),
    },
    h6: {
      buys: faker.number.int({ min: 20, max: 400 }),
      sells: faker.number.int({ min: 20, max: 400 }),
    },
    h24: {
      buys: faker.number.int({ min: 100, max: 1000 }),
      sells: faker.number.int({ min: 100, max: 1000 }),
    },
  },
  volume: {
    h24: faker.number.float({ min: 1_000, max: 1_000_000, fractionDigits: 2 }),
    h6: faker.number.float({ min: 500, max: 500_000, fractionDigits: 2 }),
    h1: faker.number.float({ min: 100, max: 100_000, fractionDigits: 2 }),
    m5: faker.number.float({ min: 10, max: 10_000, fractionDigits: 2 }),
  },
  priceChange: {
    m5: faker.number.float({ min: -5, max: 5, fractionDigits: 2 }),
    h1: faker.number.float({ min: -10, max: 10, fractionDigits: 2 }),
    h6: faker.number.float({ min: -20, max: 20, fractionDigits: 2 }),
    h24: faker.number.float({ min: -30, max: 30, fractionDigits: 2 }),
  },
  liquidity: {
    usd: faker.number.float({ min: 10_000, max: 5_000_000, fractionDigits: 2 }),
    base: faker.number.float({ min: 1_000, max: 1_000_000, fractionDigits: 2 }),
    quote: faker.number.float({
      min: 1_000,
      max: 1_000_000,
      fractionDigits: 2,
    }),
  },
  fdv: faker.number.float({ min: 100_000, max: 10_000_000, fractionDigits: 2 }),
  pairCreatedAt:
    Date.now() - faker.number.int({ min: 1, max: 10 }) * 86_400 * 1_000,
});

/**
 * Produce a mock news article used by the NewsReaderProvider.
 */
export const generateMockNewsArticle = (): NewsArticle => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  url: faker.internet.url(),
  source: {
    title: faker.company.name(),
    domain: faker.internet.domainName(),
  },
  published_at: faker.date.recent().toISOString(),
});

/**
 * Produce a mock game score entry for leaderboard testing.
 */
export const generateMockGameScore = (): GameScore => ({
  gameId: faker.helpers.arrayElement([
    "snake",
    "omega-breaker",
    "flappy-omega",
  ]),
  score: faker.number.int({ min: 100, max: 10_000 }),
  username: faker.internet.userName(),
  timestamp: Date.now(),
  gameData: { streak: faker.number.int({ min: 1, max: 20 }) },
});

/**
 * Produce a mock referral user entry.
 */
export const generateMockReferralData = (): ReferralUser => ({
  walletAddress: generateMockWalletAddress(),
  referralCode: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
  referralUrl: faker.internet.url(),
  twitterHandle: `@${faker.internet.userName()}`,
  discordId: `${faker.internet.userName()}#${faker.number.int({
    min: 1000,
    max: 9999,
  })}`,
  totalReferrals: faker.number.int({ min: 0, max: 1_000 }),
  totalEarned: faker.number.float({ min: 0, max: 5_000, fractionDigits: 2 }),
  rank: faker.number.int({ min: 1, max: 100 }),
});

/**
 * Static command list used for autocomplete tests.
 */
export const MOCK_COMMANDS = [
  "help",
  "connect",
  "balance",
  "theme modern",
  "mine start",
  "claim",
  "nft search azuki",
  "games list",
  "news latest",
  "spotify open",
];

/** Known wallet addresses for deterministic assertions. */
export const MOCK_WALLET_ADDRESSES = [
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222",
  "0x3333333333333333333333333333333333333333",
];

/** Known private keys for deterministic assertions. */
export const MOCK_PRIVATE_KEYS = [
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
];
