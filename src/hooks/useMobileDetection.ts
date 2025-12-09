"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Mobile Detection Hook
 * Provides comprehensive mobile device detection, orientation tracking,
 * and safe area insets for mobile optimization.
 */

export interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isTouchDevice: boolean;
  orientation: "portrait" | "landscape";
  screenWidth: number;
  screenHeight: number;
  breakpoint: "mobile" | "tablet" | "desktop";
  isIOS: boolean;
  isAndroid: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Detects safe area insets from CSS environment variables
 */
function getSafeAreaInsets(): MobileDetection["safeAreaInsets"] {
  if (typeof window === "undefined") {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  const getInset = (property: string): number => {
    const value = computedStyle.getPropertyValue(property);
    if (!value) return 0;
    // Extract numeric value from env() function
    const match = value.match(/env\([^)]+\)|(\d+)px/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    // Try to parse as direct value
    const parsed = parseInt(value.trim(), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  return {
    top: getInset("env(safe-area-inset-top)") || 0,
    bottom: getInset("env(safe-area-inset-bottom)") || 0,
    left: getInset("env(safe-area-inset-left)") || 0,
    right: getInset("env(safe-area-inset-right)") || 0,
  };
}

/**
 * Detects if device is iOS
 */
function isIOSDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /iPad|iPhone|iPod/.test(ua) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/**
 * Detects if device is Android
 */
function isAndroidDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

/**
 * Detects if device supports touch
 */
function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Hook for mobile device detection
 * 
 * @returns MobileDetection object with device information
 * 
 * @example
 * ```tsx
 * const mobile = useMobileDetection();
 * if (mobile.isMobile) {
 *   // Mobile-specific code
 * }
 * ```
 */
export function useMobileDetection(): MobileDetection {
  const [state, setState] = useState<MobileDetection>(() => {
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isTouchDevice: false,
        orientation: "portrait",
        screenWidth: 0,
        screenHeight: 0,
        breakpoint: "desktop",
        isIOS: false,
        isAndroid: false,
        safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent.toLowerCase();

    // Mobile detection: screen width <= 768px or mobile user agent
    const isMobile =
      width <= 768 ||
      /iphone|ipod|android(?!.*mobile)|blackberry|mini|windows\sce|palm/i.test(
        userAgent
      );

    // Tablet detection: width between 769-1024px or tablet user agent
    const isTablet =
      (!isMobile &&
        width > 768 &&
        width <= 1024 &&
        isTouchDevice()) ||
      /ipad|android(?!.*mobile)|tablet/i.test(userAgent);

    const breakpoint = isMobile
      ? "mobile"
      : isTablet
      ? "tablet"
      : "desktop";

    const orientation = width > height ? "landscape" : "portrait";

    return {
      isMobile,
      isTablet,
      isTouchDevice: isTouchDevice(),
      orientation,
      screenWidth: width,
      screenHeight: height,
      breakpoint,
      isIOS: isIOSDevice(),
      isAndroid: isAndroidDevice(),
      safeAreaInsets: getSafeAreaInsets(),
    };
  });

  const updateState = useCallback(() => {
    if (typeof window === "undefined") return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent.toLowerCase();

    const isMobile =
      width <= 768 ||
      /iphone|ipod|android(?!.*mobile)|blackberry|mini|windows\sce|palm/i.test(
        userAgent
      );

    const isTablet =
      (!isMobile &&
        width > 768 &&
        width <= 1024 &&
        isTouchDevice()) ||
      /ipad|android(?!.*mobile)|tablet/i.test(userAgent);

    const breakpoint = isMobile
      ? "mobile"
      : isTablet
      ? "tablet"
      : "desktop";

    const orientation = width > height ? "landscape" : "portrait";

    setState({
      isMobile,
      isTablet,
      isTouchDevice: isTouchDevice(),
      orientation,
      screenWidth: width,
      screenHeight: height,
      breakpoint,
      isIOS: isIOSDevice(),
      isAndroid: isAndroidDevice(),
      safeAreaInsets: getSafeAreaInsets(),
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial update
    updateState();

    // Listen for resize events
    window.addEventListener("resize", updateState);
    window.addEventListener("orientationchange", updateState);

    // Listen for safe area changes (iOS)
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const handleMediaChange = () => updateState();
    mediaQuery.addEventListener("change", handleMediaChange);

    // Update on visibility change (handles app switching)
    document.addEventListener("visibilitychange", updateState);

    return () => {
      window.removeEventListener("resize", updateState);
      window.removeEventListener("orientationchange", updateState);
      mediaQuery.removeEventListener("change", handleMediaChange);
      document.removeEventListener("visibilitychange", updateState);
    };
  }, [updateState]);

  return state;
}

