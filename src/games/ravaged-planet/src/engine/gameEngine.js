import {AI_TYPES} from './ai.js';
import {DEATH_SPECS, EXPLOSION_SHAKE_REDUCTION_FACTOR, H, MAX_EXPLOSION_SHAKE_FACTOR, MAX_WIND, PARTICLE_AMOUNT, PARTICLE_FADE_AMOUNT, PARTICLE_MAX_POWER_FACTOR, PARTICLE_MIN_LIFETIME, PARTICLE_MIN_POWER_FACTOR, PARTICLE_POWER_REDUCTION_FACTOR, PARTICLE_TIME_FACTOR, PARTICLE_WIND_REDUCTION_FACTOR, PLAYER_ANGLE_FAST_INCREMENT, PLAYER_ANGLE_INCREMENT, PLAYER_ANGLE_TICK_SOUND_INTERVAL, PLAYER_COLORS, PLAYER_ENERGY_POWER_MULTIPLIER, PLAYER_EXPLOSION_PARTICLE_POWER, PLAYER_FALL_DAMAGE_FACTOR, PLAYER_FALL_DAMAGE_HEIGHT, PLAYER_INITIAL_POWER, PLAYER_MAX_ENERGY, PLAYER_MAX_MOVES_PER_TURN, PLAYER_MOVE_DISTANCE, PLAYER_POWER_FAST_INCREMENT, PLAYER_POWER_INCREMENT, PLAYER_POWER_TICK_SOUND_INTERVAL, PLAYER_STARTING_TOOLS, PLAYER_STARTING_WEAPONS, PLAYER_TANK_BOUNDING_RADIUS, PLAYER_TANK_Y_FOOTPRINT, SHIELD_TYPES, TRAJECTORY_FADE_SPEED, TRAJECTORY_FLOAT_SPEED, W, WEAPON_TYPES, Z} from './constants.js';
import {createCanvas, drawLine, drawRect, drawSemiCircle, drawText, loop, plot, strokeCircle} from './gfx.js';
import {afterKeyDelay, key, getInput} from './input.js';
import {clamp, deg2rad, distance, parable, random, randomInt, vec, wrap} from './math.js';
import {initMenu, updateMenu, drawMenu as drawMenuSystem, showMenu, hideMenu, isMenuVisible} from './menu.js';
import {PROJECTILE_TYPES} from './projectiles.js';
import {generateSky} from './sky.js';
import {playTickSound} from './sound.js';
import {initTankSprites, drawTank} from './tankSprites.js';
import {clipTerrain, closestLand, collapseTerrain, generateTerrain, isTerrain, landHeight} from './terrain.js';
import {sample, shuffle} from './utils.js';
import {EXPLOSION_TYPES} from './weapons.js';
import {updateGameState} from '../react/providers/GameProvider';
import * as enhancedGfx from './enhancedGfx.js';
import * as weatherEffects from './weatherEffects.js';
import * as levelManager from './levelManager.js';
import {loadAllSprites, getSpriteFrame, updateSpriteAnimation} from '../spriteLoader.js';
import {SpriteEntityManager} from '../spriteEntities.js';
import {PlayerCharacterManager} from './playerCharacters.js';

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
let gameEngineInitialized = false; // Global flag to prevent multiple initializations
let gameConfig = { playerCount: 6, gameMode: 'ffa' };
let isMultiplayerMode = false;
let multiplayerCurrentPlayerId = null;
let myPlayerId = null;

// Sprite system
let spriteSheets = null;
let spriteEntityManager = null;
let playerCharacterManager = null;
let mouseX = 0;
let mouseY = 0;

// Canvas layers
let sky, traces, terrain, foreground, framebuffer;

// State update throttling - only update React state when necessary
let lastStateUpdate = 0;
const STATE_UPDATE_INTERVAL = 100; // Update React state at most every 100ms

function notifyReactState() {
  const now = Date.now();
  if (now - lastStateUpdate < STATE_UPDATE_INTERVAL && !idle) {
    return;
  }
  lastStateUpdate = now;
  
  const gameState = {
    players: [...players],
    currentPlayer,
    wind,
    state,
    menuVisible: isMenuVisible()
  };
  
  updateGameState(gameState);
  
  // Store on window for debugging/other access
  window.gameState = gameState;
  
  // Dispatch custom event for components that need it
  window.dispatchEvent(new CustomEvent('gameStateUpdate', { detail: gameState }));
  
  // Focus canvas container when game is active
  if (state !== 'menu' && state !== 'game-over' && state !== 'player-win') {
    const canvasContainer = document.getElementById('game-canvas-wrapper');
    if (canvasContainer) {
      canvasContainer.focus();
    }
  }
}

