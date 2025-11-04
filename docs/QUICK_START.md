# Quick Start Guide - Omega Terminal Next.js

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies

```bash
cd omega-terminal-nextjs
npm install
```

This will install:

- Next.js 15.0.0
- React 18.3.0
- TypeScript 5.0.0
- ethers.js 6.15.0
- All required dev dependencies

### Step 2: Configure Environment (Optional)

```bash
# The project works without configuration, but you can add API keys for enhanced features
cp .env.example .env.local

# Edit .env.local and add your keys (all optional):
# - KALSHI_API_KEY (for prediction markets)
# - GEMINI_API_KEY (for AI features)
# - RELAYER_PRIVATE_KEY (for blockchain operations)
```

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✅ What You'll See

1. **Boot Animation (2.5 seconds)**

   - Omega logo (Ω) with glow effect
   - Version: v2.0.1
   - Feature badges: AI, Multi-Chain, DeFi, NFTs
   - Animated loading bar

2. **Terminal Interface**
   - Header with social links
   - Theme controls
   - AI provider selector
   - Connection status
   - Tab bar with "Terminal 1"
   - Command input with prompt "Ω Terminal:~$"

## 🛠️ Available Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📂 Project Structure

```
omega-terminal-nextjs/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components (ready for Phase 2)
│   ├── hooks/         # Custom hooks (ready for Phase 2)
│   ├── lib/           # Utilities and constants
│   └── types/         # TypeScript definitions
├── public/            # Static assets
├── .env.local         # Your environment variables (git-ignored)
├── .env.example       # Environment template
└── package.json       # Dependencies
```

## 🎯 Current Features (Phase 1)

✅ Boot animation with Omega branding  
✅ Terminal UI with header and controls  
✅ Multi-tab interface foundation  
✅ Theme controls (UI only, functionality in Phase 2)  
✅ AI provider selector  
✅ Connection status display  
✅ Command input section  
✅ Responsive design foundation  
✅ TypeScript type safety  
✅ No linter errors

## 🔜 Coming in Phase 2

- Terminal command processing
- Command history
- Terminal output rendering
- Theme switching functionality
- Tab management
- Wallet connection

## 🐛 Troubleshooting

### Port 3000 already in use?

```bash
# Use a different port
PORT=3001 npm run dev
```

### Module not found errors?

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors?

```bash
# Restart TypeScript server in VS Code
# Command Palette (Cmd+Shift+P) -> "TypeScript: Restart TS Server"
```

## 📚 Documentation

- **Full README**: See [README.md](./README.md)
- **Implementation Details**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Environment Variables**: See [.env.example](./.env.example)

## 🎉 Success!

If you see the boot animation followed by the terminal interface, Phase 1 is working perfectly!

---

**Next**: Proceed to Phase 2 for command processing and core terminal functionality.
