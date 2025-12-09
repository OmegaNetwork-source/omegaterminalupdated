"use client";

/**
 * Prediction Chart Component
 * 
 * Interactive chart visualization for prediction market data.
 * Shows price history, outcomes distribution, and key metrics.
 */

import React, { useState, useMemo, useCallback } from "react";
import styles from "./PredictionChart.module.css";
import type { ParlayMarket, MarketOutcome, PriceHistoryPoint } from "@/types/parlay";

interface PredictionChartProps {
  market: ParlayMarket;
  onClose: () => void;
  onSelectOutcome?: (outcome: MarketOutcome) => void;
}

type TimeRange = "1H" | "6H" | "24H" | "7D" | "30D" | "ALL";

// Generate mock price history if not available
function generateMockHistory(market: ParlayMarket, days: number): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  const now = Date.now();
  const basePrice = market.yesPrice;
  const interval = (days * 24 * 60 * 60 * 1000) / 100; // 100 data points
  
  for (let i = 100; i >= 0; i--) {
    const timestamp = now - (i * interval);
    // Add some realistic variance
    const variance = (Math.random() - 0.5) * 0.15;
    const trendFactor = (100 - i) / 100 * 0.1; // Slight trend
    let price = basePrice + variance + trendFactor * (Math.random() > 0.5 ? 1 : -1);
    price = Math.max(0.01, Math.min(0.99, price)); // Clamp between 1-99%
    
    points.push({
      timestamp,
      price,
      volume: Math.random() * market.volume24h / 24,
    });
  }
  
  return points;
}

