/**
 * Enhanced Graphics Module
 * Provides improved visual effects for projectiles, explosions, particles, and other game elements
 */

import {drawCircle, drawRect, plot, drawLine, strokeCircle as baseStrokeCircle} from './gfx.js';
import {clamp, random, randomInt} from './math.js';

/**
 * Draw a glowing projectile with trail effect
 */
export function drawGlowingProjectile(ctx, x, y, color, size = 2) {
  const centerX = Math.round(x);
  const centerY = Math.round(y);
  
  // Outer glow (larger, more transparent)
  ctx.globalAlpha = 0.4;
  drawCircle(ctx, centerX, centerY, size + 2, color);
  
  // Middle glow
  ctx.globalAlpha = 0.7;
  drawCircle(ctx, centerX, centerY, size + 1, color);
  
  // Core (bright center)
  ctx.globalAlpha = 1.0;
  drawCircle(ctx, centerX, centerY, size, 'white');
  plot(ctx, centerX, centerY, 'white');
  
  ctx.globalAlpha = 1.0;
}

/**
 * Draw projectile trail with fading effect
 */
export function drawProjectileTrail(ctx, prevX, prevY, currX, currY, color, alpha = 0.6) {
  ctx.globalAlpha = alpha;
  drawLine(ctx, prevX, prevY, currX, currY, color);
  ctx.globalAlpha = 1.0;
}

/**
 * Draw enhanced explosion with multiple color rings and shockwave
 */
export function drawEnhancedExplosion(ctx, x, y, radius, frame, maxRadius) {
  const centerX = Math.round(x);
  const centerY = Math.round(y);
  const progress = radius / maxRadius;
  
  // Shockwave ring (outer expanding ring)
  if (radius > 5) {
    const shockAlpha = clamp(0, 1 - progress * 0.7, 1);
    ctx.globalAlpha = shockAlpha;
    const shockColor = progress > 0.7 ? 'white' : '#FFAA00';
    strokeCircle(ctx, centerX, centerY, radius + 2, shockColor);
    ctx.globalAlpha = 1.0;
  }
  
  // Outer fire ring (orange/red)
  const outerAlpha = clamp(0, 1 - progress * 0.5, 1);
  ctx.globalAlpha = outerAlpha;
  drawCircle(ctx, centerX, centerY, radius, '#FF6600');
  ctx.globalAlpha = 1.0;
  
  // Middle fire ring (yellow/orange)
  if (radius > 3) {
    const midAlpha = clamp(0, 1 - progress * 0.4, 1);
    ctx.globalAlpha = midAlpha;
    drawCircle(ctx, centerX, centerY, radius - 2, '#FFAA00');
    ctx.globalAlpha = 1.0;
  }
  
  // Core (bright white/yellow center)
  const coreAlpha = clamp(0, 1 - progress * 0.3, 1);
  ctx.globalAlpha = coreAlpha;
  drawCircle(ctx, centerX, centerY, Math.max(1, radius - 4), 'white');
  plot(ctx, centerX, centerY, 'white');
  ctx.globalAlpha = 1.0;
  
  // Add random spark particles
  if (frame % 2 === 0) {
    for (let i = 0; i < 3; i++) {
      const angle = random(0, Math.PI * 2);
      const dist = random(radius * 0.5, radius * 1.2);
      const sparkX = Math.round(centerX + Math.cos(angle) * dist);
      const sparkY = Math.round(centerY + Math.sin(angle) * dist);
      ctx.globalAlpha = random(0.5, 1);
      plot(ctx, sparkX, sparkY, sample(['white', '#FFAA00', '#FF6600']));
      ctx.globalAlpha = 1.0;
    }
  }
}

/**
 * Draw enhanced dirt explosion with better visual variety
 */
export function drawEnhancedDirt(ctx, x, y, radius, terrainColor) {
  const centerX = Math.round(x);
  const centerY = Math.round(y);
  
  // Main dirt circle with texture
  drawCircle(ctx, centerX, centerY, radius, terrainColor);
  
  // Add darker spots for texture
  for (let i = 0; i < radius / 2; i++) {
    const angle = random(0, Math.PI * 2);
    const dist = random(0, radius * 0.8);
    const spotX = Math.round(centerX + Math.cos(angle) * dist);
    const spotY = Math.round(centerY + Math.sin(angle) * dist);
    plot(ctx, spotX, spotY, darkenColor(terrainColor, 0.3));
  }
  
  // Add lighter highlights
  for (let i = 0; i < radius / 4; i++) {
    const angle = random(0, Math.PI * 2);
    const dist = random(0, radius * 0.6);
    const spotX = Math.round(centerX + Math.cos(angle) * dist);
    const spotY = Math.round(centerY + Math.sin(angle) * dist);
    plot(ctx, spotX, spotY, lightenColor(terrainColor, 0.2));
  }
}

