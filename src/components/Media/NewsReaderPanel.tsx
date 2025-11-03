"use client";

/**
 * News Reader Panel Component
 *
 * Renders the crypto news reader interface with category filtering,
 * sentiment analysis, and article cards. Integrates with NewsReaderProvider.
 */

import React, { useEffect, useState } from "react";
import { useNewsReader } from "@/hooks/useNewsReader";
import type { NewsFilter } from "@/types/media";
import styles from "./NewsReaderPanel.module.css";

export function NewsReaderPanel() {
  const { readerState, loadNews, refreshNews, setFilter, closePanel } =
    useNewsReader();

  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => setCurrentTime(Date.now());
    updateTime();
    const interval = setInterval(updateTime, 60_000);
    return () => clearInterval(interval);
  }, []);

  const filters: { key: NewsFilter; label: string; emoji: string }[] = [
    { key: "hot", label: "Hot", emoji: "🔥" },
    { key: "latest", label: "Latest", emoji: "📡" },
    { key: "bullish", label: "Bullish", emoji: "🚀" },
    { key: "bearish", label: "Bearish", emoji: "📉" },
  ];

  const handleFilterChange = (filter: NewsFilter) => {
    setFilter(filter);
  };

  const handleRefresh = () => {
    refreshNews(false);
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!currentTime) return "just now";

    const published = new Date(timestamp).getTime();
    const diff = Math.max(0, currentTime - published);

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSentimentEmoji = (votes: any) => {
    if (!votes) return "📰";
    const positive = votes.positive || 0;
    const negative = votes.negative || 0;
    const total = positive + negative;

    if (total === 0) return "📰";
    const ratio = positive / total;

    if (ratio > 0.6) return "🚀";
    if (ratio < 0.4) return "📉";
    return "📰";
  };

  const getSentimentLabel = (votes: any) => {
    if (!votes) return "Neutral";
    const positive = votes.positive || 0;
    const negative = votes.negative || 0;
    const total = positive + negative;

    if (total === 0) return "Neutral";
    const ratio = positive / total;

    if (ratio > 0.6) return "Bullish";
    if (ratio < 0.4) return "Bearish";
    return "Neutral";
  };

  if (!readerState.isPanelOpen) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>📰</span>
          <h2 className={styles.title}>Crypto News</h2>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshButton}
            onClick={handleRefresh}
            disabled={readerState.isLoading}
            aria-label="Refresh news"
          >
            🔄
          </button>
          <button
            className={styles.closeButton}
            onClick={closePanel}
            aria-label="Close news panel"
          >
            ✕
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Filters */}
        <div className={styles.filters}>
          {filters.map((filter) => (
            <button
              key={filter.key}
              className={`${styles.filterButton} ${
                readerState.currentFilter === filter.key
                  ? styles.filterButtonActive
                  : ""
              }`}
              onClick={() => handleFilterChange(filter.key)}
              disabled={readerState.isLoading}
            >
              <span className={styles.filterEmoji}>{filter.emoji}</span>
              <span className={styles.filterLabel}>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {readerState.isLoading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}>Loading news...</div>
          </div>
        )}

        {/* Articles */}
        {!readerState.isLoading && (
          <div className={styles.articles}>
            {readerState.articles.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📰</div>
                <p>No news articles found</p>
                <button
                  className={styles.refreshButtonLarge}
                  onClick={handleRefresh}
                >
                  Refresh News
                </button>
              </div>
            ) : (
              readerState.articles.map((article) => (
                <div key={article.id} className={styles.articleCard}>
                  <div className={styles.articleHeader}>
                    <div className={styles.articleSource}>
                      <span className={styles.sentimentEmoji}>
                        {getSentimentEmoji(article.votes)}
                      </span>
                      <div className={styles.sourceInfo}>
                        <div className={styles.sourceName}>
                          {article.source.title}
                        </div>
                        <div className={styles.articleTime}>
                          {formatTimeAgo(article.published_at)}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`${styles.sentimentBadge} ${
                        getSentimentLabel(article.votes) === "Bullish"
                          ? styles.sentimentBullish
                          : getSentimentLabel(article.votes) === "Bearish"
                          ? styles.sentimentBearish
                          : styles.sentimentNeutral
                      }`}
                    >
                      {getSentimentLabel(article.votes)}
                    </div>
                  </div>

                  <h3 className={styles.articleTitle}>{article.title}</h3>

                  {article.currencies && article.currencies.length > 0 && (
                    <div className={styles.currencies}>
                      {article.currencies.slice(0, 3).map((currency) => (
                        <span
                          key={currency.code}
                          className={styles.currencyTag}
                        >
                          {currency.code}
                        </span>
                      ))}
                      {article.currencies.length > 3 && (
                        <span className={styles.currencyMore}>
                          +{article.currencies.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={styles.articleFooter}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.readButton}
                    >
                      📖 Read Article →
                    </a>
                    {article.votes && (
                      <div className={styles.votes}>
                        <span className={styles.votePositive}>
                          👍 {article.votes.positive || 0}
                        </span>
                        <span className={styles.voteNegative}>
                          👎 {article.votes.negative || 0}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className={styles.footer}>
        <div className={styles.stats}>
          <span>{readerState.articles.length} articles</span>
          <span>•</span>
          <span>Auto-refresh: 5min</span>
        </div>
      </div>
    </div>
  );
}
