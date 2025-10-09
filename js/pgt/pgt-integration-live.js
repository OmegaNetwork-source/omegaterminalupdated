/* ===================================
   PGT INTEGRATION FOR OMEGA TERMINAL
   Real-time wallet tracking and portfolio data
   =================================== */

console.log('🎯 Loading PGT Integration...');

(function() {
    
    class PGTIntegration {
        constructor() {
            this.api = null;
            this.apiKey = 'pgt-partner-omega-terminal-2-25';
            this.ready = false;
            this.baseUrl = 'https://www.pgtools.tech/api';
            this.init();
        }
        
        init() {
            console.log('🎯 Initializing PGT Integration...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupPGT());
            } else {
                this.setupPGT();
            }
        }
        
        setupPGT() {
            // Ensure document.body exists
            if (!document.body) {
                console.error('❌ Document body not ready, retrying...');
                setTimeout(() => this.setupPGT(), 100);
                return;
            }
            
            console.log('🎯 Setting up PGT iframe...');
            
            // Create hidden iframe to load PGT
            const iframe = document.createElement('iframe');
            iframe.id = 'pgt-hidden-frame';
            iframe.src = 'https://www.pgtools.tech/';
            iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;opacity:0;pointer-events:none;';
            document.body.appendChild(iframe);
            
            // Wait for PGT to load
            iframe.onload = () => {
                console.log('🎯 PGT iframe loaded, waiting for API...');
                setTimeout(() => {
                    try {
                        this.api = iframe.contentWindow.pgtTerminalApi;
                        if (this.api) {
                            this.ready = true;
                            console.log('✅ PGT API Connected successfully!');
                            window.dispatchEvent(new Event('pgt-ready'));
                        } else {
                            console.log('⚠️ PGT API not found, trying HTTP fallback...');
                            this.setupHttpFallback();
                        }
                    } catch (error) {
                        console.error('❌ PGT API load error:', error);
                        this.setupHttpFallback();
                    }
                }, 3000);
            };
            
            // Fallback timeout
            setTimeout(() => {
                if (!this.ready) {
                    console.log('⚠️ PGT iframe timeout, using HTTP fallback...');
                    this.setupHttpFallback();
                }
            }, 10000);
        }
        
        setupHttpFallback() {
            console.log('🔄 Setting up HTTP API fallback...');
            this.ready = true; // Mark as ready for HTTP calls
            console.log('✅ PGT HTTP API fallback ready');
            window.dispatchEvent(new Event('pgt-ready'));
        }
        
        async addWallet(address, network, label) {
            if (!this.ready) throw new Error('PGT API not ready');
            
            if (this.api) {
                // Use browser API
                try {
                    return await this.api.addWallet(address, network, label || `Omega Terminal - ${network}`, this.apiKey);
                } catch (error) {
                    console.error('Browser API error:', error);
                    return await this.addWalletHttp(address, network, label);
                }
            } else {
                // Use HTTP API
                return await this.addWalletHttp(address, network, label);
            }
        }
        
        async addWalletHttp(address, network, label) {
            try {
                const response = await fetch(`${this.baseUrl}/wallet/add`, {
                    method: 'POST',
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        address: address,
                        network: network,
                        label: label || `Omega Terminal - ${network}`
                    })
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                return {
                    success: false,
                    error: `HTTP Error: ${error.message}`
                };
            }
        }
        
        async getPortfolio() {
            if (!this.ready) throw new Error('PGT API not ready');
            
            if (this.api) {
                // Use browser API
                try {
                    return await this.api.getPortfolio(this.apiKey);
                } catch (error) {
                    console.error('Browser API error:', error);
                    return await this.getPortfolioHttp();
                }
            } else {
                // Use HTTP API
                return await this.getPortfolioHttp();
            }
        }
        
        async getPortfolioHttp() {
            try {
                const response = await fetch(`${this.baseUrl}/portfolio`, {
                    headers: {
                        'X-API-Key': this.apiKey
                    }
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                return {
                    success: false,
                    error: `HTTP Error: ${error.message}`
                };
            }
        }
        
        async getWallets() {
            if (!this.ready) throw new Error('PGT API not ready');
            
            if (this.api) {
                // Use browser API
                try {
                    return await this.api.getTrackedWallets(this.apiKey);
                } catch (error) {
                    console.error('Browser API error:', error);
                    return await this.getWalletsHttp();
                }
            } else {
                // Use HTTP API
                return await this.getWalletsHttp();
            }
        }
        
        async getWalletsHttp() {
            try {
                const response = await fetch(`${this.baseUrl}/wallets`, {
                    headers: {
                        'X-API-Key': this.apiKey
                    }
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                return {
                    success: false,
                    error: `HTTP Error: ${error.message}`
                };
            }
        }
        
        async removeWallet(address, network) {
            if (!this.ready) throw new Error('PGT API not ready');
            
            if (this.api) {
                // Use browser API
                try {
                    return await this.api.removeWallet(address, network, this.apiKey);
                } catch (error) {
                    console.error('Browser API error:', error);
                    return await this.removeWalletHttp(address, network);
                }
            } else {
                // Use HTTP API
                return await this.removeWalletHttp(address, network);
            }
        }
        
        async removeWalletHttp(address, network) {
            try {
                const response = await fetch(`${this.baseUrl}/wallet/remove`, {
                    method: 'POST',
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        address: address,
                        network: network
                    })
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                return {
                    success: false,
                    error: `HTTP Error: ${error.message}`
                };
            }
        }
        
        async getWallet(address, network) {
            if (!this.ready) throw new Error('PGT API not ready');
            
            if (this.api) {
                // Use browser API
                try {
                    return await this.api.getWallet(address, network, this.apiKey);
                } catch (error) {
                    console.error('Browser API error:', error);
                    return await this.getWalletHttp(address, network);
                }
            } else {
                // Use HTTP API
                return await this.getWalletHttp(address, network);
            }
        }
        
        async getWalletHttp(address, network) {
            try {
                const response = await fetch(`${this.baseUrl}/wallet/${address}/${network}`, {
                    headers: {
                        'X-API-Key': this.apiKey
                    }
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                return {
                    success: false,
                    error: `HTTP Error: ${error.message}`
                };
            }
        }
        
        // Alias for compatibility with dashboard tracker
        async getWalletData(address, network) {
            console.log(`📊 PGT Live: Getting wallet data for ${address} on ${network}`);
            return await this.getWallet(address, network);
        }
        
        async testConnection() {
            try {
                // Simple HTTP test to verify API is accessible
                const response = await fetch(`${this.baseUrl}/health`, {
                    headers: {
                        'X-API-Key': this.apiKey
                    }
                });
                
                if (response.ok) {
                    return {
                        success: true,
                        message: 'PGT API connection successful'
                    };
                } else {
                    return {
                        success: false,
                        message: `API returned status: ${response.status}`
                    };
                }
            } catch (error) {
                return {
                    success: false,
                    message: `Connection test failed: ${error.message}`
                };
            }
        }
    }
    
    // Initialize global PGT integration
    window.omegaPGT = new PGTIntegration();
    
    // ===================================
    // PGT TERMINAL COMMANDS
    // ===================================
    
    window.handlePGTCommand = function handlePGTCommand(args) {
        const subcommand = args[0]?.toLowerCase();
        
        switch (subcommand) {
            case 'track':
            case 'add':
                if (args.length < 3) {
                    window.terminal.log('Usage: pgt track <address> <network> [label]', 'error');
                    window.terminal.log('Example: pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum', 'info');
                    return;
                }
                handleTrackWallet(args[1], args[2], args[3]);
                break;
                
            case 'portfolio':
            case 'pf':
                handleGetPortfolio();
                break;
                
            case 'wallets':
            case 'list':
                handleGetWallets();
                break;
                
            case 'remove':
            case 'untrack':
                if (args.length < 3) {
                    window.terminal.log('Usage: pgt remove <address> <network>', 'error');
                    return;
                }
                handleRemoveWallet(args[1], args[2]);
                break;
                
            case 'wallet':
                if (args.length < 3) {
                    window.terminal.log('Usage: pgt wallet <address> <network>', 'error');
                    return;
                }
                handleGetWallet(args[1], args[2]);
                break;
                
            case 'test':
            case 'status':
                handleTestConnection();
                break;
                
            case 'help':
                showPGTHelp();
                break;
                
            default:
                window.terminal.log('Unknown PGT command. Type: pgt help', 'error');
        }
    };
    
    async function handleTrackWallet(address, network, label) {
        try {
            window.terminal.log(`🎯 Adding wallet to PGT tracking...`, 'info');
            
            const result = await window.omegaPGT.addWallet(address, network, label);
            
            if (result.success) {
                window.terminal.log(`✅ Wallet tracked successfully!`, 'success');
                window.terminal.log(`📍 Address: ${address}`, 'info');
                window.terminal.log(`🌐 Network: ${network}`, 'info');
                if (label) window.terminal.log(`🏷️ Label: ${label}`, 'info');
                
                // Try to get wallet data
                setTimeout(async () => {
                    try {
                        const walletData = await window.omegaPGT.getWallet(address, network);
                        if (walletData.success && walletData.data) {
                            const value = walletData.data.totalValue || 0;
                            window.terminal.log(`💰 Current Value: $${value.toLocaleString()}`, 'success');
                        }
                    } catch (error) {
                        // Ignore wallet data fetch errors
                    }
                }, 2000);
            } else {
                window.terminal.log(`❌ Error: ${result.error}`, 'error');
                
                // If CORS error, suggest demo mode
                if (result.error.includes('CORS') || result.error.includes('localhost')) {
                    window.terminal.log('', 'output');
                    window.terminal.log('💡 CORS Issue Detected:', 'info');
                    window.terminal.log('   • Use "pgt-demo track" for local testing', 'info');
                    window.terminal.log('   • Deploy to production for real API access', 'info');
                    window.terminal.log('   • Demo mode works around CORS restrictions', 'info');
                }
            }
        } catch (error) {
            window.terminal.log(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async function handleGetPortfolio() {
        try {
            window.terminal.log(`📊 Fetching portfolio data...`, 'info');
            
            const result = await window.omegaPGT.getPortfolio();
            
            if (result.success && result.data) {
                const { totalValue, walletCount, totalChange24hPercent, wallets } = result.data;
                
                window.terminal.log('', 'output');
                window.terminal.log('╔═══════════════════════════════════════╗', 'output');
                window.terminal.log('║        PGT PORTFOLIO SUMMARY          ║', 'output');
                window.terminal.log('╚═══════════════════════════════════════╝', 'output');
                window.terminal.log('', 'output');
                
                window.terminal.log(`💰 Total Value: $${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 'success');
                
                if (totalChange24hPercent !== undefined) {
                    const changeColor = totalChange24hPercent >= 0 ? 'success' : 'error';
                    const changeSymbol = totalChange24hPercent >= 0 ? '+' : '';
                    window.terminal.log(`📈 24h Change: ${changeSymbol}${totalChange24hPercent.toFixed(2)}%`, changeColor);
                }
                
                window.terminal.log(`👛 Wallets: ${walletCount}`, 'info');
                window.terminal.log('', 'output');
                
                if (wallets && wallets.length > 0) {
                    window.terminal.log('Tracked Wallets:', 'info');
                    wallets.forEach((w, i) => {
                        window.terminal.log(`${i + 1}. ${w.label || w.address.slice(0, 10) + '...'} (${w.network})`, 'output');
                        window.terminal.log(`   💰 Value: $${(w.totalValue || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}`, 'info');
                        
                        if (w.change24hPercent !== undefined) {
                            const changeColor = w.change24hPercent >= 0 ? 'success' : 'error';
                            const changeSymbol = w.change24hPercent >= 0 ? '+' : '';
                            window.terminal.log(`   📈 24h: ${changeSymbol}${w.change24hPercent.toFixed(2)}%`, changeColor);
                        }
                        window.terminal.log('', 'output');
                    });
                }
            } else {
                window.terminal.log(`❌ Error: ${result.error || 'Failed to fetch portfolio'}`, 'error');
            }
        } catch (error) {
            window.terminal.log(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async function handleGetWallets() {
        try {
            window.terminal.log(`📋 Fetching tracked wallets...`, 'info');
            
            const result = await window.omegaPGT.getWallets();
            
            if (result.success && result.data && result.data.length > 0) {
                window.terminal.log('Tracked Wallets:', 'info');
                window.terminal.log('', 'output');
                
                result.data.forEach((w, i) => {
                    window.terminal.log(`${i + 1}. ${w.label || w.address}`, 'output');
                    window.terminal.log(`   🌐 Network: ${w.network}`, 'info');
                    window.terminal.log(`   📍 Address: ${w.address}`, 'info');
                    window.terminal.log('', 'output');
                });
            } else {
                window.terminal.log('No wallets tracked yet.', 'info');
                window.terminal.log('Use: pgt track <address> <network>', 'info');
            }
        } catch (error) {
            window.terminal.log(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async function handleRemoveWallet(address, network) {
        try {
            window.terminal.log(`🗑️ Removing wallet from tracking...`, 'info');
            
            const result = await window.omegaPGT.removeWallet(address, network);
            
            if (result.success) {
                window.terminal.log(`✅ Wallet removed: ${address}`, 'success');
            } else {
                window.terminal.log(`❌ Error: ${result.error}`, 'error');
            }
        } catch (error) {
            window.terminal.log(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async function handleGetWallet(address, network) {
        try {
            window.terminal.log(`🔍 Fetching wallet data...`, 'info');
            
            const result = await window.omegaPGT.getWallet(address, network);
            
            if (result.success && result.data) {
                const wallet = result.data;
                window.terminal.log(`📍 Wallet: ${wallet.address}`, 'info');
                window.terminal.log(`🌐 Network: ${wallet.network}`, 'info');
                window.terminal.log(`💰 Value: $${(wallet.totalValue || 0).toLocaleString()}`, 'success');
                
                if (wallet.change24hPercent !== undefined) {
                    const changeColor = wallet.change24hPercent >= 0 ? 'success' : 'error';
                    const changeSymbol = wallet.change24hPercent >= 0 ? '+' : '';
                    window.terminal.log(`📈 24h Change: ${changeSymbol}${wallet.change24hPercent.toFixed(2)}%`, changeColor);
                }
                
                if (wallet.tokens && wallet.tokens.length > 0) {
                    window.terminal.log('', 'output');
                    window.terminal.log('Tokens:', 'info');
                    wallet.tokens.forEach(token => {
                        window.terminal.log(`  ${token.symbol}: ${token.balance} ($${token.value.toLocaleString()})`, 'output');
                    });
                }
            } else {
                window.terminal.log(`❌ Error: ${result.error || 'Wallet not found'}`, 'error');
            }
        } catch (error) {
            window.terminal.log(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async function handleTestConnection() {
        try {
            window.terminal.log(`🧪 Testing PGT API connection...`, 'info');
            
            const result = await window.omegaPGT.testConnection();
            
            if (result.success) {
                window.terminal.log(`✅ ${result.message}`, 'success');
                window.terminal.log(`🔑 API Key: ${window.omegaPGT.apiKey}`, 'info');
                window.terminal.log(`🌐 Base URL: ${window.omegaPGT.baseUrl}`, 'info');
            } else {
                window.terminal.log(`❌ ${result.message}`, 'error');
            }
        } catch (error) {
            window.terminal.log(`❌ Connection test failed: ${error.message}`, 'error');
        }
    }
    
    function showPGTHelp() {
        window.terminal.log('🎯 PGT Wallet Tracking Commands:', 'info');
        window.terminal.log('', 'output');
        window.terminal.log('  pgt track <address> <network> [label]  - Track a new wallet', 'output');
        window.terminal.log('  pgt portfolio                          - Show portfolio summary', 'output');
        window.terminal.log('  pgt wallets                             - List tracked wallets', 'output');
        window.terminal.log('  pgt wallet <address> <network>         - Get wallet details', 'output');
        window.terminal.log('  pgt remove <address> <network>         - Remove wallet', 'output');
        window.terminal.log('  pgt test                                - Test API connection', 'output');
        window.terminal.log('  pgt help                                - Show this help', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('Examples:', 'info');
        window.terminal.log('  pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum', 'output');
        window.terminal.log('  pgt track 0x123... polygon "My Polygon Wallet"', 'output');
        window.terminal.log('  pgt portfolio', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('Supported Networks:', 'info');
        window.terminal.log('  ethereum, polygon, bsc, arbitrum, optimism, base, solana', 'output');
    }
    
    // ===================================
    // INTEGRATE WITH MAIN TERMINAL
    // ===================================
    
    function integratePGT() {
        if (window.terminal && window.terminal.executeCommand) {
            console.log('🎯 Integrating PGT with main terminal...');
            
            const originalExecuteCommand = window.terminal.executeCommand;
            window.terminal.executeCommand = function(command) {
                const args = command.trim().split(/\s+/);
                const cmd = args[0].toLowerCase();
                
                if (cmd === 'pgt') {
                    handlePGTCommand(args.slice(1));
                    return;
                }
                
                return originalExecuteCommand.call(this, command);
            };
            
            console.log('✅ PGT integration successful!');
            return true;
        }
        return false;
    }
    
    // Try to integrate when DOM is ready
    function tryIntegratePGT() {
        if (!integratePGT()) {
            // If terminal not ready, wait and try again
            setTimeout(tryIntegratePGT, 500);
        }
    }
    
    // Start integration attempts
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryIntegratePGT);
    } else {
        tryIntegratePGT();
    }
    
    // Listen for PGT ready event
    window.addEventListener('pgt-ready', () => {
        console.log('🎯 PGT ready - commands available');
        window.terminal.log('🎯 PGT wallet tracking ready!', 'success');
        window.terminal.log('💡 Use "pgt help" to see available commands', 'info');
    });
    
    console.log('✅ PGT Integration loaded successfully!');
    console.log('🎯 Use "pgt help" to see available commands');
    
})();
