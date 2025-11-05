"use client";

/**
 * GlobalGameModal Component
 * 
 * Renders the GameModal globally so games can be opened from anywhere
 * (including terminal commands)
 */

import dynamic from "next/dynamic";
import { Suspense, useCallback, useMemo } from "react";
import { useGames } from "@/hooks/useGames";
import { getGameByIdOrAlias } from "@/lib/games/metadata";
import { getGameIcon } from "@/lib/games/icons";

const GameModal = dynamic(
  () =>
    import("@/components/Games").then((mod) => ({
      default: mod.GameModal,
    })),
  { ssr: false }
);

/**
 * Global Game Modal Wrapper
 * Renders game modal when a game is opened from anywhere in the app
 */
export function GlobalGameModal() {
  const {
    openGame: _openGame,
    closeGame,
    gamesState,
    submitLocalScore,
    activeGameComponent: ActiveGameComponent,
    isGameLoading,
  } = useGames();

  const formatGameName = (value: string | null | undefined): string => {
    if (!value) {
      return "Arcade Game";
    }

    return value
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const metadata = useMemo(() => {
    if (!gamesState.currentGame) {
      return undefined;
    }
    return getGameByIdOrAlias(gamesState.currentGame);
  }, [gamesState.currentGame]);

  const showGameModal = gamesState.isGameOpen && !!ActiveGameComponent;
  const activeGameId = metadata?.id ?? gamesState.currentGame ?? "unknown";
  const activeGameName =
    metadata?.name ?? formatGameName(gamesState.currentGame);

  const handleGameEnd = useCallback(
    (finalScore: number) => {
      if (!gamesState.currentGame) {
        return;
      }

      submitLocalScore(gamesState.currentGame, {
        gameId: gamesState.currentGame,
        score: finalScore,
        username: "Arcade Pilot",
        timestamp: Date.now(),
      });
    },
    [gamesState.currentGame, submitLocalScore]
  );

  const handleScoreUpdate = useCallback((score: number) => {
    // Score updates are handled by the game component
  }, []);

  if (!showGameModal && !isGameLoading) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            zIndex: 10000,
            color: "var(--palette-primary, #00d4ff)",
            fontFamily: "Courier New, monospace",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>
              {activeGameId && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: getGameIcon(activeGameId, 64),
                  }}
                  style={{
                    display: "inline-block",
                    color: "var(--palette-primary, #00bcf2)",
                  }}
                />
              )}
            </div>
            <div>Loading game runtime…</div>
          </div>
        </div>
      }
    >
      {showGameModal && (
        <GameModal
          isOpen={gamesState.isGameOpen}
          gameId={activeGameId}
          gameName={activeGameName}
          onClose={closeGame}
          onScoreSubmit={(score) => handleGameEnd(score)}
        >
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px",
                  color: "var(--palette-primary, #00d4ff)",
                  fontFamily: "Courier New, monospace",
                }}
              >
                Booting game assets…
              </div>
            }
          >
            {ActiveGameComponent ? (
              <ActiveGameComponent
                onGameEnd={handleGameEnd}
                onScoreUpdate={handleScoreUpdate}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px",
                  textAlign: "center",
                  color: "var(--palette-text, #e0e0e0)",
                  fontFamily: "Courier New, monospace",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🕹️</div>
                <h3 style={{ marginBottom: "12px", color: "var(--palette-primary, #00d4ff)" }}>
                  {activeGameName}
                </h3>
                <p style={{ margin: 0, maxWidth: "420px", lineHeight: 1.5 }}>
                  This game is coming soon to Omega Arcade.
                </p>
                <span style={{ fontSize: "0.9rem", opacity: 0.9, marginTop: "16px" }}>
                  Use the close button above to return to the terminal.
                </span>
              </div>
            )}
          </Suspense>
        </GameModal>
      )}
    </Suspense>
  );
}



