# Sidebar Dashboard Cross-Verification

**Date**: November 2, 2025  
**Task**: Ensure Next.js dashboard sidebar matches vanilla version 100%

## Vanilla JS Sidebar Sections

### 1. QUICK ACTIONS ✅

**Vanilla Buttons**:

- System Help → `help` ✅ MATCH
- Connect Wallet → `MultiNetworkConnector.showNetworkSelector()` ✅ MATCH
- Claim Faucet → `faucet` ✅ MATCH
- AI Assistant (expandable) ✅ MATCH
  - Local AI Toggle ✅ MATCH
  - Local AI Help ✅ MATCH
- Basic View toggle ✅ MATCH
- Clear Terminal → `clear` ✅ MATCH
- Terminal Style (expandable) ✅ MATCH
  - **Color Palettes**: ✅ ALL MATCH
    - Cycle Palette
    - Crimson, Anime, Ocean, Forest, Sunset, Purple, Cyber, Gold, Ice, Fire
    - Reset Default
  - **Themes**: ✅ ALL MATCH
    - Cycle Theme
    - Executive, Modern UI, Dark, Light, Matrix, Retro, PowerShell

**Next.js**: ✅ **IDENTICAL**

---

### 2. CRYPTO NEWS ✅

**Vanilla Buttons**:

- Open News Reader → `OmegaNewsReader.openPanel()` ✅ MATCH
- Latest News → `news latest` ✅ MATCH
- Trending News → `news hot` ✅ MATCH
- Crypto News (expandable) ✅ MATCH
  - Bitcoin News → `news btc` ✅ MATCH
  - Ethereum News → `news eth` ✅ MATCH
  - Solana News → `news sol` ✅ MATCH
  - Search News → `news search` ✅ MATCH
  - News Articles → `news category news` ✅ MATCH
  - News Sources → `news sources` ✅ MATCH
  - Expand All → `news expand-all` ✅ MATCH
  - Collapse All → `news collapse-all` ✅ MATCH
  - Clear & Reload → `news clear-expansions` ✅ MATCH
  - News Help → `news help` ✅ MATCH

**Next.js**: ✅ **IDENTICAL**

---

### 3. NFT EXPLORER ⚠️

**Vanilla Buttons**:

- Solana NFTs (expandable)
  - View Collection → `magiceden view <symbol>` ✅
  - Trending NFTs → `magiceden trending 7d` ✅
  - Collection Activity → `magiceden activities <symbol>` ✅
  - Collection Stats → `magiceden stats <symbol>` ✅
  - Listings → `magiceden listings <symbol>` ✅
  - Holder Stats → `magiceden holders <symbol>` ✅
  - Attributes → `magiceden attributes <symbol>` ✅
  - Magic Eden Help → `magiceden help` ✅
- EVM (Coming Soon) - disabled button ❌ **MISSING IN NEXT.JS**

**Next.JS**: Has NFT Explorer section but need to verify content matches

---

### 4. TRADING & ANALYTICS ⚠️

**Vanilla Buttons**:

- Omega Perps → `OmegaPerpsViewer.openPanel()` ✅
- Live Charts (expandable)
  - Bitcoin Chart
  - Ethereum Chart
  - Solana Chart
  - Gold Chart
  - Silver Chart
  - Custom Chart
- Market Analytics (expandable)
  - BTC Analytics → `dexscreener search BTC` ✅
  - ETH Analytics → `dexscreener search ETH` ✅
  - SOL Analytics → `dexscreener search SOL` ✅
  - Custom Token
- DeFi Llama (expandable)
  - Total DeFi TVL → `defillama tvl` ✅
  - Top 5 Protocols → `defillama protocols 5` ✅
  - Top 10 Chains → `defillama chains 10` ✅
  - Protocol TVL
  - ETH Price → `defillama price ethereum` ✅
  - Multi-Token Prices → `defillama tokens eth,btc,sol` ✅
  - Custom Token Price
  - Trending Protocols → `defillama trending` ✅
  - Debug Token Price

