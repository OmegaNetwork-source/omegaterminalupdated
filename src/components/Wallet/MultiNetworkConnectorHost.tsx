"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BrowserProvider, formatEther } from "ethers";

import {
  NETWORK_SELECTOR_EVENT,
  type NetworkSelectorRequest,
} from "@/lib/wallet/networkSelector";
import {
  forceMetaMaskProvider,
  getEthereumProvider,
  waitForWalletProvider,
} from "@/lib/wallet/detection";

interface NetworkDefinition {
  key: string;
  name: string;
  chainId: string;
  chainIdDecimal: number;
  rpcUrl: string;
  explorerUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  icon: string;
  logo?: string;
  walletType: "metamask" | "phantom";
}

type NetworkMap = Record<string, NetworkDefinition>;

const NETWORKS: NetworkMap = {
  ethereum: {
    key: "ethereum",
    name: "Ethereum",
    chainId: "0x1",
    chainIdDecimal: 1,
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io",
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
    icon: "⟠",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    walletType: "metamask",
  },
  bsc: {
    key: "bsc",
    name: "BNB Smart Chain",
    chainId: "0x38",
    chainIdDecimal: 56,
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorerUrl: "https://bscscan.com",
    currency: { name: "BNB", symbol: "BNB", decimals: 18 },
    icon: "🟡",
    logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    walletType: "metamask",
  },
  polygon: {
    key: "polygon",
    name: "Polygon",
    chainId: "0x89",
    chainIdDecimal: 137,
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    currency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    icon: "🟣",
    logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
    walletType: "metamask",
  },
  arbitrum: {
    key: "arbitrum",
    name: "Arbitrum One",
    chainId: "0xa4b1",
    chainIdDecimal: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
    icon: "🔵",
    logo: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
    walletType: "metamask",
  },
  optimism: {
    key: "optimism",
    name: "Optimism",
    chainId: "0xa",
    chainIdDecimal: 10,
    rpcUrl: "https://mainnet.optimism.io",
    explorerUrl: "https://optimistic.etherscan.io",
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
    icon: "🔴",
    logo: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
    walletType: "metamask",
  },
  base: {
    key: "base",
    name: "Base",
    chainId: "0x2105",
    chainIdDecimal: 8453,
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
    icon: "🔷",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    walletType: "metamask",
  },
  omega: {
    key: "omega",
    name: "Omega Network",
    chainId: "0x4e454228",
    chainIdDecimal: 1313161256,
    rpcUrl: "https://0x4e454228.rpc.aurora-cloud.dev",
    explorerUrl: "https://0x4e454228.explorer.aurora-cloud.dev",
    currency: { name: "Omega", symbol: "OMEGA", decimals: 18 },
    icon: "Ω",
    walletType: "metamask",
  },
  solana: {
    key: "solana",
    name: "Solana",
    chainId: "solana-mainnet",
    chainIdDecimal: 0,
    rpcUrl: "https://api.mainnet-beta.solana.com",
    explorerUrl: "https://explorer.solana.com",
    currency: { name: "Solana", symbol: "SOL", decimals: 9 },
    icon: "◎",
    logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    walletType: "phantom",
  },
};

const EVM_NETWORK_KEYS = [
  "ethereum",
  "bsc",
  "polygon",
  "arbitrum",
  "optimism",
  "base",
  "omega",
];

interface SelectorState {
  open: boolean;
  isProcessing: boolean;
  selectedNetwork?: NetworkDefinition;
  error?: string | null;
}

