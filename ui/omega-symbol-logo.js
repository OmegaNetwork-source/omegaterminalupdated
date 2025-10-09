// Omega Symbol Logo System - Pure SVG Implementation
// Creates consistent, theme-adaptive Omega logos throughout the application

window.OmegaSymbolLogo = {
    // Create a professional Omega symbol SVG
    createOmegaSVG: function(options = {}) {
        const {
            size = 100,
            color = 'currentColor',
            glowColor = '#00D4FF',
            className = 'omega-symbol-logo',
            showOuterRing = true,
            showGlow = true
        } = options;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('class', className);
        svg.style.overflow = 'visible';

        // Add defs for glow effect
        if (showGlow) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            filter.setAttribute('id', `glow-${Math.random().toString(36).substr(2, 9)}`);
            filter.setAttribute('x', '-50%');
            filter.setAttribute('y', '-50%');
            filter.setAttribute('width', '200%');
            filter.setAttribute('height', '200%');

            const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
            feGaussianBlur.setAttribute('stdDeviation', '3');
            feGaussianBlur.setAttribute('result', 'coloredBlur');

            const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
            const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
            feMergeNode1.setAttribute('in', 'coloredBlur');
            const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
            feMergeNode2.setAttribute('in', 'SourceGraphic');

            feMerge.appendChild(feMergeNode1);
            feMerge.appendChild(feMergeNode2);
            filter.appendChild(feGaussianBlur);
            filter.appendChild(feMerge);
            defs.appendChild(filter);
            svg.appendChild(defs);

            svg.style.filter = `drop-shadow(0 0 10px ${glowColor})`;
        }

        // Outer ring (optional)
        if (showOuterRing) {
            const outerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            outerRing.setAttribute('cx', '50');
            outerRing.setAttribute('cy', '50');
            outerRing.setAttribute('r', '45');
            outerRing.setAttribute('fill', 'none');
            outerRing.setAttribute('stroke', color);
            outerRing.setAttribute('stroke-width', '2');
            outerRing.setAttribute('opacity', '0.3');
            svg.appendChild(outerRing);
        }

        // Omega Symbol (Ω) using path for better quality
        const omegaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // Professional Omega symbol path
        omegaPath.setAttribute('d', 'M30,70 L30,65 C30,65 32,50 35,45 C38,40 42,35 50,35 C58,35 62,40 65,45 C68,50 70,65 70,65 L70,70 M25,70 L25,62 C25,62 27,42 32,35 C37,28 42,25 50,25 C58,25 63,28 68,35 C73,42 75,62 75,62 L75,70');
        omegaPath.setAttribute('fill', 'none');
        omegaPath.setAttribute('stroke', color);
        omegaPath.setAttribute('stroke-width', '3');
        omegaPath.setAttribute('stroke-linecap', 'round');
        omegaPath.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(omegaPath);

        // Alternative: Use text-based Omega for clarity
        const omegaText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        omegaText.setAttribute('x', '50');
        omegaText.setAttribute('y', '65');
        omegaText.setAttribute('text-anchor', 'middle');
        omegaText.setAttribute('font-family', 'serif, "Times New Roman", Georgia');
        omegaText.setAttribute('font-size', '55');
        omegaText.setAttribute('font-weight', 'bold');
        omegaText.setAttribute('fill', color);
        omegaText.textContent = 'Ω';
        svg.appendChild(omegaText);

        // Remove the path version (we're using text for better clarity)
        svg.removeChild(omegaPath);

        // Inner accent circle
        const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        innerCircle.setAttribute('cx', '50');
        innerCircle.setAttribute('cy', '50');
        innerCircle.setAttribute('r', '6');
        innerCircle.setAttribute('fill', color);
        innerCircle.setAttribute('opacity', '0.15');
        svg.appendChild(innerCircle);

        return svg;
    },

    // Create header logo
    createHeaderLogo: function() {
        return this.createOmegaSVG({
            size: 32,
            color: 'var(--cyber-blue)',
            glowColor: 'var(--cyber-blue-glow)',
            className: 'header-omega-svg',
            showOuterRing: true,
            showGlow: true
        });
    },

    // Create welcome screen logo
    createWelcomeLogo: function() {
        return this.createOmegaSVG({
            size: 120,
            color: 'var(--cyber-blue)',
            glowColor: 'var(--cyber-blue-glow)',
            className: 'welcome-omega-svg',
            showOuterRing: true,
            showGlow: true
        });
    },

    // Replace existing logos
    replaceLogos: function() {
        console.log('🎨 Replacing logos with Omega Symbol SVG...');

        // Replace header logo
        this.replaceHeaderLogo();

        // Replace welcome logo
        this.replaceWelcomeLogo();

        console.log('✅ Logo replacement complete');
    },

    replaceHeaderLogo: function() {
        const headerLogoContainer = document.querySelector('.header-logo-container');
        if (headerLogoContainer) {
            // Clear existing content
            headerLogoContainer.innerHTML = '';
            
            // Add new SVG logo
            const logo = this.createHeaderLogo();
            headerLogoContainer.appendChild(logo);
            
            console.log('✅ Header logo replaced');
        } else {
            console.warn('⚠️ Header logo container not found');
        }
    },

    replaceWelcomeLogo: function() {
        const welcomeLogoContainer = document.querySelector('.welcome-logo-container');
        if (welcomeLogoContainer) {
            // Find existing logo elements
            const existingLogo = welcomeLogoContainer.querySelector('.welcome-omega-logo, .welcome-omega-logo-fallback');
            if (existingLogo) {
                // Replace with new SVG
                const logo = this.createWelcomeLogo();
                existingLogo.replaceWith(logo);
                console.log('✅ Welcome screen logo replaced');
            } else {
                // Add new SVG at the beginning
                const logo = this.createWelcomeLogo();
                welcomeLogoContainer.insertBefore(logo, welcomeLogoContainer.firstChild);
                console.log('✅ Welcome screen logo added');
            }
        } else {
            console.warn('⚠️ Welcome logo container not found');
        }
    },

    // Update logo colors based on theme
    updateLogoColors: function(themeName) {
        const themeColors = {
            'cyber-blue': { color: 'var(--cyber-blue)', glow: 'var(--cyber-blue-glow)' },
            'neon-purple': { color: 'var(--neon-purple)', glow: 'var(--neon-purple)' },
            'matrix-green': { color: 'var(--matrix-green)', glow: 'var(--matrix-green)' },
            'neon-pink': { color: 'var(--neon-pink)', glow: 'var(--neon-pink)' },
            'warning-amber': { color: 'var(--warning-amber)', glow: 'var(--warning-amber)' },
            'danger-red': { color: 'var(--danger-red)', glow: 'var(--danger-red)' }
        };

        const theme = themeColors[themeName] || themeColors['cyber-blue'];

        // Update all Omega SVG logos
        const logos = document.querySelectorAll('.header-omega-svg, .welcome-omega-svg');
        logos.forEach(logo => {
            // Update stroke and fill colors
            const circles = logo.querySelectorAll('circle');
            const texts = logo.querySelectorAll('text');
            
            circles.forEach(circle => {
                if (circle.getAttribute('fill') === 'none') {
                    circle.setAttribute('stroke', theme.color);
                } else {
                    circle.setAttribute('fill', theme.color);
                }
            });
            
            texts.forEach(text => {
                text.setAttribute('fill', theme.color);
            });

            // Update glow effect
            logo.style.filter = `drop-shadow(0 0 10px ${theme.glow})`;
        });

        console.log(`🎨 Logo colors updated for theme: ${themeName}`);
    },

    // Initialize
    init: function() {
        console.log('🚀 Omega Symbol Logo System Initializing...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.replaceLogos());
        } else {
            // Small delay to ensure other systems have created their elements
            setTimeout(() => this.replaceLogos(), 500);
        }

        // Listen for theme changes
        document.addEventListener('themeChanged', (event) => {
            if (event.detail && event.detail.theme) {
                this.updateLogoColors(event.detail.theme);
            }
        });

        // Hook into FuturisticCustomizer if available
        if (window.FuturisticCustomizer) {
            const originalApply = window.FuturisticCustomizer.applyColorScheme;
            window.FuturisticCustomizer.applyColorScheme = function(schemeName) {
                originalApply.call(this, schemeName);
                window.OmegaSymbolLogo.updateLogoColors(schemeName);
            };
        }

        console.log('✅ Omega Symbol Logo System Ready');
    }
};

// Auto-initialize
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => window.OmegaSymbolLogo.init(), 1000);
        });
    } else {
        setTimeout(() => window.OmegaSymbolLogo.init(), 1000);
    }
})();

