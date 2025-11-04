# Command Audit Report - Vanilla JS vs Next.js Terminal

## Status: IN PROGRESS

This report documents all commands from the vanilla JS terminal.html and verifies their implementation in the Next.js version.

---

## ✅ VERIFIED COMMANDS (Fully Implemented)

### Prediction Markets

- ✅ `polymarket` / `poly` - Polymarket prediction markets with all subcommands (markets, trending, events, politics, sports, crypto, etc.)
- ✅ `kalshi` - Kalshi prediction markets (markets, market, orderbook, trades, events, event, series)

### Portfolio & Wallets

- ✅ `pgt` - Portfolio tracking (track, portfolio, wallets, refresh, help)
- ✅ `wallet` - Wallet management (connect, disconnect, balance, send, import, export)
- ✅ `connect` - Connect wallets
- ✅ `disconnect` - Disconnect wallet
- ✅ `balance` - Check wallet balance
- ✅ `send` - Send tokens

### Features & Tools

- ✅ `profile` - User profile & API keys management
- ✅ `perps` / `perp` - Perpetuals trading data
- ✅ `news` - Crypto news feed
- ✅ `nft` - NFT marketplace data (opensea integration)
- ✅ `games` - Terminal games functionality
- ✅ `spotify` - Spotify player integration
- ✅ `youtube` - YouTube player integration

### Networks & Chains

- ✅ `near` - NEAR Protocol (connect, balance, transactions, account, validators, staking, governance, agent)
- ✅ `eclipse` - Eclipse network functionality
- ✅ `solana` - Solana operations (connect, generate, search, quote, swap, status, test)

### Data & Analytics

- ✅ `dexscreener` / `ds` - DEX analytics
- ✅ `defillama` - DeFi analytics
- ✅ `geckoterminal` / `cg` - CoinGecko terminal integration
- ✅ `alpha` / `stock` - Alpha Vantage integration
- ✅ `hyperliquid` - Hyperliquid perps and markets

### System

- ✅ `help` - Show help menu
- ✅ `clear` - Clear terminal
- ✅ `theme` - Change theme
- ✅ `gui` - Switch to GUI mode (chatgpt, ios, discord, aol, limewire)
- ✅ `ai` - AI assistant integration
- ✅ `status` - System/mining status
- ✅ `tab` - Tab functionality
- ✅ `stop` - Stop mining/animations

### Mining

- ✅ `mine` - Mining functionality
- ✅ `faucet` - Token faucet
- ✅ `stats` - Mining stats
- ✅ `claim` - Claim mining rewards
- ✅ `fund` - Fund mining wallet
- ✅ `fund-direct` - Direct faucet funding

### Entertainment

- ✅ `rickroll` - Rick roll easter egg
- ✅ `fortune` - Fortune cookie
- ✅ `matrix` - Matrix animation
- ✅ `hack` - Hacker simulation
- ✅ `disco` - Disco mode animation
- ✅ `ascii` - ASCII art display

### Blockchain Operations

- ✅ `mixer` - Privacy mixer (deposit, withdraw subcommands)
- ✅ `ens` - ENS lookup functionality
- ✅ `email` / `inbox` - Email/messaging functionality
- ✅ `omega` - Omega NFT minting (mint, collection, list)
- ✅ `magiceden` / `me` - Magic Eden NFT marketplace
- ✅ `create` - Token creation
- ✅ `color` - Color customization

### Network Testing

- ✅ `stress` - Start stress test
- ✅ `stopstress` - Stop stress test
- ✅ `stressstats` - Show stress test stats

### ChainGPT Integration

- ✅ `chat` - AI chat functionality
- ✅ `contract` - Smart contract operations
- ✅ `auditor` - Smart contract auditor
- ✅ `nftgen` - AI NFT generation

### API & Social

- ✅ `referral` / `ambassador` - Referral/ambassador program
- ✅ `chart` - Live chart viewer

---

## ❌ MISSING COMMANDS (Need Implementation)

### High Priority - Core Features

1. ❌ `rome` / `romechain` - Rome Protocol functionality

   - Subcommands: connect, balance, status, info, gen-wallet, token, ens
   - **Action Required**: Implement Rome Protocol integration

