/**
 * Asset System Entry Point
 * Initialize and register all enhanced assets
 */

import { registerTerrainGenerator, registerSkyGenerator, getAssetRegistry } from './AssetManager.js';
import { TERRAIN_GENERATORS } from './TerrainGenerators.js';
import { SKY_GENERATORS } from './SkyGenerators.js';

/**
 * Initialize the asset system
 * Registers all available terrain and sky generators
 */
export function initAssetSystem() {
  // Register all terrain generators
  Object.entries(TERRAIN_GENERATORS).forEach(([name, generator]) => {
    registerTerrainGenerator(name, generator);
  });

  // Register all sky generators
  Object.entries(SKY_GENERATORS).forEach(([name, generator]) => {
    registerSkyGenerator(name, generator);
  });

  const registry = getAssetRegistry();
  console.log('Asset system initialized:', {
    terrain: Array.from(registry.terrain.keys()),
    sky: Array.from(registry.sky.keys())
  });
}

export * from './AssetManager.js';
export * from './TerrainGenerators.js';
export * from './SkyGenerators.js';

