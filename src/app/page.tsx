"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { TerminalContainer } from "@/components/Terminal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardLoadingSkeleton } from "@/components/LoadingSkeletons";
import { useViewMode } from "@/hooks/useViewMode";
import { useScreensaver } from "@/hooks/useScreensaver";
import { WelcomeScreen } from "@/components/Dashboard/WelcomeScreen";

const DashboardLayout = dynamic(
  () =>
    import("@/components/Dashboard").then((mod) => ({
      default: mod.DashboardLayout,
    })),
  { 
    ssr: false, 
    loading: () => <DashboardLoadingSkeleton />,
  }
);

const ScreensaverOverlay = dynamic(
  () =>
    import("@/components/Entertainment/ScreensaverOverlay").then((mod) => ({
      default: mod.ScreensaverOverlay,
    })),
  { ssr: false }
);

// Render dashboard or basic terminal based on view mode
function HomePageContent() {
  const { isBasicMode, viewMode } = useViewMode();
  const screensaver = useScreensaver();
  const [mounted, setMounted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const prevViewModeRef = useRef<typeof viewMode | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    setMounted(true);
    // Check if already initialized
    try {
      const initialized = localStorage.getItem("omega-initialized");
      if (initialized === "true") {
        setShowWelcome(false);
        isInitialLoadRef.current = false;
      }
    } catch {}
  }, []);

  // Show welcome screen when view mode changes (except on initial load)
  useEffect(() => {
    if (!mounted || isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      prevViewModeRef.current = viewMode;
      return;
    }

    if (prevViewModeRef.current !== null && prevViewModeRef.current !== viewMode) {
      // View mode changed - show welcome screen
      setShowWelcome(true);
    }
    prevViewModeRef.current = viewMode;
  }, [viewMode, mounted]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem("omega-initialized", "true");
    } catch {}
  };

  // Prevent hydration mismatch by only showing content after mount
  if (!mounted) {
    return <DashboardLoadingSkeleton />;
  }

  // Show welcome screen if needed
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} initialMode={viewMode} />;
  }

  return (
    <>
      {isBasicMode ? (
        <TerminalContainer />
      ) : (
        <Suspense fallback={<DashboardLoadingSkeleton />}>
          <DashboardLayout />
        </Suspense>
      )}
      {/* Screensaver Overlay - Works in both basic and dashboard modes */}
      {screensaver.screensaverState.isActive && <ScreensaverOverlay />}
    </>
  );
}

export default function HomePage() {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div style={{ 
          padding: "24px", 
          color: "#fff", 
          fontFamily: "monospace",
          backgroundColor: "#0a0a0f",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <h2 style={{ color: "#ff6b6b", marginBottom: "16px" }}>⚠️ Initialization Error</h2>
          <p style={{ marginBottom: "16px", color: "#ccc" }}>
            {error.message || "Unknown error occurred"}
          </p>
          <pre style={{ 
            backgroundColor: "#1a1a1f", 
            padding: "16px", 
            borderRadius: "4px",
            overflow: "auto",
            maxWidth: "80%",
            fontSize: "12px",
            color: "#888"
          }}>
            {error.stack}
          </pre>
          <button
            onClick={reset}
            style={{
              marginTop: "24px",
              padding: "12px 24px",
              backgroundColor: "#00bcf2",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "monospace"
            }}
          >
            Retry
          </button>
          <p style={{ marginTop: "24px", color: "#888", fontSize: "12px" }}>
            Attempting to render terminal in fallback mode...
          </p>
        </div>
      )}
    >
      <HomePageContent />
    </ErrorBoundary>
  );
}
