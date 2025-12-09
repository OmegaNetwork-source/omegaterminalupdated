/**
 * VictoryScreen Component
 * Animated victory/defeat screen with statistics
 */

import { useEffect, useState, useRef } from 'react';
import { useGameState } from '../context/GameContext';
import { startNextLevel, restartGame, getCurrentLevel, showMenu } from '../../engine/gameEngine';
import './VictoryScreen.css';

export function VictoryScreen() {
  const { state, players, currentPlayer } = useGameState();
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const autoNextLevelRef = useRef(null);
  const countdownRef = useRef(null);
  
  useEffect(() => {
    console.log('VictoryScreen useEffect - state:', state, 'players:', players?.length);
    
    if (state === 'player-win' || state === 'game-over') {
      console.log('Showing victory screen for state:', state);
      setShowAnimation(true);
      setCurrentLevel(getCurrentLevel());
      
      // Auto-start next level after 3 seconds if player won
      if (state === 'player-win') {
        setCountdown(3);
        
        // Countdown timer
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (countdownRef.current) {
                clearInterval(countdownRef.current);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Auto-start next level after 3 seconds
        autoNextLevelRef.current = setTimeout(() => {
          console.log('Auto-starting next level...');
          startNextLevel();
        }, 3000);
      } else if (state === 'game-over') {
        // Game over - auto-restart at level 1 after 3 seconds
        setCountdown(3);
        
        // Countdown timer
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (countdownRef.current) {
                clearInterval(countdownRef.current);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Auto-restart game at level 1 after 3 seconds
        autoNextLevelRef.current = setTimeout(() => {
          console.log('Auto-restarting game at level 1...');
          restartGame();
        }, 3000);
      }
    } else {
      setShowAnimation(false);
      // Clear timers when game state changes
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (autoNextLevelRef.current) {
        clearTimeout(autoNextLevelRef.current);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (autoNextLevelRef.current) {
        clearTimeout(autoNextLevelRef.current);
      }
    };
  }, [state]);

  const handleNextLevel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (state === 'player-win') {
      // Clear auto-timer if manually clicked
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (autoNextLevelRef.current) {
        clearTimeout(autoNextLevelRef.current);
      }
      // Advance to next level
      startNextLevel();
    }
  };

  const handleRestart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    restartGame();
  };

  const handleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Show menu and set state to menu
    showMenu();
    // Update game state to menu
    if (typeof window !== 'undefined' && window.gameState) {
      window.gameState.state = 'menu';
      window.dispatchEvent(new CustomEvent('gameStateUpdate'));
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('VictoryScreen render - state:', state, 'showAnimation:', showAnimation);
  }, [state, showAnimation]);
  
  if (state !== 'player-win' && state !== 'game-over') {
    return null;
  }

  const winner = state === 'player-win' 
    ? players?.find(p => p.won || (players && players.indexOf(p) === currentPlayer))
    : null;

  const alivePlayers = players?.filter(p => !p.dead) || [];
  const sortedPlayers = [...(players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className={`victory-screen ${showAnimation ? 'show' : ''}`}>
      <div className="victory-content">
        {state === 'player-win' && winner ? (
          <>
            <div className="victory-title victory">VICTORY!</div>
            <div className="victory-winner">
              <div className="winner-name" style={{ color: winner.c || '#fff' }}>
                {winner.name?.toUpperCase() || `PLAYER ${players?.indexOf(winner) + 1}`}
              </div>
              <div className="winner-stats">
                <div className="stat-item">
                  <span className="stat-label">SCORE</span>
                  <span className="stat-value">{winner.score || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">KILLS</span>
                  <span className="stat-value">{winner.kills || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">HITS</span>
                  <span className="stat-value">{winner.hitsLanded || 0}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="victory-title defeat">GAME OVER</div>
            <div className="victory-subtitle">EVERYBODY IS DEAD</div>
          </>
        )}

        <div className="final-leaderboard">
          <div className="leaderboard-title">FINAL SCORES</div>
          {sortedPlayers.map((player, index) => (
            <div 
              key={index}
              className={`leaderboard-entry ${player.dead ? 'dead' : ''} ${player.won ? 'winner' : ''}`}
            >
              <div className="entry-rank">#{index + 1}</div>
              <div 
                className="entry-color"
                style={{ backgroundColor: player.c || '#fff' }}
              />
              <div className="entry-name">{player.name || `P${players?.indexOf(player) + 1}`}</div>
              <div className="entry-score">{player.score || 0}</div>
              <div className="entry-kills">{player.kills || 0}K</div>
            </div>
          ))}
        </div>

        <div className="victory-instruction">
          {state === 'player-win' ? (
            <>
              LEVEL {currentLevel} COMPLETE
              {countdown > 0 && (
                <div className="auto-next-level-countdown">
                  Next level starting in {countdown}...
                </div>
              )}
            </>
          ) : (
            <>
              GAME OVER - RESTARTING AT LEVEL 1
              {countdown > 0 && (
                <div className="auto-next-level-countdown">
                  Restarting in {countdown}...
                </div>
              )}
            </>
          )}
        </div>

        <div className="victory-buttons">
          {state === 'player-win' && (
            <button
              type="button"
              className="victory-button next-level"
              onClick={handleNextLevel}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNextLevel(e);
                }
              }}
            >
              NEXT LEVEL →
            </button>
          )}
          <button
            type="button"
            className="victory-button restart"
            onClick={handleRestart}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleRestart(e);
              }
            }}
          >
            RESTART GAME
          </button>
          <button
            type="button"
            className="victory-button menu"
            onClick={handleMenu}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMenu(e);
              }
            }}
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}

