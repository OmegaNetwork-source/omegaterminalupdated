# 🚀 Omega Ambassador System - Setup Guide

## 🔧 Environment Configuration

### 1. Create `.env` file in this directory:

```bash
# Distribution wallet private key (for sending OMEGA rewards)
DISTRIBUTION_PRIVATE_KEY=your_private_key_here

# Or use your existing relayer key
RELAYER_PRIVATE_KEY=your_private_key_here
```

### 2. Fund Your Distribution Wallet

Make sure your wallet has OMEGA tokens to distribute:
- **Minimum recommended**: 1000 OMEGA tokens
- **Per referral**: 15 OMEGA total (10 referrer + 5 new user)

### 3. Start the System

```bash
npm install
npm start
```

## 🎯 USER FLOW (INSTANT REWARDS!)

### 🔥 Simple Process:
1. **Visit ambassador page** → See full dashboard
2. **Click "CONNECT WALLET"** → MetaMask connects (top-right)
3. **Add social handles** → Manual Twitter/Discord entry
4. **Generate ambassador code** → Get unique link  
5. **Share link** → Friends click and get instant rewards!

### 🎁 Referral Flow:
1. **Friend clicks link** → Landing page shows
2. **Connect MetaMask** → Instant 5 OMEGA tokens!
3. **Referrer gets** → 10 OMEGA automatically!

## ✨ Features

- **🔗 MetaMask Integration** - Standard DApp wallet connection
- **📱 Simple Social Entry** - Manual Twitter/Discord handles (no API costs!)
- **💰 Instant Rewards** - OMEGA tokens sent immediately  
- **📊 Real-time Tracking** - Database updates instantly
- **🎯 Complete Standalone** - No terminal dependency
- **🏆 Leaderboards** - Ambassador rankings

## 🔗 Testing

1. **Visit** `http://localhost:5000`
2. **Connect wallet** → Top-right button
3. **Add social handles** → Optional Twitter/Discord
4. **Generate code** → Create ambassador link
5. **Test referral** → Use generated link
6. **Instant claim** → Should get 5 OMEGA immediately!

## 🚀 Production Ready

This system is completely self-contained and ready for your 80,000+ users with:
- ✅ **No Twitter API costs** - Manual entry only
- ✅ **Standard DApp UX** - Familiar wallet connection pattern  
- ✅ **Instant rewards** - No terminal required
- ✅ **Full tracking** - Complete analytics 