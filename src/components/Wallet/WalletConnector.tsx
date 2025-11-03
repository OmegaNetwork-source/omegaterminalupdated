"use client";

/**
 * WalletConnector Component
 *
 * Provides UI for wallet connection with three options:
 * 1. Connect MetaMask - Browser extension wallet
 * 2. Create Session Wallet - Ephemeral wallet for testing
 * 3. Import Wallet - Import using private key
 *
 * Displays wallet information when connected including address, balance, and type.
 */

import React, { useState, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/utils";
import { openNetworkSelector } from "@/lib/wallet/networkSelector";
import styles from "./WalletConnector.module.css";

export function WalletConnector() {
  const wallet = useWallet();
  const { state, createSessionWallet, importSessionWallet, disconnect } =
    wallet;

  // Local state
  const [showImport, setShowImport] = useState(false);
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info" | null
  >(null);

  /**
   * Handle MetaMask connection
   */
  const handleConnectMetaMask = useCallback(() => {
    setIsProcessing(true);
    setStatusMessage("Loading network selector…");
    setMessageType("info");

    openNetworkSelector({
      log: (message, type) => {
        setStatusMessage(message);
        if (type === "success" || type === "error" || type === "warning") {
          setMessageType(type);
        } else {
          setMessageType("info");
        }
      },
      wallet: {
        initializeExternalConnection: wallet.initializeExternalConnection,
        addOmegaNetwork: wallet.addOmegaNetwork,
        getBalance: wallet.getBalance,
        state,
      },
      source: "ui",
    });

    setIsProcessing(false);
  }, [state, wallet]);

  /**
   * Handle session wallet creation
   */
  const handleCreateSession = useCallback(async () => {
    setIsProcessing(true);
    setStatusMessage(null);

    const success = await createSessionWallet();

    if (success) {
      setStatusMessage(
        "Session wallet created! WARNING: Do not use for large amounts."
      );
      setMessageType("success");
    } else {
      setStatusMessage(state.error || "Failed to create session wallet");
      setMessageType("error");
    }

    setIsProcessing(false);
  }, [createSessionWallet, state.error]);

  /**
   * Handle wallet import
   */
  const handleImportWallet = useCallback(async () => {
    if (!privateKeyInput.trim()) {
      setStatusMessage("Please enter a private key");
      setMessageType("error");
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    const success = await importSessionWallet(privateKeyInput);

    if (success) {
      setStatusMessage("Wallet imported successfully!");
      setMessageType("success");
      setPrivateKeyInput("");
    } else {
      setStatusMessage(state.error || "Failed to import wallet");
      setMessageType("error");
    }

    setIsProcessing(false);
  }, [importSessionWallet, privateKeyInput, state.error]);

  /**
   * Handle disconnect
   */
  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setStatusMessage("Wallet disconnected");
    setMessageType("info");
    setPrivateKeyInput("");
    setShowImport(false);
  }, [disconnect]);

  // Render connected state
  if (state.isConnected && state.address) {
    return (
      <div className={styles.container}>
        <div className={styles.connected}>
          <div className={styles.walletInfo}>
            <span className={styles.walletType}>
              {state.type === "metamask"
                ? "MetaMask"
                : state.type === "session"
                ? "Session Wallet"
                : "Imported Wallet"}
            </span>
            <div className={styles.address}>
              {shortenAddress(state.address)}
            </div>
            {state.balance && (
              <div className={styles.balance}>
                {parseFloat(state.balance).toFixed(4)} OMEGA
              </div>
            )}
          </div>
          <button
            className={styles.disconnectButton}
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  // Render connection options
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Connect Wallet</h2>

      <div className={styles.options}>
        {/* MetaMask Option */}
        <div className={styles.optionCard}>
          <div className={styles.cardTitle}>
            <span>🦊</span>
            <span>MetaMask</span>
          </div>
          <p className={styles.cardDescription}>
            Connect your MetaMask wallet to interact with Omega Network
          </p>
          <button
            className={styles.connectButton}
            onClick={handleConnectMetaMask}
            disabled={state.isConnecting || isProcessing}
          >
            {state.isConnecting ? (
              <>
                <span className={styles.loading}></span> Connecting...
              </>
            ) : (
              "Connect MetaMask"
            )}
          </button>
        </div>

        {/* Session Wallet Option */}
        <div className={styles.optionCard}>
          <div className={styles.cardTitle}>
            <span>⚡</span>
            <span>Session Wallet</span>
          </div>
          <p className={styles.cardDescription}>
            Create a temporary wallet for testing and development
          </p>
          <button
            className={styles.connectButton}
            onClick={handleCreateSession}
            disabled={state.isConnecting || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className={styles.loading}></span> Creating...
              </>
            ) : (
              "Create New Wallet"
            )}
          </button>
          <p className={styles.warningText}>
            ⚠️ Session wallets are ephemeral. Do not use for large amounts or
            long-term storage.
          </p>
        </div>

        {/* Import Wallet Option */}
        <div className={styles.optionCard}>
          <div className={styles.cardTitle}>
            <span>🔑</span>
            <span>Import Wallet</span>
          </div>
          <p className={styles.cardDescription}>
            Import an existing wallet using your private key
          </p>

          {!showImport ? (
            <button
              className={styles.connectButton}
              onClick={() => setShowImport(true)}
              disabled={state.isConnecting || isProcessing}
            >
              Show Import Options
            </button>
          ) : (
            <div className={styles.importSection}>
              <input
                type="password"
                className={styles.input}
                placeholder="0x..."
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
                disabled={state.isConnecting || isProcessing}
              />
              <button
                className={styles.connectButton}
                onClick={handleImportWallet}
                disabled={
                  state.isConnecting || isProcessing || !privateKeyInput.trim()
                }
              >
                {isProcessing ? (
                  <>
                    <span className={styles.loading}></span> Importing...
                  </>
                ) : (
                  "Import Wallet"
                )}
              </button>
              <button
                className={styles.connectButton}
                onClick={() => setShowImport(false)}
                disabled={state.isConnecting || isProcessing}
              >
                Cancel
              </button>
            </div>
          )}

          <p className={styles.warningText}>
            ⚠️ Never share your private key. Keep it secure and confidential.
          </p>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`${styles.statusMessage} ${
            messageType === "success"
              ? styles.statusSuccess
              : messageType === "error"
              ? styles.statusError
              : styles.statusInfo
          }`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
}
