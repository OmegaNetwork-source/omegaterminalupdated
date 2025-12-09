/**
 * Sprite Entity System
 * Manages interactive sprite entities in the game
 */

import { getSpriteFrame, updateSpriteAnimation, resetSpriteAnimation } from './spriteLoader.js';
import { distance } from './math.js';

/**
 * Sprite Entity Class
 * Represents an interactive sprite in the game world
 */
export class SpriteEntity {
  constructor(sprite, x, y, options = {}) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = options.facing || 'down'; // 'up', 'down', 'left', 'right'
    this.currentAnim = options.defaultAnim || sprite.defaultAnim;
    this.animationSpeed = options.animationSpeed || 0.1;
    this.animationFrame = 0;
    this.scale = options.scale || 1;
    this.interactive = options.interactive !== false;
    this.hovered = false;
    this.clicked = false;
    this.onClick = options.onClick || null;
    this.onHover = options.onHover || null;
    this.visible = options.visible !== false;
    this.active = options.active !== false;
    
    // Movement properties
    this.speed = options.speed || 0;
    this.targetX = null;
    this.targetY = null;
    this.moveSpeed = options.moveSpeed || 1;
    
    // Custom properties
    this.data = options.data || {};
    
    // Reset animation
    if (this.sprite.animations[this.currentAnim]) {
      resetSpriteAnimation(this.sprite, this.currentAnim);
    }
  }

  /**
   * Update entity state
   */
  update() {
    if (!this.active) return;

    // Update animation
    this.animationFrame += this.animationSpeed;
    updateSpriteAnimation(this.sprite, this.currentAnim, this.animationSpeed);

    // Handle movement towards target
    if (this.targetX !== null && this.targetY !== null) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        // Move towards target
        this.vx = (dx / dist) * this.moveSpeed;
        this.vy = (dy / dist) * this.moveSpeed;
        
        // Update facing direction based on movement
        if (Math.abs(dx) > Math.abs(dy)) {
          this.facing = dx > 0 ? 'right' : 'left';
        } else {
          this.facing = dy > 0 ? 'down' : 'up';
        }
        
        // Set walking animation
        this.setAnimationForDirection();
      } else {
        // Reached target
        this.vx = 0;
        this.vy = 0;
        this.targetX = null;
        this.targetY = null;
        // Return to idle animation
        const idleAnims = ['idle', 'walkDown'];
        for (const animName of idleAnims) {
          if (this.sprite.animations[animName]) {
            this.setAnimation(animName);
            break;
          }
        }
      }
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Apply velocity decay
    this.vx *= 0.9;
    this.vy *= 0.9;

    // Reset hover state
    this.hovered = false;
    this.clicked = false;
  }

  /**
   * Set animation based on facing direction
   */
  setAnimationForDirection() {
    const animMap = {
      'up': ['walkUp', 'idle'],
      'down': ['walkDown', 'idle'],
      'left': ['walkLeft', 'idle'],
      'right': ['walkRight', 'idle'],
    };
    
    const anims = animMap[this.facing] || ['walkDown', 'idle'];
    for (const animName of anims) {
      if (this.sprite.animations[animName]) {
        this.setAnimation(animName);
        return;
      }
    }
  }

  /**
   * Set current animation
   */
  setAnimation(animName) {
    if (this.sprite.animations[animName] && this.currentAnim !== animName) {
      this.currentAnim = animName;
      resetSpriteAnimation(this.sprite, animName);
    }
  }

  /**
   * Move to target position
   */
  moveTo(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Set velocity
   */
  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  /**
   * Check if point is within bounds
   */
  containsPoint(x, y) {
    if (!this.interactive || !this.visible) return false;
    
    const frame = getSpriteFrame(this.sprite, this.currentAnim);
    if (!frame) return false;
    
    const halfWidth = (this.sprite.width * this.scale) / 2;
    const halfHeight = (this.sprite.height * this.scale) / 2;
    
    return (
      x >= this.x - halfWidth &&
      x <= this.x + halfWidth &&
      y >= this.y - halfHeight &&
      y <= this.y + halfHeight
    );
  }

  /**
   * Handle click
   */
  handleClick(x, y) {
    if (this.containsPoint(x, y)) {
      this.clicked = true;
      if (this.onClick) {
        this.onClick(this, x, y);
      }
      return true;
    }
    return false;
  }

  /**
   * Handle hover
   */
  handleHover(x, y) {
    if (this.containsPoint(x, y)) {
      this.hovered = true;
      if (this.onHover) {
        this.onHover(this, x, y);
      }
      return true;
    }
    return false;
  }

  /**
   * Draw the entity
   */
  draw(ctx) {
    if (!this.visible) return;

    const frame = getSpriteFrame(this.sprite, this.currentAnim);
    if (!frame) return;

    ctx.save();
    
    // Apply hover effect
    if (this.hovered && this.interactive) {
      ctx.globalAlpha = 0.8;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 5;
    }

    // Draw sprite centered at position
    const halfWidth = (this.sprite.width * this.scale) / 2;
    const halfHeight = (this.sprite.height * this.scale) / 2;
    
    ctx.drawImage(
      frame.canvas,
      this.x - halfWidth,
      this.y - halfHeight,
      this.sprite.width * this.scale,
      this.sprite.height * this.scale
    );

    // Draw selection indicator if clicked
    if (this.clicked && this.interactive) {
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.x - halfWidth - 2,
        this.y - halfHeight - 2,
        (this.sprite.width * this.scale) + 4,
        (this.sprite.height * this.scale) + 4
      );
    }

    ctx.restore();
  }

  /**
   * Get distance to another entity or point
   */
  distanceTo(x, y) {
    return distance(this.x, this.y, x, y);
  }
}

/**
 * Sprite Entity Manager
 * Manages all sprite entities in the game
 */
export class SpriteEntityManager {
  constructor() {
    this.entities = [];
    this.nextId = 0;
  }

  /**
   * Add an entity
   */
  addEntity(sprite, x, y, options = {}) {
    const entity = new SpriteEntity(sprite, x, y, options);
    entity.id = this.nextId++;
    this.entities.push(entity);
    return entity;
  }

  /**
   * Remove an entity
   */
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  /**
   * Get entity by ID
   */
  getEntity(id) {
    return this.entities.find(e => e.id === id);
  }

  /**
   * Get entities at position
   */
  getEntitiesAt(x, y) {
    return this.entities.filter(e => e.containsPoint(x, y));
  }

  /**
   * Get nearest entity to position
   */
  getNearestEntity(x, y, maxDistance = Infinity) {
    let nearest = null;
    let minDist = maxDistance;

    for (const entity of this.entities) {
      const dist = entity.distanceTo(x, y);
      if (dist < minDist) {
        minDist = dist;
        nearest = entity;
      }
    }

    return nearest;
  }

  /**
   * Update all entities
   */
  update() {
    for (const entity of this.entities) {
      entity.update();
    }
  }

  /**
   * Draw all entities
   */
  draw(ctx) {
    for (const entity of this.entities) {
      entity.draw(ctx);
    }
  }

  /**
   * Handle click at position
   */
  handleClick(x, y) {
    // Process entities in reverse order (top to bottom)
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if (entity.handleClick(x, y)) {
        return entity;
      }
    }
    return null;
  }

  /**
   * Handle hover at position
   */
  handleHover(x, y) {
    for (const entity of this.entities) {
      entity.handleHover(x, y);
    }
  }

  /**
   * Clear all entities
   */
  clear() {
    this.entities = [];
  }

  /**
   * Get all entities
   */
  getAll() {
    return [...this.entities];
  }
}

