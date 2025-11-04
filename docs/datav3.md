# OMEGA TERMINAL AI COMMAND GUIDE

## **Complete Command Reference for AI Decision Making**

## 🎯 PURPOSE

This documentation provides complete command context for AI agents to make accurate decisions when users interact with Omega Terminal. The AI must understand WHAT each command does, WHEN to use it, and HOW to respond to user queries.

**Version:** 2.0.1 - Standalone AI Training Guide  
**Last Updated:** October 14, 2025  
**Environment:** Web-based Multi-Chain Terminal## 🤖 AI DECISION FRAMEWORK

When a user makes a request, analyze their intent and map it to the correct command category:

### User Intent Categories

**WALLET MANAGEMENT** → Use wallet commands (connect, balance, disconnect)  
**TOKEN TRADING** → Use trading commands (solana, near, eclipse + swap/quote subcommands)  
**MARKET ANALYSIS** → Use analytics commands (dexscreener, polymarket, geckoterminal)  
**PRIVACY OPERATIONS** → Use mixer commands for anonymous transactions  
**GAMING/ENTERTAINMENT** → Use games, arcade, or entertainment commands  
**DATA & RESEARCH** → Use Python, analytics, or data fetching commands  
**COMMUNICATION** → Use messaging, email, or social commands  
**SYSTEM OPERATIONS** → Use utility commands (help, clear, status, theme)

## 🌐 OMEGA TERMINAL CAPABILITIES

**Multi-Chain Wallet System:** Supports EVM (Omega Network), Solana, Eclipse, NEAR, Hyperliquid  
**Trading Networks:** Jupiter (Solana), Near Intents (Cross-chain), Solar DEX (Eclipse)  
**Analytics Integration:** DexScreener, CoinGecko, DeFiLlama, Polymarket prediction markets  
**Privacy Features:** Omega Mixer for anonymous transactions on Omega Network  
**Gaming Platform:** 9+ integrated games with scoring and leaderboards  
**Python Runtime:** Full Python execution environment with trading libraries  
**Social Features:** Encrypted messaging, ENS/ONS names, profile management  
**Developer Tools:** Network testing, stress testing, API integrations  
**AI Integration:** Maintains chat history for context-aware AI interactions

### 🧠 AI Chat History System

The terminal maintains a comprehensive chat history object (`chatHistory = []`) that tracks all user interactions for AI context:

**Chat History Structure:**

- **User Input:** `{ type: "user", message: command }`
- **AI Response:** `{ type: "ai", message: response }`
- **Command Execution:** `{ type: "command", command: commandArray }`
- **System Output:** `{ type: "result", output: cleanText, logType: type }` - **NOT conversation content** but the actual results/outcomes of command executions performed by either the AI agent or user

**Purpose:** Provides you with full conversation context including user commands, system responses, and execution results. This enables context-aware assistance and better error handling.

## 🎯 AI COMMAND GUIDANCE

### How AI Should Recommend Commands

When users request actions, recommend the appropriate command name:

**Examples:**

- User: "Show my balance" → AI recommends: `balance`
- User: "Find BONK token on Solana" → AI recommends: `solana search bonk`
- User: "Show political prediction markets" → AI recommends: `polymarket politics`

### What Users See After Commands

Commands display results directly in the terminal:

- **Success messages** (green text)
- **Error messages** (red text)
- **Data displays** (formatted tables, cards, charts)
- **Interactive elements** (buttons, links, copy functions)

## ⚠️ CRITICAL: MULTI-NETWORK DISAMBIGUATION

**BEFORE executing ANY trading/wallet command, determine which network the user wants:**

**When user says "swap tokens" → ASK:**  
"Which network for token swapping?

1. Solana (Jupiter) - SPL tokens like BONK, WIF, PEPE
2. Near (Cross-chain) - Bridge between networks
3. Eclipse (Solar DEX) - SVM tokens on Eclipse network"

**When user says "check balance" → EXPLAIN:**  
"I'll show balances across all connected networks: Omega (OMEGA tokens), Solana (SOL), Eclipse (SVM), and NEAR"

**When user says "connect wallet" → ASK:**  
"Which wallet to connect?

1. MetaMask (for Omega Network)
2. Phantom (for Solana)
3. NEAR Wallet (for NEAR Protocol)
4. Or create new Omega Wallet"

---

## 💰 WALLET & CONNECTION COMMANDS

## User Intent: "Connect my wallet" / "Set up wallet" / "I need a wallet"

### `connect`

**WHEN TO USE:** User wants to connect their existing MetaMask wallet OR needs to create a new wallet  
**WHAT HAPPENS:**

1. Checks if MetaMask is installed
2. If MetaMask exists: Prompts connection to Omega Network
3. If no MetaMask: Offers to create new Omega Wallet
4. Shows connection status and wallet address

**DECISION LOGIC:**

- User has MetaMask → Connects to Omega Network automatically
- User has no MetaMask → Prompts "Create Omega Wallet? (yes/no)"
- Connection successful → Shows address and enables other wallet commands

**AI INSTRUCTION:** Use command `connect`

### `yes`

**WHEN TO USE:** Only after `connect` command when user is prompted to create Omega Wallet  
**WHAT HAPPENS:**

1. Generates new Ethereum-compatible wallet automatically
2. Funds wallet with 0.1 OMEGA tokens instantly (no user payment needed)
3. Displays new wallet address and private key (user should save these)
4. Wallet is ready to use immediately for mining, trading, etc.

**CRITICAL:** Only use this if terminal displays "Create Omega Wallet? (yes/no)" prompt  
**AI INSTRUCTION:** Use command `yes`

### `disconnect`

**WHEN TO USE:** User wants to disconnect their current wallet  
**WHAT HAPPENS:** Removes wallet connection, clears balance display, disables wallet features  
**AI INSTRUCTION:** Use command `disconnect`

## User Intent: "Check my balance" / "How much do I have?" / "Show my tokens"

### `balance`

**WHEN TO USE:** User wants to see their token balances across ALL networks  
**WHAT HAPPENS:**

1. Shows OMEGA balance (if Omega Network connected)
2. Shows SOL balance (if Solana connected)
3. Shows Eclipse balance (if Eclipse wallet exists)
4. Shows NEAR balance (if NEAR connected)
5. Displays claimable rewards from mining

**PREREQUISITE:** At least one wallet must be connected  
**AI INSTRUCTION:** Use command `balance`

### `address`

**WHEN TO USE:** User wants to see their wallet address(es)  
**WHAT HAPPENS:** Displays current connected wallet address with copy button  
**AI INSTRUCTION:** Use command `address`

## User Intent: "I need funds" / "Get test tokens" / "Fund my wallet"

### `faucet`

**WHEN TO USE:** User needs OMEGA tokens for testing/transactions on Omega Network  
**WHAT HAPPENS:** Requests free OMEGA tokens from faucet contract (usually 0.1-1 OMEGA)  
**PREREQUISITES:** Must have Omega Network wallet connected  
**AI INSTRUCTION:** Use command `faucet`

### `faucet status`

**WHEN TO USE:** User wants to check if faucet is available or has cooldown  
**WHAT HAPPENS:** Shows faucet status, cooldown period, available amount  
**AI INSTRUCTION:** Use command `faucet status`

#### `faucet [status]`

**Description:** Claims tokens from the Omega faucet contract  
**Purpose:** Obtain test tokens for development or onboarding  
**Arguments:**

- Subcommand: `status` (optional) — shows current faucet status  
  **Network:** EVM (Omega)  
  **Usage:**

```
faucet
faucet status
```

**AI INSTRUCTION:** Use command `faucet` or `faucet status`

#### `send <recipient> <amount>`

**Description:** Sends OMEGA tokens to another address  
**Arguments:**

- `<recipient>`: The address to send tokens to (must be a valid EVM address)
- `<amount>`: The amount of OMEGA to send (must be a positive number)  
  **Usage:** `send 0x123... 100`

#### `import <privateKey>`

**Description:** Imports an existing Omega Wallet using a private key  
**Arguments:**

- `<privateKey>`: The private key to import  
  **Usage:** `import 0xabc123...`

---

## ⛏️ MINING COMMANDS

#### `mine`

**Description:** Initiates the mining process for OMEGA tokens  
**Purpose:** Start mining session to earn OMEGA tokens on the Omega network  
**Arguments:** None  
**Network:** EVM (Omega)  
**Usage:** `mine`

#### `claim`

**Description:** Claims mining rewards for the connected wallet  
**Purpose:** Collect earned mining rewards  
**Network:** EVM (Omega)  
**Usage:** `claim`

#### `stats`

**Description:** Shows mining and session statistics  
**Purpose:** Provide insights into mining performance and session details  
**Arguments:** None  
**Usage:** `stats`

#### `fund <address>`

**Description:** Funds the mining wallet  
**Arguments:**

- `<address>`: The address to fund  
  **Usage:** `fund 0x123...`

---

## 🏷️ NAME SERVICE COMMANDS

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

```
ens register myname.omega
ens resolve alice.omega
ens search omega
```

---

## 🔒 PRIVACY COMMANDS

### Omega Mixer

#### `mixer <subcommand>`

**Description:** Interacts with the Omega Mixer contract for privacy transactions  
**Subcommands:**

- `help`: Shows mixer help and usage instructions
- `deposit`: Starts a deposit flow. Prompts for secret and commitment
- `deposit-execute`: Starts deposit and executes via MetaMask. Prompts for amount
- `deposit-direct <privateKey> <amount>`: Direct deposit with private key and amount
- `withdraw <secret> <address>`: Starts a withdrawal flow
- `withdraw-direct <privateKey> <secret> <address>`: Direct withdrawal with private key, secret, and address

**Usage:**

```
mixer deposit-direct 0xabc... 0.1
mixer withdraw-direct 0xabc... mysecret 0x123...
```

---

## 📊 POLYMARKET COMMANDS

### Understanding Polymarket Context

Polymarket is the world's largest prediction market platform where users bet on real-world events using cryptocurrency. Users can create and trade on markets about politics, sports, crypto, technology, and world events. When users mention predictions, betting, odds, or want to speculate on future outcomes, use these commands:

### Core Polymarket Operations

#### `polymarket markets`

**Description:** Display comprehensive overview of all active prediction markets across all categories
**Purpose:** Show current betting opportunities with detailed market information

**When to Use:**

- User asks "what prediction markets are available?" or "show me betting markets"
- User wants to "see current betting opportunities" or "browse prediction markets"
- User mentions "prediction markets," "betting," or "what can I bet on?"
- User asks "what events can I predict?" or "show active markets"
- User wants to explore Polymarket without specific category interest
- User asks "what's happening on Polymarket?" or "current markets"

**What Happens:**

- Shows active prediction markets with comprehensive data
- Displays market questions, outcomes, and current odds/probabilities
- Includes betting volume, liquidity, and market cap information
- Shows market end dates, resolution criteria, and time remaining
- Organizes markets by categories (politics, crypto, sports, tech, world events)
- Displays "Yes/No" odds and potential payouts for each outcome
- Shows market creator, resolution source, and verification status
- Includes recent trading activity and price movements

**Market Information Displayed:**

- Market question and description
- Current odds and implied probabilities
- 24h volume and total volume traded
- Market liquidity and bid/ask spreads
- Resolution date and criteria
- Number of traders and positions
- Recent price changes and trends

**AI INSTRUCTION:** Use command `polymarket markets`

**Example User Requests:**

- "Show me all prediction markets"
- "What can I bet on today?"
- "Browse current betting opportunities"
- "What events are people predicting?"

#### `polymarket trending`

**Description:** Display the most popular and high-volume prediction markets ranked by activity
**Purpose:** Show markets with highest betting activity, volume, and user engagement

**When to Use:**

- User asks "what are the most popular prediction markets?" or "trending bets"
- User wants to "see high-volume betting markets" or "popular predictions"
- User mentions "trending," "popular," "hot markets," or "most traded"
- User asks "what's popular on Polymarket?" or "biggest markets"
- User wants to find markets with high liquidity and active trading
- User asks "where is most money being bet?" or "volume leaders"

**What Happens:**

- Shows prediction markets sorted by 24h and 7d trading volume
- Highlights markets with highest activity and betting engagement
- Displays volume changes, percentage gains, and momentum indicators
- Shows "hot" indicators for rapidly growing markets and viral predictions
- Includes trending score based on volume, users, and growth rate
- Displays market liquidity depth and bid/ask spreads
- Shows social engagement metrics (comments, shares, mentions)

