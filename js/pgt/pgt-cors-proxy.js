/* ===================================
   PGT CORS PROXY SOLUTION
   Handles CORS issues for local development
   =================================== */

console.log('🔄 Loading PGT CORS Proxy...');

(function() {
    
    class PGTCORSProxy {
        constructor() {
            this.apiKey = 'pgt-partner-omega-terminal-2-25';
            this.baseUrl = 'https://www.pgtools.tech/api';
            this.proxyUrls = [
                'https://cors-anywhere.herokuapp.com/',
                'https://api.allorigins.win/raw?url=',
                'https://thingproxy.freeboard.io/fetch/'
            ];
            this.currentProxyIndex = 0;
        }
        
        async makeRequest(endpoint, options = {}) {
            const url = `${this.baseUrl}${endpoint}`;
            
            // Try direct request first
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json',
                        ...options.headers
                    }
                });
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.log('Direct request failed, trying CORS proxy...');
            }
            
            // Try CORS proxies
            for (let i = 0; i < this.proxyUrls.length; i++) {
                try {
                    const proxyUrl = this.proxyUrls[this.currentProxyIndex];
                    const fullUrl = `${proxyUrl}${encodeURIComponent(url)}`;
                    
                    console.log(`Trying proxy ${this.currentProxyIndex + 1}/${this.proxyUrls.length}: ${proxyUrl}`);
                    
                    const response = await fetch(fullUrl, {
                        ...options,
                        headers: {
                            'X-API-Key': this.apiKey,
                            'Content-Type': 'application/json',
                            ...options.headers
                        }
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log(`✅ Proxy ${this.currentProxyIndex + 1} successful`);
                        return result;
                    }
                } catch (error) {
                    console.log(`❌ Proxy ${this.currentProxyIndex + 1} failed: ${error.message}`);
                }
                
                // Try next proxy
                this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyUrls.length;
            }
            
            throw new Error('All CORS proxies failed. Please try from a deployed environment.');
        }
        
        async addWallet(address, network, label) {
            // For localhost, check if local proxy is available
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // Try local proxy first
                try {
                    const proxyUrl = 'http://localhost:3003/wallet';
                    console.log(`🔄 Using local proxy: ${proxyUrl}`);
                    
                    const response = await fetch(proxyUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            address: address,
                            network: network,
                            label: label || `Omega Terminal - ${network}`
                        })
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Local proxy successful!', result);
                        return result;
                    }
                } catch (error) {
                    console.warn('⚠️ Local proxy not available:', error.message);
                }
                
                // If local proxy fails, return error
                return {
                    success: false,
                    error: 'Local proxy not running. Start it with: npm run pgt-proxy'
                };
            }
            
            try {
                const result = await this.makeRequest('/wallet/add', {
                    method: 'POST',
                    body: JSON.stringify({
                        address: address,
                        network: network,
                        label: label || `Omega Terminal - ${network}`
                    })
                });
                
                return result;
            } catch (error) {
                return {
                    success: false,
                    error: `CORS Error: ${error.message}. Try deploying to production.`
                };
            }
        }
        
        async getPortfolio() {
            // For localhost, use local proxy
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                try {
                    const proxyUrl = 'http://localhost:3003/portfolio';
                    console.log(`🔄 Using local proxy: ${proxyUrl}`);
                    
                    const response = await fetch(proxyUrl);
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Local proxy successful!', result);
                        return result;
                    }
                } catch (error) {
                    console.warn('⚠️ Local proxy not available:', error.message);
                    return {
                        success: false,
                        error: 'Local proxy not running. Start it with: npm run pgt-proxy'
                    };
                }
            }
            
            try {
                const result = await this.makeRequest('/portfolio');
                return result;
            } catch (error) {
                return {
                    success: false,
                    error: `CORS Error: ${error.message}. Try deploying to production.`
                };
            }
        }
        
        async getWallets() {
            try {
                const result = await this.makeRequest('/wallets');
                return result;
            } catch (error) {
                return {
                    success: false,
                    error: `CORS Error: ${error.message}. Try deploying to production.`
                };
            }
        }
        
        async removeWallet(address, network) {
            try {
                const result = await this.makeRequest('/wallet/remove', {
                    method: 'POST',
                    body: JSON.stringify({
                        address: address,
                        network: network
                    })
                });
                
                return result;
            } catch (error) {
                return {
                    success: false,
                    error: `CORS Error: ${error.message}. Try deploying to production.`
                };
            }
        }
        
        async getWallet(address, network) {
            try {
                const result = await this.makeRequest(`/wallet/${address}/${network}`);
                return result;
            } catch (error) {
                return {
                    success: false,
                    error: `CORS Error: ${error.message}. Try deploying to production.`
                };
            }
        }
        
        // Alias for getWallet - used by dashboard tracker
        async getWalletData(address, network) {
            console.log(`🔍 CORS Proxy: Getting wallet data for ${address} on ${network}`);
            return await this.getWallet(address, network);
        }
        
        async testConnection() {
            try {
                const result = await this.makeRequest('/health');
                return {
                    success: true,
                    message: 'PGT API connection successful (via CORS proxy)'
                };
            } catch (error) {
                return {
                    success: false,
                    message: `CORS Error: ${error.message}. This is expected on localhost.`
                };
            }
        }
    }
    
    // Replace the existing PGT integration with CORS-aware version
    if (window.omegaPGT) {
        console.log('🔄 Replacing PGT integration with CORS proxy...');
        window.omegaPGT = new PGTCORSProxy();
        console.log('✅ PGT CORS Proxy loaded');
    }
    
    // Also create a demo mode for local testing
    window.pgtDemoMode = {
        async addWallet(address, network, label) {
            return {
                success: true,
                data: {
                    address: address,
                    network: network,
                    label: label || `Demo - ${network}`,
                    message: 'Demo mode: Wallet would be tracked in production'
                }
            };
        },
        
        async getPortfolio() {
            return {
                success: true,
                data: {
                    totalValue: 125000.50,
                    walletCount: 2,
                    totalChange24hPercent: 2.35,
                    wallets: [
                        {
                            address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                            network: 'ethereum',
                            label: 'Demo ETH Wallet',
                            totalValue: 100000.00,
                            change24hPercent: 2.5
                        },
                        {
                            address: '0x1234567890abcdef1234567890abcdef12345678',
                            network: 'polygon',
                            label: 'Demo Polygon Wallet',
                            totalValue: 25000.50,
                            change24hPercent: 2.0
                        }
                    ]
                }
            };
        },
        
        async getWallets() {
            return {
                success: true,
                data: [
                    {
                        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                        network: 'ethereum',
                        label: 'Demo ETH Wallet'
                    },
                    {
                        address: '0x1234567890abcdef1234567890abcdef12345678',
                        network: 'polygon',
                        label: 'Demo Polygon Wallet'
                    }
                ]
            };
        },
        
        async testConnection() {
            return {
                success: true,
                message: 'PGT Demo Mode - CORS issues resolved for local testing'
            };
        }
    };
    
    // Add demo mode command
    window.handlePGTDemoCommand = function(args) {
        const subcommand = args[0]?.toLowerCase();
        
        switch (subcommand) {
            case 'demo':
                window.terminal.log('🎮 Switching to PGT Demo Mode', 'info');
                window.terminal.log('📊 This mode works around CORS issues for local testing', 'info');
                window.terminal.log('💡 Use: pgt-demo track <address> <network>', 'info');
                break;
                
            case 'track':
                if (args.length < 3) {
                    window.terminal.log('Usage: pgt-demo track <address> <network> [label]', 'error');
                    return;
                }
                handleDemoTrackWallet(args[1], args[2], args[3]);
                break;
                
            case 'portfolio':
                handleDemoPortfolio();
                break;
                
            case 'wallets':
                handleDemoWallets();
                break;
                
            case 'test':
                handleDemoTest();
                break;
                
            default:
                window.terminal.log('PGT Demo Commands:', 'info');
                window.terminal.log('  pgt-demo track <address> <network>', 'output');
                window.terminal.log('  pgt-demo portfolio', 'output');
                window.terminal.log('  pgt-demo wallets', 'output');
                window.terminal.log('  pgt-demo test', 'output');
        }
    };
    
    async function handleDemoTrackWallet(address, network, label) {
        try {
            window.terminal.log(`🎮 Demo Mode: Adding wallet...`, 'info');
            
            const result = await window.pgtDemoMode.addWallet(address, network, label);
            
            if (result.success) {
                window.terminal.log(`✅ Demo wallet tracked!`, 'success');
                window.terminal.log(`📍 Address: ${address}`, 'info');
                window.terminal.log(`🌐 Network: ${network}`, 'info');
                window.terminal.log(`💡 Note: This is demo mode - works around CORS issues`, 'info');
            }
        } catch (error) {
            window.terminal.log(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async function handleDemoPortfolio() {
        try {
            window.terminal.log(`📊 Demo Portfolio:`, 'info');
            
            const result = await window.pgtDemoMode.getPortfolio();
            
            if (result.success && result.data) {
                const { totalValue, walletCount, totalChange24hPercent, wallets } = result.data;
                
                window.terminal.log('', 'output');
                window.terminal.log('╔═══════════════════════════════════════╗', 'output');
                window.terminal.log('║        DEMO PORTFOLIO SUMMARY         ║', 'output');
                window.terminal.log('╚═══════════════════════════════════════╝', 'output');
                window.terminal.log('', 'output');
                
                window.terminal.log(`💰 Total Value: $${totalValue.toLocaleString()}`, 'success');
                window.terminal.log(`📈 24h Change: +${totalChange24hPercent}%`, 'success');
                window.terminal.log(`👛 Wallets: ${walletCount}`, 'info');
                window.terminal.log('', 'output');
                
                wallets.forEach((w, i) => {
                    window.terminal.log(`${i + 1}. ${w.label} (${w.network})`, 'output');
                    window.terminal.log(`   💰 Value: $${w.totalValue.toLocaleString()}`, 'info');
                    window.terminal.log(`   📈 24h: +${w.change24hPercent}%`, 'success');
                    window.terminal.log('', 'output');
                });
                
                window.terminal.log('💡 This is demo data - CORS issues resolved!', 'info');
            }
        } catch (error) {
            window.terminal.log(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async function handleDemoWallets() {
        try {
            const result = await window.pgtDemoMode.getWallets();
            
            if (result.success && result.data.length > 0) {
                window.terminal.log('Demo Tracked Wallets:', 'info');
                window.terminal.log('', 'output');
                
                result.data.forEach((w, i) => {
                    window.terminal.log(`${i + 1}. ${w.label}`, 'output');
                    window.terminal.log(`   🌐 Network: ${w.network}`, 'info');
                    window.terminal.log(`   📍 Address: ${w.address}`, 'info');
                    window.terminal.log('', 'output');
                });
                
                window.terminal.log('💡 Demo mode - works around CORS issues', 'info');
            }
        } catch (error) {
            window.terminal.log(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async function handleDemoTest() {
        try {
            const result = await window.pgtDemoMode.testConnection();
            
            if (result.success) {
                window.terminal.log(`✅ ${result.message}`, 'success');
                window.terminal.log(`🔑 API Key: ${window.omegaPGT.apiKey}`, 'info');
                window.terminal.log(`🌐 Base URL: ${window.omegaPGT.baseUrl}`, 'info');
                window.terminal.log(`💡 Demo mode bypasses CORS restrictions`, 'info');
            } else {
                window.terminal.log(`❌ ${result.message}`, 'error');
            }
        } catch (error) {
            window.terminal.log(`❌ Demo test failed: ${error.message}`, 'error');
        }
    }
    
    console.log('✅ PGT CORS Proxy loaded successfully!');
    console.log('💡 Use "pgt-demo" commands for local testing');
    
})();
