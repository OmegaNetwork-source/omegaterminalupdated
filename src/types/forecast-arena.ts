/**
 * Forecast Arena Game Type Definitions
 *
 * Type definitions for the Omega Forecast Arena game system
 */

export interface PlayerState {
  xp: number;
  credits: number;
  faction: string | null;
  level: number;
  inventory: InventoryItem[];
  stats: {
    totalForecasts: number;
    correctForecasts: number;
    streak: number;
    bestStreak: number;
    battlesWon: number;
    battlesLost: number;
  };
  dailyGauntlet: {
    completed: boolean;
    lastCompleted: number;
    bestScore: number;
    currentStreak: number;
  };
}

export interface InventoryItem {
  id: string;
  type: "xp_boost" | "credits" | "cosmetic" | "lore_fragment";
  name: string;
  value: number;
  description: string;
  obtainedAt: number;
}

export interface FactionState {
  name: string;
  members: number;
  controlPoints: number;
  territories: Record<string, number>;
}

export interface AIAgent {
  id: string;
  name: string;
  faction: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  baseAccuracy: number;
  specialties: string[];
}

export interface PredictionRound {
  marketId: string;
  question: string;
  playerForecast: number | null;
  aiForecast: number;
  actualOutcome: number | null;
  sector: string;
  timestamp: number;
}

export interface BattleResult {
  rounds: PredictionRound[];
  playerScore: number;
  aiScore: number;
  winner: "player" | "ai" | "tie";
  xpEarned: number;
  creditsEarned: number;
}

export interface LootBoxReward {
  type: InventoryItem["type"];
  name: string;
  value: number;
  description: string;
}

export const FACTIONS = [
  "NEURA-7",
  "BETA-ZERO",
  "SIGMA-X",
  "ECHO-4",
  "PHI-VOID",
] as const;

export type FactionName = typeof FACTIONS[number];

export const SECTORS = [
  "tech",
  "crypto",
  "politics",
  "culture",
  "shadow",
] as const;

export type Sector = typeof SECTORS[number];











