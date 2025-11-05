import { useRef, useEffect } from 'react';
import { initGameEngine } from '../../engine/gameEngine';
import './GameCanvas.css';

export const GameCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const gameEngineInitialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || gameEngineInitialized.current) {
      return;
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (containerRef.current) {
        // Initialize the game engine with the container
        try {
          initGameEngine(containerRef.current);
          gameEngineInitialized.current = true;
          console.log('Game engine initialized successfully');
        } catch (error) {
          console.error('Failed to initialize game engine:', error);
        }
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      // Game engine cleanup if needed in the future
      gameEngineInitialized.current = false;
    };
  }, []);

  // Ensure canvas container can receive focus for keyboard input
  useEffect(() => {
    if (containerRef.current) {
      // Make container focusable for keyboard input
      containerRef.current.setAttribute('tabindex', '-1');
      containerRef.current.style.outline = 'none';
      
      // Focus container when game starts (not menu)
      const focusHandler = () => {
        const gameState = window.gameState || {};
        if (gameState.state && gameState.state !== 'menu') {
          containerRef.current?.focus();
        }
      };
      
      // Listen for focus events
      window.addEventListener('gameStateUpdate', focusHandler);
      
      return () => {
        window.removeEventListener('gameStateUpdate', focusHandler);
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="game-canvas-container" 
      id="game-canvas-wrapper"
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {/* Canvas will be appended here by gameEngine */}
    </div>
  );
};