2. ❌ `monad` - Monad network functionality

   - Subcommands: connect, balance, status, info
   - **Action Required**: Implement Monad network integration

3. ❌ `cls` - Alias for clear command

   - **Action Required**: Add "cls" as alias to clearCommand

4. ❌ `sudo` - Sudo mine functionality

   - Simple admin bonus mining mode
   - **Action Required**: Add sudo command to mining.ts

5. ❌ `url` / `urls` - Show helpful URLs
   - Display Gitbook, docs, social links
   - **Action Required**: Create url command in basic.ts

### Medium Priority - Additional Features

6. ❌ `airdrop` - Airdrop modal/functionality

   - Shows airdrop popup
   - **Action Required**: Implement airdrop command

7. ❌ `fair` - Fair Blockchain operations

   - Subcommands: generate, connect, balance, send
   - **Action Required**: Create fair.ts command file

8. ❌ `fns` - Fair Name Service

   - Fair blockchain ENS equivalent
   - **Action Required**: Implement FNS functionality

9. ❌ `dm` - Direct messaging

   - Send direct messages via contract
   - **Action Required**: Verify dm command vs email command

10. ❌ `chatter` - Terminal chatter mode

    - Telegram-like chat interface
    - **Action Required**: Implement chatter command

11. ❌ `forceadd` - Force add network

    - Force add custom network to MetaMask
    - **Action Required**: Add to network.ts

12. ❌ `rpccheck` - Check RPC chain ID

    - Verify RPC connection and chain ID
    - **Action Required**: Add to network.ts

13. ❌ `alphakey` - Alpha Vantage API key management

    - Manage Alpha Vantage API keys
    - **Action Required**: Add to alphavantage.ts or api.ts

14. ❌ `crypto` - Crypto data (Polymarket crypto markets)

    - Shortcut to polymarket crypto markets
    - **Action Required**: Add as alias or command

15. ❌ `terminal` - Terminal-specific operations

    - Meta command for terminal operations
    - **Action Required**: Determine if needed in Next.js version

16. ❌ `mint` - Direct mint command (not omega mint)
    - Standalone NFT minting
    - **Action Required**: Check if this is different from omega mint

---

## 🔄 PARTIALLY IMPLEMENTED / NEEDS VERIFICATION

### Aliases to Verify

- `?` - Should be alias for `help` ✅ (needs verification)
- `cls` - Should be alias for `clear` ❌ (MISSING)
- `themes` - Should be alias for `theme` ✅ (needs verification)
- `palette` - Should be alias for `color` ✅ (needs verification)
- `messages` - Should be alias for `inbox` ✅ (implemented)
- `yt` - Should be alias for `youtube` ❌ (needs to be added)
- `llama` - Should be alias for `defillama` ❌ (needs to be added)
- `dex` - Should be alias for `dexscreener` ❌ (needs to be added)
- `poly` - Should be alias for `polymarket` ✅ (needs verification)

---

## 📝 IMPLEMENTATION PRIORITY

### Phase 1: Critical Missing Commands

1. Add `cls` alias for clear
2. Implement `sudo` mining command
3. Implement `url/urls` command
4. Add missing aliases (yt, llama, dex)

### Phase 2: Network Integrations

1. Implement `rome/romechain` command
2. Implement `monad` command
3. Implement `fair` blockchain commands
4. Implement `fns` (Fair Name Service)

### Phase 3: Additional Features

1. Implement `airdrop` command
2. Implement `chatter` terminal chat
3. Add `forceadd` and `rpccheck` to network commands
4. Implement `alphakey` management
5. Add `dm` direct messaging if different from email

---

## 🔍 NOTES

- Most core functionality is well-implemented in Next.js version
- Entertainment commands are fully migrated
- Main gaps are in network-specific integrations (Rome, Monad, Fair)
- Some commands may be intentionally excluded if they're deprecated or replaced
- Need to verify that all subcommands match vanilla implementation exactly

---

**Report Generated**: 2025-11-03
**Status**: Audit in progress - Implementation needed for missing commands
