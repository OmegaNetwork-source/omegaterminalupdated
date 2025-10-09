// ===================================
// DEFI LLAMA API PLUGIN v1.0
// TVL & Token Price Data for Omega Terminal
// ===================================

console.log('🦙 Loading DeFi Llama API Plugin v1.0');

(function() {
    const DEFILLAMA_API = {
        BASE_URL: 'https://api.llama.fi',
        COINS_URL: 'https://coins.llama.fi'
    };

    let initAttempts = 0;
    const maxInitAttempts = 15;
    
    // Wait for terminal to be ready
    function waitForTerminalLlama() {
        initAttempts++;
        
        if (window.terminal && window.terminal.log && window.terminal.logHtml) {
            if (typeof window.terminal.executeCommand === 'function' || initAttempts > 8) {
                initializeDeFiLlamaPlugin();
            } else {
                console.log('⏳ DeFi Llama: Waiting for terminal to be fully loaded...', initAttempts);
                setTimeout(waitForTerminalLlama, 300);
            }
        } else if (initAttempts < maxInitAttempts) {
            setTimeout(waitForTerminalLlama, 200);
        } else {
            console.error('❌ DeFi Llama Plugin: Failed to initialize after maximum attempts');
        }
    }
    
    function initializeDeFiLlamaPlugin() {
        console.log('✅ DeFi Llama Plugin: Terminal detected, adding TVL & price functionality...');
        
        // Store original command handler
        const originalExecuteCommand = window.terminal.executeCommand;
        
        // Enhanced command handler that includes DeFi Llama commands
        window.terminal.executeCommand = async function(command) {
            const args = command.trim().split(/\s+/);
            const cmd = args[0].toLowerCase();
            
            // Handle DeFi Llama commands and aliases
            if (cmd === 'defillama' || cmd === 'llama' || cmd === 'defi') {
                await this.handleDeFiLlamaCommand(args);
                return;
            }
            
            // Handle direct aliases for common commands
            if (cmd === 'tvl') {
                await this.handleDeFiLlamaCommand(['defillama', 'tvl', ...args.slice(1)]);
                return;
            }
            
            // For all other commands, use original handler
            if (originalExecuteCommand) {
                return originalExecuteCommand.call(this, command);
            }
        };
        
        // Main DeFi Llama command handler
        window.terminal.handleDeFiLlamaCommand = async function(args) {
            if (!args[1]) {
                this.displayDeFiLlamaHelp();
                return;
            }
            
            const subCommand = args[1].toLowerCase();
            
            try {
                switch (subCommand) {
                    // TVL Commands
                    case 'tvl':
                        await this.handleTVLCommand(args);
                        break;
                    case 'protocols':
                        await this.handleProtocolsCommand(args);
                        break;
                    case 'chains':
                        await this.handleChainsCommand(args);
                        break;
                    
                    // Price Commands  
                    case 'price':
                    case 'prices':
                        await this.handlePriceCommand(args);
                        break;
                    case 'tokens':
                        await this.handleMultipleTokensCommand(args);
                        break;
                    
                    // Analysis Commands
                    case 'trending':
                        await this.handleTrendingCommand(args);
                        break;
                    
                    case 'test':
                    case 'debug':
                        await this.handleDebugCommand(args);
                        break;
                    
                    case 'help':
                        this.displayDeFiLlamaHelp();
                        break;
                    
                    default:
                        this.log(`❌ Unknown DeFi Llama command: ${subCommand}`, 'error');
                        this.displayDeFiLlamaHelp();
                }
            } catch (error) {
                this.log(`❌ DeFi Llama command failed: ${error.message}`, 'error');
                console.error('DeFi Llama Error:', error);
            }
        };

        // ===================================
        // HELP SYSTEM
        // ===================================
        
        window.terminal.displayDeFiLlamaHelp = function() {
            this.log('🦙 DeFi Llama API - TVL & Price Data', 'info');
            this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
            this.log('', 'info');
            
            this.log('📊 TVL COMMANDS (FREE):', 'success');
            this.log('  defillama tvl                     Total DeFi TVL (calculated)', 'output');
            this.log('  defillama protocols [limit]       Top protocols by TVL', 'output');
            this.log('  defillama chains [limit]          TVL by blockchain', 'output');
            this.log('  defillama tvl <protocol>          Specific protocol TVL', 'output');
            this.log('', 'info');
            
            this.log('💰 PRICE COMMANDS (FREE):', 'success');
            this.log('  defillama price <token>           Current token price', 'output');
            this.log('  defillama tokens <t1,t2,t3>       Multiple token prices', 'output');
            this.log('', 'info');
            
            this.log('🔍 ANALYSIS COMMANDS (FREE):', 'success');
            this.log('  defillama trending                Protocols by 24h change', 'output');
            this.log('  defillama debug <token>           Debug token price lookup', 'output');
            this.log('', 'info');
            
            this.log('⚡ EXAMPLES:', 'info');
            this.log('  defillama tvl                     # Total DeFi TVL', 'info');
            this.log('  defillama protocols 5             # Top 5 protocols', 'info');
            this.log('  defillama price ethereum          # ETH price (FIXED)', 'info');
            this.log('  defillama tokens eth,btc,sol      # Multiple prices (FIXED)', 'info');
            this.log('  defillama debug bitcoin           # Debug price lookup', 'info');
            this.log('  llama chains 10                   # Top 10 chains (alias)', 'info');
            this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
        };

        // ===================================
        // TVL COMMANDS
        // ===================================
        
        window.terminal.handleTVLCommand = async function(args) {
            if (args[2]) {
                // Specific protocol TVL
                await this.getProtocolTVL(args[2]);
            } else {
                // Total DeFi TVL
                await this.getTotalTVL();
            }
        };
        
        window.terminal.getTotalTVL = async function() {
            this.log('🦙 Calculating total DeFi TVL from chains...', 'info');
            
            try {
                // Use /v2/chains endpoint to calculate total TVL (official way)
                const response = await fetch(`${DEFILLAMA_API.BASE_URL}/v2/chains`);
                const chains = await response.json();
                
                if (chains && Array.isArray(chains)) {
                    const totalTVL = chains.reduce((sum, chain) => sum + (chain.tvl || 0), 0);
                    
                    let html = `<div style='background:linear-gradient(135deg,rgba(52,199,89,0.1),rgba(255,255,255,0.95));border:1px solid rgba(52,199,89,0.3);border-radius:20px;padding:20px;margin:16px 0;text-align:center;backdrop-filter:blur(30px);box-shadow:0 8px 32px rgba(52,199,89,0.2);'>`;
                    
                    html += `<div style='font-size:2.5em;margin-bottom:12px;'>🦙</div>`;
                    html += `<div style='font-size:1.8em;font-weight:700;color:#1B5E20;margin-bottom:8px;'>Total DeFi TVL</div>`;
                    html += `<div style='font-size:2.2em;font-weight:800;color:#2E7D32;margin-bottom:16px;'>$${this.formatLlamaCurrency(totalTVL)}</div>`;
                    html += `<div style='color:#86868B;font-size:1em;'>Across ${chains.length} blockchains • Calculated from chain data</div>`;
                    
                    html += `</div>`;
                    
                    this.logHtml(html);
                    this.log(`✅ Total DeFi TVL: $${this.formatLlamaCurrency(totalTVL)} (${chains.length} chains)`, 'success');
                } else {
                    this.log('❌ Invalid chain data received', 'error');
                }
            } catch (error) {
                this.log(`❌ Failed to fetch chain TVL data: ${error.message}`, 'error');
            }
        };
        
        window.terminal.getProtocolTVL = async function(protocolName) {
            this.log(`🔍 Fetching TVL for ${protocolName}...`, 'info');
            
            try {
                const response = await fetch(`${DEFILLAMA_API.BASE_URL}/protocol/${protocolName}`);
                const data = await response.json();
                
                if (data && data.currentChainTvls) {
                    this.displayProtocolTVL(data);
                } else {
                    this.log(`❌ Protocol "${protocolName}" not found`, 'error');
                    this.log('💡 Try: defillama protocols (to see available protocols)', 'info');
                }
            } catch (error) {
                this.log(`❌ Failed to fetch protocol TVL: ${error.message}`, 'error');
            }
        };

        // ===================================
        // PROTOCOLS COMMAND
        // ===================================
        
        window.terminal.handleProtocolsCommand = async function(args) {
            this.log('🦙 Fetching top DeFi protocols...', 'info');
            
            try {
                const response = await fetch(`${DEFILLAMA_API.BASE_URL}/protocols`);
                const protocols = await response.json();
                
                if (protocols && Array.isArray(protocols)) {
                    const limit = args[2] ? parseInt(args[2]) : 10;
                    const topProtocols = protocols
                        .filter(p => p.tvl && p.tvl > 0)
                        .sort((a, b) => b.tvl - a.tvl)
                        .slice(0, limit);
                    
                    this.log(`✅ Top ${limit} DeFi Protocols by TVL:`, 'success');
                    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
                    
                    topProtocols.forEach((protocol, index) => {
                        this.displayProtocolCard(protocol, index + 1);
                    });
                } else {
                    this.log('❌ No protocol data available', 'error');
                }
            } catch (error) {
                this.log(`❌ Failed to fetch protocols: ${error.message}`, 'error');
            }
        };

        // ===================================
        // PRICE COMMANDS
        // ===================================
        
        window.terminal.handlePriceCommand = async function(args) {
            if (!args[2]) {
                this.log('Usage: defillama price <token_symbol>', 'info');
                this.log('Example: defillama price ethereum', 'info');
                this.log('Example: defillama price bitcoin', 'info');
                return;
            }
            
            const token = args[2].toLowerCase();
            this.log(`💰 Fetching price for ${token}...`, 'info');
            
            // Use the same token mapping as multiple tokens command
            const tokenMappings = {
                'eth': 'coingecko:ethereum', 'ethereum': 'coingecko:ethereum',
                'btc': 'coingecko:bitcoin', 'bitcoin': 'coingecko:bitcoin',
                'sol': 'coingecko:solana', 'solana': 'coingecko:solana',
                'usdc': 'coingecko:usd-coin', 'usdt': 'coingecko:tether',
                'bnb': 'coingecko:binancecoin', 'ada': 'coingecko:cardano',
                'dot': 'coingecko:polkadot', 'avax': 'coingecko:avalanche-2',
                'matic': 'coingecko:matic-network', 'link': 'coingecko:chainlink',
                'uni': 'coingecko:uniswap', 'aave': 'coingecko:aave',
                'crv': 'coingecko:curve-dao-token'
            };
            
            const mappedToken = tokenMappings[token] || `coingecko:${token}`;
            
            try {
                const response = await fetch(`${DEFILLAMA_API.COINS_URL}/prices/current/${mappedToken}`);
                const data = await response.json();
                
                if (data && data.coins && Object.keys(data.coins).length > 0) {
                    const tokenData = Object.values(data.coins)[0];
                    if (tokenData && tokenData.price) {
                        this.displayTokenPrice(tokenData, token);
                    } else {
                        this.log(`❌ Price not found for ${token}`, 'error');
                        this.suggestTokenSearch(token);
                    }
                } else {
                    this.log(`❌ Price not found for ${token}`, 'error');
                    this.suggestTokenSearch(token);
                }
            } catch (error) {
                this.log(`❌ Failed to fetch price: ${error.message}`, 'error');
                this.suggestTokenSearch(token);
            }
        };

        // ===================================
        // CHAINS COMMAND
        // ===================================
        
        window.terminal.handleChainsCommand = async function(args) {
            this.log('🔗 Fetching TVL by blockchain...', 'info');
            
            try {
                const response = await fetch(`${DEFILLAMA_API.BASE_URL}/v2/chains`);
                const chains = await response.json();
                
                if (chains && Array.isArray(chains)) {
                    const limit = args[2] ? parseInt(args[2]) : 15;
                    const topChains = chains
                        .filter(c => c.tvl && c.tvl > 0)
                        .sort((a, b) => b.tvl - a.tvl)
                        .slice(0, limit);
                    
                    this.log(`✅ Top ${limit} Blockchains by TVL:`, 'success');
                    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
                    
                    topChains.forEach((chain, index) => {
                        this.displayChainCard(chain, index + 1);
                    });
                } else {
                    this.log('❌ No chain data available', 'error');
                }
            } catch (error) {
                this.log(`❌ Failed to fetch chains: ${error.message}`, 'error');
            }
        };

        // ===================================
        // DISPLAY FUNCTIONS
        // ===================================
        
        window.terminal.displayProtocolCard = function(protocol, index) {
            let html = `<div style='background:rgba(255,255,255,0.8);border:1px solid rgba(52,199,89,0.2);border-radius:16px;padding:16px;margin:8px 0;backdrop-filter:blur(20px);box-shadow:0 4px 16px rgba(52,199,89,0.1);transition:all 0.3s ease;'>`;
            
            // Header with ranking and protocol info
            html += `<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;'>`;
            html += `<div style='display:flex;align-items:center;gap:12px;'>`;
            html += `<div style='background:#34C759;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.9em;'>${index}</div>`;
            
            // Protocol logo or placeholder
            if (protocol.logo) {
                html += `<img src='${protocol.logo}' alt='${protocol.name}' style='width:36px;height:36px;border-radius:8px;border:2px solid #34C759;'>`;
            } else {
                const symbol = protocol.symbol || protocol.name?.charAt(0) || 'P';
                html += `<div style='width:36px;height:36px;border-radius:8px;background:#34C759;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;'>${symbol.charAt(0)}</div>`;
            }
            
            html += `<div>`;
            html += `<div style='font-size:1.3em;font-weight:bold;color:#1B5E20;'>${protocol.name}</div>`;
            html += `<div style='color:#666;font-size:0.9em;'>${protocol.category || 'DeFi Protocol'}</div>`;
            html += `</div></div>`;
            
            // TVL display
            html += `<div style='text-align:right;'>`;
            html += `<div style='font-size:1.4em;color:#2E7D32;font-weight:bold;'>$${this.formatLlamaCurrency(protocol.tvl)}</div>`;
            if (protocol.change_1d !== undefined) {
                const changeColor = protocol.change_1d >= 0 ? '#34C759' : '#FF3B30';
                const changePrefix = protocol.change_1d >= 0 ? '+' : '';
                html += `<div style='color:${changeColor};font-size:0.9em;font-weight:bold;'>${changePrefix}${protocol.change_1d.toFixed(2)}% (24h)</div>`;
            }
            html += `</div></div>`;
            
            // Additional info if available
            if (protocol.chain || protocol.chains) {
                const chains = protocol.chains || [protocol.chain];
                html += `<div style='color:#888;font-size:0.8em;margin-top:8px;'>Chains: ${chains.join(', ')}</div>`;
            }
            
            // Action buttons
            html += `<div style='display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;'>`;
            if (protocol.url) {
                html += `<a href="${protocol.url}" target="_blank" style='background:#34C759;color:#fff;text-decoration:none;padding:6px 12px;border-radius:8px;font-size:0.8em;font-weight:bold;'>🌐 Visit Protocol</a>`;
            }
            html += `<button onclick="window.terminal.getProtocolTVL('${protocol.slug || protocol.name.toLowerCase().replace(/\s+/g, '-')}')" style='background:#007AFF;color:#fff;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:0.8em;font-weight:bold;'>📊 Detailed TVL</button>`;
            html += `</div>`;
            
            html += `</div>`;
            this.logHtml(html);
        };
        
        window.terminal.displayChainCard = function(chain, index) {
            let html = `<div style='background:rgba(255,255,255,0.8);border:1px solid rgba(0,122,255,0.2);border-radius:16px;padding:16px;margin:8px 0;backdrop-filter:blur(20px);box-shadow:0 4px 16px rgba(0,122,255,0.1);'>`;
            
            html += `<div style='display:flex;justify-content:space-between;align-items:center;'>`;
            html += `<div style='display:flex;align-items:center;gap:12px;'>`;
            html += `<div style='background:#007AFF;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.9em;'>${index}</div>`;
            
            html += `<div>`;
            html += `<div style='font-size:1.2em;font-weight:bold;color:#1565C0;'>${chain.name}</div>`;
            if (chain.tokenSymbol) {
                html += `<div style='color:#666;font-size:0.9em;'>Token: ${chain.tokenSymbol}</div>`;
            }
            html += `</div></div>`;
            
            html += `<div style='text-align:right;'>`;
            html += `<div style='color:#1565C0;font-weight:bold;font-size:1.2em;'>$${this.formatLlamaCurrency(chain.tvl)}</div>`;
            if (chain.change_1d !== undefined) {
                const changeColor = chain.change_1d >= 0 ? '#34C759' : '#FF3B30';
                const changePrefix = chain.change_1d >= 0 ? '+' : '';
                html += `<div style='color:${changeColor};font-size:0.9em;'>${changePrefix}${chain.change_1d.toFixed(2)}% (24h)</div>`;
            }
            html += `</div></div>`;
            
            html += `</div>`;
            this.logHtml(html);
        };
        
        window.terminal.displayTokenPrice = function(tokenData, requestedToken) {
            // Use the token symbol from the API response for accuracy, but show what user requested
            const displaySymbol = tokenData.symbol || requestedToken.toUpperCase();
            const requestedSymbol = requestedToken.toUpperCase();
            
            let html = `<div style='background:linear-gradient(135deg,rgba(255,149,0,0.1),rgba(255,255,255,0.95));border:1px solid rgba(255,149,0,0.3);border-radius:20px;padding:20px;margin:16px 0;text-align:center;backdrop-filter:blur(30px);box-shadow:0 8px 32px rgba(255,149,0,0.2);'>`;
            
            html += `<div style='font-size:2.5em;margin-bottom:12px;'>💰</div>`;
            html += `<div style='font-size:1.6em;font-weight:700;color:#E65100;margin-bottom:8px;'>${displaySymbol}</div>`;
            html += `<div style='font-size:2.2em;font-weight:800;color:#F57C00;margin-bottom:16px;'>$${tokenData.price.toFixed(6)}</div>`;
            
            if (tokenData.timestamp) {
                const lastUpdate = new Date(tokenData.timestamp * 1000);
                html += `<div style='color:#86868B;font-size:0.9em;'>Last updated: ${lastUpdate.toLocaleString()}</div>`;
            }
            
            // Show additional info if symbol differs from request
            if (displaySymbol !== requestedSymbol) {
                html += `<div style='color:#666;font-size:0.8em;margin-top:8px;'>Searched for: ${requestedSymbol}</div>`;
            }
            
            html += `</div>`;
            
            this.logHtml(html);
            this.log(`✅ ${displaySymbol} price: $${tokenData.price.toFixed(6)}`, 'success');
        };
        
        window.terminal.displayProtocolTVL = function(protocolData) {
            const protocol = protocolData;
            
            let html = `<div style='background:linear-gradient(135deg,rgba(52,199,89,0.1),rgba(255,255,255,0.95));border:2px solid rgba(52,199,89,0.3);border-radius:20px;padding:24px;margin:16px 0;backdrop-filter:blur(30px);box-shadow:0 12px 40px rgba(52,199,89,0.2);'>`;
            
            // Header section
            html += `<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(52,199,89,0.2);padding-bottom:16px;'>`;
            html += `<div style='display:flex;align-items:center;gap:16px;'>`;
            
            if (protocol.logo) {
                html += `<img src='${protocol.logo}' alt='${protocol.name}' style='width:48px;height:48px;border-radius:12px;border:2px solid #34C759;'>`;
            } else {
                const symbol = protocol.symbol || protocol.name?.charAt(0) || 'P';
                html += `<div style='width:48px;height:48px;border-radius:12px;background:#34C759;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.5em;'>${symbol.charAt(0)}</div>`;
            }
            
            html += `<div>`;
            html += `<div style='font-size:1.8em;font-weight:bold;color:#1B5E20;'>${protocol.name}</div>`;
            html += `<div style='color:#666;font-size:1em;'>${protocol.category || 'DeFi Protocol'}</div>`;
            if (protocol.chain) {
                html += `<div style='color:#888;font-size:0.9em;'>Primary Chain: ${protocol.chain}</div>`;
            }
            html += `</div></div>`;
            
            // Current TVL
            html += `<div style='text-align:right;'>`;
            const currentTVL = protocol.tvl || Object.values(protocol.currentChainTvls || {}).reduce((a, b) => a + b, 0);
            html += `<div style='font-size:2em;color:#2E7D32;font-weight:bold;'>$${this.formatLlamaCurrency(currentTVL)}</div>`;
            html += `<div style='color:#34C759;font-size:1em;font-weight:600;'>Total Value Locked</div>`;
            html += `</div></div>`;
            
            // Chain breakdown if available
            if (protocol.chainTvls && Object.keys(protocol.chainTvls).length > 1) {
                html += `<div style='margin-bottom:16px;'>`;
                html += `<div style='font-size:1.2em;font-weight:600;color:#1B5E20;margin-bottom:12px;'>📊 TVL by Chain:</div>`;
                html += `<div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;'>`;
                
                Object.entries(protocol.chainTvls).forEach(([chainName, tvl]) => {
                    if (tvl > 0) {
                        html += `<div style='background:rgba(52,199,89,0.05);border:1px solid rgba(52,199,89,0.2);border-radius:12px;padding:12px;text-align:center;'>`;
                        html += `<div style='color:#1B5E20;font-weight:600;font-size:0.9em;'>${chainName}</div>`;
                        html += `<div style='color:#2E7D32;font-weight:bold;'>$${this.formatLlamaCurrency(tvl)}</div>`;
                        html += `</div>`;
                    }
                });
                
                html += `</div></div>`;
            }
            
            // Action buttons
            html += `<div style='display:flex;gap:12px;justify-content:center;margin-top:16px;'>`;
            if (protocol.url) {
                html += `<a href="${protocol.url}" target="_blank" style='background:#34C759;color:#fff;text-decoration:none;padding:10px 16px;border-radius:12px;font-weight:bold;'>🌐 Visit Protocol</a>`;
            }
            if (protocol.twitter) {
                html += `<a href="${protocol.twitter}" target="_blank" style='background:#1DA1F2;color:#fff;text-decoration:none;padding:10px 16px;border-radius:12px;font-weight:bold;'>🐦 Twitter</a>`;
            }
            html += `</div>`;
            
            html += `</div>`;
            
            this.logHtml(html);
            this.log(`✅ ${protocol.name} TVL: $${this.formatLlamaCurrency(currentTVL)}`, 'success');
        };

        // ===================================
        // UTILITY FUNCTIONS
        // ===================================
        
        window.terminal.formatLlamaCurrency = function(amount) {
            if (amount >= 1e12) return (amount / 1e12).toFixed(2) + 'T';
            if (amount >= 1e9) return (amount / 1e9).toFixed(2) + 'B';
            if (amount >= 1e6) return (amount / 1e6).toFixed(2) + 'M';
            if (amount >= 1e3) return (amount / 1e3).toFixed(2) + 'K';
            return amount.toFixed(2);
        };
        
        // Removed redundant tryAlternativePrice function - using unified approach
        
        window.terminal.suggestTokenSearch = function(token) {
            this.log('💡 Supported token formats:', 'info');
            this.log('', 'info');
            this.log('🎯 POPULAR TOKENS:', 'info');
            this.log('  defillama price ethereum          # ETH price', 'info');
            this.log('  defillama price bitcoin           # BTC price', 'info');
            this.log('  defillama price solana            # SOL price', 'info');
            this.log('  defillama price usdc              # USDC price', 'info');
            this.log('  defillama price aave              # AAVE token', 'info');
            this.log('  defillama price uni               # Uniswap token', 'info');
            this.log('', 'info');
            this.log('📋 OTHER COMMANDS:', 'info');
            this.log('  defillama protocols               # Browse available protocols', 'info');
            this.log('  defillama chains                  # TVL by blockchain', 'info');
        };

        // ===================================
        // TRENDING AND COMPARE COMMANDS
        // ===================================
        
        window.terminal.handleTrendingCommand = async function(args) {
            this.log('🔥 Fetching trending DeFi protocols...', 'info');
            
            try {
                const response = await fetch(`${DEFILLAMA_API.BASE_URL}/protocols`);
                const protocols = await response.json();
                
                if (protocols && Array.isArray(protocols)) {
                    // Sort by 24h change and TVL
                    const trending = protocols
                        .filter(p => p.tvl > 100000000 && p.change_1d !== undefined) // $100M+ TVL
                        .sort((a, b) => (b.change_1d || 0) - (a.change_1d || 0))
                        .slice(0, 8);
                    
                    this.log('✅ Trending DeFi Protocols (24h gainers):', 'success');
                    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
                    
                    trending.forEach((protocol, index) => {
                        this.displayTrendingProtocol(protocol, index + 1);
                    });
                } else {
                    this.log('❌ No trending data available', 'error');
                }
            } catch (error) {
                this.log(`❌ Failed to fetch trending protocols: ${error.message}`, 'error');
            }
        };
        
        window.terminal.displayTrendingProtocol = function(protocol, index) {
            const changeColor = protocol.change_1d >= 0 ? '#34C759' : '#FF3B30';
            const changePrefix = protocol.change_1d >= 0 ? '+' : '';
            
            let html = `<div style='background:rgba(255,255,255,0.8);border:1px solid ${changeColor === '#34C759' ? 'rgba(52,199,89,0.3)' : 'rgba(255,59,48,0.3)'};border-radius:16px;padding:14px;margin:8px 0;backdrop-filter:blur(20px);'>`;
            
            html += `<div style='display:flex;justify-content:space-between;align-items:center;'>`;
            html += `<div style='display:flex;align-items:center;gap:10px;'>`;
            html += `<div style='background:${changeColor};color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.8em;'>${index}</div>`;
            html += `<div>`;
            html += `<div style='font-size:1.1em;font-weight:bold;color:#1B5E20;'>${protocol.name}</div>`;
            html += `<div style='color:#666;font-size:0.8em;'>TVL: $${this.formatLlamaCurrency(protocol.tvl)}</div>`;
            html += `</div></div>`;
            html += `<div style='text-align:right;color:${changeColor};font-weight:bold;'>${changePrefix}${protocol.change_1d.toFixed(2)}%</div>`;
            html += `</div></div>`;
            
            this.logHtml(html);
        };

        // ===================================
        // MULTIPLE TOKENS COMMAND
        // ===================================
        
        window.terminal.handleMultipleTokensCommand = async function(args) {
            if (!args[2]) {
                this.log('Usage: defillama tokens <token1,token2,token3>', 'info');
                this.log('Example: defillama tokens ethereum,bitcoin,solana', 'info');
                return;
            }
            
            const tokenList = args[2].split(',').map(t => t.trim().toLowerCase());
            this.log(`💰 Fetching prices for ${tokenList.length} tokens...`, 'info');
            
            const tokenMappings = {
                'eth': 'coingecko:ethereum', 'ethereum': 'coingecko:ethereum',
                'btc': 'coingecko:bitcoin', 'bitcoin': 'coingecko:bitcoin',
                'sol': 'coingecko:solana', 'solana': 'coingecko:solana',
                'usdc': 'coingecko:usd-coin', 'usdt': 'coingecko:tether',
                'bnb': 'coingecko:binancecoin', 'ada': 'coingecko:cardano',
                'dot': 'coingecko:polkadot', 'avax': 'coingecko:avalanche-2',
                'matic': 'coingecko:matic-network', 'link': 'coingecko:chainlink',
                'uni': 'coingecko:uniswap', 'aave': 'coingecko:aave'
            };
            
            // Map tokens to API format and create comma-separated string
            const mappedTokens = tokenList.map(token => 
                tokenMappings[token] || `coingecko:${token}`
            ).join(',');
            
            try {
                const response = await fetch(`${DEFILLAMA_API.COINS_URL}/prices/current/${mappedTokens}`);
                const data = await response.json();
                
                if (data && data.coins && Object.keys(data.coins).length > 0) {
                    this.log(`✅ Found prices for ${Object.keys(data.coins).length} tokens:`, 'success');
                    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
                    
                    // Create reverse mapping to match responses with original requests
                    const reverseMapping = {};
                    tokenList.forEach(token => {
                        const mapped = tokenMappings[token] || `coingecko:${token}`;
                        reverseMapping[mapped] = token;
                    });
                    
                    let index = 1;
                    Object.entries(data.coins).forEach(([tokenId, tokenData]) => {
                        const originalToken = reverseMapping[tokenId] || tokenData.symbol || tokenId;
                        this.displayCompactTokenPrice(tokenData, originalToken, index);
                        index++;
                    });
                } else {
                    this.log('❌ No price data found for the requested tokens', 'error');
                }
            } catch (error) {
                this.log(`❌ Failed to fetch token prices: ${error.message}`, 'error');
            }
        };
        
        window.terminal.displayCompactTokenPrice = function(tokenData, requestedToken, index) {
            // Use API symbol if available, otherwise use what user requested
            const displaySymbol = tokenData.symbol || requestedToken.toUpperCase();
            
            let html = `<div style='background:rgba(255,255,255,0.8);border:1px solid rgba(255,149,0,0.2);border-radius:12px;padding:12px;margin:6px 0;backdrop-filter:blur(20px);display:flex;justify-content:space-between;align-items:center;'>`;
            
            html += `<div style='display:flex;align-items:center;gap:10px;'>`;
            html += `<div style='background:#FF9500;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.8em;'>${index}</div>`;
            html += `<div style='font-size:1.1em;font-weight:bold;color:#E65100;'>${displaySymbol}</div>`;
            html += `</div>`;
            
            html += `<div style='text-align:right;'>`;
            html += `<div style='font-size:1.2em;font-weight:bold;color:#F57C00;'>$${tokenData.price.toFixed(6)}</div>`;
            if (requestedToken.toLowerCase() !== displaySymbol.toLowerCase()) {
                html += `<div style='color:#888;font-size:0.8em;'>Requested: ${requestedToken.toUpperCase()}</div>`;
            }
            html += `</div>`;
            
            html += `</div>`;
            this.logHtml(html);
        };

        // ===================================
        // DEBUG COMMAND
        // ===================================
        
        window.terminal.handleDebugCommand = async function(args) {
            if (!args[2]) {
                this.log('Usage: defillama debug <token>', 'info');
                this.log('Example: defillama debug ethereum', 'info');
                return;
            }
            
            const token = args[2].toLowerCase();
            this.log(`🐛 Debugging token lookup for: ${token}`, 'info');
            
            const tokenMappings = {
                'eth': 'coingecko:ethereum', 'ethereum': 'coingecko:ethereum',
                'btc': 'coingecko:bitcoin', 'bitcoin': 'coingecko:bitcoin',
                'sol': 'coingecko:solana', 'solana': 'coingecko:solana',
                'usdc': 'coingecko:usd-coin', 'usdt': 'coingecko:tether',
                'bnb': 'coingecko:binancecoin', 'ada': 'coingecko:cardano',
                'dot': 'coingecko:polkadot', 'avax': 'coingecko:avalanche-2',
                'matic': 'coingecko:matic-network', 'link': 'coingecko:chainlink',
                'uni': 'coingecko:uniswap', 'aave': 'coingecko:aave',
                'crv': 'coingecko:curve-dao-token'
            };
            
            const mappedToken = tokenMappings[token] || `coingecko:${token}`;
            const apiUrl = `${DEFILLAMA_API.COINS_URL}/prices/current/${mappedToken}`;
            
            this.log(`🔍 Debug Info:`, 'info');
            this.log(`  Input token: ${token}`, 'info');
            this.log(`  Mapped to: ${mappedToken}`, 'info');
            this.log(`  API URL: ${apiUrl}`, 'info');
            this.log('', 'info');
            
            try {
                this.log('📡 Making API request...', 'info');
                const response = await fetch(apiUrl);
                
                this.log(`📊 Response status: ${response.status}`, 'info');
                
                if (!response.ok) {
                    this.log(`❌ HTTP Error: ${response.status} ${response.statusText}`, 'error');
                    return;
                }
                
                const data = await response.json();
                this.log('📋 Raw API response:', 'info');
                this.log(JSON.stringify(data, null, 2), 'output');
                
                if (data && data.coins && Object.keys(data.coins).length > 0) {
                    this.log('✅ Price data found!', 'success');
                    const tokenData = Object.values(data.coins)[0];
                    if (tokenData && tokenData.price) {
                        this.log(`💰 Price: $${tokenData.price}`, 'success');
                        this.log(`🏷️ Symbol: ${tokenData.symbol || 'N/A'}`, 'info');
                        this.log(`⏰ Timestamp: ${tokenData.timestamp || 'N/A'}`, 'info');
                    }
                } else {
                    this.log('❌ No price data in response', 'error');
                }
                
            } catch (error) {
                this.log(`❌ Debug failed: ${error.message}`, 'error');
                console.error('DeFi Llama Debug Error:', error);
            }
        };

        // Success message
        console.log('✅ DeFi Llama API Plugin v1.0 loaded successfully!');
        console.log('🦙 Commands: defillama tvl, defillama protocols, defillama price <token>');
        console.log('🔧 Fixed: Token price mapping and single token searches');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForTerminalLlama);
    } else {
        waitForTerminalLlama();
    }
})(); 