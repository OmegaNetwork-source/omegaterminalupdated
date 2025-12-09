"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { DashboardLoadingSkeleton } from "@/components/LoadingSkeletons";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type FallbackProps = {
  error: Error;
  reset: () => void;
};

const DashboardLayout = dynamic(
  () =>
    import("@/components/Dashboard").then((mod) => ({
      default: mod.DashboardLayout,
    })),
  { ssr: false, loading: () => <DashboardLoadingSkeleton /> }
);

const DashboardRouteFallback = ({ error, reset }: FallbackProps) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      gap: "16px",
    }}
  >
    <h2 style={{ color: "#ff4d5a", letterSpacing: "0.16em" }}>
      Dashboard temporarily offline
    </h2>
    <p style={{ maxWidth: 420, textAlign: "center", opacity: 0.75 }}>
      {error.message}
    </p>
    <button
      onClick={reset}
      style={{
        padding: "12px 24px",
        borderRadius: 12,
        border: "none",
        background:
          "linear-gradient(135deg, rgba(0,188,242,0.85), rgba(0,255,210,0.85))",
        color: "#02030f",
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        cursor: "pointer",
      }}
    >
      Retry dashboard
    </button>
  </div>
);

export default function DashboardPage(): JSX.Element {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <DashboardRouteFallback error={error} reset={reset} />
      )}
    >
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <DashboardLayout />
      </Suspense>
    </ErrorBoundary>
  );
}
