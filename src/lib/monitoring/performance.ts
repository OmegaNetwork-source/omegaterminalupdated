import type { NextWebVitalsMetric } from "next/app";

const METRIC_STORAGE_KEY = "omega-performance-metrics";

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

/**
 * Report Core Web Vitals to local storage, dev console, and optionally an analytics endpoint.
 */
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  // Only log in development if explicitly enabled
  if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DEBUG_PERFORMANCE === "true") {
    // eslint-disable-next-line no-console
    console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
  }

  if (typeof window === "undefined") {
    return;
  }

  const entry: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating ?? "good",
    timestamp: Date.now(),
  };

  try {
    const existingRaw = window.localStorage.getItem(METRIC_STORAGE_KEY);
    const existing: PerformanceMetric[] = existingRaw
      ? JSON.parse(existingRaw)
      : [];
    const updated = [...existing, entry].slice(-50);
    window.localStorage.setItem(METRIC_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("Unable to persist performance metrics", error);
    }
  }

  if (process.env.NODE_ENV === "production") {
    const payload = JSON.stringify({
      ...entry,
      id: metric.id,
      delta: metric.delta,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/monitoring/web-vitals", payload);
    } else {
      void fetch("/api/monitoring/web-vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        /* ignore network errors */
      });
    }
  }
}

/**
 * Measure a synchronous render pass using the Performance API.
 */
export function measureComponentRender(
  componentName: string,
  callback: () => void
): void {
  if (typeof performance === "undefined") {
    callback();
    return;
  }

  const startMark = `${componentName}-render-start`;
  const endMark = `${componentName}-render-end`;

  performance.mark(startMark);
  callback();
  performance.mark(endMark);
  performance.measure(`${componentName}-render`, startMark, endMark);

  const [measure] = performance.getEntriesByName(`${componentName}-render`);
  if (
    measure &&
    process.env.NODE_ENV !== "production" &&
    measure.duration > 16
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      `Slow render detected for ${componentName}: ${measure.duration.toFixed(
        2
      )}ms`
    );
  }

  performance.clearMarks(startMark);
  performance.clearMarks(endMark);
  performance.clearMeasures(`${componentName}-render`);
}

/**
 * Record when a dynamically imported chunk finishes loading.
 */
export function trackBundleLoad(chunkName: string): void {
  if (typeof performance === "undefined") {
    return;
  }

  const now = performance.now();
  const entry: PerformanceMetric = {
    name: `${chunkName}-bundle-load`,
    value: now,
    rating: now < 2000 ? "good" : now < 4000 ? "needs-improvement" : "poor",
    timestamp: Date.now(),
  };

  if (typeof window !== "undefined") {
    try {
      const existingRaw = window.localStorage.getItem(METRIC_STORAGE_KEY);
      const existing: PerformanceMetric[] = existingRaw
        ? JSON.parse(existingRaw)
        : [];
      const updated = [...existing, entry].slice(-50);
      window.localStorage.setItem(METRIC_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      /* swallow storage issues */
    }
  }
}

/**
 * Retrieve the most recent performance metrics stored locally.
 */
export function getPerformanceMetrics(): PerformanceMetric[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(METRIC_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as PerformanceMetric[]) : [];
  } catch {
    return [];
  }
}
