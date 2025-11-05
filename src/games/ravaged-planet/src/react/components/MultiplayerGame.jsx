/**
 * Multiplayer Game Component
 * Manages multiplayer game state and synchronization
 */

import { useEffect, useState, useCallback } from 'react';
import { multiplayerManager } from '../../utils/multiplayer';
import { setGameConfig, startGame } from '../../engine/gameEngine';
import { useGameState } from '../context/GameContext';
import './MultiplayerGame.css';

export function MultiplayerGame({ matchData, onMatchEnd }) {
  const { state, players, currentPlayer, wind } = useGameState();
  const [matchState, setMatchState] = useState({
    round: 1,
    maxRounds: 3,
    scores: [],
    currentRound: 1,
    roundWinner: null,
  });
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (!matchData) return;

    // Setup multiplayer event listeners
    const handleMatchStart = (data) => {
      setMatchState({
        round: data.round,
        maxRounds: data.maxRounds,
        scores: [],
        currentRound: data.round,
      });
      
      // Configure game for 1v1
      setGameConfig({ 
        gameMode: '1v1-multiplayer', 
        playerCount: 2,
        isMultiplayer: true,
        matchId: matchData.matchId,
        myPlayerId: multiplayerManager.playerId,
        opponentId: matchData.opponent.id,
      });
    };

    const handleRoundStart = (data) => {
      setMatchState(prev => ({
        ...prev,
        currentRound: data.round,
        wind: data.wind,
        scores: data.scores,
      }));

      // Determine if it's my turn
      const myTurn = data.currentPlayer === multiplayerManager.playerId;
      setIsMyTurn(myTurn);

      // Start the game round
      setGameConfig({ 
        gameMode: '1v1-multiplayer', 
        playerCount: 2,
        isMultiplayer: true,
        myPlayerId: multiplayerManager.playerId,
        wind: data.wind,
        multiplayerCurrentPlayer: data.currentPlayer,
      });

      // Start the game for both players (server determines turn order)
      setTimeout(() => {
        startGame();
      }, 1000);

      // Signal we're ready
      multiplayerManager.readyForRound();
    };

    const handleRoundEnd = (data) => {
      setMatchState(prev => ({
        ...prev,
        scores: data.scores,
        roundWinner: data.winner,
      }));
    };

    const handleMatchEnd = (data) => {
      setMatchState(prev => ({
        ...prev,
        winner: data.winner,
        finalScores: data.finalScores,
      }));

      if (onMatchEnd) {
        onMatchEnd(data);
      }
    };

    const handleGameStateUpdate = (gameState) => {
      // Sync game state from opponent
      // This will be handled by the game engine integration
    };

    const handleOpponentDisconnected = () => {
      alert('Opponent disconnected. Returning to menu...');
      if (onMatchEnd) {
        onMatchEnd({ disconnected: true });
      }
    };

    multiplayerManager.on('match_start', handleMatchStart);
    multiplayerManager.on('round_start', handleRoundStart);
    multiplayerManager.on('round_end', handleRoundEnd);
    multiplayerManager.on('match_end', handleMatchEnd);
    multiplayerManager.on('game_state_update', handleGameStateUpdate);
    multiplayerManager.on('opponent_disconnected', handleOpponentDisconnected);

    return () => {
      multiplayerManager.off('match_start', handleMatchStart);
      multiplayerManager.off('round_start', handleRoundStart);
      multiplayerManager.off('round_end', handleRoundEnd);
      multiplayerManager.off('match_end', handleMatchEnd);
      multiplayerManager.off('game_state_update', handleGameStateUpdate);
      multiplayerManager.off('opponent_disconnected', handleOpponentDisconnected);
    };
  }, [matchData, onMatchEnd]);

  // Sync game state to server
  useEffect(() => {
    if (state && state !== 'menu' && multiplayerManager.isInMatch) {
      multiplayerManager.sendGameState({
        players,
        currentPlayer,
        wind,
        state,
      });
    }
  }, [state, players, currentPlayer, wind]);

  // Report round end when game ends
  useEffect(() => {
    if (state === 'player-win' || state === 'game-over') {
      const winner = players?.find(p => p.won && !p.dead);
      if (winner) {
        // Map winner to player ID (simplified - would need proper mapping)
        const winnerId = winner.colorIndex === 0 
          ? multiplayerManager.playerId 
          : matchData?.opponent?.id;
        
        multiplayerManager.reportRoundEnd(winnerId);
      }
    }
  }, [state, players, matchData]);

  if (!matchData) return null;

  return (
    <div className="multiplayer-game-overlay">
      <div className="multiplayer-round-tracker">
        <div className="round-info">
          <div className="round-label">ROUND {matchState.currentRound} / {matchState.maxRounds}</div>
          {matchState.roundWinner && (
            <div className="round-winner">
              Round Winner: {matchState.roundWinner?.name || 'Unknown'}
            </div>
          )}
        </div>
        <div className="match-scores">
          {matchState.scores.map((score, idx) => (
            <div key={idx} className="score-item">
              <span className="score-name">
                {score.id === multiplayerManager.playerId ? 'YOU' : matchData.opponent.name}
              </span>
              <span className="score-value">{score.score}</span>
            </div>
          ))}
        </div>
        {isMyTurn && (
          <div className="turn-indicator">YOUR TURN</div>
        )}
        {!isMyTurn && state !== 'menu' && (
          <div className="turn-indicator opponent-turn">OPPONENT'S TURN</div>
        )}
      </div>
    </div>
  );
}
