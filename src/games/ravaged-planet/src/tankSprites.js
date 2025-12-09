import {createCanvas, drawRect, drawLine, drawCircle, strokeRect, strokeCircle} from './gfx.js';
import {clamp, deg2rad, vec} from './math.js';

/**
 * Creates a tank sprite with a uniform design but customizable colors
 * @param {string} primaryColor - Main tank body color
 * @param {string} borderColor - Border/outline color
 * @param {number} width - Sprite width in pixels
 * @param {number} height - Sprite height in pixels
 * @returns {CanvasRenderingContext2D} Canvas context with the tank sprite
 */
export function createTankSprite(primaryColor, borderColor, width = 16, height = 12) {
  const sprite = createCanvas(width, height);
  
  // Tank body (rectangular hull) - uniform design
  const bodyX = 2;
  const bodyY = 5;
  const bodyW = width - 4;
  const bodyH = 5;
  
  // Draw tank tracks (bottom detail)
  drawRect(sprite, bodyX, bodyY + bodyH, bodyW, 1, borderColor);
  drawRect(sprite, bodyX + 1, bodyY + bodyH, bodyW - 2, 1, primaryColor);
  
  // Draw border (outline)
  strokeRect(sprite, bodyX, bodyY, bodyW, bodyH, borderColor);
  // Draw body fill
  drawRect(sprite, bodyX + 1, bodyY + 1, bodyW - 2, bodyH - 2, primaryColor);
  
  // Top armor plate
  drawRect(sprite, bodyX + 1, bodyY, bodyW - 2, 1, borderColor);
  
  // Tank turret base (circular - uniform design)
  const turretX = width / 2;
  const turretY = bodyY + 1;
  const turretR = 2;
  strokeCircle(sprite, turretX, turretY, turretR, borderColor);
  drawCircle(sprite, turretX, turretY, turretR - 1, primaryColor);
  
  // Detail lines on hull (armor plates)
  drawLine(sprite, bodyX + 2, bodyY + 2, bodyX + bodyW - 2, bodyY + 2, borderColor);
  drawLine(sprite, bodyX + 2, bodyY + 3, bodyX + bodyW - 2, bodyY + 3, borderColor);
  
  // Side details (vent/grate pattern)
  drawRect(sprite, bodyX, bodyY + 2, 1, 2, borderColor);
  drawRect(sprite, bodyX + bodyW - 1, bodyY + 2, 1, 2, borderColor);
  
  return sprite;
}

/**
 * Creates animated tank sprites for different states
 * @param {string} primaryColor - Main tank body color
 * @param {string} borderColor - Border/outline color
 * @returns {Object} Object containing sprite canvases for different animation states
 */
export function createTankSprites(primaryColor, borderColor) {
  const width = 16;
  const height = 12;
  
  // Base sprite
  const baseSprite = createTankSprite(primaryColor, borderColor, width, height);
  
  // Animation frames for idle (subtle movement - tracks pulsing)
  const idleFrames = [];
  for (let frame = 0; frame < 4; frame++) {
    const sprite = createCanvas(width, height);
    sprite.drawImage(baseSprite.canvas, 0, 0);
    
    // Add subtle animation - track detail pulsing
    const pulse = Math.sin(frame * Math.PI / 2) * 0.3;
    // Subtle highlight on tracks
    drawRect(sprite, 4 + pulse, height - 1, 1, 1, primaryColor);
    drawRect(sprite, width - 5 - pulse, height - 1, 1, 1, primaryColor);
    
    idleFrames.push(sprite);
  }
  
  // Firing frame (cannon recoil animation with muzzle flash)
  const firingSprite = createCanvas(width, height);
  firingSprite.drawImage(baseSprite.canvas, 0, 0);
  // Add muzzle flash effect at turret base
  const flashX = width / 2;
  const flashY = 4;
  drawCircle(firingSprite, flashX, flashY, 2, 'yellow');
  drawCircle(firingSprite, flashX, flashY, 1, 'white');
  // Add smoke puffs
  drawCircle(firingSprite, flashX - 1, flashY + 1, 1, 'gray');
  drawCircle(firingSprite, flashX + 1, flashY + 1, 1, 'gray');
  
  // Damaged frames (cracked/damaged appearance with visible damage)
  const damagedFrames = [];
  for (let frame = 0; frame < 2; frame++) {
    const sprite = createCanvas(width, height);
    sprite.drawImage(baseSprite.canvas, 0, 0);
    
    // Add damage cracks and scorch marks
    const crackX = width / 2;
    const crackY = 5 + frame;
    // Main crack
    drawLine(sprite, crackX - 2, crackY - 1, crackX + 2, crackY + 1, borderColor);
    // Secondary cracks
    drawLine(sprite, crackX - 1, crackY - 1, crackX + 1, crackY + 1, borderColor);
    // Scorch marks
    drawRect(sprite, crackX - 1, crackY, 2, 1, 'darkgray');
    
    damagedFrames.push(sprite);
  }
  
  return {
    base: baseSprite,
    idle: idleFrames,
    firing: firingSprite,
    damaged: damagedFrames,
    width,
    height
  };
}

