# YouTube & TradingView Setup Guide - Next.js Version

**Status:** ✅ Complete Setup Guide  
**Last Updated:** Current

---

## 📊 Overview

This guide ensures YouTube and TradingView (Live Charts) are correctly configured for the Next.js version, matching the vanilla version functionality.

---

## 🎥 YouTube Setup

### ✅ **Current Status: WORKING with Default API Key**

Your Next.js version includes a default YouTube API key that matches the vanilla version:

**Default API Key:** `AIzaSyCpz49l79hdPYN1VmREpPjylwlHmfki3S0`  
**Default Client ID:** `119481701339-b4fm5sujtt2mjupu2rk1s2v749cess44.apps.googleusercontent.com`

### **Configuration Location**

**File:** `src/lib/config.ts` (lines 920-927)

```typescript
YOUTUBE_CONFIG: {
  CLIENT_ID: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || "119481701339-b4fm5sujtt2mjupu2rk1s2v749cess44.apps.googleusercontent.com",
  API_KEY: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "AIzaSyCpz49l79hdPYN1VmREpPjylwlHmfki3S0",
  SEARCH_RESULTS_LIMIT: 10,
  DEFAULT_CHANNEL_ID: "UCrM7B7SL_g1edFOnmj-SDKg",
  DEFAULT_CHANNEL_HANDLE: "@BloombergTechnology",
  DEFAULT_CHANNEL_NAME: "Bloomberg Technology",
},
```

### **Environment Variables (Optional Override)**

If you want to use your own API key, add to `.env.local`:

```bash
# Optional - YouTube will work with default key if not set
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_youtube_client_id_here
```

### **What Works Out of the Box** ✅

- ✅ Video search (`youtube search <query>`)
- ✅ Loading default channel videos (Bloomberg Technology)
- ✅ Video playback via YouTube IFrame API
- ✅ Playback controls (play, pause, next, prev, mute)
- ✅ Playlist navigation
- ✅ No authentication required

### **Setup Steps (Only if You Want Your Own Key)**

1. **Get YouTube API Key:**
   - Go to https://console.cloud.google.com/apis/credentials
   - Create new project (or select existing)
   - Click "Create Credentials" > "API Key"
   - Enable "YouTube Data API v3" for the key

2. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
   ```

3. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

### **Quota Information**

- **Default:** 10,000 units/day
- **Search:** 100 units per query
- **Available Searches:** ~100/day with default quota
- **Note:** More than enough for normal usage

### **Security Recommendations**

If using your own API key:

1. **Set HTTP Referrer Restrictions:**
   - In Google Cloud Console
   - Add your domain: `*.yourdomain.com/*`
   - Add localhost: `http://localhost:*/*`

2. **Restrict to YouTube Data API v3:**
   - In API restrictions section
   - Select "Restrict key"
   - Choose "YouTube Data API v3"

---

## 📈 TradingView (Live Charts) Setup

### ✅ **Current Status: WORKING - No Configuration Required**

TradingView charts work out of the box with **zero configuration**. The widget uses TradingView's public script.

### **How It Works**

**File:** `src/components/Dashboard/DashboardStatsPanel.tsx`

1. **TradingView Script:**
   - Loads from: `https://s3.tradingview.com/tv.js`
   - No API key required
   - Public widget - free to use

2. **Chart Command:**
   ```bash
   chart BTC    # Opens Bitcoin chart
   chart ETH    # Opens Ethereum chart
   chart AAPL   # Opens Apple stock chart
   ```

3. **Display Location:**
   - Opens in right stats panel (DashboardStatsPanel)
   - Appears when chart command is executed
   - Auto-resizes to fit panel width (320px)

### **Implementation Details**

**Script Loading:**
```typescript
<Script
  src="https://s3.tradingview.com/tv.js"
  strategy="lazyOnload"
  onLoad={() => {
    // Polling mechanism to ensure TradingView.widget is ready
    const checkInterval = setInterval(() => {
      if (window.TradingView?.widget) {
        setIsTradingViewReady(true);
        clearInterval(checkInterval);
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      setIsTradingViewReady(true);
    }, 10000);
  }}
/>
```

**Widget Creation:**
```typescript
tradingViewWidgetRef.current = window.TradingView.widget({
  symbol: chartSymbol,      // "BTC", "ETH", "AAPL", etc.
  container_id: chartContainerId,
  autosize: true,
  theme: "dark",
  height: 500,
  width: "100%",
  interval: "D",            // Daily interval
  locale: "en",
  toolbar_bg: "#1a1a2e",
  enable_publishing: false,
  hide_top_toolbar: false,
  hide_legend: false,
  save_image: false,
});
```

### **Features** ✅

- ✅ Supports any symbol (crypto, stocks, forex, commodities)
- ✅ Dark theme matching terminal aesthetic
- ✅ Interactive charts with zoom, pan, tools
- ✅ No API key required
- ✅ No rate limits
- ✅ Free for public use
- ✅ Opens via command: `chart <symbol>`

### **Supported Symbols**

**Cryptocurrency:**
- `BTC`, `ETH`, `BNB`, `SOL`, `ADA`, `DOT`, etc.

