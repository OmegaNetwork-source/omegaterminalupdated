// Futuristic Dashboard Transformation
// Transforms the existing terminal into a 3-panel dashboard

(function() {
    'use strict';
    
    console.log('🚀 Loading Futuristic Dashboard Transform...');
    
    function transformToDashboard() {
        console.log('🔧 Transforming terminal to futuristic dashboard...');
        
        // Wait for terminal to be ready
        if (!document.getElementById('terminal')) {
            console.log('⏳ Waiting for terminal...');
            setTimeout(transformToDashboard, 100);
            return;
        }
        
        const terminal = document.getElementById('terminal');
        if (!terminal) return;
        
        // Create dashboard wrapper
        const dashboard = document.createElement('div');
        dashboard.className = 'omega-dashboard';
        dashboard.innerHTML = `
        <!-- Header -->
        <header class="omega-header">
             <div class="header-brand">
                 <div class="header-logo-container">
                     <!-- Logo will be replaced by omega-symbol-logo.js -->
                 </div>
                <div class="brand-text">OMEGA TERMINAL</div>
                <div class="version-badge">v2.0.1 CLASSIFIED</div>
            </div>
                
                <div class="header-status">
                    <div class="status-indicator">
                        <div class="status-dot" id="futuristic-connection-status"></div>
                        <span id="futuristic-connection-text">INITIALIZING</span>
                    </div>
                    
                    <div class="status-indicator">
                        <span id="futuristic-network-info">NO NETWORK</span>
                    </div>
                    
                    <div class="status-indicator">
                        <span id="futuristic-wallet-info">NO WALLET</span>
                    </div>
                    
                    <button class="sidebar-button" onclick="window.FuturisticDashboard && window.FuturisticDashboard.cycleTheme()" style="padding: 6px 12px;" title="Cycle Color Scheme">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/></svg>
                    </button>
                </div>
            </header>
            
            <!-- Sidebar -->
            <aside class="omega-sidebar">
                <div class="sidebar-section">
                    <div class="sidebar-title">QUICK ACTIONS</div>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.executeCommandDirect('help')">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"/></svg>
                        <span>System Help</span>
                    </button>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.executeCommandDirect('connect')">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18H21M12,16V8H21V16H12Z"/></svg>
                        <span>Connect Wallet</span>
                    </button>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.executeCommandDirect('balance')">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/></svg>
                        <span>Check Balance</span>
                    </button>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.executeCommandDirect('faucet')">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/></svg>
                        <span>Claim Faucet</span>
                    </button>
                </div>
                
                <div class="sidebar-section">
                    <div class="sidebar-title">TRADING & ANALYTICS</div>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.executeCommand('dexscreener BTC')">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z"/></svg>
                        <span>BTC Analytics</span>
                    </button>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.executeCommand('dexscreener ETH')">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/></svg>
                        <span>ETH Analytics</span>
                    </button>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.executeCommand('defillama')">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/></svg>
                        <span>DeFi Llama</span>
                    </button>
                </div>
                
                <div class="sidebar-section">
                    <div class="sidebar-title">NFT & WEB3</div>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.executeCommand('nft')">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/></svg>
                        <span>NFT Explorer</span>
                    </button>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.executeCommand('solana wallet')">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/></svg>
                        <span>Solana Wallet</span>
                    </button>
                </div>
                
                <div class="sidebar-section">
                    <div class="sidebar-title">SYSTEM</div>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.executeCommandDirect('clear')">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                        <span>Clear Terminal</span>
                    </button>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.toggleClassicMode()">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/></svg>
                        <span>Classic Mode</span>
                    </button>
                </div>
            </aside>
            
            <!-- Main Terminal (will be moved here) -->
            <main class="omega-terminal" id="terminal-wrapper">
                <div class="terminal-header">
                    <div class="terminal-title">
                        <span>▶</span>
                        <span>COMMAND CENTER</span>
                    </div>
                    <div class="terminal-controls">
                        <div class="terminal-control-btn close" title="Close"></div>
                        <div class="terminal-control-btn minimize" title="Minimize"></div>
                        <div class="terminal-control-btn maximize" title="Maximize"></div>
                    </div>
                </div>
                <!-- Original terminal will be inserted here -->
            </main>
            
            <!-- Stats Panel -->
            <aside class="omega-stats">
                <div class="stats-panel">
                    <div class="stats-title">NETWORK INFO</div>
                    <div class="stat-item">
                        <span class="stat-label">Active Chain</span>
                        <span class="stat-value" id="futuristic-active-chain">Not Connected</span>
                    </div>
                    
                    <div class="stat-item">
                        <span class="stat-label">Gas Price</span>
                        <span class="stat-value" id="futuristic-gas-price">-- Gwei</span>
                    </div>
                    
                    <div class="stat-item">
                        <span class="stat-label">Block Number</span>
                        <span class="stat-value" id="futuristic-block-number">--</span>
                    </div>
                    
                    <div class="stat-item">
                        <span class="stat-label">Wallet Type</span>
                        <span class="stat-value" id="futuristic-wallet-type">None</span>
                    </div>
                    
                    <div class="stat-item">
                        <span class="stat-label">Commands Run</span>
                        <span class="stat-value" id="futuristic-commands">0</span>
                    </div>
                </div>
                
                <div class="stats-panel">
                    <div class="stats-title">PORTFOLIO INFO</div>
                    <div class="stat-item">
                        <span class="stat-label">Address</span>
                        <span class="stat-value" id="futuristic-address">Not Connected</span>
                    </div>
                    
                    <div class="stat-item">
                        <span class="stat-label">Portfolio Value</span>
                        <span class="stat-value" id="futuristic-portfolio-value">$0.00</span>
                    </div>
                    
                    <div class="stat-item">
                        <span class="stat-label">24h Change</span>
                        <span class="stat-value" id="futuristic-24h-change">+0.00%</span>
                    </div>
                    
                    <div class="stat-item">
                        <span class="stat-label">Network</span>
                        <span class="stat-value" id="futuristic-network">N/A</span>
                    </div>
                    
                    <div class="stat-item">
                        <span class="stat-label">Last Updated</span>
                        <span class="stat-value" id="futuristic-last-updated">Never</span>
                    </div>
                </div>
                
                <div class="stats-panel pgt-tracker-panel">
                    <div class="stats-title">
                        <svg class="pgt-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: var(--cyber-blue); margin-right: 6px;">
                            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                        </svg>
                        PGT PORTFOLIO TRACKER
                    </div>
                    
                    <!-- Wallet Input -->
                    <div class="pgt-tracker-input">
                        <input type="text" 
                               id="pgt-wallet-input" 
                               class="pgt-wallet-input" 
                               placeholder="Enter wallet address...">
                        <button id="pgt-track-btn" class="pgt-track-btn" title="Track Wallet">
                            <svg viewBox="0 0 24 24">
                                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Tracked Wallets List -->
                    <div class="pgt-tracked-list" id="pgt-tracked-list">
                        <div class="pgt-no-wallets">
                            <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; opacity: 0.3; margin-bottom: 8px;">
                                <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18H21M12,16V8H21V16H12Z"/>
                            </svg>
                            <p>No wallets tracked yet</p>
                            <small>Enter an address above to start tracking</small>
                        </div>
                    </div>
                    
                    <!-- Tracker Stats Summary -->
                    <div class="pgt-tracker-stats" id="pgt-tracker-stats" style="display: none;">
                        <div class="pgt-stat-row">
                            <span class="pgt-stat-label">Total Tracked:</span>
                            <span class="pgt-stat-value" id="pgt-total-tracked">0</span>
                        </div>
                        <div class="pgt-stat-row">
                            <span class="pgt-stat-label">Combined Value:</span>
                            <span class="pgt-stat-value" id="pgt-total-value">$0.00</span>
                        </div>
                        <div class="pgt-stat-row">
                            <span class="pgt-stat-label">Avg 24h Change:</span>
                            <span class="pgt-stat-value" id="pgt-avg-change">+0.00%</span>
                        </div>
                    </div>
                </div>
                
                <div class="stats-panel">
                    <div class="stats-title">QUICK STATS</div>
                    <div class="stat-item">
                        <span class="stat-label">Uptime</span>
                        <span class="stat-value" id="futuristic-uptime">00:00:00</span>
                    </div>
                    
                    <div class="stat-item">
                        <span class="stat-label">Status</span>
                        <span class="stat-value text-matrix">OPERATIONAL</span>
                    </div>
                </div>
            </aside>
        `;
        
        // Insert dashboard before terminal
        document.body.insertBefore(dashboard, terminal);
        
        // Move terminal into dashboard
        const terminalWrapper = document.getElementById('terminal-wrapper');
        terminalWrapper.appendChild(terminal);
        
        // Remove terminal header (we have our own)
        const originalHeader = terminal.querySelector('.terminal-header');
        if (originalHeader) {
            originalHeader.style.display = 'none';
        }
        
        // Style the terminal for dashboard
        terminal.style.cssText = `
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
        `;
        
        // Setup command input handling
        window.FuturisticDashboard.setupCommandInput();
        
         // Initialize PGT Portfolio Integration
         setTimeout(() => {
             window.FuturisticDashboard.initializePGTIntegration();
         }, 2000);
         
         // Initialize PGT Portfolio Tracker
         setTimeout(() => {
             window.FuturisticDashboard.initializePGTTracker();
         }, 2500);
         
         // Start monitoring
         window.FuturisticDashboard.startMonitoring();
        
        console.log('✅ Dashboard transformation complete!');
    }
    
    // Dashboard controller
    window.FuturisticDashboard = {
        commandCount: 0,
        startTime: Date.now(),
        
        executeCommand: function(cmd) {
            console.log('Executing command:', cmd);
            this.commandCount++;
            document.getElementById('futuristic-commands').textContent = this.commandCount;
            
            // Add to activity log
            const activity = document.getElementById('futuristic-activity');
            if (activity) {
                const entry = document.createElement('div');
                entry.style.padding = '4px 0';
                entry.textContent = `• ${cmd}`;
                activity.insertBefore(entry, activity.firstChild);
                
                // Keep only last 10
                while (activity.children.length > 10) {
                    activity.removeChild(activity.lastChild);
                }
            }
            
            // Execute command properly
            this.sendCommandToTerminal(cmd);
        },
        
        sendCommandToTerminal: function(cmd) {
            const input = document.getElementById('commandInput');
            if (!input) {
                console.error('Command input not found');
                return;
            }
            
            // Set the command value
            input.value = cmd;
            
            // Trigger the input event first
            const inputEvent = new Event('input', { bubbles: true });
            input.dispatchEvent(inputEvent);
            
            // Create and dispatch keypress event (what terminal-core.js listens for)
            const keypressEvent = new KeyboardEvent('keypress', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
            });
            
            console.log('Dispatching keypress event for command:', cmd);
            input.dispatchEvent(keypressEvent);
            
            // Also try keydown as backup
            const keydownEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
            });
            input.dispatchEvent(keydownEvent);
        },
        
        // Direct command execution (bypasses input field)
        executeCommandDirect: function(cmd) {
            console.log('Executing command directly:', cmd);
            
            // Increment command counter
            this.commandCount++;
            document.getElementById('futuristic-commands').textContent = this.commandCount;
            
            // Try to use terminal's direct method if available
            if (window.terminal && typeof window.terminal.executeCommand === 'function') {
                window.terminal.executeCommand(cmd);
                return;
            }
            
            // Try to use terminal's log method to show command
            if (window.terminal && typeof window.terminal.log === 'function') {
                window.terminal.log(`> ${cmd}`, 'info');
                
                // Simulate command processing
                setTimeout(() => {
                    this.processCommandResult(cmd);
                }, 100);
                return;
            }
            
            // Fallback to input method
            this.sendCommandToTerminal(cmd);
        },
        
        processCommandResult: function(cmd) {
            // Handle common commands
            const cmdLower = cmd.toLowerCase().trim();
            
            switch (cmdLower) {
                case 'help':
                    window.terminal.log('Available commands:', 'info');
                    window.terminal.log('• help - Show this help', 'info');
                    window.terminal.log('• connect - Connect wallet', 'info');
                    window.terminal.log('• balance - Check balance', 'info');
                    window.terminal.log('• clear - Clear terminal', 'info');
                    break;
                case 'clear':
                    const output = document.getElementById('terminalOutput');
                    if (output) {
                        output.innerHTML = '';
                    }
                    break;
                case 'connect':
                    window.terminal.log('Connecting to wallet...', 'warning');
                    window.terminal.log('Please use browser wallet extension', 'info');
                    break;
                case 'balance':
                    window.terminal.log('Balance: 0.00 ETH', 'warning');
                    window.terminal.log('Connect wallet to see balance', 'info');
                    break;
                default:
                    window.terminal.log(`Command not found: ${cmd}`, 'error');
                    window.terminal.log('Type "help" for available commands', 'info');
            }
        },
        
        // Handle manual command input from terminal
        setupCommandInput: function() {
            const input = document.getElementById('commandInput');
            if (!input) return;
            
            // Method 1: Hook into terminal's executeCommand if available
            if (window.terminal && typeof window.terminal.executeCommand === 'function') {
                const originalExecute = window.terminal.executeCommand;
                const self = this;
                
                window.terminal.executeCommand = function(cmd) {
                    // Increment counter
                    self.commandCount++;
                    const commandsEl = document.getElementById('futuristic-commands');
                    if (commandsEl) {
                        commandsEl.textContent = self.commandCount;
                        // Add subtle flash effect
                        commandsEl.style.color = 'var(--cyber-blue-bright)';
                        setTimeout(() => {
                            commandsEl.style.color = '';
                        }, 200);
                    }
                    
                    // Call original function
                    return originalExecute.apply(this, arguments);
                };
                
                console.log('✅ Command counter hooked into terminal.executeCommand');
            }
            
            // Method 2: Listen to command input keypress events
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    // Small delay to let terminal process first
                    setTimeout(() => {
                        this.commandCount++;
                        const commandsEl = document.getElementById('futuristic-commands');
                        if (commandsEl) {
                            commandsEl.textContent = this.commandCount;
                            commandsEl.style.color = 'var(--cyber-blue-bright)';
                            setTimeout(() => {
                                commandsEl.style.color = '';
                            }, 200);
                        }
                    }, 50);
                }
            });
            
            console.log('✅ Command input handler attached');
            console.log('✅ Command counter active on all executions');
        },
        
        // PGT Portfolio Integration
        initializePGTIntegration: function() {
            if (window.omegaPGT) {
                console.log('🎯 Initializing PGT Portfolio Integration...');
                
                // Start portfolio monitoring
                this.startPortfolioMonitoring();
                
                // Add PGT commands to sidebar
                this.addPGTCommands();
            } else {
                console.warn('⚠️ PGT Integration not available - using demo data');
                
                // Use demo data for testing
                this.startDemoPortfolioMonitoring();
                
                // Add PGT commands to sidebar
                this.addPGTCommands();
            }
        },
        
        startDemoPortfolioMonitoring: function() {
            // Initial demo data
            this.updatePortfolioDisplay({
                totalValue: 125000,
                change24h: 2.34
            });
            
            // Update demo data every 30 seconds with random changes
            setInterval(() => {
                const baseValue = 125000;
                const randomChange = (Math.random() - 0.5) * 10; // -5% to +5%
                const newValue = baseValue * (1 + randomChange / 100);
                const change24h = randomChange;
                
                this.updatePortfolioDisplay({
                    totalValue: newValue,
                    change24h: change24h
                });
            }, 30000);
        },
        
        startPortfolioMonitoring: function() {
            // Initial portfolio fetch
            this.fetchPortfolioData();
            
            // Update portfolio every 30 seconds
            setInterval(() => {
                this.fetchPortfolioData();
            }, 30000);
        },
        
        async fetchPortfolioData() {
            try {
                if (!window.omegaPGT) return;
                
                const result = await window.omegaPGT.getPortfolio();
                
                if (result.success && result.data) {
                    this.updatePortfolioDisplay(result.data);
                } else {
                    this.handlePortfolioError(result.error || 'Unknown error');
                }
            } catch (error) {
                console.error('Portfolio fetch error:', error);
                this.handlePortfolioError(error.message);
            }
        },
        
        updatePortfolioDisplay: function(data) {
            // Update portfolio value with animation
            const portfolioValue = data.totalValue || 0;
            const formattedValue = this.formatCurrency(portfolioValue);
            const portfolioElement = document.getElementById('futuristic-portfolio-value');
            
            // Add update animation
            portfolioElement.classList.add('portfolio-updated');
            portfolioElement.textContent = formattedValue;
            
            // Remove animation class after animation completes
            setTimeout(() => {
                portfolioElement.classList.remove('portfolio-updated');
            }, 500);
            
            // Update 24h change with color coding
            const change24h = data.change24h || 0;
            const changeElement = document.getElementById('futuristic-24h-change');
            const percentage = Math.abs(change24h).toFixed(2);
            
            // Reset classes
            changeElement.className = '';
            
            if (change24h > 0) {
                changeElement.style.color = 'var(--matrix-green)';
                changeElement.textContent = '+' + percentage + '%';
                changeElement.classList.add('positive');
            } else if (change24h < 0) {
                changeElement.style.color = 'var(--danger-red)';
                changeElement.textContent = '-' + percentage + '%';
                changeElement.classList.add('negative');
            } else {
                changeElement.style.color = 'var(--cyber-blue)';
                changeElement.textContent = '0.00%';
                changeElement.classList.add('neutral');
            }
            
            // Update last updated timestamp
            const lastUpdated = new Date().toLocaleTimeString();
            document.getElementById('futuristic-last-updated').textContent = lastUpdated;
            
            // Add to activity log with color coding
            this.addActivityLog(`Portfolio updated: ${formattedValue} (${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%)`);
            
            console.log('✅ Portfolio data updated:', data);
        },
        
        handlePortfolioError: function(error) {
            document.getElementById('futuristic-portfolio-value').textContent = 'Error';
            document.getElementById('futuristic-24h-change').textContent = 'N/A';
            document.getElementById('futuristic-last-updated').textContent = 'Error';
            
            console.error('Portfolio error:', error);
        },
        
        formatCurrency: function(value) {
            if (value >= 1000000) {
                return '$' + (value / 1000000).toFixed(2) + 'M';
            } else if (value >= 1000) {
                return '$' + (value / 1000).toFixed(2) + 'K';
            } else {
                return '$' + value.toFixed(2);
            }
        },
        
        formatPercentage: function(percentage) {
            return percentage.toFixed(2) + '%';
        },
        
        addPGTCommands: function() {
            // Add PGT commands to the sidebar
            const sidebar = document.querySelector('.omega-sidebar');
            if (!sidebar) return;
            
            // Find the last section and add PGT section
            const lastSection = sidebar.querySelector('.sidebar-section:last-child');
            if (lastSection) {
                const pgtSection = document.createElement('div');
                pgtSection.className = 'sidebar-section';
                pgtSection.innerHTML = `
                    <div class="sidebar-title">PGT PORTFOLIO</div>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.refreshPortfolio()">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/></svg>
                        <span>Refresh Portfolio</span>
                    </button>
                    <button class="sidebar-button" onclick="window.FuturisticDashboard.executeCommandDirect('pgt portfolio')">
                        <svg class="sidebar-icon" viewBox="0 0 24 24"><path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z"/></svg>
                        <span>Full Portfolio</span>
                    </button>
                `;
                
                sidebar.appendChild(pgtSection);
            }
        },
        
        refreshPortfolio: function() {
            console.log('🔄 Manually refreshing portfolio...');
            this.fetchPortfolioData();
            this.addActivityLog('Portfolio refresh requested');
        },
        
         addActivityLog: function(message) {
             const activity = document.getElementById('futuristic-activity');
             if (activity) {
                 const entry = document.createElement('div');
                 entry.style.padding = '4px 0';
                 entry.textContent = `• ${message}`;
                 activity.insertBefore(entry, activity.firstChild);
                 
                 // Keep only last 10
                 while (activity.children.length > 10) {
                     activity.removeChild(activity.lastChild);
                 }
             }
         },
         
         // ==================== PGT PORTFOLIO TRACKER ====================
         pgtTrackedWallets: [],
         pgtUpdateInterval: null,
         
         initializePGTTracker: function() {
             console.log('🎯 Initializing PGT Portfolio Tracker...');
             
             // Load tracked wallets from localStorage
             const stored = localStorage.getItem('pgt-tracked-wallets');
             if (stored) {
                 try {
                     this.pgtTrackedWallets = JSON.parse(stored);
                     console.log(`📊 Loaded ${this.pgtTrackedWallets.length} tracked wallets`);
                 } catch (e) {
                     console.error('Error loading tracked wallets:', e);
                     this.pgtTrackedWallets = [];
                 }
             }
             
             // Setup event listeners
             this.setupPGTTrackerEvents();
             
             // Display existing wallets
             this.updatePGTTrackerDisplay();
             
             // Start auto-refresh
             this.startPGTTrackerRefresh();
             
             console.log('✅ PGT Portfolio Tracker initialized');
         },
         
         setupPGTTrackerEvents: function() {
             const trackBtn = document.getElementById('pgt-track-btn');
             const walletInput = document.getElementById('pgt-wallet-input');
             
             if (trackBtn) {
                 trackBtn.addEventListener('click', () => {
                     this.trackPGTWallet();
                 });
             }
             
             if (walletInput) {
                 walletInput.addEventListener('keypress', (e) => {
                     if (e.key === 'Enter') {
                         this.trackPGTWallet();
                     }
                 });
                 
                 // Real-time validation
                 walletInput.addEventListener('input', (e) => {
                     this.validatePGTWalletAddress(e.target.value);
                 });
             }
         },
         
         validatePGTWalletAddress: function(address) {
             const input = document.getElementById('pgt-wallet-input');
             const trackBtn = document.getElementById('pgt-track-btn');
             
             if (!input || !trackBtn) return false;
             
             // Basic validation for common wallet formats
             const isValid = /^(0x[a-fA-F0-9]{40}|[A-Za-z0-9]{32,44}|[1-9A-HJ-NP-Za-km-z]{32,44})$/.test(address.trim());
             
             if (isValid) {
                 input.style.borderColor = 'var(--matrix-green)';
                 input.style.boxShadow = '0 0 8px rgba(0, 255, 136, 0.3)';
                 trackBtn.style.opacity = '1';
                 trackBtn.disabled = false;
                 return true;
             } else if (address.trim().length > 10) {
                 input.style.borderColor = 'var(--danger-red)';
                 input.style.boxShadow = '0 0 8px rgba(255, 51, 102, 0.3)';
                 trackBtn.style.opacity = '0.5';
                 trackBtn.disabled = true;
                 return false;
             } else {
                 input.style.borderColor = 'var(--cyber-blue)';
                 input.style.boxShadow = 'none';
                 trackBtn.style.opacity = '0.7';
                 trackBtn.disabled = false;
                 return false;
             }
         },
         
         async trackPGTWallet() {
             const input = document.getElementById('pgt-wallet-input');
             if (!input) return;
             
             const address = input.value.trim();
             if (!address) return;
             
             // Validate address
             if (!this.validatePGTWalletAddress(address)) {
                 this.showPGTNotification('Invalid wallet address format', 'error');
                 return;
             }
             
             // Check if already tracked
             if (this.pgtTrackedWallets.find(w => w.address.toLowerCase() === address.toLowerCase())) {
                 this.showPGTNotification('Wallet already tracked', 'warning');
                 return;
             }
             
             // Show loading state
             const trackBtn = document.getElementById('pgt-track-btn');
             if (trackBtn) {
                 trackBtn.innerHTML = '<svg class="spinning" viewBox="0 0 24 24"><path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/></svg>';
                 trackBtn.disabled = true;
             }
             
             try {
                 // Fetch portfolio data using PGT API
                 const portfolioData = await this.fetchPGTWalletData(address);
                 
                 // Add to tracked wallets
                 const wallet = {
                     address: address,
                     label: this.generateWalletLabel(address),
                     network: this.detectNetwork(address),
                     value: portfolioData.totalValue || 0,
                     change24h: portfolioData.change24h || 0,
                     tokens: portfolioData.tokens || [],
                     addedAt: new Date().toISOString(),
                     lastUpdated: new Date().toISOString()
                 };
                 
                 console.log('💾 Saving wallet to tracker:', wallet);
                 
                 // Add data source indicator
                 wallet.dataSource = portfolioData.dataSource || 'unknown';
                 
                 this.pgtTrackedWallets.push(wallet);
                 this.savePGTTrackedWallets();
                 this.updatePGTTrackerDisplay();
                 
                 // Clear input
                 input.value = '';
                 input.style.borderColor = 'var(--cyber-blue)';
                 input.style.boxShadow = 'none';
                 
                 // Show success message with value and data source
                 const valueStr = this.formatCurrency(wallet.value);
                 const changeStr = `${wallet.change24h >= 0 ? '+' : ''}${wallet.change24h.toFixed(2)}%`;
                 const sourceIndicator = wallet.dataSource === 'PGT_API' ? '🟢 LIVE' : '🟡 DEMO';
                 this.showPGTNotification(`${sourceIndicator} - ${wallet.label}: ${valueStr} (${changeStr})`, 'success');
                 
                 // Log to terminal
                 if (window.terminal && window.terminal.log) {
                     window.terminal.log('═══════════════════════════════════════', 'info');
                     window.terminal.log('🎯 WALLET ADDED TO TRACKER', 'success');
                     window.terminal.log('═══════════════════════════════════════', 'info');
                     window.terminal.log(`Address: ${wallet.address}`, 'info');
                     window.terminal.log(`Network: ${wallet.network}`, 'info');
                     window.terminal.log(`Value: ${valueStr}`, 'info');
                     window.terminal.log(`24h Change: ${changeStr}`, wallet.change24h >= 0 ? 'success' : 'error');
                     window.terminal.log('═══════════════════════════════════════', 'info');
                 }
                 
             } catch (error) {
                 console.error('Error tracking wallet:', error);
                 this.showPGTNotification('Failed to fetch wallet data', 'error');
             } finally {
                 // Restore button
                 if (trackBtn) {
                     trackBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/></svg>';
                     trackBtn.disabled = false;
                 }
             }
         },
         
         async fetchPGTWalletData(address) {
             // Detect network from address
             const network = this.detectNetwork(address).toLowerCase();
             
             console.log(`🔍 Fetching PGT data for ${address} on ${network}...`);
             
             // STEP 1: Try to add wallet to PGT tracking
             if (window.omegaPGT && typeof window.omegaPGT.addWallet === 'function') {
                 try {
                     console.log('📤 Adding wallet to PGT tracker...');
                     const addResult = await window.omegaPGT.addWallet(address, network, `Omega - ${address.substring(0, 8)}`);
                     
                     if (addResult.success && addResult.data && addResult.data.wallet) {
                         console.log('✅ Wallet added to PGT successfully!');
                         console.log('📊 PGT Wallet Data:', addResult.data.wallet);
                         
                         const walletData = addResult.data.wallet;
                         
                         const transformedData = {
                             totalValue: walletData.totalValue || 0,
                             change24h: walletData.change24hPercent || walletData.change24h || 0,
                             tokens: walletData.tokens || [],
                             network: walletData.network || network,
                             lastUpdated: walletData.lastUpdated || new Date().toISOString(),
                             label: walletData.label || null,
                             dataSource: 'PGT_API'
                         };
                         
                         console.log('✅ Transformed data:', transformedData);
                         console.log('🟢 DATA SOURCE: LIVE PGT API');
                         return transformedData;
                     } else if (addResult.error && addResult.error.includes('already being tracked')) {
                         // Wallet already exists, get from portfolio
                         console.log('ℹ️ Wallet already tracked, fetching from portfolio...');
                         return await this.getWalletFromPortfolio(address);
                     } else {
                         console.warn('⚠️ PGT add wallet failed:', addResult.error);
                     }
                 } catch (error) {
                     console.error('❌ Error adding wallet to PGT:', error);
                 }
             }
             
             // STEP 2: Try to get from portfolio if already tracked
             const portfolioData = await this.getWalletFromPortfolio(address);
             if (portfolioData) {
                 return portfolioData;
             }
             
             // STEP 3: Fallback to demo data
             console.log('📊 Using demo data as fallback');
             return this.generateDemoPGTData(address);
         },
         
         async getWalletFromPortfolio(address) {
             if (!window.omegaPGT || typeof window.omegaPGT.getPortfolio !== 'function') {
                 return null;
             }
             
             try {
                 console.log('📊 Fetching full portfolio from PGT...');
                 const portfolioResult = await window.omegaPGT.getPortfolio();
                 
                 if (portfolioResult.success && portfolioResult.data && portfolioResult.data.wallets) {
                     console.log('✅ Portfolio retrieved, searching for wallet...');
                     
                     const wallet = portfolioResult.data.wallets.find(
                         w => w.address.toLowerCase() === address.toLowerCase()
                     );
                     
                     if (wallet) {
                         console.log('✅ Found wallet in portfolio!', wallet);
                         
                         return {
                             totalValue: wallet.totalValue || 0,
                             change24h: wallet.change24hPercent || wallet.change24h || 0,
                             tokens: wallet.tokens || [],
                             network: wallet.network,
                             lastUpdated: wallet.lastUpdated,
                             label: wallet.label,
                             dataSource: 'PGT_API'
                         };
                     } else {
                         console.log('⚠️ Wallet not found in portfolio');
                     }
                 }
             } catch (error) {
                 console.error('❌ Error fetching portfolio:', error);
             }
             
             return null;
         },
         
         generateDemoPGTData(address) {
             console.log('⚠️ USING DEMO DATA - PGT API not available');
             
             // Generate realistic demo data
             const baseValue = Math.random() * 500000 + 10000; // $10k - $510k
             const change24h = (Math.random() - 0.5) * 30; // -15% to +15%
             
             return {
                 totalValue: baseValue,
                 change24h: change24h,
                 tokens: [
                     { symbol: 'ETH', amount: Math.random() * 10, value: Math.random() * 50000 },
                     { symbol: 'USDC', amount: Math.random() * 10000, value: Math.random() * 10000 },
                     { symbol: 'SOL', amount: Math.random() * 100, value: Math.random() * 20000 }
                 ],
                 dataSource: 'DEMO'
             };
         },
         
         updatePGTTrackerDisplay: function() {
             const listContainer = document.getElementById('pgt-tracked-list');
             const statsContainer = document.getElementById('pgt-tracker-stats');
             
             if (!listContainer) return;
             
             if (this.pgtTrackedWallets.length === 0) {
                 // Show empty state
                 listContainer.innerHTML = `
                     <div class="pgt-no-wallets">
                         <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; opacity: 0.3; margin-bottom: 8px;">
                             <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18H21M12,16V8H21V16H12Z"/>
                         </svg>
                         <p>No wallets tracked yet</p>
                         <small>Enter an address above to start tracking</small>
                     </div>
                 `;
                 if (statsContainer) statsContainer.style.display = 'none';
                 return;
             }
             
             // Show stats
             if (statsContainer) {
                 statsContainer.style.display = 'block';
             }
             
             // Build wallet list
             listContainer.innerHTML = this.pgtTrackedWallets.map(wallet => {
                 const changeClass = wallet.change24h >= 0 ? 'positive' : 'negative';
                 const changeSymbol = wallet.change24h >= 0 ? '+' : '';
                 
                 // Capitalize network name for display
                 const networkDisplay = wallet.network.charAt(0).toUpperCase() + wallet.network.slice(1);
                 
                 // Data source indicator
                 const dataSource = wallet.dataSource || 'unknown';
                 const sourceColor = dataSource === 'PGT_API' ? 'var(--matrix-green)' : 'var(--warning-amber)';
                 const sourceText = dataSource === 'PGT_API' ? 'LIVE' : 'DEMO';
                 const sourceIcon = dataSource === 'PGT_API' ? '●' : '○';
                 
                 return `
                     <div class="pgt-tracked-wallet" data-address="${wallet.address}" data-source="${dataSource}">
                         <div class="pgt-wallet-header">
                             <div class="pgt-wallet-info">
                                 <div class="pgt-wallet-label">
                                     ${wallet.label}
                                     <span class="pgt-data-source" style="color: ${sourceColor}; font-size: 9px; margin-left: 6px;" title="Data Source: ${sourceText}">${sourceIcon}</span>
                                 </div>
                                 <div class="pgt-wallet-network">${networkDisplay}</div>
                             </div>
                             <button class="pgt-remove-btn" onclick="window.FuturisticDashboard.removePGTWallet('${wallet.address}')" title="Remove">
                                 <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>
                             </button>
                         </div>
                         <div class="pgt-wallet-address">${this.formatAddress(wallet.address)}</div>
                         <div class="pgt-wallet-stats">
                             <div class="pgt-wallet-value">
                                 <span class="pgt-value-label">Value:</span>
                                 <span class="pgt-value-amount">${this.formatCurrency(wallet.value)}</span>
                             </div>
                             <div class="pgt-wallet-change ${changeClass}">
                                 <span class="pgt-change-label">24h:</span>
                                 <span class="pgt-change-amount">${changeSymbol}${wallet.change24h.toFixed(2)}%</span>
                             </div>
                         </div>
                         <div class="pgt-wallet-actions">
                             <button class="pgt-action-btn" onclick="window.FuturisticDashboard.viewPGTWalletDetails('${wallet.address}')" title="View Details">
                                 <svg viewBox="0 0 24 24"><path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/></svg>
                             </button>
                             <button class="pgt-action-btn" onclick="window.FuturisticDashboard.refreshPGTWallet('${wallet.address}')" title="Refresh">
                                 <svg viewBox="0 0 24 24"><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/></svg>
                             </button>
                         </div>
                     </div>
                 `;
             }).join('');
             
             // Update summary stats
             this.updatePGTTrackerStats();
         },
         
         updatePGTTrackerStats: function() {
             const totalValue = this.pgtTrackedWallets.reduce((sum, w) => sum + w.value, 0);
             const avgChange = this.pgtTrackedWallets.length > 0
                 ? this.pgtTrackedWallets.reduce((sum, w) => sum + w.change24h, 0) / this.pgtTrackedWallets.length
                 : 0;
             
             const totalTracked = document.getElementById('pgt-total-tracked');
             const totalValueEl = document.getElementById('pgt-total-value');
             const avgChangeEl = document.getElementById('pgt-avg-change');
             
             if (totalTracked) totalTracked.textContent = this.pgtTrackedWallets.length;
             if (totalValueEl) totalValueEl.textContent = this.formatCurrency(totalValue);
             if (avgChangeEl) {
                 avgChangeEl.textContent = `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`;
                 avgChangeEl.style.color = avgChange >= 0 ? 'var(--matrix-green)' : 'var(--danger-red)';
             }
         },
         
         removePGTWallet: function(address) {
             this.pgtTrackedWallets = this.pgtTrackedWallets.filter(
                 w => w.address.toLowerCase() !== address.toLowerCase()
             );
             this.savePGTTrackedWallets();
             this.updatePGTTrackerDisplay();
             this.showPGTNotification('Wallet removed from tracking', 'info');
         },
         
         async refreshPGTWallet(address) {
             const wallet = this.pgtTrackedWallets.find(
                 w => w.address.toLowerCase() === address.toLowerCase()
             );
             
             if (!wallet) return;
             
             try {
                 const portfolioData = await this.fetchPGTWalletData(address);
                 wallet.value = portfolioData.totalValue || 0;
                 wallet.change24h = portfolioData.change24h || 0;
                 wallet.tokens = portfolioData.tokens || [];
                 wallet.lastUpdated = new Date().toISOString();
                 
                 this.savePGTTrackedWallets();
                 this.updatePGTTrackerDisplay();
                 this.showPGTNotification('Wallet data refreshed', 'success');
             } catch (error) {
                 console.error('Error refreshing wallet:', error);
                 this.showPGTNotification('Failed to refresh wallet', 'error');
             }
         },
         
         viewPGTWalletDetails: function(address) {
             const wallet = this.pgtTrackedWallets.find(
                 w => w.address.toLowerCase() === address.toLowerCase()
             );
             
             if (!wallet) return;
             
             // Log detailed portfolio to terminal
             if (window.terminal && window.terminal.log) {
                 window.terminal.log('═══════════════════════════════════════', 'info');
                 window.terminal.log(`📊 PORTFOLIO DETAILS: ${wallet.label}`, 'success');
                 window.terminal.log('═══════════════════════════════════════', 'info');
                 window.terminal.log(`Address: ${wallet.address}`, 'info');
                 window.terminal.log(`Network: ${wallet.network}`, 'info');
                 window.terminal.log(`Total Value: ${this.formatCurrency(wallet.value)}`, 'info');
                 window.terminal.log(`24h Change: ${wallet.change24h >= 0 ? '+' : ''}${wallet.change24h.toFixed(2)}%`, 
                     wallet.change24h >= 0 ? 'success' : 'error');
                 
                 if (wallet.tokens && wallet.tokens.length > 0) {
                     window.terminal.log('\nToken Holdings:', 'info');
                     wallet.tokens.forEach(token => {
                         window.terminal.log(
                             `  • ${token.symbol}: ${token.amount.toFixed(4)} ($${token.value.toFixed(2)})`,
                             'info'
                         );
                     });
                 }
                 
                 window.terminal.log(`\nLast Updated: ${new Date(wallet.lastUpdated).toLocaleString()}`, 'info');
                 window.terminal.log('═══════════════════════════════════════', 'info');
             }
         },
         
         startPGTTrackerRefresh: function() {
             // Refresh all tracked wallets every 2 minutes
             this.pgtUpdateInterval = setInterval(() => {
                 this.pgtTrackedWallets.forEach(wallet => {
                     this.refreshPGTWallet(wallet.address);
                 });
             }, 120000); // 2 minutes
         },
         
         savePGTTrackedWallets: function() {
             localStorage.setItem('pgt-tracked-wallets', JSON.stringify(this.pgtTrackedWallets));
         },
         
         formatAddress: function(address) {
             if (address.length <= 16) return address;
             return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
         },
         
         generateWalletLabel: function(address) {
             return `Wallet ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
         },
         
         detectNetwork: function(address) {
             if (address.startsWith('0x') && address.length === 42) {
                 return 'ethereum';
             } else if (address.length >= 32 && address.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
                 return 'solana';
             } else if (address.includes('.near') || (address.length >= 2 && address.length <= 64 && /^[a-z0-9_-]+$/.test(address))) {
                 return 'near';
             }
             return 'ethereum'; // Default to ethereum
         },
         
         showPGTNotification: function(message, type = 'info') {
             if (window.terminal && window.terminal.log) {
                 window.terminal.log(`🎯 PGT Tracker: ${message}`, type);
             }
             console.log(`[PGT Tracker] ${message}`);
         },
        
        startMonitoring: function() {
            // Update network info every 5 seconds
            setInterval(() => {
                this.updateNetworkInfo();
            }, 5000);
            
            // Update wallet and network status every 2 seconds
            setInterval(() => {
                this.updateWalletAndNetworkStatus();
            }, 2000);
            
            // Update uptime every second
            setInterval(() => {
                const uptime = Math.floor((Date.now() - this.startTime) / 1000);
                const hours = Math.floor(uptime / 3600).toString().padStart(2, '0');
                const mins = Math.floor((uptime % 3600) / 60).toString().padStart(2, '0');
                const secs = (uptime % 60).toString().padStart(2, '0');
                const uptimeEl = document.getElementById('futuristic-uptime');
                if (uptimeEl) {
                    uptimeEl.textContent = `${hours}:${mins}:${secs}`;
                }
            }, 1000);
            
            // Initial network info fetch
            this.updateNetworkInfo();
        },
        
        async updateNetworkInfo() {
            // Update active chain info
            if (window.ethereum && window.ethereum.selectedAddress) {
                try {
                    // Get chain ID
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    const chainName = this.getEthereumNetworkName(chainId);
                    document.getElementById('futuristic-active-chain').textContent = chainName;
                    
                    // Get gas price
                    const gasPrice = await window.ethereum.request({ method: 'eth_gasPrice' });
                    const gasPriceGwei = parseInt(gasPrice, 16) / 1e9;
                    document.getElementById('futuristic-gas-price').textContent = gasPriceGwei.toFixed(2) + ' Gwei';
                    
                    // Get block number
                    const blockNumber = await window.ethereum.request({ method: 'eth_blockNumber' });
                    document.getElementById('futuristic-block-number').textContent = parseInt(blockNumber, 16).toLocaleString();
                    
                    // Wallet type
                    document.getElementById('futuristic-wallet-type').textContent = 'MetaMask';
                } catch (error) {
                    // Silently handle errors
                }
            } else if (window.solana && window.solana.isConnected) {
                // Solana network info
                document.getElementById('futuristic-active-chain').textContent = this.getSolanaNetwork();
                document.getElementById('futuristic-gas-price').textContent = 'N/A';
                document.getElementById('futuristic-block-number').textContent = 'N/A';
                document.getElementById('futuristic-wallet-type').textContent = 'Phantom';
            } else if (window.walletConnection && window.walletConnection.isSignedIn()) {
                // NEAR network info
                document.getElementById('futuristic-active-chain').textContent = this.getNearNetwork();
                document.getElementById('futuristic-gas-price').textContent = 'N/A';
                document.getElementById('futuristic-block-number').textContent = 'N/A';
                document.getElementById('futuristic-wallet-type').textContent = 'NEAR Wallet';
            } else {
                // Not connected
                document.getElementById('futuristic-active-chain').textContent = 'Not Connected';
                document.getElementById('futuristic-gas-price').textContent = '-- Gwei';
                document.getElementById('futuristic-block-number').textContent = '--';
                document.getElementById('futuristic-wallet-type').textContent = 'None';
            }
        },
        
        updateWalletAndNetworkStatus: async function() {
            const addressEl = document.getElementById('futuristic-address');
            const connectionStatusEl = document.getElementById('futuristic-connection-status');
            const connectionTextEl = document.getElementById('futuristic-connection-text');
            const walletInfoEl = document.getElementById('futuristic-wallet-info');
            const networkInfoEl = document.getElementById('futuristic-network-info');
            
            if (!addressEl || !connectionStatusEl || !connectionTextEl || !walletInfoEl || !networkInfoEl) {
                return;
            }
            
            // Check MetaMask (Ethereum)
            if (window.ethereum && window.ethereum.selectedAddress) {
                const addr = window.ethereum.selectedAddress;
                addressEl.textContent = addr.substring(0, 6) + '...' + addr.substring(38);
                connectionStatusEl.className = 'status-dot active';
                connectionTextEl.textContent = 'CONNECTED';
                walletInfoEl.textContent = 'METAMASK';
                
                // Get network name
                try {
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    const networkName = this.getEthereumNetworkName(chainId);
                    networkInfoEl.textContent = networkName;
                } catch (error) {
                    networkInfoEl.textContent = 'ETHEREUM';
                }
                return;
            }
            
            // Check Phantom (Solana)
            if (window.solana && window.solana.isConnected && window.solana.publicKey) {
                const addr = window.solana.publicKey.toString();
                addressEl.textContent = addr.substring(0, 6) + '...' + addr.substring(addr.length - 6);
                connectionStatusEl.className = 'status-dot active';
                connectionTextEl.textContent = 'CONNECTED';
                walletInfoEl.textContent = 'PHANTOM';
                
                // Detect Solana network
                const network = this.getSolanaNetwork();
                networkInfoEl.textContent = network;
                return;
            }
            
            // Check NEAR Wallet
            if (window.walletConnection && window.walletConnection.isSignedIn()) {
                const addr = window.walletConnection.getAccountId();
                addressEl.textContent = addr;
                connectionStatusEl.className = 'status-dot active';
                connectionTextEl.textContent = 'CONNECTED';
                walletInfoEl.textContent = 'NEAR WALLET';
                
                // Detect NEAR network
                const network = this.getNearNetwork();
                networkInfoEl.textContent = network;
                return;
            }
            
            // No wallet connected
            addressEl.textContent = 'Not Connected';
            connectionStatusEl.className = 'status-dot';
            connectionTextEl.textContent = 'DISCONNECTED';
            walletInfoEl.textContent = 'NO WALLET';
            networkInfoEl.textContent = 'NO NETWORK';
        },
        
        getEthereumNetworkName: function(chainId) {
            const networks = {
                '0x1': 'ETHEREUM MAINNET',
                '0x5': 'GOERLI TESTNET',
                '0xaa36a7': 'SEPOLIA TESTNET',
                '0x89': 'POLYGON',
                '0x13881': 'MUMBAI TESTNET',
                '0x38': 'BSC MAINNET',
                '0x61': 'BSC TESTNET',
                '0xa86a': 'AVALANCHE',
                '0xa869': 'FUJI TESTNET',
                '0xa4b1': 'ARBITRUM',
                '0x66eed': 'ARBITRUM GOERLI',
                '0xa': 'OPTIMISM',
                '0x1a4': 'OPTIMISM GOERLI',
                '0x64': 'GNOSIS CHAIN',
                '0x2105': 'BASE',
                '0x14a33': 'BASE GOERLI',
                '0x144': 'ZKSYNC ERA',
                '0x118': 'ZKSYNC TESTNET'
            };
            
            return networks[chainId] || `CHAIN ${parseInt(chainId, 16)}`;
        },
        
        getSolanaNetwork: function() {
            // Try to detect Solana network from RPC endpoint or cluster
            if (window.solanaWeb3 && window.solanaWeb3.clusterApiUrl) {
                const connection = window.solana?.connection;
                if (connection) {
                    const endpoint = connection._rpcEndpoint || connection.rpcEndpoint;
                    
                    if (endpoint.includes('devnet')) {
                        return 'SOLANA DEVNET';
                    } else if (endpoint.includes('testnet')) {
                        return 'SOLANA TESTNET';
                    } else if (endpoint.includes('mainnet')) {
                        return 'SOLANA MAINNET';
                    }
                }
            }
            
            // Default to mainnet
            return 'SOLANA MAINNET';
        },
        
        getNearNetwork: function() {
            // Check NEAR network configuration
            if (window.nearConfig) {
                if (window.nearConfig.networkId === 'mainnet') {
                    return 'NEAR MAINNET';
                } else if (window.nearConfig.networkId === 'testnet') {
                    return 'NEAR TESTNET';
                } else {
                    return `NEAR ${window.nearConfig.networkId.toUpperCase()}`;
                }
            }
            
            // Check wallet connection for network info
            if (window.walletConnection && window.walletConnection._networkId) {
                const networkId = window.walletConnection._networkId;
                if (networkId === 'mainnet') {
                    return 'NEAR MAINNET';
                } else if (networkId === 'testnet') {
                    return 'NEAR TESTNET';
                } else {
                    return `NEAR ${networkId.toUpperCase()}`;
                }
            }
            
            // Default to testnet (most common for development)
            return 'NEAR TESTNET';
        },
        
        cycleTheme: function() {
            if (window.OmegaCustomizer) {
                window.OmegaCustomizer.cycleColorScheme();
            }
        },
        
        toggleClassicMode: function() {
            const dashboard = document.querySelector('.omega-dashboard');
            const terminal = document.getElementById('terminal');
            
            if (dashboard && terminal) {
                // Toggle visibility
                if (dashboard.style.display === 'none') {
                    // Switch to futuristic mode
                    dashboard.style.display = 'grid';
                    document.body.classList.add('futuristic-mode');
                    console.log('🎨 Switched to Futuristic Mode');
                } else {
                    // Switch to classic mode
                    dashboard.style.display = 'none';
                    terminal.style.display = 'flex';
                    terminal.style.position = 'relative';
                    terminal.style.width = '100%';
                    terminal.style.height = '100vh';
                    terminal.style.maxWidth = '100%';
                    document.body.classList.remove('futuristic-mode');
                    console.log('🎨 Switched to Classic Mode');
                }
            }
        }
    };
    
    // Auto-transform when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', transformToDashboard);
    } else {
        transformToDashboard();
    }
    
})();

