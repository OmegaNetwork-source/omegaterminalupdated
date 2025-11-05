import { memo, useMemo } from 'react';
import { useGameState } from '../context/GameContext';

export const PlayerStatus = memo(() => {
  const gameState = useGameState();
  const { players = [], currentPlayer = 0, wind = 0, state } = gameState;

  const player = useMemo(() => {
    return players[currentPlayer];
  }, [players, currentPlayer]);

  if (!player || state === 'menu' || state === 'game-over' || state === 'player-win') {
    return (
      <div className="status-placeholder">Select START GAME</div>
    );
  }

  const { name, energy, a, p, shield, score, c, currentWeapon, weapons, movesRemaining, hitsTaken, hitsLanded, maxHealth } = player;
  const weapon = weapons?.[currentWeapon];
  const weaponName = weapon 
    ? weapon.type.replace(/([A-Z])/g, ' $1').trim().toUpperCase()
    : 'NONE';
  const healthPercent = (energy / maxHealth) * 100;

  return (
    <div id="player-status">
      <div className="status-section">
        <div className="status-label" style={{ color: c }}>
          {name.toUpperCase()}
        </div>
        
        {/* Health Bar */}
        <div className="health-bar-container">
          <div className="health-bar-label">HEALTH</div>
          <div className="health-bar">
            <div 
              className="health-bar-fill" 
              style={{ 
                width: `${Math.max(0, healthPercent)}%`,
                backgroundColor: healthPercent > 60 ? '#4ade80' : healthPercent > 30 ? '#fbbf24' : '#ef4444'
              }}
            />
            <span className="health-bar-text">{Math.max(0, Math.floor(energy))}/{maxHealth}</span>
          </div>
        </div>

        <div className="status-row">
          <span>NRG: <strong>{Math.max(0, Math.floor(energy))}</strong></span>
          <span>SCORE: <strong>{score || 0}</strong></span>
        </div>
        <div className="status-row">
          <span>AIM: <strong>{a}°</strong></span>
          <span>PWR: <strong>{p}</strong></span>
        </div>
        <div className="status-row">
          <span>MOVES: <strong>{movesRemaining || 0}</strong></span>
          <span>SHD: <strong>{shield ? Math.floor(shield.energy) : 0}</strong></span>
        </div>
        <div className="status-row">
          <span>HITS: <strong>{hitsLanded || 0}</strong></span>
          <span>TAKEN: <strong>{hitsTaken || 0}</strong></span>
        </div>
        <div className="status-row">
          <span>WPN: <strong>{weapon ? `${weapon.ammo} ${weaponName}` : '0 NONE'}</strong></span>
        </div>
      </div>
      <div className="status-section">
        <div className="status-label">WIND</div>
        <div className="wind-indicator">
          {wind <= 0 ? '<' : ''}{Math.abs(wind)}{wind >= 0 ? '>' : ''}
        </div>
      </div>
    </div>
  );
});

PlayerStatus.displayName = 'PlayerStatus';

