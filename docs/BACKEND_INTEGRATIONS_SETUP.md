# 🔧 Backend Integrations Setup Guide

## Overview

This document ensures all backend integrations (YouTube, Spotify, TradingView charts) are correctly configured to match the vanilla version functionality.

---

## ✅ TradingView Charts (Live Charts)

### Status: ✅ **WORKING - No Configuration Required**

**Implementation:**
- Uses TradingView public widget script: `https://s3.tradingview.com/tv.js`
- No API key required - completely public
- Widget loads dynamically when chart command is executed
- Integrated in `DashboardStatsPanel.tsx`

**How It Works:**
```typescript
// Chart command dispatches event
chart BTC  // Opens chart in right stats panel

// DashboardStatsPanel listens for event
window.addEventListener("omega:openChart", handler)
// Creates TradingView widget in panel
```

**Location:** `src/components/Dashboard/DashboardStatsPanel.tsx`
- Chart opens via `chart <symbol>` command
- Displays in right stats panel (320px width)
- Scrolls with other stats panel content

**✅ No setup needed - already working!**

---

## 🎵 Spotify Player

### Status: ⚠️ **REQUIRES USER CONFIGURATION**

**Environment Variable Required:**
```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
```

**Setup Steps:**

1. **Create Spotify App:**
   - Go to https://developer.spotify.com/dashboard
   - Click "Create App"
   - Name: "Omega Terminal"
   - Click "Create"

2. **Configure Redirect URI:**
   - In app settings, add redirect URI:
   - Development: `http://localhost:3000/spotify-callback.html`
   - Production: `https://yourdomain.com/spotify-callback.html`

3. **Get Client ID:**
   - Copy Client ID from app dashboard
   - Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
   NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify-callback.html
   ```

4. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

**Features:**
- OAuth 2.0 PKCE flow (secure, no client secret needed)
- Spotify Premium required for Web Playback SDK
- User connects their own Spotify account
- Token refresh handled automatically

**Location:** `src/providers/SpotifyProvider.tsx`
**Command:** `spotify open` or `spotify connect`

**⚠️ Must be configured by each user/developer**

---

## 🎥 YouTube Player

### Status: ✅ **WORKING - Default API Key Included**

**Environment Variable (Optional - Override Only):**
```bash
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here  # Optional - default key already configured
```

**Default Configuration:**
- ✅ Default API key included (matches vanilla version): `AIzaSyCpz49l79hdPYN1VmREpPjylwlHmfki3S0`
- ✅ Works out of the box without any setup
- ✅ Users can override with env var if they want their own key

**What Works:**
- ✅ Video search functionality (`youtube search <query>`)
- ✅ Loading default channel videos (Bloomberg Technology)
- ✅ Video metadata retrieval
- ✅ Video playback (IFrame API - no key needed)
- ✅ Playback controls (play, pause, next, prev, mute)

**Setup Steps (Optional):**

1. **Get YouTube API Key:**
   - Go to https://console.cloud.google.com/apis/credentials
   - Create new project (or select existing)
   - Click "Create Credentials" > "API Key"
   - Enable "YouTube Data API v3" for the key

2. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
   ```

3. **Restart Dev Server**

**What Works Without API Key:**
- ✅ Panel opens/closes
- ✅ Manual video playback by ID
- ✅ Playback controls (play, pause, next, prev, mute)
- ✅ Player UI

**What Requires API Key:**
- ⚠️ Video search (`youtube search <query>`)
- ⚠️ Default channel videos (Bloomberg Technology)

**Quota:**
- Default: 10,000 units/day
- Search: 100 units per query
- ~100 searches/day with default quota

**Location:** `src/providers/YouTubeProvider.tsx`
**Command:** `youtube open` or `youtube search <query>`

**Note:** Player will show warning if API key not set, but basic playback still works.

---

## 📊 Configuration Summary

### Quick Checklist

- [x] **TradingView Charts** - ✅ No setup needed (already working)
- [ ] **Spotify** - ⚠️ Set `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` in `.env.local` (required)
- [x] **YouTube** - ✅ Default API key included (works out of the box)

### Environment Variables Template

Create `.env.local` in project root:

```bash
# Spotify (Required for Spotify player)
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify-callback.html

# YouTube (Optional but recommended for search)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# TradingView - No config needed!
```

---

## 🔍 Verification

### Test Each Integration

**1. Test TradingView Charts:**
```bash
chart BTC
```
**Expected:** Chart opens in right stats panel with BTC chart ✅

