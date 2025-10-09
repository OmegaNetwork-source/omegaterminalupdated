// ===================================
// APPLE UI PLUGIN v1.0 - MODERN UI COMMAND
// Adds sleek Apple-style interface to Omega Terminal  
// ===================================

console.log('🍎 Loading Apple UI Plugin v1.0 - Modern UI');

(function() {
    let initAttempts = 0;
    const maxInitAttempts = 15;
    
    // Wait for terminal to be ready
    function waitForTerminalApple() {
        initAttempts++;
        
        if (window.terminal && window.terminal.log && window.terminal.logHtml) {
            if (typeof window.terminal.executeCommand === 'function' || initAttempts > 8) {
                initializeAppleUI();
            } else {
                console.log('⏳ Apple UI: Waiting for terminal to be fully loaded...', initAttempts);
                setTimeout(waitForTerminalApple, 300);
            }
        } else if (initAttempts < maxInitAttempts) {
            setTimeout(waitForTerminalApple, 200);
        } else {
            console.error('❌ Apple UI: Failed to initialize after maximum attempts');
        }
    }
    
    function initializeAppleUI() {
        console.log('✅ Apple UI Plugin: Terminal detected, adding modern UI functionality...');
        
        // Store original theme handler if it exists
        window.terminal._originalSetTheme = window.terminal.setTheme;
        
        // Enhanced theme handler that includes Apple UI
        window.terminal.setTheme = function(themeName) {
            if (!themeName) {
                // Show enhanced theme help including Apple UI
                this.showEnhancedThemeHelp();
                return;
            }
            
            const theme = themeName.toLowerCase();
            
            // Handle Apple UI activation
            if (theme === 'modern' || theme === 'apple' || theme === 'modernui' || theme === 'modern-ui') {
                this.activateAppleUI();
                return;
            }
            
            // Handle Apple Dark mode
            if (theme === 'modern-dark' || theme === 'apple-dark' || theme === 'dark-modern') {
                this.activateAppleUI(true); // Dark mode
                return;
            }
            
            // For other themes, deactivate Apple UI first, then apply
            this.deactivateAppleUI();
            
            // Call original theme handler if it exists
            if (this._originalSetTheme) {
                this._originalSetTheme.call(this, themeName);
            } else {
                // Fallback theme handling
                this.log(`Setting theme to: ${themeName}`, 'info');
            }
        };
        
        // Activate Apple UI with smooth animation
        window.terminal.activateAppleUI = function(darkMode = false) {
            const modeText = darkMode ? 'Dark' : 'Light';
            this.log(`🍎 Activating Modern Apple UI (${modeText} Mode)...`, 'info');
            
            const terminal = document.getElementById('terminal') || document.querySelector('.terminal');
            if (!terminal) {
                this.log('❌ Terminal element not found', 'error');
                return;
            }
            
            // Apply Apple UI classes with animation
            setTimeout(() => {
                // Remove existing theme classes
                terminal.classList.remove('dark-theme', 'light-theme', 'matrix-theme', 'retro-theme');
                
                // Add Apple UI classes
                terminal.classList.add('apple-ui');
                
                // Handle dark mode properly
                if (darkMode) {
                    terminal.classList.add('dark');
                } else {
                    terminal.classList.remove('dark');
                }
                
                // Clean the theme toggle button immediately
                const themeToggle = document.querySelector('.theme-toggle');
                if (themeToggle) {
                    themeToggle.innerHTML = '';
                    themeToggle.textContent = '';
                    themeToggle.innerText = '';
                }
                
                // Ensure title is in proper case (not uppercase)
                const titleElement = document.querySelector('.terminal-title');
                if (titleElement) {
                    titleElement.textContent = 'Omega Terminal v2.0.1';
                    titleElement.style.textTransform = 'none';
                }
                
                // Simple input field fix - no complex monitoring
                const inputField = document.querySelector('.input-field') || document.getElementById('commandInput');
                if (inputField) {
                    const textColor = darkMode ? '#F2F2F7' : '#1D1D1F';
                    
                    // Simple, direct style application
                    inputField.style.setProperty('color', textColor, 'important');
                    inputField.style.setProperty('opacity', '1', 'important');
                    inputField.style.setProperty('visibility', 'visible', 'important');
                    inputField.style.setProperty('transition', 'none', 'important');
                    inputField.style.setProperty('animation', 'none', 'important');
                }
                
                // Add activation animation
                terminal.style.transform = 'scale(0.98)';
                terminal.style.opacity = '0.8';
                
                setTimeout(() => {
                    terminal.style.transform = 'scale(1)';
                    terminal.style.opacity = '1';
                    
                    // Success message with mode indicator
                    const emoji = darkMode ? '🌙' : '🌅';
                    this.log(`${emoji} Modern Apple UI activated (${modeText} Mode)`, 'success');
                    
                    // Set up theme toggle functionality
                    this.setupAppleUIToggle();
                }, 100);
                
            }, 200);
        };
        
        // Deactivate Apple UI
        window.terminal.deactivateAppleUI = function() {
            const terminal = document.getElementById('terminal') || document.querySelector('.terminal');
            if (terminal) {
                terminal.classList.remove('apple-ui', 'dark');
                terminal.style.transform = '';
                terminal.style.opacity = '';
            }
        };
        
        // Removed intrusive welcome banner - keeping it clean!
        
        // Enhanced theme help
        window.terminal.showEnhancedThemeHelp = function() {
            this.log('🎨 Enhanced Theme System', 'info');
            this.log('══════════════════════════', 'info');
            this.log('', 'info');
            
            this.log('🍎 PREMIUM THEMES:', 'success');
            this.log('  modern ui                 Apple-style glass-morphism (PREMIUM)', 'output');
            this.log('  modern                    Same as modern ui', 'output');
            this.log('  apple                     Same as modern ui', 'output');
            this.log('  modern-dark               Apple UI in dark mode', 'output');
            this.log('  apple-dark                Same as modern-dark', 'output');
            this.log('', 'info');
            
            this.log('🎮 EXISTING THEMES:', 'info');
            this.log('  dark                      Classic dark theme', 'output');
            this.log('  light                     Classic light theme', 'output');
            this.log('  matrix                    Matrix green theme', 'output');
            this.log('  retro                     Retro terminal theme', 'output');
            this.log('', 'info');
            
            this.log('💎 CRYPTO THEMES:', 'info');
            this.log('  bitcoin                   Bitcoin orange theme', 'output');
            this.log('  ethereum                  Ethereum blue theme', 'output');
            this.log('  solana                    Solana purple theme', 'output');
            this.log('  pepe                      Pepe green meme theme', 'output');
            this.log('  doge                      Dogecoin gold theme', 'output');
            this.log('', 'info');
            
            this.log('🎯 EXAMPLES:', 'info');
            this.log('  theme modern ui           Activate premium Apple interface', 'info');
            this.log('  theme modern-dark         Apple UI in dark mode', 'info');
            this.log('  theme bitcoin             Bitcoin-themed interface', 'info');
        };
        
        // Add command aliases for better discovery
        window.terminal._originalHandleCommand = window.terminal.handleCommand || window.terminal.executeCommand;
        
        // Enhance command handling to support "modern ui" command
        const originalExecuteCommand = window.terminal.executeCommand;
        if (originalExecuteCommand) {
            window.terminal.executeCommand = async function(command) {
                const args = command.trim().split(/\s+/);
                const cmd = args[0].toLowerCase();
                
                // Handle "modern ui" as a special case (two words)
                if (cmd === 'modern' && args[1] && args[1].toLowerCase() === 'ui') {
                    this.activateAppleUI();
                    return;
                }
                
                // Handle other Apple UI variants
                if (cmd === 'apple-ui' || cmd === 'modernui') {
                    this.activateAppleUI();
                    return;
                }
                
                if (cmd === 'apple-dark' || cmd === 'modern-dark') {
                    this.activateAppleUI(true);
                    return;
                }
                
                // For all other commands, use original handler
                return originalExecuteCommand.call(this, command);
            };
        }
        
        // Enhanced theme toggle for Apple UI
        window.terminal.setupAppleUIToggle = function() {
            const themeToggle = document.querySelector('.theme-toggle');
            if (themeToggle) {
                // Store original click handler
                const originalOnClick = themeToggle.onclick;
                
                // Clean the button content - remove any emoji
                themeToggle.innerHTML = '';
                themeToggle.textContent = '';
                
                // Enhanced click handler for Apple UI
                themeToggle.onclick = function() {
                    const terminal = document.getElementById('terminal') || document.querySelector('.terminal');
                    
                    // If we're in Apple UI mode, toggle between light and dark Apple UI
                    if (terminal && terminal.classList.contains('apple-ui')) {
                        if (terminal.classList.contains('dark')) {
                            // Switch to light Apple UI
                            window.terminal.activateAppleUI(false);
                            window.terminal.log('🌅 Switched to Light Apple UI', 'success');
                        } else {
                            // Switch to dark Apple UI  
                            window.terminal.activateAppleUI(true);
                            window.terminal.log('🌙 Switched to Dark Apple UI', 'success');
                        }
                    } else {
                        // Not in Apple UI mode, use original theme toggle
                        if (originalOnClick) {
                            originalOnClick.call(this);
                        } else {
                            // Fallback: activate Apple UI
                            window.terminal.activateAppleUI();
                        }
                    }
                    
                    // Ensure button stays clean after click
                    setTimeout(() => {
                        themeToggle.innerHTML = '';
                        themeToggle.textContent = '';
                    }, 100);
                };
                
                themeToggle.title = 'Toggle Theme (Apple UI: Light ↔ Dark)';
                
                // Prevent any content from being added
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList' || mutation.type === 'characterData') {
                            themeToggle.innerHTML = '';
                            themeToggle.textContent = '';
                        }
                    });
                });
                
                observer.observe(themeToggle, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }
        };
        
        // Set up the enhanced toggle
        setTimeout(() => {
            if (window.terminal.setupAppleUIToggle) {
                window.terminal.setupAppleUIToggle();
            }
        }, 1000);
        
        // Simplified approach - no complex monitoring
        
        // Add keyboard shortcut for quick activation
        document.addEventListener('keydown', function(event) {
            // Cmd/Ctrl + Shift + M = Modern UI
            if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'M') {
                event.preventDefault();
                if (window.terminal && window.terminal.activateAppleUI) {
                    window.terminal.activateAppleUI();
                    window.terminal.log('🍎 Apple UI activated via keyboard shortcut!', 'success');
                }
            }
            
            // Cmd/Ctrl + Shift + D = Modern Dark
            if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                if (window.terminal && window.terminal.activateAppleUI) {
                    window.terminal.activateAppleUI(true);
                    window.terminal.log('🍎 Apple UI Dark activated via keyboard shortcut!', 'success');
                }
            }
        });
        
        // Auto-detection: if user types variations, help them
        const originalLog = window.terminal.log;
        window.terminal.log = function(message, type) {
            // Check for UI-related searches and provide hints
            if (typeof message === 'string') {
                const msg = message.toLowerCase();
                if ((msg.includes('ui') || msg.includes('theme') || msg.includes('modern')) && 
                    (msg.includes('not found') || msg.includes('unknown command'))) {
                    
                    originalLog.call(this, message, type);
                    this.log('💡 Did you mean: modern ui (Apple-style interface)?', 'info');
                    return;
                }
            }
            
            originalLog.call(this, message, type);
        };
        
        // Success message
        console.log('✅ Apple UI Plugin v1.0 loaded successfully!');
        console.log('🍎 Commands: modern ui, apple, modern-dark');
        console.log('⌨️ Shortcuts: Cmd+Shift+M (light), Cmd+Shift+D (dark)');
        
        // Store restoration function
        window.terminal.restoreOriginalThemeHandler = function() {
            if (this._originalSetTheme) {
                this.setTheme = this._originalSetTheme;
                this.log('✅ Original theme handler restored', 'success');
            }
            if (originalExecuteCommand) {
                this.executeCommand = originalExecuteCommand;
                this.log('✅ Original command handler restored', 'success');
            }
        };
        
        // Auto-suggestions disabled to keep interface clean
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForTerminalApple);
    } else {
        waitForTerminalApple();
    }
})();

