# OMEGA TERMINAL v2.0.1 - COMPREHENSIVE ARCHITECTURE OUTLINE

## TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [File Structure & Organization](#file-structure--organization)
4. [Core Initialization Flow](#core-initialization-flow)
5. [Command System Architecture](#command-system-architecture)
6. [Plugin System Architecture](#plugin-system-architecture)
7. [UI/Theming System](#uitheming-system)
8. [State Management](#state-management)
9. [API Integration](#api-integration)
10. [Data Flow Patterns](#data-flow-patterns)

---

## SYSTEM OVERVIEW

### Purpose
Omega Terminal is a Web3 terminal application that combines:
- **Multi-chain wallet management** (Ethereum, Solana, NEAR, Eclipse, ROME, FAIR, MONAD)
- **Blockchain mining & rewards system**
- **Trading & analytics** (Kalshi, Polymarket, Hyperliquid, DexScreener, DeFi Llama)
- **NFT marketplace integration** (OpenSea, Magic Eden)
- **AI-powered tools** (ChainGPT: Chat, NFT Generator, Smart Contract Creator/Auditor)
- **Entertainment features** (Games, Music Players, YouTube)
- **News aggregation** (Crypto news reader)
- **Futuristic UI dashboard** with sidebar navigation

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Blockchain**: Ethers.js v5.7.2, Solana Web3.js v1.93.1
- **Styling**: Custom CSS with CSS Variables, Glass-morphism, Gradient effects
- **Storage**: localStorage for persistence
- **APIs**: RESTful APIs via relayer proxy server
- **Development Server**: Python HTTP Server / Node.js http-server

---

## ARCHITECTURE LAYERS

### Layer 1: Entry Point & Bootstrap
- **File**: `terminal.html`
- **Purpose**: Main HTML entry point, loads all scripts in dependency order
- **Key Responsibilities**:
  - Load external libraries (ethers, Solana Web3, eth-crypto)
  - Load core configuration (`config.js`)
  - Initialize mobile detection (`mobile-basic-mode.js`)
  - Load utility modules (`utils.js`, `themes.js`, `wallet.js`)
  - Load futuristic UI system
  - Load all command modules
  - Load all plugin modules
  - Load all CSS stylesheets

### Layer 2: Core Terminal Engine
- **Files**: `js/terminal-core.js`, `js/init.js`
- **Purpose**: Core terminal functionality and initialization
- **Key Classes/Objects**:
  - `OmegaMinerTerminal` - Main terminal class
  - `OmegaConfig` - Global configuration object
  - `OmegaUtils` - Utility functions
  - `OmegaWallet` - Wallet management
  - `OmegaThemes` - Theme system

### Layer 3: Command System
- **Directory**: `js/commands/`
- **Purpose**: Modular command handlers organized by category
- **Architecture**: Commands are registered in `OmegaCommands` namespace
- **Execution Flow**: `terminal.executeCommand()` → Route to `OmegaCommands.{Module}.{function}`

### Layer 4: Plugin System
- **Directory**: `js/plugins/`
- **Purpose**: Extended functionality that creates UI panels, integrates external APIs
- **Pattern**: Each plugin exposes a global namespace (e.g., `OmegaSpotify`, `OmegaYouTube`)

### Layer 5: UI/UX System
- **Directory**: `js/futuristic/`, `styles/`
- **Purpose**: Dashboard transformation, sidebar navigation, theming
- **Key Components**:
  - `FuturisticDashboard` - Dashboard transform & sidebar management
  - `OmegaWelcomeScreen` - Boot screen & view mode selection
  - Theme system with CSS variables

### Layer 6: API Integration
- **Files**: `server/relayer-faucet.js`, `api/env.js`
- **Purpose**: Proxy server for external API calls, CORS handling
- **Pattern**: All external API calls go through relayer to avoid CORS issues

---

## FILE STRUCTURE & ORGANIZATION

### Root Directory Structure
```
omegaterminalupdated/
├── terminal.html              # Main entry point
├── index.html                 # Alternative entry point (modular)
├── package.json              # Node.js dependencies
├── vercel.json               # Vercel deployment config
│
├── js/                       # JavaScript modules
│   ├── init.js              # Initialization script
│   ├── terminal-core.js      # Core terminal class
│   ├── config.js             # Global configuration
│   ├── utils.js              # Utility functions
│   ├── wallet.js             # Wallet management
│   ├── themes.js             # Theme system
│   │
│   ├── commands/             # Command handlers (27 files)
│   │   ├── basic.js          # help, clear, theme, gui, ai, view, status, tab
│   │   ├── wallet-commands.js # connect, disconnect, balance, send, import, export
│   │   ├── mining.js         # mine, claim, faucet, stats
│   │   ├── api.js            # dexscreener, geckoterminal, defillama, chart, pgt
│   │   ├── entertainment.js  # rickroll, matrix, hack, disco, fortune, ascii
│   │   ├── remaining.js     # polymarket, hyperliquid, email, inbox, ens, airdrop
│   │   ├── kalshi.js         # kalshi markets, trending, market details
│   │   ├── news-commands.js  # news latest, hot, search, category
│   │   ├── perps-commands.js # perps open, close, help
│   │   ├── solana.js         # solana connect, generate, status, swap, search
│   │   ├── near.js           # near connect, balance, account, swap, quote
│   │   ├── eclipse.js        # eclipse tokens, price, swap, connect
│   │   ├── network.js        # stress, stopstress, stressstats
│   │   ├── mixer.js          # mixer deposit, withdraw, direct
│   │   ├── youtube.js        # youtube open, close, search, play, pause
│   │   ├── blues.js          # blues (Omega Player) commands
│   │   ├── custom-music-commands.js # upload music, playlist
│   │   └── [23 more command files]
│   │
│   ├── plugins/              # Plugin modules (22 files)
│   │   ├── omega-spotify-player.js      # Spotify integration
│   │   ├── omega-youtube-player.js      # YouTube integration
│   │   ├── omega-blues-player.js         # Omega Player (Blues)
│   │   ├── omega-custom-music-player.js  # Custom music upload & playlist
│   │   ├── omega-news-reader.js          # News reader panel
│   │   ├── omega-perps-viewer.js         # Perpetuals viewer
│   │   ├── magiceden-plugin.js          # Magic Eden NFT integration
│   │   ├── opensea-enhanced-plugin.js   # OpenSea NFT integration
│   │   ├── dexscreener-analytics-ultimate.js # DexScreener analytics
│   │   ├── defillama-api-plugin.js      # DeFi Llama API
│   │   ├── multi-network-connector.js    # Multi-chain wallet connector
│   │   ├── terminal-games-system.js     # Games system
│   │   ├── omega-referral-system.js     # Referral/ambassador system
│   │   ├── omega-sound-effects.js        # Sound effects system
│   │   └── [8 more plugin files]
│   │
│   └── futuristic/           # Futuristic UI system
│       ├── futuristic-dashboard-transform.js  # Main dashboard transform
│       ├── futuristic-welcome-screen-new.js    # Welcome screen
│       ├── futuristic-customizer.js           # Dashboard customization
│       └── terminal-theme-bridge.js           # Theme bridging
│
├── styles/                    # CSS stylesheets (40+ files)
│   ├── base.css              # Base styles
│   ├── themes.css            # Theme definitions
│   ├── futuristic-theme.css   # Futuristic theme (main)
│   ├── futuristic-mode.css   # Futuristic mode styles
│   ├── custom-music-player.css # Custom music player styles
│   ├── blues-player.css       # Omega Player styles
│   ├── spotify-player.css    # Spotify player styles
│   ├── youtube-player.css    # YouTube player styles
│   ├── news-reader.css       # News reader styles
│   └── [30+ more style files]
│
├── server/                    # Backend servers
│   ├── relayer-faucet.js     # API relayer & faucet server
│   ├── bot_hyperliquid.py    # Hyperliquid bot
│   └── polymarket-proxy.js   # Polymarket proxy
│
├── api/                       # API configuration
│   └── env.js                # Environment variables
│
├── ui/                        # UI components
│   ├── omega-symbol-logo.js  # Omega symbol logo
│   └── svg-icons-replacement.js # SVG icon system
│
└── sounds/                    # Sound effects
    └── [8 audio files]
```

---

## CORE INITIALIZATION FLOW

### Phase 1: HTML & Script Loading (`terminal.html`)
1. **Meta tags** loaded (cache control, viewport, CSP)
2. **External libraries** loaded from CDN:
   - Ethers.js v5.7.2
   - eth-crypto v2.1.2
   - Solana Web3.js v1.93.1
3. **Mobile detection** loaded first (`mobile-basic-mode.js`)
4. **Core modules** loaded:
   - `config.js` - Creates `window.OmegaConfig`
   - `themes.js` - Creates `window.OmegaThemes`
   - `core-modern-ui-integration.js` - Modern UI integration
   - `utils.js` - Creates `window.OmegaUtils`
5. **Futuristic UI system** loaded:
   - `futuristic-customizer.js`
   - `terminal-theme-bridge.js`
   - `futuristic-welcome-screen-new.js`
   - `futuristic-dashboard-transform.js`
6. **UI components** loaded:
   - `svg-icons-replacement.js`
   - `omega-symbol-logo.js`
7. **Sound effects** loaded:
   - `omega-sound-effects.js`
8. **CSS stylesheets** loaded (40+ files)
9. **Plugins** loaded (22 files)
10. **Command modules** loaded (27 files)
11. **Terminal core** loaded:
    - `terminal-core.js` - Creates `window.OmegaMinerTerminal` class
    - `wallet.js` - Creates `window.OmegaWallet`
12. **Initialization script** loaded:
    - `init.js` - Creates terminal instance

### Phase 2: DOM Ready (`init.js`)
1. **DOMContentLoaded** event fires
2. **Terminal instance created**:
   ```javascript
   window.terminal = new OmegaMinerTerminal();
   ```
3. **Terminal initialization** (`terminal.init()`):
   - Shows boot animation (3 seconds)
   - Sets up event listeners
   - Ensures command input visible
   - Loads ethers library
   - Shows wallet choice prompt
   - Checks NEAR wallet connection status

### Phase 3: Welcome Screen (`futuristic-welcome-screen-new.js`)
1. **Welcome screen created** (if futuristic mode):
   - Loading animation displayed
   - Progress bar animation
   - View mode selection (Basic Terminal vs Dashboard)
2. **View mode selection**:
   - User selects "Basic Terminal" or "Dashboard"
   - Selection stored in `localStorage.getItem("omega-view-mode")`
   - Welcome screen removed
   - Appropriate view initialized

### Phase 4: Dashboard Transform (`futuristic-dashboard-transform.js`)
**Only if Dashboard mode selected:**
1. **Transform function called** (`transformToDashboard()`):
   - Creates dashboard HTML structure
   - Creates sidebar with sections
   - Moves terminal into dashboard wrapper
   - Creates stats panel (right sidebar)
2. **Sidebar sections initialized**:
   - QUICK ACTIONS
   - CRYPTO NEWS
   - NFT EXPLORER
   - TRADING & ANALYTICS
   - PORTFOLIO TRACKER
   - NETWORK
   - TRANSACTIONS
   - CHAINGPT TOOLS
   - MUSIC PLAYER
   - YOUTUBE PLAYER
   - MINING & REWARDS
   - ADVANCED TRADING
   - ENTERTAINMENT & GAMES
3. **Section state restored** from localStorage:
   - `restoreMinimizedSections()` - Restores collapsed sections
   - Critical sections (mining-rewards, advanced-trading, entertainment) always expanded
4. **Event listeners attached**:
   - Section toggle buttons
   - Sub-action expandable buttons
   - Command execution buttons

### Phase 5: Command Input Ready
1. **Command input focused**:
   - `document.getElementById("commandInput")` focused
   - Event listener for Enter key attached
   - Command history initialized
   - Autocomplete initialized

---

## COMMAND SYSTEM ARCHITECTURE

### Command Registration Pattern
Commands are organized in `window.OmegaCommands` namespace:
```javascript
window.OmegaCommands = {
  Basic: { help, clear, theme, gui, ai, view, status, tab },
  Wallet: { connect, disconnect, balance, send, import, export, ... },
  Mining: { mine, claim, faucet, stats },
  API: { dexscreener, geckoterminal, defillama, chart, pgt },
  Entertainment: { rickroll, matrix, hack, disco, fortune, ascii },
  Remaining: { polymarket, hyperliquid, email, inbox, ens, ... },
  // ... more modules
};
```

### Command Execution Flow
1. **User types command** → `Enter` key pressed
2. **Event listener** (`terminal-core.js:1089`):
   ```javascript
   input.addEventListener("keypress", async (e) => {
     if (e.key === "Enter") {
       const command = e.target.value;
       await this.executeCommand(command);
     }
   });
   ```
3. **Command parsing** (`terminal-core.js:422`):
   ```javascript
   const args = OmegaUtils.parseCommandArgs(command);
   const cmd = args[0].toLowerCase();
   ```
4. **Special input states checked** (awaiting wallet choice, private key, etc.)
5. **Command routing** (`terminal-core.js:555-938`):
   ```javascript
   switch (cmd) {
     case "help":
       OmegaCommands.Basic.help(this);
       break;
     case "connect":
       await OmegaCommands.Wallet.connect(this);
       break;
     // ... more cases
     default:
       // AI mode or unknown command handler
   }
   ```
6. **Command handler execution**:
   - Command function receives `terminal` instance (this)
   - Command function receives `args` array
   - Command function logs output via `terminal.log()` or `terminal.logHtml()`

### Command Output Pattern
Commands use terminal logging methods:
```javascript
// Plain text
terminal.log("Message text", "info"); // Types: "info", "success", "error", "warning", "output"

// HTML content
terminal.logHtml('<div>HTML content</div>', "output");
```

### Command History
- Stored in `terminal.commandHistory` array (max 100)
- Accessed via Arrow Up/Down keys
- Persisted per terminal session (not localStorage)

---

## PLUGIN SYSTEM ARCHITECTURE

### Plugin Pattern
Plugins are self-contained modules that:
1. **Create UI panels** in the right sidebar (`.omega-stats`)
2. **Integrate external APIs** (YouTube, Spotify, News, etc.)
3. **Expose global namespace** for command integration
4. **Manage local state** (playlists, current track, etc.)
5. **Persist data** in localStorage

### Plugin Structure Example
```javascript
window.OmegaCustomMusicPlayer = {
  currentPlaylist: [],
  currentTrackIndex: -1,
  audioElement: null,
  
  createPanel: function() {
    // Creates panel HTML, appends to .omega-stats
    // Sets up event listeners
  },
  
  handleFileUpload: function(files) {
    // Processes uploaded files
    // Adds to playlist
    // Updates display
  },
  
  playTrack: function(index) {
    // Plays track at index
    // Updates UI
    // Handles audio events
  },
  
  // ... more methods
};
```

### Plugin Panel Integration
Panels are appended to `.omega-stats` (right sidebar):
```javascript
const rightPanel = document.querySelector('.omega-stats');
const panel = document.createElement('div');
panel.className = 'custom-music-player-panel';
panel.innerHTML = /* HTML */;
rightPanel.appendChild(panel);
```

### Plugin Command Integration
Commands call plugin methods:
```javascript
case "blues":
  await OmegaCommands.Blues.blues(this, args);
  break;

// In blues.js:
async function blues(terminal, args) {
  if (window.OmegaBluesPlayer) {
    window.OmegaBluesPlayer.createPanel();
  }
}
```

---

## UI/THEMING SYSTEM

### View Modes
1. **Basic Terminal Mode**:
   - Single terminal view
   - Minimal UI
   - Terminal header visible
   - No sidebar

2. **Dashboard Mode** (Futuristic):
   - Three-column grid layout
   - Left sidebar (quick actions)
   - Main terminal area
   - Right stats panel
   - Dashboard header with controls

### Dashboard Layout (`futuristic-theme.css`)
```css
.omega-dashboard {
  display: grid;
  grid-template-areas: "sidebar terminal stats";
  grid-template-columns: 280px 1fr 320px;
  grid-template-rows: 1fr;
}
```

### Theme System (`themes.js`)
- **Theme cycling**: Dark, Light, Matrix, Retro, PowerShell, Executive, Modern
- **Color palettes**: Red, Anime, Ocean, Forest, Sunset, Purple, Cyber, Gold, Ice, Fire
- **CSS Variables**: Theme colors stored in `:root` CSS variables
- **Persistence**: Theme stored in `localStorage.getItem("omega-terminal-theme")`

### Sidebar Structure
**Left Sidebar** (`.omega-sidebar`):
- Sections: QUICK ACTIONS, CRYPTO NEWS, NFT EXPLORER, etc.
- Expandable/collapsible sections
- Sub-actions for nested commands
- Section state persisted in localStorage

**Right Sidebar** (`.omega-stats`):
- Dynamic panels added by plugins
- Portfolio tracker panel
- Chart viewer panel
- Music players (Spotify, YouTube, Omega Player, Custom Music)
- News reader panel
- Perps viewer panel

### Section Minimization
- Sections can be minimized/expanded via toggle button
- State stored in `localStorage.getItem("omega-minimized-sections")`
- Critical sections always expanded by default:
  ```javascript
  const alwaysExpanded = ['mining-rewards', 'advanced-trading', 'entertainment'];
  ```

---

## STATE MANAGEMENT

### Global State Objects
1. **`window.terminal`** - Main terminal instance
   - Command history
   - Wallet connection state
   - Mining state
   - Input state flags (awaiting wallet choice, etc.)

2. **`window.OmegaConfig`** - Configuration
   - API URLs
   - Contract addresses
   - Available commands list
   - Theme options

3. **`window.OmegaWallet`** - Wallet state
   - Provider, signer, userAddress
   - Session wallet

4. **`window.OmegaCommands`** - Command modules namespace

5. **Plugin namespaces**:
   - `window.OmegaSpotify`
   - `window.OmegaYouTube`
   - `window.OmegaBluesPlayer`
   - `window.OmegaCustomMusicPlayer`
   - `window.OmegaNewsReader`
   - `window.OmegaPerpsViewer`
   - etc.

### localStorage Persistence
**Keys used**:
- `"omega-terminal-theme"` - Current theme
- `"omega-view-mode"` - Basic or futuristic
- `"omega-ai-provider"` - AI provider (off, near, openai)
- `"omega-gui-style"` - GUI style preference
- `"omega-minimized-sections"` - Minimized sidebar sections
- Plugin-specific keys (playlists, API keys, etc.)

---

## API INTEGRATION

### Relayer Pattern
**All external API calls go through relayer**:
- **Relayer URL**: `https://terminal-v1-5-9.onrender.com` (production)
- **Local relayer**: `http://localhost:3001` (development)
- **Purpose**: Avoid CORS issues, centralize API key management

### API Endpoints Structure
```javascript
// In config.js:
RELAYER_URL: "https://terminal-v1-5-9.onrender.com"

// Example API call:
fetch(`${OmegaConfig.RELAYER_URL}/api/kalshi/markets`)
  .then(res => res.json())
  .then(data => {
    // Process data
  });
```

### External APIs Integrated
1. **Kalshi API** - Prediction markets
2. **Polymarket API** - Prediction markets
3. **DexScreener API** - Token analytics
4. **DeFi Llama API** - DeFi TVL & protocols
5. **Magic Eden API** - Solana NFTs
6. **OpenSea API** - Ethereum NFTs
7. **ChainGPT API** - AI chat, NFT generation, smart contracts
8. **YouTube API** - Video playback
9. **Spotify API** - Music playback
10. **News APIs** - Crypto news aggregation

---

## DATA FLOW PATTERNS

### Command → API → Display
1. User types command (`kalshi markets`)
2. Command handler calls API (`fetch(relayerUrl + '/api/kalshi/markets')`)
3. API returns data (JSON)
4. Command handler formats data
5. Command handler calls `terminal.logHtml()` with formatted HTML
6. Terminal displays HTML in output area

### Wallet Connection Flow
1. User types `connect`
2. `OmegaCommands.Wallet.connect()` called
3. Checks for MetaMask (`window.ethereum`)
4. Requests connection (`provider.request({ method: 'eth_requestAccounts' })`)
5. Updates `OmegaWallet` state
6. Updates UI indicators
7. Logs success message

### Plugin Panel Lifecycle
1. User clicks sidebar button or types command
2. Plugin `createPanel()` called
3. Panel HTML created and appended to `.omega-stats`
4. Event listeners attached
5. Panel data loaded from localStorage (if exists)
6. Panel displayed
7. User interactions trigger plugin methods
8. Plugin state updated
9. State persisted to localStorage (if needed)

---

## KEY DEPENDENCIES & INTEGRATIONS

### External Libraries (CDN)
- **Ethers.js v5.7.2** - Ethereum blockchain interaction
- **Solana Web3.js v1.93.1** - Solana blockchain interaction
- **eth-crypto v2.1.2** - Cryptographic utilities

### Backend Services
- **Relayer Server** - API proxy, CORS handling
- **Omega Network RPC** - `https://0x4e454228.rpc.aurora-cloud.dev`
- **Block Explorer** - `https://0x4e454228.explorer.aurora-cloud.dev/`

### Smart Contracts
- **Miner Contract**: `0x54c731627f2d2b55267b53e604c869ab8e6a323b`
- **Faucet Contract**: `0xf8e00f8cfaccf9b95f703642ec589d1c6ceee1a9`
- **Miner Faucet**: `0x1c4ffffcc804ba265f6cfccffb94d0ae28b36207`
- **Mixer Contract**: `0xc57824b37a7fc769871075103c4dd807bfb3fd3e`

---

## CRITICAL IMPLEMENTATION DETAILS

### Command Input Handling
- **Cursor positioning**: Input uses invisible padding to force cursor to end
- **Autocomplete**: Tab key cycles through command matches
- **History**: Arrow Up/Down navigates command history
- **AI mode**: Unknown commands interpreted as natural language (if AI enabled)

### Panel Management
- **Panel stacking**: Multiple panels can be open in right sidebar
- **Panel closing**: Each panel has close button, removes from DOM
- **Panel persistence**: Some panels restore state from localStorage

### Wallet Provider Priority
- **MetaMask forced**: Phantom wallet blocked, MetaMask preferred
- **Provider detection**: Checks `window.ethereum.providers` array
- **Fallback**: Creates new Omega wallet if no external wallet found

### Error Handling
- **Global error handlers**: `window.addEventListener('error')` and `unhandledrejection`
- **Command error handling**: Try-catch in `executeCommand()` switch statement
- **API error handling**: Fetch errors caught, logged to terminal

### Performance Optimizations
- **Lazy loading**: Some plugins only load when needed
- **Event listener deduplication**: Flags prevent duplicate listeners
- **localStorage caching**: API responses cached where appropriate
- **Debouncing**: Some actions debounced to prevent excessive calls

---

## VERSION INFORMATION

**Current Version**: v2.0.1
**Version Location**: `config.js`, `terminal-core.js`, `init.js`
**Version Check**: Console logs version on initialization
**Cache Busting**: Version numbers in script URLs (`?v=2.0.1`)

---

## DEPLOYMENT

### Development
```bash
# Option 1: Python HTTP Server
python -m http.server 8000

# Option 2: Node.js HTTP Server
npx http-server -p 8000

# Option 3: npm script
npm run dev
```

### Production
- **Vercel**: Configured via `vercel.json`
- **Environment Variables**: Loaded via `api/env.js`
- **Cache Busting**: Version query strings in script tags

---

## NOTES FOR OPTIMIZATION

1. **Script Loading Order**: Critical - dependencies must load before dependents
2. **Event Listener Management**: Use flags to prevent duplicates (`dataset.listenerAttached`)
3. **localStorage Usage**: Check quota, handle errors gracefully
4. **API Rate Limiting**: Implement rate limiting for external APIs
5. **Memory Management**: Clean up event listeners, revoke Object URLs for audio files
6. **Error Boundaries**: Wrap critical sections in try-catch
7. **Code Splitting**: Consider dynamic imports for large plugins
8. **State Synchronization**: Ensure UI state matches localStorage state

---

**END OF ARCHITECTURE OUTLINE**

