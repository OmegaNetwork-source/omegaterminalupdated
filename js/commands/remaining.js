// Remaining Commands Module (Placeholder/Stub implementations)
window.OmegaCommands = window.OmegaCommands || {};

window.OmegaCommands.Remaining = {
    // Email commands (real implementation)
    email: function(terminal, args) {
        if (args && args.length > 1 && args[1] === 'clearkey') {
            terminal.e2eePrivateKey = null;
            terminal.log('E2EE private key cleared from memory.', 'success');
            return;
        }

        if (!OmegaWallet.isConnected()) {
            terminal.log('❌ Please connect your wallet first using: connect', 'error');
            return;
        }

        terminal.awaitingDMRecipient = true;
        terminal.awaitingDMMessage = false;
        terminal.tempDMRecipient = '';
        terminal.log('📧 Send an on-chain encrypted message', 'info');
        terminal.log('Enter recipient (address or ENS):', 'info');
    },

    inbox: async function(terminal, args) {
        if (!OmegaWallet.isConnected()) {
            terminal.log('❌ Please connect your wallet first using: connect', 'error');
            return;
        }

        const showAll = args && args.length > 1 && args[1] === 'all';
        await this.showInbox(terminal, showAll);
    },

    // ENS commands (Omega Network ENS - full implementation)
    ens: async function(terminal, args) {
        if (!args || args.length < 2) {
            terminal.log('Usage: ens register <name> | ens resolve <name> | ens search <name>', 'info');
            terminal.log('Examples:', 'info');
            terminal.log('  ens register myname', 'info');
            terminal.log('  ens resolve myname', 'info');
            terminal.log('  ens search myname', 'info');
            return;
        }

        const subCommand = args[1].toLowerCase();
        
        if (subCommand === 'register' && args[2]) {
            if (!OmegaWallet.isConnected()) {
                terminal.log('❌ Please connect your wallet first using: connect', 'error');
                return;
            }
            
            const name = args[2];
            terminal.log(`📝 Registering ENS name: ${name}...`, 'info');
            try {
                const ens = this.getENSContract(OmegaWallet.getSigner());
                const tx = await ens.register(name);
                terminal.log(`✅ Registration transaction sent: ${tx.hash}`, 'success');
                terminal.log('⏳ Waiting for confirmation...', 'info');
                await tx.wait();
                terminal.log(`✅ Name registered: ${name}`, 'success');
                terminal.logHtml(`🔍 <a href="https://0x4e454228.explorer.aurora-cloud.dev/tx/${tx.hash}" target="_blank">View on Explorer</a>`, 'info');
            } catch (err) {
                terminal.log(`❌ Registration failed: ${err.message}`, 'error');
                if (err.message.includes('already exists')) {
                    terminal.log('💡 This name is already registered by someone else', 'info');
                }
            }
            
        } else if (subCommand === 'resolve' && args[2]) {
            const name = args[2];
            terminal.log(`🌐 Resolving ENS name: ${name}...`, 'info');
            try {
                const ens = this.getENSContract();
                const address = await ens.resolve(name);
                if (address && address !== '0x0000000000000000000000000000000000000000') {
                    terminal.logHtml(`✅ <b>${name}</b> resolves to <span class="copyable" onclick="navigator.clipboard.writeText('${address}').then(() => window.terminal.log('✅ Address copied!', 'success'))">${address}</span>`, 'success');
                } else {
                    terminal.log(`❌ Name not found: ${name}`, 'error');
                    terminal.log('💡 This ENS name has not been registered yet', 'info');
                }
            } catch (err) {
                terminal.log(`❌ Resolve failed: ${err.message}`, 'error');
            }
            
        } else if (subCommand === 'search' && args[2]) {
            const name = args[2];
            terminal.log(`🔍 Searching for ENS name: ${name}...`, 'info');
            try {
                const ens = this.getENSContract();
                const address = await ens.resolve(name);
                if (address && address !== '0x0000000000000000000000000000000000000000') {
                    terminal.logHtml(`✅ <b>${name}</b> is owned by <span class="copyable" onclick="navigator.clipboard.writeText('${address}').then(() => window.terminal.log('✅ Address copied!', 'success'))">${address}</span>`, 'success');
                } else {
                    terminal.log(`❌ Name not found: ${name}`, 'error');
                    terminal.log('💡 This ENS name is available for registration', 'info');
                }
            } catch (err) {
                terminal.log(`❌ ENS search failed: ${err.message}`, 'error');
            }
            
        } else {
            terminal.log('Usage: ens register <name> | ens resolve <name> | ens search <name>', 'info');
            terminal.log('Examples:', 'info');
            terminal.log('  ens register myname    - Register a new ENS name', 'info');
            terminal.log('  ens resolve myname     - Get address for ENS name', 'info');
            terminal.log('  ens search myname      - Check if ENS name exists', 'info');
        }
    },

    // Airdrop commands
    airdrop: function(terminal, args) {
        terminal.log('=== AIRDROP SCANNER ===', 'info');
        terminal.log('🪂 Scanning for available airdrops...', 'info');
        terminal.log('🚧 Airdrop scanner is being refactored for modular version', 'warning');
        terminal.log('💡 This will check your wallet for eligible airdrops', 'info');
        terminal.log('🔜 Coming soon in next update!', 'info');
    },

    // Solana/Eclipse commands
    solana: function(terminal, args) {
        terminal.log('=== SOLANA INTEGRATION ===', 'info');
        terminal.log('☀️ Solana blockchain integration', 'info');
        terminal.log('🚧 Solana commands are being refactored for modular version', 'warning');
        terminal.log('💡 This will support Solana wallet operations and token swaps', 'info');
        terminal.log('🔜 Coming soon in next update!', 'info');
    },

    eclipse: function(terminal, args) {
        terminal.log('=== ECLIPSE INTEGRATION ===', 'info');
        terminal.log('🌘 Eclipse blockchain integration', 'info');
        terminal.log('🚧 Eclipse commands are being refactored for modular version', 'warning');
        terminal.log('💡 This will support Eclipse network operations', 'info');
        terminal.log('🔜 Coming soon in next update!', 'info');
    },

    // Trading platform integrations
    hyperliquid: function(terminal, args) {
        terminal.log('=== HYPERLIQUID INTEGRATION ===', 'info');
        terminal.log('🚀 Hyperliquid DEX integration', 'info');
        terminal.log('🚧 Hyperliquid commands are being refactored for modular version', 'warning');
        terminal.log('💡 This will support Hyperliquid trading operations', 'info');
        terminal.log('🔜 Coming soon in next update!', 'info');
    },

    polymarket: function(terminal, args) {
        terminal.log('=== POLYMARKET INTEGRATION ===', 'info');
        terminal.log('📊 Polymarket prediction market integration', 'info');
        terminal.log('🚧 Polymarket commands are being refactored for modular version', 'warning');
        terminal.log('💡 This will support Polymarket betting and analytics', 'info');
        terminal.log('🔜 Coming soon in next update!', 'info');
    },

    magiceden: function(terminal, args) {
        terminal.log('=== MAGIC EDEN INTEGRATION ===', 'info');
        terminal.log('🎨 Magic Eden NFT marketplace integration', 'info');
        terminal.log('🚧 Magic Eden commands are being refactored for modular version', 'warning');
        terminal.log('💡 This will support NFT trading and analytics', 'info');
        terminal.log('🔜 Coming soon in next update!', 'info');
    },

    // Send direct message (email implementation)
    sendDirectMessage: async function(terminal, recipient, message) {
        if (!OmegaWallet.isConnected()) {
            terminal.log('Please connect your wallet first using: connect', 'error');
            return;
        }

        // Resolve ENS if needed
        let toAddress = recipient;
        if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
            try {
                const ens = this.getENSContract();
                const resolved = await ens.resolve(recipient);
                if (resolved && resolved !== '0x0000000000000000000000000000000000000000') {
                    toAddress = resolved;
                } else {
                    terminal.log('❌ ENS name not found: ' + recipient, 'error');
                    return;
                }
            } catch (err) {
                terminal.log('❌ Failed to resolve ENS: ' + err.message, 'error');
                return;
            }
        }

        // Send DM on-chain
        try {
            const dmABI = [
                {
                    "inputs": [
                        { "internalType": "address", "name": "to", "type": "address" },
                        { "internalType": "string", "name": "ensName", "type": "string" },
                        { "internalType": "string", "name": "message", "type": "string" }
                    ],
                    "name": "sendMessage",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ];

            const dmContract = new window.ethers.Contract('0x26e31516e5e7790f8aaa35278735970a93fee213', dmABI, OmegaWallet.getSigner());
            let tx;

            if (/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
                // It's an address
                tx = await dmContract.sendMessage(recipient, '', message);
            } else {
                // It's an ENS name
                tx = await dmContract.sendMessage('0x0000000000000000000000000000000000000000', recipient, message);
            }

            terminal.log('⏳ Sending Email on-chain... (tx: ' + tx.hash + ')', 'info');
            await tx.wait();
            terminal.log('✅ Email sent!', 'success');
            terminal.logHtml(`🔍 <a href="https://0x4e454228.explorer.aurora-cloud.dev/tx/${tx.hash}" target="_blank">View on Explorer</a>`, 'info');
        } catch (err) {
            terminal.log('❌ Failed to send email: ' + err.message, 'error');
        }
    },

    // Show inbox implementation
    showInbox: async function(terminal, showAll = false) {
        try {
            const dmABI = [
                {
                    "anonymous": false,
                    "inputs": [
                        { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
                        { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
                        { "indexed": false, "internalType": "string", "name": "message", "type": "string" },
                        { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
                    ],
                    "name": "DirectMessage",
                    "type": "event"
                }
            ];

            const dmContract = new window.ethers.Contract('0x26e31516e5e7790f8aaa35278735970a93fee213', dmABI, OmegaWallet.getProvider());
            const myAddr = OmegaWallet.getCurrentAddress();
            const filter = dmContract.filters.DirectMessage(null, myAddr);
            
            terminal.log('📬 Fetching inbox events from last 100,000 blocks...', 'info');
            
            const currentBlock = await OmegaWallet.getProvider().getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 100000);
            
            const events = await dmContract.queryFilter(filter, fromBlock, 'latest');
            
            if (events.length === 0) {
                terminal.log('📭 No messages found in your inbox', 'info');
                return;
            }

            terminal.log(`=== INBOX (${events.length} messages) ===`, 'info');
            
            const messagesToShow = showAll ? events : events.slice(-10);
            
            for (const event of messagesToShow.reverse()) {
                const from = event.args.from;
                const message = event.args.message;
                const timestamp = event.args.timestamp.toNumber() * 1000;
                const date = new Date(timestamp).toLocaleString();
                
                terminal.logHtml(`<div style="border: 1px solid #333; padding: 10px; margin: 5px 0; border-radius: 5px;">`, 'output');
                terminal.logHtml(`<b>From:</b> <span class="copyable" onclick="navigator.clipboard.writeText('${from}')">${from}</span>`, 'output');
                terminal.logHtml(`<b>Date:</b> ${date}`, 'output');
                terminal.logHtml(`<b>Message:</b> ${message}`, 'output');
                terminal.logHtml(`</div>`, 'output');
            }
            
            if (!showAll && events.length > 10) {
                terminal.log(`Showing last 10 messages. Use "inbox all" to show all ${events.length} messages.`, 'info');
            }
            
        } catch (error) {
            terminal.log(`❌ Failed to fetch inbox: ${error.message}`, 'error');
        }
    },

            // ENS contract helper (Omega Network ENS)
    getENSContract: function(signerOrProvider = null) {
        const ensABI = [
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "string", "name": "name", "type": "string"},
                    {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}
                ],
                "name": "NameRegistered",
                "type": "event"
            },
            {
                "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
                "name": "register",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "string", "name": "name", "type": "string"},
                    {"internalType": "address", "name": "newOwner", "type": "address"}
                ],
                "name": "transfer",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "string", "name": "", "type": "string"}],
                "name": "names",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
                "name": "resolve",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        // Use Omega Network ENS contract address
        const provider = signerOrProvider || OmegaWallet.getSigner() || OmegaWallet.getProvider();
        return new window.ethers.Contract('0xd9ce49734db4f033362d2fd51d52f24cabeb87fa', ensABI, provider);
    },

    // Create token functionality
    createToken: async function(terminal, args) {
        if (!OmegaWallet.isConnected()) {
            terminal.log('❌ Please connect your wallet first using: connect', 'error');
            return;
        }

        try {
            terminal.log('🚀 Omega Token Creator', 'info');
            terminal.log('This will deploy a new ERC20 token on the Omega Network', 'info');
            terminal.log('', '');

            // Get token parameters interactively
            terminal.log('Enter token name (e.g., "My Awesome Token"):', 'info');
            const name = await terminal.promptTerminalInput();
            if (!name || !name.trim()) {
                terminal.log('Token creation cancelled.', 'warning');
                return;
            }

            terminal.log('Enter token symbol (e.g., "MAT"):', 'info');
            const symbol = await terminal.promptTerminalInput();
            if (!symbol || !symbol.trim()) {
                terminal.log('Token creation cancelled.', 'warning');
                return;
            }

            terminal.log('Enter decimals (default 18):', 'info');
            const decimalsInput = await terminal.promptTerminalInput();
            let decimals = 18;
            if (decimalsInput && decimalsInput.trim()) {
                const parsed = parseInt(decimalsInput.trim());
                if (!isNaN(parsed) && parsed >= 0 && parsed <= 36) {
                    decimals = parsed;
                }
            }

            terminal.log('Enter initial supply (e.g., 1000000):', 'info');
            const supplyInput = await terminal.promptTerminalInput();
            if (!supplyInput || !supplyInput.trim()) {
                terminal.log('Token creation cancelled.', 'warning');
                return;
            }
            
            const initialSupply = window.ethers.BigNumber.from(supplyInput.trim());
            if (initialSupply.lte(0)) {
                terminal.log('Invalid supply amount. Please enter a positive number.', 'error');
                return;
            }

            terminal.log('Mintable? (yes/no, default yes):', 'info');
            const mintableInput = await terminal.promptTerminalInput();
            const mintable = !mintableInput || mintableInput.trim().toLowerCase() !== 'no';

            terminal.log('Pausable? (yes/no, default yes):', 'info');
            const pausableInput = await terminal.promptTerminalInput();
            const pausable = !pausableInput || pausableInput.trim().toLowerCase() !== 'no';

            // Show summary
            terminal.log('', '');
            terminal.log('📋 Token Details:', 'info');
            terminal.log(`Name: ${name.trim()}`, 'output');
            terminal.log(`Symbol: ${symbol.trim()}`, 'output');
            terminal.log(`Decimals: ${decimals}`, 'output');
            terminal.log(`Initial Supply: ${initialSupply.toLocaleString()}`, 'output');
            terminal.log(`Mintable: ${mintable ? 'Yes' : 'No'}`, 'output');
            terminal.log(`Pausable: ${pausable ? 'Yes' : 'No'}`, 'output');
            terminal.log('', '');

            terminal.log('Deploy token? (yes/no):', 'info');
            const confirm = await terminal.promptTerminalInput();
            if (!confirm || confirm.trim().toLowerCase() !== 'yes') {
                terminal.log('Token creation cancelled.', 'warning');
                return;
            }

            // Deploy token using factory contract
            const FACTORY_ADDRESS = '0x1f568dbb3a7b9ea05062b132094a848ef1443cfe';
            const FACTORY_ABI = [
                {
                    "inputs": [
                        { "internalType": "string", "name": "name_", "type": "string" },
                        { "internalType": "string", "name": "symbol_", "type": "string" },
                        { "internalType": "uint8", "name": "decimals_", "type": "uint8" },
                        { "internalType": "uint256", "name": "initialSupply_", "type": "uint256" },
                        { "internalType": "bool", "name": "mintable_", "type": "bool" },
                        { "internalType": "bool", "name": "pausable_", "type": "bool" }
                    ],
                    "name": "createToken",
                    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ];

            const factory = new window.ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, OmegaWallet.getSigner());

            terminal.log('🚀 Deploying token contract...', 'info');
            const tx = await factory.createToken(name.trim(), symbol.trim(), decimals, initialSupply, mintable, pausable);
            
            terminal.log(`✅ Token deployment submitted! Hash: ${tx.hash}`, 'success');
            terminal.log('⏳ Waiting for confirmation...', 'info');

            const receipt = await tx.wait();
            terminal.log(`✅ Token deployed successfully! Block: ${receipt.blockNumber}`, 'success');
            
            // Try to extract token address from events
            if (receipt.events) {
                const tokenCreatedEvent = receipt.events.find(e => e.event === 'TokenCreated');
                if (tokenCreatedEvent && tokenCreatedEvent.args) {
                    const tokenAddress = tokenCreatedEvent.args.token;
                    terminal.log(`🎉 Your new token address: ${tokenAddress}`, 'success');
                    terminal.logHtml(`<span class="copyable" onclick="navigator.clipboard.writeText('${tokenAddress}')">${tokenAddress}</span>`, 'output');
                }
            }

            terminal.logHtml(`🔍 <a href="https://0x4e454228.explorer.aurora-cloud.dev/tx/${tx.hash}" target="_blank">View on Explorer</a>`, 'info');

        } catch (error) {
            terminal.log(`❌ Token creation failed: ${error.message}`, 'error');
        }
    },

    // Rome Network Commands
    rome: function(terminal, args) {
        if (!args || args.length < 2) {
            terminal.log('=== Rome Network Commands ===', 'info');
            terminal.log('rome help - Show Rome commands', 'output');
            terminal.log('rome token create - Create a new token on Rome Network', 'output');
            return;
        }

        const subCommand = args[1].toLowerCase();

        switch (subCommand) {
            case 'help':
                terminal.log('=== Rome Network Help ===', 'info');
                terminal.log('rome token create - Creates a new token on Rome Network', 'output');
                break;
            
            case 'token':
                if (args[2] && args[2].toLowerCase() === 'create') {
                    terminal.log('🏛️ Rome Token Creation Coming Soon!', 'info');
                    terminal.log('This will create a token on the Rome Network', 'output');
                } else {
                    terminal.log('Usage: rome token create', 'error');
                }
                break;
            
            default:
                terminal.log('Unknown rome command. Type "rome help" for available commands.', 'error');
                break;
        }
    }
}; 