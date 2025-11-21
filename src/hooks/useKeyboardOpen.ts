"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if mobile keyboard is open
 * Uses Visual Viewport API to detect keyboard appearance on mobile devices
 * 
 * @returns boolean indicating if keyboard is open
 * 
 * @example
 * ```tsx
 * const isKeyboardOpen = useKeyboardOpen();
 * if (isKeyboardOpen) {
 *   // Adjust layout when keyboard is visible
 * }
 * ```
 */
export function useKeyboardOpen(): boolean {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if Visual Viewport API is available (mobile browsers)
    if (typeof window === "undefined" || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;

    const handleResize = () => {
      // Keyboard is likely open if viewport height is significantly less than window height
      // Threshold: 150px difference indicates keyboard presence
      const heightDifference = window.innerHeight - viewport.height;
      setIsOpen(heightDifference > 150);
    };

    // Initial check
    handleResize();

    // Listen for viewport resize (keyboard show/hide)
    viewport.addEventListener("resize", handleResize);

    // Also listen for window resize as fallback
    window.addEventListener("resize", handleResize);

    return () => {
      viewport.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isOpen;
}

