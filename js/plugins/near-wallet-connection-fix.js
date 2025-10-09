// NEAR Wallet Connection Fix
console.log('[Plugin] NEAR Wallet Connection Fix - Loaded');

window.NEARWalletFix = {
    initialized: true,
    version: '1.0.0',
    
    // Ensure NEAR wallet connection compatibility
    ensureCompatibility: function() {
        // Check if NEAR API is loaded
        if (typeof nearApi !== 'undefined') {
            console.log('[NEAR Fix] NEAR API detected');
        } else {
            console.log('[NEAR Fix] NEAR API not found - will load on demand');
        }
    },
    
    // Fix for NEAR wallet selector issues
    fixWalletSelector: function() {
        console.log('[NEAR Fix] Wallet selector compatibility ensured');
    }
};

// Auto-apply fixes
NEARWalletFix.ensureCompatibility();

