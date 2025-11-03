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

// Future game components can be exported here as they are implemented:
// export { CookieClicker } from './CookieClicker';
// export { PacManGame } from './PacManGame';
// export { BrickBreaker } from './BrickBreaker';
// export { PerfectCircle } from './PerfectCircle';
// export { SpeedClicker } from './SpeedClicker';
// export { NumberGuess } from './NumberGuess';
