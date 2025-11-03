/**
 * UI System Type Definitions
 *
 * Defines types and context value interfaces for the migrated futuristic UI system:
 * - View modes (basic | futuristic)
 * - GUI themes (terminal | chatgpt | aol | discord | windows95 | limewire)
 * - Color palettes (CSS variable driven palettes applied via data attributes)
 * - Customizer settings (panels visibility, animations, typography, glass effects)
 */

/**
 * View mode for rendering the application UI.
 * - 'basic': classic full-screen terminal
 * - 'futuristic': 3-panel dashboard with sidebar and stats panel
 */
export type ViewMode = "basic" | "futuristic";

/**
 * GUI theme that completely transforms the interface layout and input handling.
 * - 'terminal': default terminal layout
 * - Other values render dedicated GUI layouts
 */
export type GUITheme =
  | "terminal"
  | "chatgpt"
  | "aol"
  | "discord"
  | "windows95"
  | "limewire";

/**
 * Color palette names mapped to CSS variables. Applied globally via body[data-color-palette].
 * The palette list is aligned with color palette commands.
 */
export type ColorPalette =
  | "default"
  | "red"
  | "crimson"
  | "anime"
  | "ocean"
  | "blue"
  | "forest"
  | "green"
  | "sunset"
  | "purple"
  | "violet"
  | "cyber"
  | "neon"
  | "gold"
  | "luxury"
  | "ice"
  | "frost"
  | "fire"
  | "flame"
  | "mint"
  | "turquoise"
  | "rose"
  | "pink"
  | "amber"
  | "honey"
  | "slate"
  | "silver"
  | "lavender"
  | "lilac"
  | "toxic"
  | "radioactive";

/**
 * Visibility toggles for major dashboard panels.
 */
export interface PanelVisibility {
  sidebar: boolean;
  stats: boolean;
  header: boolean;
}

/**
 * Animation feature toggles that control decorative effects.
 */
export interface AnimationSettings {
  grid: boolean;
  scanline: boolean;
  glow: boolean;
  fadeIn: boolean;
}

/**
 * Customizer settings persisted to localStorage and reflected via CSS variables.
 */
export interface CustomizerSettings {
  colorScheme: string;
  panels: PanelVisibility;
  animations: AnimationSettings;
  fontSize: string;
  glassOpacity: number;
  blurIntensity: number;
}

/**
 * Context value for view mode operations and state.
 */
export interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isBasicMode: boolean;
  isFuturisticMode: boolean;
}

/**
 * Context value for GUI theme operations and state.
 */
export interface GUIThemeContextValue {
  guiTheme: GUITheme;
  setGUITheme: (theme: GUITheme) => void;
  isTerminalMode: boolean;
}

/**
 * Context value for color palette and customizer settings operations.
 */
export interface CustomizerContextValue {
  colorPalette: ColorPalette | null;
  setColorPalette: (palette: ColorPalette) => void;
  cycleColorPalette: () => void;
  settings: CustomizerSettings;
  updateSettings: (settings: Partial<CustomizerSettings>) => void;
  resetToDefaults: () => void;
  resetPalette?: () => void;
  exportSettings: () => void;
  importSettings: (file: File) => void;
}

export default {};
