/**
 * Bot Library Data
 * Collection of available bots across different categories
 */

import type {
  BotConfig,
  TradingBotConfig,
  SocialBotConfig,
  PredictionMarketBotConfig,
} from "@/types/bots";

/**
 * Trading Bots
 */
export const TRADING_BOTS: TradingBotConfig[] = [
  {
    name: "DCA Trading Bot",
    description: "Dollar Cost Averaging bot for automated trading strategies",
    type: "trading",
    platform: "multi-chain",
    status: "active",
    tradingPairs: ["ETH/USDT", "BTC/USDT", "SOL/USDT"],
    exchange: "Multiple DEXs",
    strategy: "DCA (Dollar Cost Averaging)",
    riskManagement: {
      maxPositionSize: "10%",
      stopLoss: "5%",
      takeProfit: "10%",
    },
    parameters: [
      {
        name: "tradingPair",
        type: "select",
        required: true,
        description: "Trading pair to use",
        options: ["ETH/USDT", "BTC/USDT", "SOL/USDT"],
      },
      {
        name: "interval",
        type: "select",
        required: true,
        description: "Buy interval",
        options: ["1h", "4h", "12h", "24h"],
        defaultValue: "24h",
      },
      {
        name: "amount",
        type: "number",
        required: true,
        description: "Amount per purchase",
      },
    ],
    features: ["Automated DCA", "Stop Loss", "Take Profit", "Multi-chain support"],
    pricing: {
      type: "freemium",
    },
    docsUrl: "https://docs.example.com/dca-bot",
    supportLinks: {
      discord: "https://discord.gg/dca-bot",
      telegram: "https://t.me/dca-bot",
    },
  },
  {
    name: "Grid Trading Bot",
    description: "Grid trading bot for range-bound markets",
    type: "trading",
    platform: "multi-chain",
    status: "active",
    tradingPairs: ["ETH/USDT", "BTC/USDT"],
    exchange: "Multiple DEXs",
    strategy: "Grid Trading",
    riskManagement: {
      maxPositionSize: "20%",
    },
    parameters: [
      {
        name: "gridLevels",
        type: "number",
        required: true,
        description: "Number of grid levels",
        defaultValue: "10",
      },
      {
        name: "gridSpacing",
        type: "number",
        required: true,
        description: "Grid spacing percentage",
        defaultValue: "1",
      },
    ],
    features: ["Grid Trading", "Auto-rebalancing", "Range detection"],
    pricing: {
      type: "paid",
      amount: "0.1",
      currency: "ETH/month",
    },
  },
  {
    name: "Momentum Trading Bot",
    description: "Momentum-based trading bot for trend following",
    type: "trading",
    platform: "multi-chain",
    status: "active",
    tradingPairs: ["ETH/USDT", "BTC/USDT", "SOL/USDT", "BNB/USDT"],
    exchange: "Multiple DEXs",
    strategy: "Momentum Trading",
    riskManagement: {
      stopLoss: "3%",
      takeProfit: "8%",
    },
    parameters: [
      {
        name: "momentumPeriod",
        type: "number",
        required: true,
        description: "Momentum indicator period",
        defaultValue: "14",
      },
      {
        name: "volumeThreshold",
        type: "number",
        required: true,
        description: "Minimum volume threshold",
      },
    ],
    features: ["Momentum detection", "Volume analysis", "Auto-trading"],
    pricing: {
      type: "freemium",
    },
  },
];

/**
 * Scalping Bots
 */
