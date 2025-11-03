"use client";

/**
 * Solana Swap Interface Component
 * Interactive swap UI for Solana tokens via Jupiter aggregator
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import styles from "./SolanaSwapInterface.module.css";
import type { TokenInfo, SwapQuote } from "@/types/multichain";
import * as solana from "@/lib/multichain/solana";

export interface SolanaSwapInterfaceProps {
  walletPublicKey: string | null;
  onQuote: (fromMint: string, toMint: string, amount: string) => Promise<void>;
  onSwap: (fromMint: string, toMint: string, amount: string) => Promise<void>;
}

/**
 * Solana Swap Interface Component with interactive token search and quote fetching
 */
export function SolanaSwapInterface(props: SolanaSwapInterfaceProps) {
  const { onQuote, onSwap, walletPublicKey } = props;

  // State
  const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(50); // 50 bps = 0.5%
  const [fromSearchQuery, setFromSearchQuery] = useState<string>("");
  const [toSearchQuery, setToSearchQuery] = useState<string>("");
  const [fromSearchResults, setFromSearchResults] = useState<TokenInfo[]>([]);
  const [toSearchResults, setToSearchResults] = useState<TokenInfo[]>([]);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [swapping, setSwapping] = useState(false);

  // Debounce timers
  const fromDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const toDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced token search for "from" token
  useEffect(() => {
    if (fromDebounceTimer.current) {
      clearTimeout(fromDebounceTimer.current);
    }

    if (fromSearchQuery.trim().length < 2) {
      setFromSearchResults([]);
      return;
    }

    fromDebounceTimer.current = setTimeout(async () => {
      setLoading(true);
      const results = await solana.searchTokens(fromSearchQuery);
      setFromSearchResults(results);
      setLoading(false);
    }, 500);

    return () => {
      if (fromDebounceTimer.current) {
        clearTimeout(fromDebounceTimer.current);
      }
    };
  }, [fromSearchQuery]);

  // Debounced token search for "to" token
  useEffect(() => {
    if (toDebounceTimer.current) {
      clearTimeout(toDebounceTimer.current);
    }

    if (toSearchQuery.trim().length < 2) {
      setToSearchResults([]);
      return;
    }

    toDebounceTimer.current = setTimeout(async () => {
      setLoading(true);
      const results = await solana.searchTokens(toSearchQuery);
      setToSearchResults(results);
      setLoading(false);
    }, 500);

    return () => {
      if (toDebounceTimer.current) {
        clearTimeout(toDebounceTimer.current);
      }
    };
  }, [toSearchQuery]);

  // Get quote
  const handleGetQuote = useCallback(async () => {
    if (!fromToken || !toToken || !amount) {
      alert("Please select tokens and enter an amount");
      return;
    }

    setQuoting(true);
    try {
      const quoteResult = await solana.getSwapQuote(
        fromToken.address,
        toToken.address,
        amount,
        slippage
      );
      setQuote(quoteResult);
      await onQuote(fromToken.address, toToken.address, amount);
    } catch (error: any) {
      console.error("Error getting quote:", error);
      alert(`Failed to get quote: ${error.message}`);
    } finally {
      setQuoting(false);
    }
  }, [fromToken, toToken, amount, slippage, onQuote]);

  // Execute swap
  const handleSwap = useCallback(async () => {
    if (!fromToken || !toToken || !amount || !walletPublicKey) {
      alert("Please ensure wallet is connected and tokens are selected");
      return;
    }

    setSwapping(true);
    try {
      await onSwap(fromToken.address, toToken.address, amount);
    } catch (error: any) {
      console.error("Error executing swap:", error);
      alert(`Failed to execute swap: ${error.message}`);
    } finally {
      setSwapping(false);
    }
  }, [fromToken, toToken, amount, walletPublicKey, onSwap]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>🌟 Solana Token Swap (Jupiter)</div>

      {/* From Token */}
      <div className={styles.tokenInput}>
        <label>From Token</label>
        <input
          type="text"
          placeholder="Search token (e.g., SOL, BONK)"
          value={fromSearchQuery}
          onChange={(e) => setFromSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {fromSearchResults.length > 0 && (
          <div className={styles.searchResults}>
            {fromSearchResults.slice(0, 5).map((token) => (
              <div
                key={token.address}
                className={styles.tokenResult}
                onClick={() => {
                  setFromToken(token);
                  setFromSearchQuery(token.symbol);
                  setFromSearchResults([]);
                }}
              >
                <span className={styles.tokenSymbol}>{token.symbol}</span>
                <span className={styles.tokenName}>{token.name}</span>
                {token.verified && <span className={styles.verified}>✓</span>}
              </div>
            ))}
          </div>
        )}
        {fromToken && (
          <div className={styles.selectedToken}>
            Selected: {fromToken.symbol} - {fromToken.name}
          </div>
        )}
      </div>

      {/* Amount Input */}
      <div className={styles.amountInput}>
        <label>Amount (in smallest unit)</label>
        <input
          type="text"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={styles.input}
        />
      </div>

      {/* To Token */}
      <div className={styles.tokenInput}>
        <label>To Token</label>
        <input
          type="text"
          placeholder="Search token (e.g., USDC)"
          value={toSearchQuery}
          onChange={(e) => setToSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {toSearchResults.length > 0 && (
          <div className={styles.searchResults}>
            {toSearchResults.slice(0, 5).map((token) => (
              <div
                key={token.address}
                className={styles.tokenResult}
                onClick={() => {
                  setToToken(token);
                  setToSearchQuery(token.symbol);
                  setToSearchResults([]);
                }}
              >
                <span className={styles.tokenSymbol}>{token.symbol}</span>
                <span className={styles.tokenName}>{token.name}</span>
                {token.verified && <span className={styles.verified}>✓</span>}
              </div>
            ))}
          </div>
        )}
        {toToken && (
          <div className={styles.selectedToken}>
            Selected: {toToken.symbol} - {toToken.name}
          </div>
        )}
      </div>

      {/* Slippage Control */}
      <div className={styles.slippageControl}>
        <label>Slippage Tolerance (bps)</label>
        <input
          type="number"
          value={slippage}
          onChange={(e) => setSlippage(parseInt(e.target.value) || 50)}
          className={styles.input}
        />
        <span className={styles.slippagePercent}>
          {(slippage / 100).toFixed(2)}%
        </span>
      </div>

      {/* Quote Display */}
      {quote && (
        <div className={styles.quoteBox}>
          <h3>Quote:</h3>
          <p>Input: {quote.inAmount}</p>
          <p>Output: {quote.outAmount}</p>
          <p>Price Impact: {quote.priceImpactPct}%</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          onClick={handleGetQuote}
          disabled={!fromToken || !toToken || !amount || quoting}
          className={styles.quoteButton}
        >
          {quoting ? "Getting Quote..." : "Get Quote"}
        </button>
        <button
          onClick={handleSwap}
          disabled={!quote || swapping}
          className={styles.swapButton}
        >
          {swapping ? "Swapping..." : "Swap"}
        </button>
      </div>
    </div>
  );
}

export default SolanaSwapInterface;