**2. Test Spotify:**
```bash
spotify open
```
**Expected:** 
- If not configured: Error message with setup instructions
- If configured: Panel opens with "Connect Spotify" button ✅

**3. Test YouTube:**
```bash
youtube open
```
**Expected:** 
- Panel opens ✅
- If API key not set: Warning shown, but basic playback works
- If API key set: Search works, default videos load ✅

---

## 🐛 Troubleshooting

### TradingView Charts Not Showing

**Issue:** Chart panel opens but no chart displays

**Solutions:**
1. Check browser console for TradingView script errors
2. Verify TradingView script loads: `https://s3.tradingview.com/tv.js`
3. Check network tab for script loading errors
4. Ensure stats panel is visible (`settings.panels.stats !== false`)

---

### Spotify "Client ID not configured" Error

**Issue:** Error message when opening Spotify panel

**Solutions:**
1. Verify `.env.local` exists in project root
2. Check `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` is set
3. Restart dev server after adding env vars
4. Verify no typos in variable name (must be `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`)
5. Check redirect URI matches in Spotify app settings

---

### YouTube Search Not Working

**Issue:** Search returns no results or error

**Solutions:**
1. Check if API key is set: `echo $NEXT_PUBLIC_YOUTUBE_API_KEY`
2. Verify API key in Google Cloud Console is enabled
3. Check YouTube Data API v3 is enabled for the key
4. Verify quota not exceeded (10,000 units/day default)
5. Check browser console for API errors
6. Try manual video playback: `youtube play dQw4w9WgXcQ` (should work without API key)

---

## 📝 File Locations

### TradingView Integration
- **Component:** `src/components/Dashboard/DashboardStatsPanel.tsx`
- **Command:** `src/lib/commands/chart.ts`
- **Script:** Loaded from `https://s3.tradingview.com/tv.js`

### Spotify Integration
- **Provider:** `src/providers/SpotifyProvider.tsx`
- **Panel:** `src/components/Media/SpotifyPanel.tsx`
- **Command:** `src/lib/commands/spotify.ts`
- **Config:** `src/lib/config.ts` → `SPOTIFY_CONFIG`
- **Callback:** `public/spotify-callback.html`

### YouTube Integration
- **Provider:** `src/providers/YouTubeProvider.tsx`
- **Panel:** `src/components/Media/YouTubePanel.tsx`
- **Command:** `src/lib/commands/youtube.ts`
- **Config:** `src/lib/config.ts` → `YOUTUBE_CONFIG`

---

## 🔄 Matching Vanilla Version

### What Was in Vanilla Version

**TradingView:**
- ✅ Same implementation (public script, no API key)

**Spotify:**
- Vanilla had default Client ID: `dc96d602cecc4ff0a28e122dc71fa8af`
- Next.js version requires user to set their own (more secure)

**YouTube:**
- Vanilla had hardcoded API key: `AIzaSyCpz49l79hdPYN1VmREpPjylwlHmfki3S0`
- Next.js version uses env var (more secure)

### Recommendations

**For Development:**
- Use the vanilla API keys temporarily if needed for testing
- Add them to `.env.local` (never commit)

**For Production:**
- Each deployment should have its own API keys
- Set proper restrictions in Google Cloud Console
- Use different keys for dev/staging/production

---

## ✅ Status Summary

| Integration | Status | Setup Required | Notes |
|------------|--------|----------------|-------|
| **TradingView Charts** | ✅ Working | ❌ No | Public script, no API key |
| **Spotify** | ⚠️ Needs Config | ✅ Yes | User must set `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` |
| **YouTube** | ✅ Working | ❌ No | Default API key included (can override with env var) |

---

## 📚 Related Documentation

- `docs/ENV_CONFIG.md` - Complete environment variables guide
- `docs/MEDIA_IMPLEMENTATION_SUMMARY.md` - Media player implementation details
- `docs/YOUTUBE_PLAYER_INTEGRATION.md` - YouTube integration guide
- `docs/COMPLETE_API_AUDIT.md` - Full API audit with all keys

---

## 🎯 Quick Start

**Minimum Setup (Charts + YouTube Playback):**
```bash
# No setup needed! Charts and YouTube playback work without config.
```

**Full Setup (All Features):**
```bash
# 1. Create .env.local
touch .env.local

# 2. Add Spotify (required for Spotify player)
echo "NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id" >> .env.local

# 3. Add YouTube (recommended for search)
echo "NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key" >> .env.local

# 4. Restart dev server
npm run dev
```

---

*All integrations are properly structured and ready. Configure environment variables to enable full functionality.* 🚀