// ===================================
// ADVANCED APPLE UI ENHANCEMENTS
// ===================================

// Add smooth page transitions when Apple UI is active
function addApplePageTransitions() {
    const style = document.createElement('style');
    style.textContent = `
        /* Page transition when Apple UI is active */
        .terminal.apple-ui {
            animation: apple-ui-entrance 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        @keyframes apple-ui-entrance {
            0% {
                opacity: 0;
                transform: scale(0.95) translateY(20px);
                filter: blur(10px);
            }
            50% {
                opacity: 0.8;
                transform: scale(0.98) translateY(10px);
                filter: blur(2px);
            }
            100% {
                opacity: 1;
                transform: scale(1) translateY(0);
                filter: blur(0);
            }
        }
        
        /* Enhanced button hover effects */
        .terminal.apple-ui button {
            position: relative;
            overflow: hidden;
        }
        
        .terminal.apple-ui button::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.3s ease, height 0.3s ease;
            pointer-events: none;
        }
        
        .terminal.apple-ui button:hover::before {
            width: 300px;
            height: 300px;
        }
        
        /* Subtle parallax effect for background */
        .terminal.apple-ui {
            transform-style: preserve-3d;
        }
        
        .terminal.apple-ui::before {
            transform: translateZ(-1px) scale(2);
        }
    `;
    document.head.appendChild(style);
}

// Initialize advanced enhancements
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addApplePageTransitions);
} else {
    addApplePageTransitions();
} 