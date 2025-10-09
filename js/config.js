// Omega Terminal Configuration v2.0.1 - UPDATED 2025-01-14
console.log('[DEBUG] 🔧 Loading config.js v2.0.1...');
window.OmegaConfig = {
    // Version Info
    VERSION: '2.0.1',
    
    // Relayer and API URLs
    RELAYER_URL: 'http://localhost:4000',
    OMEGA_RPC_URL: 'https://0x4e454228.rpc.aurora-cloud.dev',
    
    // Contract Addresses
    CONTRACT_ADDRESS: "0x54c731627f2d2b55267b53e604c869ab8e6a323b", // SimpleMiner contract with claimTo
    FAUCET_ADDRESS: "0xf8e00f8cfaccf9b95f703642ec589d1c6ceee1a9", // Faucet contract
    MINER_FAUCET_ADDRESS: '0x1c4ffffcc804ba265f6cfccffb94d0ae28b36207', // OmegaMinerFaucet contract
    MIXER_ADDRESS: '0xc57824b37a7fc769871075103c4dd807bfb3fd3e', // Omega Mixer contract
    
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
        "event RewardsClaimed(address indexed miner, uint256 amount)"
    ],
    
    FAUCET_ABI: [
        {
            "inputs": [],
            "name": "claim",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                { "internalType": "address", "name": "user", "type": "address" }
            ],
            "name": "getFaucetStatus",
            "outputs": [
                { "internalType": "bool", "name": "canClaimNow", "type": "bool" },
                { "internalType": "uint256", "name": "lastClaim", "type": "uint256" },
                { "internalType": "uint256", "name": "timeUntilNextClaim", "type": "uint256" },
                { "internalType": "uint256", "name": "claimAmount", "type": "uint256" },
                { "internalType": "uint256", "name": "faucetBalance", "type": "uint256" },
                { "internalType": "uint256", "name": "totalClaims_", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "emergencyWithdraw",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "FaucetRefilled",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "refillFaucet",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "timestamp",
                    "type": "uint256"
                }
            ],
            "name": "TokensClaimed",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "withdrawFaucet",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "stateMutability": "payable",
            "type": "receive"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                }
            ],
            "name": "canClaim",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "CLAIM_AMOUNT",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "CLAIM_COOLDOWN",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "faucetBalance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                }
            ],
            "name": "getClaimInfo",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "canClaimNow",
                    "type": "bool"
                },
                {
                    "internalType": "uint256",
                    "name": "lastClaim",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "timeUntilNextClaim",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "claimAmount",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getFaucetBalance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                }
            ],
            "name": "getTimeUntilNextClaim",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "lastClaimTime",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalClaims",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    
    MINER_FAUCET_ABI: [
        {
            "inputs": [],
            "name": "mine",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "", "type": "address"}],
            "name": "totalMined",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "", "type": "address"}],
            "name": "lastMineTime",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    
    MIXER_ABI: [
        "function deposit(bytes32 commitment) external payable",
        "function withdraw(bytes32 secret, address to) external"
    ],
    
    // Network Configuration
    OMEGA_NETWORK: {
        chainId: '0x4e454228',
        chainIdDecimal: 1313161256,
        chainName: 'Omega Network',
        nativeCurrency: { 
            name: 'OMEGA', 
            symbol: 'OMEGA', 
            decimals: 18 
        },
        rpcUrls: ['https://0x4e454228.rpc.aurora-cloud.dev'],
        blockExplorerUrls: ['https://0x4e454228.explorer.aurora-cloud.dev/']
    },
    
    // Command List for Autocomplete
    AVAILABLE_COMMANDS: [
        'help', 'clear', 'ai', 'connect', 'disconnect', 'yes', 'import', 'balance', 'faucet', 'faucet status', 'mine', 'claim', 'status', 'stats',
        'send', 'ens register', 'ens resolve', 'ens search', 'mixer', 'stress', 'stopstress', 'stressstats', 
        'theme', 'gui', 'gui ios', 'gui aol', 'gui limewire', 'gui discord', 'gui windows95', 'gui terminal',
        'rickroll', 'fortune', 'matrix', 'hack', 'disco', 'stop', 'tab', 'email', 'inbox', 
        'dexscreener', 'geckoterminal', 'stock', 'alphakey', 'ds search', 'ds trending', 'cg search', 'cg networks', 'alpha', 
        'alpha quote', 'alpha daily', 'alpha overview', 'alpha macro', 'solana connect', 'solana generate', 'solana status', 'solana test', 'solana search', 'solana swap',
        'near generate', 'near connect', 'near swap', 'near tokens', 'eclipse tokens', 'eclipse price', 'eclipse swap', 'eclipse connect', 'eclipse generate', 'eclipse balance',
        'airdrop', 'hyperliquid', 'polymarket', 'magiceden', 'import', 'create', 'ascii', 'rome', 'rome help', 'rome token create'
    ],
    
    // Theme Options
    THEMES: ['dark', 'light', 'matrix', 'retro', 'powershell'],
    
    // Cache Busting URLs
    CACHE_BUSTER_PARAMS: ['v=', 'v=1752771858262', 'v=20241219']
};

// Debug config loading
console.log('[DEBUG] ✅ Config loaded - RELAYER_URL:', window.OmegaConfig.RELAYER_URL);
console.log('[DEBUG] ✅ Config loaded - VERSION:', window.OmegaConfig.VERSION); 