/**
 * Sprite Loader Utility
 * Loads and parses sprite sheets from image files
 */

import { createCanvas } from './gfx.js';

/**
 * Sprite sheet configuration
 * Defines how to parse sprite sheets into individual frames
 */
export const SPRITE_CONFIGS = {
  'character-blue-hair': {
    rows: 4,
    cols: 4,
    frameWidth: null, // Auto-calculate from image
    frameHeight: null,
    animations: {
      walkUp: { row: 0, frames: 4 },
      walkRight: { row: 1, frames: 4 },
      walkDown: { row: 2, frames: 4 },
      walkLeft: { row: 3, frames: 4 },
    },
    defaultAnim: 'walkDown',
  },
  'warrior-cyan': {
    rows: 4,
    cols: 4,
    animations: {
      idle: { row: 0, frames: 4 },
      walkRight: { row: 1, frames: 4 },
      walkUp: { row: 2, frames: 4 },
      walkLeft: { row: 3, frames: 4 },
    },
    defaultAnim: 'idle',
  },
  'ninja-blue': {
    rows: 4,
    cols: 4,
    animations: {
      idle: { row: 0, frames: 4 },
      walkRight: { row: 1, frames: 4 },
      idle2: { row: 2, frames: 4 },
      walkRight2: { row: 3, frames: 4 },
    },
    defaultAnim: 'idle',
  },
  'lizard-blue': {
    rows: 4,
    cols: 5,
    animations: {
      idle: { row: 0, frames: 5 },
      walkRight: { row: 1, frames: 5 },
      idle2: { row: 2, frames: 5 },
      special: { row: 3, frames: 5 },
    },
    defaultAnim: 'idle',
  },
  'explosion': {
    rows: 4,
    cols: 4,
    animations: {
      explode: { frames: 16, loop: false, sequential: true }, // All frames in sequence
    },
    defaultAnim: 'explode',
  },
  'warrior-red': {
    rows: 4,
    cols: 4,
    animations: {
      idle: { row: 0, frames: 4 },
      walkRight: { row: 1, frames: 4 },
      attack: { row: 2, frames: 4 },
      walkLeft: { row: 3, frames: 4 },
    },
    defaultAnim: 'idle',
  },
  'warrior-yellow': {
    rows: 4,
    cols: 4,
    animations: {
      idle: { row: 0, frames: 4 },
      walkRight: { row: 1, frames: 4 },
      idle2: { row: 2, frames: 4 },
      walkRight2: { row: 3, frames: 4 },
    },
    defaultAnim: 'idle',
  },
  'simple-character': {
    rows: 5,
    cols: 5,
    animations: {
      idle: { row: 0, frames: 5 },
      walkLeft: { row: 1, frames: 5 },
      walkRight: { row: 2, frames: 5 },
      walkBack: { row: 3, frames: 5 },
      special: { row: 4, frames: 5 },
    },
    defaultAnim: 'idle',
  },
  'robot-orange': {
    rows: 4,
    cols: 5,
    animations: {
      idle: { row: 0, frames: 5 },
      walkRight: { row: 1, frames: 5 },
      walkBack: { row: 2, frames: 5 },
      special: { row: 3, frames: 4 }, // First 4 frames for actions
      defeated: { row: 3, frames: 1, startFrame: 4 }, // Last frame is defeated state
    },
    defaultAnim: 'idle',
  },
  'dragon-red': {
    rows: 4,
    cols: 5,
    animations: {
      idle: { row: 0, frames: 5 },
      walkRight: { row: 1, frames: 5 },
      walkBack: { row: 2, frames: 5 },
      special: { row: 3, frames: 4 },
      defeated: { row: 3, frames: 1, startFrame: 4 },
    },
    defaultAnim: 'idle',
  },
  'character-angular': {
    rows: 4,
    cols: 5,
    animations: {
      idle: { row: 0, frames: 5 },
      walkRight: { row: 1, frames: 5 },
      walkBack: { row: 2, frames: 5 },
      special: { row: 3, frames: 4 },
      defeated: { row: 3, frames: 1, startFrame: 4 },
    },
    defaultAnim: 'idle',
  },
};

/**
 * Load a sprite sheet image and parse it into frames
 * @param {string} spriteName - Name of the sprite (key in SPRITE_CONFIGS)
 * @param {string} imagePath - Path to the sprite sheet image
 * @returns {Promise<Object>} Sprite object with frames and animations
 */
