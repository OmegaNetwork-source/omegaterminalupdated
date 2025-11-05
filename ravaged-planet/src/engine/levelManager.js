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
  const index = (currentLevel - 1) % TERRAIN_TYPES.length;
  return TERRAIN_TYPES[index];
}

export function shouldProceedToNextLevel() {
  // Always proceed after victory
  return true;
}



