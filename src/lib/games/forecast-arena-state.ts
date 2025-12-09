/**
 * Forecast Arena State Management
 *
 * Manages player state, XP, credits, faction membership, and inventory
 * using localStorage. Designed to be easily migrated to backend API calls.
 */

import type {
  PlayerState,
  InventoryItem,
  FactionState,
  FactionName,
  Sector,
} from "@/types/forecast-arena";

const STORAGE_KEY = "omega_forecast_arena_state";
const FACTION_STORAGE_KEY = "omega_forecast_arena_factions";
const DEFAULT_STATE: PlayerState = {
  xp: 0,
  credits: 500, // Starting credits
  faction: null,
  level: 1,
  inventory: [],
  stats: {
    totalForecasts: 0,
    correctForecasts: 0,
    streak: 0,
    bestStreak: 0,
    battlesWon: 0,
    battlesLost: 0,
  },
  dailyGauntlet: {
    completed: false,
    lastCompleted: 0,
    bestScore: 0,
    currentStreak: 0,
  },
};

/**
 * Calculate player level from XP
 * Level formula: level = floor(sqrt(xp / 100)) + 1
 */
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Get current player state from localStorage
 */
export function getPlayerState(): PlayerState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_STATE;
    }

    const state = JSON.parse(stored) as PlayerState;
    // Ensure all required fields exist
    return {
      ...DEFAULT_STATE,
      ...state,
      stats: {
        ...DEFAULT_STATE.stats,
        ...state.stats,
      },
      dailyGauntlet: {
        ...DEFAULT_STATE.dailyGauntlet,
        ...state.dailyGauntlet,
      },
    };
  } catch (error) {
    console.error("[ForecastArena] Failed to load player state:", error);
    return DEFAULT_STATE;
  }
}

/**
 * Save player state to localStorage
 */
export function savePlayerState(state: PlayerState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Recalculate level from XP
    const updatedState = {
      ...state,
      level: calculateLevel(state.xp),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
  } catch (error) {
    console.error("[ForecastArena] Failed to save player state:", error);
  }
}

/**
 * Add XP to player with optional boost multiplier
 */
export function addXP(amount: number, boost: number = 1.0): number {
  const state = getPlayerState();
  const xpGained = Math.floor(amount * boost);
  const newState = {
    ...state,
    xp: state.xp + xpGained,
  };
  savePlayerState(newState);
  return xpGained;
}

/**
 * Add credits to player
 */
export function addCredits(amount: number): number {
  const state = getPlayerState();
  const newState = {
    ...state,
    credits: state.credits + amount,
  };
  savePlayerState(newState);
  return newState.credits;
}

/**
 * Spend credits (returns false if insufficient)
 */
export function spendCredits(amount: number): boolean {
  const state = getPlayerState();
  if (state.credits < amount) {
    return false;
  }
  const newState = {
    ...state,
    credits: state.credits - amount,
  };
  savePlayerState(newState);
  return true;
}

/**
 * Set player faction
 */
export function setFaction(faction: FactionName | null): void {
  const state = getPlayerState();
  const newState = {
    ...state,
    faction,
  };
  savePlayerState(newState);
}

/**
 * Add item to inventory
 */
export function addInventoryItem(item: InventoryItem): void {
  const state = getPlayerState();
  const newState = {
    ...state,
    inventory: [...state.inventory, item],
  };
  savePlayerState(newState);
}

/**
 * Remove item from inventory
 */
export function removeInventoryItem(itemId: string): boolean {
  const state = getPlayerState();
  const itemIndex = state.inventory.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) {
    return false;
  }
  const newState = {
    ...state,
    inventory: state.inventory.filter((item) => item.id !== itemId),
  };
  savePlayerState(newState);
  return true;
}

/**
 * Update forecast statistics
 */
export function updateForecastStats(
  correct: boolean,
  streak: number | null = null
): void {
  const state = getPlayerState();
  const newStats = {
    ...state.stats,
    totalForecasts: state.stats.totalForecasts + 1,
    correctForecasts: state.stats.correctForecasts + (correct ? 1 : 0),
    streak: streak !== null ? streak : (correct ? state.stats.streak + 1 : 0),
    bestStreak: Math.max(
      state.stats.bestStreak,
      streak !== null ? streak : (correct ? state.stats.streak + 1 : 0)
    ),
  };
  const newState = {
    ...state,
    stats: newStats,
  };
  savePlayerState(newState);
}

