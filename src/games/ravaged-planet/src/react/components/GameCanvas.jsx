import { useRef, useEffect } from 'react';
import { initGameEngine } from '../../engine/gameEngine';
import './GameCanvas.css';

export const GameCanvas = () => {
  const containerRef = useRef(null);
  const gameEngineInitialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (containerRef.current) {
        // Initialize the game engine with the container
        // Allow re-initialization if needed (e.g., after window close/reopen)
        try {
          initGameEngine(containerRef.current);
          gameEngineInitialized.current = true;
          console.log('Game engine initialized successfully');
          
          // Ensure canvas is visible
          const canvas = containerRef.current.querySelector('canvas');
          if (canvas) {
            canvas.style.display = 'block';
            canvas.style.visibility = 'visible';
            canvas.style.opacity = '1';
          }
        } catch (error) {
          console.error('Failed to initialize game engine:', error);
        }
      }
    }, 100);

    // Handle visibility changes to prevent black screen
    const handleVisibilityChange = () => {
      if (!document.hidden && containerRef.current) {
        const canvas = containerRef.current.querySelector('canvas');
        if (canvas) {
          canvas.style.display = 'block';
          canvas.style.visibility = 'visible';
          canvas.style.opacity = '1';
        }
        // Force a redraw by dispatching a game state update
        window.dispatchEvent(new CustomEvent('gameStateUpdate'));
      }
    };
    
    const handleFocus = () => {
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector('canvas');
        if (canvas) {
          canvas.style.display = 'block';
          canvas.style.visibility = 'visible';
          canvas.style.opacity = '1';
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      // Don't reset gameEngineInitialized to allow re-initialization if needed
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
