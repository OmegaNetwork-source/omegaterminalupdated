"use client";

import React, { useEffect, useState, useRef } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useMultiChain } from "@/hooks/useMultiChain";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { useNewsReader } from "@/hooks/useNewsReader";
import { useBluesPlayer } from "@/hooks/useBluesPlayer";
import { useLoFiPlayer } from "@/hooks/useLoFiPlayer";
import { useTechPlayer } from "@/hooks/useTechPlayer";
import { useFunkyPlayer } from "@/hooks/useFunkyPlayer";
import { useOmegaTrancePlayer } from "@/hooks/useOmegaTrancePlayer";
import { useOmegaMelodiesPlayer } from "@/hooks/useOmegaMelodiesPlayer";
import { usePGT } from "@/hooks/usePGT";
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
// Small Waveform Component for Quick Actions
function MiniWaveform({ isPlaying }: { isPlaying: boolean }) {
  const waveformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!waveformRef.current) return;
    const bars = waveformRef.current.querySelectorAll(`.${styles.waveBar}`);
    bars.forEach((bar, index) => {
      const height = Math.random() * 8 + 4; // Random height 4-12px for mini waveform
      (bar as HTMLElement).style.height = `${height}px`;
      (bar as HTMLElement).style.animationDelay = `${index * 0.05}s`;
    });
  }, []);

  return (
    <div
      ref={waveformRef}
      className={`${styles.miniWaveform} ${isPlaying ? styles.waveformPlaying : ""}`}
      aria-label={isPlaying ? "Playing" : "Paused"}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className={styles.waveBar} />
      ))}
    </div>
  );
}

