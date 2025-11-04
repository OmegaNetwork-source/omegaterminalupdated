# Ambassador Referral System - Complete Setup

## Summary

Omega Terminal Ambassador Program allows users to earn OMEGA tokens by referring new users. Fully integrated with omeganetwork.co API.

---

## ✅ System Status

**Integration:** Complete  
**API Endpoint:** `https://omeganetwork.co/api/referral`  
**Dashboard:** `https://omeganetwork.co/ambassador/dashboard`  
**Commands:** Working  
**Sidebar:** Quick actions added  

---

## 🎯 Features

### Generate Referral Links
- Automatic code generation
- Unique link per user
- Wallet-based tracking
- Social handle integration

### Track Performance
- Total referrals count
- Total earnings (OMEGA)
- Pending vs confirmed rewards
- Recent referral activity

### Social Sharing
- Twitter integration
- Discord integration
- Pre-formatted messages
- Campaign tracking

### Leaderboard
- Top ambassadors ranking
- Public stats display
- Competitive motivation

---

## 💰 Reward Structure

**For Referrers:**
- 10 OMEGA per successful referral
- 2 OMEGA bonus for social sharing
- Lifetime tracking

**For New Users:**
- 5 OMEGA welcome bonus
- Immediate credit

---

## 🎮 How to Use

### Terminal Commands

```bash
# Generate your referral link
referral create

# With social handles
referral create 0x123... @mytwitter discord#1234

# View your stats
referral stats

# Share on social media
referral share twitter
referral share discord
referral share all

# Check leaderboard
referral leaderboard
referral leaderboard 20     # Top 20

# Open web dashboard
referral dashboard

# Get help
referral help
```

### Sidebar Quick Actions

1. Open dashboard: `view futuristic`
2. Go to **PORTFOLIO TRACKER**
3. Expand **"Ambassador"**
4. Click any action:
   - Generate Referral Link
   - View My Stats
   - Share Links
   - View Leaderboard
   - Open Dashboard
   - Help

---

## 📊 What Each Command Does

### `referral create`

