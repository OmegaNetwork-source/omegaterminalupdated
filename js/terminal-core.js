// Omega Terminal Core Class
class OmegaMinerTerminal {
    constructor() {
        // VERSION CHECK - This should be visible in terminal if updated code is loaded
        console.log('🚀 OMEGA TERMINAL CONSTRUCTOR v2.0.1');
        this.version = '2.0.1';
        
        this.tabs = [{ id: 0, name: 'Terminal 1', history: [], output: [] }];
        this.activeTab = 0;
        console.log('[DEBUG] OmegaMinerTerminal constructor called');
        
        if (window && window.terminal) {
            console.log('[DEBUG] Previous terminal instance found, overwriting');
        }
        
        // Terminal state
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.sessionOmegaWallet = null;
        this.ethers = null;
        
        // Mining system properties
        this.isMining = false;
        this.miningInterval = null;
        this.currentNonce = 0;
        this.pendingClaimableBalance = 0;
        this.totalEarned = 0;
        this.waitingForContinueResponse = false;
        
        // Stress test properties
        this.isStressTesting = false;
        this.stressTestInterval = null;
        this.stressTestStats = {
            walletsCreated: 0,
            transactionsSent: 0,
            successfulTxs: 0,
            failedTxs: 0,
            startTime: 0
        };
        this.stressWallet = null;
        this.stressNonce = 0;
        
        // Input handling state
        this.awaitingPromptInput = false;
        this.promptResolver = null;
        this.awaitingWalletChoice = false;
        this.awaitingPrivateKeyImport = false;
        this.awaitingDMRecipient = false;
        this.awaitingDMMessage = false;
        this.tempDMRecipient = '';
        
        // Mixer input states
        this.awaitingMixerDirectInput = false;
        this.awaitingMixerDirectAmount = false;
        this.awaitingPrivateKey = false;
        this.awaitingMixerWithdrawDirect = false;
        this.awaitingMixerWithdrawDirectParams = false;
        this.storedPrivateKey = null;
        
        // Animation state
        this.currentAnimation = null;
        
        // Initialize theme system
        this.isDarkTheme = true;
        const savedTheme = localStorage.getItem('omega-terminal-theme');
        if (savedTheme) {
            this.isDarkTheme = savedTheme === 'dark';
        }
        
        console.log('[DEBUG] Calling init() from constructor');
        this.init();
    }
    
