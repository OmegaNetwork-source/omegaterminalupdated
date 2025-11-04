# OMEGA TERMINAL AI COMMAND GUIDE v3.0.0

## **Complete Command Reference for AI Decision Making**

## ðŸ“‹ PURPOSE

This documentation provides complete command context for AI agents to make accurate decisions when users interact with Omega Terminal. The AI must understand WHAT each command does, WHEN to use it, and HOW to respond to user queries.

**Version:** 3.0.0 - Enhanced Multi-Network Edition  
**Last Updated:** October 16, 2025  
**Environment:** Web-based Multi-Chain Terminal  
**New Features:** Multi-Network Connector, Portfolio Tracker, Live Charts, Quick Actions

---

## ðŸ†• V3.0.0 FEATURE HIGHLIGHTS

**What's New in v3.0.0:**
- Ã°Å¸Å’ **Multi-Network Wallet Connector** - Connect to 8 blockchains (Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Omega, Solana)
- Ã°Å¸'Â° **Enhanced PGT Portfolio Tracker** - Auto-network detection, real blockchain data, asset breakdowns
- Ã°Å¸"Ë† **Live Chart Viewer** - TradingView charts in right panel for any cryptocurrency
- Ã°Å¸Å½Â¯ **Expandable Quick Actions** - Visual command alternatives with sub-menus
- Ã°Å¸Å½Â¨ **AI Visual Effects** - Rainbow hue animation when AI mode is active
- Ã°Å¸"Å  **Real Network Logos** - Professional branding from CoinGecko API

---

## ðŸš€ QUICK COMMAND REFERENCE

### Most Common User Requests

| User Request | AI Command | Category |
|--------------|------------|----------|
| "Connect wallet" | `connect` | Multi-Network |
| "Show Bitcoin chart" | `chart BTC` | Charts |
| "Track this wallet 0x..." | `pgt track 0x...` | Portfolio |
| "What's my portfolio?" | `pgt portfolio` | Portfolio |
| "What's trending?" | `polymarket trending` | Markets |
| "Check balance" | `balance` | Wallet |
| "Buy SOL tokens" | `solana buy` | Trading |
| "Show NFT marketplace" | `nft marketplace` | NFT |
| "Clear screen" | `clear` | System |
| "Show help" | `help` | System |

---

## ðŸ§  AI DECISION FRAMEWORK

When a user makes a request, analyze their intent and map it to the correct command category:

###User Intent Categories

**WALLET MANAGEMENT** â†’ Use wallet commands (connect, balance, disconnect)  
**PORTFOLIO TRACKING** â†’ Use PGT commands (pgt track, pgt portfolio, pgt wallets) â­ NEW  
**CHART VISUALIZATION** â†’ Use chart command (chart <symbol>) â­ NEW  
**TOKEN TRADING** â†’ Use trading commands (solana, near, eclipse + swap/quote subcommands)  
**MARKET ANALYSIS** â†’ Use analytics commands (dexscreener, polymarket, geckoterminal)  
**PRIVACY OPERATIONS** â†’ Use mixer commands for anonymous transactions  
**GAMING/ENTERTAINMENT** â†’ Use games, arcade, or entertainment commands  
**DATA & RESEARCH** â†’ Use Python, analytics, or data fetching commands  
**COMMUNICATION** â†’ Use messaging, email, or social commands  
**SYSTEM OPERATIONS** â†’ Use utility commands (help, clear, status, theme)

---

## ðŸŒ OMEGA TERMINAL CAPABILITIES

**Multi-Chain Wallet System:** Supports 8 networks - Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Omega Network, Solana â­ ENHANCED  
**Trading Networks:** Jupiter (Solana), Near Intents (Cross-chain), Solar DEX (Eclipse)  
**Analytics Integration:** DexScreener, CoinGecko, DeFiLlama, Polymarket prediction markets  
**Portfolio Tracking:** Real-time multi-chain wallet tracking with asset breakdowns â­ NEW  
**Chart Viewer:** TradingView integration for live price charts â­ NEW  
**Privacy Features:** Omega Mixer for anonymous transactions  
**Gaming Platform:** 9+ integrated games with scoring and leaderboards  
**Python Runtime:** Full Python execution environment with trading libraries  
**Social Features:** Encrypted messaging, ENS/ONS names, profile management  
**Developer Tools:** Network testing, stress testing, API integrations  
**AI Integration:** Maintains chat history for context-aware interactions  
**Quick Actions:** Visual command alternatives with expandable sub-menus â­ NEW

