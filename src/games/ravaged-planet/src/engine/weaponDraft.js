/**
 * Weapon Draft System for PGTanks
 * Scorched Earth-style draft mechanic for weapon selection
 * Based on: SCORCHED_DRAFT_SYSTEM.md
 */

import { WEAPON_TYPES } from './constants.js';
import { sample } from './utils.js';

// Rarity tiers for weapons
export const WEAPON_RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  LEGENDARY: 'legendary'
};

// Rarity weights for pack generation
export const RARITY_WEIGHTS = {
  common: 0.55,
  uncommon: 0.30,
  rare: 0.13,
  legendary: 0.02
};

// Rarity colors for UI
export const RARITY_COLORS = {
  common: '#888888',
  uncommon: '#1eff00',
  rare: '#0070dd',
  legendary: '#a335ee'
};

/**
 * Enhanced weapon definitions with draft metadata
 * Maps existing WEAPON_TYPES to draft system
 */
export const WEAPON_DRAFT_DEFINITIONS = {
  // COMMON WEAPONS (55% chance)
  babyMissile: {
    id: 'babyMissile',
    name: 'Baby Missile',
    rarity: WEAPON_RARITIES.COMMON,
    category: 'damage',
    description: 'Small explosive projectile',
    minBundleSize: 15,
    maxBundleSize: 25,
    weight: 10,
    ...WEAPON_TYPES.babyMissile
  },
  tracer: {
    id: 'tracer',
    name: 'Tracer',
    rarity: WEAPON_RARITIES.COMMON,
    category: 'utility',
    description: 'Practice rounds with no damage',
    minBundleSize: 50,
    maxBundleSize: 100,
    weight: 5,
    ...WEAPON_TYPES.tracer
  },
  smallDirt: {
    id: 'smallDirt',
    name: 'Small Dirt',
    rarity: WEAPON_RARITIES.COMMON,
    category: 'terrain',
    description: 'Creates small terrain mounds',
    minBundleSize: 8,
    maxBundleSize: 15,
    weight: 8,
    ...WEAPON_TYPES.smallDirt
  },
  smallDigBomb: {
    id: 'smallDigBomb',
    name: 'Small Dig Bomb',
    rarity: WEAPON_RARITIES.COMMON,
    category: 'terrain',
    description: 'Small tunneling explosive',
    minBundleSize: 8,
    maxBundleSize: 15,
    weight: 7,
    ...WEAPON_TYPES.smallDigBomb
  },
  
  // UNCOMMON WEAPONS (30% chance)
  missile: {
    id: 'missile',
    name: 'Missile',
    rarity: WEAPON_RARITIES.UNCOMMON,
    category: 'damage',
    description: 'Standard explosive missile',
    minBundleSize: 8,
    maxBundleSize: 15,
    weight: 10,
    ...WEAPON_TYPES.missile
  },
  babyRoller: {
    id: 'babyRoller',
    name: 'Baby Roller',
    rarity: WEAPON_RARITIES.UNCOMMON,
    category: 'terrain',
    description: 'Small ground-rolling explosive',
    minBundleSize: 6,
    maxBundleSize: 12,
    weight: 8,
    ...WEAPON_TYPES.babyRoller
  },
  dirt: {
    id: 'dirt',
    name: 'Dirt Bomb',
    rarity: WEAPON_RARITIES.UNCOMMON,
    category: 'terrain',
    description: 'Creates medium terrain mounds',
    minBundleSize: 5,
    maxBundleSize: 10,
    weight: 7,
    ...WEAPON_TYPES.dirt
  },
  digBomb: {
    id: 'digBomb',
    name: 'Dig Bomb',
    rarity: WEAPON_RARITIES.UNCOMMON,
    category: 'terrain',
    description: 'Medium tunneling explosive',
    minBundleSize: 5,
    maxBundleSize: 10,
    weight: 7,
    ...WEAPON_TYPES.digBomb
  },
  
  // RARE WEAPONS (13% chance)
  babyNuke: {
    id: 'babyNuke',
    name: 'Baby Nuke',
    rarity: WEAPON_RARITIES.RARE,
    category: 'aoe',
    description: 'Large explosive with wide radius',
    minBundleSize: 3,
    maxBundleSize: 6,
    weight: 8,
    ...WEAPON_TYPES.babyNuke
  },
  roller: {
    id: 'roller',
    name: 'Roller',
    rarity: WEAPON_RARITIES.RARE,
    category: 'terrain',
    description: 'Ground-rolling explosive',
    minBundleSize: 4,
    maxBundleSize: 8,
    weight: 7,
    ...WEAPON_TYPES.roller
  },
  mirv: {
    id: 'mirv',
    name: 'MIRV',
    rarity: WEAPON_RARITIES.RARE,
    category: 'aoe',
    description: 'Multiple Independent Reentry Vehicle',
    minBundleSize: 3,
    maxBundleSize: 6,
    weight: 9,
    ...WEAPON_TYPES.mirv
  },
  leapfrog: {
    id: 'leapfrog',
    name: 'Leapfrog',
    rarity: WEAPON_RARITIES.RARE,
    category: 'aoe',
    description: 'Multiple sequential explosions',
    minBundleSize: 3,
    maxBundleSize: 6,
    weight: 8,
    ...WEAPON_TYPES.leapfrog
  },
  largeDirt: {
    id: 'largeDirt',
    name: 'Ton of Dirt',
    rarity: WEAPON_RARITIES.RARE,
    category: 'terrain',
    description: 'Creates large terrain mounds',
    minBundleSize: 2,
    maxBundleSize: 4,
    weight: 6,
    ...WEAPON_TYPES.largeDirt
  },
  largeDigBomb: {
    id: 'largeDigBomb',
    name: 'Large Dig Bomb',
    rarity: WEAPON_RARITIES.RARE,
    category: 'terrain',
    description: 'Large tunneling explosive',
    minBundleSize: 2,
    maxBundleSize: 4,
    weight: 6,
    ...WEAPON_TYPES.largeDigBomb
  },
  
  // LEGENDARY WEAPONS (2% chance)
  nuke: {
    id: 'nuke',
    name: 'Nuke',
    rarity: WEAPON_RARITIES.LEGENDARY,
    category: 'aoe',
    description: 'Massive nuclear explosion',
    minBundleSize: 1,
    maxBundleSize: 2,
    weight: 10,
    ...WEAPON_TYPES.nuke
  },
  superRoller: {
    id: 'superRoller',
    name: 'Super Roller',
    rarity: WEAPON_RARITIES.LEGENDARY,
    category: 'aoe',
    description: 'Devastating ground-roller',
    minBundleSize: 1,
    maxBundleSize: 3,
    weight: 9,
    ...WEAPON_TYPES.superRoller
  },
  xmirv: {
    id: 'xmirv',
    name: 'X-MIRV',
    rarity: WEAPON_RARITIES.LEGENDARY,
    category: 'aoe',
    description: 'Extended MIRV with 5 warheads',
    minBundleSize: 1,
    maxBundleSize: 2,
    weight: 10,
    ...WEAPON_TYPES.xmirv
  },
  superLeapfrog: {
    id: 'superLeapfrog',
    name: 'Super Leapfrog',
    rarity: WEAPON_RARITIES.LEGENDARY,
    category: 'aoe',
    description: 'Extended leapfrog sequence',
    minBundleSize: 1,
    maxBundleSize: 2,
    weight: 9,
    ...WEAPON_TYPES.superLeapfrog
  }
};