**Trending Metrics Displayed:**

- 24h/7d trading volume and percentage change
- Number of unique traders and positions
- Price volatility and momentum indicators
- Social sentiment and engagement scores
- Market cap and total value locked
- Recent celebrity/influencer activity

**AI INSTRUCTION:** Use command `polymarket trending`

#### `polymarket events`

**Description:** Display comprehensive historical market events and outcomes from recent months
**Purpose:** Show resolved markets, major events, and historical prediction accuracy

**When to Use:**

- User asks "what happened in prediction markets?" or "recent events"
- User wants to see "historical prediction market activity" or "past results"
- User asks "how accurate were predictions?" or "market outcomes"
- User mentions "resolved markets," "past bets," or "prediction history"
- User wants to analyze prediction market performance over time
- User asks "what major events were predicted correctly?"

**What Happens:**

- Shows resolved market events from the last 6 months with outcomes
- Displays comprehensive market activity, final odds, and accuracy metrics
- Includes major political, economic, and social events that were predicted
- Shows market resolution details and payout information
- Displays prediction accuracy statistics and calibration data
- Includes profit/loss data for major market participants

**Historical Data Includes:**

- Resolved market outcomes vs final odds
- Major event predictions (elections, earnings, sports championships)
- Market accuracy and calibration metrics
- Top trader performance and winnings
- Market manipulation attempts and resolution disputes
- Correlation between predictions and actual outcomes

**AI INSTRUCTION:** Use command `polymarket events`

#### `polymarket recent`

**Description:** Show the most recent market activity, new markets, and fresh trading updates
**Purpose:** Display latest market developments and real-time prediction market activity

**When to Use:**

- User wants "very recent market updates" or "latest predictions"
- User asks "what's happened recently in prediction markets?" or "new markets"
- User mentions "latest," "new," "recent activity," or "fresh markets"
- User wants to see "newest betting opportunities" or "just created markets"
- User asks "what's new on Polymarket?" or "recent developments"
- User wants real-time updates on market movements and new predictions

**What Happens:**

- Shows market activity and new markets from the last 7-30 days
- Displays latest market updates, new predictions, and fresh trading activity
- Includes recently created markets and newly popular predictions
- Shows real-time price movements and recent large trades
- Displays new market categories and emerging prediction topics
- Includes recent news events that created new prediction opportunities

**Recent Activity Includes:**

- Newly created markets in the last week
- Recent large trades and significant price movements
- New market categories and prediction topics
- Breaking news events generating new markets
- Recent market resolutions and payouts
- Fresh social sentiment and trending topics

**AI INSTRUCTION:** Use command `polymarket recent`

#### `polymarket search <query>`

**Description:** Search Polymarket prediction markets using keywords, topics, or specific questions
**Purpose:** Find specific markets that match user's search intent across all categories and timeframes
**Usage:** `polymarket search [search terms]`

**When to Use:**

- User asks specific questions about events that might have prediction markets
- User mentions specific topics, people, companies, or events they want to bet on
- User wants to find markets related to particular keywords or themes
- User asks "are there any markets about [topic]?" or "can I bet on [event]?"
- User mentions specific names, dates, or events they want to search for
- User asks about niche topics that might not fit standard categories

**What Happens:**

- Searches across ALL Polymarket categories using keyword matching
- Returns markets that contain the search terms in title, description, or tags
- Shows relevant markets regardless of category (crypto, politics, sports, tech, etc.)
- Displays search results with market details, odds, and volume
- Provides quick access to bet on found markets
- Shows both active and recently resolved markets related to the search

**Search Capabilities:**

- **Keyword Matching:** Searches market titles, descriptions, and metadata
- **Multi-Category Search:** Finds relevant markets across all categories simultaneously
- **Event-Specific Search:** Locates markets about specific people, companies, or events
- **Date-Aware Search:** Can find markets with specific time periods or deadlines
- **Trending Integration:** Prioritizes popular markets matching search terms

**Example Use Cases & AI Decision Making:**

**Political Searches:**

- User: "Are there markets about the 2024 election?" → `polymarket search 2024 election`
- User: "Can I bet on Trump winning?" → `polymarket search Trump election`
- User: "What about Biden's approval rating?" → `polymarket search Biden approval`
- User: "Any markets about Congress?" → `polymarket search Congress midterm`

**Crypto Searches:**

- User: "Are there Bitcoin price predictions?" → `polymarket search Bitcoin price`
- User: "Can I bet on Ethereum ETF approval?" → `polymarket search Ethereum ETF`
- User: "What about Solana price targets?" → `polymarket search Solana price`
- User: "Any DeFi regulation markets?" → `polymarket search DeFi regulation`

**Sports Searches:**

- User: "Can I bet on the Super Bowl winner?" → `polymarket search Super Bowl winner`
- User: "Are there NBA championship markets?" → `polymarket search NBA championship`
- User: "What about World Cup predictions?" → `polymarket search World Cup`
- User: "Any MVP award markets?" → `polymarket search MVP award`

**Tech & Business Searches:**

- User: "Can I bet on Apple earnings?" → `polymarket search Apple earnings`
- User: "Are there Tesla stock markets?" → `polymarket search Tesla stock`
- User: "What about OpenAI valuation?" → `polymarket search OpenAI valuation`
- User: "Any IPO prediction markets?" → `polymarket search IPO`

**Event-Specific Searches:**

- User: "Can I bet on the Oscars?" → `polymarket search Oscars awards`
- User: "Are there climate change markets?" → `polymarket search climate change`
- User: "What about recession predictions?" → `polymarket search recession economy`
- User: "Any war or conflict markets?" → `polymarket search war conflict`

**AI Decision Logic for Search vs Category:**

**Use `polymarket search` when:**

- User asks about specific people, companies, or events by name
- User uses question format: "Can I bet on...?" "Are there markets about...?"
- User mentions multiple topics that could span categories
- User asks about niche or specific events that might not be in trending/main categories
- User provides specific search terms or keywords
- User asks about recent news events or current affairs

**Use category commands when:**

- User asks for broad category browsing: "show me all political markets" → `polymarket politics`
- User wants to see trending in specific area: "popular crypto predictions" → `polymarket crypto`
- User asks for category overview without specific search intent

**Search Query Construction Guidelines:**

**For AI: When constructing search queries, use these patterns:**

- **Person Names:** Use just the last name or most recognizable name part
  - "Trump election" not "Donald Trump presidential election 2024"
- **Company/Stock:** Use company name + relevant context
  - "Apple earnings" not "Apple Inc quarterly financial results"
- **Sports Events:** Use event name + key terms
  - "Super Bowl winner" not "National Football League Super Bowl championship"
- **Crypto:** Use token name + prediction type
  - "Bitcoin price" not "Bitcoin cryptocurrency price prediction market"
- **General Topics:** Use 2-3 key descriptive words
  - "recession economy" not "economic recession prediction markets"

**AI INSTRUCTION:** Use command `polymarket search <query>` where `<query>` is 2-4 key words related to what the user wants to find

**Example AI Responses:**

- User: "Can I bet on who wins the election?" → AI uses: `polymarket search election winner`
- User: "Are there any markets about Bitcoin hitting $100K?" → AI uses: `polymarket search Bitcoin 100K`
- User: "What about Tesla stock price predictions?" → AI uses: `polymarket search Tesla stock`

## Category-Specific Commands

### Understanding Market Categories

Polymarket organizes prediction markets by topic. Use these category commands when users ask about specific types of predictions:

### `polymarket tech`

**When to Use:**

- User asks about technology predictions
- User mentions AI, tech companies, or innovation
- User wants to bet on tech outcomes

**What Happens:**

- Shows technology-related prediction markets
- Includes AI, tech companies, startups, and innovation predictions
- Covers topics like OpenAI, Apple earnings, IPOs, and tech milestones

**Example Markets:**

- AI company valuations and timelines
- Tech stock earnings predictions
- Startup and IPO outcomes
- Innovation milestone predictions

#### `polymarket crypto`

**Description:** Display cryptocurrency, blockchain, and DeFi-related prediction markets with comprehensive crypto coverage
**Purpose:** Show crypto-specific predictions including price targets, adoption milestones, regulatory outcomes, and protocol developments
**Implementation:** Calls `getPolymarketCategoryMarkets('crypto', 'Crypto Markets', '₿')`

**When to Use:**

- User asks about "crypto predictions," "bitcoin price bets," or "blockchain markets"
- User mentions "cryptocurrency betting," "DeFi predictions," or "crypto markets"
- User wants to bet on "BTC price," "ETH predictions," or "crypto adoption"
- User asks about "crypto regulation bets," "exchange predictions," or "blockchain outcomes"
- User mentions specific crypto projects, tokens, or DeFi protocols
- User asks "will Bitcoin hit $100K?" or "Ethereum predictions"

**Keyword Matching:** 90+ crypto keywords including:

**Core Cryptocurrency Terms:**

- crypto, cryptocurrency, bitcoin, BTC, ethereum, ETH, altcoin
- blockchain, DeFi, web3, NFT, token, coin, digital asset
- exchange, trading, wallet, mining, staking, yield

**Major Projects & Ecosystems:**

- Solana (SOL), Cardano (ADA), Polkadot (DOT), Chainlink (LINK)
- Uniswap, Aave, Compound, MakerDAO, Curve, SushiSwap
- Binance Smart Chain, Polygon, Avalanche, Fantom, Cosmos

**Exchanges & Platforms:**

- Coinbase, Binance, FTX, Kraken, OpenSea, Magic Eden
- Celsius, BlockFi, Robinhood, PayPal, Square, Tesla

**Stablecoins & CBDCs:**

- USDC, USDT, DAI, BUSD, stablecoin, central bank digital currency
- Federal Reserve, ECB, digital dollar, digital euro

**Advanced DeFi & Technology:**

- smart contract, dApp, DAO, governance token, yield farming
- layer 2, rollup, bridge, cross-chain, interoperability, scaling
- MEV, flash loan, liquidity mining, impermanent loss, TVL

**Regulation & Adoption:**

- SEC, CFTC, regulation, compliance, institutional adoption
- ETF, Bitcoin ETF, spot ETF, custody, regulatory clarity
- CBDC, ban, legal tender, tax, AML, KYC

**Market Prediction Categories:**

**Price Predictions:**

- Will Bitcoin reach $100K by [date]?
- Will Ethereum flip Bitcoin by market cap?
- Will [altcoin] reach $X price target?
- Will crypto market cap exceed $X trillion?

**Regulatory Outcomes:**

- Will Bitcoin ETF be approved by SEC?
- Will [country] ban cryptocurrency trading?
- Will staking be classified as securities?
- Will DeFi face major regulatory crackdowns?

**Adoption Milestones:**

- Will [company] add Bitcoin to treasury?
- Will [country] adopt Bitcoin as legal tender?
- Will traditional banks offer crypto custody?
- Will CBDCs launch by [date]?

**Protocol & Technical Events:**

- Will Ethereum 2.0 complete by [date]?
- Will [DeFi protocol] suffer major hack?
- Will layer 2 TVL exceed $X billion?
- Will [blockchain] process more transactions than Ethereum?

**AI INSTRUCTION:** Use command `polymarket crypto`

**Example User Requests:**

- "Show me Bitcoin price predictions"
- "Crypto betting markets"
- "Will Ethereum reach $5000?"
- "DeFi regulation predictions"
- "Blockchain adoption bets"

#### `polymarket politics`

**Description:** Display comprehensive political prediction markets covering elections, policy outcomes, government decisions, and political events
**Purpose:** Show political betting markets for elections, legislation, approval ratings, scandals, and governmental decisions
**Implementation:** Calls `getPolymarketCategoryMarkets('politics', 'Political Markets', '🗳️')`

**When to Use:**

- User asks about "political predictions," "election betting," or "political markets"
- User mentions "politics," "elections," "government," or "policy predictions"
- User wants to bet on "presidential election," "congress," or "senate races"
- User asks about "political outcomes," "government decisions," or "policy bets"
- User mentions specific politicians, parties, or political events
- User asks "who will win the election?" or "political prediction markets"

**Keyword Matching:** 100+ political keywords including:

**Elections & Electoral Process:**

