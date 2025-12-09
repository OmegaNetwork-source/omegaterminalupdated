/**
 * Player Character System
 * Manages character sprites linked to tanks with movement, hit detection, and AI
 */

import { getSpriteFrame, updateSpriteAnimation } from '../spriteLoader.js';
import { distance, clamp, deg2rad } from './math.js';
import { W, H, PLAYER_TANK_BOUNDING_RADIUS } from './constants.js';
import { isTerrain, landHeight } from './terrain.js';

export const CHARACTER_MAX_HEALTH = 2; // 2 hits = death
export const CHARACTER_MOVE_SPEED = 1.5;
export const CHARACTER_BOUNDING_RADIUS = 6; // Slightly larger than tank (4)
export const CHARACTER_POINTS_PER_SURVIVAL = 50; // Points per turn survived
export const CHARACTER_BONUS_POINTS = 200; // Bonus if character survives entire game

/**
 * Player Character Class
 * Represents a character sprite linked to a player/tank
 */
export class PlayerCharacter {
  constructor(player, sprite, terrain, spriteSheets) {
    this.player = player;
    this.sprite = sprite;
    this.terrain = terrain;
    this.spriteSheets = spriteSheets;
    
    // Position - spawn near tank
    this.x = player.x;
    this.y = player.y - 20; // Slightly above tank
    
    // Movement
    this.vx = 0;
    this.vy = 0;
    this.targetX = null;
    this.targetY = null;
    
    // State
    this.health = CHARACTER_MAX_HEALTH;
    this.maxHealth = CHARACTER_MAX_HEALTH;
    this.alive = true;
    this.facing = 'down';
    this.currentAnim = 'idle';
    this.animationFrame = 0;
    
    // AI avoidance
    this.avoidanceTarget = null;
    this.avoidanceDistance = 0;
    this.lastAvoidanceUpdate = 0;
    
    // Scoring
    this.turnsSurvived = 0;
    this.pointsEarned = 0;
    
    // Movement bounds (relative to tank)
    this.maxDistanceFromTank = 80;
    this.minDistanceFromTank = 15;
  }

