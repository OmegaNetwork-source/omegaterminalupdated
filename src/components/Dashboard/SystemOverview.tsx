"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useMultiChain } from "@/hooks/useMultiChain";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { useNewsReader } from "@/hooks/useNewsReader";
import styles from "./SystemOverview.module.css";

interface PriceData {
  symbol: string;
  price: number;
  change24h?: number;
  coinId: string; // CoinGecko ID
}

// Common token mappings (symbol -> CoinGecko ID)
const TOKEN_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  ADA: "cardano",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  MATIC: "matic-network",
  LINK: "chainlink",
  UNI: "uniswap",
  AAVE: "aave",
  USDC: "usd-coin",
  USDT: "tether",
  XRP: "ripple",
  DOGE: "dogecoin",
  TRX: "tron",
  LTC: "litecoin",
  ATOM: "cosmos",
  NEAR: "near",
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
  SUI: "sui",
  TON: "the-open-network",
  ICP: "internet-computer",
  FIL: "filecoin",
  ETC: "ethereum-classic",
  ALGO: "algorand",
  EOS: "eos",
  XLM: "stellar",
  XTZ: "tezos",
  MANA: "decentraland",
  SAND: "the-sandbox",
  AXS: "axie-infinity",
  CHZ: "chiliz",
  ENJ: "enjincoin",
  FLOW: "flow",
  HBAR: "hedera-hashgraph",
  THETA: "theta-token",
  VET: "vechain",
  ZEC: "zcash",
  DASH: "dash",
  BCH: "bitcoin-cash",
  BSV: "bitcoin-sv",
  EGLD: "elrond-erd-2",
  FTM: "fantom",
  ONE: "harmony",
  KLAY: "klay-token",
  CRO: "crypto-com-chain",
  QNT: "quant-network",
  MKR: "maker",
  SNX: "havven",
  COMP: "compound-governance-token",
  YFI: "yearn-finance",
  SUSHI: "sushi",
  CRV: "curve-dao-token",
  BAL: "balancer",
  REN: "republic-protocol",
  ZRX: "0x",
  BAT: "basic-attention-token",
  ZIL: "zilliqa",
  WAVES: "waves",
  NEO: "neo",
  IOTA: "iota",
  DCR: "decred",
  DGB: "digibyte",
  MONAD: "monad",
};

/**
 * Format price with appropriate decimal places based on value
 * Low-value tokens (< $1) get more decimal places for accuracy
 */
function formatPrice(price: number): string {
  if (price >= 1) {
    // Prices >= $1: show 2 decimal places
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (price >= 0.01) {
    // Prices >= $0.01 but < $1: show 4 decimal places
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  } else {
    // Prices < $0.01: show 6 decimal places
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    });
  }
}

/**
 * SystemOverview Component
 * 
 * Default panel shown in the right sidebar when no media panels are open.
 * Displays wallet status, quick stats, and system information.
 */
