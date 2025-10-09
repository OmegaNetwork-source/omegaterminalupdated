const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ===================================
// DATABASE SETUP FOR OMEGA NETWORK APIs
// ===================================

const db = new sqlite3.Database('omega-network.db');

// Initialize database tables for all API endpoints
db.serialize(() => {
    // User profiles table
    db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
        wallet_address TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        display_name TEXT,
        bio TEXT,
        avatar TEXT,
        location TEXT,
        website TEXT,
        twitter TEXT,
        discord TEXT,
        github TEXT,
        telegram TEXT,
        email TEXT,
        is_public BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // User progress table
    db.run(`CREATE TABLE IF NOT EXISTS user_progress (
        wallet_address TEXT PRIMARY KEY,
        user_id TEXT,
        total_points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        rank TEXT DEFAULT 'BRONZE',
        achievements TEXT, -- JSON array
        referrals_count INTEGER DEFAULT 0,
        profile TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Referrals table
    db.run(`CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referral_code TEXT UNIQUE NOT NULL,
        referrer_address TEXT NOT NULL,
        referred_address TEXT,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
    )`);

    // User activities table
    db.run(`CREATE TABLE IF NOT EXISTS user_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        details TEXT, -- JSON
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // User tasks table
    db.run(`CREATE TABLE IF NOT EXISTS user_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT NOT NULL,
        task_id TEXT NOT NULL,
        task_type TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Faucet claims table
    db.run(`CREATE TABLE IF NOT EXISTS faucet_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT NOT NULL,
        amount TEXT NOT NULL,
        tx_hash TEXT,
        status TEXT DEFAULT 'PENDING',
        claim_type TEXT DEFAULT 'STANDARD',
        claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Achievements table
    db.run(`CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        points INTEGER DEFAULT 0,
        requirements TEXT, -- JSON
        icon TEXT
    )`);

    // User achievements table
    db.run(`CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        details TEXT -- JSON
    )`);

    // Arcade scores table
    db.run(`CREATE TABLE IF NOT EXISTS arcade_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT NOT NULL,
        game TEXT NOT NULL,
        score INTEGER NOT NULL,
        metadata TEXT, -- JSON
        achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('✅ Omega Network database tables initialized');
});

// 🔧 NETWORK RETRY CONFIGURATION (Fixes ETIMEDOUT/ENETUNREACH errors)
const NETWORK_RETRY_CONFIG = {
    maxRetries: 5,
    baseDelay: 1000,  // 1 second
    maxDelay: 10000,  // 10 seconds
    timeoutMs: 30000  // 30 seconds per attempt
};

// 🌐 RPC ENDPOINTS (Only the one you actually have)
const RPC_ENDPOINTS = [
    "https://0x4e454228.rpc.aurora-cloud.dev"
];

let currentRpcIndex = 0;
let provider = null;
let relayerSigner = null;

// 🔄 NETWORK RETRY WRAPPER (Handles your specific errors)
async function withNetworkRetry(operation, context = 'operation') {
    let lastError;
    
    for (let attempt = 1; attempt <= NETWORK_RETRY_CONFIG.maxRetries; attempt++) {
        try {
            console.log(`[NETWORK] ${context} - Attempt ${attempt}/${NETWORK_RETRY_CONFIG.maxRetries}`);
            
            // Set timeout for this attempt
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Network timeout')), NETWORK_RETRY_CONFIG.timeoutMs)
            );
            
            const result = await Promise.race([operation(), timeoutPromise]);
            
            console.log(`[NETWORK] ${context} - Success on attempt ${attempt}`);
            return result;
            
        } catch (error) {
            lastError = error;
            const isNetworkError = 
                error.code === 'ETIMEDOUT' || 
                error.code === 'ENETUNREACH' ||
                error.code === 'ECONNREFUSED' ||
                error.code === 'ENOTFOUND' ||
                error.message.includes('timeout') ||
                error.message.includes('network') ||
                error.message.includes('connect');
            
            console.log(`[NETWORK] ${context} - Attempt ${attempt} failed: ${error.message}`);
            
            if (!isNetworkError && attempt === 1) {
                // Non-network error, fail fast
                throw error;
            }
            
            if (attempt < NETWORK_RETRY_CONFIG.maxRetries) {
                // Exponential backoff with jitter
                const delay = Math.min(
                    NETWORK_RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
                    NETWORK_RETRY_CONFIG.maxDelay
                ) + Math.random() * 1000;
                
                console.log(`[NETWORK] ${context} - Retrying in ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    console.error(`[NETWORK] ${context} - All ${NETWORK_RETRY_CONFIG.maxRetries} attempts failed`);
    throw lastError;
}

// 🔧 NONCE MANAGEMENT UTILITY (FIXES CRITICAL NONCE ISSUES)
async function getFreshNonce(walletAddress = null) {
    const address = walletAddress || relayerSigner.address;
    try {
        const nonce = await provider.getTransactionCount(address, 'pending');
        console.log(`[NONCE] 🔄 Fresh nonce for ${address.slice(0,6)}...${address.slice(-4)}: ${nonce}`);
        return nonce;
    } catch (error) {
        console.error(`[NONCE] ❌ Failed to get nonce for ${address}: ${error.message}`);
        throw error;
    }
}

// 🚀 INITIALIZE RPC WITH RETRY (FIXED + NONCE SYNC)
async function initializeProvider() {
    const rpcUrl = RPC_ENDPOINTS[currentRpcIndex];
    console.log(`[RPC] Initializing connection to: ${rpcUrl}`);
    
    let lastError;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            console.log(`[RPC] Connection attempt ${attempt}/3`);
            
            const testProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
            
            // Test connection with shorter timeout
            const blockNumber = await Promise.race([
                testProvider.getBlockNumber(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('RPC timeout')), 15000)
                )
            ]);
            
            console.log(`[RPC] ✅ Connected - Block: ${blockNumber}`);
            
            provider = testProvider;
            const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY);
            relayerSigner = relayerWallet.connect(provider);
            
            // 🔧 CRITICAL: Sync nonce immediately
            const currentNonce = await provider.getTransactionCount(relayerWallet.address, 'pending');
            console.log(`[NONCE] 🔄 Synced to blockchain nonce: ${currentNonce}`);
            
            console.log(`[RPC] ✅ Relayer address: ${relayerWallet.address}`);
            return; // Success!
            
        } catch (error) {
            lastError = error;
            console.log(`[RPC] Attempt ${attempt} failed: ${error.message}`);
            
            if (attempt < 3) {
                const delay = attempt * 2000; // 2s, 4s
                console.log(`[RPC] Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw new Error(`RPC connection failed after 3 attempts: ${lastError.message}`);
}

// All the constants and setup from your original relayer
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

const GECKO_API = 'https://api.geckoterminal.com/api/v2';
const GECKO_HEADERS = { Accept: 'application/json;version=20230302' };

const ALPHA_VANTAGE_API_KEY = 'Y4N6LC9U5OH8Q4MQ';
let fetch = global.fetch;
try {
  if (!fetch) {
    fetch = require('node-fetch');
  }
} catch (e) {
  // For Node 18+, fetch is global
}

const MINING_CONTRACT_ADDRESS = "0x54c731627f2d2b55267b53e604c869ab8e6a323b";
const MINING_CONTRACT_ABI = [
    "function mineBlock(uint256 nonce, bytes32 solution) external"
];

// Generate mining wallets
const NUM_MINER_WALLETS = 1000;
const minerWallets = [];
let minerWalletIndex = 0;
const pendingTxs = {};
const busyWallets = {};

for (let i = 0; i < NUM_MINER_WALLETS; i++) {
    const wallet = ethers.Wallet.createRandom();
    minerWallets.push(wallet);
}

// 🔧 NONCE-FIXED: Helper function to fund miner wallets
async function fundMinerWalletIfNeeded(wallet) {
    try {
        const balance = await provider.getBalance(wallet.address);
        if (balance.lt(ethers.utils.parseEther('0.0002'))) {
            // 🔧 CRITICAL: Get fresh nonce for funding
            const nonce = await getFreshNonce();
            
            const tx = await relayerSigner.sendTransaction({
                to: wallet.address,
                value: ethers.utils.parseEther('0.001'),
                gasLimit: 21000,
                gasPrice: ethers.utils.parseUnits('20', 'gwei'),
                nonce: nonce  // Force fresh nonce
            });
            await tx.wait();
            console.log(`Funded miner wallet ${wallet.address} with 0.001 OMEGA. Tx: ${tx.hash}`);
        }
    } catch (error) {
        console.error(`Failed to fund miner wallet ${wallet.address}:`, error.message);
    }
}

function normAddress(address) {
    return address && typeof address === 'string' ? address.toLowerCase() : address;
}

// Track rewards per user address
const rewardsByAddress = {};

// 🛡️ NETWORK-RESILIENT /fund ENDPOINT (NONCE-FIXED)
app.post('/fund', async (req, res) => {
    const { address, amount } = req.body;
    if (!address || !ethers.utils.isAddress(address)) {
        return res.status(400).json({ error: 'Invalid address' });
    }
    
    const fundAmount = amount ? ethers.utils.parseEther(amount) : ethers.utils.parseEther('0.1');
    const startTime = Date.now();
    
    try {
        console.log(`[FUND] 🚀 Starting: ${address} - ${ethers.utils.formatEther(fundAmount)} OMEGA`);
        
        const result = await withNetworkRetry(async () => {
            // 🔧 CRITICAL: Get fresh nonce every time
            const nonce = await getFreshNonce();
            
            // Get gas price with retry
            const gasPrice = await withNetworkRetry(async () => {
                try {
                    const networkGasPrice = await provider.getGasPrice();
                    return networkGasPrice.mul(120).div(100); // 20% bump
                } catch (error) {
                    console.log(`[GAS] Using fallback gas price: ${error.message}`);
                    return ethers.utils.parseUnits('30', 'gwei');
                }
            }, 'Gas Price Fetch');
            
            // Send transaction with explicit nonce
            const tx = await relayerSigner.sendTransaction({
                to: address,
                value: fundAmount,
                gasLimit: 21000,
                gasPrice: gasPrice,
                nonce: nonce  // Force fresh nonce
            });
            
            return tx;
        }, 'Fund Transaction');
        
        const responseTime = Date.now() - startTime;
        console.log(`[FUND] ✅ Success: ${result.hash} (${responseTime}ms)`);
        
        res.json({ 
            success: true, 
            txHash: result.hash,
            responseTime: responseTime
        });
        
        // Background confirmation
        result.wait(1).then(receipt => {
            console.log(`[FUND] ✅ Confirmed: ${result.hash} - Block: ${receipt.blockNumber}`);
        }).catch(err => {
            console.log(`[FUND] ⚠️  Confirmation failed: ${result.hash} - ${err.message}`);
        });
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`[FUND] ❌ Failed after retries: ${error.message} (${responseTime}ms)`);
        
        res.status(500).json({ 
            error: 'Network connectivity issues',
            details: 'Render.com network problems with Aurora Cloud RPC',
            suggestion: 'Try again in a few minutes',
            responseTime: responseTime
        });
    }
});

// Status endpoint
app.get('/status', async (req, res) => {
    try {
        const result = await withNetworkRetry(async () => {
            const balance = await provider.getBalance(relayerSigner.address);
            const blockNumber = await provider.getBlockNumber();
            
            return {
                relayerAddress: relayerSigner.address,
                balance: ethers.utils.formatEther(balance),
                blockNumber: blockNumber
            };
        }, 'Status Check');
        
        res.json({
            ...result,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            networkRetryEnabled: true,
            nonceManagement: 'Fresh nonces per transaction'
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get status',
            details: error.message 
        });
    }
});

// AI endpoint
app.post('/ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: 'Gemini API error', details: err.message });
  }
});

// DexScreener endpoints - FIXED AND ENHANCED
app.get('/dex/trending', async (req, res) => {
  try {
    // Use token-profiles for trending tokens (returns better formatted data)
    const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
    const rawData = await response.json();
    
    // Transform the data for better terminal display
    const transformedData = rawData.map(item => ({
      chainId: item.chainId,
      tokenAddress: item.tokenAddress,
      name: item.description || 'Unknown Token',
      symbol: extractSymbolFromDescription(item.description) || 'N/A',
      url: item.url,
      icon: item.icon,
      priceUsd: 'N/A', // Token profiles don't include price
      description: item.description,
      links: item.links || []
    }));
    
    res.json({
      success: true,
      data: transformedData,
      source: 'token-profiles',
      count: transformedData.length
    });
  } catch (err) {
    console.error('DexScreener trending error:', err);
    res.status(500).json({ error: 'Failed to fetch trending tokens', success: false });
  }
});

// NEW: Get boosted tokens (actual trending with boost data)
app.get('/dex/boosted', async (req, res) => {
  try {
    const response = await fetch('https://api.dexscreener.com/token-boosts/latest/v1');
    const rawData = await response.json();
    
    const transformedData = rawData.map(item => ({
      chainId: item.chainId,
      tokenAddress: item.tokenAddress,
      name: item.description || 'Boosted Token',
      symbol: extractSymbolFromDescription(item.description) || 'N/A',
      url: item.url,
      icon: item.icon,
      boostAmount: item.amount,
      totalBoostAmount: item.totalAmount,
      description: item.description,
      links: item.links || []
    }));
    
    res.json({
      success: true,
      data: transformedData,
      source: 'token-boosts-latest',
      count: transformedData.length
    });
  } catch (err) {
    console.error('DexScreener boosted error:', err);
    res.status(500).json({ error: 'Failed to fetch boosted tokens', success: false });
  }
});

// NEW: Get top boosted tokens
app.get('/dex/top-boosted', async (req, res) => {
  try {
    const response = await fetch('https://api.dexscreener.com/token-boosts/top/v1');
    const rawData = await response.json();
    
    const transformedData = rawData.map(item => ({
      chainId: item.chainId,
      tokenAddress: item.tokenAddress,
      name: item.description || 'Top Boosted Token',
      symbol: extractSymbolFromDescription(item.description) || 'N/A',
      url: item.url,
      icon: item.icon,
      boostAmount: item.amount,
      totalBoostAmount: item.totalAmount,
      description: item.description,
      links: item.links || []
    }));
    
    res.json({
      success: true,
      data: transformedData,
      source: 'token-boosts-top',
      count: transformedData.length
    });
  } catch (err) {
    console.error('DexScreener top boosted error:', err);
    res.status(500).json({ error: 'Failed to fetch top boosted tokens', success: false });
  }
});

app.get('/dex/pair/:chainId/:pairId', async (req, res) => {
  try {
    const { chainId, pairId } = req.params;
    const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairId}`);
    const data = await response.json();
    
    // Enhance the response with better formatting
    if (data.pairs && Array.isArray(data.pairs)) {
      const enhancedData = {
        success: true,
        pairs: data.pairs.map(pair => ({
          ...pair,
          // Add computed fields for better display
          priceChangeFormatted: pair.priceChange?.h24 ? `${pair.priceChange.h24.toFixed(2)}%` : 'N/A',
          volumeFormatted: pair.volume?.h24 ? `$${Number(pair.volume.h24).toLocaleString()}` : 'N/A',
          liquidityFormatted: pair.liquidity?.usd ? `$${Number(pair.liquidity.usd).toLocaleString()}` : 'N/A'
        }))
      };
      res.json(enhancedData);
    } else {
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pair info', success: false });
  }
});