/**
 * Update battle results
 */
export function updateBattleResult(won: boolean): void {
  const state = getPlayerState();
  const newStats = {
    ...state.stats,
    battlesWon: state.stats.battlesWon + (won ? 1 : 0),
    battlesLost: state.stats.battlesLost + (won ? 0 : 1),
  };
  const newState = {
    ...state,
    stats: newStats,
  };
  savePlayerState(newState);
}

/**
 * Get daily gauntlet state
 */
export function getDailyGauntletState(): PlayerState["dailyGauntlet"] {
  const state = getPlayerState();
  const now = Date.now();
  const lastCompleted = state.dailyGauntlet.lastCompleted;
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Reset if a day has passed
  if (lastCompleted > 0 && now - lastCompleted > oneDayMs) {
    const newState = {
      ...state,
      dailyGauntlet: {
        ...state.dailyGauntlet,
        completed: false,
        currentStreak: 0,
      },
    };
    savePlayerState(newState);
    return newState.dailyGauntlet;
  }

  return state.dailyGauntlet;
}

/**
 * Mark daily gauntlet as completed
 */
export function completeDailyGauntlet(score: number): void {
  const state = getPlayerState();
  const newGauntlet = {
    completed: true,
    lastCompleted: Date.now(),
    bestScore: Math.max(state.dailyGauntlet.bestScore, score),
    currentStreak: state.dailyGauntlet.currentStreak + 1,
  };
  const newState = {
    ...state,
    dailyGauntlet: newGauntlet,
  };
  savePlayerState(newState);
}

/**
 * Get faction stats (aggregated from all players)
 * For now, returns mock data. In backend, this would query database.
 */
export function getFactionStats(): Record<FactionName, FactionState> {
  if (typeof window === "undefined") {
    return getDefaultFactionStats();
  }

  try {
    const stored = localStorage.getItem(FACTION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("[ForecastArena] Failed to load faction stats:", error);
  }

  return getDefaultFactionStats();
}

/**
 * Get default faction stats
 */
function getDefaultFactionStats(): Record<FactionName, FactionState> {
  return {
    "NEURA-7": {
      name: "NEURA-7",
      members: 0,
      controlPoints: 0,
      territories: {
        tech: 0,
        crypto: 0,
        politics: 0,
        culture: 0,
        shadow: 0,
      },
    },
    "BETA-ZERO": {
      name: "BETA-ZERO",
      members: 0,
      controlPoints: 0,
      territories: {
        tech: 0,
        crypto: 0,
        politics: 0,
        culture: 0,
        shadow: 0,
      },
    },
    "SIGMA-X": {
      name: "SIGMA-X",
      members: 0,
      controlPoints: 0,
      territories: {
        tech: 0,
        crypto: 0,
        politics: 0,
        culture: 0,
        shadow: 0,
      },
    },
    "ECHO-4": {
      name: "ECHO-4",
      members: 0,
      controlPoints: 0,
      territories: {
        tech: 0,
        crypto: 0,
        politics: 0,
        culture: 0,
        shadow: 0,
      },
    },
    "PHI-VOID": {
      name: "PHI-VOID",
      members: 0,
      controlPoints: 0,
      territories: {
        tech: 0,
        crypto: 0,
        politics: 0,
        culture: 0,
        shadow: 0,
      },
    },
  };
}

/**
 * Add control points to faction for a sector
 */
export function addFactionControlPoints(
  faction: FactionName,
  sector: Sector,
  points: number
): void {
  const stats = getFactionStats();
  if (!stats[faction]) {
    return;
  }

  stats[faction].controlPoints += points;
  stats[faction].territories[sector] =
    (stats[faction].territories[sector] || 0) + points;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(FACTION_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error("[ForecastArena] Failed to save faction stats:", error);
    }
  }
}

/**
 * Increment faction member count
 */
export function incrementFactionMembers(faction: FactionName): void {
  const stats = getFactionStats();
  if (!stats[faction]) {
    return;
  }

  stats[faction].members += 1;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(FACTION_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error("[ForecastArena] Failed to save faction stats:", error);
    }
  }
}












