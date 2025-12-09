/**
 * Enhanced Terrain Generators
 * Multiple terrain types with enhanced visuals
 */

import {drawCircle, drawRect, drawLine} from '../gfx.js';
import {clamp, random, randomInt} from '../math.js';
import {sample} from '../../utils.js';

// Note: cacheImageData and collapseTerrain are handled by terrain.js after generation

/**
 * Enhanced Mountain terrain with peaks and valleys
 */
export function generateMountainTerrain(ctx) {
  ctx.color = sample(['#8B7355', '#9C8866', '#A0826D']); // Brown tones
  const {width, height} = ctx.canvas;
  const stepCount = 10;
  const stepSize = width / stepCount;

  let cy = random(0.3, 0.6) * height;
  let dy = 0;

  for (let x = 0; x < width; x++) {
    if (x % stepSize === 0) {
      dy = ((random(0.25, 0.65) * height) - cy) / stepSize;
    }
    if (x % (stepSize / 20) === 0) {
      dy = dy + random(-2, 2);
    }
    const ty = clamp(60, cy + dy, height - 80);
    const wy = clamp(70, ty, height - 70);
    cy = wy + (ty - wy) * 0.4;
    
    // Enhanced terrain with texture
    drawRect(ctx, x, cy, 1, height - cy, ctx.color);
    // Add occasional rock detail
    if (x % 5 === 0 && random() < 0.1) {
      drawRect(ctx, x, cy - 1, 1, 1, '#6B5B4A');
    }
  }
}

/**
 * Enhanced Sand/Desert terrain with dunes
 */
export function generateSandTerrain(ctx) {
  ctx.color = sample(['#F4A460', '#DEB887', '#D2B48C']); // Sandy colors
  const {width, height} = ctx.canvas;
  const stepCount = 18;
  const stepSize = width / stepCount;

  for (let s = 0; s <= stepCount; s++) {
    const x = s * stepSize;
    const radius = randomInt(stepSize, stepSize * 2.5);
    drawCircle(ctx, x, height, radius, ctx.color);
    
    // Add smaller detail circles
    if (s % 2 === 0) {
      drawCircle(ctx, x + randomInt(-stepSize, stepSize), height - radius/2, radius * 0.6, ctx.color);
    }
  }
  
  // Note: collapseTerrain should be called from terrain.js after generation
}

/**
 * Volcanic terrain with jagged peaks
 */
export function generateVolcanoTerrain(ctx) {
  ctx.color = sample(['#2F2F2F', '#3F3F3F', '#4A4A4A']); // Dark gray/black
  const {width, height} = ctx.canvas;
  const stepCount = 12;
  const stepSize = width / stepCount;
  
  let cy = random(0.2, 0.5) * height;
  let sharpness = 0;

  for (let x = 0; x < width; x++) {
    if (x % stepSize === 0) {
      sharpness = random(-15, 15);
      const targetY = random(0.25, 0.55) * height;
      cy = targetY;
    }
    if (x % (stepSize / 8) === 0) {
      cy += sharpness * 0.1;
      sharpness *= 0.9;
    }
    const ty = clamp(50, cy, height - 90);
    
    // Jagged volcanic rock
    drawRect(ctx, x, ty, 1, height - ty, ctx.color);
    
    // Add occasional dark spots (volcanic rock)
    if (random() < 0.05) {
      drawRect(ctx, x, ty - 1, 1, 2, '#1F1F1F');
    }
  }
}

/**
 * Wasteland terrain - post-apocalyptic
 */
export function generateWastelandTerrain(ctx) {
  ctx.color = sample(['#6B4423', '#8B4513', '#654321']); // Brown/muddy
  const {width, height} = ctx.canvas;
  const stepCount = 15;
  const stepSize = width / stepCount;
  
  let cy = random(0.35, 0.65) * height;

  for (let x = 0; x < width; x++) {
    if (x % stepSize === 0) {
      cy = random(0.35, 0.65) * height;
    }
    if (x % (stepSize / 12) === 0) {
      cy += random(-3, 3);
    }
    const ty = clamp(60, cy, height - 70);
    
    // Uneven wasteland ground
    drawRect(ctx, x, ty, 1, height - ty, ctx.color);
    
    // Add rubble/debris
    if (random() < 0.03) {
      drawRect(ctx, x, ty - randomInt(1, 4), 1, randomInt(1, 3), '#4A2C1A');
    }
  }
}

/**
 * City ruins terrain - urban destruction
 */
export function generateCityTerrain(ctx) {
  ctx.color = '#555555'; // Concrete gray
  const {width, height} = ctx.canvas;
  const stepCount = 8;
  const stepSize = width / stepCount;
  
  // Base ground level
  const groundLevel = height * 0.7;
  
  for (let x = 0; x < width; x++) {
    let buildingHeight = 0;
    
    // Create buildings at intervals
    if (x % stepSize === 0 && random() > 0.3) {
      buildingHeight = randomInt(10, 40);
      const buildingWidth = randomInt(stepSize / 2, stepSize * 1.5);
      
      // Draw building
      for (let bx = 0; bx < buildingWidth && x + bx < width; bx++) {
        drawRect(ctx, x + bx, groundLevel - buildingHeight, 1, buildingHeight, ctx.color);
        // Add windows
        if (bx % 3 === 0 && random() > 0.5) {
          drawRect(ctx, x + bx, groundLevel - buildingHeight + 2, 1, 1, '#FFD700');
        }
      }
    }
    
    // Ground level
    drawRect(ctx, x, groundLevel, 1, height - groundLevel, '#4A4A4A');
  }
}

/**
 * Forest terrain - organic hills
 */
export function generateForestTerrain(ctx) {
  ctx.color = sample(['#556B2F', '#6B8E23', '#7C8B3F']); // Green/brown
  const {width, height} = ctx.canvas;
  const stepCount = 14;
  const stepSize = width / stepCount;
  
  let cy = random(0.4, 0.7) * height;
  let smoothness = 0.6;

  for (let x = 0; x < width; x++) {
    if (x % stepSize === 0) {
      cy = random(0.4, 0.7) * height;
    }
    if (x % (stepSize / 16) === 0) {
      cy += random(-2, 2) * smoothness;
    }
    const ty = clamp(70, cy, height - 60);
    
    // Smooth organic hills
    drawRect(ctx, x, ty, 1, height - ty, ctx.color);
    
    // Add grass texture
    if (x % 2 === 0 && random() < 0.1) {
      drawRect(ctx, x, ty - 1, 1, 1, '#8FBC8F');
    }
  }
}

// Helper function to collapse terrain (from original terrain.js logic)
export function collapseTerrain(ctx) {
  const {width, height} = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);

  for (let x = 0; x < width; x++) {
    let land = 0;
    for (let y = 0; y < height; y++) {
      const index = y * width * 4 + x * 4 + 3;
      if (imageData.data[index] > 0) land++;
    }

    ctx.clearRect(x, 0, 1, height);
    drawRect(ctx, x, height - land, 1, land, ctx.color);
  }
}

// Export all generators
export const TERRAIN_GENERATORS = {
  mountain: generateMountainTerrain,
  sand: generateSandTerrain,
  volcano: generateVolcanoTerrain,
  wasteland: generateWastelandTerrain,
  city: generateCityTerrain,
  forest: generateForestTerrain
};

