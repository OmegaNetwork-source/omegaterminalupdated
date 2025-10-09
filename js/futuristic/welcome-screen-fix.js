/* Welcome Screen Integration Fix - Ensure proper initialization order */

window.WelcomeScreenFix = {
    initialized: false,
    
    init: function() {
        console.log('🔧 WELCOME SCREEN FIX INITIALIZING...');
        
        // Ensure proper initialization order
        this.setupInitializationSequence();
        
        // Fix any timing issues
        this.fixTimingIssues();
        
        this.initialized = true;
        console.log('✅ Welcome Screen Fix Ready');
    },
    
    setupInitializationSequence: function() {
        // Override the original terminal initialization to work with welcome screen
        if (window.OmegaMinerTerminal) {
            const originalInit = window.OmegaMinerTerminal.prototype.init;
            window.OmegaMinerTerminal.prototype.init = function() {
                // Don't show boot animation - welcome screen handles this
                console.log('🚀 OMEGA TERMINAL v2.0.1 INITIALIZING (Welcome Screen Mode)');
                
                // Set up event listeners immediately
                this.setupEventListeners();
                
                try {
                    this.ethers = window.ethers;
                    const hasMetaMask = await this.isRealMetaMask();
                    let walletReady = false;
                    
                    if (!hasMetaMask) {
                        this.log('Error checking wallet connection: MetaMask not detected', 'error');
                    } else {
                        try {
                            const accounts = await this.ethers.provider.listAccounts();
                            if (accounts.length > 0) {
                                this.log('MetaMask wallet detected and connected', 'success');
                                walletReady = true;
                            } else {
                                this.log('MetaMask detected but no accounts connected', 'warning');
                            }
                        } catch (error) {
                            this.log('Error checking MetaMask connection: ' + error.message, 'error');
                        }
                    }
                    
                    // Initialize wallet system
                    if (window.walletManager) {
                        await window.walletManager.init();
                    }
                    
                    // Initialize other systems
                    this.initializeSystems();
                    
                } catch (error) {
                    this.log('Initialization error: ' + error.message, 'error');
                }
                
                // Hide welcome screen and show terminal
                this.hideWelcomeScreenAndShowTerminal();
            };
        }
    },
    
    fixTimingIssues: function() {
        // Ensure welcome screen is shown initially
        document.addEventListener('DOMContentLoaded', () => {
            // Hide any existing boot animations
            const bootAnimation = document.getElementById('bootAnimation');
            if (bootAnimation) {
                bootAnimation.style.display = 'none';
            }
            
            // Ensure welcome screen is visible
            setTimeout(() => {
                if (window.OmegaWelcomeScreen && !window.OmegaWelcomeScreen.initialized) {
                    window.OmegaWelcomeScreen.init();
                }
            }, 100);
        });
    },
    
    hideWelcomeScreenAndShowTerminal: function() {
        // This will be called by the terminal initialization
        setTimeout(() => {
            if (window.OmegaWelcomeScreen) {
                window.OmegaWelcomeScreen.hideWelcomeScreen();
            }
            
            // Show the terminal
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.style.display = 'block';
            }
            
            // Initialize dashboard if available
            if (window.FuturisticDashboard && window.FuturisticDashboard.init) {
                window.FuturisticDashboard.init();
            }
        }, 100);
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
    window.WelcomeScreenFix.init();
});
