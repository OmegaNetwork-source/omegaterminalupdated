import { useRef, useEffect, useCallback } from 'react';
import { initGameEngine, setGameConfig } from '../../engine/gameEngine';

export function useGameEngine(containerRef) {
  const gameEngineInitialized = useRef(false);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || gameEngineInitialized.current) {
      return;
    }

    // Initialize the game engine
    initGameEngine(containerRef.current);
    gameEngineInitialized.current = true;

    // Setup cleanup function
    cleanupRef.current = () => {
      gameEngineInitialized.current = false;
    };

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [containerRef]);

  const configureGame = useCallback((config) => {
    if (gameEngineInitialized.current) {
      setGameConfig(config);
    }
  }, []);

  return {
    isInitialized: gameEngineInitialized.current,
    configureGame,
  };
}

