"use client";

/**
 * News Reader Panel Component
 *
 * Renders the crypto news reader interface with category filtering,
 * sentiment analysis, source logos, and article cards.
 */

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useNewsReader } from "@/hooks/useNewsReader";
import type { NewsFilter } from "@/types/media";
import styles from "./NewsReaderPanel.module.css";

// Source logo mapping with fallback emojis
const SOURCE_CONFIG: Record<string, { emoji: string; color: string }> = {
  // Major Crypto News
  "coindesk": { emoji: "📰", color: "#0052FF" },
  "cointelegraph": { emoji: "📡", color: "#00C853" },
  "decrypt": { emoji: "🔓", color: "#7B3FE4" },
  "theblock": { emoji: "🧊", color: "#1E1E1E" },
  "blockworks": { emoji: "⚡", color: "#FF6B35" },
  "dlnews": { emoji: "📊", color: "#00D4FF" },
  "cryptoslate": { emoji: "🗿", color: "#38B6FF" },
  "bitcoinmagazine": { emoji: "₿", color: "#F7931A" },
  "newsbtc": { emoji: "📈", color: "#FF9500" },
  "beincrypto": { emoji: "🐝", color: "#FFD700" },
  "cryptonews": { emoji: "📰", color: "#00BFFF" },
  "u.today": { emoji: "📅", color: "#6366F1" },
  "coingape": { emoji: "🦍", color: "#10B981" },
  "ambcrypto": { emoji: "💎", color: "#8B5CF6" },
  "cryptopotato": { emoji: "🥔", color: "#F59E0B" },
  "dailyhodl": { emoji: "🌊", color: "#0EA5E9" },
  "cryptobriefing": { emoji: "📋", color: "#EC4899" },
  "bitcoinist": { emoji: "⚡", color: "#F7931A" },
  // Business/Finance
  "bloomberg": { emoji: "📊", color: "#2800D7" },
  "reuters": { emoji: "🌐", color: "#FF8000" },
  "forbes": { emoji: "📰", color: "#C4122E" },
  "wsj": { emoji: "📰", color: "#0274B6" },
  "cnbc": { emoji: "📺", color: "#005594" },
  "yahoo": { emoji: "📰", color: "#6001D2" },
  // Default
  "default": { emoji: "📰", color: "#64748B" },
};

// Default config for unknown sources
const DEFAULT_SOURCE_CONFIG = { emoji: "📰", color: "#64748B" };

// Get source config by domain or name
function getSourceConfig(source: { title: string; domain: string }): { emoji: string; color: string } {
  const domain = source.domain?.toLowerCase().replace(/\.(com|co|io|org|net)$/, "").replace(/[.-]/g, "") || "";
  const title = source.title?.toLowerCase().replace(/\s+/g, "") || "";
  
  // Check domain first, then title
  for (const key of Object.keys(SOURCE_CONFIG)) {
    if (key !== "default" && (domain.includes(key) || title.includes(key))) {
      const config = SOURCE_CONFIG[key];
      if (config) return config;
    }
  }
  return DEFAULT_SOURCE_CONFIG;
}

// Get favicon URL for a domain
function getFaviconUrl(domain: string): string {
  if (!domain) return "";
  // Use Google's favicon service for reliable icons
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export function NewsReaderPanel() {
  const { readerState, refreshNews, setFilter, closePanel } =
    useNewsReader();

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const updateTime = () => setCurrentTime(Date.now());
    updateTime();
    const interval = setInterval(updateTime, 60_000);
    return () => clearInterval(interval);
  }, []);

  const filters: { key: NewsFilter; label: string; emoji: string }[] = [
    { key: "hot", label: "Hot", emoji: "🔥" },
    { key: "latest", label: "Latest", emoji: "⚡" },
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

  const handleImageError = (articleId: string) => {
    setImageErrors(prev => new Set(prev).add(articleId));
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoContainer}>
            <span className={styles.logoEmoji}>📰</span>
          </div>
          <div className={styles.headerTitle}>
          <h2 className={styles.title}>Crypto News</h2>
            <span className={styles.subtitle}>Real-time updates</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshButton}
            onClick={handleRefresh}
            disabled={readerState.isLoading}
            aria-label="Refresh news"
          >
            <span className={readerState.isLoading ? styles.spinning : ""}>🔄</span>
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
            <div className={styles.loadingSpinner}>
              <span className={styles.loadingIcon}>📡</span>
              <span>Fetching news...</span>
            </div>
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
                  🔄 Refresh News
                </button>
              </div>
            ) : (
              readerState.articles.map((article) => {
                const sourceConfig = getSourceConfig(article.source);
                const faviconUrl = getFaviconUrl(article.source.domain);
                const showFavicon = faviconUrl && !imageErrors.has(article.id);

                return (
                  <article key={article.id} className={styles.articleCard}>
                  <div className={styles.articleHeader}>
                    <div className={styles.articleSource}>
                        <div 
                          className={styles.sourceIcon}
                          style={{ 
                            backgroundColor: `${sourceConfig.color}20`,
                            borderColor: `${sourceConfig.color}40`
                          }}
                        >
                          {showFavicon ? (
                            <Image
                              src={faviconUrl}
                              alt={article.source.title}
                              width={16}
                              height={16}
                              className={styles.sourceFavicon}
                              onError={() => handleImageError(article.id)}
                              unoptimized
                            />
                          ) : (
                            <span className={styles.sourceEmoji}>{sourceConfig.emoji}</span>
                          )}
                        </div>
                        <div className={styles.sourceInfo}>
                          <span className={styles.sourceName}>
                            {article.source.title}
                          </span>
                          <span className={styles.articleTime}>
                          {formatTimeAgo(article.published_at)}
                          </span>
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
                        <span className={styles.sentimentEmoji}>
                          {getSentimentEmoji(article.votes)}
                        </span>
                        <span>{getSentimentLabel(article.votes)}</span>
                    </div>
                  </div>

                  <h3 className={styles.articleTitle}>{article.title}</h3>

                  {article.currencies && article.currencies.length > 0 && (
                    <div className={styles.currencies}>
                        {article.currencies.slice(0, 4).map((currency) => (
                        <span
                          key={currency.code}
                          className={styles.currencyTag}
                        >
                            {currency.code === "BTC" && "₿"}
                            {currency.code === "ETH" && "Ξ"}
                            {currency.code === "SOL" && "◎"}
                            {!["BTC", "ETH", "SOL"].includes(currency.code) && "●"}{" "}
                          {currency.code}
                        </span>
                      ))}
                        {article.currencies.length > 4 && (
                        <span className={styles.currencyMore}>
                            +{article.currencies.length - 4}
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
                        📖 Read Article
                        <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
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
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className={styles.footer}>
        <div className={styles.stats}>
          <span className={styles.statItem}>
            <span className={styles.statEmoji}>📊</span>
            {readerState.articles.length} articles
          </span>
          <span className={styles.statDivider}>•</span>
          <span className={styles.statItem}>
            <span className={styles.statEmoji}>⏱️</span>
            Auto-refresh: 5min
          </span>
        </div>
      </div>
    </div>
  );
}
