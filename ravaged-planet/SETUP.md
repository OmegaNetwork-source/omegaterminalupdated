# Setup Instructions

This is a vanilla JavaScript game that uses ES6 modules. To run it properly, you need to serve it via HTTP (not file://) due to browser CORS restrictions for ES modules.

## Quick Start

### Option 1: Using npm (Recommended)
**CRITICAL: Must be in the ravaged-planet directory!**

```bash
# Navigate to the game directory first
cd ravaged-planet

# Install dependencies (first time only)
npm install

# Start the server
npm start
```

Then open: http://localhost:8000

### Option 2: Python HTTP Server
**CRITICAL: Must be in the ravaged-planet directory!**

```bash
# Navigate to the game directory first
cd ravaged-planet

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: http://localhost:8000

### Option 3: Node.js HTTP Server (from root directory)
```bash
# From project root, can specify the directory
npx http-server ravaged-planet -p 8000
```

Then open: http://localhost:8000

### Option 4: Convenience Scripts
- **Windows**: Double-click `start-game.bat` from project root
- **PowerShell**: Run `.\start-game.ps1` from project root

### Option 3: VS Code Live Server
Install the "Live Server" extension in VS Code and click "Go Live"

## File Structure
```
ravaged-planet/
├── index.html          # Main HTML entry point
├── assets/
│   └── font.ttf       # Game font
├── src/
│   ├── main.js        # Game main loop
│   ├── ai.js          # AI players
│   ├── constants.js   # Game constants
│   ├── gfx.js         # Graphics utilities
│   ├── input.js       # Input handling
│   ├── math.js        # Math utilities
│   ├── projectiles.js # Projectile physics
│   ├── sky.js         # Sky generation
│   ├── sound.js       # Audio system
│   ├── terrain.js     # Terrain generation
│   ├── utils.js       # Utility functions
│   └── weapons.js     # Weapon definitions
└── LICENSE.md
```

## Controls
- **Arrow Up/Down**: Increase/decrease firing power
- **Arrow Left/Right**: Aim higher/lower
- **Shift + Arrows**: Fast increment/decrement
- **Alt + Arrows**: Slow increment/decrement
- **Tab**: Switch weapon
- **Space**: Fire

## Requirements
- Modern browser with ES6 module support (Chrome, Firefox, Edge, Safari)
- Local HTTP server (cannot run via file:// protocol)

