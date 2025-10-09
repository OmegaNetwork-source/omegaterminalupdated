/* ===================================
   PGT DIRECT INTEGRATION
   Bypass CORS by using PGT's existing web app data
   =================================== */

console.log('🎯 Loading PGT Direct Integration...');

(function() {
    
    class PGTDirectIntegration {
        constructor() {
            this.baseUrl = 'https://www.pgtools.tech/api';
            this.apiKey = 'pgt-partner-omega-terminal-2-25';
            this.isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        }
        
        // For localhost: Use embedded PGT widget approach
        async getWalletData(address, network) {
            console.log(`🔍 PGT Direct: Fetching ${address} on ${network}`);
            
            if (this.isLocalhost) {
                console.log('⚠️ Running on localhost - CORS will block direct API calls');
                console.log('💡 Using embedded PGT widget approach...');
                
                // Try to get data from embedded PGT iframe/widget
                return await this.getWalletViaWidget(address, network);
            } else {
                // In production, make direct API call
                return await this.getWalletViaAPI(address, network);
            }
        }
        
        async getWalletViaWidget(address, network) {
            // Since CORS blocks us, create a temporary PGT widget that loads with the wallet
            console.log('🔄 Creating PGT widget for wallet data...');
            
            // For localhost development, return demo data with clear indication
            // In production, this would embed actual PGT widget
            return {
                success: false,
                error: 'LOCALHOST_CORS_BLOCKED',
                message: 'CORS blocks localhost. Deploy to production or use demo mode.',
                data: null
            };
        }
        
        async getWalletViaAPI(address, network) {
            try {
                const response = await fetch(`${this.baseUrl}/wallet/${address}?network=${network}`, {
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    return await response.json();
                }
                
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
        
        async getPortfolio() {
            if (this.isLocalhost) {
                return {
                    success: false,
                    error: 'LOCALHOST_CORS_BLOCKED',
                    data: null
                };
            }
            
            try {
                const response = await fetch(`${this.baseUrl}/portfolio`, {
                    headers: {
                        'X-API-Key': this.apiKey
                    }
                });
                
                if (response.ok) {
                    return await response.json();
                }
                
                return {
                    success: false,
                    error: `HTTP ${response.status}`
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
        
        async healthCheck() {
            try {
                const response = await fetch(`${this.baseUrl}/health`, {
                    headers: {
                        'X-API-Key': this.apiKey
                    }
                });
                
                return await response.json();
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    status: 'CONNECTION_FAILED'
                };
            }
        }
    }
    
    // Only initialize if not already initialized by other scripts
    if (!window.omegaPGT || typeof window.omegaPGT.getWalletData !== 'function') {
        console.log('🔄 Initializing PGT Direct Integration...');
        window.omegaPGT = new PGTDirectIntegration();
        console.log('✅ PGT Direct Integration ready');
    } else {
        console.log('ℹ️ PGT already initialized by another script');
    }
    
})();

console.log('✅ PGT Direct Integration loaded');

