"use client";

/**
 * TransactionModal Component
 *
 * Provides transaction confirmation UI for wallet operations.
 * Displays transaction details and allows user to confirm or cancel.
 *
 * Note: This modal will be integrated with send command in future enhancement.
 * For now it's a standalone component that can be imported and used when needed.
 */

import React, { useState, useEffect } from "react";
import styles from "./TransactionModal.module.css";

export interface TransactionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when user closes the modal */
  onClose: () => void;
  /** Callback when user confirms the transaction */
  onConfirm: () => void;
  /** Transaction details to display */
  transactionDetails: {
    /** Recipient address */
    to: string;
    /** Amount to send */
    amount: string;
    /** Token symbol */
    symbol: string;
  };
  /** Whether transaction is being processed */
  isProcessing?: boolean;
}

/**
 * TransactionModal Component
 *
 * Provides UI for transaction confirmation with details display and user action buttons.
 *
 * @example
 * ```tsx
 * <TransactionModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onConfirm={handleConfirm}
 *   transactionDetails={{
 *     to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *     amount: "1.5",
 *     symbol: "OMEGA"
 *   }}
 *   isProcessing={isLoading}
 * />
 * ```
 */
export function TransactionModal({
  isOpen,
  onClose,
  onConfirm,
  transactionDetails,
  isProcessing = false,
}: TransactionModalProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isProcessing) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isProcessing, onClose]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Close modal when clicking on overlay (not on modal content)
    if (event.target === event.currentTarget && !isProcessing) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>Confirm Transaction</div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>To:</span>
            <span className={styles.detailValue}>{transactionDetails.to}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Amount:</span>
            <span className={styles.detailValue}>
              {transactionDetails.amount} {transactionDetails.symbol}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Network:</span>
            <span className={styles.detailValue}>Omega Network</span>
          </div>
        </div>

        <div className={styles.warning}>
          ⚠️ This transaction is irreversible. Please verify all details before
          confirming.
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles.confirmButton}`}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                Processing
                <span className={styles.loading}></span>
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
