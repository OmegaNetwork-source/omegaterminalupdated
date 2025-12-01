/**
 * Forecast Arena Loot Box System
 *
 * Defines loot box tiers, rewards, and probability tables
 */

import type { LootBoxReward, InventoryItem } from "@/types/forecast-arena";

export type LootBoxTier = "bronze" | "silver" | "gold" | "omega";

export interface LootBoxConfig {
  tier: LootBoxTier;
  cost: number;
  rewards: Array<{
    type: InventoryItem["type"];
    weight: number; // Probability weight
    minValue: number;
    maxValue: number;
    name: string;
    description: string;
  }>;
}

export const LOOT_BOX_CONFIGS: Record<LootBoxTier, LootBoxConfig> = {
  bronze: {
    tier: "bronze",
    cost: 100,
    rewards: [
      {
        type: "credits",
        weight: 40,
        minValue: 50,
        maxValue: 150,
        name: "Credits",
        description: "A small amount of credits",
      },
      {
        type: "xp_boost",
        weight: 35,
        minValue: 50,
        maxValue: 100,
        name: "XP Boost",
        description: "Bonus XP for your next battle",
      },
      {
        type: "cosmetic",
        weight: 20,
        minValue: 1,
        maxValue: 1,
        name: "Cosmetic Mod",
        description: "A cosmetic enhancement for your terminal",
      },
      {
        type: "lore_fragment",
        weight: 5,
        minValue: 1,
        maxValue: 1,
        name: "Lore Fragment",
        description: "A piece of Omega Terminal lore",
      },
    ],
  },
  silver: {
    tier: "silver",
    cost: 250,
    rewards: [
      {
        type: "credits",
        weight: 35,
        minValue: 150,
        maxValue: 300,
        name: "Credits",
        description: "A moderate amount of credits",
      },
      {
        type: "xp_boost",
        weight: 30,
        minValue: 100,
        maxValue: 200,
        name: "XP Boost",
        description: "Significant XP boost",
      },
      {
        type: "cosmetic",
        weight: 25,
        minValue: 1,
        maxValue: 1,
        name: "Rare Cosmetic",
        description: "A rare cosmetic enhancement",
      },
      {
        type: "lore_fragment",
        weight: 10,
        minValue: 1,
        maxValue: 1,
        name: "Lore Fragment",
        description: "A piece of Omega Terminal lore",
      },
    ],
  },
  gold: {
    tier: "gold",
    cost: 500,
    rewards: [
      {
        type: "credits",
        weight: 30,
        minValue: 300,
        maxValue: 600,
        name: "Credits",
        description: "A large amount of credits",
      },
      {
        type: "xp_boost",
        weight: 25,
        minValue: 200,
        maxValue: 400,
        name: "XP Boost",
        description: "Massive XP boost",
      },
      {
        type: "cosmetic",
        weight: 30,
        minValue: 1,
        maxValue: 1,
        name: "Epic Cosmetic",
        description: "An epic cosmetic enhancement",
      },
      {
        type: "lore_fragment",
        weight: 15,
        minValue: 1,
        maxValue: 1,
        name: "Rare Lore Fragment",
        description: "A rare piece of Omega Terminal lore",
      },
    ],
  },
  omega: {
    tier: "omega",
    cost: 1000,
    rewards: [
      {
        type: "credits",
        weight: 25,
        minValue: 600,
        maxValue: 1200,
        name: "Credits",
        description: "A massive amount of credits",
      },
      {
        type: "xp_boost",
        weight: 20,
        minValue: 400,
        maxValue: 800,
        name: "XP Boost",
        description: "Legendary XP boost",
      },
      {
        type: "cosmetic",
        weight: 35,
        minValue: 1,
        maxValue: 1,
        name: "Legendary Cosmetic",
        description: "A legendary cosmetic enhancement",
      },
      {
        type: "lore_fragment",
        weight: 20,
        minValue: 1,
        maxValue: 1,
        name: "Legendary Lore Fragment",
        description: "A legendary piece of Omega Terminal lore",
      },
    ],
  },
};

/**
 * Open a loot box and generate a random reward
 */
export function openLootBox(tier: LootBoxTier): LootBoxReward {
  const config = LOOT_BOX_CONFIGS[tier];
  if (!config) {
    throw new Error(`Invalid loot box tier: ${tier}`);
  }

  // Calculate total weight
  const totalWeight = config.rewards.reduce((sum, reward) => sum + reward.weight, 0);

  // Random selection based on weights
  let random = Math.random() * totalWeight;
  let selectedReward = config.rewards[0]!;

  for (const reward of config.rewards) {
    random -= reward.weight;
    if (random <= 0) {
      selectedReward = reward;
      break;
    }
  }

  // Generate value within range
  const value =
    selectedReward.minValue === selectedReward.maxValue
      ? selectedReward.minValue
      : Math.floor(
          Math.random() * (selectedReward.maxValue - selectedReward.minValue + 1) +
            selectedReward.minValue
        );

  return {
    type: selectedReward.type,
    name: selectedReward.name,
    value,
    description: selectedReward.description,
  };
}

/**
 * Convert loot box reward to inventory item
 */
export function rewardToInventoryItem(reward: LootBoxReward): InventoryItem {
  return {
    id: `loot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: reward.type,
    name: reward.name,
    value: reward.value,
    description: reward.description,
    obtainedAt: Date.now(),
  };
}











