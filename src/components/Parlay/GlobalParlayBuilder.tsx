"use client";

/**
 * Global Parlay Builder
 * 
 * Wrapper component that listens for events to open the parlay builder.
 * This allows the builder to be opened from terminal commands.
 */

import React, { useEffect } from "react";
import { useParlay } from "@/hooks/useParlay";
import { ParlayBuilder } from "./ParlayBuilder";

export function GlobalParlayBuilder() {
  const { openBuilder, fetchTemplates } = useParlay();

  // Listen for open builder events
  useEffect(() => {
    const handleOpenBuilder = () => {
      openBuilder();
    };

    const handleUseTemplate = (event: CustomEvent) => {
      // Handle template selection
      console.log("[Parlay] Template selected:", event.detail);
      openBuilder();
    };

    window.addEventListener("omega:open-parlay-builder", handleOpenBuilder);
    window.addEventListener("omega:use-template", handleUseTemplate as EventListener);

    // Load templates on mount
    fetchTemplates();

    return () => {
      window.removeEventListener("omega:open-parlay-builder", handleOpenBuilder);
      window.removeEventListener("omega:use-template", handleUseTemplate as EventListener);
    };
  }, [openBuilder, fetchTemplates]);

  return <ParlayBuilder />;
}

export default GlobalParlayBuilder;