export function SystemOverview(): JSX.Element {
  const wallet = useWallet();
  const multichain = useMultiChain();
  const spotify = useSpotify();
  const youtube = useYouTube();
  const newsReader = useNewsReader();
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [selectedTokens, setSelectedTokens] = useState<string[]>(() => {
    // Load from localStorage or use defaults
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("system-overview-tokens");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return ["BTC", "ETH", "SOL", "BNB"];
        }
      }
    }
    return ["BTC", "ETH", "SOL", "BNB"];
  });
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [explorerStats, setExplorerStats] = useState<{
    totalTransactions: number | null;
    totalWallets: number | null;
  }>({
    totalTransactions: null,
    totalWallets: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Save selected tokens to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && selectedTokens.length > 0) {
      localStorage.setItem("system-overview-tokens", JSON.stringify(selectedTokens));
    }
  }, [selectedTokens]);

  // Fetch crypto prices
  useEffect(() => {
    if (selectedTokens.length === 0) return;

    const fetchPrices = async () => {
      try {
        setLoadingPrices(true);
        
        // Map symbols to CoinGecko IDs
        const coinIds = selectedTokens
          .map((symbol) => TOKEN_MAP[symbol.toUpperCase()] || symbol.toLowerCase())
          .filter(Boolean);
        
        if (coinIds.length === 0) {
          setLoadingPrices(false);
          return;
        }

        const response = await fetch(
          `/api/coingecko/price?ids=${coinIds.join(",")}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (response.ok) {
          const data = await response.json();
          const priceList: PriceData[] = selectedTokens
            .map((symbol) => {
              const coinId = TOKEN_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
              const coinData = data[coinId];
              if (!coinData || !coinData.usd) return null;
              
              return {
                symbol: symbol.toUpperCase(),
                price: coinData.usd,
                change24h: coinData.usd_24h_change,
                coinId,
              };
            })
            .filter((p): p is PriceData => p !== null && p.price > 0);
          
          setPrices(priceList);
        }
      } catch (error) {
        console.error("[SystemOverview] Failed to fetch prices:", error);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPrices();
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [selectedTokens]);

  // Fetch explorer stats
  useEffect(() => {
    const fetchExplorerStats = async () => {
      try {
        setLoadingStats(true);
        const response = await fetch("/api/explorer/stats", {
          cache: "no-store", // Always fetch fresh data
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("[SystemOverview] Explorer stats data:", data);
          if (data.success) {
            setExplorerStats({
              totalTransactions: data.totalTransactions,
              totalWallets: data.totalWallets,
            });
          } else {
            console.error("[SystemOverview] API returned error:", data.error);
          }
        } else {
          console.error("[SystemOverview] API response not OK:", response.status);
        }
      } catch (error) {
        console.error("[SystemOverview] Failed to fetch explorer stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchExplorerStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchExplorerStats, 300000);
    return () => clearInterval(interval);
  }, []);

  // Check Aptos wallet connection
  const [aptosConnected, setAptosConnected] = useState(false);
  const [aptosAddress, setAptosAddress] = useState<string | null>(null);

  useEffect(() => {
    const checkAptosConnection = async () => {
      if (typeof window === "undefined") return;
      
      const provider = (window as any).aptos;
      if (!provider) {
        setAptosConnected(false);
        setAptosAddress(null);
        return;
      }

      try {
        const account = await provider.account?.();
        const address = account?.address || null;
        setAptosConnected(!!address);
        setAptosAddress(address);
      } catch {
        setAptosConnected(false);
        setAptosAddress(null);
      }
    };

    checkAptosConnection();
    
    // Listen for Aptos account changes
    const handleAccountChange = () => {
      checkAptosConnection();
    };

    // Check if provider supports event listeners
    const provider = (window as any).aptos;
    if (provider && typeof provider.on === "function") {
      provider.on("accountChange", handleAccountChange);
    }

    // Check periodically for Aptos connection changes (fallback)
    const interval = setInterval(checkAptosConnection, 2000);
    
    return () => {
      clearInterval(interval);
      if (provider && typeof provider.off === "function") {
        provider.off("accountChange", handleAccountChange);
      }
    };
  }, []);

  // Check if any wallet is connected
  const isAnyWalletConnected = 
    wallet.state.isConnected ||
    multichain?.solana?.state.connected ||
    multichain?.near?.state.connected ||
    multichain?.eclipse?.state.connected ||
    aptosConnected;

  // Get connected wallet info
  const getWalletInfo = () => {
    if (wallet.state.isConnected) {
      return {
        type: wallet.state.type || "EVM",
        address: wallet.state.address,
        balance: wallet.state.balance,
        network: wallet.state.networkName || "Unknown",
        chainId: wallet.state.chainId,
      };
    }
    if (aptosConnected && aptosAddress) {
      return {
        type: "Aptos",
        address: aptosAddress,
        balance: null,
        network: "Aptos Mainnet",
        chainId: null,
      };
    }
    if (multichain?.solana?.state.connected) {
      return {
        type: "Solana",
        address: multichain.solana.state.publicKey,
        balance: null,
        network: "Solana Mainnet",
        chainId: null,
      };
    }
    if (multichain?.near?.state.connected) {
      return {
        type: "NEAR",
        address: multichain.near.state.accountId,
        balance: null,
        network: "NEAR Mainnet",
        chainId: null,
      };
    }
    if (multichain?.eclipse?.state.connected) {
      return {
        type: "Eclipse",
        address: multichain.eclipse.state.publicKey,
        balance: null,
        network: "Eclipse Mainnet",
        chainId: null,
      };
    }
    return null;
  };

  const walletInfo = getWalletInfo();

  return (
    <section className={styles.section}>
      <div className={styles.overviewContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>SYSTEM OVERVIEW</h2>
        </div>

        <div className={styles.content}>
          {/* Wallet Status */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <svg
                className={styles.cardIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M5 5a2 2 0 0 0 0 4h8v4H5a2 2 0 0 0 0 4h8" />
              </svg>
              <span className={styles.cardTitle}>Wallet Status</span>
            </div>
            <div className={styles.cardContent}>
              {isAnyWalletConnected && walletInfo ? (
                <>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Status:</span>
                    <span className={styles.statusValueConnected}>● Connected</span>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Type:</span>
                    <span className={styles.statusValue}>{walletInfo.type}</span>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Network:</span>
                    <span className={styles.statusValue}>{walletInfo.network}</span>
                  </div>
                  {walletInfo.address && (
                    <div className={styles.addressRow}>
                      <span className={styles.statusLabel}>Address:</span>
                      <span className={styles.addressValue}>
                        {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                      </span>
                    </div>
                  )}
                  {walletInfo.balance && (
                    <div className={styles.statusRow}>
                      <span className={styles.statusLabel}>Balance:</span>
                      <span className={styles.statusValue}>{walletInfo.balance}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.noWallet}>
                  <p>No wallet connected</p>
                  <p className={styles.hint}>Connect a wallet to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Crypto Prices */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <svg
                className={styles.cardIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="2" x2="12" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span className={styles.cardTitle}>Market Prices</span>
              <button
                className={styles.editButton}
                onClick={() => setShowTokenSelector(!showTokenSelector)}
                type="button"
                aria-label="Edit tokens"
                title="Customize tokens"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "14px", height: "14px" }}
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
            <div className={styles.cardContent} onClick={(e) => e.stopPropagation()}>
              {showTokenSelector ? (
                <div className={styles.tokenSelector} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.searchContainer} onMouseDown={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder="Search token (e.g., BTC, ETH, SOL, APT)..."
                      value={searchQuery}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSearchQuery(e.target.value.toUpperCase());
                      }}
                      onFocus={(e) => {
                        e.stopPropagation();
                        e.currentTarget.select();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.currentTarget.focus();
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                      }}
                      autoFocus
                      tabIndex={0}
                    />
                  </div>
                  <div className={styles.tokenSuggestions} onMouseDown={(e) => e.stopPropagation()}>
                    {Object.keys(TOKEN_MAP)
                      .filter((token) => 
                        !searchQuery || 
                        token.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        searchQuery.toLowerCase().includes(token.toLowerCase())
                      )
                      .slice(0, 20)
                      .map((token) => {
                        const isSelected = selectedTokens.includes(token);
                        const isDisabled = !isSelected && selectedTokens.length >= 4;
                        
                        return (
                          <button
                            key={token}
                            className={`${styles.tokenChip} ${isSelected ? styles.selected : ""} ${isDisabled ? styles.disabled : ""}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isDisabled) return;
                              
                              if (isSelected) {
                                // Deselect token
                                setSelectedTokens(selectedTokens.filter((t) => t !== token));
                              } else {
                                // Select token (only if less than 4 selected)
                                if (selectedTokens.length < 4) {
                                  setSelectedTokens([...selectedTokens, token]);
                                }
                              }
                            }}
                            disabled={isDisabled}
                            type="button"
                            tabIndex={0}
                          >
                            {token}
                            {isSelected && <span className={styles.checkmark}>✓</span>}
                          </button>
                        );
                      })}
                  </div>
                  <div className={styles.tokenSelectorFooter} onMouseDown={(e) => e.stopPropagation()}>
                    <span className={styles.tokenCount}>
                      {selectedTokens.length}/4 selected
                    </span>
                    <button
                      className={styles.doneButton}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowTokenSelector(false);
                        setSearchQuery("");
                      }}
                      type="button"
                      tabIndex={0}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {loadingPrices ? (
                    <div className={styles.loadingPrices}>
                      <span>Loading prices...</span>
                    </div>
                  ) : prices.length > 0 ? (
                    <div className={styles.pricesList}>
                      {prices.map((price) => (
                        <div key={price.symbol} className={styles.priceItem}>
                          <span className={styles.priceSymbol}>{price.symbol}</span>
                          <span className={styles.priceValue}>
                            ${formatPrice(price.price)}
                          </span>
                          {price.change24h !== undefined && (
                            <span
                              className={`${styles.priceChange} ${
                                price.change24h >= 0 ? styles.positive : styles.negative
                              }`}
                            >
                              {price.change24h >= 0 ? "↑" : "↓"} {Math.abs(price.change24h).toFixed(2)}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noPrices}>
                      <span>Price data unavailable</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <svg
                className={styles.cardIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className={styles.cardTitle}>Quick Stats</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Transactions</span>
                  <span className={styles.statValue}>
                    {loadingStats
                      ? "..."
                      : explorerStats.totalTransactions !== null
                      ? explorerStats.totalTransactions.toLocaleString()
                      : "—"}
                  </span>
                </div>
                {explorerStats.totalWallets !== null && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Wallets</span>
                    <span className={styles.statValue}>
                      {loadingStats
                        ? "..."
                        : explorerStats.totalWallets.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <svg
                className={styles.cardIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className={styles.cardTitle}>Quick Actions</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.actionsList}>
                <button
                  className={styles.actionButton}
                  onClick={() => spotify.openPanel()}
                  type="button"
                >
                  <svg
                    className={styles.actionButtonIcon}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="currentColor" />
                  </svg>
                  <span>Music (Spotify)</span>
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => youtube.openPanel()}
                  type="button"
                >
                  <svg
                    className={styles.actionButtonIcon}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                  >
                    <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" />
                  </svg>
                  <span>YouTube</span>
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => newsReader.openPanel()}
                  type="button"
                >
                  <svg
                    className={styles.actionButtonIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                    <path d="M18 14h-8" />
                    <path d="M15 11h-5" />
                    <path d="M15 17h-5" />
                  </svg>
                  <span>News</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

