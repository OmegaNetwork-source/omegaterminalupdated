import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { useGameState } from '../context/GameContext';
import { getCurrentLevel, restartGame, showMenu } from '../../engine/gameEngine';
import { loadAllSprites } from '../../spriteLoader';
import './GameHUD.css';

const PlayerRosterItem = memo(({ player, index, isCurrent }) => {
  if (!player) return null;
  
  const itemClass = `sidebar-player ${player.dead ? 'dead' : ''} ${isCurrent ? 'active' : ''}`;
  
  return (
    <div className={itemClass}>
      <div 
        className="player-color-dot" 
        style={{
          backgroundColor: player.c || '#fff',
          borderColor: player.cb || '#000'
        }}
      />
      <div className="player-details">
        <div className="player-name-text">{player.name || `P${index + 1}`}</div>
        <div className="player-stats-mini">
          <span className="mini-stat"><span className="mini-label">HP</span>{Math.max(0, Math.floor(player.energy || 0))}</span>
          <span className="mini-stat"><span className="mini-label">SC</span>{player.score || 0}</span>
          <span className="mini-stat"><span className="mini-label">K</span>{player.kills || 0}</span>
        </div>
      </div>
    </div>
  );
});

PlayerRosterItem.displayName = 'PlayerRosterItem';

