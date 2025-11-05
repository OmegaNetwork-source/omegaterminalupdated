import {AI_TYPES} from './ai.js';
import {DEATH_SPECS, EXPLOSION_SHAKE_REDUCTION_FACTOR, H, MAX_EXPLOSION_SHAKE_FACTOR, MAX_WIND, PARTICLE_AMOUNT, PARTICLE_FADE_AMOUNT, PARTICLE_MAX_POWER_FACTOR, PARTICLE_MIN_LIFETIME, PARTICLE_MIN_POWER_FACTOR, PARTICLE_POWER_REDUCTION_FACTOR, PARTICLE_TIME_FACTOR, PARTICLE_WIND_REDUCTION_FACTOR, PLAYER_ANGLE_FAST_INCREMENT, PLAYER_ANGLE_INCREMENT, PLAYER_ANGLE_TICK_SOUND_INTERVAL, PLAYER_COLORS, PLAYER_ENERGY_POWER_MULTIPLIER, PLAYER_EXPLOSION_PARTICLE_POWER, PLAYER_FALL_DAMAGE_FACTOR, PLAYER_FALL_DAMAGE_HEIGHT, PLAYER_INITIAL_POWER, PLAYER_MAX_ENERGY, PLAYER_POWER_FAST_INCREMENT, PLAYER_POWER_INCREMENT, PLAYER_POWER_TICK_SOUND_INTERVAL, PLAYER_STARTING_TOOLS, PLAYER_STARTING_WEAPONS, PLAYER_TANK_BOUNDING_RADIUS, PLAYER_TANK_Y_FOOTPRINT, SHIELD_TYPES, TRAJECTORY_FADE_SPEED, TRAJECTORY_FLOAT_SPEED, W, WEAPON_TYPES, Z} from './constants.js';
import {createCanvas, drawLine, drawRect, drawSemiCircle, drawText, loop, plot, strokeCircle} from './gfx.js';
import {afterKeyDelay, key} from './input.js';
import {clamp, deg2rad, distance, parable, random, randomInt, vec, wrap} from './math.js';
import {initMenu, updateMenu, drawMenu, showMenu, hideMenu, isMenuVisible} from './menu.js';
import {initUI, updatePlayerRoster, updatePlayerStatus, setCurrentPlayer, hidePanels, showPanels} from './ui.js';
import {PROJECTILE_TYPES} from './projectiles.js';
import {generateSky} from './sky.js';
import {playTickSound} from './sound.js';
import {initTankSprites, drawTank} from './tankSprites.js';
import {clipTerrain, closestLand, collapseTerrain, generateTerrain, isTerrain, landHeight} from './terrain.js';
import {sample, shuffle} from './utils.js';
import {EXPLOSION_TYPES} from './weapons.js';


let state = 'menu';
let players = [];
let currentPlayer = 0;
let projectiles = [];
let explosions = [];
let wind = 0;
let particles = [];
let screenShake = 0;
let trajectories = [];
let idle = false;
let winner;
let tankSprites = null;
let animationFrame = 0;
let firingPlayerIndex = null;
let firingFrameCount = 0;

// Music
// const music = createAudioLoop('assets/battle.mp3');

// Init layers
const sky = createCanvas(W, H);
const traces = createCanvas(W, H);
const terrain = createCanvas(W, H);
const foreground = createCanvas(W, H);

// Composited layer
const framebuffer = createCanvas(W, H);
framebuffer.canvas.style.width = `${W * Z}px`;
framebuffer.canvas.style.height = `${H * Z}px`;
framebuffer.canvas.style.position = 'relative';
framebuffer.canvas.style.imageRendering = 'pixelated';
// Add to game container if it exists, otherwise body
const gameContainer = document.getElementById('game-container');
if (gameContainer) {
  gameContainer.appendChild(framebuffer.canvas);
} else {
  document.body.appendChild(framebuffer.canvas);
}

// Initialize menu system
initMenu();
// Initialize UI panels
initUI();

function init() {
  state = 'menu';
}

