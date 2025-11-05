/**
 * Multiplayer PVP Server
 * Handles matchmaking, game state synchronization, and 1v1 matches
 */

import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';

// Note: If running on Node.js < 16, you may need to use require instead:
// const { WebSocketServer } = require('ws');
// const { createServer } = require('http');
// const { parse } = require('url');

const PORT = process.env.PORT || 3001;

// Game state
const matchmakingQueue = [];
const activeMatches = new Map(); // matchId -> match data
const connectedPlayers = new Map(); // playerId -> {ws, playerName, matchId}

// Match configuration
const MATCH_CONFIG = {
  roundsToWin: 2, // Best of 3
  maxPlayersPerMatch: 2,
  turnTimeout: 60, // seconds
};

class Match {
  constructor(matchId, player1, player2) {
    this.matchId = matchId;
    this.players = [
      { id: player1.id, name: player1.name, ws: player1.ws, score: 0 },
      { id: player2.id, name: player2.name, ws: player2.ws, score: 0 },
    ];
    this.currentRound = 1;
    this.roundWinners = [];
    this.gameState = 'waiting'; // waiting, starting, in-progress, round-over, match-over
    this.currentPlayerIndex = 0;
    this.syncState = {
      players: [],
      currentPlayer: 0,
      wind: 0,
      state: 'menu',
    };
    this.createdAt = Date.now();
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getOpponent(playerId) {
    return this.players.find(p => p.id !== playerId);
  }

  recordRoundWinner(winnerId) {
    const winner = this.players.find(p => p.id === winnerId);
    if (winner) {
      winner.score++;
      this.roundWinners.push(winnerId);
    }
  }

  checkMatchWinner() {
    for (const player of this.players) {
      if (player.score >= MATCH_CONFIG.roundsToWin) {
        return player;
      }
    }
    return null;
  }

  broadcast(message, excludePlayerId = null) {
    const payload = JSON.stringify(message);
    this.players.forEach(player => {
      if (player.id !== excludePlayerId && player.ws.readyState === 1) {
        player.ws.send(payload);
      }
    });
  }

  sendToPlayer(playerId, message) {
    const player = this.players.find(p => p.id === playerId);
    if (player && player.ws.readyState === 1) {
      player.ws.send(JSON.stringify(message));
    }
  }
}

// Generate unique IDs
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Matchmaking
function addToQueue(player) {
  // Check if player is already in queue
  const existingIndex = matchmakingQueue.findIndex(p => p.id === player.id);
  if (existingIndex !== -1) {
    return;
  }

  matchmakingQueue.push(player);
  console.log(`[Matchmaking] Player ${player.name} (${player.id}) joined queue. Queue size: ${matchmakingQueue.length}`);

  // Notify player
  player.ws.send(JSON.stringify({
    type: 'matchmaking',
    status: 'queued',
    queuePosition: matchmakingQueue.length,
  }));

  // Try to match players
  if (matchmakingQueue.length >= MATCH_CONFIG.maxPlayersPerMatch) {
    createMatch();
  }
}

function createMatch() {
  if (matchmakingQueue.length < MATCH_CONFIG.maxPlayersPerMatch) return;

  const player1 = matchmakingQueue.shift();
  const player2 = matchmakingQueue.shift();
  const matchId = generateId();

  const match = new Match(matchId, player1, player2);

  // Update player records
  connectedPlayers.set(player1.id, { ...connectedPlayers.get(player1.id), matchId });
  connectedPlayers.set(player2.id, { ...connectedPlayers.get(player2.id), matchId });

  activeMatches.set(matchId, match);

  console.log(`[Match] Created match ${matchId} between ${player1.name} and ${player2.name}`);

  // Notify both players
  match.broadcast({
    type: 'match_found',
    matchId,
    opponent: {
      id: player1.id === player1.id ? player2.id : player1.id,
      name: player1.id === player1.id ? player2.name : player1.name,
    },
    yourId: player1.id === player1.id ? player1.id : player2.id,
  });

  // Start match
  setTimeout(() => {
    startMatch(matchId);
  }, 2000);
}

function startMatch(matchId) {
  const match = activeMatches.get(matchId);
  if (!match) return;

  match.gameState = 'starting';
  match.currentRound = 1;

  console.log(`[Match ${matchId}] Starting round ${match.currentRound}`);

  match.broadcast({
    type: 'match_start',
    round: match.currentRound,
    maxRounds: MATCH_CONFIG.roundsToWin * 2 - 1,
  });
}

function startRound(matchId) {
  const match = activeMatches.get(matchId);
  if (!match) return;

  match.gameState = 'in-progress';
  match.currentPlayerIndex = 0;

  // Generate random wind for this round
  match.syncState.wind = Math.floor(Math.random() * 60) - 30;

  match.broadcast({
    type: 'round_start',
    round: match.currentRound,
    wind: match.syncState.wind,
    currentPlayer: match.players[match.currentPlayerIndex].id,
    scores: match.players.map(p => ({ id: p.id, score: p.score })),
  });
}

function endRound(matchId, winnerId) {
  const match = activeMatches.get(matchId);
  if (!match) return;

  match.recordRoundWinner(winnerId);
  match.gameState = 'round-over';

  const matchWinner = match.checkMatchWinner();

  if (matchWinner) {
    // Match is over
    match.gameState = 'match-over';
    match.broadcast({
      type: 'match_end',
      winner: {
        id: matchWinner.id,
        name: matchWinner.name,
      },
      finalScores: match.players.map(p => ({ id: p.id, name: p.name, score: p.score })),
      rounds: match.roundWinners,
    });

    // Cleanup after delay
    setTimeout(() => {
      cleanupMatch(matchId);
    }, 10000);
  } else {
    // Continue to next round
    match.currentRound++;
    match.broadcast({
      type: 'round_end',
      winner: {
        id: winnerId,
        name: match.players.find(p => p.id === winnerId)?.name,
      },
      scores: match.players.map(p => ({ id: p.id, score: p.score })),
      nextRound: match.currentRound,
    });

    // Start next round after delay
    setTimeout(() => {
      startRound(matchId);
    }, 3000);
  }
}

function cleanupMatch(matchId) {
  const match = activeMatches.get(matchId);
  if (!match) return;

  // Remove match references from players
  match.players.forEach(player => {
    const playerData = connectedPlayers.get(player.id);
    if (playerData) {
      connectedPlayers.set(player.id, { ...playerData, matchId: null });
    }
  });

  activeMatches.delete(matchId);
  console.log(`[Match ${matchId}] Cleaned up`);
}

// WebSocket server setup
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const url = parse(req.url, true);
  const playerId = generateId();
  let playerName = `Player_${playerId.substring(0, 6)}`;

