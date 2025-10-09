/* SVG Icons Replacement System - Replace all emojis with SVG icons */

window.SvgIconSystem = {
    initialized: false,
    iconCache: new Map(),
    
    // SVG Icon Definitions
    icons: {
        omega: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/><path d="M30,35 Q50,20 70,35 L65,65 Q50,80 35,65 Z" fill="currentColor"/><circle cx="50" cy="50" r="8" fill="var(--void-black)"/></svg>`,
        mining: `<svg viewBox="0 0 24 24"><path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/></svg>`,
        wallet: `<svg viewBox="0 0 24 24"><path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18H21M12,16V8H21V16H12Z"/></svg>`,
        network: `<svg viewBox="0 0 24 24"><path d="M2,3H22C23.05,3 24,3.95 24,5V19C24,20.05 23.05,21 22,21H2C0.95,21 0,20.05 0,19V5C0,3.95 0.95,3 2,3M14,6V7H22V6H14M14,8V9H21.5L22,9V8H14M14,10V11H21V10H14M8,13.91C6,13.91 2,15 2,17V18H14V17C14,15 10,13.91 8,13.91M8,6A3,3 0 0,0 5,9A3,3 0 0,0 8,12A3,3 0 0,0 11,9A3,3 0 0,0 8,6Z"/></svg>`,
        nft: `<svg viewBox="0 0 24 24"><path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/></svg>`,
        security: `<svg viewBox="0 0 24 24"><path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.6C8,12.1 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/></svg>`,
        success: `<svg viewBox="0 0 24 24"><path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/></svg>`,
        error: `<svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>`,
        warning: `<svg viewBox="0 0 24 24"><path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/></svg>`,
        info: `<svg viewBox="0 0 24 24"><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/></svg>`,
        loading: `<svg viewBox="0 0 24 24"><path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/></svg>`
    },
    
    init: function() {
        console.log('🎨 SVG ICON SYSTEM INITIALIZING...');
        
        // Replace existing emojis
        this.replaceEmojis();
        
        // Set up mutation observer for dynamic content
        this.setupMutationObserver();
        
        this.initialized = true;
        console.log('✅ SVG Icon System Ready');
    },
    
    replaceEmojis: function() {
        // Replace common emoji patterns
        const emojiReplacements = {
            '⛏️': 'mining',
            '💰': 'wallet',
            '🌐': 'network',
            '🔐': 'security',
            '✅': 'success',
            '❌': 'error',
            '⚠️': 'warning',
            'ℹ️': 'info',
            '🔄': 'loading',
            'Ω': 'omega'
        };
        
        // Replace emojis in all text content
        document.querySelectorAll('*').forEach(element => {
            if (element.children.length === 0) { // Only text nodes
                let content = element.innerHTML;
                let changed = false;
                
                Object.entries(emojiReplacements).forEach(([emoji, iconName]) => {
                    if (content.includes(emoji)) {
                        content = content.replace(new RegExp(emoji, 'g'), this.createIconHtml(iconName));
                        changed = true;
                    }
                });
                
                if (changed) {
                    element.innerHTML = content;
                }
            }
        });
    },
    
    createIconHtml: function(iconName, size = 'sm', color = 'primary') {
        if (!this.icons[iconName]) {
            console.warn(`Icon "${iconName}" not found`);
            return '';
        }
        
        return `<svg class="svg-icon svg-icon-${size} svg-icon-${color}" viewBox="0 0 24 24">${this.icons[iconName]}</svg>`;
    },
    
    setupMutationObserver: function() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.replaceEmojisInElement(node);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },
    
    replaceEmojisInElement: function(element) {
        const emojiReplacements = {
            '⛏️': 'mining',
            '💰': 'wallet',
            '🌐': 'network',
            '🔐': 'security',
            '✅': 'success',
            '❌': 'error',
            '⚠️': 'warning',
            'ℹ️': 'info',
            '🔄': 'loading',
            'Ω': 'omega'
        };
        
        if (element.children.length === 0) {
            let content = element.innerHTML;
            let changed = false;
            
            Object.entries(emojiReplacements).forEach(([emoji, iconName]) => {
                if (content.includes(emoji)) {
                    content = content.replace(new RegExp(emoji, 'g'), this.createIconHtml(iconName));
                    changed = true;
                }
            });
            
            if (changed) {
                element.innerHTML = content;
            }
        }
    },
    
    // Public API for creating icons
    createIcon: function(iconName, options = {}) {
        const {
            size = 'sm',
            color = 'primary',
            className = '',
            animation = ''
        } = options;
        
        const classes = [
            'svg-icon',
            `svg-icon-${size}`,
            `svg-icon-${color}`,
            className,
            animation
        ].filter(Boolean).join(' ');
        
        return `<svg class="${classes}" viewBox="0 0 24 24">${this.icons[iconName] || ''}</svg>`;
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
    window.SvgIconSystem.init();
});
