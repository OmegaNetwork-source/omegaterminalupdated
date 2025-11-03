"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type {
  ColorPalette,
  CustomizerSettings,
  CustomizerContextValue,
  PanelVisibility,
  AnimationSettings,
} from "@/types/ui";

const COLOR_PALETTE_KEY = "omega-color-palette";
const CUSTOMIZER_SETTINGS_KEY = "omega-customizer-settings";
const PANELS_KEY = "omega-panels";
const ANIMATIONS_KEY = "omega-animations";
const FONT_SIZE_KEY = "omega-font-size";
const GLASS_OPACITY_KEY = "omega-glass-opacity";
const BLUR_INTENSITY_KEY = "omega-blur-intensity";

const COLOR_PALETTES: ColorPalette[] = [
  "default",
  "red",
  "crimson",
  "anime",
  "ocean",
  "blue",
  "forest",
  "green",
  "sunset",
  "purple",
  "violet",
  "cyber",
  "neon",
  "gold",
  "luxury",
  "ice",
  "frost",
  "fire",
  "flame",
  "mint",
  "turquoise",
  "rose",
  "pink",
  "amber",
  "honey",
  "slate",
  "silver",
  "lavender",
  "lilac",
  "toxic",
  "radioactive",
];

/**
 * Default settings for the customizer system.
 */
const DEFAULT_SETTINGS: CustomizerSettings = {
  colorScheme: "cyberBlue",
  panels: { sidebar: true, stats: true, header: true },
  animations: { grid: true, scanline: true, glow: true, fadeIn: true },
  fontSize: "medium",
  glassOpacity: 0.85,
  blurIntensity: 20,
};

/**
 * React context for customizer state and operations.
 */
export const CustomizerContext = createContext<
  CustomizerContextValue | undefined
>(undefined);

/**
 * Apply global CSS variables and classes based on settings.
 */
function applyCustomizerToDocument(
  settings: CustomizerSettings,
  palette: ColorPalette | null
): void {
  if (typeof document === "undefined") return;
  const body = document.body;

  // Color palette attribute
  if (palette) {
    body.setAttribute("data-color-palette", palette);
  } else {
    body.removeAttribute("data-color-palette");
  }

  // Font size
  body.style.setProperty("--omega-font-size", settings.fontSize);

  // Glass morphism
  body.style.setProperty("--glass-opacity", String(settings.glassOpacity));
  body.style.setProperty(
    "--glass-blur",
    `blur(${Math.max(0, settings.blurIntensity)}px)`
  );

  // Animation toggles
  if (!settings.animations.grid) body.classList.add("no-grid");
  else body.classList.remove("no-grid");

  if (!settings.animations.scanline) body.classList.add("no-scanline");
  else body.classList.remove("no-scanline");

  if (!settings.animations.glow) body.classList.add("no-glow");
  else body.classList.remove("no-glow");

  if (!settings.animations.fadeIn) body.classList.add("no-fade");
  else body.classList.remove("no-fade");
}

/**
 * Provider for customizer palette and settings.
 */