export const SCALPING_BOTS: TradingBotConfig[] = [
  {
    name: "Fast Scalper Bot",
    description: "High-frequency scalping bot for quick profits",
    type: "scalping",
    platform: "ethereum",
    status: "active",
    tradingPairs: ["ETH/USDT", "BTC/USDT"],
    exchange: "Uniswap V3",
    strategy: "Scalping",
    riskManagement: {
      maxPositionSize: "5%",
      stopLoss: "1%",
      takeProfit: "0.5%",
    },
    parameters: [
      {
        name: "profitTarget",
        type: "number",
        required: true,
        description: "Profit target percentage",
        defaultValue: "0.5",
      },
      {
        name: "maxSlippage",
        type: "number",
        required: true,
        description: "Maximum slippage tolerance",
        defaultValue: "0.5",
      },
    ],
    features: ["High-frequency trading", "Low latency", "Gas optimization"],
    pricing: {
      type: "paid",
      amount: "0.05",
      currency: "ETH/month",
    },
  },
  {
    name: "Arbitrage Scalper",
    description: "Cross-exchange arbitrage scalping bot",
    type: "scalping",
    platform: "multi-chain",
    status: "active",
    tradingPairs: ["ETH/USDT", "BTC/USDT"],
    exchange: "Multiple",
    strategy: "Arbitrage",
    parameters: [
      {
        name: "minSpread",
        type: "number",
        required: true,
        description: "Minimum spread to execute",
        defaultValue: "0.3",
      },
    ],
    features: ["Cross-exchange arbitrage", "Real-time monitoring", "Auto-execution"],
    pricing: {
      type: "paid",
      amount: "0.2",
      currency: "ETH/month",
    },
  },
];

/**
 * Telegram Bots
 */
export const TELEGRAM_BOTS: SocialBotConfig[] = [
  {
    name: "Crypto Price Tracker",
    description: "Telegram bot for tracking cryptocurrency prices and alerts",
    type: "telegram",
    platform: "telegram",
    status: "active",
    commands: [
      "/price <symbol>",
      "/watch <symbol>",
      "/alert <symbol> <price>",
      "/portfolio",
      "/news",
    ],
    permissions: ["Send Messages", "Read Messages"],
    parameters: [
      {
        name: "telegramBotToken",
        type: "string",
        required: true,
        description: "Telegram bot token from @BotFather",
      },
      {
        name: "updateInterval",
        type: "select",
        required: false,
        description: "Price update interval",
        options: ["1m", "5m", "15m", "1h"],
        defaultValue: "5m",
      },
    ],
    features: [
      "Price tracking",
      "Price alerts",
      "Portfolio tracking",
      "News aggregation",
      "Multi-coin support",
    ],
    integrations: ["CoinGecko API", "DEX aggregators"],
    pricing: {
      type: "free",
    },
    supportLinks: {
      telegram: "https://t.me/price-tracker-support",
    },
  },
  {
    name: "Trading Signals Bot",
    description: "Telegram bot for receiving and managing trading signals",
    type: "telegram",
    platform: "telegram",
    status: "active",
    commands: [
      "/signals",
      "/subscribe",
      "/unsubscribe",
      "/settings",
      "/history",
    ],
    permissions: ["Send Messages", "Read Messages", "Manage Groups"],
    parameters: [
      {
        name: "telegramBotToken",
        type: "string",
        required: true,
        description: "Telegram bot token",
      },
      {
        name: "signalSource",
        type: "select",
        required: true,
        description: "Signal source",
        options: ["Custom", "API", "Manual"],
      },
    ],
    features: ["Signal broadcasting", "User management", "Signal history"],
    pricing: {
      type: "freemium",
    },
  },
  {
    name: "Wallet Monitor Bot",
    description: "Monitor wallet addresses and transactions via Telegram",
    type: "telegram",
    platform: "telegram",
    status: "active",
    commands: [
      "/watch <address>",
      "/unwatch <address>",
      "/list",
      "/transactions",
      "/balance",
    ],
    permissions: ["Send Messages", "Read Messages"],
    parameters: [
      {
        name: "telegramBotToken",
        type: "string",
        required: true,
        description: "Telegram bot token",
      },
      {
        name: "networks",
        type: "select",
        required: false,
        description: "Networks to monitor",
        options: ["All", "Ethereum", "BSC", "Polygon"],
        defaultValue: "All",
      },
    ],
    features: [
      "Multi-wallet monitoring",
      "Transaction alerts",
      "Balance tracking",
      "Multi-chain support",
    ],
    pricing: {
      type: "free",
    },
  },
];

/**
 * Discord Bots
 */