function initGame() {
  players = [];
  currentPlayer = 0;
  projectiles = [];
  explosions = [];
  particles = [];
  screenShake = 0;
  trajectories = [];
  idle = false;
  winner = null;
  wind = randomInt(-MAX_WIND, +MAX_WIND);
  animationFrame = 0;
  firingPlayerIndex = null;
  firingFrameCount = 0;

  // Clear all layers
  traces.clearRect(0, 0, W, H);
  foreground.clearRect(0, 0, W, H);

  // Reset screen shake transform
  framebuffer.canvas.style.transform = 'translate(0px, 0px)';

  // Initialize tank sprites
  tankSprites = initTankSprites(PLAYER_COLORS);

  initLevel();
  initPlayers();
  
  // Initialize scores for all players
  for (let player of players) {
    if (!player.score) player.score = 0;
    if (!player.kills) player.kills = 0;
  }
  
  // Force first frame render
  idle = false;
}

function initPlayers() {
  for (let i=0; i<PLAYER_COLORS.length; i++) {
    const [color, borderColor] = PLAYER_COLORS[i];
    players.push({
      name: `Player ${i+1}`,
      dead: false,
      x:0, y:0, a:0,
      c: color, cb: borderColor,
      colorIndex: i, // Store color index for sprite lookup
      p: PLAYER_INITIAL_POWER,
      tools: PLAYER_STARTING_TOOLS.map(x => ({...x})), // FIXME: Ghetto clone
      weapons: PLAYER_STARTING_WEAPONS.map(x => ({...x})), // FIXME: Ghetto clone
      currentWeapon: 0,
      energy: PLAYER_MAX_ENERGY,
      shield: {type:'springShield', energy:SHIELD_TYPES.springShield.energy},
      ai: i !== 0 ? sample(Object.keys(AI_TYPES)) : undefined,
      parachute: null,
      fallHeight: 0,
      score: 0, // Add score tracking
      kills: 0, // Add kill tracking
    });
  }

  // Randomize positions
  players = shuffle(players);

  // Positions
  for (let i=0; i<PLAYER_COLORS.length; i++) {
    const player = players[i];
    player.x = 50 + (W-100) / 5 * i;
    player.y = landHeight(terrain, player.x) + 1;
    player.a = player.x > W/2 ? 45 : 180-45;
    clipTerrain(terrain, (ctx) => drawRect(ctx, player.x-4, 0, 8, player.y, ctx.color));
  }
}

function initLevel() {
  generateSky(sky);
  generateTerrain(terrain);
}

