/**
 * Game Icons Module
 * 
 * SVG icon definitions for all games in Omega Arcade
 * Uniform, theme-aware icons that work with all color palettes
 */

/**
 * Get SVG icon HTML for a game by ID
 * Returns inline SVG that adapts to theme colors
 */
export function getGameIcon(gameId: string, size: number = 48): string {
  const icons: Record<string, string> = {
    "number-guess": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <text x="12" y="10" text-anchor="middle" font-size="8" fill="currentColor" font-weight="bold">?</text>
    </svg>`,
    
    "cookie-clicker": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.8"/>
      <circle cx="9" cy="9" r="1.5" fill="var(--palette-bg, #000)"/>
      <circle cx="15" cy="9" r="1.5" fill="var(--palette-bg, #000)"/>
      <circle cx="9" cy="15" r="1.5" fill="var(--palette-bg, #000)"/>
      <circle cx="15" cy="15" r="1.5" fill="var(--palette-bg, #000)"/>
      <path d="M10 12C10 12.5 10.5 12.5 11 12.5C11.5 12.5 12 12.5 12 12" stroke="var(--palette-bg, #000)" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    
    "speed-clicker": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,
    
    "snake": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="4" height="4" rx="1" fill="currentColor"/>
      <rect x="8" y="4" width="4" height="4" rx="1" fill="currentColor"/>
      <rect x="12" y="4" width="4" height="4" rx="1" fill="currentColor"/>
      <rect x="4" y="8" width="4" height="4" rx="1" fill="currentColor"/>
      <rect x="8" y="8" width="4" height="4" rx="1" fill="currentColor"/>
      <rect x="12" y="8" width="4" height="4" rx="1" fill="currentColor"/>
      <circle cx="16" cy="10" r="2" fill="var(--palette-error, #ff4d4f)"/>
    </svg>`,
    
    "pacman": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="currentColor" opacity="0.9"/>
      <path d="M12 2C6.48 2 2 6.48 2 12" stroke="var(--palette-bg, #000)" stroke-width="2" stroke-linecap="round"/>
      <circle cx="8" cy="8" r="1.5" fill="var(--palette-bg, #fff)"/>
      <circle cx="16" cy="8" r="1.5" fill="var(--palette-bg, #fff)"/>
    </svg>`,
    
    "brick-breaker": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="6" rx="1" fill="currentColor" opacity="0.8"/>
      <rect x="4" y="10" width="16" height="6" rx="1" fill="currentColor" opacity="0.6"/>
      <circle cx="12" cy="18" r="2" fill="currentColor"/>
      <rect x="10" y="20" width="4" height="2" rx="1" fill="currentColor"/>
    </svg>`,
    
    "perfect-circle": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="4 4"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="1" fill="none" opacity="0.5"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>`,
    
    "bashido": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="16" height="12" rx="2" fill="currentColor" opacity="0.8"/>
      <path d="M7 10L10 12L7 14" stroke="var(--palette-bg, #000)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M13 10L16 12L13 14" stroke="var(--palette-bg, #000)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M10 16H14" stroke="var(--palette-bg, #000)" stroke-width="2" stroke-linecap="round"/>
      <circle cx="9" cy="9" r="1" fill="var(--palette-bg, #000)"/>
      <circle cx="15" cy="9" r="1" fill="var(--palette-bg, #000)"/>
    </svg>`,
    
    "pg-tanks": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="12" height="8" rx="2" fill="currentColor" opacity="0.9"/>
      <rect x="8" y="12" width="8" height="4" rx="1" fill="var(--palette-bg, #000)"/>
      <rect x="16" y="12" width="4" height="2" rx="1" fill="currentColor" opacity="0.7"/>
      <circle cx="10" cy="16" r="1.5" fill="var(--palette-bg, #000)"/>
      <circle cx="14" cy="16" r="1.5" fill="var(--palette-bg, #000)"/>
      <rect x="11" y="6" width="2" height="4" rx="1" fill="currentColor"/>
    </svg>`,
    
    "flappy-omega": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4C8 4 4 8 4 12C4 16 8 20 12 20C16 20 20 16 20 12C20 8 16 4 12 4Z" fill="currentColor" opacity="0.8"/>
      <circle cx="10" cy="10" r="1.5" fill="var(--palette-bg, #000)"/>
      <circle cx="14" cy="10" r="1.5" fill="var(--palette-bg, #000)"/>
      <path d="M10 14C10 14 12 16 14 14" stroke="var(--palette-bg, #000)" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    
    "omega-breaker": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="4" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="4" y="8" width="16" height="4" rx="1" fill="currentColor" opacity="0.7"/>
      <rect x="4" y="12" width="16" height="4" rx="1" fill="currentColor" opacity="0.5"/>
      <circle cx="12" cy="18" r="2" fill="currentColor"/>
      <rect x="10" y="20" width="4" height="2" rx="1" fill="currentColor"/>
      <circle cx="8" cy="6" r="1" fill="var(--palette-success, #16c782)"/>
      <circle cx="16" cy="10" r="1" fill="var(--palette-success, #16c782)"/>
    </svg>`,
    
    "omega-invaders": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="4" width="12" height="8" rx="1" fill="currentColor" opacity="0.8"/>
      <rect x="8" y="6" width="2" height="2" fill="var(--palette-bg, #000)"/>
      <rect x="14" y="6" width="2" height="2" fill="var(--palette-bg, #000)"/>
      <rect x="10" y="10" width="4" height="2" fill="var(--palette-bg, #000)"/>
      <path d="M8 14L10 16L12 14L14 16L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="20" r="1" fill="currentColor"/>
    </svg>`,
    
    "omega-io": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.6"/>
      <path d="M12 4L14 8L18 10L14 12L12 16L10 12L6 10L10 8L12 4Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
    </svg>`,
    
    "omega-pong": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="2" height="4" rx="1" fill="currentColor"/>
      <rect x="20" y="10" width="2" height="4" rx="1" fill="currentColor"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" opacity="0.3"/>
    </svg>`,
    
    "space-omega": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" fill="currentColor" opacity="0.9"/>
      <circle cx="12" cy="12" r="2" fill="var(--palette-bg, #000)"/>
      <path d="M8 6L10 10M16 6L14 10M8 18L10 14M16 18L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
    </svg>`,
  };

  return icons[gameId] || `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor">?</text>
  </svg>`;
}

/**
 * Get chain icon SVG (for on-chain leaderboard indicator)
 */
export function getChainIcon(size: number = 16): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--palette-primary, #00bcf2);">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
    <path d="M8 8L16 8M8 12L16 12M8 16L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

