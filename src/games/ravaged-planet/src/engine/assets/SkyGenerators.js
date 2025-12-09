/**
 * Enhanced Sky Generators
 * Multiple sky types with enhanced visuals
 */

import {drawRect, drawCircle} from '../gfx.js';
import {gradient, random, randomInt} from '../math.js';
import {sample} from '../../utils.js';
import {SKY_COLORS} from '../constants.js';

/**
 * Enhanced default sky with gradient (same as original but enhanced)
 */
export function generateDefaultSky(ctx) {
  const {width, height} = ctx.canvas;
  const {from, to} = sample(SKY_COLORS);

  for (let y = 0; y < height; y++) {
    const f = y / height;
    const r = Math.round(gradient(from[0], to[0], f));
    const g = Math.round(gradient(from[1], to[1], f));
    const b = Math.round(gradient(from[2], to[2], f));
    drawRect(ctx, 0, y, width, 1, `rgb(${r},${g},${b})`);
  }
}

/**
 * Sunset sky with warm colors
 */
export function generateSunsetSky(ctx) {
  const {width, height} = ctx.canvas;
  const sunY = height * 0.3;
  const sunRadius = 30;

  // Draw sun
  drawCircle(ctx, width / 2, sunY, sunRadius, '#FFA500');
  drawCircle(ctx, width / 2, sunY, sunRadius - 5, '#FFD700');

  // Sky gradient from orange to purple
  for (let y = 0; y < height; y++) {
    const f = y / height;
    let r, g, b;
    
    if (f < 0.3) {
      // Top - deep orange
      r = gradient(255, 200, f * 3);
      g = gradient(100, 150, f * 3);
      b = gradient(50, 100, f * 3);
    } else if (f < 0.6) {
      // Middle - orange to pink
      r = gradient(200, 255, (f - 0.3) * 3);
      g = gradient(150, 100, (f - 0.3) * 3);
      b = gradient(100, 150, (f - 0.3) * 3);
    } else {
      // Bottom - pink to purple
      r = gradient(255, 100, (f - 0.6) * 2.5);
      g = gradient(100, 50, (f - 0.6) * 2.5);
      b = gradient(150, 150, (f - 0.6) * 2.5);
    }
    
    drawRect(ctx, 0, y, width, 1, `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
  }
}

/**
 * Night sky with stars
 */
export function generateNightSky(ctx) {
  const {width, height} = ctx.canvas;
  
  // Deep blue to black gradient
  for (let y = 0; y < height; y++) {
    const f = y / height;
    const r = gradient(10, 0, f);
    const g = gradient(20, 0, f);
    const b = gradient(40, 5, f);
    drawRect(ctx, 0, y, width, 1, `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
  }

  // Add stars
  for (let i = 0; i < 100; i++) {
    const x = randomInt(0, width);
    const y = randomInt(0, height * 0.8);
    const brightness = random();
    const starColor = brightness > 0.7 ? '#FFFFFF' : brightness > 0.4 ? '#DDDDFF' : '#AAAADD';
    plot(ctx, x, y, starColor);
    if (brightness > 0.8) {
      plot(ctx, x + 1, y, starColor);
      plot(ctx, x, y + 1, starColor);
    }
  }
}

/**
 * Storm sky - dark and ominous
 */
export function generateStormSky(ctx) {
  const {width, height} = ctx.canvas;
  
  // Dark gray gradient
  for (let y = 0; y < height; y++) {
    const f = y / height;
    const r = gradient(60, 40, f);
    const g = gradient(65, 45, f);
    const b = gradient(70, 50, f);
    drawRect(ctx, 0, y, width, 1, `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
  }

  // Add clouds
  for (let i = 0; i < 8; i++) {
    const x = randomInt(0, width);
    const cloudY = randomInt(0, height * 0.4);
    const cloudSize = randomInt(20, 40);
    drawCircle(ctx, x, cloudY, cloudSize, `rgba(40,40,45,${random(0.3,0.6)})`);
    if (random() > 0.5) {
      drawCircle(ctx, x + cloudSize/2, cloudY, cloudSize * 0.8, `rgba(35,35,40,${random(0.2,0.5)})`);
    }
  }
}

/**
 * Desert sky - bright and hazy
 */
export function generateDesertSky(ctx) {
  const {width, height} = ctx.canvas;
  
  // Bright yellow to orange gradient
  for (let y = 0; y < height; y++) {
    const f = y / height;
    const r = gradient(255, 200, f);
    const g = gradient(220, 150, f);
    const b = gradient(180, 100, f);
    drawRect(ctx, 0, y, width, 1, `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
  }

  // Add haze effect
  for (let i = 0; i < 5; i++) {
    const x = randomInt(0, width);
    const hazeY = randomInt(0, height * 0.3);
    const hazeSize = randomInt(30, 60);
    drawCircle(ctx, x, hazeY, hazeSize, `rgba(255,220,180,${random(0.1,0.3)})`);
  }
}

/**
 * Space sky - deep space with nebula
 */
export function generateSpaceSky(ctx) {
  const {width, height} = ctx.canvas;
  
  // Deep black to dark purple
  for (let y = 0; y < height; y++) {
    const f = y / height;
    const r = gradient(5, 20, f);
    const g = gradient(5, 10, f);
    const b = gradient(10, 30, f);
    drawRect(ctx, 0, y, width, 1, `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
  }

  // Add nebula colors
  for (let i = 0; i < 3; i++) {
    const x = randomInt(0, width);
    const nebulaY = randomInt(0, height * 0.5);
    const size = randomInt(40, 80);
    const colors = [
      `rgba(100,50,150,${random(0.2,0.4)})`, // Purple
      `rgba(150,50,100,${random(0.2,0.4)})`, // Pink
      `rgba(50,100,150,${random(0.2,0.4)})`  // Blue
    ];
    drawCircle(ctx, x, nebulaY, size, sample(colors));
  }

  // Add stars
  for (let i = 0; i < 150; i++) {
    const x = randomInt(0, width);
    const y = randomInt(0, height);
    plot(ctx, x, y, '#FFFFFF');
  }
}

function plot(ctx, x, y, color) {
  drawRect(ctx, Math.round(x), Math.round(y), 1, 1, color);
}

// Export all generators
export const SKY_GENERATORS = {
  default: generateDefaultSky,
  sunset: generateSunsetSky,
  night: generateNightSky,
  storm: generateStormSky,
  desert: generateDesertSky,
  space: generateSpaceSky
};

