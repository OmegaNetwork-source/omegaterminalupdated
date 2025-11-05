import { useState, useEffect, useCallback } from 'react';
import { GameContext } from '../context/GameContext';

let gameStateListeners = new Set();
let currentGameState = {
  players: [],
  currentPlayer: 0,
  wind: 0,
  state: 'menu',
  menuVisible: true
};

// Export function for game engine to update state
export function updateGameState(newState) {
  currentGameState = { ...currentGameState, ...newState };
  gameStateListeners.forEach(listener => listener(currentGameState));
}

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(currentGameState);

  useEffect(() => {
    const listener = (newState) => {
      setGameState(newState);
    };
    
    gameStateListeners.add(listener);
    setGameState(currentGameState);
    
    return () => {
      gameStateListeners.delete(listener);
    };
  }, []);

  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
}

// Export useGameState from here for convenience
export { useGameState } from '../context/GameContext';

