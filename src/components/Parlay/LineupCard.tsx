"use client";

/**
 * Lineup Card Component
 * 
 * Displays a single parlay lineup with stats, progress, and actions.
 */

import React, { useMemo } from "react";
import type { ParlayLineup } from "@/types/parlay";
import {
  formatOdds,
  formatParlayValue,
  formatResolutionDate,
} from "@/lib/parlay/calculations";
import styles from "./LineupCard.module.css";

// =============================================================================
// Types
// =============================================================================

interface LineupCardProps {
  lineup: ParlayLineup;
  compact?: boolean;
  onView?: (lineup: ParlayLineup) => void;
  onCashout?: (lineup: ParlayLineup) => void;
  onDelete?: (lineup: ParlayLineup) => void;
  onShare?: (lineup: ParlayLineup) => void;
}

// =============================================================================
// Component
// =============================================================================

export function LineupCard({
  lineup,
  compact = false,
  onView,
  onCashout,
  onDelete,
  onShare,
}: LineupCardProps) {
  // Calculate progress
  const progress = useMemo(() => {
    const resolved = lineup.legs.filter(
      (l) => l.status === "won" || l.status === "lost"
    ).length;
    const won = lineup.legs.filter((l) => l.status === "won").length;
    const total = lineup.legs.length;

    return {
      resolved,
      won,
      total,
      percent: total > 0 ? (resolved / total) * 100 : 0,
      isWinning: won === resolved && resolved > 0,
    };
  }, [lineup.legs]);

  // Status class
  const statusClass = styles[lineup.status] || "";
  const cardClass = `${styles.card} ${statusClass} ${compact ? styles.compact : ""}`;

  // P&L formatting
  const pnlIsPositive = lineup.pnl >= 0;
  const pnlClass = pnlIsPositive ? styles.positive : styles.negative;
  const pnlSign = pnlIsPositive ? "+" : "";

  // Leg status icon
  const getLegStatusIcon = (status: string) => {
    switch (status) {
      case "won":
        return "✓";
      case "lost":
        return "✗";
      case "pending":
      default:
        return "○";
    }
  };

  return (
    <div className={cardClass} onClick={() => onView?.(lineup)}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.name}>{lineup.name}</div>
          <div className={styles.creator}>
            {lineup.creator.slice(0, 6)}...{lineup.creator.slice(-4)}
          </div>
        </div>
        <span className={`${styles.status} ${statusClass}`}>
          {lineup.status}
        </span>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Stake</div>
          <div className={styles.statValue}>${lineup.stake}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Leverage</div>
          <div className={styles.statValue}>{lineup.leverage}x</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Odds</div>
          <div className={`${styles.statValue} ${styles.highlight}`}>
            {formatOdds(lineup.totalOdds)}
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>
            {lineup.status === "won" || lineup.status === "lost" ? "Payout" : "Potential"}
          </div>
          <div className={`${styles.statValue} ${pnlClass}`}>
            {formatParlayValue(lineup.status === "won" ? lineup.finalPayout || lineup.potentialPayout : lineup.potentialPayout)}
          </div>
        </div>
      </div>

      {/* Progress */}
      {lineup.status === "active" && (
        <div className={styles.progress}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Legs Resolved</span>
            <span className={styles.progressCount}>
              {progress.resolved}/{progress.total}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${progress.isWinning ? styles.winning : styles.mixed}`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Legs Preview (only show first 3) */}
      {!compact && (
        <div className={styles.legs}>
          {lineup.legs.slice(0, 3).map((leg) => (
            <div key={leg.id} className={styles.leg}>
              <div className={`${styles.legStatus} ${styles[leg.status]}`}>
                {getLegStatusIcon(leg.status)}
              </div>
              <div className={styles.legInfo}>
                <div className={styles.legQuestion}>
                  {leg.question.length > 45
                    ? leg.question.slice(0, 45) + "..."
                    : leg.question}
                </div>
                <div className={styles.legMeta}>
                  <span className={`${styles.legSide} ${styles[leg.side]}`}>
                    {leg.side.toUpperCase()}
                  </span>
                  <span>{leg.venue}</span>
                  <span>{formatOdds(leg.decimalOdds)}</span>
                </div>
              </div>
            </div>
          ))}

          {lineup.legs.length > 3 && (
            <div className={styles.showMore}>
              +{lineup.legs.length - 3} more legs
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.resolution}>
          📅 {formatResolutionDate(lineup.resolutionWindow.latest)}
        </div>

        <div className={styles.actions}>
          {lineup.canCashout && onCashout && (
            <button
              className={`${styles.actionButton} ${styles.primary}`}
              onClick={(e) => {
                e.stopPropagation();
                onCashout(lineup);
              }}
            >
              Cash Out
            </button>
          )}

          {onShare && (
            <button
              className={`${styles.actionButton} ${styles.primary}`}
              onClick={(e) => {
                e.stopPropagation();
                onShare(lineup);
              }}
            >
              Share
            </button>
          )}

          {lineup.status === "draft" && onDelete && (
            <button
              className={`${styles.actionButton} ${styles.danger}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lineup);
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Empty State Component
// =============================================================================

interface LineupEmptyStateProps {
  onCreateClick: () => void;
}

export function LineupEmptyState({ onCreateClick }: LineupEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>🎯</div>
      <div className={styles.emptyTitle}>No Lineups Yet</div>
      <div className={styles.emptyText}>
        Create your first parlay lineup by combining multiple prediction markets
      </div>
      <button className={styles.emptyButton} onClick={onCreateClick}>
        Create Lineup
      </button>
    </div>
  );
}

export default LineupCard;


