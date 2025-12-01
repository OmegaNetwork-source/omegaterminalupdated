"use client";

/**
 * Speed Clicker Game Component
 * 
 * Click as fast as you can in 10 seconds!
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./SpeedClickerGame.module.css";

export interface SpeedClickerGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

const GAME_DURATION = 10; // seconds

export function SpeedClickerGame({
  onScoreUpdate,
  onGameEnd,
}: SpeedClickerGameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load best score
    const scores = JSON.parse(
      localStorage.getItem("omega_game_scores") || "{}"
    );
    const speedScores = scores["speed-clicker"] || [];
    if (speedScores.length > 0) {
      const best = Math.max(...speedScores.map((s: any) => s.score));
      setBestScore(best);
    }
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setGameOver(false);

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // Save score
    const scores = JSON.parse(
      localStorage.getItem("omega_game_scores") || "{}"
    );
    if (!scores["speed-clicker"]) {
      scores["speed-clicker"] = [];
    }
    scores["speed-clicker"].push({
      score: score,
      player: "Arcade Pilot",
      timestamp: new Date().toISOString(),
    });
    scores["speed-clicker"].sort((a: any, b: any) => b.score - a.score);
    scores["speed-clicker"] = scores["speed-clicker"].slice(0, 10);
    localStorage.setItem("omega_game_scores", JSON.stringify(scores));

    if (!bestScore || score > bestScore) {
      setBestScore(score);
    }

    onGameEnd(score);
  }, [score, bestScore, onGameEnd]);

  const handleClick = useCallback(() => {
    if (!isPlaying || gameOver) {
      if (!isPlaying && !gameOver) {
        startGame();
      }
      return;
    }

    setScore((prev) => {
      const newScore = prev + 1;
      onScoreUpdate(newScore);
      return newScore;
    });
  }, [isPlaying, gameOver, startGame, onScoreUpdate]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.timeDisplay}>
          {isPlaying ? `⏱️ ${timeLeft}s` : gameOver ? "⏱️ Time's Up!" : "⏱️ Ready"}
        </div>
        <div className={styles.scoreDisplay}>
          🎯 Score: {score}
        </div>
        <div className={styles.bestScore}>
          🏆 Best: {bestScore || 0}
        </div>
      </div>

      <div className={styles.clickSection}>
        <button
          onClick={handleClick}
          className={`${styles.clickButton} ${
            isPlaying && !gameOver ? styles.active : ""
          }`}
          disabled={gameOver}
        >
          {!isPlaying && !gameOver
            ? "🚀 Click to Start!"
            : gameOver
            ? "Game Over"
            : "⚡ CLICK FAST!"}
        </button>
        {isPlaying && !gameOver && (
          <div className={styles.instructions}>
            Click as fast as you can!
          </div>
        )}
      </div>

      {gameOver && (
        <div className={styles.gameOverSection}>
          <div className={styles.finalScore}>Final Score: {score}</div>
          <button onClick={startGame} className={styles.restartButton}>
            🔄 Play Again
          </button>
        </div>
      )}
    </div>
  );
}











