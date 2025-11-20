import {clipCanvas, drawCircle, drawRect} from './gfx.js';
import {clamp, coords2index, random, randomInt} from './math.js';
import {sample} from './utils.js';

let cachedImageData;
let heightMap = null; // Optimized height lookup cache
let terrainGrid = null; // Spatial hash grid for fast collision detection
const GRID_CELL_SIZE = 16; // Size of each grid cell in pixels
let gridWidth = 0;
let gridHeight = 0;

/**
 * OPTIMIZATION: Create spatial hash grid for fast terrain collision detection
 * Divides terrain into cells to reduce pixel-level checks
 */
function buildTerrainGrid(width, height) {
  gridWidth = Math.ceil(width / GRID_CELL_SIZE);
  gridHeight = Math.ceil(height / GRID_CELL_SIZE);
  terrainGrid = new Uint8Array(gridWidth * gridHeight);
  
  // Build grid: 1 = has terrain, 0 = empty
  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      let hasTerrain = false;
      const startX = gx * GRID_CELL_SIZE;
      const startY = gy * GRID_CELL_SIZE;
      const endX = Math.min(startX + GRID_CELL_SIZE, width);
      const endY = Math.min(startY + GRID_CELL_SIZE, height);
      
      // Sample grid cell - check if any pixel has terrain
      for (let y = startY; y < endY && !hasTerrain; y += 4) {
        for (let x = startX; x < endX && !hasTerrain; x += 4) {
          const index = coords2index(width, x, y) * 4;
          if (cachedImageData.data[index + 3] > 0) {
            hasTerrain = true;
          }
        }
      }
      terrainGrid[gy * gridWidth + gx] = hasTerrain ? 1 : 0;
    }
  }
}

/**
 * OPTIMIZATION: Build height map for fast land height lookups
 * Pre-calculate surface heights to avoid repeated scans
 */
function buildHeightMap(width, height) {
  heightMap = new Uint16Array(width);
  
  for (let x = 0; x < width; x++) {
    heightMap[x] = height - 1; // Default to bottom
    for (let y = height - 1; y >= 0; y--) {
      const index = coords2index(width, x, y) * 4;
      if (cachedImageData.data[index + 3] === 0) {
        heightMap[x] = y;
        break;
      }
    }
  }
}

export function cacheImageData(ctx) {
  const {width, height} = ctx.canvas;
  cachedImageData = ctx.getImageData(0, 0, width, height);
  
  // OPTIMIZATION: Build spatial acceleration structures
  buildTerrainGrid(width, height);
  buildHeightMap(width, height);
}

// Lazy-load enhanced asset system
let assetModule = null;
let assetSystemLoaded = false;

async function loadAssetSystem() {
  if (assetSystemLoaded) return assetModule;
  try {
    assetModule = await import('./assets/index.js');
    assetModule.initAssetSystem();
    assetSystemLoaded = true;
    return assetModule;
  } catch (e) {
    assetSystemLoaded = true; // Mark as loaded even if failed
    return null;
  }
}

export function generateTerrain(ctx, type, customMapData = null) {
  const {width, height} = ctx.canvas;
  
  // If custom map data is provided, load it
  if (customMapData && customMapData.data) {
    try {
      const imageData = new ImageData(
        new Uint8ClampedArray(customMapData.data),
        customMapData.width || width,
        customMapData.height || height
      );
      ctx.clearRect(0, 0, width, height);
      ctx.putImageData(imageData, 0, 0);
      cacheImageData(ctx);
      return;
    } catch (e) {
      console.error('Failed to load custom map:', e);
      // Fall through to generation
    }
  }
  
  // Try to use enhanced generators
  if (assetModule && assetModule.getTerrainGenerator) {
    try {
      const terrainType = type || assetModule.ASSET_CONFIG.terrain.type;
      const generator = assetModule.getTerrainGenerator(terrainType === 'random' ? null : terrainType);
      
      if (generator) {
        ctx.clearRect(0, 0, width, height);
        generator(ctx);
        
        // Call collapseTerrain for sand types, cache for others
        if (terrainType === 'sand') {
          collapseTerrain(ctx);
        } else {
          cacheImageData(ctx);
        }
        return;
      }
    } catch (e) {
      // Fall through to original
    }
  } else {
    // Load asset system in background for next time (don't await)
    loadAssetSystem().then(module => {
      if (module) assetModule = module;
    });
  }
  
  // Original terrain generation
  const generator = type? TERRAIN_TYPES[type] : sample(Object.values(TERRAIN_TYPES));
  ctx.clearRect(0, 0, width, height);
  generator(ctx);
}

const TERRAIN_TYPES = {
  mountain(ctx) {
    ctx.color = sample(['palegreen', 'white']); // FIXME
    const {width, height} = ctx.canvas;
    const stepCount = 8;
    const stepSize = width / stepCount;

    let cy = random(.3, .7) * height;
    let dy = 0;

    for (let x=0; x<width; x++) {
      if (x % stepSize === 0) dy = ((random(.3, .7) * height) - cy) / stepSize;
      if (x % (stepSize/16) === 0) dy = dy - random(-1, 1);
      const ty = clamp(0, cy+dy, height-1);
      const wy = clamp(70, ty, height-70-1);
      cy = wy + (ty-wy) * 0.5;
      drawRect(ctx, x, cy, 1, height-cy, ctx.color);
    }

    cacheImageData(ctx);
  },

  sand(ctx) {
    ctx.color = 'wheat';
    const {width, height} = ctx.canvas;
    const stepCount = 16;
    const stepSize = width / stepCount;

    for (let s=0; s<=stepCount; s++) {
      drawCircle(ctx, s*stepSize, height, randomInt(stepSize, stepSize*2), ctx.color);
      if (s % 3 === 0) drawCircle(ctx, s*stepSize, 0, randomInt(0, stepSize*4), ctx.color);
    }

    cacheImageData(ctx);
    collapseTerrain(ctx);
  }
};

