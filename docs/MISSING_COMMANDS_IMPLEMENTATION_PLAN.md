# Missing Commands - Implementation Plan

## Commands Successfully Verified & Updated

### ✅ Phase 1 Complete: Basic Aliases Added

1. **`cls`** ➜ Added as alias for `clear` command ✅
2. **`?`** ➜ Added as alias for `help` command ✅
3. **`themes`** ➜ Added as alias for `theme` command ✅

---

## Commands That Need Aliases Added

### Aliases to Add (Quick Fixes)

1. **`yt`** ➜ Add as alias for `youtube` command

   - File: `/omega-terminal-nextjs/src/lib/commands/youtube.ts`
   - Change line ~237: Add `aliases: ["yt"]`

2. **`palette`** ➜ Add as alias for `color` command

   - File: `/omega-terminal-nextjs/src/lib/commands/color.ts`
   - Change line ~47: Add `aliases: ["palette"]`

3. **`llama`** ➜ Add as alias for `defillama` command

   - File: `/omega-terminal-nextjs/src/lib/commands/defillama.ts`
   - Change line ~42: Add `aliases: ["llama"]`

4. **`dex`** ➜ Add as alias for `dexscreener` command
   - File: `/omega-terminal-nextjs/src/lib/commands/dexscreener.ts`
   - Already has `aliases: ["ds"]`, add `"dex"` to the array

---

## NEW COMMANDS TO IMPLEMENT

### Priority 1: Simple Utility Commands (< 30 min each)

#### 1. **`url` / `urls`** Command

**Purpose**: Display helpful URLs (Gitbook, docs, social links)
**File to create**: `/omega-terminal-nextjs/src/lib/commands/urls.ts`
**Implementation**:

```typescript
export const urlCommand: Command = {
  name: "url",
  aliases: ["urls"],
  description: "Display helpful URLs and resources",
  handler: (context: CommandContext) => {
    context.log("📚 Helpful URLs:", "info");
    context.log("", "output");
    context.logHtml(
      '<a href="https://omega-6.gitbook.io/omega" target="_blank">📖 Gitbook Documentation</a>',
      "output"
    );
    context.logHtml(
      '<a href="https://discord.gg/omega" target="_blank">💬 Discord Community</a>',
      "output"
    );
    context.logHtml(
      '<a href="https://twitter.com/omegaterminal" target="_blank">🐦 Twitter</a>',
      "output"
    );
    context.logHtml(
      '<a href="https://github.com/omega-terminal" target="_blank">💻 GitHub</a>',
      "output"
    );
  },
};
```

#### 2. **`sudo`** Command

**Purpose**: Super user mining mode with admin bonus
**File to add to**: `/omega-terminal-nextjs/src/lib/commands/mining.ts`
**Implementation**:

```typescript
export const sudoCommand: Command = {
  name: "sudo",
  description: "Super user mining mode",
  handler: async (context: CommandContext) => {
    context.log("🔐 Sudo access granted!", "info");
    context.log("⚡ Super user mining mode activated!", "success");
    context.log("🚀 Mining with admin privileges...", "output");
    context.log("💰 Admin bonus: +0.1 OMEGA", "success");

    // Play sound effect if available
    if (context.sound) {
      context.sound.playBalanceWealthSound().catch(() => {});
    }
  },
};
```

#### 3. **`forceadd`** Command

**Purpose**: Force add network to MetaMask
**File to add to**: `/omega-terminal-nextjs/src/lib/commands/network.ts`
**Implementation**: Similar to network switching but forces the add operation

#### 4. **`rpccheck`** Command

**Purpose**: Check RPC connection and chain ID
**File to add to**: `/omega-terminal-nextjs/src/lib/commands/network.ts`
**Implementation**: Verify RPC endpoint and display chain ID info

#### 5. **`alphakey`** Command

**Purpose**: Alpha Vantage API key management message
**File to add to**: `/omega-terminal-nextjs/src/lib/commands/alphavantage.ts`
**Implementation**: Just shows info message that API key is managed by relayer

---

### Priority 2: Blockchain Network Commands (1-2 hours each)

#### 6. **`rome` / `romechain`** Command

**Purpose**: Rome Protocol integration
**File to create**: `/omega-terminal-nextjs/src/lib/commands/rome.ts`
**Subcommands needed**:

- `rome connect` - Connect to Rome Network
- `rome balance` - Check Rome Network balance
- `rome status` - Show Rome Network status
- `rome info` - Display Rome Network information
- `rome gen-wallet` - Generate a new Rome wallet
- `rome token create` - Create a new token on Rome
- `rome ens` - ENS commands (register/resolve)

**Status**: Full implementation required from vanilla version

#### 7. **`monad`** Command

**Purpose**: Monad network integration
**File to create**: `/omega-terminal-nextjs/src/lib/commands/monad.ts`
**Subcommands needed**:

- `monad connect` - Connect to MONAD Network
- `monad balance` - Check MONAD Network balance
- `monad status` - Show MONAD status
- `monad info` - Display MONAD information

