# Environment Variables Configuration

This document describes all environment variables needed for the Omega Terminal NextJS application.

## Setup Instructions

1. Create a `.env.local` file in the root of the `omega-terminal-nextjs` directory
2. Copy the variables below and add your actual values
3. Never commit `.env.local` to version control

## Required Environment Variables

### Phase 18 Server-Side Variables

```bash
# Relayer wallet private key for blockchain Server Actions (never expose publicly)
RELAYER_PRIVATE_KEY=

# Google Gemini API key for `/api/ai`
GEMINI_API_KEY=

# Upstash Redis credentials for rate limiting (optional, uses in-memory fallback when omitted)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> These variables are server-only. Do **not** prefix them with `NEXT_PUBLIC_` and keep them out of client bundles.

### Network Configuration

```bash
# Omega Network RPC URL
NEXT_PUBLIC_OMEGA_RPC_URL=https://rpc.omeganetwork.co

# Omega Network Chain ID
NEXT_PUBLIC_OMEGA_CHAIN_ID=1111

# Relayer URL for gasless transactions
NEXT_PUBLIC_RELAYER_URL=https://relayer.omeganetwork.co
```

### Media Player Configuration

#### Spotify (Required for Spotify Player)

```bash
# Spotify Client ID - Get from https://developer.spotify.com/dashboard
# IMPORTANT: You MUST create your own Spotify app and get credentials
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here

# Spotify Redirect URI
# For local development:
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify-callback.html
# For production:
# NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://yourdomain.com/spotify-callback.html
```

**Spotify Setup Steps:**

1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Add `http://localhost:3000/spotify-callback.html` to Redirect URIs
4. Copy the Client ID to your `.env.local`
5. Note: Spotify Premium account required for Web Playback SDK

#### YouTube (Optional but Recommended)

```bash
# YouTube API Key - Get from https://console.cloud.google.com/apis/credentials
# Optional but recommended for search functionality
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# YouTube Client ID (optional, not needed for basic playback)
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=
```

**YouTube Setup Steps:**

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new API key
3. Enable YouTube Data API v3
4. Add the API key to your `.env.local`

### AI Provider Configuration (Optional)

```bash
# OpenAI API Key - Get from https://platform.openai.com/api-keys
NEXT_PUBLIC_OPENAI_API_KEY=

# Anthropic API Key - Get from https://console.anthropic.com/
NEXT_PUBLIC_ANTHROPIC_API_KEY=

# ChainGPT API Key - Get from https://app.chaingpt.org/
NEXT_PUBLIC_CHAINGPT_API_KEY=
```

### Smart Contract Configuration

```bash
NEXT_PUBLIC_OMEGA_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_USERNAME_REGISTRY_ADDRESS=0x1234567890123456789012345678901234567890
```

### Games and Arcade Configuration

```bash
# Omega Arcade Leaderboard contract address on Omega Network
# Default value is the deployed contract - only change if using a different contract
NEXT_PUBLIC_ARCADE_CONTRACT_ADDRESS=0x1a196c1b6c22eb9389e286cc4b12fdebe8663996

# Base URL for hosted arcade games (optional, uses Vercel deployment by default)
# Only change if hosting games on a custom domain
NEXT_PUBLIC_ARCADE_BASE_URL=https://omega-arcade.vercel.app
```

**Games System Notes:**

- The arcade contract handles on-chain leaderboard submissions for competitive games
- Local games (number guess, cookie clicker, speed clicker, snake, etc.) use localStorage leaderboards
- Players can optionally submit their high scores to the blockchain
- On-chain submissions require wallet connection and gas fees
- Leaderboards are permanent and global when submitted on-chain

### Feature Flags

```bash
NEXT_PUBLIC_ENABLE_MINING=true
NEXT_PUBLIC_ENABLE_STRESS_TEST=true
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_MEDIA_PLAYERS=true
```

## Production Deployment

For production, update the following:

1. Change `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` to your production domain
2. Add your production domain to Spotify app's Redirect URIs
3. Ensure all API keys are production-ready
4. Never expose your `.env.local` file

## Security Notes

- `.env.local` is in `.gitignore` and should NEVER be committed
- All `NEXT_PUBLIC_*` variables are exposed to the client
- Never put server-side secrets in `NEXT_PUBLIC_*` variables
- Rotate API keys regularly
- Use different credentials for development and production