export const DISCORD_BOTS: SocialBotConfig[] = [
  {
    name: "DeFi Analytics Bot",
    description: "Discord bot for DeFi analytics and portfolio tracking",
    type: "discord",
    platform: "discord",
    status: "active",
    commands: [
      "/portfolio",
      "/pools",
      "/yields",
      "/analytics",
      "/alerts",
    ],
    permissions: ["Send Messages", "Embed Links", "Read Message History"],
    parameters: [
      {
        name: "discordBotToken",
        type: "string",
        required: true,
        description: "Discord bot token",
      },
      {
        name: "guildId",
        type: "string",
        required: true,
        description: "Discord server ID",
      },
    ],
    features: [
      "Portfolio tracking",
      "LP pool analytics",
      "Yield farming data",
      "Custom alerts",
    ],
    integrations: ["DeFiLlama", "The Graph"],
    pricing: {
      type: "free",
    },
    supportLinks: {
      discord: "https://discord.gg/defi-analytics",
    },
  },
  {
    name: "NFT Tracker Bot",
    description: "Discord bot for tracking NFT collections and floor prices",
    type: "discord",
    platform: "discord",
    status: "active",
    commands: [
      "/track <collection>",
      "/floor <collection>",
      "/sales",
      "/trending",
      "/alert",
    ],
    permissions: ["Send Messages", "Embed Links"],
    parameters: [
      {
        name: "discordBotToken",
        type: "string",
        required: true,
        description: "Discord bot token",
      },
    ],
    features: [
      "NFT collection tracking",
      "Floor price monitoring",
      "Sales alerts",
      "Trending collections",
    ],
    pricing: {
      type: "freemium",
    },
  },
  {
    name: "Trading Commands Bot",
    description: "Discord bot with trading commands and market data",
    type: "discord",
    platform: "discord",
    status: "active",
    commands: [
      "/swap",
      "/price",
      "/chart",
      "/orderbook",
      "/trade",
    ],
    permissions: ["Send Messages", "Embed Links", "Use Slash Commands"],
    parameters: [
      {
        name: "discordBotToken",
        type: "string",
        required: true,
        description: "Discord bot token",
      },
      {
        name: "walletIntegration",
        type: "boolean",
        required: false,
        description: "Enable wallet integration",
        defaultValue: false,
      },
    ],
    features: [
      "Trading commands",
      "Market data",
      "Chart generation",
      "Wallet integration",
    ],
    pricing: {
      type: "paid",
      amount: "0.1",
      currency: "ETH/month",
    },
  },
];

/**
 * Prediction Market Bots
 */
export const PREDICTION_MARKET_BOTS: PredictionMarketBotConfig[] = [
  {
    name: "Polymarket Trader Bot",
    description: "Automated trading bot for Polymarket prediction markets",
    type: "prediction-market",
    platform: "web",
    status: "active",
    markets: ["Crypto", "Politics", "Sports", "Entertainment"],
    marketType: "polymarket",
    parameters: [
      {
        name: "polymarketApiKey",
        type: "string",
        required: true,
        description: "Polymarket API key",
      },
      {
        name: "maxPosition",
        type: "number",
        required: true,
        description: "Maximum position size",
        defaultValue: "100",
      },
      {
        name: "minProbability",
        type: "number",
        required: true,
        description: "Minimum probability threshold",
        defaultValue: "0.6",
      },
    ],
    features: [
      "Automated trading",
      "Market analysis",
      "Risk management",
      "Portfolio tracking",
    ],
    pricing: {
      type: "paid",
      amount: "0.15",
      currency: "ETH/month",
    },
    supportLinks: {
      website: "https://polymarket.com",
    },
  },
  {
    name: "Kalshi Trading Bot",
    description: "Automated trading bot for Kalshi prediction markets",
    type: "prediction-market",
    platform: "web",
    status: "active",
    markets: ["Politics", "Economics", "Sports"],
    marketType: "kalshi",
    parameters: [
      {
        name: "kalshiApiKey",
        type: "string",
        required: true,
        description: "Kalshi API key",
      },
      {
        name: "strategy",
        type: "select",
        required: true,
        description: "Trading strategy",
        options: ["Conservative", "Moderate", "Aggressive"],
        defaultValue: "Moderate",
      },
    ],
    features: ["Kalshi integration", "Strategy automation", "Market scanning"],
    pricing: {
      type: "paid",
      amount: "0.12",
      currency: "ETH/month",
    },
  },
  {
    name: "Multi-Market Predictor",
    description: "Bot that trades across multiple prediction market platforms",
    type: "prediction-market",
    platform: "web",
    status: "active",
    markets: ["All"],
    marketType: "custom",
    parameters: [
      {
        name: "platforms",
        type: "select",
        required: true,
        description: "Platforms to use",
        options: ["Polymarket", "Kalshi", "Both"],
      },
      {
        name: "arbitrageEnabled",
        type: "boolean",
        required: false,
        description: "Enable cross-platform arbitrage",
        defaultValue: false,
      },
    ],
    features: [
      "Multi-platform trading",
      "Arbitrage detection",
      "Market comparison",
      "Unified interface",
    ],
    pricing: {
      type: "paid",
      amount: "0.25",
      currency: "ETH/month",
    },
  },
];

