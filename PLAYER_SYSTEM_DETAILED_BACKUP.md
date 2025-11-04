# OMEGA TERMINAL - PLAYER SYSTEM COMPREHENSIVE DOCUMENTATION
## Omega Custom Music Player & Spotify Player - Complete Setup & Functionality Guide

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Omega Custom Music Player](#omega-custom-music-player)
3. [Spotify Player](#spotify-player)
4. [Integration & Commands](#integration--commands)
5. [UI Components & Styling](#ui-components--styling)
6. [Authentication Flows](#authentication-flows)
7. [File Structure](#file-structure)
8. [Next.js Migration Notes](#nextjs-migration-notes)

---

## OVERVIEW

The Omega Terminal includes two integrated music players:

1. **Omega Custom Music Player**: Local file-based player for user-uploaded audio files
2. **Spotify Player**: Integrated Spotify Web Playback SDK player with full API access

Both players are designed to work seamlessly within the terminal interface, sharing similar UI patterns and integrating with the futuristic dashboard system.

### Key Features Across Both Players

- **Panel-Based UI**: Both players open as floating panels in the right sidebar
- **Playlist Management**: Track lists with visual feedback
- **Playback Controls**: Play, pause, next, previous track navigation
- **Visual Feedback**: Waveform animations, track highlighting, status updates
- **Terminal Integration**: Commands accessible via terminal input
- **Local Storage**: Persistent state and preferences

---

## OMEGA CUSTOM MUSIC PLAYER

### File Location
- **Plugin**: `js/plugins/omega-custom-music-player.js`
- **Commands**: `js/commands/custom-music-commands.js`
- **Styles**: `styles/custom-music-player.css`
- **HTML Integration**: `terminal.html` (line 157)

### Configuration

```javascript
const CUSTOM_MUSIC_CONFIG = {
    STORAGE_KEY: 'omega-custom-music-playlist',
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB per file
    ALLOWED_FORMATS: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
    PLAYER_ID: 'omega-custom-music-player',
    PLAYER_TITLE: 'Custom Music Player',
    DEFAULT_PLAYLIST_NAME: 'My Playlist'
};
```

### Class Structure: OmegaCustomMusicPlayer

#### Constructor & Initialization

```javascript
class OmegaCustomMusicPlayer {
    constructor() {
        this.currentPlaylist = [];           // Array of track objects
        this.currentTrackIndex = 0;          // Currently playing track index
        this.isPlaying = false;              // Playback state
        this.audioElement = null;            // HTML5 Audio element
        this.playlistName = 'My Playlist';   // Playlist name
        
        this.init();                         // Auto-initialize
    }
    
    init() {
        this.loadPlaylist();                 // Load from localStorage
    }
}
```

#### Core Methods

##### 1. Playlist Management

**`loadPlaylist()`**
- Loads playlist from `localStorage` using `STORAGE_KEY`
- Restores `currentPlaylist` array and `playlistName`
- Handles errors gracefully, defaults to empty playlist

**`savePlaylist()`**
- Saves current playlist state to `localStorage`
- Includes metadata: `playlist`, `name`, `lastUpdated` timestamp
- Called automatically after any playlist modification

**`addTrackToPlaylist(file)`**
- Validates file isn't already in playlist (by name)
- Creates track object:
  ```javascript
  {
      id: Date.now() + Math.random(),
      name: fileName (without extension),
      file: File object,
      url: URL.createObjectURL(file),
      duration: 0 (set when loaded),
      addedAt: ISO timestamp
  }
  ```
- Returns `true` if added, `false` if duplicate

**`removeTrack(trackId)`**
- Shows confirmation dialog before removal
- Revokes object URL to free memory
- Adjusts `currentTrackIndex` if needed
- Stops playback if removing current track
- Updates UI and saves playlist

##### 2. File Upload & Validation

**`handleFileUpload(files)`**
- Processes multiple files (FileList or Array)
- Validates each file individually
- Tracks added/rejected counts
- Provides terminal feedback
- Clears file input after successful upload

**`validateFile(file)`**
- Checks file extension (`.mp3`, `.wav`, `.ogg`, `.m4a`, `.aac`, `.flac`, `.wma`)
- Checks MIME type (fallback if extension fails)
- Validates file size (max 50MB)
- Returns `true` if valid, error string if invalid

**`clearFileInput()`**
- Resets file input element to allow re-uploading same files

##### 3. Playback Control

**`playTrack(index)`**
- Sets `currentTrackIndex` to specified index
- Creates/updates audio element source
- Handles play promise (required for autoplay policies)
- Updates UI state (play button, playlist display, navigation buttons)
- Starts waveform animation
- Provides terminal feedback

**`togglePlayPause()`**
- If no track loaded, starts first track
- Toggles between play and pause
- Updates waveform animation
- Updates play button icon
- Provides terminal feedback

**`nextTrack()`**
- Increments `currentTrackIndex`
- If at end of playlist, stops playback instead of looping
- Calls `playTrack()` with new index
- Updates navigation button states

**`previousTrack()`**
- Decrements `currentTrackIndex` (wraps to end if at start)
- Calls `playTrack()` with new index

**`updateNavigationButtons()`**
- Enables/disables prev/next buttons based on track position
- Disables prev at start, disables next at end

##### 4. Audio Element Setup

**`setupAudioElement()`**
- Creates HTML5 `<audio>` element if not exists
- Sets up event listeners:
  - `loadedmetadata`: Sets track duration
  - `ended`: Auto-advances to next track
  - `error`: Logs playback errors
  - `canplay`: Confirms audio is ready
  - `loadstart`: Indicates loading began

##### 5. UI Management

**`createPanel()`**
- Removes existing panel if present
- Creates new panel with `getPlayerHTML()`
- Appends to `.omega-stats` panel (dashboard mode) or `body`
- Sets up audio element
- Sets up event listeners

**`getPlayerHTML()`**
- Returns complete panel HTML structure:
  - Header with title and close button
  - Upload section with drag-and-drop area
  - Playlist section with track list
  - Player controls (prev, play/pause, next)
  - Waveform animation container

**`getPlaylistTracksHTML()`**
- Generates HTML for each track in playlist
- Highlights active track with `active` class
- Shows track number, name, duration
- Includes remove button for each track
- Returns empty message if no tracks

**`updatePlaylistDisplay()`**
- Refreshes playlist HTML in panel
- Updates track count display
- Called after any playlist modification

**`updatePlayButton()`**
- Toggles play/pause icon visibility
- Shows play icon when paused, pause icon when playing

**`startWaveformAnimation()`**
- Applies CSS animation to waveform bars
- Each bar has staggered timing (0.5s + index * 0.1s)

**`stopWaveformAnimation()`**
- Removes animation from all waveform bars

##### 6. Event Listeners

**`setupPanelEventListeners()`**
- File input change handler
- Upload area click handler (triggers file input)
- Drag and drop handlers:
  - `dragover`: Adds `drag-over` class
  - `dragleave`: Removes `drag-over` class
  - `drop`: Processes dropped files
- Play button click handler

##### 7. Utility Methods

**`getCurrentTrackName()`**
- Returns current track name or "No tracks"

**`formatDuration(seconds)`**
- Converts seconds to `MM:SS` format
- Returns `--:--` if duration not available

**`closePanel()`**
- Removes panel with slide-out animation
- Stops audio playback
- Resets playback state

### UI Components

#### Panel Structure

```
.custom-music-player-panel
├── .custom-music-player-container
    ├── .custom-music-player-header
    │   ├── .custom-music-player-title
    │   └── .custom-music-close-btn
    ├── .custom-music-player-content
    │   ├── .custom-music-upload-section
    │   │   └── .custom-music-upload-area
    │   ├── .custom-music-playlist-section
    │   │   ├── .playlist-header
    │   │   └── .playlist-tracks
    │   └── .custom-music-player-controls
    │       ├── .track-info
    │       ├── .player-buttons
    │       └── .waveform-container
```

#### Visual Features

- **Glass Morphism Design**: Translucent background with blur effect
- **Cyan Accent Colors**: `#00d4ff` primary color
- **Drag & Drop**: Visual feedback when dragging files over upload area
- **Active Track Highlighting**: Current track highlighted in playlist
- **Waveform Animation**: 8 animated bars during playback
- **Responsive Layout**: Adapts to dashboard mode or standalone

### Commands

**`upload music`**
- Opens custom music player panel
- Terminal feedback: "Opening Custom Music Player..."
- Usage: `upload music`

**`playlist`**
- Displays current playlist information
- Shows track count, names, durations
- Usage: `playlist`

**`custom music help`**
- Shows available custom music commands
- Usage: `custom music help`

### Data Storage

**localStorage Key**: `omega-custom-music-playlist`

**Storage Format**:
```javascript
{
    playlist: [
        {
            id: number,
            name: string,
            file: File (not stored, regenerated),
            url: string (object URL),
            duration: number,
            addedAt: string (ISO timestamp)
        }
    ],
    name: string,
    lastUpdated: string (ISO timestamp)
}
```

**Note**: File objects and object URLs are not persisted. Only metadata is stored. Files must be re-uploaded after page reload.

---

## SPOTIFY PLAYER

### File Location
- **Plugin**: `js/plugins/omega-spotify-player.js`
- **Commands**: `js/commands/entertainment.js` (spotify subcommands)
- **Styles**: `styles/spotify-player.css`
- **Callback Page**: `pages/spotify-callback.html`
- **HTML Integration**: `terminal.html` (line 154)

### Configuration

```javascript
const SPOTIFY_CONFIG = {
    CLIENT_ID: 'dc96d602cecc4ff0a28e122dc71fa8af',
    REDIRECT_URI: window.location.origin + '/pages/spotify-callback.html',
    SCOPES: [
        'streaming',
        'user-read-email',
        'user-read-private',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-library-read',
        'playlist-read-private',
        'user-top-read'
    ].join(' '),
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token'
};
```

### PKCE Helper Functions

**`generateRandomString(length)`**
- Generates cryptographically random string
- Used for code verifier (64 characters)

**`sha256(plain)`**
- Hashes input using Web Crypto API
- Returns ArrayBuffer

**`base64encode(input)`**
- Base64url encodes input (URL-safe)
- Removes padding, replaces `+`/`/` with `-`/`_`

**`generateCodeChallenge(codeVerifier)`**
- Hashes code verifier with SHA-256
- Base64url encodes result
- Used in PKCE authorization flow

### Class Structure: OmegaSpotifyPlayer

#### Constructor & State

```javascript
class OmegaSpotifyPlayer {
    constructor() {
        this.accessToken = localStorage.getItem('spotify_access_token');
        this.refreshToken = localStorage.getItem('spotify_refresh_token');
        this.tokenExpiry = localStorage.getItem('spotify_token_expiry');
        this.player = null;                  // Spotify.Player instance
        this.deviceId = null;                // Web Playback SDK device ID
        this.currentTrack = null;            // Current track object
        this.isPlaying = false;              // Playback state
        this.isPanelOpen = false;            // Panel visibility state
    }
}
```

#### Core Methods

##### 1. Initialization & Player Setup

**`init()`**
- Checks for valid access token
- Loads Spotify Web Playback SDK script if needed
- Sets up player when SDK ready
- Returns Promise

**`setupPlayer()`**
- Creates new `Spotify.Player` instance:
  ```javascript
  new Spotify.Player({
      name: 'Omega Terminal Player',
      getOAuthToken: cb => { cb(this.accessToken); },
      volume: 0.5
  })
  ```
- Sets up event listeners:
  - `initialization_error`: SDK initialization failure
  - `authentication_error`: Token invalid, triggers logout
  - `account_error`: Account access issues
  - `playback_error`: Playback failure
  - `player_state_changed`: Playback state updates
  - `ready`: Player connected, gets device ID
  - `not_ready`: Device disconnected
- Connects player to Spotify account

**`isTokenExpired()`**
- Checks if token expiry time has passed
- Returns `true` if expired or no expiry set

**`transferPlayback()`**
- Transfers Spotify playback to this device
- Uses device ID from `ready` event
- Called automatically when player ready

##### 2. Authentication (PKCE Flow)

**`authenticate()`**
- Validates Spotify configuration
- Generates PKCE code verifier and challenge
- Stores code verifier in localStorage
- Builds authorization URL with PKCE parameters
- Opens popup window for user authorization
- Sets up message listener for auth callback
- Filters out non-Spotify messages (MetaMask, etc.)

**Authorization URL Parameters**:
```
client_id: CLIENT_ID
response_type: code
redirect_uri: REDIRECT_URI (encoded)
scope: SCOPES (encoded)
code_challenge_method: S256
code_challenge: base64url(sha256(codeVerifier))
show_dialog: true
```

**`handleAuthSuccess(data)`**
- Processes authentication callback
- Extracts `access_token`, `expires_in`, `refresh_token`
- Stores tokens in localStorage
- Calculates token expiry timestamp
- Initializes player
- Updates UI
- Opens panel if it was waiting

##### 3. Playback Control

**`togglePlay()`**
- Toggles play/pause via Spotify SDK
- Optimistically updates state (confirmed by event)
- Updates play button UI

**`nextTrack()`**
- Advances to next track via SDK
- SDK handles queue management

**`previousTrack()`**
- Returns to previous track via SDK

**`setVolume(volume)`**
- Sets volume (0.0 to 1.0)
- Updates Spotify player volume

**`playTrack(uri)`**
- Plays specific track by Spotify URI
- Uses REST API: `PUT /v1/me/player/play`
- Requires `device_id` parameter
- Body: `{ uris: [uri] }`

**`playPlaylist(uri)`**
- Plays playlist by context URI
- Uses REST API: `PUT /v1/me/player/play`
- Body: `{ context_uri: uri }`

##### 4. Search & Discovery

**`search(query)`**
- Searches Spotify tracks
- Uses REST API: `GET /v1/search?q={query}&type=track&limit=20`
- Returns array of track objects
- Handles errors gracefully

**`getUserPlaylists()`**
- Fetches user's playlists
- Uses REST API: `GET /v1/me/playlists?limit=20`
- Returns array of playlist objects

**`performSearch(query)`**
- Wrapper for search with UI updates
- Updates `#spotify-tracks-list` with results
- Renders track items with artwork, name, artist, duration
- Makes tracks clickable to play

**`loadPlaylists()`**
- Wrapper for getUserPlaylists with UI updates
- Updates `#spotify-tracks-list` with playlists
- Renders playlist items with artwork, name, track count

##### 5. UI Management

**`openPanel()`**
- Checks Spotify configuration
- Validates authentication
- Initializes player if needed
- Creates and shows panel

**`closePanel()`**
- Removes panel from DOM
- Resets `isPanelOpen` flag

**`createPanel()`**
- Removes existing panel
- Creates new panel HTML
- Renders login screen or player interface
- Appends to `.omega-stats` (dashboard mode) or `body`

**`renderLogin()`**
- Returns HTML for login screen
- Shows Spotify logo, connect button
- Displays setup instructions if needed

**`renderPlayer()`**
- Returns HTML for player interface:
  - Now Playing section (artwork, track name, artist)
  - Playback controls (prev, play/pause, next)
  - Volume slider
  - Search input
  - Tracks/playlists list
  - Footer actions (My Playlists, Disconnect)

**`updateUI()`**
- Refreshes panel content
- Re-renders player or login based on auth state
- Called after state changes

**`updatePlayButton()`**
- Updates play/pause button independently
- Changes icon and class based on `isPlaying`
- More efficient than full UI update

##### 6. Utility Methods

**`logout()`**
- Clears all tokens from localStorage
- Disconnects player
- Resets state
- Updates UI

**`formatDuration(ms)`**
- Converts milliseconds to `MM:SS` format
- Used for track duration display

**`showSetupInstructions()`**
- Creates panel with setup guide
- Shows step-by-step instructions
- Includes link to Spotify Dashboard

### Spotify Callback Page (`pages/spotify-callback.html`)

**Purpose**: Handles OAuth redirect after user authorization

**Flow**:
1. User authorizes in Spotify popup
2. Spotify redirects to callback page with `code` parameter
3. Callback page exchanges code for access token
4. Sends token to opener window via `postMessage`
5. Closes popup automatically

**Key Functions**:

**`parseParams()`**
- Parses URL search parameters
- Returns object with `code`, `error`, etc.

**`exchangeCodeForToken(code, codeVerifier)`**
- Exchanges authorization code for access token
- Uses PKCE flow (POST to `/api/token`)
- Body includes `code`, `code_verifier`, `client_id`, `grant_type`, `redirect_uri`
- Returns token data object

**Message Passing**:
- Sends `postMessage` to `window.opener` with:
  ```javascript
  {
      type: 'spotify-auth-success',
      access_token: string,
      token_type: 'Bearer',
      expires_in: number,
      refresh_token: string
  }
  ```

### UI Components

#### Panel Structure

```
.spotify-player-panel
├── .spotify-panel-header
│   ├── .spotify-header-title
│   └── .spotify-close-btn
└── .spotify-panel-content
    ├── .spotify-login-screen (if not authenticated)
    │   ├── .spotify-logo-large
    │   ├── h2, p
    │   ├── .spotify-connect-btn
    │   └── .spotify-setup-note
    └── .spotify-player-container (if authenticated)
        ├── .spotify-now-playing
        ├── .spotify-controls
        ├── .spotify-volume
        ├── .spotify-search
        ├── .spotify-tracks
        └── .spotify-footer
```

#### Visual Features

- **Spotify Brand Colors**: Green gradient header (`#1DB954` to `#1ed760`)
- **Glass Morphism**: Translucent background matching terminal theme
- **Album Artwork**: Displays track/playlist images
- **Search Interface**: Real-time track search
- **Playlist Integration**: Browse and play user playlists
- **Volume Control**: Slider for playback volume

### Commands

**`spotify` or `spotify open`**
- Opens Spotify player panel
- Usage: `spotify` or `spotify open`

**`spotify connect`**
- Initiates Spotify authentication
- Opens popup for user authorization
- Usage: `spotify connect`

**`spotify disconnect`**
- Logs out from Spotify
- Clears tokens and resets state
- Usage: `spotify disconnect`

**`spotify close`**
- Closes player panel
- Usage: `spotify close`

**`spotify play`**
- Toggles play/pause
- Usage: `spotify play`

**`spotify next`**
- Advances to next track
- Usage: `spotify next`

**`spotify prev`**
- Returns to previous track
- Usage: `spotify prev`

**`spotify search <query>`**
- Searches for tracks
- Opens panel and displays results
- Usage: `spotify search "artist name"`

**`spotify help`**
- Shows all available commands
- Displays setup instructions
- Usage: `spotify help`

### Data Storage

**localStorage Keys**:
- `spotify_access_token`: OAuth access token
- `spotify_refresh_token`: OAuth refresh token (if provided)
- `spotify_token_expiry`: Timestamp when token expires
- `spotify_code_verifier`: PKCE code verifier (temporary, cleared after auth)

**Token Expiry**:
- Tokens expire after `expires_in` seconds (typically 3600)
- Expiry timestamp calculated: `Date.now() + (expires_in * 1000)`
- Token refresh not implemented (requires backend)

---

## INTEGRATION & COMMANDS

### Terminal Integration

Both players integrate with the Omega Terminal command system:

**Custom Music Commands** (`js/commands/custom-music-commands.js`):
- Registered via `window.terminal.addCommand()`
- Commands: `upload music`, `playlist`, `custom music help`

**Spotify Commands** (`js/commands/entertainment.js`):
- Part of entertainment command module
- Subcommands: `spotify [open|connect|disconnect|close|play|next|prev|search|help]`

### Dashboard Integration

Both players integrate with the futuristic dashboard:

- Panels appear in `.omega-stats` section when dashboard is active
- Positioning changes from fixed to relative in dashboard mode
- Maintains same functionality in both modes

### Event Listeners

**Custom Music Player**:
- File input changes
- Drag and drop events
- Button clicks (play, prev, next, remove, close)

**Spotify Player**:
- Spotify SDK events (state changes, ready, errors)
- Button clicks (play, prev, next, search, playlists, disconnect)
- Volume slider input
- Search input enter key

### Global Access

Both players are exposed globally:
- `window.OmegaCustomMusicPlayer`: Custom music player instance
- `window.OmegaSpotify`: Spotify player instance

This allows:
- Command handlers to access player methods
- Inline HTML onclick handlers
- External scripts to control players

---

## UI COMPONENTS & STYLING

### Custom Music Player Styles

**File**: `styles/custom-music-player.css`

**Key Style Classes**:
- `.custom-music-player-panel`: Main panel container
- `.custom-music-upload-area`: Drag-and-drop zone
- `.playlist-track`: Individual track item
- `.playlist-track.active`: Currently playing track
- `.waveform-bar`: Animated waveform bars
- `.play-pause-btn`: Central play/pause button

**Color Scheme**:
- Primary: `#00d4ff` (cyan)
- Background: `rgba(0, 0, 0, 0.8)` with blur
- Border: `rgba(0, 212, 255, 0.2)`

**Animations**:
- `slideOutRight`: Panel close animation
- `waveformPulse`: Waveform bar animation

### Spotify Player Styles

**File**: `styles/spotify-player.css`

**Key Style Classes**:
- `.spotify-player-panel`: Main panel container
- `.spotify-panel-header`: Green gradient header
- `.spotify-now-playing`: Current track display
- `.spotify-controls`: Playback control buttons
- `.spotify-track-item`: Search result item
- `.spotify-playlist-item`: Playlist item

**Color Scheme**:
- Header: `#1DB954` to `#1ed760` gradient
- Background: Matches terminal glass morphism
- Accent: Spotify green

**Animations**:
- `slideInRight`: Panel open animation
- Button hover effects

### Responsive Design

Both players:
- Adapt to dashboard mode (relative positioning)
- Maintain fixed positioning in standalone mode
- Scrollable content areas with max-height
- Mobile-friendly touch targets

---

## AUTHENTICATION FLOWS

### Spotify Authentication (PKCE Flow)

**Step 1: Generate Code Verifier**
```javascript
const codeVerifier = generateRandomString(64);
// Example: "abc123...xyz789" (64 characters)
```

**Step 2: Generate Code Challenge**
```javascript
const codeChallenge = await generateCodeChallenge(codeVerifier);
// SHA-256 hash of verifier, base64url encoded
```

**Step 3: Store Verifier**
```javascript
localStorage.setItem('spotify_code_verifier', codeVerifier);
```

**Step 4: Redirect to Authorization**
```
https://accounts.spotify.com/authorize?
  client_id=CLIENT_ID&
  response_type=code&
  redirect_uri=REDIRECT_URI&
  scope=SCOPES&
  code_challenge_method=S256&
  code_challenge=CODE_CHALLENGE&
  show_dialog=true
```

**Step 5: User Authorizes**
- User logs in and grants permissions
- Spotify redirects to callback page with `code`

**Step 6: Exchange Code for Token**
```javascript
POST https://accounts.spotify.com/api/token
Content-Type: application/x-www-form-urlencoded

client_id=CLIENT_ID
grant_type=authorization_code
code=AUTHORIZATION_CODE
redirect_uri=REDIRECT_URI
code_verifier=CODE_VERIFIER
```

**Step 7: Receive Tokens**
```javascript
{
    access_token: "BQ...",
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "AQ...",
    scope: "streaming user-read-email ..."
}
```

**Step 8: Store Tokens**
- Store in localStorage
- Calculate expiry timestamp
- Initialize player

### Security Considerations

**PKCE Benefits**:
- Prevents authorization code interception attacks
- No client secret required (public client)
- Code verifier never sent to authorization server

**Token Storage**:
- Tokens stored in localStorage (accessible to JavaScript)
- Consider using httpOnly cookies for production (requires backend)
- Refresh token not implemented (would require backend)

**CORS**:
- Spotify API allows cross-origin requests
- Web Playback SDK loaded from `sdk.scdn.co`
- Callback page must match redirect URI exactly

---

## FILE STRUCTURE

```
omegaterminalupdated/
├── js/
│   ├── plugins/
│   │   ├── omega-custom-music-player.js    (729 lines)
│   │   └── omega-spotify-player.js         (812 lines)
│   └── commands/
│       ├── custom-music-commands.js        (89 lines)
│       └── entertainment.js                 (contains spotify commands)
├── styles/
│   ├── custom-music-player.css             (469 lines)
│   └── spotify-player.css                  (610 lines)
├── pages/
│   └── spotify-callback.html               (268 lines)
└── terminal.html                           (includes both player scripts)
```

### Script Loading Order

1. `omega-spotify-player.js` (line 154)
2. `omega-custom-music-player.js` (line 157)

Both players auto-initialize when DOM is ready.

---

## NEXT.JS MIGRATION NOTES

### Custom Music Player

**Challenges**:
- File upload requires browser File API
- Object URLs are browser-specific
- localStorage for persistence

**Migration Strategy**:
1. Keep client-side file handling
2. Consider server-side storage for uploaded files
3. Use Next.js API routes for file management
4. Replace localStorage with database or session storage

**Recommended Changes**:
- Upload files to `/api/upload` endpoint
- Store file metadata in database
- Generate permanent URLs for uploaded files
- Implement file size limits server-side

### Spotify Player

**Challenges**:
- PKCE flow requires client-side crypto
- Callback page must be static route
- Web Playback SDK requires browser environment

**Migration Strategy**:
1. Keep PKCE flow client-side
2. Create `/api/spotify/callback` route
3. Use Next.js API routes for token exchange (optional)
4. Store tokens in httpOnly cookies (recommended)

**Recommended Changes**:
- Move callback to `/api/spotify/callback`
- Use Next.js API route for token exchange
- Store tokens in httpOnly cookies
- Implement refresh token flow server-side
- Use environment variables for CLIENT_ID

**Environment Variables**:
```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
```

**Next.js API Route Example** (`pages/api/spotify/callback.js`):
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
        `spotify_access_token=${tokens.access_token}; HttpOnly; Secure; SameSite=Strict`,
        `spotify_refresh_token=${tokens.refresh_token}; HttpOnly; Secure; SameSite=Strict`
    ]);
    
    // Redirect to main app
    res.redirect('/');
}
```

### General Migration Considerations

1. **Component Architecture**: Convert to React components
2. **State Management**: Use React hooks or state management library
3. **API Routes**: Move API calls to Next.js API routes where appropriate
4. **Environment Variables**: Use Next.js env system
5. **Styling**: Consider CSS modules or styled-components
6. **SSR**: Both players require client-side only (use dynamic imports)

---

## ADDITIONAL FEATURES & CONSIDERATIONS

### Custom Music Player

**Supported Formats**:
- MP3, WAV, OGG, M4A, AAC, FLAC, WMA
- Validated by MIME type and file extension

**File Size Limits**:
- Maximum 50MB per file
- Configurable via `CUSTOM_MUSIC_CONFIG.MAX_FILE_SIZE`

**Playlist Persistence**:
- Playlists stored in browser localStorage
- Not synced across devices
- Lost if browser data cleared

**Future Enhancements**:
- Server-side file storage
- Cloud sync
- Playlist sharing
- Audio visualization
- Equalizer controls

### Spotify Player

**API Endpoints Used**:
- `GET /v1/search`: Track search
- `GET /v1/me/playlists`: User playlists
- `PUT /v1/me/player/play`: Start playback
- `GET /v1/me/player`: Get playback state (via SDK)

**Web Playback SDK Features**:
- Real-time playback state
- Device management
- Volume control
- Track navigation

**Limitations**:
- Requires Spotify Premium account
- Web Playback SDK only works on supported browsers
- Token refresh not implemented (tokens expire after 1 hour)

**Future Enhancements**:
- Token refresh flow
- Queue management
- Shuffle and repeat modes
- Current playback position display
- Progress bar
- Like/favorite tracks

---

## TROUBLESHOOTING

### Custom Music Player Issues

**Files not uploading**:
- Check file size (max 50MB)
- Verify file format is supported
- Check browser console for errors

**Playback not working**:
- Ensure browser supports HTML5 Audio
- Check audio element error events
- Verify file URLs are valid

**Playlist lost after reload**:
- localStorage may be cleared
- Check browser storage settings
- Files must be re-uploaded (not persisted)

### Spotify Player Issues

**Authentication fails**:
- Verify CLIENT_ID is correct
- Check redirect URI matches exactly
- Ensure popup is not blocked
- Check browser console for errors

**Player not connecting**:
- Verify access token is valid
- Check token expiry
- Ensure Spotify Premium account
- Check Web Playback SDK loaded

**Playback not starting**:
- Verify device ID is set
- Check track URI is valid
- Ensure Spotify app is open (sometimes required)
- Check browser console for API errors

**Token expired**:
- Tokens expire after 1 hour
- Re-authenticate with `spotify connect`
- Consider implementing refresh token flow

---

**END OF PLAYER SYSTEM DOCUMENTATION**

---

*Last Updated: 2025-11-03*
*Version: 1.0*
*Documentation for Omega Terminal v1.5.9*

