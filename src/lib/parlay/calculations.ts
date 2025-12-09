/**
 * Parlay Calculation Utilities
 * 
 * Core algorithms for calculating parlay odds, risk scores, and payouts.
 */

import type {
  ParlayLeg,
  ParlayLineup,
  ParlayMarket,
  ParlaySide,
  RiskMetrics,
  RiskLevel,
  ResolutionWindow,
  LeverageLevel,
} from '@/types/parlay';

// =============================================================================
// Odds Calculations
// =============================================================================

/**
 * Convert probability (0-1) to decimal odds
 * Example: 0.65 (65% probability) → 1.538 decimal odds
 */
export function probabilityToDecimalOdds(probability: number): number {
  if (probability <= 0 || probability >= 1) {
    throw new Error('Probability must be between 0 and 1 (exclusive)');
  }
  return 1 / probability;
}

/**
 * Convert decimal odds to probability
 * Example: 1.538 decimal odds → 0.65 (65% probability)
 */
export function decimalOddsToProbability(decimalOdds: number): number {
  if (decimalOdds <= 1) {
    throw new Error('Decimal odds must be greater than 1');
  }
  return 1 / decimalOdds;
}

/**
 * Get the effective odds for a leg based on side
 * YES side: price is the probability
 * NO side: (1 - price) is the probability
 */
export function getLegEffectiveProbability(price: number, side: ParlaySide): number {
  return side === 'yes' ? price : (1 - price);
}

/**
 * Calculate decimal odds for a single leg
 */
export function calculateLegDecimalOdds(price: number, side: ParlaySide): number {
  const effectiveProbability = getLegEffectiveProbability(price, side);
  // Clamp to avoid division by zero or negative odds
  const clampedProb = Math.max(0.01, Math.min(0.99, effectiveProbability));
  return probabilityToDecimalOdds(clampedProb);
}

/**
 * Calculate combined decimal odds for a parlay
 * CORRECT FORMULA: Multiply all individual leg decimal odds together
 * 
 * Example: 
 * - Leg 1: 50% probability → 1/0.50 = 2.0x odds
 * - Leg 2: 60% probability → 1/0.60 = 1.67x odds
 * - Combined: 2.0 × 1.67 = 3.34x odds (30% combined probability)
 * 
 * This is mathematically correct - we multiply decimal odds, not add them.
 */
export function calculateParlayOdds(legs: Array<{ price: number; side: ParlaySide }>): number {
  if (legs.length === 0) return 1;
  
  const combinedOdds = legs.reduce((acc, leg) => {
    const probability = getLegEffectiveProbability(leg.price, leg.side);
    // Decimal odds = 1 / probability
    const decimalOdds = 1 / Math.max(0.01, Math.min(0.99, probability));
    return acc * decimalOdds;
  }, 1);
  
  // Round to avoid floating point errors, but keep precision
  return Math.round(combinedOdds * 10000) / 10000;
}

/**
 * Calculate implied probability of entire parlay winning
 * CORRECT FORMULA: Multiply all probabilities together
 * 
 * This gives the TRUE probability that ALL legs win.
 */
export function calculateImpliedProbability(legs: Array<{ price: number; side: ParlaySide }>): number {
  if (legs.length === 0) return 1;
  
  const combinedProbability = legs.reduce((acc, leg) => {
    const probability = getLegEffectiveProbability(leg.price, leg.side);
    // Clamp to valid probability range
    const clampedProb = Math.max(0.01, Math.min(0.99, probability));
    return acc * clampedProb;
  }, 1);
  
  return Math.max(0.0001, Math.min(0.9999, combinedProbability));
}

/**
 * Calculate potential payout for a parlay
 * CORRECT FORMULA: stake × combined_decimal_odds
 * 
 * This returns total payout INCLUDING the stake.
 * Net profit = payout - stake
 */
export function calculatePotentialPayout(
  stake: number,
  totalOdds: number,
  leverage: LeverageLevel
): number {
  // For regular parlays, leverage = 1 (no leverage)
  // Only pools use leverage > 1
  const basePayout = stake * totalOdds;
  return basePayout * leverage;
}

/**
 * Calculate current value of a parlay based on current market prices
 * Uses the product of current probabilities relative to entry probabilities
 */
