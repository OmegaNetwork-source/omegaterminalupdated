"use client";

/**
 * Ravaged Planet Game Component
 * 
 * Wrapper for the ravaged-planet game (Scorched Earth clone)
 * Integrates with Omega Terminal game system
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import styles from "./RavagedPlanetGame.module.css";

export interface RavagedPlanetGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

// Dynamically import the ravaged-planet App component
const RavagedPlanetApp = dynamic(
  () =>
    import("@/games/ravaged-planet/App"),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}>🎮</div>
        <div>Loading Ravaged Planet...</div>
      </div>
    ),
  }
);

export function RavagedPlanetGame({
  onScoreUpdate,
  onGameEnd,
}: RavagedPlanetGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<string>("menu");

  // Listen for game state changes from ravaged-planet
  useEffect(() => {
    const handleGameStateUpdate = (event: CustomEvent) => {
      const state = event.detail;
      if (!state) return;
      
      if (state?.state) {
        setGameState(state.state);
      }
      
      // Track score from players array
      // In ravaged-planet, find the human player (isPlayer flag or first player)
      if (state?.players && Array.isArray(state.players) && state.players.length > 0) {
        // Find human player (has isPlayer flag or is first player)
        const player = state.players.find((p: any) => p.isPlayer) || state.players[0];
        
        if (player) {
          // Use the game's score field if available, otherwise calculate
          const gameScore = player.score || 0;
          const kills = player.kills || 0;
          const energy = player.energy || player.health || 0;
          
          // Use game score if available, otherwise calculate: kills * 100 + energy
          const newScore = gameScore > 0 ? gameScore : (kills * 100 + Math.max(0, energy));
          
          // Always update score during gameplay (even if 0)
          if (newScore !== score) {
            setScore(newScore);
            if (state.state !== "menu" && state.state !== "game-over" && state.state !== "player-win") {
              onScoreUpdate(newScore);
            }
          }
        }
      }
      
      // Handle game end - check for winner or game over
      if (state?.state === "player-win" || state?.state === "game-over") {
        const player = state?.players?.find((p: any) => p.isPlayer) || state?.players?.[0];
        // Calculate final score: use score if available, otherwise kills * 100 + energy
        const finalScore = player?.score 
          ? player.score 
          : (player?.kills ? player.kills * 100 + Math.max(0, player.energy || player.health || 0) : score);
        
        // Always call onGameEnd to notify parent component (even if score is 0)
        onGameEnd(finalScore || 0);
      }
    };

    // Listen for both custom events and direct state updates
    window.addEventListener("gameStateUpdate" as any, handleGameStateUpdate as EventListener);
    
    // Also listen for direct updates from GameProvider
    const interval = setInterval(() => {
      // Check if game state is available globally
      if ((window as any).gameState) {
        const event = new CustomEvent("gameStateUpdate", { 
          detail: (window as any).gameState 
        });
        handleGameStateUpdate(event as any);
      }
    }, 500);

    return () => {
      window.removeEventListener("gameStateUpdate" as any, handleGameStateUpdate as EventListener);
      clearInterval(interval);
    };
  }, [score, onScoreUpdate, onGameEnd]);

  // Ensure container can receive keyboard focus
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.setAttribute("tabindex", "-1");
      containerRef.current.style.outline = "none";
    }
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.gameWrapper}>
        {/* Wrap game in isolated container to prevent style leaks */}
        <div style={{ 
          width: "100%", 
          height: "100%", 
          position: "relative",
          overflow: "hidden",
          isolation: "isolate" // Creates new stacking context
        }}>
          <RavagedPlanetApp />
        </div>
      </div>
      
      {/* Score overlay removed - all UI in left sidebar now */}
    </div>
  );
}