export function initGameEngine(containerElement) {
  // Allow re-initialization if container changed or canvas is missing
  const existingCanvas = containerElement?.querySelector('canvas:not([data-menu])');
  if (gameEngineInitialized && existingCanvas && existingCanvas.width === W && existingCanvas.height === H) {
    // Canvas exists and is valid - just ensure it's visible
    existingCanvas.style.display = 'block';
    existingCanvas.style.visibility = 'visible';
    existingCanvas.style.opacity = '1';
    console.log('Game engine already initialized, ensuring canvas visibility');
    return;
  }
  
  // If we have an existing canvas but it's invalid, remove it
  if (existingCanvas) {
    existingCanvas.remove();
  }

  // Remove any existing game canvases from anywhere in the document (not just container)
  const existingGameCanvases = document.querySelectorAll('canvas:not([data-menu])');
  existingGameCanvases.forEach(canvas => {
    // Only remove if it matches our game canvas characteristics
    if (canvas.width === W && canvas.height === H) {
      canvas.remove();
    }
  });

  // Init layers
  sky = createCanvas(W, H);
  traces = createCanvas(W, H);
  terrain = createCanvas(W, H);
  foreground = createCanvas(W, H);

  // Composited layer
  framebuffer = createCanvas(W, H);
  framebuffer.canvas.width = W;
  framebuffer.canvas.height = H;
  
  // Calculate proper scaling to fit viewport while maintaining aspect ratio
  // Account for HUD elements (top bar ~70px, bottom roster ~140px)
  const aspectRatio = W / H;
  const HUD_TOP_HEIGHT = 70;
  const HUD_BOTTOM_HEIGHT = 140;
  const HUD_PADDING = 20; // Extra padding for safety
  
  const updateCanvasSize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Calculate available space (viewport minus HUD areas)
    const availableWidth = vw;
    const availableHeight = vh - HUD_TOP_HEIGHT - HUD_BOTTOM_HEIGHT - HUD_PADDING;
    
    // Calculate scale to fit available space while maintaining aspect ratio
    const scaleX = availableWidth / W;
    const scaleY = availableHeight / H;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1:1
    
    // Apply scale to canvas dimensions
    const canvasWidth = W * scale;
    const canvasHeight = H * scale;
    
    framebuffer.canvas.style.width = `${canvasWidth}px`;
    framebuffer.canvas.style.height = `${canvasHeight}px`;
  };
  
  updateCanvasSize();
  window.addEventListener('resize', updateCanvasSize);
  
  framebuffer.canvas.style.position = 'absolute';
  framebuffer.canvas.style.top = '50%';
  framebuffer.canvas.style.left = '50%';
  framebuffer.canvas.style.transform = 'translate(-50%, -50%)';
  framebuffer.canvas.style.imageRendering = 'pixelated';
  framebuffer.canvas.style.display = 'block';
  framebuffer.canvas.style.visibility = 'visible';
  framebuffer.canvas.style.opacity = '1';
  framebuffer.canvas.style.zIndex = '10';
  
  // Add canvas to container
  if (containerElement && containerElement.nodeType === Node.ELEMENT_NODE) {
    containerElement.appendChild(framebuffer.canvas);
    gameEngineInitialized = true; // Mark as initialized only after successful append
  } else {
    console.error('Invalid container element provided to initGameEngine');
    return;
  }

  // Note: Menu is now handled by React, but we still init for backward compatibility
  // The canvas menu will be hidden when React menu is active
  initMenu();
  
  // Ensure canvas menu is hidden - React Menu component will handle menu display
  // We'll keep it hidden unless needed for fallback
  const menuCanvasEl = document.querySelector('canvas[data-menu]');
  if (menuCanvasEl) {
    menuCanvasEl.style.display = 'none';
  }
  
  state = 'menu';
  
  // Initialize sprite system
  spriteEntityManager = new SpriteEntityManager();
  
  // Load sprite sheets asynchronously
  loadAllSprites('/games/ravaged-planet/sprites').then(sheets => {
    spriteSheets = sheets;
    console.log('Loaded sprite sheets:', Array.from(sheets.keys()));
    
    // Initialize player character manager after terrain is ready
    if (terrain) {
      playerCharacterManager = new PlayerCharacterManager(terrain, sheets);
    }
  }).catch(err => {
    console.error('Failed to load sprite sheets:', err);
  });
  
  // Initialize mouse event handlers
  setupMouseHandlers();
  
  // Initialize preview terrain and tanks for menu background
  tankSprites = initTankSprites(PLAYER_COLORS);
  initLevel();
  initPreviewPlayers();
  
  notifyReactState();

  // Handle visibility changes to prevent black screen
  if (typeof document !== 'undefined') {
    const handleVisibilityChange = () => {
      if (!document.hidden && framebuffer && framebuffer.canvas) {
        // Ensure canvas is visible and properly displayed
        framebuffer.canvas.style.display = 'block';
        framebuffer.canvas.style.visibility = 'visible';
        framebuffer.canvas.style.opacity = '1';
        
        // Force a redraw
        if (state === 'menu') {
          // Re-initialize menu state if needed
          initLevel();
          initPreviewPlayers();
        }
        
        // Force immediate redraw
        draw();
        notifyReactState();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also handle window focus/blur
    window.addEventListener('focus', () => {
      if (framebuffer && framebuffer.canvas) {
        framebuffer.canvas.style.display = 'block';
        framebuffer.canvas.style.visibility = 'visible';
        framebuffer.canvas.style.opacity = '1';
        draw();
        notifyReactState();
      }
    });
  }
  
  // Start game loop
  console.log('Starting game loop...');
  let lastFrameTime = 0;
  loop(() => {
    try {
      // Check if document is hidden - still update but throttle drawing
      const isHidden = typeof document !== 'undefined' && document.hidden;
      
      if (!isHidden) {
        update();
        // Always draw, even when idle (to show menu/static screens)
        draw();
        lastFrameTime = performance.now();
      } else {
        // When hidden, still update occasionally but don't draw
        const now = performance.now();
        if (now - lastFrameTime > 1000) { // Update once per second when hidden
          update();
          lastFrameTime = now;
        }
      }
    } catch (error) {
      console.error('Error in game loop:', error);
      // Ensure canvas is still visible even on error
      if (framebuffer && framebuffer.canvas) {
        framebuffer.canvas.style.display = 'block';
        framebuffer.canvas.style.visibility = 'visible';
        framebuffer.canvas.style.opacity = '1';
      }
    }
  });
  
  // Force initial state update
  notifyReactState();
  
  // Expose notifyReactState to window for menu.js to use
  if (typeof window !== 'undefined') {
    window.notifyReactState = notifyReactState;
  }
}

export function setGameConfig(config) {
  gameConfig = { ...gameConfig, ...config };
  isMultiplayerMode = config.isMultiplayer === true;
  if (config.myPlayerId) {
    myPlayerId = config.myPlayerId;
  }
  if (config.multiplayerCurrentPlayer !== undefined) {
    multiplayerCurrentPlayerId = config.multiplayerCurrentPlayer;
  }
}

export function getGameConfig() {
  return gameConfig;
}

export function startGame() {
  console.log('startGame called, current state:', state);
  if (state === 'menu' || state === 'game-over' || state === 'player-win') {
    console.log('Starting new game...');
  hideMenu();
  // Update state immediately to hide menu
  if (state === 'menu') {
    state = 'start-turn';
  }
  initGame(true); // Reset levels for new game
  idle = false;
  notifyReactState();
    console.log('Game started, state:', state);
  } else {
    console.warn('Cannot start game, current state:', state);
  }
}

export function startNextLevel() {
  console.log('Starting next level...');
  hideMenu();
  const newLevel = levelManager.nextLevel();
  console.log('Level incremented to:', newLevel);
  initGame(false); // Don't reset levels, just proceed
  state = 'start-turn';
  idle = false;
  notifyReactState();
  // Force immediate state update
  setTimeout(() => notifyReactState(), 100);
  console.log('Next level started, level:', levelManager.getCurrentLevel());
}

export function restartGame() {
  console.log('Restarting game...');
  hideMenu();
  levelManager.resetLevels();
  initGame(true); // Reset everything including levels
  state = 'start-turn';
  idle = false;
  
  // Ensure canvas is visible
  if (framebuffer && framebuffer.canvas) {
    framebuffer.canvas.style.display = 'block';
    framebuffer.canvas.style.visibility = 'visible';
    framebuffer.canvas.style.opacity = '1';
  }
  
  notifyReactState();
  // Force immediate state update and redraw
  setTimeout(() => {
    notifyReactState();
    if (typeof draw === 'function') {
      draw();
    }
  }, 100);
  console.log('Game restarted at level 1');
}

export function getCurrentLevel() {
  return levelManager.getCurrentLevel();
}

// Re-export showMenu for use in React components
export { showMenu } from './menu.js';

export function getGameState() {
  return {
    state,
    players: [...players],
    currentPlayer,
    wind,
    menuVisible: isMenuVisible()
  };
}

function initGame(resetLevels = false) {
  // Reset levels if starting a new game
  if (resetLevels) {
    levelManager.resetLevels();
  }
  
  // Store scores before resetting players (if continuing to next level)
  const previousScores = resetLevels ? {} : players.reduce((acc, p, idx) => {
    acc[idx] = {
      score: p?.score || 0,
      kills: p?.kills || 0,
      hitsTaken: p?.hitsTaken || 0,
      hitsLanded: p?.hitsLanded || 0
    };
    return acc;
  }, {});
  
  players = [];
  currentPlayer = 0;
  projectiles = [];
  explosions = [];
  particles = [];
  screenShake = 0;
  trajectories = [];
  idle = false;
  winner = null;
  
  // Clear player characters
  if (playerCharacterManager) {
    playerCharacterManager.clear();
  }
  
  // Wind is set in initLevel() to handle multiplayer wind sync
  animationFrame = 0;
  firingPlayerIndex = null;
  firingFrameCount = 0;

  // Clear all layers
  traces.clearRect(0, 0, W, H);
  foreground.clearRect(0, 0, W, H);

  // Reset screen shake transform
  framebuffer.canvas.style.transform = 'translate(-50%, -50%)';

  // Initialize tank sprites
  tankSprites = initTankSprites(PLAYER_COLORS);

  initLevel();
  
  // Clear sprite entities (after terrain is generated)
  if (spriteEntityManager) {
    spriteEntityManager.clear();
    
    // Add interactive sprite entities if sprites are loaded
    if (spriteSheets) {
      addInteractiveSprites();
    }
  }

  initPlayers();
  
  // Initialize player characters after players are created and terrain is ready
  // Do this after a short delay to ensure spriteSheets are loaded
  setTimeout(() => {
    if (spriteSheets && terrain) {
      if (!playerCharacterManager) {
        playerCharacterManager = new PlayerCharacterManager(terrain, spriteSheets);
      }
      if (players.length > 0) {
        playerCharacterManager.initCharacters(players);
      }
    }
  }, 200);
  
  // Initialize or restore scores for all players
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (resetLevels) {
      // Reset scores on new game
      player.score = 0;
      player.kills = 0;
      player.hitsTaken = 0;
      player.hitsLanded = 0;
    } else {
      // Preserve scores when continuing to next level
      const prevScore = previousScores[i];
      if (prevScore) {
        player.score = prevScore.score || 0;
        player.kills = prevScore.kills || 0;
        player.hitsTaken = prevScore.hitsTaken || 0;
        player.hitsLanded = prevScore.hitsLanded || 0;
      } else {
        player.score = player.score || 0;
        player.kills = player.kills || 0;
        player.hitsTaken = player.hitsTaken || 0;
        player.hitsLanded = player.hitsLanded || 0;
      }
    }
  }
  
  // Force first frame render
  idle = false;
  notifyReactState();
}

