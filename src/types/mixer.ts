/**
 * Mixer privacy system type definitions
 * Defines commitment, deposit/withdraw params, and mixer state interfaces
 */

/**
 * Commitment object generated for a deposit into the mixer.
 * The secret must be stored securely and never shared.
 */
export interface MixerCommitment {
  /** 64-character hex string (32 bytes) used as the secret for withdrawal */
  secret: string;
  /** 32-byte hex hash commitment derived from the secret */
  commitment: string;
}

/**
 * Parameters required to perform a deposit into the mixer contract.
 */
export interface MixerDepositParams {
  /** Amount of native token to deposit (as a decimal string) */
  amount: string;
  /** Commitment hash (bytes32 hex string) */
  commitment: string;
}

/**
 * Parameters required to perform a withdrawal from the mixer contract.
 */
export interface MixerWithdrawParams {
  /** Secret associated with the original commitment (64-char hex) */
  secret: string;
  /** Recipient address to receive withdrawn funds */
  recipient: string;
}

/**
 * Local mixer state tracking deposits, withdrawals, and saved secrets.
 * Note: Secrets should be stored securely and never shared.
 */
export interface MixerState {
  /** Recorded deposits */
  deposits: Array<{
    commitment: string;
    amount: string;
    timestamp: number;
    txHash: string;
  }>;
  /** Recorded withdrawals */
  withdrawals: Array<{
    secret: string;
    recipient: string;
    amount: string;
    timestamp: number;
    txHash: string;
  }>;
  /** Saved secrets keyed by commitment for later retrieval */
  savedSecrets: Record<
    string,
    {
      commitment: string;
      amount: string;
      timestamp: number;
    }
  >;
}

export {};
