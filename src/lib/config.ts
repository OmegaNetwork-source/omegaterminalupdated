/**
 * Omega Terminal Configuration
 * Centralized configuration for contracts, networks, and API endpoints
 * Migrated from js/config.js to TypeScript
 */

import { OmegaConfig } from "@/types/config";
import type { ChainGPTCapabilities } from "@/types/chaingpt";
import { APP_VERSION } from "@/lib/constants";

const DEFAULT_CHAINGPT_CAPABILITIES: ChainGPTCapabilities = {
  enabled: false,
  hasServerKey: false,
  features: {
    chat: false,
    stream: false,
    contract: false,
    auditor: false,
    nft: false,
  },
};

async function loadChainGPTCapabilities(): Promise<ChainGPTCapabilities> {
  try {
    const response = await fetch("/api/chaingpt/capabilities", {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ...DEFAULT_CHAINGPT_CAPABILITIES,
        message: `Capability request failed (${response.status})`,
      };
    }

    const payload = (await response.json()) as ChainGPTCapabilities;

    return {
      enabled: Boolean(payload?.enabled),
      hasServerKey: Boolean(payload?.hasServerKey),
      features: {
        chat: Boolean(payload?.features?.chat),
        stream: Boolean(payload?.features?.stream),
        contract: Boolean(payload?.features?.contract),
        auditor: Boolean(payload?.features?.auditor),
        nft: Boolean(payload?.features?.nft),
      },
      message: payload?.message,
    };
  } catch (error) {
    return {
      ...DEFAULT_CHAINGPT_CAPABILITIES,
      message:
        error instanceof Error ? error.message : "Unable to load capabilities",
    };
  }
}

/**
 * Main Omega Terminal Configuration
 */
