import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useGameState } from '../context/GameContext';
import { PLAYER_COLORS } from '../../engine/constants';
import { W, H } from '../../engine/constants';
import { hideMenu } from '../../engine/menu';
import './Menu.css';

const MENU_OPTIONS = [
  { id: 'start', text: 'START GAME' },
  { id: 'gamemodes', text: 'GAME MODES' },
  { id: 'multiplayer', text: '1V1 MULTIPLAYER' },
  { id: 'leaderboard', text: 'LEADERBOARD' },
  { id: 'mapeditor', text: 'MAP EDITOR' },
  { id: 'selectmap', text: 'SELECT MAP' },
];

export const Menu = memo(({ onStartGame, onOpenGameModes, onOpenLeaderboard, onOpenMapEditor, onOpenMapSelector, onOpenMultiplayer }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { menuVisible } = useGameState();
  const menuCanvasRef = useRef(null);

  // Draw menu background with tanks
  useEffect(() => {
    if (!menuVisible || !menuCanvasRef.current) return;

    const canvas = menuCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = W;
    canvas.height = H;

    // Draw background (will be behind game canvas, so just clear)
    ctx.clearRect(0, 0, W, H);
    
    // The actual game canvas will show the map/terrain background
    // This canvas is just for any overlay effects if needed
  }, [menuVisible]);

  const handleSelect = useCallback(() => {
    const option = MENU_OPTIONS[selectedIndex];
    
    // Hide menu immediately when any option is selected
    hideMenu();
    
    // Small delay to ensure menu state updates before triggering action
    setTimeout(() => {
      switch(option.id) {
        case 'start':
          if (onStartGame) {
            onStartGame();
          }
          break;
        case 'gamemodes':
          if (onOpenGameModes) {
            onOpenGameModes();
          }
          break;
        case 'leaderboard':
          if (onOpenLeaderboard) {
            onOpenLeaderboard();
          }
          break;
        case 'mapeditor':
          if (onOpenMapEditor) {
            onOpenMapEditor();
          }
          break;
        case 'selectmap':
          if (onOpenMapSelector) {
            onOpenMapSelector();
          }
          break;
        case 'multiplayer':
          if (onOpenMultiplayer) {
            onOpenMultiplayer();
          }
          break;
        default:
          break;
      }
    }, 50);
  }, [selectedIndex, onStartGame, onOpenGameModes, onOpenLeaderboard, onOpenMapEditor, onOpenMapSelector, onOpenMultiplayer]);

  useEffect(() => {
    if (!menuVisible) return;

    const handleKeyDown = (e) => {
      if (!menuVisible) return;

      switch(e.key) {
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, MENU_OPTIONS.length - 1));
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleSelect();
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedIndex(0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuVisible, handleSelect]);

  if (!menuVisible) return null;

  return (
    <div className="menu-overlay">
      {/* Menu background canvas (game canvas shows map/terrain already) */}
      <canvas 
        ref={menuCanvasRef}
        className="menu-background-canvas"
        style={{ display: 'none' }}
      />

      <div className="menu-content">
        <div className="menu-header">
          <div className="menu-title">BATTLE TANKS</div>
          <div className="menu-subtitle">PGT ROYALE</div>
        </div>

        <div className="menu-buttons-container">
          {MENU_OPTIONS.map((option, index) => (
            <button
              key={option.id}
              type="button"
              className={`menu-button ${index === selectedIndex ? 'selected' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedIndex(index);
                // Call handleSelect which will hide menu and trigger action
                handleSelect();
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              style={option.id === 'multiplayer' ? { 
                background: index === selectedIndex ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 215, 0, 0.1)',
                borderColor: index === selectedIndex ? '#ffd700' : 'rgba(255, 215, 0, 0.5)',
                color: '#ffd700',
                boxShadow: index === selectedIndex ? '0 0 15px rgba(255, 215, 0, 0.4)' : 'none'
              } : {}}
            >
              {option.text}
            </button>
          ))}
        </div>

        <div className="menu-footer">
          <div className="menu-controls">
            <span className="control-key">↑↓</span>
            <span className="control-text">NAVIGATE</span>
            <span className="control-separator">|</span>
            <span className="control-key">ENTER</span>
            <span className="control-text">SELECT</span>
          </div>
        </div>
      </div>
    </div>
  );
});

Menu.displayName = 'Menu';
