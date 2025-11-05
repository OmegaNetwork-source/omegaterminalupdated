/**
 * Multiplayer Client Manager
 * Handles WebSocket communication and game state synchronization
 */

class MultiplayerManager {
  constructor() {
    this.ws = null;
    this.playerId = null;
    this.playerName = null;
    this.matchId = null;
    this.opponent = null;
    this.isConnected = false;
    this.isInQueue = false;
    this.isInMatch = false;
    this.currentMatch = null;
    this.serverUrl = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect(serverUrl, playerName = null) {
    if (this.isConnected) {
      console.warn('[Multiplayer] Already connected');
      return;
    }

    this.serverUrl = serverUrl || 'ws://localhost:3001';
    this.playerName = playerName || `Player_${Math.random().toString(36).substring(2, 8)}`;

    try {
      const url = new URL(this.serverUrl);
      url.searchParams.set('name', encodeURIComponent(this.playerName));
      this.ws = new WebSocket(url.toString());

      this.ws.onopen = () => {
        console.log('[Multiplayer] Connected to server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[Multiplayer] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[Multiplayer] WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('[Multiplayer] Disconnected from server');
        this.isConnected = false;
        this.emit('disconnected');

        // Attempt reconnection if in match
        if (this.isInMatch && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`[Multiplayer] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
          setTimeout(() => this.connect(this.serverUrl, this.playerName), 2000);
        }
      };
    } catch (error) {
      console.error('[Multiplayer] Connection error:', error);
      this.emit('error', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.leaveQueue();
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isInQueue = false;
    this.isInMatch = false;
    this.matchId = null;
  }

  joinQueue() {
    if (!this.isConnected) {
      console.error('[Multiplayer] Not connected to server');
      return;
    }

    if (this.isInQueue) {
      console.warn('[Multiplayer] Already in queue');
      return;
    }

    this.send({ type: 'join_queue' });
    this.isInQueue = true;
    this.emit('queue_joined');
  }

  leaveQueue() {
    if (!this.isInQueue) return;

    this.send({ type: 'leave_queue' });
    this.isInQueue = false;
    this.emit('queue_left');
  }

  sendGameState(state) {
    if (!this.isConnected || !this.isInMatch) return;

    this.send({
      type: 'game_state_sync',
      state: {
        players: state.players,
        currentPlayer: state.currentPlayer,
        wind: state.wind,
        state: state.state,
      },
    });
  }

  sendPlayerAction(action) {
    if (!this.isConnected || !this.isInMatch) return;

    this.send({
      type: 'player_action',
      action,
    });
  }

  reportRoundEnd(winnerId) {
    if (!this.isConnected || !this.isInMatch) return;

    this.send({
      type: 'round_end',
      winnerId,
    });
  }

  readyForRound() {
    if (!this.isConnected || !this.isInMatch) return;

    this.send({
      type: 'ready_for_round',
    });
  }

  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Multiplayer] Cannot send message, not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('[Multiplayer] Failed to send message:', error);
    }
  }

  handleMessage(message) {
    switch (message.type) {
      case 'connected':
        this.playerId = message.playerId;
        this.playerName = message.playerName;
        this.emit('connected', message);
        break;

      case 'matchmaking':
        if (message.status === 'queued') {
          this.emit('queue_update', {
            queuePosition: message.queuePosition,
          });
        } else if (message.status === 'left_queue') {
          this.isInQueue = false;
          this.emit('queue_left');
        }
        break;

      case 'match_found':
        this.matchId = message.matchId;
        this.opponent = message.opponent;
        this.isInQueue = false;
        this.isInMatch = true;
        this.emit('match_found', message);
        break;

      case 'match_start':
        this.currentMatch = {
          round: message.round,
          maxRounds: message.maxRounds,
          scores: [],
        };
        this.emit('match_start', message);
        break;

      case 'round_start':
        this.currentMatch = {
          ...this.currentMatch,
          round: message.round,
          wind: message.wind,
          currentPlayer: message.currentPlayer,
          scores: message.scores,
        };
        this.emit('round_start', message);
        break;

      case 'round_end':
        if (this.currentMatch) {
          this.currentMatch.scores = message.scores;
          this.currentMatch.roundWinner = message.winner;
        }
        this.emit('round_end', message);
        break;

      case 'match_end':
        this.currentMatch = {
          ...this.currentMatch,
          winner: message.winner,
          finalScores: message.finalScores,
          rounds: message.rounds,
        };
        this.emit('match_end', message);
        break;

      case 'game_state_update':
        this.emit('game_state_update', message.state);
        break;

      case 'player_action':
        this.emit('player_action', {
          playerId: message.playerId,
          action: message.action,
        });
        break;

      case 'opponent_disconnected':
        this.emit('opponent_disconnected');
        break;

      default:
        console.log('[Multiplayer] Unknown message type:', message.type);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[Multiplayer] Error in listener for ${event}:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const multiplayerManager = new MultiplayerManager();
export default multiplayerManager;


