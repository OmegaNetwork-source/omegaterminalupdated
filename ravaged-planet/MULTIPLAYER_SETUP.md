# Multiplayer PVP Setup Guide

## Overview

The game now includes a fully functional 1v1 multiplayer PVP mode where players can join an online server and compete in best-of-3 rounds matches against real opponents.

## Features

- **Real-time matchmaking**: Queue up and get matched with another player
- **Best of 3 rounds**: First to win 2 rounds wins the match
- **Synchronized gameplay**: Turn-based gameplay with real-time state synchronization
- **Round tracking**: Visual display of current round and score
- **Match results**: Detailed match summary showing winner and round breakdown

## Setup Instructions

### 1. Install Dependencies

```bash
cd ravaged-planet
npm install
```

This will install the required `ws` package for WebSocket support.

### 2. Start the Multiplayer Server

In a terminal, run:

```bash
npm run server
```

The server will start on `ws://localhost:3001` by default.

You should see:
```
🚀 Multiplayer Server running on port 3001
📡 WebSocket endpoint: ws://localhost:3001
❤️  Health check: http://localhost:3001/health
```

### 3. Start the Game Client

In another terminal, run:

```bash
npm run dev
```

The game will start on `http://localhost:5173` (or similar Vite port).

### 4. Connect and Play

1. In the game menu, select **"1V1 MULTIPLAYER"**
2. Enter your player name
3. Click **"CONNECT"** to connect to the server
4. Click **"FIND OPPONENT"** to join the matchmaking queue
5. Once matched, the game will start automatically
6. Play best-of-3 rounds to determine the winner!

## Server Configuration

The server port can be configured via environment variable:

```bash
PORT=3002 npm run server
```

## Network Setup

For multiplayer over a network (not just localhost):

1. Update the server URL in `src/react/App.jsx`:
   ```javascript
   <Matchmaking
     serverUrl="ws://YOUR_SERVER_IP:3001"
     ...
   />
   ```

2. Ensure port 3001 (or your chosen port) is open in your firewall

3. Update the server to bind to all interfaces:
   ```javascript
   server.listen(PORT, '0.0.0.0', () => {
     // ...
   });
   ```

## How It Works

### Matchmaking Flow

1. Player connects to server via WebSocket
2. Player joins matchmaking queue
3. Server pairs two players when available
4. Match begins with round 1

### Game Flow

1. Each round is a standard 1v1 game
2. Players take turns (as in single-player mode)
3. When a round ends, winner is recorded
4. If no player has 2 wins, next round begins
5. When a player reaches 2 wins, match ends

### State Synchronization

- Game state (player positions, health, wind, etc.) is synchronized between clients
- Only the active player can input commands
- All actions are broadcast to the opponent in real-time

## Troubleshooting

### Server won't start

- Ensure Node.js 16+ is installed
- Check if port 3001 is already in use
- Verify `ws` package is installed: `npm list ws`

### Can't connect to server

- Verify server is running
- Check server URL is correct
- Ensure firewall allows WebSocket connections
- Try `ws://localhost:3001` for local testing

### Match doesn't start

- Ensure both players are connected
- Check browser console for errors
- Verify WebSocket connection is established

### Game state desync

- Check network connection quality
- Verify server is running stable
- Reconnect if issues persist

## Development

### Running Both Server and Client

You can use `concurrently` to run both:

```bash
npm install -g concurrently
npm run dev:full
```

This requires `concurrently` to be installed globally, or you can add it as a dev dependency.

### Testing Locally

To test multiplayer locally:

1. Start the server
2. Open two browser windows
3. Connect both as different players
4. Queue up in both windows
5. You should get matched together!

## Architecture

### Server (`server/multiplayer-server.js`)

- WebSocket server for real-time communication
- Matchmaking queue system
- Match and round management
- Game state synchronization

### Client (`src/utils/multiplayer.js`)

- WebSocket client connection
- Event-based communication
- State synchronization helpers

### UI Components

- `Matchmaking.jsx`: Queue and connection UI
- `MultiplayerGame.jsx`: In-game multiplayer overlay
- `MatchResult.jsx`: Post-match results screen

## Future Enhancements

Possible additions:
- Spectator mode
- Custom game settings
- Ranked matchmaking
- Tournament brackets
- Replay system