---

## âš ï¸ CRITICAL: MULTI-NETWORK DISAMBIGUATION (v3.0.0 UPDATED)

**BEFORE executing ANY wallet/trading command, determine which network the user wants:**

**When user says "connect wallet" â†’ EXPLAIN:**  
"I'll open the network selector. You can choose from 8 networks:
- EVM Networks (MetaMask): Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Omega
- Solana (Phantom wallet)

Which network would you like to use?"

**When user says "swap tokens" â†’ ASK:**  
"Which network for token swapping?
1. Solana (Jupiter) - SPL tokens like BONK, WIF, PEPE
2. Near (Cross-chain) - Bridge between networks
3. Eclipse (Solar DEX) - SVM tokens on Eclipse network"

**When user says "check balance" â†’ EXPLAIN:**  
"I'll show balances across all connected networks: Current network balance plus any tracked portfolios."

---

## ðŸŒ MULTI-NETWORK WALLET CONNECTION SYSTEM â­ NEW

### Understanding Multi-Network Context (v3.0.0)

Omega Terminal v3.0.0 introduced a unified multi-network wallet connection system supporting 8 different blockchain networks through a single `connect` command with visual network selection.

### Core Multi-Network Command

#### `connect` - Multi-Network Wallet Connection (ENHANCED)

**Description:** Opens visual network selector modal allowing users to connect to 8 different blockchain networks (7 EVM + Solana)

**Purpose:** Unified wallet connection across multiple blockchains with automatic network switching and configuration

**When to Use:**
- User wants to connect any wallet (MetaMask or Phantom)
- User asks "connect to [network name]"
- User mentions "connect wallet" without specifying network
- User wants to switch between different blockchain networks
- User needs to access multi-chain features

**What Happens:**
1. Opens beautiful modal with network selection grid
2. Displays 8 networks with real logos (from CoinGecko API)
3. User clicks desired network
4. MetaMask (EVM) or Phantom (Solana) prompts for connection
5. Auto-switches to selected network or adds it to wallet
6. Shows wallet balance immediately
7. Updates header with network logo and address
8. Connection status changes to "CONNECTED" with green indicator

**Supported Networks:**

**EVM Networks (via MetaMask):**
1. **Ethereum** - Chain ID: 1, Currency: ETH
2. **BNB Smart Chain** - Chain ID: 56, Currency: BNB
3. **Polygon** - Chain ID: 137, Currency: MATIC
4. **Arbitrum One** - Chain ID: 42161, Currency: ETH
5. **Optimism** - Chain ID: 10, Currency: ETH
6. **Base** - Chain ID: 8453, Currency: ETH
7. **Omega Network** - Chain ID: 1314545192, Currency: OMEGA

**Non-EVM Networks:**
8. **Solana** - Via Phantom wallet, Currency: SOL

**Network Features:**
- Auto-network detection (checks current MetaMask network)
- Auto-network switching (changes to selected network)
- Auto-network adding (adds network to MetaMask if not configured)
- Real network logos (loaded from CoinGecko CDN)
- Balance display after connection
- Header indicator with logo and wallet address

**Visual Network Selector:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸŒ SELECT NETWORK                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  âŸ  EVM NETWORKS                    â”‚
â”‚  [ETH] [BNB] [MATIC] [ARB]         â”‚
â”‚  [OP]  [BASE] [OMEGA]              â”‚
â”‚                                    â”‚
â”‚  â—Ž SOLANA                          â”‚
â”‚  [SOL]                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**AI Decision Logic:**

