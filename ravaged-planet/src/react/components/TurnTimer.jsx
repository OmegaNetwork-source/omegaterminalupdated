/**
 * TurnTimer Component
 * Visual indicator for turn duration
 */

import { useEffect, useState } from 'react';
import { useGameState } from '../context/GameContext';
import './TurnTimer.css';

const MAX_TURN_TIME = 60; // seconds
let turnStartTime = Date.now();

export function resetTurnTimer() {
  turnStartTime = Date.now();
}

export function TurnTimer() {
  const { state } = useGameState();
  const [timeRemaining, setTimeRemaining] = useState(MAX_TURN_TIME);

  useEffect(() => {
    if (state !== 'aim') {
      return;
    }

    resetTurnTimer();
    setTimeRemaining(MAX_TURN_TIME);

    const interval = setInterval(() => {
      const elapsed = (Date.now() - turnStartTime) / 1000;
      const remaining = Math.max(0, MAX_TURN_TIME - elapsed);
      setTimeRemaining(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [state]);

  if (state !== 'aim') return null;

  const percent = (timeRemaining / MAX_TURN_TIME) * 100;
  const isWarning = percent < 30;
  const isDanger = percent < 10;

  return (
    <div className="turn-timer-container">
      <div className="turn-timer-label">TURN TIME</div>
      <div className={`turn-timer-bar ${isWarning ? 'warning' : ''} ${isDanger ? 'danger' : ''}`}>
        <div 
          className="turn-timer-fill"
          style={{
            width: `${percent}%`,
            backgroundColor: isDanger ? '#ef4444' : isWarning ? '#fbbf24' : '#4ade80',
            boxShadow: isDanger 
              ? '0 0 20px #ef4444' 
              : isWarning 
                ? '0 0 15px #fbbf24' 
                : '0 0 10px #4ade80'
          }}
        />
        <div className="turn-timer-text">{Math.ceil(timeRemaining)}s</div>
      </div>
    </div>
  );
}



