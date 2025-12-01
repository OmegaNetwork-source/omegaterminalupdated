/**
 * Forecast Arena AI Agents
 *
 * Defines AI agents that players can battle in PvE mode
 */

import type { AIAgent } from "@/types/forecast-arena";

export const AI_AGENTS: AIAgent[] = [
  {
    id: "neura-7",
    name: "NEURA-7",
    faction: "NEURA-7",
    difficulty: "hard",
    description: "The original prediction master. Calculates probabilities with quantum precision.",
    baseAccuracy: 0.82,
    specialties: ["crypto", "tech"],
  },
  {
    id: "beta-zero",
    name: "BETA-ZERO",
    faction: "BETA-ZERO",
    difficulty: "medium",
    description: "A balanced strategist. Adapts quickly to market conditions.",
    baseAccuracy: 0.75,
    specialties: ["politics", "culture"],
  },
  {
    id: "sigma-x",
    name: "SIGMA-X",
    faction: "SIGMA-X",
    difficulty: "hard",
    description: "Aggressive and unpredictable. Specializes in high-risk predictions.",
    baseAccuracy: 0.78,
    specialties: ["crypto", "shadow"],
  },
  {
    id: "echo-4",
    name: "ECHO-4",
    faction: "ECHO-4",
    difficulty: "easy",
    description: "A learning AI that improves with each battle. Good for beginners.",
    baseAccuracy: 0.68,
    specialties: ["tech", "culture"],
  },
  {
    id: "phi-void",
    name: "PHI-VOID",
    faction: "PHI-VOID",
    difficulty: "medium",
    description: "Mysterious and enigmatic. Masters the shadow markets.",
    baseAccuracy: 0.73,
    specialties: ["shadow", "politics"],
  },
];

/**
 * Get AI agent by ID
 */
export function getAgentById(id: string): AIAgent | undefined {
  return AI_AGENTS.find((agent) => agent.id === id);
}

/**
 * Get AI agents by faction
 */
export function getAgentsByFaction(faction: string): AIAgent[] {
  return AI_AGENTS.filter((agent) => agent.faction === faction);
}

/**
 * Get AI agents by difficulty
 */
export function getAgentsByDifficulty(
  difficulty: "easy" | "medium" | "hard"
): AIAgent[] {
  return AI_AGENTS.filter((agent) => agent.difficulty === difficulty);
}

/**
 * Generate AI forecast for a market
 * In a real implementation, this would use actual AI models
 * For now, it generates realistic-sounding forecasts based on agent's base accuracy
 */
export function generateAIForecast(
  agent: AIAgent,
  marketQuestion: string,
  sector: string
): number {
  // Base forecast on agent's accuracy and specialty
  const isSpecialty = agent.specialties.includes(sector);
  const specialtyBoost = isSpecialty ? 0.05 : 0;
  const baseAccuracy = agent.baseAccuracy + specialtyBoost;

  // Add some randomness but bias toward realistic predictions
  const randomFactor = (Math.random() - 0.5) * 0.3;
  const forecast = Math.max(
    0.1,
    Math.min(0.9, baseAccuracy + randomFactor)
  );

  return Math.round(forecast * 100) / 100;
}