**User Says:** â†’ **AI Should:**
- "Connect wallet" â†’ `connect` + "You'll see 8 networks including Ethereum, Solana, Polygon, and more"
- "Connect to Ethereum" â†’ `connect` + "Select Ethereum from the network modal"
- "Connect MetaMask" â†’ `connect` + "Choose any EVM network"
- "Connect Phantom" â†’ `connect` + "Select Solana"
- "Switch to Polygon" â†’ `connect` + "Select Polygon to switch networks"

**After Connection Success:**
- Terminal shows: Network name, currency, wallet address, balance
- Header updates: Green "CONNECTED" status, network logo, short address
- User can now use network-specific commands

**AI INSTRUCTION:** Use command `connect`

**Example AI Response:**
"I'll open the network selector for you. You can choose from 8 networks including Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Omega Network, and Solana. Select your preferred network and approve the connection in your wallet."

---

## ðŸ’° PGT PORTFOLIO TRACKER SYSTEM â­ ENHANCED

### Understanding PGT Portfolio Context (v3.0.0)

PGT (PlayGround Tools) Portfolio Tracker is a real-time multi-chain wallet tracking system that fetches actual blockchain data and displays portfolio value, 24h changes, and asset breakdowns.

**Key Features in v3.0.0:**
- Simplified commands (network auto-detection)
- Real blockchain data (no demo/fake data)
- Multi-RPC fallback system (ethers.js)
- Asset-level breakdown display
- Right panel integration
- Auto-refresh every 60 seconds
- localStorage persistence

### Core PGT Commands

#### `pgt track <address>` - Track Wallet with Auto-Network Detection

**Description:** Tracks a blockchain wallet and displays real-time portfolio value with detailed asset breakdown

**Purpose:** Monitor wallet holdings across multiple blockchains automatically

**Usage:** `pgt track <wallet_address>`

**Arguments:**
- `<address>`: Wallet address (network auto-detected)
- Network parameter is OPTIONAL (auto-detected from address format)

**When to Use:**
- User provides a wallet address to track
- User says "track this wallet"
- User wants to monitor portfolio value
- User asks "add wallet to portfolio"
- User wants to see holdings for an address

**What Happens:**
1. Auto-detects network from address format:
   - `0x` + 42 chars â†’ Ethereum/EVM
   - 32-44 Base58 chars â†’ Solana
   - `.near` suffix â†’ NEAR
   - `bnb` prefix â†’ BSC
2. Fetches real balance from blockchain RPCs:
   - Ethereum: Uses ethers.js with LlamaRPC, Ankr, PublicNode, BlastAPI fallbacks
   - Solana: Uses Solana RPC + CoinGecko
3. Gets current token prices from CoinGecko API
4. Calculates total portfolio value in USD
5. Computes 24h change percentage
6. Stores wallet in browser localStorage
7. Updates right panel stats (Total Value, 24h Change, Wallet Count)
8. Shows detailed asset breakdown in terminal
9. Auto-refreshes every 60 seconds

**Terminal Output Format:**
```
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
âœ… Wallet tracked successfully!
Address: 0xBB07d617cF64A64F96b29f3f3B65cd741C2C51FC
Network: ethereum
ðŸ” Auto-detected network: ethereum

ðŸ“Š Wallet Data:
   Portfolio Value: $146,712.86
   24h Change: -3.59%
   
   ðŸ’Ž Assets Held:
      â€¢ ETH: 36.8536 tokens
        Value: $146,712.86 (@ $3,980.96 each)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
ðŸ’¡ Tip: Use 'pgt portfolio' to see full details
ðŸ’¡ Right panel updates automatically every 60 seconds
```

**Right Panel Updates:**
- Total Portfolio Value: $146,712.86 (green, glowing text)
- 24h Change: -3.59% (red for negative, green for positive)
- Wallets Tracked: 1

