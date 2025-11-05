/**
 * Asset Manager - Centralized system for managing and enhancing game assets
 * This allows easy swapping and upgrading of terrain, sky, tanks, and other visuals
 */

// Asset configuration - easily modify which assets to use
export const ASSET_CONFIG = {
  terrain: {
    type: 'random', // 'random', 'mountain', 'sand', 'volcano', 'wasteland', 'city', 'forest'
    style: 'enhanced' // 'classic', 'enhanced', 'detailed'
  },
  sky: {
    type: 'random', // 'random', 'sunset', 'night', 'storm', 'desert', 'space'
    style: 'enhanced'
  },
  tanks: {
    style: 'enhanced', // 'classic', 'enhanced', 'detailed', 'realistic'
    animations: true
  },
  particles: {
    enhanced: true,
    effects: ['smoke', 'sparks', 'debris']
  }
};

// Asset registry - tracks available assets
const AssetRegistry = {
  terrain: new Map(),
  sky: new Map(),
  tanks: new Map(),
  particles: new Map()
};

// Export registry for external access
export function getAssetRegistry() {
  return AssetRegistry;
}

/**
 * Get current terrain generator based on config
 */
export function getTerrainGenerator(type = null) {
  const terrainType = type || ASSET_CONFIG.terrain.type;
  if (terrainType === 'random') {
    const generators = Array.from(AssetRegistry.terrain.values());
    return generators[Math.floor(Math.random() * generators.length)] || null;
  }
  return AssetRegistry.terrain.get(terrainType) || AssetRegistry.terrain.get('mountain');
}

/**
 * Get current sky generator based on config
 */
export function getSkyGenerator(type = null) {
  const skyType = type || ASSET_CONFIG.sky.type;
  if (skyType === 'random') {
    const generators = Array.from(AssetRegistry.sky.values());
    return generators[Math.floor(Math.random() * generators.length)] || null;
  }
  return AssetRegistry.sky.get(skyType) || AssetRegistry.sky.get('default');
}

/**
 * Register a new terrain generator
 */
export function registerTerrainGenerator(name, generator) {
  AssetRegistry.terrain.set(name, generator);
}

/**
 * Register a new sky generator
 */
export function registerSkyGenerator(name, generator) {
  AssetRegistry.sky.set(name, generator);
}

/**
 * Set asset configuration
 */
export function setAssetConfig(config) {
  Object.assign(ASSET_CONFIG, config);
}

/**
 * Get asset configuration
 */
export function getAssetConfig() {
  return { ...ASSET_CONFIG };
}