/**
 * Draft configuration
 */
export const DRAFT_CONFIG = {
  packsPerPlayer: 5,
  bundlesPerPack: 5,
  draftOrderMode: 'snake', // 'snake' or 'linear'
  baselineAmmo: {
    tracer: Infinity // Everyone starts with infinite tracers
  }
};

/**
 * Pick a weapon rarity based on weights
 */
export function pickWeightedRarity() {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return rarity;
    }
  }
  
  return WEAPON_RARITIES.COMMON; // Fallback
}

/**
 * Get random bundle size for a weapon
 */
export function randomBundleSize(weaponDef) {
  const min = weaponDef.minBundleSize || 1;
  const max = weaponDef.maxBundleSize || 5;
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Generate a weapon pack (5 bundles of different weapons)
 */
export function generateWeaponPack(packNumber = 0) {
  const allWeapons = Object.values(WEAPON_DRAFT_DEFINITIONS);
  const bundles = [];
  const usedWeapons = new Set();
  
  while (bundles.length < DRAFT_CONFIG.bundlesPerPack) {
    // Pick rarity
    const rarity = pickWeightedRarity();
    
    // Filter weapons by rarity
    const weaponPool = allWeapons.filter(w => 
      w.rarity === rarity && !usedWeapons.has(w.id)
    );
    
    if (weaponPool.length === 0) {
      // If no weapons of this rarity available, try any unused weapon
      const anyWeapon = allWeapons.find(w => !usedWeapons.has(w.id));
      if (!anyWeapon) break; // No more weapons available
      
      const quantity = randomBundleSize(anyWeapon);
      bundles.push({
        weaponId: anyWeapon.id,
        weaponDef: anyWeapon,
        quantity,
        rarity: anyWeapon.rarity
      });
      usedWeapons.add(anyWeapon.id);
      continue;
    }
    
    // Pick random weapon from pool
    const weapon = sample(weaponPool);
    const quantity = randomBundleSize(weapon);
    
    bundles.push({
      weaponId: weapon.id,
      weaponDef: weapon,
      quantity,
      rarity: weapon.rarity
    });
    usedWeapons.add(weapon.id);
  }
  
  return {
    id: `pack-${packNumber}`,
    bundles,
    packNumber
  };
}

/**
 * Generate all packs for a draft (one pack per player per round)
 */
export function generateDraftPacks(playerCount) {
  const packs = [];
  const totalPacks = playerCount * DRAFT_CONFIG.packsPerPlayer;
  
  for (let i = 0; i < totalPacks; i++) {
    packs.push(generateWeaponPack(i));
  }
  
  return packs;
}

/**
 * Get draft order for a specific pack (snake draft)
 */
export function getDraftOrder(playerIndices, packRound) {
  if (DRAFT_CONFIG.draftOrderMode === 'snake') {
    // Reverse order on odd rounds (0, 1, 2, 3 → 3, 2, 1, 0)
    return packRound % 2 === 0 
      ? [...playerIndices] 
      : [...playerIndices].reverse();
  }
  
  // Linear draft - same order every round
  return [...playerIndices];
}

/**
 * AI evaluation function for draft picks
 */
export function evaluateBundleForAI(bundle, aiPersonality = 'balanced') {
  const weapon = bundle.weaponDef;
  let score = 0;
  
  // Base score by category
  const categoryScores = {
    balanced: { damage: 3, aoe: 4, terrain: 2, utility: 1, special: 3 },
    aggressive: { damage: 5, aoe: 5, terrain: 1, utility: 0, special: 2 },
    defensive: { damage: 1, aoe: 2, terrain: 5, utility: 4, special: 2 },
    tactical: { damage: 2, aoe: 3, terrain: 3, utility: 3, special: 4 }
  };
  
  const personality = categoryScores[aiPersonality] || categoryScores.balanced;
  score += personality[weapon.category] || 2;
  
  // Rarity bonus
  const rarityBonus = {
    common: 1,
    uncommon: 3,
    rare: 5,
    legendary: 8
  };
  score += rarityBonus[weapon.rarity] || 1;
  
  // Quantity matters
  score += bundle.quantity * 0.3;
  
  // Weapon-specific bonuses
  if (weapon.id === 'nuke' || weapon.id === 'xmirv') {
    score += 5; // AI loves big explosions
  }
  if (weapon.id === 'roller' || weapon.id === 'superRoller') {
    score += 3; // Rollers are versatile
  }
  
  return score;
}

/**
 * AI picks best bundle from a pack
 */
export function aiPickBundle(pack, aiPersonality = 'balanced') {
  if (!pack || !pack.bundles || pack.bundles.length === 0) {
    return null;
  }
  
  // Evaluate all bundles
  const evaluatedBundles = pack.bundles.map(bundle => ({
    bundle,
    score: evaluateBundleForAI(bundle, aiPersonality)
  }));
  
  // Sort by score descending
  evaluatedBundles.sort((a, b) => b.score - a.score);
  
  // Return best bundle
  return evaluatedBundles[0].bundle;
}

/**
 * Convert drafted weapons to game inventory format
 */
export function draftToInventory(draftedBundles) {
  const inventory = {};
  
  // Add baseline weapons (tracer is always infinite)
  Object.entries(DRAFT_CONFIG.baselineAmmo).forEach(([weaponId, ammo]) => {
    inventory[weaponId] = ammo;
  });
  
  // Add drafted weapons
  draftedBundles.forEach(bundle => {
    const weaponId = bundle.weaponId;
    inventory[weaponId] = (inventory[weaponId] || 0) + bundle.quantity;
  });
  
  return inventory;
}

/**
 * Convert inventory to player.weapons format for game engine
 */
export function inventoryToWeaponsArray(inventory) {
  const weapons = [];
  
  // Sort by type priority (damage > aoe > terrain > utility)
  const priorityOrder = ['damage', 'aoe', 'terrain', 'utility', 'special'];
  const weaponEntries = Object.entries(inventory).map(([weaponId, ammo]) => ({
    weaponId,
    ammo,
    def: WEAPON_DRAFT_DEFINITIONS[weaponId],
    priority: priorityOrder.indexOf(WEAPON_DRAFT_DEFINITIONS[weaponId]?.category || 'utility')
  }));
  
  // Sort by priority, then by ammo
  weaponEntries.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.ammo === Infinity) return -1;
    if (b.ammo === Infinity) return 1;
    return b.ammo - a.ammo;
  });
  
  // Convert to game format
  weaponEntries.forEach(entry => {
    weapons.push({
      type: entry.weaponId,
      ammo: entry.ammo
    });
  });
  
  return weapons;
}