**AI Decision Logic:**
- If address starts with `0x` and 42 chars â†’ "I'll track this Ethereum wallet"
- If Solana Base58 format â†’ "I'll track this Solana wallet"
- If contains `.near` â†’ "I'll track this NEAR wallet"
- If invalid format â†’ "This doesn't appear to be a valid wallet address. Please provide a valid Ethereum (0x...), Solana, or NEAR address."

**AI INSTRUCTION:** Use command `pgt track <address>` (network auto-detected, no manual network parameter needed)

**Example AI Response:**
"I'll track this Ethereum wallet for you. The system will fetch the current balance from the blockchain and display the portfolio value with a detailed asset breakdown. You'll see the total value in the right panel, and it will auto-refresh every 60 seconds."

#### `pgt portfolio` or `pgt p` - View Complete Portfolio Summary

**Description:** Displays comprehensive portfolio summary with total value, 24h change, and detailed asset breakdowns for all tracked wallets

**Purpose:** Show aggregated portfolio value across all tracked wallets

**Usage:** `pgt portfolio` or `pgt p`

**When to Use:**
- User asks "what's my portfolio worth?"
- User wants to see all holdings
- User says "show my total value"
- User asks "how much crypto do I have?"
- User wants complete portfolio overview

**What Happens:**
1. Retrieves all tracked wallets from localStorage
2. Fetches current balance for each wallet from blockchain
3. Aggregates total portfolio value
4. Calculates weighted 24h change percentage
5. Shows detailed breakdown per wallet
6. Displays individual asset details for each wallet
7. Shows last updated timestamp

