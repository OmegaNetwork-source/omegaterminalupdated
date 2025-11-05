import { memo } from 'react';
import { useGameState } from '../context/GameContext';

const PlayerItem = memo(({ player, index, isCurrent }) => {
  const itemClass = `player-item ${player.dead ? 'dead' : ''} ${isCurrent ? 'current' : ''}`;
  
  return (
    <div className={itemClass}>
      <div 
        className="color-box" 
        style={{
          backgroundColor: player.c || '#fff',
          borderColor: player.cb || '#000'
        }}
      />
      <div className="player-info">
        <div className="player-name">{player.name || `Player ${index + 1}`}</div>
        <div className="player-stats">
          <span>NRG: {Math.max(0, Math.floor(player.energy || 0))}</span>
          <span>SCORE: {player.score || 0}</span>
          <span>K: {player.kills || 0}</span>
          {player.movesRemaining !== undefined && (
            <span>MOVES: {player.movesRemaining || 0}</span>
          )}
        </div>
      </div>
    </div>
  );
});

PlayerItem.displayName = 'PlayerItem';

export const PlayerRoster = memo(() => {
  const gameState = useGameState();
  const { players = [], currentPlayer = 0 } = gameState;

  if (!players || players.length === 0) {
    return (
      <div className="status-placeholder">No players</div>
    );
  }

  return (
    <div id="player-roster">
      {players.map((player, index) => (
        <PlayerItem
          key={`player-${index}`}
          player={player}
          index={index}
          isCurrent={index === currentPlayer}
        />
      ))}
    </div>
  );
});

PlayerRoster.displayName = 'PlayerRoster';

