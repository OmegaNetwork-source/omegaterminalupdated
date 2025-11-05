import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useGameState } from '../context/GameContext';
import { PLAYER_COLORS } from '../../engine/constants';
import { W, H } from '../../engine/constants';
import { hideMenu, showMenu } from '../../engine/menu';
import { loadAllSprites } from '../../spriteLoader';
import './Menu.css';

const MENU_OPTIONS = [
  { id: 'start', text: 'START GAME' },
  { id: 'character', text: 'SELECT CHARACTER' },
  { id: 'mapeditor', text: 'MAP EDITOR' },
  // Hidden until enhanced: 'gamemodes', 'multiplayer', 'leaderboard', 'selectmap'
];

export const Menu = memo(({ onStartGame, onOpenGameModes, onOpenLeaderboard, onOpenMapEditor, onOpenMapSelector, onOpenMultiplayer, onOpenCharacterSelector }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { menuVisible } = useGameState();
  const menuCanvasRef = useRef(null);
  const characterCanvasRef = useRef(null);
  const [spriteSheets, setSpriteSheets] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCharacter') || 'simple-character';
    }
    return 'simple-character';
  });

  // Load sprite sheets for character display
  useEffect(() => {
    loadAllSprites('/games/ravaged-planet/sprites').then(sheets => {
      setSpriteSheets(sheets);
    }).catch(err => {
      console.error('Failed to load sprite sheets for menu:', err);
    });
  }, []);

  // Update selected character from localStorage
  useEffect(() => {
    const updateCharacter = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('selectedCharacter');
        if (stored) {
          setSelectedCharacter(stored);
        }
      }
    };
    updateCharacter();
    // Listen for character selection changes
    window.addEventListener('storage', updateCharacter);
    window.addEventListener('characterSelected', updateCharacter);
    return () => {
      window.removeEventListener('storage', updateCharacter);
      window.removeEventListener('characterSelected', updateCharacter);
    };
  }, []);

  // Draw character sprite below title
  useEffect(() => {
    if (!menuVisible || !characterCanvasRef.current || !spriteSheets) return;

    const canvas = characterCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sprite = spriteSheets.get(selectedCharacter);
    if (!sprite || !sprite.frames || sprite.frames.length === 0) return;

    // Initialize canvas size
    canvas.width = 80;
    canvas.height = 80;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Determine which row to use (same logic as CharacterSelector)
    const row1Characters = [
      'dragon-red',
      'character-angular',
      'lizard-blue',
      'simple-character',
      'robot-orange'
    ];
    const targetRow = row1Characters.includes(selectedCharacter) ? 0 : 2;
    const targetFrames = sprite.frames.filter(frame => frame.row === targetRow);
    
    const frame = targetFrames.length > 0 
      ? targetFrames[Math.floor(targetFrames.length / 2)] 
      : sprite.frames[0];

    if (frame && frame.canvas && sprite.width > 0 && sprite.height > 0) {
      const displayHeight = 60;
      const scale = displayHeight / sprite.height;
      const scaledWidth = sprite.width * scale;
      const scaledHeight = sprite.height * scale;
      
      const x = Math.round((canvas.width - scaledWidth) / 2);
      const y = Math.round((canvas.height - scaledHeight) / 2);
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        frame.canvas,
        x,
        y,
        Math.round(scaledWidth),
        Math.round(scaledHeight)
      );
    }
  }, [menuVisible, spriteSheets, selectedCharacter]);

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
    
    // Special handling for character selector - don't hide menu
    if (option.id === 'character') {
      if (onOpenCharacterSelector) {
        onOpenCharacterSelector();
      }
      return; // Don't hide menu for character selection
    }
    
    // Hide menu immediately when any other option is selected
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
  }, [selectedIndex, onStartGame, onOpenGameModes, onOpenLeaderboard, onOpenMapEditor, onOpenMapSelector, onOpenMultiplayer, onOpenCharacterSelector]);

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
          <div className="menu-character-display">
            <canvas 
              ref={characterCanvasRef}
              className="menu-character-canvas"
            />
          </div>
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