**Terminal Output Format:**
```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘         PORTFOLIO SUMMARY             â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

ðŸ’° Total Portfolio Value: $146,712.86
ðŸ“Š 24h Change: -3.59% (-$5,263.31)
ðŸ‘› Wallets Tracked: 1

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
WALLET #1: 0xBB07...51FC (ethereum)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
Value: $146,712.86
24h Change: -3.59%

ðŸ’Ž Assets:
  â€¢ ETH: 36.8536 tokens
    Value: $146,712.86 (@ $3,980.96 each)
    
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

**AI INSTRUCTION:** Use command `pgt portfolio` or `pgt p`

**Example AI Response:**
"Here's your complete portfolio summary across all tracked wallets. You have a total value of $146,712.86 across 1 wallet, with detailed asset breakdowns for each holding."

#### `pgt wallets` or `pgt list` - List All Tracked Wallets

**Description:** Shows list of all currently tracked wallets with addresses, networks, and current values

**Purpose:** View which wallets are being monitored

**Usage:** `pgt wallets` or `pgt list`

**When to Use:**
- User asks "which wallets am I tracking?"
- User wants to see tracked addresses
- User needs to identify wallet for removal
- User wants quick overview

**What Happens:**
- Lists all wallets from localStorage
- Shows address (shortened), network, current value
- Displays last update timestamp
- Color-coded by network

**AI INSTRUCTION:** Use command `pgt wallets`

#### `pgt remove <address>` - Remove Tracked Wallet

**Description:** Removes a wallet from portfolio tracking

**Purpose:** Stop monitoring a specific wallet

**Usage:** `pgt remove <address>`

**Arguments:**
- `<address>`: Wallet address to remove (network auto-detected)

**When to Use:**
- User wants to stop tracking a wallet
- User says "remove this wallet" or "untrack wallet"
- User needs to clean up portfolio

**What Happens:**
- Auto-detects network from address format
- Removes wallet from localStorage
- Recalculates portfolio stats
- Updates right panel display
- Confirms removal in terminal

**AI INSTRUCTION:** Use command `pgt remove <address>`

#### `pgt refresh` - Refresh Portfolio Data

**Description:** Manually refreshes all tracked wallets with latest blockchain data

**Purpose:** Update portfolio with current balances and prices

**Usage:** `pgt refresh`

**When to Use:**
- User wants latest data immediately
- User says "update my portfolio"
- User needs current prices
- User wants to force refresh

**What Happens:**
- Re-fetches all wallet balances from blockchain RPCs
- Updates token prices from CoinGecko
- Recalculates total portfolio value
- Updates right panel display
- Shows refresh timestamp in terminal

**AI INSTRUCTION:** Use command `pgt refresh`

**PGT System Technical Details:**
- âœ… Auto-network detection (ETH, SOL, NEAR, BSC)
- âœ… Real blockchain data via ethers.js + public RPCs
- âœ… Multiple RPC fallbacks (LlamaRPC, Ankr, PublicNode, BlastAPI)
- âœ… localStorage persistence (survives page refresh)
- âœ… Asset-level breakdown with prices
- âœ… Auto-refresh every 60 seconds
- âœ… Right panel live stats display
- âœ… No API key required
- âœ… No demo data - 100% real blockchain data

**Quick Actions Integration:**
Left sidebar "Track Wallet" button (expandable) with sub-actions:
- â†’ Track New Wallet (prompts for address, executes `pgt track`)
- â†’ View Portfolio (executes `pgt portfolio`)
- â†’ List Wallets (executes `pgt wallets`)
- â†’ Refresh Data (executes `pgt refresh`)

---

## ðŸ“ˆ LIVE CHART VIEWER SYSTEM â­ NEW FEATURE

### Understanding Chart Viewer Context

The Live Chart Viewer displays real-time cryptocurrency price charts in the right sidebar panel using TradingView's free embedded widgets. No API key required.

#### `chart <symbol>` - Display Live Price Chart

**Description:** Loads and displays a live, interactive price chart for any cryptocurrency in the right sidebar panel

**Purpose:** Provide visual price analysis and market context for trading and investment decisions

**Usage:** `chart <symbol>`

**Arguments:**
- `<symbol>`: Cryptocurrency symbol (BTC, ETH, SOL, DOGE, MATIC, etc.)

**When to Use:**
- User asks "show me a chart"
- User says "Bitcoin price chart" or "[token] chart"
- User wants visual price analysis
- User mentions "what does [token] look like?"
- User asks "can I see a graph?"
- User wants to analyze price movements or trends
- User is researching before trading

**What Happens:**
1. Opens chart panel in right sidebar (below Portfolio Tracker panel)
2. Converts symbol to uppercase (BTC, ETH, SOL, etc.)
3. Maps symbol to Binance trading pair (SYMBOL/USDT)
4. Loads TradingView embedded widget with dark theme
5. Displays interactive area chart
6. Shows symbol label (e.g., "BTC/USD")
7. Terminal confirms chart loaded
8. Chart remains visible until user closes it or loads new chart

**Supported Symbols:**
- âœ… ALL major cryptocurrencies (1000+ symbols available)
- âœ… Bitcoin (BTC), Ethereum (ETH), Solana (SOL)
- âœ… BNB, MATIC, AVAX, DOT, LINK, UNI, AAVE, ATOM
- âœ… Memecoins: DOGE, SHIB, PEPE, FLOKI, BONK
- âœ… Any token traded on Binance exchange

**Chart Features:**
- Real-time TradingView data (professional trading platform)
- Interactive controls (zoom, pan, different timeframes)
- Dark theme matching terminal aesthetic
- Cyan color scheme (matches terminal colors)
- Area chart with gradient fill
- Price and percentage change display
- 280px height (perfect fit in stats panel)
- Close button for dismissing chart

**Visual Display in Right Panel:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“ˆ CHART              [âœ•]  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚        BTC/USD              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚  [TradingView Chart]    â”‚ â”‚
â”‚ â”‚  Interactive, Real-time â”‚ â”‚
â”‚ â”‚  280px height           â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Chart Styling:**
- Line Color: Cyan `rgba(0, 212, 255, 1)`
- Fill Gradient: Cyan top to transparent bottom
- Grid Lines: Subtle cyan
- Background: Transparent (shows terminal theme)
- Font: Courier New (monospace, matches terminal)
- Theme: Dark mode

**Closing Chart:**
- User clicks X button in chart panel title
- Chart panel hides
- Panel can be re-opened with new symbol

**AI Decision Logic:**

**User Says:** â†’ **AI Uses:**
- "Show Bitcoin chart" â†’ `chart BTC`
- "ETH price graph" â†’ `chart ETH`
- "Solana chart please" â†’ `chart SOL`
- "What does Dogecoin look like?" â†’ `chart DOGE`
- "Can I see a chart for MATIC?" â†’ `chart MATIC`
- "Graph SHIB" â†’ `chart SHIB`
- "Price chart for Polygon" â†’ `chart MATIC`

**Quick Actions Integration:**
Left sidebar "Live Charts" button (expandable) with sub-actions:
- â†’ Bitcoin Chart (executes `chart BTC`)
- â†’ Ethereum Chart (executes `chart ETH`)
- â†’ Solana Chart (executes `chart SOL`)
- â†’ Custom Chart (prompts for symbol, executes `chart <input>`)

**AI INSTRUCTION:** Use command `chart <symbol>`

**Example AI Responses:**

**Simple Request:**
```
User: "Show me BTC chart"
AI: [Executes: chart BTC]
"Here's the live Bitcoin price chart in the right panel! The chart shows real-time data from TradingView with interactive controls for zooming and panning."
```

**With Trading Context:**
```
User: "I'm thinking about buying Ethereum, can I see how it's doing?"
AI: [Executes: chart ETH]
"Here's the live Ethereum price chart. You can see recent price movements and trends. The chart is interactive - you can zoom in/out to check different timeframes. Would you also like to see detailed analytics with `dexscreener ETH`?"
```

**Multiple Symbols:**
```
User: "Show me charts for BTC and ETH"
AI: [Executes: chart BTC]
"I've loaded the Bitcoin chart in the right panel. Note that only one chart can be displayed at a time. After reviewing BTC, would you like me to switch to Ethereum with `chart ETH`?"
```

**Command Help (if user types `chart` without symbol):**
```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘          LIVE CHART VIEWER            â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

