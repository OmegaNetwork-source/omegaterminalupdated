/**
 * Farming API Service
 * Fetches live farming opportunities from various sources
 */

import type { FarmingOpportunity } from "@/types/farming";
import { FARMING_OPPORTUNITIES } from "@/lib/data/farming-opportunities";

/**
 * Fetch farming opportunities from external APIs
 * Currently uses hardcoded data but can be extended with real API calls
 */
export async function fetchFarmingOpportunities(): Promise<FarmingOpportunity[]> {
  try {
    // TODO: Add real API integrations here
    // Example sources:
    // - Airdrop aggregator APIs
    // - DeFi protocol APIs
    // - Testnet activity trackers
    
    // For now, return enhanced hardcoded data
    // In the future, this could fetch from:
    // - https://airdrop.xyz/api/opportunities
    // - Custom farming tracker APIs
    // - Protocol-specific APIs
    
    return FARMING_OPPORTUNITIES;
  } catch (error) {
    console.error("Error fetching farming opportunities:", error);
    // Fallback to hardcoded data
    return FARMING_OPPORTUNITIES;
  }
}

/**
 * Fetch opportunities from a specific network
 */
export async function fetchOpportunitiesByNetwork(
  networkId: string
): Promise<FarmingOpportunity[]> {
  const allOpportunities = await fetchFarmingOpportunities();
  return allOpportunities.filter((opp) => opp.network === networkId);
}

/**
 * Search for opportunities by keyword
 */
export async function searchOpportunities(
  query: string
): Promise<FarmingOpportunity[]> {
  const allOpportunities = await fetchFarmingOpportunities();
  const lowerQuery = query.toLowerCase();
  
  return allOpportunities.filter(
    (opp) =>
      opp.name.toLowerCase().includes(lowerQuery) ||
      opp.description.toLowerCase().includes(lowerQuery) ||
      opp.network.toLowerCase().includes(lowerQuery) ||
      opp.type.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Fetch opportunities from external airdrop tracker
 * This is a placeholder for future API integration
 */
export async function fetchFromAirdropTracker(): Promise<FarmingOpportunity[]> {
  try {
    // Example: Fetch from airdrop aggregator
    // const response = await fetch('https://api.airdrop.xyz/opportunities');
    // const data = await response.json();
    // return transformToFarmingOpportunities(data);
    
    // For now, return empty array (will be enhanced with real API)
    return [];
  } catch (error) {
    console.error("Error fetching from airdrop tracker:", error);
    return [];
  }
}

/**
 * Fetch opportunities from DeFi protocol APIs
 */
export async function fetchFromDeFiProtocols(): Promise<FarmingOpportunity[]> {
  try {
    // Example integrations:
    // - LayerZero: https://api.layerzero.network/testnet-campaigns
    // - Stargate: https://api.stargate.finance/testnet-farming
    // - zkSync: https://api.zksync.io/testnet-opportunities
    
    return [];
  } catch (error) {
    console.error("Error fetching from DeFi protocols:", error);
    return [];
  }
}

/**
 * Refresh opportunities cache
 */
export async function refreshOpportunities(): Promise<FarmingOpportunity[]> {
  // Combine data from multiple sources
  const [hardcoded, airdropTracker, defiProtocols] = await Promise.all([
    fetchFarmingOpportunities(),
    fetchFromAirdropTracker(),
    fetchFromDeFiProtocols(),
  ]);

  // Merge and deduplicate
  const allOpportunities = [
    ...hardcoded,
    ...airdropTracker,
    ...defiProtocols,
  ];

  // Remove duplicates based on ID
  const uniqueOpportunities = Array.from(
    new Map(allOpportunities.map((opp) => [opp.id, opp])).values()
  );

  return uniqueOpportunities;
}






