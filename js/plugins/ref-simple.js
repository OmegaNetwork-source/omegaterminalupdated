// Referral System - Simple Implementation
console.log('[Plugin] Referral System Simple - Loaded');

window.ReferralSystem = {
    initialized: true,
    version: '1.0.0',
    
    // Get referral code from URL
    getReferralCode: function() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('ref') || urlParams.get('referral');
    },
    
    // Store referral code
    storeReferralCode: function(code) {
        if (code) {
            localStorage.setItem('omega-referral-code', code);
            console.log('[Referral] Stored referral code:', code);
        }
    },
    
    // Get stored referral code
    getStoredReferralCode: function() {
        return localStorage.getItem('omega-referral-code');
    },
    
    // Initialize referral system
    init: function() {
        const refCode = this.getReferralCode();
        if (refCode) {
            this.storeReferralCode(refCode);
        }
        console.log('[Referral] System initialized');
    }
};

// Auto-initialize
ReferralSystem.init();

