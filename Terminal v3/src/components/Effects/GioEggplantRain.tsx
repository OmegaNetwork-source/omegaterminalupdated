"use client";

import React from "react";
import { useTheme } from "@/hooks/useTheme";
import { EggplantRain } from "./EggplantRain";

/**
 * GioEggplantRain - Conditionally renders eggplant rain effect when Gio theme is active
 * This component automatically shows/hides based on the current theme
 */
export function GioEggplantRain(): JSX.Element | null {
  const { currentTheme } = useTheme();

  // Only show eggplant rain when Gio theme is active
  if (currentTheme !== "gio") {
    return null;
  }

  return <EggplantRain />;
}

export default GioEggplantRain;

