"use client";

/**
 * Eclipse Swap Interface Component
 * Interactive swap UI for Eclipse tokens via Solar DEX and Deserialize
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import styles from "./EclipseSwapInterface.module.css";
import type { TokenInfo, SwapQuote } from "@/types/multichain";
import * as eclipse from "@/lib/multichain/eclipse";
import { config } from "@/lib/config";

export interface EclipseSwapInterfaceProps {
  walletPublicKey: string | null;
  onQuote: (
    fromMint: string,
    toMint: string,
    amount: string,
    slippageBps: number
  ) => Promise<void>;
  onSwap: (
    fromMint: string,
    toMint: string,
    amount: string,
    slippageBps: number
  ) => Promise<void>;
}

/**
 * Eclipse Swap Interface Component with smart routing and interactive UI
 */
export function EclipseSwapInterface(props: EclipseSwapInterfaceProps) {
  const { onSwap, onQuote, walletPublicKey } = props;

  // State
  const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(50); // 50 bps = 0.5%
  const [tokenList, setTokenList] = useState<TokenInfo[]>([]);
  const [fromSearchQuery, setFromSearchQuery] = useState<string>("");
  const [toSearchQuery, setToSearchQuery] = useState<string>("");
  const [fromSearchResults, setFromSearchResults] = useState<TokenInfo[]>([]);
  const [toSearchResults, setToSearchResults] = useState<TokenInfo[]>([]);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [routeInfo, setRouteInfo] = useState<string>("");

  // Load token list on mount
  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      const result = await eclipse.getTokenList();
      setTokenList(result.merged);
      setLoading(false);
    };
    loadTokens();
  }, []);

  // Update route info when tokens change
  useEffect(() => {
    if (fromToken && toToken) {
      const route = eclipse.determineSwapRoute(
        fromToken.address,
        toToken.address
      );
      setRouteInfo(route === "solar-dex" ? "☀️ Solar DEX" : "🔷 Deserialize");
    } else {
      setRouteInfo("");
    }
  }, [fromToken, toToken]);

  // Search "from" tokens
  useEffect(() => {
    if (fromSearchQuery.trim().length < 2) {
      setFromSearchResults([]);
      return;
    }

    const query = fromSearchQuery.toLowerCase();
    const results = tokenList.filter(
      (token) =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
    );
    setFromSearchResults(results.slice(0, 10));
  }, [fromSearchQuery, tokenList]);

  // Search "to" tokens
  useEffect(() => {
    if (toSearchQuery.trim().length < 2) {
      setToSearchResults([]);
      return;
    }

    const query = toSearchQuery.toLowerCase();
    const results = tokenList.filter(
      (token) =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
    );
    setToSearchResults(results.slice(0, 10));
  }, [toSearchQuery, tokenList]);

  // Get quote
  const handleGetQuote = useCallback(async () => {
    if (!fromToken || !toToken || !amount) {
      alert("Please select tokens and enter an amount");
      return;
    }

    setQuoting(true);
    try {
      const quoteResult = await eclipse.getSwapQuote(
        fromToken.address,
        toToken.address,
        amount,
        slippage
      );
      setQuote(quoteResult);
      await onQuote(fromToken.address, toToken.address, amount, slippage);
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
      await onSwap(fromToken.address, toToken.address, amount, slippage);
    } catch (error: any) {
      console.error("Error executing swap:", error);
      alert(`Failed to execute swap: ${error.message}`);
    } finally {
      setSwapping(false);
    }
  }, [fromToken, toToken, amount, slippage, walletPublicKey, onSwap]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>🌙 Eclipse Token Swap (Smart Routing)</div>

      {/* Route Info */}
      {routeInfo && (
        <div className={styles.routeInfo}>
          <strong>Route:</strong> {routeInfo}
        </div>
      )}

      {/* From Token */}
      <div className={styles.tokenInput}>
        <label>From Token</label>
        <input
          type="text"
          placeholder="Search token"
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
                {token.address === config.SOLAR_TOKEN_ADDRESS && (
                  <span className={styles.solarBadge}>⚡SOLAR</span>
                )}
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
          placeholder="Search token"
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
                {token.address === config.SOLAR_TOKEN_ADDRESS && (
                  <span className={styles.solarBadge}>⚡SOLAR</span>
                )}
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
          {quote.routePlan && quote.routePlan.length > 0 && (
            <p>Route: {quote.routePlan.length} hop(s)</p>
          )}
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

export default EclipseSwapInterface;
