# SPOTIFY INTEGRATION - COMPLETE SETUP GUIDE
## Highly Detailed Overview: How Spotify is Hooked Up & Working

---

## TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [PKCE Authentication Flow (Complete Breakdown)](#pkce-authentication-flow-complete-breakdown)
3. [Web Playback SDK Setup](#web-playback-sdk-setup)
4. [Token Management System](#token-management-system)
5. [Spotify API Integration](#spotify-api-integration)
6. [UI Components & Rendering](#ui-components--rendering)
7. [Event Handling & State Management](#event-handling--state-management)
8. [Callback Page System](#callback-page-system)
9. [Complete Setup Instructions](#complete-setup-instructions)
10. [File Structure & Dependencies](#file-structure--dependencies)
11. [Complete Flow Diagrams](#complete-flow-diagrams)
12. [Next.js Migration Guide](#nextjs-migration-guide)

---

## ARCHITECTURE OVERVIEW

The Omega Terminal Spotify integration uses **Spotify's Web Playback SDK** combined with **PKCE (Proof Key for Code Exchange) OAuth 2.0** authentication flow. This is a client-side only implementation that requires no backend server.

### Core Components

1. **Spotify Player Plugin** (`omega-spotify-player.js`)
   - Main player class
   - Handles authentication
   - Manages Web Playback SDK
   - Controls playback

2. **Callback Page** (`spotify-callback.html`)
   - Handles OAuth redirect
   - Exchanges authorization code for access token
   - Sends token back to main window

3. **Terminal Commands** (`entertainment.js`)
   - Command handlers for user interaction
   - Terminal integration

4. **Styling** (`spotify-player.css`)
   - UI styling and animations

### Technology Stack

- **OAuth 2.0 PKCE Flow**: Secure client-side authentication
- **Spotify Web Playback SDK**: JavaScript SDK for playback control
- **Spotify REST API**: Search, playlists, user data
- **localStorage**: Token persistence
- **postMessage API**: Communication between popup and main window
- **Web Crypto API**: PKCE code challenge generation

---

## PKCE AUTHENTICATION FLOW (COMPLETE BREAKDOWN)

### What is PKCE?

**PKCE (Proof Key for Code Exchange)** is an OAuth 2.0 security extension designed for public clients (apps that can't securely store a client secret). It prevents authorization code interception attacks.

### PKCE Flow Diagram

```
┌─────────────┐
│   User      │
│   (Browser) │
└──────┬──────┘
       │
       │ 1. User clicks "Connect to Spotify"
       ▼
┌─────────────────────────────────────────┐
│  Main Window (omega-spotify-player.js)  │
│                                         │
│  a) Generate code_verifier (64 chars)  │
│  b) Hash → code_challenge              │
│  c) Store code_verifier in localStorage │
│  d) Build auth URL with challenge      │
│  e) Open popup window                   │
└──────┬──────────────────────────────────┘
       │
       │ 2. Redirect to Spotify
       ▼
┌─────────────────────────────────────────┐
│      Spotify Authorization Server       │
│                                         │
│  • User logs in                         │
│  • User grants permissions              │
│  • Spotify generates authorization code │
│  • Redirects to callback page          │
└──────┬──────────────────────────────────┘
       │
       │ 3. Redirect with code
       ▼
┌─────────────────────────────────────────┐
│  Callback Page (spotify-callback.html)  │
│                                         │
│  a) Extract code from URL               │
│  b) Get code_verifier from opener       │
│  c) Exchange code for token             │
│  d) Send token to opener via postMessage│
│  e) Close popup                         │
└──────┬──────────────────────────────────┘
       │
       │ 4. postMessage with token
       ▼
┌─────────────────────────────────────────┐
│  Main Window (omega-spotify-player.js)  │
│                                         │
│  a) Receive token via message listener  │
│  b) Store token in localStorage         │
│  c) Initialize Web Playback SDK         │
│  d) Connect to Spotify                  │
└─────────────────────────────────────────┘
```

### Step-by-Step PKCE Implementation

#### Step 1: Generate Code Verifier

**Location**: `js/plugins/omega-spotify-player.js`

```javascript
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// Generate 64-character random string
const codeVerifier = generateRandomString(64);
// Example: "aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8"
```

**Why 64 Characters?**
- Spotify requires 43-128 characters
- 64 is a good balance (security vs. URL length)
- Uses cryptographically secure random values

**How It Works**:
1. Creates array of 64 random bytes using `crypto.getRandomValues()`
2. Maps each byte to a character from allowed set
3. Concatenates into single string

#### Step 2: Generate Code Challenge

**Location**: `js/plugins/omega-spotify-player.js`

```javascript
async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')      // Remove padding
        .replace(/\+/g, '-')     // URL-safe: + → -
        .replace(/\//g, '_');    // URL-safe: / → _
}

async function generateCodeChallenge(codeVerifier) {
    const hashed = await sha256(codeVerifier);
    return base64encode(hashed);
}

// Generate challenge from verifier
const codeChallenge = await generateCodeChallenge(codeVerifier);
// Example: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
```

**Why SHA-256 + Base64URL?**
- **SHA-256**: One-way hash (can't reverse to get verifier)
- **Base64URL**: URL-safe encoding (no special characters)
- **Standard**: PKCE spec requires this method

**Process**:
1. Encode verifier as UTF-8 bytes
2. Hash with SHA-256
3. Base64 encode result
4. Make URL-safe (replace `+`, `/`, `=`)

#### Step 3: Store Code Verifier

```javascript
localStorage.setItem('spotify_code_verifier', codeVerifier);
```

**Why Store in localStorage?**
- Needed later to exchange code for token
- Temporary (deleted after auth)
- Only accessible in same origin

#### Step 4: Build Authorization URL

```javascript
const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${SPOTIFY_CONFIG.CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(SPOTIFY_CONFIG.REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(SPOTIFY_CONFIG.SCOPES)}` +
    `&code_challenge_method=S256` +
    `&code_challenge=${codeChallenge}` +
    `&show_dialog=true`;
```

**URL Parameters Explained**:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `client_id` | Your Spotify Client ID | Identifies your app |
| `response_type` | `code` | Request authorization code (not token) |
| `redirect_uri` | Callback URL | Where Spotify redirects after auth |
| `scope` | Permission scopes | What access you're requesting |
| `code_challenge_method` | `S256` | SHA-256 hashing method |
| `code_challenge` | Hashed verifier | Proof of verifier possession |
| `show_dialog` | `true` | Force login dialog (even if logged in) |

**Example URL**:
```
https://accounts.spotify.com/authorize?
  client_id=dc96d602cecc4ff0a28e122dc71fa8af&
  response_type=code&
  redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fpages%2Fspotify-callback.html&
  scope=streaming%20user-read-email%20user-read-private%20...&
  code_challenge_method=S256&
  code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&
  show_dialog=true
```

#### Step 5: Open Popup Window

```javascript
const width = 500;
const height = 700;
const left = window.screenX + (window.outerWidth - width) / 2;
const top = window.screenY + (window.outerHeight - height) / 2;

const popup = window.open(
    authUrl,
    'Spotify Login',
    `width=${width},height=${height},left=${left},top=${top}`
);
```

**Why Popup?**
- Doesn't navigate away from main page
- Better UX (user stays in terminal)
- Can communicate back via postMessage

**Popup Positioning**:
- Centers popup on screen
- Calculates position based on main window
- Standard size: 500x700px

#### Step 6: Set Up Message Listener

```javascript
const messageHandler = (event) => {
    // Filter out non-Spotify messages
    if (!event.data || !event.data.type) {
        return;
    }
    
    // Ignore MetaMask and other extension messages
    if (event.data.target === 'metamask-inpage' || 
        event.data.target === 'metamask-contentscript' ||
        event.data.type.includes('metamask')) {
        return;
    }
    
    // Only process Spotify messages
    if (event.data.type === 'spotify-auth-success') {
        console.log('🎵 Spotify auth message received:', event.data);
        
        // Security check - verify origin
        if (event.origin !== window.location.origin) {
            console.warn('⚠️ Message from different origin:', event.origin);
        }
        
        // Process authentication
        this.handleAuthSuccess(event.data);
        
        // Close popup
        if (popup && !popup.closed) {
            popup.close();
        }
        
        // Remove listener
        window.removeEventListener('message', messageHandler);
    }
};

window.addEventListener('message', messageHandler);
```

**Message Filtering**:
- Ignores messages from browser extensions (MetaMask, etc.)
- Only processes messages with `type: 'spotify-auth-success'`
- Verifies origin (security check)

#### Step 7: User Authorizes in Popup

User sees Spotify login page:
1. Logs in with Spotify credentials
2. Grants permissions (scopes requested)
3. Spotify redirects to callback page with authorization code

**Callback URL Format**:
```
http://localhost:8000/pages/spotify-callback.html?code=AUTHORIZATION_CODE&state=OPTIONAL_STATE
```

#### Step 8: Callback Page Exchanges Code for Token

**Location**: `pages/spotify-callback.html`

```javascript
// Parse URL parameters
const params = parseParams();
const code = params.code; // Authorization code from Spotify

// Get code verifier from opener window
const codeVerifier = window.opener.localStorage.getItem('spotify_code_verifier');

// Exchange code for token
const tokenData = await exchangeCodeForToken(code, codeVerifier);
```

**Token Exchange Request**:

```javascript
async function exchangeCodeForToken(code, codeVerifier) {
    const body = new URLSearchParams({
        client_id: 'dc96d602cecc4ff0a28e122dc71fa8af',
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: window.location.origin + '/pages/spotify-callback.html',
        code_verifier: codeVerifier  // The original verifier!
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    });

    const data = await response.json();
    return data;
}
```

**Request Body**:
```
client_id=dc96d602cecc4ff0a28e122dc71fa8af
grant_type=authorization_code
code=AUTHORIZATION_CODE_FROM_SPOTIFY
redirect_uri=http://localhost:8000/pages/spotify-callback.html
code_verifier=ORIGINAL_CODE_VERIFIER
```

**Response**:
```json
{
    "access_token": "BQC...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "AQB...",
    "scope": "streaming user-read-email ..."
}
```

**Security Check**:
- Spotify verifies `code_verifier` matches the `code_challenge` sent earlier
- If they don't match, request is rejected
- This prevents authorization code interception attacks

#### Step 9: Send Token to Main Window

```javascript
// Send token to opener window
if (window.opener && !window.opener.closed) {
    const message = {
        type: 'spotify-auth-success',
        access_token: tokenData.access_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_in: tokenData.expires_in || 3600,
        refresh_token: tokenData.refresh_token
    };
    
    window.opener.postMessage(message, window.opener.location.origin);
    
    // Close popup after 1 second
    setTimeout(() => {
        window.close();
    }, 1000);
}
```

**postMessage Format**:
- **Type**: `spotify-auth-success` (identifies message)
- **Data**: Access token, expiry, refresh token
- **Target Origin**: Main window's origin (security)

#### Step 10: Main Window Receives Token

```javascript
handleAuthSuccess(data) {
    if (!data.access_token) {
        console.error('❌ No access token in data:', data);
        return;
    }
    
    // Store tokens
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    localStorage.setItem('spotify_access_token', this.accessToken);
    localStorage.setItem('spotify_token_expiry', this.tokenExpiry);
    
    // Initialize player
    this.init();
    this.updateUI();
}
```

**Token Storage**:
- `access_token`: Used for API calls
- `token_expiry`: Timestamp when token expires
- Both stored in localStorage

---

## WEB PLAYBACK SDK SETUP

### What is Spotify Web Playback SDK?

The **Spotify Web Playback SDK** is a JavaScript library that allows you to control Spotify playback directly from a web browser. It requires:
- Spotify Premium account
- Valid access token
- Browser with audio playback support

### SDK Loading

**Location**: `js/plugins/omega-spotify-player.js`

```javascript
async init() {
    if (!this.accessToken || this.isTokenExpired()) {
        console.log('🎵 Spotify: No valid token found');
        return false;
    }

    return new Promise((resolve) => {
        // Load Spotify Web Playback SDK
        if (!window.Spotify) {
            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;
            document.body.appendChild(script);

            window.onSpotifyWebPlaybackSDKReady = () => {
                this.setupPlayer();
                resolve(true);
            };
        } else {
            this.setupPlayer();
            resolve(true);
        }
    });
}
```

**SDK URL**: `https://sdk.scdn.co/spotify-player.js`

**Loading Process**:
1. Check if SDK already loaded (`window.Spotify`)
2. If not, create script tag and append to body
3. Wait for `onSpotifyWebPlaybackSDKReady` callback
4. Initialize player when SDK ready

### Player Initialization

```javascript
setupPlayer() {
    this.player = new Spotify.Player({
        name: 'Omega Terminal Player',
        getOAuthToken: cb => { cb(this.accessToken); },
        volume: 0.5
    });

    // Event listeners
    this.player.addListener('ready', ({ device_id }) => {
        console.log('🎵 Spotify player ready with device ID:', device_id);
        this.deviceId = device_id;
        this.transferPlayback();
    });

    this.player.addListener('not_ready', ({ device_id }) => {
        console.log('🎵 Spotify device has gone offline:', device_id);
    });

    this.player.addListener('player_state_changed', state => {
        if (!state) return;
        
        this.currentTrack = state.track_window.current_track;
        this.isPlaying = !state.paused;
        
        // Update UI
        this.updateUI();
        this.updatePlayButton();
    });

    // Error listeners
    this.player.addListener('initialization_error', ({ message }) => {
        console.error('Spotify initialization error:', message);
    });

    this.player.addListener('authentication_error', ({ message }) => {
        console.error('Spotify auth error:', message);
        this.logout();
    });

    this.player.addListener('account_error', ({ message }) => {
        console.error('Spotify account error:', message);
    });

    this.player.addListener('playback_error', ({ message }) => {
        console.error('Spotify playback error:', message);
    });

    // Connect to the player
    this.player.connect();
}
```

**Player Configuration**:

| Option | Value | Purpose |
|--------|-------|---------|
| `name` | `'Omega Terminal Player'` | Device name shown in Spotify app |
| `getOAuthToken` | Callback function | Provides access token when needed |
| `volume` | `0.5` | Initial volume (0.0 to 1.0) |

**Event Listeners**:

1. **`ready`**: Player connected, receives `device_id`
2. **`not_ready`**: Device disconnected
3. **`player_state_changed`**: Playback state updated (track, playing, etc.)
4. **`initialization_error`**: SDK initialization failed
5. **`authentication_error`**: Token invalid, triggers logout
6. **`account_error`**: Account access issues
7. **`playback_error`**: Playback failed

**Device ID**:
- Unique identifier for this player instance
- Required for playback control via REST API
- Used in `transferPlayback()` and `playTrack()`

### Transfer Playback

```javascript
async transferPlayback() {
    if (!this.deviceId) return;

    try {
        await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            },
            body: JSON.stringify({
                device_ids: [this.deviceId],
                play: false
            })
        });
    } catch (error) {
        console.error('Error transferring playback:', error);
    }
}
```

**Purpose**: Transfers Spotify playback to this device (makes it the active player).

**Why `play: false`?**
- Transfers device without auto-playing
- User can then control playback manually
- Better UX (doesn't surprise user with music)

---

## TOKEN MANAGEMENT SYSTEM

### Token Storage

**Location**: `localStorage`

**Keys**:
- `spotify_access_token`: OAuth access token
- `spotify_token_expiry`: Timestamp when token expires
- `spotify_refresh_token`: Refresh token (not actively used)
- `spotify_code_verifier`: PKCE verifier (temporary, deleted after auth)

### Token Expiry Check

```javascript
isTokenExpired() {
    if (!this.tokenExpiry) return true;
    return Date.now() >= parseInt(this.tokenExpiry);
}
```

**Expiry Calculation**:
```javascript
// When token received
this.tokenExpiry = Date.now() + (data.expires_in * 1000);
// Example: Date.now() + (3600 * 1000) = current time + 1 hour
```

**Token Lifetime**: 
- Access tokens expire after 1 hour (3600 seconds)
- Refresh tokens don't expire (but not used in current implementation)

### Token Refresh (Not Implemented)

**Current Status**: Token refresh is **not implemented**. When token expires, user must re-authenticate.

**Future Implementation** (would require backend):
```javascript
async refreshToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken,
            client_id: SPOTIFY_CONFIG.CLIENT_ID
        })
    });
    
    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    localStorage.setItem('spotify_access_token', this.accessToken);
    localStorage.setItem('spotify_token_expiry', this.tokenExpiry);
}
```

**Why Not Implemented?**
- Refresh token flow requires client secret (not available in public client)
- Would need backend proxy for security
- Current implementation is client-side only

---

## SPOTIFY API INTEGRATION

### API Endpoints Used

#### 1. Search API

**Endpoint**: `GET https://api.spotify.com/v1/search`

**Usage**:
```javascript
async search(query) {
    if (!this.accessToken) return null;

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
            {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            }
        );

        const data = await response.json();
        return data.tracks.items;
    } catch (error) {
        console.error('Error searching Spotify:', error);
        return null;
    }
}
```

**Query Parameters**:
- `q`: Search query (encoded)
- `type`: `track` (can also be `album`, `artist`, `playlist`)
- `limit`: Number of results (max 50)

**Response Format**:
```json
{
    "tracks": {
        "items": [
            {
                "id": "track_id",
                "name": "Track Name",
                "artists": [{"name": "Artist Name"}],
                "album": {
                    "images": [{"url": "image_url"}]
                },
                "uri": "spotify:track:track_id",
                "duration_ms": 180000
            }
        ]
    }
}
```

#### 2. Get User Playlists

**Endpoint**: `GET https://api.spotify.com/v1/me/playlists`

**Usage**:
```javascript
async getUserPlaylists() {
    if (!this.accessToken) return null;

    try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=20', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        return null;
    }
}
```

**Response Format**:
```json
{
    "items": [
        {
            "id": "playlist_id",
            "name": "Playlist Name",
            "images": [{"url": "image_url"}],
            "tracks": {
                "total": 50
            },
            "uri": "spotify:playlist:playlist_id"
        }
    ]
}
```

#### 3. Transfer Playback

**Endpoint**: `PUT https://api.spotify.com/v1/me/player`

**Usage**: See [Transfer Playback](#transfer-playback) section above.

#### 4. Play Track

**Endpoint**: `PUT https://api.spotify.com/v1/me/player/play`

**Usage**:
```javascript
async playTrack(uri) {
    if (!this.deviceId) return;

    try {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            },
            body: JSON.stringify({
                uris: [uri]  // Array of track URIs
            })
        });
    } catch (error) {
        console.error('Error playing track:', error);
    }
}
```

**Track URI Format**: `spotify:track:track_id`

**Playlist URI Format**: `spotify:playlist:playlist_id`

#### 5. Play Playlist

**Endpoint**: `PUT https://api.spotify.com/v1/me/player/play`

**Usage**:
```javascript
async playPlaylist(uri) {
    if (!this.deviceId) return;

    try {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            },
            body: JSON.stringify({
                context_uri: uri  // Playlist/album URI
            })
        });
    } catch (error) {
        console.error('Error playing playlist:', error);
    }
}
```

**Difference**: Uses `context_uri` instead of `uris` for playlists/albums.

### API Authentication

All API requests include access token in header:

```javascript
headers: {
    'Authorization': `Bearer ${this.accessToken}`
}
```

**Bearer Token**: Standard OAuth 2.0 authentication method.

---

## UI COMPONENTS & RENDERING

### Panel Structure

```
.spotify-player-panel
├── .spotify-panel-header
│   ├── .spotify-header-title (Spotify logo + "SPOTIFY PLAYER")
│   └── .spotify-close-btn
└── .spotify-panel-content
    ├── Login Screen (if not authenticated)
    │   ├── .spotify-logo-large
    │   ├── h2, p
    │   ├── .spotify-connect-btn
    │   └── .spotify-setup-note
    └── Player Interface (if authenticated)
        ├── .spotify-now-playing
        │   ├── .track-artwork (album image)
        │   └── .track-info (name, artist)
        ├── .spotify-controls (prev, play/pause, next)
        ├── .spotify-volume (volume slider)
        ├── .spotify-search (search input)
        ├── .spotify-tracks (search results / playlists)
        └── .spotify-footer (My Playlists, Disconnect)
```

### Panel Creation

```javascript
createPanel() {
    // Remove existing panel
    this.closePanel();

    const panel = document.createElement('div');
    panel.id = 'spotify-player-panel';
    panel.className = 'spotify-player-panel';
    panel.innerHTML = `
        <div class="spotify-panel-header">
            <!-- Header HTML -->
        </div>
        <div class="spotify-panel-content">
            ${this.accessToken ? this.renderPlayer() : this.renderLogin()}
        </div>
    `;

    document.body.appendChild(panel);

    // Add to stats panel if in dashboard mode
    if (window.FuturisticDashboard) {
        const statsPanel = document.querySelector('.omega-stats');
        if (statsPanel) {
            statsPanel.appendChild(panel);
        }
    }
}
```

**Conditional Rendering**:
- If `accessToken` exists → Show player interface
- If no `accessToken` → Show login screen

### Login Screen

```javascript
renderLogin() {
    return `
        <div class="spotify-login-screen">
            <div class="spotify-logo-large">
                <!-- Spotify logo SVG -->
            </div>
            <h2>Connect Spotify</h2>
            <p>Listen to your favorite music while coding in the Omega Terminal</p>
            <button class="spotify-connect-btn" onclick="window.OmegaSpotify.authenticate()">
                <!-- Connect button -->
            </button>
            <div class="spotify-setup-note">
                <strong>Setup Required:</strong> Add your Spotify Client ID in omega-spotify-player.js
            </div>
        </div>
    `;
}
```

### Player Interface

```javascript
renderPlayer() {
    const track = this.currentTrack;
    const isPlaying = this.isPlaying;
    
    return `
        <div class="spotify-player-container">
            <!-- Now Playing -->
            <div class="spotify-now-playing">
                <div class="track-artwork">
                    ${track ? `<img src="${track.album.images[0]?.url}" alt="Album art">` : 'No artwork'}
                </div>
                <div class="track-info">
                    <div class="track-name">${track ? track.name : 'No track playing'}</div>
                    <div class="track-artist">${track ? track.artists.map(a => a.name).join(', ') : 'Search or select a track'}</div>
                </div>
            </div>

            <!-- Playback Controls -->
            <div class="spotify-controls">
                <button onclick="window.OmegaSpotify.previousTrack()">Previous</button>
                <button id="spotify-play-btn" onclick="window.OmegaSpotify.togglePlay()">
                    ${isPlaying ? 'Pause' : 'Play'}
                </button>
                <button onclick="window.OmegaSpotify.nextTrack()">Next</button>
            </div>

            <!-- Volume Control -->
            <div class="spotify-volume">
                <input type="range" min="0" max="100" value="50" 
                       oninput="window.OmegaSpotify.setVolume(this.value / 100)">
            </div>

            <!-- Search -->
            <div class="spotify-search">
                <input type="text" placeholder="Search for tracks..." 
                       id="spotify-search-input"
                       onkeyup="if(event.key==='Enter') window.OmegaSpotify.performSearch(this.value)">
                <button onclick="window.OmegaSpotify.performSearch(document.getElementById('spotify-search-input').value)">
                    Search
                </button>
            </div>

            <!-- Search Results -->
            <div class="spotify-tracks" id="spotify-tracks-list">
                <div class="tracks-empty">🎵 Search for music or select a playlist</div>
            </div>

            <!-- Footer Actions -->
            <div class="spotify-footer">
                <button onclick="window.OmegaSpotify.loadPlaylists()">📋 My Playlists</button>
                <button onclick="window.OmegaSpotify.logout()">🚪 Disconnect</button>
            </div>
        </div>
    `;
}
```

### Search Results Rendering

```javascript
async performSearch(query) {
    if (!query.trim()) return;

    const tracks = await this.search(query);
    const tracksList = document.getElementById('spotify-tracks-list');
    
    if (!tracks || tracks.length === 0) {
        tracksList.innerHTML = '<div class="tracks-empty">No tracks found</div>';
        return;
    }

    tracksList.innerHTML = tracks.map(track => `
        <div class="spotify-track-item" onclick="window.OmegaSpotify.playTrack('${track.uri}')">
            <img src="${track.album.images[2]?.url || track.album.images[0]?.url}" alt="${track.name}">
            <div class="track-item-info">
                <div class="track-item-name">${track.name}</div>
                <div class="track-item-artist">${track.artists.map(a => a.name).join(', ')}</div>
            </div>
            <div class="track-item-duration">${this.formatDuration(track.duration_ms)}</div>
        </div>
    `).join('');
}
```

**Track Item Click**: Calls `playTrack(uri)` with track's Spotify URI.

---

## EVENT HANDLING & STATE MANAGEMENT

### Playback Control Methods

#### Toggle Play/Pause

```javascript
async togglePlay() {
    if (!this.player) {
        console.warn('⚠️ Player not initialized');
        return;
    }
    
    console.log('🎵 Toggle play - Current state:', this.isPlaying);
    await this.player.togglePlay();
    
    // Toggle state optimistically (will be confirmed by state_changed event)
    this.isPlaying = !this.isPlaying;
    this.updatePlayButton();
}
```

**Web Playback SDK Method**: `player.togglePlay()` - Toggles between play and pause.

#### Next Track

```javascript
async nextTrack() {
    if (!this.player) {
        console.warn('⚠️ Player not initialized');
        return;
    }
    
    console.log('⏭️ Next track');
    await this.player.nextTrack();
}
```

**Web Playback SDK Method**: `player.nextTrack()` - Advances to next track in queue.

#### Previous Track

```javascript
async previousTrack() {
    if (!this.player) {
        console.warn('⚠️ Player not initialized');
        return;
    }
    
    console.log('⏮️ Previous track');
    await this.player.previousTrack();
}
```

**Web Playback SDK Method**: `player.previousTrack()` - Returns to previous track.

#### Set Volume

```javascript
async setVolume(volume) {
    if (!this.player) return;
    
    this.player.setVolume(volume);  // 0.0 to 1.0
}
```

**Web Playback SDK Method**: `player.setVolume(volume)` - Sets playback volume.

### State Updates

#### Player State Changed Event

```javascript
this.player.addListener('player_state_changed', state => {
    console.log('🎵 Player state changed:', state);
    if (!state) return;
    
    // Extract current track
    this.currentTrack = state.track_window.current_track;
    this.isPlaying = !state.paused;
    
    console.log('🎵 Now playing:', this.currentTrack?.name, '| Playing:', this.isPlaying);
    
    // Update UI immediately
    this.updateUI();
    this.updatePlayButton();
});
```

**State Object Structure**:
```javascript
{
    paused: boolean,
    track_window: {
        current_track: {
            id: string,
            name: string,
            artists: [{name: string}],
            album: {
                images: [{url: string}]
            },
            uri: string,
            duration_ms: number
        },
        next_tracks: [...],
        previous_tracks: [...]
    },
    position: number,
    duration: number
}
```

#### UI Update Methods

```javascript
updateUI() {
    if (!this.isPanelOpen) return;

    const content = document.querySelector('.spotify-panel-content');
    if (content) {
        content.innerHTML = this.accessToken ? this.renderPlayer() : this.renderLogin();
    }
    
    console.log('🎵 UI updated - Playing:', this.isPlaying);
}

updatePlayButton() {
    const playBtn = document.getElementById('spotify-play-btn');
    if (!playBtn) return;
    
    const isPlaying = this.isPlaying;
    
    playBtn.title = isPlaying ? 'Pause' : 'Play';
    playBtn.className = `control-btn play-btn ${isPlaying ? 'playing' : ''}`;
    playBtn.innerHTML = isPlaying ? `
        <svg><!-- Pause icon --></svg>
    ` : `
        <svg><!-- Play icon --></svg>
    `;
    
    console.log('🎵 Play button updated - Playing:', isPlaying);
}
```

---

## CALLBACK PAGE SYSTEM

### File Location

**File**: `pages/spotify-callback.html`

**Purpose**: Handles OAuth redirect from Spotify after user authorization.

### Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Spotify Authentication</title>
    <style>
        /* Loading spinner styles */
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎵</div>
        <h1>Connecting to Spotify</h1>
        <div class="spinner"></div>
        <p>Please wait while we complete the authentication...</p>
    </div>

    <script>
        // Authentication logic
    </script>
</body>
</html>
```

### URL Parameter Parsing

```javascript
function parseParams() {
    const search = window.location.search.substring(1);
    console.log('Parsing search params:', search);
    
    const params = {};
    if (search) {
        search.split('&').forEach(item => {
            const parts = item.split('=');
            if (parts.length === 2) {
                params[parts[0]] = decodeURIComponent(parts[1]);
            }
        });
    }
    console.log('Parsed params:', params);
    return params;
}
```

**Example URL**:
```
http://localhost:8000/pages/spotify-callback.html?code=AUTHORIZATION_CODE
```

**Parsed Result**:
```javascript
{
    code: "AUTHORIZATION_CODE"
}
```

### Token Exchange

```javascript
async function exchangeCodeForToken(code, codeVerifier) {
    console.log('🎵 Exchanging code for token...');
    
    const body = new URLSearchParams({
        client_id: 'dc96d602cecc4ff0a28e122dc71fa8af',
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: window.location.origin + '/pages/spotify-callback.html',
        code_verifier: codeVerifier
    });

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error_description || errorData.error);
        }

        const data = await response.json();
        console.log('✅ Token received successfully');
        return data;
    } catch (error) {
        console.error('❌ Token exchange failed:', error);
        throw error;
    }
}
```

### Code Verifier Retrieval

```javascript
// Get code verifier from opener window
const codeVerifier = window.opener ? 
    window.opener.localStorage.getItem('spotify_code_verifier') : 
    localStorage.getItem('spotify_code_verifier');
```

**Why Check Both?**
- First tries `window.opener` (popup opened from main window)
- Falls back to `localStorage` (if opened directly)
- Ensures we can get verifier in both cases

### postMessage to Main Window

```javascript
// Send token to opener window
if (window.opener && !window.opener.closed) {
    console.log('Sending token to opener window...');
    
    const message = {
        type: 'spotify-auth-success',
        access_token: tokenData.access_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_in: tokenData.expires_in || 3600,
        refresh_token: tokenData.refresh_token
    };
    
    window.opener.postMessage(message, window.opener.location.origin);
    
    // Show success message
    document.querySelector('.container').innerHTML = `
        <div class="logo">✅</div>
        <h1>Successfully Connected!</h1>
        <p>Returning to terminal...</p>
    `;
    
    // Close after 1 second
    setTimeout(() => {
        window.close();
    }, 1000);
}
```

**Security**: Uses `window.opener.location.origin` as target origin to ensure message only goes to correct window.

---

## COMPLETE SETUP INSTRUCTIONS

### Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create App"**
3. Fill in app details:
   - **App name**: `Omega Terminal` (or your choice)
   - **App description**: `Terminal music player integration`
   - **Website**: Your website URL (optional)
   - **Redirect URI**: `http://localhost:8000/pages/spotify-callback.html` (for local dev)
   - **Redirect URI (production)**: `https://yourdomain.com/pages/spotify-callback.html`
4. Accept terms and click **"Create"**
5. Copy your **Client ID** (not Client Secret - not needed for PKCE)

### Step 2: Configure Redirect URI

**Important**: Redirect URI must match **exactly** (including protocol, domain, path).

**Development**:
```
http://localhost:8000/pages/spotify-callback.html
```

**Production**:
```
https://yourdomain.com/pages/spotify-callback.html
```

**Add Multiple URIs**: You can add multiple redirect URIs in Spotify Dashboard for different environments.

### Step 3: Update Configuration

**File**: `js/plugins/omega-spotify-player.js`

**Line 12**: Update `CLIENT_ID`:

```javascript
const SPOTIFY_CONFIG = {
    CLIENT_ID: 'YOUR_CLIENT_ID_HERE',  // Replace with your Client ID
    REDIRECT_URI: window.location.origin + '/pages/spotify-callback.html',
    // ... rest of config
};
```

**Also Update Callback Page**:

**File**: `pages/spotify-callback.html`

**Line 91**: Update `client_id` in token exchange:

```javascript
const body = new URLSearchParams({
    client_id: 'YOUR_CLIENT_ID_HERE',  // Replace with your Client ID
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: window.location.origin + '/pages/spotify-callback.html',
    code_verifier: codeVerifier
});
```

### Step 4: Verify File Structure

Ensure these files exist:

```
omegaterminalupdated/
├── js/
│   └── plugins/
│       └── omega-spotify-player.js  ✅
├── pages/
│   └── spotify-callback.html        ✅
├── styles/
│   └── spotify-player.css           ✅
└── terminal.html                     ✅ (includes script)
```

### Step 5: Test Authentication

1. Start your local server (if not already running)
2. Open terminal in browser
3. Run command: `spotify connect`
4. Popup should open with Spotify login
5. Log in and authorize
6. Popup should close automatically
7. Terminal should show: "✅ Spotify connected successfully!"

### Step 6: Test Playback

1. Run command: `spotify` (opens player panel)
2. Search for a track: `spotify search "artist name"`
3. Click on a track to play
4. Use play/pause controls
5. Verify music plays in browser

---

## FILE STRUCTURE & DEPENDENCIES

### Required Files

1. **`js/plugins/omega-spotify-player.js`** (812 lines)
   - Main player class
   - Authentication logic
   - Web Playback SDK integration
   - API methods

2. **`pages/spotify-callback.html`** (268 lines)
   - OAuth callback handler
   - Token exchange logic
   - postMessage communication

3. **`styles/spotify-player.css`** (610 lines)
   - UI styling
   - Animations
   - Responsive design

4. **`js/commands/entertainment.js`** (spotify commands)
   - Terminal command handlers
   - User interaction

### HTML Integration

**File**: `terminal.html`

```html
<!-- CSS -->
<link rel="stylesheet" href="styles/spotify-player.css" />

<!-- Script -->
<script src="js/plugins/omega-spotify-player.js"></script>
```

**Load Order**: Script should load before terminal initialization (if needed).

### Dependencies

**External**:
- **Spotify Web Playback SDK**: `https://sdk.scdn.co/spotify-player.js` (loaded dynamically)
- **Spotify API**: `https://api.spotify.com` (CORS enabled)
- **Spotify OAuth**: `https://accounts.spotify.com` (CORS enabled)

**Browser APIs**:
- `window.crypto.subtle` (Web Crypto API for PKCE)
- `localStorage` (Token storage)
- `postMessage` (Popup communication)
- `fetch` (API requests)

---

## COMPLETE FLOW DIAGRAMS

### Full Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER INITIATES AUTHENTICATION                                │
│    User types: "spotify connect"                                │
│    → Calls: window.OmegaSpotify.authenticate()                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. GENERATE PKCE CREDENTIALS                                    │
│    → Generate code_verifier (64 random chars)                    │
│    → Hash verifier → code_challenge (SHA-256 + Base64URL)        │
│    → Store code_verifier in localStorage                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. BUILD AUTHORIZATION URL                                      │
│    https://accounts.spotify.com/authorize?                       │
│      client_id=CLIENT_ID                                         │
│      &response_type=code                                         │
│      &redirect_uri=CALLBACK_URL                                  │
│      &scope=SCOPES                                               │
│      &code_challenge_method=S256                                 │
│      &code_challenge=CODE_CHALLENGE                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. OPEN POPUP WINDOW                                            │
│    window.open(authUrl, 'Spotify Login', ...)                    │
│    → Set up message listener for callback                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. USER AUTHORIZES IN SPOTIFY                                   │
│    User logs in → Grants permissions → Spotify redirects        │
│    → Redirects to: callback.html?code=AUTHORIZATION_CODE         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. CALLBACK PAGE PROCESSES                                      │
│    → Extract code from URL                                       │
│    → Get code_verifier from opener localStorage                  │
│    → Exchange code for token (POST /api/token)                   │
│    → Receive: {access_token, expires_in, refresh_token}          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. SEND TOKEN TO MAIN WINDOW                                    │
│    window.opener.postMessage({                                   │
│      type: 'spotify-auth-success',                               │
│      access_token: token,                                        │
│      expires_in: 3600                                            │
│    }, origin)                                                    │
│    → Close popup                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. MAIN WINDOW RECEIVES TOKEN                                   │
│    → messageHandler receives event                               │
│    → handleAuthSuccess(data) called                              │
│    → Store tokens in localStorage                                │
│    → Initialize Web Playback SDK                                 │
│    → Update UI                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Playback Control Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER CLICKS PLAY BUTTON                                         │
│    → Calls: window.OmegaSpotify.togglePlay()                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ CALL WEB PLAYBACK SDK                                           │
│    → player.togglePlay()                                        │
│    → SDK sends command to Spotify                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ SPOTIFY UPDATES PLAYBACK                                        │
│    → Track starts/stops playing                                  │
│    → SDK fires 'player_state_changed' event                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ UPDATE UI                                                       │
│    → player_state_changed listener fires                         │
│    → Update isPlaying state                                      │
│    → Update currentTrack                                         │
│    → Call updateUI() and updatePlayButton()                      │
└─────────────────────────────────────────────────────────────────┘
```

### Search & Play Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER SEARCHES FOR TRACK                                         │
│    → Types in search box → Presses Enter                         │
│    → Calls: performSearch(query)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ CALL SPOTIFY SEARCH API                                         │
│    → GET /v1/search?q=query&type=track&limit=20                 │
│    → Returns: Array of track objects                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ RENDER SEARCH RESULTS                                           │
│    → Display tracks with artwork, name, artist, duration         │
│    → Make tracks clickable                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ USER CLICKS TRACK                                               │
│    → Calls: playTrack(track.uri)                                 │
│    → PUT /v1/me/player/play?device_id=DEVICE_ID                  │
│    → Body: {uris: [track.uri]}                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ SPOTIFY STARTS PLAYING                                          │
│    → SDK fires 'player_state_changed' event                      │
│    → UI updates with current track                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## NEXT.JS MIGRATION GUIDE

### Current Architecture (Client-Side Only)

- ✅ No backend required
- ✅ All logic in browser
- ✅ PKCE flow works client-side
- ❌ Token refresh not implemented
- ❌ Client ID exposed in code

### Recommended Next.js Architecture

#### Option 1: Hybrid Approach (Recommended)

**Keep Client-Side PKCE, Add Server-Side Token Refresh**

**File Structure**:
```
nextjs-app/
├── pages/
│   ├── api/
│   │   └── spotify/
│   │       ├── callback.js       (OAuth callback handler)
│   │       └── refresh.js        (Token refresh endpoint)
│   └── spotify-callback.js        (Callback page)
├── components/
│   └── SpotifyPlayer.js          (React component)
└── lib/
    └── spotify.js                 (Spotify utilities)
```

**API Route: `/api/spotify/callback.js`**:
```javascript
export default async function handler(req, res) {
    const { code, code_verifier } = req.query;
    
    // Exchange code for token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.SPOTIFY_CLIENT_ID,
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            code_verifier
        })
    });
    
    const tokens = await tokenResponse.json();
    
    // Set httpOnly cookies
    res.setHeader('Set-Cookie', [
        `spotify_access_token=${tokens.access_token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${tokens.expires_in}`,
        `spotify_refresh_token=${tokens.refresh_token}; HttpOnly; Secure; SameSite=Strict`
    ]);
    
    // Redirect to main app
    res.redirect('/');
}
```

**API Route: `/api/spotify/refresh.js`**:
```javascript
export default async function handler(req, res) {
    const refreshToken = req.cookies.spotify_refresh_token;
    
    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token' });
    }
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: process.env.SPOTIFY_CLIENT_ID
        })
    });
    
    const tokens = await tokenResponse.json();
    
    // Update access token cookie
    res.setHeader('Set-Cookie', [
        `spotify_access_token=${tokens.access_token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${tokens.expires_in}`
    ]);
    
    res.json({ success: true });
}
```

**Environment Variables**:
```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
```

#### Option 2: Full Server-Side (More Secure)

**Move entire authentication to server**:
- Generate PKCE on server
- Store state in session
- Handle all token management server-side
- Provide API endpoints for client

**Benefits**:
- ✅ Client ID never exposed
- ✅ More secure token storage
- ✅ Better token refresh handling

**Drawbacks**:
- ❌ More complex implementation
- ❌ Requires session management
- ❌ More server load

### Migration Steps

1. **Create Next.js App**
   ```bash
   npx create-next-app@latest
   ```

2. **Install Dependencies**
   ```bash
   npm install spotify-web-api-node  # Optional: server-side SDK
   ```

3. **Set Up Environment Variables**
   - Create `.env.local`
   - Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_REDIRECT_URI`

4. **Create API Routes**
   - `/api/spotify/callback.js`
   - `/api/spotify/refresh.js` (optional)

5. **Convert Player to React Component**
   - Convert `OmegaSpotifyPlayer` class to React component
   - Use React hooks for state management
   - Use `useEffect` for SDK initialization

6. **Update Client-Side Code**
   - Remove `CLIENT_ID` from client code
   - Use API routes for token operations
   - Update callback URL to API route

7. **Test Authentication Flow**
   - Verify PKCE flow works
   - Test token refresh (if implemented)
   - Verify playback works

---

## KEY SECURITY CONSIDERATIONS

### 1. Client ID Exposure

**Current Implementation**: Client ID is hardcoded in JavaScript files (visible to users).

**Risk**: Low (Client ID is public by design in PKCE flow)

**Mitigation**: 
- Use environment variables in production
- Consider server-side proxy for sensitive operations

### 2. Token Storage

**Current Implementation**: Tokens stored in `localStorage` (accessible to JavaScript).

**Risk**: Medium (XSS attacks could steal tokens)

**Mitigation**:
- Use `httpOnly` cookies in production (requires backend)
- Implement CSP (Content Security Policy)
- Sanitize user input

### 3. Token Expiry

**Current Implementation**: Tokens expire after 1 hour, no automatic refresh.

**Risk**: Low (User must re-authenticate)

**Mitigation**:
- Implement token refresh flow (requires backend)
- Proactively refresh before expiry

### 4. CORS

**Current Implementation**: Direct API calls from browser.

**Risk**: Low (Spotify API allows CORS)

**Note**: All Spotify API endpoints support CORS, so no proxy needed.

### 5. Popup Blocking

**Current Implementation**: Uses `window.open()` for authentication.

**Risk**: Low (User can allow popups)

**Mitigation**:
- Provide fallback instructions if popup blocked
- Show clear error messages

---

## TROUBLESHOOTING

### Common Issues

#### 1. "Popup blocked" Error

**Cause**: Browser blocked popup window.

**Solution**:
- Allow popups for your domain
- Check browser settings
- Try clicking "Connect" button again

#### 2. "Invalid redirect URI" Error

**Cause**: Redirect URI doesn't match Spotify Dashboard settings.

**Solution**:
- Verify redirect URI in Spotify Dashboard
- Check for trailing slashes
- Ensure protocol matches (http vs https)
- Check for typos in callback URL

#### 3. "Token expired" Error

**Cause**: Access token expired (after 1 hour).

**Solution**:
- Re-authenticate: `spotify connect`
- Implement token refresh (requires backend)

#### 4. "Player not initialized" Error

**Cause**: Web Playback SDK not loaded or player not connected.

**Solution**:
- Check browser console for errors
- Verify Spotify Premium account
- Ensure access token is valid
- Try refreshing page

#### 5. "No device found" Error

**Cause**: Device ID not set or player not ready.

**Solution**:
- Wait for player to be ready (check `ready` event)
- Verify `deviceId` is set
- Try reconnecting: Close and reopen player

#### 6. Music Not Playing

**Cause**: Multiple possible issues.

**Solutions**:
- Check Spotify Premium account
- Verify track URI is valid
- Check browser audio permissions
- Ensure no other Spotify app is playing
- Check network connection

---

## SUMMARY: QUICK SETUP CHECKLIST

For setting up Spotify integration in a new build:

- [ ] Create Spotify App in Dashboard
- [ ] Add Redirect URI: `http://localhost:8000/pages/spotify-callback.html` (dev)
- [ ] Copy Client ID
- [ ] Update `CLIENT_ID` in `omega-spotify-player.js` (line 12)
- [ ] Update `client_id` in `spotify-callback.html` (line 91)
- [ ] Verify all files are in place:
  - [ ] `js/plugins/omega-spotify-player.js`
  - [ ] `pages/spotify-callback.html`
  - [ ] `styles/spotify-player.css`
- [ ] Add script to HTML: `<script src="js/plugins/omega-spotify-player.js"></script>`
- [ ] Test authentication: `spotify connect`
- [ ] Test playback: `spotify` → Search → Play track

---

**END OF SPOTIFY INTEGRATION DETAILED GUIDE**

---

*Last Updated: 2025-11-03*
*Version: 1.0*
*Complete Setup Guide for Spotify Integration in Omega Terminal*