  // Extract player name from query if provided
  if (url.query.name) {
    playerName = decodeURIComponent(url.query.name);
  }

  connectedPlayers.set(playerId, { ws, playerName, matchId: null });

  console.log(`[Connection] Player ${playerName} (${playerId}) connected. Total: ${connectedPlayers.size}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    playerId,
    playerName,
    serverTime: Date.now(),
  }));

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(playerId, message);
    } catch (error) {
      console.error(`[Error] Failed to parse message from ${playerId}:`, error);
    }
  });

  // Handle disconnect
  ws.on('close', () => {
    handleDisconnect(playerId);
  });

  ws.on('error', (error) => {
    console.error(`[Error] WebSocket error for ${playerId}:`, error);
  });
});

function handleMessage(playerId, message) {
  const playerData = connectedPlayers.get(playerId);
  if (!playerData) return;

  switch (message.type) {
    case 'join_queue':
      addToQueue({ ...playerData, id: playerId });
      break;

    case 'leave_queue':
      const queueIndex = matchmakingQueue.findIndex(p => p.id === playerId);
      if (queueIndex !== -1) {
        matchmakingQueue.splice(queueIndex, 1);
        playerData.ws.send(JSON.stringify({
          type: 'matchmaking',
          status: 'left_queue',
        }));
        console.log(`[Matchmaking] Player ${playerId} left queue`);
      }
      break;

    case 'game_state_sync':
      // Sync game state from client
      const matchId = playerData.matchId;
      if (matchId) {
        const match = activeMatches.get(matchId);
        if (match) {
          // Update sync state
          match.syncState = {
            ...match.syncState,
            ...message.state,
          };

          // Broadcast to opponent
          const opponent = match.getOpponent(playerId);
          if (opponent) {
            opponent.ws.send(JSON.stringify({
              type: 'game_state_update',
              state: match.syncState,
              fromPlayer: playerId,
            }));
          }
        }
      }
      break;

    case 'player_action':
      // Player action (move, aim, shoot, etc.)
      const actionMatchId = playerData.matchId;
      if (actionMatchId) {
        const match = activeMatches.get(actionMatchId);
        if (match) {
          // Validate it's the player's turn
          const currentPlayer = match.getCurrentPlayer();
          if (currentPlayer && currentPlayer.id === playerId) {
            // Broadcast action to opponent
            match.broadcast({
              type: 'player_action',
              playerId,
              action: message.action,
            }, playerId);
          }
        }
      }
      break;

    case 'round_end':
      // Client reports round ended with winner
      const roundMatchId = playerData.matchId;
      if (roundMatchId) {
        const match = activeMatches.get(roundMatchId);
        if (match && message.winnerId) {
          endRound(roundMatchId, message.winnerId);
        }
      }
      break;

    case 'ready_for_round':
      // Player is ready to start the round
      const readyMatchId = playerData.matchId;
      if (readyMatchId) {
        const match = activeMatches.get(readyMatchId);
        if (match) {
          // Check if both players are ready
          if (!match.playersReady) {
            match.playersReady = new Set();
          }
          match.playersReady.add(playerId);

          if (match.playersReady.size === 2) {
            startRound(readyMatchId);
            match.playersReady.clear();
          }
        }
      }
      break;

    default:
      console.log(`[Message] Unknown message type from ${playerId}:`, message.type);
  }
}

function handleDisconnect(playerId) {
  const playerData = connectedPlayers.get(playerId);
  if (!playerData) return;

  console.log(`[Disconnect] Player ${playerId} disconnected`);

  // Remove from queue
  const queueIndex = matchmakingQueue.findIndex(p => p.id === playerId);
  if (queueIndex !== -1) {
    matchmakingQueue.splice(queueIndex, 1);
  }

  // Handle active match
  if (playerData.matchId) {
    const match = activeMatches.get(playerData.matchId);
    if (match) {
      // Notify opponent
      const opponent = match.getOpponent(playerId);
      if (opponent) {
        opponent.ws.send(JSON.stringify({
          type: 'opponent_disconnected',
        }));
      }

      // Cleanup match
      cleanupMatch(playerData.matchId);
    }
  }

  connectedPlayers.delete(playerId);
}

// Health check endpoint
server.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      players: connectedPlayers.size,
      queue: matchmakingQueue.length,
      activeMatches: activeMatches.size,
    }));
    return;
  }

  // Default 404
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n🚀 Multiplayer Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});