/**
 * Draw enhanced particle with glow and size variation
 */
export function drawEnhancedParticle(ctx, x, y, color, alpha, size = 1) {
  const centerX = Math.round(x);
  const centerY = Math.round(y);
  
  ctx.globalAlpha = alpha;
  
  if (size > 1) {
    // Draw with glow for larger particles
    drawCircle(ctx, centerX, centerY, size, color);
  } else {
    plot(ctx, centerX, centerY, color);
  }
  
  ctx.globalAlpha = 1.0;
}

/**
 * Draw muzzle flash effect at cannon
 */
export function drawMuzzleFlash(ctx, x, y, angle, flashSize = 3) {
  const [flashX, flashY] = [
    Math.round(x + Math.cos(angle) * -8),
    Math.round(y + Math.sin(angle) * -8)
  ];
  
  // Bright flash core
  drawCircle(ctx, flashX, flashY, flashSize + 1, 'white');
  drawCircle(ctx, flashX, flashY, flashSize, '#FFAA00');
  
  // Smoke puffs
  for (let i = 0; i < 3; i++) {
    const smokeX = flashX + randomInt(-2, 2);
    const smokeY = flashY + randomInt(1, 3);
    ctx.globalAlpha = 0.4;
    plot(ctx, smokeX, smokeY, 'gray');
    ctx.globalAlpha = 1.0;
  }
}

/**
 * Draw shield effect with energy glow
 */
export function drawShieldEffect(ctx, x, y, radius, shieldType, energy) {
  const centerX = Math.round(x);
  const centerY = Math.round(y);
  const energyRatio = energy / 100;
  
  // Outer energy ring (pulsing based on energy)
  ctx.globalAlpha = 0.3 * energyRatio;
  const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 1;
  strokeCircle(ctx, centerX, centerY, Math.round(radius * pulse), shieldType.color || 'white');
  ctx.globalAlpha = 1.0;
  
  // Inner shield ring
  ctx.globalAlpha = 0.6 * energyRatio;
  strokeCircle(ctx, centerX, centerY, radius, shieldType.color || 'white');
  ctx.globalAlpha = 1.0;
}

/**
 * Draw damage indicator (flashing red when damaged)
 */
export function drawDamageIndicator(ctx, x, y, damageAmount) {
  if (damageAmount > 0) {
    const indicatorY = y - 15;
    ctx.globalAlpha = clamp(0, damageAmount / 100, 1);
    drawRect(ctx, x - 5, indicatorY, 10, 2, 'red');
    ctx.globalAlpha = 1.0;
  }
}

/**
 * Draw trajectory line with glow and fade
 */
export function drawEnhancedTrajectory(ctx, points, color, alpha) {
  if (points.length < 2) return;
  
  ctx.globalAlpha = alpha * 0.6;
  
  // Draw glow trail
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    drawLine(ctx, prev.x, prev.y, curr.x, curr.y, color);
  }
  
  // Draw bright core line
  ctx.globalAlpha = alpha;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (i % 2 === 0) { // Draw every other pixel for brightness
      drawLine(ctx, prev.x, prev.y, curr.x, curr.y, 'white');
    }
  }
  
  ctx.globalAlpha = 1.0;
}

/**
 * Helper: Darken a color
 */
function darkenColor(color, amount) {
  // Simple darkening - converts to darker shade
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount * 255);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount * 255);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount * 255);
    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
  }
  // For named colors, return a darker variant
  const darkColors = {
    'wheat': '#D4B483',
    'palegreen': '#90EE90',
    'white': '#CCCCCC'
  };
  return darkColors[color.toLowerCase()] || color;
}

/**
 * Helper: Lighten a color
 */
function lightenColor(color, amount) {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount * 255);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount * 255);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount * 255);
    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
  }
  const lightColors = {
    'wheat': '#FFF8DC',
    'palegreen': '#B0FFB0',
    'white': 'white'
  };
  return lightColors[color.toLowerCase()] || color;
}

function strokeCircle(ctx, x, y, r, color) {
  // Use the base strokeCircle function from gfx.js
  baseStrokeCircle(ctx, x, y, r, color);
}

function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export default {
  drawGlowingProjectile,
  drawProjectileTrail,
  drawEnhancedExplosion,
  drawEnhancedDirt,
  drawEnhancedParticle,
  drawMuzzleFlash,
  drawShieldEffect,
  drawDamageIndicator,
  drawEnhancedTrajectory
};