function update() {
  idle = false;

  // Handle menu state
  if (state === 'menu') {
    const menuResult = updateMenu();
    if (menuResult === 'start-game') {
      hideMenu();
      initGame();
      state = 'start-turn';
      idle = false; // Force render on next frame
      // Initialize UI with players
      if (players.length > 0) {
        setCurrentPlayer(currentPlayer);
        updatePlayerRoster(players);
      }
    }
    return;
  }

  // Update animation frame
  animationFrame++;
  if (firingPlayerIndex !== null) {
    firingFrameCount++;
    if (firingFrameCount > 10) {
      firingPlayerIndex = null;
      firingFrameCount = 0;
    }
  }

  updateParticles();

  if (state === 'start-game') {
    initGame();
    state = 'start-turn';
  }

  else if (state === 'start-turn') {
    state = 'aim';
  }

  else if (state === 'aim') {
    const player = players[currentPlayer];
    const {x, y, a, p, weapons, energy} = player;
    const maxPower = energy * PLAYER_ENERGY_POWER_MULTIPLIER;
    player.p = clamp(0, player.p, maxPower);
    const isPrecise = key('Alt');
    const isFast = key('Shift');
    const isReverse = key('Shift');
    let shoot;

    if (player.ai) {
      let ai = AI_TYPES[player.ai];
      const plan = ai.decide(player);
      player.a = wrap(0, plan.a, 180);
      player.p = clamp(0, plan.p, maxPower);
      player.currentWeapon = clamp(0, plan.currentWeapon, weapons.length-1);
      shoot = true;
    }

    else if (key('ArrowLeft')) {
      if (isPrecise && !afterKeyDelay()) return;
      let incr = isFast ? PLAYER_ANGLE_FAST_INCREMENT : PLAYER_ANGLE_INCREMENT;
      player.a = wrap(0, a -incr, 180);
      if (isPrecise || isFast || a % PLAYER_ANGLE_TICK_SOUND_INTERVAL === 0) playTickSound();

    } else if (key('ArrowRight')) {
      if (isPrecise && !afterKeyDelay()) return;
      let incr = isFast ? PLAYER_ANGLE_FAST_INCREMENT : PLAYER_ANGLE_INCREMENT;
      player.a = wrap(0, a +incr, 180);
      if (isPrecise || isFast || a % PLAYER_ANGLE_TICK_SOUND_INTERVAL === 0) playTickSound();

    } else if (key('ArrowUp')) {
      if (isPrecise && !afterKeyDelay()) return;
      let incr = isFast ? PLAYER_POWER_FAST_INCREMENT : PLAYER_POWER_INCREMENT;
      player.p = clamp(0, p +incr, maxPower);
      if (p < maxPower && (isPrecise || isFast || p % PLAYER_POWER_TICK_SOUND_INTERVAL === 0)) playTickSound();

    } else if (key('ArrowDown')) {
      if (isPrecise && !afterKeyDelay()) return;
      let incr = isFast ? PLAYER_POWER_FAST_INCREMENT : PLAYER_POWER_INCREMENT;
      player.p = clamp(0, p -incr, maxPower);
      if (p > 0 && (isPrecise || isFast || p % PLAYER_POWER_TICK_SOUND_INTERVAL === 0)) playTickSound();

    } else if (key('Tab')) {
      if (!afterKeyDelay()) return;
      const dir = isReverse ? -1 : 1;
      player.currentWeapon = wrap(0, player.currentWeapon+dir, player.weapons.length-1);
      playTickSound();

    } else if (key(' ')) {
      if (!afterKeyDelay()) return;
      shoot = {a, p};

    } else {
      idle = true;
    }

    if (shoot) {
      const {a, p, weapons, currentWeapon} = player;
      const [px, py] = vec(x, y-3, a+180, 5);

      const weapon = weapons[currentWeapon];
      const {projectile} = WEAPON_TYPES[weapon.type];
      const projectileType = PROJECTILE_TYPES[projectile.type];
      weapon.ammo -= 1;

      projectileType.create(projectile, player, weapon, px, py, a, p, wind)
        .forEach(x => projectiles.push(x));

      // Set firing animation
      firingPlayerIndex = currentPlayer;
      firingFrameCount = 0;

      state = 'shoot';
    }
  }

  else if (state === 'shoot') {
    for (let i=projectiles.length-1; i>=0; i--) {
      const projectile = projectiles[i];
      const projectileType = PROJECTILE_TYPES[projectile.type];
      if (projectileType.update(projectile, terrain, projectiles, trajectories, explosions)) continue;
      projectileType.stop(projectile);
      projectiles.splice(i, 1);
    }
    if (projectiles.length === 0) {
      state = 'explosions';
    }
  }

  else if (state === 'explosions') {
    for (let i=explosions.length-1; i>=0; i--) {
      const explosion = explosions[i];
      const explosionType = EXPLOSION_TYPES[explosion.type];
      screenShake = (
        clamp(0, explosion.r, MAX_EXPLOSION_SHAKE_FACTOR) /
        EXPLOSION_SHAKE_REDUCTION_FACTOR
      );

      if (explosionType.update(explosion)) continue;
      screenShake = 0;
      explosionType.clip(explosion, terrain);
      explosionType.stop(explosion);

      for (let player of players) if (!player.dead) {
        let damage = explosionType.damage(explosion, player);
        let remainingDamage = damage;
        if (!damage) continue;

        if (player.shield) {
          remainingDamage = clamp(0, damage-player.shield.energy, Infinity);
          player.shield.energy = clamp(0, player.shield.energy-damage, Infinity);
        }

        player.energy -= remainingDamage;
      }
      explosions.splice(i, 1);
    }
    if (explosions.length === 0) {
      state = 'land-collapse';
    }
  }

  else if (state === 'land-collapse') {
    collapseTerrain(terrain);
    state = 'land-players';
  }

  else if (state === 'land-players') {
    let stable = true;
    for (let player of players) {
      if (player.dead) continue;
      const y = closestLand(terrain, player.x, player.y);
      if (player.y !== y) {
        stable = false;
        player.y++;
        if (player.fallHeight++ >= PLAYER_FALL_DAMAGE_HEIGHT) {
          if (player.energy > 0 && player.parachute) continue;
          const parachute = player.tools.find(x => x.type === 'parachute');
          if (player.energy > 0 && parachute && parachute.ammo > 0) {
            player.parachute = parachute;
            parachute.ammo--;
            continue;
          }
          player.energy -= PLAYER_FALL_DAMAGE_FACTOR;
        }
      } else {
        player.parachute = null;
      }
    }
    if (stable) state = 'destroy-players';
  }

  else if (state === 'destroy-players') {
    const dyingPlayer = players.find(x => x.energy<=0 && !x.dead);
    if (!dyingPlayer) {state = 'end-turn'; return}

    const {x, y, c} = dyingPlayer;
    const explosionSpec = sample(DEATH_SPECS);
    const explosionType = EXPLOSION_TYPES[explosionSpec.type];
    explosions.push(explosionType.create(explosionSpec, x, y));
    createParticles(x, y, PLAYER_EXPLOSION_PARTICLE_POWER, c);
    dyingPlayer.dead = true;
    
    // Award points to the current player for the kill
    if (players[currentPlayer] && !players[currentPlayer].dead) {
      players[currentPlayer].kills += 1;
      players[currentPlayer].score += 100; // 100 points per kill
    }
    
    state = 'explosions';
  }

  else if (state === 'end-turn') {
    const alivePlayers = players.filter(x => !x.dead);

    if (alivePlayers.length === 0) {
      return state = 'game-over';
    } else if (alivePlayers.length === 1) {
      winner = alivePlayers[0];
      return state = 'player-win';
    }

    for (let player of players) {
      player.weapons = player.weapons.filter(x => x.ammo > 0);
      player.tools = player.tools.filter(x => x.ammo > 0);
      player.currentWeapon = wrap(0, player.currentWeapon, player.weapons.length-1);
      if (player.shield && player.shield.energy <= 0) player.shield = null;
      player.fallHeight = 0;
    }

    for (let p=0; p<players.length; p++) {
      const i = wrap(0, currentPlayer+p+1, players.length-1);
      if (!players[i].dead) {
        currentPlayer = i;
        setCurrentPlayer(i);
        break;
      }
    }

    fadeTrajectories();
    state = 'start-turn';
  }

  else if (state === 'player-win') {
    if (key('Enter')) {
      showMenu();
      state = 'menu';
    }
    idle = true;
  }

  else if (state === 'game-over') {
    if (key('Enter')) {
      showMenu();
      state = 'menu';
    }
    idle = true;
  }

  else {
    throw new Error(`Invalid state, ${state}`);
  }
}