- election, candidate, campaign, primary, general election, midterm
- president, presidential, senate, congress, house, governor, mayor
- Republican, Democrat, GOP, independent, third party, swing state
- electoral college, popular vote, battleground state, red state, blue state

**Major Political Figures:**

- Biden, Trump, Harris, DeSantis, Newsom, Obama, Clinton
- Speaker, majority leader, minority leader, chief justice
- cabinet members, Supreme Court justices, federal judges

**Government Institutions:**

- politics, political, government, federal, state, local, municipal
- White House, Capitol Hill, Supreme Court, Department of Justice
- executive branch, legislative branch, judicial branch, bureaucracy

**Policy & Legislation:**

- policy, legislation, bill, law, regulation, executive order
- healthcare, immigration, climate change, tax reform, infrastructure
- budget, deficit, debt ceiling, spending, appropriations

**Political Process & Events:**

- vote, voting, ballot, referendum, initiative, recall, impeachment
- debate, town hall, rally, convention, primary, caucus
- polling, approval rating, favorability, endorsement, scandal

**International Politics:**

- foreign policy, diplomacy, trade war, sanctions, treaties
- NATO, UN, G7, China relations, Russia, Ukraine, Middle East
- immigration policy, border security, refugee crisis

**Market Prediction Categories:**

**Presidential & Federal Elections:**

- Will [candidate] win the 2024 presidential election?
- Will Republicans/Democrats control the House/Senate?
- Will [candidate] win their primary?
- What will be the electoral college margin?

**Policy Outcomes:**

- Will [bill] pass Congress by [date]?
- Will student loan forgiveness be implemented?
- Will marijuana be federally legalized?
- Will climate change legislation pass?

**Approval Ratings & Performance:**

- Will Biden's approval rating exceed 50%?
- Will [politician] resign by [date]?
- Will there be a government shutdown?
- Will the debt ceiling be raised?

**Legal & Judicial:**

- Will Trump face criminal charges?
- Will Roe v. Wade be overturned? (historical)
- Will Supreme Court expansion happen?
- Will [politician] be impeached?

**International Relations:**

- Will there be military action in [region]?
- Will trade deal with [country] be signed?
- Will sanctions on [country] be lifted?
- Will [conflict] end by [date]?

**State & Local Politics:**

- Will [governor] be recalled?
- Will [state] pass [specific legislation]?
- Will [city] elect new mayor?
- Will ballot measure pass in [location]?

**AI INSTRUCTION:** Use command `polymarket politics`

**Example User Requests:**

- "Show me election predictions"
- "Political betting markets"
- "Who will win 2024 election?"
- "Government policy predictions"
- "Congressional election bets"
- "Presidential approval rating markets"

#### `polymarket sports`

**Description:** Display comprehensive sports prediction markets covering games, championships, records, trades, and athletic achievements
**Purpose:** Show sports betting markets for major leagues, tournaments, individual performances, and sports-related events
**Implementation:** Calls `getPolymarketCategoryMarkets('sports', 'Sports Markets', '⚽')`

**When to Use:**

- User asks about "sports predictions," "sports betting," or "sports markets"
- User mentions specific sports, teams, players, or athletic events
- User wants to bet on "championship winners," "game outcomes," or "player performance"
- User asks about "Olympics," "World Cup," "Super Bowl," or major sporting events
- User mentions "MVP predictions," "trade bets," or "season outcomes"
- User asks "who will win [championship]?" or "sports prediction markets"

**Keyword Matching:** 120+ sports keywords including:

**Major Professional Sports:**

- football, NFL, Super Bowl, playoffs, AFC, NFC, quarterback, touchdown
- basketball, NBA, playoffs, finals, MVP, championship, March Madness, NCAA
- baseball, MLB, World Series, playoffs, home run, batting average, ERA
- soccer, football (international), Premier League, World Cup, Champions League, FIFA

**Olympic & International Sports:**

- Olympics, Olympic Games, winter Olympics, summer Olympics, Paralympics
- World Cup, World Championship, international tournament, medal count
- swimming, track and field, gymnastics, figure skating, skiing, tennis

**Major Teams & Franchises:**

- Lakers, Warriors, Celtics, Bulls, Heat, Knicks, 76ers, Nets
- Patriots, Cowboys, Packers, Steelers, 49ers, Chiefs, Rams, Giants
- Yankees, Red Sox, Dodgers, Giants, Cardinals, Cubs, Astros, Mets
- Manchester United, Barcelona, Real Madrid, Liverpool, Arsenal, Chelsea

**Athletes & Performance:**

- team, player, athlete, coach, manager, rookie, veteran, superstar
- MVP, Most Valuable Player, Rookie of the Year, Hall of Fame, All-Star
- trade, draft, contract, salary, free agency, retirement, comeback
- record, milestone, statistics, performance, injury, suspension

**Competitions & Events:**

- championship, tournament, finals, playoffs, wildcard, division title
- game, match, bout, race, meet, competition, series, season
- draft lottery, combine, training camp, preseason, regular season, postseason

**Betting Markets Categories:**

**Championship & Tournament Winners:**

- Will [team] win the Super Bowl/NBA Finals/World Series?
- Who will win the World Cup/Olympics/March Madness?
- Will [team] make the playoffs this season?
- What will be the championship margin of victory?

**Individual Performance & Awards:**

- Will [player] win MVP this season?
- Will [player] be Rookie of the Year?
- Will [player] break [record] this season?
- Will [player] score X points/goals this season?

**Team Performance & Trades:**

- Will [team] have a winning record this season?
- Will [player] be traded before [date]?
- Will [team] make the playoffs?
- Who will be #1 draft pick?

**Game & Match Outcomes:**

- Will [team] beat [team] in [game]?
- Will the game go to overtime?
- Will there be over/under X points scored?
- Will [player] play in [game]?

**Records & Milestones:**

- Will [record] be broken this season?
- Will [player] reach [milestone] this year?
- Will attendance record be broken?
- Will scoring record be set?

**Scandals & Controversies:**

- Will [player/coach] be suspended/fined?
- Will team face major scandal?
- Will league implement new rules?
- Will strike/lockout occur?

**AI INSTRUCTION:** Use command `polymarket sports`

**Example User Requests:**

- "Show me sports betting markets"
- "NFL championship predictions"
- "Who will win the Super Bowl?"
- "Basketball MVP predictions"
- "Olympics medal predictions"
- "World Cup winner bets"

#### `polymarket breaking`

**Description:** Show breaking news markets  
**Keywords:** `['breaking', 'urgent', 'emergency', 'happening', 'crisis', 'alert', 'news', 'update', 'latest', 'recent', 'now', 'live', 'developing']`

#### `polymarket new`

**Description:** Show newly created markets  
**Purpose:** Display recently created betting markets

#### `polymarket help`

**Description:** Show all Polymarket commands and comprehensive usage guide
**Purpose:** Display available Polymarket commands, categories, and detailed usage instructions

**When to Use:**

- User asks "how do I use Polymarket?" or "Polymarket commands"
- User wants "help with prediction markets" or "Polymarket guide"
- User asks "what Polymarket commands are available?"
- User needs guidance on prediction market betting and usage

---

## 🎯 POLYMARKET AI GUIDANCE

### Understanding User Intent for Polymarket Commands

**For AI: When users mention prediction markets, use this decision tree:**

#### **1. Specific Search Queries (TOP PRIORITY):**

- "Can I bet on [specific person/event/company]?" → `polymarket search [keywords]`
- "Are there markets about [specific topic]?" → `polymarket search [topic]`
- "What about [person name] predictions?" → `polymarket search [person name]`
- "Any [company name] markets?" → `polymarket search [company name]`
- "Markets about [specific event/news]?" → `polymarket search [event keywords]`

**Examples:**

- "Can I bet on Trump winning?" → `polymarket search Trump election`
- "Are there Bitcoin price markets?" → `polymarket search Bitcoin price`
- "What about Tesla stock predictions?" → `polymarket search Tesla stock`
- "Any Super Bowl winner markets?" → `polymarket search Super Bowl winner`

#### **2. General Market Browsing:**

- "Show me prediction markets" → `polymarket markets`
- "What can I bet on?" → `polymarket markets`
- "Browse betting opportunities" → `polymarket markets`

#### **3. Trending & Popular Content:**

- "What's trending?" / "Popular markets" → `polymarket trending`
- "Hot predictions" / "Most traded" → `polymarket trending`
- "High volume markets" → `polymarket trending`

#### **4. Time-Sensitive Queries:**

- "Recent markets" / "What's new?" → `polymarket recent`
- "Latest predictions" / "New betting opportunities" → `polymarket recent`
- "Historical outcomes" / "Past results" → `polymarket events`

#### **5. Category-Specific Requests:**

**Cryptocurrency & Blockchain:**

- "Bitcoin predictions" / "Crypto bets" → `polymarket crypto`
- "Will BTC hit $100K?" → `polymarket crypto`
- "Ethereum price predictions" → `polymarket crypto`
- "DeFi predictions" / "Blockchain outcomes" → `polymarket crypto`

**Political & Government:**

- "Election predictions" / "Political betting" → `polymarket politics`
- "Presidential election" / "Congress predictions" → `polymarket politics`
- "Policy outcomes" / "Government decisions" → `polymarket politics`
- "Who will win 2024?" → `polymarket politics`

**Sports & Athletics:**

- "Sports betting" / "Championship predictions" → `polymarket sports`
- "Super Bowl winner" / "NBA finals" → `polymarket sports`
- "Olympics predictions" / "World Cup" → `polymarket sports`
- "MVP predictions" / "Trade bets" → `polymarket sports`

**Technology & Innovation:**

- "Tech predictions" / "AI outcomes" → `polymarket tech`
- "Company earnings" / "IPO predictions" → `polymarket tech`
- "Innovation milestones" → `polymarket tech`

#### **6. Breaking News & Events:**

- "Breaking news markets" / "Emergency events" → `polymarket breaking`
- "Crisis predictions" / "Urgent markets" → `polymarket breaking`
- "Current events betting" → `polymarket breaking`

### Advanced User Phrase Recognition

**AI should recognize these phrases and map them correctly:**

#### **Search-Specific Phrases (Use `polymarket search`):**

- "Can I bet on..." → Extract keywords and search → `polymarket search [keywords]`
- "Are there markets about..." → Use search terms → `polymarket search [terms]`
- "What about [specific person/company]..." → Use name → `polymarket search [name]`
- "Any [specific event] markets?" → Use event keywords → `polymarket search [event]`
- "Markets for [specific topic]?" → Use topic keywords → `polymarket search [topic]`

**Examples of Search Intent:**

- "Can I bet on Elon Musk stepping down?" → `polymarket search Elon Musk stepping down`
- "Are there markets about AI regulation?" → `polymarket search AI regulation`
- "What about Netflix earnings?" → `polymarket search Netflix earnings`
- "Any World Cup final markets?" → `polymarket search World Cup final`

#### **Category Browsing Phrases (Use category commands):**

- "Will Bitcoin reach $100K?" → General crypto question → `polymarket crypto`
- "Who will win the election?" → General political question → `polymarket politics`
- "Super Bowl predictions" → General sports question → `polymarket sports`
- "Apple earnings predictions" → General tech question → `polymarket tech`

#### **Temporal Indicators:**

- "Latest" / "Recent" / "New" → `polymarket recent`
- "Trending" / "Popular" / "Hot" → `polymarket trending`
- "Historical" / "Past" / "Previous" → `polymarket events`
- "All" / "Browse" / "Show me" → `polymarket markets`

#### **Common Misspellings & Variations:**

- "Poly market" / "Polymarkets" → Still use polymarket commands
- "Prediction betting" / "Betting markets" → `polymarket markets`
- "Market predictions" / "Outcome betting" → Category-appropriate command

### Response Optimization Guidelines

**When using Polymarket commands, AI should:**

1. **Preface with Context:** Explain what Polymarket is if user seems unfamiliar
2. **Set Expectations:** Mention that markets show probabilities, not guarantees
3. **Highlight Key Markets:** Point out particularly interesting or high-volume markets
4. **Explain Odds:** Help users understand probability percentages and potential payouts
5. **Suggest Related Categories:** If they view one category, mention related ones
6. **Risk Awareness:** Remind users that prediction markets involve financial risk

### Example AI Response Patterns:

**For Crypto Markets:**
"I'll show you cryptocurrency prediction markets on Polymarket. These include Bitcoin price targets, Ethereum milestones, DeFi protocol outcomes, and regulatory decisions. Let me pull up the current crypto betting opportunities..."