export function calculateCurrentValue(
  stake: number,
  leverage: LeverageLevel,
  legs: Array<{
    entryOdds: number;
    currentOdds: number;
    side: ParlaySide;
    status: string;
  }>
): number {
  if (legs.length === 0) return stake;
  
  let valueFactor = 1;
  
  for (const leg of legs) {
    if (leg.status === 'won') {
      // Won leg: full value realized
      valueFactor *= calculateLegDecimalOdds(leg.entryOdds, leg.side);
    } else if (leg.status === 'lost' || leg.status === 'cancelled') {
      // Lost/cancelled leg: parlay is bust
      return 0;
    } else if (leg.status === 'pending') {
      // Pending leg: value based on current odds vs entry odds
      const entryDecimalOdds = calculateLegDecimalOdds(leg.entryOdds, leg.side);
      const currentDecimalOdds = calculateLegDecimalOdds(leg.currentOdds, leg.side);
      
      // If odds improved (higher decimal odds), we're more likely to win
      // Current value = stake * (entry odds / current odds) for remaining probability
      const currentProbability = getLegEffectiveProbability(leg.currentOdds, leg.side);
      const entryProbability = getLegEffectiveProbability(leg.entryOdds, leg.side);
      
      // Value factor increases if current probability > entry probability
      valueFactor *= currentProbability / entryProbability * entryDecimalOdds;
    }
  }
  
  return stake * valueFactor * leverage;
}

// =============================================================================
// Risk Calculations
// =============================================================================

/**
 * Calculate correlation risk between markets
 * Higher score = more correlated = riskier
 */
export function calculateCorrelationRisk(legs: Array<{ category: string; venue: string }>): number {
  if (legs.length <= 1) return 0;
  
  // Count categories and venues
  const categories = new Map<string, number>();
  const venues = new Map<string, number>();
  
  for (const leg of legs) {
    categories.set(leg.category, (categories.get(leg.category) || 0) + 1);
    venues.set(leg.venue, (venues.get(leg.venue) || 0) + 1);
  }
  
  // Calculate category concentration
  let categoryRisk = 0;
  for (const count of categories.values()) {
    if (count > 1) {
      categoryRisk += (count - 1) * 5; // +5 for each additional market in same category
    }
  }
  
  // Calculate venue concentration
  let venueRisk = 0;
  for (const count of venues.values()) {
    if (count > legs.length * 0.8) {
      venueRisk += 5; // Penalty for having 80%+ on one venue
    }
  }
  
  // Cap at 30
  return Math.min(30, categoryRisk + venueRisk);
}

/**
 * Calculate time-based risk
 * Longer resolution windows = higher risk
 */
export function calculateTimeRisk(resolutionWindow: ResolutionWindow): number {
  const { durationDays, spreadDays } = resolutionWindow;
  
  let risk = 0;
  
  // Duration risk
  if (durationDays > 180) risk += 10;
  else if (durationDays > 90) risk += 7;
  else if (durationDays > 30) risk += 4;
  else if (durationDays > 7) risk += 2;
  
  // Spread risk (markets resolving at very different times)
  if (spreadDays > 90) risk += 10;
  else if (spreadDays > 30) risk += 6;
  else if (spreadDays > 7) risk += 3;
  
  // Cap at 20
  return Math.min(20, risk);
}

/**
 * Calculate leverage risk
 */
export function calculateLeverageRisk(leverage: LeverageLevel): number {
  // 1x = 0, 2x = 6, 3x = 12, 4x = 18, 5x = 25
  return (leverage - 1) * 6.25;
}

/**
 * Calculate liquidity risk based on market volumes
 */
export function calculateLiquidityRisk(legs: Array<{ volume24h: number }>): number {
  if (legs.length === 0) return 0;
  
  const avgVolume = legs.reduce((sum, leg) => sum + leg.volume24h, 0) / legs.length;
  
  // Higher volume = lower risk
  if (avgVolume > 1000000) return 0; // $1M+ daily volume = very liquid
  if (avgVolume > 500000) return 3;
  if (avgVolume > 100000) return 6;
  if (avgVolume > 50000) return 9;
  if (avgVolume > 10000) return 12;
  return 15; // Low liquidity
}

/**
 * Calculate leg count risk
 */
export function calculateLegCountRisk(legCount: number): number {
  // More legs = harder to win all
  if (legCount <= 2) return 0;
  if (legCount <= 4) return 3;
  if (legCount <= 6) return 6;
  if (legCount <= 8) return 8;
  return 10;
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'extreme';
}

/**
 * Calculate complete risk metrics for a parlay
 */
