import { memo, useMemo } from 'react';
import { useGameState } from '../context/GameContext';
import './GameHUD.css';

const PlayerRosterItem = memo(({ player, index, isCurrent }) => {
  if (!player) return null;
  
  const itemClass = `hud-roster-item ${player.dead ? 'dead' : ''} ${isCurrent ? 'current' : ''}`;
  
  return (
    <div className={itemClass}>
      <div 
        className="hud-color-indicator" 
        style={{
          backgroundColor: player.c || '#fff',
          borderColor: player.cb || '#000',
          boxShadow: isCurrent ? `0 0 10px ${player.c || '#fff'}` : 'none'
        }}
      />
      <div className="hud-roster-info">
        <div className="hud-roster-name">{player.name || `P${index + 1}`}</div>
        <div className="hud-roster-stats">
          <span className="stat-label">NRG</span><span className="stat-value">{Math.max(0, Math.floor(player.energy || 0))}</span>
          <span className="stat-sep">|</span>
          <span className="stat-label">SCORE</span><span className="stat-value">{player.score || 0}</span>
          <span className="stat-sep">|</span>
          <span className="stat-label">K</span><span className="stat-value">{player.kills || 0}</span>
          {player.movesRemaining !== undefined && (
            <>
              <span className="stat-sep">|</span>
              <span className="stat-label">MOV</span><span className="stat-value">{player.movesRemaining || 0}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

PlayerRosterItem.displayName = 'PlayerRosterItem';

export const GameHUD = memo(() => {
  const gameState = useGameState();
  const { players = [], currentPlayer = 0, wind = 0, state } = gameState;

  const currentPlayerData = useMemo(() => {
    return players[currentPlayer];
  }, [players, currentPlayer]);

  const isGameActive = useMemo(() => {
    return state !== 'menu' && state !== 'game-over' && state !== 'player-win';
  }, [state]);

  if (!isGameActive || !players || players.length === 0) {
    return null;
  }

  const { name, energy, a, p, shield, score, c, currentWeapon, weapons, movesRemaining, hitsTaken, hitsLanded, maxHealth } = currentPlayerData || {};
  const weapon = weapons?.[currentWeapon];
  const weaponName = weapon 
    ? weapon.type.replace(/([A-Z])/g, ' $1').trim().toUpperCase()
    : 'NONE';
  const healthPercent = maxHealth ? (energy / maxHealth) * 100 : 100;

  return (
    <div className="game-hud-overlay">
      {/* Top HUD Bar */}
      <div className="hud-top-bar">
        <div className="hud-section hud-player-header">
          <div className="hud-player-name" style={{ color: c || '#fff' }}>
            {name?.toUpperCase() || 'PLAYER'}
          </div>
          <div className="hud-player-id" style={{ color: c || '#fff' }}>
            P{currentPlayer + 1}
          </div>
        </div>

        <div className="hud-section hud-health-section">
          <div className="hud-health-label">HEALTH</div>
          <div className="hud-health-bar-container">
            <div 
              className="hud-health-bar-fill" 
              style={{ 
                width: `${Math.max(0, healthPercent)}%`,
                backgroundColor: healthPercent > 60 ? '#4ade80' : healthPercent > 30 ? '#fbbf24' : '#ef4444',
                boxShadow: `0 0 10px ${healthPercent > 60 ? '#4ade80' : healthPercent > 30 ? '#fbbf24' : '#ef4444'}`
              }}
            />
            <div className="hud-health-text">
              {Math.max(0, Math.floor(energy || 0))}/{maxHealth || 100}
            </div>
          </div>
        </div>

        <div className="hud-section hud-stats-section">
          <div className="hud-stat-row">
            <div className="hud-stat-item">
              <span className="hud-stat-label">NRG</span>
              <span className="hud-stat-value">{Math.max(0, Math.floor(energy || 0))}</span>
            </div>
            <div className="hud-stat-item">
              <span className="hud-stat-label">SCORE</span>
              <span className="hud-stat-value">{score || 0}</span>
            </div>
            <div className="hud-stat-item">
              <span className="hud-stat-label">AIM</span>
              <span className="hud-stat-value">{a || 0}°</span>
            </div>
            <div className="hud-stat-item">
              <span className="hud-stat-label">PWR</span>
              <span className="hud-stat-value">{p || 0}</span>
            </div>
          </div>
          <div className="hud-stat-row">
            <div className="hud-stat-item">
              <span className="hud-stat-label">MOVES</span>
              <span className="hud-stat-value">{movesRemaining || 0}</span>
            </div>
            <div className="hud-stat-item">
              <span className="hud-stat-label">SHD</span>
              <span className="hud-stat-value">{shield ? Math.floor(shield.energy) : 0}</span>
            </div>
            <div className="hud-stat-item">
              <span className="hud-stat-label">HITS</span>
              <span className="hud-stat-value">{hitsLanded || 0}</span>
            </div>
            <div className="hud-stat-item">
              <span className="hud-stat-label">TAKEN</span>
              <span className="hud-stat-value">{hitsTaken || 0}</span>
            </div>
          </div>
        </div>

        <div className="hud-section hud-weapon-section">
          <div className="hud-weapon-label">WEAPON</div>
          <div className="hud-weapon-name">
            {weapon ? `${weapon.ammo === Infinity ? '∞' : weapon.ammo} ${weaponName}` : '0 NONE'}
          </div>
        </div>

        <div className="hud-section hud-wind-section">
          <div className="hud-wind-label">WIND</div>
          <div className="hud-wind-value">
            {wind <= 0 ? '<' : ''}{Math.abs(wind)}{wind >= 0 ? '>' : ''}
          </div>
        </div>
      </div>

      {/* Bottom Roster */}
      <div className="hud-bottom-roster">
        {players.map((player, index) => (
          <PlayerRosterItem
            key={`roster-${index}`}
            player={player}
            index={index}
            isCurrent={index === currentPlayer}
          />
        ))}
      </div>
    </div>
  );
});

GameHUD.displayName = 'GameHUD';