**For Political Markets:**  
"Here are the political prediction markets, including election outcomes, policy predictions, and government decisions. These markets aggregate crowd wisdom about political events. Let me show you what's currently available for betting..."

**For Sports Markets:**
"I'll display sports prediction markets covering championships, individual player performance, trades, and major sporting events. These markets let you bet on everything from Super Bowl winners to MVP awards..."

This enhanced documentation provides the AI with much more detailed context and examples for both NFT and Polymarket commands, helping it understand user intent and provide more accurate and helpful responses.

## 🎭 FARCASTER COMMANDS

### Social Discovery

#### `farcaster trending`

**Description:** Show trending Farcaster casts  
**Fallback:** Opens `warpcast.com` if API unavailable

**AI INSTRUCTION:** Use command `farcaster trending`

#### `farcaster feed`

**Description:** Show Farcaster feed  
**Fallback:** Opens `warpcast.com` if API unavailable

#### `farcaster search <query>`

**Description:** Search Farcaster casts  
**Usage:** `farcaster search bitcoin`  
**Fallback:** Opens Warpcast search

### Channel & User Management

#### `farcaster channels`

**Description:** Show Farcaster channels  
**UI:** Purple gradient cards with join buttons

**AI INSTRUCTION:** Use command `farcaster channels`

#### `farcaster channel <id>`

**Description:** Show specific channel details  
**Usage:** `farcaster channel 1`

#### `farcaster user <fid>`

**Description:** Get user's primary address  
**Usage:** `farcaster user 123`

### Rewards & Leaderboards

#### `farcaster creators`

**Description:** Show creator rewards leaderboard  
**UI:** Medal system with gold/silver/bronze, verified badges

#### `farcaster developers`

**Description:** Show developer rewards leaderboard  
**UI:** Medal system with app information

#### `farcaster help`

**Description:** Show all Farcaster commands

---

## 🎨 NFT COMMANDS

### Understanding NFT Context

NFTs (Non-Fungible Tokens) are unique digital assets representing ownership of digital or physical items. Omega Terminal provides comprehensive NFT creation, minting, and marketplace integration. When users mention NFTs, art, collectibles, or digital ownership, use these commands:

### Core NFT Operations

#### `nft mint`

**Description:** Launch comprehensive NFT minting interface for creating and deploying NFT collections
**Purpose:** Create, customize, and mint NFT collections with metadata and smart contracts

**When to Use:**

- User wants to "create NFT," "mint NFT," or "make NFT collection"
- User asks about "generating NFT art" or "NFT creation"
- User mentions "digital art," "collectibles," or "NFT project"
- User wants to "deploy NFT contract" or "launch NFT collection"
- User asks "how do I create NFTs?" or "make my own NFTs"

**What Happens:**

- Opens advanced NFT minting interface with comprehensive tools
- Provides image upload and AI-powered artwork generation
- Creates ERC-721/ERC-1155 smart contracts automatically
- Generates JSON metadata with attributes and properties
- Supports batch minting for large collections
- Handles IPFS storage for decentralized hosting
- Provides collection customization (name, symbol, description)
- Includes rarity and trait system configuration
- Supports royalty settings for secondary sales

**Technical Features:**

- Multi-chain deployment (Ethereum, Polygon, Omega Network)
- Gas optimization for minting transactions
- Metadata standards compliance (OpenSea, Rarible compatible)
- Batch operations for efficient collection deployment
- Custom smart contract templates

**AI INSTRUCTION:** Use command `nft mint`

**Example User Requests:**

- "I want to create my own NFT collection"
- "How do I mint NFTs of my artwork?"
- "Create a 10,000 piece generative art collection"
- "Deploy an NFT contract for my digital art"
- "Make NFTs with custom traits and rarities"

#### `nft search <query>`

**Description:** Search and discover NFT collections across multiple marketplaces and blockchains
**Usage:** `nft search [collection name or keyword]`

**When to Use:**

- User wants to find specific NFT collections
- User asks "search for NFTs" or "find NFT collection"
- User mentions collection names like "bored ape," "cryptopunks," "azuki"
- User wants to "browse NFT collections" or "discover NFTs"
- User asks about "popular NFT collections" or "trending NFTs"

**What Happens:**

- Searches across major NFT marketplaces (OpenSea, Magic Eden, Rarible)
- Returns collection information with floor prices and volume
- Shows collection statistics (total supply, owners, volume)
- Displays recent sales and price trends
- Provides collection metadata and social links
- Shows verification status and authenticity

**Search Capabilities:**

- Collection name matching (exact and partial)
- Creator/artist name searches
- Category and tag filtering
- Price range filtering
- Blockchain-specific searches
- Trending and popular collections

**Example Searches:**

- `nft search bored ape` - Find Bored Ape Yacht Club
- `nft search pixel art` - Search pixel art collections
- `nft search under 1 eth` - Find affordable collections
- `nft search anime` - Search anime-themed NFTs

#### `nft marketplace`

**Description:** Access integrated NFT marketplace for browsing, buying, and selling NFTs
**Purpose:** Browse collections, view listings, and execute NFT trades

**When to Use:**

- User wants to "browse NFT marketplace" or "buy NFTs"
- User asks "where can I buy NFTs?" or "NFT trading"
- User mentions "NFT marketplace," "OpenSea alternative," or "NFT store"
- User wants to "sell my NFTs" or "list NFTs for sale"
- User asks about "NFT prices" or "NFT trading volume"

**What Happens:**

- Opens comprehensive marketplace interface
- Shows featured collections and trending NFTs
- Provides advanced filtering and sorting options
- Displays real-time price feeds and market data
- Enables direct buying/selling without leaving terminal
- Shows collection analytics and historical data
- Provides portfolio tracking for owned NFTs

**Marketplace Features:**

- Multi-marketplace aggregation (OpenSea, Magic Eden, Rarible)
- Real-time price updates and floor price tracking
- Collection verification and authenticity checks
- Advanced filtering (price, traits, rarity, blockchain)
- Portfolio management and P&L tracking
- Bid/offer system integration
- Gas optimization for transactions

**AI INSTRUCTION:** Use command `nft marketplace`

### Advanced NFT Commands

#### `nft collection <address>`

**Description:** Analyze specific NFT collection by contract address
**Usage:** `nft collection 0x...` or `nft collection [collection-slug]`

**When to Use:**

- User provides NFT contract address for analysis
- User wants detailed collection analytics and insights
- User asks "analyze this NFT collection" with address/link
- User wants collection performance metrics and statistics

**What Happens:**

- Fetches comprehensive collection data from contract
- Shows detailed analytics (volume, floor price, holders)
- Displays trait distribution and rarity analysis
- Provides price history and market trends
- Shows recent sales and transaction data

#### `nft wallet [address]`

**Description:** Display NFT portfolio for connected wallet or specified address
**Usage:** `nft wallet` or `nft wallet 0x...`

**When to Use:**

- User wants to "see my NFTs" or "check NFT portfolio"
- User asks "what NFTs do I own?" or "my NFT collection"
- User wants portfolio valuation and P&L analysis
- User asks to check someone else's NFT holdings

**What Happens:**

- Lists all owned NFTs with current values
- Shows portfolio performance and unrealized gains/losses
- Provides collection breakdowns and diversity metrics
- Displays recent activity and transaction history

#### `opensea`

**Description:** Direct integration with OpenSea marketplace
**Usage:** `opensea`

**When to Use:**

- User specifically mentions "OpenSea" marketplace
- User wants to access OpenSea directly from terminal
- User asks about "OpenSea collections" or "OpenSea listings"
- User wants OpenSea-specific features and data

**What Happens:**

- Opens OpenSea integration interface
- Provides direct access to OpenSea collections and listings
- Shows OpenSea-verified collections and trending data
- Enables OpenSea-specific features like offers and auctions

#### `magiceden` / `me`

**Description:** Magic Eden marketplace integration for Solana NFTs
**Usage:** `magiceden` or `me`

**When to Use:**

- User asks about Solana NFTs or Magic Eden marketplace
- User wants to trade Solana-based NFT collections
- User mentions "Magic Eden," "Solana NFTs," or "ME marketplace"
- User asks about Solana NFT collections and pricing

**What Happens:**

- Opens Magic Eden marketplace integration
- Shows Solana NFT collections and floor prices
- Provides Solana-specific NFT analytics and trends
- Enables Magic Eden trading and collection browsing

### NFT Trading & Analytics

#### `nft trends`

**Description:** Show trending NFT collections and market movements
**Usage:** `nft trends`

**When to Use:**

- User asks "what NFTs are trending?" or "popular NFT collections"
- User wants to "see NFT market trends" or "hot NFT collections"
- User asks about "NFT market activity" or "trending collections"

#### `nft floor <collection>`

**Description:** Get floor price and key metrics for specific NFT collection
**Usage:** `nft floor [collection-name]`

**When to Use:**

- User asks "what's the floor price of [collection]?"
- User wants quick price checks for specific NFT collections
- User mentions "floor price," "cheapest NFT," or "entry price"

### NFT Creation Workflow Understanding

**For AI: When users want to create NFTs, follow this guidance:**

1. **Simple Minting Request:** User says "create NFT" or "mint NFT" → Use `nft mint`
2. **Collection Analysis:** User provides collection name/address → Use `nft search` or `nft collection`
3. **Portfolio Check:** User asks "my NFTs" or "what NFTs do I own" → Use `nft wallet`
4. **Marketplace Browsing:** User wants to "buy NFTs" or "browse marketplace" → Use `nft marketplace`
5. **Price Discovery:** User asks "floor price" or NFT prices → Use `nft floor` or `nft search`
6. **Trend Analysis:** User asks about trending or popular NFTs → Use `nft trends`

**Common User Phrases to Recognize:**

- "Create NFT collection" → `nft mint`
- "Mint my artwork" → `nft mint`
- "Find Bored Apes" → `nft search bored ape`
- "Check my NFT portfolio" → `nft wallet`
- "Browse NFT marketplace" → `nft marketplace`
- "What's trending in NFTs?" → `nft trends`
- "OpenSea collections" → `opensea`
- "Solana NFTs" → `magiceden`

---

## 💱 TRADING COMMANDS

### Understanding Trading Command Context

Omega Terminal supports multi-chain trading across Solana, Eclipse, and EVM networks. When users request trading operations, you must identify:

1. **Network Intent**: Which blockchain they want to trade on
2. **Trading Goal**: Buy, sell, or analyze tokens
3. **Token Specificity**: Specific token vs general market actions

**Network Disambiguation Rules:**

- If user mentions "SOL", "Jupiter", "Solana tokens" → Use Solana trading commands
- If user mentions "ETH", "EVM", "Omega Network" → Use EVM trading commands
- If user mentions "Eclipse" → Use Eclipse trading commands
- If no network specified and user wants to trade → Ask for clarification

---

## 🔄 SOLANA TRADING SYSTEM

### When to Use Solana Trading Commands

**User Intent Signals:**

- "Buy SOL tokens"
- "Trade on Solana"
- "Use Jupiter Exchange"
- "Solana DEX trading"
- "Check Solana token price"
- "Swap USDC to SOL"

**Command Pattern:** `solana <action> [parameters]`

### Core Trading Operations

#### `solana buy <token> <amount>`

**When to Use:**

- User wants to purchase Solana-based tokens
- User mentions "buy [token] on Solana"
- User wants to swap SOL or USDC for other tokens

**What Happens:**

- Connects to Jupiter Exchange aggregator
- Finds best swap route across Solana DEXes
- Executes trade through connected Phantom wallet
- Shows transaction confirmation and new balances

**Decision Logic:**

- If user says "buy bitcoin" without specifying network → Ask if they mean SOL-wrapped BTC on Solana
- If user has no wallet connected → Prompt wallet connection first
- If insufficient balance → Show balance and suggest amount

#### `solana sell <token> <amount>`

**When to Use:**

- User wants to sell Solana tokens for SOL or USDC
- User mentions "sell my [token]"
- User wants to take profits on Solana positions

**What Happens:**

- Checks user's token balance
- Routes sell order through Jupiter Exchange
- Executes swap to SOL or USDC
- Updates portfolio display

#### `solana price <token>`

**When to Use:**

