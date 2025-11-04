# Render Deployment Configuration

## Overview

The Omega Terminal uses a unified relayer server deployed on Render that provides:

- ✅ **Polymarket proxy** - Bypasses CORS restrictions for Polymarket API
- ✅ **Kalshi proxy** - Handles server-side authentication for Kalshi API
- ✅ **Blockchain operations** - Mining, faucet, claims, stress tests
- ✅ **AI services** - Gemini AI chat integration
- ✅ **Admin endpoints** - User management and system administration

## Production URL

**Live Server:** `https://terminal-v1-5-9.onrender.com`

### Available Endpoints

#### Polymarket Proxy

- **Base URL:** `https://terminal-v1-5-9.onrender.com/polymarket/*`
- **Example:** `https://terminal-v1-5-9.onrender.com/polymarket/events`
- **Authentication:** None required (public API)
- **Usage:** All Polymarket commands in the terminal

#### Kalshi Proxy

- **Base URL:** `https://terminal-v1-5-9.onrender.com/kalshi/*`
- **Example:** `https://terminal-v1-5-9.onrender.com/kalshi/markets`
- **Authentication:** Server-side (configured in Render environment variables)
- **Usage:** All Kalshi commands in the terminal

#### Blockchain Operations

- **Fund:** `POST /fund` - Send test tokens to wallet
- **Mine:** `POST /mine` - Mine blocks for rewards
- **Claim:** `POST /claim` - Claim mining rewards
- **Status:** `GET /status` - Check relayer status

#### AI Services

- **Chat:** `POST /ai` - Gemini AI chat endpoint

## Environment Configuration

### Automatic Environment Detection

The frontend automatically detects whether it's running locally or in production:

```javascript
// In js/config.js
RELAYER_URL: window.location.hostname === "localhost" ||
window.location.hostname === "127.0.0.1"
  ? "http://localhost:4000"
  : "https://terminal-v1-5-9.onrender.com";
```

**Development Mode:**

- Runs on `http://localhost:4000`
- Uses local relayer server
- Requires manual server startup: `node server/relayer-faucet.js`

**Production Mode:**

- Uses Render URL: `https://terminal-v1-5-9.onrender.com`
- No local server needed
- Always available (deployed on Render)

## Files Updated

### Configuration Files

1. **`js/config.js`** ✅

   - Updated `RELAYER_URL` to auto-detect environment
   - Uses Render URL in production, localhost in development

2. **`js/commands/kalshi.js`** ✅

   - Updated to use `window.OmegaConfig.RELAYER_URL`
   - Added console logging for debugging

3. **`js/commands/remaining.js`** ✅

   - Updated Polymarket proxy to use config URL
   - Changed error messages to reference unified server

4. **`KALSHI_USAGE.md`** ✅

   - Updated all URLs to reference Render deployment
   - Added development mode notes

5. **`ENV_VARIABLES.md`** ✅
   - Added Production Deployment section
   - Documented Render URL and environment detection
   - Split setup instructions for dev vs. production

## Testing

### Test Production Endpoints

```bash
# Test Polymarket proxy
curl https://terminal-v1-5-9.onrender.com/polymarket/events

# Test Kalshi proxy
curl https://terminal-v1-5-9.onrender.com/kalshi/markets

# Test relayer status
curl https://terminal-v1-5-9.onrender.com/status

# Test health check
curl https://terminal-v1-5-9.onrender.com/
```

### Test in Terminal

When deployed to production (Vercel, Netlify, etc.):

```bash
# Polymarket commands will automatically use Render proxy
polymarket markets
polymarket trending

# Kalshi commands will automatically use Render proxy
kalshi markets
kalshi market KXBTC-25JAN05-T78000

# Blockchain operations will use Render relayer
mine
claim
faucet
```

### Test Locally

When running locally:

```bash
# Start the local server first
node server/relayer-faucet.js

# In another terminal, serve the frontend
python -m http.server 8000

# Open http://localhost:8000/terminal.html
# Commands will automatically use http://localhost:4000
```

## Deployment Checklist

### Initial Setup on Render

1. **Create Web Service:**

   - Go to Render Dashboard
   - New → Web Service
   - Connect your GitHub repository
   - Service name: `terminal-v1-5-9` (or similar)

2. **Configure Build Settings:**

   - **Build Command:** `npm install`
   - **Start Command:** `node server/relayer-faucet.js`
   - **Environment:** Node

3. **Set Environment Variables:**

   ```
   KALSHI_API_KEY=your-api-key
   KALSHI_PRIVATE_KEY=your-private-key
   RELAYER_PRIVATE_KEY=your-relayer-private-key
   GEMINI_API_KEY=your-gemini-api-key (optional)
   ADMIN_KEY=your-secure-admin-key (optional)
   PORT=4000
   ```

