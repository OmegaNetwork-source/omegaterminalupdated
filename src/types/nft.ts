/**
 * NFT Type Definitions
 *
 * Type definitions for NFT marketplace data structures used across
 * OpenSea, Magic Eden, and on-chain minting integrations.
 */

/**
 * NFT Metadata structure following ERC-721 standard
 */
export interface NFTMetadata {
  name: string;
  description?: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * OpenSea NFT data structure from API v2
 */
export interface OpenSeaNFT {
  identifier: string;
  name?: string;
  description?: string;
  image_url?: string;
  display_image_url?: string;
  animation_url?: string;
  collection: string;
  token_standard?: string;
  contract?: string;
  listing?: {
    price: {
      current: {
        value: number;
        decimals: number;
        currency: string;
      };
    };
  };
  orders?: any[];
  sell_orders?: any[];
}

/**
 * OpenSea Collection data structure
 */
export interface OpenSeaCollection {
  collection: string;
  name: string;
  description: string;
  image_url?: string;
  banner_image_url?: string;
  owner?: string;
  category?: string;
  contracts: Array<{
    address: string;
    chain: string;
  }>;
  total_supply?: number;
  created_date?: string;
}

/**
 * OpenSea Collection statistics
 */
export interface OpenSeaStats {
  total: {
    volume: number;
    sales: number;
    average_price: number;
    num_owners: number;
    market_cap: number;
    floor_price: number;
    floor_price_symbol: string;
  };
  intervals: Array<{
    interval: string;
    volume: number;
    volume_diff: number;
    volume_change: number;
    sales: number;
    sales_diff: number;
    average_price: number;
  }>;
}

/**
 * Magic Eden NFT listing from Solana marketplace
 */
export interface MagicEdenListing {
  price?: number;
  priceInfo?: {
    solPrice?: number;
  };
  extra?: {
    img?: string;
  };
  token?: {
    name?: string;
    image?: string;
  };
  tokenName?: string;
  name?: string;
  img?: string;
  image?: string;
}

/**
 * Magic Eden collection statistics
 */
export interface MagicEdenStats {
  symbol: string;
  name?: string;
  floorPrice?: number;
  volumeAll?: number;
  avgPrice24hr?: number;
  listedCount?: number;
}

/**
 * Magic Eden activity/transaction data
 */
export interface MagicEdenActivity {
  type: string;
  price?: number;
  priceInfo?: {
    solPrice?: number;
  };
  blockTime?: number;
}

/**
 * Minted NFT record stored locally
 */
export interface MintedNFT {
  tokenId: string;
  name: string;
  description?: string;
  contract: string;
  ipfsUrl: string;
  txHash: string;
  mintedAt: string;
}

/**
 * NFT trait/attribute for metadata
 */
export interface NFTTrait {
  trait_type: string;
  value: string | number;
}
