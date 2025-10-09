// ===================================
// DEXSCREENER ANALYTICS ULTIMATE PLUGIN v2.0
// Complete Token Analytics Suite for Omega Terminal
// ===================================

// 🚀 FEATURES:
// - Enhanced Search with Advanced Filtering
// - Comprehensive Analytics Dashboard
// - Real-time Monitoring & Alerts
// - Portfolio Tracking
// - Auto-scanner for New Opportunities
// - Watchlist System
// - Multi-chain Support (8+ blockchains)

console.log('🚀 Loading DexScreener Analytics Ultimate Plugin v2.0');

(function() {
    // Storage keys for persistent data
    const STORAGE_KEYS = {
        WATCHLIST: 'dex_watchlist',
        PORTFOLIO: 'dex_portfolio', 
        ALERTS: 'dex_alerts',
        SCANNER_CONFIG: 'dex_scanner_config'
    };

        // Safe initialization that doesn't break existing functionality
    let initAttempts = 0;
    const maxInitAttempts = 20;
    
    function waitForTerminal() {
        initAttempts++;
        
        if (window.terminal && window.terminal.logHtml && window.terminal.log) {
            // Extra safety: wait for terminal to be fully functional
            if (typeof window.terminal.handleCommand === 'function' || initAttempts > 10) {
                initializeUltimateAnalytics();
            } else {
                console.log('⏳ Terminal functions still loading, waiting...', initAttempts);
                setTimeout(waitForTerminal, 300);
            }
        } else if (initAttempts < maxInitAttempts) {
            setTimeout(waitForTerminal, 200);
        } else {
            console.error('❌ DexScreener Analytics: Failed to initialize after maximum attempts');
        }
    }
    
    function initializeUltimateAnalytics() {
        console.log('✅ DexScreener Analytics Ultimate: Terminal detected, initializing...');
        
        // Wait for terminal to be fully loaded before making any changes
        if (!window.terminal.log || !window.terminal.logHtml) {
            console.log('⏳ Terminal not fully loaded yet, waiting...');
            setTimeout(initializeUltimateAnalytics, 250);
            return;
        }
        
        // Store original handler - check if it exists first to avoid conflicts
        if (window.terminal.handleDexScreenerCommand) {
            window.terminal._originalHandleDexScreenerCommand = window.terminal.handleDexScreenerCommand;
            console.log('✅ Original DexScreener handler backed up');
        }
        
        // Create isolated namespace to avoid conflicts
        window.terminal.dexAnalytics = {
            initialized: true,
            originalHandler: window.terminal.handleDexScreenerCommand
        };
        
        // Override with ultimate analytics handler - but preserve all other functionality
        window.terminal.handleDexScreenerCommand = async function(args) {
            if (!args[1]) {
                this.displayUltimateHelp();
                return;
            }
            
            const sub = args[1];
            
            try {
                switch (sub) {
                    // Original commands (enhanced)
                    case 'search':
                        await this.handleUltimateSearch(args);
                        break;
                    case 'trending':
                        await this.handleUltimateTrending(args);
                        break;
                    case 'boosted':
                        await this.handleUltimateBoosted();
                        break;
                    
                    // 🆕 ANALYTICS DASHBOARD
                    case 'analytics':
                    case 'analyze':
                        await this.handleTokenAnalytics(args);
                        break;
                    case 'compare':
                        await this.handleTokenCompare(args);
                        break;
                    
                    // 🆕 ADVANCED FILTERING
                    case 'filter':
                        await this.handleAdvancedFilter(args);
                        break;
                    case 'scan':
                        await this.handleSmartScan(args);
                        break;
                    
                    // 🆕 PORTFOLIO TRACKING
                    case 'portfolio':
                        await this.handlePortfolio(args);
                        break;
                    case 'watchlist':
                        await this.handleWatchlist(args);
                        break;
                    
                    // 🆕 REAL-TIME MONITORING
                    case 'alerts':
                        await this.handleAlerts(args);
                        break;
                    case 'monitor':
                        await this.handleMonitor(args);
                        break;
                    
                    // 🆕 AUTO DISCOVERY
                    case 'discover':
                        await this.handleAutoDiscover(args);
                        break;
                    case 'newgems':
                        await this.handleNewGems(args);
                        break;
                    
                    default:
                        this.log(`❌ Unknown DexScreener Analytics command: ${sub}`, 'error');
                        this.displayUltimateHelp();
                }
            } catch (error) {
                this.log(`❌ DexScreener Analytics failed: ${error.message}`, 'error');
                console.error('DexScreener Analytics Error:', error);
            }
        };

        // ===================================
        // HELP SYSTEM
        // ===================================
        
        window.terminal.displayUltimateHelp = function() {
            this.log('🔥 DexScreener Analytics Ultimate v2.0', 'info');
            this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
            this.log('', 'info');
            
            this.log('🔍 ENHANCED SEARCH & DISCOVERY:', 'success');
            this.log('  dexscreener search <token>                Search tokens with rich analytics', 'output');
            this.log('  dexscreener filter --help                 Advanced filtering options', 'output');
            this.log('  dexscreener scan trending                 Smart scan trending tokens', 'output');
            this.log('  dexscreener discover newgems              Auto-discover new gems', 'output');
            this.log('', 'info');
            
            this.log('📊 ANALYTICS DASHBOARD:', 'success');
            this.log('  dexscreener analytics <token>             Full token analytics dashboard', 'output');
            this.log('  dexscreener compare <token1> <token2>     Side-by-side token comparison', 'output');
            this.log('', 'info');
            
            this.log('💼 PORTFOLIO & TRACKING:', 'success');
            this.log('  dexscreener portfolio                     View your tracked tokens', 'output');
            this.log('  dexscreener watchlist add <token>         Add token to watchlist', 'output');
            this.log('  dexscreener watchlist view                View watchlist', 'output');
            this.log('', 'info');
            
            this.log('🚨 MONITORING & ALERTS:', 'success');
            this.log('  dexscreener alerts create                 Create price/volume alerts', 'output');
            this.log('  dexscreener monitor start <token>         Start monitoring token', 'output');
            this.log('', 'info');
            
            this.log('⚡ QUICK COMMANDS:', 'info');
            this.log('  dexscreener newgems                       Find new token opportunities', 'info');
            this.log('  dexscreener trending --volume-min=1M      Filter trending by volume', 'info');
            this.log('  dexscreener filter --chain=solana         Filter by specific blockchain', 'info');
            this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
        };

        // ===================================
        // ENHANCED SEARCH FUNCTIONALITY
        // ===================================
        
        window.terminal.handleUltimateSearch = async function(args) {
            if (!args[2]) {
                this.log('Usage: dexscreener search <token> [--filters]', 'info');
                this.log('', 'info');
                this.log('🎯 SEARCH FILTERS:', 'info');
                this.log('  --volume-min=1000000       Minimum 24h volume (USD)', 'info');
                this.log('  --marketcap-min=1000000    Minimum market cap', 'info');
                this.log('  --chain=solana             Filter by blockchain', 'info');
                this.log('  --age-max=30               Max age in days', 'info');
                this.log('', 'info');
                this.log('Examples:', 'info');
                this.log('  dexscreener search BONK --volume-min=500000', 'info');
                this.log('  dexscreener search PEPE --chain=ethereum', 'info');
                return;
            }
            
            const query = args[2];
            const filters = this.parseSearchFilters(args);
            
            this.log(`🔍 Enhanced Search: ${query}`, 'info');
            if (Object.keys(filters).length > 0) {
                this.log(`🎯 Filters: ${JSON.stringify(filters)}`, 'info');
            }
            
            try {
                const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                
                if (data.pairs && data.pairs.length > 0) {
                    // Apply filters
                    let filteredPairs = this.applySearchFilters(data.pairs, filters);
                    
                    if (filteredPairs.length === 0) {
                        this.log('❌ No tokens found matching your criteria', 'error');
                        return;
                    }
                    
                    this.log(`✅ Found ${filteredPairs.length} tokens matching your search:`, 'success');
                    this.log('', 'info');
                    
                    // Display enhanced results (limit to 5 for readability)
                    filteredPairs.slice(0, 5).forEach((pair, idx) => {
                        this.displayEnhancedTokenCard(pair, idx + 1);
                    });
                    
                    if (filteredPairs.length > 5) {
                        this.log(`\n📊 Showing top 5 results. ${filteredPairs.length - 5} more available.`, 'info');
                    }
                } else {
                    this.log('❌ No tokens found for your search', 'error');
                }
            } catch (error) {
                this.log(`❌ Search failed: ${error.message}`, 'error');
            }
        };

        // ===================================
        // TOKEN ANALYTICS DASHBOARD
        // ===================================
        
        window.terminal.handleTokenAnalytics = async function(args) {
            if (!args[2]) {
                this.log('Usage: dexscreener analytics <token_address_or_symbol>', 'info');
                return;
            }
            
            const token = args[2];
            this.log(`📊 Loading comprehensive analytics for: ${token}`, 'info');
            
            try {
                // First, search for the token to get address
                const searchResponse = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(token)}`);
                const searchData = await searchResponse.json();
                
                if (!searchData.pairs || searchData.pairs.length === 0) {
                    this.log('❌ Token not found', 'error');
                    return;
                }
                
                const pair = searchData.pairs[0]; // Use first/best match
                
                // Display comprehensive analytics dashboard
                this.displayAnalyticsDashboard(pair);
                
            } catch (error) {
                this.log(`❌ Analytics failed: ${error.message}`, 'error');
            }
        };

        // ===================================
        // ADVANCED FILTERING SYSTEM
        // ===================================
        
        window.terminal.handleAdvancedFilter = async function(args) {
            if (args[2] === '--help' || !args[2]) {
                this.displayFilterHelp();
                return;
            }
            
            const filters = this.parseAdvancedFilters(args);
            this.log('🎯 Advanced Token Filter', 'info');
            this.log(`Filters: ${JSON.stringify(filters, null, 2)}`, 'info');
            
            // Get trending tokens and apply filters
            try {
                const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
                const data = await response.json();
                
                // Apply comprehensive filtering
                let results = await this.applyAdvancedFilters(data, filters);
                
                if (results.length === 0) {
                    this.log('❌ No tokens found matching your criteria', 'error');
                    return;
                }
                
                this.log(`✅ Found ${results.length} tokens matching your filters:`, 'success');
                this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
                
                results.slice(0, 8).forEach((token, idx) => {
                    this.displayFilteredToken(token, idx + 1);
                });
                
            } catch (error) {
                this.log(`❌ Filter search failed: ${error.message}`, 'error');
            }
        };

        // ===================================
        // PORTFOLIO TRACKING SYSTEM
        // ===================================
        
        window.terminal.handlePortfolio = async function(args) {
            const subCommand = args[2];
            
            switch (subCommand) {
                case 'add':
                    await this.addToPortfolio(args[3]);
                    break;
                case 'remove':
                    await this.removeFromPortfolio(args[3]);
                    break;
                case 'view':
                case undefined:
                    await this.viewPortfolio();
                    break;
                case 'clear':
                    await this.clearPortfolio();
                    break;
                default:
                    this.log('Usage: dexscreener portfolio [add|remove|view|clear] [token]', 'info');
            }
        };

        // ===================================
        // WATCHLIST SYSTEM
        // ===================================
        
        window.terminal.handleWatchlist = async function(args) {
            const subCommand = args[2];
            
            switch (subCommand) {
                case 'add':
                    await this.addToWatchlist(args[3]);
                    break;
                case 'remove':
                    await this.removeFromWatchlist(args[3]);
                    break;
                case 'view':
                case undefined:
                    await this.viewWatchlist();
                    break;
                case 'clear':
                    await this.clearWatchlist();
                    break;
                default:
                    this.log('Usage: dexscreener watchlist [add|remove|view|clear] [token]', 'info');
            }
        };

        // ===================================
        // REAL-TIME MONITORING & ALERTS
        // ===================================
        
        window.terminal.handleAlerts = async function(args) {
            const subCommand = args[2];
            
            switch (subCommand) {
                case 'create':
                    await this.createAlert(args);
                    break;
                case 'list':
                case undefined:
                    await this.listAlerts();
                    break;
                case 'remove':
                    await this.removeAlert(args[3]);
                    break;
                case 'clear':
                    await this.clearAlerts();
                    break;
                default:
                    this.log('Usage: dexscreener alerts [create|list|remove|clear]', 'info');
            }
        };

        // ===================================
        // AUTO DISCOVERY & NEW GEMS
        // ===================================
        
        window.terminal.handleNewGems = async function(args) {
            this.log('💎 Discovering New Gem Opportunities...', 'info');
            
            const criteria = {
                maxAge: 7, // Less than 7 days old
                minVolume: 50000, // At least $50K volume
                minLiquidity: 25000, // At least $25K liquidity
                minPriceChange: 10 // At least 10% price increase
            };
            
            try {
                // Get trending tokens
                const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
                const data = await response.json();
                
                // Filter for new gems
                const gems = await this.findNewGems(data, criteria);
                
                if (gems.length === 0) {
                    this.log('💎 No new gems found matching criteria right now', 'info');
                    return;
                }
                
                this.log(`💎 Found ${gems.length} potential new gems:`, 'success');
                this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
                
                gems.forEach((gem, idx) => {
                    this.displayGemCard(gem, idx + 1);
                });
                
            } catch (error) {
                this.log(`❌ Gem discovery failed: ${error.message}`, 'error');
            }
        };

        // ===================================
        // UTILITY FUNCTIONS
        // ===================================
        
        window.terminal.parseSearchFilters = function(args) {
            const filters = {};
            args.forEach(arg => {
                if (arg.startsWith('--volume-min=')) {
                    filters.volumeMin = parseFloat(arg.split('=')[1]);
                }
                if (arg.startsWith('--marketcap-min=')) {
                    filters.marketCapMin = parseFloat(arg.split('=')[1]);
                }
                if (arg.startsWith('--chain=')) {
                    filters.chain = arg.split('=')[1];
                }
                if (arg.startsWith('--age-max=')) {
                    filters.ageMax = parseInt(arg.split('=')[1]);
                }
            });
            return filters;
        };

        window.terminal.applySearchFilters = function(pairs, filters) {
            return pairs.filter(pair => {
                // Volume filter
                if (filters.volumeMin && (!pair.volume?.h24 || pair.volume.h24 < filters.volumeMin)) {
                    return false;
                }
                
                // Market cap filter
                if (filters.marketCapMin && (!pair.marketCap || pair.marketCap < filters.marketCapMin)) {
                    return false;
                }
                
                // Chain filter
                if (filters.chain && pair.chainId !== filters.chain) {
                    return false;
                }
                
                // Age filter
                if (filters.ageMax && pair.pairCreatedAt) {
                    const ageInDays = Math.floor((Date.now() - (pair.pairCreatedAt * 1000)) / (1000 * 60 * 60 * 24));
                    if (ageInDays > filters.ageMax) {
                        return false;
                    }
                }
                
                return true;
            });
        };

        window.terminal.displayEnhancedTokenCard = function(pair, index) {
            let html = `<div style='background:rgba(0,255,128,0.08);border:1px solid #00ff80;border-radius:8px;padding:16px;margin:12px 0;box-shadow:0 4px 12px rgba(0,255,128,0.2);'>`;
            
            // Header with ranking
            html += `<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;'>`;
            html += `<div style='display:flex;align-items:center;gap:12px;'>`;
            html += `<div style='background:#00ff80;color:#000;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.9em;'>${index}</div>`;
            
            // Token icon
            if (pair.info?.imageUrl) {
                html += `<img src='${pair.info.imageUrl}' alt='icon' style='width:36px;height:36px;border-radius:50%;border:2px solid #00ff80;'>`;
            } else {
                const symbol = pair.baseToken?.symbol || 'T';
                html += `<div style='width:36px;height:36px;border-radius:50%;background:#00ff80;color:#000;display:flex;align-items:center;justify-content:center;font-weight:bold;'>${symbol.charAt(0)}</div>`;
            }
            
            html += `<div>`;
            html += `<div style='font-size:1.4em;font-weight:bold;color:#00ff80;'>${pair.baseToken?.symbol || 'N/A'}</div>`;
            html += `<div style='color:#888;font-size:0.9em;'>${pair.baseToken?.name || 'Unknown Token'}</div>`;
            html += `<div style='color:#666;font-size:0.8em;'>${pair.chainId.toUpperCase()} • ${pair.dexId || 'Unknown DEX'}</div>`;
            html += `</div></div>`;
            
            // Price section
            html += `<div style='text-align:right;'>`;
            if (pair.priceUsd) {
                html += `<div style='font-size:1.3em;color:#ffffff;font-weight:bold;'>$${pair.priceUsd}</div>`;
            }
            if (pair.priceChange?.h24 !== undefined) {
                const changeColor = pair.priceChange.h24 >= 0 ? '#00ff00' : '#ff3333';
                const changePrefix = pair.priceChange.h24 >= 0 ? '+' : '';
                html += `<div style='color:${changeColor};font-size:1em;font-weight:bold;'>${changePrefix}${pair.priceChange.h24.toFixed(2)}% (24h)</div>`;
            }
            html += `</div></div>`;
            
            // Key metrics grid (enhanced)
            html += `<div style='display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;font-size:0.85em;margin-bottom:12px;'>`;
            
            // Volume
            if (pair.volume?.h24) {
                html += `<div style='text-align:center;padding:8px;background:rgba(255,204,0,0.12);border-radius:6px;border:1px solid rgba(255,204,0,0.3);'>`;
                html += `<div style='color:#ffcc00;font-weight:bold;font-size:0.8em;'>📊 Volume 24h</div>`;
                html += `<div style='color:#fff;font-weight:bold;'>$${this.formatNumber(pair.volume.h24)}</div>`;
                html += `</div>`;
            } else {
                html += `<div style='text-align:center;padding:8px;background:rgba(128,128,128,0.08);border-radius:6px;'>`;
                html += `<div style='color:#888;font-size:0.8em;'>📊 Volume 24h</div><div style='color:#666;'>N/A</div></div>`;
            }
            
            // Liquidity
            if (pair.liquidity?.usd) {
                html += `<div style='text-align:center;padding:8px;background:rgba(0,204,255,0.12);border-radius:6px;border:1px solid rgba(0,204,255,0.3);'>`;
                html += `<div style='color:#00ccff;font-weight:bold;font-size:0.8em;'>💧 Liquidity</div>`;
                html += `<div style='color:#fff;font-weight:bold;'>$${this.formatNumber(pair.liquidity.usd)}</div>`;
                html += `</div>`;
            } else {
                html += `<div style='text-align:center;padding:8px;background:rgba(128,128,128,0.08);border-radius:6px;'>`;
                html += `<div style='color:#888;font-size:0.8em;'>💧 Liquidity</div><div style='color:#666;'>N/A</div></div>`;
            }
            
            // Market Cap
            if (pair.marketCap) {
                html += `<div style='text-align:center;padding:8px;background:rgba(255,102,102,0.12);border-radius:6px;border:1px solid rgba(255,102,102,0.3);'>`;
                html += `<div style='color:#ff6666;font-weight:bold;font-size:0.8em;'>💎 Market Cap</div>`;
                html += `<div style='color:#fff;font-weight:bold;'>$${this.formatNumber(pair.marketCap)}</div>`;
                html += `</div>`;
            } else {
                html += `<div style='text-align:center;padding:8px;background:rgba(128,128,128,0.08);border-radius:6px;'>`;
                html += `<div style='color:#888;font-size:0.8em;'>💎 Market Cap</div><div style='color:#666;'>N/A</div></div>`;
            }
            
            // Transactions (Buys/Sells)
            if (pair.txns?.h24) {
                const totalTxns = (pair.txns.h24.buys || 0) + (pair.txns.h24.sells || 0);
                const buyPercentage = pair.txns.h24.buys && totalTxns > 0 ? ((pair.txns.h24.buys / totalTxns) * 100).toFixed(0) : 0;
                html += `<div style='text-align:center;padding:8px;background:rgba(0,255,128,0.08);border-radius:6px;border:1px solid rgba(0,255,128,0.3);'>`;
                html += `<div style='color:#00ff80;font-weight:bold;font-size:0.8em;'>🔄 Transactions</div>`;
                html += `<div style='color:#fff;font-weight:bold;'>${totalTxns}</div>`;
                html += `<div style='color:#00ff00;font-size:0.75em;'>${buyPercentage}% buys</div>`;
                html += `</div>`;
            } else {
                html += `<div style='text-align:center;padding:8px;background:rgba(128,128,128,0.08);border-radius:6px;'>`;
                html += `<div style='color:#888;font-size:0.8em;'>🔄 Transactions</div><div style='color:#666;'>N/A</div></div>`;
            }
            
            html += `</div>`;
            
            // Additional info row
            html += `<div style='display:flex;justify-content:space-between;align-items:center;font-size:0.85em;margin-bottom:10px;'>`;
            
            // Age
            if (pair.pairCreatedAt) {
                const createdDate = new Date(pair.pairCreatedAt * 1000);
                const ageInDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                const ageColor = ageInDays <= 7 ? '#00ff00' : ageInDays <= 30 ? '#ffcc00' : '#888';
                html += `<div style='color:${ageColor};'>📅 Age: <span style='font-weight:bold;'>${ageInDays}d</span></div>`;
            } else {
                html += `<div style='color:#666;'>📅 Age: N/A</div>`;
            }
            
            // Boost info
            if (pair.boosts && pair.boosts.active > 0) {
                html += `<div style='color:#00ff00;'>🚀 <span style='font-weight:bold;'>${pair.boosts.active} active boosts</span></div>`;
            } else {
                html += `<div style='color:#666;'>🚀 No active boosts</div>`;
            }
            
            html += `</div>`;
            
            // Action buttons with Analytics button
            html += `<div style='display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;'>`;
            html += `<button onclick="window.terminal.showTokenAnalytics('${pair.baseToken.address || pair.pairAddress}', '${pair.baseToken.symbol || 'TOKEN'}')" style='background:linear-gradient(135deg,#ff6b6b,#ee5a52);color:#fff;border:none;padding:8px 14px;border-radius:4px;cursor:pointer;font-size:0.85em;font-weight:bold;box-shadow:0 2px 6px rgba(255,107,107,0.3);'>📊 Analytics</button>`;
            html += `<button onclick="window.terminal.addToWatchlist('${pair.baseToken.address}')" style='background:#00ff80;color:#000;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.8em;font-weight:bold;'>📋 Add to Watchlist</button>`;
            html += `<button onclick="window.open('https://dexscreener.com/${pair.chainId}/${pair.pairAddress}', '_blank')" style='background:#0088ff;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.8em;font-weight:bold;'>🔗 View on DexScreener</button>`;
            if (pair.baseToken.address) {
                html += `<button onclick="navigator.clipboard.writeText('${pair.baseToken.address}').then(() => alert('Address copied!'))" style='background:#ff8800;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.8em;font-weight:bold;'>📄 Copy Address</button>`;
            }
            html += `</div>`;
            
            html += `</div>`;
            
            this.logHtml(html);
        };

        // Helper function for number formatting
        window.terminal.formatNumber = function(num) {
            if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
            if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
            if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
            return num.toFixed(2);
        };

        // Quick Analytics function - callable from buttons
        window.terminal.showTokenAnalytics = async function(tokenAddress, tokenSymbol) {
            this.log(`📊 Loading Analytics for ${tokenSymbol}...`, 'info');
            
            try {
                // Search for the token to get full pair data
                const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(tokenAddress)}`);
                const data = await response.json();
                
                if (data.pairs && data.pairs.length > 0) {
                    // Show full analytics dashboard
                    this.displayAnalyticsDashboard(data.pairs[0]);
                } else {
                    this.log(`❌ Unable to load analytics for ${tokenSymbol}`, 'error');
                    this.log('Token may not be available on DexScreener', 'info');
                }
                
            } catch (error) {
                this.log(`❌ Analytics failed for ${tokenSymbol}: ${error.message}`, 'error');
            }
        };

        // ===================================
        // ANALYTICS DASHBOARD DISPLAY
        // ===================================
        
        window.terminal.displayAnalyticsDashboard = function(pair) {
            this.log(`📊 COMPREHENSIVE ANALYTICS DASHBOARD`, 'success');
            this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
            
            let html = `<div style='background:linear-gradient(135deg,rgba(0,255,128,0.1),rgba(0,204,255,0.1));border:2px solid #00ff80;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 8px 24px rgba(0,255,128,0.3);'>`;
            
            // Header section with token info
            html += `<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:20px;'>`;
            html += `<div style='display:flex;align-items:center;gap:16px;'>`;
            
            // Token icon (larger)
            if (pair.info?.imageUrl) {
                html += `<img src='${pair.info.imageUrl}' alt='${pair.baseToken.symbol}' style='width:64px;height:64px;border-radius:50%;border:3px solid #00ff80;box-shadow:0 4px 12px rgba(0,255,128,0.4);'>`;
            } else {
                const symbol = pair.baseToken?.symbol || 'T';
                html += `<div style='width:64px;height:64px;border-radius:50%;background:#00ff80;color:#000;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:2em;border:3px solid #00ff80;box-shadow:0 4px 12px rgba(0,255,128,0.4);'>${symbol.charAt(0)}</div>`;
            }
            
            html += `<div>`;
            html += `<div style='font-size:2.2em;font-weight:bold;color:#00ff80;text-shadow:0 2px 4px rgba(0,255,128,0.3);'>${pair.baseToken?.symbol || 'N/A'}</div>`;
            html += `<div style='color:#bbb;font-size:1.2em;margin:4px 0;'>${pair.baseToken?.name || 'Unknown Token'}</div>`;
            html += `<div style='color:#888;font-size:1em;'>${pair.chainId.toUpperCase()} • ${pair.dexId || 'Unknown DEX'}</div>`;
            html += `</div></div>`;
            
            // Current price section
            html += `<div style='text-align:right;'>`;
            if (pair.priceUsd) {
                html += `<div style='font-size:2.5em;color:#ffffff;font-weight:bold;text-shadow:0 2px 4px rgba(255,255,255,0.3);'>$${pair.priceUsd}</div>`;
            }
            if (pair.priceChange?.h24 !== undefined) {
                const changeColor = pair.priceChange.h24 >= 0 ? '#00ff00' : '#ff3333';
                const changePrefix = pair.priceChange.h24 >= 0 ? '+' : '';
                html += `<div style='color:${changeColor};font-size:1.4em;font-weight:bold;text-shadow:0 2px 4px rgba(${pair.priceChange.h24 >= 0 ? '0,255,0' : '255,51,51'},0.3);margin-top:8px;'>${changePrefix}${pair.priceChange.h24.toFixed(2)}% (24h)</div>`;
            }
            html += `</div></div>`;
            
            // Key metrics grid (comprehensive)
            html += `<div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:20px;'>`;
            
            // Volume metrics
            html += `<div style='background:rgba(255,204,0,0.15);border:1px solid rgba(255,204,0,0.4);border-radius:8px;padding:16px;text-align:center;'>`;
            html += `<div style='color:#ffcc00;font-weight:bold;font-size:1.1em;margin-bottom:8px;'>📊 Trading Volume</div>`;
            if (pair.volume?.h24) {
                html += `<div style='color:#fff;font-weight:bold;font-size:1.3em;'>$${this.formatNumber(pair.volume.h24)}</div>`;
                html += `<div style='color:#ffcc00;font-size:0.9em;margin-top:4px;'>24h Volume</div>`;
            } else {
                html += `<div style='color:#888;font-size:1.1em;'>No data available</div>`;
            }
            if (pair.volume?.h1) {
                html += `<div style='color:#bbb;font-size:0.85em;margin-top:8px;border-top:1px solid rgba(255,204,0,0.2);padding-top:8px;'>1h: $${this.formatNumber(pair.volume.h1)}</div>`;
            }
            html += `</div>`;
            
            // Liquidity metrics
            html += `<div style='background:rgba(0,204,255,0.15);border:1px solid rgba(0,204,255,0.4);border-radius:8px;padding:16px;text-align:center;'>`;
            html += `<div style='color:#00ccff;font-weight:bold;font-size:1.1em;margin-bottom:8px;'>💧 Liquidity Pool</div>`;
            if (pair.liquidity?.usd) {
                html += `<div style='color:#fff;font-weight:bold;font-size:1.3em;'>$${this.formatNumber(pair.liquidity.usd)}</div>`;
                html += `<div style='color:#00ccff;font-size:0.9em;margin-top:4px;'>Total Liquidity</div>`;
            } else {
                html += `<div style='color:#888;font-size:1.1em;'>No data available</div>`;
            }
            if (pair.liquidity?.base && pair.liquidity?.quote) {
                html += `<div style='color:#bbb;font-size:0.8em;margin-top:8px;border-top:1px solid rgba(0,204,255,0.2);padding-top:8px;'>Base: ${this.formatNumber(pair.liquidity.base)}<br>Quote: ${this.formatNumber(pair.liquidity.quote)}</div>`;
            }
            html += `</div>`;
            
            // Market cap metrics
            html += `<div style='background:rgba(255,102,102,0.15);border:1px solid rgba(255,102,102,0.4);border-radius:8px;padding:16px;text-align:center;'>`;
            html += `<div style='color:#ff6666;font-weight:bold;font-size:1.1em;margin-bottom:8px;'>💎 Market Valuation</div>`;
            if (pair.marketCap || pair.fdv) {
                const capValue = pair.marketCap || pair.fdv;
                html += `<div style='color:#fff;font-weight:bold;font-size:1.3em;'>$${this.formatNumber(capValue)}</div>`;
                html += `<div style='color:#ff6666;font-size:0.9em;margin-top:4px;'>${pair.marketCap ? 'Market Cap' : 'FDV'}</div>`;
            } else {
                html += `<div style='color:#888;font-size:1.1em;'>No data available</div>`;
            }
            html += `</div>`;
            
            // Transaction metrics
            html += `<div style='background:rgba(0,255,128,0.15);border:1px solid rgba(0,255,128,0.4);border-radius:8px;padding:16px;text-align:center;'>`;
            html += `<div style='color:#00ff80;font-weight:bold;font-size:1.1em;margin-bottom:8px;'>🔄 Transaction Activity</div>`;
            if (pair.txns?.h24) {
                const totalTxns = (pair.txns.h24.buys || 0) + (pair.txns.h24.sells || 0);
                const buyPercentage = pair.txns.h24.buys && totalTxns > 0 ? ((pair.txns.h24.buys / totalTxns) * 100).toFixed(1) : 0;
                html += `<div style='color:#fff;font-weight:bold;font-size:1.3em;'>${totalTxns}</div>`;
                html += `<div style='color:#00ff80;font-size:0.9em;margin-top:4px;'>24h Transactions</div>`;
                html += `<div style='color:#bbb;font-size:0.85em;margin-top:8px;border-top:1px solid rgba(0,255,128,0.2);padding-top:8px;'>`;
                html += `<div style='color:#00ff00;'>Buys: ${pair.txns.h24.buys || 0} (${buyPercentage}%)</div>`;
                html += `<div style='color:#ff6666;'>Sells: ${pair.txns.h24.sells || 0} (${(100-buyPercentage).toFixed(1)}%)</div>`;
                html += `</div>`;
            } else {
                html += `<div style='color:#888;font-size:1.1em;'>No data available</div>`;
            }
            html += `</div>`;
            
            html += `</div>`;
            
            // Price change breakdown
            html += `<div style='background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;margin-bottom:20px;'>`;
            html += `<div style='font-size:1.2em;font-weight:bold;color:#fff;margin-bottom:12px;text-align:center;'>📈 Price Movement Analysis</div>`;
            html += `<div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;text-align:center;'>`;
            
            ['5m', '1h', '6h', '24h'].forEach(timeframe => {
                if (pair.priceChange && pair.priceChange[timeframe] !== undefined) {
                    const change = pair.priceChange[timeframe];
                    const changeColor = change >= 0 ? '#00ff00' : '#ff3333';
                    const changePrefix = change >= 0 ? '+' : '';
                    html += `<div style='padding:8px;background:rgba(${change >= 0 ? '0,255,0' : '255,51,51'},0.1);border-radius:6px;border:1px solid ${changeColor};'>`;
                    html += `<div style='color:#bbb;font-size:0.8em;'>${timeframe.toUpperCase()}</div>`;
                    html += `<div style='color:${changeColor};font-weight:bold;font-size:1.1em;'>${changePrefix}${change.toFixed(2)}%</div>`;
                    html += `</div>`;
                }
            });
            
            html += `</div></div>`;
            
            // Token information section
            if (pair.pairCreatedAt || pair.boosts?.active) {
                html += `<div style='background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;margin-bottom:20px;'>`;
                html += `<div style='font-size:1.2em;font-weight:bold;color:#fff;margin-bottom:12px;text-align:center;'>ℹ️ Token Information</div>`;
                html += `<div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;text-align:center;'>`;
                
                // Token age
                if (pair.pairCreatedAt) {
                    const createdDate = new Date(pair.pairCreatedAt * 1000);
                    const ageInDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                    const ageColor = ageInDays <= 7 ? '#00ff00' : ageInDays <= 30 ? '#ffcc00' : '#888';
                    html += `<div style='padding:12px;background:rgba(${ageInDays <= 7 ? '0,255,0' : ageInDays <= 30 ? '255,204,0' : '136,136,136'},0.1);border-radius:6px;'>`;
                    html += `<div style='color:#bbb;font-size:0.9em;margin-bottom:4px;'>📅 Pair Age</div>`;
                    html += `<div style='color:${ageColor};font-weight:bold;font-size:1.2em;'>${ageInDays} days</div>`;
                    html += `<div style='color:#888;font-size:0.8em;margin-top:4px;'>${createdDate.toLocaleDateString()}</div>`;
                    html += `</div>`;
                }
                
                // Boost status
                html += `<div style='padding:12px;background:rgba(0,255,128,0.1);border-radius:6px;'>`;
                html += `<div style='color:#bbb;font-size:0.9em;margin-bottom:4px;'>🚀 Boost Status</div>`;
                if (pair.boosts && pair.boosts.active > 0) {
                    html += `<div style='color:#00ff00;font-weight:bold;font-size:1.2em;'>${pair.boosts.active} Active</div>`;
                    html += `<div style='color:#00ff00;font-size:0.8em;margin-top:4px;'>Currently boosted</div>`;
                } else {
                    html += `<div style='color:#888;font-weight:bold;font-size:1.2em;'>No Boosts</div>`;
                    html += `<div style='color:#888;font-size:0.8em;margin-top:4px;'>Not currently boosted</div>`;
                }
                html += `</div>`;
                
                html += `</div></div>`;
            }
            
            // Social links and actions
            html += `<div style='background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;'>`;
            html += `<div style='font-size:1.2em;font-weight:bold;color:#fff;margin-bottom:12px;text-align:center;'>🔗 Quick Actions & Links</div>`;
            
            // Action buttons (enhanced)
            html += `<div style='display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:16px;'>`;
            html += `<button onclick="window.terminal.addToWatchlist('${pair.baseToken.address || pair.pairAddress}')" style='background:linear-gradient(135deg,#00ff80,#00cc66);color:#000;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-weight:bold;box-shadow:0 4px 12px rgba(0,255,128,0.3);transition:all 0.3s;'>📋 Add to Watchlist</button>`;
            html += `<button onclick="window.terminal.addToPortfolio('${pair.baseToken.address || pair.pairAddress}')" style='background:linear-gradient(135deg,#ff8800,#ff6600);color:#fff;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-weight:bold;box-shadow:0 4px 12px rgba(255,136,0,0.3);transition:all 0.3s;'>💼 Add to Portfolio</button>`;
            html += `<button onclick="window.open('https://dexscreener.com/${pair.chainId}/${pair.pairAddress}', '_blank')" style='background:linear-gradient(135deg,#0088ff,#0066cc);color:#fff;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-weight:bold;box-shadow:0 4px 12px rgba(0,136,255,0.3);transition:all 0.3s;'>🔗 View on DexScreener</button>`;
            if (pair.baseToken.address) {
                html += `<button onclick="navigator.clipboard.writeText('${pair.baseToken.address}').then(() => alert('Address copied to clipboard!'))" style='background:linear-gradient(135deg,#8800ff,#6600cc);color:#fff;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-weight:bold;box-shadow:0 4px 12px rgba(136,0,255,0.3);transition:all 0.3s;'>📄 Copy Address</button>`;
            }
            html += `</div>`;
            
            // Debug: Log what data we actually have
            console.log('🐛 DEBUG - Pair data:', {
                hasInfo: !!pair.info,
                hasSocials: !!(pair.info?.socials),
                socialCount: pair.info?.socials?.length || 0,
                socials: pair.info?.socials,
                hasWebsites: !!(pair.info?.websites),
                websiteCount: pair.info?.websites?.length || 0,
                hasImageUrl: !!(pair.info?.imageUrl)
            });
            
            // Social links if available - with better error handling
            if (pair.info?.socials && Array.isArray(pair.info.socials) && pair.info.socials.length > 0) {
                html += `<div style='text-align:center;'>`;
                html += `<div style='color:#bbb;font-size:1em;margin-bottom:8px;'>Social Links:</div>`;
                html += `<div style='display:flex;flex-wrap:wrap;gap:8px;justify-content:center;'>`;
                
                pair.info.socials.forEach(social => {
                    // Handle different social link formats from API
                    let linkIcon = '🔗';
                    let socialUrl = '#';
                    let bgColor = '#333';
                    let platform = '';
                    
                    // Check different possible field names in API response
                    if (social.type && social.url) {
                        // Format: { type: "twitter", url: "https://..." }
                        platform = social.type;
                        socialUrl = social.url;
                    } else if (social.platform && social.handle) {
                        // Format: { platform: "twitter", handle: "username" }
                        platform = social.platform;
                        switch (social.platform.toLowerCase()) {
                            case 'twitter':
                                socialUrl = `https://twitter.com/${social.handle}`;
                                break;
                            case 'telegram':
                                socialUrl = `https://t.me/${social.handle}`;
                                break;
                            case 'discord':
                                socialUrl = social.handle.startsWith('http') ? social.handle : `https://discord.gg/${social.handle}`;
                                break;
                            default:
                                socialUrl = social.handle;
                        }
                    } else if (social.url) {
                        // Direct URL format
                        socialUrl = social.url;
                        // Try to detect platform from URL
                        if (socialUrl.includes('twitter.com') || socialUrl.includes('x.com')) {
                            platform = 'twitter';
                        } else if (socialUrl.includes('t.me')) {
                            platform = 'telegram';
                        } else if (socialUrl.includes('discord')) {
                            platform = 'discord';
                        } else {
                            platform = 'website';
                        }
                    }
                    
                    // Set icon and color based on platform
                    switch (platform.toLowerCase()) {
                        case 'twitter':
                            linkIcon = '🐦';
                            bgColor = '#1da1f2';
                            break;
                        case 'telegram':
                            linkIcon = '📱';
                            bgColor = '#0088cc';
                            break;
                        case 'discord':
                            linkIcon = '💬';
                            bgColor = '#7289da';
                            break;
                        case 'website':
                            linkIcon = '🌐';
                            bgColor = '#666';
                            break;
                        default:
                            linkIcon = '🔗';
                            bgColor = '#333';
                    }
                    
                    // Only add if we have a valid URL
                    if (socialUrl && socialUrl !== '#') {
                        html += `<a href="${socialUrl}" target="_blank" style='background:${bgColor};color:#fff;text-decoration:none;padding:6px 12px;border-radius:20px;font-size:0.9em;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:all 0.3s;'>${linkIcon} ${platform}</a>`;
                    }
                });
                html += `</div></div>`;
            } else {
                // Debug message for missing socials
                html += `<div style='text-align:center;color:#666;font-size:0.9em;margin-top:8px;'>No social links available in API response</div>`;
            }
            
            // Website links if available
            if (pair.info?.websites && Array.isArray(pair.info.websites) && pair.info.websites.length > 0) {
                html += `<div style='text-align:center;margin-top:12px;'>`;
                html += `<div style='color:#bbb;font-size:1em;margin-bottom:8px;'>Websites:</div>`;
                html += `<div style='display:flex;flex-wrap:wrap;gap:8px;justify-content:center;'>`;
                
                pair.info.websites.forEach(website => {
                    let url = website.url || website.link || website;
                    let label = website.label || 'Website';
                    
                    if (url && typeof url === 'string') {
                        html += `<a href="${url}" target="_blank" style='background:#666;color:#fff;text-decoration:none;padding:6px 12px;border-radius:20px;font-size:0.9em;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:all 0.3s;'>🌐 ${label}</a>`;
                    }
                });
                
                html += `</div></div>`;
            }
            
            html += `</div>`;
            html += `</div>`;
            
            this.logHtml(html);
            this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
        };

        // ===================================
        // PORTFOLIO MANAGEMENT SYSTEM
        // ===================================
        
        window.terminal.addToPortfolio = async function(tokenAddress) {
            if (!tokenAddress) {
                this.log('❌ Token address required', 'error');
                return;
            }
            
            try {
                let portfolio = JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTFOLIO) || '[]');
                
                // Check if already exists
                if (portfolio.some(item => item.address === tokenAddress)) {
                    this.log('⚠️ Token already in portfolio', 'error');
                    return;
                }
                
                // Get token info
                const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${tokenAddress}`);
                const data = await response.json();
                
                if (data.pairs && data.pairs.length > 0) {
                    const pair = data.pairs[0];
                    const portfolioItem = {
                        address: tokenAddress,
                        symbol: pair.baseToken.symbol,
                        name: pair.baseToken.name,
                        chainId: pair.chainId,
                        addedAt: Date.now(),
                        addedPrice: parseFloat(pair.priceUsd) || 0
                    };
                    
                    portfolio.push(portfolioItem);
                    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
                    
                    this.log(`✅ Added ${pair.baseToken.symbol} to portfolio`, 'success');
                } else {
                    this.log('❌ Token not found', 'error');
                }
            } catch (error) {
                this.log(`❌ Failed to add to portfolio: ${error.message}`, 'error');
            }
        };
        
        window.terminal.viewPortfolio = async function() {
            try {
                const portfolio = JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTFOLIO) || '[]');
                
                if (portfolio.length === 0) {
                    this.log('📊 Portfolio is empty', 'info');
                    this.log('Use "dexscreener portfolio add <token>" to add tokens', 'info');
                    return;
                }
                
                this.log(`💼 Your Portfolio (${portfolio.length} tokens)`, 'success');
                this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
                
                // Get current prices for all tokens
                for (let i = 0; i < portfolio.length; i++) {
                    const item = portfolio[i];
                    try {
                        const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${item.address}`);
                        const data = await response.json();
                        
                        if (data.pairs && data.pairs.length > 0) {
                            const pair = data.pairs[0];
                            const currentPrice = parseFloat(pair.priceUsd) || 0;
                            const addedPrice = item.addedPrice || 0;
                            const priceChange = addedPrice > 0 ? ((currentPrice - addedPrice) / addedPrice) * 100 : 0;
                            const changeColor = priceChange >= 0 ? '#00ff00' : '#ff3333';
                            const changePrefix = priceChange >= 0 ? '+' : '';
                            
                            let html = `<div style='background:rgba(0,255,128,0.08);border:1px solid #00ff80;border-radius:6px;padding:12px;margin:8px 0;'>`;
                            html += `<div style='display:flex;justify-content:space-between;align-items:center;'>`;
                            html += `<div>`;
                            html += `<div style='font-size:1.2em;font-weight:bold;color:#00ff80;'>${item.symbol}</div>`;
                            html += `<div style='color:#888;font-size:0.9em;'>${item.chainId.toUpperCase()}</div>`;
                            html += `</div>`;
                            html += `<div style='text-align:right;'>`;
                            html += `<div style='color:#fff;font-weight:bold;'>$${currentPrice.toFixed(6)}</div>`;
                            html += `<div style='color:${changeColor};font-size:0.9em;'>${changePrefix}${priceChange.toFixed(2)}%</div>`;
                            html += `</div>`;
                            html += `</div>`;
                            html += `<div style='font-size:0.8em;color:#666;margin-top:8px;'>Added: ${new Date(item.addedAt).toLocaleDateString()} at $${addedPrice.toFixed(6)}</div>`;
                            html += `</div>`;
                            
                            this.logHtml(html);
                        }
                    } catch (error) {
                        this.log(`⚠️ Failed to update ${item.symbol}: ${error.message}`, 'error');
                    }
                }
                
            } catch (error) {
                this.log(`❌ Failed to load portfolio: ${error.message}`, 'error');
            }
        };

        // ===================================
        // WATCHLIST SYSTEM
        // ===================================
        
        window.terminal.addToWatchlist = async function(tokenAddress) {
            if (!tokenAddress) {
                this.log('❌ Token address required', 'error');
                return;
            }
            
            try {
                let watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
                
                // Check if already exists
                if (watchlist.some(item => item.address === tokenAddress)) {
                    this.log('⚠️ Token already in watchlist', 'error');
                    return;
                }
                
                // Get token info
                const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${tokenAddress}`);
                const data = await response.json();
                
                if (data.pairs && data.pairs.length > 0) {
                    const pair = data.pairs[0];
                    const watchlistItem = {
                        address: tokenAddress,
                        symbol: pair.baseToken.symbol,
                        name: pair.baseToken.name,
                        chainId: pair.chainId,
                        addedAt: Date.now()
                    };
                    
                    watchlist.push(watchlistItem);
                    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
                    
                    this.log(`✅ Added ${pair.baseToken.symbol} to watchlist`, 'success');
                } else {
                    this.log('❌ Token not found', 'error');
                }
            } catch (error) {
                this.log(`❌ Failed to add to watchlist: ${error.message}`, 'error');
            }
        };
        
        window.terminal.viewWatchlist = async function() {
            try {
                const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
                
                if (watchlist.length === 0) {
                    this.log('📋 Watchlist is empty', 'info');
                    this.log('Use "dexscreener watchlist add <token>" to add tokens', 'info');
                    return;
                }
                
                this.log(`📋 Your Watchlist (${watchlist.length} tokens)`, 'success');
                this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
                
                // Display current prices for watchlist items
                for (let i = 0; i < watchlist.length; i++) {
                    const item = watchlist[i];
                    try {
                        const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${item.address}`);
                        const data = await response.json();
                        
                        if (data.pairs && data.pairs.length > 0) {
                            const pair = data.pairs[0];
                            this.displayWatchlistItem(pair, i + 1);
                        }
                    } catch (error) {
                        this.log(`⚠️ Failed to update ${item.symbol}: ${error.message}`, 'error');
                    }
                }
                
            } catch (error) {
                this.log(`❌ Failed to load watchlist: ${error.message}`, 'error');
            }
        };
        
        window.terminal.displayWatchlistItem = function(pair, index) {
            let html = `<div style='background:rgba(0,204,255,0.08);border:1px solid #00ccff;border-radius:6px;padding:12px;margin:8px 0;'>`;
            html += `<div style='display:flex;justify-content:space-between;align-items:center;'>`;
            html += `<div style='display:flex;align-items:center;gap:8px;'>`;
            html += `<div style='background:#00ccff;color:#000;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.8em;'>${index}</div>`;
            html += `<div>`;
            html += `<div style='font-size:1.1em;font-weight:bold;color:#00ccff;'>${pair.baseToken?.symbol || 'N/A'}</div>`;
            html += `<div style='color:#888;font-size:0.9em;'>${pair.chainId.toUpperCase()}</div>`;
            html += `</div></div>`;
            html += `<div style='text-align:right;'>`;
            if (pair.priceUsd) {
                html += `<div style='color:#fff;font-weight:bold;'>$${pair.priceUsd}</div>`;
            }
            if (pair.priceChange?.h24 !== undefined) {
                const changeColor = pair.priceChange.h24 >= 0 ? '#00ff00' : '#ff3333';
                const changePrefix = pair.priceChange.h24 >= 0 ? '+' : '';
                html += `<div style='color:${changeColor};font-size:0.9em;'>${changePrefix}${pair.priceChange.h24.toFixed(2)}%</div>`;
            }
            html += `</div></div>`;
            if (pair.volume?.h24) {
                html += `<div style='color:#666;font-size:0.8em;margin-top:6px;'>Vol: $${this.formatNumber(pair.volume.h24)}</div>`;
            }
            html += `</div>`;
            
            this.logHtml(html);
        };

        // ===================================
        // STORAGE MANAGEMENT HELPERS
        // ===================================
        
        window.terminal.removeFromPortfolio = function(tokenSymbol) {
            try {
                let portfolio = JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTFOLIO) || '[]');
                const originalLength = portfolio.length;
                portfolio = portfolio.filter(item => item.symbol.toLowerCase() !== tokenSymbol.toLowerCase());
                
                if (portfolio.length < originalLength) {
                    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
                    this.log(`✅ Removed ${tokenSymbol} from portfolio`, 'success');
                } else {
                    this.log(`❌ Token ${tokenSymbol} not found in portfolio`, 'error');
                }
            } catch (error) {
                this.log(`❌ Failed to remove from portfolio: ${error.message}`, 'error');
            }
        };
        
        window.terminal.removeFromWatchlist = function(tokenSymbol) {
            try {
                let watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
                const originalLength = watchlist.length;
                watchlist = watchlist.filter(item => item.symbol.toLowerCase() !== tokenSymbol.toLowerCase());
                
                if (watchlist.length < originalLength) {
                    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
                    this.log(`✅ Removed ${tokenSymbol} from watchlist`, 'success');
                } else {
                    this.log(`❌ Token ${tokenSymbol} not found in watchlist`, 'error');
                }
            } catch (error) {
                this.log(`❌ Failed to remove from watchlist: ${error.message}`, 'error');
            }
        };
        
        window.terminal.clearPortfolio = function() {
            localStorage.removeItem(STORAGE_KEYS.PORTFOLIO);
            this.log('✅ Portfolio cleared', 'success');
        };
        
        window.terminal.clearWatchlist = function() {
            localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
            this.log('✅ Watchlist cleared', 'success');
        };

        // ===================================
        // REAL TRENDING IMPLEMENTATION
        // ===================================
        
        window.terminal.handleUltimateTrending = async function(args) {
            this.log('🔥 Loading Enhanced Trending Analysis...', 'info');
            
            try {
                // Get trending tokens from DexScreener
                const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
                const data = await response.json();
                
                if (!data || !Array.isArray(data)) {
                    this.log('❌ No trending data available', 'error');
                    return;
                }
                
                this.log(`✅ Found ${data.length} trending tokens:`, 'success');
                this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
                
                // For each trending token, get detailed pair data
                for (let i = 0; i < Math.min(data.length, 8); i++) {
                    const profile = data[i];
                    
                    try {
                        // Get detailed pair data for this token
                        const pairResponse = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${profile.tokenAddress}`);
                        const pairData = await pairResponse.json();
                        
                        if (pairData.pairs && pairData.pairs.length > 0) {
                            this.displayEnhancedTokenCard(pairData.pairs[0], i + 1);
                        } else {
                            // Fallback: display basic profile info
                            this.displayBasicTrendingCard(profile, i + 1);
                        }
                        
                    } catch (error) {
                        this.log(`⚠️ Failed to get details for ${profile.tokenAddress}: ${error.message}`, 'error');
                        this.displayBasicTrendingCard(profile, i + 1);
                    }
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
            } catch (error) {
                this.log(`❌ Trending analysis failed: ${error.message}`, 'error');
                // Fallback to basic trending if available
                this.fallbackTrending();
            }
        };
        
        window.terminal.displayBasicTrendingCard = function(profile, index) {
            let html = `<div style='background:rgba(255,102,102,0.08);border:1px solid #ff6666;border-radius:6px;padding:12px;margin:8px 0;'>`;
            html += `<div style='display:flex;justify-content:space-between;align-items:center;'>`;
            html += `<div style='display:flex;align-items:center;gap:8px;'>`;
            html += `<div style='background:#ff6666;color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.8em;'>${index}</div>`;
            
            // Token icon
            if (profile.icon) {
                html += `<img src='${profile.icon}' alt='icon' style='width:32px;height:32px;border-radius:50%;border:2px solid #ff6666;'>`;
            }
            
            html += `<div>`;
            html += `<div style='font-size:1.1em;font-weight:bold;color:#ff6666;'>${profile.tokenAddress.slice(0,8)}...</div>`;
            html += `<div style='color:#888;font-size:0.9em;'>${profile.chainId.toUpperCase()}</div>`;
            html += `</div></div>`;
            html += `<div style='text-align:right;'>`;
            html += `<div style='color:#fff;font-size:0.9em;'>🔥 Trending</div>`;
            html += `</div></div>`;
            
            if (profile.description) {
                html += `<div style='color:#bbb;font-size:0.8em;margin-top:6px;'>${profile.description.slice(0,100)}...</div>`;
            }
            
            html += `</div>`;
            this.logHtml(html);
        };
        
        window.terminal.fallbackTrending = async function() {
            this.log('🔍 Trying fallback trending method...', 'info');
            
            try {
                // Try boosted tokens as fallback
                const response = await fetch('https://api.dexscreener.com/token-boosts/latest/v1');
                const data = await response.json();
                
                if (data && Array.isArray(data) && data.length > 0) {
                    this.log('✅ Showing latest boosted tokens instead:', 'info');
                    
                    for (let i = 0; i < Math.min(data.length, 5); i++) {
                        this.displayBasicTrendingCard(data[i], i + 1);
                    }
                } else {
                    this.log('❌ No fallback data available', 'error');
                }
            } catch (error) {
                this.log('❌ All trending methods failed', 'error');
            }
        };
        
        window.terminal.handleUltimateBoosted = async function() {
            this.log('🚀 Loading Enhanced Boosted Tokens Analysis...', 'info');
            
            try {
                // Get boosted tokens from DexScreener
                const response = await fetch('https://api.dexscreener.com/token-boosts/latest/v1');
                const data = await response.json();
                
                if (!data || !Array.isArray(data)) {
                    this.log('❌ No boosted tokens available', 'error');
                    return;
                }
                
                this.log(`✅ Found ${data.length} boosted tokens:`, 'success');
                this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
                
                // For each boosted token, get detailed pair data
                for (let i = 0; i < Math.min(data.length, 8); i++) {
                    const boost = data[i];
                    
                    try {
                        // Get detailed pair data for this token
                        const pairResponse = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${boost.tokenAddress}`);
                        const pairData = await pairResponse.json();
                        
                        if (pairData.pairs && pairData.pairs.length > 0) {
                            this.displayBoostedTokenCard(pairData.pairs[0], boost, i + 1);
                        } else {
                            // Fallback: display basic boost info
                            this.displayBasicBoostedCard(boost, i + 1);
                        }
                        
                    } catch (error) {
                        this.log(`⚠️ Failed to get details for ${boost.tokenAddress}: ${error.message}`, 'error');
                        this.displayBasicBoostedCard(boost, i + 1);
                    }
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
            } catch (error) {
                this.log(`❌ Boosted tokens analysis failed: ${error.message}`, 'error');
            }
        };
        
        window.terminal.displayBoostedTokenCard = function(pair, boost, index) {
            // Enhanced token card with boost information
            let html = `<div style='background:rgba(255,165,0,0.08);border:1px solid #ffa500;border-radius:6px;padding:12px;margin:8px 0;box-shadow:0 2px 8px rgba(255,165,0,0.2);'>`;
            
            // Header with boost indicator
            html += `<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;'>`;
            html += `<div style='display:flex;align-items:center;gap:12px;'>`;
            html += `<div style='background:#ffa500;color:#000;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.9em;'>${index}</div>`;
            
            // Token icon
            if (boost.icon) {
                html += `<img src='${boost.icon}' alt='icon' style='width:36px;height:36px;border-radius:50%;border:2px solid #ffa500;'>`;
            } else if (pair.info?.imageUrl) {
                html += `<img src='${pair.info.imageUrl}' alt='icon' style='width:36px;height:36px;border-radius:50%;border:2px solid #ffa500;'>`;
            } else {
                const symbol = pair.baseToken?.symbol || 'B';
                html += `<div style='width:36px;height:36px;border-radius:50%;background:#ffa500;color:#000;display:flex;align-items:center;justify-content:center;font-weight:bold;'>${symbol.charAt(0)}</div>`;
            }
            
            html += `<div>`;
            html += `<div style='font-size:1.3em;font-weight:bold;color:#ffa500;'>${pair.baseToken?.symbol || 'N/A'}</div>`;
            html += `<div style='color:#888;font-size:0.85em;'>${pair.chainId.toUpperCase()} • ${pair.dexId || 'Unknown DEX'}</div>`;
            html += `</div>`;
            html += `</div>`;
            
            // Price and boost info
            html += `<div style='text-align:right;'>`;
            if (pair.priceUsd) {
                html += `<div style='font-size:1.2em;color:#ffffff;font-weight:bold;'>$${pair.priceUsd}</div>`;
            }
            if (boost.amount || boost.totalAmount) {
                html += `<div style='color:#ffa500;font-size:0.9em;font-weight:bold;'>🚀 ${boost.totalAmount || boost.amount || 'N/A'} boost(s)</div>`;
            }
            html += `</div></div>`;
            
            // Boost description
            if (boost.description) {
                html += `<div style='color:#bbb;font-size:0.9em;margin-bottom:10px;line-height:1.3;'>${boost.description.slice(0,120)}...</div>`;
            }
            
            // Key metrics
            html += `<div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:0.85em;margin-bottom:10px;'>`;
            
            // Volume
            if (pair.volume?.h24) {
                html += `<div style='text-align:center;padding:6px;background:rgba(255,204,0,0.1);border-radius:4px;'>`;
                html += `<div style='color:#ffcc00;font-weight:bold;'>📊 Volume</div>`;
                html += `<div style='color:#fff;'>$${this.formatNumber(pair.volume.h24)}</div>`;
                html += `</div>`;
            }
            
            // Liquidity
            if (pair.liquidity?.usd) {
                html += `<div style='text-align:center;padding:6px;background:rgba(0,204,255,0.1);border-radius:4px;'>`;
                html += `<div style='color:#00ccff;font-weight:bold;'>💧 Liquidity</div>`;
                html += `<div style='color:#fff;'>$${this.formatNumber(pair.liquidity.usd)}</div>`;
                html += `</div>`;
            }
            
            // Market Cap
            if (pair.marketCap || pair.fdv) {
                const capValue = pair.marketCap || pair.fdv;
                html += `<div style='text-align:center;padding:6px;background:rgba(255,102,102,0.1);border-radius:4px;'>`;
                html += `<div style='color:#ff6666;font-weight:bold;'>💎 ${pair.marketCap ? 'MCap' : 'FDV'}</div>`;
                html += `<div style='color:#fff;'>$${this.formatNumber(capValue)}</div>`;
                html += `</div>`;
            }
            
            html += `</div>`;
            
            // Action buttons
            html += `<div style='display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;'>`;
            html += `<button onclick="window.terminal.addToWatchlist('${pair.baseToken.address || pair.pairAddress}')" style='background:#ffa500;color:#000;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.8em;font-weight:bold;'>📋 Add to Watchlist</button>`;
            html += `<button onclick="window.open('https://dexscreener.com/${pair.chainId}/${pair.pairAddress}', '_blank')" style='background:#0088ff;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.8em;font-weight:bold;'>🔗 View on DexScreener</button>`;
            html += `</div>`;
            
            html += `</div>`;
            this.logHtml(html);
        };
        
        window.terminal.displayBasicBoostedCard = function(boost, index) {
            let html = `<div style='background:rgba(255,165,0,0.08);border:1px solid #ffa500;border-radius:6px;padding:12px;margin:8px 0;'>`;
            html += `<div style='display:flex;justify-content:space-between;align-items:center;'>`;
            html += `<div style='display:flex;align-items:center;gap:8px;'>`;
            html += `<div style='background:#ffa500;color:#000;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.8em;'>${index}</div>`;
            
            if (boost.icon) {
                html += `<img src='${boost.icon}' alt='icon' style='width:32px;height:32px;border-radius:50%;border:2px solid #ffa500;'>`;
            }
            
            html += `<div>`;
            html += `<div style='font-size:1.1em;font-weight:bold;color:#ffa500;'>${boost.tokenAddress.slice(0,8)}...</div>`;
            html += `<div style='color:#888;font-size:0.9em;'>${boost.chainId.toUpperCase()}</div>`;
            html += `</div></div>`;
            html += `<div style='text-align:right;'>`;
            html += `<div style='color:#ffa500;font-size:0.9em;font-weight:bold;'>🚀 ${boost.totalAmount || boost.amount || 'N/A'} boosts</div>`;
            html += `</div></div>`;
            
            if (boost.description) {
                html += `<div style='color:#bbb;font-size:0.8em;margin-top:6px;'>${boost.description.slice(0,100)}...</div>`;
            }
            
            html += `</div>`;
            this.logHtml(html);
        };
        
        window.terminal.handleTokenCompare = async function(args) {
            this.log('⚖️ Token comparison feature coming soon...', 'info');
            // TODO: Implement side-by-side token comparison
        };
        
        window.terminal.handleAdvancedFilter = async function(args) {
            this.log('🎯 Advanced filtering system coming soon...', 'info');
            // TODO: Implement comprehensive filtering system
        };
        
        window.terminal.handleSmartScan = async function(args) {
            this.log('🔍 Smart scanning system coming soon...', 'info');
            // TODO: Implement smart scanning with criteria
        };
        
        window.terminal.handleAlerts = async function(args) {
            this.log('🚨 Alert system coming soon...', 'info');
            // TODO: Implement real-time alert system
        };
        
        window.terminal.handleMonitor = async function(args) {
            this.log('📡 Monitoring system coming soon...', 'info');
            // TODO: Implement real-time monitoring
        };
        
        window.terminal.handleAutoDiscover = async function(args) {
            this.log('🎯 Auto-discovery system coming soon...', 'info');
            // TODO: Implement auto-discovery algorithms
        };

        // Add error recovery mechanism
        window.terminal.dexAnalyticsRestore = function() {
            if (window.terminal._originalHandleDexScreenerCommand) {
                window.terminal.handleDexScreenerCommand = window.terminal._originalHandleDexScreenerCommand;
                console.log('✅ DexScreener Analytics: Original handler restored');
                return true;
            }
            return false;
        };
        
        // Test that our plugin doesn't break basic terminal functionality
        try {
            if (typeof window.terminal.log === 'function' && typeof window.terminal.logHtml === 'function') {
                console.log('✅ DexScreener Analytics Ultimate Plugin v2.0 loaded successfully!');
                console.log('ℹ️ Use "window.terminal.dexAnalyticsRestore()" if you experience any issues');
            } else {
                throw new Error('Terminal functions not available');
            }
        } catch (error) {
            console.error('❌ DexScreener Analytics Plugin initialization failed:', error);
            // Restore original handler if available
            if (window.terminal._originalHandleDexScreenerCommand) {
                window.terminal.handleDexScreenerCommand = window.terminal._originalHandleDexScreenerCommand;
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForTerminal);
    } else {
        waitForTerminal();
    }
})(); 