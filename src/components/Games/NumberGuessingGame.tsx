"use client";

/**
 * Number Guessing Game Component
 * 
 * Simple number guessing game where player tries to guess a number between 1-100
 */

import React, { useState, useEffect, useCallback } from "react";
import styles from "./NumberGuessingGame.module.css";

export interface NumberGuessingGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

export function NumberGuessingGame({
  onScoreUpdate,
  onGameEnd,
}: NumberGuessingGameProps) {
  const [secretNumber, setSecretNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState(
    "🎯 I'm thinking of a number between 1 and 100..."
  );
  const [gameWon, setGameWon] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  // Initialize game
  useEffect(() => {
    startNewGame();
    // Load best score from localStorage
    const scores = JSON.parse(
      localStorage.getItem("omega_game_scores") || "{}"
    );
    const numberScores = scores["number-guess"] || [];
    if (numberScores.length > 0) {
      const best = Math.min(...numberScores.map((s: any) => s.score));
      setBestScore(best);
    }
  }, []);

  const startNewGame = useCallback(() => {
    const newNumber = Math.floor(Math.random() * 100) + 1;
    setSecretNumber(newNumber);
    setGuess("");
    setAttempts(0);
    setMessage("🎯 I'm thinking of a number between 1 and 100...");
    setGameWon(false);
  }, []);

  const handleGuess = useCallback(() => {
    const guessNum = parseInt(guess);
    if (!guessNum || guessNum < 1 || guessNum > 100) {
      setMessage("❌ Please enter a number between 1-100!");
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guessNum === secretNumber) {
      setGameWon(true);
      setMessage(`🎉 Congratulations! You guessed it in ${newAttempts} attempts!`);
      
      // Update score (lower attempts = better score)
      const score = newAttempts;
      onScoreUpdate(score);
      
      // Save to localStorage
      const scores = JSON.parse(
        localStorage.getItem("omega_game_scores") || "{}"
      );
      if (!scores["number-guess"]) {
        scores["number-guess"] = [];
      }
      scores["number-guess"].push({
        score: score,
        player: "Arcade Pilot",
        timestamp: new Date().toISOString(),
      });
      scores["number-guess"].sort((a: any, b: any) => a.score - b.score);
      scores["number-guess"] = scores["number-guess"].slice(0, 10);
      localStorage.setItem("omega_game_scores", JSON.stringify(scores));
      
      // Update best score
      if (!bestScore || score < bestScore) {
        setBestScore(score);
      }
      
      // Call game end after a delay
      setTimeout(() => {
        onGameEnd(score);
      }, 2000);
    } else if (guessNum < secretNumber) {
      setMessage(`📈 Too low! Try a higher number.`);
    } else {
      setMessage(`📉 Too high! Try a lower number.`);
    }
  }, [guess, secretNumber, attempts, bestScore, onScoreUpdate, onGameEnd]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !gameWon) {
      handleGuess();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.message}>{message}</div>

      <div className={styles.inputSection}>
        <input
          type="number"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your guess..."
          min="1"
          max="100"
          disabled={gameWon}
          className={styles.input}
          autoFocus
        />
      </div>

      <button
        onClick={handleGuess}
        disabled={gameWon}
        className={styles.guessButton}
      >
        🎯 Make Guess
      </button>

      <div className={styles.controls}>
        <button onClick={startNewGame} className={styles.controlButton}>
          🔄 New Game
        </button>
      </div>

      <div className={styles.stats}>
        <span>🎯 Attempts: {attempts}</span>
        <span>🏆 Best: {bestScore ? `${bestScore} attempts` : "None"}</span>
      </div>
    </div>
  );
}