    async init() {
        this.log('🚀 OMEGA TERMINAL v2.0.1 INITIALIZING', 'info');
        this.log('🎉 NEW IN v2.0.1: Enhanced AI Command Execution & NEAR Wallet Integration', 'success');
        console.log('[DEBUG] init() started - VERSION 2.0.1');
        
        // Show boot animation first
        console.log('[DEBUG] Calling showBootAnimation()');
        await this.showBootAnimation();
        console.log('[DEBUG] showBootAnimation() resolved');
        
        // Setup event listeners
        console.log('[DEBUG] Calling setupEventListeners()');
        this.setupEventListeners();
        
        // Ensure command input is set up immediately
        console.log('[DEBUG] Calling ensureCommandInputVisible() immediately');
        this.ensureCommandInputVisible();
        
        // Additional safety check for command input after a short delay
        setTimeout(() => {
            console.log('[DEBUG] Calling ensureCommandInputVisible() again as safety check');
            this.ensureCommandInputVisible();
        }, 100);
        
        try {
            console.log('[DEBUG] Loading ethers library...');
            this.ethers = await window.loadEthers();
            console.log('[DEBUG] Ethers library loaded successfully');
            
            console.log('[DEBUG] About to check for MetaMask');
            // Always show wallet options to user regardless of detection
            this.log('🚀 Welcome to Omega Terminal!', 'success');
            this.log('', 'output');
            this.log('Choose your wallet option:', 'info');
            this.logHtml(`
                <div style="background: rgba(255,255,255,0.05); border: 1px solid #ffffff; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffffff;">Wallet Options:</div>
                    <div style="margin: 8px 0; padding: 8px; border: 2px solid #00ff41; border-radius: 5px; background: rgba(0,255,65,0.1);">
                        <span style="color:#00ff41; font-weight: bold; font-size: 14px;">shade</span> - <span style="color:#00ff41;">Shade Agent [Multi Chain Wallet]</span>
                        <div style="font-size: 11px; color: #aaa; margin-top: 3px;">🤖 AI-powered wallet across Bitcoin, Ethereum, Solana, NEAR & more</div>
                    </div>
                    <div style="margin: 8px 0;">
                        <span style="color:#33bbff; font-weight: bold;">connect</span> - Connect your MetaMask wallet
                    </div>
                    <div style="margin: 8px 0;">
                        <span style="color:#33bbff; font-weight: bold;">yes</span> - Create new Omega wallet (auto-funded)
                    </div>
                    <div style="margin: 8px 0;">
                        <span style="color:#33bbff; font-weight: bold;">import</span> - Import existing wallet with private key
                    </div>
                    <div style="margin-top: 15px; font-size: 12px; color: #999;">
                        🤖 Advanced users: Type <b>shade</b> for multi-chain AI wallet<br>
                        💡 New users: Type <b>yes</b> for instant funded wallet<br>
                        🦊 MetaMask users: Type <b>connect</b><br>
                        🔐 Have private key: Type <b>import</b>
                    </div>
                </div>
            `, 'output');
            this.awaitingWalletChoice = true;
        } catch (error) {
            console.log('[DEBUG] Error in init() catch block', error);
            console.error('Failed to load ethers:', error);
            this.log('Failed to load ethers library: ' + error.message, 'error');
            this.log('Please check your internet connection and refresh the page', 'error');
        }
        
        // Check NEAR wallet connection status (for wallet redirects)
        try {
            if (window.OmegaCommands && window.OmegaCommands.Near) {
                await OmegaCommands.Near.checkConnectionStatus(this);
            }
        } catch (error) {
            console.log('[DEBUG] Error checking NEAR connection status:', error);
        }
    }
    
