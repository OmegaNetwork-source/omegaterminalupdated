import { useState, memo } from 'react';
import './GameModeSelector.css';

const GAME_MODES = [
  { id: '1v1', name: '1v1', players: 2, description: 'One on one battle' },
  { id: '2v2', name: '2v2', players: 4, description: 'Team battle' },
  { id: '3v3', name: '3v3', players: 6, description: 'Squad battle' },
  { id: 'ffa', name: 'Free For All', players: 'custom', description: 'Choose 2-8 tanks' },
];

export const GameModeSelector = memo(({ onModeSelect, selectedMode, playerCount, onPlayerCountChange }) => {
  const [customCount, setCustomCount] = useState(playerCount || 6);

  const handleModeClick = (mode) => {
    if (mode.players === 'custom') {
      onModeSelect(mode.id);
      onPlayerCountChange(customCount);
    } else {
      onModeSelect(mode.id);
      onPlayerCountChange(mode.players);
    }
  };

  return (
    <div className="game-mode-selector">
      <div className="mode-selector-title">SELECT GAME MODE</div>
      <div className="mode-grid">
        {GAME_MODES.map((mode) => (
          <div
            key={mode.id}
            className={`mode-card ${selectedMode === mode.id ? 'selected' : ''}`}
            onClick={() => handleModeClick(mode)}
          >
            <div className="mode-name">{mode.name}</div>
            <div className="mode-players">
              {mode.players === 'custom' 
                ? `${customCount} Players`
                : `${mode.players} Players`
              }
            </div>
            <div className="mode-description">{mode.description}</div>
          </div>
        ))}
      </div>
      
      {selectedMode === 'ffa' && (
        <div className="custom-player-selector">
          <div className="custom-label">Number of Tanks:</div>
          <div className="custom-controls">
            <button 
              className="count-btn"
              onClick={() => {
                const newCount = Math.max(2, customCount - 1);
                setCustomCount(newCount);
                onPlayerCountChange(newCount);
              }}
            >−</button>
            <span className="count-display">{customCount}</span>
            <button 
              className="count-btn"
              onClick={() => {
                const newCount = Math.min(8, customCount + 1);
                setCustomCount(newCount);
                onPlayerCountChange(newCount);
              }}
            >+</button>
          </div>
        </div>
      )}
    </div>
  );
});

GameModeSelector.displayName = 'GameModeSelector';



