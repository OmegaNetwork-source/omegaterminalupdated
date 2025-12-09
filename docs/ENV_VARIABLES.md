# Environment Variables Reference

## Overview

This document lists all environment variables used in `server/relayer-faucet.js` and their purposes.

## Required Variables

### Prediction Markets

#### `KALSHI_API_KEY`

- **Purpose:** API key for Kalshi prediction markets authentication
- **Used in:** Kalshi proxy routes (server-side authentication)
- **Required:** For authenticated Kalshi endpoints (portfolio, trading)
- **Optional:** Public endpoints work without it
- **Format:** UUID string
- **Example:** `5bb24117-81d6-4ba0-8f70-095989d28f5f`
- **Get it from:** https://kalshi.com/account/profile

#### `KALSHI_PRIVATE_KEY`

- **Purpose:** RSA private key for signing Kalshi API requests
- **Used in:** Kalshi proxy routes (RSA-PSS signature generation)
- **Required:** For authenticated Kalshi endpoints
- **Optional:** Public endpoints work without it
- **Format:** PEM-encoded RSA private key (multi-line string)
- **Example:**
  ```
  -----BEGIN RSA PRIVATE KEY-----
  MIIEpQIBAAKCAQEA...
  -----END RSA PRIVATE KEY-----
  ```
- **Get it from:** https://kalshi.com/account/profile

### Blockchain Operations

#### `RELAYER_PRIVATE_KEY`

- **Purpose:** Private key for blockchain transaction signing
- **Used in:** Mining, faucet, fund, claim, stress test endpoints
- **Required:** For blockchain operations
- **Optional:** Server runs in proxy-only mode without it
- **Format:** Hex string (64 characters)
- **Example:** `40c5117703fe6bd1f286a3912334904c65dcd39c187b1df66e62dc9e85f016d5`
- **Security:** ⚠️ Keep this secret! Controls wallet with funds

## Optional Variables

### AI Services

#### `GEMINI_API_KEY`

- **Purpose:** API key for Google Gemini AI chat functionality
- **Used in:** `/ai` endpoint for AI chat responses
- **Required:** No (AI features disabled without it)
- **Format:** String
- **Example:** `AIzaSyD...`
- **Get it from:** https://makersuite.google.com/app/apikey
- **Default behavior:** AI endpoint returns error if not set

### Server Configuration

#### `PORT`

- **Purpose:** Port number for the server to listen on
- **Used in:** Server initialization
- **Required:** No (defaults to 4000)
- **Format:** Number
- **Example:** `4000`
- **Default:** `4000`

#### `ADMIN_KEY`

- **Purpose:** Authentication key for admin-only endpoints
- **Used in:** `/api/reset-progress` endpoint
- **Required:** No (admin endpoints disabled without it)
- **Format:** String (any secure random string)
- **Example:** `your-secure-random-admin-key-here`
- **Security:** ⚠️ Keep this secret! Allows admin operations

## Environment Variables Summary Table

| Variable              | Required | Default | Purpose        | Impact if Missing                 |
| --------------------- | -------- | ------- | -------------- | --------------------------------- |
| `KALSHI_API_KEY`      | No       | -       | Kalshi auth    | Only public Kalshi endpoints work |
| `KALSHI_PRIVATE_KEY`  | No       | -       | Kalshi signing | Only public Kalshi endpoints work |
| `RELAYER_PRIVATE_KEY` | No       | -       | Blockchain ops | Server runs in proxy-only mode    |
| `GEMINI_API_KEY`      | No       | -       | AI chat        | AI endpoint returns error         |
| `PORT`                | No       | 4000    | Server port    | Uses default port 4000            |
| `ADMIN_KEY`           | No       | -       | Admin auth     | Admin endpoints disabled          |

## Server Modes

### Full Mode

**All variables set**

- ✅ Blockchain operations (mining, faucet, funding)
- ✅ Polymarket proxy (public access)
- ✅ Kalshi proxy (authenticated access)
- ✅ AI chat functionality
- ✅ Admin endpoints

### Proxy-Only Mode