/**
 * Draft session state manager
 */
export class DraftSession {
  constructor(playerCount) {
    this.playerCount = playerCount;
    this.packs = generateDraftPacks(playerCount);
    this.currentPackIndex = 0;
    this.playerDrafts = Array(playerCount).fill(null).map(() => []);
    this.draftComplete = false;
    this.aiPersonalities = Array(playerCount).fill('balanced');
  }
  
  /**
   * Get current pack being drafted
   */
  getCurrentPack() {
    return this.packs[this.currentPackIndex] || null;
  }
  
  /**
   * Get current player whose turn it is to draft
   */
  getCurrentDrafter() {
    const packRound = Math.floor(this.currentPackIndex / this.playerCount);
    const playerIndices = Array.from({ length: this.playerCount }, (_, i) => i);
    const draftOrder = getDraftOrder(playerIndices, packRound);
    const positionInRound = this.currentPackIndex % this.playerCount;
    return draftOrder[positionInRound];
  }
  
  /**
   * Player makes a draft pick
   */
  draftBundle(playerIndex, bundleIndex) {
    const pack = this.getCurrentPack();
    if (!pack || bundleIndex < 0 || bundleIndex >= pack.bundles.length) {
      console.error('[Draft] Invalid bundle selection');
      return false;
    }
    
    const bundle = pack.bundles[bundleIndex];
    this.playerDrafts[playerIndex].push(bundle);
    
    console.log(`[Draft] Player ${playerIndex + 1} drafted: ${bundle.weaponDef.name} x${bundle.quantity}`);
    
    // Move to next pack
    this.currentPackIndex++;
    
    // Check if draft is complete
    if (this.currentPackIndex >= this.packs.length) {
      this.draftComplete = true;
      console.log('[Draft] Draft complete!');
    }
    
    return true;
  }
  