export function createParticles(x, y, p, c) {
  for (let i = 0; i < PARTICLE_AMOUNT; i++) {
    particles.push({
      t: 0,
      ox: x, x: x,
      oy: y, y: y,
      a: randomInt(0, 359),
      p: p * random(PARTICLE_MIN_POWER_FACTOR, PARTICLE_MAX_POWER_FACTOR),
      // @ts-ignore: canvas color hack
      c, alpha: 255,
    });
  }
}

function updateParticles() {
  for (let i=particles.length-1; i>=0; i--) {
    const particle = particles[i];

    if (
      particle.y > H ||
      particle.alpha <= 0 ||
      particle.t > PARTICLE_MIN_LIFETIME && isTerrain(terrain, particle.x, particle.y)
    ) {
      particles.splice(i, 1);
      continue;
    }

    const {ox, oy, t, a, p} = particle;

    const [tx, ty] = parable(
      t / PARTICLE_TIME_FACTOR,
      ox, oy, deg2rad(180+a),
      p / PARTICLE_POWER_REDUCTION_FACTOR,
      wind / PARTICLE_WIND_REDUCTION_FACTOR,
    );

    particle.t++;
    particle.x = tx;
    particle.y = ty;
    particle.alpha -= PARTICLE_FADE_AMOUNT;
  }
}

