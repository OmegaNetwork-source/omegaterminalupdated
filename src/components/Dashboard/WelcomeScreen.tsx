"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useViewMode } from "@/hooks/useViewMode";
import { useCustomizer } from "@/hooks/useCustomizer";
import styles from "./WelcomeScreen.module.css";
import { APP_VERSION } from "@/lib/constants";
import type { ViewMode } from "@/types/ui";
import { LetterGlitch } from "./LetterGlitch";

export interface WelcomeScreenProps {
  onComplete: () => void;
  initialMode?: ViewMode;
}

/**
 * WelcomeScreen with loading animation and interface selector.
 */
export function WelcomeScreen({ onComplete, initialMode }: WelcomeScreenProps): JSX.Element {
  const { setViewMode } = useViewMode();
  const { colorPalette } = useCustomizer();
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [exiting, setExiting] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<ViewMode>(initialMode || "futuristic");
  const [isMobile, setIsMobile] = useState(false);

  // State to force recalculation when palette CSS variables change
  const [paletteUpdateKey, setPaletteUpdateKey] = useState(0);
  // Store last known color values to detect changes
  const lastPrimaryColorRef = useRef<string>("");
  const lastMutedColorRef = useRef<string>("");

  // Get glitch colors from CSS variables based on current palette
  const glitchColors = useMemo(() => {
    if (typeof window === "undefined") {
      return ['#2b4539', '#61dca3', '#61b3dc'];
    }

    // CSS variables are set on body, so we need to get computed style from body
    const bodyElement = document.body;
    const computedStyle = getComputedStyle(bodyElement);
    
    // Helper to convert any CSS color to hex
    const cssColorToHex = (cssColor: string): string => {
      if (!cssColor) return "";
      
      // Remove rgba/rgb wrapper if present
      cssColor = cssColor.trim();
      
      // If already hex, return as is
      if (/^#[0-9A-Fa-f]{6}$/.test(cssColor)) {
        return cssColor;
      }
      
      // Try to parse as rgb/rgba
      const rgbMatch = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
      
      // Try to create a temporary element and get computed color
      try {
        const tempDiv = document.createElement("div");
        tempDiv.style.color = cssColor;
        document.body.appendChild(tempDiv);
        const computed = getComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);
        
        // Parse rgb() format from computed style
        const rgbMatch2 = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch2 && rgbMatch2[1] && rgbMatch2[2] && rgbMatch2[3]) {
          const r = parseInt(rgbMatch2[1], 10);
          const g = parseInt(rgbMatch2[2], 10);
          const b = parseInt(rgbMatch2[3], 10);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
      } catch {
        // Fallback
      }
      
      return "";
    };
    
    // Get palette colors for glitch effect - use primary, secondary, and accent
    const getCSSVar = (varName: string): string => {
      // Try body first (where palette is set), then fallback to root
      const bodyValue = computedStyle.getPropertyValue(varName).trim();
      if (bodyValue) return bodyValue;
      
      // Fallback to root if not found on body
      const rootStyle = getComputedStyle(document.documentElement);
      const rootValue = rootStyle.getPropertyValue(varName).trim();
      return rootValue || "";
    };
    
    // Extract primary, secondary, and accent colors
    let primaryRaw = getCSSVar("--palette-primary");
    let secondaryRaw = getCSSVar("--palette-secondary");
    let accentRaw = getCSSVar("--palette-accent");
    
    // Convert to hex
    let primary = cssColorToHex(primaryRaw) || "#00bcf2";
    let secondary = cssColorToHex(secondaryRaw) || "#00ff88";
    let accent = cssColorToHex(accentRaw) || "#ff00ff";
    
    // If any are rgba, extract RGB part
    [primaryRaw, secondaryRaw, accentRaw].forEach((raw, index) => {
      if (raw && (raw.startsWith("rgba") || raw.startsWith("rgb("))) {
        const rgbaMatch = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbaMatch && rgbaMatch[1] && rgbaMatch[2] && rgbaMatch[3]) {
          const r = parseInt(rgbaMatch[1], 10);
          const g = parseInt(rgbaMatch[2], 10);
          const b = parseInt(rgbaMatch[3], 10);
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          if (index === 0) primary = hex;
          else if (index === 1) secondary = hex;
          else accent = hex;
        }
      }
    });
    
    // Ensure all colors are valid hex
    primary = /^#[0-9A-Fa-f]{6}$/.test(primary) ? primary : "#00bcf2";
    secondary = /^#[0-9A-Fa-f]{6}$/.test(secondary) ? secondary : "#00ff88";
    accent = /^#[0-9A-Fa-f]{6}$/.test(accent) ? accent : "#ff00ff";
    
    return [primary, secondary, accent];
  }, [colorPalette, paletteUpdateKey]);

  // Direct update when colorPalette from context changes
  useEffect(() => {
    if (colorPalette) {
      // Small delay to ensure CSS variables are updated in DOM
      const timeoutId = setTimeout(() => {
        setPaletteUpdateKey((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [colorPalette]);

  // Update colors when palette changes via mutation observer and event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Force re-computation when data-color-palette attribute changes
    const observer = new MutationObserver((mutations) => {
      const hasPaletteChange = mutations.some((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-color-palette") {
          return true;
        }
        // Also check if CSS variables changed on html/body
        if (mutation.target === document.documentElement || mutation.target === document.body) {
          return true;
        }
        return false;
      });
      
      if (hasPaletteChange) {
        // Small delay to ensure CSS variables are updated
        setTimeout(() => {
          setPaletteUpdateKey((prev) => prev + 1);
        }, 100);
      }
    });
    
    // Observe body for data-color-palette attribute changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-color-palette"],
      subtree: false,
    });
    
    // Also observe documentElement for CSS variable changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-color-palette", "style"],
      subtree: false,
    });
    
    // Listen for custom color palette change events
    const handlePaletteChange = () => {
      setTimeout(() => {
        setPaletteUpdateKey((prev) => prev + 1);
      }, 100);
    };
    
    window.addEventListener("colorPaletteChanged", handlePaletteChange);
    
    // Initialize last colors on mount
    const bodyStyle = getComputedStyle(document.body);
    const initialPrimary = bodyStyle.getPropertyValue("--palette-primary").trim();
    const initialMuted = bodyStyle.getPropertyValue("--palette-muted").trim();
    if (!lastPrimaryColorRef.current) {
      lastPrimaryColorRef.current = initialPrimary;
    }
    if (!lastMutedColorRef.current) {
      lastMutedColorRef.current = initialMuted;
    }
    
    // Periodic check for CSS variable changes (fallback) - detects actual value changes
    const intervalId = setInterval(() => {
      const currentPalette = document.body.getAttribute("data-color-palette");
      if (currentPalette !== colorPalette) {
        handlePaletteChange();
        return;
      }
      
      // Check if CSS variables have actually changed by comparing values
      const bodyStyle = getComputedStyle(document.body);
      const currentPrimary = bodyStyle.getPropertyValue("--palette-primary").trim();
      const currentMuted = bodyStyle.getPropertyValue("--palette-muted").trim();
      
      // Only update if colors actually changed
      if (currentPrimary && currentPrimary !== lastPrimaryColorRef.current) {
        lastPrimaryColorRef.current = currentPrimary;
        handlePaletteChange();
      } else if (currentMuted && currentMuted !== lastMutedColorRef.current) {
        lastMutedColorRef.current = currentMuted;
        handlePaletteChange();
      }
    }, 300);
    
    return () => {
      observer.disconnect();
      window.removeEventListener("colorPaletteChanged", handlePaletteChange);
      clearInterval(intervalId);
    };
  }, [colorPalette]);

  useEffect(() => {
    let savedMode: ViewMode | null = null;
    try {
      const saved = localStorage.getItem("omega-view-mode") as ViewMode | null;
      if (saved === "basic" || saved === "futuristic") {
        savedMode = saved;
      }
    } catch {}

    let mobile = false;
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      const mobileUA =
        /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i;
      mobile = window.innerWidth <= 768 || mobileUA.test(ua);
    }

    setIsMobile(mobile);

    if (mobile) {
      setSelectedMode("basic");
    } else if (initialMode) {
      setSelectedMode(initialMode);
    } else if (savedMode) {
      setSelectedMode(savedMode);
    }
  }, [initialMode]);

  const steps = [
    "Initializing Omega Terminal",
    "Loading blockchain providers",
    "Setting up interface",
    "Preparing media modules",
    "Syncing data",
    "Finalizing",
  ];

  useEffect(() => {
    if (isMobile) {
      setSelectedMode("basic");
    }
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 2);
        const idx = Math.min(
          steps.length - 1,
          Math.floor(next / (100 / steps.length))
        );
        setCurrentStep(idx);
        if (next === 100) {
          setIsReady(true);
          clearInterval(id);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [isMobile, steps.length]);

  const handleModeSelect = useCallback(
    (mode: ViewMode) => {
      if (!isReady) return;
      if (isMobile && mode === "futuristic") return;
      setSelectedMode(mode);
      try {
        localStorage.setItem("omega-view-mode", mode);
      } catch {}
      setTimeout(() => {
        setViewMode(mode);
        setExiting(true);
        setTimeout(() => {
          try {
            localStorage.setItem("omega-initialized", "true");
          } catch {}
          onComplete();
        }, 400);
      }, 500);
    },
    [isReady, onComplete, setViewMode, isMobile]
  );

  return (
    <div className={`${styles.container} ${exiting ? styles.exiting : ""}`}>
      <div className={styles.letterGlitchContainer}>
        <LetterGlitch
          glitchColors={glitchColors}
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={true}
          smooth={true}
        />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>Ω</div>
          <span className={styles.logoText}>OMEGA TERMINAL</span>
        </div>
        <div className={styles.headerLinks}>
          <span className={styles.headerLink}>v{APP_VERSION}</span>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className={styles.mainContent}>
        {/* Main Text */}
        <div className={styles.mainTextContainer}>
          {isReady ? (
            <>
              <div className={styles.omegaSymbol}>Ω</div>
              <div className={styles.mainText}>
                OMEGA TERMINAL
              </div>
              <div className={styles.subtitle}>
                Select your interface mode
              </div>
            </>
          ) : (
            <div className={styles.mainText}>
              {steps[currentStep]}
              <br />
              <span className={styles.mainTextSub}>
                Preparing {selectedMode === "basic" ? "terminal" : "dashboard"}...
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isReady && (
          <div className={styles.actionButtons}>
            <button
              className={`${styles.actionButton} ${styles.primaryButton} ${
                selectedMode === "basic" ? styles.activeButton : ""
              }`}
              onClick={() => handleModeSelect("basic")}
              disabled={!isReady}
            >
              Basic Terminal
            </button>
            <button
              className={`${styles.actionButton} ${styles.secondaryButton} ${
                selectedMode === "futuristic" ? styles.activeButton : ""
              }`}
              onClick={() => handleModeSelect("futuristic")}
              disabled={!isReady || isMobile}
              title={isMobile ? "Dashboard is desktop-only" : undefined}
            >
              Dashboard
            </button>
          </div>
        )}

        {/* Progress Indicator (shown when loading) */}
        {!isReady && (
          <div className={styles.progressIndicator}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeScreen;
