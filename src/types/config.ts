/**
 * Configuration Type Definitions
 * Type definitions for the Omega Terminal configuration system
 */

import type { ChainGPTCapabilities } from "./chaingpt";

/**
 * Network configuration for blockchain connections
 */
export interface NetworkConfig {
  /** Hexadecimal chain ID (e.g., "0x4e454228") */
  chainId: string;
  /** Decimal representation of chain ID */
  chainIdDecimal: number;
  /** Human-readable network name */
  chainName: string;
  /** Native currency configuration */
  nativeCurrency: {
    /** Currency name */
    name: string;
    /** Currency symbol */
    symbol: string;
    /** Number of decimal places */
    decimals: number;
  };
  /** Array of RPC endpoint URLs */
  rpcUrls: string[];
  /** Array of block explorer URLs */
  blockExplorerUrls: string[];
}

/**
 * ChainGPT API configuration
 */
export interface ChainGPTConfig {
  /** ChainGPT API base URL */
  BASE_URL: string;
  /** Chat endpoint path */
  CHAT_ENDPOINT: string;
  /** NFT generation endpoint path */
  NFT_ENDPOINT: string;
  /** Smart contract generation endpoint path */
  SMART_CONTRACT_ENDPOINT: string;
  /** Contract auditor endpoint path */
  AUDITOR_ENDPOINT: string;
  /** Default AI model to use */
  DEFAULT_MODEL: string;
  /** Smart contract generator model */
  SMART_CONTRACT_MODEL: string;
  /** Contract auditor model */
  AUDITOR_MODEL: string;
  /** Whether to auto-initialize with available server capabilities */
  AUTO_INITIALIZE: boolean;
  /** Static feature toggle defaults */
  FEATURES: {
    /** Chat and basic Q&A */
    chat: boolean;
    /** Streaming chat responses */
    stream: boolean;
    /** Smart contract generation */
    contract: boolean;
    /** Contract auditing */
    auditor: boolean;
    /** NFT generation */
    nft: boolean;
  };
  /** Load sanitized capability flags from the server */
  loadCapabilities: () => Promise<ChainGPTCapabilities>;
}

/**
 * Smart contract configuration
 */
export interface ContractConfig {
  /** Contract address */
  address: string;
  /** Contract ABI (Application Binary Interface) */
  abi: any[];
}

/**
 * Main Omega Terminal configuration
 */
export interface OmegaConfig {
  /** Application version */
  VERSION: string;
  /** Relayer server URL */
  RELAYER_URL: string;
  /** Omega Network RPC URL */
  OMEGA_RPC_URL: string;
  /** SimpleMiner contract address */
  CONTRACT_ADDRESS: string;
  /** Faucet contract address */
  FAUCET_ADDRESS: string;
  /** Miner faucet contract address */
  MINER_FAUCET_ADDRESS: string;
  /** Mixer contract address */
  MIXER_ADDRESS: string;
  /** Omega NFT ERC-721 contract address */
  OMEGA_NFT_CONTRACT: string;
  /** SimpleMiner contract ABI */
  CONTRACT_ABI: any[];
  /** Faucet contract ABI */
  FAUCET_ABI: any[];
  /** Miner faucet contract ABI */
  MINER_FAUCET_ABI: any[];
  /** Mixer contract ABI */
  MIXER_ABI: any[];
  /** Omega NFT ERC-721 contract ABI */
  OMEGA_NFT_ABI: any[];
  /** Arcade contract address for on-chain game leaderboards */
  ARCADE_CONTRACT_ADDRESS: string;
  /** Arcade contract ABI */
  ARCADE_CONTRACT_ABI: any[];
  /** Arcade base URL for external game hosting */
  ARCADE_BASE_URL: string;
  /** OpenSea API base URL (v2) */
  OPENSEA_API_BASE_URL: string;
  /** OpenSea API v1 URL */
  OPENSEA_V1_URL: string;
  /** Omega Network Wildcard API base URL for referral system */
  REFERRAL_API_BASE?: string;
  /** Omega Ambassador API base URL for leaderboards */
  AMBASSADOR_API_BASE?: string;
  /** Omega Perps trading interface base URL */
  PERPS_BASE_URL?: string;
  /** Omega Network configuration */
  OMEGA_NETWORK: NetworkConfig;
  /** Available terminal commands for autocomplete */
  AVAILABLE_COMMANDS: string[];
  /** Available themes */
  THEMES: string[];
  /** ChainGPT API configuration */
  CHAINGPT: ChainGPTConfig;
  /** Solana mainnet RPC endpoint */
  SOLANA_RPC_URL: string;
  /** Fallback Solana RPC endpoints */
  SOLANA_FALLBACK_RPCS?: string[];
  /** NEAR Protocol mainnet RPC endpoint */
  NEAR_RPC_URL: string;
  /** NEAR wallet URL for authentication */
  NEAR_WALLET_URL: string;
  /** Eclipse network RPC endpoint */
  ECLIPSE_RPC_URL: string;
  /** SOLAR token address on Eclipse network */
  SOLAR_TOKEN_ADDRESS: string;
  /** Jupiter aggregator API URL */
  JUPITER_API_URL: string;
  /** Solar DEX API URL for Eclipse network */
  SOLAR_DEX_API_URL: string;
  /** Deserialize aggregator API URL for Eclipse network */
  DESERIALIZE_API_URL: string;
  /** Spotify player configuration */
  SPOTIFY_CONFIG: {
    /** Spotify OAuth client ID */
    CLIENT_ID: string;
    /** OAuth redirect URI */
    REDIRECT_URI: string;
    /** OAuth scopes array */
    SCOPES: string[];
    /** Spotify token endpoint */
    TOKEN_ENDPOINT: string;
  };
  /** YouTube player configuration */
  YOUTUBE_CONFIG: {
    /** YouTube OAuth client ID */
    CLIENT_ID: string;
    /** YouTube Data API v3 key */
    API_KEY: string;
    /** Search results limit */
    SEARCH_RESULTS_LIMIT: number;
    /** Default channel ID */
    DEFAULT_CHANNEL_ID: string;
    /** Default channel handle */
    DEFAULT_CHANNEL_HANDLE: string;
    /** Default channel name */
    DEFAULT_CHANNEL_NAME: string;
  };
}
