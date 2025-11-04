# 🔗 Omega Network Referral System

**Social-first referral program with Twitter/X and Discord integration**

## 🚀 Quick Start

### 1. Start the Referral Server
```bash
npm install
node omega-referral-system.js
```
Server runs on: `http://localhost:5000`

### 2. Test the System
```bash
npm test
```

### 3. Open Dashboard
```bash
npm run dashboard
# Or visit: http://localhost:5000/dashboard.html
```

## 💻 Terminal Integration

### Basic Commands
```bash
# Create referral code
referral create

# View your stats  
referral stats

# Get sharing links
referral share

# View leaderboard
referral leaderboard

# Open web dashboard
referral dashboard
```

### Advanced Usage
```bash
# Create with social handles
referral create 0x123... @myhandle discord#1234

# Share on specific platform
referral share twitter
referral share discord

# View top 20 referrers
referral leaderboard 20

# Complete referral (admin/testing)
referral complete OMEGA12345678 0x987...
```

## 💰 Reward Structure

| Action | Referrer Reward | New User Reward |
|--------|----------------|-----------------|
| Successful Referral | 10 OMEGA | 5 OMEGA |
| Social Sharing | 2 OMEGA | - |
| Twitter Post | 2 OMEGA | - |
| Discord Share | 1 OMEGA | - |

## 🎯 Features

### ✅ Core Features
- **Unique referral codes** (e.g., `OMEGA12345678`)
- **Social media integration** (Twitter/X, Discord)
- **Real-time tracking** (clicks, completions, rewards)
- **Leaderboards** with platform stats
- **Terminal commands** for power users
- **Web dashboard** for visual management

### ✅ Social Integration
- **Auto-generated sharing content**
- **One-click Twitter posting**
- **Discord-ready messages**
- **Platform-specific tracking**
- **Engagement bonuses**

### ✅ Analytics
- **User performance metrics**
- **Recent referrals/rewards**
- **Platform-wide statistics**
- **Conversion tracking**
- **Source attribution**

## 🔧 API Endpoints

### Referral Management
- `POST /api/referral/create` - Create referral code
- `GET /api/referral/stats/:wallet` - Get user stats
- `GET /api/referral/track/:code` - Track referral clicks
- `POST /api/referral/complete` - Complete referral

### Analytics & Social
- `GET /api/referral/leaderboard` - View rankings
- `POST /api/referral/campaign` - Track social campaigns

## 📊 Database Schema

### Users Table
```sql
- wallet_address (TEXT, PRIMARY)
- referral_code (TEXT, UNIQUE)
- twitter_handle (TEXT)
- discord_id (TEXT)  
- total_referrals (INTEGER)
- total_earned (DECIMAL)
```

### Referrals Table
```sql
- referrer_code (TEXT)
- referee_wallet (TEXT)
- source_platform (TEXT)
- status (TEXT)
- referral_reward (DECIMAL)
- referee_reward (DECIMAL)
```

### Rewards Table
```sql
- wallet_address (TEXT)
- reward_type (TEXT)
- amount (DECIMAL)
- tx_hash (TEXT)
- status (TEXT)
```

## 🌐 Social Sharing

### Twitter Integration
```javascript
// Auto-generated Twitter share
const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
  `🚀 Join me on @OmegaNetwork! Get FREE $OMEGA tokens: https://omega.network/ref/OMEGA12345678 #OmegaNetwork #Web3 #DeFi`
)}`;
```

### Discord Integration
```javascript
// Ready-to-paste Discord message
const discordMessage = `🔥 Join Omega Network and earn FREE $OMEGA tokens! Use my referral link: https://omega.network/ref/OMEGA12345678`;
```

## 🎮 Terminal Examples

### Create Your First Referral
```bash
$ referral create
🔗 Creating your referral code...
✅ Referral code created successfully!
🎯 Your Code: OMEGA12345678
🔗 Your Link: https://omega.network/ref/OMEGA12345678

📢 SOCIAL SHARING:
🐦 Twitter: "🚀 Join me on @OmegaNetwork! Get FREE $OMEGA tokens when you sign up with my referral link: https://omega.network/ref/OMEGA12345678..."
💬 Discord: "🔥 Hey everyone! Join Omega Network and earn FREE $OMEGA tokens! Use my referral link: https://omega.network/ref/OMEGA12345678"
```

### Check Your Performance
```bash
$ referral stats
✅ REFERRAL DASHBOARD
═════════════════════
🎯 Referral Code: OMEGA12345678
🔗 Referral URL: https://omega.network/ref/OMEGA12345678

📈 PERFORMANCE STATS:
👥 Total Referrals: 5
💰 Total Earned: 52.0 OMEGA
⏳ Pending Rewards: 12.0 OMEGA
✅ Confirmed Rewards: 40.0 OMEGA
```

## 🏆 Leaderboard Example
```bash
$ referral leaderboard
🏆 OMEGA REFERRAL LEADERBOARD
═══════════════════════════════

📊 Total Users: 1,247 | Total Referrals: 3,891 | Rewards: 45,230 OMEGA

🥇 #1 @cryptoinfluencer - 89 referrals (890 OMEGA)
🥈 #2 @omegamaxi - 67 referrals (670 OMEGA)  
🥉 #3 @defi_trader - 45 referrals (450 OMEGA)
```

## 🛠️ Development

### Tech Stack
- **Backend**: Node.js + Express
- **Database**: SQLite3 
- **Frontend**: Vanilla HTML/CSS/JS
- **Terminal**: Modular command system

### File Structure
```
├── omega-referral-system.js    # Main server
├── public/dashboard.html       # Web dashboard
├── js/commands/referral.js     # Terminal integration
├── test-referral.js           # Test suite
├── package.json               # Dependencies
└── omega-referrals.db         # Database
```

### Running Tests
```bash
# Start server first
node omega-referral-system.js

# Then run tests
npm test
```

## 🚀 Deployment Notes

### Production Setup
1. **Database**: Migrate from SQLite to PostgreSQL/MySQL
2. **Authentication**: Add proper user auth
3. **Rate Limiting**: Prevent spam/abuse
4. **Monitoring**: Add analytics/logging
5. **Scaling**: Horizontal server scaling

### Environment Variables
```bash
REFERRAL_PORT=5000           # Server port
DATABASE_URL=sqlite://...    # Database connection
TWITTER_API_KEY=...          # Twitter API credentials
DISCORD_BOT_TOKEN=...        # Discord bot token
```

## 📈 Future Enhancements

### Planned Features
- [ ] **Twitter API v2** direct posting
- [ ] **Discord bot** integration
- [ ] **Milestone rewards** (10, 25, 50+ referrals)
- [ ] **Team referrals** (multi-level)
- [ ] **NFT rewards** for top referrers
- [ ] **Real-time notifications**
- [ ] **Mobile app** integration

### Integration Ideas
- [ ] **Existing terminal wallet** auto-detection
- [ ] **NEAR Shade Agent** rewards
- [ ] **Cross-chain rewards** distribution
- [ ] **DeFi protocol** integration

---

**Built for Omega Network's 80,000+ users** 🚀

*Ready to grow your network? Start with: `referral create`* 