function initPreviewPlayers() {
  // Create 6 preview players for menu backdrop
  players = [];
  const count = 6;
  
  for (let i=0; i<count; i++) {
    const [color, borderColor] = PLAYER_COLORS[i];
    players.push({
      name: `Player ${i+1}`,
      dead: false,
      x:0, y:0, a:0,
      c: color, cb: borderColor,
      colorIndex: i,
      p: PLAYER_INITIAL_POWER,
      tools: PLAYER_STARTING_TOOLS.map(x => ({...x})),
      weapons: PLAYER_STARTING_WEAPONS.map(x => ({...x})),
      currentWeapon: 0,
      energy: PLAYER_MAX_ENERGY,
      shield: null, // No shields in preview
      ai: undefined,
      parachute: null,
      fallHeight: 0,
      score: 0,
      kills: 0,
      movesRemaining: PLAYER_MAX_MOVES_PER_TURN,
      hitsTaken: 0,
      hitsLanded: 0,
      maxHealth: PLAYER_MAX_ENERGY,
    });
  }

  // Position preview tanks evenly across terrain
  const spacing = (W - 150) / Math.max(1, count - 1);
  for (let i=0; i<count; i++) {
    const player = players[i];
    player.x = 75 + spacing * i;
    player.y = landHeight(terrain, player.x) + 1;
    // Alternate aiming directions for visual interest
    player.a = i % 2 === 0 ? 45 : 135;
    clipTerrain(terrain, (ctx) => drawRect(ctx, player.x-4, 0, 8, player.y, ctx.color));
  }
}