export function collapseTerrain(ctx, ) {
  const {width, height} = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);

  for (let x=0; x<width; x++) {
    let land = 0;
    for (let y=0; y<height; y++) {
      const index = y*width*4 + x*4 +3;
      if (imageData.data[index] > 0) land++;
    }

    ctx.clearRect(0+x, 0, 1, height);
    drawRect(ctx, 0+x, height-land, 1, land, ctx.color);
  }

  cacheImageData(ctx);
}

/**
 * OPTIMIZED: Fast terrain collision check using spatial grid
 * First checks grid cell, then pixel data if needed
 */
export function isTerrain(ctx, x, y) {
  // Bounds check
  if (x < 0 || x >= ctx.canvas.width || y < 0 || y >= ctx.canvas.height) {
    return false;
  }
  
  // OPTIMIZATION: Check spatial grid first (fast rejection)
  const gx = Math.floor(x / GRID_CELL_SIZE);
  const gy = Math.floor(y / GRID_CELL_SIZE);
  
  if (gx >= 0 && gx < gridWidth && gy >= 0 && gy < gridHeight) {
    const gridIndex = gy * gridWidth + gx;
    if (terrainGrid[gridIndex] === 0) {
      return false; // Grid cell is empty, no terrain here
    }
  }
  
  // Grid says there might be terrain, check pixel data
  const index = coords2index(ctx.canvas.width, x, y) * 4;
  return cachedImageData.data[index + 3] > 0;
}

export function closestLand(ctx, x, y) {
  const {width, height} = ctx.canvas;
  for (let i=y; i<height; i++) {
    const index = coords2index(width, x, i) * 4;
    if (cachedImageData.data[index+3] !== 0) return i;
  }
  return height-1;
}

/**
 * OPTIMIZED: Fast land height lookup using pre-computed height map
 */
export function landHeight(ctx, x) {
  const {width} = ctx.canvas;
  
  // Clamp x to valid range
  x = Math.floor(clamp(0, x, width - 1));
  
  // OPTIMIZATION: Use pre-computed height map
  if (heightMap && x >= 0 && x < heightMap.length) {
    return heightMap[x];
  }
  
  // Fallback to original method if height map not available
  const {height} = ctx.canvas;
  for (let i = height - 1; i >= 0; i--) {
    const index = coords2index(width, x, i) * 4;
    if (cachedImageData.data[index + 3] === 0) return i;
  }
  return 0;
}

/**
 * OPTIMIZED: Clip terrain and rebuild acceleration structures
 */
export function clipTerrain(ctx, fn) {
  clipCanvas(ctx, fn);
  cacheImageData(ctx);
}

/**
 * OPTIMIZATION: Invalidate specific grid cells after terrain modification
 * More efficient than rebuilding entire grid
 */
export function invalidateTerrainRegion(ctx, x, y, radius) {
  if (!terrainGrid) return;
  
  const minGx = Math.max(0, Math.floor((x - radius) / GRID_CELL_SIZE));
  const maxGx = Math.min(gridWidth - 1, Math.ceil((x + radius) / GRID_CELL_SIZE));
  const minGy = Math.max(0, Math.floor((y - radius) / GRID_CELL_SIZE));
  const maxGy = Math.min(gridHeight - 1, Math.ceil((y + radius) / GRID_CELL_SIZE));
  
  const {width, height} = ctx.canvas;
  
  // Rebuild only affected grid cells
  for (let gy = minGy; gy <= maxGy; gy++) {
    for (let gx = minGx; gx <= maxGx; gx++) {
      let hasTerrain = false;
      const startX = gx * GRID_CELL_SIZE;
      const startY = gy * GRID_CELL_SIZE;
      const endX = Math.min(startX + GRID_CELL_SIZE, width);
      const endY = Math.min(startY + GRID_CELL_SIZE, height);
      
      for (let py = startY; py < endY && !hasTerrain; py += 4) {
        for (let px = startX; px < endX && !hasTerrain; px += 4) {
          const index = coords2index(width, px, py) * 4;
          if (cachedImageData.data[index + 3] > 0) {
            hasTerrain = true;
          }
        }
      }
      terrainGrid[gy * gridWidth + gx] = hasTerrain ? 1 : 0;
    }
  }
  
  // Rebuild height map for affected columns
  for (let px = Math.max(0, x - radius); px <= Math.min(width - 1, x + radius); px++) {
    heightMap[px] = height - 1;
    for (let py = height - 1; py >= 0; py--) {
      const index = coords2index(width, px, py) * 4;
      if (cachedImageData.data[index + 3] === 0) {
        heightMap[px] = py;
        break;
      }
    }
  }
}
