"use client";

import { useEffect } from "react";
import styles from "./page.module.css";

interface NftErrorProps {
  error: Error;
  reset: () => void;
}

export default function NftError({ error, reset }: NftErrorProps) {
  useEffect(() => {
    console.error("[NFT Route]", error);
  }, [error]);

  return (
    <div className={styles.galleryError}>
      <h2>Gallery crashed</h2>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Retry
      </button>
    </div>
  );
}
