const ERROR_STORAGE_KEY = "omega-error-logs";

export interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  viewMode?: string;
  guiTheme?: string;
}

const MAX_STORED_ERRORS = 50;

function captureContext(): Pick<ErrorLog, "viewMode" | "guiTheme"> {
  if (typeof window === "undefined") {
    return {};
  }

  const globalState = (
    window as typeof window & {
      __OMEGA_STATE__?: { viewMode?: string; guiTheme?: string };
    }
  ).__OMEGA_STATE__;

  return {
    viewMode: globalState?.viewMode,
    guiTheme: globalState?.guiTheme,
  };
}

/**
 * Persist and report captured errors so the terminal can recover quickly without data loss.
 */
export function logError(
  error: Error,
  errorInfo?: {
    componentStack?: string;
  }
): void {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error("[Error]", error, errorInfo);
  }

  if (typeof window === "undefined") {
    return;
  }

  const entry: ErrorLog = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    timestamp: Date.now(),
    userAgent: window.navigator.userAgent,
    url: window.location.href,
    ...captureContext(),
  };

  try {
    const existingRaw = window.localStorage.getItem(ERROR_STORAGE_KEY);
    const existing: ErrorLog[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [...existing, entry].slice(-MAX_STORED_ERRORS);
    window.localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(updated));
  } catch (storageError) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("Failed to persist error logs", storageError);
    }
  }

  if (process.env.NODE_ENV === "production") {
    const payload = JSON.stringify(entry);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/monitoring/errors", payload);
    } else {
      void fetch("/api/monitoring/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        /* ignore network issues */
      });
    }
  }
}

export function getErrorLogs(): ErrorLog[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(ERROR_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ErrorLog[]) : [];
  } catch {
    return [];
  }
}

export function clearErrorLogs(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(ERROR_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Installs global listeners for runtime errors and unhandled promise rejections.
 */
export function initErrorMonitoring(): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleGlobalError = (event: ErrorEvent) => {
    if (event.error instanceof Error) {
      logError(event.error);
    } else {
      logError(new Error(event.message));
    }
  };

  const handleRejection = (event: PromiseRejectionEvent) => {
    const reason =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
    logError(reason);
  };

  window.addEventListener("error", handleGlobalError);
  window.addEventListener("unhandledrejection", handleRejection);

  return () => {
    window.removeEventListener("error", handleGlobalError);
    window.removeEventListener("unhandledrejection", handleRejection);
  };
}