function initPlayers() {
  const playerCount = gameConfig.playerCount || 6;
  const count = Math.min(playerCount, PLAYER_COLORS.length);
  
  // Get selected character from localStorage (default to simple-character)
  const selectedCharacter = typeof window !== 'undefined' 
    ? (localStorage.getItem('selectedCharacter') || 'simple-character')
    : 'simple-character';
  
  // Available character sprites for AI randomization
  const availableCharacters = [
    'character-blue-hair',
    'warrior-cyan',
    'ninja-blue',
    'warrior-red',
    'warrior-yellow',
    'lizard-blue',
    'robot-orange',
    'dragon-red',
    'character-angular',
    'simple-character',
  ];
  
  // In multiplayer 1v1, player 0 is local player, player 1 is opponent (no AI)
  const isMultiplayer1v1 = isMultiplayerMode && gameConfig.gameMode === '1v1-multiplayer';
  
  for (let i=0; i<count; i++) {
    const [color, borderColor] = PLAYER_COLORS[i];
    const playerName = isMultiplayer1v1 
      ? (i === 0 ? 'You' : 'Opponent')
      : `Player ${i+1}`;
    
    const isHumanPlayer = i === 0; // First player is always human
    
    // Assign character sprite: human player uses selected character, AI gets random
    let characterSprite = selectedCharacter;
    if (!isHumanPlayer && spriteSheets) {
      // Randomize AI character sprites
      const aiCharacters = availableCharacters.filter(c => c !== selectedCharacter);
      if (aiCharacters.length > 0) {
        characterSprite = sample(aiCharacters);
      }
    }
    
    players.push({
      name: playerName,
      dead: false,
      x:0, y:0, a:0,
      c: color, cb: borderColor,
      colorIndex: i,
      p: PLAYER_INITIAL_POWER,
      tools: PLAYER_STARTING_TOOLS.map(x => ({...x})),
      weapons: PLAYER_STARTING_WEAPONS.map(x => ({...x})),
      currentWeapon: 0,
      energy: PLAYER_MAX_ENERGY,
      shield: {type:'springShield', energy:SHIELD_TYPES.springShield.energy},
      // In multiplayer, don't assign AI (opponent is remote player)
      ai: isMultiplayer1v1 ? undefined : (i !== 0 ? sample(Object.keys(AI_TYPES)) : undefined),
      isPlayer: isHumanPlayer, // Mark human player for level reset logic
      characterSprite: characterSprite, // Store character sprite name
      parachute: null,
      fallHeight: 0,
      score: 0,
      kills: 0,
      movesRemaining: PLAYER_MAX_MOVES_PER_TURN,
      hitsTaken: 0,
      hitsLanded: 0,
      maxHealth: PLAYER_MAX_ENERGY,
    });
  }

  // Randomize positions
  players = shuffle(players);

  // Positions - evenly space based on actual player count
  const spacing = (W - 100) / Math.max(1, count - 1);
  for (let i=0; i<count; i++) {
    const player = players[i];
    player.x = 50 + spacing * i;
    player.y = landHeight(terrain, player.x) + 1;
    player.a = player.x > W/2 ? 45 : 180-45;
    clipTerrain(terrain, (ctx) => drawRect(ctx, player.x-4, 0, 8, player.y, ctx.color));
  }
}

function initLevel() {
  generateSky(sky);
  
  // In multiplayer, use provided wind value if available
  if (isMultiplayerMode && gameConfig.wind !== undefined) {
    wind = gameConfig.wind;
  } else {
    wind = randomInt(-MAX_WIND, +MAX_WIND);
  }
  
  // Set weather based on wind
  const weatherType = Math.abs(wind) > 15 ? 'dust' : randomInt(0, 10) > 7 ? 'rain' : 'none';
  weatherEffects.setWeather(weatherType, wind);
  
  // Check for selected custom map (prioritize user selection)
  let customMapData = null;
  try {
    const selectedMapName = localStorage.getItem('pgt-battle-tanks-selected-map');
    if (selectedMapName) {
      const mapsJson = localStorage.getItem('pgt-battle-tanks-maps');
      if (mapsJson) {
        const maps = JSON.parse(mapsJson);
        const selectedMap = maps.find(m => m.name === selectedMapName);
        if (selectedMap) {
          customMapData = selectedMap;
        }
      }
    }
  } catch (e) {
    console.error('Error loading selected map:', e);
  }
  
  // If no custom map selected, use level-based terrain progression
  let terrainType = null;
  if (!customMapData) {
    terrainType = levelManager.getRandomTerrainType();
    // Clear terrain cache to ensure fresh generation for each level
    // The terrain generator will create a new map each time
  }
  
  // Generate terrain (will use custom map if available, otherwise level-based)
  // Each level gets a fresh terrain generation - terrain generators are random
  generateTerrain(terrain, terrainType, customMapData);
}

// Pre-initialize asset system when game engine loads
import('./assets/index.js').then(module => {
  if (module && module.initAssetSystem) {
    module.initAssetSystem();
  }
}).catch(() => {
  // Asset system not available, will use defaults
});

