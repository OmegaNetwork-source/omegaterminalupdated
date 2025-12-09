"use client";

/**
 * Forecast Arena Game Component
 *
 * Main game component for Omega Forecast Arena
 * Combines prediction battles, faction wars, and mini-games
 */

import React, { useState, useEffect, useCallback } from "react";
import styles from "./ForecastArenaGame.module.css";
import {
  getPlayerState,
  addXP,
  addCredits,
  spendCredits,
  updateForecastStats,
  updateBattleResult,
  completeDailyGauntlet,
  getDailyGauntletState,
  setFaction,
  getFactionStats,
  addFactionControlPoints,
  incrementFactionMembers,
} from "@/lib/games/forecast-arena-state";
import { FACTIONS, SECTORS, type FactionName, type Sector } from "@/types/forecast-arena";
import { AI_AGENTS, getAgentById, generateAIForecast } from "@/lib/games/forecast-arena-agents";
import { openLootBox, rewardToInventoryItem, type LootBoxTier } from "@/lib/games/forecast-arena-loot";
import { addInventoryItem } from "@/lib/games/forecast-arena-state";
import {
  calculateBattleScore,
  calculateXPReward,
  calculateCreditReward,
} from "@/lib/utils/forecast-scoring";
import type { AIAgent, PredictionRound, BattleResult as BattleResultType } from "@/types/forecast-arena";

export interface ForecastArenaGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

type GameMode = "menu" | "solo" | "duel" | "gauntlet" | "faction" | "loot" | "mystery" | "howtoplay";

// Mock markets for prediction rounds
const MOCK_MARKETS = [
  { question: "Will Bitcoin reach $100k by end of 2025?", sector: "crypto" },
  { question: "Will AI achieve AGI before 2030?", sector: "tech" },
  { question: "Will there be a major recession in 2025?", sector: "politics" },
  { question: "Will quantum computers break RSA-2048 by 2030?", sector: "tech" },
  { question: "Will Ethereum's market cap exceed Bitcoin's in 2025?", sector: "crypto" },
  { question: "Will a major social media platform be banned in the US in 2025?", sector: "politics" },
  { question: "Will VR headsets achieve 50% household penetration by 2030?", sector: "tech" },
  { question: "Will decentralized social networks gain 100M+ users by 2026?", sector: "crypto" },
];

