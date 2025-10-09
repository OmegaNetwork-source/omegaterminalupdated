/**
 * Omega Arcade SDK - Unified Leaderboard Integration
 * Provides easy integration for all arcade games with the leaderboard contract
 */

class OmegaArcadeSDK {
    constructor() {
        this.contractAddress = null; // Will be set after deployment
        this.contract = null;
        this.web3 = null;
        this.account = null;
        
        // Game type enumeration (matches smart contract)
        this.GAME_TYPES = {
            FLAPPY_OMEGA: 0,
            OMEGA_BREAKER: 1,
            OMEGA_INVADERS: 2,
            OMEGA_IO: 3,
            OMEGA_PONG: 4,
            SPACE_OMEGA: 5
        };
        
        // Game display names
        this.GAME_NAMES = {
            0: 'Flappy Omega',
            1: 'Omega Breaker', 
            2: 'Omega Invaders',
            3: 'Omega.io',
            4: 'Omega Pong',
            5: 'Space Omega'
        };
        
        // Contract ABI (complete from Remix deployment)
        this.contractABI = [
            {
                "inputs": [
                    {
                        "internalType": "enum OmegaArcadeLeaderboard.GameType",
                        "name": "_gameType",
                        "type": "uint8"
                    }
                ],
                "name": "clearLeaderboard",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "enum OmegaArcadeLeaderboard.GameType",
                        "name": "_gameType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_score",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "_username",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_gameData",
                        "type": "string"
                    }
                ],
                "name": "submitScore",
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
                        "indexed": true,
                        "internalType": "address",
                        "name": "player",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "username",
                        "type": "string"
                    },
                    {
                        "indexed": true,
                        "internalType": "enum OmegaArcadeLeaderboard.GameType",
                        "name": "gameType",
                        "type": "uint8"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "score",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "bool",
                        "name": "isNewHighScore",
                        "type": "bool"
                    }
                ],
                "name": "ScoreSubmitted",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "enum OmegaArcadeLeaderboard.GameType",
                        "name": "_gameType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "string",
                        "name": "_name",
                        "type": "string"
                    }
                ],
                "name": "updateGameName",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "player",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "oldUsername",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "newUsername",
                        "type": "string"
                    }
                ],
                "name": "UsernameUpdated",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "enum OmegaArcadeLeaderboard.GameType",
                        "name": "",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "gameLeaderboards",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "player",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "username",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "score",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum OmegaArcadeLeaderboard.GameType",
                        "name": "gameType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "string",
                        "name": "gameData",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "enum OmegaArcadeLeaderboard.GameType",
                        "name": "",
                        "type": "uint8"
                    }
                ],
                "name": "gameNames",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_player",
                        "type": "address"
                    }
                ],
                "name": "getAllPlayerStats",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "highScore",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "gamesPlayed",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "totalScore",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "lastPlayed",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "rank",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct OmegaArcadeLeaderboard.PlayerStats[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "enum OmegaArcadeLeaderboard.GameType",
                        "name": "_gameType",
                        "type": "uint8"
                    }
                ],
                "name": "getGameInfo",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalPlayers",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalScores",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "highestScore",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_limit",
                        "type": "uint256"
                    }
                ],
                "name": "getGlobalLeaderboard",
                "outputs": [
                    {
                        "internalType": "address[]",
                        "name": "players",
                        "type": "address[]"
                    },
                    {
                        "internalType": "string[]",
                        "name": "usernames",
                        "type": "string[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "totalScores",
                        "type": "uint256[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "enum OmegaArcadeLeaderboard.GameType",
                        "name": "_gameType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_limit",
                        "type": "uint256"
                    }
                ],
                "name": "getLeaderboard",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "player",
                                "type": "address"
                            },
                            {
                                "internalType": "string",
                                "name": "username",
                                "type": "string"
                            },
                            {
                                "internalType": "uint256",
                                "name": "score",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "timestamp",
                                "type": "uint256"
                            },
                            {
                                "internalType": "enum OmegaArcadeLeaderboard.GameType",
                                "name": "gameType",
                                "type": "uint8"
                            },
                            {
                                "internalType": "string",
                                "name": "gameData",
                                "type": "string"
                            }
                        ],
                        "internalType": "struct OmegaArcadeLeaderboard.ScoreEntry[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_player",
                        "type": "address"
                    },
                    {
                        "internalType": "enum OmegaArcadeLeaderboard.GameType",
                        "name": "_gameType",
                        "type": "uint8"
                    }
                ],
                "name": "getPlayerStats",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "highScore",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "gamesPlayed",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "totalScore",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "lastPlayed",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "rank",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct OmegaArcadeLeaderboard.PlayerStats",
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "MAX_LEADERBOARD_SIZE",
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
                "name": "owner",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
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
                    },
                    {
                        "internalType": "enum OmegaArcadeLeaderboard.GameType",
                        "name": "",
                        "type": "uint8"
                    }
                ],
                "name": "playerStats",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "highScore",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "gamesPlayed",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalScore",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "lastPlayed",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "rank",
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
                "name": "playerUsernames",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        this.OMEGA_NETWORK_CONFIG = {
            chainId: '0x4e454228',
            chainName: 'Omega Network',
            rpcUrls: ['https://0x4e454228.rpc.aurora-cloud.dev'],
            blockExplorerUrls: ['https://explorer.omeganetwork.co']
        };
    }
    
    /**
     * Initialize the SDK with Web3 provider
     */
    async init(contractAddress = null) {
        try {
            // Check for Web3 provider
            if (typeof window.ethereum !== 'undefined') {
                this.web3 = window.ethereum;
            } else if (typeof window.web3 !== 'undefined') {
                this.web3 = window.web3.currentProvider;
            } else {
                throw new Error('No Web3 provider found. Please install MetaMask.');
            }
            
                    // Set contract address
        if (contractAddress) {
            this.contractAddress = contractAddress;
        } else {
            // Use deployed contract address on Omega Network
            this.contractAddress = '0x1a196c1b6c22eb9389e286cc4b12fdebe8663996'; // DEPLOYED CONTRACT
        }
            
            // Initialize ethers.js
            if (typeof ethers !== 'undefined') {
                this.provider = new ethers.providers.Web3Provider(this.web3);
                this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.provider);
            }
            
            console.log('🎮 Omega Arcade SDK initialized');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Omega Arcade SDK:', error);
            return false;
        }
    }
    
    /**
     * Connect to wallet and switch to Omega Network
     */
    async connectWallet() {
        try {
            // Request account access
            const accounts = await this.web3.request({ method: 'eth_requestAccounts' });
            this.account = accounts[0];
            
            // Check if we're on Omega Network
            const chainId = await this.web3.request({ method: 'eth_chainId' });
            
            if (chainId !== this.OMEGA_NETWORK_CONFIG.chainId) {
                // Try to switch to Omega Network
                try {
                    await this.web3.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: this.OMEGA_NETWORK_CONFIG.chainId }],
                    });
                } catch (switchError) {
                    // If chain doesn't exist, add it
                    if (switchError.code === 4902) {
                        await this.web3.request({
                            method: 'wallet_addEthereumChain',
                            params: [this.OMEGA_NETWORK_CONFIG],
                        });
                    } else {
                        throw switchError;
                    }
                }
            }
            
            // Update contract with signer
            if (this.provider) {
                this.signer = this.provider.getSigner();
                this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);
            }
            
            console.log('✅ Wallet connected:', this.account);
            return this.account;
            
        } catch (error) {
            console.error('❌ Failed to connect wallet:', error);
            throw error;
        }
    }
    
    /**
     * Submit a score to the leaderboard
     * @param {number} gameType - Game type enum value (0-5)
     * @param {number} score - Player's score
     * @param {string} username - Player's username
     * @param {object} gameData - Additional game data (optional)
     */
    async submitScore(gameType, score, username, gameData = {}) {
        try {
            if (!this.contract || !this.account) {
                throw new Error('Please connect your wallet first');
            }
            
            if (!this.GAME_NAMES[gameType]) {
                throw new Error('Invalid game type');
            }
            
            if (score <= 0) {
                throw new Error('Score must be greater than 0');
            }
            
            if (!username || username.length < 3 || username.length > 20) {
                throw new Error('Username must be 3-20 characters');
            }
            
            const gameDataString = JSON.stringify(gameData);
            
            console.log(`🎮 Submitting score for ${this.GAME_NAMES[gameType]}: ${score}`);
            
            const tx = await this.contract.submitScore(
                gameType,
                score,
                username,
                gameDataString
            );
            
            console.log('📤 Score submission transaction:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('✅ Score submitted successfully!', receipt);
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
            
        } catch (error) {
            console.error('❌ Failed to submit score:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get leaderboard for a specific game
     * @param {number} gameType - Game type enum value (0-5)
     * @param {number} limit - Number of entries to return (max 100)
     */
    async getLeaderboard(gameType, limit = 10) {
        try {
            if (!this.contract) {
                throw new Error('SDK not initialized');
            }
            
            if (!this.GAME_NAMES[gameType]) {
                throw new Error('Invalid game type');
            }
            
            if (limit < 1 || limit > 100) {
                throw new Error('Limit must be between 1 and 100');
            }
            
            console.log(`📊 Fetching ${this.GAME_NAMES[gameType]} leaderboard (top ${limit})`);
            
            const leaderboard = await this.contract.getLeaderboard(gameType, limit);
            
            const formattedLeaderboard = leaderboard.map((entry, index) => ({
                rank: index + 1,
                player: entry.player,
                username: entry.username,
                score: parseInt(entry.score.toString()),
                timestamp: parseInt(entry.timestamp.toString()),
                gameType: parseInt(entry.gameType.toString()),
                gameData: entry.gameData ? JSON.parse(entry.gameData) : {}
            }));
            
            console.log(`✅ Retrieved ${formattedLeaderboard.length} leaderboard entries`);
            
            return {
                success: true,
                gameType: gameType,
                gameName: this.GAME_NAMES[gameType],
                leaderboard: formattedLeaderboard
            };
            
        } catch (error) {
            console.error('❌ Failed to get leaderboard:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get player stats for a specific game
     * @param {string} playerAddress - Player's wallet address
     * @param {number} gameType - Game type enum value (0-5)
     */
    async getPlayerStats(playerAddress = null, gameType) {
        try {
            if (!this.contract) {
                throw new Error('SDK not initialized');
            }
            
            const address = playerAddress || this.account;
            if (!address) {
                throw new Error('No player address provided and no wallet connected');
            }
            
            if (!this.GAME_NAMES[gameType]) {
                throw new Error('Invalid game type');
            }
            
            const stats = await this.contract.getPlayerStats(address, gameType);
            
            return {
                success: true,
                playerAddress: address,
                gameType: gameType,
                gameName: this.GAME_NAMES[gameType],
                stats: {
                    highScore: parseInt(stats.highScore.toString()),
                    gamesPlayed: parseInt(stats.gamesPlayed.toString()),
                    totalScore: parseInt(stats.totalScore.toString()),
                    lastPlayed: parseInt(stats.lastPlayed.toString()),
                    rank: parseInt(stats.rank.toString())
                }
            };
            
        } catch (error) {
            console.error('❌ Failed to get player stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get game information
     * @param {number} gameType - Game type enum value (0-5)
     */
    async getGameInfo(gameType) {
        try {
            if (!this.contract) {
                throw new Error('SDK not initialized');
            }
            
            if (!this.GAME_NAMES[gameType]) {
                throw new Error('Invalid game type');
            }
            
            const info = await this.contract.getGameInfo(gameType);
            
            return {
                success: true,
                gameType: gameType,
                info: {
                    name: info.name,
                    totalPlayers: parseInt(info.totalPlayers.toString()),
                    totalScores: parseInt(info.totalScores.toString()),
                    highestScore: parseInt(info.highestScore.toString())
                }
            };
            
        } catch (error) {
            console.error('❌ Failed to get game info:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get username for current connected wallet
     */
    async getUsername() {
        try {
            if (!this.contract || !this.account) {
                throw new Error('Please connect your wallet first');
            }
            
            const username = await this.contract.playerUsernames(this.account);
            return username || `Player${this.account.slice(-4)}`;
            
        } catch (error) {
            console.log('⚠️ Could not get username, using fallback');
            return this.account ? `Player${this.account.slice(-4)}` : 'Anonymous';
        }
    }
    
    /**
     * Utility function to create standardized game interface
     * @param {string} gameTitle - Title of the game
     * @param {number} gameType - Game type enum value
     * @param {function} gameContainer - Function that returns the game HTML
     */
    createGameInterface(gameTitle, gameType, gameContainer) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${gameTitle} - Omega Arcade</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js"></script>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%);
                    font-family: 'Courier New', monospace;
                    color: white;
                    overflow: hidden;
                }
                
                .game-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 1000;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .game-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #00ff99;
                    text-shadow: 0 0 10px #00ff99;
                }
                
                .game-controls {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                
                .btn {
                    background: rgba(0, 255, 153, 0.2);
                    border: 1px solid #00ff99;
                    color: #00ff99;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-family: 'Courier New', monospace;
                }
                
                .btn:hover {
                    background: rgba(0, 255, 153, 0.4);
                    box-shadow: 0 0 15px rgba(0, 255, 153, 0.5);
                }
                
                .leaderboard-panel {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    width: 300px;
                    max-height: 500px;
                    background: rgba(0, 0, 0, 0.9);
                    border: 1px solid #00ff99;
                    border-radius: 10px;
                    padding: 20px;
                    overflow-y: auto;
                    display: none;
                    z-index: 999;
                }
                
                .leaderboard-entry {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .wallet-status {
                    font-size: 12px;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="game-header">
                <div class="game-title">${gameTitle}</div>
                <div class="game-controls">
                    <div class="wallet-status" id="walletStatus">Not Connected</div>
                    <button class="btn" onclick="toggleLeaderboard()">📊 Leaderboard</button>
                    <button class="btn" onclick="connectWallet()">🔗 Connect</button>
                    <button class="btn" onclick="window.close()">❌ Close</button>
                </div>
            </div>
            
            <div class="leaderboard-panel" id="leaderboardPanel">
                <h3>🏆 Top Players</h3>
                <div id="leaderboardContent">Loading...</div>
            </div>
            
            <!-- Game Container -->
            <div id="gameContainer" style="margin-top: 80px;">
                ${gameContainer()}
            </div>
            
            <script src="omega-arcade-sdk.js"></script>
            <script>
                // Initialize SDK
                const arcadeSDK = new OmegaArcadeSDK();
                const GAME_TYPE = ${gameType};
                let isLeaderboardVisible = false;
                
                // Initialize on page load
                window.addEventListener('load', async () => {
                    await arcadeSDK.init();
                    updateWalletStatus();
                    loadLeaderboard();
                });
                
                // Wallet connection
                async function connectWallet() {
                    try {
                        await arcadeSDK.connectWallet();
                        updateWalletStatus();
                        console.log('✅ Wallet connected successfully');
                    } catch (error) {
                        alert('Failed to connect wallet: ' + error.message);
                    }
                }
                
                // Update wallet status display
                function updateWalletStatus() {
                    const statusEl = document.getElementById('walletStatus');
                    if (arcadeSDK.account) {
                        statusEl.textContent = arcadeSDK.account.slice(0, 6) + '...' + arcadeSDK.account.slice(-4);
                        statusEl.style.color = '#00ff99';
                    } else {
                        statusEl.textContent = 'Not Connected';
                        statusEl.style.color = '#888';
                    }
                }
                
                // Toggle leaderboard visibility
                function toggleLeaderboard() {
                    const panel = document.getElementById('leaderboardPanel');
                    isLeaderboardVisible = !isLeaderboardVisible;
                    panel.style.display = isLeaderboardVisible ? 'block' : 'none';
                    
                    if (isLeaderboardVisible) {
                        loadLeaderboard();
                    }
                }
                
                // Load and display leaderboard
                async function loadLeaderboard() {
                    const contentEl = document.getElementById('leaderboardContent');
                    contentEl.innerHTML = 'Loading...';
                    
                    try {
                        const result = await arcadeSDK.getLeaderboard(GAME_TYPE, 10);
                        
                        if (result.success && result.leaderboard.length > 0) {
                            let html = '';
                            result.leaderboard.forEach((entry, index) => {
                                html += \`
                                    <div class="leaderboard-entry">
                                        <div>#\${entry.rank} \${entry.username}</div>
                                        <div>\${entry.score.toLocaleString()}</div>
                                    </div>
                                \`;
                            });
                            contentEl.innerHTML = html;
                        } else {
                            contentEl.innerHTML = '<div style="color: #888;">No scores yet. Be the first!</div>';
                        }
                    } catch (error) {
                        contentEl.innerHTML = '<div style="color: #ff6666;">Failed to load leaderboard</div>';
                        console.error('Failed to load leaderboard:', error);
                    }
                }
                
                // Game score submission function (call this when game ends)
                async function submitGameScore(score, additionalData = {}) {
                    try {
                        if (!arcadeSDK.account) {
                            alert('Please connect your wallet to submit scores!');
                            return false;
                        }
                        
                        const username = await arcadeSDK.getUsername();
                        
                        const result = await arcadeSDK.submitScore(GAME_TYPE, score, username, additionalData);
                        
                        if (result.success) {
                            console.log('✅ Score submitted successfully!');
                            loadLeaderboard(); // Refresh leaderboard
                            return true;
                        } else {
                            console.error('❌ Score submission failed:', result.error);
                            return false;
                        }
                        
                    } catch (error) {
                        console.error('❌ Error submitting score:', error);
                        return false;
                    }
                }
                
                // Expose to global scope for games to use
                window.submitGameScore = submitGameScore;
                window.arcadeSDK = arcadeSDK;
                
                console.log('🎮 ${gameTitle} loaded with Omega Arcade SDK');
            </script>
        </body>
        </html>
        `;
    }
    
    /**
     * Generate game launch URL for terminal integration
     * @param {number} gameType - Game type enum value
     * @param {string} baseUrl - Base URL for the arcade games
     */
    static getGameLaunchUrl(gameType, baseUrl = 'https://omega-arcade.vercel.app') {
        const gameFiles = {
            0: 'flappy-omega.html',
            1: 'omega-breaker.html', 
            2: 'omega-invaders.html',
            3: 'omega-io.html',
            4: 'omega-pong.html',
            5: 'space-omega.html'
        };
        
        return `${baseUrl}/${gameFiles[gameType]}`;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OmegaArcadeSDK;
} else {
    window.OmegaArcadeSDK = OmegaArcadeSDK;
}

// Auto-initialize if loaded in browser
if (typeof window !== 'undefined') {
    console.log('🎮 Omega Arcade SDK loaded');
} 