/**
 * Multi-Network Wallet Connector
 * Supports EVM chains (Ethereum, BSC, Polygon, etc.) and Solana
 * Cache Bust: v1.0.0
 */

window.MultiNetworkConnector = {
    // Network configurations with real logos
    networks: {
        ethereum: {
            name: 'Ethereum',
            chainId: '0x1',
            chainIdDecimal: 1,
            rpcUrl: 'https://eth.llamarpc.com',
            currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            explorerUrl: 'https://etherscan.io',
            icon: '⟠',
            logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
            walletType: 'metamask'
        },
        bsc: {
            name: 'BNB Smart Chain',
            chainId: '0x38',
            chainIdDecimal: 56,
            rpcUrl: 'https://bsc-dataseed.binance.org',
            currency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
            explorerUrl: 'https://bscscan.com',
            icon: '🟡',
            logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
            walletType: 'metamask'
        },
        polygon: {
            name: 'Polygon',
            chainId: '0x89',
            chainIdDecimal: 137,
            rpcUrl: 'https://polygon-rpc.com',
            currency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            explorerUrl: 'https://polygonscan.com',
            icon: '🟣',
            logo: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
            walletType: 'metamask'
        },
        arbitrum: {
            name: 'Arbitrum One',
            chainId: '0xa4b1',
            chainIdDecimal: 42161,
            rpcUrl: 'https://arb1.arbitrum.io/rpc',
            currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            explorerUrl: 'https://arbiscan.io',
            icon: '🔵',
            logo: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
            walletType: 'metamask'
        },
        optimism: {
            name: 'Optimism',
            chainId: '0xa',
            chainIdDecimal: 10,
            rpcUrl: 'https://mainnet.optimism.io',
            currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            explorerUrl: 'https://optimistic.etherscan.io',
            icon: '🔴',
            logo: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
            walletType: 'metamask'
        },
        base: {
            name: 'Base',
            chainId: '0x2105',
            chainIdDecimal: 8453,
            rpcUrl: 'https://mainnet.base.org',
            currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            explorerUrl: 'https://basescan.org',
            icon: '🔷',
            logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
            walletType: 'metamask'
        },
        omega: {
            name: 'Omega Network',
            chainId: '0x4e454228',
            chainIdDecimal: 1314545192,
            rpcUrl: 'https://rpc.omegaminer.net',
            currency: { name: 'Omega', symbol: 'OMEGA', decimals: 18 },
            explorerUrl: 'https://0x4e454228.explorer.aurora-cloud.dev',
            icon: '⚡',
            logo: 'https://avatars.githubusercontent.com/u/143421828?s=200&v=4',
            walletType: 'metamask'
        },
        solana: {
            name: 'Solana',
            chainId: 'solana-mainnet',
            rpcUrl: 'https://api.mainnet-beta.solana.com',
            currency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
            explorerUrl: 'https://explorer.solana.com',
            icon: '◎',
            logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
            walletType: 'phantom'
        }
    },

    currentNetwork: null,
    currentAddress: null,

    // Show network selection modal
    showNetworkSelector: function(terminal) {
        // Remove existing modal if any
        const existing = document.getElementById('network-selector-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'network-selector-modal';
        modal.className = 'network-modal';
        
        modal.innerHTML = `
            <div class="network-modal-overlay" onclick="MultiNetworkConnector.closeModal()"></div>
            <div class="network-modal-content">
                <div class="network-modal-header">
                    <h2>🌐 Select Network</h2>
                    <button class="network-modal-close" onclick="MultiNetworkConnector.closeModal()">✕</button>
                </div>
                
                <div class="network-modal-body">
                    <div class="network-section">
                        <div class="network-section-title">⟠ EVM NETWORKS</div>
                        <div class="network-grid">
                            ${this.renderNetworkButton('ethereum', terminal)}
                            ${this.renderNetworkButton('bsc', terminal)}
                            ${this.renderNetworkButton('polygon', terminal)}
                            ${this.renderNetworkButton('arbitrum', terminal)}
                            ${this.renderNetworkButton('optimism', terminal)}
                            ${this.renderNetworkButton('base', terminal)}
                            ${this.renderNetworkButton('omega', terminal)}
                        </div>
                    </div>
                    
                    <div class="network-section">
                        <div class="network-section-title">◎ SOLANA</div>
                        <div class="network-grid">
                            ${this.renderNetworkButton('solana', terminal)}
                        </div>
                    </div>
                </div>
                
                <div class="network-modal-footer">
                    <p>💡 Make sure you have MetaMask (EVM) or Phantom (Solana) installed</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Trigger animation
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    },

    renderNetworkButton: function(networkKey, terminal) {
        const network = this.networks[networkKey];
        return `
            <button class="network-button" onclick="MultiNetworkConnector.connectToNetwork('${networkKey}', window.terminal)">
                <div class="network-logo-wrapper">
                    <img src="${network.logo}" 
                         alt="${network.name}" 
                         class="network-logo"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div class="network-icon" style="display: none;">${network.icon}</div>
                </div>
                <div class="network-name">${network.name}</div>
                <div class="network-symbol">${network.currency.symbol}</div>
            </button>
        `;
    },

    closeModal: function() {
        const modal = document.getElementById('network-selector-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },

    // Connect to specific network
    connectToNetwork: async function(networkKey, terminal) {
        const network = this.networks[networkKey];
        if (!network) {
            terminal.log(`❌ Network ${networkKey} not found`, 'error');
            return;
        }

        this.closeModal();
        
        terminal.log(`🌐 Connecting to ${network.name}...`, 'info');

        if (network.walletType === 'metamask') {
            await this.connectEVM(network, terminal);
        } else if (network.walletType === 'phantom') {
            await this.connectSolana(network, terminal);
        }
    },

    // Connect to EVM network (MetaMask)
    connectEVM: async function(network, terminal) {
        if (!window.ethereum) {
            terminal.log('❌ MetaMask not detected', 'error');
            terminal.log('💡 Please install MetaMask: https://metamask.io', 'info');
            return false;
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (!accounts || accounts.length === 0) {
                terminal.log('❌ No accounts found. Please unlock MetaMask.', 'error');
                return false;
            }

            // Check if we need to switch networks
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            if (currentChainId !== network.chainId) {
                terminal.log(`🔄 Switching to ${network.name}...`, 'info');
                
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: network.chainId }],
                    });
                } catch (switchError) {
                    // Chain not added to MetaMask, try to add it
                    if (switchError.code === 4902) {
                        terminal.log(`➕ Adding ${network.name} to MetaMask...`, 'info');
                        
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: network.chainId,
                                    chainName: network.name,
                                    nativeCurrency: network.currency,
                                    rpcUrls: [network.rpcUrl],
                                    blockExplorerUrls: [network.explorerUrl]
                                }],
                            });
                        } catch (addError) {
                            terminal.log('❌ Failed to add network: ' + addError.message, 'error');
                            return false;
                        }
                    } else {
                        terminal.log('❌ Failed to switch network: ' + switchError.message, 'error');
                        return false;
                    }
                }
            }

            // Successfully connected
            this.currentNetwork = network;
            this.currentAddress = accounts[0];
            
            terminal.log('', 'info');
            terminal.log(`✅ Connected to ${network.name}!`, 'success');
            terminal.log(`📍 Network: ${network.name}`, 'info');
            terminal.log(`💰 Currency: ${network.currency.symbol}`, 'info');
            terminal.log(`👛 Address: ${this.formatAddress(accounts[0])}`, 'info');
            terminal.log('', 'info');
            
            // Update terminal state
            terminal.currentNetwork = network;
            terminal.userAddress = accounts[0];
            
            // Update both terminal and futuristic dashboard status
            if (terminal.updateConnectionStatus) {
                terminal.updateConnectionStatus(`CONNECTED (${network.name})`);
            }
            
            // Update futuristic dashboard header
            this.updateFuturisticStatus(network, accounts[0]);
            
            // Update header network display
            this.updateNetworkDisplay(network);
            
            // Show balance
            await this.showNetworkBalance(network, accounts[0], terminal);
            
            return true;
            
        } catch (error) {
            terminal.log('❌ Connection failed: ' + error.message, 'error');
            return false;
        }
    },

    // Connect to Solana (Phantom)
    connectSolana: async function(network, terminal) {
        const phantom = window.solana;
        
        if (!phantom || !phantom.isPhantom) {
            terminal.log('❌ Phantom wallet not detected', 'error');
            terminal.log('💡 Please install Phantom: https://phantom.app', 'info');
            return false;
        }

        try {
            terminal.log('🔗 Connecting to Phantom...', 'info');
            
            const resp = await phantom.connect();
            const publicKey = resp.publicKey.toString();
            
            this.currentNetwork = network;
            this.currentAddress = publicKey;
            
            terminal.log('', 'info');
            terminal.log('✅ Connected to Solana via Phantom!', 'success');
            terminal.log(`📍 Network: Solana Mainnet`, 'info');
            terminal.log(`💰 Currency: SOL`, 'info');
            terminal.log(`👛 Address: ${this.formatAddress(publicKey)}`, 'info');
            terminal.log('', 'info');
            
            // Update terminal state
            terminal.currentNetwork = network;
            terminal.userAddress = publicKey;
            
            // Update both terminal and futuristic dashboard status
            if (terminal.updateConnectionStatus) {
                terminal.updateConnectionStatus('CONNECTED (Solana)');
            }
            
            // Update futuristic dashboard header
            this.updateFuturisticStatus(network, publicKey);
            
            // Update header network display
            this.updateNetworkDisplay(network);
            
            // Show balance
            await this.showSolanaBalance(publicKey, terminal);
            
            return true;
            
        } catch (error) {
            if (error.code === 4001) {
                terminal.log('❌ Connection cancelled by user', 'error');
            } else {
                terminal.log('❌ Connection failed: ' + error.message, 'error');
            }
            return false;
        }
    },

    // Show balance for current network
    showNetworkBalance: async function(network, address, terminal) {
        try {
            if (network.walletType === 'metamask') {
                const balance = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [address, 'latest']
                });
                
                const balanceInEth = parseInt(balance, 16) / Math.pow(10, network.currency.decimals);
                terminal.log(`💰 Balance: ${balanceInEth.toFixed(4)} ${network.currency.symbol}`, 'success');
            }
        } catch (error) {
            terminal.log('⚠️ Could not fetch balance', 'warning');
        }
    },

    // Show Solana balance
    showSolanaBalance: async function(publicKey, terminal) {
        try {
            const connection = new window.solanaWeb3.Connection(
                'https://api.mainnet-beta.solana.com',
                'confirmed'
            );
            
            const pubKey = new window.solanaWeb3.PublicKey(publicKey);
            const balance = await connection.getBalance(pubKey);
            const balanceInSol = balance / 1000000000; // Lamports to SOL
            
            terminal.log(`💰 Balance: ${balanceInSol.toFixed(4)} SOL`, 'success');
        } catch (error) {
            terminal.log('⚠️ Could not fetch balance', 'warning');
        }
    },

    // Update futuristic dashboard status
    updateFuturisticStatus: function(network, address) {
        // Update connection status
        const connectionText = document.getElementById('futuristic-connection-text');
        if (connectionText) {
            connectionText.textContent = 'CONNECTED';
            connectionText.style.color = 'var(--matrix-green)';
        }
        
        const connectionDot = document.getElementById('futuristic-connection-status');
        if (connectionDot) {
            connectionDot.style.background = 'var(--matrix-green)';
            connectionDot.style.boxShadow = '0 0 10px var(--matrix-green)';
        }
        
        // Update wallet info
        const walletInfo = document.getElementById('futuristic-wallet-info');
        if (walletInfo) {
            const shortAddress = this.formatAddress(address);
            walletInfo.innerHTML = `
                <img src="${network.logo}" 
                     alt="${network.name}" 
                     style="width: 16px; height: 16px; border-radius: 50%; vertical-align: middle; margin-right: 4px;"
                     onerror="this.style.display='none';">
                ${shortAddress}
            `;
        }
    },
    
    // Update network display in header
    updateNetworkDisplay: function(network) {
        // Update AI toggle area to show network
        const statusArea = document.querySelector('.terminal-status-right');
        if (statusArea) {
            let networkDisplay = document.getElementById('network-display');
            if (!networkDisplay) {
                networkDisplay = document.createElement('div');
                networkDisplay.id = 'network-display';
                networkDisplay.className = 'network-display';
                statusArea.insertBefore(networkDisplay, statusArea.firstChild);
            }
            
            networkDisplay.innerHTML = `
                <img src="${network.logo}" 
                     alt="${network.name}" 
                     class="network-icon-small"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                <span class="network-icon" style="display: none;">${network.icon}</span>
                <span class="network-name">${network.name}</span>
            `;
        }
    },

    // Format address for display
    formatAddress: function(address) {
        if (!address) return '';
        if (address.length <= 12) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    },

    // Get current network info
    getCurrentNetwork: function() {
        return this.currentNetwork;
    },

    // Check if connected
    isConnected: function() {
        return this.currentNetwork !== null && this.currentAddress !== null;
    }
};

// Initialize on load
console.log('✅ Multi-Network Connector loaded');