export function ForecastArenaGame({
  onScoreUpdate,
  onGameEnd,
}: ForecastArenaGameProps) {
  const [gameMode, setGameMode] = useState<GameMode>("menu");
  const [playerState, setPlayerState] = useState(getPlayerState());
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<PredictionRound[]>([]);
  const [playerForecast, setPlayerForecast] = useState<number>(50);
  const [battleResult, setBattleResult] = useState<BattleResultType | null>(null);
  const [gauntletScore, setGauntletScore] = useState(0);
  const [gauntletRounds, setGauntletRounds] = useState<PredictionRound[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [lootBoxReward, setLootBoxReward] = useState<any>(null);
  const [selectedHowToPlay, setSelectedHowToPlay] = useState<GameMode | null>(null);
  const [factionStats, setFactionStats] = useState(getFactionStats());
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  // Refresh player state
  const refreshPlayerState = useCallback(() => {
    const state = getPlayerState();
    setPlayerState(state);
    onScoreUpdate(state.xp);
    setFactionStats(getFactionStats());
  }, [onScoreUpdate]);

  useEffect(() => {
    refreshPlayerState();
  }, [refreshPlayerState]);

  // Initialize battle with AI agent
  const initializeBattle = useCallback((agent: AIAgent | null) => {
    if (!agent) return;

    // Generate 3-5 rounds
    const numRounds = 3 + Math.floor(Math.random() * 3);
    const newRounds: PredictionRound[] = [];

    for (let i = 0; i < numRounds; i++) {
      const market = MOCK_MARKETS[Math.floor(Math.random() * MOCK_MARKETS.length)]!;
      const aiForecast = generateAIForecast(agent, market.question, market.sector);

      newRounds.push({
        marketId: `market_${i}`,
        question: market.question,
        playerForecast: null,
        aiForecast,
        actualOutcome: null,
        sector: market.sector,
        timestamp: Date.now(),
      });
    }

    setRounds(newRounds);
    setCurrentRound(0);
    setPlayerForecast(50);
  }, []);

  // Initialize gauntlet
  const initializeGauntlet = useCallback(() => {
    const gauntletState = getDailyGauntletState();
    if (gauntletState.completed) {
      alert("Daily gauntlet already completed! Come back tomorrow.");
      setGameMode("menu");
      return;
    }

    // Generate 10 rounds
    const newRounds: PredictionRound[] = [];
    for (let i = 0; i < 10; i++) {
      const market = MOCK_MARKETS[Math.floor(Math.random() * MOCK_MARKETS.length)]!;
      newRounds.push({
        marketId: `gauntlet_${i}`,
        question: market.question,
        playerForecast: null,
        aiForecast: 0.5, // Not used in gauntlet
        actualOutcome: null,
        sector: market.sector,
        timestamp: Date.now(),
      });
    }

    setGauntletRounds(newRounds);
    setCurrentRound(0);
    setPlayerForecast(50);
    setTimeRemaining(60);
    setGauntletScore(0);
  }, []);

  // Handle menu selection
  const handleModeSelect = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setBattleResult(null);
    setCurrentRound(0);
    setRounds([]);
    setGauntletRounds([]);
    setGauntletScore(0);
    setLootBoxReward(null);

    if (mode === "solo") {
      // Start solo battle - select first agent by default
      setSelectedAgent(AI_AGENTS[0] || null);
      initializeBattle(AI_AGENTS[0] || null);
    } else if (mode === "gauntlet") {
      initializeGauntlet();
    }
  }, [initializeBattle, initializeGauntlet]);

  // Listen for custom events to open specific modes
  useEffect(() => {
    const handleOpenGame = (event: CustomEvent) => {
      const { mode } = event.detail || {};
      if (mode) {
        if (mode === "gauntlet") {
          handleModeSelect("gauntlet");
        } else if (mode === "ai" || mode === "solo") {
          handleModeSelect("solo");
        } else if (mode === "loot") {
          handleModeSelect("loot");
        } else if (mode === "faction") {
          handleModeSelect("faction");
        }
      }
    };

    window.addEventListener("omega:openGame" as any, handleOpenGame as EventListener);
    return () => {
      window.removeEventListener("omega:openGame" as any, handleOpenGame as EventListener);
    };
  }, [handleModeSelect]);


  // Handle forecast submission
  const handleForecastSubmit = () => {
    if (gameMode === "solo" && selectedAgent) {
      // Solo battle round
      const round = rounds[currentRound];
      if (!round) return;

      // Generate actual outcome (simulated - in real game, this would come from market resolution)
      const actualOutcome = Math.random() > 0.5 ? 1 : 0;

      const updatedRound: PredictionRound = {
        ...round,
        playerForecast: playerForecast / 100,
        actualOutcome,
      };

      const newRounds = [...rounds];
      newRounds[currentRound] = updatedRound;
      setRounds(newRounds);

      // Move to next round or finish battle
      if (currentRound < rounds.length - 1) {
        setCurrentRound(currentRound + 1);
        setPlayerForecast(50);
      } else {
        finishBattle(newRounds);
      }
    } else if (gameMode === "gauntlet") {
      // Gauntlet round
      const round = gauntletRounds[currentRound];
      if (!round) return;

      const actualOutcome = Math.random() > 0.5 ? 1 : 0;
      const isCorrect = Math.abs(playerForecast / 100 - actualOutcome) < 0.1;

      const updatedRound: PredictionRound = {
        ...round,
        playerForecast: playerForecast / 100,
        actualOutcome,
      };

      const newRounds = [...gauntletRounds];
      newRounds[currentRound] = updatedRound;
      setGauntletRounds(newRounds);

      if (isCorrect) {
        setGauntletScore(gauntletScore + 100);
      }

      // Move to next round or finish gauntlet
      if (currentRound < gauntletRounds.length - 1) {
        setCurrentRound(currentRound + 1);
        setPlayerForecast(50);
        setTimeRemaining(60);
      } else {
        finishGauntlet(newRounds);
      }
    }
  };

  // Finish battle and calculate results
  const finishBattle = (completedRounds: PredictionRound[]) => {
    const roundsWithOutcomes = completedRounds.filter((r) => r.actualOutcome !== null);
    const { playerScore, aiScore } = calculateBattleScore(
      roundsWithOutcomes.map((r) => ({
        playerForecast: r.playerForecast || 0,
        aiForecast: r.aiForecast,
        actualOutcome: r.actualOutcome || 0,
      }))
    );

    const won = playerScore > aiScore;
    const difficulty = selectedAgent?.difficulty || "medium";
    const xpEarned = calculateXPReward(playerScore, aiScore, difficulty);
    const creditsEarned = calculateCreditReward(playerScore, aiScore);

    // Award rewards
    addXP(xpEarned);
    addCredits(creditsEarned);
    updateBattleResult(won);

    // Update forecast stats
    roundsWithOutcomes.forEach((round) => {
      if (round.actualOutcome !== null && round.playerForecast !== null) {
        const isCorrect = Math.abs(round.playerForecast - round.actualOutcome) < 0.1;
        updateForecastStats(isCorrect);
      }
    });

    const result: BattleResultType = {
      rounds: completedRounds,
      playerScore,
      aiScore,
      winner: won ? "player" : playerScore === aiScore ? "tie" : "ai",
      xpEarned,
      creditsEarned,
    };

    setBattleResult(result);
    refreshPlayerState();
  };

  // Finish gauntlet
  const finishGauntlet = (completedRounds: PredictionRound[]) => {
    const roundsWithOutcomes = completedRounds.filter((r) => r.actualOutcome !== null);
    const correctCount = roundsWithOutcomes.filter(
      (r) => r.playerForecast !== null && Math.abs(r.playerForecast - (r.actualOutcome || 0)) < 0.1
    ).length;

    const xpEarned = correctCount * 50 + (correctCount === 10 ? 500 : 0); // Bonus for perfect
    const creditsEarned = correctCount * 25;

    addXP(xpEarned);
    addCredits(creditsEarned);
    completeDailyGauntlet(gauntletScore);

    refreshPlayerState();
    setGameMode("menu");
  };

  // Handle faction join
  const handleJoinFaction = (faction: FactionName) => {
    const oldFaction = playerState.faction;
    setFaction(faction);
    incrementFactionMembers(faction);
    refreshPlayerState();
    
    if (oldFaction) {
      alert(`Left ${oldFaction} and joined ${faction}!`);
    } else {
      alert(`Joined ${faction}!`);
    }
  };

  // Handle sector contribution
  const handleContributeToSector = (sector: Sector) => {
    if (!playerState.faction) {
      alert("You must join a faction first!");
      return;
    }

    // Generate a prediction round for contribution
    const market = MOCK_MARKETS.find(m => m.sector === sector) || MOCK_MARKETS[0]!;
    
    // In a real game, this would be a prediction battle
    // For now, simulate contribution based on player's accuracy
    const accuracy = playerState.stats.totalForecasts > 0
      ? playerState.stats.correctForecasts / playerState.stats.totalForecasts
      : 0.5;

    const points = Math.floor(10 + accuracy * 20);
    addFactionControlPoints(playerState.faction as FactionName, sector, points);
    addXP(Math.floor(points / 2));
    addCredits(Math.floor(points / 5));
    
    refreshPlayerState();
    alert(`Contributed ${points} control points to ${sector} sector!`);
  };

  // Handle loot box opening
  const handleOpenLootBox = (tier: LootBoxTier) => {
    const state = getPlayerState();
    const config = { bronze: 100, silver: 250, gold: 500, omega: 1000 }[tier];

    if (state.credits < config) {
      alert(`Insufficient credits! Need ${config}, have ${state.credits}`);
      return;
    }

    if (!spendCredits(config)) {
      return;
    }

    const reward = openLootBox(tier);
    const inventoryItem = rewardToInventoryItem(reward);
    addInventoryItem(inventoryItem);

    // Apply reward immediately if applicable
    if (reward.type === "credits") {
      addCredits(reward.value);
    } else if (reward.type === "xp_boost") {
      // Store as inventory item for use in next battle
    }

    setLootBoxReward(reward);
    refreshPlayerState();
  };

  // Render menu screen
  const renderMenu = () => {
    return (
      <div className={styles.menu}>
        <div className={styles.header}>
          <h1>🔮 OMEGA FORECAST ARENA</h1>
          <div className={styles.stats}>
            <div>Level {playerState.level}</div>
            <div>XP: {playerState.xp}</div>
            <div>Credits: {playerState.credits}</div>
            {playerState.faction && <div>Faction: {playerState.faction}</div>}
          </div>
        </div>

        <div className={styles.modeGrid}>
          <div className={styles.modeCard}>
            <button
              className={styles.modeButton}
              onClick={() => handleModeSelect("solo")}
            >
              <div className={styles.modeIcon}>⚔️</div>
              <div className={styles.modeTitle}>Solo PvE</div>
              <div className={styles.modeDesc}>Battle AI agents</div>
            </button>
            <button
              className={styles.howToPlayButton}
              onClick={() => setSelectedHowToPlay("solo")}
              title="How to Play"
            >
              ?
            </button>
          </div>

          <div className={styles.modeCard}>
            <button
              className={styles.modeButton}
              onClick={() => handleModeSelect("gauntlet")}
            >
              <div className={styles.modeIcon}>🔥</div>
              <div className={styles.modeTitle}>Prediction Gauntlet</div>
              <div className={styles.modeDesc}>Daily challenge</div>
            </button>
            <button
              className={styles.howToPlayButton}
              onClick={() => setSelectedHowToPlay("gauntlet")}
              title="How to Play"
            >
              ?
            </button>
          </div>

          <div className={styles.modeCard}>
            <button
              className={styles.modeButton}
              onClick={() => handleModeSelect("loot")}
            >
              <div className={styles.modeIcon}>📦</div>
              <div className={styles.modeTitle}>Loot Boxes</div>
              <div className={styles.modeDesc}>Open rewards</div>
            </button>
            <button
              className={styles.howToPlayButton}
              onClick={() => setSelectedHowToPlay("loot")}
              title="How to Play"
            >
              ?
            </button>
          </div>

          <div className={styles.modeCard}>
            <button
              className={styles.modeButton}
              onClick={() => handleModeSelect("faction")}
            >
              <div className={styles.modeIcon}>🏛️</div>
              <div className={styles.modeTitle}>Faction Wars</div>
              <div className={styles.modeDesc}>Join a faction</div>
            </button>
            <button
              className={styles.howToPlayButton}
              onClick={() => setSelectedHowToPlay("faction")}
              title="How to Play"
            >
              ?
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render how to play screen
  const renderHowToPlay = () => {
    const howToPlayContent: Record<string, { title: string; steps: string[]; tips?: string[] }> = {
      solo: {
        title: "Solo PvE - Battle AI Agents",
        steps: [
          "Select an AI agent to battle (NEURA-7, BETA-ZERO, SIGMA-X, ECHO-4, or PHI-VOID)",
          "Face 3-5 prediction rounds against the AI",
          "Make your forecast for each market (0-100% probability)",
          "Compare your accuracy against the AI's forecast",
          "Win battles to earn XP and credits",
          "Higher difficulty agents give better rewards"
        ],
        tips: [
          "Study each agent's specialties - they're better in certain sectors",
          "Your accuracy improves with practice",
          "Winning battles increases your streak and rewards"
        ]
      },
      gauntlet: {
        title: "Prediction Gauntlet - Daily Challenge",
        steps: [
          "Complete 10 prediction rounds with 60 seconds each",
          "Make accurate forecasts to score points",
          "Each correct prediction earns 100 points",
          "Perfect run (10/10) earns bonus XP (500 XP)",
          "Can only play once per day",
          "Daily reset at midnight"
        ],
        tips: [
          "Focus on markets you understand",
          "Time management is key - don't overthink",
          "Build your streak for better rewards"
        ]
      },
      loot: {
        title: "Loot Boxes - Mystery Rewards",
        steps: [
          "Spend credits to open loot boxes",
          "Four tiers: Bronze (100), Silver (250), Gold (500), Omega (1000)",
          "Higher tiers have better reward chances",
          "Rewards include: Credits, XP Boosts, Cosmetics, Lore Fragments",
          "Rewards are added to your inventory automatically",
          "Credits and XP boosts are applied immediately"
        ],
        tips: [
          "Save up for higher tier boxes for better rewards",
          "XP boosts help level up faster",
          "Lore fragments unlock Omega Terminal stories"
        ]
      },
      faction: {
        title: "Faction Wars - Team Competition",
        steps: [
          "Join one of five factions: NEURA-7, BETA-ZERO, SIGMA-X, ECHO-4, or PHI-VOID",
          "Contribute to territory control by making predictions",
          "Five sectors: Tech, Crypto, Politics, Culture, Shadow",
          "Earn control points based on your forecast accuracy",
          "Your faction competes for control of each sector",
          "Weekly leaderboards show faction rankings"
        ],
        tips: [
          "Join a faction early to maximize contributions",
          "Focus on sectors where your faction needs help",
          "Better accuracy = more control points",
          "Team up with faction members for better results"
        ]
      }
    };

    const content = selectedHowToPlay ? howToPlayContent[selectedHowToPlay] : null;

    if (!content) {
      return renderMenu();
    }

    return (
      <div className={styles.howToPlay}>
        <h2>{content.title}</h2>
        <div className={styles.howToPlayContent}>
          <div className={styles.stepsSection}>
            <h3>How to Play:</h3>
            <ol>
              {content.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
          {content.tips && (
            <div className={styles.tipsSection}>
              <h3>Tips:</h3>
              <ul>
                {content.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button onClick={() => { setSelectedHowToPlay(null); }}>Back</button>
        <button onClick={() => { setSelectedHowToPlay(null); handleModeSelect(selectedHowToPlay); }}>
          Start Playing
        </button>
      </div>
    );
  };

  // Render solo battle
  const renderSoloBattle = () => {
    if (!selectedAgent) {
      return renderMenu();
    }

    if (battleResult) {
      return (
        <div className={styles.battleResult}>
          <h2>Battle Complete!</h2>
          <div className={styles.resultStats}>
            <div>Your Score: {battleResult.playerScore}</div>
            <div>AI Score: {battleResult.aiScore}</div>
            <div>Winner: {battleResult.winner === "player" ? "You!" : battleResult.winner === "ai" ? "AI" : "Tie"}</div>
            <div>XP Earned: {battleResult.xpEarned}</div>
            <div>Credits Earned: {battleResult.creditsEarned}</div>
          </div>
          <button onClick={() => setGameMode("menu")}>Back to Menu</button>
        </div>
      );
    }

    const round = rounds[currentRound];
    if (!round) {
      return renderMenu();
    }

    return (
      <div className={styles.battle}>
        <div className={styles.battleHeader}>
          <h2>Battle vs {selectedAgent.name}</h2>
          <div>Round {currentRound + 1} / {rounds.length}</div>
        </div>

        <div className={styles.marketQuestion}>
          <h3>{round.question}</h3>
          <div className={styles.sector}>Sector: {round.sector}</div>
        </div>

        <div className={styles.forecastInput}>
          <label>Your Forecast: {playerForecast}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={playerForecast}
            onChange={(e) => setPlayerForecast(Number(e.target.value))}
          />
          <div className={styles.aiForecast}>
            AI Forecast: {Math.round(round.aiForecast * 100)}%
          </div>
        </div>

        <button onClick={handleForecastSubmit}>Submit Forecast</button>
      </div>
    );
  };

  // Render gauntlet
  const renderGauntlet = () => {
    const round = gauntletRounds[currentRound];
    if (!round) {
      return renderMenu();
    }

    return (
      <div className={styles.gauntlet}>
        <div className={styles.gauntletHeader}>
          <h2>Prediction Gauntlet</h2>
          <div>Round {currentRound + 1} / 10</div>
          <div>Time: {timeRemaining}s</div>
          <div>Score: {gauntletScore}</div>
        </div>

        <div className={styles.marketQuestion}>
          <h3>{round.question}</h3>
        </div>

        <div className={styles.forecastInput}>
          <label>Your Forecast: {playerForecast}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={playerForecast}
            onChange={(e) => setPlayerForecast(Number(e.target.value))}
          />
        </div>

        <button onClick={handleForecastSubmit}>Submit</button>
      </div>
    );
  };

  // Render loot box screen
  const renderLootBoxes = () => {
    if (lootBoxReward) {
      return (
        <div className={styles.lootReward}>
          <h2>Loot Box Opened!</h2>
          <div className={styles.rewardDetails}>
            <div>{lootBoxReward.name}</div>
            <div>{lootBoxReward.description}</div>
            <div>Value: {lootBoxReward.value}</div>
          </div>
          <button onClick={() => { setLootBoxReward(null); setGameMode("menu"); }}>Back</button>
        </div>
      );
    }

    return (
      <div className={styles.lootBoxes}>
        <h2>Loot Boxes</h2>
        <div className={styles.lootGrid}>
          {(["bronze", "silver", "gold", "omega"] as LootBoxTier[]).map((tier) => {
            const costs = { bronze: 100, silver: 250, gold: 500, omega: 1000 };
            return (
              <button
                key={tier}
                className={styles.lootButton}
                onClick={() => handleOpenLootBox(tier)}
                disabled={playerState.credits < costs[tier]}
              >
                <div className={styles.lootTier}>{tier.toUpperCase()}</div>
                <div className={styles.lootCost}>{costs[tier]} credits</div>
              </button>
            );
          })}
        </div>
        <button onClick={() => setGameMode("menu")}>Back</button>
      </div>
    );
  };

  // Render faction screen
  const renderFaction = () => {
    const currentFactionStats = playerState.faction ? factionStats[playerState.faction as FactionName] : null;

    return (
      <div className={styles.faction}>
        <div className={styles.factionHeader}>
          <h2>Faction Wars</h2>
          {playerState.faction && (
            <div className={styles.currentFaction}>
              Your Faction: <strong>{playerState.faction}</strong>
            </div>
          )}
        </div>

        {!playerState.faction ? (
          <div className={styles.factionJoin}>
            <h3>Join a Faction</h3>
            <p>Choose a faction to compete for territory control:</p>
            <div className={styles.factionGrid}>
              {FACTIONS.map((faction) => {
                const stats = factionStats[faction as FactionName];
                if (!stats) return null;
                return (
                  <button
                    key={faction}
                    className={styles.factionButton}
                    onClick={() => handleJoinFaction(faction as FactionName)}
                  >
                    <div className={styles.factionName}>{faction}</div>
                    <div className={styles.factionStats}>
                      <div>Members: {stats.members}</div>
                      <div>CP: {stats.controlPoints}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={styles.factionPlay}>
            <div className={styles.factionInfo}>
              <h3>{playerState.faction} Status</h3>
              {currentFactionStats && (
                <div className={styles.factionStatsDisplay}>
                  <div>Members: {currentFactionStats.members}</div>
                  <div>Total Control Points: {currentFactionStats.controlPoints}</div>
                </div>
              )}
            </div>

            <div className={styles.territoryControl}>
              <h3>Contribute to Territory Control</h3>
              <p>Select a sector to make predictions and earn control points:</p>
              <div className={styles.sectorGrid}>
                {SECTORS.map((sector) => {
                  const points = currentFactionStats?.territories[sector] || 0;
                  return (
                    <button
                      key={sector}
                      className={styles.sectorButton}
                      onClick={() => handleContributeToSector(sector)}
                    >
                      <div className={styles.sectorName}>{sector.toUpperCase()}</div>
                      <div className={styles.sectorPoints}>{points} CP</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.factionLeaderboard}>
              <h3>Faction Rankings</h3>
              <div className={styles.leaderboardList}>
                {Object.values(factionStats)
                  .sort((a, b) => b.controlPoints - a.controlPoints)
                  .map((faction, index) => (
                    <div
                      key={faction.name}
                      className={`${styles.leaderboardItem} ${faction.name === playerState.faction ? styles.currentFactionItem : ""}`}
                    >
                      <div className={styles.rank}>#{index + 1}</div>
                      <div className={styles.factionName}>{faction.name}</div>
                      <div className={styles.leaderboardStats}>
                        <span>{faction.members} members</span>
                        <span>{faction.controlPoints} CP</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <button
              className={styles.leaveFactionButton}
              onClick={() => {
                if (confirm("Leave your faction?")) {
                  setFaction(null);
                  refreshPlayerState();
                }
              }}
            >
              Leave Faction
            </button>
          </div>
        )}

        <button onClick={() => setGameMode("menu")}>Back to Menu</button>
      </div>
    );
  };

  // Main render
  if (selectedHowToPlay) {
    return renderHowToPlay();
  }

  switch (gameMode) {
    case "solo":
      return renderSoloBattle();
    case "gauntlet":
      return renderGauntlet();
    case "loot":
      return renderLootBoxes();
    case "faction":
      return renderFaction();
    default:
      return renderMenu();
  }
}