/**
 * Draws a tank sprite at the specified position and angle
 * @param {CanvasRenderingContext2D} ctx - Target canvas context
 * @param {Object} sprites - Tank sprite object from createTankSprites
 * @param {string} state - Animation state: 'idle', 'firing', 'damaged', or 'base'
 * @param {number} frame - Animation frame index (for idle/damaged states)
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} angle - Angle in degrees (0-180)
 * @param {number} cannonLength - Length of cannon barrel
 */
export function drawTankSprite(ctx, sprites, state, frame, x, y, angle, cannonLength = 8) {
  const spriteWidth = sprites.width;
  const spriteHeight = sprites.height;
  
  // Select sprite based on state
  let sprite;
  if (state === 'firing') {
    sprite = sprites.firing;
  } else if (state === 'damaged') {
    sprite = sprites.damaged[frame % sprites.damaged.length];
  } else if (state === 'idle') {
    sprite = sprites.idle[frame % sprites.idle.length];
  } else {
    sprite = sprites.base;
  }
  
  // Draw tank body sprite
  ctx.save();
  ctx.translate(x, y);
  ctx.drawImage(sprite.canvas, -spriteWidth / 2, -spriteHeight / 2);
  ctx.restore();
  
  // Draw rotating cannon barrel
  const [cannonEndX, cannonEndY] = vec(x, y - spriteHeight / 2 + 2, angle + 180, cannonLength);
  const cannonBaseX = x;
  const cannonBaseY = y - spriteHeight / 2 + 2;
  
  // Get colors from player (passed via context or extract from sprite)
  // For now, we'll use a default approach - the cannon uses border color
  // This should be passed as a parameter ideally
  const borderColor = 'darkgray'; // Default, should be passed from player data
  
  // Draw cannon barrel (thick line)
  drawLine(ctx, cannonBaseX - 1, cannonBaseY, cannonEndX - 1, cannonEndY, borderColor);
  drawLine(ctx, cannonBaseX + 1, cannonBaseY, cannonEndX + 1, cannonEndY, borderColor);
  drawLine(ctx, cannonBaseX, cannonBaseY - 1, cannonEndX, cannonEndY - 1, borderColor);
}

/**
 * Enhanced version that uses player colors directly
 */
export function drawTank(ctx, sprites, state, frame, x, y, angle, primaryColor, borderColor, cannonLength = 8) {
  const spriteWidth = sprites.width;
  const spriteHeight = sprites.height;
  
  // Select sprite based on state
  let sprite;
  if (state === 'firing') {
    sprite = sprites.firing;
  } else if (state === 'damaged') {
    sprite = sprites.damaged[frame % sprites.damaged.length];
  } else if (state === 'idle') {
    sprite = sprites.idle[frame % sprites.idle.length];
  } else {
    sprite = sprites.base;
  }
  
  // Draw tank body sprite (positioned to match original tank placement)
  // Original tank was drawn at y-3 to y+1, so center sprite slightly above y
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y - 2));
  ctx.drawImage(sprite.canvas, -Math.round(spriteWidth / 2), -Math.round(spriteHeight / 2));
  ctx.restore();
  
  // Draw rotating cannon barrel (matching original cannon position)
  const [cannonEndX, cannonEndY] = vec(x, y - 3, angle + 180, cannonLength);
  const cannonBaseX = Math.round(x);
  const cannonBaseY = Math.round(y - 3);
  
  // Draw cannon barrel with border
  drawLine(ctx, cannonBaseX - 1, cannonBaseY, Math.round(cannonEndX - 1), Math.round(cannonEndY), borderColor);
  drawLine(ctx, cannonBaseX + 1, cannonBaseY, Math.round(cannonEndX + 1), Math.round(cannonEndY), borderColor);
  drawLine(ctx, cannonBaseX, cannonBaseY - 1, Math.round(cannonEndX), Math.round(cannonEndY - 1), borderColor);
  drawLine(ctx, cannonBaseX, cannonBaseY, Math.round(cannonEndX), Math.round(cannonEndY), primaryColor);
}

/**
 * Initialize tank sprites for all player colors
 * @param {Array} playerColors - Array of [primaryColor, borderColor] pairs
 * @returns {Map} Map of color keys to tank sprite objects
 */
export function initTankSprites(playerColors) {
  const spriteMap = new Map();
  
  for (let i = 0; i < playerColors.length; i++) {
    const [primaryColor, borderColor] = playerColors[i];
    const sprites = createTankSprites(primaryColor, borderColor);
    spriteMap.set(i, sprites);
  }
  
  return spriteMap;
}

