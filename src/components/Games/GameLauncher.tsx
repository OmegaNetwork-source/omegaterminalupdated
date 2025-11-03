"use client";

/**
 * Game Launcher Component
 *
 * Displays available games in a categorized grid layout
 *
 * Features:
 * - Games organized by category (Arcade, Casual, Puzzle, Action)
 * - Game cards with icon, name, description
 * - Difficulty badges
 * - On-chain leaderboard indicators
 * - Play buttons with callbacks
 * - Hover effects
 */

import React from "react";
import styles from "./GameLauncher.module.css";
import { GAMES_METADATA } from "@/lib/games/metadata";
import { getGamesByCategory } from "@/lib/games/metadata";

/**
 * GameLauncher Props
 */
export interface GameLauncherProps {
  /** Game selection callback */
  onGameSelect: (gameId: string) => void;
}

/**
 * Game Launcher Component
 * Grid of available games organized by category
 */
export function GameLauncher({ onGameSelect }: GameLauncherProps) {
  const categories: Array<"arcade" | "casual" | "puzzle" | "action"> = [
    "arcade",
    "casual",
    "puzzle",
    "action",
  ];

  /**
   * Get difficulty badge class
   */
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return styles.difficultyEasy;
      case "medium":
        return styles.difficultyMedium;
      case "hard":
        return styles.difficultyHard;
      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <h1 className={styles.header}>
        <span>🎮</span> Omega Arcade <span>🎮</span>
      </h1>

      {/* Categories */}
      {categories.map((category) => {
        const games = getGamesByCategory(category);

        if (games.length === 0) return null;

        return (
          <div key={category} className={styles.category}>
            <h2 className={styles.categoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)} Games
            </h2>

            <div className={styles.grid}>
              {games.map((game) => (
                <div
                  key={game.id}
                  className={styles.gameCard}
                  onClick={() => onGameSelect(game.id)}
                >
                  {/* Icon */}
                  <div className={styles.gameIcon}>{game.icon}</div>

                  {/* Name */}
                  <div className={styles.gameName}>{game.name}</div>

                  {/* Description */}
                  <div className={styles.gameDescription}>
                    {game.description}
                  </div>

                  {/* Metadata */}
                  <div className={styles.gameMeta}>
                    <span
                      className={`${
                        styles.difficultyBadge
                      } ${getDifficultyClass(game.difficulty)}`}
                    >
                      {game.difficulty}
                    </span>
                    {game.hasOnChainLeaderboard && (
                      <span title="On-chain leaderboard available">⛓️</span>
                    )}
                  </div>

                  {/* Play Button */}
                  <button
                    className={styles.playButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onGameSelect(game.id);
                    }}
                  >
                    Play Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Total games count */}
      <div className={styles.footer}>
        Total Games: {GAMES_METADATA.length} • More games coming soon!
      </div>
    </div>
  );
}
