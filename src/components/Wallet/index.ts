/**
 * Wallet Components Barrel Export
 *
 * Main export point for Wallet components.
 *
 * Current exports:
 * - WalletConnector: Main wallet connection UI component
 * - TransactionModal: Transaction confirmation modal for wallet operations
 *
 * Future wallet components (WalletStatus, WalletBalance, etc.)
 * will be exported from here as they are created in subsequent phases.
 */

export { WalletConnector } from "./WalletConnector";
export { TransactionModal } from "./TransactionModal";
export type { TransactionModalProps } from "./TransactionModal";