export const config: OmegaConfig = {
  // Version Info
  VERSION: APP_VERSION,

  // Relayer and API URLs
  RELAYER_URL:
    process.env.NEXT_PUBLIC_RELAYER_URL ||
    "https://terminal-v1-5-9.onrender.com",
  OMEGA_RPC_URL:
    process.env.NEXT_PUBLIC_OMEGA_RPC_URL ||
    "https://0x4e454228.rpc.aurora-cloud.dev",

  // Multi-Chain Configuration
  /** Solana mainnet RPC endpoint (Helius recommended for production) */
  SOLANA_RPC_URL:
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    "https://api.mainnet-beta.solana.com",

  /** Fallback Solana RPC endpoints (in case primary fails) */
  SOLANA_FALLBACK_RPCS: [
    "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com",
    "https://rpc.ankr.com/solana",
    "https://solana-mainnet.rpc.extrnode.com",
  ],
  /** NEAR Protocol mainnet RPC endpoint */
  NEAR_RPC_URL:
    process.env.NEXT_PUBLIC_NEAR_RPC_URL || "https://rpc.mainnet.near.org",
  /** NEAR wallet URL for authentication */
  NEAR_WALLET_URL:
    process.env.NEXT_PUBLIC_NEAR_WALLET_URL || "https://app.mynearwallet.com",
  /** Eclipse network RPC endpoint */
  ECLIPSE_RPC_URL:
    process.env.NEXT_PUBLIC_ECLIPSE_RPC_URL ||
    "https://mainnetbeta-rpc.eclipse.xyz",
  /** SOLAR token address on Eclipse network */
  SOLAR_TOKEN_ADDRESS: "CwrZKtPiZJrAK3tTjNPP22rD9VzeoxQv8iHd6EeyNoze",
  /** Jupiter aggregator API URL (uses relayer proxy by default) */
  JUPITER_API_URL:
    process.env.NEXT_PUBLIC_JUPITER_API_URL ||
    process.env.NEXT_PUBLIC_RELAYER_URL ||
    "https://terminal-v1-5-9.onrender.com",
  /** Solar DEX API URL for Eclipse network */
  SOLAR_DEX_API_URL: "https://api.solarstudios.co",
  /** Deserialize aggregator API URL for Eclipse network */
  DESERIALIZE_API_URL: "https://api.deserialize.xyz",

  // Contract Addresses
  CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x54c731627f2d2b55267b53e604c869ab8e6a323b", // SimpleMiner contract with claimTo
  FAUCET_ADDRESS:
    process.env.NEXT_PUBLIC_FAUCET_ADDRESS ||
    "0xf8e00f8cfaccf9b95f703642ec589d1c6ceee1a9", // Faucet contract
  MINER_FAUCET_ADDRESS:
    process.env.NEXT_PUBLIC_MINER_FAUCET_ADDRESS ||
    "0x1c4ffffcc804ba265f6cfccffb94d0ae28b36207", // OmegaMinerFaucet contract
  MIXER_ADDRESS:
    process.env.NEXT_PUBLIC_MIXER_ADDRESS ||
    "0xc57824b37a7fc769871075103c4dd807bfb3fd3e", // Omega Mixer contract
  OMEGA_NFT_CONTRACT:
    process.env.NEXT_PUBLIC_OMEGA_NFT_CONTRACT ||
    "0x3aa39fe2dab93838ed3ad314b8867a8792902dd7", // Omega Network ERC-721 NFT contract

  // Contract ABIs
  CONTRACT_ABI: [
    "function mineBlock(uint256 nonce, bytes32 solution) external",
    "function claimRewards() external",
    "function claimTo(address recipient) external",
    "function getMinerInfo(address miner) external view returns (uint256 _totalMined, uint256 _lastMineTime, uint256 _pendingRewards)",
    "function calculateReward(address miner, uint256 nonce, bytes32 solution) external view returns (uint256)",
    "function cooldownPeriod() external view returns (uint256)",
    "function totalRewardsDistributed() external view returns (uint256)",
    "function owner() external view returns (address)",
    "function setCooldownPeriod(uint256 _cooldown) external",
    "function withdrawExcess() external",
    "event BlockMined(address indexed miner, uint256 nonce, bytes32 solution, uint256 reward)",
    "event RewardsClaimed(address indexed miner, uint256 amount)",
  ],

  FAUCET_ABI: [
    {
      inputs: [],
      name: "claim",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "user", type: "address" }],
      name: "getFaucetStatus",
      outputs: [
        { internalType: "bool", name: "canClaimNow", type: "bool" },
        { internalType: "uint256", name: "lastClaim", type: "uint256" },
        {
          internalType: "uint256",
          name: "timeUntilNextClaim",
          type: "uint256",
        },
        { internalType: "uint256", name: "claimAmount", type: "uint256" },
        { internalType: "uint256", name: "faucetBalance", type: "uint256" },
        { internalType: "uint256", name: "totalClaims_", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "emergencyWithdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "FaucetRefilled",
      type: "event",
    },
    {
      inputs: [],
      name: "refillFaucet",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "TokensClaimed",
      type: "event",
    },
    {
      inputs: [],
      name: "withdrawFaucet",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "canClaim",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "CLAIM_AMOUNT",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "CLAIM_COOLDOWN",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "faucetBalance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "getClaimInfo",
      outputs: [
        {
          internalType: "bool",
          name: "canClaimNow",
          type: "bool",
        },
        {
          internalType: "uint256",
          name: "lastClaim",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "timeUntilNextClaim",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "claimAmount",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getFaucetBalance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "getTimeUntilNextClaim",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "lastClaimTime",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalClaims",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],

  MINER_FAUCET_ABI: [
    {
      inputs: [],
      name: "mine",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "totalMined",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "lastMineTime",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ],

  MIXER_ABI: [
    "function deposit(bytes32 commitment) external payable",
    "function withdraw(bytes32 secret, address to) external",
  ],

  // NFT Contract ABI (ERC-721)
  OMEGA_NFT_ABI: [
    "function mint(address to, string memory tokenURI) public returns (uint256)",
    "function tokenURI(uint256 tokenId) public view returns (string memory)",
    "function balanceOf(address owner) public view returns (uint256)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function totalSupply() public view returns (uint256)",
    "function name() public view returns (string memory)",
    "function symbol() public view returns (string memory)",
  ],

  /**
   * Arcade Contract Configuration
   * Smart contract for on-chain game leaderboards on Omega Network
   * Deployed contract address: 0x1a196c1b6c22eb9389e286cc4b12fdebe8663996
   */
  ARCADE_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_ARCADE_CONTRACT_ADDRESS ||
    "0x1a196c1b6c22eb9389e286cc4b12fdebe8663996",

  ARCADE_CONTRACT_ABI: [
    {
      inputs: [
        { internalType: "uint8", name: "_gameType", type: "uint8" },
        { internalType: "uint256", name: "_score", type: "uint256" },
        { internalType: "string", name: "_username", type: "string" },
        { internalType: "string", name: "_gameData", type: "string" },
      ],
      name: "submitScore",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint8", name: "_gameType", type: "uint8" },
        { internalType: "uint256", name: "_limit", type: "uint256" },
      ],
      name: "getLeaderboard",
      outputs: [
        {
          components: [
            { internalType: "address", name: "player", type: "address" },
            { internalType: "string", name: "username", type: "string" },
            { internalType: "uint256", name: "score", type: "uint256" },
            { internalType: "uint256", name: "timestamp", type: "uint256" },
            { internalType: "uint8", name: "gameType", type: "uint8" },
            { internalType: "string", name: "gameData", type: "string" },
          ],
          internalType: "struct OmegaArcade.LeaderboardEntry[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_player", type: "address" },
        { internalType: "uint8", name: "_gameType", type: "uint8" },
      ],
      name: "getPlayerStats",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "highScore", type: "uint256" },
            { internalType: "uint256", name: "gamesPlayed", type: "uint256" },
            { internalType: "uint256", name: "totalScore", type: "uint256" },
            { internalType: "uint256", name: "lastPlayed", type: "uint256" },
            { internalType: "uint256", name: "rank", type: "uint256" },
          ],
          internalType: "struct OmegaArcade.PlayerStats",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_limit", type: "uint256" }],
      name: "getAllPlayerStats",
      outputs: [
        { internalType: "address[]", name: "players", type: "address[]" },
        { internalType: "string[]", name: "usernames", type: "string[]" },
        { internalType: "uint256[]", name: "totalScores", type: "uint256[]" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint8", name: "_gameType", type: "uint8" }],
      name: "getGameInfo",
      outputs: [
        { internalType: "string", name: "name", type: "string" },
        { internalType: "uint256", name: "totalPlayers", type: "uint256" },
        { internalType: "uint256", name: "totalScores", type: "uint256" },
        { internalType: "uint256", name: "highestScore", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_limit", type: "uint256" }],
      name: "getGlobalLeaderboard",
      outputs: [
        {
          components: [
            { internalType: "address", name: "player", type: "address" },
            { internalType: "string", name: "username", type: "string" },
            { internalType: "uint256", name: "score", type: "uint256" },
            { internalType: "uint256", name: "timestamp", type: "uint256" },
            { internalType: "uint8", name: "gameType", type: "uint8" },
            { internalType: "string", name: "gameData", type: "string" },
          ],
          internalType: "struct OmegaArcade.LeaderboardEntry[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint8", name: "_gameType", type: "uint8" }],
      name: "clearLeaderboard",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint8", name: "_gameType", type: "uint8" },
        { internalType: "string", name: "_newName", type: "string" },
      ],
      name: "updateGameName",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "gameType",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "score",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "username",
          type: "string",
        },
      ],
      name: "ScoreSubmitted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "username",
          type: "string",
        },
      ],
      name: "UsernameUpdated",
      type: "event",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "playerUsernames",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
  ],

  /**
   * Arcade Base URL for external game hosting
   * Optional configuration for hosting games on external platform
   */
  ARCADE_BASE_URL:
    process.env.NEXT_PUBLIC_ARCADE_BASE_URL ||
    "https://omega-arcade.vercel.app",

  // NFT API Endpoints
  OPENSEA_API_BASE_URL: "https://api.opensea.io/api/v2",
  OPENSEA_V1_URL: "https://api.opensea.io/api/v1",

  /**
   * Specialized Features Configuration
   * Referral, Ambassador, and Perps viewer base URLs
   */
  /** Omega Network Wildcard API base URL for referral system */
  REFERRAL_API_BASE:
    process.env.NEXT_PUBLIC_REFERRAL_API_BASE ||
    "https://omeganetwork.co/api/wildcard",
  /** Omega Network Ambassador API base URL for leaderboards */
  AMBASSADOR_API_BASE:
    process.env.NEXT_PUBLIC_AMBASSADOR_API_BASE ||
    "https://omeganetwork.co/api/v1/ambassadors",
  /** Omega Perps trading interface base URL */
  PERPS_BASE_URL:
    process.env.NEXT_PUBLIC_PERPS_BASE_URL ||
    "https://omegaperps.omeganetwork.co",

  // Network Configuration
  OMEGA_NETWORK: {
    chainId: "0x4e454228",
    chainIdDecimal: 1313161256,
    chainName: "Omega Network",
    nativeCurrency: {
      name: "OMEGA",
      symbol: "OMEGA",
      decimals: 18,
    },
    rpcUrls: ["https://0x4e454228.rpc.aurora-cloud.dev"],
    blockExplorerUrls: ["https://0x4e454228.explorer.aurora-cloud.dev/"],
  },

  // Command List for Autocomplete
  AVAILABLE_COMMANDS: [
    "help",
    "clear",
    "ai",
    "connect",
    "disconnect",
    "nft",
    "opensea",
    "magiceden",
    "me",
    "omega",
    "yes",
    "import",
    "balance",
    "faucet",
    "faucet status",
    "mine",
    "claim",
    "status",
    "stats",
    "send",
    "ens register",
    "ens resolve",
    "ens search",
    "mixer",
    "stress",
    "stopstress",
    "stressstats",
    "theme",
    "color",
    "palette",
    "gui",
    "gui ios",
    "gui aol",
    "gui limewire",
    "gui discord",
    "gui windows95",
    "gui terminal",
    "view",
    "view basic",
    "view futuristic",
    "view toggle",
    "rickroll",
    "fortune",
    "matrix",
    "hack",
    "disco",
    "stop",
    "tab",
    "email",
    "inbox",
    "dexscreener",
    "geckoterminal",
    "stock",
    "alphakey",
    "ds search",
    "ds trending",
    "cg search",
    "cg networks",
    "alpha",
    "alpha quote",
    "alpha daily",
    "alpha overview",
    "alpha macro",
    "solana connect",
    "solana generate",
    "solana status",
    "solana test",
    "solana search",
    "solana swap",
    "near connect",
    "near swap",
    "near tokens",
    "eclipse tokens",
    "eclipse price",
    "eclipse swap",
    "eclipse connect",
    "eclipse generate",
    "eclipse balance",
    "airdrop",
    "hyperliquid",
    "polymarket",
    "magiceden",
    "import",
    "create",
    "nft",
    "ascii",
    "rome",
    "rome help",
    "rome token create",
    "profile",
    "profile open",
    "profile close",
    "games",
    "games list",
    "games play",
    "games scores",
    "games close",
    "games help",
    "play",
    "play snake",
    "play pacman",
    "play clicker",
    "play cookies",
    "play guess",
    "play speed",
    "play circle",
    "play bricks",
    "scores",
    "spotify",
    "spotify open",
    "spotify connect",
    "spotify disconnect",
    "spotify play",
    "spotify pause",
    "spotify next",
    "spotify prev",
    "spotify search",
    "spotify playlists",
    "spotify close",
    "spotify help",
    "music",
    "youtube",
    "youtube open",
    "youtube close",
    "youtube search",
    "youtube play",
    "youtube pause",
    "youtube next",
    "youtube prev",
    "youtube mute",
    "youtube unmute",
    "youtube help",
    "yt",
    "video",
    "referral",
    "referral create",
    "referral stats",
    "referral share",
    "referral leaderboard",
    "referral dashboard",
    "referral help",
    "refer",
    "ambassador",
    "news",
    "news open",
    "news close",
    "news latest",
    "news hot",
    "news help",
    "perp",
    "perps",
    "perp open",
    "perp close",
    "chat",
    "chat init",
    "chat ask",
    "chat stream",
    "chat context",
    "chat history",
    "chat test",
    "chat help",
    "contract",
    "contract init",
    "contract generate",
    "contract create",
    "contract templates",
    "contract types",
    "contract chains",
    "contract test",
    "contract help",
    "auditor",
    "auditor init",
    "auditor audit",
    "auditor check",
    "auditor severity",
    "auditor levels",
    "auditor categories",
    "auditor test",
    "auditor help",
  ],

  // Theme Options
  THEMES: [
    "dark",
    "light",
    "matrix",
    "retro",
    "powershell",
    "executive",
    "modern",
  ],

  // ChainGPT API Configuration
  CHAINGPT: {
    BASE_URL: "https://api.chaingpt.org",
    CHAT_ENDPOINT: "/chat/stream",
    NFT_ENDPOINT: "/nft/generate-nft",
    SMART_CONTRACT_ENDPOINT: "/chat/stream",
    AUDITOR_ENDPOINT: "/chat/stream",
    DEFAULT_MODEL: "general_assistant",
    SMART_CONTRACT_MODEL: "smart_contract_generator",
    AUDITOR_MODEL: "smart_contract_auditor",
    AUTO_INITIALIZE: true,
    FEATURES: {
      chat: true,
      stream: true,
      contract: true,
      auditor: true,
      nft: true,
    },
    loadCapabilities: loadChainGPTCapabilities,
  },


  /**
   * YouTube Player Configuration
   * YouTube IFrame API for video playback
   * YouTube Data API v3 for search and channel videos
   *
   * Note: YouTube API key is optional but recommended for search functionality.
   * Default API key provided for out-of-the-box functionality (matches vanilla version).
   * Users can override with NEXT_PUBLIC_YOUTUBE_API_KEY env var.
   * Get your own at https://console.cloud.google.com/apis/credentials
   */
  YOUTUBE_CONFIG: {
    CLIENT_ID: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || "119481701339-b4fm5sujtt2mjupu2rk1s2v749cess44.apps.googleusercontent.com", // Optional - not needed for basic playback
    API_KEY: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "AIzaSyCpz49l79hdPYN1VmREpPjylwlHmfki3S0", // Default key from vanilla version - can override with env var
    SEARCH_RESULTS_LIMIT: 10,
    DEFAULT_CHANNEL_ID: "UCrM7B7SL_g1edFOnmj-SDKg",
    DEFAULT_CHANNEL_HANDLE: "@BloombergTechnology",
    DEFAULT_CHANNEL_NAME: "Bloomberg Technology",
  },
  /**
   * Spotify Player Configuration
   * OAuth 2.0 PKCE flow for secure authentication
   * Requires Spotify Premium account for Web Playback SDK
   *
   * IMPORTANT: You MUST set your own Spotify credentials:
   * 1. Create a Spotify app at https://developer.spotify.com/dashboard
   * 2. Set NEXT_PUBLIC_SPOTIFY_CLIENT_ID in .env.local
   * 3. Configure the redirect URI in your Spotify app settings
   */
  SPOTIFY_CONFIG: {
    CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "", // No default - user must provide valid Spotify client ID
    REDIRECT_URI:
      process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/spotify-callback.html`
        : "http://localhost:3000/spotify-callback.html"),
    SCOPES: [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-library-read",
      "playlist-read-private",
    ],
    TOKEN_ENDPOINT: "https://accounts.spotify.com/api/token",
    API_BASE_URL: "https://api.spotify.com/v1",
  },
};

// Named exports for convenient tree-shaking imports
export const {
  VERSION,
  RELAYER_URL,
  OMEGA_NETWORK,
  AVAILABLE_COMMANDS,
  THEMES,
} = config;

// Default export
export default config;
