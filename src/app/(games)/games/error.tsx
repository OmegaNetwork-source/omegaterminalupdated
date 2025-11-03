"use client";

import { useEffect } from "react";
import styles from "./page.module.css";

interface GamesErrorProps {
  error: Error;
  reset: () => void;
}

export default function GamesError({ error, reset }: GamesErrorProps) {
  useEffect(() => {
    console.error("[Games Route]", error);
  }, [error]);

  return (
    <div className={styles.launcherError}>
      <h2>Arcade boot failure</h2>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Retry
      </button>
    </div>
  );
}
