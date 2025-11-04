# AI Datasheet Migration Guide: v3.0.0 → v4.0.0

**Date:** January 16, 2025  
**Purpose:** Guide for updating AI agents from v3 to v4 datasheet

---

## 🎯 WHAT CHANGED

### **Critical Updates in v4.0.0:**

1. ✅ **Wallet Connection State Sync** (CRITICAL FIX)
2. ✅ **Multi-Network Asset Recognition** (ETH, BNB, MATIC, etc.)
3. ✅ **NFT Creation Command** (NEW)
4. ✅ **Profile System** (NEW + Redesigned)
5. ✅ **Solana Commands Routing** (FIXED)
6. ✅ **Quick Actions Enhancement** (Terminal input, no popups)
7. ✅ **Build Tools Section** (NEW quick actions category)
8. ✅ **Real-Time Wallet Sync** (Profile feature)

---

## 🔧 CRITICAL BEHAVIOR CHANGES

### 1. Wallet Connection (MUST UPDATE AI LOGIC)

**v3.0.0 (OLD - HAD BUG):**
```
User: connect
Terminal: ✅ Connected!

User: mine
Terminal: ❌ Please connect your wallet first

AI must say: "Please connect your wallet"
```

**v4.0.0 (NEW - FIXED):**
```
User: connect  
Terminal: ✅ Connected!
          ⛏️ Mining contract connected!

User: mine
Terminal: ⛏️ Starting mining...

AI can proceed without asking to connect again
```

**AI UPDATE REQUIRED:**
```diff
- if (command requires wallet) {
-   always tell user to connect first
- }

+ if (user just connected in this session) {
+   wallet IS available, proceed with command
+ }
```

---

### 2. Balance Currency Display (MUST UPDATE)

**v3.0.0 (OLD):**
```
AI assumption: Balance always shows "OMEGA"
AI response: "Your OMEGA balance is..."
```

**v4.0.0 (NEW):**
```
AI must check: What network is user on?
AI response: 
- Ethereum → "Your ETH balance is..."
- BNB Chain → "Your BNB balance is..."
- Polygon → "Your MATIC balance is..."
- Omega → "Your OMEGA balance is..."
```

**AI UPDATE REQUIRED:**
```diff
- User balance is always in OMEGA

+ User balance is in native currency of connected network
+ Check terminal output for currency symbol
+ ETH, BNB, MATIC, OMEGA, SOL all possible
```

---

### 3. Solana Commands (MUST UPDATE)

**v3.0.0 (OLD - BROKEN):**
```
Commands available:
- solana connect ✅
- solana search ✅
- solana swap ✅
- solana wallet ❌ (showed NEAR error)
- solana status ❌ (showed NEAR error)
- solana balance ❌ (showed NEAR error)
```

**v4.0.0 (NEW - FIXED):**
```
ALL Solana commands work:
- solana connect ✅
- solana generate ✅ FIXED
- solana status ✅ FIXED
- solana test ✅ FIXED  
- solana search ✅
- solana swap ✅
```

**AI UPDATE REQUIRED:**
```diff
- Use "solana wallet" or "solana balance"
+ Use "solana status" to check wallet

- Expect NEAR error for unknown subcommands
+ All Solana subcommands now route correctly
```

---

## 🆕 NEW COMMANDS TO ADD

### NFT Creation (NEW in v4.0.0)

**Add to AI Knowledge:**
```
Command: nft
Purpose: Deploy ERC721 NFT collection
Network: Omega Network
Interactive: Yes
Prompts: name, symbol, baseURI, maxSupply, initialMint
Returns: NFT collection contract address
```

**AI Response Pattern:**
```
User: "Create NFT" or "Make NFT collection"
AI: "I'll launch the NFT collection creator..."
Execute: nft
```

---

### Profile Management (NEW in v4.0.0)

**Add to AI Knowledge:**
```
Command: profile
Purpose: Open enhanced profile manager
Features:
- Real-time wallet display
- Profile picture upload
- Username/email settings
- ENS registration
- Address book
- Python scripts
- API keys
- Terminal Chatter access

Updates: Every 1 second while open
Wallet Sources: OmegaWallet, terminal, MultiNetworkConnector
Click-to-Copy: Full wallet address
```

**AI Response Pattern:**
```
User: "Show my profile" or "What's my address?"
AI: "I'll open your profile..."
Execute: profile
```

---

## ⚡ QUICK ACTIONS BEHAVIOR CHANGE

### v3.0.0 (OLD):
Quick actions that needed input used browser `prompt()` popups

### v4.0.0 (NEW):
Quick actions use terminal command input

**AI MUST UPDATE EXPLANATIONS:**

**OLD Response:**
"Click the button and a popup will ask for the token name."

**NEW Response:**
"Click the button and the terminal will prompt you to enter the token name directly in the command box."

---

## 📋 NEW QUICK ACTION CATEGORIES

### Build Tools (NEW Section)
```
🏗️ BUILD TOOLS (expandable)
  ├─ 🪙 Create Token
  ├─ 🎨 Create NFT Collection (NEW)
  ├─ 📛 Register ENS Name  
  └─ 🔐 Privacy Mixer
```

### Transactions (NEW Section)
```
💸 TRANSACTIONS
  ├─ Send Tokens
  ├─ Send Email
  └─ View Inbox
```