export function isTank(x, y) {
  for (let player of players) {
    if (player.dead) continue;

    if (
      distance(x, y, player.x, player.y+PLAYER_TANK_Y_FOOTPRINT) <=
      PLAYER_TANK_BOUNDING_RADIUS
    ) {
      return true;
    }
  }
}

export function isTankShield(x, y) {
  for (let player of players) {
    if (player.dead) continue;
    if (!player.shield) continue;
    const shieldType = SHIELD_TYPES[player.shield.type];
    const playerDistance = distance(x, y, player.x, player.y+PLAYER_TANK_Y_FOOTPRINT);

    if (playerDistance - shieldType.r <= 1) {
      return {player, shieldType};
    }
  }
}

function draw() {
  // Draw menu if visible
  if (isMenuVisible()) {
    hidePanels();
    drawMenu();
    return;
  }
  
  // Ensure menu canvas is hidden when menu is not visible
  const menuCanvasEl = document.querySelector('canvas[data-menu]');
  if (menuCanvasEl) {
    menuCanvasEl.style.display = 'none';
  }
  
  // Show panels when game is active
  showPanels();
  
  // Update UI panels with current game state
  if (players.length > 0) {
    updatePlayerRoster(players);
    updatePlayerStatus(players[currentPlayer], wind, state);
  }

  // Always draw the game layers first (sky, terrain are static)
  framebuffer.clearRect(0, 0, W, H);
  
  // Draw static layers
  framebuffer.drawImage(sky.canvas, 0, 0);
  framebuffer.drawImage(terrain.canvas, 0, 0);
  
  // Clear and draw dynamic layers
  foreground.clearRect(0, 0, W, H);
  drawTrajectories();
  drawPlayers();
  drawProjectile();
  drawExplosions();
  drawParticles();
  drawStatus();
  
  // Draw dynamic layers on top
  framebuffer.drawImage(traces.canvas, 0, 0);
  framebuffer.drawImage(foreground.canvas, 0, 0);

  drawScreenShake();
}

function drawPlayers() {
  if (!tankSprites) return;
  
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const {x, y, a, c, cb, energy, shield, dead, colorIndex} = player;
    if (dead) continue;

    // Determine animation state
    let animState = 'idle';
    const healthPercent = energy / PLAYER_MAX_ENERGY;
    
    if (firingPlayerIndex === i && firingFrameCount <= 10) {
      animState = 'firing';
    } else if (healthPercent < 0.5) {
      animState = 'damaged';
    }

    // Shield
    if (shield) {
      const {type, energy} = shield;
      const shieldType = SHIELD_TYPES[type];
      foreground.globalAlpha = energy / shieldType.energy;
      for (let j=0; j<shieldType.s; j++) {
        strokeCircle(foreground, x, y+PLAYER_TANK_Y_FOOTPRINT, shieldType.r+j, shieldType.color);
      }
      foreground.globalAlpha = 1;
    }

    // Parachute
    if (player.parachute) {
      drawSemiCircle(foreground, x, y-15, 10, 'white');
      drawLine(foreground, x-10, y-15, x-2, y, 'white');
      drawLine(foreground, x-5,  y-15, x-1, y, 'white');
      drawLine(foreground, x,    y-15, x,   y, 'white');
      drawLine(foreground, x+5,  y-15, x+1, y, 'white');
      drawLine(foreground, x+10, y-15, x+2, y, 'white');
    }

    // Draw tank sprite using colorIndex to match sprite
    const sprites = tankSprites.get(colorIndex);
    if (sprites) {
      const frame = Math.floor(animationFrame / 8) % 4; // Slow down animation
      drawTank(foreground, sprites, animState, frame, x, y, a, c, cb, 8);
      
      // Add damage overlay for heavily damaged tanks
      const damage = clamp(0, 1 - healthPercent, 1);
      if (damage > 0.3) {
        foreground.globalAlpha = damage * 0.5;
        drawRect(foreground, Math.round(x - 6), Math.round(y - 1), 12, 6, cb);
        foreground.globalAlpha = 1;
      }
    }
    
    // Draw player name/number above tank
    const nameText = player.name || `P${i+1}`;
    const nameY = y - 15;
    // Background for text readability
    foreground.globalAlpha = 0.7;
    drawRect(foreground, Math.round(x - (nameText.length * 2 + 2)), Math.round(nameY - 2), nameText.length * 4 + 4, 7, 'black');
    foreground.globalAlpha = 1;
    // Player name text
    drawText(foreground, nameText, x, nameY, c, 'center');
  }
}

