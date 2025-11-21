/**
 * Section Commands Extractor
 * Extracts all commands and subcommands from a sidebar section
 */

export interface SectionCommand {
  command: string;
  label: string;
  description?: string;
}

/**
 * Extract commands from a section ID
 * Maps section IDs to their commands based on the sidebar structure
 */
export function extractCommandsFromSection(sectionId: string): SectionCommand[] {
  const commands: SectionCommand[] = [];

  switch (sectionId) {
    case "quick":
      commands.push(
        { command: "help", label: "System Help" },
        { command: "connect", label: "Connect Wallet", description: "Connect MetaMask wallet" },
        { command: "faucet", label: "Claim Faucet" },
        { command: "ai", label: "AI Assistant" },
        { command: "view", label: "Basic View" },
        { command: "clear", label: "Clear Terminal" },
        // Color Palettes - Vibrant
        { command: "color red", label: "Red Palette" },
        { command: "color crimson", label: "Crimson Palette" },
        { command: "color anime", label: "Anime Palette" },
        { command: "color cyber", label: "Cyber Palette" },
        { command: "color neon", label: "Neon Palette" },
        { command: "color fire", label: "Fire Palette" },
        { command: "color flame", label: "Flame Palette" },
        { command: "color toxic", label: "Toxic Palette" },
        { command: "color radioactive", label: "Radioactive Palette" },
        { command: "color infrared", label: "Infrared Palette" },
        // Color Palettes - Seasonal
        { command: "color xmas", label: "Xmas Palette" },
        // Color Palettes - Cool Tones
        { command: "color ocean", label: "Ocean Palette" },
        { command: "color blue", label: "Blue Palette" },
        { command: "color ice", label: "Ice Palette" },
        { command: "color frost", label: "Frost Palette" },
        { command: "color mint", label: "Mint Palette" },
        { command: "color turquoise", label: "Turquoise Palette" },
        { command: "color slate", label: "Slate Palette" },
        { command: "color silver", label: "Silver Palette" },
        // Color Palettes - Warm Tones
        { command: "color sunset", label: "Sunset Palette" },
        { command: "color rose", label: "Rose Palette" },
        { command: "color pink", label: "Pink Palette" },
        { command: "color amber", label: "Amber Palette" },
        { command: "color honey", label: "Honey Palette" },
        { command: "color gold", label: "Gold Palette" },
        { command: "color luxury", label: "Luxury Palette" },
        // Color Palettes - Mystical
        { command: "color purple", label: "Purple Palette" },
        { command: "color violet", label: "Violet Palette" },
        { command: "color lavender", label: "Lavender Palette" },
        { command: "color lilac", label: "Lilac Palette" },
        // Color Palettes - Nature
        { command: "color forest", label: "Forest Palette" },
        { command: "color green", label: "Green Palette" },
        // Color Palettes - Light Mode
        { command: "color light", label: "Light Palette" },
        { command: "color reset", label: "Reset Palette" },
        // Themes
        { command: "theme retro", label: "Retro Theme", description: "Deep void terminal with vibrant accents" },
        { command: "theme neo", label: "Neo Theme", description: "Matrix digital rain with cyberpunk green" },
        { command: "theme elite", label: "Elite Theme", description: "Premium luxury with gold accents" },
        { command: "theme modern", label: "Modern Theme", description: "Futuristic glassmorphism with electric neon" }
      );
      break;

    case "news":
      commands.push(
        { command: "news", label: "Open News Reader" },
        { command: "news latest", label: "Latest News" },
        { command: "news hot", label: "Trending News" },
        { command: "news btc", label: "Bitcoin News" },
        { command: "news eth", label: "Ethereum News" },
        { command: "news sol", label: "Solana News" },
        { command: "news search", label: "Search News" }
      );
      break;

    case "media":
      commands.push(
        { command: "spotify", label: "Open Spotify" },
        { command: "blues", label: "Omega Blues" },
        { command: "lofi", label: "Omega Lo-Fi" },
        { command: "tech", label: "Omega Tech" },
        { command: "funky", label: "Omega Funky" },
        { command: "trance", label: "Omega Trance" },
        { command: "melodies", label: "Omega Melodies" }
      );
      break;

    case "youtube":
      commands.push(
        { command: "youtube", label: "YouTube Player" },
        { command: "youtube search", label: "Search Videos" }
      );
      break;

    case "mining":
      commands.push(
        { command: "mine", label: "Start Mining" },
        { command: "claim", label: "Claim Rewards" },
        { command: "stats", label: "Mining Status" }
      );
      break;

    case "advanced-trading":
      commands.push(
        { command: "markets:list", label: "List Markets" },
        { command: "markets:view", label: "View Market" },
        { command: "markets:heatmap", label: "Heatmap" },
        { command: "alpha:infer", label: "Get Forecast" },
        { command: "alpha:drops", label: "Daily Picks" },
        { command: "alpha:submit", label: "Submit Forecast" },
        { command: "pf:sync", label: "Sync Portfolio" },
        { command: "pf:show", label: "Portfolio View" },
        // Polymarket commands
        { command: "polymarket markets", label: "Markets", description: "Get current active markets" },
        { command: "polymarket trending", label: "Trending", description: "Get top volume markets" },
        { command: "polymarket events", label: "Events", description: "Get recent events" },
        { command: "polymarket recent", label: "Recent", description: "Get very recent events" },
        { command: "polymarket new", label: "New Markets", description: "Newest markets" },
        { command: "polymarket breaking", label: "Breaking News", description: "Breaking news markets" },
        { command: "polymarket politics", label: "Politics", description: "Political markets" },
        { command: "polymarket sports", label: "Sports", description: "Sports markets" },
        { command: "polymarket crypto", label: "Crypto", description: "Crypto markets" },
        { command: "polymarket earnings", label: "Earnings", description: "Earnings markets" },
        { command: "polymarket geopolitics", label: "Geopolitics", description: "Geopolitical markets" },
        { command: "polymarket tech", label: "Tech", description: "Technology markets" },
        { command: "polymarket culture", label: "Culture", description: "Culture markets" },
        { command: "polymarket world", label: "World Events", description: "World events markets" },
        { command: "polymarket economy", label: "Economy", description: "Economic markets" },
        { command: "polymarket trump", label: "Trump", description: "Trump-related markets" },
        { command: "polymarket elections", label: "Elections", description: "Election markets" },
        // Kalshi commands
        { command: "kalshi markets", label: "Markets", description: "List active markets" },
        { command: "kalshi trending", label: "Trending", description: "Top trending markets by volume" },
        { command: "kalshi new", label: "New Markets", description: "Newest markets" },
        { command: "kalshi politics", label: "Politics", description: "Political markets" },
        { command: "kalshi sports", label: "Sports", description: "Sports markets" },
        { command: "kalshi culture", label: "Culture", description: "Culture & entertainment markets" },
        { command: "kalshi crypto", label: "Crypto", description: "Cryptocurrency markets" },
        { command: "kalshi climate", label: "Climate", description: "Climate & environment markets" },
        { command: "kalshi economics", label: "Economics", description: "Economic markets" },
        { command: "kalshi tech", label: "Tech", description: "Technology markets" },
        { command: "kalshi world", label: "World Events", description: "World events & global markets" },
        { command: "kalshi events", label: "Events", description: "List events" },
        // Trading commands
        { command: "trade connect polymarket", label: "Connect Polymarket", description: "Connect to Polymarket (uses wallet)" },
        { command: "trade connect kalshi", label: "Connect Kalshi", description: "Connect to Kalshi (requires API keys)" },
        { command: "trade balance", label: "Check Balance", description: "Check your trading balance" },
        { command: "trade positions", label: "View Positions", description: "View your open positions" },
        { command: "trade help", label: "Trading Help", description: "Unified trading commands help" },
        { command: "hyperliquid", label: "Hyperliquid" }
      );
      break;

    case "entertainment":
      commands.push(
        { command: "games", label: "Games" },
        { command: "screensaver", label: "Screensaver" }
      );
      break;

    case "trading":
      commands.push(
        // Main actions
        { command: "faucet", label: "Claim Faucet", description: "Claim test tokens" },
        { command: "clear", label: "Clear Terminal", description: "Clear terminal output" },
        // Omega Perps - special action (opens panel)
        { command: "perps", label: "Omega Perps", description: "Open Omega Perps trading panel" },
        // Live Charts subactions
        { command: "chart BTC", label: "Bitcoin Chart", description: "BTC/USD price chart" },
        { command: "chart ETH", label: "Ethereum Chart", description: "ETH/USD price chart" },
        { command: "chart SOL", label: "Solana Chart", description: "SOL/USD price chart" },
        { command: "chart TVC:GOLD", label: "Gold Chart", description: "Gold price chart" },
        { command: "chart TVC:SILVER", label: "Silver Chart", description: "Silver price chart" },
        { command: "chart", label: "Custom Chart", description: "Open custom chart viewer" },
        // DexScreener subactions
        { command: "ds search WBTC", label: "BTC Analytics", description: "Bitcoin analytics on DexScreener" },
        { command: "ds search WETH", label: "ETH Analytics", description: "Ethereum analytics on DexScreener" },
        { command: "ds search SOL", label: "SOL Analytics", description: "Solana analytics on DexScreener" },
        { command: "ds trending", label: "Trending Tokens", description: "View trending tokens" },
        { command: "ds analytics", label: "Token Analytics", description: "Token analytics dashboard" },
        { command: "ds", label: "DexScreener Help", description: "DexScreener command help" },
        // DeFi Llama subactions
        { command: "defillama tvl", label: "Total DeFi TVL", description: "Total DeFi TVL across all chains" },
        { command: "defillama protocols 5", label: "Top 5 Protocols", description: "Top 5 DeFi protocols by TVL" },
        { command: "defillama chains 10", label: "Top 10 Chains", description: "Top 10 chains by TVL" },
        { command: "defillama tvl", label: "Protocol TVL", description: "Search protocol TVL" },
        { command: "defillama price ethereum", label: "ETH Price", description: "Ethereum price from DeFi Llama" },
        { command: "defillama tokens eth,btc,sol", label: "Multi-Token Prices", description: "Get prices for multiple tokens" },
        { command: "defillama price", label: "Custom Token Price", description: "Get custom token price" },
        { command: "defillama trending", label: "Trending Protocols", description: "Trending DeFi protocols" },
        { command: "defillama debug", label: "Debug Token Price", description: "Debug token price lookup" }
      );
      break;

    case "nft":
      commands.push(
        { command: "nft", label: "NFT Explorer" },
        { command: "nft generate", label: "Generate NFT" },
        { command: "magiceden", label: "Magic Eden" }
      );
      break;

    case "portfolio":
      commands.push(
        { command: "balance", label: "Check Balance" },
        { command: "pgt track", label: "Track New Wallet" },
        { command: "pgt portfolio", label: "View Portfolio" },
        { command: "pgt wallets", label: "List Wallets" },
        { command: "pgt refresh", label: "Refresh Data" }
      );
      break;

    case "network":
      commands.push(
        { command: "eth balance", label: "Check ETH Balance" },
        { command: "eth send", label: "Send Tokens" },
        { command: "sol balance", label: "Check SOL Balance" },
        { command: "near balance", label: "Check NEAR Balance" }
      );
      break;

    case "network-ethereum":
      commands.push(
        { command: "connect", label: "Connect Wallet", description: "Connect MetaMask wallet" },
        { command: "ethereum balance", label: "Check Balance", description: "Check Ethereum balance" },
        { command: "ethereum swap", label: "Token Swap (CowSwap)", description: "Swap tokens on Ethereum via CowSwap" },
        { command: "ethereum help", label: "Ethereum Help", description: "Show Ethereum commands help" }
      );
      break;

    case "network-arbitrum":
      commands.push(
        { command: "connect", label: "Connect Wallet", description: "Connect MetaMask wallet" },
        { command: "arbitrum balance", label: "Check Balance", description: "Check Arbitrum balance" },
        { command: "arbitrum swap", label: "Token Swap", description: "Swap tokens on Arbitrum" },
        { command: "arbitrum help", label: "Arbitrum Help", description: "Show Arbitrum commands help" }
      );
      break;

    case "network-optimism":
      commands.push(
        { command: "connect", label: "Connect Wallet", description: "Connect MetaMask wallet" },
        { command: "optimism balance", label: "Check Balance", description: "Check Optimism balance" },
        { command: "optimism swap", label: "Token Swap", description: "Swap tokens on Optimism" },
        { command: "optimism help", label: "Optimism Help", description: "Show Optimism commands help" }
      );
      break;

    case "network-base":
      commands.push(
        { command: "connect", label: "Connect Wallet", description: "Connect MetaMask wallet" },
        { command: "base balance", label: "Check Balance", description: "Check Base balance" },
        { command: "base swap", label: "Token Swap", description: "Swap tokens on Base" },
        { command: "base help", label: "Base Help", description: "Show Base commands help" }
      );
      break;

    case "network-bnb":
      commands.push(
        { command: "connect", label: "Connect Wallet", description: "Connect MetaMask wallet" },
        { command: "bnb balance", label: "Check Balance", description: "Check BNB balance" },
        { command: "bnb swap", label: "Token Swap", description: "Swap tokens on BNB Smart Chain" },
        { command: "bnb help", label: "BNB Help", description: "Show BNB commands help" }
      );
      break;

    case "network-polygon":
      commands.push(
        { command: "connect", label: "Connect Wallet", description: "Connect MetaMask wallet" },
        { command: "polygon balance", label: "Check Balance", description: "Check Polygon balance" },
        { command: "polygon bridge", label: "Bridge Assets", description: "Bridge assets to/from Polygon" },
        { command: "polygon swap", label: "Token Swap", description: "Swap tokens on Polygon" },
        { command: "polygon help", label: "Polygon Help", description: "Show Polygon commands help" }
      );
      break;

    case "network-uniswap":
      commands.push(
        { command: "uniswap ethereum swap", label: "Ethereum Swap", description: "Swap tokens on Ethereum via Uniswap" },
        { command: "uniswap arbitrum swap", label: "Arbitrum Swap", description: "Swap tokens on Arbitrum via Uniswap" },
        { command: "uniswap optimism swap", label: "Optimism Swap", description: "Swap tokens on Optimism via Uniswap" },
        { command: "uniswap base swap", label: "Base Swap", description: "Swap tokens on Base via Uniswap" },
        { command: "uniswap polygon swap", label: "Polygon Swap", description: "Swap tokens on Polygon via Uniswap" },
        { command: "uniswap bnb swap", label: "BNB Swap", description: "Swap tokens on BNB via Uniswap" },
        { command: "uniswap help", label: "Uniswap Help", description: "Show Uniswap commands help" }
      );
      break;

    case "network-pancakeswap":
      commands.push(
        { command: "pancakeswap bnb swap", label: "BNB Swap", description: "Swap tokens on BNB via PancakeSwap" },
        { command: "pancakeswap ethereum swap", label: "Ethereum Swap", description: "Swap tokens on Ethereum via PancakeSwap" },
        { command: "pancakeswap arbitrum swap", label: "Arbitrum Swap", description: "Swap tokens on Arbitrum via PancakeSwap" },
        { command: "pancakeswap base swap", label: "Base Swap", description: "Swap tokens on Base via PancakeSwap" },
        { command: "pancakeswap polygon swap", label: "Polygon Swap", description: "Swap tokens on Polygon via PancakeSwap" },
        { command: "pancakeswap optimism swap", label: "Optimism Swap", description: "Swap tokens on Optimism via PancakeSwap" },
        { command: "pancakeswap help", label: "PancakeSwap Help", description: "Show PancakeSwap commands help" }
      );
      break;

    case "network-solana":
      commands.push(
        { command: "solana connect", label: "Connect Phantom", description: "Connect Phantom wallet" },
        { command: "solana generate", label: "Generate Wallet", description: "Generate a new Solana wallet" },
        { command: "solana status", label: "Wallet Status", description: "Check Solana wallet status" },
        { command: "solana swap", label: "Token Swap", description: "Swap tokens on Solana" },
        { command: "solana search", label: "Search Tokens", description: "Search for tokens on Solana" }
      );
      break;

    case "network-near":
      commands.push(
        { command: "connect", label: "Connect NEAR Wallet", description: "Connect NEAR wallet" },
        { command: "near disconnect", label: "Disconnect Wallet", description: "Disconnect NEAR wallet" },
        { command: "balance", label: "Check Balance", description: "Check NEAR balance" },
        { command: "near account", label: "Account Info", description: "View NEAR account information" },
        { command: "near swap", label: "Token Swap", description: "Swap tokens on NEAR" },
        { command: "near quote", label: "Get Swap Quote", description: "Get swap quote on NEAR" },
        { command: "near help", label: "NEAR Help", description: "Show NEAR commands help" }
      );
      break;

    case "network-aptos":
      commands.push(
        { command: "aptos connect", label: "Connect Petra Wallet", description: "Connect Petra wallet" },
        { command: "aptos balance", label: "Check APT Balance", description: "Check Aptos balance" },
        { command: "aptos create token", label: "Create Token", description: "Create a new token on Aptos" },
        { command: "aptos help", label: "Aptos Help", description: "Show Aptos commands help" }
      );
      break;

    case "network-rome":
      commands.push(
        { command: "rome connect", label: "Connect Wallet", description: "Connect ROME wallet" },
        { command: "rome balance", label: "Check Balance", description: "Check ROME balance" },
        { command: "rome gen-wallet", label: "Generate Wallet", description: "Generate a new ROME wallet" },
        { command: "rome token create", label: "Create Token", description: "Create a new token on ROME" },
        { command: "rome nft mint", label: "Mint NFT", description: "Mint an NFT on ROME" },
        { command: "rome ens register", label: "Register ENS", description: "Register an ENS name on ROME" },
        { command: "rome status", label: "Network Status", description: "Check ROME network status" },
        { command: "rome help", label: "ROME Help", description: "Show ROME commands help" }
      );
      break;

    case "network-fair":
      commands.push(
        { command: "fair connect", label: "Connect MetaMask", description: "Connect MetaMask wallet" },
        { command: "fair generate", label: "Generate Wallet", description: "Generate a new FAIR wallet" },
        { command: "fair balance", label: "Check Balance", description: "Check FAIR balance" },
        { command: "fair faucet", label: "Claim Faucet", description: "Claim FAIR tokens from faucet" },
        { command: "create", label: "Create Token", description: "Create a new token on FAIR" },
        { command: "nft mint", label: "Mint NFT", description: "Mint an NFT on FAIR" },
        { command: "fns register", label: "Register ENS", description: "Register an ENS name on FAIR" },
        { command: "fair help", label: "FAIR Help", description: "Show FAIR commands help" }
      );
      break;

    case "network-monad":
      commands.push(
        { command: "monad connect", label: "Connect Wallet", description: "Connect MONAD wallet" },
        { command: "monad balance", label: "Check Balance", description: "Check MONAD balance" },
        { command: "monad network", label: "Network Info", description: "View MONAD network information" },
        { command: "monad staking", label: "Staking", description: "Stake MONAD tokens" },
        { command: "monad governance", label: "Governance", description: "Participate in MONAD governance" },
        { command: "monad help", label: "MONAD Help", description: "Show MONAD commands help" }
      );
      break;

    case "network-omega":
      commands.push(
        { command: "connect", label: "Connect Wallet", description: "Connect MetaMask wallet" },
        { command: "balance", label: "Check Balance", description: "Check wallet balance" },
        { command: "faucet", label: "Claim Faucet", description: "Claim test tokens" },
        { command: "mine", label: "Start Mining", description: "Start mining OMEGA tokens" },
        { command: "claim", label: "Claim Rewards", description: "Claim mining rewards" },
        { command: "create", label: "Create Token", description: "Create a new token" },
        { command: "nft mint", label: "Mint NFT", description: "Mint an NFT" },
        { command: "ens register", label: "Register ENS", description: "Register an ENS name" },
        { command: "referral create", label: "Create Referral Code", description: "Create a referral code" },
        { command: "referral stats", label: "View Stats", description: "View referral statistics" },
        { command: "referral leaderboard", label: "Leaderboard", description: "View referral leaderboard" },
        { command: "referral share twitter", label: "Share on Twitter", description: "Share referral on Twitter" },
        { command: "referral share discord", label: "Share on Discord", description: "Share referral on Discord" },
        { command: "referral dashboard", label: "Open Dashboard", description: "Open referral dashboard" }
      );
      break;

    case "tx":
      commands.push(
        { command: "send", label: "Send Tokens" },
        { command: "email", label: "Send Email" },
        { command: "inbox", label: "View Inbox" }
      );
      break;

    case "chaingpt":
      commands.push(
        { command: "chaingpt chat", label: "Chat" },
        { command: "chaingpt nft", label: "NFT Generator" },
        { command: "chaingpt contract", label: "Smart Contract Creator" }
      );
      break;

    default:
      // Unknown section
      break;
  }

  return commands;
}

/**
 * Get section category name
 */
export function getSectionCategory(sectionId: string): string {
  const categoryMap: Record<string, string> = {
    quick: "Wallet & Connection",
    news: "News & Media",
    media: "Media & Entertainment",
    youtube: "Media & Entertainment",
    mining: "Mining & Rewards",
    "advanced-trading": "Trading & Markets",
    entertainment: "Entertainment & Games",
    trading: "Trading & Analytics",
    nft: "NFT Explorer",
    portfolio: "DeFi & Analytics",
    network: "Network",
    tx: "Transactions",
    chaingpt: "ChainGPT Tools",
  };

  return categoryMap[sectionId] || "Other";
}

