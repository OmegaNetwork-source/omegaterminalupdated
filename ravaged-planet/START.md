# How to Start the Game

## ⚠️ IMPORTANT: Directory Requirements

**You MUST be in the `ravaged-planet` directory when running `npm start`!**

The server needs to run from the game directory so it can serve the files correctly.

## Quick Start (3 steps)

1. **Navigate to the game directory:**
   ```bash
   cd ravaged-planet
   ```

2. **Install dependencies (first time only):**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Go to http://localhost:8000

## Verification

Before starting, verify you're in the correct directory:

```bash
# Check current directory
pwd

# Verify files exist
ls package.json
ls index.html
ls src/main.js
```

You should see all these files in your current directory.

## Common Errors

### Error: "package.json not found"
**Solution:** You're not in the ravaged-planet directory. Run `cd ravaged-planet` first.

### Error: "http-server: command not found"
**Solution:** Run `npm install` to install dependencies.

### Error: "Cannot GET /"
**Solution:** Make sure you're running the server from the ravaged-planet directory, not the parent directory.

## Alternative: Use Convenience Scripts

From the **project root** (PGT-Battle-Tanks), you can use:

- **Windows**: Double-click `start-game.bat`
- **PowerShell**: Run `.\start-game.ps1`

These scripts automatically navigate to the correct directory.

