import { useState, useEffect, memo } from 'react';
import './Leaderboard.css';

// Leaderboard stored in localStorage
const LEADERBOARD_KEY = 'pgt-tanks-leaderboard';

function getLeaderboard() {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(data) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save leaderboard:', e);
  }
}

export function updateLeaderboard(player) {
  const leaderboard = getLeaderboard();
  const existingIndex = leaderboard.findIndex(entry => entry.name === player.name);
  
  const entry = {
    name: player.name,
    wins: (leaderboard[existingIndex]?.wins || 0) + (player.won ? 1 : 0),
    totalGames: (leaderboard[existingIndex]?.totalGames || 0) + 1,
    totalKills: (leaderboard[existingIndex]?.totalKills || 0) + (player.kills || 0),
    totalScore: (leaderboard[existingIndex]?.totalScore || 0) + (player.score || 0),
    totalHits: (leaderboard[existingIndex]?.totalHits || 0) + (player.hitsLanded || 0),
    bestScore: Math.max(leaderboard[existingIndex]?.bestScore || 0, player.score || 0),
  };

  if (existingIndex >= 0) {
    leaderboard[existingIndex] = entry;
  } else {
    leaderboard.push(entry);
  }

  // Sort by wins, then by total score
  leaderboard.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.totalScore - a.totalScore;
  });

  saveLeaderboard(leaderboard);
}

export const Leaderboard = memo(() => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [sortBy, setSortBy] = useState('wins');

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    switch (sortBy) {
      case 'wins':
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.totalScore - a.totalScore;
      case 'score':
        return b.totalScore - a.totalScore;
      case 'kills':
        return b.totalKills - a.totalKills;
      case 'hits':
        return b.totalHits - a.totalHits;
      default:
        return 0;
    }
  });

  const clearLeaderboard = () => {
    if (window.confirm('Are you sure you want to clear all leaderboard data?')) {
      localStorage.removeItem(LEADERBOARD_KEY);
      setLeaderboard([]);
    }
  };

  if (leaderboard.length === 0) {
    return (
      <div className="leaderboard">
        <div className="leaderboard-title">LEADERBOARD</div>
        <div className="leaderboard-empty">No games played yet!</div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-title">LEADERBOARD</div>
      
      <div className="leaderboard-controls">
        <button 
          className={`sort-btn ${sortBy === 'wins' ? 'active' : ''}`}
          onClick={() => setSortBy('wins')}
        >
          WINS
        </button>
        <button 
          className={`sort-btn ${sortBy === 'score' ? 'active' : ''}`}
          onClick={() => setSortBy('score')}
        >
          SCORE
        </button>
        <button 
          className={`sort-btn ${sortBy === 'kills' ? 'active' : ''}`}
          onClick={() => setSortBy('kills')}
        >
          KILLS
        </button>
        <button 
          className={`sort-btn ${sortBy === 'hits' ? 'active' : ''}`}
          onClick={() => setSortBy('hits')}
        >
          HITS
        </button>
      </div>

      <div className="leaderboard-list">
        {sortedLeaderboard.slice(0, 10).map((entry, index) => (
          <div key={entry.name} className={`leaderboard-entry ${index < 3 ? `rank-${index + 1}` : ''}`}>
            <div className="rank-badge">{index + 1}</div>
            <div className="entry-info">
              <div className="entry-name">{entry.name}</div>
              <div className="entry-stats">
                <span>W: {entry.wins}</span>
                <span>S: {entry.totalScore}</span>
                <span>K: {entry.totalKills}</span>
                <span>H: {entry.totalHits}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="clear-btn" onClick={clearLeaderboard}>
        CLEAR LEADERBOARD
      </button>
    </div>
  );
});

Leaderboard.displayName = 'Leaderboard';