export function CustomizerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colorPalette, setColorPaletteState] = useState<ColorPalette | null>(
    null
  );
  const [settings, setSettings] =
    useState<CustomizerSettings>(DEFAULT_SETTINGS);

  // Load saved settings on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedPalette = localStorage.getItem(
        COLOR_PALETTE_KEY
      ) as ColorPalette | null;
      const savedSettingsRaw = localStorage.getItem(CUSTOMIZER_SETTINGS_KEY);
      let merged = DEFAULT_SETTINGS;
      if (savedSettingsRaw) {
        merged = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettingsRaw) };
      } else {
        // Backward-compat for individual keys
        const panelsRaw = localStorage.getItem(PANELS_KEY);
        const animsRaw = localStorage.getItem(ANIMATIONS_KEY);
        const fontSizeRaw = localStorage.getItem(FONT_SIZE_KEY);
        const glassRaw = localStorage.getItem(GLASS_OPACITY_KEY);
        const blurRaw = localStorage.getItem(BLUR_INTENSITY_KEY);
        merged = {
          ...DEFAULT_SETTINGS,
          panels: panelsRaw
            ? { ...DEFAULT_SETTINGS.panels, ...JSON.parse(panelsRaw) }
            : DEFAULT_SETTINGS.panels,
          animations: animsRaw
            ? { ...DEFAULT_SETTINGS.animations, ...JSON.parse(animsRaw) }
            : DEFAULT_SETTINGS.animations,
          fontSize: fontSizeRaw || DEFAULT_SETTINGS.fontSize,
          glassOpacity: glassRaw
            ? Number(glassRaw)
            : DEFAULT_SETTINGS.glassOpacity,
          blurIntensity: blurRaw
            ? Number(blurRaw)
            : DEFAULT_SETTINGS.blurIntensity,
          colorScheme: DEFAULT_SETTINGS.colorScheme,
        };
      }
      setSettings(merged);
      setColorPaletteState(savedPalette || null);
      applyCustomizerToDocument(merged, savedPalette || null);
    } catch {
      setSettings(DEFAULT_SETTINGS);
      setColorPaletteState(null);
      applyCustomizerToDocument(DEFAULT_SETTINGS, null);
    }
  }, []);

  const setColorPalette = useCallback((palette: ColorPalette): void => {
    const valid = COLOR_PALETTES.includes(palette) ? palette : undefined;
    if (!valid) return;
    setColorPaletteState(valid);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(COLOR_PALETTE_KEY, valid);
      } catch {}
    }
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-color-palette", valid);
    }
    // eslint-disable-next-line no-console
    console.log(`[Omega] Color palette set to: ${valid}`);
  }, []);

  const cycleColorPalette = useCallback((): void => {
    const current = colorPalette ? COLOR_PALETTES.indexOf(colorPalette) : -1;
    const nextIndex =
      (current + 1 + COLOR_PALETTES.length) % COLOR_PALETTES.length;
    setColorPalette(COLOR_PALETTES[nextIndex]);
  }, [colorPalette, setColorPalette]);

  const updateSettings = useCallback(
    (partial: Partial<CustomizerSettings>): void => {
      setSettings((prev) => {
        const next: CustomizerSettings = {
          ...prev,
          ...partial,
          panels: { ...prev.panels, ...(partial.panels || {}) },
          animations: { ...prev.animations, ...(partial.animations || {}) },
        };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CUSTOMIZER_SETTINGS_KEY, JSON.stringify(next));
            localStorage.setItem(PANELS_KEY, JSON.stringify(next.panels));
            localStorage.setItem(
              ANIMATIONS_KEY,
              JSON.stringify(next.animations)
            );
            localStorage.setItem(FONT_SIZE_KEY, String(next.fontSize));
            localStorage.setItem(GLASS_OPACITY_KEY, String(next.glassOpacity));
            localStorage.setItem(
              BLUR_INTENSITY_KEY,
              String(next.blurIntensity)
            );
          } catch {}
        }
        applyCustomizerToDocument(next, colorPalette);
        return next;
      });
    },
    [colorPalette]
  );

  const resetToDefaults = useCallback((): void => {
    setSettings(DEFAULT_SETTINGS);
    setColorPaletteState(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(COLOR_PALETTE_KEY);
        localStorage.removeItem(CUSTOMIZER_SETTINGS_KEY);
        localStorage.removeItem(PANELS_KEY);
        localStorage.removeItem(ANIMATIONS_KEY);
        localStorage.removeItem(FONT_SIZE_KEY);
        localStorage.removeItem(GLASS_OPACITY_KEY);
        localStorage.removeItem(BLUR_INTENSITY_KEY);
      } catch {}
    }
    applyCustomizerToDocument(DEFAULT_SETTINGS, null);
  }, []);

  const resetPalette = useCallback((): void => {
    setColorPaletteState(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(COLOR_PALETTE_KEY);
      } catch {}
    }
    if (typeof document !== "undefined") {
      document.body.removeAttribute("data-color-palette");
    }
    applyCustomizerToDocument(settings, null);
  }, [settings]);

  const exportSettings = useCallback((): void => {
    if (typeof document === "undefined") return;
    const payload = {
      colorPalette,
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "omega-customizer-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [colorPalette, settings]);

  const importSettings = useCallback((file: File): void => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result) || "{}");
        const importedPalette: ColorPalette | null =
          parsed.colorPalette || null;
        const importedSettings: CustomizerSettings = {
          ...DEFAULT_SETTINGS,
          ...(parsed.settings || {}),
        };
        setSettings(importedSettings);
        setColorPaletteState(importedPalette);
        if (typeof window !== "undefined") {
          try {
            if (importedPalette) {
              localStorage.setItem(COLOR_PALETTE_KEY, importedPalette);
            } else {
              localStorage.removeItem(COLOR_PALETTE_KEY);
            }
            localStorage.setItem(
              CUSTOMIZER_SETTINGS_KEY,
              JSON.stringify(importedSettings)
            );
          } catch {}
        }
        applyCustomizerToDocument(importedSettings, importedPalette);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[Omega] Failed to import settings", e);
      }
    };
    reader.readAsText(file);
  }, []);

  const value: CustomizerContextValue = {
    colorPalette,
    setColorPalette,
    cycleColorPalette,
    settings,
    updateSettings,
    resetToDefaults,
    resetPalette,
    exportSettings,
    importSettings,
  };

  return (
    <CustomizerContext.Provider value={value}>
      {children}
    </CustomizerContext.Provider>
  );
}

/**
 * Hook to consume the customizer context.
 */
export function useCustomizerContext(): CustomizerContextValue {
  const ctx = useContext(CustomizerContext);
  if (!ctx) {
    throw new Error(
      "useCustomizerContext must be used within a CustomizerProvider"
    );
  }
  return ctx;
}

export default CustomizerProvider;
