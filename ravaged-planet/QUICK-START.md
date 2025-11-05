# ⚡ QUICK START - Ravaged Planet

## The Golden Rule 🎯
**ALWAYS run `npm start` from INSIDE the `ravaged-planet` directory!**

## Step-by-Step Instructions

### 1. Open Terminal/PowerShell
Open your terminal in the project root: `C:\Users\jmrit\PGT-Battle-Tanks`

### 2. Navigate to Game Directory
```bash
cd ravaged-planet
```

### 3. Verify You're in the Right Place
You should see these files:
- `package.json` ✓
- `index.html` ✓
- `src/` folder ✓

### 4. Install Dependencies (First Time Only)
```bash
npm install
```

### 5. Start the Server
```bash
npm start
```

### 6. Open Browser
Go to: **http://localhost:8000**

## ✅ Success Indicators
- Terminal shows: "Starting up http-server..."
- Terminal shows: "Available on: http://localhost:8000"
- Browser loads the game canvas
- You can see tanks and terrain

## ❌ Common Mistakes

| Error | Cause | Solution |
|-------|-------|----------|
| `package.json not found` | Wrong directory | Run `cd ravaged-planet` first |
| `http-server: command not found` | Dependencies not installed | Run `npm install` |
| Blank page in browser | Server not running from correct dir | Stop server, `cd ravaged-planet`, restart |

## 🚀 Even Faster: Use Scripts

From project root, just run:
- **Windows**: `start-game.bat`
- **PowerShell**: `.\start-game.ps1`

These handle everything automatically!

## Need Help?

Check `START.md` for detailed troubleshooting.