export function MultiNetworkConnectorHost(): JSX.Element | null {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<SelectorState>({
    open: false,
    isProcessing: false,
  });
  const requestRef = useRef<NetworkSelectorRequest | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeModal = useCallback(() => {
    setState({ open: false, isProcessing: false });
    requestRef.current = null;
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<NetworkSelectorRequest>;
      console.log('[MultiNetworkConnectorHost] Event received:', {
        hasDetail: !!customEvent.detail,
        source: customEvent.detail?.source,
      });
      requestRef.current = customEvent.detail;
      setState({ open: true, isProcessing: false, error: null });
      console.log('[MultiNetworkConnectorHost] Modal state set to open');
    };

    console.log('[MultiNetworkConnectorHost] Setting up event listener for:', NETWORK_SELECTOR_EVENT);
    window.addEventListener(NETWORK_SELECTOR_EVENT, handler);
    return () => {
      window.removeEventListener(NETWORK_SELECTOR_EVENT, handler);
    };
  }, []);

  const resolveLogType = (type: string | undefined) => {
    if (
      type === "success" ||
      type === "error" ||
      type === "warning" ||
      type === "output"
    ) {
      return type;
    }
    return "info" as const;
  };

  const log = useCallback((message: string, type?: string) => {
    const detail = requestRef.current;
    if (!detail) {
      return;
    }

    const resolvedType = resolveLogType(type);

    if (typeof detail.log === "function") {
      detail.log(message, resolvedType);
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "[MultiNetworkConnector] Missing log bridge for network selector request",
        {
          message,
          type: resolvedType,
        }
      );
    }
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  };

  const handleConnectEvm = useCallback(
    async (network: NetworkDefinition) => {
      const detail = requestRef.current;
      if (!detail) return;

      setState((prev) => ({ ...prev, isProcessing: true, error: null }));

      // Check BEFORE waiting
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug(
          "[MultiNetworkConnector] BEFORE detection - window.ethereum:",
          {
            exists: Boolean((window as any).ethereum),
            isMetaMask: (window as any).ethereum?.isMetaMask,
            isPhantom: (window as any).ethereum?.isPhantom,
            hasRequest: typeof (window as any).ethereum?.request === "function",
            providers: (window as any).ethereum?.providers,
          }
        );
      }

      const detection = await waitForWalletProvider({
        timeout: 4000,
        checkInterval: 120,
        requireMetaMask: true,
      });

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug("[MultiNetworkConnector] provider detection", detection);
        const currentEthereum = (
          window as typeof window & {
            ethereum?: any;
          }
        ).ethereum;
        // eslint-disable-next-line no-console
        console.debug("[MultiNetworkConnector] window.ethereum snapshot", {
          hasProviders: Array.isArray(currentEthereum?.providers),
          isMetaMask: currentEthereum?.isMetaMask,
          isPhantom: currentEthereum?.isPhantom,
          providerInfo: currentEthereum?.providerInfo,
          hasMetamaskShim: Boolean(currentEthereum?._metamask),
          ethereumExists: Boolean(currentEthereum),
          detectionProviderExists: Boolean(detection.provider),
          detectionProviderIsMetaMask: detection.provider?.isMetaMask,
          requestFunctionExists:
            typeof detection.provider?.request === "function",
        });
        // eslint-disable-next-line no-console
        console.debug(
          "[MultiNetworkConnector] About to call eth_requestAccounts on provider:",
          detection.provider
        );
      }

      let ethereum = detection.provider;

      if (!ethereum) {
        const forcedMetaMask = forceMetaMaskProvider();
        if (forcedMetaMask) {
          (window as typeof window & { ethereum?: any }).ethereum =
            forcedMetaMask;
        }
        ethereum = forcedMetaMask || getEthereumProvider();
      }

      if (!ethereum) {
        log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
        log("", "info");
        log("    ⚠️  NO EVM WALLET DETECTED", "error");
        log("", "info");
        log("    🎁 EXCLUSIVE OFFER: Create Your Ω OMEGA Wallet!", "success");
        log("", "info");
        log("    💎 What You Get:", "info");
        log("       • 🆓 Free Omega Network wallet (browser-based)", "output");
        log("       • 💰 Instant 0.1 OMEGA token airdrop", "output");
        log("       • ⛏️  Ready for mining & claiming rewards", "output");
        log("       • 🔐 Secure, encrypted private key storage", "output");
        log("       • 🚀 Start trading & earning immediately", "output");
        log("", "info");
        log("    ⌨️  Your Choice:", "info");
        log(
          '       • Type "yes" → Generate Ω OMEGA Wallet + FREE 0.1 OMEGA',
          "success"
        );
        log('       • Type "no" → Cancel (install MetaMask instead)', "output");
        log("", "info");
        log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
        if (detection.timedOut) {
          log(
            "MetaMask provider did not initialize in time. Ensure the extension is enabled for this site and reload.",
            "warning"
          );
        }
        setState((prev) => ({ ...prev, isProcessing: false }));
        return;
      }

      (window as typeof window & { ethereum?: any }).ethereum = ethereum;

      try {
        log(`🌐 Connecting to ${network.name}...`, "info");

        // Debug: Log the ethereum object before calling
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.debug(
            "[MultiNetworkConnector] About to call eth_requestAccounts on ethereum:",
            {
              ethereum,
              isProxy: typeof ethereum === "object",
              hasRequest: typeof ethereum?.request === "function",
              ethereumKeys: ethereum ? Object.keys(ethereum) : [],
            }
          );
        }

        const accounts: string[] = await ethereum.request({
          method: "eth_requestAccounts",
        });

        if (!accounts || accounts.length === 0) {
          log("❌ No accounts found. Please unlock MetaMask.", "error");
          setState((prev) => ({ ...prev, isProcessing: false }));
          return;
        }

        const currentChainId: string = await ethereum.request({
          method: "eth_chainId",
        });

        if (currentChainId.toLowerCase() !== network.chainId.toLowerCase()) {
          log(`🔄 Switching to ${network.name}...`, "info");
          try {
            await ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: network.chainId }],
            });
          } catch (switchError: any) {
            if (switchError?.code === 4902) {
              log(`➕ Adding ${network.name} to MetaMask...`, "info");
              try {
                await ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: network.chainId,
                      chainName: network.name,
                      nativeCurrency: network.currency,
                      rpcUrls: [network.rpcUrl],
                      blockExplorerUrls: [network.explorerUrl],
                    },
                  ],
                });
              } catch (addError: any) {
                log(`❌ Failed to add network: ${addError.message}`, "error");
                setState((prev) => ({ ...prev, isProcessing: false }));
                return;
              }
            } else {
              log(
                `❌ Failed to switch network: ${
                  switchError?.message ?? switchError
                }`,
                "error"
              );
              setState((prev) => ({ ...prev, isProcessing: false }));
              return;
            }
          }
        }

        const browserProvider = new BrowserProvider(ethereum);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();

        await detail.wallet.initializeExternalConnection({
          provider: browserProvider,
          address,
          chainId: network.chainIdDecimal,
          walletType: "metamask",
          networkName: network.name,
        });

        log("", "info");
        log(`✅ Connected to ${network.name}!`, "success");
        log(`📍 Network: ${network.name}`, "info");
        log(`💰 Currency: ${network.currency.symbol}`, "info");
        log(`👛 Address: ${formatAddress(address)}`, "info");
        log("", "info");

        if (detail.sound?.playWalletConnectSound) {
          detail.sound.playWalletConnectSound().catch(() => undefined);
        }

        try {
          const balance = await browserProvider.getBalance(address);
          const formatted = formatEther(balance);
          log(
            `💰 ${network.name} Wallet Balance: ${Number(formatted).toFixed(
              4
            )} ${network.currency.symbol}`,
            "success"
          );
        } catch (balanceError) {
          log(
            `⚠️  Connected but could not fetch balance: ${String(
              balanceError
            )}`,
            "warning"
          );
        }

        closeModal();
      } catch (error: any) {
        log(`❌ Connection failed: ${error?.message ?? error}`, "error");
        setState((prev) => ({ ...prev, isProcessing: false }));

        // Close modal on error after a brief delay to show error message
        setTimeout(() => {
          closeModal();
        }, 2000);
      } finally {
        setState((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    [closeModal, log]
  );

  const handleConnectNetwork = useCallback(
    async (networkKey: string) => {
      const network = NETWORKS[networkKey];
      if (!network) {
        return;
      }

      if (network.walletType === "metamask") {
        await handleConnectEvm(network);
        setState((prev) => ({ ...prev, isProcessing: false }));
        return;
      }

      log(
        "❌ Phantom wallet support is not yet available in this build.",
        "error"
      );
      setState((prev) => ({ ...prev, isProcessing: false }));
    },
    [handleConnectEvm, log]
  );

  const modalContent = useMemo(() => {
    if (!state.open) {
      return null;
    }

    return (
      <div 
        className="network-modal" 
        data-state-open={state.open}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'auto',
        }}
      >
        <div
          className="network-modal-overlay"
          onClick={() => !state.isProcessing && closeModal()}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 1,
          }}
        />
        <div 
          className="network-modal-content"
          style={{
            position: 'relative',
            background: `linear-gradient(135deg, var(--palette-surface, rgba(10, 15, 30, 0.95)) 0%, var(--palette-bg, rgba(15, 20, 35, 0.95)) 100%)`,
            border: `2px solid var(--palette-primary, #00d4ff)`,
            borderRadius: '12px',
            boxShadow: `0 0 40px var(--palette-primary-glow, rgba(0, 212, 255, 0.3)), inset 0 0 20px var(--palette-primary-glow, rgba(0, 212, 255, 0.1))`,
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            zIndex: 2,
            padding: 0,
            animation: 'modalSlideIn 0.3s ease-out',
            transition: 'all 0.3s ease',
          }}
        >
          <div 
            className="network-modal-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: `1px solid var(--palette-border, rgba(0, 212, 255, 0.3))`,
              transition: 'border-color 0.3s ease',
            }}
          >
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              color: 'var(--palette-primary, #00d4ff)',
              fontFamily: "var(--theme-font-primary, 'Courier New'), monospace",
              textTransform: 'uppercase',
              letterSpacing: '2px',
              transition: 'color 0.3s ease',
            }}>🌐 Select Network</h2>
            <button
              className="network-modal-close"
              onClick={() => !state.isProcessing && closeModal()}
              aria-label="Close selector"
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--palette-muted, #666)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--palette-error, #ff0000)';
                e.currentTarget.style.background = 'rgba(255, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--palette-muted, #666)';
                e.currentTarget.style.background = 'none';
              }}
            >
              ✕
            </button>
          </div>
          <div 
            className="network-modal-body"
            style={{
              padding: '20px',
            }}
          >
            <div 
              className="network-section"
              style={{
                marginBottom: '20px',
              }}
            >
              <div 
                className="network-section-title"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--palette-primary, #00d4ff)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'color 0.3s ease',
                }}
              >⟠ EVM NETWORKS</div>
              <div 
                className="network-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                }}
              >
                {EVM_NETWORK_KEYS.map((key) => {
                  const network = NETWORKS[key];
                  if (!network) return null;
                  return (
                    <button
                      key={network.key}
                      className="network-button"
                      onClick={() => handleConnectNetwork(network.key)}
                      disabled={state.isProcessing}
                      type="button"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        background: 'var(--palette-bg-overlay, rgba(0, 212, 255, 0.05))',
                        border: `1px solid var(--palette-border, rgba(0, 212, 255, 0.3))`,
                        borderRadius: '8px',
                        cursor: state.isProcessing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        minHeight: '120px',
                        opacity: state.isProcessing ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!state.isProcessing) {
                          e.currentTarget.style.background = 'var(--palette-primary-glow, rgba(0, 212, 255, 0.15))';
                          e.currentTarget.style.borderColor = 'var(--palette-primary, #00d4ff)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = `0 4px 12px var(--palette-primary-glow, rgba(0, 212, 255, 0.3))`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--palette-bg-overlay, rgba(0, 212, 255, 0.05))';
                        e.currentTarget.style.borderColor = 'var(--palette-border, rgba(0, 212, 255, 0.3))';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div 
                        className="network-logo-wrapper"
                        style={{
                          marginBottom: '12px',
                          width: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {network.key === "omega" ? (
                          <div 
                            className="network-icon omega-network-icon"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '48px',
                              height: '48px',
                              background: 'var(--palette-surface, rgba(0, 0, 0, 0.9))',
                              borderRadius: '50%',
                              fontSize: '32px',
                              fontWeight: 'bold',
                              fontFamily: "serif, 'Times New Roman'",
                              color: 'var(--palette-text, #ffffff)',
                              boxShadow: `0 0 12px var(--palette-primary-glow, rgba(255, 255, 255, 0.6))`,
                              border: `2px solid var(--palette-primary, #ffffff)`,
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Ω
                          </div>
                        ) : network.logo ? (
                          <img
                            src={network.logo}
                            alt={network.name}
                            className="network-logo"
                            style={{
                              width: '48px',
                              height: '48px',
                              objectFit: 'contain',
                            }}
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="network-icon"
                            style={{
                              display: 'none',
                              fontSize: '32px',
                            }}
                          >
                            {network.icon}
                          </div>
                        )}
                      </div>
                      <div 
                        className="network-name"
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--palette-primary, #00d4ff)',
                          marginBottom: '4px',
                          textAlign: 'center',
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {network.name}
                      </div>
                      <div 
                        className="network-symbol"
                        style={{
                          fontSize: '12px',
                          color: 'var(--palette-muted, #99ccff)',
                          textAlign: 'center',
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {network.currency.symbol}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div 
              className="network-section"
              style={{
                marginBottom: '20px',
              }}
            >
              <div 
                className="network-section-title"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--palette-primary, #00d4ff)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'color 0.3s ease',
                }}
              >◎ SOLANA</div>
              <div 
                className="network-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                }}
              >
                <button
                  className="network-button"
                  onClick={() => handleConnectNetwork("solana")}
                  disabled={state.isProcessing}
                  type="button"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    background: 'var(--palette-bg-overlay, rgba(0, 212, 255, 0.05))',
                    border: `1px solid var(--palette-border, rgba(0, 212, 255, 0.3))`,
                    borderRadius: '8px',
                    cursor: state.isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '120px',
                    opacity: state.isProcessing ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!state.isProcessing) {
                      e.currentTarget.style.background = 'var(--palette-primary-glow, rgba(0, 212, 255, 0.15))';
                      e.currentTarget.style.borderColor = 'var(--palette-primary, #00d4ff)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 4px 12px var(--palette-primary-glow, rgba(0, 212, 255, 0.3))`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--palette-bg-overlay, rgba(0, 212, 255, 0.05))';
                    e.currentTarget.style.borderColor = 'var(--palette-border, rgba(0, 212, 255, 0.3))';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div 
                    className="network-logo-wrapper"
                    style={{
                      marginBottom: '12px',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {NETWORKS.solana?.logo && (
                      <img
                        src={NETWORKS.solana.logo}
                        alt="Solana"
                        className="network-logo"
                        style={{
                          width: '48px',
                          height: '48px',
                          objectFit: 'contain',
                        }}
                      />
                    )}
                  </div>
                  <div 
                    className="network-name"
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--palette-primary, #00d4ff)',
                      marginBottom: '4px',
                      textAlign: 'center',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {NETWORKS.solana?.name || 'Solana'}
                  </div>
                  <div 
                    className="network-symbol"
                    style={{
                      fontSize: '12px',
                      color: 'var(--palette-muted, #99ccff)',
                      textAlign: 'center',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {NETWORKS.solana?.currency.symbol || 'SOL'}
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div 
            className="network-modal-footer"
            style={{
              padding: '20px',
              borderTop: `1px solid var(--palette-border, rgba(0, 212, 255, 0.3))`,
              textAlign: 'center',
              transition: 'border-color 0.3s ease',
            }}
          >
            <p
              style={{
                margin: 0,
                color: 'var(--palette-muted, #99ccff)',
                fontSize: '13px',
                transition: 'color 0.3s ease',
              }}
            >
              💡 Make sure you have MetaMask (EVM) or Phantom (Solana) installed
            </p>
          </div>
        </div>
      </div>
    );
  }, [closeModal, handleConnectNetwork, state.isProcessing, state.open]);

  if (!mounted) {
    return null;
  }

  return modalContent ? createPortal(modalContent, document.body) : null;
}