**Stocks:**
- `AAPL`, `GOOGL`, `MSFT`, `TSLA`, `AMZN`, etc.

**Forex:**
- `EURUSD`, `GBPUSD`, `USDJPY`, etc.

**Commodities:**
- `GOLD`, `SILVER`, `OIL`, etc.

### **No Setup Required** ✅

- ✅ No environment variables needed
- ✅ No API keys needed
- ✅ No configuration files needed
- ✅ Works immediately out of the box

---

## 🔄 Comparison: Vanilla vs Next.js

### **YouTube**

| Aspect | Vanilla | Next.js |
|--------|---------|---------|
| **API Key** | Same default key | Same default key ✅ |
| **Client ID** | Same default ID | Same default ID ✅ |
| **Config Location** | `js/config.js` | `src/lib/config.ts` |
| **Override Method** | Env var | `NEXT_PUBLIC_YOUTUBE_API_KEY` |
| **Default Channel** | Bloomberg Technology | Bloomberg Technology ✅ |
| **Features** | Search, playback, controls | Search, playback, controls ✅ |

**✅ Identical functionality - same API keys**

### **TradingView**

| Aspect | Vanilla | Next.js |
|--------|---------|---------|
| **Script URL** | `https://s3.tradingview.com/tv.js` | `https://s3.tradingview.com/tv.js` ✅ |
| **API Key Required** | No | No ✅ |
| **Widget Config** | Same parameters | Same parameters ✅ |
| **Chart Command** | `chart <symbol>` | `chart <symbol>` ✅ |
| **Display Location** | Stats panel | Stats panel ✅ |
| **Features** | Full TradingView widget | Full TradingView widget ✅ |

**✅ Identical functionality - same implementation**

---

## ✅ Verification Checklist

### **YouTube Verification**

- [ ] Video search works: `youtube search test`
- [ ] Default channel videos load (Bloomberg Technology)
- [ ] Playback controls work (play, pause, next, prev)
- [ ] Video plays in panel
- [ ] No console errors

### **TradingView Verification**

- [ ] Chart opens: `chart BTC`
- [ ] Chart displays correctly in stats panel
- [ ] Interactive features work (zoom, pan, tools)
- [ ] Dark theme applies correctly
- [ ] Different symbols work: `chart ETH`, `chart AAPL`
- [ ] No console errors

---

## 🐛 Troubleshooting

### **YouTube Issues**

**Issue: "API key not configured" warning**
- **Solution:** Default key is already set in config.ts - this warning should not appear
- **If it does:** Check that `NEXT_PUBLIC_YOUTUBE_API_KEY` is not set to empty string in `.env.local`

**Issue: Search returns no results**
- **Check:** API quota not exceeded (check Google Cloud Console)
- **Check:** Internet connection
- **Check:** Browser console for errors

**Issue: Videos won't play**
- **Check:** YouTube IFrame API is loaded (`window.YT` should exist)
- **Check:** Browser console for errors
- **Note:** IFrame API doesn't require API key

### **TradingView Issues**

**Issue: Chart won't load**
- **Check:** TradingView script loaded (`window.TradingView` should exist)
- **Check:** Internet connection
- **Check:** Browser console for errors
- **Check:** Container element exists in DOM

**Issue: Chart shows error**
- **Solution:** Symbol might be invalid - try `BTC`, `ETH`, or `AAPL`
- **Check:** Browser console for specific error message

**Issue: Chart appears blank**
- **Solution:** Widget might need time to load - wait a few seconds
- **Check:** Container has correct dimensions (not 0x0)

---

## 📝 Environment Variables Summary

### **Required (for Spotify only):**
```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify-callback.html
```

### **Optional (for YouTube - has defaults):**
```bash
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_youtube_client_id_here
```

### **Not Needed (TradingView - works without config):**
```bash
# No environment variables needed for TradingView
```

---

## 🎯 Quick Start

### **For YouTube:**
1. **Already configured** ✅ - Default API key included
2. **Optional:** Add your own key to `.env.local`
3. **Test:** Run `youtube search test` in terminal

### **For TradingView:**
1. **No configuration needed** ✅
2. **Test:** Run `chart BTC` in terminal

---

## 📚 Related Documentation

- `docs/SPOTIFY_SETUP_COMPARISON.md` - Spotify setup guide
- `docs/ENV_CONFIG.md` - Complete environment variables guide
- `docs/YOUTUBE_API_SETUP.md` - Detailed YouTube API setup
- `docs/BACKEND_INTEGRATIONS_SETUP.md` - All integrations overview

---

## ✅ Status Summary

| Feature | Status | Configuration Required |
|---------|--------|----------------------|
| **YouTube Search** | ✅ Working | Optional (default key included) |
| **YouTube Playback** | ✅ Working | None (IFrame API) |
| **TradingView Charts** | ✅ Working | None (public widget) |
| **Spotify Player** | ⚠️ Needs Setup | Yes (Client ID required) |

---

## 🎉 Conclusion

**YouTube:** ✅ Fully configured with default API key matching vanilla version  
**TradingView:** ✅ Working perfectly - no configuration needed  
**Spotify:** ⚠️ User must add Client ID (see Spotify setup guide)

**Both YouTube and TradingView are ready to use right now!**