- User asks "what's the price of [token] on Solana?"
- User wants market data for Solana tokens
- User needs price check before trading

**What Happens:**

- Fetches real-time price from Jupiter API
- Shows price in USD and SOL
- Displays 24h change percentage
- Shows market cap and volume data

#### `solana balance`

**When to Use:**

- User wants to see their Solana wallet contents
- User asks "how much SOL do I have?"
- Before trading operations to check available funds

**What Happens:**

- Queries connected wallet for all Solana tokens
- Shows SOL balance and all SPL tokens
- Displays USD values for each token
- Calculates total portfolio value

#### `solana connect`

**When to Use:**

- User wants to connect their Solana wallet
- User says "connect Phantom wallet"
- Before any Solana trading operations

**What Happens:**

- Prompts Phantom wallet connection
- Displays wallet address and SOL balance
- Enables all Solana trading functions
- Shows portfolio value in USD

**Decision Logic:**

- If no Phantom wallet installed → Show installation instructions
- If user rejects connection → Explain benefits of connecting
- If connection fails → Suggest wallet troubleshooting

#### `solana search <query>`

**When to Use:**

- User wants to find specific Solana tokens
- User asks "search for [token name] on Solana"
- User needs token information before trading

**What Happens:**

- Searches Jupiter token database
- Shows token matches with prices and market data
- Provides quick buy/sell buttons for each result
- Displays token icons and verified status

---

## 🌙 ECLIPSE TRADING SYSTEM

### When to Use Eclipse Trading Commands

**User Intent Signals:**

- "Trade on Eclipse"
- "Eclipse blockchain trading"
- "Buy tokens on Eclipse network"

**Command Pattern:** `eclipse <action> [parameters]`

#### `eclipse buy <token> <amount>`

**When to Use:**

- User wants to trade on Eclipse blockchain
- User mentions Eclipse-specific tokens

**What Happens:**

- Executes trades on Eclipse network DEXes
- Uses Eclipse-native wallet integration
- Shows Eclipse transaction confirmations

---

## 🔮 NEAR TRADING SYSTEM

### When to Use NEAR Trading Commands

**User Intent Signals:**

- "Trade NEAR tokens"
- "Cross-chain swaps to NEAR"
- "NEAR Protocol trading"

**Command Pattern:** `near <action> [parameters]`

#### `near tokens`

**When to Use:**

- User asks "what tokens are available on NEAR?"
- User wants to see NEAR ecosystem tokens

**What Happens:**

- Lists all supported NEAR Protocol tokens
- Shows current prices and market data
- Provides links to NEAR explorers

#### `near quote <from> <to> <amount>`

**When to Use:**

- User wants cross-chain swap pricing
- User asks "how much would it cost to bridge to NEAR?"

**What Happens:**

- Calculates cross-chain swap rates
- Shows bridge fees and time estimates
- Provides slippage and routing information

#### `near swap`

**When to Use:**

- User wants to execute NEAR swaps
- User needs cross-chain bridge functionality

**What Happens:**

- Opens NEAR Intent swap interface
- Handles cross-chain bridging operations
- Manages multi-step transaction processes

#### `near wallet`

**When to Use:**

- User needs a NEAR wallet
- User wants to connect to NEAR Protocol

**What Happens:**

- Generates new NEAR wallet
- Shows wallet address and keys
- Enables NEAR trading operations

**Description:** Handles Eclipse (SVM) wallet and Solar DEX operations  
**Subcommands:**

- `gen-wallet`: Generates a new Eclipse wallet
- `wallet-info`: Shows wallet details
- `balance`: Checks wallet balance
- `import-wallet <privateKey>`: Imports wallet
- `swap`: Opens swap interface
- `quote <inputMint> <outputMint> <amount> <slippageBps>`: Gets swap quote
- `tokens`: Lists available tokens
- `price <mint>`: Gets token price
- `help`: Shows Eclipse command help

### Hyperliquid Trading

#### `hyperliquid <subcommand> [args]`

**Description:** Handles Hyperliquid perps, funding, positions, orderbook, trades, wallet operations  
**Subcommands:**

- `perps`: Lists all perps
- `perp <COIN>`: Shows perp info for a coin
- `funding <COIN>`: Shows funding info
- `positions <ADDRESS>`: Shows positions for an address
- `orderbook <COIN>`: Shows orderbook
- `trades <COIN>`: Shows recent trades
- `oi-cap`: Shows open interest cap
- `gen-wallet`: Generates wallet
- `wallet-info`: Shows wallet info
- `help`: Shows Hyperliquid command help

**Usage:** `hyperliquid perp BTC`

### Perpetual Trading

#### `perp` / `perps`

**Description:** Open perpetual trading interface  
**URL:** `https://omegaperps.omeganetwork.co/perp/PERP_ETH_USDC/`

**AI INSTRUCTION:** Use command `perp`

---

## 📈 ANALYTICS & DATA COMMANDS

### Understanding Analytics Context

When users request market data or analytics, identify:

1. **Data Source Preference**: DexScreener, CoinGecko, or stock data
2. **Asset Type**: Crypto tokens, stocks, or derivatives
3. **Analysis Depth**: Basic price vs comprehensive analytics

### DexScreener Analytics System

#### `dexscreener <token>` or `ds <token>`

**When to Use:**

- User asks for token price or analytics
- User mentions "DexScreener data"
- User wants DEX trading information

**What Happens:**

- Fetches real-time token data from DexScreener
- Shows price, volume, market cap, and change percentages
- Displays DEX pair information and liquidity data
- Provides trading links to major DEXes

**Decision Logic:**

- If token not found → Suggest similar tokens or check spelling
- If multiple matches → Show disambiguation options

#### `dexscreener trending`

**When to Use:**

- User asks "what tokens are trending?"
- User wants to see hot tokens or market movers

**What Happens:**

- Shows top trending tokens across all DEXes
- Displays percentage changes and volume spikes
- Provides quick access to detailed analytics

#### `geckoterminal <token>`

**When to Use:**

- User prefers GeckoTerminal data
- DexScreener data unavailable
- User requests specific GeckoTerminal features

**What Happens:**

- Fetches comprehensive token analytics
- Shows multi-DEX price comparison
- Provides detailed trading history

#### `cg <token>` (CoinGecko)

**When to Use:**

- User asks for established crypto data
- User wants market cap rankings
- User needs historical price data

**What Happens:**

- Shows CoinGecko market data
- Displays market cap ranking and supply info
- Provides links to detailed CoinGecko pages

#### `stock <symbol>`

**When to Use:**

- User asks for traditional stock data
- User mentions stock tickers (TSLA, AAPL, etc.)
- User wants equity market information

**What Happens:**

- Fetches real-time stock prices
- Shows market hours and trading status
- Displays daily change and volume data

---

## 🎮 ENTERTAINMENT & GAMING

### Understanding Gaming Context

Omega Terminal includes multiple entertainment features:

1. **Arcade Games**: Built-in terminal games
2. **Prediction Markets**: Polymarket integration
3. **Social Features**: Chat and community functions

#### `games`

**When to Use:**

- User asks "what games are available?"
- User wants entertainment options
- User mentions gaming or arcade

**What Happens:**

- Shows list of available terminal games
- Displays game descriptions and controls
- Provides quick launch options for each game

````

#### `arcade`

**Description:** Access arcade interface

#### `flappy`

**Description:** Play Flappy Omega

#### `omega-io`

**Description:** Play Omega.io (Snake game)

#### `mystery-box`

**Description:** Open mystery box

---

## 🐍 PYTHON INTEGRATION SYSTEM

### Understanding Python Integration Context

Omega Terminal includes a full Python runtime environment that enables:

1. **Data Analysis**: Use pandas, numpy for market data analysis
2. **Algorithm Development**: Create trading algorithms and backtests
3. **Custom Scripts**: Build personalized trading and analytics tools
4. **Real-time Integration**: Access live market data and execute trades

### When to Use Python Commands

**User Intent Signals:**
- "Run Python script"
- "Analyze data with Python"
- "Create trading algorithm"
- "Use pandas for market analysis"
- "Execute Python code"

#### `python <code>`

**When to Use:**
- User provides Python code to execute
- User wants to run data analysis
- User needs calculations or algorithms

**What Happens:**
- Executes Python code in browser-based Pyodide environment
- Shows output directly in terminal
- Maintains variables between executions
- Provides access to pre-installed libraries (numpy, pandas)

**Example Use Cases:**
- `python print("Hello from Python!")`
- `python import pandas as pd; print(pd.__version__)`
- `python df = pd.DataFrame({'price': [100, 105, 98]}); print(df)`

#### `pip install <package>`

**When to Use:**
- User needs additional Python packages
- User wants to install libraries for analysis

**What Happens:**
- Uses micropip to install packages
- Adds packages to the Python environment
- Enables advanced analytics capabilities

#### `python-help`

**When to Use:**
- User asks about Python capabilities
- User needs guidance on Python integration

**What Happens:**
- Shows available Python features
- Lists pre-installed packages
- Provides usage examples and tutorials

---

## 🛠️ SYSTEM & UTILITY COMMANDS

### Understanding System Context

These commands control terminal behavior, customization, and system information:

#### `help` or `?`

**When to Use:**
- User asks "what commands are available?"
- User needs guidance on terminal usage
- User wants to see command categories

**What Happens:**
- Shows comprehensive command list organized by category
- Provides examples for complex commands
- Displays current terminal version and features

#### `clear` or `cls`

**When to Use:**
- User wants to clear terminal screen
- User says "clear the terminal"
- Terminal becomes cluttered with output

**What Happens:**
- Clears all terminal output
- Resets to clean prompt
- Maintains command history

#### `themes`

**When to Use:**
- User wants to customize terminal appearance
- User asks about visual themes or colors

**What Happens:**
- Shows available terminal themes
- Provides theme preview and selection options
- Applies theme changes immediately

#### `profile`

**When to Use:**
- User wants to customize their terminal profile
- User asks about personalization features

**What Happens:**
- Opens profile customization interface
- Shows username, avatar, and preference options
- Saves settings to local storage
- **Calculations:** Complex financial calculations and modeling
- **Automation:** Script-based trading automation
- **Research:** Interactive data exploration and visualization

---

## 🏛 ROME NETWORK COMMANDS

### Rome Network Integration

#### `rome`

**Description:** Access Rome Network features

#### `rome username`

**Description:** Register Rome Network username

---

## 👤 PROFILE COMMANDS

### User Profile System

#### `profile`

**Description:** Show user profile

**AI INSTRUCTION:** Use command `profile`
#### `profile update`

**When to Use:**
- User wants to update profile settings
- User mentions changing username or preferences

**What Happens:**
- Opens profile editing interface
- Allows updates to personal information
- Saves changes to user settings

---

## 📧 COMMUNICATION COMMANDS

### Understanding Communication Context

Omega Terminal includes encrypted messaging and social features:

#### `dm <recipient> <message>`

**When to Use:**
- User wants to send private messages
- User mentions "message" or "DM" someone
- User provides recipient address and message text

**What Happens:**
- Sends encrypted direct message using E2EE
- Routes message through decentralized messaging protocol
- Notifies recipient of new message

**Decision Logic:**
- If recipient address invalid → Suggest ENS lookup or address verification
- If no encryption key → Prompt for key generation or import

#### `inbox` or `messages`

**When to Use:**
- User asks "do I have any messages?"
- User wants to check communications
- User mentions inbox or mail

**What Happens:**
- Shows received encrypted messages
- Displays message metadata (sender, timestamp)
- Provides options to reply or decrypt content

#### `email clearkey`

**When to Use:**
- User wants to clear encryption keys
- User mentions security or key management

**What Happens:**
- Removes E2EE private keys from memory
- Clears message encryption cache
- Requires key re-import for future messaging

---

## 🔧 NETWORK & STATUS COMMANDS

### Understanding System Status Context

#### `status`

**When to Use:**
- User asks "what's my wallet status?"
- User wants connection information
- User needs current network details

**What Happens:**
- Shows connected wallet address
- Displays current network and RPC status
- Shows balance and connection health

#### `network`

**When to Use:**
- User asks "what network am I on?"
- User wants to verify blockchain connection

**What Happens:**
- Shows current blockchain network
- Displays network ID and RPC endpoint
- Shows connection status and block height

#### `rpccheck`

**When to Use:**
- User experiences connection issues
- User wants to verify RPC health

