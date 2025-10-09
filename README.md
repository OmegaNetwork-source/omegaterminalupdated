# 🚀 Omega Terminal v2.0.1

**The Ultimate Multi-Chain Web3 Terminal** - A powerful, modular terminal interface for Web3 trading, NFTs, DeFi, and more.

![Omega Terminal](https://img.shields.io/badge/version-1.5.9-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![Web3](https://img.shields.io/badge/Web3-Multi--Chain-purple.svg)

## ✨ **Live Demo**
🌐 **[Try Omega Terminal](https://your-username.github.io/omega-terminal)** (Replace with your GitHub Pages URL)

## 🎯 **Key Features**

### 🔗 **Multi-Chain Support**
- **Ethereum, Solana, NEAR, Eclipse, BSC, Polygon** and more
- **Wallet Integration**: MetaMask, Phantom, NEAR Wallet, Shade Agents
- **Cross-chain** portfolio tracking and trading

### 💎 **NFT Trading Suite**
- **OpenSea Integration** with real-time data
- **NFT Discovery** - search, analytics, marketplace
- **Collection Analytics** with floor prices and trends
- **Activity Feed** with real-time events

### 📊 **Advanced Analytics**
- **DexScreener** ultimate analytics dashboard
- **DeFi Llama** TVL and protocol data  
- **Price Tracking** across multiple DEXs
- **Portfolio Analytics** with P&L tracking

### 🎮 **Omega Arcade**
- **Built-in Games**: Flappy Omega, Snake.io, Brick Breaker
- **Leaderboards** with on-chain integration
- **Credit System** with wallet-based authentication

### 🤖 **AI-Powered Features**
- **Intelligent Commands** with natural language processing
- **Market Analysis** and trading insights
- **Automated Responses** for common queries

### 👤 **Profile & API Management**
- **User Profiles** with customizable settings
- **API Key Management** for enhanced features
- **Personal Settings** and preferences

## 🚀 **Quick Start**

### **1. Open the Terminal**
Simply open `index-modular.html` in your browser or visit the live demo.

### **2. Connect a Wallet**
```bash
# For MetaMask/Ethereum
connect

# For Shade Agents (Multi-chain)
shade

# For Solana/Phantom
solana wallet
```

### **3. Explore Features**
```bash
# NFT commands
nft assets boredapeyachtclub
nft analytics cryptopunks

# Trading analytics  
dexscreener BTC
defillama protocols

# Profile setup
profile

# Help system
help
```

## 📁 **Project Structure**

```
omega-terminal/
├── index-modular.html          # Main terminal interface
├── js/
│   ├── terminal-core.js        # Core terminal logic
│   ├── commands/               # Modular command system
│   │   ├── basic.js           # Basic commands (help, clear, etc.)
│   │   ├── api.js             # API integrations
│   │   ├── solana.js          # Solana blockchain commands
│   │   ├── near.js            # NEAR Protocol commands
│   │   └── ...
│   ├── wallet.js              # Wallet connection logic
│   └── themes.js              # Theme management
├── styles/
│   ├── base.css               # Core styling
│   ├── themes.css             # Color themes
│   ├── animations.css         # Boot animations
│   └── gui-themes.css         # GUI theme modes
├── profile-command-only.js     # Profile & API key management
├── opensea-enhanced-plugin.js   # NFT trading suite
├── dexscreener-analytics-ultimate.js  # Trading analytics
├── omega-arcade-sdk.js         # Gaming integration
└── relayer-faucet.js          # Backend API integration
```

## 🔧 **Configuration**

### **API Keys (Optional)**
Add your own API keys for enhanced features:

1. Type `profile` to open settings
2. Configure API keys for:
   - **OpenSea** - NFT data and trading
   - **DexScreener** - Enhanced analytics  
   - **DeFi Llama** - Protocol data
   - **CoinGecko** - Price data
   - **Alpha Vantage** - Stock market data

### **Themes**
Switch between multiple themes:
```bash
# GUI Themes
theme chatgpt    # Conversational AI interface
theme discord    # Discord-style chat
theme windows95  # Retro DOS interface
theme aol        # 90s instant messenger
theme limewire   # P2P file sharing style

# Color Themes  
theme modern     # Default modern theme
theme crypto     # Crypto-focused colors
theme dark       # Dark mode
theme light      # Light mode
```

## 🛠 **Development**

### **Adding New Commands**
1. Create a new file in `js/commands/`
2. Follow the modular command pattern
3. Add to the command registry in `terminal-core.js`

### **Adding New Themes**
1. Add CSS variables to `styles/themes.css`
2. Update theme switcher in `js/themes.js`
3. Test across all GUI modes

### **API Integrations**
1. Add API logic to `js/commands/api.js`
2. Implement error handling and rate limiting
3. Add to the API key management system

## 📱 **Mobile Support**
- **Responsive Design** works on all devices
- **Touch-friendly** interface with mobile optimizations
- **PWA Ready** - can be installed as an app

## 🔐 **Security**
- **Client-side Only** - no server required
- **Local Storage** for settings and API keys
- **No Private Keys** stored - wallet integrations only
- **CORS Compliant** API integrations

## 🤝 **Contributing**
1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Submit a pull request

## 📄 **License**
MIT License - see LICENSE file for details

## 🆘 **Support**
- **Commands**: Type `help` in the terminal
- **Documentation**: See README files in the repo
- **Issues**: Create a GitHub issue for bugs

## 🎉 **Latest Updates (v1.5.9)**

### ✅ **New Features:**
- **Command-only Profile System** with API key management
- **Enhanced NFT Trading** with OpenSea integration
- **Ultimate DexScreener Analytics** dashboard
- **Modular Architecture** with clean separation
- **5 GUI Themes** with seamless switching

### 🐛 **Bug Fixes:**
- **Mobile responsiveness** improvements
- **API error handling** enhancements  
- **Theme consistency** across all modes
- **Performance optimizations**

---

**Built with ❤️ for the Web3 community**

⭐ **Star this repo** if you find it useful!  
🐦 **Follow us** for updates and new features  
💬 **Join the community** and share your feedback
