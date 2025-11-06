/**
 * Farming System Type Definitions
 * Types for testnet farming opportunities, contract deployment, and automated flows
 */

/**
 * Type of farming opportunity
 */
export type FarmingType = "airdrop" | "liquidity" | "general" | "staking" | "nft" | "defi";

/**
 * Status of a farming opportunity
 */
export type FarmingStatus = "active" | "upcoming" | "ended" | "paused";

/**
 * Network identifier for farming
 */
export type FarmingNetworkId =
  | "ethereum-testnet"
  | "bsc-testnet"
  | "polygon-testnet"
  | "arbitrum-testnet"
  | "optimism-testnet"
  | "base-testnet"
  | "solana-testnet"
  | "near-testnet"
  | "aptos-testnet"
  | "rome-testnet"
  | "fair-testnet"
  | "monad-testnet"
  | "eclipse-testnet";

/**
 * Farming opportunity information
 */
export interface FarmingOpportunity {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Type of farming opportunity */
  type: FarmingType;
  /** Current status */
  status: FarmingStatus;
  /** Network this opportunity is on */
  network: FarmingNetworkId;
  /** Contract addresses related to this opportunity */
  contracts: {
    /** Main contract address */
    main?: string;
    /** Additional contract addresses */
    additional?: string[];
  };
  /** Discord community URL */
  discordUrl?: string;
  /** Telegram community URL */
  telegramUrl?: string;
  /** Requirements to participate */
  requirements: string[];
  /** Reward information */
  rewardInfo?: {
    /** Description of rewards */
    description: string;
    /** Token symbol if applicable */
    token?: string;
    /** Estimated value or amount */
    estimatedValue?: string;
  };
  /** Start date (if applicable) */
  startDate?: string;
  /** End date (if applicable) */
  endDate?: string;
  /** Official website URL */
  websiteUrl?: string;
  /** Explorer URL for transactions */
  explorerUrl?: string;
}

/**
 * Network configuration for farming
 */
export interface FarmingNetwork {
  /** Network identifier */
  id: FarmingNetworkId;
  /** Display name */
  name: string;
  /** Network type */
  type: "evm" | "solana" | "near" | "aptos" | "custom";
  /** RPC endpoint URL */
  rpcUrl: string;
  /** Chain ID (for EVM chains) */
  chainId?: number;
  /** Block explorer URL */
  explorerUrl: string;
  /** Faucet URL */
  faucetUrl?: string;
  /** Testnet status */
  isTestnet: boolean;
  /** Native token symbol */
  nativeToken: string;
  /** Additional network info */
  metadata?: {
    [key: string]: any;
  };
}

/**
 * Contract template for deployment
 */
export interface ContractTemplate {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Contract type */
  type: "erc20" | "erc721" | "erc1155" | "simple" | "custom";
  /** Networks this template supports */
  supportedNetworks: FarmingNetworkId[];
  /** Contract source code or template */
  sourceCode?: string;
  /** Deployment parameters */
  deploymentParams: {
    /** Parameter name */
    name: string;
    /** Parameter type */
    type: string;
    /** Whether parameter is required */
    required: boolean;
    /** Default value if any */
    defaultValue?: string;
    /** Description */
    description?: string;
  }[];
  /** Estimated gas cost */
  estimatedGas?: string;
  /** Template file path (if stored locally) */
  templatePath?: string;
}

/**
 * Automated farming flow definition
 */
export interface FarmingFlow {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Network this flow runs on */
  network: FarmingNetworkId;
  /** Steps in the flow */
  steps: FarmingFlowStep[];
  /** Estimated completion time */
  estimatedTime?: string;
  /** Required wallet balance */
  requiredBalance?: string;
  /** Automation level */
  automationLevel: "manual" | "semi-automated" | "fully-automated";
  /** Associated opportunity ID */
  opportunityId?: string;
}

/**
 * Individual step in a farming flow
 */
export interface FarmingFlowStep {
  /** Step number */
  stepNumber: number;
  /** Step name */
  name: string;
  /** Step description */
  description: string;
  /** Action type */
  actionType: "deploy" | "transfer" | "interact" | "approve" | "claim" | "custom";
  /** Contract address to interact with (if applicable) */
  contractAddress?: string;
  /** Function to call (if applicable) */
  functionName?: string;
  /** Parameters for the function */
  parameters?: {
    name: string;
    value: string;
    type: string;
  }[];
  /** Estimated gas cost */
  estimatedGas?: string;
  /** Whether this step is optional */
  optional?: boolean;
}

/**
 * Farming command result
 */
export interface FarmingCommandResult {
  /** Success status */
  success: boolean;
  /** Result message */
  message: string;
  /** Data payload (if any) */
  data?: any;
  /** Error information (if failed) */
  error?: string;
}