**Only Kalshi credentials set, no RELAYER_PRIVATE_KEY**

- ❌ Blockchain operations disabled
- ✅ Polymarket proxy (public access)
- ✅ Kalshi proxy (authenticated access)
- ✅ AI chat (if GEMINI_API_KEY set)
- ✅ Admin endpoints (if ADMIN_KEY set)

### Minimal Mode

**No credentials set**

- ❌ Blockchain operations disabled
- ✅ Polymarket proxy (public access)
- ✅ Kalshi proxy (public endpoints only)
- ❌ AI chat disabled
- ❌ Admin endpoints disabled

## Production Deployment

### Render URL

The production relayer is deployed at: **`https://terminal-v1-5-9.onrender.com`**

This URL is used by the frontend for:

- **Polymarket proxy:** `https://terminal-v1-5-9.onrender.com/polymarket/*`
- **Kalshi proxy:** `https://terminal-v1-5-9.onrender.com/kalshi/*`
- **Blockchain operations:** Mining, faucet, claims, etc.

### Environment Detection

The frontend automatically detects the environment:

- **Production (deployed):** Uses Render URL
- **Development (localhost):** Uses `http://localhost:4000`

This is configured in `js/config.js`:

```javascript
RELAYER_URL: window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://terminal-v1-5-9.onrender.com";
```

## Setup Instructions

### For Development

1. **Copy the example `.env` file:**

   ```bash
   cp .env.example .env
   ```

2. **Add your credentials:**

   - Edit `.env` and add your API keys
   - For production, generate a strong `ADMIN_KEY`

3. **Start the local server:**

   ```bash
   node server/relayer-faucet.js
   ```

4. **Verify configuration:**
   - Server runs on `http://localhost:4000`
   - Check server logs for enabled features
   - Look for warnings about missing credentials
   - Test endpoints based on your configuration

### For Production (Render)

1. **Set environment variables in Render dashboard:**

   - Go to your Render service settings
   - Add all required environment variables from `.env`
   - See "Environment Variables Summary Table" above

2. **Deploy to Render:**

   ```bash
   git push origin master
   ```

3. **Verify deployment:**
   - Check Render logs for startup messages
   - Test production URL: `https://terminal-v1-5-9.onrender.com`
   - Verify proxy endpoints are working

## Security Best Practices

1. **Never commit `.env` to git** - Already in `.gitignore`
2. **Use strong keys** - Generate random strings for `ADMIN_KEY`
3. **Protect private keys** - `RELAYER_PRIVATE_KEY` controls real funds
4. **Rotate credentials** - Change keys periodically
5. **Use environment-specific files** - Different keys for dev/prod

## Troubleshooting

### "RELAYER_PRIVATE_KEY not found"

- **Impact:** Blockchain features disabled, proxy endpoints still work
- **Solution:** Add `RELAYER_PRIVATE_KEY` to `.env` if you need blockchain operations

### "Kalshi auth disabled"

- **Impact:** Only public Kalshi endpoints work (no portfolio/trading)
- **Solution:** Add `KALSHI_API_KEY` and `KALSHI_PRIVATE_KEY` to `.env`

### AI endpoint returns error

- **Impact:** `/ai` endpoint doesn't work
- **Solution:** Add `GEMINI_API_KEY` to `.env`

### Admin endpoint returns 403 Unauthorized

- **Impact:** Admin operations blocked
- **Solution:** Add `ADMIN_KEY` to `.env` and include it in requests

## Related Files

- `.env` - Your environment variables (git-ignored)
- `.env.example` - Template with empty values
- `server/relayer-faucet.js` - Main server file using these variables
- `.gitignore` - Ensures `.env` is never committed

## Getting API Keys

### Kalshi

1. Go to https://kalshi.com/account/profile
2. Generate API credentials
3. Download the private key (keep it secure!)
4. Copy API key ID and private key to `.env`

### Gemini AI

1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key to `.env`

### Relayer Wallet

1. Use an existing wallet private key, OR
2. Generate a new one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. ⚠️ For production: Fund this wallet with OMEGA tokens for faucet operations