export function calculateRiskMetrics(
  legs: Array<{ category: string; venue: string; volume24h: number }>,
  resolutionWindow: ResolutionWindow,
  leverage: LeverageLevel
): RiskMetrics {
  const correlationRisk = calculateCorrelationRisk(legs);
  const timeRisk = calculateTimeRisk(resolutionWindow);
  const leverageRisk = calculateLeverageRisk(leverage);
  const liquidityRisk = calculateLiquidityRisk(legs);
  const legCountRisk = calculateLegCountRisk(legs.length);
  
  const score = Math.min(100, correlationRisk + timeRisk + leverageRisk + liquidityRisk + legCountRisk);
  const level = getRiskLevel(score);
  
  // Generate warnings and suggestions
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  if (correlationRisk > 15) {
    warnings.push('High market correlation detected');
    suggestions.push('Consider adding markets from different categories');
  }
  
  if (timeRisk > 10) {
    warnings.push('Long resolution window increases uncertainty');
    suggestions.push('Consider markets with closer resolution dates');
  }
  
  if (leverageRisk > 15) {
    warnings.push(`High leverage (${leverage}x) significantly increases risk`);
    suggestions.push('Consider reducing leverage for this parlay');
  }
  
  if (liquidityRisk > 10) {
    warnings.push('Some markets have low liquidity');
    suggestions.push('Low liquidity may affect execution and cashout');
  }
  
  if (legCountRisk > 5) {
    warnings.push(`${legs.length} legs makes winning unlikely`);
    suggestions.push('Consider reducing the number of legs');
  }
  
  return {
    score,
    level,
    correlationRisk,
    timeRisk,
    leverageRisk,
    liquidityRisk,
    legCountRisk,
    warnings,
    suggestions,
  };
}

// =============================================================================
// Resolution Window Calculations
// =============================================================================

/**
 * Calculate resolution window from leg resolution dates
 */
export function calculateResolutionWindow(legs: Array<{ resolutionDate: number }>): ResolutionWindow {
  if (legs.length === 0) {
    return {
      earliest: Date.now(),
      latest: Date.now(),
      durationDays: 0,
      spreadDays: 0,
    };
  }
  
  const dates = legs.map(l => l.resolutionDate).sort((a, b) => a - b);
  const earliest = dates[0];
  const latest = dates[dates.length - 1];
  
  const now = Date.now();
  const durationDays = Math.max(0, Math.ceil((latest - now) / (1000 * 60 * 60 * 24)));
  const spreadDays = Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24));
  
  return {
    earliest,
    latest,
    durationDays,
    spreadDays,
  };
}

// =============================================================================
// Cashout Calculations
// =============================================================================

/**
 * Check if a parlay can be cashed out
 */
export function canCashout(lineup: ParlayLineup): boolean {
  // Can't cashout if already resolved
  if (['won', 'lost', 'cancelled'].includes(lineup.status)) {
    return false;
  }
  
  // Can't cashout if any leg has lost
  if (lineup.legs.some(leg => leg.status === 'lost')) {
    return false;
  }
  
  // Can cashout if at least one leg is still pending and none have lost
  return lineup.legs.some(leg => leg.status === 'pending');
}

/**
 * Calculate cashout value
 * Uses current market prices to determine fair value
 */
export function calculateCashoutValue(
  stake: number,
  leverage: LeverageLevel,
  legs: ParlayLeg[],
  cashoutFee: number = 0.05 // 5% fee
): number {
  // Calculate current value
  const currentValue = calculateCurrentValue(stake, leverage, legs);
  
  // Apply cashout fee
  const cashoutValue = currentValue * (1 - cashoutFee);
  
  // Never pay out less than 0
  return Math.max(0, cashoutValue);
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate a parlay configuration
 */
export function validateParlay(config: {
  legs: Array<{ marketId: string; side: ParlaySide }>;
  stake: number;
  leverage: LeverageLevel;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate leg count
  if (config.legs.length < 2) {
    errors.push('Minimum 2 legs required for a parlay');
  }
  if (config.legs.length > 10) {
    errors.push('Maximum 10 legs allowed per parlay');
  }
  
  // Check for duplicate markets
  const marketIds = config.legs.map(l => l.marketId);
  const uniqueIds = new Set(marketIds);
  if (uniqueIds.size !== marketIds.length) {
    errors.push('Duplicate markets are not allowed');
  }
  
  // Validate stake
  if (config.stake <= 0) {
    errors.push('Stake must be greater than 0');
  }
  if (config.stake > 100000) {
    errors.push('Maximum stake is $100,000');
  }
  
  // Validate leverage
  if (![1, 2, 3, 4, 5].includes(config.leverage)) {
    errors.push('Leverage must be 1x, 2x, 3x, 4x, or 5x');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// Formatting Utilities
// =============================================================================

/**
 * Format odds for display
 */
export function formatOdds(decimalOdds: number): string {
  return `${decimalOdds.toFixed(2)}x`;
}

/**
 * Format probability for display
 */
export function formatProbability(probability: number): string {
  return `${(probability * 100).toFixed(1)}%`;
}

/**
 * Format currency for display
 */
export function formatParlayValue(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Format P&L with color indicator
 */
export function formatPnL(pnl: number, pnlPercent: number): { text: string; isPositive: boolean } {
  const sign = pnl >= 0 ? '+' : '';
  return {
    text: `${sign}$${Math.abs(pnl).toFixed(2)} (${sign}${pnlPercent.toFixed(1)}%)`,
    isPositive: pnl >= 0,
  };
}

/**
 * Format resolution date
 */
export function formatResolutionDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Resolved';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
  return date.toLocaleDateString();
}

