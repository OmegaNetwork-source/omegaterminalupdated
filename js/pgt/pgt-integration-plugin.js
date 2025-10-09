/* ===================================
   OMEGA TERMINAL - PGT API INTEGRATION
   Playground Tools Terminal API Integration
   =================================== */

console.log('🎯 Loading PGT Integration Plugin...');

(function() {
    
    class PGTIntegration {
        constructor() {
            this.apiKey = 'pgt-partner-omega-terminal-2-25';
            
            // For localhost: Use local proxy to bypass CORS
            // For production: Use PGT API directly
            const isLocalhost = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1';
            
            if (isLocalhost) {
                this.baseUrl = 'http://localhost:3003';
                this.useProxy = true;
                console.log('🔄 Using LOCAL PROXY to bypass CORS');
                console.log('💡 Make sure pgt-proxy-server.js is running!');
            } else {
                this.baseUrl = 'https://www.pgtools.tech/api';
                this.useProxy = false;
                console.log('🌐 Using DIRECT PGT API');
            }
            
            this.isReady = true;
            
            console.log(`🔗 PGT API Base URL: ${this.baseUrl}`);
            console.log(`🌐 API Key: ${this.apiKey}`);
            console.log(`📍 Endpoints: /portfolio, /wallet, /health`);
        }
        
        async callPGTApi(endpoint, method = 'GET', data = null) {
            const fullUrl = `${this.baseUrl}${endpoint}`;
            console.log(`📞 PGT API Call: ${method} ${fullUrl}`);
            
            try {
                const options = {
                    method: method,
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    credentials: 'omit'
                };
                
                // Add body for POST/PUT/DELETE
                if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
                    options.body = JSON.stringify(data);
                    console.log('📤 Request Body:', data);
                }
                
                console.log('🔑 Request Headers:', options.headers);
                
                const response = await fetch(fullUrl, options);
                
                console.log(`📥 Response Status: ${response.status} ${response.statusText}`);
                console.log('📥 Response Headers:', {
                    'content-type': response.headers.get('content-type'),
                    'access-control-allow-origin': response.headers.get('access-control-allow-origin')
                });
                
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.error('❌ Response is not JSON:', contentType);
                    
                    // Try to read response as text to see what we got
                    const text = await response.text();
                    console.error('📄 Response Body (first 500 chars):', text.substring(0, 500));
                    
                    return { 
                        success: false, 
                        error: 'API returning HTML instead of JSON - endpoints may not exist at this path',
                        status: 'API_NOT_READY',
                        data: null,
                        responseType: contentType,
                        responsePreview: text.substring(0, 200)
                    };
                }
                
                const result = await response.json();
                console.log('📦 Parsed JSON Response:', result);
                
                // Handle non-200 status codes
                if (!response.ok) {
                    console.error('❌ HTTP Error:', response.status, result);
                    return {
                        success: false,
                        error: result.error || `HTTP ${response.status}: ${response.statusText}`,
                        status: `HTTP_${response.status}`,
                        data: null
                    };
                }
                
                console.log('✅ API Call Successful');
                return result;
            } catch (error) {
                console.error('❌ PGT API Exception:', error);
                console.error('❌ Error Name:', error.name);
                console.error('❌ Error Message:', error.message);
                console.error('❌ Error Stack:', error.stack);
                
                // Better error messages
                let errorMessage = error.message;
                let errorStatus = 'CONNECTION_FAILED';
                
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'CORS error or network failure - PGT API may not allow cross-origin requests';
                    errorStatus = 'CORS_ERROR';
                } else if (error.message.includes('Unexpected token')) {
                    errorMessage = 'API returning HTML instead of JSON - endpoints not ready';
                    errorStatus = 'INVALID_RESPONSE';
                } else if (error.name === 'TypeError') {
                    errorMessage = 'Network error - cannot reach PGT API server';
                    errorStatus = 'NETWORK_ERROR';
                }
                
                return { 
                    success: false, 
                    error: errorMessage,
                    status: errorStatus,
                    data: null,
                    originalError: error.message
                };
            }
        }
        
        // Portfolio data
        async getPortfolio() {
            return await this.callPGTApi('/portfolio', 'GET');
        }
        
        async getPortfolioSummary() {
            return await this.callPGTApi('/portfolio/summary', 'GET');
        }
        
        // Wallet management
        async addWallet(address, network, label) {
            return await this.callPGTApi('/wallet', 'POST', {
                address, 
                network, 
                label
            });
        }
        
        async updateWallet(address, network, label) {
            return await this.callPGTApi(`/wallet/${address}`, 'PUT', {
                network,
                label
            });
        }
        
        async removeWallet(address, network) {
            return await this.callPGTApi('/wallet', 'DELETE', {
                address, 
                network
            });
        }
        
        async getTrackedWallets() {
            return await this.callPGTApi('/wallet/tracked', 'GET');
        }
        
        async getWalletData(address, network) {
            // PGT API uses /wallet/:address/:network format
            return await this.callPGTApi(`/wallet/${address}/${network}`, 'GET');
        }
        
        // Partner info
        async getPartnerInfo() {
            return await this.callPGTApi('/partner/info', 'GET');
        }
        
        async getUsageStats() {
            return await this.callPGTApi('/partner/usage', 'GET');
        }
        
        // Health check
        async healthCheck() {
            return await this.callPGTApi('/health', 'GET');
        }
    }
    
    // Initialize global PGT system
    window.omegaPGT = new PGTIntegration();
    
    // Test PGT API Connection
    window.testPGTConnection = async function() {
        console.log('🔍 Testing PGT API Connection...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Test 1: Health Check
        console.log('\n1️⃣ Testing Health Endpoint...');
        const healthResult = await window.omegaPGT.healthCheck();
        console.log('   Result:', healthResult);
        
        if (healthResult.success) {
            console.log('   ✅ API Server is ONLINE');
        } else {
            console.log('   ❌ API Server is OFFLINE or not responding');
            console.log('   Error:', healthResult.error);
            return;
        }
        
        // Test 2: Partner Info
        console.log('\n2️⃣ Testing Partner Info...');
        const partnerResult = await window.omegaPGT.getPartnerInfo();
        console.log('   Result:', partnerResult);
        
        if (partnerResult.success) {
            console.log('   ✅ API Key is VALID');
            console.log('   Partner:', partnerResult.data.name);
            console.log('   Permissions:', partnerResult.data.permissions);
        } else {
            console.log('   ❌ API Key is INVALID');
            console.log('   Error:', partnerResult.error);
        }
        
        // Test 3: Get Wallet Data
        console.log('\n3️⃣ Testing Wallet Data Endpoint...');
        const testAddress = '0xBB07d617cF64A64F96b29f3f3B65cd741C2C51FC';
        const testNetwork = 'ethereum';
        console.log('   Address:', testAddress);
        console.log('   Network:', testNetwork);
        
        const walletResult = await window.omegaPGT.getWalletData(testAddress, testNetwork);
        console.log('   Result:', walletResult);
        
        if (walletResult.success) {
            console.log('   ✅ Wallet Data Retrieved');
            console.log('   Total Value:', walletResult.data.totalValue);
            console.log('   Change 24h:', walletResult.data.change24h);
            console.log('   Tokens:', walletResult.data.tokens?.length || 0);
        } else {
            console.log('   ❌ Failed to Get Wallet Data');
            console.log('   Error:', walletResult.error);
            console.log('   Status:', walletResult.status);
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🏁 Test Complete');
        
        return {
            health: healthResult.success,
            partner: partnerResult.success,
            wallet: walletResult.success
        };
    };
    
    console.log('💡 Run testPGTConnection() in console to test API connection');
    
    // ===================================
    // PGT COMMANDS INTEGRATION
    // ===================================
    
    window.handlePGTCommand = function handlePGTCommand(args) {
        const subcommand = args[0]?.toLowerCase();
        
        switch (subcommand) {
            case 'help':
                showPGTHelp();
                break;
                
            case 'portfolio':
            case 'port':
                getPGTPortfolio();
                break;
                
            case 'wallets':
            case 'list':
                getPGTWallets();
                break;
                
            case 'add':
                if (args.length < 3) {
                    window.terminal.log('Usage: pgt add <address> <network> [label]', 'error');
                    window.terminal.log('Networks: ethereum, solana, polygon, bsc, arbitrum, optimism', 'info');
                    return;
                }
                const label = args.slice(3).join(' ') || 'Omega Wallet';
                addPGTWallet(args[1], args[2], label);
                break;
                
            case 'remove':
            case 'delete':
                if (args.length < 3) {
                    window.terminal.log('Usage: pgt remove <address> <network>', 'error');
                    return;
                }
                removePGTWallet(args[1], args[2]);
                break;
                
            case 'wallet':
                if (args.length < 3) {
                    window.terminal.log('Usage: pgt wallet <address> <network>', 'error');
                    return;
                }
                getPGTWalletData(args[1], args[2]);
                break;
                
            case 'status':
            case 'health':
                checkPGTHealth();
                break;
                
            case 'connect':
                connectCurrentWallet();
                break;
                
            default:
                window.terminal.log('Unknown PGT command. Type: pgt help', 'error');
        }
    };
    
    function showPGTHelp() {
        window.terminal.log('🎯 PGT (Playground Tools) Integration Commands:', 'info');
        window.terminal.log('', 'output');
        window.terminal.log('📊 Portfolio & Analytics:', 'output');
        window.terminal.log('  pgt portfolio            - Show complete portfolio summary', 'output');
        window.terminal.log('  pgt wallets             - List all tracked wallets', 'output');
        window.terminal.log('  pgt wallet <addr> <net> - Get specific wallet data', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('🔗 Wallet Management:', 'output');
        window.terminal.log('  pgt add <address> <network> [label] - Add wallet to tracking', 'output');
        window.terminal.log('  pgt remove <address> <network>      - Remove wallet from tracking', 'output');
        window.terminal.log('  pgt connect                         - Add current connected wallet', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('🔧 System:', 'output');
        window.terminal.log('  pgt status              - Check PGT API health', 'output');
        window.terminal.log('  pgt help                - Show this help', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('🌐 Supported Networks:', 'output');
        window.terminal.log('  ethereum, solana, polygon, bsc, arbitrum, optimism, avalanche', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('💡 Examples:', 'output');
        window.terminal.log('  pgt add 0x123... ethereum "My Main Wallet"', 'output');
        window.terminal.log('  pgt wallet 0x123... ethereum', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('⚠️ Note: API endpoints are being deployed by @playgroundtools', 'warning');
        window.terminal.log('🎯 Integration is ready - commands will work when API goes live', 'info');
    }
    
    async function getPGTPortfolio() {
        try {
            window.terminal.log('📊 Fetching portfolio data from PGT...', 'info');
            
            const result = await window.omegaPGT.getPortfolio();
            
            if (!result.success) {
                if (result.status === 'API_NOT_READY') {
                    window.terminal.log('⚠️ PGT API endpoints are not deployed yet', 'warning');
                    window.terminal.log('🎯 Your integration is ready but waiting for API to go live', 'info');
                    window.terminal.log('📧 Contact @playgroundtools for deployment status', 'info');
                } else {
                    window.terminal.log(`❌ Portfolio fetch failed: ${result.error}`, 'error');
                }
                return;
            }
            
            const data = result.data;
            
            window.terminal.log('', 'output');
            window.terminal.log('🎯 === PGT PORTFOLIO SUMMARY ===', 'success');
            window.terminal.log('', 'output');
            
            if (data.totalValue) {
                window.terminal.log(`💰 Total Portfolio Value: $${formatNumber(data.totalValue)}`, 'success');
            }
            
            if (data.totalChange24h) {
                const changeColor = data.totalChange24h >= 0 ? 'success' : 'error';
                const changeSymbol = data.totalChange24h >= 0 ? '+' : '';
                window.terminal.log(`📈 24h Change: ${changeSymbol}${data.totalChange24h.toFixed(2)}%`, changeColor);
            }
            
            if (data.walletCount) {
                window.terminal.log(`🔗 Tracked Wallets: ${data.walletCount}`, 'info');
            }
            
            if (data.networkBreakdown) {
                window.terminal.log('', 'output');
                window.terminal.log('🌐 Network Breakdown:', 'info');
                Object.entries(data.networkBreakdown).forEach(([network, value]) => {
                    window.terminal.log(`  ${network}: $${formatNumber(value)}`, 'output');
                });
            }
            
            if (data.topTokens) {
                window.terminal.log('', 'output');
                window.terminal.log('🏆 Top Holdings:', 'info');
                data.topTokens.slice(0, 5).forEach((token, index) => {
                    window.terminal.log(`  ${index + 1}. ${token.symbol}: $${formatNumber(token.value)} (${token.percentage}%)`, 'output');
                });
            }
            
            window.terminal.log('', 'output');
            window.terminal.log('💡 Use "pgt wallets" to see all tracked wallets', 'info');
            
        } catch (error) {
            window.terminal.log(`❌ Error fetching portfolio: ${error.message}`, 'error');
        }
    }
    
    async function getPGTWallets() {
        try {
            window.terminal.log('🔗 Fetching tracked wallets...', 'info');
            
            const result = await window.omegaPGT.getTrackedWallets();
            
            if (!result.success) {
                window.terminal.log(`❌ Wallets fetch failed: ${result.error}`, 'error');
                return;
            }
            
            const wallets = result.data?.wallets || [];
            
            if (wallets.length === 0) {
                window.terminal.log('📭 No wallets tracked yet', 'info');
                window.terminal.log('💡 Use "pgt add <address> <network>" to start tracking', 'info');
                return;
            }
            
            window.terminal.log('', 'output');
            window.terminal.log(`🔗 === TRACKED WALLETS (${wallets.length}) ===`, 'success');
            window.terminal.log('', 'output');
            
            wallets.forEach((wallet, index) => {
                window.terminal.log(`${index + 1}. 📝 ${wallet.label || 'Unnamed Wallet'}`, 'info');
                window.terminal.log(`   🔗 Address: ${wallet.address}`, 'output');
                window.terminal.log(`   🌐 Network: ${wallet.network}`, 'output');
                if (wallet.value) {
                    window.terminal.log(`   💰 Value: $${formatNumber(wallet.value)}`, 'success');
                }
                if (wallet.lastUpdated) {
                    window.terminal.log(`   ⏰ Updated: ${new Date(wallet.lastUpdated).toLocaleString()}`, 'output');
                }
                window.terminal.log('', 'output');
            });
            
            window.terminal.log('💡 Use "pgt wallet <address> <network>" for detailed info', 'info');
            
        } catch (error) {
            window.terminal.log(`❌ Error fetching wallets: ${error.message}`, 'error');
        }
    }
    
    async function addPGTWallet(address, network, label) {
        try {
            window.terminal.log(`🔗 Adding wallet to PGT tracking...`, 'info');
            window.terminal.log(`📍 Address: ${address}`, 'output');
            window.terminal.log(`🌐 Network: ${network}`, 'output');
            window.terminal.log(`📝 Label: ${label}`, 'output');
            
            const result = await window.omegaPGT.addWallet(address, network, label);
            
            if (!result.success) {
                window.terminal.log(`❌ Failed to add wallet: ${result.error}`, 'error');
                return;
            }
            
            window.terminal.log('✅ Wallet added successfully to PGT tracking!', 'success');
            window.terminal.log('💡 Use "pgt portfolio" to see updated portfolio', 'info');
            
        } catch (error) {
            window.terminal.log(`❌ Error adding wallet: ${error.message}`, 'error');
        }
    }
    
    async function removePGTWallet(address, network) {
        try {
            window.terminal.log(`🗑️ Removing wallet from PGT tracking...`, 'info');
            
            const result = await window.omegaPGT.removeWallet(address, network);
            
            if (!result.success) {
                window.terminal.log(`❌ Failed to remove wallet: ${result.error}`, 'error');
                return;
            }
            
            window.terminal.log('✅ Wallet removed successfully from PGT tracking!', 'success');
            
        } catch (error) {
            window.terminal.log(`❌ Error removing wallet: ${error.message}`, 'error');
        }
    }
    
    async function getPGTWalletData(address, network) {
        try {
            window.terminal.log('📊 Fetching wallet data from PGT...', 'info');
            
            const result = await window.omegaPGT.getWalletData(address, network);
            
            if (!result.success) {
                window.terminal.log(`❌ Wallet data fetch failed: ${result.error}`, 'error');
                return;
            }
            
            const wallet = result.data;
            
            window.terminal.log('', 'output');
            window.terminal.log('🔗 === WALLET DETAILS ===', 'success');
            window.terminal.log('', 'output');
            window.terminal.log(`📍 Address: ${wallet.address}`, 'output');
            window.terminal.log(`🌐 Network: ${wallet.network}`, 'output');
            window.terminal.log(`📝 Label: ${wallet.label || 'Unnamed'}`, 'output');
            
            if (wallet.totalValue) {
                window.terminal.log(`💰 Total Value: $${formatNumber(wallet.totalValue)}`, 'success');
            }
            
            if (wallet.tokens && wallet.tokens.length > 0) {
                window.terminal.log('', 'output');
                window.terminal.log('🪙 Token Holdings:', 'info');
                wallet.tokens.forEach((token, index) => {
                    window.terminal.log(`  ${index + 1}. ${token.symbol}: ${formatNumber(token.balance)} ($${formatNumber(token.value)})`, 'output');
                });
            }
            
            if (wallet.nfts && wallet.nfts.length > 0) {
                window.terminal.log('', 'output');
                window.terminal.log(`🖼️ NFTs: ${wallet.nfts.length} items`, 'info');
            }
            
        } catch (error) {
            window.terminal.log(`❌ Error fetching wallet data: ${error.message}`, 'error');
        }
    }
    
    async function checkPGTHealth() {
        try {
            window.terminal.log('🔧 Checking PGT API status...', 'info');
            
            const result = await window.omegaPGT.healthCheck();
            
            if (result.success) {
                window.terminal.log('✅ PGT API is healthy and responsive!', 'success');
                window.terminal.log(`🔑 API Key: ${window.omegaPGT.apiKey}`, 'output');
                window.terminal.log('🎯 Permissions: portfolio, wallet, add_wallet, remove_wallet', 'output');
                if (result.data?.version) {
                    window.terminal.log(`📦 API Version: ${result.data.version}`, 'output');
                }
            } else {
                if (result.status === 'API_NOT_READY') {
                    window.terminal.log('⚠️ PGT API endpoints are not live yet', 'warning');
                    window.terminal.log('🎯 Your API key is valid but endpoints are still being deployed', 'info');
                    window.terminal.log('📧 Contact: @playgroundtools for API status updates', 'info');
                } else {
                    window.terminal.log('❌ PGT API health check failed', 'error');
                    window.terminal.log(`Error: ${result.error}`, 'error');
                }
                
                window.terminal.log('', 'output');
                window.terminal.log('🔑 Integration Details:', 'info');
                window.terminal.log(`  API Key: ${window.omegaPGT.apiKey}`, 'output');
                window.terminal.log(`  Base URL: ${window.omegaPGT.baseUrl}`, 'output');
                window.terminal.log('  Status: Ready for when API goes live', 'output');
            }
            
        } catch (error) {
            window.terminal.log(`❌ Error checking PGT health: ${error.message}`, 'error');
        }
    }
    
    async function connectCurrentWallet() {
        try {
            if (!window.terminal.walletAddress) {
                window.terminal.log('❌ No wallet connected to Omega Terminal', 'error');
                window.terminal.log('💡 Use "connect" first to connect your wallet', 'info');
                return;
            }
            
            const address = window.terminal.walletAddress;
            const network = 'ethereum'; // Default to ethereum for MetaMask
            const label = `Omega Terminal Wallet (${address.substring(0, 8)}...)`;
            
            window.terminal.log(`🔗 Adding connected wallet to PGT tracking...`, 'info');
            
            await addPGTWallet(address, network, label);
            
        } catch (error) {
            window.terminal.log(`❌ Error connecting current wallet: ${error.message}`, 'error');
        }
    }
    
    // Helper function for number formatting
    function formatNumber(num) {
        if (!num) return '0';
        
        const number = parseFloat(num);
        
        if (number >= 1e9) {
            return (number / 1e9).toFixed(2) + 'B';
        } else if (number >= 1e6) {
            return (number / 1e6).toFixed(2) + 'M';
        } else if (number >= 1e3) {
            return (number / 1e3).toFixed(2) + 'K';
        } else if (number >= 1) {
            return number.toFixed(2);
        } else {
            return number.toFixed(6);
        }
    }
    
    // ===================================
    // INTEGRATE WITH TERMINAL COMMAND SYSTEM
    // ===================================
    
    function integratePGTWithTerminal() {
        if (window.terminal && window.terminal.executeCommand) {
            console.log('🎯 Integrating PGT commands with terminal...');
            
            const originalExecuteCommand = window.terminal.executeCommand;
            window.terminal.executeCommand = function(command) {
                const args = command.trim().split(/\s+/);
                
                if (args[0].toLowerCase() === 'pgt') {
                    handlePGTCommand(args.slice(1));
                    return;
                }
                
                return originalExecuteCommand.call(this, command);
            };
            
            console.log('✅ PGT commands integrated successfully!');
            return true;
        }
        return false;
    }
    
    // Try to integrate immediately, then poll if not ready
    if (!integratePGTWithTerminal()) {
        const integrationCheck = setInterval(() => {
            if (integratePGTWithTerminal()) {
                clearInterval(integrationCheck);
            }
        }, 500);
        
        // Stop trying after 10 seconds
        setTimeout(() => {
            clearInterval(integrationCheck);
        }, 10000);
    }
    
    console.log('✅ PGT Integration Plugin loaded successfully!');
    console.log('🎯 Use "pgt help" for available commands');
    
})();


