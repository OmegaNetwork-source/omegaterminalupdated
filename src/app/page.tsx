"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { TerminalContainer } from "@/components/Terminal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardLoadingSkeleton } from "@/components/LoadingSkeletons";
import { useViewMode } from "@/hooks/useViewMode";

const DashboardLayout = dynamic(
  () =>
    import("@/components/Dashboard").then((mod) => ({
      default: mod.DashboardLayout,
    })),
  { ssr: false, loading: () => <DashboardLoadingSkeleton /> }
);

// Render dashboard or basic terminal based on view mode
export default function HomePage() {
  const { isBasicMode } = useViewMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only showing content after mount
  if (!mounted) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <ErrorBoundary>
      {isBasicMode ? (
        <TerminalContainer />
      ) : (
        <Suspense fallback={<DashboardLoadingSkeleton />}>
          <DashboardLayout />
        </Suspense>
      )}
    </ErrorBoundary>
  );
}