**Next.JS**: Has Trading & Analytics section - NEED TO VERIFY MATCHES

---

### 5. PORTFOLIO TRACKER ⚠️

**Vanilla Buttons**:

- Check Balance → `balance` ✅
- Track Wallet (expandable)
  - Track New Wallet → `pgt track <address>`
  - View Portfolio → `pgt portfolio`
  - List Wallets → `pgt wallets`
  - Refresh Data → `pgt refresh`

**Next.JS**: Simplified - has `me`, `pgt`, `portfolio` - ❌ **NOT MATCHING**

---

### 6. NETWORK ❌ **MAJOR DIFFERENCES**

**Vanilla Buttons**:

#### EVM Networks (expandable)

- Connect Wallet → `connect`
- Disconnect → `disconnect`
- Check Balance → `balance`
- Send Tokens → `send <amount> <address>`
- Network badges (Ethereum, BSC, Polygon, Arbitrum, Optimism, Base)

#### Omega Network (expandable)

**Ambassador Program**:

- Create Referral Code → `referral create`
- View Stats → `referral stats`
- Leaderboard → `referral leaderboard`
- Share on Twitter → `referral share twitter`
- Share on Discord → `referral share discord`
- Open Dashboard → `referral dashboard`

**Network Tools**:

- Claim Faucet → `faucet`
- Check Balance → `balance`
- Rome Commands → `rome help`

**External Links**:

