"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ViewMode, ViewModeContextValue } from "@/types/ui";
import { useMobileDetection } from "@/hooks/useMobileDetection";

const VIEW_MODE_STORAGE_KEY = "omega-view-mode";

/**
 * React context for managing view mode (basic | futuristic).
 * Controls body classes and persists selection in localStorage.
 */
export const ViewModeContext = createContext<ViewModeContextValue | undefined>(
  undefined
);

/**
 * Provider component for view mode state and operations.
 * Handles mobile detection, body class management, and persistence.
 */
export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>("futuristic");
  const mobileDetection = useMobileDetection();

  const applyBodyClasses = useCallback((mode: ViewMode): void => {
    if (typeof document === "undefined") return;
    const body = document.body;
    body.classList.add("modern-terminal-ui");
    if (mode === "futuristic") {
      body.classList.add("futuristic-mode");
      body.classList.remove("basic-terminal-mode");
    } else {
      body.classList.add("basic-terminal-mode");
      body.classList.remove("futuristic-mode");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // On first mount: detect device and load saved mode
      const forcedBasic = mobileDetection.isMobile;
      if (forcedBasic) {
        setViewModeState("basic");
        try {
          localStorage.setItem(VIEW_MODE_STORAGE_KEY, "basic");
        } catch {
          // localStorage may be unavailable
        }
        applyBodyClasses("basic");
        return;
      }

      try {
        const saved = localStorage.getItem(
          VIEW_MODE_STORAGE_KEY
        ) as ViewMode | null;
        const initial: ViewMode =
          saved === "basic" || saved === "futuristic" ? saved : "futuristic";
        setViewModeState(initial);
        applyBodyClasses(initial);
      } catch (err) {
        console.warn("[ViewModeProvider] Failed to load saved mode:", err);
        setViewModeState("futuristic");
        applyBodyClasses("futuristic");
      }
    } catch (error) {
      // Fallback to basic mode if anything fails
      console.error("[ViewModeProvider] Initialization error:", error);
      setViewModeState("basic");
      try {
        applyBodyClasses("basic");
      } catch {
        // Even body class application failed - this is bad but we continue
      }
    }
  }, [applyBodyClasses, mobileDetection.isMobile]);

  const setViewMode = useCallback(
    (mode: ViewMode): void => {
      const next = mode === "basic" ? "basic" : "futuristic";
      setViewModeState(next);
      try {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, next);
      } catch {}
      applyBodyClasses(next);
      // eslint-disable-next-line no-console
      console.log(`[Omega] View mode set to: ${next}`);
    },
    [applyBodyClasses]
  );

  const toggleViewMode = useCallback((): void => {
    if (mobileDetection.isMobile) {
      // eslint-disable-next-line no-console
      console.log("[Omega] Toggle prevented on mobile devices");
      return;
    }
    const next: ViewMode = viewMode === "basic" ? "futuristic" : "basic";
    setViewMode(next);
  }, [mobileDetection.isMobile, setViewMode, viewMode]);

  const isBasicMode = viewMode === "basic";
  const isFuturisticMode = viewMode === "futuristic";

  const value: ViewModeContextValue = {
    viewMode,
    setViewMode,
    toggleViewMode,
    isBasicMode,
    isFuturisticMode,
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

/**
 * Hook to consume view mode context.
 */
export function useViewModeContext(): ViewModeContextValue {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    throw new Error(
      "useViewModeContext must be used within a ViewModeProvider"
    );
  }
  return ctx;
}

export default ViewModeProvider;