export async function loadSpriteSheet(spriteName, imagePath) {
  const config = SPRITE_CONFIGS[spriteName];
  if (!config) {
    throw new Error(`Unknown sprite config: ${spriteName}`);
  }

  // Load the image
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imagePath;
  });

  const { rows, cols } = config;
  const frameWidth = config.frameWidth || (img.width / cols);
  const frameHeight = config.frameHeight || (img.height / rows);

  // Create canvas for each frame
  const frames = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const frameCanvas = createCanvas(frameWidth, frameHeight);
      frameCanvas.drawImage(
        img,
        col * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth,
        frameHeight
      );
      frames.push({
        canvas: frameCanvas.canvas,
        ctx: frameCanvas,
        row,
        col,
        index: row * cols + col,
      });
    }
  }

  // Build animation sequences
  const animations = {};
  for (const [animName, animConfig] of Object.entries(config.animations)) {
    const { row, frames: frameCount, loop = true, sequential = false, startFrame = 0 } = animConfig;
    const animFrames = [];
    
    if (sequential) {
      // Sequential animation (all frames in order, e.g., explosion)
      for (let i = 0; i < frameCount && i < frames.length; i++) {
        animFrames.push(frames[i]);
      }
    } else if (row !== undefined) {
      // Row-based animation
      for (let i = 0; i < frameCount; i++) {
        const frameIndex = row * cols + startFrame + i;
        if (frameIndex < frames.length) {
          animFrames.push(frames[frameIndex]);
        }
      }
    } else {
      // Fallback: use first frames
      for (let i = 0; i < frameCount && i < frames.length; i++) {
        animFrames.push(frames[i]);
      }
    }
    
    animations[animName] = {
      frames: animFrames,
      loop,
      currentFrame: 0,
    };
  }

  return {
    name: spriteName,
    frames,
    animations,
    defaultAnim: config.defaultAnim,
    frameWidth,
    frameHeight,
    width: frameWidth,
    height: frameHeight,
  };
}

/**
 * Load all sprite sheets
 * @param {string} basePath - Base path to sprite directory
 * @returns {Promise<Map>} Map of sprite name to sprite object
 */
export async function loadAllSprites(basePath = '/games/ravaged-planet/sprites') {
  const spriteMap = new Map();
  
  for (const spriteName of Object.keys(SPRITE_CONFIGS)) {
    try {
      const imagePath = `${basePath}/${spriteName}.png`;
      const sprite = await loadSpriteSheet(spriteName, imagePath);
      spriteMap.set(spriteName, sprite);
      console.log(`Loaded sprite: ${spriteName}`);
    } catch (error) {
      console.error(`Failed to load sprite ${spriteName}:`, error);
    }
  }
  
  return spriteMap;
}

/**
 * Get animation frame for a sprite
 * @param {Object} sprite - Sprite object
 * @param {string} animName - Animation name
 * @param {number} frameIndex - Frame index (optional, uses animation's current frame if not provided)
 * @returns {Object} Frame object with canvas and context
 */
export function getSpriteFrame(sprite, animName, frameIndex = null) {
  const animation = sprite.animations[animName];
  if (!animation) {
    console.warn(`Animation ${animName} not found for sprite ${sprite.name}`);
    const defaultAnim = sprite.animations[sprite.defaultAnim];
    if (!defaultAnim) return null;
    const idx = frameIndex !== null ? frameIndex : defaultAnim.currentFrame;
    return defaultAnim.frames[idx % defaultAnim.frames.length];
  }
  
  const idx = frameIndex !== null ? frameIndex : animation.currentFrame;
  return animation.frames[idx % animation.frames.length];
}

/**
 * Update animation frame
 * @param {Object} sprite - Sprite object
 * @param {string} animName - Animation name
 * @param {number} speed - Animation speed (frames per update, default 1)
 */
export function updateSpriteAnimation(sprite, animName, speed = 1) {
  const animation = sprite.animations[animName];
  if (!animation) return;
  
  animation.currentFrame += speed;
  if (animation.currentFrame >= animation.frames.length) {
    if (animation.loop) {
      animation.currentFrame = animation.currentFrame % animation.frames.length;
    } else {
      animation.currentFrame = animation.frames.length - 1;
    }
  }
}

/**
 * Reset animation to first frame
 * @param {Object} sprite - Sprite object
 * @param {string} animName - Animation name
 */
export function resetSpriteAnimation(sprite, animName) {
  const animation = sprite.animations[animName];
  if (animation) {
    animation.currentFrame = 0;
  }
}

