/* Futuristic Welcome Screen - Matching index-futuristic.html functionality */

window.OmegaWelcomeScreen = {
    initialized: false,
    progressInterval: null,
    currentProgress: 0,
    
    init: function() {
        console.log('🚀 OMEGA WELCOME SCREEN INITIALIZING...');
        
        // Create welcome screen HTML
        this.createWelcomeScreen();
        
        // Start loading sequence
        this.startLoadingSequence();
        
        this.initialized = true;
    },
    
    createWelcomeScreen: function() {
        const welcomeHTML = `
            <div class="omega-welcome-screen" id="omegaWelcomeScreen">
                <!-- Security Badge -->
                <div class="welcome-security-badge">
                    <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24">
                        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.6C8,12.1 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
                    </svg>
                    CLASSIFIED
                </div>
                
                <!-- Main Logo Container -->
                <div class="welcome-logo-container">
                    <!-- Logo will be replaced by omega-symbol-logo.js -->
                    <div class="welcome-brand-text">OMEGA TERMINAL</div>
                    <div class="welcome-version">v2.0.1 CLASSIFIED ACCESS</div>
                </div>
                
                <!-- Loading Spinner -->
                <div class="welcome-spinner"></div>
                
                <!-- Status Text -->
                <div class="welcome-status" id="welcomeStatus">INITIALIZING CLASSIFIED SYSTEM...</div>
                <div class="welcome-sub-status" id="welcomeSubStatus">OMEGA PROTOCOL v2.0.1</div>
                
                <!-- Progress Bar -->
                <div class="welcome-progress">
                    <div class="welcome-progress-bar" id="welcomeProgressBar"></div>
                </div>
                
                <!-- System Status -->
                <div class="welcome-system-status">
                    <div class="welcome-status-item">
                        <div class="welcome-status-dot"></div>
                        <span>SECURITY CLEARANCE: LEVEL OMEGA</span>
                    </div>
                    <div class="welcome-status-item">
                        <div class="welcome-status-dot"></div>
                        <span>MULTI-CHAIN SUPPORT: ACTIVE</span>
                    </div>
                    <div class="welcome-status-item">
                        <div class="welcome-status-dot"></div>
                        <span>WALLET INTEGRATION: READY</span>
                    </div>
                </div>
            </div>
        `;
        
        // Insert welcome screen
        document.body.insertAdjacentHTML('afterbegin', welcomeHTML);
    },
    
    startLoadingSequence: function() {
        const statusTexts = [
            'INITIALIZING CLASSIFIED SYSTEM...',
            'LOADING SECURITY PROTOCOLS...',
            'CONNECTING TO BLOCKCHAIN NETWORKS...',
            'INITIALIZING WALLET INTEGRATIONS...',
            'LOADING COMMAND MODULES...',
            'PREPARING USER INTERFACE...',
            'SYSTEM READY FOR ACCESS...'
        ];
        
        let currentStatus = 0;
        const statusElement = document.getElementById('welcomeStatus');
        const progressBar = document.getElementById('welcomeProgressBar');
        
        // Update status text every 800ms
        const statusInterval = setInterval(() => {
            if (currentStatus < statusTexts.length) {
                statusElement.textContent = statusTexts[currentStatus];
                currentStatus++;
            } else {
                clearInterval(statusInterval);
            }
        }, 800);
        
        // Animate progress bar
        this.animateProgress();
        
        // Hide welcome screen after 6 seconds
        setTimeout(() => {
            this.hideWelcomeScreen();
        }, 6000);
    },
    
    animateProgress: function() {
        const progressBar = document.getElementById('welcomeProgressBar');
        let progress = 0;
        
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15; // Random increments for realistic feel
            if (progress > 100) progress = 100;
            
            progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(progressInterval);
            }
        }, 200);
    },
    
    hideWelcomeScreen: function() {
        const welcomeScreen = document.getElementById('omegaWelcomeScreen');
        if (welcomeScreen) {
            welcomeScreen.style.opacity = '0';
            welcomeScreen.style.transform = 'scale(0.95)';
            welcomeScreen.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                document.body.classList.add('omega-initialized');
                
                // Trigger dashboard initialization
                if (window.FuturisticDashboard && window.FuturisticDashboard.init) {
                    window.FuturisticDashboard.init();
                }
            }, 500);
        }
    },
    
    showWelcomeScreen: function() {
        const welcomeScreen = document.getElementById('omegaWelcomeScreen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'flex';
            welcomeScreen.style.opacity = '1';
            welcomeScreen.style.transform = 'scale(1)';
            document.body.classList.remove('omega-initialized');
        }
    },
    
    updateStatus: function(message, subMessage = '') {
        const statusElement = document.getElementById('welcomeStatus');
        const subStatusElement = document.getElementById('welcomeSubStatus');
        
        if (statusElement) statusElement.textContent = message;
        if (subStatusElement && subMessage) subStatusElement.textContent = subMessage;
    },
    
    setProgress: function(percentage) {
        const progressBar = document.getElementById('welcomeProgressBar');
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only show welcome screen if not already initialized
    if (!document.body.classList.contains('omega-initialized')) {
        window.OmegaWelcomeScreen.init();
    }
});
