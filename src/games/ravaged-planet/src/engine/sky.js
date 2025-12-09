import {SKY_COLORS} from './constants.js';
import {drawRect} from './gfx.js';
import {gradient} from './math.js';
import {sample} from './utils.js';

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
    assetSystemLoaded = true;
    return null;
  }
}

export function generateSky(ctx) {
  // Try to use enhanced generators
  if (assetModule && assetModule.getSkyGenerator) {
    try {
      const skyType = assetModule.ASSET_CONFIG.sky.type;
      const generator = assetModule.getSkyGenerator(skyType === 'random' ? null : skyType);
      
      if (generator) {
        generator(ctx);
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
  
  // Original sky generation
  const {width, height} = ctx.canvas;
  const {from, to} = sample(SKY_COLORS);

  for (let y=0; y<height; y++) {
    const f = y / height;
    const r = gradient(from[0], to[0], f);
    const g = gradient(from[1], to[1], f);
    const b = gradient(from[2], to[2], f);
    drawRect(ctx, 0, y, width, 1, `rgb(${r},${g},${b})`);
  }
}
