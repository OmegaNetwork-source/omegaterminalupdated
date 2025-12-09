/**
 * Match Result Component
 * Shows final match results after a multiplayer match
 */

import { useEffect, useState } from 'react';
import './MatchResult.css';

export function MatchResult({ matchResult, onClose }) {
  const [showAnimation, setShowAnimation] = useState(false);
  const isWinner = matchResult?.winner?.id === matchResult?.myPlayerId;

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  if (!matchResult) return null;

  return (
    <div className={`match-result-overlay ${showAnimation ? 'show' : ''}`}>
      <div className="match-result-panel">
        <div className={`result-title ${isWinner ? 'victory' : 'defeat'}`}>
          {isWinner ? 'VICTORY!' : 'DEFEAT'}
        </div>

        <div className="match-summary">
          <div className="summary-row">
            <span className="summary-label">MATCH RESULT:</span>
            <span className="summary-value">
              {matchResult.winner?.name || 'Unknown'} Wins!
            </span>
          </div>
          
          {matchResult.finalScores && (
            <div className="scores-section">
              <div className="scores-title">FINAL SCORES</div>
              {matchResult.finalScores.map((score, idx) => (
                <div 
                  key={idx} 
                  className={`score-row ${score.id === matchResult.myPlayerId ? 'my-score' : ''}`}
                >
                  <span className="score-name">
                    {score.id === matchResult.myPlayerId ? 'YOU' : score.name}
                  </span>
                  <span className="score-value">{score.score} - {score.score >= 2 ? 'W' : 'L'}</span>
                </div>
              ))}
            </div>
          )}

          {matchResult.rounds && matchResult.rounds.length > 0 && (
            <div className="rounds-section">
              <div className="rounds-title">ROUND BREAKDOWN</div>
              <div className="rounds-list">
                {matchResult.rounds.map((winnerId, idx) => {
                  const roundWinner = matchResult.finalScores?.find(s => s.id === winnerId);
                  return (
                    <div key={idx} className="round-item">
                      Round {idx + 1}: {roundWinner?.name || 'Unknown'}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="result-actions">
          <button
            className="result-button"
            onClick={onClose}
          >
            RETURN TO MENU
          </button>
        </div>
      </div>
    </div>
  );
}


