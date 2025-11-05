/**
 * Forecast Scoring Utilities
 *
 * Utilities for calculating forecast accuracy, Brier scores, and battle results
 */

/**
 * Calculate Brier Score
 * Brier Score = (forecast - outcome)^2
 * Lower is better (0 = perfect, 1 = worst)
 */
export function calculateBrierScore(forecast: number, outcome: number): number {
  const error = forecast - outcome;
  return error * error;
}

/**
 * Check if forecast was correct (within 0.1 threshold)
 * For binary outcomes, checks if forecast is on the correct side of 0.5
 */
export function isForecastCorrect(
  forecast: number,
  outcome: number,
  threshold: number = 0.1
): boolean {
  return Math.abs(forecast - outcome) < threshold;
}

/**
 * Calculate accuracy score from Brier score
 * Converts Brier score (0-1, lower is better) to accuracy (0-1, higher is better)
 */
export function brierToAccuracy(brierScore: number): number {
  return Math.max(0, 1 - brierScore);
}

/**
 * Calculate battle score from rounds
 * Uses average Brier score converted to a 0-1000 point scale
 */
export function calculateBattleScore(
  rounds: Array<{ playerForecast: number; aiForecast: number; actualOutcome: number }>
): { playerScore: number; aiScore: number } {
  if (rounds.length === 0) {
    return { playerScore: 0, aiScore: 0 };
  }

  let playerBrierSum = 0;
  let aiBrierSum = 0;

  for (const round of rounds) {
    const playerBrier = calculateBrierScore(
      round.playerForecast,
      round.actualOutcome
    );
    const aiBrier = calculateBrierScore(
      round.aiForecast,
      round.actualOutcome
    );

    playerBrierSum += playerBrier;
    aiBrierSum += aiBrier;
  }

  const playerAvgBrier = playerBrierSum / rounds.length;
  const aiAvgBrier = aiBrierSum / rounds.length;

  // Convert to 0-1000 scale (lower Brier = higher score)
  const playerScore = Math.round(brierToAccuracy(playerAvgBrier) * 1000);
  const aiScore = Math.round(brierToAccuracy(aiAvgBrier) * 1000);

  return { playerScore, aiScore };
}

/**
 * Calculate XP reward based on battle performance
 */
export function calculateXPReward(
  playerScore: number,
  aiScore: number,
  difficulty: "easy" | "medium" | "hard"
): number {
  const baseXP = { easy: 50, medium: 100, hard: 200 };
  const difficultyMultiplier = baseXP[difficulty];

  if (playerScore > aiScore) {
    // Win bonus
    const winBonus = Math.floor((playerScore - aiScore) / 10);
    return difficultyMultiplier + winBonus;
  } else if (playerScore === aiScore) {
    // Tie
    return Math.floor(difficultyMultiplier * 0.5);
  } else {
    // Loss (still get some XP)
    return Math.floor(difficultyMultiplier * 0.3);
  }
}

/**
 * Calculate credit reward based on battle performance
 */
export function calculateCreditReward(
  playerScore: number,
  aiScore: number
): number {
  if (playerScore > aiScore) {
    // Win: 50-100 credits based on margin
    const margin = playerScore - aiScore;
    return 50 + Math.min(50, Math.floor(margin / 20));
  } else if (playerScore === aiScore) {
    // Tie: 25 credits
    return 25;
  } else {
    // Loss: 10 credits (consolation)
    return 10;
  }
}