**Status**: Full implementation required from vanilla version

#### 8. **`fair`** Command

**Purpose**: Fair Blockchain operations
**File to create**: `/omega-terminal-nextjs/src/lib/commands/fair.ts`
**Subcommands needed**:

- `fair generate` - Generate a new FAIR wallet
- `fair connect` - Connect MetaMask to FAIR network
- `fair balance` - Check FAIR balance
- `fair send` - Send FAIR tokens

**Status**: Full implementation required from vanilla version

#### 9. **`fns`** Command

**Purpose**: Fair Name Service (ENS equivalent for Fair blockchain)
**File to create**: `/omega-terminal-nextjs/src/lib/commands/fns.ts`  
**Status**: Requires Fair blockchain integration first

---

### Priority 3: Feature Commands (1-3 hours each)

#### 10. **`airdrop`** Command

**Purpose**: Display airdrop modal/popup
**File to create**: `/omega-terminal-nextjs/src/lib/commands/airdrop.ts`
**Implementation**: Create modal with airdrop image/information

#### 11. **`chatter`** Command

**Purpose**: Terminal chatter mode (Telegram-like chat)
**File to create**: `/omega-terminal-nextjs/src/lib/commands/chatter.ts`
**Status**: Requires chat UI component implementation

#### 12. **`dm`** Command

**Purpose**: Direct messaging (if different from email)
**Status**: Need to verify if this is duplicate of email/inbox command
**Action**: Review vanilla implementation to check if it's just an alias

#### 13. **`crypto`** Command

**Purpose**: Shortcut to Polymarket crypto markets
**File to add to**: `/omega-terminal-nextjs/src/lib/commands/polymarket.ts`
**Implementation**: Add as helper command or alias

---

## Commands Confirmed Working

The following commands are fully implemented and working:

- ✅ polymarket / poly
- ✅ kalshi
- ✅ pgt
- ✅ wallet (all subcommands)
- ✅ connect, disconnect, balance, send
- ✅ profile
- ✅ perps / perp
- ✅ news
- ✅ nft / opensea
- ✅ games / play
- ✅ spotify
- ✅ youtube (needs `yt` alias)
- ✅ near
- ✅ eclipse
- ✅ solana
- ✅ dexscreener / ds (needs `dex` alias)
- ✅ defillama (needs `llama` alias)
- ✅ geckoterminal / cg
- ✅ alpha / stock
- ✅ hyperliquid
- ✅ clear (now has `cls` alias) ✅
- ✅ theme (now has `themes` alias) ✅
- ✅ gui
- ✅ help (now has `?` alias) ✅
- ✅ ai
- ✅ status
- ✅ tab
- ✅ stop
- ✅ chart
- ✅ omega (mint, collection)
- ✅ magiceden / me
- ✅ mine
- ✅ faucet
- ✅ stats
- ✅ claim
- ✅ fund
- ✅ fund-direct
- ✅ rickroll
- ✅ fortune
- ✅ matrix
- ✅ hack
- ✅ disco
- ✅ ascii
- ✅ mixer
- ✅ ens
- ✅ email / inbox
- ✅ color (needs `palette` alias)
- ✅ stress, stopstress, stressstats
- ✅ chat (ChainGPT)
- ✅ contract (ChainGPT)
- ✅ auditor (ChainGPT)
- ✅ nftgen (ChainGPT NFT)
- ✅ referral / ambassador
- ✅ create (token factory)

---

## Implementation Time Estimates

### Quick Wins (Today - 1-2 hours total)

- Add remaining aliases: `yt`, `palette`, `llama`, `dex` (15 min)
- Implement `url/urls` command (10 min)
- Implement `sudo` command (10 min)
- Implement `alphakey` command (5 min)
- Implement `forceadd` command (15 min)
- Implement `rpccheck` command (15 min)

### Medium Priority (This Week - 4-8 hours total)

- Implement `rome` / `romechain` command (2-3 hours)
- Implement `monad` command (1-2 hours)
- Implement `fair` blockchain commands (2-3 hours)

### Lower Priority (As Needed)

- Implement `fns` command (requires Fair first)
- Implement `airdrop` command (1 hour)
- Implement `chatter` command (2-3 hours)
- Verify `dm` vs `email` duplication

---

## Next Steps

1. ✅ **COMPLETED**: Added `cls`, `?`, `themes` aliases
2. **TODO NEXT**: Add remaining aliases (`yt`, `palette`, `llama`, `dex`)
3. **TODO NEXT**: Implement simple utility commands (url, sudo, alphakey, forceadd, rpccheck)
4. **TODO NEXT**: Implement network commands (rome, monad, fair)
5. **TODO LAST**: Implement feature commands (airdrop, chatter, fns)

---

**Updated**: 2025-11-03
**Status**: Phase 1 Complete (Basic Aliases) ✅
**Next Phase**: Add Remaining Aliases + Simple Utility Commands
