# 🚀 Start Omega Terminal with REAL PGT Data

This guide shows you how to test Omega Terminal on localhost with **REAL blockchain data** from the PGT API.

## 🎯 The Problem

Browser CORS policy blocks `localhost:8080` from calling `https://www.pgtools.tech/api` directly.

## ✅ The Solution

Use a **local proxy server** that forwards requests from your browser to PGT API.

---

## 📋 Quick Start

### Option 1: Start Everything at Once (Recommended)

```bash
npm run dev-with-pgt
```

This starts:
1. **PGT Proxy** on `localhost:3003`
2. **Terminal** on `localhost:8080`

### Option 2: Start Separately

**Terminal 1 - PGT Proxy:**
```bash
npm run pgt-proxy
```

**Terminal 2 - Omega Terminal:**
```bash
npm run dev
```

---

## 🧪 Testing

### 1. Start the Proxy

```bash
npm run pgt-proxy
```

You should see:
```
✅ ========================================
✅ PGT PROXY SERVER RUNNING!
✅ ========================================

🌐 Proxy URL: http://localhost:3003
🎯 Target API: https://www.pgtools.tech/api
🔑 API Key: pgt-partner-omega-terminal-2-25
```

### 2. Test the Proxy

In another terminal:
```bash
curl http://localhost:3003/health
```

Should return:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0"
  }
}
```

### 3. Start Omega Terminal

```bash
npm run dev
```

Browser opens at: `http://localhost:8080/index.html`

### 4. Add a Wallet

In the PGT Portfolio Tracker panel:
1. Enter wallet address: `0xBB07d617cF64A64F96b29f3f3B65cd741C2C51FC`
2. Click search icon or press Enter

### 5. See Real Data!

```
Wallet 0xBB07...51FC 🟢  ← GREEN DOT = LIVE DATA!
Ethereum

Value: $20.71K  ← REAL VALUE from blockchain
24h: -0.28%     ← REAL 24h change
```

---

## 🔍 How It Works

```
Browser (localhost:8080)
         ↓
Local Proxy (localhost:3003)  ← Bypasses CORS
         ↓
PGT API (https://www.pgtools.tech/api)
         ↓
Blockchain Data (Ethereum, Solana, NEAR)
         ↓
Real Portfolio Values
```

---

## 📊 Console Output

### When Proxy is Running:

**Terminal Console:**
```
🔄 Using LOCAL PROXY to bypass CORS
🔗 PGT API Base URL: http://localhost:3003
```

**When Adding Wallet:**
```
📞 PGT API Call: POST http://localhost:3003/wallet
📥 Response Status: 201 Created
✅ Wallet added to PGT successfully!
🟢 DATA SOURCE: LIVE PGT API
```

### When Proxy is NOT Running:

```
❌ PGT API Exception: Failed to fetch
⚠️ USING DEMO DATA - PGT API not available
🟡 DEMO - Wallet 0xBB07...51FC: $XXX.XXK
```

---

## 🎨 Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green Dot | Using LIVE PGT API data |
| 🟡 Yellow Dot | Using demo/fallback data |

---

## 🛠️ Troubleshooting

### "Port 3003 already in use"

Kill the process:
```bash
# Windows
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# Or change port in pgt-proxy-server.js
```

### "Proxy not responding"

Make sure you ran:
```bash
npm run pgt-proxy
```

And it's still running (don't close that terminal).

### "Still seeing demo data"

Check browser console:
- Look for "Using LOCAL PROXY" message
- Check for connection errors to localhost:3003
- Make sure proxy server is running

---

## 🚀 Production Deployment

When you deploy Omega Terminal to production (Vercel/Netlify):

1. **No proxy needed** - CORS works from deployed domains
2. **Direct API calls** to `https://www.pgtools.tech/api`
3. **Automatic green dot** - always uses live data
4. **Better performance** - no proxy overhead

---

## 📝 Files

- `pgt-proxy-server.js` - Local proxy server
- `pgt-integration-plugin.js` - Auto-detects localhost and uses proxy
- `package.json` - Added `pgt-proxy` and `dev-with-pgt` scripts

---

## 🎯 Summary

**For Development (localhost):**
```bash
npm run dev-with-pgt
```
→ Green dot + real data!

**For Production:**
```bash
Deploy to Vercel/Netlify
```
→ Automatic, no proxy needed!

---

**Enjoy testing with REAL blockchain data on localhost!** 🎉