function drawTrajectories() {
  traces.clearRect(0, 0, W, H);
  for (let i=trajectories.length-1; i>=0; i--) {
    const trajectory = trajectories[i];
    const {x, y, c} = trajectory;
    traces.globalAlpha = trajectory.a / 255;
    plot(traces, x, y, c);
  }
  traces.globalAlpha = 1;
}

function fadeTrajectories() {
  for (let i=trajectories.length-1; i>=0; i--) {
    const trajectory = trajectories[i];
    trajectory.a -= TRAJECTORY_FADE_SPEED;
    trajectory.y -= TRAJECTORY_FLOAT_SPEED;
    if (trajectory.a <= 0 || trajectory.y <= 0) {
      trajectories.splice(i, 1);
    }
  }
}

function drawProjectile() {
  if (!projectiles.length) return;
  for (let projectile of projectiles) {
    plot(foreground, clamp(0, projectile.x, W-1), clamp(0, projectile.y, H-1), 'white');
  }
}

function drawExplosions() {
  if (!explosions.length) return;
  for (let explosion of explosions) {
    const explosionType = EXPLOSION_TYPES[explosion.type];
    explosionType.draw(explosion, foreground, terrain);
  }
}

function drawParticles() {
  for (let particle of particles) {
    foreground.globalAlpha = clamp(0, particle.alpha / 255, 255);
    plot(foreground, particle.x, particle.y, particle.c);
  }
  foreground.globalAlpha = 1;
}

function drawScreenShake() {
  // Screen shake with relative positioning
  if (screenShake > 0) {
    const x = randomInt(-screenShake, screenShake);
    const y = randomInt(-screenShake, screenShake);
    framebuffer.canvas.style.transform = `translate(${x}px, ${y}px)`;
  } else {
    framebuffer.canvas.style.transform = 'translate(0px, 0px)';
  }
}

function drawStatus() {
  if (state === 'player-win') {
    drawText(foreground, `${winner.name} wins!`, 8, 8, winner.c, 'left');
    drawText(foreground, `Score: ${winner.score} | Kills: ${winner.kills}`, 8, 18, 'white', 'left');
    drawText(foreground, `Press ENTER to play again`, W-8, 8, 'white', 'right');
    return;
  }

  else if (state === 'game-over') {
    drawText(foreground, `EVERYBODY IS DEAD`, 8, 8, 'white', 'left');
    drawText(foreground, `Press ENTER to play again`, W-8, 8, 'white', 'right');
    return;
  }

  // Draw Scoreboard HUD
  const player = players[currentPlayer];
  if (!player) return;
  
  const {currentWeapon, name, energy, a, p, shield, score, c} = player;
  const weapon = player.weapons[currentWeapon];
  const weaponType = WEAPON_TYPES[weapon.type];
  
  // Scoreboard background
  foreground.globalAlpha = 0.85;
  drawRect(foreground, 0, 0, W, 18, 'black');
  foreground.globalAlpha = 1;
  
  // Player name and stats - formatted like: "PLAYER 1   NRG:100   SCORE:500   AIM:45   PWR:300   SHD:100   99 BABY MISSILE"
  const statusText = `${name.toUpperCase()}   NRG:${Math.max(0, Math.floor(energy))}   SCORE:${score}   AIM:${a}   PWR:${p}   SHD:${shield?Math.floor(shield.energy):0}   ${clamp(0, weapon.ammo, 99)} ${weaponType.name.toUpperCase()}`;
  drawText(foreground, statusText, 8, 6, c, 'left');
  
  // Wind indicator on right
  drawText(foreground, `WIND: ${wind<=0?'<':''}${Math.abs(wind)}${wind>=0?'>':''}`, W-8, 6, 'white', 'right');
}

loop(() => {
  update();
  draw();
});
