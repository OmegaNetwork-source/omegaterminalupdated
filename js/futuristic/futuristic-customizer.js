// Futuristic Theme Customizer
// Allows users to customize colors, layouts, and preferences

window.OmegaCustomizer = {
    version: '1.0.0',
    
    // Available color schemes
    colorSchemes: {
        cyberBlue: {
            name: 'Cyber Blue (Default)',
            primary: '#00d4ff',
            primaryDim: '#0099cc',
            primaryGlow: 'rgba(0, 212, 255, 0.3)',
            secondary: '#9d00ff',
            accent: '#ff0099'
        },
        matrixGreen: {
            name: 'Matrix Green',
            primary: '#00ff88',
            primaryDim: '#00cc66',
            primaryGlow: 'rgba(0, 255, 136, 0.3)',
            secondary: '#00ffff',
            accent: '#88ff00'
        },
        neonPurple: {
            name: 'Neon Purple',
            primary: '#9d00ff',
            primaryDim: '#7700cc',
            primaryGlow: 'rgba(157, 0, 255, 0.3)',
            secondary: '#ff00ff',
            accent: '#ff0099'
        },
        bloodRed: {
            name: 'Blood Red',
            primary: '#ff3366',
            primaryDim: '#cc0033',
            primaryGlow: 'rgba(255, 51, 102, 0.3)',
            secondary: '#ff0066',
            accent: '#ff6699'
        },
        arcticWhite: {
            name: 'Arctic White',
            primary: '#ffffff',
            primaryDim: '#cccccc',
            primaryGlow: 'rgba(255, 255, 255, 0.3)',
            secondary: '#00d4ff',
            accent: '#9d00ff'
        },
        sunsetOrange: {
            name: 'Sunset Orange',
            primary: '#ff9500',
            primaryDim: '#cc7700',
            primaryGlow: 'rgba(255, 149, 0, 0.3)',
            secondary: '#ff6600',
            accent: '#ffaa00'
        }
    },
    
    // Current theme
    currentScheme: 'cyberBlue',
    
    // Apply color scheme
    applyColorScheme: function(schemeName) {
        const scheme = this.colorSchemes[schemeName];
        if (!scheme) {
            console.error('Color scheme not found:', schemeName);
            return;
        }
        
        const root = document.documentElement;
        root.style.setProperty('--cyber-blue', scheme.primary);
        root.style.setProperty('--cyber-blue-dim', scheme.primaryDim);
        root.style.setProperty('--cyber-blue-glow', scheme.primaryGlow);
        root.style.setProperty('--neon-purple', scheme.secondary);
        root.style.setProperty('--neon-pink', scheme.accent);
        root.style.setProperty('--cyber-blue-bright', scheme.primary);
        
        this.currentScheme = schemeName;
        localStorage.setItem('omega-color-scheme', schemeName);
        
        console.log(`✅ Color scheme changed to: ${scheme.name}`);
        
        // Update terminal text if it exists
        if (window.terminal && window.terminal.log) {
            window.terminal.log(`🎨 Theme changed to: ${scheme.name}`, 'success');
        }
        
        // Notify dashboard if it exists
        if (window.FuturisticDashboard) {
            const activity = document.getElementById('futuristic-activity');
            if (activity) {
                const entry = document.createElement('div');
                entry.style.padding = '4px 0';
                entry.textContent = `• Theme: ${scheme.name}`;
                activity.insertBefore(entry, activity.firstChild);
                while (activity.children.length > 10) {
                    activity.removeChild(activity.lastChild);
                }
            }
        }
        
        // Force re-render of terminal colors
        this.updateTerminalColors();
    },
    
    // Update all terminal text to match current theme
    updateTerminalColors: function() {
        const terminalOutput = document.getElementById('terminalOutput');
        if (!terminalOutput) return;
        
        // Force CSS recalculation
        terminalOutput.style.display = 'none';
        terminalOutput.offsetHeight; // Trigger reflow
        terminalOutput.style.display = '';
        
        console.log('🎨 Terminal colors updated');
    },
    
    // Cycle through color schemes
    cycleColorScheme: function() {
        const schemes = Object.keys(this.colorSchemes);
        const currentIndex = schemes.indexOf(this.currentScheme);
        const nextIndex = (currentIndex + 1) % schemes.length;
        this.applyColorScheme(schemes[nextIndex]);
    },
    
    // Panel visibility settings
    panelSettings: {
        sidebar: true,
        stats: true,
        header: true
    },
    
    // Toggle panel visibility
    togglePanel: function(panelName) {
        const panelMap = {
            'sidebar': '.omega-sidebar',
            'stats': '.omega-stats',
            'header': '.omega-header'
        };
        
        const selector = panelMap[panelName];
        if (!selector) return;
        
        const panel = document.querySelector(selector);
        if (!panel) return;
        
        this.panelSettings[panelName] = !this.panelSettings[panelName];
        panel.style.display = this.panelSettings[panelName] ? '' : 'none';
        
        // Adjust grid layout
        this.adjustLayout();
        
        localStorage.setItem('omega-panels', JSON.stringify(this.panelSettings));
    },
    
    // Adjust dashboard layout based on visible panels
    adjustLayout: function() {
        const dashboard = document.querySelector('.omega-dashboard');
        if (!dashboard) return;
        
        const { sidebar, stats, header } = this.panelSettings;
        
        if (!sidebar && !stats) {
            dashboard.style.gridTemplateAreas = `
                "header header header"
                "terminal terminal terminal"
                "terminal terminal terminal"
            `;
            dashboard.style.gridTemplateColumns = '1fr';
        } else if (!sidebar) {
            dashboard.style.gridTemplateAreas = `
                "header header header"
                "terminal terminal stats"
                "terminal terminal stats"
            `;
            dashboard.style.gridTemplateColumns = '1fr 320px';
        } else if (!stats) {
            dashboard.style.gridTemplateAreas = `
                "header header header"
                "sidebar terminal terminal"
                "sidebar terminal terminal"
            `;
            dashboard.style.gridTemplateColumns = '280px 1fr';
        } else {
            dashboard.style.gridTemplateAreas = `
                "header header header"
                "sidebar terminal stats"
                "sidebar terminal stats"
            `;
            dashboard.style.gridTemplateColumns = '280px 1fr 320px';
        }
    },
    
    // Animation settings
    animationSettings: {
        grid: true,
        scanline: true,
        glow: true,
        fadeIn: true
    },
    
    // Toggle animations
    toggleAnimation: function(animationType) {
        this.animationSettings[animationType] = !this.animationSettings[animationType];
        
        const body = document.body;
        
        switch(animationType) {
            case 'grid':
                if (this.animationSettings.grid) {
                    body.style.removeProperty('--grid-animation');
                } else {
                    body.style.setProperty('--grid-animation', 'none');
                }
                break;
            case 'scanline':
                const scanline = document.querySelector('body::after');
                // Note: Can't directly access ::after, would need to add/remove class
                body.classList.toggle('no-scanline', !this.animationSettings.scanline);
                break;
            case 'glow':
                body.classList.toggle('no-glow', !this.animationSettings.glow);
                break;
            case 'fadeIn':
                body.classList.toggle('no-fade', !this.animationSettings.fadeIn);
                break;
        }
        
        localStorage.setItem('omega-animations', JSON.stringify(this.animationSettings));
    },
    
    // Font size adjustment
    adjustFontSize: function(size) {
        const root = document.documentElement;
        const sizes = {
            'small': '12px',
            'medium': '14px',
            'large': '16px',
            'xlarge': '18px'
        };
        
        if (sizes[size]) {
            root.style.setProperty('--font-size-base', sizes[size]);
            localStorage.setItem('omega-font-size', size);
        }
    },
    
    // Opacity adjustment for glass morphism
    adjustGlassOpacity: function(opacity) {
        const root = document.documentElement;
        const opacityValue = Math.max(0.1, Math.min(1, opacity));
        root.style.setProperty('--glass-bg', `rgba(21, 21, 32, ${opacityValue})`);
        localStorage.setItem('omega-glass-opacity', opacityValue);
    },
    
    // Blur intensity
    adjustBlurIntensity: function(intensity) {
        const root = document.documentElement;
        const blurValue = Math.max(0, Math.min(50, intensity));
        root.style.setProperty('--glass-blur', `blur(${blurValue}px)`);
        localStorage.setItem('omega-blur-intensity', blurValue);
    },
    
    // Load saved settings
    loadSettings: function() {
        // Load color scheme
        const savedScheme = localStorage.getItem('omega-color-scheme');
        if (savedScheme && this.colorSchemes[savedScheme]) {
            this.applyColorScheme(savedScheme);
        }
        
        // Load panel settings
        const savedPanels = localStorage.getItem('omega-panels');
        if (savedPanels) {
            try {
                this.panelSettings = JSON.parse(savedPanels);
                Object.keys(this.panelSettings).forEach(panel => {
                    if (!this.panelSettings[panel]) {
                        this.togglePanel(panel);
                    }
                });
            } catch(e) {
                console.error('Error loading panel settings:', e);
            }
        }
        
        // Load animation settings
        const savedAnimations = localStorage.getItem('omega-animations');
        if (savedAnimations) {
            try {
                this.animationSettings = JSON.parse(savedAnimations);
                Object.keys(this.animationSettings).forEach(anim => {
                    if (!this.animationSettings[anim]) {
                        this.toggleAnimation(anim);
                    }
                });
            } catch(e) {
                console.error('Error loading animation settings:', e);
            }
        }
        
        // Load font size
        const savedFontSize = localStorage.getItem('omega-font-size');
        if (savedFontSize) {
            this.adjustFontSize(savedFontSize);
        }
        
        // Load glass opacity
        const savedOpacity = localStorage.getItem('omega-glass-opacity');
        if (savedOpacity) {
            this.adjustGlassOpacity(parseFloat(savedOpacity));
        }
        
        // Load blur intensity
        const savedBlur = localStorage.getItem('omega-blur-intensity');
        if (savedBlur) {
            this.adjustBlurIntensity(parseInt(savedBlur));
        }
    },
    
    // Reset to defaults
    resetToDefaults: function() {
        localStorage.removeItem('omega-color-scheme');
        localStorage.removeItem('omega-panels');
        localStorage.removeItem('omega-animations');
        localStorage.removeItem('omega-font-size');
        localStorage.removeItem('omega-glass-opacity');
        localStorage.removeItem('omega-blur-intensity');
        
        this.applyColorScheme('cyberBlue');
        this.panelSettings = { sidebar: true, stats: true, header: true };
        this.animationSettings = { grid: true, scanline: true, glow: true, fadeIn: true };
        
        location.reload();
    },
    
    // Export settings
    exportSettings: function() {
        const settings = {
            colorScheme: this.currentScheme,
            panels: this.panelSettings,
            animations: this.animationSettings,
            fontSize: localStorage.getItem('omega-font-size'),
            glassOpacity: localStorage.getItem('omega-glass-opacity'),
            blurIntensity: localStorage.getItem('omega-blur-intensity')
        };
        
        const json = JSON.stringify(settings, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'omega-terminal-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    },
    
    // Import settings
    importSettings: function(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                if (settings.colorScheme) {
                    this.applyColorScheme(settings.colorScheme);
                }
                if (settings.fontSize) {
                    this.adjustFontSize(settings.fontSize);
                }
                if (settings.glassOpacity) {
                    this.adjustGlassOpacity(parseFloat(settings.glassOpacity));
                }
                if (settings.blurIntensity) {
                    this.adjustBlurIntensity(parseInt(settings.blurIntensity));
                }
                
                console.log('✅ Settings imported successfully');
            } catch(error) {
                console.error('Error importing settings:', error);
            }
        };
        reader.readAsText(file);
    },
    
    // Initialize
    init: function() {
        console.log('🎨 Omega Customizer v' + this.version + ' initialized');
        this.loadSettings();
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => OmegaCustomizer.init());
} else {
    OmegaCustomizer.init();
}