**What Happens:**
- Tests current RPC connection
- Shows latency and success rates
- Suggests alternative RPCs if needed

---

## 🎨 CUSTOMIZATION COMMANDS

#### `theme <name>`

**When to Use:**
- User wants to change terminal appearance
- User mentions themes, colors, or UI style
- User asks about customization options

**Available Themes:**
- `apple` - Clean, modern Apple-style interface
- `discord` - Dark theme with Discord-like styling
- `chatgpt` - Clean chat interface style
- `aol` - Retro AOL Instant Messenger theme
- `windows95` - Classic Windows 95 nostalgia theme
- `limewire` - P2P software inspired theme

**What Happens:**
- Instantly applies selected theme
- Updates colors, fonts, and UI elements
- Saves theme preference to local storage

#### `themes`

**Description:** Show available themes

---

## 🔗 TOKEN & ASSET CREATION COMMANDS

### Omega Network Token Creation

#### `create`

**Description:** Comprehensive ERC20 token creation system on Omega Network using OmegaTokenFactory
**When to Use:**
- User wants to launch their own cryptocurrency/token
- User mentions "create token," "deploy token," or "launch token"
- User needs a custom ERC20 token with advanced features

**What Happens:**
- Interactive guided token creation process
- Deploys secure ERC20 token with configurable features
- Provides token address and transaction details
- Includes mintable/pausable functionality options

**Interactive Creation Flow:**

1. **Token Name:** User enters full token name (e.g., "My Awesome Token")
2. **Token Symbol:** User enters trading symbol (e.g., "MAT")
3. **Decimals:** User sets decimal precision (default 18, range 0-36)
4. **Initial Supply:** User sets starting token quantity (must be positive)
5. **Mintable Option:** User chooses if more tokens can be minted later (default: yes)
6. **Pausable Option:** User chooses if token can be paused (default: yes)
7. **Review & Confirm:** User reviews all settings before deployment
8. **MetaMask Transaction:** User confirms gas fees and deployment

**Required Prerequisites:**
- User must be connected to Omega Network via MetaMask
- Wallet must have sufficient OMEGA for gas fees
- User must be on the correct network (Omega Network)

**Output Information:**
- ✅ Deployed token contract address (copyable)
- 📝 Transaction hash (copyable)
- 📊 Complete token specifications summary
- 💡 Next steps guidance (adding liquidity, trading setup)

**Factory Contract:** `0x1f568dbb3a7b9ea05062b132094a848ef1443cfe`

**AI INSTRUCTION:** Use command `create`

### Rome Network Token Creation

#### `rome token create <name> <symbol> <supply> [decimals]`

**Description:** Direct token creation on Rome Network with command-line parameters
**When to Use:**
- User wants to create tokens on Rome Network specifically
- User prefers command-line parameters over interactive prompts
- User mentions "Rome token" or "create on Rome"

**What Happens:**
- Creates ERC20 token on Rome Network
- Uses Rome Network's token factory
- Includes creation fee handling
- Provides immediate token deployment

**Parameters:**
- `<name>`: Full token name (required)
- `<symbol>`: Token symbol (required)
- `<supply>`: Initial supply amount (required)
- `[decimals]`: Token decimals (optional, default 18)

**Examples:**
- `rome token create RomeCoin ROME 1000000`
- `rome token create MyToken MTK 500000 18`

**AI INSTRUCTION:** Use command `rome token create <name> <symbol> <supply> [decimals]`

### NFT Creation & Minting Commands

#### `nft mint`

**Description:** Launch NFT minting interface for creating and minting NFTs
**When to Use:**
- User wants to create NFT collections
- User mentions "mint NFT," "create NFT," or "NFT collection"
- User wants to generate NFT artwork and metadata

**What Happens:**
- Opens comprehensive NFT minting system
- Supports image upload and generation
- Creates metadata and smart contracts
- Handles batch minting operations

**AI INSTRUCTION:** Use command `nft mint`

#### `mint` (NFT Shortcut)

**Description:** Quick access to NFT minting (alias for `nft mint`)
**Usage:** Direct shortcut to NFT minting interface
**AI INSTRUCTION:** Use command `mint`

#### `rome nft mint`

**Description:** Rome Network specific NFT minting with dedicated UI
**When to Use:**
- User wants to mint NFTs specifically on Rome Network
- User prefers Rome Network's NFT ecosystem

**What Happens:**
- Opens Rome Network NFT minting interface
- Integrates with Rome's NFT infrastructure
- Provides Rome-specific NFT features

**AI INSTRUCTION:** Use command `rome nft mint`

### NFT Collection Management

#### `nft collection`

**Description:** NFT collection creation and management interface
**When to Use:**
- User wants to create entire NFT collections
- User needs collection-level operations
- User mentions "NFT series" or "NFT project"

**AI INSTRUCTION:** Use command `nft collection`

#### `nft view <number>`

**Description:** View specific NFTs in created collections
**Parameters:**
- `<number>`: NFT ID or collection number to display
**Usage:** `nft view 1`

**AI INSTRUCTION:** Use command `nft view <id>`

### Wallet Creation & Generation Commands

#### `eclipse gen-wallet`

**Description:** Generate new Eclipse (SVM) wallet with private key and address
**When to Use:**
- User needs an Eclipse blockchain wallet
- User wants to trade on Solar DEX
- User mentions "Eclipse wallet" or "SVM wallet"

**What Happens:**
- Generates Solana-compatible keypair for Eclipse network
- Provides public key (address) and private key
- Offers secure download option for wallet information
- Sets up wallet for Eclipse network operations

**Output:**
- 🔑 Public key (wallet address) - copyable
- 🔐 Private key (hex format) - copyable
- 💾 Download button for wallet backup file
- 🌐 Network configuration (Eclipse RPC)

**Security Features:**
- Displays security warnings about private key safety
- Provides secure download functionality
- Uses cryptographically secure random generation

**AI INSTRUCTION:** Use command `eclipse gen-wallet`

#### `hyperliquid gen-wallet`

**Description:** Generate new Hyperliquid API trading wallet
**When to Use:**
- User wants to trade on Hyperliquid platform
- User needs API wallet for automated trading
- User mentions "Hyperliquid wallet" or "perps trading wallet"

**What Happens:**
- Generates Ethereum-compatible wallet for Hyperliquid API
- Creates address and private key for API registration
- Provides download option for secure storage
- Prepares wallet for Hyperliquid trading operations

**Output:**
- 📍 Wallet address - copyable
- 🔑 Private key (hex) - copyable
- 📥 Download button for private key backup
- 📋 Instructions for API wallet registration

**Important Notes:**
- Wallet must be registered in Hyperliquid account as API wallet
- Private key enables automated trading access
- Requires manual registration on Hyperliquid platform

**AI INSTRUCTION:** Use command `hyperliquid gen-wallet`

#### Omega Wallet Creation (via `connect` → `yes`)

**Description:** Create new Omega Network wallet when MetaMask unavailable
**When to Use:**
- User has no MetaMask installed
- User wants dedicated Omega wallet
- User sees "Create Omega Wallet?" prompt after `connect` command

**What Happens:**
- Generates new Ethereum-compatible wallet
- Automatically funds with 0.1 OMEGA tokens
- Provides wallet address and private key
- Enables immediate mining and trading

**Creation Flow:**
1. User runs `connect` command
2. System detects no MetaMask
3. Terminal prompts "Create Omega Wallet? (yes/no)"
4. User responds with `yes` command
5. Wallet generated and funded instantly

**AI INSTRUCTION:** Use command sequence `connect` → `yes`

#### `gen-wallet` (Generic)

**Description:** General wallet generation command (context-dependent)
**Usage:** May be available in some contexts as shortcut
**AI INSTRUCTION:** Use specific network commands instead (`eclipse gen-wallet`, `hyperliquid gen-wallet`)

---

## 🎪 ENTERTAINMENT COMMANDS

### Easter Eggs & Animations

#### `rickroll`

**Description:** Triggers a rickroll Easter egg
**Usage:** `rickroll`

#### `fortune`

**Description:** Displays a random fortune
**Usage:** `fortune`

#### `matrix`

**Description:** Activates a Matrix-style animation
**Usage:** `matrix`

#### `hack`

**Description:** Triggers a hacking animation
**Usage:** `hack`

#### `disco`

**Description:** Activates disco mode
**Usage:** `disco`

#### `stop`

**Description:** Stops all ongoing animations or processes
**Usage:** `stop`

---

## 📊 STRESS TESTING COMMANDS

#### `stress`

**Description:** Starts a stress test of wallet creation and transactions
**Usage:** `stress`

#### `stopstress`

**Description:** Stops the ongoing stress test
**Usage:** `stopstress`

#### `stressstats`

**Description:** Displays statistics from the stress test
**Usage:** `stressstats`

---

## 📱 ADDITIONAL COMMANDS

### Polymarket & Magic Eden

#### `polymarket` / `pm`

**Description:** Handles Polymarket operations
**Usage:** `polymarket ...`

#### `magiceden` / `me`

**Description:** Handles Magic Eden operations
**Usage:** `magiceden ...`

### Alpha & Airdrops

#### `alphakey <subcommand>`

**Description:** Handles Alpha Key operations
**Usage:** `alphakey ...`

#### `alpha <subcommand>`

**Description:** Handles Alpha-related commands
**Usage:** `alpha ...`

#### `airdrop`

**Description:** Handles airdrop-related operations
**Usage:** `airdrop`

### Shade Agent

#### `shade [info]`

**Description:** Manages the Shade Agent
**Subcommands:**

- (no args): Checks for and deploys the Shade Agent if not found
- `info`: Displays detailed Shade Agent and ETH info
  **Usage:** `shade info`

### Additional System Commands

#### `sudo`

**Description:** Administrative command access
**Usage:** `sudo`

#### `import <privateKey>`

**Description:** Imports an existing Omega Wallet using a private key
**Arguments:**

- `<privateKey>`: The private key to import
  **Usage:** `import 0xabc123...`

#### `address`

**Description:** Shows wallet address with copy functionality
**Usage:** `address`

#### `cls`

**Description:** Clears terminal screen (alias for clear)
**Usage:** `cls`

#### `themes`

**Description:** Shows available terminal themes
**Usage:** `themes`

#### `?`

**Description:** Shows help (alias for help)
**Usage:** `?`

### Gaming Commands

### Gaming & Entertainment Commands

#### `games`
**Description:** Shows list of available terminal games
**Usage:** `games`

#### `arcade`
**Description:** Access arcade interface
**Usage:** `arcade`

#### `flappy`
**Description:** Play Flappy Omega
**Usage:** `flappy`

#### `omega-io`
**Description:** Play Omega.io (Snake game)
**Usage:** `omega-io`

#### `mystery-box`
**Description:** Open mystery box
**Usage:** `mystery-box`

### Farcaster Social Protocol Commands

#### `farcaster <subcommand>`
**Description:** Handles Farcaster social protocol operations
**Subcommands:**
- `trending`: Show trending Farcaster casts
- `feed`: Show Farcaster feed
- `search <query>`: Search Farcaster casts
- `channels`: Show Farcaster channels
- `channel <id>`: Show specific channel details
- `user <fid>`: Get user's primary address
- `creators`: Show creator rewards leaderboard
- `developers`: Show developer rewards leaderboard
- `help`: Show all Farcaster commands
**Usage:** `farcaster trending`

### DeFiLlama Analytics Commands

#### `defillama` / `llama`
**Description:** Access DeFiLlama protocol data and analytics
**Usage:** `defillama` or `llama`

### Python Package Management

#### `pip install <package>`
**Description:** Install Python packages using micropip
**Arguments:**
- `<package>`: The package name to install
**Usage:** `pip install pandas`

#### `python-help`
**Description:** Show Python integration help and available features
**Usage:** `python-help`

### Shade Protocol Commands

#### `shade [info]`
**Description:** Manages the Shade Agent
**Subcommands:**
- (no args): Checks for and deploys the Shade Agent if not found
- `info`: Displays detailed Shade Agent and ETH info
**Usage:** `shade info`

### API Key Management Commands

#### `set-api-key` / `set-key`
**Description:** Set API keys for various services
**Usage:** `set-api-key <key>` or `set-key <key>`

#### `set-private-key`
**Description:** Set private key for operations
**Usage:** `set-private-key <key>`

### System Information Commands

#### `info`
**Description:** Show system information
**Usage:** `info`