Usage: chart <symbol>

Examples:
  chart BTC    - Bitcoin chart
  chart ETH    - Ethereum chart
  chart SOL    - Solana chart
  chart MATIC  - Polygon chart

ðŸ’¡ Chart will appear in the right panel
```

**Technical Details:**
- Provider: TradingView (free embeddable widgets)
- No API key required
- Real-time professional data
- 1-hour interval default
- Works for all Binance-listed trading pairs
- Loads in iframe (no CORS issues)
- Mobile responsive

**Important Notes:**
- One chart visible at a time (new chart replaces previous)
- Chart persists until closed or replaced
- Close button always visible (X in top-right)
- Smooth animations on open/close
- Matches terminal's futuristic glassmorphism theme

---

## ðŸŽ¯ QUICK ACTIONS SYSTEM â­ NEW

### Understanding Quick Actions Context

Quick Actions are one-click buttons in the left sidebar that provide visual alternatives to typing commands. They feature expandable sub-menus and user input prompts.

### When AI Should Mention Quick Actions

**User Intent Signals:**
- User asks "how do I...?" or "what's the easiest way?"
- User seems unfamiliar with command syntax
- User struggles with typing commands
- User asks for "visual option" or "button to click"
- User is new to the terminal

**AI Response Pattern (Always provide BOTH options):**
"You can type `chart BTC` in the terminal, or click 'Live Charts' in the left sidebar and select 'Bitcoin Chart' for a visual option."

### Quick Actions Structure

**Left Sidebar Categories:**

#### **WALLET ESSENTIALS**
- **System Help** â†’ Executes `help` command
- **Connect Wallet** â†’ Opens multi-network selector modal
- **Check Balance** â†’ Executes `balance` command
- **Claim Faucet** â†’ Executes `faucet` command

#### **TRADING & ANALYTICS**

**Live Charts** (Expandable) â†’
- â†’ Bitcoin Chart â†’ Executes `chart BTC`
- â†’ Ethereum Chart â†’ Executes `chart ETH`
- â†’ Solana Chart â†’ Executes `chart SOL`
- â†’ Custom Chart â†’ Prompts for symbol, executes `chart <user_input>`

**Market Analytics** (Expandable) â†’
- â†’ BTC Analytics â†’ Executes `dexscreener BTC`
- â†’ ETH Analytics â†’ Executes `dexscreener ETH`
- â†’ SOL Analytics â†’ Executes `dexscreener SOL`
- â†’ Custom Token â†’ Prompts for symbol, executes `dexscreener <user_input>`

**DeFi Llama** â†’ Executes `defillama` command

#### **PORTFOLIO TRACKER**

**Track Wallet** (Expandable) â†’
- â†’ Track New Wallet â†’ Prompts for address, executes `pgt track <address>`
- â†’ View Portfolio â†’ Executes `pgt portfolio`
- â†’ List Wallets â†’ Executes `pgt wallets`
- â†’ Refresh Data â†’ Executes `pgt refresh`

#### **NFT & WEB3**

**NFT Tools** (Expandable) â†’
- â†’ NFT Explorer â†’ Executes `nft` command
- â†’ Trending NFTs â†’ Executes `opensea trending`

**Solana Tools** (Expandable) â†’
- â†’ Wallet Info â†’ Executes `solana wallet`
- â†’ Check Balance â†’ Executes `solana balance`

#### **SYSTEM**
- **Toggle AI** â†’ Toggles AI mode ON/OFF (visual rainbow animation when ON)
- **Clear Terminal** â†’ Executes `clear` command

### Expandable Quick Actions Behavior

**How Expandable Menus Work:**
1. User clicks main button with arrow (â–¼) icon
2. Sub-menu slides down with smooth animation (0.3s)
3. Other open menus auto-close (only one expandable open at a time)
4. User clicks sub-action to execute command or show prompt
5. Click main button again to collapse menu

**Visual Indicators:**
- Arrow icon (â–¼) indicates expandable button
- Arrow rotates 180Â° when menu is expanded
- Sub-actions indented with cyan left border
- Hover effects with glow and slide animation
- Expandable button gets highlighted when open

**AI should mention Quick Actions when:**
- User is struggling with command syntax
- User asks "easier way" or "how else can I..."
- User is new and learning the terminal
- User prefers visual interfaces

**AI INSTRUCTION:** Suggest quick actions as user-friendly alternatives

**Example AI Response:**
"You can type `pgt track <address>` in the terminal, or for an easier visual option, click the 'Track Wallet' button in the left sidebar, then select 'Track New Wallet' and enter the address when prompted."

---

## ðŸŽ¨ RIGHT PANEL STATS DISPLAY

### Understanding Right Panel Context

The right sidebar displays real-time statistics in multiple panels that appear/hide based on activity:

**Panel 1: SYSTEM INFO** (Always Visible)
- Commands Run: Count of executed commands this session
- Uptime: Terminal session duration (HH:MM:SS format)
- Status: OPERATIONAL (system health indicator)

**Panel 2: PORTFOLIO TRACKER** (Visible when wallets tracked)
- Total Value: Aggregated portfolio value in USD (green, glowing)
- 24h Change: Percentage change (green if positive, red if negative)
- Wallets: Count of tracked wallets

**Panel 3: ðŸ“ˆ CHART** (Visible when chart command used)
- Chart Title: "ðŸ“ˆ CHART" with close button (X)
- Symbol Display: Shows current symbol (e.g., "BTC/USD")
- Live Chart: TradingView widget (280px height, interactive)

**Layout:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ SYSTEM INFO  â”‚
â”‚ Commands: 15 â”‚
â”‚ Uptime: 5:32 â”‚
â”‚ Status: OK   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ PORTFOLIO    â”‚ â† Hidden until wallet tracked
â”‚ Value: $147K â”‚
â”‚ Change: -2%  â”‚
â”‚ Wallets: 1   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ“ˆ CHART     â”‚ â† Hidden until chart command
â”‚  BTC/USD     â”‚
â”‚ [Live Chart] â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**AI should mention right panel when:**
- User tracks a wallet â†’ "Check the right panel for your portfolio value"
- User views a chart â†’ "The chart appears in the stats panel on the right"
- User asks "where do I see..." â†’ Direct to right panel

---

##Ã°Å¸'Â¬ HEADER STATUS INDICATORS

### Connection Status Display

The terminal header shows real-time status indicators that update based on user actions:

**Header Elements:**

1. **Connection Status**
   - INITIALIZING (gray text, gray dot) â†’ On page load
   - CONNECTED (green text, green glowing dot) â†’ After wallet connection
   - DISCONNECTED (gray text, gray dot) â†’ After disconnect command

2. **Wallet Display**
   - NO WALLET â†’ When not connected
   - [Network Logo] 0x123...5678 â†’ When connected
   - Shows real 20px network logo
   - Shows shortened wallet address (first 6 + last 4 characters)

3. **AI Toggle Button**
   - AI: OFF â†’ Static appearance
   - AI: ON â†’ Rainbow hue-shifting animation (3s cycle) + dual-color glow

**AI should understand:**
- Header reflects current connection state
- Network logo shows active blockchain
- Wallet address confirms connection
- Green indicator means wallet ready
- Rainbow animation shows AI is active
- Status updates happen in real-time

---



## â›ï¸ MINING COMMANDS

#### `mine`
**Description:** Initiates the mining process for OMEGA tokens  
**Purpose:** Start mining session to earn OMEGA tokens on the Omega network  
**Arguments:** None  
**Network:** EVM (Omega)  
**Usage:** `mine`
**AI INSTRUCTION:** Use command `mine`

#### `claim`
**Description:** Claims mining rewards for the connected wallet  
**Purpose:** Collect earned mining rewards  
**Network:** EVM (Omega)  
**Usage:** `claim`
**AI INSTRUCTION:** Use command `claim`

#### `stats`
**Description:** Shows mining and session statistics  
**Purpose:** Provide insights into mining performance and session details  
**Arguments:** None  
**Usage:** `stats`
**AI INSTRUCTION:** Use command `stats`

#### `fund <address>`
**Description:** Funds the mining wallet  
**Arguments:** - `<address>`: The address to fund  
**Usage:** `fund 0x123...`
**AI INSTRUCTION:** Use command `fund <address>`

---

## ðŸ“› NAME SERVICE COMMANDS

### Omega Name Service (ONS)

#### `ens <subcommand> <name>`
**Description:** Handles Omega Name Service (ONS) operations, including registration, resolution, and search  
**Purpose:** Simplifies address management and improves UX by allowing users to register, resolve, and search for ONS names  

**Subcommands & Arguments:**
- `register <name>`: Registers a new ONS name for the connected wallet
  - `<name>`: The ONS name to register (e.g., `myname.omega`)
- `resolve <name>`: Resolves an ONS name to its associated Omega address
  - `<name>`: The ONS name to resolve
- `search <name>`: Searches for ONS names matching the query
  - `<name>`: The search query (partial or full name)

**Network:** Omega Network  
**Usage:**
``
ens register myname.omega
ens resolve alice.omega
ens search omega
``
**AI INSTRUCTION:** Use command `ens <subcommand> <name>`

---

## ðŸ”’ PRIVACY COMMANDS

### Omega Mixer

#### `mixer <subcommand>`
**Description:** Interacts with the Omega Mixer contract for privacy transactions  

**Subcommands:**
- `help`: Shows mixer help and usage instructions
- `deposit`: Starts a deposit flow. Prompts for secret and commitment
- `deposit-execute`: Starts deposit and executes via MetaMask. Prompts for amount
- `deposit-direct <privateKey> <amount>`: Direct deposit with private key and amount
- `withdraw <secret> <address>`: Starts a withdrawal flow
- `withdraw-direct <privateKey> <secret> <address>`: Direct withdrawal

**Usage:**
``
mixer deposit-direct 0xabc... 0.1
mixer withdraw-direct 0xabc... mysecret 0x123...
``
**AI INSTRUCTION:** Use command `mixer <subcommand>`
