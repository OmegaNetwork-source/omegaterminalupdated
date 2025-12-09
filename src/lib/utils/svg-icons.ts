/**
 * SVG Icon Utilities
 * Centralized SVG icons to replace emojis throughout the application
 * All icons use consistent styling and can be customized via CSS variables
 */

/**
 * Creates an SVG icon with consistent styling
 * @param svgPath - The SVG path data
 * @param width - Icon width (default: 18)
 * @param height - Icon height (default: 18)
 * @param color - Icon color (default: currentColor)
 * @returns SVG HTML string
 */
function createSVGIcon(
  svgPath: string,
  width: number = 18,
  height: number = 18,
  color: string = "currentColor"
): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
    ${svgPath}
  </svg>`;
}

/**
 * Common SVG Icons
 * Use these instead of emojis throughout the application
 */
export const SVG_ICONS = {
  // Status Icons
  error: createSVGIcon(
    `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>`
  ),
  success: createSVGIcon(
    `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>`
  ),
  warning: createSVGIcon(
    `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>`
  ),
  info: createSVGIcon(
    `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>`
  ),

  // Action Icons
  lightning: createSVGIcon(
    `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>`,
    20,
    20
  ),
  rocket: createSVGIcon(
    `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>`,
    16,
    16
  ),
  lightbulb: createSVGIcon(
    `<path d="M9 21h6"></path><path d="M12 3a6 6 0 0 0 6 6c0 2.5-1.5 4.5-3 6H9c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6z"></path><line x1="12" y1="9" x2="12" y2="15"></line>`,
    18,
    18
  ),

  // Feature Icons
  globe: createSVGIcon(
    `<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>`,
    20,
    20
  ),
  chart: createSVGIcon(
    `<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>`,
    20,
    20
  ),
  palette: createSVGIcon(
    `<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>`,
    20,
    20
  ),

  // Media Icons
  music: createSVGIcon(
    `<circle cx="9" cy="18" r="4"></circle><path d="M9 18V2l9 4v12"></path>`
  ),
  search: createSVGIcon(
    `<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>`
  ),
  wallet: createSVGIcon(
    `<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>`
  ),

  // Mining Icons
  pickaxe: createSVGIcon(
    `<path d="M14.531 12.469 6.619 4.557a2.5 2.5 0 0 0-3.536 3.536l7.912 7.912a2.5 2.5 0 0 0 3.536-3.536Z"></path><path d="M17.619 21.557a2.5 2.5 0 0 0 3.536-3.536l-7.912-7.912a2.5 2.5 0 0 0-3.536 3.536Z"></path><line x1="14" y1="5" x2="20" y2="11"></line><line x1="16" y1="7" x2="22" y2="13"></line>`,
    18,
    18
  ),
  lock: createSVGIcon(
    `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`
  ),
  coin: createSVGIcon(
    `<circle cx="12" cy="12" r="10"></circle><path d="M12 6v12M6 12h12"></path>`
  ),
  clock: createSVGIcon(
    `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`
  ),
  faucet: createSVGIcon(
    `<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path><circle cx="8" cy="8" r="1"></circle><circle cx="16" cy="8" r="1"></circle>`,
    18,
    18
  ),
  refresh: createSVGIcon(
    `<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path>`
  ),
  activity: createSVGIcon(
    `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>`
  ),
} as const;

/**
 * Helper to get SVG icon with custom styling
 * @param iconName - Name of the icon
 * @param className - Optional CSS class
 * @param style - Optional inline styles
 * @returns SVG HTML string with custom styling
 */
export function getSVGIcon(
  iconName: keyof typeof SVG_ICONS,
  className?: string,
  style?: string
): string {
  const icon = SVG_ICONS[iconName];
  if (!icon) return "";
  
  const classAttr = className ? ` class="${className}"` : "";
  const styleAttr = style ? ` style="${style}"` : "";
  
  return icon.replace(
    '<svg',
    `<svg${classAttr}${styleAttr}`
  );
}

