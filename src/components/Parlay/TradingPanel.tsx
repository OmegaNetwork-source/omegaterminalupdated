"use client";

/**
 * Trading Panel Component
 * 
 * A modern trading interface for prediction markets,
 * styled like Kalshi/Polymarket for intuitive trading.
 */

import React, { useState, useCallback, useMemo } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useAppKitAccount } from "@reown/appkit/react";
import { appKitInstance } from "../../../context";
import styles from "./TradingPanel.module.css";
import type { ParlayMarket } from "@/types/parlay";

interface TradingPanelProps {
  market: ParlayMarket;
  onTrade?: (trade: TradeOrder) => void;
  onClose?: () => void;
  isConnected?: boolean;
  balance?: number;
  onConnectWallet?: () => void;
}

export interface TradeOrder {
  marketId: string;
  side: "yes" | "no";
  action: "buy" | "sell";
  amount: number;
  price: number;
  potentialPayout: number;
}

const QUICK_AMOUNTS = [1, 20, 100];

export function TradingPanel({
  market,
  onTrade,
  onClose,
  isConnected = false,
  balance = 0,
  onConnectWallet,
}: TradingPanelProps) {
  // Wallet connection hooks
  const wallet = useWallet();
  const { address: appKitAddress, isConnected: isAppKitConnected } = useAppKitAccount();
  
  // Trade state
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState<number>(100);
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Determine actual connection status
  const actuallyConnected = isConnected || wallet.state.isConnected || isAppKitConnected;
  const connectedAddress = wallet.state.address || appKitAddress;

  // Handle MetaMask connection
  const handleConnectMetaMask = useCallback(async () => {
    setIsConnecting(true);
    try {
      await wallet.connectMetaMask();
      setShowWalletOptions(false);
    } catch (error) {
      console.error("MetaMask connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [wallet]);

  // Handle WalletConnect connection
  const handleConnectWalletConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (appKitInstance) {
        await appKitInstance.open();
      }
      setShowWalletOptions(false);
    } catch (error) {
      console.error("WalletConnect error:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Calculate prices
  const yesPrice = useMemo(() => Math.round(market.yesPrice * 100), [market.yesPrice]);
  const noPrice = useMemo(() => Math.round(market.noPrice * 100), [market.noPrice]);

  // Get current price based on selection
  const currentPrice = useMemo(() => {
    return selectedSide === "yes" ? yesPrice : noPrice;
  }, [selectedSide, yesPrice, noPrice]);

  // Calculate potential payout
  const potentialPayout = useMemo(() => {
    if (action === "buy") {
      // When buying, you pay the price and win $1 per contract if correct
      const contracts = amount / (currentPrice / 100);
      return contracts; // Each contract pays $1 if correct
    } else {
      // When selling, you receive the current price
      return amount * (currentPrice / 100);
    }
  }, [action, amount, currentPrice]);

  // Calculate profit
  const potentialProfit = useMemo(() => {
    if (action === "buy") {
      return potentialPayout - amount;
    }
    return 0;
  }, [action, amount, potentialPayout]);

  // Handle amount change
  const handleAmountChange = useCallback((value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (!isNaN(num) && num >= 0) {
      setAmount(num);
    } else if (value === "") {
      setAmount(0);
    }
  }, []);

  // Handle quick amount buttons
  const handleQuickAmount = useCallback((quickAmount: number) => {
    setAmount(prev => prev + quickAmount);
  }, []);

  // Handle max button
  const handleMax = useCallback(() => {
    setAmount(balance > 0 ? balance : 1000);
  }, [balance]);

  // Handle trade submission
  const handleTrade = useCallback(async () => {
    if (!onTrade || amount <= 0) return;

    setIsSubmitting(true);
    try {
      await onTrade({
        marketId: market.id,
        side: selectedSide,
        action,
        amount,
        price: currentPrice / 100,
        potentialPayout,
      });
    } catch (error) {
      console.error("Trade error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onTrade, market.id, selectedSide, action, amount, currentPrice, potentialPayout]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className={styles.tradingPanel}>
      {/* Header with close button */}
      <div className={styles.panelHeader}>
        <div className={styles.marketQuestion}>
          {market.question.length > 60 
            ? market.question.slice(0, 60) + "..." 
            : market.question}
        </div>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        )}
      </div>

      {/* Buy/Sell Tabs */}
      <div className={styles.actionTabs}>
        <button
          className={`${styles.actionTab} ${action === "buy" ? styles.active : ""}`}
          onClick={() => setAction("buy")}
        >
          Buy
        </button>
        <button
          className={`${styles.actionTab} ${styles.sellTab} ${action === "sell" ? styles.active : ""}`}
          onClick={() => setAction("sell")}
        >
          Sell
        </button>
        <div className={styles.orderTypeDropdown}>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as "market" | "limit")}
            className={styles.orderTypeSelect}
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
          <span className={styles.dropdownIcon}>▼</span>
        </div>
      </div>

      {/* Yes/No Selection */}
      <div className={styles.sideSelection}>
        <button
          className={`${styles.sideButton} ${styles.yesButton} ${selectedSide === "yes" ? styles.selected : ""}`}
          onClick={() => setSelectedSide("yes")}
        >
          <span className={styles.sideLabel}>Yes</span>
          <span className={styles.sidePrice}>{yesPrice}¢</span>
        </button>
        <button
          className={`${styles.sideButton} ${styles.noButton} ${selectedSide === "no" ? styles.selected : ""}`}
          onClick={() => setSelectedSide("no")}
        >
          <span className={styles.sideLabel}>No</span>
          <span className={styles.sidePrice}>{noPrice}¢</span>
        </button>
      </div>

      {/* Amount Input */}
      <div className={styles.amountSection}>
        <label className={styles.amountLabel}>Amount</label>
        <div className={styles.amountInputWrapper}>
          <span className={styles.currencySymbol}>$</span>
          <input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className={styles.amountInput}
            placeholder="0"
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className={styles.quickAmounts}>
        {QUICK_AMOUNTS.map((quickAmount) => (
          <button
            key={quickAmount}
            className={styles.quickAmountButton}
            onClick={() => handleQuickAmount(quickAmount)}
          >
            +${quickAmount}
          </button>
        ))}
        <button className={styles.quickAmountButton} onClick={handleMax}>
          Max
        </button>
      </div>

      {/* Payout Section */}
      <div className={styles.payoutSection}>
        <div className={styles.payoutInfo}>
          <div className={styles.payoutLabel}>
            <span className={styles.moneyIcon}>💵</span>
            <span>To win</span>
          </div>
          <div className={styles.avgPrice}>
            Avg. Price {currentPrice}¢ <span className={styles.infoIcon}>ⓘ</span>
          </div>
        </div>
        <div className={styles.payoutAmount}>
          {formatCurrency(potentialPayout)}
        </div>
      </div>

      {/* Profit Preview */}
      {action === "buy" && potentialProfit > 0 && (
        <div className={styles.profitPreview}>
          <span className={styles.profitLabel}>Potential Profit:</span>
          <span className={styles.profitValue}>+{formatCurrency(potentialProfit)}</span>
        </div>
      )}

      {/* Trade Button or Connect Wallet Options */}
      {actuallyConnected ? (
        <>
          <button
            className={styles.tradeButton}
            onClick={handleTrade}
            disabled={isSubmitting || amount <= 0}
          >
            {isSubmitting ? <span className={styles.spinner} /> : "Trade"}
          </button>
          
          {/* Balance Info */}
          <div className={styles.balanceInfo}>
            <span>Connected: {connectedAddress ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}` : "Wallet"}</span>
            <span className={styles.balanceAmount}>{formatCurrency(balance)}</span>
          </div>
        </>
      ) : (
        <>
          {!showWalletOptions ? (
            <button
              className={`${styles.tradeButton} ${styles.connectFirst}`}
              onClick={() => setShowWalletOptions(true)}
            >
              Connect Wallet to Trade
            </button>
          ) : (
            <div className={styles.walletOptionsContainer}>
              <div className={styles.walletOptionsHeader}>
                <span>Select Wallet</span>
                <button 
                  className={styles.walletOptionsClose}
                  onClick={() => setShowWalletOptions(false)}
                >
                  ×
                </button>
              </div>
              <div className={styles.walletOptions}>
                <button
                  className={styles.walletOptionButton}
                  onClick={handleConnectMetaMask}
                  disabled={isConnecting}
                >
                  <span className={styles.walletIcon}>🦊</span>
                  <span>MetaMask</span>
                  {isConnecting && <span className={styles.spinnerSmall} />}
                </button>
                <button
                  className={styles.walletOptionButton}
                  onClick={handleConnectWalletConnect}
                  disabled={isConnecting}
                >
                  <span className={styles.walletIcon}>🔗</span>
                  <span>WalletConnect</span>
                  {isConnecting && <span className={styles.spinnerSmall} />}
                </button>
                {onConnectWallet && (
                  <button
                    className={styles.walletOptionButton}
                    onClick={() => {
                      onConnectWallet();
                      setShowWalletOptions(false);
                    }}
                  >
                    <span className={styles.walletIcon}>⚙️</span>
                    <span>More Options</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Market Info */}
      <div className={styles.marketInfo}>
        <div className={styles.venueTag}>
          {market.venue === "polymarket" ? "🟣 Polymarket" : "🟠 Kalshi"}
        </div>
        <a
          href={market.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewOnVenue}
        >
          View on {market.venue} →
        </a>
      </div>
    </div>
  );
}

export default TradingPanel;

