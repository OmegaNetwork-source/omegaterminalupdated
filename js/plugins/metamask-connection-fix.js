// MetaMask Connection Fix Plugin
console.log('[Plugin] MetaMask Connection Fix - Loaded');

// Ensure MetaMask provider is correctly set
(function() {
    'use strict';
    
    // Fix for multiple wallet providers (MetaMask, Phantom, etc.)
    if (window.ethereum && window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
        const metamaskProvider = window.ethereum.providers.find(p => p.isMetaMask && !p.isPhantom);
        if (metamaskProvider) {
            window.ethereum = metamaskProvider;
            console.log('[MetaMask Fix] MetaMask provider selected');
        }
    }
    
    // Store original provider for restoration if needed
    window._originalEthereumProvider = window.ethereum;
})();

