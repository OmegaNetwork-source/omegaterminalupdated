"use client";

/**
 * Leaderboard Display Component
 *
 * Displays game leaderboards with tabs for local and on-chain scores
 *
 * Features:
 * - Tab interface for local vs on-chain leaderboards
 * - Rank badges (gold, silver, bronze)
 * - Player usernames and scores
 * - Formatted timestamps
 * - Loading states
 * - Empty state handling
 */

import React, { useState, useEffect } from "react";
import { useGames } from "@/hooks/useGames";
import { getGameByIdOrAlias } from "@/lib/games/metadata";
import styles from "./LeaderboardDisplay.module.css";

/**
 * Format timestamp to readable date
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 1 hour ago
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 1 day ago
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 7 days ago
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Otherwise show date
  return date.toLocaleDateString();
}

/**
 * LeaderboardDisplay Props
 */
export interface LeaderboardDisplayProps {
  /** Game identifier */
  gameId: string;
  /** Display name of the game */
  gameName: string;
  /** Whether to show on-chain tab (default false) */
  showOnChain?: boolean;
  /** Number of entries to display (default 10) */
  limit?: number;
}

/**
 * Leaderboard Display Component
 * Shows local and on-chain leaderboards for a game
 */
export function LeaderboardDisplay({
  gameId,
  gameName,
  showOnChain = false,
  limit = 10,
}: LeaderboardDisplayProps) {
  const [activeTab, setActiveTab] = useState<"local" | "onchain">("local");
  const [isLoading, setIsLoading] = useState(false);
  const { getLocalLeaderboard, fetchOnChainLeaderboard, gamesState } =
    useGames();

  // Get local leaderboard
  const localLeaderboard = getLocalLeaderboard(gameId, limit);

  // Derive gameType from gameId using metadata
  const game = getGameByIdOrAlias(gameId);
  const gameType = game?.type;

  // Get on-chain leaderboard from state
  const onChainLeaderboard =
    gameType !== undefined
      ? gamesState.onChainLeaderboards[gameType] || []
      : [];

  /**
   * Load on-chain leaderboard when tab is activated
   */
  useEffect(() => {
    if (activeTab === "onchain" && showOnChain && gameType !== undefined) {
      setIsLoading(true);
      fetchOnChainLeaderboard(gameType, limit)
        .then(() => setIsLoading(false))
        .catch((error) => {
          console.error("Failed to load on-chain leaderboard:", error);
          setIsLoading(false);
        });
    }
  }, [activeTab, showOnChain, gameType, limit, fetchOnChainLeaderboard]);

  /**
   * Render rank badge
   */
  const renderRankBadge = (rank: number) => {
    let badgeClass = styles.rankDefault;
    if (rank === 1) badgeClass = styles.rankGold;
    else if (rank === 2) badgeClass = styles.rankSilver;
    else if (rank === 3) badgeClass = styles.rankBronze;

    return <div className={`${styles.rankBadge} ${badgeClass}`}>{rank}</div>;
  };

  const currentLeaderboard =
    activeTab === "local" ? localLeaderboard : onChainLeaderboard;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <span>🏆</span>
        <span>{gameName} Leaderboard</span>
        <span>🏆</span>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "local" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("local")}
        >
          Local
        </button>
        {showOnChain && (
          <button
            className={`${styles.tab} ${
              activeTab === "onchain" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("onchain")}
          >
            On-Chain
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.loading}>
          <div>Loading leaderboard...</div>
        </div>
      ) : currentLeaderboard.length === 0 ? (
        <div className={styles.empty}>
          <div>🎮</div>
          <div>Be the first to play!</div>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>Rank</th>
              <th className={styles.tableHeader}>Player</th>
              <th className={styles.tableHeader}>Score</th>
              <th className={styles.tableHeader}>Date</th>
            </tr>
          </thead>
          <tbody>
            {currentLeaderboard.map((entry, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.tableCell}>
                  {renderRankBadge(index + 1)}
                </td>
                <td className={styles.tableCell}>{entry.username}</td>
                <td className={styles.tableCell}>
                  {entry.score.toLocaleString()}
                </td>
                <td className={styles.tableCell}>
                  {formatTimestamp(entry.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
