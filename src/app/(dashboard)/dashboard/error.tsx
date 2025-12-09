"use client";

import { useEffect } from "react";

interface DashboardErrorProps {
  error: Error;
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[Dashboard Route]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        gap: "18px",
        padding: "40px",
        textAlign: "center",
        color: "#ffffff",
        background:
          "radial-gradient(circle at center, rgba(0,188,242,0.25), rgba(2,3,15,0.92))",
      }}
    >
      <h2 style={{ fontSize: "1.4rem", letterSpacing: "0.2em" }}>
        Dashboard failed to load
      </h2>
      <p style={{ maxWidth: 480, opacity: 0.75 }}>{error.message}</p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: "12px 28px",
          borderRadius: 12,
          border: "none",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          background:
            "linear-gradient(135deg, rgba(0,255,210,0.85), rgba(0,188,242,0.85))",
          color: "#02030f",
          cursor: "pointer",
        }}
      >
        Reload
      </button>
    </div>
  );
}