export function PredictionChart({
  market,
  onClose,
  onSelectOutcome,
}: PredictionChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [hoveredPoint, setHoveredPoint] = useState<PriceHistoryPoint | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);

  // Get price history based on time range
  const priceHistory = useMemo(() => {
    const rangeDays: Record<TimeRange, number> = {
      "1H": 1/24,
      "6H": 0.25,
      "24H": 1,
      "7D": 7,
      "30D": 30,
      "ALL": 90,
    };
    
    if (market.priceHistory && market.priceHistory.length > 0) {
      const cutoff = Date.now() - (rangeDays[timeRange] * 24 * 60 * 60 * 1000);
      return market.priceHistory.filter(p => p.timestamp >= cutoff);
    }
    
    return generateMockHistory(market, rangeDays[timeRange]);
  }, [market, timeRange]);

  // Calculate chart dimensions
  const chartWidth = 560;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const { minPrice, maxPrice, priceRange, path, areaPath } = useMemo(() => {
    if (priceHistory.length === 0) {
      return { minPrice: 0, maxPrice: 1, priceRange: 1, path: "", areaPath: "" };
    }

    const prices = priceHistory.map(p => p.price);
    const min = Math.max(0, Math.min(...prices) - 0.05);
    const max = Math.min(1, Math.max(...prices) + 0.05);
    const range = max - min || 0.1;

    // Generate SVG path
    const points = priceHistory.map((point, i) => {
      const x = padding.left + (i / (priceHistory.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - ((point.price - min) / range) * innerHeight;
      return { x, y, point };
    });

    const linePath = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    const area = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`;

    return { minPrice: min, maxPrice: max, priceRange: range, path: linePath, areaPath: area };
  }, [priceHistory, innerWidth, innerHeight, padding]);

  // Calculate price change
  const priceChange = useMemo(() => {
    if (priceHistory.length < 2) return { value: 0, percent: 0, isPositive: true };
    const first = priceHistory[0].price;
    const last = priceHistory[priceHistory.length - 1].price;
    const change = last - first;
    const percent = (change / first) * 100;
    return { value: change, percent, isPositive: change >= 0 };
  }, [priceHistory]);

  // Handle mouse move on chart
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - padding.left;
    const index = Math.round((x / innerWidth) * (priceHistory.length - 1));
    
    if (index >= 0 && index < priceHistory.length) {
      setHoveredPoint(priceHistory[index]);
    }
  }, [priceHistory, innerWidth, padding.left]);

  // Format price as percentage
  const formatPrice = (price: number) => `${(price * 100).toFixed(1)}%`;

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeRange === "1H" || timeRange === "6H") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.chartOverlay} onClick={onClose}>
      <div className={styles.chartContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>
            <span className={styles.venueTag}>
              {market.venue === "polymarket" ? "🟣" : "🟠"} {market.venue}
            </span>
            <h3>{market.question}</h3>
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {/* Current Price Summary */}
        <div className={styles.priceSummary}>
          <div className={styles.currentPrice}>
            <span className={styles.priceLabel}>Current</span>
            <span className={styles.priceValue}>{formatPrice(market.yesPrice)}</span>
          </div>
          <div className={`${styles.priceChange} ${priceChange.isPositive ? styles.positive : styles.negative}`}>
            <span>{priceChange.isPositive ? "▲" : "▼"}</span>
            <span>{Math.abs(priceChange.percent).toFixed(2)}%</span>
          </div>
          <div className={styles.volumeInfo}>
            <span className={styles.volumeLabel}>24h Vol</span>
            <span className={styles.volumeValue}>${(market.volume24h / 1000).toFixed(1)}K</span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className={styles.timeRangeSelector}>
          {(["1H", "6H", "24H", "7D", "30D", "ALL"] as TimeRange[]).map((range) => (
            <button
              key={range}
              className={`${styles.timeRangeButton} ${timeRange === range ? styles.active : ""}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className={styles.chartArea}>
          <svg
            width={chartWidth}
            height={chartHeight}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
            className={styles.chart}
          >
            {/* Gradient */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ffd6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00ffd6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <g key={pct}>
                <line
                  x1={padding.left}
                  y1={padding.top + innerHeight * (1 - pct)}
                  x2={padding.left + innerWidth}
                  y2={padding.top + innerHeight * (1 - pct)}
                  stroke="rgba(255,255,255,0.1)"
                  strokeDasharray="4,4"
                />
                <text
                  x={padding.left - 8}
                  y={padding.top + innerHeight * (1 - pct) + 4}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {formatPrice(minPrice + priceRange * pct)}
                </text>
              </g>
            ))}

            {/* Area fill */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Line */}
            <path
              d={path}
              fill="none"
              stroke="#00ffd6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hover indicator */}
            {hoveredPoint && (
              <g>
                <circle
                  cx={padding.left + (priceHistory.indexOf(hoveredPoint) / (priceHistory.length - 1)) * innerWidth}
                  cy={padding.top + innerHeight - ((hoveredPoint.price - minPrice) / priceRange) * innerHeight}
                  r="6"
                  fill="#00ffd6"
                  stroke="#0a121c"
                  strokeWidth="2"
                />
                <line
                  x1={padding.left + (priceHistory.indexOf(hoveredPoint) / (priceHistory.length - 1)) * innerWidth}
                  y1={padding.top}
                  x2={padding.left + (priceHistory.indexOf(hoveredPoint) / (priceHistory.length - 1)) * innerWidth}
                  y2={padding.top + innerHeight}
                  stroke="rgba(0,255,214,0.3)"
                  strokeDasharray="4,4"
                />
              </g>
            )}
          </svg>

          {/* Hover tooltip */}
          {hoveredPoint && (
            <div className={styles.tooltip}>
              <span className={styles.tooltipPrice}>{formatPrice(hoveredPoint.price)}</span>
              <span className={styles.tooltipTime}>{formatTime(hoveredPoint.timestamp)}</span>
            </div>
          )}
        </div>

        {/* Multi-Outcome Section */}
        {market.isMultiOutcome && market.outcomes && market.outcomes.length > 0 && (
          <div className={styles.outcomesSection}>
            <h4 className={styles.outcomesTitle}>All Outcomes</h4>
            <div className={styles.outcomesGrid}>
              {market.outcomes.map((outcome) => (
                <button
                  key={outcome.id}
                  className={`${styles.outcomeCard} ${selectedOutcome === outcome.id ? styles.selected : ""}`}
                  onClick={() => {
                    setSelectedOutcome(outcome.id);
                    onSelectOutcome?.(outcome);
                  }}
                >
                  <span className={styles.outcomeLabel}>{outcome.label}</span>
                  <span className={styles.outcomeProbability}>
                    {(outcome.probability * 100).toFixed(0)}%
                  </span>
                  <div className={styles.outcomePrices}>
                    <span className={styles.yesPrice}>Yes {(outcome.yesPrice * 100).toFixed(0)}¢</span>
                    <span className={styles.noPrice}>No {(outcome.noPrice * 100).toFixed(0)}¢</span>
                  </div>
                  <div className={styles.outcomeVolume}>
                    ${outcome.volume > 1000 ? `${(outcome.volume / 1000).toFixed(1)}K` : outcome.volume.toFixed(0)} Vol
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Binary Yes/No Display for simple markets */}
        {!market.isMultiOutcome && (
          <div className={styles.binaryOutcomes}>
            <div className={styles.binaryOutcome}>
              <span className={styles.binaryLabel}>YES</span>
              <div className={styles.binaryBar}>
                <div 
                  className={styles.binaryFill} 
                  style={{ width: `${market.yesPrice * 100}%`, background: '#4ade80' }}
                />
              </div>
              <span className={styles.binaryPrice}>{(market.yesPrice * 100).toFixed(1)}¢</span>
            </div>
            <div className={styles.binaryOutcome}>
              <span className={styles.binaryLabel}>NO</span>
              <div className={styles.binaryBar}>
                <div 
                  className={styles.binaryFill} 
                  style={{ width: `${market.noPrice * 100}%`, background: '#ef4444' }}
                />
              </div>
              <span className={styles.binaryPrice}>{(market.noPrice * 100).toFixed(1)}¢</span>
            </div>
          </div>
        )}

        {/* Market Info */}
        <div className={styles.marketInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Total Volume</span>
            <span className={styles.infoValue}>${(market.totalVolume / 1000).toFixed(1)}K</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Liquidity</span>
            <span className={styles.infoValue}>${(market.liquidity / 1000).toFixed(1)}K</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Ends</span>
            <span className={styles.infoValue}>
              {new Date(market.resolutionDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* View on Source */}
        <a
          href={market.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewSource}
        >
          View on {market.venue} →
        </a>
      </div>
    </div>
  );
}

export default PredictionChart;

