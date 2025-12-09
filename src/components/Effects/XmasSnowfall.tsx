"use client";

import React from "react";
import { useCustomizerContext } from "@/providers/CustomizerProvider";
import { Snowfall } from "./Snowfall";

/**
 * XmasSnowfall - Conditionally renders snowfall effect when Xmas palette is active
 * This component automatically shows/hides based on the current color palette
 */
export function XmasSnowfall(): JSX.Element | null {
  const { colorPalette } = useCustomizerContext();

  // Only show snowfall when xmas palette is active
  if (colorPalette !== "xmas") {
    return null;
  }

  return (
    <Snowfall
      snowflakeCount={200}
      color="rgba(255, 255, 255, 0.9)"
      minSize={2}
      maxSize={10}
      minSpeed={0.5}
      maxSpeed={2.5}
      wind={0.3}
    />
  );
}

export default XmasSnowfall;

