/**
 * Bot System Type Definitions
 * Types for various trading, automation, and social bots
 */

/**
 * Type of bot
 */
export type BotType =
  | "trading"
  | "scalping"
  | "telegram"
  | "discord"
  | "prediction-market"
  | "arbitrage"
  | "market-making"
  | "liquidity"
  | "monitoring"
  | "notifications"
  | "analytics"
  | "portfolio-management";

/**
 * Status of a bot
 */
export type BotStatus = "active" | "paused" | "stopped" | "error" | "configuring";

/**
 * Bot platform/network
 */
export type BotPlatform =
  | "ethereum"
  | "bsc"
  | "polygon"
  | "arbitrum"
  | "optimism"
  | "base"
  | "solana"
  | "near"
  | "aptos"
  | "multi-chain"
  | "telegram"
  | "discord"
  | "web";

/**
 * Bot configuration
 */
export interface BotConfig {
  /** Bot name */
  name: string;
  /** Bot description */
  description: string;
  /** Bot type */
  type: BotType;
  /** Platform/network */
  platform: BotPlatform;
  /** Current status */
  status: BotStatus;
  /** Configuration parameters */
  parameters: BotParameter[];
  /** Required API keys or permissions */
  requiredKeys?: string[];
  /** Estimated setup time */
  setupTime?: string;
  /** Documentation URL */
  docsUrl?: string;
  /** GitHub repository URL */
  repoUrl?: string;
  /** Support/community links */
  supportLinks?: {
    discord?: string;
    telegram?: string;
    website?: string;
  };
  /** Features list */
  features: string[];
  /** Pricing/fee information */
  pricing?: {
    type: "free" | "paid" | "freemium";
    amount?: string;
    currency?: string;
  };
}

/**
 * Bot parameter configuration
 */
export interface BotParameter {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: "string" | "number" | "boolean" | "select" | "address" | "private-key";
  /** Whether parameter is required */
  required: boolean;
  /** Default value */
  defaultValue?: string | number | boolean;
  /** Description */
  description: string;
  /** Options for select type */
  options?: string[];
  /** Validation regex or rules */
  validation?: string;
}

/**
 * Trading bot specific configuration
 */
export interface TradingBotConfig extends BotConfig {
  type: "trading" | "scalping" | "arbitrage" | "market-making";
  /** Trading pairs supported */
  tradingPairs: string[];
  /** Exchange supported */
  exchange: string;
  /** Strategy type */
  strategy: string;
  /** Risk management settings */
  riskManagement?: {
    maxPositionSize?: string;
    stopLoss?: string;
    takeProfit?: string;
  };
}

/**
 * Social bot configuration (Telegram/Discord)
 */
export interface SocialBotConfig extends BotConfig {
  type: "telegram" | "discord";
  /** Bot commands available */
  commands: string[];
  /** Permissions required */
  permissions: string[];
  /** Integration features */
  integrations?: string[];
}

/**
 * Prediction market bot configuration
 */
export interface PredictionMarketBotConfig extends BotConfig {
  type: "prediction-market";
  /** Supported markets */
  markets: string[];
  /** Market type */
  marketType: "polymarket" | "kalshi" | "augur" | "custom";
}

/**
 * Bot instance/running state
 */
export interface BotInstance {
  /** Bot ID */
  id: string;
  /** Bot configuration reference */
  botId: string;
  /** Instance name */
  name: string;
  /** Current status */
  status: BotStatus;
  /** Start time */
  startedAt?: string;
  /** Last activity time */
  lastActivity?: string;
  /** Performance metrics */
  metrics?: {
    tradesExecuted?: number;
    totalProfit?: string;
    winRate?: number;
    messagesSent?: number;
    predictionsMade?: number;
  };
  /** Error information if any */
  error?: string;
}

/**
 * Bot command result
 */
export interface BotCommandResult {
  /** Success status */
  success: boolean;
  /** Result message */
  message: string;
  /** Data payload */
  data?: any;
  /** Error information */
  error?: string;
}