- Omega Network (https://omeganetwork.co/landing)
- Discord
- X (Twitter)

#### Solana (expandable)

- Connect Phantom → `solana connect`
- Generate Wallet → `solana generate`
- Wallet Status → `solana status`
- Token Swap → `solana swap`
- Search Tokens → `solana search <query>`

#### NEAR Protocol (expandable)

- Connect NEAR Wallet → `near connect`
- Disconnect Wallet → `near disconnect`
- Check Balance → `near balance`
- Account Info → `near account`
- Token Swap → `near swap`
- Get Swap Quote → `near quote <from> <to> <amount>`
- View Validators → `near validators`
- NEAR Help → `near help`

#### ROME Network (expandable)

- ROME Help → `rome help`
- Create Token → `rome token create`
- Network Status → `rome network status`
- Check Balance → `rome balance`
- View Transactions → `rome transactions`
- Validators → `rome validators`

#### FAIR Blockchain (expandable)

- FAIR Help → `fair help`
- Generate Wallet → `fair generate`
- Connect MetaMask → `fair connect`
- Check Balance → `fair balance`
- Network Info → `fair network`
- View Transactions → `fair transactions`

#### MONAD Network (expandable)

- MONAD Help → `monad help`
- Connect Wallet → `monad connect`
- Check Balance → `monad balance`
- Network Info → `monad network`
- Validators → `monad validators`
- View Transactions → `monad transactions`
- Staking → `monad staking`
- Governance → `monad governance`

**Next.JS**: Only has simple buttons for `solana`, `near`, `eclipse`, `network` - ❌ **COMPLETELY DIFFERENT**

---

### 7. TRANSACTIONS ⚠️

**Vanilla Buttons**:

- Send Tokens → `send <amount> <address>`
- Send Email → `email`
- View Inbox → `inbox`

**Next.JS**: Has `send`, `inbox`, `history` - ❌ **SLIGHTLY DIFFERENT** (has `history`, missing email command button label)

---

### 8. CHAINGPT TOOLS ⚠️

**Vanilla Buttons**:

#### ChainGPT Chat (expandable)

- Custom API Key → `chat init <key>`
- Ask Question → `chat ask <question>`
- Stream Response → `chat stream <question>`
- With Context → `chat context <question>`
- With Memory → `chat history <question>`
- Test API → `chat test`
- Chat Help → `chat help`

#### NFT Generator (expandable)

- Initialize → `nft init <key>`
- Generate NFT → `nft generate <prompt>`
- Enhance Prompt → `nft enhance <prompt>`
- View Models → `nft models`
- View Styles → `nft styles`
- View Gallery → `nft gallery`
- Test Generator → `nft test`
- NFT Help → `nft help`

#### Smart Contract Generator (expandable)

- Initialize → `contract init <key>`
- Generate Contract → `contract generate <description>`
- Solidity Contract
- Rust Contract
- Advanced Options
- Test Generator → `contract test`
- Contract Help → `contract help`

#### Smart Contract Auditor (expandable)

- Initialize → `audit init <key>`
- Audit Contract → `audit <contractCode>`
- Quick Audit
- Full Security Report
- Gas Optimization
- Test Auditor → `audit test`
- Auditor Help → `audit help`

**Next.JS**: Has ChainGPT Tools section - NEED TO VERIFY MATCHES

---

### 9. MUSIC PLAYER ✅

**Vanilla Buttons**:

- Open Spotify → `spotify.openPanel()`
- Search & Play → `spotify search <query>`
- Next Track → `spotify next`
- Previous Track → `spotify prev`
- Play/Pause → `spotify pause`

**Next.JS**: Has Music Player section with `openPanel`, `togglePlayPause`, `skipNext`, `skipPrevious` - ⚠️ **SLIGHTLY DIFFERENT** (missing search button)

---

### 10. YOUTUBE PLAYER ⚠️

**Vanilla Buttons**:

- Open YouTube → `youtube.openPanel()`
- Search Bitcoin → `yt search bitcoin`
- Search Ethereum → `yt search ethereum`
- Search Crypto News → `yt search crypto news`
- Search Tutorials → `yt search web3 tutorial`
- Play Controls:
  - Play/Pause → `yt pause`
  - Stop → `yt stop`
  - Next → `yt next`
  - Previous → `yt prev`
  - Volume Up/Down
  - Mute/Unmute
- YouTube Help → `yt help`

**Next.JS**: Only has `openPanel` and `yt search bitcoin` - ❌ **MISSING MANY BUTTONS**

---

## Summary of Differences

### ✅ Perfect Matches

1. Quick Actions
2. Crypto News

### ⚠️ Minor Differences

1. Portfolio Tracker - simplified
2. Music Player - missing search button
3. Transactions - has `history` instead of email button label

### ❌ Major Differences

1. **Network Section** - Completely different structure
   - Missing: EVM, Omega (with referrals), ROME, FAIR, MONAD subsections
   - Missing: External links section
2. **NFT Explorer** - Missing "EVM (Coming Soon)" button
3. **Trading & Analytics** - Need to verify subsections
4. **YouTube Player** - Missing most control buttons
5. **ChainGPT Tools** - Need to verify all subsections

---

## Action Items

### HIGH PRIORITY

1. ❌ **Network Section** - Add all missing subsections:

   - EVM Networks expandable
   - Omega Network expandable (with Ambassador Program, Network Tools, External Links)
   - Solana expandable
   - NEAR Protocol expandable
   - ROME Network expandable
   - FAIR Blockchain expandable
   - MONAD Network expandable

2. ❌ **YouTube Player** - Add missing buttons:

   - Search presets (Ethereum, Crypto News, Tutorials)
   - Play controls (Play/Pause, Stop, Next, Prev, Volume, Mute)
   - YouTube Help

3. ⚠️ **Verify & Fix**:
   - Trading & Analytics subsections
   - ChainGPT Tools subsections
   - NFT Explorer "EVM (Coming Soon)"

### MEDIUM PRIORITY

1. ⚠️ **Music Player** - Add search button
2. ⚠️ **Transactions** - Update button label for email
3. ⚠️ **Portfolio Tracker** - Add expandable with pgt subcommands

---

## Implementation Plan

1. Read sidebar-sections files in Next.js
2. Compare each section with vanilla
3. Add missing sections/subsections
4. Update existing sections to match exactly
5. Test all buttons execute the correct commands
6. Verify UI/styling matches vanilla

---

**Status**: 🚧 IN PROGRESS  
**Target**: 100% Feature Parity  
**Priority**: HIGH
