/**
 * Matchmaking Component
 * Handles queueing and connection to multiplayer server
 */

import { useState, useEffect, useCallback } from 'react';
import { multiplayerManager } from '../../utils/multiplayer';
import './Matchmaking.css';

export function Matchmaking({ onMatchFound, onClose, serverUrl = 'ws://localhost:3001' }) {
  const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected, queued, matchmaking, match_found
  const [queuePosition, setQueuePosition] = useState(0);
  const [playerName, setPlayerName] = useState(localStorage.getItem('multiplayer-player-name') || '');
  const [opponent, setOpponent] = useState(null);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Load saved player name
    const savedName = localStorage.getItem('multiplayer-player-name');
    if (savedName) {
      setPlayerName(savedName);
    }

    // Setup event listeners
    const handleConnected = () => {
      setStatus('connected');
      setConnectionStatus('connected');
      setError(null);
    };

    const handleDisconnected = () => {
      setStatus('disconnected');
      setConnectionStatus('disconnected');
    };

    const handleQueueUpdate = (data) => {
      setQueuePosition(data.queuePosition);
    };

    const handleMatchFound = (data) => {
      setStatus('match_found');
      setOpponent(data.opponent);
      if (onMatchFound) {
        onMatchFound(data);
      }
    };

    const handleError = (err) => {
      setError('Connection error. Please check if the server is running.');
      setConnectionStatus('error');
    };

    const handleOpponentDisconnected = () => {
      setError('Opponent disconnected');
      setTimeout(() => {
        setStatus('disconnected');
        setError(null);
      }, 3000);
    };

    multiplayerManager.on('connected', handleConnected);
    multiplayerManager.on('disconnected', handleDisconnected);
    multiplayerManager.on('queue_update', handleQueueUpdate);
    multiplayerManager.on('match_found', handleMatchFound);
    multiplayerManager.on('error', handleError);
    multiplayerManager.on('opponent_disconnected', handleOpponentDisconnected);

    return () => {
      multiplayerManager.off('connected', handleConnected);
      multiplayerManager.off('disconnected', handleDisconnected);
      multiplayerManager.off('queue_update', handleQueueUpdate);
      multiplayerManager.off('match_found', handleMatchFound);
      multiplayerManager.off('error', handleError);
      multiplayerManager.off('opponent_disconnected', handleOpponentDisconnected);
    };
  }, [onMatchFound]);

  const handleConnect = useCallback(() => {
    if (!playerName.trim()) {
      setError('Please enter a player name');
      return;
    }

    setStatus('connecting');
    setConnectionStatus('connecting');
    setError(null);
    localStorage.setItem('multiplayer-player-name', playerName);

    try {
      multiplayerManager.connect(serverUrl, playerName);
    } catch (err) {
      setError('Failed to connect. Is the server running?');
      setStatus('disconnected');
      setConnectionStatus('error');
    }
  }, [playerName, serverUrl]);

  const handleJoinQueue = useCallback(() => {
    if (status !== 'connected') {
      setError('Not connected to server');
      return;
    }

    setStatus('queued');
    multiplayerManager.joinQueue();
  }, [status]);

  const handleLeaveQueue = useCallback(() => {
    multiplayerManager.leaveQueue();
    setStatus('connected');
    setQueuePosition(0);
  }, []);

  const handleDisconnect = useCallback(() => {
    multiplayerManager.disconnect();
    setStatus('disconnected');
    setConnectionStatus('disconnected');
    setQueuePosition(0);
    setOpponent(null);
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'disconnected':
        return 'Not Connected';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'queued':
        return 'In Queue';
      case 'match_found':
        return 'Match Found!';
      default:
        return 'Unknown';
    }
  };

  if (status === 'match_found' && opponent) {
    return (
      <div className="matchmaking-overlay">
        <div className="matchmaking-panel match-found">
          <div className="matchmaking-header">
            <h2>MATCH FOUND!</h2>
          </div>
          <div className="match-found-content">
            <div className="opponent-info">
              <div className="opponent-label">VS</div>
              <div className="opponent-name">{opponent.name}</div>
            </div>
            <div className="match-found-actions">
              <button
                className="matchmaking-button start-match"
                onClick={() => {
                  if (onMatchFound) {
                    onMatchFound({ opponent, matchId: multiplayerManager.matchId });
                  }
                }}
              >
                START MATCH
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="matchmaking-overlay">
      <div className="matchmaking-panel">
        <div className="matchmaking-header">
          <h2>1V1 MULTIPLAYER</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="matchmaking-content">
          <div className="connection-status">
            <span className="status-icon">{getStatusIcon()}</span>
            <span className="status-text">{getStatusText()}</span>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {status === 'disconnected' && (
            <div className="connection-form">
              <div className="form-group">
                <label htmlFor="player-name">Player Name:</label>
                <input
                  id="player-name"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConnect();
                    }
                  }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="server-url">Server URL:</label>
                <input
                  id="server-url"
                  type="text"
                  value={serverUrl}
                  readOnly
                  disabled
                  className="server-input-disabled"
                />
              </div>
              <button
                className="matchmaking-button connect"
                onClick={handleConnect}
                disabled={!playerName.trim()}
              >
                CONNECT
              </button>
            </div>
          )}

          {status === 'connected' && (
            <div className="queue-actions">
              <button
                className="matchmaking-button join-queue"
                onClick={handleJoinQueue}
              >
                FIND OPPONENT
              </button>
              <button
                className="matchmaking-button disconnect"
                onClick={handleDisconnect}
              >
                DISCONNECT
              </button>
            </div>
          )}

          {status === 'queued' && (
            <div className="queue-status">
              <div className="searching-animation">
                <div className="search-dot"></div>
                <div className="search-dot"></div>
                <div className="search-dot"></div>
              </div>
              <div className="queue-text">SEARCHING FOR OPPONENT...</div>
              <div className="queue-position">Position in queue: {queuePosition}</div>
              <button
                className="matchmaking-button leave-queue"
                onClick={handleLeaveQueue}
              >
                LEAVE QUEUE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


