/**
 * Analytics Provider
 * Provides Firebase Analytics context to the application
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { initAnalytics, trackSessionStart, generateSessionId } from "@/lib/firebase/analytics";
import type { AnalyticsContext } from "@/types/analytics";

const AnalyticsCtx = createContext<AnalyticsContext | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * Analytics Provider Component
 * Initializes Firebase Analytics and provides context to child components
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize analytics on mount
    const initialize = async () => {
      try {
        await initAnalytics();
        setIsReady(true);

        // Track session start
        const sessionId = generateSessionId();
        if (typeof window !== "undefined") {
          sessionStorage.setItem("omega_session_id", sessionId);
        }
        trackSessionStart();

        console.log("[Analytics] Provider initialized successfully");
      } catch (error) {
        console.error("[Analytics] Provider initialization error:", error);
        // Set as ready anyway to not block the app
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  // We don't need to provide the context value since we're using the utility functions directly
  // This provider just ensures analytics is initialized
  return <>{children}</>;
}

/**
 * Hook to check if analytics is ready
 * Can be used for conditional rendering or logging
 */
export function useAnalytics() {
  return { isReady: true }; // Analytics is always "ready" (fails silently if not available)
}