export const GameHUD = memo(() => {
  const gameState = useGameState();
  const { players = [], currentPlayer = 0, wind = 0, state } = gameState;
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [spriteSheets, setSpriteSheets] = useState(null);
  const playerBadgeCanvasRef = useRef(null);
  const [, forceUpdate] = useState({});
  
  // Track last values for change highlighting
  const lastAimRef = useRef(0);
  const lastPowerRef = useRef(0);
  const lastPlayerRef = useRef(0);
  const [aimChanged, setAimChanged] = useState(false);
  const [powerChanged, setPowerChanged] = useState(false);
  const [turnJustChanged, setTurnJustChanged] = useState(false);

  const isGameActive = useMemo(() => {
    return state !== 'menu' && state !== 'game-over' && state !== 'player-win';
  }, [state]);

  // UPDATED: Extract current player data FIRST (before useEffects that depend on it)
  // Validate currentPlayer index is within bounds
  const validCurrentPlayer = (currentPlayer >= 0 && currentPlayer < players.length) ? currentPlayer : 0;
  const currentPlayerData = players[validCurrentPlayer] || {};
  
  // Validate we have the correct player
  if (isGameActive && players.length > 0 && !currentPlayerData) {
    console.error('[GameHUD] Invalid player data for index:', validCurrentPlayer);
  }
  
  // Extract player data safely with proper defaults for real-time display
  const { 
    name = 'PLAYER', 
    energy = 0, 
    a = 0,              // Angle
    p = 0,              // Power
    shield = null, 
    score = 0, 
    c = '#fff',         // Player color
    cb = '#000',        // Border color
    currentWeapon = 0, 
    weapons = [], 
    movesRemaining = 0, 
    hitsTaken = 0, 
    hitsLanded = 0, 
    maxHealth = 100, 
    colorIndex = 0,
    dead = false
  } = currentPlayerData;
  
  const weapon = weapons?.[currentWeapon];
  const weaponName = weapon 
    ? weapon.type.replace(/([A-Z])/g, ' $1').trim().toUpperCase()
    : 'NONE';
  const weaponAmmo = weapon?.ammo ?? 0;
  const healthPercent = maxHealth ? (energy / maxHealth) * 100 : 100;
  const shieldEnergy = shield?.energy ?? 0;
  
  // Log current player info for debugging
  if (isGameActive && validCurrentPlayer !== lastPlayerRef.current) {
    console.log(`[GameHUD] Turn changed to Player ${validCurrentPlayer + 1}:`, {
      name,
      colorIndex,
      energy,
      score
    });
    lastPlayerRef.current = validCurrentPlayer;
  }

  // ADDED: Force re-render on game state updates for real-time stat display
  useEffect(() => {
    const handleGameStateUpdate = () => {
      forceUpdate({});
    };
    
    window.addEventListener('gameStateUpdate', handleGameStateUpdate);
    
    return () => {
      window.removeEventListener('gameStateUpdate', handleGameStateUpdate);
    };
  }, []);

  // ADDED: Detect turn changes and reset stat highlights
  useEffect(() => {
    if (!isGameActive) return;
    
    // Check if turn changed
    if (lastPlayerRef.current !== validCurrentPlayer) {
      console.log(`[GameHUD] Turn changed: P${lastPlayerRef.current + 1} → P${validCurrentPlayer + 1}`);
      setTurnJustChanged(true);
      setTimeout(() => setTurnJustChanged(false), 800);
      
      // Reset aim/power refs when turn changes
      lastAimRef.current = a ?? 0;
      lastPowerRef.current = p ?? 0;
      lastPlayerRef.current = validCurrentPlayer;
      
      // Clear change highlights
      setAimChanged(false);
      setPowerChanged(false);
    }
  }, [validCurrentPlayer, isGameActive, a, p]);

  // ADDED: Track stat changes for visual feedback
  useEffect(() => {
    // Only track changes during active gameplay
    if (!isGameActive) return;
    
    const currentAim = a ?? 0;
    const currentPower = p ?? 0;
    
    if (lastAimRef.current !== currentAim && lastAimRef.current !== 0) {
      setAimChanged(true);
      setTimeout(() => setAimChanged(false), 200);
    }
    lastAimRef.current = currentAim;
    
    if (lastPowerRef.current !== currentPower && lastPowerRef.current !== 0) {
      setPowerChanged(true);
      setTimeout(() => setPowerChanged(false), 200);
    }
    lastPowerRef.current = currentPower;
  }, [a, p, isGameActive]);

  // Load sprite sheets for character badges - ENHANCED with retry
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const loadSprites = async () => {
      try {
        console.log('[GameHUD] Loading sprite sheets...');
        const sheets = await loadAllSprites('/games/ravaged-planet/sprites');
        console.log('[GameHUD] Sprite sheets loaded:', Array.from(sheets.keys()));
        console.log('[GameHUD] Total sprites loaded:', sheets.size);
        setSpriteSheets(sheets);
      } catch (err) {
        console.error(`[GameHUD] Failed to load sprite sheets (attempt ${retryCount + 1}/${maxRetries}):`, err);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`[GameHUD] Retrying in ${retryCount}s...`);
          setTimeout(loadSprites, retryCount * 1000);
        }
      }
    };
    
    loadSprites();
  }, []);

  // Update level display
  useEffect(() => {
    const updateLevel = () => {
      setCurrentLevel(getCurrentLevel());
    };
    
    updateLevel();
    const interval = setInterval(updateLevel, 500);
    
    // Add keyboard shortcut for restart (R key)
    const handleKeyPress = (e) => {
      if ((e.key === 'r' || e.key === 'R') && isGameActive) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (window.confirm('Restart game? This will reset to level 1.')) {
            restartGame();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [state, isGameActive]);

  // Get character sprite for current player (based on colorIndex)
  const characterSprite = useMemo(() => {
    const characters = [
      'simple-character',
      'character-blue-hair',
      'warrior-cyan',
      'ninja-blue',
      'warrior-red',
      'warrior-yellow',
      'lizard-blue',
      'robot-orange',
      'dragon-red',
      'character-angular',
    ];
    // Use player colorIndex to consistently select a character
    const selectedSprite = characters[colorIndex % characters.length];
    console.log(`[GameHUD] Character sprite for player ${currentPlayer + 1}:`, selectedSprite, 'colorIndex:', colorIndex);
    return selectedSprite;
  }, [colorIndex, currentPlayer]);

  // Draw character sprite in player badge - ENHANCED for reliability
  useEffect(() => {
    if (!playerBadgeCanvasRef.current) {
      console.warn('[GameHUD] Canvas ref not ready');
      return;
    }

    const canvas = playerBadgeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[GameHUD] Failed to get 2D context');
      return;
    }

    // Set canvas size
    canvas.width = 72;
    canvas.height = 72;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    console.log(`[GameHUD] Drawing badge for Player ${validCurrentPlayer + 1}, colorIndex: ${colorIndex}, sprite: ${characterSprite}`);

    // Check if we're in active game state
    if (!isGameActive) {
      console.log('[GameHUD] Game not active, skipping sprite draw');
      // Draw placeholder
      ctx.fillStyle = c || '#888';
      ctx.beginPath();
      ctx.arc(36, 36, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = cb || '#000';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw player number
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${currentPlayer + 1}`, 36, 36);
      return;
    }

    // Check if sprites are loaded
    if (!spriteSheets || spriteSheets.size === 0) {
      console.warn('[GameHUD] Sprite sheets not loaded yet, using fallback');
      // Draw fallback avatar (colored circle with player number)
      ctx.fillStyle = c || '#888';
      ctx.beginPath();
      ctx.arc(36, 36, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = cb || '#000';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${currentPlayer + 1}`, 36, 36);
      return;
    }

    // Get sprite
    const sprite = spriteSheets.get(characterSprite);
    if (!sprite || !sprite.frames || sprite.frames.length === 0) {
      console.warn(`[GameHUD] Sprite not found: ${characterSprite}, using fallback`);
      // Draw fallback
      ctx.fillStyle = c || '#888';
      ctx.beginPath();
      ctx.arc(36, 36, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = cb || '#000';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${currentPlayer + 1}`, 36, 36);
      return;
    }

    // Select frame from sprite sheet
    const row1Characters = ['dragon-red', 'character-angular', 'lizard-blue', 'simple-character', 'robot-orange'];
    const targetRow = row1Characters.includes(characterSprite) ? 0 : 2;
    const targetFrames = sprite.frames.filter(frame => frame.row === targetRow);
    
    const frame = targetFrames.length > 0 
      ? targetFrames[Math.floor(targetFrames.length / 2)] 
      : sprite.frames[0];

    if (frame && frame.canvas && sprite.width > 0 && sprite.height > 0) {
      console.log(`[GameHUD] Drawing sprite: ${characterSprite}, size: ${sprite.width}x${sprite.height}`);
      
      // Larger display size for more prominent avatar
      const displayHeight = 60;
      const scale = displayHeight / sprite.height;
      const scaledWidth = sprite.width * scale;
      const scaledHeight = sprite.height * scale;
      
      const x = Math.round((canvas.width - scaledWidth) / 2);
      const y = Math.round((canvas.height - scaledHeight) / 2);
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(frame.canvas, x, y, Math.round(scaledWidth), Math.round(scaledHeight));
      
      console.log(`[GameHUD] Sprite drawn successfully at (${x}, ${y}), scaled: ${scaledWidth}x${scaledHeight}`);
    } else {
      console.error('[GameHUD] Invalid frame data:', { frame, spriteWidth: sprite.width, spriteHeight: sprite.height });
      // Draw fallback
      ctx.fillStyle = c || '#888';
      ctx.beginPath();
      ctx.arc(36, 36, 28, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [isGameActive, spriteSheets, characterSprite, validCurrentPlayer, c, cb, colorIndex]);

  if (!isGameActive || !players || players.length === 0) {
    return null;
  }

  return (
    <div className="game-hud-sidebar">
      {/* Current Player Section */}
      <div className={`sidebar-section current-player-section ${turnJustChanged ? 'turn-changed' : ''}`}>
        <div className="section-header">
          CURRENT TURN
          {turnJustChanged && <span className="turn-change-indicator"> ⟳ NEW TURN</span>}
        </div>
        <div className="current-player-display-enhanced">
          {/* Character Avatar - Large and Centered */}
          <div className="player-badge-main">
            {!spriteSheets && (
              <div className="sprite-loading-indicator" style={{ borderColor: c || '#fff' }}>
                <div className="loading-spinner">⟳</div>
              </div>
            )}
            <canvas 
              ref={playerBadgeCanvasRef}
              className="player-badge-canvas-large"
              style={{ 
                borderColor: c || '#fff',
                boxShadow: `0 0 20px ${c || '#fff'}, 0 0 40px ${c || '#fff'}40`,
                display: 'block'
              }}
            />
            <div className="player-badge-overlay">
              <div className="player-badge-id-large" style={{ 
                color: c || '#fff',
                borderColor: c || '#fff'
              }}>
                P{validCurrentPlayer + 1}
              </div>
            </div>
          </div>
          
          {/* Player Info Side by Side with Avatar */}
          <div className="player-info-enhanced">
            <div className="player-name-large" style={{ color: c || '#fff' }}>
              {name?.toUpperCase() || 'PLAYER'}
            </div>
            <div className="player-character-name">
              {characterSprite?.replace(/-/g, ' ').toUpperCase() || 'TANK'}
            </div>
          </div>
        </div>
        
        {/* Health Bar */}
        <div className="health-display">
          <div className="health-label-compact">HEALTH</div>
          <div className="health-bar-compact">
            <div 
              className="health-fill-compact" 
              style={{ 
                width: `${Math.max(0, healthPercent)}%`,
                backgroundColor: healthPercent > 60 ? '#4ade80' : healthPercent > 30 ? '#fbbf24' : '#ef4444'
              }}
            />
            <div className="health-value-compact">
              {Math.max(0, Math.floor(energy || 0))}/{maxHealth || 100}
            </div>
          </div>
        </div>

        {/* Stats Grid - Real-time Updates */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label-compact">SCORE</div>
            <div className="stat-value-compact">{score}</div>
          </div>
          <div className={`stat-box ${aimChanged ? 'stat-changed' : ''}`}>
            <div className="stat-label-compact">AIM</div>
            <div className="stat-value-compact">{Math.round(a)}°</div>
          </div>
          <div className={`stat-box ${powerChanged ? 'stat-changed' : ''}`}>
            <div className="stat-label-compact">PWR</div>
            <div className="stat-value-compact">{Math.round(p)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label-compact">MOVES</div>
            <div className="stat-value-compact">{movesRemaining}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label-compact">SHIELD</div>
            <div className="stat-value-compact">{Math.floor(shieldEnergy)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label-compact">HITS</div>
            <div className="stat-value-compact">{hitsLanded}/{hitsTaken}</div>
          </div>
        </div>
      </div>

      {/* Weapon Section */}
      <div className="sidebar-section weapon-section">
        <div className="section-header">WEAPON</div>
        <div className="weapon-display-compact">
          <div className="weapon-sprite-container">
            {/* Placeholder for future weapon sprite/animation */}
            <div className="weapon-icon-placeholder">
              🚀
            </div>
          </div>
          <div className="weapon-info">
            <div className="weapon-name-compact">{weaponName}</div>
            <div className="weapon-ammo-compact">
              {weapon ? `${weaponAmmo === Infinity ? '∞' : weaponAmmo} AMMO` : 'NO AMMO'}
            </div>
          </div>
        </div>
      </div>

      {/* Game Info Section */}
      <div className="sidebar-section game-info-section">
        <div className="info-row">
          <div className="info-item">
            <span className="info-label">WIND</span>
            <span className="info-value">{wind <= 0 ? '<' : ''}{Math.abs(wind)}{wind >= 0 ? '>' : ''}</span>
          </div>
          <div className="info-item">
            <span className="info-label">LEVEL</span>
            <span className="info-value">{currentLevel}</span>
          </div>
        </div>
      </div>

      {/* Player Roster */}
      <div className="sidebar-section roster-section">
        <div className="section-header">ALL PLAYERS</div>
        <div className="sidebar-roster">
          {players.map((player, index) => (
            <PlayerRosterItem
              key={`roster-${index}`}
              player={player}
              index={index}
              isCurrent={index === validCurrentPlayer}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="sidebar-section actions-section">
        <button 
          className="action-button home-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm('Return to menu? Current game progress will be lost.')) {
              showMenu();
            }
          }}
          title="Return to Menu"
        >
          🏠 HOME
        </button>
        <button 
          className="action-button howto-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowHowToPlay(true);
          }}
          title="How to Play"
        >
          ❓ HOW TO PLAY
        </button>
        <button 
          className="action-button restart-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm('Restart game? This will reset to level 1.')) {
              restartGame();
            }
          }}
          title="Restart Game (R)"
        >
          ↻ RESTART
        </button>
      </div>

      {/* How To Play Modal */}
      {showHowToPlay && (
        <div className="howto-overlay" onClick={() => setShowHowToPlay(false)}>
          <div className="howto-modal" onClick={(e) => e.stopPropagation()}>
            <div className="howto-header">
              <h2>HOW TO PLAY</h2>
              <button 
                className="howto-close"
                onClick={() => setShowHowToPlay(false)}
              >
                ✕
              </button>
            </div>
            <div className="howto-content">
              <div className="howto-section">
                <h3>OBJECTIVE</h3>
                <p>Eliminate all enemy tanks to win the battle and advance to the next level!</p>
              </div>
              
              <div className="howto-section">
                <h3>TANK CONTROLS</h3>
                <ul>
                  <li><strong>A / D Keys:</strong> Move tank left or right (5 moves per turn)</li>
                  <li><strong>← / → Arrows:</strong> Adjust firing angle</li>
                  <li><strong>↑ / ↓ Arrows:</strong> Adjust power</li>
                  <li><strong>TAB Key:</strong> Switch between weapons</li>
                  <li><strong>SPACE:</strong> Fire!</li>
                </ul>
              </div>

              <div className="howto-section">
                <h3>ADVANCED CONTROLS</h3>
                <ul>
                  <li><strong>Shift + Arrows:</strong> Fast angle/power adjustment</li>
                  <li><strong>Alt + Arrows:</strong> Precise angle/power adjustment</li>
                  <li><strong>R Key:</strong> Quick restart game</li>
                  <li><strong>ESC Key:</strong> Return to menu</li>
                </ul>
              </div>

              <div className="howto-section">
                <h3>WEAPONS & TOOLS</h3>
                <ul>
                  <li><strong>Baby Missile:</strong> Standard projectile</li>
                  <li><strong>Cluster Bomb:</strong> Splits into multiple explosions</li>
                  <li><strong>Roller:</strong> Bounces along terrain</li>
                  <li><strong>Digger:</strong> Burrows through terrain</li>
                  <li><strong>Shields:</strong> Protect against damage</li>
                  <li><strong>Parachute:</strong> Prevents fall damage</li>
                </ul>
              </div>

              <div className="howto-section">
                <h3>STRATEGY TIPS</h3>
                <ul>
                  <li>Watch the wind direction and strength - it affects projectiles</li>
                  <li>Use terrain to your advantage for cover</li>
                  <li>Save powerful weapons for critical moments</li>
                  <li>Manage your moves wisely - only 5 per turn</li>
                  <li>Shield energy protects you from damage</li>
                  <li>Survive levels to earn higher scores</li>
                </ul>
              </div>

              <div className="howto-section">
                <h3>SCORING</h3>
                <ul>
                  <li><strong>Kill:</strong> +100 points</li>
                  <li><strong>Hit:</strong> Damage dealt adds to score</li>
                  <li><strong>Survival:</strong> Bonus for staying alive</li>
                  <li><strong>Level Clear:</strong> Progress to harder levels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

GameHUD.displayName = 'GameHUD';