export function SystemOverview(): JSX.Element {
  const wallet = useWallet();
  const multichain = useMultiChain();
  const spotify = useSpotify();
  const youtube = useYouTube();
  const newsReader = useNewsReader();
  const bluesPlayer = useBluesPlayer();
  const lofiPlayer = useLoFiPlayer();
  const techPlayer = useTechPlayer();
  const funkyPlayer = useFunkyPlayer();
  const trancePlayer = useOmegaTrancePlayer();
  const melodiesPlayer = useOmegaMelodiesPlayer();
  const pgt = usePGT();

  // Track playing state for each player
  const [playerStates, setPlayerStates] = useState({
    blues: false,
    lofi: false,
    tech: false,
    funky: false,
    trance: false,
    melodies: false,
  });

  // Refs for hidden iframes
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({
    blues: null,
    lofi: null,
    tech: null,
    funky: null,
    trance: null,
    melodies: null,
  });

  // Player video IDs
  const playerConfigs: Record<string, { videoId: string; playlist?: string }> = {
    blues: { videoId: "4DxKNOUzvJU" },
    lofi: { videoId: "4xDzrJKXOOY" },
    tech: { videoId: "-WEWVsC8CyA" },
    funky: { videoId: "7XPGU7dmZXg" },
    trance: { videoId: "T2QZpy07j4s", playlist: "RDT2QZpy07j4s" },
    melodies: { videoId: "nxqlTRYs6NY" },
  };

  // Initialize hidden iframes for background playback
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Create hidden iframes for each player (background playback without opening panel)
    Object.entries(playerConfigs).forEach(([playerType, config]) => {
      const iframeId = `system-overview-${playerType}-audio-iframe`;
      // Check if iframe already exists
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
      
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = iframeId;
        const playlistParam = config.playlist ? `&list=${config.playlist}` : "";
        iframe.src = `https://www.youtube.com/embed/${config.videoId}?autoplay=0&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&fs=0&cc_load_policy=0&playsinline=1${playlistParam}`;
        iframe.style.cssText = "position:absolute;width:0;height:0;border:none;opacity:0;pointer-events:none;";
        iframe.allow = "autoplay; encrypted-media";
        iframe.setAttribute("allowfullscreen", "");
        document.body.appendChild(iframe);
      }
      
      iframeRefs.current[playerType] = iframe;
    });

    return () => {
      // Cleanup iframes on unmount
      Object.keys(playerConfigs).forEach((playerType) => {
        const iframe = iframeRefs.current[playerType];
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      });
    };
  }, []);

  // Listen for player control events to track playing state
  useEffect(() => {
    const handleBluesControl = (e: CustomEvent) => {
      if (e.detail?.action === "toggle") {
        setPlayerStates((prev) => ({ ...prev, blues: !prev.blues }));
      } else if (e.detail?.action === "play") {
        setPlayerStates((prev) => ({ ...prev, blues: true }));
      } else if (e.detail?.action === "pause") {
        setPlayerStates((prev) => ({ ...prev, blues: false }));
      }
    };
    const handleLoFiControl = (e: CustomEvent) => {
      if (e.detail?.action === "toggle") {
        setPlayerStates((prev) => ({ ...prev, lofi: !prev.lofi }));
      } else if (e.detail?.action === "play") {
        setPlayerStates((prev) => ({ ...prev, lofi: true }));
      } else if (e.detail?.action === "pause") {
        setPlayerStates((prev) => ({ ...prev, lofi: false }));
      }
    };
    const handleTechControl = (e: CustomEvent) => {
      if (e.detail?.action === "toggle") {
        setPlayerStates((prev) => ({ ...prev, tech: !prev.tech }));
      } else if (e.detail?.action === "play") {
        setPlayerStates((prev) => ({ ...prev, tech: true }));
      } else if (e.detail?.action === "pause") {
        setPlayerStates((prev) => ({ ...prev, tech: false }));
      }
    };
    const handleFunkyControl = (e: CustomEvent) => {
      if (e.detail?.action === "toggle") {
        setPlayerStates((prev) => ({ ...prev, funky: !prev.funky }));
      } else if (e.detail?.action === "play") {
        setPlayerStates((prev) => ({ ...prev, funky: true }));
      } else if (e.detail?.action === "pause") {
        setPlayerStates((prev) => ({ ...prev, funky: false }));
      }
    };
    const handleTranceControl = (e: CustomEvent) => {
      if (e.detail?.action === "toggle") {
        setPlayerStates((prev) => ({ ...prev, trance: !prev.trance }));
      } else if (e.detail?.action === "play") {
        setPlayerStates((prev) => ({ ...prev, trance: true }));
      } else if (e.detail?.action === "pause") {
        setPlayerStates((prev) => ({ ...prev, trance: false }));
      }
    };
    const handleMelodiesControl = (e: CustomEvent) => {
      if (e.detail?.action === "toggle") {
        setPlayerStates((prev) => ({ ...prev, melodies: !prev.melodies }));
      } else if (e.detail?.action === "play") {
        setPlayerStates((prev) => ({ ...prev, melodies: true }));
      } else if (e.detail?.action === "pause") {
        setPlayerStates((prev) => ({ ...prev, melodies: false }));
      }
    };

    // Listen for panel close events to reset playing state
    const handleBluesClose = () => {
      setPlayerStates((prev) => ({ ...prev, blues: false }));
    };
    const handleLoFiClose = () => {
      setPlayerStates((prev) => ({ ...prev, lofi: false }));
    };
    const handleTechClose = () => {
      setPlayerStates((prev) => ({ ...prev, tech: false }));
    };
    const handleFunkyClose = () => {
      setPlayerStates((prev) => ({ ...prev, funky: false }));
    };
    const handleTranceClose = () => {
      setPlayerStates((prev) => ({ ...prev, trance: false }));
    };
    const handleMelodiesClose = () => {
      setPlayerStates((prev) => ({ ...prev, melodies: false }));
    };

    window.addEventListener("omega:bluesPlayerControl", handleBluesControl as EventListener);
    window.addEventListener("omega:lofiPlayerControl", handleLoFiControl as EventListener);
    window.addEventListener("omega:techPlayerControl", handleTechControl as EventListener);
    window.addEventListener("omega:funkyPlayerControl", handleFunkyControl as EventListener);
    window.addEventListener("omega:trancePlayerControl", handleTranceControl as EventListener);
    window.addEventListener("omega:melodiesPlayerControl", handleMelodiesControl as EventListener);
    window.addEventListener("omega:closeBluesPlayer", handleBluesClose);
    window.addEventListener("omega:closeLoFiPlayer", handleLoFiClose);
    window.addEventListener("omega:closeTechPlayer", handleTechClose);
    window.addEventListener("omega:closeFunkyPlayer", handleFunkyClose);
    window.addEventListener("omega:closeOmegaTrancePlayer", handleTranceClose);
    window.addEventListener("omega:closeOmegaMelodiesPlayer", handleMelodiesClose);

    return () => {
      window.removeEventListener("omega:bluesPlayerControl", handleBluesControl as EventListener);
      window.removeEventListener("omega:lofiPlayerControl", handleLoFiControl as EventListener);
      window.removeEventListener("omega:techPlayerControl", handleTechControl as EventListener);
      window.removeEventListener("omega:funkyPlayerControl", handleFunkyControl as EventListener);
      window.removeEventListener("omega:trancePlayerControl", handleTranceControl as EventListener);
      window.removeEventListener("omega:melodiesPlayerControl", handleMelodiesControl as EventListener);
      window.removeEventListener("omega:closeBluesPlayer", handleBluesClose);
      window.removeEventListener("omega:closeLoFiPlayer", handleLoFiClose);
      window.removeEventListener("omega:closeTechPlayer", handleTechClose);
      window.removeEventListener("omega:closeFunkyPlayer", handleFunkyClose);
      window.removeEventListener("omega:closeOmegaTrancePlayer", handleTranceClose);
      window.removeEventListener("omega:closeOmegaMelodiesPlayer", handleMelodiesClose);
    };
  }, []);

  // Helper function to control YouTube iframe playback
  const controlIframe = (playerType: string, action: "play" | "pause") => {
    const iframe = iframeRefs.current[playerType];
    if (iframe && iframe.contentWindow) {
      try {
        const command = action === "play" ? "playVideo" : "pauseVideo";
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: command, args: "" }),
          "*"
        );
      } catch (e) {
        console.warn(`[SystemOverview] Failed to ${action} ${playerType}:`, e);
      }
    }
  };

  // Handler functions for omega music players - play directly without opening panel
  const handleOmegaPlayerClick = (playerType: string) => {
    const isCurrentlyPlaying = playerStates[playerType as keyof typeof playerStates];
    
    // Pause all other players first
    Object.keys(playerConfigs).forEach((type) => {
      if (type !== playerType && playerStates[type as keyof typeof playerStates]) {
        controlIframe(type, "pause");
        setPlayerStates((prev) => ({ ...prev, [type]: false }));
      }
    });

    // Toggle current player
    if (isCurrentlyPlaying) {
      // Pause if playing
      controlIframe(playerType, "pause");
      setPlayerStates((prev) => ({ ...prev, [playerType]: false }));
    } else {
      // Play if paused
      controlIframe(playerType, "play");
      setPlayerStates((prev) => ({ ...prev, [playerType]: true }));
    }
  };
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [selectedTokens, setSelectedTokens] = useState<string[]>(() => {
    // Load from localStorage or use defaults
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("system-overview-tokens");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Ensure we have a valid array with at least one token
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.warn("[SystemOverview] Failed to parse saved tokens:", e);
        }
      }
    }
    // Default tokens
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
    if (selectedTokens.length === 0) {
      setPrices([]);
      setLoadingPrices(false);
      return;
    }

    const fetchPrices = async (retryCount = 0) => {
      try {
        setLoadingPrices(true);
        
        // Map symbols to CoinGecko IDs
        const coinIds = selectedTokens
          .map((symbol) => {
            const upperSymbol = symbol.toUpperCase();
            return TOKEN_MAP[upperSymbol] || symbol.toLowerCase();
          })
          .filter(Boolean);
        
        if (coinIds.length === 0) {
          console.warn("[SystemOverview] No valid coin IDs found for tokens:", selectedTokens);
          setPrices([]);
          setLoadingPrices(false);
          return;
        }

        const apiUrl = `/api/coingecko/price?ids=${coinIds.join(",")}&vs_currencies=usd&include_24hr_change=true`;
        console.log("[SystemOverview] Fetching prices from:", apiUrl, `(attempt ${retryCount + 1})`);

        const response = await fetch(apiUrl, {
          cache: "no-store",
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
          console.error("[SystemOverview] API error:", response.status, errorData);
          
          // Retry once if it's a server error (5xx) or rate limit (429)
          if ((response.status >= 500 || response.status === 429) && retryCount < 1) {
            console.log("[SystemOverview] Retrying price fetch...");
            setTimeout(() => fetchPrices(retryCount + 1), 2000);
            return;
          }
          
          setPrices([]);
          setLoadingPrices(false);
          return;
        }

          const data = await response.json();
        
        // Check if response has an error field
        if (data.error) {
          console.error("[SystemOverview] API returned error:", data.error);
          
          // Retry once if it's a rate limit or server error
          if (retryCount < 1) {
            console.log("[SystemOverview] Retrying price fetch after error...");
            setTimeout(() => fetchPrices(retryCount + 1), 2000);
            return;
          }
          
          setPrices([]);
          setLoadingPrices(false);
          return;
        }

        console.log("[SystemOverview] Price data received:", data);

          const priceList: PriceData[] = selectedTokens
          .map((symbol): PriceData | null => {
            const upperSymbol = symbol.toUpperCase();
            const coinId = TOKEN_MAP[upperSymbol] || symbol.toLowerCase();
              const coinData = data[coinId];
            
            if (!coinData) {
              console.warn(`[SystemOverview] No data for ${symbol} (coinId: ${coinId})`);
              return null;
            }
            
            if (!coinData.usd || coinData.usd === 0) {
              console.warn(`[SystemOverview] Invalid price for ${symbol}:`, coinData);
              return null;
            }
              
              return {
              symbol: upperSymbol,
                price: coinData.usd,
                change24h: coinData.usd_24h_change,
                coinId,
              };
            })
          .filter((p): p is PriceData => p !== null && typeof p.price === "number" && p.price > 0);
          
        console.log("[SystemOverview] Processed prices:", priceList);
        
        if (priceList.length > 0) {
          setPrices(priceList);
        } else {
          console.warn("[SystemOverview] No valid prices found after processing");
          setPrices([]);
        }
      } catch (error) {
        console.error("[SystemOverview] Failed to fetch prices:", error);
        
        // Retry once on network errors
        if (retryCount < 1) {
          console.log("[SystemOverview] Retrying price fetch after network error...");
          setTimeout(() => fetchPrices(retryCount + 1), 2000);
          return;
        }
        
        setPrices([]);
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
              
              {/* Omega Music Players */}
              <div className={styles.omegaPlayersSection}>
                <div className={styles.omegaPlayersLabel}>Omega Music</div>
                <div className={styles.omegaPlayersGrid}>
                  <button
                    className={styles.omegaPlayerButton}
                    onClick={() => handleOmegaPlayerClick("blues")}
                    type="button"
                    title="Blues Player - Click to play/pause"
                  >
                    <MiniWaveform isPlaying={playerStates.blues} />
                    <span className={styles.omegaPlayerLabel}>Blues</span>
                  </button>
                  <button
                    className={styles.omegaPlayerButton}
                    onClick={() => handleOmegaPlayerClick("lofi")}
                    type="button"
                    title="Lo-Fi Player - Click to play/pause"
                  >
                    <MiniWaveform isPlaying={playerStates.lofi} />
                    <span className={styles.omegaPlayerLabel}>Lo-Fi</span>
                  </button>
                  <button
                    className={styles.omegaPlayerButton}
                    onClick={() => handleOmegaPlayerClick("tech")}
                    type="button"
                    title="Tech Player - Click to play/pause"
                  >
                    <MiniWaveform isPlaying={playerStates.tech} />
                    <span className={styles.omegaPlayerLabel}>Tech</span>
                  </button>
                  <button
                    className={styles.omegaPlayerButton}
                    onClick={() => handleOmegaPlayerClick("funky")}
                    type="button"
                    title="Funky Player - Click to play/pause"
                  >
                    <MiniWaveform isPlaying={playerStates.funky} />
                    <span className={styles.omegaPlayerLabel}>Funky</span>
                  </button>
                  <button
                    className={styles.omegaPlayerButton}
                    onClick={() => handleOmegaPlayerClick("trance")}
                    type="button"
                    title="Trance Player - Click to play/pause"
                  >
                    <MiniWaveform isPlaying={playerStates.trance} />
                    <span className={styles.omegaPlayerLabel}>Trance</span>
                  </button>
                  <button
                    className={styles.omegaPlayerButton}
                    onClick={() => handleOmegaPlayerClick("melodies")}
                    type="button"
                    title="Melodies Player - Click to play/pause"
                  >
                    <MiniWaveform isPlaying={playerStates.melodies} />
                    <span className={styles.omegaPlayerLabel}>Melodies</span>
                  </button>
                </div>
              </div>
            </div>

          {/* Portfolio Tracker - Add Wallet */}
          <div className={`${styles.card} ${styles.portfolioTrackerCard}`}>
            <div className={styles.cardHeader}>
              <svg
                className={styles.cardIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H21V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" fill="currentColor" />
              </svg>
              <span className={styles.cardTitle}>Portfolio Tracker</span>
            </div>
            <div className={styles.cardContent}>
              <WalletTrackerInput pgt={pgt} />
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Wallet Tracker Input Component
function WalletTrackerInput({ pgt }: { pgt: ReturnType<typeof usePGT> }) {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState<string>("");
  const [label, setLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-detect network from address
  useEffect(() => {
    if (!address.trim()) {
      setNetwork("");
      return;
    }

    const addr = address.trim();
    // Ethereum format: 0x + 40 hex chars = 42 total
    if (addr.startsWith("0x") && addr.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setNetwork("ethereum");
    }
    // Solana hex-encoded: 64 hex chars
    else if (addr.length === 64 && /^[0-9a-fA-F]+$/.test(addr)) {
      setNetwork("solana");
    }
    // Solana base58: 32-44 chars
    else if (addr.length >= 32 && addr.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(addr)) {
      setNetwork("solana");
    }
    // Default to empty if unknown
    else {
      setNetwork("");
    }
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    if (!network) {
      setError("Could not detect network. Please specify network manually.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await pgt.addWallet(address.trim(), network, label.trim() || undefined);
      
      if (result.success) {
        setSuccess(true);
        setAddress("");
        setLabel("");
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(result.error || "Failed to add wallet");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add wallet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.walletTrackerForm}>
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel} htmlFor="wallet-address">
          Wallet Address
        </label>
        <input
          id="wallet-address"
          type="text"
          className={styles.walletInput}
          placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {network && (
        <div className={styles.networkIndicator}>
          <span className={styles.networkLabel}>Network:</span>
          <span className={styles.networkValue}>{network}</span>
        </div>
      )}

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel} htmlFor="wallet-label">
          Label (Optional)
        </label>
        <input
          id="wallet-label"
          type="text"
          className={styles.walletInput}
          placeholder="My Wallet"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage}>
          ✓ Wallet added successfully!
        </div>
      )}

      <button
        type="submit"
        className={styles.trackButton}
        disabled={isLoading || !address.trim() || !network}
      >
        {isLoading ? "Adding..." : "Track Wallet"}
      </button>

      {pgt.wallets.length > 0 && (
        <div className={styles.trackedWalletsInfo}>
          <span className={styles.trackedCount}>
            {pgt.wallets.length} wallet{pgt.wallets.length !== 1 ? "s" : ""} tracked
          </span>
        </div>
      )}
    </form>
  );
}