    async showBootAnimation() {
        console.log('[DEBUG] showBootAnimation() called');
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('[DEBUG] Hiding boot animation, showing terminal');
                document.getElementById('bootAnimation').style.display = 'none';
                document.getElementById('terminal').style.display = 'flex';
                OmegaThemes.applyTheme();
                
                // Show helpful URLs at the very top
                this.logHtml('Helpful URLs:', 'info');
                this.logHtml('Gitbook: <a href="https://omega-6.gitbook.io/omega" target="_blank" style="color:#fff;">https://omega-6.gitbook.io/omega</a>', 'info');
                this.logHtml('Block Explorer: <a href="https://0x4e454228.explorer.aurora-cloud.dev/" target="_blank" style="color:#fff;">https://0x4e454228.explorer.aurora-cloud.dev/</a>', 'info');
                this.logHtml('Website: <a href="https://omeganetwork.co" target="_blank" style="color:#fff;">omeganetwork.co</a>', 'info');
                
                // Show the getting started modal
                this.showGettingStartedModal();
                resolve();
            }, 3000);
        });
    }

    showGettingStartedModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="gettingStartedModal">
                <div class="modal-content">
                    <div class="modal-title">🚀 How To Get Started</div>
                    <div class="modal-steps">
                        <div class="modal-step">
                            <span class="modal-step-number">1.</span>
                            Type <span style="color:#33bbff;font-weight:bold;">connect</span> for MetaMask, <span style="color:#33bbff;font-weight:bold;">yes</span> for new Omega Wallet, or <span style="color:#33bbff;font-weight:bold;">import</span> for existing wallet
                        </div>
                        <div class="modal-step">
                            <span class="modal-step-number">2.</span>
                            Type <span style="color:#33bbff;font-weight:bold;">help</span> for a list of commands
                        </div>
                    </div>
                    <button class="modal-button" onclick="document.getElementById('gettingStartedModal').remove(); document.getElementById('commandInput').focus();">
                        Let's Get Started!
                    </button>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Focus on the button for accessibility
        setTimeout(() => {
            const button = document.querySelector('.modal-button');
            if (button) button.focus();
        }, 100);
    }
    
    setupEventListeners() {
        const input = document.getElementById('commandInput');
        if (input) {
            input.focus();
            
            // Command history and autocomplete state
            this.commandHistory = [];
            this.historyIndex = -1;
            this.lastInputValue = '';
            
            input.addEventListener('keydown', (e) => {
                // Up arrow: previous command
                if (e.key === 'ArrowUp') {
                    if (this.commandHistory.length > 0) {
                        if (this.historyIndex === -1) {
                            this.historyIndex = this.commandHistory.length - 1;
                            this.lastInputValue = input.value;
                        } else if (this.historyIndex > 0) {
                            this.historyIndex--;
                        }
                        input.value = this.commandHistory[this.historyIndex];
                        setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
                    }
                    e.preventDefault();
                }
                
                // Down arrow: next command or clear
                if (e.key === 'ArrowDown') {
                    if (this.commandHistory.length > 0 && this.historyIndex !== -1) {
                        if (this.historyIndex < this.commandHistory.length - 1) {
                            this.historyIndex++;
                            input.value = this.commandHistory[this.historyIndex];
                        } else {
                            this.historyIndex = -1;
                            input.value = this.lastInputValue || '';
                        }
                        setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
                    }
                    e.preventDefault();
                }
                
                // Tab: autocomplete
                if (e.key === 'Tab') {
                    e.preventDefault();
                    // Use getRealValue if available (for cursor-positioned inputs) or fallback to normal value
                    const rawValue = input.getRealValue ? input.getRealValue() : input.value;
                    const val = rawValue.trim();
                    if (!val) return;
                    const matches = OmegaConfig.AVAILABLE_COMMANDS.filter(cmd => cmd.startsWith(val));
                    if (matches.length === 1) {
                        if (input.getRealValue) {
                            // For cursor-positioned input, set the real value with padding
                            const CURSOR_PADDING = '                                                                    ';
                            input.value = matches[0] + ' ' + CURSOR_PADDING;
                            input.setSelectionRange(matches[0].length + 1, matches[0].length + 1);
                        } else {
                            input.value = matches[0] + ' ';
                        }
                    } else if (matches.length > 1) {
                        this.logHtml('<span style="color:#cccccc">' + matches.join('    ') + '</span>', 'info');
                    }
                }
            });
            
            // Event listener will be attached by ensureCommandInputVisible method
            // to prevent duplicate listeners
            
            // Fallback: refocus input if user clicks anywhere in the terminal
            document.getElementById('terminal').addEventListener('click', function() {
                input.focus();
            });
        }
        
        // Setup AI toggle (placeholder)
        const aiToggle = document.querySelector('.ai-toggle');
        if (aiToggle) {
            aiToggle.addEventListener('click', () => {
                const aiToggle = document.querySelector('.ai-toggle');
        const currentState = localStorage.getItem('omega-ai-mode') === 'true';
        const newState = !currentState;
        
        localStorage.setItem('omega-ai-mode', newState.toString());
        
        if (aiToggle) {
            aiToggle.textContent = newState ? 'AI Mode: ON' : 'AI Mode: OFF';
        }
        
        if (newState) {
            this.log('🤖 AI Mode: ON', 'success');
            this.log('🧠 SMART MODE: All commands now get intelligent assistance!', 'info');
            this.log('💡 Just type normal commands like "balance" or "create token MyToken 1000"', 'info');
            this.log('💡 AI will provide helpful guidance and execute your commands', 'info');
        } else {
            this.log('🤖 AI Mode: OFF', 'info');
            this.log('💡 AI assistance disabled. Commands execute normally. Type "help" for options', 'info');
        }
            });
        }

        // Setup theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                OmegaThemes.toggleTheme();
            });
            themeToggle.textContent = '';
        }

        // Setup tab system
        const addTabBtn = document.getElementById('addTabBtn');
        if (addTabBtn) {
            addTabBtn.addEventListener('click', () => {
                const newId = this.tabs.length;
                this.tabs.push({ id: newId, name: `Terminal ${newId + 1}`, history: [], output: [] });
                this.activeTab = newId;
                this.renderTabs();
                this.clearTerminal();
                this.log(`Created new tab: Terminal ${newId + 1}`, 'info');
            });
        }
        
        // Initialize tab system
        this.renderTabs();
    }
    
    // Execute command by routing to appropriate module
    async executeCommand(command) {
        // DEBUG: Add logging to trace execution
        console.log(`[DEBUG] executeCommand called with: "${command}"`);
        console.log(`[DEBUG] awaitingWalletChoice: ${this.awaitingWalletChoice}`);
        
        // Parse command args early for special input states
        const args = OmegaUtils.parseCommandArgs(command);
        
        // Handle special input states first
        if (this.awaitingWalletChoice) {
            console.log(`[DEBUG] Handling wallet choice: ${command}`);
            this.awaitingWalletChoice = false;
            await OmegaCommands.Wallet.handleWalletChoice(this, command.trim().toLowerCase());
            console.log(`[DEBUG] Wallet choice handled, returning`);
            return;
        }
        
        if (this.awaitingPrivateKeyImport) {
            this.awaitingPrivateKeyImport = false;
            await OmegaCommands.Wallet.handlePrivateKeyImport(this, command);
            return;
        }
        
        // Handle mixer direct input states
        if (this.awaitingMixerDirectInput && args.length === 2) {
            this.awaitingMixerDirectInput = false;
            const privateKeyInput = args[0];
            const amountStr = args[1];
            await OmegaCommands.Mixer.handleMixerDirectInput(this, privateKeyInput, amountStr);
            return;
        }
        
        if (this.awaitingPrivateKey && this.awaitingMixerWithdrawDirect && args.length === 1) {
            // Withdraw-direct: received private key
            this.awaitingPrivateKey = false;
            this.awaitingMixerWithdrawDirect = false;
            this.storedPrivateKey = args[0];
            this.log('Now enter your secret and withdrawal address separated by a space:', 'info');
            this.awaitingMixerWithdrawDirectParams = true;
            return;
        }
        
        if (this.awaitingMixerWithdrawDirectParams && args.length === 2) {
            // Withdraw-direct: received secret and address
            this.awaitingMixerWithdrawDirectParams = false;
            const secret = args[0];
            const address = args[1];
            const privateKey = this.storedPrivateKey;
            this.storedPrivateKey = null;
            await OmegaCommands.Mixer.handleMixerWithdrawDirectParams(this, secret, address, privateKey);
            return;
        }
        
        // Removed NEAR account input handling - using real wallet now
        
        // Handle email/DM input states
        if (this.awaitingDMRecipient) {
            this.tempDMRecipient = command.trim();
            this.awaitingDMRecipient = false;
            this.awaitingDMMessage = true;
            this.logHtml('<span style="color:#99ccff">Recipient:</span> <span style="color:#fff">' + this.tempDMRecipient + '</span>', 'info');
            this.log('Enter your message:', 'info');
            return;
        }
        
        if (this.awaitingDMMessage) {
            const message = command.trim();
            const recipient = this.tempDMRecipient;
            this.awaitingDMMessage = false;
            this.tempDMRecipient = '';
            if (!recipient || !message) {
                this.log('Recipient and message required.', 'error');
                return;
            }
            this.logHtml('<span style="color:#99ccff">Message:</span> <span style="color:#fff">' + message + '</span>', 'info');
            await OmegaCommands.Remaining.sendDirectMessage(this, recipient, message);
            return;
        }
        
        this.logCommand(command);
        
        // Hide faucet info box after first command
        try {
            const infoBox = document.getElementById('faucetInfoBox');
            if (infoBox && infoBox.style.display !== 'none') {
                infoBox.style.display = 'none';
            }
        } catch (e) {}
        
        const cmd = args[0].toLowerCase();
        
        // Debug logging
        console.log(`[DEBUG] Command executed: "${command}"`);
        console.log(`[DEBUG] Parsed command: "${cmd}"`);
        console.log(`[DEBUG] Arguments:`, args);

        // AI Mode handles unknown/natural language commands in the default case below

        // Route commands to appropriate modules
        try {
            switch (cmd) {
                // Basic commands
                case 'help':
                    OmegaCommands.Basic.help(this);
                    break;
                case 'clear':
                    OmegaCommands.Basic.clear(this);
                    break;
                case 'theme':
                    OmegaCommands.Basic.theme(this, args);
                    break;
                            case 'gui':
                OmegaCommands.Basic.gui(this, args);
                break;
            case 'ai':
                OmegaCommands.Basic.ai(this, args);
                break;
                case 'status':
                    OmegaCommands.Basic.status(this);
                    break;
                case 'tab':
                    OmegaCommands.Basic.tab(this, args);
                    break;
                
                // Wallet commands
                case 'connect':
                    await OmegaCommands.Wallet.connect(this);
                    break;
                case 'disconnect':
                    await OmegaCommands.Wallet.disconnect(this);
                    break;
                case 'balance':
                    await OmegaCommands.Wallet.balance(this);
                    break;
                case 'send':
                    await OmegaCommands.Wallet.send(this, command);
                    break;
                case 'import':
                    this.log('💡 To import a wallet, use "import" directly when prompted at startup', 'info');
                    this.log('🔄 Or refresh the page to see wallet options again', 'info');
                    break;
                
                // Mining commands
                case 'mine':
                    await OmegaCommands.Mining.mine(this);
                    break;
                case 'claim':
                    await OmegaCommands.Mining.claim(this);
                    break;
                case 'faucet':
                    await OmegaCommands.Mining.faucet(this, args);
                    break;
                case 'stats':
                    await OmegaCommands.Mining.stats(this);
                    break;
                
                // Entertainment commands
                case 'rickroll':
                    OmegaCommands.Entertainment.rickroll(this);
                    break;
                case 'matrix':
                    OmegaCommands.Entertainment.matrix(this);
                    break;
                case 'hack':
                    OmegaCommands.Entertainment.hack(this);
                    break;
                case 'disco':
                    OmegaCommands.Entertainment.disco(this);
                    break;
                case 'fortune':
                    OmegaCommands.Entertainment.fortune(this);
                    break;
                case 'stop':
                    OmegaCommands.Entertainment.stop(this);
                    break;
                case 'ascii':
                    OmegaCommands.Entertainment.ascii(this, args);
                    break;
                
                // Network/Stress Testing commands
                case 'stress':
                    await OmegaCommands.Network.stress(this);
                    break;
                case 'stopstress':
                    OmegaCommands.Network.stopstress(this);
                    break;
                case 'stressstats':
                    OmegaCommands.Network.stressstats(this);
                    break;
                
                // Mixer privacy commands
                case 'mixer':
                    await OmegaCommands.Mixer.mixer(this, args);
                    break;
                
                // API integration commands
                case 'dexscreener':
                    await OmegaCommands.API.dexscreener(this, args);
                    break;
                case 'ds':
                    await OmegaCommands.API.ds(this, args);
                    break;
                case 'geckoterminal':
                    await OmegaCommands.API.geckoterminal(this, args);
                    break;
                case 'cg':
                    await OmegaCommands.API.cg(this, args);
                    break;
                case 'alpha':
                    await OmegaCommands.API.alpha(this, args);
                    break;
                case 'stock':
                    await OmegaCommands.API.stock(this, args);
                    break;
                case 'alphakey':
                    OmegaCommands.API.alphakey(this, args);
                    break;
                
                // Remaining commands (placeholder implementations)
                case 'email':
                    OmegaCommands.Remaining.email(this, args);
                    break;
                case 'inbox':
                    OmegaCommands.Remaining.inbox(this, args);
                    break;
                case 'ens':
                    await OmegaCommands.Remaining.ens(this, args);
                    break;
                case 'airdrop':
                    OmegaCommands.Remaining.airdrop(this, args);
                    break;
                case 'solana':
                    await OmegaCommands.Solana.solana(this, args);
                    break;
                case 'near':
                    await OmegaCommands.Near.near(this, args);
                    break;

                case 'eclipse':
                    await OmegaCommands.Eclipse.eclipse(this, args);
                    break;
                case 'hyperliquid':
                    OmegaCommands.Remaining.hyperliquid(this, args);
                    break;
                case 'polymarket':
                    OmegaCommands.Remaining.polymarket(this, args);
                    break;
                case 'magiceden':
                    OmegaCommands.Remaining.magiceden(this, args);
                    break;
                case 'create':
                    await OmegaCommands.Remaining.createToken(this, args);
                    break;
                case 'rome':
                    OmegaCommands.Remaining.rome(this, args);
                    break;
                
                default:
                    // DEBUG: Log when we hit unknown command
                    console.log(`[DEBUG] Hit default case for command: "${cmd}"`);
                    console.log(`[DEBUG] Original command: "${command}"`);
                    console.log(`[DEBUG] awaitingWalletChoice: ${this.awaitingWalletChoice}`);
                    
                    // Check if AI mode should handle unknown commands
                    const isAIMode = localStorage.getItem('omega-ai-mode') === 'true';
                    if (isAIMode && cmd.trim()) {
                        // In AI mode, treat unknown commands as natural language
                        this.log(`🤖 AI Mode: Interpreting "${cmd}" as natural language...`, 'info');
                        OmegaCommands.Basic.callAI(this, cmd, true);
                    } else {
                        this.log(`❌ Unknown command: ${cmd}`, 'error');
                        this.log('Type "help" to see available commands', 'info');
                        if (!isAIMode) {
                            this.log('💡 Enable AI Mode for natural language assistance!', 'info');
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Command execution error:', error);
            this.log(`❌ Error executing command: ${error.message}`, 'error');
        }
    }
    
    // Logging methods
    log(message, type = 'output') {
        this.logHtml(OmegaUtils.escapeHtml(message), type);
    }
    
    logHtml(html, type = 'output') {
        const content = document.getElementById('terminalContent');
        if (content) {
            const line = document.createElement('div');
            line.className = `terminal-line output ${type}`;
            line.innerHTML = html;
            content.appendChild(line);
            content.scrollTop = content.scrollHeight;
        }
    }
    
    logCommand(command) {
        this.logHtml(`<span class="prompt">root@omega-miner:~$</span> <span class="command">${OmegaUtils.escapeHtml(command)}</span>`, 'output');
    }
    
    clearTerminal() {
        const content = document.getElementById('terminalContent');
        if (content) {
            content.innerHTML = '';
        }
    }
    
    // Terminal input prompting
    promptTerminalInput() {
        return new Promise((resolve) => {
            this.awaitingPromptInput = true;
            this.promptResolver = resolve;
        });
    }
    
    // Connection status update
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    // Tab system methods
    renderTabs() {
        const tabBar = document.getElementById('tabBar');
        if (!tabBar) return;
        
        // Clear existing tabs except the add button
        const addBtn = document.getElementById('addTabBtn');
        tabBar.innerHTML = '';
        
        this.tabs.forEach((tab, index) => {
            const tabElement = document.createElement('div');
            tabElement.className = `tab ${index === this.activeTab ? 'active' : ''}`;
            tabElement.dataset.tab = index;
            tabElement.style.cssText = 'padding: 8px 18px; cursor: pointer; border-right: 1px solid #333; color: #fff; font-weight: bold; display: flex; align-items: center; position: relative;';
            tabElement.onclick = (e) => {
                // Prevent switching if close button is clicked
                if (e.target.classList.contains('tab-close')) return;
                this.switchTab(index);
            };
            tabElement.textContent = tab.name;
            
            // Add close button for all tabs except the first
            if (index > 0) {
                const closeBtn = document.createElement('span');
                closeBtn.textContent = ' ×';
                closeBtn.className = 'tab-close';
                closeBtn.style.cssText = 'margin-left: 8px; color: #ff3333; cursor: pointer; font-weight: bold;';
                closeBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.closeTab(index);
                };
                tabElement.appendChild(closeBtn);
            }
            
            tabBar.appendChild(tabElement);
        });
        
        // Re-add the add button
        if (addBtn) {
            tabBar.appendChild(addBtn);
        }
    }

    switchTab(index) {
        if (index === this.activeTab) return;
        this.activeTab = index;
        this.renderTabs();
        this.loadTabContent();
    }

    closeTab(index) {
        if (index === 0) return; // Never close the first tab
        this.tabs.splice(index, 1);
        // Adjust activeTab if needed
        if (this.activeTab >= index) {
            this.activeTab = Math.max(0, this.activeTab - 1);
        }
        this.renderTabs();
        this.loadTabContent();
    }

    loadTabContent() {
        // For now, clear the terminal content when switching tabs
        // In a full implementation, each tab would have its own content
        this.clearTerminal();
        this.log('=== Tab System Active ===', 'info');
        this.log(`You are now on ${this.tabs[this.activeTab].name}`, 'info');
        this.log('Each tab maintains its own history and content.', 'info');
    }
    
    // Ensure command input is visible and functional
    ensureCommandInputVisible() {
        console.log('[DEBUG] ensureCommandInputVisible() called');
        const input = document.getElementById('commandInput');
        const inputSection = document.querySelector('.terminal-input-section');
        console.log('[DEBUG] Found input:', !!input, 'inputSection:', !!inputSection);
        
        if (input && inputSection) {
            // Make sure elements are visible
            inputSection.style.display = 'flex';
            input.style.display = 'block';
            input.style.visibility = 'visible';
            
            // Remove any existing event listeners by cloning
            if (!input.dataset.listenerAttached) {
                input.dataset.listenerAttached = 'true';
                
                // Attach single event listener with full functionality
                input.addEventListener('keypress', async (e) => {
                    console.log(`[DEBUG] Keypress event fired: key="${e.key}", target.value="${e.target.value}"`);
                    
                    if (e.key === 'Enter') {
                        // Prevent event bubbling/default behavior (Chrome fix)
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const val = e.target.value;
                        console.log(`[DEBUG] Enter pressed, captured value: "${val}"`);
                        e.target.value = '';
                        
                        if (this.awaitingPromptInput && this.promptResolver) {
                            const value = val.trim();
                            this.awaitingPromptInput = false;
                            this.promptResolver(value);
                            this.promptResolver = null;
                        } else {
                            if (val.trim()) {
                                this.commandHistory.push(val.trim());
                                if (this.commandHistory.length > 100) this.commandHistory.shift();
                            }
                            this.historyIndex = -1;
                            this.lastInputValue = '';
                            console.log(`[DEBUG] About to call executeCommand with: "${val}"`);
                            await this.executeCommand(val);
                        }
                    }
                });
            }
            
            // Focus the input
            input.focus();
            console.log('[DEBUG] Command input visibility and functionality ensured');
        } else {
            console.warn('[DEBUG] Command input or input section not found');
        }
    }
}

// Make terminal class available globally
window.OmegaMinerTerminal = OmegaMinerTerminal; 