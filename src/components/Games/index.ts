/**
 * Games Components Barrel Export
 *
 * Main export point for Games components
 * Includes game modal, launcher, leaderboard display, and game implementations
 *
 * Note: Individual game components (CookieClicker, PacMan, BrickBreaker, etc.)
 * can be added here as they are created following the SnakeGame component pattern.
 * For Phase 13, we're creating the infrastructure and one example game (Snake).
 * Full game implementations will be added incrementally in future phases.
 */

export { GameModal } from "./GameModal";
export type { GameModalProps } from "./GameModal";

export { GameLauncher } from "./GameLauncher";
export type { GameLauncherProps } from "./GameLauncher";

export { LeaderboardDisplay } from "./LeaderboardDisplay";
export type { LeaderboardDisplayProps } from "./LeaderboardDisplay";

export { SnakeGame } from "./SnakeGame";
export type { SnakeGameProps } from "./SnakeGame";

export { NumberGuessingGame } from "./NumberGuessingGame";
export type { NumberGuessingGameProps } from "./NumberGuessingGame";

export { CookieClickerGame } from "./CookieClickerGame";
export type { CookieClickerGameProps } from "./CookieClickerGame";

export { SpeedClickerGame } from "./SpeedClickerGame";
export type { SpeedClickerGameProps } from "./SpeedClickerGame";

export { PacmanGame } from "./PacmanGame";
export type { PacmanGameProps } from "./PacmanGame";

export { BrickBreakerGame } from "./BrickBreakerGame";
export type { BrickBreakerGameProps } from "./BrickBreakerGame";

export { PerfectCircleGame } from "./PerfectCircleGame";
export type { PerfectCircleGameProps } from "./PerfectCircleGame";

export { BashidoGame } from "./BashidoGame";
export type { BashidoGameProps } from "./BashidoGame";

export { PGTanksGame } from "./PGTanksGame";
export type { PGTanksGameProps } from "./PGTanksGame";

export { YumiGame } from "./YumiGame";

export { GlobalGameModal } from "./GlobalGameModal";
