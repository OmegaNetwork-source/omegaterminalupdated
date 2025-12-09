/**
 * Ravaged Planet Game App
 * 
 * Main entry point for the Ravaged Planet game
 * Re-exports the React App component from the ravaged-planet source
 */

"use client";

import React, { useEffect } from "react";

// Import the styles - using scoped version to prevent global style leaks
import "./src/styles/index.css";

// Import the App component from the .jsx file
// Next.js handles .jsx files automatically
import App from "./src/react/App";

/**
 * Wrapper component that scopes ravaged-planet styles
 * and ensures proper initialization
 */
function RavagedPlanetAppWrapper() {
  useEffect(() => {
    // Ensure game container styles are isolated
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      // Add scoped class to prevent style leaks
      gameContainer.classList.add("ravaged-planet-container");
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div id="ravaged-planet-root" style={{ width: "100%", height: "100%" }}>
      <App />
    </div>
  );
}

export default RavagedPlanetAppWrapper;

