import { useState, useEffect, useRef, useCallback } from 'react';
import { loadAllSprites } from '../../spriteLoader';
import './CharacterSelector.css';

const AVAILABLE_CHARACTERS = [
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

const CHARACTER_NAMES = {
  'simple-character': 'Simple Character',
  'character-blue-hair': 'Blue Warrior',
  'warrior-cyan': 'Cyan Warrior',
  'ninja-blue': 'Blue Ninja',
  'warrior-red': 'Red Warrior',
  'warrior-yellow': 'Yellow Warrior',
  'lizard-blue': 'Blue Lizard',
  'robot-orange': 'Orange Robot',
  'dragon-red': 'Red Dragon',
  'character-angular': 'Angular Warrior',
};

export function CharacterSelector({ onClose, onSelect }) {
  const [selectedCharacter, setSelectedCharacter] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCharacter') || 'simple-character';
    }
    return 'simple-character';
  });
  const [spriteSheets, setSpriteSheets] = useState(null);
  const gridCanvasRefs = useRef({});

  // Load sprite sheets
  useEffect(() => {
    let cancelled = false;
    loadAllSprites('/games/ravaged-planet/sprites').then(sheets => {
      if (!cancelled) {
        setSpriteSheets(sheets);
      }
    }).catch(err => {
      if (!cancelled) {
        console.error('Failed to load sprite sheets:', err);
      }
    });
    
    return () => {
      cancelled = true;
    };
  }, []);

  // Render static character sprites
  // Some characters use row 1 (index 0), others use row 3 (index 2)
  useEffect(() => {
    if (!spriteSheets) return;

    // Characters that should use row 1 (index 0) instead of row 3
    const row1Characters = [
      'dragon-red',
      'character-angular',
      'lizard-blue',
      'simple-character',
      'robot-orange'
    ];

    // Render once when sprites are loaded and DOM is ready
    const renderCharacters = () => {
      AVAILABLE_CHARACTERS.forEach(charId => {
        const canvas = gridCanvasRefs.current[charId];
        if (!canvas) {
          return; // Canvas not ready yet
        }

        const sprite = spriteSheets.get(charId);
        if (!sprite || !sprite.frames || sprite.frames.length === 0) {
          console.warn(`Sprite not found or invalid for character: ${charId}`);
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Initialize canvas size
        const targetWidth = 120;
        const targetHeight = 100;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Determine which row to use based on character
        const targetRow = row1Characters.includes(charId) ? 0 : 2;
        const targetFrames = sprite.frames.filter(frame => frame.row === targetRow);
        
        // Use first frame from target row, or middle frame if available
        const frame = targetFrames.length > 0 
          ? targetFrames[Math.floor(targetFrames.length / 2)] 
          : sprite.frames[0]; // Fallback to first frame
        
        if (frame && frame.canvas && sprite.width > 0 && sprite.height > 0) {
          // Scale to fit in grid button (target ~50-60px height)
          const displayHeight = 60;
          const scale = displayHeight / sprite.height;
          const scaledWidth = sprite.width * scale;
          const scaledHeight = sprite.height * scale;
          
          // Center horizontally and vertically (with space for name below)
          const x = Math.round((canvas.width - scaledWidth) / 2);
          const y = Math.round((canvas.height - scaledHeight - 25) / 2);
          
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            frame.canvas,
            x,
            y,
            Math.round(scaledWidth),
            Math.round(scaledHeight)
          );
        }
      });
    };

    // Wait for DOM to be ready, then render once
    const timeoutId = setTimeout(() => {
      renderCharacters();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [spriteSheets]);

  const handleSelect = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCharacter', selectedCharacter);
    }
    if (onSelect) {
      onSelect(selectedCharacter);
    }
    // Return to menu instead of closing completely
    if (onClose) {
      onClose();
    }
    // Show menu after character selection
    if (typeof window !== 'undefined' && window.showMenu) {
      setTimeout(() => {
        window.showMenu();
      }, 100);
    }
  }, [selectedCharacter, onSelect, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (onClose) onClose();
    } else if (e.key === 'Enter' || e.key === ' ') {
      handleSelect();
    }
  }, [handleSelect, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="character-selector-overlay">
      <div className="character-selector-container">
        <div className="character-selector-header">
          <h2>SELECT CHARACTER</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="character-selector-content">
          <div className="character-grid">
            {AVAILABLE_CHARACTERS.map((charId) => (
              <button
                key={charId}
                className={`character-option ${selectedCharacter === charId ? 'selected' : ''}`}
                onClick={() => setSelectedCharacter(charId)}
              >
                <canvas
                  ref={(el) => {
                    if (el) gridCanvasRefs.current[charId] = el;
                  }}
                  className="character-option-canvas"
                />
                <div className="character-option-name">
                  {CHARACTER_NAMES[charId] || charId}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="character-selector-footer">
          <button className="select-button" onClick={handleSelect}>
            SELECT CHARACTER
          </button>
          <div className="character-selector-controls">
            <span className="control-key">↑↓</span>
            <span className="control-text">NAVIGATE</span>
            <span className="control-separator">|</span>
            <span className="control-key">ENTER</span>
            <span className="control-text">SELECT</span>
            <span className="control-separator">|</span>
            <span className="control-key">ESC</span>
            <span className="control-text">CLOSE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
