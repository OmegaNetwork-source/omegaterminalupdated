"use client";

/**
 * PGTanks Game Component
 * 
 * Now uses Ravaged Planet (Scorched Earth clone) game
 * Original simple tank game replaced with full-featured artillery game
 */

import React from "react";
import { RavagedPlanetGame } from "./RavagedPlanetGame";

export interface PGTanksGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

/**
 * PGTanks Game - Now powered by Ravaged Planet
 * A full-featured Scorched Earth-style artillery game
 */
export function PGTanksGame(props: PGTanksGameProps) {
  return <RavagedPlanetGame {...props} />;
}

