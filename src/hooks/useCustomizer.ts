"use client";

import { useContext } from "react";
import { CustomizerContext } from "@/providers/CustomizerProvider";
import type { CustomizerContextValue } from "@/types/ui";

/**
 * useCustomizer
 * Hook to access the customizer (color palettes and UI settings).
 * Must be used within a CustomizerProvider.
 *
 * @returns CustomizerContextValue (palette management, panels, animations, typography, glass morphism)
 */
export function useCustomizer(): CustomizerContextValue {
  const ctx = useContext(CustomizerContext);
  if (!ctx) {
    throw new Error("useCustomizer must be used within a CustomizerProvider");
  }
  return ctx;
}

export default useCustomizer;
