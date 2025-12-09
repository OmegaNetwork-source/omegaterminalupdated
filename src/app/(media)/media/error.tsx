"use client";

import { useEffect } from "react";
import styles from "./page.module.css";

interface MediaErrorProps {
  error: Error;
  reset: () => void;
}

export default function MediaError({ error, reset }: MediaErrorProps) {
  useEffect(() => {
    console.error("[Media Route]", error);
  }, [error]);

  return (
    <div className={styles.panelError}>
      <h2>Media hub crashed</h2>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Retry
      </button>
    </div>
  );
}