  /**
   * AI makes automatic draft pick
   */
  aiDraft(playerIndex) {
    const pack = this.getCurrentPack();
    if (!pack) return false;
    
    const personality = this.aiPersonalities[playerIndex];
    const bestBundle = aiPickBundle(pack, personality);
    
    if (!bestBundle) return false;
    
    const bundleIndex = pack.bundles.indexOf(bestBundle);
    return this.draftBundle(playerIndex, bundleIndex);
  }
  
  /**
   * Set AI personality for a player
   */
  setAIPersonality(playerIndex, personality) {
    if (playerIndex >= 0 && playerIndex < this.playerCount) {
      this.aiPersonalities[playerIndex] = personality;
    }
  }
  
  /**
   * Get final inventory for a player
   */
  getPlayerInventory(playerIndex) {
    if (playerIndex < 0 || playerIndex >= this.playerCount) {
      return {};
    }
    
    const draftedBundles = this.playerDrafts[playerIndex] || [];
    return draftToInventory(draftedBundles);
  }
  
  /**
   * Get player weapons in game engine format
   */
  getPlayerWeapons(playerIndex) {
    const inventory = this.getPlayerInventory(playerIndex);
    return inventoryToWeaponsArray(inventory);
  }
  
  /**
   * Get draft summary for all players
   */
  getDraftSummary() {
    return this.playerDrafts.map((bundles, playerIndex) => ({
      playerIndex,
      bundles,
      inventory: this.getPlayerInventory(playerIndex),
      weapons: this.getPlayerWeapons(playerIndex)
    }));
  }
  
