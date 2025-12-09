"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

type ErrorBoundaryFallback =
  | ReactNode
  | ((error: Error, reset: () => void) => ReactNode);

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ErrorBoundaryFallback;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches runtime errors within isolated UI regions so the rest of the terminal remains stable.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  private lastErrorInfo?: ErrorInfo;

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.lastErrorInfo = errorInfo;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught an error", error, errorInfo);
    }
    this.props.onError?.(error, errorInfo);
  }

  private reset = () => {
    this.lastErrorInfo = undefined;
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError || !error) {
      return children;
    }

    if (typeof fallback === "function") {
      return fallback(error, this.reset);
    }

    if (fallback) {
      return fallback;
    }

    return (
      <div className={styles.errorContainer} role="alert">
        <div className={styles.errorIcon}>⚠️</div>
        <h2 className={styles.errorTitle}>Interface hiccup detected</h2>
        <p className={styles.errorMessage}>
          Something went wrong while rendering this section. You can retry the
          action, and we will attempt to recover without reloading the entire
          terminal experience.
        </p>
        {this.lastErrorInfo?.componentStack ? (
          <details className={styles.errorDetails}>
            <summary>Technical details</summary>
            <pre className={styles.stackTrace}>
              {error.stack ?? error.toString()}
              {"\n"}
              {this.lastErrorInfo.componentStack}
            </pre>
          </details>
        ) : null}
        <button
          type="button"
          className={styles.retryButton}
          onClick={this.reset}
        >
          Retry section
        </button>
      </div>
    );
  }
}
