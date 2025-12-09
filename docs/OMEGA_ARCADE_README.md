# 🎮 Omega Arcade - Unified Gaming Platform

A comprehensive gaming platform for Omega Network with unified leaderboards, terminal integration, and seamless Web3 integration.

## 🏗️ Architecture Overview

### Unified Leaderboard System
- **Single Smart Contract** - `OmegaArcadeLeaderboard.sol` handles all games
- **Standardized API** - All games use the same score submission system
- **Real-time Leaderboards** - Live updates across all games
- **Player Statistics** - Comprehensive tracking per game and globally

### Terminal Integration
- **Direct Game Launch** - Type `flappy`, `breaker`, `invaders`, etc. to launch games
- **Leaderboard Access** - View top scores directly from terminal
- **Game Statistics** - Real-time stats and analytics
- **Seamless UX** - Games launched from terminal with wallet already connected

## 📁 File Structure

```
/
├── 🎮 Core System
│   ├── OmegaArcadeLeaderboard.sol      # Unified smart contract
│   ├── omega-arcade-sdk.js             # JavaScript SDK for games
│   ├── deploy-arcade.js                # Deployment script
│   └── index.html                      # Terminal with arcade integration
│
├── 🕹️ Games (Unified)
│   ├── flappy-omega-unified.html       # Flappy Omega with leaderboard
│   ├── omega-breaker-unified.html      # Omega Breaker (to be created)
│   ├── omega-invaders-unified.html     # Omega Invaders (to be created)
│   ├── omega-pong-unified.html         # Omega Pong (to be created)
│   └── space-omega-unified.html        # Space Omega (to be created)
│
└── 📋 Documentation
    └── OMEGA_ARCADE_README.md          # This file
```

## 🎯 Game Types & IDs

| Game ID | Game Name | Command | File |
|---------|-----------|---------|------|
| 0 | Flappy Omega | `flappy` | flappy-omega-unified.html |
| 1 | Omega Breaker | `breaker` | omega-breaker-unified.html |
| 2 | Omega Invaders | `invaders` | omega-invaders-unified.html |
| 3 | Omega.io | `io` | omega-io-unified.html |
| 4 | Omega Pong | `pong` | omega-pong-unified.html |
| 5 | Space Omega | `space` | space-omega-unified.html |

## 🚀 Terminal Commands

### Arcade Management
```bash
# Show all arcade commands
arcade

# List all available games
arcade list

# Show global leaderboard overview  
arcade leaderboard

# Show specific game leaderboard
arcade leaderboard flappy
arcade leaderboard breaker

# Show game statistics
arcade stats
arcade stats flappy

# Launch a game
arcade launch flappy
```

### Direct Game Launch
```bash
# Quick launch commands (shortcuts)
flappy       # Launch Flappy Omega
breaker      # Launch Omega Breaker  
invaders     # Launch Omega Invaders
pong         # Launch Omega Pong
space        # Launch Space Omega
```

## 🔧 Smart Contract Functions

### Core Functions
- `submitScore(gameType, score, username, gameData)` - Submit player score
- `getLeaderboard(gameType, limit)` - Get top scores for a game
- `getPlayerStats(player, gameType)` - Get player statistics
- `getGameInfo(gameType)` - Get game information and stats

### Data Structures
```solidity
struct ScoreEntry {
    address player;
    string username;
    uint256 score;
    uint256 timestamp;
    GameType gameType;
    string gameData; // JSON for additional data
}

struct PlayerStats {
    uint256 highScore;
    uint256 gamesPlayed;
    uint256 totalScore;
    uint256 lastPlayed;
    uint256 rank;
}
```

## 🎮 Game Integration Guide

### For Game Developers

1. **Include the SDK:**
```html
<script src="omega-arcade-sdk.js"></script>
```

2. **Initialize SDK:**
```javascript
const arcadeSDK = new OmegaArcadeSDK();
await arcadeSDK.init();
```

3. **Connect Wallet:**
```javascript
await arcadeSDK.connectWallet();
```

4. **Submit Score:**
```javascript
await arcadeSDK.submitScore(
    GAME_TYPE_ID,           // 0-5 (your game's ID)
    playerScore,            // Player's final score
    username,               // Player's username
    { level: 5, time: 120 } // Additional game data (optional)
);
```

5. **Get Leaderboard:**
```javascript
const leaderboard = await arcadeSDK.getLeaderboard(GAME_TYPE_ID, 10);
```

