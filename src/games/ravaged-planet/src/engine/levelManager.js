/**
 * Level Manager
 * Handles level progression and map cycling
 */

let currentLevel = 1;
let levelHistory = [];
const TERRAIN_TYPES = ['mountain', 'sand', 'volcano', 'wasteland', 'city', 'forest'];

export function getCurrentLevel() {
  return currentLevel;
}

export function getLevelHistory() {
  return [...levelHistory];
}

export function nextLevel() {
  currentLevel++;
  levelHistory.push({
    level: currentLevel - 1,
    timestamp: Date.now()
  });
  return currentLevel;
}

export function resetLevels() {
  currentLevel = 1;
  levelHistory = [];
}

export function getRandomTerrainType() {
  // Cycle through terrain types based on level
  // Add some randomness within the cycle to ensure variety
  const baseIndex = (currentLevel - 1) % TERRAIN_TYPES.length;
  // Add slight randomization to ensure each level feels fresh
  // Use level number as seed for consistent randomness per level
  const seed = currentLevel * 7 + Math.floor(currentLevel / 3);
  const randomOffset = (seed % 3) - 1; // -1, 0, or 1 (deterministic per level)
  const index = Math.max(0, Math.min(TERRAIN_TYPES.length - 1, baseIndex + randomOffset));
  return TERRAIN_TYPES[index];
}

export function shouldProceedToNextLevel() {
  // Always proceed after victory
  return true;
}



