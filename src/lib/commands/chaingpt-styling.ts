/**
 * ChainGPT Uniform Output Styling
 * 
 * Provides consistent, theme-aware styling for all ChainGPT command outputs
 * Uses CSS variables to adapt to different color palettes and themes
 */

/**
 * Escape HTML to prevent XSS
 * Works in both browser and Node.js environments
 */
export function escapeHtml(text: string): string {
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  // Node.js fallback
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Get theme-aware colors for ChainGPT responses
 * Uses CSS variables that adapt to current theme
 */
function getThemeColors() {
  return {
    primary: "var(--palette-primary, #00bcf2)",
    secondary: "var(--palette-secondary, #00ff88)",
    success: "var(--palette-success, #16c782)",
    warning: "var(--palette-warning, #f2b705)",
    error: "var(--palette-error, #ff6666)",
    text: "var(--palette-text, #ffffff)",
    muted: "var(--palette-muted, #888888)",
    bg: "var(--palette-bg, rgba(0, 8, 18, 1))",
    border: "var(--palette-border, rgba(0, 188, 242, 0.3))",
  };
}

/**
 * Base card styling for ChainGPT responses
 */
function getBaseCardStyle() {
  const colors = getThemeColors();
  return `
    background: linear-gradient(135deg, 
      color-mix(in srgb, ${colors.primary} 10%, transparent), 
      color-mix(in srgb, ${colors.secondary} 10%, transparent)
    );
    border: 1px solid color-mix(in srgb, ${colors.primary} 30%, transparent);
    border-radius: 12px;
    padding: 20px;
    margin: 10px 0;
    max-width: 100%;
    box-shadow: 0 4px 16px color-mix(in srgb, ${colors.primary} 15%, transparent);
  `;
}

/**
 * Header styling for response cards
 */
function getHeaderStyle(iconColor?: string) {
  const colors = getThemeColors();
  return `
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 12px;
  `;
}

/**
 * Title styling
 */
function getTitleStyle(color?: string) {
  const colors = getThemeColors();
  return `
    font-size: 18px;
    font-weight: 600;
    color: ${color || colors.primary};
    margin: 0;
    font-family: var(--font-tech, 'Courier New', monospace);
  `;
}

/**
 * Content styling
 */
function getContentStyle() {
  const colors = getThemeColors();
  return `
    color: ${colors.text};
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: var(--font-tech, 'Courier New', monospace);
  `;
}

/**
 * Footer styling for metadata
 */
function getFooterStyle(borderColor?: string) {
  const colors = getThemeColors();
  return `
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid color-mix(in srgb, ${borderColor || colors.primary} 20%, transparent);
    font-size: 12px;
    color: ${colors.muted};
    font-family: var(--font-tech, 'Courier New', monospace);
  `;
}

/**
 * SVG icon for AI responses (replaces emoji)
 */
function getAIIconSVG(size: number = 24): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
      <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" 
        fill="currentColor" 
        style="color: var(--palette-primary, #00bcf2);"
      />
    </svg>
  `;
}

/**
 * Create a uniform ChainGPT response card
 */
export function createChainGPTResponseCard(
  content: string,
  title: string = "ChainGPT AI Response",
  iconColor?: string,
  borderColor?: string,
  credits?: number | string
): string {
  const colors = getThemeColors();
  
  return `
    <div style="${getBaseCardStyle()}">
      <div style="${getHeaderStyle(iconColor)}">
        ${getAIIconSVG(24)}
        <div style="${getTitleStyle(iconColor || colors.primary)}">${escapeHtml(title)}</div>
      </div>
      <div style="${getContentStyle()}">${escapeHtml(content)}</div>
      ${credits ? `
        <div style="${getFooterStyle(borderColor || iconColor || colors.primary)}">
          Credits used: ~${credits}
        </div>
      ` : ""}
    </div>
  `;
}

/**
 * Create a context-aware response card (yellow/gold theme)
 */
export function createContextResponseCard(
  content: string,
  credits?: number | string
): string {
  const colors = getThemeColors();
  return createChainGPTResponseCard(
    content,
    "ChainGPT (Omega Terminal Context)",
    colors.warning,
    colors.warning,
    credits
  );
}

/**
 * Create a memory-aware response card (green theme)
 */
export function createMemoryResponseCard(
  content: string,
  credits?: number | string
): string {
  const colors = getThemeColors();
  return createChainGPTResponseCard(
    content,
    "ChainGPT (Memory Active)",
    colors.success,
    colors.success,
    credits
  );
}

/**
 * Create a streaming response card (blue/cyan theme)
 */
export function createStreamResponseCard(
  content: string,
  credits?: number | string
): string {
  const colors = getThemeColors();
  return createChainGPTResponseCard(
    content,
    "ChainGPT (Streaming)",
    colors.primary,
    colors.primary,
    credits
  );
}