  /**
   * Update character state
   */
  update(explosions = [], projectiles = [], isPlayerTurn = false, currentPlayerIndex = -1) {
    if (!this.alive) return;
    
    // Update animation
    this.animationFrame += 0.15;
    updateSpriteAnimation(this.sprite, this.currentAnim, 0.15);
    
    // Check if this character belongs to current player
    // Note: players array is passed from game engine
    const isOwnCharacter = this.player && currentPlayerIndex >= 0 && 
                          this.player.isPlayer;
    
    // AI avoidance behavior (for AI characters or when not player's turn)
    if (!isOwnCharacter || !isPlayerTurn) {
      this.updateAvoidance(explosions, projectiles);
    }
    
    // Handle movement towards target
    if (this.targetX !== null && this.targetY !== null) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 2) {
        this.vx = (dx / dist) * CHARACTER_MOVE_SPEED;
        this.vy = (dy / dist) * CHARACTER_MOVE_SPEED;
        
        // Update facing direction
        if (Math.abs(dx) > Math.abs(dy)) {
          this.facing = dx > 0 ? 'right' : 'left';
        } else {
          this.facing = dy > 0 ? 'down' : 'up';
        }
        
        this.setAnimationForDirection();
      } else {
        this.vx = 0;
        this.vy = 0;
        this.targetX = null;
        this.targetY = null;
        this.setAnimation('idle');
      }
    }
    
    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;
    
    // Keep within bounds of tank
    this.constrainToTankArea();
    
    // Apply terrain collision
    this.handleTerrainCollision();
    
    // Decay velocity
    this.vx *= 0.85;
    this.vy *= 0.85;
    
    // Check for hits
    this.checkHits(explosions, projectiles);
  }

  /**
   * Update AI avoidance behavior
   */
  updateAvoidance(explosions, projectiles) {
    const now = Date.now();
    if (now - this.lastAvoidanceUpdate < 100) return; // Update every 100ms
    this.lastAvoidanceUpdate = now;
    
    // Find nearest threat
    let nearestThreat = null;
    let minDist = Infinity;
    
    // Check explosions
    for (const explosion of explosions) {
      const dist = distance(this.x, this.y, explosion.x, explosion.y);
      const safeDistance = explosion.r + CHARACTER_BOUNDING_RADIUS + 10;
      if (dist < safeDistance && dist < minDist) {
        minDist = dist;
        nearestThreat = { x: explosion.x, y: explosion.y, r: explosion.r };
      }
    }
    
    // Check projectiles
    for (const projectile of projectiles) {
      const dist = distance(this.x, this.y, projectile.x, projectile.y);
      const safeDistance = 15;
      if (dist < safeDistance && dist < minDist) {
        minDist = dist;
        nearestThreat = { x: projectile.x, y: projectile.y, r: 5 };
      }
    }
    
    // Move away from threat
    if (nearestThreat) {
      const dx = this.x - nearestThreat.x;
      const dy = this.y - nearestThreat.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        const avoidX = this.x + (dx / dist) * 30;
        const avoidY = this.y + (dy / dist) * 30;
        this.moveTo(avoidX, avoidY);
      }
    }
  }

  /**
   * Constrain character to area around tank
   */
  constrainToTankArea() {
    if (!this.player || this.player.dead) return;
    
    const distFromTank = distance(this.x, this.y, this.player.x, this.player.y);
    
    if (distFromTank > this.maxDistanceFromTank) {
      // Move back towards tank
      const dx = this.player.x - this.x;
      const dy = this.player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.x = this.player.x - (dx / dist) * this.maxDistanceFromTank;
      this.y = this.player.y - (dy / dist) * this.maxDistanceFromTank;
    } else if (distFromTank < this.minDistanceFromTank) {
      // Move away from tank
      const dx = this.x - this.player.x;
      const dy = this.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        this.x = this.player.x + (dx / dist) * this.minDistanceFromTank;
        this.y = this.player.y + (dy / dist) * this.minDistanceFromTank;
      }
    }
  }

  /**
   * Handle terrain collision
   */
  handleTerrainCollision() {
    const groundY = landHeight(this.terrain, this.x);
    
    // Keep character above ground
    if (this.y > groundY - 5) {
      this.y = groundY - 5;
      this.vy = 0;
    }
    
    // Check for terrain collision
    if (isTerrain(this.terrain, this.x, this.y)) {
      // Move up
      this.y -= 2;
      this.vy = 0;
    }
  }

  /**
   * Check for hits from explosions and projectiles
   */
  checkHits(explosions, projectiles) {
    if (!this.alive) return;
    
    // Check explosions
    for (const explosion of explosions) {
      const dist = distance(this.x, this.y, explosion.x, explosion.y);
      if (dist <= explosion.r + CHARACTER_BOUNDING_RADIUS) {
        this.takeHit(explosion.x, explosion.y);
        break; // Only one hit per frame
      }
    }
    
    // Check projectiles (only if close)
    for (const projectile of projectiles) {
      const dist = distance(this.x, this.y, projectile.x, projectile.y);
      if (dist <= CHARACTER_BOUNDING_RADIUS + 3) {
        this.takeHit(projectile.x, projectile.y);
        break; // Only one hit per frame
      }
    }
  }

  /**
   * Take a hit
   */
  takeHit(hitX, hitY) {
    if (!this.alive) return;
    
    this.health--;
    
    // Visual feedback
    if (this.player) {
      // Add hit indicator
      if (typeof window !== 'undefined' && window.addDamageNumber) {
        window.addDamageNumber(this.x, this.y - 10, 'HIT!', '#ff4444');
      }
    }
    
    if (this.health <= 0) {
      this.die();
    }
  }

  /**
   * Character dies
   */
  die() {
    this.alive = false;
    this.health = 0;
    
    // Visual feedback - could add death animation here
    if (this.player && typeof window !== 'undefined' && window.addDamageNumber) {
      window.addDamageNumber(this.x, this.y - 10, 'CHARACTER DOWN!', '#ff0000');
    }
    
    // Award points to player who killed this character (if applicable)
    // This would be handled by the game engine tracking who caused the damage
  }

  /**
   * Move character to position
   */
  moveTo(x, y) {
    // Constrain to valid area
    const constrainedX = clamp(CHARACTER_BOUNDING_RADIUS, x, W - CHARACTER_BOUNDING_RADIUS);
    const constrainedY = clamp(CHARACTER_BOUNDING_RADIUS, y, H - CHARACTER_BOUNDING_RADIUS);
    
    this.targetX = constrainedX;
    this.targetY = constrainedY;
  }

  /**
   * Set velocity directly
   */
  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
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
      const animation = this.sprite.animations[animName];
      if (animation) {
        animation.currentFrame = 0;
      }
    }
  }

  /**
   * Draw the character
   */
  draw(ctx) {
    if (!this.alive) return;
    
    const frame = getSpriteFrame(this.sprite, this.currentAnim);
    if (!frame) return;
    
    ctx.save();
    
    // Scale to match tank size (tanks are ~16x12, scale characters to ~18-20px)
    // Use consistent scaling based on sprite dimensions
    const targetWidth = 20;
    const targetHeight = 20;
    const scaleX = targetWidth / this.sprite.width;
    const scaleY = targetHeight / this.sprite.height;
    const scale = Math.min(scaleX, scaleY); // Use smaller scale to maintain aspect ratio
    
    // Draw health indicator
    if (this.health < this.maxHealth) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(
        this.x - 10,
        this.y - 15,
        20,
        3
      );
      ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
      ctx.fillRect(
        this.x - 10,
        this.y - 15,
        20 * (this.health / this.maxHealth),
        3
      );
    }
    
    // Draw character sprite
    ctx.imageSmoothingEnabled = false;
    const halfWidth = (this.sprite.width * scale) / 2;
    const halfHeight = (this.sprite.height * scale) / 2;
    
    ctx.drawImage(
      frame.canvas,
      this.x - halfWidth,
      this.y - halfHeight,
      this.sprite.width * scale,
      this.sprite.height * scale
    );
    
    // Draw connection line to tank (if alive and far enough)
    if (this.player && !this.player.dead) {
      const dist = distance(this.x, this.y, this.player.x, this.player.y);
      if (dist > 20) {
        ctx.strokeStyle = `rgba(${this.player.c === 'tomato' ? '255, 99, 71' : '100, 149, 237'}, 0.3)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.player.x, this.player.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    
    ctx.restore();
  }

  /**
   * Check if point is within character bounds
   */
  containsPoint(x, y) {
    const dist = distance(this.x, this.y, x, y);
    return dist <= CHARACTER_BOUNDING_RADIUS;
  }

  /**
   * Award points for surviving a turn
   */
  awardSurvivalPoints() {
    if (this.alive && this.player && !this.player.dead) {
      this.turnsSurvived++;
      this.pointsEarned += CHARACTER_POINTS_PER_SURVIVAL;
      if (this.player) {
        this.player.score = (this.player.score || 0) + CHARACTER_POINTS_PER_SURVIVAL;
      }
    }
  }
}

/**
 * Player Character Manager
 * Manages all player characters in the game
 */
export class PlayerCharacterManager {
  constructor(terrain, spriteSheets) {
    this.characters = [];
    this.terrain = terrain;
    this.spriteSheets = spriteSheets;
  }

  /**
   * Initialize characters for all players
   */
  initCharacters(players) {
    this.characters = [];
    
    for (const player of players) {
      if (player.dead || !player.characterSprite) continue;
      
      const sprite = this.spriteSheets.get(player.characterSprite);
      if (!sprite) continue;
      
      const character = new PlayerCharacter(player, sprite, this.terrain, this.spriteSheets);
      this.characters.push(character);
      player.character = character; // Link character to player
    }
  }

  /**
   * Update all characters
   */
  update(explosions, projectiles, isPlayerTurn, currentPlayerIndex, players) {
    for (const character of this.characters) {
      character.update(explosions, projectiles, isPlayerTurn, currentPlayerIndex);
    }
  }

  /**
   * Draw all characters
   */
  draw(ctx) {
    for (const character of this.characters) {
      character.draw(ctx);
    }
  }

  /**
   * Get character for player
   */
  getCharacterForPlayer(player) {
    return this.characters.find(c => c.player === player);
  }

  /**
   * Handle character movement input
   */
  handleMovementInput(player, keys) {
    const character = this.getCharacterForPlayer(player);
    if (!character || !character.alive) return;
    
    let moveX = 0;
    let moveY = 0;
    
    // Arrow keys or WASD
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) moveX -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) moveX += 1;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) moveY -= 1;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) moveY += 1;
    
    if (moveX !== 0 || moveY !== 0) {
      const speed = CHARACTER_MOVE_SPEED;
      const newX = character.x + moveX * speed;
      const newY = character.y + moveY * speed;
      character.moveTo(newX, newY);
    }
  }

  /**
   * Award end-game bonuses for surviving characters
   */
  awardEndGameBonuses() {
    for (const character of this.characters) {
      if (character.alive && character.player && !character.player.dead) {
        character.pointsEarned += CHARACTER_BONUS_POINTS;
        if (character.player) {
          character.player.score = (character.player.score || 0) + CHARACTER_BONUS_POINTS;
        }
      }
    }
  }

  /**
   * Clear all characters
   */
  clear() {
    this.characters = [];
  }
}

