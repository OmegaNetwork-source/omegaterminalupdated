/* Omega Logo Integration - Handle logo loading and theme adaptation */

window.OmegaLogoIntegration = {
    initialized: false,
    logoCache: new Map(),
    
    // Logo configurations - using multiple fallback options
    logos: {
        light: {
            src: 'Omega-Branding-Kit-Logo1.png',
            fallbacks: [
                'https://via.placeholder.com/120x120/00D4FF/000000?text=Ω',
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMEQ0RkYiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC4zIi8+Cjx0ZXh0IHg9IjUwIiB5PSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNlcmlmIiBmb250LXNpemU9IjYwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzAwRDRGRiI+4bqQPC90ZXh0Pgo8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI4IiBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjgiLz4KPC9zdmc+'
            ],
            alt: 'Omega Terminal Logo - Light',
            className: 'omega-logo header-logo-light'
        },
        dark: {
            src: 'Omega-Branding-Kit-Logo8.png',
            fallbacks: [
                'https://via.placeholder.com/120x120/9D00FF/FFFFFF?text=Ω',
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSJub25lIiBzdHJva2U9IiM5RDAwRkYiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC4zIi8+Cjx0ZXh0IHg9IjUwIiB5PSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNlcmlmIiBmb250LXNpemU9IjYwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzlEMDBGRiI+4bqQPC90ZXh0Pgo8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI4IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjgiLz4KPC9zdmc+'
            ],
            alt: 'Omega Terminal Logo - Dark',
            className: 'omega-logo header-logo-dark'
        }
    },
    
    init: function() {
        console.log('🎨 OMEGA LOGO INTEGRATION INITIALIZING...');
        
        // Preload logos
        this.preloadLogos();
        
        // Set up theme change listener
        this.setupThemeListener();
        
        // Replace SVG logos with actual images
        this.replaceSvgLogos();
        
        this.initialized = true;
        console.log('✅ Omega Logo Integration Ready');
    },
    
    preloadLogos: function() {
        Object.entries(this.logos).forEach(([key, logo]) => {
            this.tryLoadLogo(logo.src, logo.fallbacks, key);
        });
    },
    
    tryLoadLogo: function(src, fallbacks, logoKey) {
        const img = new Image();
        img.onload = () => {
            this.logoCache.set(src, img);
            console.log(`✅ Logo loaded: ${src}`);
        };
        img.onerror = () => {
            console.warn(`⚠️ Failed to load logo: ${src}`);
            
            // Try fallbacks
            if (fallbacks && fallbacks.length > 0) {
                console.log(`🔄 Trying fallback for ${logoKey}...`);
                this.tryFallbackLogo(fallbacks[0], fallbacks.slice(1), logoKey);
            } else {
                console.log(`🔄 Using SVG fallback for ${logoKey}`);
                this.useSvgFallback();
            }
        };
        img.src = src;
    },
    
    tryFallbackLogo: function(fallbackSrc, remainingFallbacks, logoKey) {
        const img = new Image();
        img.onload = () => {
            this.logoCache.set(fallbackSrc, img);
            console.log(`✅ Fallback logo loaded: ${fallbackSrc}`);
        };
        img.onerror = () => {
            console.warn(`⚠️ Fallback failed: ${fallbackSrc}`);
            
            if (remainingFallbacks.length > 0) {
                this.tryFallbackLogo(remainingFallbacks[0], remainingFallbacks.slice(1), logoKey);
            } else {
                console.log(`🔄 Using SVG fallback for ${logoKey}`);
                this.useSvgFallback();
            }
        };
        img.src = fallbackSrc;
    },
    
    replaceSvgLogos: function() {
        // Update header logo image source based on current theme
        const headerLogoImg = document.querySelector('.header-omega-logo');
        if (headerLogoImg) {
            this.updateHeaderLogo(headerLogoImg);
        }
        
        // Replace welcome screen logo
        const welcomeLogo = document.querySelector('.welcome-omega-logo');
        if (welcomeLogo) {
            this.replaceWithImage(welcomeLogo, 'light');
        }
        
        // Replace sidebar logos
        const sidebarLogos = document.querySelectorAll('.sidebar-logo');
        sidebarLogos.forEach(logo => {
            this.replaceWithImage(logo, 'light');
        });
    },
    
    updateHeaderLogo: function(imgElement) {
        // Get current theme or default to light
        const currentTheme = this.getCurrentTheme();
        const logoType = this.getLogoForTheme(currentTheme);
        
        imgElement.src = logoType.src;
        imgElement.alt = logoType.alt;
        
        // Add error handling with fallback chain
        imgElement.onerror = () => {
            console.warn(`⚠️ Header logo failed to load: ${logoType.src}`);
            this.tryLogoFallbacks(imgElement, logoType.fallbacks || [], 0);
        };
    },
    
    tryLogoFallbacks: function(imgElement, fallbacks, index) {
        if (index >= fallbacks.length) {
            // All fallbacks failed, show SVG fallback
            const fallback = imgElement.nextElementSibling;
            if (fallback && fallback.classList.contains('header-omega-logo-fallback')) {
                imgElement.style.display = 'none';
                fallback.style.display = 'block';
            }
            return;
        }
        
        const fallbackSrc = fallbacks[index];
        imgElement.src = fallbackSrc;
        
        imgElement.onerror = () => {
            console.warn(`⚠️ Fallback ${index + 1} failed: ${fallbackSrc}`);
            this.tryLogoFallbacks(imgElement, fallbacks, index + 1);
        };
    },
    
    getCurrentTheme: function() {
        // Try to get current theme from customizer
        if (window.FuturisticCustomizer && window.FuturisticCustomizer.currentScheme) {
            return window.FuturisticCustomizer.currentScheme;
        }
        
        // Check localStorage
        const storedTheme = localStorage.getItem('omega-color-scheme');
        if (storedTheme) {
            return storedTheme;
        }
        
        // Default to cyber-blue
        return 'cyber-blue';
    },
    
    replaceWithImage: function(svgElement, logoType) {
        const logo = this.logos[logoType];
        if (!logo) return;
        
        // Create image element
        const img = document.createElement('img');
        img.src = logo.src;
        img.alt = logo.alt;
        img.className = logo.className;
        
        // Copy important styles from SVG
        const computedStyle = window.getComputedStyle(svgElement);
        img.style.width = computedStyle.width;
        img.style.height = computedStyle.height;
        img.style.filter = computedStyle.filter;
        img.style.transition = computedStyle.transition;
        
        // Replace SVG with image
        svgElement.parentNode.replaceChild(img, svgElement);
        
        // Add error handling
        img.onerror = () => {
            console.warn(`⚠️ Logo image failed to load: ${logo.src}`);
            // Keep the image but add fallback styling
            img.style.background = 'var(--cyber-blue)';
            img.style.borderRadius = '8px';
            img.style.display = 'flex';
            img.style.alignItems = 'center';
            img.style.justifyContent = 'center';
            img.style.color = 'var(--void-black)';
            img.style.fontFamily = 'var(--font-tech)';
            img.style.fontSize = '24px';
            img.style.fontWeight = 'bold';
            img.alt = 'Ω';
            img.textContent = 'Ω';
        };
    },
    
    setupThemeListener: function() {
        // Listen for theme changes
        document.addEventListener('themeChanged', (event) => {
            this.updateLogosForTheme(event.detail.theme);
        });
        
        // Also listen for customizer changes
        if (window.FuturisticCustomizer) {
            const originalApply = window.FuturisticCustomizer.applyColorScheme;
            window.FuturisticCustomizer.applyColorScheme = function(schemeName) {
                originalApply.call(this, schemeName);
                window.OmegaLogoIntegration.updateLogosForTheme(schemeName);
            };
        }
    },
    
    updateLogosForTheme: function(themeName) {
        console.log(`🎨 Updating logos for theme: ${themeName}`);
        
        // Determine which logo to use based on theme
        const useDarkLogo = ['matrix-green', 'neon-purple'].includes(themeName);
        const logoType = useDarkLogo ? 'dark' : 'light';
        
        // Update header logo specifically
        const headerLogoImg = document.querySelector('.header-omega-logo');
        if (headerLogoImg) {
            const logo = this.logos[logoType];
            headerLogoImg.src = logo.src;
            headerLogoImg.alt = logo.alt;
            
            // Ensure image is visible and fallback is hidden
            headerLogoImg.style.display = 'block';
            const fallback = headerLogoImg.nextElementSibling;
            if (fallback && fallback.classList.contains('header-omega-logo-fallback')) {
                fallback.style.display = 'none';
            }
        }
        
        // Update other logos
        const allLogos = document.querySelectorAll('.omega-logo, .header-logo-light, .header-logo-dark, .welcome-omega-logo, .sidebar-logo');
        allLogos.forEach(logo => {
            if (logo.tagName === 'IMG' && !logo.classList.contains('header-omega-logo')) {
                const logo = this.logos[logoType];
                logo.src = logo.src;
                logo.alt = logo.alt;
            } else if (logo.tagName === 'SVG') {
                // Replace SVG with appropriate image
                this.replaceWithImage(logo, logoType);
            }
        });
    },
    
    useSvgFallback: function() {
        console.log('🔄 Using SVG fallback for logos');
        
        // If images fail to load, ensure SVG logos are properly styled
        const svgLogos = document.querySelectorAll('svg.omega-logo, svg.header-logo-light, svg.welcome-omega-logo');
        svgLogos.forEach(svg => {
            svg.style.fill = 'var(--cyber-blue)';
            svg.style.filter = 'drop-shadow(0 0 8px var(--cyber-blue-glow))';
        });
    },
    
    // Public API
    getLogoForTheme: function(themeName) {
        const useDarkLogo = ['matrix-green', 'neon-purple'].includes(themeName);
        return useDarkLogo ? this.logos.dark : this.logos.light;
    },
    
    createLogoElement: function(logoType, options = {}) {
        const logo = this.logos[logoType];
        const {
            size = '32px',
            className = '',
            style = {}
        } = options;
        
        const img = document.createElement('img');
        img.src = logo.src;
        img.alt = logo.alt;
        img.className = `${logo.className} ${className}`;
        img.style.width = size;
        img.style.height = size;
        
        // Apply custom styles
        Object.assign(img.style, style);
        
        return img;
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other systems to initialize
    setTimeout(() => {
        window.OmegaLogoIntegration.init();
    }, 1000);
});