**Input:**
- Uses connected wallet (or provide address)
- Optional: Twitter handle (@username)
- Optional: Discord ID (username#1234)

**Output:**
- Unique referral code (e.g., OMEGA12AB34CD)
- Clickable referral URL
- Pre-formatted social messages
- Instructions for sharing

**Example:**
```
Creating your referral code...
Referral code created successfully!
Your Code: OMEGA12AB34CD
Your Link: https://omeganetwork.co/ref/OMEGA12AB34CD

SOCIAL SHARING:
Twitter: "Join me on @OmegaNetwork! ..."
Discord: "Hey everyone! Join Omega Network..."

Tip: Use "referral share" to post automatically!
```

---

### `referral stats`

**Input:**
- Uses connected wallet (or provide address)

**Output:**
- Referral code and URL
- Total referrals count
- Total earned (OMEGA)
- Pending rewards
- Confirmed rewards
- Recent 3 referrals

**Example:**
```
Loading your referral stats...
REFERRAL DASHBOARD
══════════════════════════════════
Referral Code: OMEGA12AB34CD
Referral URL: https://omeganetwork.co/ref/OMEGA12AB34CD

PERFORMANCE STATS:
Total Referrals: 15
Total Earned: 150 OMEGA
Pending Rewards: 30 OMEGA
Confirmed Rewards: 120 OMEGA

RECENT REFERRALS:
   1. 0x742d35Cc... (+10 OMEGA) - 10/21/2025
   2. 0x9f8a12Bb... (+10 OMEGA) - 10/20/2025
   3. 0x3d5e78Aa... (+10 OMEGA) - 10/19/2025
```

---

### `referral share`

**Input:**
- Platform: `twitter`, `discord`, or `all`
- Uses connected wallet

**Output:**
- Twitter intent URL (opens tweet composer)
- Discord message template
- Your referral link
- Earnings info

**Platforms:**
- `referral share twitter` - Opens Twitter
- `referral share discord` - Shows Discord message
- `referral share` or `referral share all` - Shows both

---

### `referral leaderboard`

**Input:**
- Optional: Limit number (default 10)

**Output:**
- Platform statistics
- Top ambassadors list
- Rank, handle, referrals, earnings

**Example:**
```
OMEGA AMBASSADOR LEADERBOARD
══════════════════════════════════════
Total Users: 1,234 | Total Referrals: 5,678 | Rewards: 56,780 OMEGA

[1st] @CryptoKing - 234 referrals (2,340 OMEGA)
[2nd] @DeFiQueen - 189 referrals (1,890 OMEGA)
[3rd] @Web3Wizard - 156 referrals (1,560 OMEGA)
...
```

---

### `referral dashboard`

**Action:**
- Opens https://omeganetwork.co/ambassador/dashboard
- New browser tab
- Full web interface
- Advanced analytics

---

## 🔧 Technical Setup

### API Configuration

**Endpoint:** `https://omeganetwork.co/api/referral`

**Endpoints:**
- `POST /create` - Generate referral code
- `GET /stats/:wallet` - Get user stats
- `GET /leaderboard` - Get top referrers
- `POST /complete` - Complete referral (admin)
- `POST /campaign` - Track social campaigns

### Database Schema

**Users Table:**
- wallet_address (unique)
- referral_code (unique)
- twitter_handle
- discord_id
- total_referrals
- total_earned
- timestamps

**Referrals Table:**
- referrer_code
- referee_wallet
- source_platform
- status (pending/completed/rewarded)
- reward amounts
- timestamps

**Rewards Table:**
- wallet_address
- referral_id
- reward_type
- amount
- tx_hash
- status

---

## 📋 Integration Points

### Files

**Commands:**
- `js/commands/referral.js` - Command handlers

**System:**
- `js/plugins/omega-referral-system.js` - Backend (Node.js)

**Terminal:**
- `js/terminal-core.js` - Command routing

**Sidebar:**
- `js/futuristic/futuristic-dashboard-transform.js` - Quick actions

**Config:**
- `js/config.js` - Command autocomplete

---

## 🎯 User Flow

### New Ambassador

1. **Connect Wallet**
   ```bash
   connect
   ```

2. **Create Referral Link**
   ```bash
   referral create
   ```

3. **Get Your Link**
   - Receive unique code
   - Get clickable URL
   - Copy and share

4. **Share Socially**
   ```bash
   referral share twitter
   ```

5. **Track Progress**
   ```bash
   referral stats
   ```

6. **Check Ranking**
   ```bash
   referral leaderboard
   ```

---

## 📊 Sidebar Structure

```
PORTFOLIO TRACKER
├── Check Balance
├── Ambassador (expandable) ⭐ NEW!
│   ├── → Generate Referral Link
│   ├── → View My Stats
│   ├── → Share Links
│   ├── → View Leaderboard
│   ├── → Open Dashboard
│   └── → Help
└── Track Wallet (expandable)
```

---

## ✅ What Works

**Commands:**
- ✅ `referral create` - Generate link
- ✅ `referral stats` - View stats
- ✅ `referral share` - Social sharing
- ✅ `referral leaderboard` - Rankings
- ✅ `referral dashboard` - Web interface
- ✅ `referral help` - Show help
- ✅ `refer` - Alias
- ✅ `ambassador` - Alias

**Sidebar:**
- ✅ 6 quick action buttons
- ✅ Expandable section
- ✅ Professional icons
- ✅ One-click commands

**Integration:**
- ✅ Works with wallet connection
- ✅ Uses omeganetwork.co API
- ✅ Social media integration
- ✅ Real-time tracking
- ✅ No emojis (clean output)

---

## 🔐 Security

**API Communication:**
- HTTPS endpoints
- Wallet address validation
- Rate limiting (server-side)
- IP tracking for fraud prevention

**Data Storage:**
- Referral codes: Hashed with timestamp
- Wallet addresses: Case-insensitive
- Social handles: Optional
- Rewards: Transaction-based verification

---

## 📈 Analytics Available

**Per User:**
- Total referrals
- Total earned
- Pending/confirmed split
- Recent activity
- Social campaign tracking

**Platform-Wide:**
- Total users
- Total referrals
- Total rewards distributed
- Top performers
- Growth metrics

---

## 🎊 Status

**Ambassador System:** 🟢 **Complete & Working**

**Features:**
- ✅ Generate referral links
- ✅ Track earnings
- ✅ View statistics
- ✅ Social sharing
- ✅ Leaderboard
- ✅ Web dashboard
- ✅ Sidebar quick actions
- ✅ Command routing
- ✅ API integration
- ✅ No emojis (professional)

**Ready for Production:** Yes  
**API Configured:** https://omeganetwork.co/api/referral  
**Zero Errors:** ✅  

---

## 🚀 Quick Start Guide

### For Users

**Step 1:** Connect wallet
```bash
connect
```

**Step 2:** Generate referral link
```bash
referral create
```

**Step 3:** Copy your link and share!

**Step 4:** Check earnings
```bash
referral stats
```

### For Power Users

**Use sidebar:**
1. `view futuristic`
2. **PORTFOLIO TRACKER** → **Ambassador**
3. Click buttons for instant actions!

---

*Ambassador system complete. Generate links, track earnings, climb leaderboard. All integrated with omeganetwork.co!* ✅