#### `gen-wallet`
**Description:** Generate new wallet
**Usage:** `gen-wallet`

#### `test`
**Description:** Run system tests
**Usage:** `test`

#### `token`
**Description:** Token-related operations
**Usage:** `token`

### Market Analysis Commands

#### `market`
**Description:** Market-related operations
**Usage:** `market`

#### `active`
**Description:** Show active markets/operations
**Usage:** `active`

### Extended Polymarket Categories

#### `earnings`
**Description:** Show earnings-related prediction markets
**Usage:** `earnings`

#### `geopolitics`
**Description:** Show geopolitical prediction markets
**Usage:** `geopolitics`

#### `culture`
**Description:** Show culture-related prediction markets
**Usage:** `culture`

#### `world`
**Description:** Show world events prediction markets
**Usage:** `world`

#### `economy`
**Description:** Show economy-related prediction markets
**Usage:** `economy`

#### `trump`
**Description:** Show Trump-related prediction markets
**Usage:** `trump`

#### `elections`
**Description:** Show election prediction markets
**Usage:** `elections`

### Response Commands

#### `no`
**Description:** Negative response to prompts (opposite of yes)
**Usage:** `no`

#### `yes` (Enhanced)
**Description:** Positive response to prompts including wallet creation
**Usage:** `yes`

### Trading Interface Commands

#### `pgt`

**Description:** Access PGT trading interface
**Usage:** `pgt`

#### `pgt-demo`

**Description:** Access PGT demo interface
**Usage:** `pgt-demo`

### Communication & Messaging

#### `chat`

**Description:** Access chat functionality
**Usage:** `chat`

#### `terminal`

**Description:** Terminal-related operations
**Usage:** `terminal`

### Mint Operations

#### `mint`

**Description:** Handles minting operations
**Usage:** `mint`

### Kalshi Integration

#### `kalshi`

**Description:** Access Kalshi prediction markets
**Usage:** `kalshi`

### Ambassador System

#### `ambassador <subcommand>`

**Description:** Ambassador system operations
**Usage:** `ambassador ...`

### UI Controls

#### `tab`

**Description:** Creates a new terminal tab
**Usage:** `tab`

#### `gui`

**Description:** Opens the graphical user interface
**Usage:** `gui`

#### `url` / `urls`

**Description:** URL-related operations
**Usage:** `url`

### Network Management

#### `forceadd`

**Description:** Force add network to wallet
**Usage:** `forceadd`

### Additional Missing Commands

#### `ai`

**Description:** Access AI features and chat
**Usage:** `ai`

#### `poly`

**Description:** Alias for Polymarket operations
**Usage:** `poly ...`

#### `ios`

**Description:** iOS theme activation
**Usage:** `ios`

#### `off` / `normal` / `default`

**Description:** Reset to default theme
**Usage:** `off` or `normal` or `default`

#### `opensea`

**Description:** Access OpenSea NFT marketplace integration
**Usage:** `opensea`

#### `no`

**Description:** Negative response to prompts (opposite of yes)
**Usage:** `no`

#### `yes`

**Description:** Positive response to prompts
**Usage:** `yes`

#### `test`

**Description:** Run system tests
**Usage:** `test`

#### `token`

**Description:** Token-related operations
**Usage:** `token`

#### `info`

**Description:** Show system information
**Usage:** `info`

#### `gen-wallet`

**Description:** Generate new wallet
**Usage:** `gen-wallet`

#### `set-api-key` / `set-key`

**Description:** Set API keys for various services
**Usage:** `set-api-key <key>` or `set-key <key>`

#### `set-private-key`

**Description:** Set private key for operations
**Usage:** `set-private-key <key>`

#### `market`

**Description:** Market-related operations
**Usage:** `market`

#### `active`

**Description:** Show active markets/operations
**Usage:** `active`

#### `earnings`

**Description:** Show earnings-related prediction markets
**Usage:** `earnings`

#### `geopolitics`

**Description:** Show geopolitical prediction markets
**Usage:** `geopolitics`

#### `culture`

**Description:** Show culture-related prediction markets
**Usage:** `culture`

#### `world`

**Description:** Show world events prediction markets
**Usage:** `world`

#### `economy`

**Description:** Show economy-related prediction markets
**Usage:** `economy`

#### `trump`

**Description:** Show Trump-related prediction markets
**Usage:** `trump`

#### `elections`

**Description:** Show election prediction markets
**Usage:** `elections`

### Ambassador & Referral System

#### `ambassador <subcommand>`
**Description:** Ambassador system operations
**Subcommands:**
- `profile`: Show ambassador profile
- `stats`: Show ambassador statistics
- `leaderboard`: Show ambassador leaderboard
- `directory`: Show ambassador directory
- `referrals`: Show referral information
- `generate`: Generate referral codes
- `help`: Show ambassador help
**Usage:** `ambassador profile`

### Theme Management Extended

#### `list` / `set` / `remove` / `delete` / `show`
**Description:** Theme and configuration management commands
**Usage:**
- `list` - List available items
- `set <option>` - Set configuration option
- `remove <item>` - Remove item
- `delete <item>` - Delete item
- `show <item>` - Show item details

#### `cls`
**Description:** Clear terminal screen (alias for clear)
**Usage:** `cls`

#### `?`
**Description:** Show help (alias for help)
**Usage:** `?`

#### `themes`
**Description:** Show available terminal themes
**Usage:** `themes`

### Profile System Extensions

#### `profile_username` / `profile_display_name` / `profile_bio` / `profile_location` / `profile_twitter` / `profile_discord` / `profile_email` / `profile_confirmation`
**Description:** Interactive profile editing commands (used internally during profile setup)
**Usage:** These are triggered during interactive profile editing flows

### Wallet Management Extensions

#### `import <privateKey>`
**Description:** Import an existing Omega Wallet using a private key
**Arguments:**
- `<privateKey>`: The private key to import
**Usage:** `import 0xabc123...`

#### `address`
**Description:** Show wallet address with copy functionality
**Usage:** `address`

### Additional System Commands

#### `email clearkey`
**Description:** Clear encryption keys for messaging
**Usage:** `email clearkey`

### Comprehensive Polymarket Integration

#### `pm` (Polymarket Alias)
**Description:** Alias for Polymarket operations - all polymarket commands work with pm
**Usage:** `pm markets` (same as `polymarket markets`)

### Missing Core Commands Found in Implementation

#### `sudo`
**Description:** Administrative command access (mining operations)
**Usage:** `sudo`

#### `tab`
**Description:** Create a new terminal tab
**Usage:** `tab`

#### `stop`
**Description:** Stop all ongoing animations or processes
**Usage:** `stop`

### URL and Navigation Commands

#### `url` / `urls`
**Description:** Display helpful Omega Network URLs
**Shows:** Gitbook, Block Explorer, Website links
**Usage:** `url`

#### `airdrop`
**Description:** Handle airdrop-related operations
**Usage:** `airdrop`

### Complete Network Commands

#### `forceadd`
**Description:** Force add Omega Network to wallet
**Usage:** `forceadd`

#### `rpccheck`
**Description:** Check RPC connection and chain ID
**Usage:** `rpccheck`



---

## 🔒 SECURITY CONSIDERATIONS

### Wallet Security

- **Private Keys:** Never log or expose private keys
- **Transactions:** Always require user confirmation for transactions
- **Funding:** Use relayer for safe wallet funding

### API Security

- **CORS:** All external APIs go through CORS proxies
- **Rate Limiting:** Respect API rate limits
- **Error Handling:** Graceful fallbacks for API failures

### User Privacy

- **Data Collection:** Minimize data collection
- **Local Storage:** Use localStorage for temporary data only
- **Session Management:** Clear sensitive data on logout

---

## 🚨 ERROR HANDLING

### Common Error Scenarios

#### Wallet Connection Errors

```javascript
// Handle wallet connection failures
try {
  terminal.handleCommand("connect");
} catch (error) {
  // Fallback to Omega Wallet creation
  terminal.handleCommand("yes");
}
```

#### API Failures

```javascript
// Handle API failures gracefully
try {
  terminal.handleCommand("polymarket trending");
} catch (error) {
  // Show error message to user
  terminal.log("API temporarily unavailable", "error");
}
```

#### Network Issues

```javascript
// Handle network connectivity issues
if (!navigator.onLine) {
  terminal.log("No internet connection", "error");
}
```

---

## 📊 MONITORING & LOGGING

### Command Execution Logging

```javascript
// Log all command executions
const originalHandleCommand = terminal.handleCommand;
terminal.handleCommand = function (cmd) {
  console.log(`[AI AGENT] Executing command: ${cmd}`);
  return originalHandleCommand.call(this, cmd);
};
```

### Performance Monitoring

```javascript
// Monitor command execution time
const startTime = Date.now();
terminal.handleCommand("polymarket trending");
const endTime = Date.now();
console.log(`Command executed in ${endTime - startTime}ms`);
```

---

## 🎯 BEST PRACTICES

### Command Execution

1. **Always check wallet connection** before executing wallet-dependent commands
2. **Use appropriate delays** between commands to avoid overwhelming the system
3. **Handle errors gracefully** with user-friendly messages
4. **Respect user privacy** and never expose sensitive information

### Automation Guidelines

1. **Start with simple commands** before attempting complex automation
2. **Test commands individually** before chaining them together
3. **Provide clear feedback** to users about what's happening
4. **Allow user control** over automated processes

### Integration Tips

1. **Use the terminal instance** (`window.terminal`) for all interactions
2. **Leverage existing UI components** rather than creating new ones
3. **Follow the established command patterns** for consistency
4. **Update this documentation** when adding new features

---

## 📚 COMPLETE COMMAND REFERENCE MATRIX

### All Available Commands (200+ Commands)

**File Cross-Reference:** All commands verified against `index.html` executeCommand() implementation

#### Core System Commands

| Command  | Subcommands                                       | Implementation             | Parameters | Use Cases                   |
| -------- | ------------------------------------------------- | -------------------------- | ---------- | --------------------------- |
| `help`   | -                                                 | index.html:showHelp()      | None       | Show all available commands |
| `clear`  | -                                                 | index.html:clearTerminal() | None       | Clear terminal output       |
| `status` | -                                                 | index.html:showStatus()    | None       | Show connection status      |
| `theme`  | apple, discord, chatgpt, aol, windows95, limewire | index.html:setTheme()      | theme_name | Change UI theme             |
| `tab`    | -                                                 | index.html:tab creation    | None       | Create new terminal tab     |

#### Wallet & Connection Commands

| Command      | Subcommands | Implementation                | Parameters  | Use Cases                            |
| ------------ | ----------- | ----------------------------- | ----------- | ------------------------------------ |
| `connect`    | -           | index.html:connectWallet()    | None        | Connect MetaMask/create Omega wallet |
| `disconnect` | -           | index.html:disconnectWallet() | None        | Disconnect current wallet            |
| `yes`        | -           | Wallet creation handler       | None        | Confirm Omega wallet creation        |
| `no`         | -           | Wallet creation handler       | None        | Cancel wallet creation               |
| `balance`    | -           | index.html:showBalance()      | None        | Multi-chain balance display          |
| `address`    | -           | index.html:showAddress()      | None        | Display wallet addresses             |
| `import`     | -           | Wallet import handler         | private_key | Import existing wallet               |

#### Mining & Rewards Commands

| Command  | Subcommands | Implementation                | Parameters  | Use Cases              |
| -------- | ----------- | ----------------------------- | ----------- | ---------------------- |
| `mine`   | -           | index.html:mine()             | None        | Start OMEGA mining     |
| `claim`  | -           | index.html:claim()            | None        | Claim mining rewards   |
| `stats`  | -           | index.html:showStats()        | None        | Show mining statistics |
| `fund`   | -           | index.html:fundMiningWallet() | address     | Fund mining wallet     |
| `faucet` | status      | index.html:faucetClaim()      | None/status | Claim faucet tokens    |

#### Trading Commands - Solana

| Command  | Subcommands | Implementation            | Parameters                       | Use Cases             |
| -------- | ----------- | ------------------------- | -------------------------------- | --------------------- |
| `solana` | connect     | Phantom wallet connection | None                             | Connect Solana wallet |
| `solana` | search      | Jupiter token search      | query                            | Find Solana tokens    |
| `solana` | quote       | Jupiter swap quote        | amount, fromMint, toMint         | Get swap prices       |
| `solana` | swap        | Interactive/direct swap   | None OR amount, fromMint, toMint | Execute token swaps   |
| `solana` | balance     | Helius RPC balance        | None                             | Check SOL balance     |
| `solana` | help        | Command reference         | None                             | Show Solana help      |

