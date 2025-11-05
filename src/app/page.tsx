"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { TerminalContainer } from "@/components/Terminal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardLoadingSkeleton } from "@/components/LoadingSkeletons";
import { useViewMode } from "@/hooks/useViewMode";
import { useScreensaver } from "@/hooks/useScreensaver";

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
  const { isBasicMode } = useViewMode();
  const screensaver = useScreensaver();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only showing content after mount
  if (!mounted) {
    return <DashboardLoadingSkeleton />;
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