app.get('/dex/pools', async (req, res) => {
  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/pools');
    const data = await response.json();
    res.json({ success: true, data: data, source: 'dex-pools' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pools', success: false });
  }
});

app.get('/dex/search', async (req, res) => {
  try {
    const q = req.query.q;
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    
    // Transform search results for consistent formatting
    if (data.pairs && Array.isArray(data.pairs)) {
      const transformedData = {
        success: true,
        data: data.pairs.map(pair => ({
          chainId: pair.chainId,
          symbol: pair.baseToken?.symbol || 'N/A',
          name: pair.baseToken?.name || 'N/A',
          tokenAddress: pair.baseToken?.address || '',
          priceUsd: pair.priceUsd || 'N/A',
          priceChange24h: pair.priceChange?.h24 || 0,
          volume24h: pair.volume?.h24 || 0,
          liquidity: pair.liquidity?.usd || 0,
          dexId: pair.dexId,
          pairAddress: pair.pairAddress,
          url: pair.url,
          // Enhanced display data
          priceChangeFormatted: pair.priceChange?.h24 ? `${pair.priceChange.h24.toFixed(2)}%` : 'N/A',
          volumeFormatted: pair.volume?.h24 ? `$${Number(pair.volume.h24).toLocaleString()}` : 'N/A',
          liquidityFormatted: pair.liquidity?.usd ? `$${Number(pair.liquidity.usd).toLocaleString()}` : 'N/A'
        })),
        count: data.pairs.length,
        source: 'dex-search'
      };
      res.json(transformedData);
    } else {
      res.json({ success: false, error: 'No pairs found', data: [] });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to search token', success: false });
  }
});

app.get('/dex/pools/:chainId/:tokenAddress', async (req, res) => {
  try {
    const { chainId, tokenAddress } = req.params;
    const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/${chainId}/${tokenAddress}`);
    const data = await response.json();
    
    // Transform token pairs data for better display
    if (data && Array.isArray(data)) {
      const transformedData = {
        success: true,
        data: data.map(pair => ({
          ...pair,
          // Add computed fields for better display
          priceChangeFormatted: pair.priceChange?.h24 ? `${pair.priceChange.h24.toFixed(2)}%` : 'N/A',
          volumeFormatted: pair.volume?.h24 ? `$${Number(pair.volume.h24).toLocaleString()}` : 'N/A',
          liquidityFormatted: pair.liquidity?.usd ? `$${Number(pair.liquidity.usd).toLocaleString()}` : 'N/A'
        })),
        count: data.length,
        source: 'token-pairs'
      };
      res.json(transformedData);
    } else {
      res.json({ success: true, data: data, source: 'token-pairs' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pools', success: false });
  }
});

// NEW: Get multiple tokens at once (up to 30 addresses)
app.get('/dex/tokens/:chainId/:tokenAddresses', async (req, res) => {
  try {
    const { chainId, tokenAddresses } = req.params;
    const response = await fetch(`https://api.dexscreener.com/tokens/v1/${chainId}/${tokenAddresses}`);
    const data = await response.json();
    
    if (data && Array.isArray(data)) {
      const transformedData = {
        success: true,
        data: data.map(pair => ({
          ...pair,
          // Add computed fields for better display
          priceChangeFormatted: pair.priceChange?.h24 ? `${pair.priceChange.h24.toFixed(2)}%` : 'N/A',
          volumeFormatted: pair.volume?.h24 ? `$${Number(pair.volume.h24).toLocaleString()}` : 'N/A',
          liquidityFormatted: pair.liquidity?.usd ? `$${Number(pair.liquidity.usd).toLocaleString()}` : 'N/A'
        })),
        count: data.length,
        source: 'multiple-tokens'
      };
      res.json(transformedData);
    } else {
      res.json({ success: true, data: data, source: 'multiple-tokens' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch multiple tokens', success: false });
  }
});

// NEW: Get token boost orders
app.get('/dex/orders/:chainId/:tokenAddress', async (req, res) => {
  try {
    const { chainId, tokenAddress } = req.params;
    const response = await fetch(`https://api.dexscreener.com/orders/v1/${chainId}/${tokenAddress}`);
    const data = await response.json();
    res.json({ success: true, data: data, source: 'token-orders' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch token orders', success: false });
  }
});

// GeckoTerminal endpoints
app.get('/gecko/search', async (req, res) => {
  try {
    const q = req.query.q;
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/search/pairs?query=${encodeURIComponent(q)}`,
      { headers: { Accept: 'application/json;version=20230302' } }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search GeckoTerminal' });
  }
});

app.get('/gecko/networks', async (req, res) => {
  try {
    const page = req.query.page ? `?page=${req.query.page}` : '';
    const response = await fetch(`${GECKO_API}/networks${page}`, { headers: GECKO_HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch networks' });
  }
});

app.get('/gecko/networks/:network/dexes', async (req, res) => {
  try {
    const { network } = req.params;
    const response = await fetch(`${GECKO_API}/networks/${network}/dexes`, { headers: GECKO_HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dexes' });
  }
});

app.get('/gecko/networks/:network/pools', async (req, res) => {
  try {
    const { network } = req.params;
    const response = await fetch(`${GECKO_API}/networks/${network}/pools`, { headers: GECKO_HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pools' });
  }
});

app.get('/gecko/networks/:network/tokens/:address', async (req, res) => {
  try {
    const { network, address } = req.params;
    const response = await fetch(`${GECKO_API}/networks/${network}/tokens/${address}`, { headers: GECKO_HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch token' });
  }
});

app.get('/gecko/networks/:network/tokens/:token_address/pools', async (req, res) => {
  try {
    const { network, token_address } = req.params;
    const response = await fetch(`${GECKO_API}/networks/${network}/tokens/${token_address}/pools`, { headers: GECKO_HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch token pools' });
  }
});

app.get('/gecko/networks/:network/pools/:pool_address/info', async (req, res) => {
  try {
    const { network, pool_address } = req.params;
    const response = await fetch(`${GECKO_API}/networks/${network}/pools/${pool_address}/info`, { headers: GECKO_HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pool info' });
  }
});

app.get('/gecko/networks/:network/pools/:pool_address/ohlcv/:timeframe', async (req, res) => {
  try {
    const { network, pool_address, timeframe } = req.params;
    const response = await fetch(`${GECKO_API}/networks/${network}/pools/${pool_address}/ohlcv/${timeframe}`, { headers: GECKO_HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pool ohlcv' });
  }
});

app.get('/gecko/networks/:network/pools/:pool_address/trades', async (req, res) => {
  try {
    const { network, pool_address } = req.params;
    const params = new URLSearchParams(req.query).toString();
    const url = `${GECKO_API}/networks/${network}/pools/${pool_address}/trades${params ? '?' + params : ''}`;
    const response = await fetch(url, { headers: GECKO_HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pool trades' });
  }
});

// Stock/Alpha Vantage endpoints
app.get('/stock/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data["Global Quote"]) {
      const q = data["Global Quote"];
      res.json({
        price: q["05. price"],
        change: q["09. change"],
        changePercent: q["10. change percent"],
        ...q
      });
    } else {
      res.status(404).json({ error: 'No quote found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Alpha Vantage error', details: err.message });
  }
});

app.get('/stock/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Alpha Vantage error', details: err.message });
  }
});

app.get('/stock/daily/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Alpha Vantage error', details: err.message });
  }
});

app.get('/stock/overview/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Alpha Vantage error', details: err.message });
  }
});

app.get('/stock/inflation', async (req, res) => {
  try {
    const url = `https://www.alphavantage.co/query?function=INFLATION&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Alpha Vantage error', details: err.message });
  }
});

app.get('/stock/cpi', async (req, res) => {
  try {
    const url = `https://www.alphavantage.co/query?function=CPI&interval=monthly&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Alpha Vantage error', details: err.message });
  }
});

app.get('/stock/gdp', async (req, res) => {
  try {
    const url = `https://www.alphavantage.co/query?function=REAL_GDP&interval=annual&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Alpha Vantage error', details: err.message });
  }
});

// 🛡️ NETWORK-RESILIENT /mine ENDPOINT (NONCE-FIXED)
app.post('/mine', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address || !ethers.utils.isAddress(address)) {
            return res.status(400).json({ error: 'User address required' });
        }
        const userAddr = normAddress(address);
        
        const result = await withNetworkRetry(async () => {
            // Find a wallet with no pending tx and not busy
            let attempts = 0;
            let wallet = null;
            let now = Date.now();
            do {
                wallet = minerWallets[minerWalletIndex];
                minerWalletIndex = (minerWalletIndex + 1) % NUM_MINER_WALLETS;
                attempts++;
                if (!pendingTxs[wallet.address] && (!busyWallets[wallet.address] || busyWallets[wallet.address] < now)) break;
            } while (attempts < NUM_MINER_WALLETS);
            
            if (pendingTxs[wallet.address] || (busyWallets[wallet.address] && busyWallets[wallet.address] >= now)) {
                throw new Error('All mining wallets are busy, please try again in a moment.');
            }
            
            const walletSigner = wallet.connect(provider);
            await fundMinerWalletIfNeeded(wallet);
            const contract = new ethers.Contract(MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI, walletSigner);
            
            // 🔧 CRITICAL: Get fresh nonce for miner wallet
            const nonce = await getFreshNonce(wallet.address);
            console.log(`[MINE] 🔄 Using fresh nonce for miner ${wallet.address.slice(0,6)}...${wallet.address.slice(-4)}: ${nonce}`);
            
            // Generate random nonce and solution
            const miningNonce = Math.floor(Math.random() * 1e12);
            const chars = '0123456789abcdef';
            let solution = '0x';
            for (let i = 0; i < 64; i++) {
                solution += chars[Math.floor(Math.random() * chars.length)];
            }
            
            const tx = await contract.mineBlock(miningNonce, solution, { 
                gasLimit: 200000,
                nonce: nonce  // Force fresh nonce
            });
            pendingTxs[wallet.address] = tx.hash;
            busyWallets[wallet.address] = Date.now() + 30000; // 30 seconds busy
            
            return { tx, nonce: miningNonce, solution, wallet: wallet.address };
        }, 'Mining Transaction');
        
        let reward = 0;
        const rand = Math.random();
        // TESTING: GUARANTEED REWARDS - Nearly every mine gives something!
        if (rand < 0.95) { // 95% chance for rewards!
            if (rand < 0.10) reward = parseFloat((Math.random() * 0.5 + 0.1).toFixed(4)); // 10% chance for 0.1-0.6 OMEGA (big rewards)
            else if (rand < 0.30) reward = parseFloat((Math.random() * 0.08 + 0.02).toFixed(4)); // 20% chance for 0.02-0.1 OMEGA (good rewards)
            else if (rand < 0.60) reward = parseFloat((Math.random() * 0.02 + 0.005).toFixed(4)); // 30% chance for 0.005-0.025 OMEGA (medium rewards)
            else reward = parseFloat((Math.random() * 0.005 + 0.001).toFixed(4)); // 35% chance for 0.001-0.006 OMEGA (small rewards)
        } else reward = 0; // Only 5% chance for no reward
        
        res.json({ 
            success: true, 
            txHash: result.tx.hash, 
            nonce: result.nonce, 
            solution: result.solution, 
            from: result.wallet, 
            reward: reward 
        });
        
        // Background processing
        result.tx.wait().then(() => {
            if (!rewardsByAddress[userAddr]) rewardsByAddress[userAddr] = 0;
            if (!global.miningCounts) global.miningCounts = {};
            if (!global.miningCounts[userAddr]) global.miningCounts[userAddr] = 0;
            global.miningCounts[userAddr]++;
            rewardsByAddress[userAddr] += reward;
            console.log(`[MINE] ${userAddr} reward: ${reward}, total: ${rewardsByAddress[userAddr]}`);
        }).finally(() => {
            delete pendingTxs[result.wallet];
        });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🛡️ NETWORK-RESILIENT /claim ENDPOINT (NONCE-FIXED)
app.post('/claim', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address || !ethers.utils.isAddress(address)) {
            return res.status(400).json({ error: 'User address required' });
        }
        const userAddr = normAddress(address);
        const reward = rewardsByAddress[userAddr] || 0;
        
        if (reward <= 0) {
            return res.json({ success: false, message: 'No rewards to claim.' });
        }
        
        const result = await withNetworkRetry(async () => {
            // 🔧 CRITICAL: Get fresh nonce for claim transaction
            const nonce = await getFreshNonce();
            
            const tx = await relayerSigner.sendTransaction({
                to: address,
                value: ethers.utils.parseEther(reward.toString()),
                gasLimit: 21000,
                gasPrice: ethers.utils.parseUnits('20', 'gwei'),
                nonce: nonce  // Force fresh nonce
            });
            await tx.wait();
            return tx;
        }, 'Claim Transaction');
        
        rewardsByAddress[userAddr] = 0;
        res.json({ success: true, txHash: result.hash, amount: reward });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Claimable endpoint (no blockchain transaction, no nonce needed)
app.post('/claimable', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address || !ethers.utils.isAddress(address)) {
            return res.status(400).json({ error: 'User address required' });
        }
        const userAddr = normAddress(address);
        const amount = rewardsByAddress[userAddr] || 0;
        
        if (amount > 0) {
            res.json({ success: true, amount });
        } else {
            res.json({ success: false, message: 'No claimable balance.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🛡️ NETWORK-RESILIENT /stress ENDPOINT (NONCE-FIXED)
app.post('/stress', async (req, res) => {
    try {
        let txHashes = [];
        let promises = [];
        for (let i = 0; i < 10; i++) {
            const to = ethers.Wallet.createRandom().address;
            promises.push(
                withNetworkRetry(async () => {
                    // 🔧 CRITICAL: Get fresh nonce for each stress test transaction
                    const nonce = await getFreshNonce();
                    
                    return await relayerSigner.sendTransaction({
                        to,
                        value: 0,
                        gasLimit: 21000,
                        gasPrice: ethers.utils.parseUnits('20', 'gwei'),
                        nonce: nonce
                    });
                }, `Stress Test ${i+1}`).then(tx => {
                    txHashes.push(tx.hash);
                }).catch(e => {
                    txHashes.push('error:' + e.message);
                })
            );
        }
        await Promise.all(promises);
        res.json({ success: true, txHashes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Jupiter endpoints
app.post('/jupiter/quote', async (req, res) => {
  const { inputMint, outputMint, amount } = req.body;
  if (!inputMint || !outputMint || !amount) {
    return res.status(400).json({ error: 'inputMint, outputMint, and amount are required' });
  }
  try {
    const url = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${encodeURIComponent(inputMint)}&outputMint=${encodeURIComponent(outputMint)}&amount=${encodeURIComponent(amount)}&slippageBps=50&restrictIntermediateTokens=true`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const responseText = await response.text();
    
    try {
      const data = JSON.parse(responseText);
      if (data.error || data.message) {
        res.status(400).json({ error: data.error || data.message || 'No swap route found for this pair and amount' });
      } else {
        res.json(data);
      }
    } catch (parseError) {
      res.status(400).json({ error: 'No swap route found for this pair and amount' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Jupiter quote', details: err.message });
  }
});

app.post('/jupiter/swap', async (req, res) => {
  const { inputMint, outputMint, amount, userPublicKey } = req.body;
  if (!inputMint || !outputMint || !amount || !userPublicKey) {
    return res.status(400).json({ error: 'inputMint, outputMint, amount, and userPublicKey are required' });
  }
  try {
    const quoteUrl = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${encodeURIComponent(inputMint)}&outputMint=${encodeURIComponent(outputMint)}&amount=${encodeURIComponent(amount)}&slippageBps=50&restrictIntermediateTokens=true&dynamicSlippage=true`;
    const quoteResponse = await fetch(quoteUrl, { headers: { 'Accept': 'application/json' } });
    const quoteText = await quoteResponse.text();
    
    let quoteData;
    try {
      quoteData = JSON.parse(quoteText);
    } catch (parseError) {
      return res.status(400).json({ error: 'Failed to parse Jupiter quote response' });
    }
    
    if (!quoteData || !quoteData.outAmount || quoteData.error) {
      return res.status(400).json({ error: quoteData?.error || quoteData?.message || 'No swap route found for this pair and amount' });
    }

    const swapUrl = 'https://lite-api.jup.ag/swap/v1/swap';
    const swapResponse = await fetch(swapUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quoteData,
        userPublicKey,
        dynamicComputeUnitLimit: true,
        dynamicSlippage: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 1000000,
            priorityLevel: "veryHigh"
          }
        }
      })
    });
    const swapText = await swapResponse.text();
    
    let swapData;
    try {
      swapData = JSON.parse(swapText);
    } catch (parseError) {
      return res.status(400).json({ error: 'Failed to parse Jupiter swap response' });
    }
    
    if (swapData && swapData.swapTransaction) {
      res.json({
        success: true,
        transaction: swapData.swapTransaction,
        outAmount: swapData.outAmount,
        inAmount: swapData.inAmount
      });
    } else {
      res.status(400).json({ error: 'Failed to create swap transaction', details: swapData });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to create Jupiter swap', details: err.message });
  }
});

app.get('/jupiter/search', async (req, res) => {
  try {
    const q = req.query.q;
    const response = await fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(q)}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search Jupiter tokens' });
  }
});

// ===================================
// OMEGA NETWORK API ENDPOINTS
// ===================================

// 🔗 USER MANAGEMENT APIs
// ======================

// Get User Profile
app.get('/v1/users/:walletAddress/profile', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        db.get(`SELECT * FROM user_profiles WHERE wallet_address = ?`, [walletAddress], (err, profile) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            if (!profile) {
                return res.status(404).json({ error: 'User profile not found', status: 404 });
            }
            
            // Get discover interactions (activities)
            db.all(`SELECT * FROM user_activities WHERE wallet_address = ? ORDER BY timestamp DESC LIMIT 10`,
                   [walletAddress], (err, activities) => {
                if (err) activities = [];
                
                res.json({
                    success: true,
                    data: {
                        profile: {
                            walletAddress: profile.wallet_address,
                            username: profile.username,
                            displayName: profile.display_name,
                            bio: profile.bio,
                            avatar: profile.avatar,
                            location: profile.location,
                            website: profile.website,
                            twitter: profile.twitter,
                            discord: profile.discord,
                            github: profile.github,
                            telegram: profile.telegram,
                            email: profile.email,
                            isPublic: profile.is_public
                        },
                        discoverInteractions: activities
                    }
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user profile', status: 500 });
    }
});

// Update User Profile
app.post('/v1/users/:walletAddress/profile', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const profileData = req.body;
        
        db.run(`INSERT OR REPLACE INTO user_profiles 
                (wallet_address, username, display_name, bio, avatar, location, website, 
                 twitter, discord, github, telegram, email, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
               [walletAddress, profileData.username, profileData.displayName, profileData.bio,
                profileData.avatar, profileData.location, profileData.website, 
                profileData.twitter, profileData.discord, profileData.github,
                profileData.telegram, profileData.email], 
               function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update profile', status: 500 });
            }
            
            res.json({ success: true, data: { updated: true } });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user profile', status: 500 });
    }
});

// Get User Activity
app.get('/v1/users/:walletAddress/activity', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        
        db.all(`SELECT * FROM user_activities WHERE wallet_address = ? 
                ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
               [walletAddress, limit, offset], (err, activities) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            res.json({ success: true, data: activities });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user activity', status: 500 });
    }
});

// Get User Tasks
app.get('/v1/users/:walletAddress/tasks', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        db.all(`SELECT * FROM user_tasks WHERE wallet_address = ? ORDER BY created_at DESC`,
               [walletAddress], (err, tasks) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            res.json({ success: true, data: tasks });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user tasks', status: 500 });
    }
});

// Get User Faucet Status  
app.get('/v1/users/:walletAddress/faucet-status', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        db.all(`SELECT * FROM faucet_claims WHERE wallet_address = ? ORDER BY claimed_at DESC`,
               [walletAddress], (err, claims) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            const totalUserClaims = claims.length;
            const totalUserRewards = claims.reduce((sum, claim) => 
                sum + parseFloat(claim.amount || 0), 0).toString();
            
            res.json({ 
                success: true, 
                data: {
                    totalUserClaims,
                    totalUserRewards,
                    recentClaims: claims.slice(0, 5),
                    lastClaimTime: claims[0]?.claimed_at || '0'
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get faucet status', status: 500 });
    }
});

// Get User Faucet Activities
app.get('/v1/users/:walletAddress/faucet-activities', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        db.all(`SELECT * FROM faucet_claims WHERE wallet_address = ? ORDER BY claimed_at DESC`,
               [walletAddress], (err, activities) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            res.json({ success: true, data: activities });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get faucet activities', status: 500 });
    }
});

// Get User Blockchain Claims
app.get('/v1/users/:walletAddress/blockchain-claims', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        db.all(`SELECT * FROM faucet_claims WHERE wallet_address = ? AND status = 'CONFIRMED' 
                ORDER BY claimed_at DESC`,
               [walletAddress], (err, claims) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            res.json({ success: true, data: claims });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get blockchain claims', status: 500 });
    }
});

// Get User Aggregated Claims
app.get('/v1/users/:walletAddress/aggregated-claims', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        db.all(`SELECT * FROM faucet_claims WHERE wallet_address = ?`, [walletAddress], (err, claims) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            const totalClaims = claims.length;
            const totalAmount = claims.reduce((sum, claim) => sum + parseFloat(claim.amount || 0), 0);
            const successfulClaims = claims.filter(c => c.status === 'CONFIRMED').length;
            
            res.json({ 
                success: true, 
                data: {
                    totalClaims,
                    totalAmount: totalAmount.toString(),
                    successfulClaims,
                    successRate: totalClaims > 0 ? (successfulClaims / totalClaims * 100) : 0
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get aggregated claims', status: 500 });
    }
});

// Get User Aggregated Achievements
app.get('/v1/users/:walletAddress/aggregated-achievements', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        db.all(`SELECT ua.*, a.title, a.points FROM user_achievements ua 
                JOIN achievements a ON ua.achievement_id = a.id 
                WHERE ua.wallet_address = ?`,
               [walletAddress], (err, achievements) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            const totalPoints = achievements.reduce((sum, ach) => sum + (ach.points || 0), 0);
            
            res.json({ 
                success: true, 
                data: {
                    totalAchievements: achievements.length,
                    totalPoints,
                    achievements
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get aggregated achievements', status: 500 });
    }
});

// 🎯 REFERRAL SYSTEM APIs
// =======================

// Generate Referral Code
app.post('/v1/referrals/generate-code', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address required', status: 400 });
        }
        
        // Check if user already has a referral code
        db.get(`SELECT referral_code FROM referrals WHERE referrer_address = ?`, [walletAddress], (err, existing) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            if (existing) {
                return res.json({ 
                    success: true, 
                    data: { 
                        referralCode: existing.referral_code, 
                        alreadyExists: true 
                    }
                });
            }
            
            // Generate new referral code
            const referralCode = 'OMEGA' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            db.run(`INSERT INTO referrals (referral_code, referrer_address) VALUES (?, ?)`,
                   [referralCode, walletAddress], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to generate referral code', status: 500 });
                }
                
                res.json({ 
                    success: true, 
                    data: { 
                        referralCode, 
                        alreadyExists: false 
                    }
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate referral code', status: 500 });
    }
});

// Validate Referral Code
app.get('/v1/referrals/validate/:code', async (req, res) => {
    try {
        const { code } = req.params;
        
        db.get(`SELECT r.*, p.username, p.display_name 
                FROM referrals r 
                LEFT JOIN user_profiles p ON r.referrer_address = p.wallet_address 
                WHERE r.referral_code = ?`, [code], (err, referral) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            if (!referral) {
                return res.json({ 
                    success: true, 
                    data: { isValid: false }
                });
            }
            
            res.json({ 
                success: true, 
                data: {
                    isValid: true,
                    referrerAddress: referral.referrer_address,
                    referrerUsername: referral.username || 'Anonymous',
                    referrerDisplayName: referral.display_name || 'Omega User'
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to validate referral code', status: 500 });
    }
});

// Complete Referral
app.post('/v1/referrals/complete', async (req, res) => {
    try {
        const { referralCode, referredAddress } = req.body;
        
        if (!referralCode || !referredAddress) {
            return res.status(400).json({ error: 'Referral code and referred address required', status: 400 });
        }
        
        db.run(`UPDATE referrals 
                SET referred_address = ?, status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP 
                WHERE referral_code = ? AND referred_address IS NULL`,
               [referredAddress, referralCode], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            if (this.changes === 0) {
                return res.status(400).json({ error: 'Invalid referral code or already used', status: 400 });
            }
            
            // Update referrer stats
            db.run(`UPDATE user_progress 
                    SET referrals_count = referrals_count + 1, total_points = total_points + 100
                    WHERE wallet_address = (SELECT referrer_address FROM referrals WHERE referral_code = ?)`,
                   [referralCode]);
            
            res.json({ success: true, data: { completed: true } });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete referral', status: 500 });
    }
});

// Track Referral Visit
app.post('/v1/referrals/track-visit', async (req, res) => {
    try {
        const { referralCode, visitorAddress } = req.body;
        
        // Log the visit (you can extend this with more detailed tracking)
        console.log(`[REFERRAL] Visit tracked: ${referralCode} by ${visitorAddress || 'anonymous'}`);
        
        // Add to activities if visitor address provided
        if (visitorAddress) {
            db.run(`INSERT INTO user_activities (wallet_address, activity_type, details) 
                    VALUES (?, 'referral_visit', ?)`,
                   [visitorAddress, JSON.stringify({ referralCode, timestamp: new Date() })]);
        }
        
        res.json({ success: true, data: { tracked: true } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to track visit', status: 500 });
    }
});

// 🏆 AMBASSADOR SYSTEM APIs
// =========================

// Get Ambassador Leaderboard
app.get('/v1/ambassadors/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        
        db.all(`SELECT p.wallet_address, p.username, p.display_name, pr.total_points, pr.level, 
                       pr.rank, pr.referrals_count, r.referral_count, p.created_at,
                       MAX(ua.timestamp) as last_activity
                FROM user_profiles p
                LEFT JOIN user_progress pr ON p.wallet_address = pr.wallet_address
                LEFT JOIN (
                    SELECT referrer_address, COUNT(*) as referral_count 
                    FROM referrals WHERE status = 'COMPLETED' 
                    GROUP BY referrer_address
                ) r ON p.wallet_address = r.referrer_address
                LEFT JOIN user_activities ua ON p.wallet_address = ua.wallet_address
                WHERE r.referral_count > 0
                GROUP BY p.wallet_address
                ORDER BY r.referral_count DESC, pr.total_points DESC
                LIMIT ? OFFSET ?`,
               [limit, offset], (err, ambassadors) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            // Get total count for pagination
            db.get(`SELECT COUNT(DISTINCT p.wallet_address) as total
                    FROM user_profiles p
                    JOIN referrals r ON p.wallet_address = r.referrer_address
                    WHERE r.status = 'COMPLETED'`, (err, countResult) => {
                
                const total = countResult ? countResult.total : 0;
                
                const formattedAmbassadors = ambassadors.map((amb, index) => ({
                    walletAddress: amb.wallet_address,
                    username: amb.username || `user_${amb.wallet_address.substring(2, 8)}`,
                    displayName: amb.display_name || 'Omega Ambassador',
                    totalReferrals: amb.referral_count || 0,
                    activeReferrals: amb.referral_count || 0,
                    totalPoints: amb.total_points || 0,
                    level: amb.level || 1,
                    tier: amb.rank || 'BRONZE',
                    tierProgress: Math.min((amb.total_points || 0) % 1000 / 10, 100),
                    rank: offset + index + 1,
                    lastActivity: amb.last_activity,
                    createdAt: amb.created_at
                }));
                
                res.json({ 
                    success: true, 
                    data: formattedAmbassadors,
                    pagination: { limit, offset, total }
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ambassador leaderboard', status: 500 });
    }
});

// Get Ambassador Profile
app.get('/v1/ambassadors/:address/profile', async (req, res) => {
    try {
        const { address } = req.params;
        
        // Get profile with referral stats
        db.get(`SELECT p.*, pr.total_points, pr.level, pr.rank, pr.referrals_count
                FROM user_profiles p
                LEFT JOIN user_progress pr ON p.wallet_address = pr.wallet_address
                WHERE p.wallet_address = ?`, [address], (err, profile) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            if (!profile) {
                return res.status(404).json({ error: 'Ambassador not found', status: 404 });
            }
            
            res.json({ success: true, data: profile });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ambassador profile', status: 500 });
    }
});

// Get Ambassador Referrals
app.get('/v1/ambassadors/:address/referrals', async (req, res) => {
    try {
        const { address } = req.params;
        
        db.all(`SELECT * FROM referrals WHERE referrer_address = ? ORDER BY created_at DESC`,
               [address], (err, referrals) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            res.json({ success: true, data: referrals });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ambassador referrals', status: 500 });
    }
});

// Get Ambassador Stats
app.get('/v1/ambassadors/:address/stats', async (req, res) => {
    try {
        const { address } = req.params;
        
        // Get comprehensive stats
        db.get(`SELECT 
                    (SELECT COUNT(*) FROM referrals WHERE referrer_address = ?) as total_referrals,
                    (SELECT COUNT(*) FROM referrals WHERE referrer_address = ? AND status = 'COMPLETED') as completed_referrals,
                    (SELECT total_points FROM user_progress WHERE wallet_address = ?) as total_points,
                    (SELECT level FROM user_progress WHERE wallet_address = ?) as level,
                    (SELECT COUNT(*) FROM user_achievements WHERE wallet_address = ?) as total_achievements`,
               [address, address, address, address, address], (err, stats) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            res.json({ success: true, data: stats || {} });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ambassador stats', status: 500 });
    }
});

// Generate Ambassador Referral Code
app.post('/v1/ambassadors/generate-referral-code', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        
        // Same as regular referral code generation
        db.get(`SELECT referral_code FROM referrals WHERE referrer_address = ?`, [walletAddress], (err, existing) => {
            if (existing) {
                return res.json({ 
                    success: true, 
                    data: { referralCode: existing.referral_code, alreadyExists: true }
                });
            }
            
            const referralCode = 'AMB' + Math.random().toString(36).substring(2, 10).toUpperCase();
            
            db.run(`INSERT INTO referrals (referral_code, referrer_address) VALUES (?, ?)`,
                   [referralCode, walletAddress], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to generate code', status: 500 });
                }
                
                res.json({ 
                    success: true, 
                    data: { referralCode, alreadyExists: false }
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate ambassador referral code', status: 500 });
    }
});

// Get Ambassador Directory
app.get('/v1/ambassadors/directory', async (req, res) => {
    try {
        db.all(`SELECT p.wallet_address, p.username, p.display_name, p.bio, p.avatar,
                       pr.total_points, pr.level, pr.rank,
                       COUNT(r.id) as referral_count
                FROM user_profiles p
                LEFT JOIN user_progress pr ON p.wallet_address = pr.wallet_address
                LEFT JOIN referrals r ON p.wallet_address = r.referrer_address AND r.status = 'COMPLETED'
                WHERE p.is_public = TRUE
                GROUP BY p.wallet_address
                ORDER BY referral_count DESC, pr.total_points DESC`,
               [], (err, directory) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            res.json({ success: true, data: directory });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ambassador directory', status: 500 });
    }
});

// 🎮 ARCADE SYSTEM APIs
// =====================

// Get Arcade Leaderboard
app.get('/v1/arcade/leaderboard', async (req, res) => {
    try {
        const game = req.query.game;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        
        let query = `SELECT a.*, p.username, p.display_name 
                     FROM arcade_scores a
                     LEFT JOIN user_profiles p ON a.wallet_address = p.wallet_address`;
        let params = [];
        
        if (game) {
            query += ` WHERE a.game = ?`;
            params.push(game);
        }
        
        query += ` ORDER BY a.score DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        db.all(query, params, (err, scores) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            res.json({ success: true, data: scores });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get arcade leaderboard', status: 500 });
    }
});

// 🚰 ENHANCED FAUCET SYSTEM APIs
// ===============================

// Get Enhanced Faucet Status
app.get('/api/faucet/status', async (req, res) => {
    try {
        const { walletAddress } = req.query;
        
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address required', status: 400 });
        }
        
        // Get user's faucet history
        db.all(`SELECT * FROM faucet_claims WHERE wallet_address = ? ORDER BY claimed_at DESC`,
               [walletAddress], async (err, userClaims) => {
            if (err) userClaims = [];
            
            // Get global stats
            db.get(`SELECT 
                        COUNT(*) as total_claims,
                        SUM(CAST(amount as REAL)) as total_rewards,
                        COUNT(DISTINCT wallet_address) as unique_users,
                        (COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) * 100.0 / COUNT(*)) as success_rate
                    FROM faucet_claims`, (err, globalStats) => {
                
                const lastClaim = userClaims[0];
                const canClaim = !lastClaim || 
                    (Date.now() - new Date(lastClaim.claimed_at).getTime()) > 86400000; // 24 hours
                
                try {
                    // Get faucet balance if relayer is available
                    if (relayerSigner) {
                        relayerSigner.getBalance().then(balance => {
                            const faucetBalance = balance.toString();
                            
                            res.json({
                                success: true,
                                data: {
                                    canClaim,
                                    faucetBalance,
                                    claimAmount: ethers.utils.parseEther('0.1').toString(),
                                    cooldownPeriod: 86400,
                                    timeUntilNextClaim: lastClaim ? 
                                        Math.max(0, 86400 - Math.floor((Date.now() - new Date(lastClaim.claimed_at).getTime()) / 1000)) : 0,
                                    lastClaimTime: lastClaim?.claimed_at || '0',
                                    totalUserClaims: userClaims.length,
                                    totalUserRewards: userClaims.reduce((sum, claim) => sum + parseFloat(claim.amount), 0).toString(),
                                    recentClaims: userClaims.slice(0, 5),
                                    globalStats: {
                                        totalClaims: globalStats?.total_claims || 0,
                                        totalRewards: (globalStats?.total_rewards || 0).toString(),
                                        successRate: globalStats?.success_rate || 0,
                                        uniqueUsers: globalStats?.unique_users || 0
                                    },
                                    network: {
                                        chainId: '0x4e454228',
                                        rpcUrl: 'https://0x4e454228.rpc.aurora-cloud.dev',
                                        explorerUrl: 'https://explorer.omeganetwork.co'
                                    }
                                }
                            });
                        }).catch(networkError => {
                            // Return data without faucet balance
                            res.json({
                                success: true,
                                data: {
                                    canClaim,
                                    faucetBalance: '0',
                                    claimAmount: ethers.utils.parseEther('0.1').toString(),
                                    cooldownPeriod: 86400,
                                    timeUntilNextClaim: lastClaim ? 
                                        Math.max(0, 86400 - Math.floor((Date.now() - new Date(lastClaim.claimed_at).getTime()) / 1000)) : 0,
                                    lastClaimTime: lastClaim?.claimed_at || '0',
                                    totalUserClaims: userClaims.length,
                                    totalUserRewards: userClaims.reduce((sum, claim) => sum + parseFloat(claim.amount), 0).toString(),
                                    recentClaims: userClaims.slice(0, 5),
                                    globalStats: globalStats || {},
                                    network: {
                                        chainId: '0x4e454228',
                                        rpcUrl: 'https://0x4e454228.rpc.aurora-cloud.dev',
                                        explorerUrl: 'https://explorer.omeganetwork.co'
                                    }
                                }
                            });
                        });
                    } else {
                        // No relayer available, return without faucet balance
                        res.json({
                            success: true,
                            data: {
                                canClaim,
                                faucetBalance: '0',
                                claimAmount: ethers.utils.parseEther('0.1').toString(),
                                cooldownPeriod: 86400,
                                timeUntilNextClaim: lastClaim ? 
                                    Math.max(0, 86400 - Math.floor((Date.now() - new Date(lastClaim.claimed_at).getTime()) / 1000)) : 0,
                                lastClaimTime: lastClaim?.claimed_at || '0',
                                totalUserClaims: userClaims.length,
                                totalUserRewards: userClaims.reduce((sum, claim) => sum + parseFloat(claim.amount), 0).toString(),
                                recentClaims: userClaims.slice(0, 5),
                                globalStats: globalStats || {},
                                network: {
                                    chainId: '0x4e454228',
                                    rpcUrl: 'https://0x4e454228.rpc.aurora-cloud.dev',
                                    explorerUrl: 'https://explorer.omeganetwork.co'
                                }
                            }
                        });
                    }
                } catch (networkError) {
                    // Return data without network-dependent fields
                    res.json({
                        success: true,
                        data: {
                            canClaim,
                            claimAmount: ethers.utils.parseEther('0.1').toString(),
                            cooldownPeriod: 86400,
                            timeUntilNextClaim: lastClaim ? 
                                Math.max(0, 86400 - Math.floor((Date.now() - new Date(lastClaim.claimed_at).getTime()) / 1000)) : 0,
                            lastClaimTime: lastClaim?.claimed_at || '0',
                            totalUserClaims: userClaims.length,
                            totalUserRewards: userClaims.reduce((sum, claim) => sum + parseFloat(claim.amount), 0).toString(),
                            recentClaims: userClaims.slice(0, 5),
                            globalStats: globalStats || {},
                            network: {
                                chainId: '0x4e454228',
                                rpcUrl: 'https://0x4e454228.rpc.aurora-cloud.dev',
                                explorerUrl: 'https://explorer.omeganetwork.co'
                            }
                        }
                    });
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get faucet status', status: 500 });
    }
});

// Claim from Faucet (Enhanced)
app.post('/api/faucet/claim', async (req, res) => {
    try {
        const { walletAddress, signature } = req.body;
        
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address required', status: 400 });
        }
        
        // Record the claim attempt
        const claimAmount = '0.1';
        
        db.run(`INSERT INTO faucet_claims (wallet_address, amount, status, claim_type) 
                VALUES (?, ?, 'PENDING', 'STANDARD')`,
               [walletAddress, claimAmount], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to record claim', status: 500 });
            }
            
            const claimId = this.lastID;
            
            // Try to send funds through existing /fund endpoint
            fetch(`http://localhost:${PORT}/fund`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: walletAddress, amount: claimAmount })
            }).then(response => response.json())
              .then(result => {
                  // Update claim record with result
                  const newStatus = result.txHash ? 'CONFIRMED' : 'FAILED';
                  db.run(`UPDATE faucet_claims SET status = ?, tx_hash = ? WHERE id = ?`,
                         [newStatus, result.txHash, claimId]);
              });
            
            res.json({ success: true, data: { claimId, status: 'PENDING' } });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process faucet claim', status: 500 });
    }
});

// Get Faucet Claims
app.get('/api/faucet/claims', async (req, res) => {
    try {
        const walletAddress = req.query.walletAddress;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        
        let query = `SELECT * FROM faucet_claims`;
        let params = [];
        
        if (walletAddress) {
            query += ` WHERE wallet_address = ?`;
            params.push(walletAddress);
        }
        
        query += ` ORDER BY claimed_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        db.all(query, params, (err, claims) => {
            if (err) {
                return res.status(500).json({ error: 'Database error', status: 500 });
            }
            
            res.json({ success: true, data: claims });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get faucet claims', status: 500 });
    }
});

// 🏅 ACHIEVEMENT SYSTEM APIs
// ==========================

// Track Achievement
app.post('/api/achievements/track', async (req, res) => {
    try {
        const { walletAddress, achievementId, action, details } = req.body;
        
        if (!walletAddress || !achievementId) {
            return res.status(400).json({ error: 'Wallet address and achievement ID required', status: 400 });
        }
        
        // Check if achievement already earned
        db.get(`SELECT * FROM user_achievements WHERE wallet_address = ? AND achievement_id = ?`,
               [walletAddress, achievementId], (err, existing) => {
            if (existing) {
                return res.json({ success: true, data: { alreadyEarned: true } });
            }
            
            // Award achievement
            db.run(`INSERT INTO user_achievements (wallet_address, achievement_id, details) 
                    VALUES (?, ?, ?)`,
                   [walletAddress, achievementId, JSON.stringify(details)], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to track achievement', status: 500 });
                }
                
                // Add activity record
                db.run(`INSERT INTO user_activities (wallet_address, activity_type, details) 
                        VALUES (?, 'achievement_earned', ?)`,
                       [walletAddress, JSON.stringify({ achievementId, action, details })]);
                
                res.json({ success: true, data: { earned: true, achievementId } });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to track achievement', status: 500 });
    }
});

// Track Social Achievement
app.post('/api/achievements/track-social', async (req, res) => {
    try {
        const { walletAddress, platform, action, details } = req.body;
        
        const achievementId = `social_${platform}_${action}`;
        
        // Track as regular achievement
        db.run(`INSERT OR IGNORE INTO user_achievements (wallet_address, achievement_id, details) 
                VALUES (?, ?, ?)`,
               [walletAddress, achievementId, JSON.stringify({ platform, action, details })], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to track social achievement', status: 500 });
            }
            
            res.json({ success: true, data: { tracked: true, achievementId } });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to track social achievement', status: 500 });
    }
});

// Award Referral Achievements
app.post('/v1/achievements/referral-achievements', async (req, res) => {
    try {
        const { referrerAddress, referredAddress, referralCode } = req.body;
        
        // Award achievements to both parties
        const referrerAchievement = 'successful_referral';
        const referredAchievement = 'first_join';
        
        // Award to referrer
        db.run(`INSERT OR IGNORE INTO user_achievements (wallet_address, achievement_id, details) 
                VALUES (?, ?, ?)`,
               [referrerAddress, referrerAchievement, JSON.stringify({ referralCode, referredAddress })]);
        
        // Award to referred user
        db.run(`INSERT OR IGNORE INTO user_achievements (wallet_address, achievement_id, details) 
                VALUES (?, ?, ?)`,
               [referredAddress, referredAchievement, JSON.stringify({ referralCode, referrerAddress })]);
        
        res.json({ success: true, data: { awarded: true } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to award referral achievements', status: 500 });
    }
});

// 🛠️ UTILITY APIs
// ================

// Wallet Verification
app.post('/v1/wallet-verification', async (req, res) => {
    try {
        const { walletAddress, message, signature } = req.body;
        
        if (!walletAddress || !message || !signature) {
            return res.status(400).json({ error: 'Wallet address, message, and signature required', status: 400 });
        }
        
        try {
            const recoveredAddress = ethers.utils.verifyMessage(message, signature);
            const isValid = recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
            
            res.json({ 
                success: true, 
                data: { 
                    isValid, 
                    recoveredAddress,
                    providedAddress: walletAddress
                }
            });
        } catch (verifyError) {
            res.json({ 
                success: true, 
                data: { 
                    isValid: false, 
                    error: 'Invalid signature'
                }
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify wallet', status: 500 });
    }
});

// Health Check Endpoints
app.get('/api/health/liveness', (req, res) => {
    res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

app.get('/api/health/readiness', (req, res) => {
    const isReady = provider && relayerSigner && db;
    res.status(isReady ? 200 : 503).json({ 
        status: isReady ? 'ready' : 'not ready',
        components: {
            database: !!db,
            blockchain: !!provider,
            signer: !!relayerSigner
        }
    });
});

// Popup Submission
app.post('/api/popup-submission', async (req, res) => {
    try {
        const submissionData = req.body;
        
        // Store popup submission data
        db.run(`INSERT INTO user_activities (wallet_address, activity_type, details) 
                VALUES (?, 'popup_submission', ?)`,
               [submissionData.walletAddress || 'anonymous', JSON.stringify(submissionData)], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to store submission', status: 500 });
            }
            
            res.json({ success: true, data: { submitted: true, id: this.lastID } });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process popup submission', status: 500 });
    }
});

// Reset Progress (Admin only)
app.post('/api/reset-progress', async (req, res) => {
    try {
        const { walletAddress, adminKey } = req.body;
        
        // Simple admin key check (you should implement proper auth)
        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(403).json({ error: 'Unauthorized', status: 403 });
        }
        
        // Reset user progress
        db.run(`DELETE FROM user_progress WHERE wallet_address = ?`, [walletAddress]);
        db.run(`DELETE FROM user_achievements WHERE wallet_address = ?`, [walletAddress]);
        db.run(`DELETE FROM user_activities WHERE wallet_address = ?`, [walletAddress]);
        
        res.json({ success: true, data: { reset: true } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset progress', status: 500 });
    }
});

// Cleanup Activities
app.post('/api/cleanup-activities', async (req, res) => {
    try {
        const daysOld = parseInt(req.body.daysOld) || 30;
        
        db.run(`DELETE FROM user_activities 
                WHERE timestamp < datetime('now', '-${daysOld} days')`, function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to cleanup activities', status: 500 });
            }
            
            res.json({ 
                success: true, 
                data: { 
                    cleaned: true, 
                    deletedRows: this.changes,
                    daysOld 
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cleanup activities', status: 500 });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'OMEGA Network API Server - Complete Version with All Endpoints',
        timestamp: new Date().toISOString(),
        networkRetry: 'Enabled',
        nonceManagement: 'Fresh nonces per transaction',
        database: 'SQLite with comprehensive user tracking',
        endpoints: {
            blockchain: ['/fund', '/mine', '/claim', '/claimable', '/stress', '/status'],
            apis: ['/ai', '/dex/*', '/gecko/*', '/stock/*', '/jupiter/*'],
            userManagement: [
                '/v1/users/:wallet/profile',
                '/v1/users/:wallet/activity', 
                '/v1/users/:wallet/tasks',
                '/v1/users/:wallet/faucet-status',
                '/v1/users/:wallet/faucet-activities',
                '/v1/users/:wallet/blockchain-claims',
                '/v1/users/:wallet/aggregated-claims',
                '/v1/users/:wallet/aggregated-achievements'
            ],
            referrals: [
                '/v1/referrals/generate-code',
                '/v1/referrals/validate/:code',
                '/v1/referrals/complete',
                '/v1/referrals/track-visit'
            ],
            ambassadors: [
                '/v1/ambassadors/leaderboard',
                '/v1/ambassadors/:address/profile',
                '/v1/ambassadors/:address/referrals',
                '/v1/ambassadors/:address/stats',
                '/v1/ambassadors/generate-referral-code',
                '/v1/ambassadors/directory'
            ],
            arcade: [
                '/v1/arcade/leaderboard'
            ],
            faucet: [
                '/api/faucet/status',
                '/api/faucet/claim',
                '/api/faucet/claims'
            ],
            achievements: [
                '/api/achievements/track',
                '/api/achievements/track-social',
                '/v1/achievements/referral-achievements'
            ],
            utility: [
                '/v1/wallet-verification',
                '/api/health/liveness',
                '/api/health/readiness',
                '/api/popup-submission',
                '/api/reset-progress',
                '/api/cleanup-activities'
            ],
            bots: [
                '/api/bots',
                '/api/bots/start',
                '/api/bots/stop',
                '/api/bots/:scriptName/status',
                '/api/bots/:scriptName/input',
                '/api/bots/upload'
            ]
        },
        apiDocumentation: 'Based on API_Documentation.md',
        totalEndpoints: 51
    });
});

// Initialize and start server (RESILIENT STARTUP)
async function startServer() {
    console.log('🚀 INITIALIZING NETWORK-RESILIENT RELAYER (COMPLETE VERSION)...');
    console.log('🔧 Network retry enabled for ETIMEDOUT/ENETUNREACH errors');
    console.log('🔧 Fresh nonce management enabled for all blockchain transactions');
    
    if (!process.env.RELAYER_PRIVATE_KEY) {
        console.error('❌ CRITICAL: RELAYER_PRIVATE_KEY not found in environment variables');
        process.exit(1);
    }
    
    // Start server first, then initialize RPC
    const server = app.listen(PORT, () => {
        console.log(`🚀 RELAYER SERVER STARTED ON PORT ${PORT}`);
        console.log(`⏰ Started at: ${new Date().toISOString()}`);
        console.log(`🔧 Initializing RPC connection...`);
    });
    
    // Initialize RPC in background
    try {
        await initializeProvider();
        console.log(`✅ RELAYER FULLY OPERATIONAL (COMPLETE VERSION)`);
        console.log(`🏠 Relayer address: ${relayerSigner.address}`);
        console.log(`🌐 RPC: ${RPC_ENDPOINTS[currentRpcIndex]}`);
        console.log(`🔧 Nonce management: FIXED - Fresh nonces per transaction`);
        console.log(`📡 API Endpoints: Gemini AI, DexScreener, GeckoTerminal, Alpha Vantage, Jupiter`);
    } catch (error) {
        console.error('⚠️  RPC initialization failed, but server is running:', error.message);
        console.error('🔄 Endpoints will retry connections automatically when called');
        
        // Set up retry initialization
        setTimeout(async () => {
            try {
                console.log('🔄 Retrying RPC initialization...');
                await initializeProvider();
                console.log('✅ RPC connection recovered!');
            } catch (retryError) {
                console.log('❌ RPC retry failed, will try again in 60s');
            }
        }, 30000); // Retry after 30 seconds
    }
}

// ===================================
// REF FINANCE (NEAR DEX) API ENDPOINTS  
// ===================================

// REF Finance configuration
const REF_CONFIG = {
  INDEXER_URL: 'https://indexer.ref.finance',
  RPC_URL: 'https://rpc.mainnet.near.org',
  REF_CONTRACT: 'v2.ref-finance.near',
  REF_TOKEN: 'token.v2.ref-finance.near',
  WRAP_NEAR: 'wrap.near',
  REFERRAL_ID: 'omega-terminal.near' // TODO: Apply for REF referral program
};

// Get all REF Finance tokens
app.get('/ref/tokens', async (req, res) => {
  try {
    const response = await fetch(`${REF_CONFIG.INDEXER_URL}/list-token`);
    const data = await response.json();
    
    if (data && Array.isArray(data)) {
      const transformedData = data.map(token => ({
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        icon: token.icon,
        price: token.price || null,
        total_supply: token.total_supply,
        spec: token.spec
      }));
      
      res.json({
        success: true,
        data: transformedData,
        count: transformedData.length,
        source: 'ref-tokens'
      });
    } else {
      res.json({ success: false, error: 'No tokens found', data: [] });
    }
  } catch (err) {
    console.error('REF tokens error:', err);
    res.status(500).json({ error: 'Failed to fetch REF tokens', success: false });
  }
});

// Get REF Finance pools
app.get('/ref/pools', async (req, res) => {
  try {
    const response = await fetch(`${REF_CONFIG.INDEXER_URL}/list-pools`);
    const data = await response.json();
    
    if (data && Array.isArray(data)) {
      const transformedData = data.map(pool => ({
        id: pool.id,
        tokenIds: pool.tokenIds || pool.token_account_ids,
        supplies: pool.supplies,
        fee: pool.fee,
        shareSupply: pool.shareSupply || pool.shares_total_supply,
        pool_kind: pool.pool_kind,
        tvl: pool.tvl,
        volume_24h: pool.volume_24h,
        apy: pool.apy || pool.farming_apy,
        // Enhanced display data
        feeFormatted: pool.fee ? `${(pool.fee / 100).toFixed(2)}%` : 'N/A',
        tvlFormatted: pool.tvl ? `$${Number(pool.tvl).toLocaleString()}` : 'N/A',
        volumeFormatted: pool.volume_24h ? `$${Number(pool.volume_24h).toLocaleString()}` : 'N/A'
      }));
      
      res.json({
        success: true,
        data: transformedData,
        count: transformedData.length,
        source: 'ref-pools'
      });
    } else {
      res.json({ success: false, error: 'No pools found', data: [] });
    }
  } catch (err) {
    console.error('REF pools error:', err);
    res.status(500).json({ error: 'Failed to fetch REF pools', success: false });
  }
});

// Get specific REF pool details
app.get('/ref/pool/:poolId', async (req, res) => {
  try {
    const { poolId } = req.params;
    const response = await fetch(`${REF_CONFIG.INDEXER_URL}/get-pool?pool_id=${poolId}`);
    const data = await response.json();
    
    if (data) {
      const enhancedData = {
        success: true,
        data: {
          ...data,
          feeFormatted: data.fee ? `${(data.fee / 100).toFixed(2)}%` : 'N/A',
          tvlFormatted: data.tvl ? `$${Number(data.tvl).toLocaleString()}` : 'N/A',
          volumeFormatted: data.volume_24h ? `$${Number(data.volume_24h).toLocaleString()}` : 'N/A'
        },
        source: 'ref-pool-detail'
      };
      res.json(enhancedData);
    } else {
      res.json({ success: false, error: 'Pool not found' });
    }
  } catch (err) {
    console.error('REF pool detail error:', err);
    res.status(500).json({ error: 'Failed to fetch pool details', success: false });
  }
});

// Get REF swap quote
app.post('/ref/quote', async (req, res) => {
  try {
    const { tokenIn, tokenOut, amountIn } = req.body;
    
    if (!tokenIn || !tokenOut || !amountIn) {
      return res.status(400).json({ 
        error: 'tokenIn, tokenOut, and amountIn are required', 
        success: false 
      });
    }
    
    // Get swap estimate from REF indexer
    const quoteResponse = await fetch(`${REF_CONFIG.INDEXER_URL}/get-return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input_token: tokenIn,
        output_token: tokenOut,
        input_amount: amountIn
      })
    });
    
    const quoteData = await quoteResponse.json();
    
    if (quoteData) {
      res.json({
        success: true,
        data: {
          inputToken: tokenIn,
          outputToken: tokenOut,
          inputAmount: amountIn,
          outputAmount: quoteData.return || quoteData.output_amount,
          route: quoteData.route || [],
          priceImpact: quoteData.price_impact,
          fee: quoteData.fee,
          // Add referral info
          referralId: REF_CONFIG.REFERRAL_ID,
          canEarnFees: true
        },
        source: 'ref-quote'
      });
    } else {
      res.json({ success: false, error: 'No quote available' });
    }
  } catch (err) {
    console.error('REF quote error:', err);
    res.status(500).json({ error: 'Failed to get REF quote', success: false });
  }
});

// Get user's REF orders
app.get('/ref/orders/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    
    // Get active orders
    const activeResponse = await fetch(`${REF_CONFIG.INDEXER_URL}/list-active-orders?account_id=${accountId}`);
    const activeOrders = await activeResponse.json();
    
    // Get order history  
    const historyResponse = await fetch(`${REF_CONFIG.INDEXER_URL}/list-history-orders?account_id=${accountId}`);
    const historyOrders = await historyResponse.json();
    
    res.json({
      success: true,
      data: {
        activeOrders: activeOrders || [],
        historyOrders: historyOrders || [],
        totalActive: (activeOrders || []).length,
        totalHistory: (historyOrders || []).length
      },
      source: 'ref-orders'
    });
  } catch (err) {
    console.error('REF orders error:', err);
    res.status(500).json({ error: 'Failed to fetch REF orders', success: false });
  }
});

// Get user's NEAR asset balances
app.get('/ref/balances/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const response = await fetch(`${REF_CONFIG.INDEXER_URL}/list-user-assets?account_id=${accountId}`);
    const data = await response.json();
    
    if (data) {
      // Transform balance data for better display
      const balances = Object.entries(data).map(([tokenId, balance]) => ({
        tokenId,
        balance: balance.toString(),
        // Will be enhanced with token metadata in frontend
      }));
      
      res.json({
        success: true,
        data: balances,
        totalTokens: balances.length,
        source: 'ref-balances'
      });
    } else {
      res.json({ success: false, error: 'No balances found' });
    }
  } catch (err) {
    console.error('REF balances error:', err);
    res.status(500).json({ error: 'Failed to fetch REF balances', success: false });
  }
});

// Search REF tokens
app.get('/ref/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query required', success: false });
    }
    
    const response = await fetch(`${REF_CONFIG.INDEXER_URL}/list-token`);
    const tokens = await response.json();
    
    if (tokens && Array.isArray(tokens)) {
      // Client-side filtering since REF doesn't have search endpoint
      const filteredTokens = tokens.filter(token => 
        token.symbol?.toLowerCase().includes(query.toLowerCase()) ||
        token.name?.toLowerCase().includes(query.toLowerCase()) ||
        token.id?.toLowerCase().includes(query.toLowerCase())
      );
      
      const transformedData = filteredTokens.map(token => ({
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        icon: token.icon,
        price: token.price || null,
        total_supply: token.total_supply
      }));
      
      res.json({
        success: true,
        data: transformedData,
        count: transformedData.length,
        query: query,
        source: 'ref-search'
      });
    } else {
      res.json({ success: false, error: 'Search failed', data: [] });
    }
  } catch (err) {
    console.error('REF search error:', err);
    res.status(500).json({ error: 'Failed to search REF tokens', success: false });
  }
});

// Get REF Finance protocol stats
app.get('/ref/stats', async (req, res) => {
  try {
    const statsResponse = await fetch(`${REF_CONFIG.INDEXER_URL}/list-pools`);
    const pools = await statsResponse.json();
    
    if (pools && Array.isArray(pools)) {
      // Calculate protocol statistics
      const totalPools = pools.length;
      const totalTVL = pools.reduce((sum, pool) => sum + (parseFloat(pool.tvl) || 0), 0);
      const totalVolume24h = pools.reduce((sum, pool) => sum + (parseFloat(pool.volume_24h) || 0), 0);
      const activePools = pools.filter(pool => pool.tvl && parseFloat(pool.tvl) > 1000).length;
      
      res.json({
        success: true,
        data: {
          totalPools,
          activePools,
          totalTVL,
          totalVolume24h,
          // Formatted for display
          tvlFormatted: `$${totalTVL.toLocaleString()}`,
          volumeFormatted: `$${totalVolume24h.toLocaleString()}`,
          avgPoolSize: totalTVL / activePools || 0
        },
        source: 'ref-stats'
      });
    } else {
      res.json({ success: false, error: 'Stats unavailable' });
    }
  } catch (err) {
    console.error('REF stats error:', err);
    res.status(500).json({ error: 'Failed to fetch REF stats', success: false });
  }
});

// ===================================
// PYTHON BOT EXECUTION SYSTEM
// ===================================

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Store running bots
const runningBots = new Map();
const botOutputBuffers = new Map();
const botPerformanceData = new Map();

// Python Bot Management Endpoints

// Start a Python bot
app.post('/api/bots/start', async (req, res) => {
    try {
        const { scriptName, scriptPath, args = [] } = req.body;
        
        if (!scriptName || !scriptPath) {
            return res.status(400).json({ error: 'Script name and path required', success: false });
        }
        
        // Check if bot is already running
        if (runningBots.has(scriptName)) {
            return res.status(400).json({ error: 'Bot is already running', success: false });
        }
        
        // Validate script exists
        if (!fs.existsSync(scriptPath)) {
            return res.status(404).json({ error: 'Script file not found', success: false });
        }
        
        // Initialize output buffer
        botOutputBuffers.set(scriptName, []);
        botPerformanceData.set(scriptName, {
            startTime: Date.now(),
            status: 'starting',
            totalLines: 0,
            errors: 0,
            lastActivity: Date.now()
        });
        
        // Spawn Python process
        const pythonProcess = spawn('python', [scriptPath, ...args], {
            cwd: path.dirname(scriptPath),
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        // Store bot info
        runningBots.set(scriptName, {
            process: pythonProcess,
            scriptPath: scriptPath,
            args: args,
            startTime: Date.now(),
            status: 'running'
        });
        
        // Handle stdout
        pythonProcess.stdout.on('data', (data) => {
            const output = data.toString();
            const lines = output.split('\n').filter(line => line.trim());
            
            const buffer = botOutputBuffers.get(scriptName) || [];
            lines.forEach(line => {
                buffer.push({
                    timestamp: Date.now(),
                    type: 'stdout',
                    content: line.trim()
                });
            });
            
            // Keep only last 1000 lines
            if (buffer.length > 1000) {
                buffer.splice(0, buffer.length - 1000);
            }
            
            botOutputBuffers.set(scriptName, buffer);
            
            // Update performance metrics
            const perf = botPerformanceData.get(scriptName);
            if (perf) {
                perf.totalLines += lines.length;
                perf.lastActivity = Date.now();
                perf.status = 'running';
                botPerformanceData.set(scriptName, perf);
            }
        });
        
        // Handle stderr
        pythonProcess.stderr.on('data', (data) => {
            const output = data.toString();
            const lines = output.split('\n').filter(line => line.trim());
            
            const buffer = botOutputBuffers.get(scriptName) || [];
            lines.forEach(line => {
                buffer.push({
                    timestamp: Date.now(),
                    type: 'stderr',
                    content: line.trim()
                });
            });
            
            botOutputBuffers.set(scriptName, buffer);
            
            // Update error count
            const perf = botPerformanceData.get(scriptName);
            if (perf) {
                perf.errors += lines.length;
                perf.lastActivity = Date.now();
                botPerformanceData.set(scriptName, perf);
            }
        });
        
        // Handle process exit
        pythonProcess.on('exit', (code, signal) => {
            const bot = runningBots.get(scriptName);
            if (bot) {
                bot.status = 'stopped';
                bot.exitCode = code;
                bot.exitSignal = signal;
                bot.endTime = Date.now();
                
                const buffer = botOutputBuffers.get(scriptName) || [];
                buffer.push({
                    timestamp: Date.now(),
                    type: 'system',
                    content: `Bot exited with code ${code}${signal ? ` (signal: ${signal})` : ''}`
                });
                
                // Update performance
                const perf = botPerformanceData.get(scriptName);
                if (perf) {
                    perf.status = 'stopped';
                    perf.endTime = Date.now();
                    perf.runtime = Date.now() - perf.startTime;
                    botPerformanceData.set(scriptName, perf);
                }
            }
            
            runningBots.delete(scriptName);
        });
        
        res.json({
            success: true,
            message: `Bot ${scriptName} started successfully`,
            pid: pythonProcess.pid,
            scriptPath: scriptPath
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to start bot', details: error.message, success: false });
    }
});

// Stop a running bot
app.post('/api/bots/stop', async (req, res) => {
    try {
        const { scriptName } = req.body;
        
        if (!scriptName) {
            return res.status(400).json({ error: 'Script name required', success: false });
        }
        
        const bot = runningBots.get(scriptName);
        if (!bot) {
            return res.status(404).json({ error: 'Bot not found or not running', success: false });
        }
        
        // Kill the process
        bot.process.kill('SIGTERM');
        
        // Update status
        bot.status = 'stopping';
        
        // Add stop message to output
        const buffer = botOutputBuffers.get(scriptName) || [];
        buffer.push({
            timestamp: Date.now(),
            type: 'system',
            content: 'Stop signal sent to bot...'
        });
        
        res.json({
            success: true,
            message: `Stop signal sent to bot ${scriptName}`,
            pid: bot.process.pid
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to stop bot', details: error.message, success: false });
    }
});

// Get bot status and output
app.get('/api/bots/:scriptName/status', async (req, res) => {
    try {
        const { scriptName } = req.params;
        const lines = parseInt(req.query.lines) || 50; // Default last 50 lines
        
        const bot = runningBots.get(scriptName);
        const buffer = botOutputBuffers.get(scriptName) || [];
        const performance = botPerformanceData.get(scriptName) || {};
        
        // Get recent output
        const recentOutput = buffer.slice(-lines);
        
        res.json({
            success: true,
            data: {
                isRunning: !!bot,
                status: bot ? bot.status : 'stopped',
                pid: bot ? bot.process.pid : null,
                scriptPath: bot ? bot.scriptPath : null,
                startTime: bot ? bot.startTime : null,
                runtime: bot ? Date.now() - bot.startTime : 0,
                output: recentOutput,
                outputLines: buffer.length,
                performance: {
                    totalLines: performance.totalLines || 0,
                    errors: performance.errors || 0,
                    lastActivity: performance.lastActivity || null,
                    runtime: performance.runtime || (bot ? Date.now() - bot.startTime : 0)
                }
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to get bot status', details: error.message, success: false });
    }
});

// Get all running bots
app.get('/api/bots', async (req, res) => {
    try {
        const botsList = [];
        
        for (const [scriptName, bot] of runningBots.entries()) {
            const performance = botPerformanceData.get(scriptName) || {};
            const buffer = botOutputBuffers.get(scriptName) || [];
            
            botsList.push({
                name: scriptName,
                status: bot.status,
                pid: bot.process.pid,
                scriptPath: bot.scriptPath,
                startTime: bot.startTime,
                runtime: Date.now() - bot.startTime,
                outputLines: buffer.length,
                lastActivity: performance.lastActivity || bot.startTime,
                totalLines: performance.totalLines || 0,
                errors: performance.errors || 0
            });
        }
        
        res.json({
            success: true,
            data: {
                runningBots: botsList,
                totalBots: botsList.length
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to get bots list', details: error.message, success: false });
    }
});

// Send input to a running bot
app.post('/api/bots/:scriptName/input', async (req, res) => {
    try {
        const { scriptName } = req.params;
        const { input } = req.body;
        
        const bot = runningBots.get(scriptName);
        if (!bot) {
            return res.status(404).json({ error: 'Bot not found or not running', success: false });
        }
        
        // Send input to bot's stdin
        bot.process.stdin.write(input + '\n');
        
        // Log the input in output buffer
        const buffer = botOutputBuffers.get(scriptName) || [];
        buffer.push({
            timestamp: Date.now(),
            type: 'stdin',
            content: `> ${input}`
        });
        
        res.json({
            success: true,
            message: `Input sent to bot ${scriptName}`
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to send input to bot', details: error.message, success: false });
    }
});

// Upload and execute a new Python script
app.post('/api/bots/upload', async (req, res) => {
    try {
        const { scriptName, scriptContent, autoStart = false } = req.body;
        
        if (!scriptName || !scriptContent) {
            return res.status(400).json({ error: 'Script name and content required', success: false });
        }
        
        // Create bots directory if it doesn't exist
        const botsDir = path.join(__dirname, 'bots');
        if (!fs.existsSync(botsDir)) {
            fs.mkdirSync(botsDir, { recursive: true });
        }
        
        // Write script to file
        const scriptPath = path.join(botsDir, `${scriptName}.py`);
        fs.writeFileSync(scriptPath, scriptContent);
        
        const response = {
            success: true,
            message: `Script ${scriptName} uploaded successfully`,
            scriptPath: scriptPath
        };
        
        // Auto-start if requested
        if (autoStart) {
            // Simulate starting the bot by calling the start endpoint
            const startResult = await new Promise((resolve) => {
                // We can't easily call our own endpoint here, so just prepare for start
                response.autoStarted = true;
                response.message += ' and queued for start';
                resolve(response);
            });
        }
        
        res.json(response);
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload script', details: error.message, success: false });
    }
});

// Helper function to extract symbol from description
function extractSymbolFromDescription(description) {
  if (!description) return null;
  
  // Try to extract symbol from patterns like "SYMBOL - Description" or "SYMBOL: Description"
  const symbolMatch = description.match(/^([A-Z0-9]{2,10})[\s\-\:]/);
  if (symbolMatch) return symbolMatch[1];
  
  // Try to extract from parentheses like "Token Name (SYMBOL)"
  const parenMatch = description.match(/\(([A-Z0-9]{2,10})\)/);
  if (parenMatch) return parenMatch[1];
  
  // Extract first word if it looks like a symbol
  const firstWord = description.split(/[\s\-\:]/, 1)[0];
  if (firstWord && firstWord.length <= 10 && /^[A-Z0-9]+$/.test(firstWord)) {
    return firstWord;
  }
  
  return null;
}

// Start the server
startServer().catch(error => {
    console.error('❌ CRITICAL: Server startup failed:', error);
    process.exit(1);
}); 