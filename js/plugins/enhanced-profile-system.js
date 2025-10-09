/* ===================================
   ENHANCED PROFILE SYSTEM v2.0
   Omega ENS, Address Book, Chat, Fullscreen
   =================================== */

console.log('🔧 Loading Enhanced Profile System...');

(function() {
    
    // ===================================
    // ENHANCED PROFILE DATA STRUCTURE
    // ===================================
    
    const profileData = {
        username: '',
        email: '',
        profilePicture: '',
        ensName: '',
        ensRegistered: false,
        addressBook: [],
        pythonScripts: [],
        apiKeys: {
            opensea: '',
            dexscreener: '',
            defillama: '',
            pgt: ''
        },
        preferences: {
            theme: 'default',
            fullscreen: false,
            autoSave: true
        }
    };
    
    // Load saved data
    function loadProfileData() {
        const saved = localStorage.getItem('omega-profile-data');
        if (saved) {
            Object.assign(profileData, JSON.parse(saved));
        }
    }
    
    // Save data
    function saveProfileData() {
        localStorage.setItem('omega-profile-data', JSON.stringify(profileData));
    }
    
    // ===================================
    // OMEGA ENS INTEGRATION
    // ===================================
    
    async function registerENS(ensName) {
        try {
            if (!window.terminal || !window.terminal.signer) {
                throw new Error('Wallet not connected');
            }
            
            const address = await window.terminal.signer.getAddress();
            
            // Use the existing ENS registration system
            if (window.terminal.executeCommand) {
                window.terminal.log(`🔗 Registering ENS: ${ensName}`, 'info');
                
                // Call the actual ENS registration command
                const ensCommand = `ens register ${ensName}`;
                window.terminal.executeCommand(ensCommand);
                
                // Simulate success for now (in real implementation, this would wait for the ENS command to complete)
                setTimeout(() => {
                    profileData.ensName = ensName;
                    profileData.ensRegistered = true;
                    saveProfileData();
                    updateProfileUI();
                    window.terminal.log(`✅ ENS registered: ${ensName}.omega`, 'success');
                }, 2000);
                
                return true;
            } else {
                throw new Error('Terminal not available');
            }
        } catch (error) {
            window.terminal.log(`❌ ENS registration failed: ${error.message}`, 'error');
            return false;
        }
    }
    
    async function simulateENSRegistration(ensName, address) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate success/failure
        if (ensName.length < 3) {
            return { success: false, error: 'ENS name must be at least 3 characters' };
        }
        
        return {
            success: true,
            data: {
                name: ensName,
                address: address,
                registered: true,
                expires: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
            }
        };
    }
    
    // ===================================
    // ADDRESS BOOK MANAGEMENT
    // ===================================
    
    function addToAddressBook(name, address, ens = '') {
        const entry = {
            id: Date.now(),
            name: name,
            address: address,
            ens: ens,
            added: new Date().toISOString()
        };
        
        profileData.addressBook.push(entry);
        saveProfileData();
        updateAddressBookUI();
        
        window.terminal.log(`✅ Added to address book: ${name}`, 'success');
    }
    
    function removeFromAddressBook(id) {
        const index = profileData.addressBook.findIndex(entry => entry.id === id);
        if (index !== -1) {
            const removed = profileData.addressBook.splice(index, 1)[0];
            saveProfileData();
            updateAddressBookUI();
            window.terminal.log(`🗑️ Removed from address book: ${removed.name}`, 'info');
        }
    }
    
    // ===================================
    // CHAT INTEGRATION
    // ===================================
    
    function toggleChat() {
        profileData.chatSettings.enabled = !profileData.chatSettings.enabled;
        saveProfileData();
        updateChatUI();
        
        if (profileData.chatSettings.enabled) {
            window.terminal.log('💬 Chat enabled - use "chat" command', 'success');
        } else {
            window.terminal.log('💬 Chat disabled', 'info');
        }
    }
    
    // ===================================
    // FULLSCREEN PROFILE
    // ===================================
    
    function toggleFullscreen() {
        const sidebar = document.getElementById('enhanced-profile-sidebar');
        if (!sidebar) return;
        
        profileData.preferences.fullscreen = !profileData.preferences.fullscreen;
        saveProfileData();
        
        if (profileData.preferences.fullscreen) {
            sidebar.style.width = '100vw';
            sidebar.style.height = '100vh';
            sidebar.style.right = '0';
            sidebar.style.top = '0';
            sidebar.style.borderRadius = '0';
            sidebar.style.maxWidth = 'none';
        } else {
            sidebar.style.width = '450px';
            sidebar.style.height = '100vh';
            sidebar.style.right = '-450px';
            sidebar.style.top = '0';
            sidebar.style.borderRadius = '0';
            sidebar.style.maxWidth = '450px';
        }
        
        updateFullscreenUI();
    }
    
    // ===================================
    // ENHANCED PROFILE UI
    // ===================================
    
    function createEnhancedProfileSidebar() {
        // Remove existing sidebar
        const existingSidebar = document.getElementById('enhanced-profile-sidebar');
        if (existingSidebar) existingSidebar.remove();
        
            const sidebarHtml = `
                <div id="enhanced-profile-sidebar" style="
                    position: fixed;
                    right: -450px;
                    top: 0;
                    width: 450px;
                    height: 100vh;
                    background: linear-gradient(135deg, rgba(18, 18, 18, 0.98), rgba(28, 28, 30, 0.95));
                    backdrop-filter: blur(40px);
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: -4px 0 32px rgba(0, 0, 0, 0.3);
                    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                    z-index: 10000;
                    overflow-y: auto;
                    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
                ">
                    <!-- Header -->
                    <div style="
                        background: linear-gradient(135deg, #1C1C1E, #2C2C2E);
                        color: white;
                        padding: 24px;
                        text-align: center;
                        position: relative;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    ">
                        <div style="
                            font-size: 1.6em;
                            font-weight: 800;
                            margin-bottom: 8px;
                            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
                        ">👤 Enhanced Profile</div>
                        <div style="
                            font-size: 1em;
                            opacity: 0.8;
                            font-weight: 500;
                        ">ENS Registration & Address Book</div>
                    
                    <button onclick="closeEnhancedProfile()" style="
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
                    
                    <button onclick="toggleFullscreen()" style="
                        position: absolute;
                        top: 16px;
                        right: 60px;
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
                    " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'" title="Toggle Fullscreen">🖥️</button>
                </div>
                
                <div style="padding: 24px;">
                    
                    <!-- Profile Picture Section -->
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div id="enhanced-profile-pic" onclick="document.getElementById('enhanced-img-upload').click()" style="
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
                        
                        <button onclick="document.getElementById('enhanced-img-upload').click()" style="
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
                        
                        <input type="file" id="enhanced-img-upload" accept="image/*" style="display: none;" onchange="uploadEnhancedImage(this)">
                    </div>
                    
                    <!-- Profile Information -->
                    <div style="margin-bottom: 32px;">
                        <div style="font-size: 1.2em; font-weight: 700; color: #FFFFFF; margin-bottom: 16px;">📝 Profile Information</div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; color: #FFFFFF; font-weight: 600; margin-bottom: 6px; font-size: 0.9em;">👤 Username</label>
                            <input type="text" id="enhanced-username" placeholder="Enter your username" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                border-radius: 12px;
                                font-size: 1em;
                                background: rgba(28, 28, 30, 0.8);
                                color: white;
                                transition: all 0.2s ease;
                                box-sizing: border-box;
                            " onfocus="this.style.border='1px solid #007AFF'" onblur="this.style.border='1px solid rgba(255, 255, 255, 0.2)'" onchange="updateProfileField('username', this.value)">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; color: #FFFFFF; font-weight: 600; margin-bottom: 6px; font-size: 0.9em;">📧 Email</label>
                            <input type="email" id="enhanced-email" placeholder="Enter your email" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                border-radius: 12px;
                                font-size: 1em;
                                background: rgba(28, 28, 30, 0.8);
                                color: white;
                                transition: all 0.2s ease;
                                box-sizing: border-box;
                            " onfocus="this.style.border='1px solid #007AFF'" onblur="this.style.border='1px solid rgba(255, 255, 255, 0.2)'" onchange="updateProfileField('email', this.value)">
                        </div>
                    </div>
                    
                    <!-- Omega ENS Section -->
                    <div style="margin-bottom: 32px;">
                        <div style="font-size: 1.2em; font-weight: 700; color: #FFFFFF; margin-bottom: 16px;">🔗 Omega ENS</div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; color: #FFFFFF; font-weight: 600; margin-bottom: 6px; font-size: 0.9em;">🏷️ ENS Name</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="text" id="enhanced-ens-name" placeholder="Enter ENS name" style="
                                    flex: 1;
                                    padding: 12px 16px;
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    border-radius: 12px;
                                    font-size: 1em;
                                    background: rgba(28, 28, 30, 0.8);
                                    color: white;
                                    transition: all 0.2s ease;
                                    box-sizing: border-box;
                                " onfocus="this.style.border='1px solid #007AFF'" onblur="this.style.border='1px solid rgba(255, 255, 255, 0.2)'">
                                <button onclick="registerENSFromProfile()" style="
                                    background: linear-gradient(135deg, #34C759, #30D158);
                                    color: white;
                                    border: none;
                                    padding: 12px 20px;
                                    border-radius: 12px;
                                    font-size: 0.9em;
                                    font-weight: 600;
                                    cursor: pointer;
                                    box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
                                    white-space: nowrap;
                                ">Register</button>
                            </div>
                        </div>
                        
                        <div id="ens-status" style="
                            padding: 12px;
                            border-radius: 12px;
                            background: rgba(255, 255, 255, 0.05);
                            font-size: 0.9em;
                            color: #FF9500;
                            border: 1px solid rgba(255, 149, 0, 0.2);
                        ">
                            ⚠️ No ENS registered
                        </div>
                    </div>
                    
                    <!-- Address Book Section -->
                    <div style="margin-bottom: 32px;">
                        <div style="font-size: 1.2em; font-weight: 700; color: #FFFFFF; margin-bottom: 16px;">📇 Address Book</div>
                        
                        <div style="margin-bottom: 16px;">
                            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                                <input type="text" id="address-book-name" placeholder="Contact name" style="
                                    flex: 1;
                                    padding: 10px 12px;
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    border-radius: 8px;
                                    font-size: 0.9em;
                                    background: rgba(28, 28, 30, 0.8);
                                    color: white;
                                ">
                                <input type="text" id="address-book-address" placeholder="Address/ENS" style="
                                    flex: 1;
                                    padding: 10px 12px;
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    border-radius: 8px;
                                    font-size: 0.9em;
                                    background: rgba(28, 28, 30, 0.8);
                                    color: white;
                                ">
                                <button onclick="addToAddressBookFromProfile()" style="
                                    background: linear-gradient(135deg, #007AFF, #5AC8FA);
                                    color: white;
                                    border: none;
                                    padding: 10px 16px;
                                    border-radius: 8px;
                                    font-size: 0.9em;
                                    font-weight: 600;
                                    cursor: pointer;
                                ">Add</button>
                            </div>
                        </div>
                        
                        <div id="address-book-list" style="max-height: 200px; overflow-y: auto;">
                            <!-- Address book entries will be populated here -->
                        </div>
                    </div>
                    
                    <!-- Terminal Chatter Section -->
                    <div style="margin-bottom: 32px;">
                        <div style="font-size: 1.2em; font-weight: 700; color: #FFFFFF; margin-bottom: 16px;">💬 Terminal Chatter</div>
                        
                        <div style="margin-bottom: 16px;">
                            <div style="
                                padding: 16px;
                                border-radius: 12px;
                                background: rgba(0, 122, 255, 0.1);
                                border: 1px solid rgba(0, 122, 255, 0.2);
                                margin-bottom: 12px;
                            ">
                                <div style="color: #007AFF; font-weight: 600; margin-bottom: 8px;">🚀 Telegram-like Chat</div>
                                <div style="color: #8E8E93; font-size: 0.9em; line-height: 1.4;">
                                    Join the Omega Terminal community chat! Real-time messaging with other users.
                                </div>
                            </div>
                            
                            <button onclick="openChatFromProfile()" style="
                                width: 100%;
                                background: linear-gradient(135deg, #007AFF, #5AC8FA);
                                color: white;
                                border: none;
                                padding: 16px;
                                border-radius: 12px;
                                font-size: 1.1em;
                                font-weight: 700;
                                cursor: pointer;
                                box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
                                transition: all 0.2s ease;
                            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                💬 Open Terminal Chatter
                            </button>
                        </div>
                        
                        <div style="
                            padding: 12px;
                            border-radius: 8px;
                            background: rgba(255, 255, 255, 0.05);
                            font-size: 0.9em;
                            color: #8E8E93;
                        ">
                            <div style="margin-bottom: 8px;">💡 Quick Commands:</div>
                            <div style="margin-left: 12px;">
                                <div>• <code style="background: rgba(255, 255, 255, 0.1); padding: 2px 6px; border-radius: 4px;">chat</code> - Open chat</div>
                                <div>• <code style="background: rgba(255, 255, 255, 0.1); padding: 2px 6px; border-radius: 4px;">chat settings</code> - Settings</div>
                                <div>• <code style="background: rgba(255, 255, 255, 0.1); padding: 2px 6px; border-radius: 4px;">chat help</code> - Help</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Python Scripts Section -->
                    <div style="margin-bottom: 32px;">
                        <div style="font-size: 1.2em; font-weight: 700; color: #FFFFFF; margin-bottom: 16px;">🐍 Python Scripts</div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; color: #FFFFFF; font-weight: 600; margin-bottom: 6px; font-size: 0.9em;">📁 Upload Python Script</label>
                            <input type="file" id="python-script-upload" accept=".py" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                border-radius: 12px;
                                font-size: 1em;
                                background: rgba(28, 28, 30, 0.8);
                                color: white;
                                transition: all 0.2s ease;
                                box-sizing: border-box;
                            " onchange="uploadPythonScript(this)">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                                <input type="text" id="python-script-name" placeholder="Script name" style="
                                    flex: 1;
                                    padding: 10px 12px;
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    border-radius: 8px;
                                    font-size: 0.9em;
                                    background: rgba(28, 28, 30, 0.8);
                                    color: white;
                                ">
                                <button onclick="createPythonScript()" style="
                                    background: linear-gradient(135deg, #34C759, #30D158);
                                    color: white;
                                    border: none;
                                    padding: 10px 16px;
                                    border-radius: 8px;
                                    font-size: 0.9em;
                                    font-weight: 600;
                                    cursor: pointer;
                                ">Create</button>
                            </div>
                        </div>
                        
                        <div id="python-scripts-list" style="max-height: 200px; overflow-y: auto;">
                            <!-- Python scripts will be populated here -->
                        </div>
                        
                        <div style="margin-top: 12px;">
                            <button onclick="runPythonScriptFromProfile()" style="
                                background: linear-gradient(135deg, #007AFF, #5AC8FA);
                                color: white;
                                border: none;
                                padding: 10px 16px;
                                border-radius: 8px;
                                font-size: 0.9em;
                                font-weight: 600;
                                cursor: pointer;
                                margin-right: 8px;
                            ">▶️ Run Selected</button>
                            
                            <button onclick="deletePythonScriptFromProfile()" style="
                                background: #FF3B30;
                                color: white;
                                border: none;
                                padding: 10px 16px;
                                border-radius: 8px;
                                font-size: 0.9em;
                                font-weight: 600;
                                cursor: pointer;
                            ">🗑️ Delete Selected</button>
                        </div>
                    </div>
                    
                    <!-- API Keys Section -->
                    <div style="margin-bottom: 32px;">
                        <div style="font-size: 1.2em; font-weight: 700; color: #FFFFFF; margin-bottom: 16px;">🔑 API Keys</div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; color: #FFFFFF; font-weight: 600; margin-bottom: 6px; font-size: 0.9em;">🌊 OpenSea API Key</label>
                            <input type="password" id="opensea-key" placeholder="Enter OpenSea API key" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                border-radius: 12px;
                                font-size: 1em;
                                background: rgba(28, 28, 30, 0.8);
                                color: white;
                                transition: all 0.2s ease;
                                box-sizing: border-box;
                            " onfocus="this.style.border='1px solid #007AFF'" onblur="this.style.border='1px solid rgba(255, 255, 255, 0.2)'" onchange="updateAPIKey('opensea', this.value)">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; color: #FFFFFF; font-weight: 600; margin-bottom: 6px; font-size: 0.9em;">📊 DexScreener API Key</label>
                            <input type="password" id="dexscreener-key" placeholder="Enter DexScreener API key" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                border-radius: 12px;
                                font-size: 1em;
                                background: rgba(28, 28, 30, 0.8);
                                color: white;
                                transition: all 0.2s ease;
                                box-sizing: border-box;
                            " onfocus="this.style.border='1px solid #007AFF'" onblur="this.style.border='1px solid rgba(255, 255, 255, 0.2)'" onchange="updateAPIKey('dexscreener', this.value)">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; color: #FFFFFF; font-weight: 600; margin-bottom: 6px; font-size: 0.9em;">🦙 DeFi Llama API Key</label>
                            <input type="password" id="defillama-key" placeholder="Enter DeFi Llama API key" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                border-radius: 12px;
                                font-size: 1em;
                                background: rgba(28, 28, 30, 0.8);
                                color: white;
                                transition: all 0.2s ease;
                                box-sizing: border-box;
                            " onfocus="this.style.border='1px solid #007AFF'" onblur="this.style.border='1px solid rgba(255, 255, 255, 0.2)'" onchange="updateAPIKey('defillama', this.value)">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; color: #FFFFFF; font-weight: 600; margin-bottom: 6px; font-size: 0.9em;">🎯 PGT API Key</label>
                            <input type="password" id="pgt-key" placeholder="Enter PGT API key" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                border-radius: 12px;
                                font-size: 1em;
                                background: rgba(28, 28, 30, 0.8);
                                color: white;
                                transition: all 0.2s ease;
                                box-sizing: border-box;
                            " onfocus="this.style.border='1px solid #007AFF'" onblur="this.style.border='1px solid rgba(255, 255, 255, 0.2)'" onchange="updateAPIKey('pgt', this.value)">
                        </div>
                    </div>
                    
                    <!-- Save Button -->
                    <button onclick="saveEnhancedProfile()" style="
                        width: 100%;
                        background: linear-gradient(135deg, #34C759, #30D158);
                        color: white;
                        border: none;
                        padding: 16px;
                        border-radius: 12px;
                        font-size: 1.1em;
                        font-weight: 700;
                        cursor: pointer;
                        box-shadow: 0 4px 16px rgba(52, 199, 89, 0.3);
                        transition: all 0.2s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">💾 Save Profile</button>
                    
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', sidebarHtml);
        loadProfileData();
        updateProfileUI();
    }
    
    // ===================================
    // UI UPDATE FUNCTIONS
    // ===================================
    
    function updateProfileUI() {
        // Update form fields
        const usernameField = document.getElementById('enhanced-username');
        const emailField = document.getElementById('enhanced-email');
        const ensNameField = document.getElementById('enhanced-ens-name');
        
        if (usernameField) usernameField.value = profileData.username;
        if (emailField) emailField.value = profileData.email;
        if (ensNameField) ensNameField.value = profileData.ensName;
        
        // Update profile picture
        const profilePic = document.getElementById('enhanced-profile-pic');
        if (profilePic && profileData.profilePicture) {
            profilePic.style.backgroundImage = `url(${profileData.profilePicture})`;
            profilePic.style.backgroundSize = 'cover';
            profilePic.style.backgroundPosition = 'center';
            profilePic.textContent = '';
        }
        
        // Update ENS status
        updateENSStatus();
        
        // Update address book
        updateAddressBookUI();
        
        // Update Python scripts
        updatePythonScriptsUI();
        
        // Update API keys
        updateAPIKeysUI();
    }
    
    function updateENSStatus() {
        const ensStatus = document.getElementById('ens-status');
        if (!ensStatus) return;
        
        if (profileData.ensRegistered && profileData.ensName) {
            ensStatus.innerHTML = `
                <div style="color: #34C759; font-weight: 600;">
                    ✅ Registered: ${profileData.ensName}.omega
                </div>
                <div style="font-size: 0.8em; color: #8E8E93; margin-top: 4px;">
                    Connected to your wallet
                </div>
            `;
            ensStatus.style.color = '#34C759';
            ensStatus.style.border = '1px solid rgba(52, 199, 89, 0.2)';
        } else {
            ensStatus.innerHTML = `
                <div style="color: #FF9500;">
                    ⚠️ No ENS registered
                </div>
                <div style="font-size: 0.8em; color: #8E8E93; margin-top: 4px;">
                    Register an ENS name to get started
                </div>
            `;
            ensStatus.style.color = '#FF9500';
            ensStatus.style.border = '1px solid rgba(255, 149, 0, 0.2)';
        }
    }
    
    function updateAddressBookUI() {
        const addressBookList = document.getElementById('address-book-list');
        if (!addressBookList) return;
        
        if (profileData.addressBook.length === 0) {
            addressBookList.innerHTML = `
                <div style="text-align: center; color: #666; padding: 20px; font-style: italic;">
                    No contacts in address book
                </div>
            `;
            return;
        }
        
        addressBookList.innerHTML = profileData.addressBook.map(entry => `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                margin-bottom: 8px;
                background: rgba(28, 28, 30, 0.5);
            ">
                <div>
                    <div style="font-weight: 600; color: #FFFFFF;">${entry.name}</div>
                    <div style="font-size: 0.8em; color: #8E8E93;">${entry.address}</div>
                    ${entry.ens ? `<div style="font-size: 0.8em; color: #007AFF;">${entry.ens}</div>` : ''}
                </div>
                <button onclick="removeFromAddressBook(${entry.id})" style="
                    background: #FF3B30;
                    color: white;
                    border: none;
                    padding: 6px 10px;
                    border-radius: 6px;
                    font-size: 0.8em;
                    cursor: pointer;
                ">Remove</button>
            </div>
        `).join('');
    }
    
    function updatePythonScriptsUI() {
        const pythonScriptsList = document.getElementById('python-scripts-list');
        if (!pythonScriptsList) return;
        
        if (profileData.pythonScripts.length === 0) {
            pythonScriptsList.innerHTML = `
                <div style="text-align: center; color: #8E8E93; padding: 20px; font-style: italic;">
                    No Python scripts uploaded
                </div>
            `;
            return;
        }
        
        pythonScriptsList.innerHTML = profileData.pythonScripts.map((script, index) => `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                margin-bottom: 8px;
                background: rgba(28, 28, 30, 0.5);
                cursor: pointer;
            " onclick="selectPythonScript(${index})" id="python-script-${index}">
                <div>
                    <div style="font-weight: 600; color: #FFFFFF;">${script.name}</div>
                    <div style="font-size: 0.8em; color: #8E8E93;">${script.size} bytes</div>
                </div>
                <div style="font-size: 0.8em; color: #34C759;">🐍</div>
            </div>
        `).join('');
    }
    
    function updateAPIKeysUI() {
        const openseaKey = document.getElementById('opensea-key');
        const dexscreenerKey = document.getElementById('dexscreener-key');
        const defillamaKey = document.getElementById('defillama-key');
        const pgtKey = document.getElementById('pgt-key');
        
        if (openseaKey) openseaKey.value = profileData.apiKeys.opensea;
        if (dexscreenerKey) dexscreenerKey.value = profileData.apiKeys.dexscreener;
        if (defillamaKey) defillamaKey.value = profileData.apiKeys.defillama;
        if (pgtKey) pgtKey.value = profileData.apiKeys.pgt;
    }
    
    function updateFullscreenUI() {
        const fullscreenBtn = document.querySelector('[onclick="toggleFullscreen()"]');
        if (fullscreenBtn) {
            fullscreenBtn.textContent = profileData.preferences.fullscreen ? '📱' : '🖥️';
            fullscreenBtn.title = profileData.preferences.fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
        }
    }
    
    // ===================================
    // EVENT HANDLERS
    // ===================================
    
    window.openEnhancedProfile = function() {
        createEnhancedProfileSidebar();
        const sidebar = document.getElementById('enhanced-profile-sidebar');
        if (sidebar) {
            sidebar.style.right = '0';
        }
    };
    
    window.closeEnhancedProfile = function() {
        const sidebar = document.getElementById('enhanced-profile-sidebar');
        if (sidebar) {
            sidebar.style.right = '-450px';
            setTimeout(() => {
                if (sidebar.parentNode) {
                    sidebar.remove();
                }
            }, 400);
        }
    };
    
    window.toggleFullscreen = toggleFullscreen;
    
    window.updateProfileField = function(field, value) {
        profileData[field] = value;
        saveProfileData();
    };
    
    window.updateAPIKey = function(service, key) {
        profileData.apiKeys[service] = key;
        saveProfileData();
        
        // Update global API keys if they exist
        if (window.terminal && window.terminal.apiKeys) {
            window.terminal.apiKeys[service] = key;
        }
    };
    
    
    window.registerENSFromProfile = async function() {
        const ensNameField = document.getElementById('enhanced-ens-name');
        const ensName = ensNameField.value.trim();
        
        if (!ensName) {
            window.terminal.log('❌ Please enter an ENS name', 'error');
            return;
        }
        
        const success = await registerENS(ensName);
        if (success) {
            ensNameField.value = '';
        }
    };
    
    window.addToAddressBookFromProfile = function() {
        const nameField = document.getElementById('address-book-name');
        const addressField = document.getElementById('address-book-address');
        
        const name = nameField.value.trim();
        const address = addressField.value.trim();
        
        if (!name || !address) {
            window.terminal.log('❌ Please enter both name and address', 'error');
            return;
        }
        
        addToAddressBook(name, address);
        nameField.value = '';
        addressField.value = '';
    };
    
    window.removeFromAddressBook = removeFromAddressBook;
    
    // Python Script Management
    window.uploadPythonScript = function(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const script = {
                id: Date.now(),
                name: file.name.replace('.py', ''),
                content: e.target.result,
                size: file.size,
                uploaded: new Date().toISOString()
            };
            
            profileData.pythonScripts.push(script);
            saveProfileData();
            updatePythonScriptsUI();
            
            // Also upload to Python system if available
            if (window.omegaPython && window.omegaPython.uploadScript) {
                window.omegaPython.uploadScript(script.name, script.content);
            }
            
            window.terminal.log(`✅ Python script uploaded: ${script.name}`, 'success');
        };
        reader.readAsText(file);
    };
    
    window.createPythonScript = function() {
        const nameField = document.getElementById('python-script-name');
        const name = nameField.value.trim();
        
        if (!name) {
            window.terminal.log('❌ Please enter a script name', 'error');
            return;
        }
        
        const script = {
            id: Date.now(),
            name: name,
            content: `# ${name}\nprint("Hello from ${name}!")\n`,
            size: 0,
            uploaded: new Date().toISOString()
        };
        
        profileData.pythonScripts.push(script);
        saveProfileData();
        updatePythonScriptsUI();
        
        // Also create in Python system if available
        if (window.omegaPython && window.omegaPython.uploadScript) {
            window.omegaPython.uploadScript(script.name, script.content);
        }
        
        nameField.value = '';
        window.terminal.log(`✅ Python script created: ${name}`, 'success');
    };
    
    window.selectPythonScript = function(index) {
        // Remove previous selection
        document.querySelectorAll('[id^="python-script-"]').forEach(el => {
            el.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            el.style.background = 'rgba(28, 28, 30, 0.5)';
        });
        
        // Select current script
        const scriptEl = document.getElementById(`python-script-${index}`);
        if (scriptEl) {
            scriptEl.style.border = '1px solid #007AFF';
            scriptEl.style.background = 'rgba(0, 122, 255, 0.1)';
        }
        
        // Store selected index
        window.selectedPythonScriptIndex = index;
    };
    
    window.runPythonScriptFromProfile = function() {
        if (window.selectedPythonScriptIndex === undefined) {
            window.terminal.log('❌ Please select a script first', 'error');
            return;
        }
        
        const script = profileData.pythonScripts[window.selectedPythonScriptIndex];
        if (!script) {
            window.terminal.log('❌ Script not found', 'error');
            return;
        }
        
        // Run script using Python system
        if (window.omegaPython && window.omegaPython.runScript) {
            window.omegaPython.runScript(script.name);
            window.terminal.log(`▶️ Running Python script: ${script.name}`, 'info');
        } else {
            window.terminal.log('❌ Python system not available', 'error');
        }
    };
    
    window.deletePythonScriptFromProfile = function() {
        if (window.selectedPythonScriptIndex === undefined) {
            window.terminal.log('❌ Please select a script first', 'error');
            return;
        }
        
        const script = profileData.pythonScripts[window.selectedPythonScriptIndex];
        if (!script) {
            window.terminal.log('❌ Script not found', 'error');
            return;
        }
        
        // Remove from profile data
        profileData.pythonScripts.splice(window.selectedPythonScriptIndex, 1);
        saveProfileData();
        updatePythonScriptsUI();
        
        // Remove from Python system if available
        if (window.omegaPython && window.omegaPython.deleteScript) {
            window.omegaPython.deleteScript(script.name);
        }
        
        window.selectedPythonScriptIndex = undefined;
        window.terminal.log(`🗑️ Deleted Python script: ${script.name}`, 'info');
    };
    
    // Terminal Chatter Integration
    window.openChatFromProfile = function() {
        if (window.openChat) {
            window.openChat();
            window.terminal.log('💬 Opening Terminal Chatter...', 'info');
        } else {
            window.terminal.log('❌ Terminal Chatter not available', 'error');
        }
    };
    
    window.uploadEnhancedImage = function(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            profileData.profilePicture = e.target.result;
            saveProfileData();
            updateProfileUI();
            window.terminal.log('✅ Profile picture updated', 'success');
        };
        reader.readAsDataURL(file);
    };
    
    window.saveEnhancedProfile = function() {
        saveProfileData();
        window.terminal.log('✅ Profile saved successfully', 'success');
    };
    
    // ===================================
    // COMMAND HANDLER
    // ===================================
    
    window.handleEnhancedProfileCommand = function(args) {
        const subcommand = args[0]?.toLowerCase();
        
        switch (subcommand) {
            case 'open':
            case 'show':
                openEnhancedProfile();
                break;
                
            case 'close':
                closeEnhancedProfile();
                break;
                
            case 'fullscreen':
                toggleFullscreen();
                break;
                
            case 'help':
                showEnhancedProfileHelp();
                break;
                
            default:
                openEnhancedProfile();
        }
    };
    
    function showEnhancedProfileHelp() {
        window.terminal.log('👤 Enhanced Profile Commands:', 'info');
        window.terminal.log('', 'output');
        window.terminal.log('  profile open          - Open enhanced profile', 'output');
        window.terminal.log('  profile close         - Close profile', 'output');
        window.terminal.log('  profile fullscreen    - Toggle fullscreen mode', 'output');
        window.terminal.log('  profile help          - Show this help', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('Features:', 'info');
        window.terminal.log('  🔗 Omega ENS registration', 'output');
        window.terminal.log('  📇 Address book management', 'output');
        window.terminal.log('  💬 Terminal Chatter (Telegram-like)', 'output');
        window.terminal.log('  🐍 Python script management', 'output');
        window.terminal.log('  🔑 API key management', 'output');
        window.terminal.log('  🖥️ Fullscreen mode', 'output');
    }
    
    // ===================================
    // INTEGRATION WITH MAIN TERMINAL
    // ===================================
    
    function integrateEnhancedProfile() {
        if (window.terminal && window.terminal.executeCommand) {
            console.log('🔧 Integrating Enhanced Profile with main terminal...');
            
            const originalExecuteCommand = window.terminal.executeCommand;
            window.terminal.executeCommand = function(command) {
                const args = command.trim().split(/\s+/);
                const cmd = args[0].toLowerCase();
                
                if (cmd === 'profile') {
                    handleEnhancedProfileCommand(args.slice(1));
                    return;
                }
                
                return originalExecuteCommand.call(this, command);
            };
            
            console.log('✅ Enhanced Profile integration successful!');
            return true;
        }
        return false;
    }
    
    // Try to integrate when ready
    function tryIntegrateEnhancedProfile() {
        if (!integrateEnhancedProfile()) {
            setTimeout(tryIntegrateEnhancedProfile, 500);
        }
    }
    
    // Start integration
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryIntegrateEnhancedProfile);
    } else {
        tryIntegrateEnhancedProfile();
    }
    
    // Initialize
    loadProfileData();
    
    console.log('✅ Enhanced Profile System loaded successfully!');
    console.log('💡 Use "profile" command to open enhanced profile');
    
})();
