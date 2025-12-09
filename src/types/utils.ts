/**
 * Utility Function Type Definitions
 * Type definitions for utility functions used throughout the application
 */

/**
 * Mixer commitment object containing secret and commitment hash
 */
export interface MixerCommitment {
  /** Random secret used for commitment */
  secret: string;
  /** Keccak256 hash of the secret */
  commitment: string;
}

/**
 * Result of base58 decoding operation
 */
export type Base58DecodeResult = Uint8Array;
