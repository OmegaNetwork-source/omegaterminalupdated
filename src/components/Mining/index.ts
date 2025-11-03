/**
 * Mining Components Barrel Export
 * Main export point for Mining components
 *
 * Exports:
 * - MiningStatus: Real-time mining status display
 * - StressTestStats: Network stress test statistics display
 *
 * Future mining components (MiningHistory, ContractStats, etc.)
 * will be exported from here as they are created in subsequent phases.
 */

export { MiningStatus } from "./MiningStatus";
export type { MiningStatusProps } from "./MiningStatus";

export { StressTestStats } from "./StressTestStats";
export type {
  StressTestStatsProps,
  StressTestStatsData,
} from "./StressTestStats";
