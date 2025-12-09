"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useMemo, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useGames } from "@/hooks/useGames";
import { getGameByIdOrAlias } from "@/lib/games/metadata";
import styles from "./page.module.css";

const GameLauncher = dynamic(
  () =>
    import("@/components/Games").then((mod) => ({
      default: mod.GameLauncher,
    })),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loading}>Loading arcade catalog…</div>
    ),
  }
);

const GameModal = dynamic(
  () =>
    import("@/components/Games").then((mod) => ({
      default: mod.GameModal,
    })),
  { ssr: false }
);

export default function GamesPage(): JSX.Element {
  const {
    openGame,
    closeGame,
    gamesState,
    submitLocalScore,
    activeGameComponent: ActiveGameComponent,
    isGameLoading,
  } = useGames();
  const [currentScore, setCurrentScore] = useState<number>(0);

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

  const handleScoreUpdate = useCallback((score: number) => {
    setCurrentScore(score);
  }, []);

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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Omega Arcade</h1>
        <p>
          Launch futuristic mini-games without loading the entire terminal
          shell.
        </p>
      </header>
      <ErrorBoundary
        fallback={(error, reset) => (
          <div className={styles.launcherError}>
            <h2>Unable to load arcade</h2>
            <p>{error.message}</p>
            <button type="button" onClick={reset}>
              Retry
            </button>
          </div>
        )}
      >
        <Suspense
          fallback={<div className={styles.loading}>Syncing game vault…</div>}
        >
          <GameLauncher onGameSelect={openGame} />
        </Suspense>
      </ErrorBoundary>

      {showGameModal ? (
        <Suspense
          fallback={
            <div className={styles.modalLoading}>Loading game runtime…</div>
          }
        >
          <GameModal
            isOpen={gamesState.isGameOpen}
            gameId={activeGameId}
            gameName={activeGameName}
            onClose={closeGame}
            onScoreSubmit={(score) => handleGameEnd(score)}
          >
            <ErrorBoundary
              fallback={(error) => (
                <div className={styles.gameError}>
                  <h3>Game crashed</h3>
                  <p>{error.message}</p>
                </div>
              )}
            >
              <Suspense
                fallback={
                  <div className={styles.modalLoading}>
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
                  <div className={styles.comingSoon}>Game coming soon</div>
                )}
              </Suspense>
            </ErrorBoundary>
          </GameModal>
        </Suspense>
      ) : isGameLoading ? (
        <div className={styles.modalLoading}>Loading game runtime…</div>
      ) : null}

      <footer className={styles.footer}>
        <span>Current Score: {currentScore}</span>
        {gamesState.currentGame ? <span>Game: {activeGameName}</span> : null}
      </footer>
    </div>
  );
}