### Game Template Structure
```html
<!-- Standard game header with wallet/leaderboard -->
<div class="game-header">
    <div class="game-title">Your Game Name</div>
    <div class="game-controls">
        <div class="wallet-status" id="walletStatus">Not Connected</div>
        <button onclick="toggleLeaderboard()">🏆 Leaderboard</button>
        <button onclick="connectWallet()">🔗 Connect</button>
    </div>
</div>

<!-- Your game canvas/content -->
<div id="gameContainer">
    <!-- Game goes here -->
</div>

<!-- Leaderboard panel (standardized) -->
<div class="leaderboard-panel" id="leaderboardPanel">
    <!-- Auto-populated by SDK -->
</div>
```

## 🚀 Deployment Guide

### 1. Smart Contract Deployment
```bash
# Set your deployer private key
export DEPLOYER_PRIVATE_KEY="your_private_key"

# Run deployment script
node deploy-arcade.js
```

### 2. Compile Contract
Use Remix, Hardhat, or Foundry to compile `OmegaArcadeLeaderboard.sol`:
- Solidity 0.8.19+
- Optimization: 200 runs
- Target: Omega Network (0x4e454228)

### 3. Update SDK
After deployment, update the contract address in `omega-arcade-sdk.js`:
```javascript
this.contractAddress = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### 4. Update Terminal
Deploy the updated `index.html` with arcade commands to your terminal hosting.

## 🎯 Features

### For Players
- **Single Leaderboard** - All games use the same unified ranking system
- **Terminal Integration** - Launch games directly from Omega Terminal
- **Profile Integration** - Uses existing Omega Network profiles
- **Real-time Competition** - Live leaderboards and statistics
- **Cross-game Statistics** - Track progress across all arcade games

### For Developers  
- **Easy Integration** - Simple SDK for adding leaderboard to any game
- **Standardized UI** - Consistent header, wallet, and leaderboard components
- **Flexible Data** - JSON gameData field for game-specific information
- **Gas Optimized** - Efficient smart contract design

### For Terminal Users
- **Quick Launch** - Type game name to instantly play
- **Leaderboard Access** - View top 100 scores for any game
- **Statistics Dashboard** - Comprehensive arcade analytics
- **Seamless Experience** - Games inherit terminal wallet connection

## 🔗 Integration Points

### With Omega Terminal
- Added `arcade` command with full game management
- Direct game launch commands (`flappy`, `breaker`, etc.)
- Leaderboard viewing from terminal
- Game statistics and analytics

### With Omega Network Profile System
- Uses existing profile usernames for leaderboards
- Integrates with ambassador system
- Consistent user experience across platform

### With Web3 Infrastructure
- Built on Omega Network blockchain
- Uses existing wallet connection system
- Integrates with Omega Terminal's Web3 provider

## 📊 Leaderboard Features

### Per-Game Leaderboards
- Top 100 players per game
- Real-time score updates
- Player rankings and statistics
- Historical score tracking

### Global Statistics
- Cross-game player performance
- Total arcade engagement metrics
- Popular games tracking
- Community leaderboards

### Player Profiles
- Individual game statistics
- Achievement tracking
- Progress history
- Rank progression

## 🎮 Current Implementation Status

✅ **Completed:**
- Unified smart contract design
- JavaScript SDK for game integration
- Terminal command integration
- Sample Flappy Omega game with full integration
- Deployment scripts and documentation

🔄 **Next Steps:**
1. Deploy smart contract to Omega Network
2. Convert remaining games to unified system
3. Add advanced leaderboard features
4. Implement achievement system
5. Add tournament functionality

## 🌟 Benefits of Unified System

### vs. Previous Scattered System
- **Before:** Each game had separate leaderboard
- **After:** Single unified leaderboard for all games

### Developer Experience
- **Before:** Complex integration per game
- **After:** Simple SDK integration

### Player Experience  
- **Before:** Separate scores and profiles per game
- **After:** Unified gaming profile across all arcade games

### Terminal Integration
- **Before:** No arcade integration in terminal
- **After:** Full arcade management from terminal

## 🔧 Technical Specifications

### Smart Contract
- **Solidity Version:** 0.8.19+
- **Network:** Omega Network (Chain ID: 0x4e454228)
- **Gas Optimization:** 200 optimization runs
- **Security:** Owner-based access control with modifiers

### Frontend SDK
- **Framework:** Vanilla JavaScript with ethers.js
- **Web3 Integration:** MetaMask and WalletConnect support
- **Network:** Auto-detection and switching to Omega Network
- **Storage:** Local storage for caching and analytics

### Terminal Integration
- **Command Parser:** Integrated with existing Omega Terminal
- **Window Management:** Pop-up games with proper sizing
- **Analytics:** Game launch tracking and statistics
- **Cross-platform:** Works on desktop and mobile

---

**Ready to revolutionize gaming on Omega Network! 🚀**

*For support or questions, check the Omega Network Discord or GitHub issues.* 