4. **Deploy:**
   - Push to GitHub
   - Render auto-deploys on push

### Update Deployment

1. **Update Environment Variables:**

   - Go to Render Dashboard → Your Service → Environment
   - Add/update variables
   - Service automatically redeploys

2. **Update Code:**

   ```bash
   git add .
   git commit -m "Update relayer"
   git push origin master
   ```

   - Render auto-deploys

3. **Monitor Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Check for startup messages:
     ```
     🚀 OMEGA UNIFIED SERVER STARTED ON PORT 4000
     📊 Polymarket endpoint: http://localhost:4000/polymarket/*
     🎯 Kalshi endpoint: http://localhost:4000/kalshi/*
     🔑 Kalshi authentication enabled
     ```

## Troubleshooting

### Frontend not connecting to Render

**Problem:** Commands fail with network errors

**Solutions:**

1. Check if Render service is running:

   ```bash
   curl https://terminal-v1-5-9.onrender.com/
   ```

2. Verify frontend is not running on localhost (should auto-detect production URL)

3. Check browser console for URL being used:

   ```
   [Kalshi] Using proxy URL: https://terminal-v1-5-9.onrender.com/kalshi
   ```

4. Clear browser cache and hard reload

### Render service failing to start

**Problem:** Deployment succeeds but service won't start

**Solutions:**

1. Check Render logs for errors
2. Verify all required environment variables are set
3. Check `package.json` dependencies are installed
4. Ensure `start` command is correct: `node server/relayer-faucet.js`

### CORS errors in production

**Problem:** CORS errors when calling Polymarket/Kalshi

**Solutions:**

1. Should NOT happen - proxy handles CORS
2. If it does, check that requests are going through proxy URL
3. Verify Render service has CORS middleware enabled (it does)

### Kalshi authentication failing

**Problem:** Kalshi commands return 401 Unauthorized

**Solutions:**

1. Verify `KALSHI_API_KEY` is set in Render environment
2. Verify `KALSHI_PRIVATE_KEY` is set correctly (with line breaks)
3. Check Render logs for authentication errors
4. Ensure you're using the demo API endpoint (production requires different creds)

### Blockchain operations failing

**Problem:** Mine, claim, faucet commands fail

**Solutions:**

1. Verify `RELAYER_PRIVATE_KEY` is set in Render environment
2. Check relayer has sufficient funds:
   ```bash
   curl https://terminal-v1-5-9.onrender.com/status
   ```
3. Check Render logs for RPC connection errors
4. Verify Omega Network RPC is accessible from Render

## Production vs Development

### Production (Deployed Frontend)

- ✅ Frontend auto-uses Render URL
- ✅ No local server needed
- ✅ Always available
- ✅ Handles CORS automatically
- ✅ Scales with Render

### Development (Local Testing)

- ✅ Uses localhost:4000
- ⚠️ Requires local server running
- ✅ Faster iteration
- ✅ Full debugging access
- ✅ Test changes before deploy

## Performance Considerations

### Render Free Tier

- Service spins down after 15 minutes of inactivity
- First request may take 30-60 seconds (cold start)
- Subsequent requests are fast
- Consider paid tier for always-on service

### Optimization Tips

1. Keep service warm with periodic health checks
2. Implement caching for frequently accessed data
3. Use connection pooling for blockchain RPC
4. Monitor response times in Render logs

## Security

### Environment Variables

- ✅ Stored securely in Render
- ✅ Not exposed to frontend
- ✅ Server-side authentication only
- ⚠️ Rotate keys periodically

### API Keys

- ✅ Kalshi: Server-side only
- ✅ Gemini: Server-side only
- ✅ Relayer: Server-side only
- ❌ Never send keys to frontend

### Network Security

- ✅ HTTPS only in production
- ✅ CORS properly configured
- ✅ Request validation
- ✅ Rate limiting (if needed)

## Related Documentation

- **[ENV_VARIABLES.md](ENV_VARIABLES.md)** - All environment variables
- **[KALSHI_USAGE.md](KALSHI_USAGE.md)** - Kalshi command reference
- **[server/relayer-faucet.js](server/relayer-faucet.js)** - Unified server code
- **[js/config.js](js/config.js)** - Frontend configuration

## Support

If you encounter issues:

1. Check Render logs for errors
2. Verify environment variables are set correctly
3. Test endpoints directly with curl
4. Check browser console for frontend errors
5. Ensure Render service is running and accessible
