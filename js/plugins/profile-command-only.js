// ===================================
// PROFILE COMMAND ONLY v1.0
// Clean command-driven profile with API key management
// ===================================

console.log('🔧 Loading Command-Only Profile System...');

(function() {
    function initializeCommandProfile() {
        console.log('✅ Initializing command-only profile system...');
        
        // ===================================
        // REMOVE ALL PROFILE BUTTONS
        // ===================================
        
        const allProfileButtons = document.querySelectorAll(`
            [id*="profile"],
            [onclick*="profile"], 
            [onclick*="Profile"],
            [title*="Profile"],
            button[style*="👤"]
        `);
        
        allProfileButtons.forEach(el => {
            el.remove();
            console.log('🗑️ Removed profile button');
        });
        
        console.log('✅ All profile buttons removed - clean UI restored');
        
        // ===================================
        // CREATE COMMAND-ONLY PROFILE SIDEBAR
        // ===================================
        
        function createProfileSidebar() {
            // Remove existing sidebar
            const existingSidebar = document.getElementById('profile-command-sidebar');
            if (existingSidebar) existingSidebar.remove();
            
            const sidebarHtml = `
                <div id="profile-command-sidebar" style="
                    position: fixed;
                    right: -420px;
                    top: 0;
                    width: 400px;
                    height: 100vh;
                    background: linear-gradient(135deg, rgba(248, 249, 250, 0.98), rgba(255, 255, 255, 0.95));
                    backdrop-filter: blur(40px);
                    border-left: 1px solid rgba(0, 0, 0, 0.15);
                    box-shadow: -4px 0 32px rgba(0, 0, 0, 0.15);
                    transition: right 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                    z-index: 10000;
                    overflow-y: auto;
                    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
                ">
                    <!-- Header -->
                    <div style="
                        background: linear-gradient(135deg, #007AFF, #5AC8FA);
                        color: white;
                        padding: 24px;
                        text-align: center;
                        position: relative;
                    ">
                        <div style="
                            font-size: 1.6em;
                            font-weight: 800;
                            margin-bottom: 8px;
                            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                        ">👤 User Profile & Settings</div>
                        <div style="
                            font-size: 1em;
                            opacity: 0.9;
                            font-weight: 500;
                        ">Profile management & API configuration</div>
                        
                        <button onclick="closeProfileCommand()" style="
                            position: absolute;
                            top: 16px;
                            right: 16px;
                            background: rgba(255, 255, 255, 0.2);
                            color: white;
                            border: none;
                            padding: 10px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 1em;
                            width: 32px;
                            height: 32px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: all 0.2s ease;
                        " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">✕</button>
                    </div>
                    
                    <div style="padding: 24px;">
                        
                        <!-- Profile Picture Section -->
                        <div style="text-align: center; margin-bottom: 24px;">
                            <div id="profile-pic-cmd" onclick="document.getElementById('img-upload-cmd').click()" style="
                                width: 100px;
                                height: 100px;
                                background: linear-gradient(135deg, #F5F5F7, #E5E5EA);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 2.5em;
                                cursor: pointer;
                                margin: 0 auto 12px;
                                border: 3px solid rgba(0, 0, 0, 0.1);
                                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                                transition: all 0.3s ease;
                                overflow: hidden;
                                color: #8E8E93;
                            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">👤</div>
                            
                            <button onclick="document.getElementById('img-upload-cmd').click()" style="
                                background: linear-gradient(135deg, #007AFF, #5AC8FA);
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 12px;
                                font-size: 0.85em;
                                font-weight: 600;
                                cursor: pointer;
                                box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
                            ">📷 Upload Picture</button>
                            
                            <input type="file" id="img-upload-cmd" accept="image/*" style="display: none;" onchange="uploadImageCmd(this)">
                        </div>
                        
                        <!-- Profile Information -->
                        <div style="margin-bottom: 32px;">
                            <div style="font-size: 1.2em; font-weight: 700; color: #1D1D1F; margin-bottom: 16px;">📝 Profile Information</div>
                            
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; color: #1D1D1F; font-weight: 600; margin-bottom: 6px; font-size: 0.9em;">👤 Username</label>
                                <input type="text" id="username-cmd" placeholder="Enter your username" style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 1px solid rgba(0, 0, 0, 0.15);
                                    border-radius: 12px;
                                    font-size: 1em;
                                    background: rgba(255, 255, 255, 0.8);
                                    transition: all 0.2s ease;
                                    box-sizing: border-box;
                                " onfocus="this.style.border='1px solid #007AFF'" onblur="this.style.border='1px solid rgba(0, 0, 0, 0.15)'">
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; color: #1D1D1F; font-weight: 600; margin-bottom: 6px; font-size: 0.9em;">✨ Display Name</label>
                                <input type="text" id="display-name-cmd" placeholder="How others see you" style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 1px solid rgba(0, 0, 0, 0.15);
                                    border-radius: 12px;
                                    font-size: 1em;
                                    background: rgba(255, 255, 255, 0.8);
                                    transition: all 0.2s ease;
                                    box-sizing: border-box;
                                " onfocus="this.style.border='1px solid #007AFF'" onblur="this.style.border='1px solid rgba(0, 0, 0, 0.15)'">
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; color: #1D1D1F; font-weight: 600; margin-bottom: 6px; font-size: 0.9em;">📝 Bio</label>
                                <textarea id="bio-cmd" placeholder="Tell us about yourself..." rows="3" style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 1px solid rgba(0, 0, 0, 0.15);
                                    border-radius: 12px;
                                    font-size: 1em;
                                    background: rgba(255, 255, 255, 0.8);
                                    transition: all 0.2s ease;
                                    box-sizing: border-box;
                                    resize: vertical;
                                    font-family: inherit;
                                " onfocus="this.style.border='1px solid #007AFF'" onblur="this.style.border='1px solid rgba(0, 0, 0, 0.15)'"></textarea>
                            </div>
                        </div>
                        
                        <!-- API KEY MANAGEMENT SECTION -->
                        <div style="
                            background: rgba(0, 122, 255, 0.05);
                            border: 1px solid rgba(0, 122, 255, 0.15);
                            border-radius: 16px;
                            padding: 20px;
                            margin-bottom: 24px;
                        ">
                            <div style="font-size: 1.2em; font-weight: 700; color: #007AFF; margin-bottom: 8px;">🔑 API Key Management</div>
                            <div style="color: #6D6D70; font-size: 0.9em; margin-bottom: 16px; line-height: 1.4;">
                                Replace our default API keys with your own for enhanced features and higher rate limits.
                            </div>
                            
                            <!-- OpenSea API Key -->
                            <div style="margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                    <label style="color: #1D1D1F; font-weight: 600; font-size: 0.9em;">🌊 OpenSea API</label>
                                    <span id="opensea-status" style="color: #34C759; font-size: 0.8em; font-weight: 600;">✅ Configured</span>
                                </div>
                                <input type="text" id="opensea-api-key" placeholder="Enter your OpenSea API key (optional)" style="
                                    width: 100%;
                                    padding: 10px 12px;
                                    border: 1px solid rgba(0, 0, 0, 0.1);
                                    border-radius: 8px;
                                    font-size: 0.85em;
                                    background: rgba(255, 255, 255, 0.9);
                                    box-sizing: border-box;
                                    font-family: monospace;
                                ">
                                <div style="color: #8E8E93; font-size: 0.75em; margin-top: 4px;">
                                    For NFT commands: nft assets, nft analytics, etc.
                                </div>
                            </div>
                            
                            <!-- DexScreener API Key -->
                            <div style="margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                    <label style="color: #1D1D1F; font-weight: 600; font-size: 0.9em;">📊 DexScreener API</label>
                                    <span id="dexscreener-status" style="color: #8E8E93; font-size: 0.8em; font-weight: 600;">⚪ Not Set</span>
                                </div>
                                <input type="text" id="dexscreener-api-key" placeholder="Enter your DexScreener API key (optional)" style="
                                    width: 100%;
                                    padding: 10px 12px;
                                    border: 1px solid rgba(0, 0, 0, 0.1);
                                    border-radius: 8px;
                                    font-size: 0.85em;
                                    background: rgba(255, 255, 255, 0.9);
                                    box-sizing: border-box;
                                    font-family: monospace;
                                ">
                                <div style="color: #8E8E93; font-size: 0.75em; margin-top: 4px;">
                                    For enhanced analytics and higher rate limits
                                </div>
                            </div>
                            
                            <!-- DeFi Llama API Key -->
                            <div style="margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                    <label style="color: #1D1D1F; font-weight: 600; font-size: 0.9em;">🦙 DeFi Llama API</label>
                                    <span id="defillama-status" style="color: #8E8E93; font-size: 0.8em; font-weight: 600;">⚪ Not Set</span>
                                </div>
                                <input type="text" id="defillama-api-key" placeholder="Enter your DeFi Llama API key (optional)" style="
                                    width: 100%;
                                    padding: 10px 12px;
                                    border: 1px solid rgba(0, 0, 0, 0.1);
                                    border-radius: 8px;
                                    font-size: 0.85em;
                                    background: rgba(255, 255, 255, 0.9);
                                    box-sizing: border-box;
                                    font-family: monospace;
                                ">
                                <div style="color: #8E8E93; font-size: 0.75em; margin-top: 4px;">
                                    For TVL data and protocol analytics
                                </div>
                            </div>
                            
                            <!-- CoinGecko API Key -->
                            <div style="margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                    <label style="color: #1D1D1F; font-weight: 600; font-size: 0.9em;">🦎 CoinGecko API</label>
                                    <span id="coingecko-status" style="color: #8E8E93; font-size: 0.8em; font-weight: 600;">⚪ Not Set</span>
                                </div>
                                <input type="text" id="coingecko-api-key" placeholder="Enter your CoinGecko API key (optional)" style="
                                    width: 100%;
                                    padding: 10px 12px;
                                    border: 1px solid rgba(0, 0, 0, 0.1);
                                    border-radius: 8px;
                                    font-size: 0.85em;
                                    background: rgba(255, 255, 255, 0.9);
                                    box-sizing: border-box;
                                    font-family: monospace;
                                ">
                                <div style="color: #8E8E93; font-size: 0.75em; margin-top: 4px;">
                                    For enhanced price data and market analytics
                                </div>
                            </div>
                            
                            <!-- Alpha Vantage API Key -->
                            <div style="margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                    <label style="color: #1D1D1F; font-weight: 600; font-size: 0.9em;">📈 Alpha Vantage API</label>
                                    <span id="alphavantage-status" style="color: #8E8E93; font-size: 0.8em; font-weight: 600;">⚪ Not Set</span>
                                </div>
                                <input type="text" id="alphavantage-api-key" placeholder="Enter your Alpha Vantage API key (optional)" style="
                                    width: 100%;
                                    padding: 10px 12px;
                                    border: 1px solid rgba(0, 0, 0, 0.1);
                                    border-radius: 8px;
                                    font-size: 0.85em;
                                    background: rgba(255, 255, 255, 0.9);
                                    box-sizing: border-box;
                                    font-family: monospace;
                                ">
                                <div style="color: #8E8E93; font-size: 0.75em; margin-top: 4px;">
                                    For stock market data and financial analytics
                                </div>
                            </div>
                            
                            <!-- API Key Actions -->
                            <div style="display: flex; gap: 8px; margin-top: 16px;">
                                <button onclick="saveAPIKeys()" style="
                                    flex: 1;
                                    background: linear-gradient(135deg, #34C759, #30D158);
                                    color: white;
                                    border: none;
                                    padding: 10px 16px;
                                    border-radius: 10px;
                                    font-size: 0.85em;
                                    font-weight: 600;
                                    cursor: pointer;
                                    box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
                                ">🔑 Save API Keys</button>
                                
                                <button onclick="clearAPIKeys()" style="
                                    background: rgba(255, 149, 0, 0.15);
                                    color: #FF9500;
                                    border: 1px solid rgba(255, 149, 0, 0.3);
                                    padding: 10px 12px;
                                    border-radius: 10px;
                                    font-size: 0.8em;
                                    font-weight: 600;
                                    cursor: pointer;
                                ">🗑️ Clear</button>
                            </div>
                        </div>
                        
                        <!-- Profile Action Button -->
                        <button onclick="saveProfileCmd()" style="
                            width: 100%;
                            background: linear-gradient(135deg, #007AFF, #5AC8FA);
                            color: white;
                            border: none;
                            padding: 16px 24px;
                            border-radius: 16px;
                            font-size: 1.1em;
                            font-weight: 700;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
                            margin-top: 8px;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            💾 Save Profile & Settings
                        </button>
                        
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', sidebarHtml);
            
            // Load existing data
            setTimeout(loadExistingProfileData, 100);
            
            console.log('✅ Command-only profile sidebar created');
        }
        
        // ===================================
        // PROFILE FUNCTIONS
        // ===================================
        
        window.openProfileCommand = function() {
            // Create sidebar if it doesn't exist
            if (!document.getElementById('profile-command-sidebar')) {
                createProfileSidebar();
            }
            
            const sidebar = document.getElementById('profile-command-sidebar');
            if (sidebar) {
                sidebar.style.right = '0px';
                
                // Reload data when opening
                setTimeout(loadExistingProfileData, 100);
                
                if (window.terminal) {
                    window.terminal.log('👤 Profile & API settings opened', 'info');
                    window.terminal.log('🔑 Configure your own API keys for enhanced features', 'info');
                }
            }
        };
        
        window.closeProfileCommand = function() {
            const sidebar = document.getElementById('profile-command-sidebar');
            if (sidebar) {
                sidebar.style.right = '-420px';
                
                if (window.terminal) {
                    window.terminal.log('👤 Profile & settings closed', 'info');
                }
            }
        };
        
        window.uploadImageCmd = function(input) {
            const file = input.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageUrl = e.target.result;
                    
                    // Update preview
                    const preview = document.getElementById('profile-pic-cmd');
                    if (preview) {
                        preview.style.backgroundImage = `url(${imageUrl})`;
                        preview.style.backgroundSize = 'cover';
                        preview.style.backgroundPosition = 'center';
                        preview.textContent = '';
                    }
                    
                    localStorage.setItem('omega_profile_image', imageUrl);
                    
                    if (window.terminal) {
                        window.terminal.log('✅ Profile picture uploaded successfully!', 'success');
                    }
                };
                
                reader.readAsDataURL(file);
            }
        };
        
        // ===================================
        // API KEY FUNCTIONS
        // ===================================
        
        window.saveAPIKeys = function() {
            const apiKeys = {
                opensea: document.getElementById('opensea-api-key')?.value.trim(),
                dexscreener: document.getElementById('dexscreener-api-key')?.value.trim(),
                defillama: document.getElementById('defillama-api-key')?.value.trim(),
                coingecko: document.getElementById('coingecko-api-key')?.value.trim(),
                alphavantage: document.getElementById('alphavantage-api-key')?.value.trim()
            };
            
            let savedCount = 0;
            
            // Save each API key
            Object.entries(apiKeys).forEach(([service, key]) => {
                if (key) {
                    localStorage.setItem(`${service}_api_key`, key);
                    savedCount++;
                    
                    // Update status indicators
                    const statusEl = document.getElementById(`${service}-status`);
                    if (statusEl) {
                        statusEl.textContent = '✅ Configured';
                        statusEl.style.color = '#34C759';
                    }
                }
            });
            
            if (window.terminal) {
                if (savedCount > 0) {
                    window.terminal.log(`✅ Saved ${savedCount} API key(s) successfully!`, 'success');
                    window.terminal.log('🔑 Your custom API keys will now be used instead of defaults', 'info');
                } else {
                    window.terminal.log('💡 No API keys entered - using default keys', 'info');
                }
            }
        };
        
        window.clearAPIKeys = function() {
            const services = ['opensea', 'dexscreener', 'defillama', 'coingecko', 'alphavantage'];
            
            services.forEach(service => {
                localStorage.removeItem(`${service}_api_key`);
                
                // Clear input
                const input = document.getElementById(`${service}-api-key`);
                if (input) input.value = '';
                
                // Update status
                const statusEl = document.getElementById(`${service}-status`);
                if (statusEl) {
                    statusEl.textContent = '⚪ Not Set';
                    statusEl.style.color = '#8E8E93';
                }
            });
            
            if (window.terminal) {
                window.terminal.log('🗑️ All custom API keys cleared - reverted to defaults', 'info');
            }
        };
        
        window.saveProfileCmd = function() {
            const username = document.getElementById('username-cmd')?.value.trim();
            const displayName = document.getElementById('display-name-cmd')?.value.trim();
            const bio = document.getElementById('bio-cmd')?.value.trim();
            
            // Save API keys first
            saveAPIKeys();
            
            if (!username) {
                if (window.terminal) {
                    window.terminal.log('💡 API keys saved. Add username to save profile info too.', 'info');
                }
                return;
            }
            
            const profile = {
                username,
                displayName: displayName || username,
                bio,
                profileImage: localStorage.getItem('omega_profile_image'),
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                social: { level: 1, experience: 0 }
            };
            
            localStorage.setItem('omega_terminal_profile', JSON.stringify(profile));
            
            if (window.terminal) {
                window.terminal.log('✅ Profile and API keys saved!', 'success');
                window.terminal.log(`🎉 Welcome ${profile.displayName}!`, 'success');
            }
            
            setTimeout(closeProfileCommand, 2000);
        };
        
        function loadExistingProfileData() {
            // Load profile data
            try {
                const profileData = localStorage.getItem('omega_terminal_profile');
                if (profileData) {
                    const profile = JSON.parse(profileData);
                    
                    if (profile.username) {
                        document.getElementById('username-cmd').value = profile.username;
                        document.getElementById('display-name-cmd').value = profile.displayName || '';
                        document.getElementById('bio-cmd').value = profile.bio || '';
                        
                        if (profile.profileImage) {
                            const preview = document.getElementById('profile-pic-cmd');
                            if (preview) {
                                preview.style.backgroundImage = `url(${profile.profileImage})`;
                                preview.style.backgroundSize = 'cover';
                                preview.textContent = '';
                            }
                        }
                    }
                }
            } catch (error) {
                // Ignore
            }
            
            // Load API keys and update status
            const apiServices = [
                { id: 'opensea', name: 'OpenSea' },
                { id: 'dexscreener', name: 'DexScreener' },
                { id: 'defillama', name: 'DeFi Llama' },
                { id: 'coingecko', name: 'CoinGecko' },
                { id: 'alphavantage', name: 'Alpha Vantage' }
            ];
            
            apiServices.forEach(service => {
                const savedKey = localStorage.getItem(`${service.id}_api_key`);
                const input = document.getElementById(`${service.id}-api-key`);
                const status = document.getElementById(`${service.id}-status`);
                
                if (input && savedKey) {
                    input.value = savedKey;
                }
                
                if (status) {
                    if (savedKey) {
                        status.textContent = '✅ Configured';
                        status.style.color = '#34C759';
                    } else {
                        status.textContent = '⚪ Not Set';
                        status.style.color = '#8E8E93';
                    }
                }
            });
        }
        
        // ===================================
        // OVERRIDE PROFILE COMMAND
        // ===================================
        
        const originalExecuteCommand = window.terminal.executeCommand;
        window.terminal.executeCommand = function(command) {
            const args = command.trim().split(/\s+/);
            
            if (args[0].toLowerCase() === 'profile') {
                openProfileCommand();
                return;
            }
            
            return originalExecuteCommand.call(this, command);
        };
        
        console.log('✅ Command-only profile system ready');
        console.log('👤 Type "profile" to open profile & API key management');
    }
    
    // Initialize
    setTimeout(() => {
        initializeCommandProfile();
        
        if (window.terminal) {
            window.terminal.log('✅ Profile system ready - NO BUTTONS, command-only access', 'success');
            window.terminal.log('👤 Type: profile (to open profile & API key management)', 'info');
            window.terminal.log('🔑 Configure your own API keys for enhanced features', 'info');
        }
    }, 500);
    
})();

console.log('✅ Command-only profile system loaded!'); 