import { createContext, useContext } from 'react';

export const GameContext = createContext(null);

export function useGameState() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
}