/**
 * Additional specialized bots
 */
export const SPECIALIZED_BOTS: BotConfig[] = [
  {
    name: "Arbitrage Bot",
    description: "Cross-exchange and cross-chain arbitrage bot",
    type: "arbitrage",
    platform: "multi-chain",
    status: "active",
    parameters: [
      {
        name: "minProfit",
        type: "number",
        required: true,
        description: "Minimum profit threshold",
        defaultValue: "0.5",
      },
      {
        name: "exchanges",
        type: "select",
        required: true,
        description: "Exchanges to monitor",
        options: ["All", "Uniswap", "PancakeSwap", "SushiSwap"],
      },
    ],
    features: ["Cross-exchange arbitrage", "Cross-chain arbitrage", "Auto-execution"],
    pricing: {
      type: "paid",
      amount: "0.2",
      currency: "ETH/month",
    },
  },
  {
    name: "Liquidity Provider Bot",
    description: "Automated liquidity provision bot for DEXs",
    type: "liquidity",
    platform: "multi-chain",
    status: "active",
    parameters: [
      {
        name: "poolAddress",
        type: "address",
        required: true,
        description: "LP pool address",
      },
      {
        name: "rebalanceThreshold",
        type: "number",
        required: true,
        description: "Rebalance threshold percentage",
        defaultValue: "5",
      },
    ],
    features: ["Auto LP management", "Rebalancing", "Yield optimization"],
    pricing: {
      type: "freemium",
    },
  },
  {
    name: "Portfolio Rebalancer",
    description: "Automated portfolio rebalancing bot",
    type: "portfolio-management",
    platform: "multi-chain",
    status: "active",
    parameters: [
      {
        name: "targetAllocation",
        type: "string",
        required: true,
        description: "Target allocation (JSON format)",
      },
      {
        name: "rebalanceFrequency",
        type: "select",
        required: true,
        description: "Rebalance frequency",
        options: ["Daily", "Weekly", "Monthly"],
        defaultValue: "Weekly",
      },
    ],
    features: ["Auto rebalancing", "Multi-asset support", "Risk management"],
    pricing: {
      type: "freemium",
    },
  },
];

/**
 * All available bots
 */
export const ALL_BOTS: BotConfig[] = [
  ...TRADING_BOTS,
  ...SCALPING_BOTS,
  ...TELEGRAM_BOTS,
  ...DISCORD_BOTS,
  ...PREDICTION_MARKET_BOTS,
  ...SPECIALIZED_BOTS,
];

/**
 * Get bot by name or ID
 */
export function getBot(id: string): BotConfig | undefined {
  // Try exact name match first
  let bot = ALL_BOTS.find((bot) => bot.name.toLowerCase() === id.toLowerCase());
  
  // Try normalized name match (replace spaces with hyphens)
  if (!bot) {
    bot = ALL_BOTS.find((bot) => bot.name.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase());
  }
  
  // Try partial name match
  if (!bot) {
    bot = ALL_BOTS.find((bot) => bot.name.toLowerCase().includes(id.toLowerCase()));
  }
  
  return bot;
}

/**
 * Get bots by type
 */
export function getBotsByType(type: string): BotConfig[] {
  return ALL_BOTS.filter((bot) => bot.type === type);
}

/**
 * Get bots by platform
 */
export function getBotsByPlatform(platform: string): BotConfig[] {
  return ALL_BOTS.filter((bot) => bot.platform === platform);
}

/**
 * Search bots by keyword
 */
export function searchBots(query: string): BotConfig[] {
  const lowerQuery = query.toLowerCase();
  return ALL_BOTS.filter(
    (bot) =>
      bot.name.toLowerCase().includes(lowerQuery) ||
      bot.description.toLowerCase().includes(lowerQuery) ||
      bot.type.toLowerCase().includes(lowerQuery) ||
      bot.platform.toLowerCase().includes(lowerQuery)
  );
}