function update() {
  idle = false;

  // Handle menu state
  if (state === 'menu') {
    const menuResult = updateMenu();
    if (menuResult === 'start-game') {
      hideMenu();
      initGame();
      state = 'start-turn';
      idle = false;
      notifyReactState();
    } else {
      notifyReactState();
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
  weatherEffects.updateWeather();
  
  // Update sprite entities
  if (spriteEntityManager) {
    spriteEntityManager.update();
  }
  
  // Update player characters
  if (playerCharacterManager) {
    const isPlayerTurn = state === 'aim' && players[currentPlayer] && players[currentPlayer].isPlayer;
    playerCharacterManager.update(explosions, projectiles, isPlayerTurn, currentPlayer, players);
  }

  if (state === 'start-game') {
    initGame();
    state = 'start-turn';
  }

  else if (state === 'start-turn') {
    // Reset moves for the new turn
    const player = players[currentPlayer];
    if (player && !player.dead) {
      player.movesRemaining = PLAYER_MAX_MOVES_PER_TURN;
    }
    
    // Reset turn timer
    if (typeof window !== 'undefined' && window.resetTurnTimer) {
      window.resetTurnTimer();
    }
    
    state = 'aim';
    notifyReactState();
  }

  else if (state === 'aim') {
    const player = players[currentPlayer];
    if (!player || player.dead) {
      state = 'end-turn';
      notifyReactState();
      return;
    }
    
    // In multiplayer, only allow input if it's your turn
    const isMyTurn = !isMultiplayerMode || (isMultiplayerMode && myPlayerId === multiplayerCurrentPlayerId && currentPlayer === 0);
    
    const {x, y, a, p, weapons, energy, movesRemaining} = player;
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
    
    // Skip input handling if not multiplayer or not my turn
    else if (!isMyTurn && isMultiplayerMode) {
      idle = true;
      return;
    }

    // Character movement (WASD/Arrow keys) - always available during player turn
    if (playerCharacterManager && player.isPlayer) {
      playerCharacterManager.handleMovementInput(player, getInput());
    }
    
    // Tank movement (A/D keys) - only if moves remaining
    if ((key('a') || key('A')) && movesRemaining > 0) {
      if (!afterKeyDelay()) return;
      const newX = clamp(PLAYER_TANK_BOUNDING_RADIUS, x - PLAYER_MOVE_DISTANCE, W - PLAYER_TANK_BOUNDING_RADIUS);
      const testY = landHeight(terrain, newX);
      
      // Check if movement is valid (not blocked by terrain or other tanks)
      let canMove = true;
      if (isTerrain(terrain, newX, testY - 2)) {
        canMove = false;
      }
      
      // Check tank collisions
      for (let otherPlayer of players) {
        if (otherPlayer !== player && !otherPlayer.dead) {
          if (distance(newX, testY, otherPlayer.x, otherPlayer.y) < PLAYER_TANK_BOUNDING_RADIUS * 2) {
            canMove = false;
            break;
          }
        }
      }
      
      if (canMove) {
        player.x = newX;
        player.y = testY;
        player.movesRemaining -= 1;
        playTickSound();
        notifyReactState();
      }

    } else if ((key('d') || key('D')) && movesRemaining > 0) {
      if (!afterKeyDelay()) return;
      const newX = clamp(PLAYER_TANK_BOUNDING_RADIUS, x + PLAYER_MOVE_DISTANCE, W - PLAYER_TANK_BOUNDING_RADIUS);
      const testY = landHeight(terrain, newX);
      
      // Check if movement is valid
      let canMove = true;
      if (isTerrain(terrain, newX, testY - 2)) {
        canMove = false;
      }
      
      // Check tank collisions
      for (let otherPlayer of players) {
        if (otherPlayer !== player && !otherPlayer.dead) {
          if (distance(newX, testY, otherPlayer.x, otherPlayer.y) < PLAYER_TANK_BOUNDING_RADIUS * 2) {
            canMove = false;
            break;
          }
        }
      }
      
      if (canMove) {
        player.x = newX;
        player.y = testY;
        player.movesRemaining -= 1;
        playTickSound();
        notifyReactState();
      }

    } else if (key('ArrowLeft')) {
      if (isPrecise && !afterKeyDelay()) return;
      let incr = isFast ? PLAYER_ANGLE_FAST_INCREMENT : PLAYER_ANGLE_INCREMENT;
      player.a = wrap(0, a -incr, 180);
      if (isPrecise || isFast || a % PLAYER_ANGLE_TICK_SOUND_INTERVAL === 0) playTickSound();
      notifyReactState();

    } else if (key('ArrowRight')) {
      if (isPrecise && !afterKeyDelay()) return;
      let incr = isFast ? PLAYER_ANGLE_FAST_INCREMENT : PLAYER_ANGLE_INCREMENT;
      player.a = wrap(0, a +incr, 180);
      if (isPrecise || isFast || a % PLAYER_ANGLE_TICK_SOUND_INTERVAL === 0) playTickSound();
      notifyReactState();

    } else if (key('ArrowUp')) {
      if (isPrecise && !afterKeyDelay()) return;
      let incr = isFast ? PLAYER_POWER_FAST_INCREMENT : PLAYER_POWER_INCREMENT;
      player.p = clamp(0, p +incr, maxPower);
      if (p < maxPower && (isPrecise || isFast || p % PLAYER_POWER_TICK_SOUND_INTERVAL === 0)) playTickSound();
      notifyReactState();

    } else if (key('ArrowDown')) {
      if (isPrecise && !afterKeyDelay()) return;
      let incr = isFast ? PLAYER_POWER_FAST_INCREMENT : PLAYER_POWER_INCREMENT;
      player.p = clamp(0, p -incr, maxPower);
      if (p > 0 && (isPrecise || isFast || p % PLAYER_POWER_TICK_SOUND_INTERVAL === 0)) playTickSound();
      notifyReactState();

    } else if (key('Tab')) {
      if (!afterKeyDelay()) return;
      const dir = isReverse ? -1 : 1;
      player.currentWeapon = wrap(0, player.currentWeapon+dir, player.weapons.length-1);
      playTickSound();
      notifyReactState();

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

      firingPlayerIndex = currentPlayer;
      firingFrameCount = 0;

      state = 'shoot';
      notifyReactState();
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
      notifyReactState();
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

        if (remainingDamage > 0) {
          player.energy -= remainingDamage;
          player.hitsTaken += 1;
          // Track who landed the hit
          if (players[currentPlayer] && !players[currentPlayer].dead && players[currentPlayer] !== player) {
            players[currentPlayer].hitsLanded += 1;
          }
          
          // Trigger damage number display
          if (typeof window !== 'undefined' && window.addDamageNumber) {
            window.addDamageNumber(player.x, player.y - 10, remainingDamage, player.c || '#ff0000', false);
          }
        }
      }
      explosions.splice(i, 1);
    }
    if (explosions.length === 0) {
      state = 'land-collapse';
      notifyReactState();
    }
  }

  else if (state === 'land-collapse') {
    collapseTerrain(terrain);
    state = 'land-players';
    notifyReactState();
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
    if (stable) {
      state = 'destroy-players';
      notifyReactState();
    }
  }

  else if (state === 'destroy-players') {
    const dyingPlayer = players.find(x => x.energy<=0 && !x.dead);
    if (!dyingPlayer) {state = 'end-turn'; notifyReactState(); return}

    const {x, y, c} = dyingPlayer;
    const explosionSpec = sample(DEATH_SPECS);
    const explosionType = EXPLOSION_TYPES[explosionSpec.type];
    explosions.push(explosionType.create(explosionSpec, x, y));
    createParticles(x, y, PLAYER_EXPLOSION_PARTICLE_POWER, c);
    
    // Add explosion sprite animation
    if (spriteSheets) {
      const explosionSprite = spriteSheets.get('explosion');
      if (explosionSprite) {
        // Create explosion sprite entity that plays once
        const explosionEntity = spriteEntityManager.addEntity(explosionSprite, x, y, {
          scale: 2,
          interactive: false,
          animationSpeed: 0.3,
          defaultAnim: 'explode',
          active: true,
        });
        explosionEntity.setAnimation('explode');
        
        // Remove explosion entity after animation completes (16 frames * ~0.3 speed = ~5 seconds)
        setTimeout(() => {
          spriteEntityManager.removeEntity(explosionEntity);
        }, 5000);
      }
    }
    
    dyingPlayer.dead = true;
    
    // Award points to the current player for the kill
    if (players[currentPlayer] && !players[currentPlayer].dead) {
      players[currentPlayer].kills += 1;
      players[currentPlayer].score += 100;
      players[currentPlayer].hitsLanded = (players[currentPlayer].hitsLanded || 0) + 1;
      
      // Trigger kill feed and damage number
      if (typeof window !== 'undefined') {
        const killer = players[currentPlayer];
        const weapon = killer.weapons?.[killer.currentWeapon];
        const weaponName = weapon ? WEAPON_TYPES[weapon.type].name.toUpperCase() : 'MISSILE';
        
        if (window.addKillFeedEntry) {
          window.addKillFeedEntry(
            killer.name || `P${currentPlayer + 1}`,
            dyingPlayer.name || `P${players.indexOf(dyingPlayer) + 1}`,
            weaponName
          );
        }
        if (window.addDamageNumber) {
          window.addDamageNumber(dyingPlayer.x, dyingPlayer.y - 10, 100, '#ffd700', true);
        }
      }
    }
    
    state = 'explosions';
    notifyReactState();
  }

  else if (state === 'end-turn') {
    const alivePlayers = players.filter(x => !x.dead);
    
    // Check if human player is dead - if so, reset level to 1
    const humanPlayer = players.find(p => p.isPlayer);
    const humanPlayerDead = humanPlayer && humanPlayer.dead;

    if (alivePlayers.length === 0) {
      // Reset level to 1 when all players die
      levelManager.resetLevels();
      state = 'game-over';
      idle = true; // Stop game loop
      console.log('Game Over - All players dead, resetting to level 1');
      notifyReactState();
      // Force immediate state update
      setTimeout(() => notifyReactState(), 100);
      return;
    } else if (alivePlayers.length === 1) {
      winner = alivePlayers[0];
      winner.won = true;
      
      // If human player is dead, reset level to 1 (even if AI wins)
      if (humanPlayerDead) {
        levelManager.resetLevels();
        state = 'game-over';
        idle = true; // Stop game loop
        console.log('Game Over - Human player dead, resetting to level 1');
        notifyReactState();
        // Force immediate state update
        setTimeout(() => notifyReactState(), 100);
        return;
      }
      
      // Human player won - advance to next level
      // Don't reset level, let it progress
      state = 'player-win';
      idle = true; // Stop game loop temporarily
      console.log('Player Win - Level', levelManager.getCurrentLevel(), 'complete, advancing to next level');
      notifyReactState();
      // Force immediate state update
      setTimeout(() => notifyReactState(), 100);
      return;
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
        break;
      }
    }

    fadeTrajectories();
    
    // Award survival points to characters at end of turn
    if (playerCharacterManager) {
      for (const character of playerCharacterManager.characters) {
        if (character.alive) {
          character.awardSurvivalPoints();
        }
      }
    }
    
    state = 'start-turn';
    notifyReactState();
  }

  else if (state === 'player-win') {
    // Award end-game bonuses for surviving characters
    if (playerCharacterManager) {
      playerCharacterManager.awardEndGameBonuses();
    }
    // Victory screen now handles input via buttons, but keep Enter for menu
    if (key('Enter')) {
      // Default to menu on Enter (optional)
      // showMenu();
      // state = 'menu';
      // notifyReactState();
    }
    idle = true;
  }

  else if (state === 'game-over') {
    // Game over screen now handles input via buttons, but keep Enter for menu
    if (key('Enter')) {
      // Default to menu on Enter (optional)
      // showMenu();
      // state = 'menu';
      // notifyReactState();
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
      c, 
      alpha: 255,
      size: random(0.8, 2.0), // Vary particle size for visual interest
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

/**
 * Convert screen coordinates to game coordinates
 */
function screenToGameCoords(screenX, screenY) {
  if (!framebuffer || !framebuffer.canvas) return { x: 0, y: 0 };
  
  const rect = framebuffer.canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  
  const gameX = (screenX - rect.left) * scaleX;
  const gameY = (screenY - rect.top) * scaleY;
  
  return { x: gameX, y: gameY };
}

/**
 * Setup mouse event handlers for sprite interaction
 */
function setupMouseHandlers() {
  if (!framebuffer || !framebuffer.canvas) return;
  
  const canvas = framebuffer.canvas;
  
  // Mouse move for hover
  canvas.addEventListener('mousemove', (e) => {
    const coords = screenToGameCoords(e.clientX, e.clientY);
    mouseX = coords.x;
    mouseY = coords.y;
    
    if (spriteEntityManager) {
      spriteEntityManager.handleHover(mouseX, mouseY);
    }
  });
  
  // Mouse click for interaction
  canvas.addEventListener('click', (e) => {
    const coords = screenToGameCoords(e.clientX, e.clientY);
    mouseX = coords.x;
    mouseY = coords.y;
    
    if (spriteEntityManager) {
      const clickedEntity = spriteEntityManager.handleClick(mouseX, mouseY);
      if (clickedEntity) {
        console.log('Clicked sprite entity:', clickedEntity);
      }
    }
  });
}

/**
 * Add interactive sprite entities to the game
 */
function addInteractiveSprites() {
  if (!spriteSheets || !spriteEntityManager) return;
  
  // Add some characters scattered around the terrain
  const spriteNames = [
    'character-blue-hair',
    'warrior-cyan',
    'ninja-blue',
    'warrior-red',
    'warrior-yellow',
    'lizard-blue',
    'simple-character',
    'robot-orange',
    'dragon-red',
    'character-angular',
  ];
  
  // Add 3-5 random sprites
  const numSprites = 3 + Math.floor(Math.random() * 3);
  const usedPositions = new Set();
  
  for (let i = 0; i < numSprites && i < spriteNames.length; i++) {
    const spriteName = spriteNames[i];
    const sprite = spriteSheets.get(spriteName);
    
    if (!sprite) continue;
    
    // Find a valid position on terrain
    let x, y;
    let attempts = 0;
    do {
      x = Math.random() * W;
      y = landHeight(terrain, x) - 10; // Place slightly above terrain
      attempts++;
    } while (attempts < 50 && (isTerrain(terrain, x, y) || usedPositions.has(`${Math.floor(x)},${Math.floor(y)}`)));
    
    if (attempts >= 50) continue; // Skip if we can't find a good position
    
    usedPositions.add(`${Math.floor(x)},${Math.floor(y)}`);
    
    // Create entity with interactive behavior
    const entity = spriteEntityManager.addEntity(sprite, x, y, {
      scale: 1.5,
      interactive: true,
      animationSpeed: 0.15,
      moveSpeed: 0.5,
      onClick: (entity, clickX, clickY) => {
        console.log(`Clicked on ${spriteName} at (${clickX}, ${clickY})`);
        // Make sprite move towards click position
        entity.moveTo(clickX, clickY);
      },
      onHover: (entity) => {
        // Optional: Add hover effects
      },
      data: {
        name: spriteName,
        type: 'character',
      },
    });
    
    // Set initial idle animation
    entity.setAnimation('idle');
  }
}

function draw() {
  // Ensure framebuffer canvas is visible
  if (framebuffer && framebuffer.canvas) {
    framebuffer.canvas.style.display = 'block';
    framebuffer.canvas.style.visibility = 'visible';
    framebuffer.canvas.style.opacity = '1';
  }
  
  // Menu is now handled by React, but keep canvas menu hidden for compatibility
  const menuCanvasEl = document.querySelector('canvas[data-menu]');
  if (menuCanvasEl) {
    menuCanvasEl.style.display = 'none';
  }

  // Always draw the game layers first (sky, terrain are static)
  if (!framebuffer) return; // Safety check
  
  framebuffer.clearRect(0, 0, W, H);
  
  // Ensure sky and terrain are initialized
  if (!sky || !terrain) {
    // Re-initialize if missing
    if (!sky) sky = createCanvas(W, H);
    if (!terrain) {
      terrain = createCanvas(W, H);
      initLevel();
    }
  }
  
  // Draw static layers
  framebuffer.drawImage(sky.canvas, 0, 0);
  framebuffer.drawImage(terrain.canvas, 0, 0);
  
  // Draw weather effects on background
  if (weatherEffects) {
    weatherEffects.drawWeather(framebuffer, W, H);
  }
  
  // Only draw game elements if menu is not visible
  if (!isMenuVisible()) {
    // Ensure foreground layer exists
    if (!foreground) {
      foreground = createCanvas(W, H);
    }
    
    // Clear and draw dynamic layers
    foreground.clearRect(0, 0, W, H);
    drawTrajectories();
    drawPlayers();
    drawProjectile();
    drawExplosions();
    drawParticles();
    
    // Draw sprite entities
    if (spriteEntityManager) {
      spriteEntityManager.draw(foreground);
    }
    
    // Draw player characters
    if (playerCharacterManager) {
      playerCharacterManager.draw(foreground);
    }
    
    drawStatus();
    
    // Ensure traces layer exists
    if (!traces) {
      traces = createCanvas(W, H);
    }
    
    // Draw dynamic layers on top
    framebuffer.drawImage(traces.canvas, 0, 0);
    framebuffer.drawImage(foreground.canvas, 0, 0);

    drawScreenShake();
  } else {
    // Menu is visible - still ensure we draw the background
    // This prevents black screen when returning to menu
    if (players.length === 0) {
      // Re-initialize preview players if needed
      initPreviewPlayers();
    }
    
    // When menu is visible, draw preview tanks on the terrain for menu backdrop
    if (tankSprites && players.length > 0) {
      if (!foreground) {
        foreground = createCanvas(W, H);
      }
      foreground.clearRect(0, 0, W, H);
      
      // Draw preview tanks positioned on terrain
      for (let i = 0; i < Math.min(players.length, 6); i++) {
        const player = players[i];
        const {x, y, a, c, cb, colorIndex} = player;
        
        // Only draw if player has valid position
        if (x > 0 && y > 0) {
          const sprites = tankSprites.get(colorIndex);
          if (sprites) {
            const frame = Math.floor(animationFrame / 16) % 4;
            drawTank(foreground, sprites, 'idle', frame, x, y, a, c, cb, 8);
          }
        }
      }
      
      // Draw preview tanks layer
      framebuffer.drawImage(foreground.canvas, 0, 0);
    }
  }
}

function drawPlayers() {
  if (!tankSprites) return;
  
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const {x, y, a, c, cb, energy, shield, dead, colorIndex} = player;
    if (dead) continue;

    let animState = 'idle';
    const healthPercent = energy / PLAYER_MAX_ENERGY;
    
    if (firingPlayerIndex === i && firingFrameCount <= 10) {
      animState = 'firing';
    } else if (healthPercent < 0.5) {
      animState = 'damaged';
    }

    // Shield with enhanced visual effects
    if (shield) {
      const {type, energy} = shield;
      const shieldType = SHIELD_TYPES[type];
      // Use enhanced shield rendering
      enhancedGfx.drawShieldEffect(foreground, x, y+PLAYER_TANK_Y_FOOTPRINT, shieldType.r, shieldType, energy);
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

    // Draw tank sprite
    const sprites = tankSprites.get(colorIndex);
    if (sprites) {
      const frame = Math.floor(animationFrame / 8) % 4;
      
      // Draw muzzle flash if firing
      if (firingPlayerIndex === i && firingFrameCount <= 5) {
        const angleRad = deg2rad(180 + a);
        enhancedGfx.drawMuzzleFlash(foreground, x, y - 3, angleRad, 4);
      }
      
      drawTank(foreground, sprites, animState, frame, x, y, a, c, cb, 8);
    }
    
    // Character sprites are now drawn by playerCharacterManager
    // (removed individual character drawing to avoid duplication)
    
    // Enhanced damage indicator
    if (!player.dead) {
      const damage = clamp(0, 1 - healthPercent, 1);
      if (damage > 0.3) {
        enhancedGfx.drawDamageIndicator(foreground, x, y, damage * 100);
      }
    }
    
    // Draw player name/number above tank
    const nameText = player.name || `P${i+1}`;
    const nameY = y - 15;
    foreground.globalAlpha = 0.7;
    drawRect(foreground, Math.round(x - (nameText.length * 2 + 2)), Math.round(nameY - 2), nameText.length * 4 + 4, 7, 'black');
    foreground.globalAlpha = 1;
    drawText(foreground, nameText, x, nameY, c, 'center');
  }
}

function drawTrajectories() {
  traces.clearRect(0, 0, W, H);
  // Group trajectories by color and alpha for better rendering
  const trajectoryGroups = new Map();
  for (let trajectory of trajectories) {
    const {x, y, c, a} = trajectory;
    const alpha = Math.floor(a / 16) * 16; // Group by alpha ranges
    const key = `${c}_${alpha}`;
    if (!trajectoryGroups.has(key)) {
      trajectoryGroups.set(key, []);
    }
    trajectoryGroups.get(key).push({x, y, c, a});
  }
  
  // Draw grouped trajectories with enhanced rendering
  for (let [key, points] of trajectoryGroups) {
    if (points.length === 0) continue;
    const avgAlpha = points[0].a / 255;
    const color = points[0].c;
    
    traces.globalAlpha = avgAlpha;
    // Draw glow trail
    for (let point of points) {
      plot(traces, point.x, point.y, color);
      // Add glow
      if (point.a > 100) {
        traces.globalAlpha = avgAlpha * 0.4;
        plot(traces, point.x + 1, point.y, color);
        plot(traces, point.x - 1, point.y, color);
        plot(traces, point.x, point.y + 1, color);
        plot(traces, point.x, point.y - 1, color);
        traces.globalAlpha = avgAlpha;
      }
    }
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
    const {x, y, player} = projectile;
    const projectileColor = player ? player.c : 'white';
    const size = projectile.type === 'roller' ? 3 : 2;
    enhancedGfx.drawGlowingProjectile(
      foreground, 
      clamp(0, x, W-1), 
      clamp(0, y, H-1), 
      projectileColor,
      size
    );
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
    const alpha = clamp(0, particle.alpha / 255, 1);
    const size = Math.max(1, Math.floor(particle.size || 1));
    enhancedGfx.drawEnhancedParticle(
      foreground,
      particle.x,
      particle.y,
      particle.c,
      alpha,
      size
    );
  }
}

function drawScreenShake() {
  if (screenShake > 0) {
    const x = randomInt(-screenShake, screenShake);
    const y = randomInt(-screenShake, screenShake);
    framebuffer.canvas.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  } else {
    framebuffer.canvas.style.transform = 'translate(-50%, -50%)';
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
  
  foreground.globalAlpha = 0.85;
  drawRect(foreground, 0, 0, W, 18, 'black');
  foreground.globalAlpha = 1;
  
  const statusText = `${name.toUpperCase()}   NRG:${Math.max(0, Math.floor(energy))}   SCORE:${score}   AIM:${a}   PWR:${p}   SHD:${shield?Math.floor(shield.energy):0}   ${clamp(0, weapon.ammo, 99)} ${weaponType.name.toUpperCase()}`;
  drawText(foreground, statusText, 8, 6, c, 'left');
  
  drawText(foreground, `WIND: ${wind<=0?'<':''}${Math.abs(wind)}${wind>=0?'>':''}`, W-8, 6, 'white', 'right');
}