### Solana Tools (UPDATED)
```
◎ SOLANA TOOLS (expandable)
  ├─ Connect Phantom
  ├─ Generate Wallet (NEW)
  ├─ Wallet Status (NEW)
  ├─ Token Swap
  └─ Search Tokens (NEW)
```

---

## 🎨 THEME UNIFORMITY (NEW CONCEPT)

### v4.0.0 Color System

AI should understand the color-coding system:

**Matrix Green** (`#00ff88`):
- Primary actions
- Success states
- Main buttons
- Wallet address
- Mining-related

**Cyber Blue** (`#00d4ff`):
- ENS system
- Links
- Secondary actions
- Email/communication

**Neon Purple** (`#9d00ff`):
- Address book
- Contacts

**Neon Pink** (`#ff0099`):
- Chat/social
- Community features

**Warning Amber** (`#ffaa00`):
- Python scripts
- API keys
- Warnings

**Danger Red** (`#ff3366`):
- Delete actions
- Close buttons
- Errors

**When describing UI to users, AI can mention:**
"The sections are color-coded: green for core actions, blue for ENS, purple for contacts, pink for chat, and amber for developer tools."

---

## 🚀 DEPLOYMENT CHECKLIST FOR AI

Before going live with v4.0.0 datasheet:

- ✅ Update wallet connection logic (assume connected after `connect`)
- ✅ Update balance response (network-specific currency)
- ✅ Add `nft` command knowledge
- ✅ Add `profile` command knowledge
- ✅ Update Solana command routing (all work now)
- ✅ Update quick actions explanations (no popups)
- ✅ Add new quick action categories
- ✅ Update troubleshooting (v4.0.0 bugs fixed)
- ✅ Test responses with new scenarios

---

## 📖 BACKWARDS COMPATIBILITY

### Commands That Changed Behavior:

| Command | v3.0.0 | v4.0.0 | Change |
|---------|--------|--------|--------|
| `mine` | Sometimes failed after connect | Always works after connect | FIXED |
| `balance` | Always showed OMEGA | Shows network currency | ENHANCED |
| `solana status` | Didn't exist (routed to NEAR) | Works correctly | FIXED |
| `nft` | Didn't exist | Creates NFT collection | NEW |
| `profile` | Didn't exist | Opens profile manager | NEW |

### Commands That Stayed Same:
- `connect` - Still opens network selector (enhanced internally)
- `help` - Still shows command list
- `create` - Still creates tokens
- `send` - Still sends tokens
- `email` - Still sends messages
- All other commands unchanged

---

## 🎯 AI TESTING SCENARIOS

Test your AI with these scenarios to verify v4.0.0 understanding:

### Scenario 1: Wallet Connection
```
User: "connect"
AI: [Opens selector]
User: "Connected to Ethereum!"
User: "Start mining"
AI Response Should Be:
✅ "Mining only works on Omega Network. You're on Ethereum. Type `connect` and select Omega Network, then use `mine`."
❌ NOT: "Please connect your wallet first"
```

### Scenario 2: Balance Check
```
User: "What's my balance?"
AI: [Executes balance]
Terminal: "💰 Polygon Wallet Balance: 450.78 MATIC"
AI Response Should Be:
✅ "You have 450.78 MATIC in your Polygon wallet."
❌ NOT: "You have 450.78 OMEGA"
```

### Scenario 3: NFT Creation
```
User: "Create NFT"
AI Response Should Be:
✅ "I'll launch the NFT collection creator..." [Execute: nft]
❌ NOT: "NFT creation not available" or "Use create command"
```

### Scenario 4: Solana Wallet
```
User: "Check Solana wallet"
AI Response Should Be:
✅ "I'll check your Solana wallet status..." [Execute: solana status]
❌ NOT: "Use solana wallet command" (that would trigger NEAR error in old versions)
```

### Scenario 5: Profile Access
```
User: "Show my wallet address"
AI Response Should Be:
✅ "I'll open your profile..." [Execute: profile]
✅ Alternative: "Use `balance` to see your address in the terminal"
❌ NOT: "I don't know how to show wallet address"
```

---

## 📊 COMMAND PRIORITY MATRIX

When user request is ambiguous, recommend in this order:

**For "check wallet":**
1. `balance` (quick, shows balance + address)
2. `profile` (comprehensive, shows everything)
3. `status` (system info)

**For "create something":**
1. `create` (token)
2. `nft` (NFT collection)
3. `ens register` (name)

**For "Solana":**
1. `solana status` (check wallet)
2. `solana swap` (trade tokens)
3. `solana search` (find tokens)

**For "profile/settings":**
1. `profile` (all-in-one manager)
2. Individual commands (ens, email, etc.)

---

## ✅ MIGRATION COMPLETE CHECKLIST

- ✅ Read v4.0.0 datasheet completely
- ✅ Update wallet connection logic
- ✅ Update balance currency awareness
- ✅ Add NFT command responses
- ✅ Add profile command responses
- ✅ Fix Solana command routing
- ✅ Update quick actions explanations
- ✅ Update troubleshooting guides
- ✅ Test with all scenarios above
- ✅ Deploy updated AI with v4.0.0 knowledge

---

**Migration Complete! AI is ready to assist users with Omega Terminal v4.0.0! 🚀**