  /**
   * Get progress information
   */
  getProgress() {
    return {
      currentPack: this.currentPackIndex + 1,
      totalPacks: this.packs.length,
      currentDrafter: this.getCurrentDrafter(),
      packsRemaining: this.packs.length - this.currentPackIndex,
      complete: this.draftComplete,
      progressPercent: Math.round((this.currentPackIndex / this.packs.length) * 100)
    };
  }
}

/**
 * Global draft session instance
 */
let globalDraftSession = null;

/**
 * Initialize a new draft session
 */
export function initDraftSession(playerCount) {
  globalDraftSession = new DraftSession(playerCount);
  console.log('[Draft] Initialized draft session for', playerCount, 'players');
  console.log('[Draft] Total packs to draft:', globalDraftSession.packs.length);
  return globalDraftSession;
}

/**
 * Get current draft session
 */
export function getDraftSession() {
  return globalDraftSession;
}

/**
 * Clear draft session
 */
export function clearDraftSession() {
  globalDraftSession = null;
}

/**
 * Check if draft is enabled
 */
export function isDraftEnabled() {
  return globalDraftSession !== null && !globalDraftSession.draftComplete;
}

/**
 * Export session to/from localStorage for persistence
 */
export function saveDraftSession() {
  if (!globalDraftSession) return;
  
  try {
    const data = {
      playerCount: globalDraftSession.playerCount,
      currentPackIndex: globalDraftSession.currentPackIndex,
      playerDrafts: globalDraftSession.playerDrafts,
      aiPersonalities: globalDraftSession.aiPersonalities,
      draftComplete: globalDraftSession.draftComplete
    };
    
    localStorage.setItem('pgt-draft-session', JSON.stringify(data));
  } catch (e) {
    console.error('[Draft] Failed to save session:', e);
  }
}

export function loadDraftSession() {
  try {
    const data = localStorage.getItem('pgt-draft-session');
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    const session = new DraftSession(parsed.playerCount);
    session.currentPackIndex = parsed.currentPackIndex;
    session.playerDrafts = parsed.playerDrafts;
    session.aiPersonalities = parsed.aiPersonalities;
    session.draftComplete = parsed.draftComplete;
    
    globalDraftSession = session;
    console.log('[Draft] Loaded draft session from localStorage');
    return session;
  } catch (e) {
    console.error('[Draft] Failed to load session:', e);
    return null;
  }
}