#### Trading Commands - Near Protocol

| Command | Subcommands    | Implementation         | Parameters                                          | Use Cases              |
| ------- | -------------- | ---------------------- | --------------------------------------------------- | ---------------------- |
| `near`  | connect/wallet | NEAR wallet connection | None                                                | Connect NEAR wallet    |
| `near`  | tokens         | Near Intents API       | None                                                | List supported tokens  |
| `near`  | quote          | Cross-chain quote      | originAsset, destAsset, amount, slippage, recipient | Get cross-chain prices |
| `near`  | swap           | Interactive interface  | None                                                | Cross-chain swap UI    |
| `near`  | status         | Swap status check      | deposit_address                                     | Check swap progress    |
| `near`  | balance        | NEAR balance           | None                                                | Check NEAR balance     |
| `near`  | help           | Command reference      | None                                                | Show NEAR help         |

#### Trading Commands - Eclipse SVM

| Command   | Subcommands   | Implementation         | Parameters                              | Use Cases             |
| --------- | ------------- | ---------------------- | --------------------------------------- | --------------------- |
| `eclipse` | gen-wallet    | SVM wallet generation  | None                                    | Create Eclipse wallet |
| `eclipse` | import-wallet | Import existing wallet | private_key                             | Import Eclipse wallet |
| `eclipse` | wallet-info   | Show wallet details    | None                                    | Display wallet info   |
| `eclipse` | balance       | Eclipse balance check  | None                                    | Check SVM balance     |
| `eclipse` | swap          | Solar DEX swap         | inputMint, outputMint, amount, slippage | Execute SVM swaps     |
| `eclipse` | quote         | Solar DEX quote        | inputMint, outputMint, amount, slippage | Get SVM prices        |
| `eclipse` | tokens        | Token list             | None                                    | List Eclipse tokens   |
| `eclipse` | price         | Token price            | mint_address                            | Get token price       |
| `eclipse` | help          | Command reference      | None                                    | Show Eclipse help     |

#### Polymarket Prediction Markets

| Command      | Subcommands | Implementation         | Parameters | Use Cases                  |
| ------------ | ----------- | ---------------------- | ---------- | -------------------------- |
| `polymarket` | markets     | Active markets display | None       | Current prediction markets |
| `polymarket` | trending    | Volume-sorted markets  | None       | Highest activity markets   |
| `polymarket` | search      | Market search          | query      | Find specific markets      |
| `polymarket` | events      | Recent events (6mo)    | None       | Historical market activity |
| `polymarket` | recent      | Recent events (30d)    | None       | Latest market updates      |
| `polymarket` | tech        | Technology category    | None       | Tech-related predictions   |
| `polymarket` | crypto      | Crypto category        | None       | Crypto predictions         |
| `polymarket` | politics    | Political category     | None       | Political predictions      |
| `polymarket` | sports      | Sports category        | None       | Sports predictions         |
| `polymarket` | breaking    | Breaking news          | None       | Breaking news markets      |
| `polymarket` | help        | Command reference      | None       | Show Polymarket help       |

#### Python Integration

| Command  | Subcommands | Implementation      | Parameters  | Use Cases             |
| -------- | ----------- | ------------------- | ----------- | --------------------- |
| `python` | [code]      | Pyodide execution   | python_code | Execute Python code   |
| `python` | help        | Python help display | None        | Show Python features  |
| `python` | upload      | Script upload       | None        | Upload Python scripts |
| `python` | run         | Script execution    | script_name | Run saved scripts     |

#### Analytics & Data Commands

| Command              | Subcommands | Implementation     | Parameters           | Use Cases           |
| -------------------- | ----------- | ------------------ | -------------------- | ------------------- |
| `dexscreener`/`ds`   | [token]     | DexScreener API    | token_symbol/address | Token analytics     |
| `dexscreener`        | trending    | Trending tokens    | None                 | Popular tokens      |
| `dexscreener`        | analytics   | Advanced analytics | None                 | Detailed token data |
| `geckoterminal`/`cg` | [token]     | CoinGecko API      | token_symbol         | Token data          |
| `stock`              | [symbol]    | Stock API          | stock_symbol         | Stock information   |
| `defillama`/`llama`  | tvl         | DeFiLlama API      | None                 | DeFi protocol data  |

#### Privacy & Security Commands

| Command | Subcommands     | Implementation       | Parameters                   | Use Cases              |
| ------- | --------------- | -------------------- | ---------------------------- | ---------------------- |
| `mixer` | deposit         | Omega Mixer deposit  | None                         | Anonymous transactions |
| `mixer` | deposit-execute | Auto-execute deposit | amount                       | Execute mixer deposit  |
| `mixer` | deposit-direct  | Direct deposit       | private_key, amount          | Direct mixer deposit   |
| `mixer` | withdraw        | Mixer withdrawal     | secret, address              | Withdraw from mixer    |
| `mixer` | withdraw-direct | Direct withdrawal    | private_key, secret, address | Direct withdrawal      |
| `mixer` | help            | Mixer help           | None                         | Show mixer usage       |

#### ENS/ONS Name Service

| Command | Subcommands | Implementation   | Parameters | Use Cases               |
| ------- | ----------- | ---------------- | ---------- | ----------------------- |
| `ens`   | register    | ONS registration | name       | Register ONS name       |
| `ens`   | resolve     | Name resolution  | name       | Resolve name to address |
| `ens`   | search      | Name search      | query      | Search for names        |

#### Messaging & Communication

| Command            | Subcommands | Implementation      | Parameters         | Use Cases              |
| ------------------ | ----------- | ------------------- | ------------------ | ---------------------- |
| `email`            | clearkey    | E2EE key management | None               | Clear encryption key   |
| `dm`               | -           | Direct messaging    | recipient, message | Send encrypted DM      |
| `inbox`/`messages` | all         | Message inbox       | None/all           | View received messages |

#### Gaming System Commands

| Command       | Subcommands | Implementation           | Parameters | Use Cases            |
| ------------- | ----------- | ------------------------ | ---------- | -------------------- |
| `games`       | -           | terminal-games-system.js | None       | Show available games |
| `arcade`      | -           | Arcade interface         | None       | Gaming interface     |
| `flappy`      | -           | Flappy Bird game         | None       | Play Flappy Omega    |
| `omega-io`    | -           | Snake game               | None       | Play Omega.io        |
| `mystery-box` | -           | Mystery box game         | None       | Open mystery boxes   |

#### Profile & Social Commands

| Command   | Subcommands | Implementation             | Parameters | Use Cases           |
| --------- | ----------- | -------------------------- | ---------- | ------------------- |
| `profile` | -           | enhanced-profile-system.js | None       | Show user profile   |
| `profile` | update      | Profile management         | None       | Update profile info |

#### Network & Development Commands

| Command       | Subcommands | Implementation         | Parameters | Use Cases             |
| ------------- | ----------- | ---------------------- | ---------- | --------------------- |
| `network`     | -           | Network status check   | None       | Check current network |
| `rpccheck`    | -           | RPC chain ID check     | None       | Verify RPC connection |
| `forceadd`    | -           | Force network addition | None       | Add network to wallet |
| `stress`      | -           | Stress testing         | None       | Start stress test     |
| `stopstress`  | -           | Stop stress test       | None       | End stress testing    |
| `stressstats` | -           | Stress test stats      | None       | Show test results     |

#### Entertainment & Easter Eggs

| Command    | Subcommands | Implementation       | Parameters | Use Cases          |
| ---------- | ----------- | -------------------- | ---------- | ------------------ |
| `rickroll` | -           | Easter egg animation | None       | Rickroll animation |
| `fortune`  | -           | Fortune display      | None       | Random fortune     |
| `matrix`   | -           | Matrix animation     | None       | Matrix effect      |
| `hack`     | -           | Hacking animation    | None       | Hacker effect      |
| `disco`    | -           | Disco mode           | None       | Disco lights       |
| `stop`     | -           | Stop all animations  | None       | Stop effects       |

## ⚠️ CRITICAL AI USAGE GUIDELINES

### Multi-Network Command Disambiguation

**ALWAYS confirm network/context before executing commands that exist across multiple networks:**

**Trading Commands requiring confirmation:**

- `swap` → Available on: Solana, Near, Eclipse
- `balance` → Shows: OMEGA, SOL, Eclipse, NEAR
- `connect` → Options: MetaMask, Phantom, NEAR, Eclipse wallets
- `quote` → Available on: Solana (Jupiter), Near (Intents), Eclipse (Solar)

### Required Confirmation Flow

**Example Interaction:**

```
User: "I want to swap tokens"
AI: "Which network would you like to use for token swapping?
1. Solana (Jupiter Exchange) - SPL tokens
2. Near Protocol (Cross-chain swaps)
3. Eclipse (Solar DEX) - SVM tokens
4. EVM networks (coming soon)

Please specify which network to proceed with."

User: "Solana"
AI: "Great! I'll help you with Solana token swapping via Jupiter Exchange..."
[Then execute appropriate solana swap commands]
```

### Context-Sensitive Command Selection

**Before executing any command:**

1. **Identify if multiple implementations exist** (trading, wallets, etc.)
2. **Ask for clarification** on specific network/protocol
3. **Confirm parameters** (amounts, addresses, tokens)
4. **Execute the correct network-specific command**
5. **Provide network-specific guidance** and links

This prevents errors, wrong network usage, and ensures user intent is correctly executed across the multi-chain Omega Terminal environment.

---

## 🎯 AI DECISION-MAKING FRAMEWORK

### Quick Command Resolution Guide

**When user mentions these keywords, use these commands:**

**Trading Keywords → Actions:**

- "buy/sell tokens" → Ask for network, then use `solana buy/sell`, `near swap`, or `eclipse buy/sell`
- "check price" → Use `dexscreener <token>`, `cg <token>`, or `geckoterminal <token>`
- "my balance" → Use network-specific: `solana balance`, `balance`, `near wallet`
- "swap tokens" → Clarify network, then use appropriate swap command

**Wallet Keywords → Actions:**

- "connect wallet" → Ask for preference: `connect` (MetaMask), `solana connect` (Phantom), `near wallet`
- "wallet address" → Use `status` or network-specific balance commands
- "send tokens" → Use `send <address> <amount>` or `transfer <address> <amount>`

**Data Keywords → Actions:**

- "token analytics" → Use `dexscreener analytics` or `dexscreener token <address>`
- "market data" → Use `dexscreener trending` or `cg <token>`
- "price history" → Use analytics commands with specific token

**Entertainment Keywords → Actions:**

- "games" → Use `games` to show available options
- "fun features" → Suggest `arcade`, `flappy`, `omega-io`, `mystery-box`
- "change theme" → Use `theme <name>` with available options

**System Keywords → Actions:**

- "help" → Use `help` for command overview
- "clear terminal" → Use `clear` or `cls`
- "customize" → Use `theme <name>` or `profile` commands

### Error Prevention Guidelines

**Always verify before execution:**

1. **Network Confirmation**: Multi-network commands need user clarification
2. **Parameter Validation**: Ensure addresses/amounts are valid format
3. **Wallet Status**: Check if wallet connection needed first
4. **Token Existence**: Verify token symbols/addresses before trading

### Command Success Indicators

**User satisfaction signals:**

- Successful transaction hashes displayed
- Correct balance updates shown
- Requested data retrieved and formatted
- Theme/customization changes applied
- Games/entertainment features launched

This framework ensures accurate command execution while preventing common user errors and confusion.

### Troubleshooting

1. **Check server status** - Ensure Python HTTP server, Node.js relayer, and Polymarket proxy are running
2. **Verify browser console** - Check for JavaScript errors
3. **Test API connectivity** - Verify external API access
4. **Check wallet connection** - Ensure wallet is properly connected

### Getting Help

- **Documentation:** This file contains all command references
- **Console Logs:** Check browser console for detailed error information
- **API Status:** Verify external API availability
- **Network Issues:** Check internet connectivity and CORS settings

---

**This comprehensive documentation enables you to fully understand and interact with the Omega Terminal, providing complete automation capabilities while maintaining security and user experience standards.**
````
