/**
 * API Client Module Exports
 *
 * Main entry point for all external API integrations.
 * Provides namespace imports for each service.
 *
 * Usage:
 *   import { dexscreener, defillama, alphavantage, opensea, magiceden, chaingpt, cryptonews } from '@/lib/api'
 *   const result = await dexscreener.searchTokens('WETH')
 *   const nfts = await opensea.getCollectionNFTs('azuki')
 *   const response = await chaingpt.chatBlob({ question: 'What is DeFi?' })
 *   const news = await cryptonews.getNews({ filter: 'hot' })
 */

export * as dexscreener from "./dexscreener";
export * as geckoterminal from "./geckoterminal";
export * as alphavantage from "./alphavantage";
export * as defillama from "./defillama";
export * as pgt from "./pgt";
export * as opensea from "./opensea";
export * as magiceden from "./magiceden";
export * as pinata from "./pinata";
export * as chaingpt from "./chaingpt";
export * as cryptonews from "./cryptonews";
export * as referral from "./referral";
export * as kalshi from "./kalshi";
export * as rubic from "./rubic";
