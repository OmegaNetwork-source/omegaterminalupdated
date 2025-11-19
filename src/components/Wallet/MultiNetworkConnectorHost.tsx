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
  walletType: "metamask" | "phantom" | "near";
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
  arbitrumSepolia: {
    key: "arbitrumSepolia",
    name: "Arbitrum Sepolia",
    chainId: "0x66eee", // 421614 in hex
    chainIdDecimal: 421614,
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    explorerUrl: "https://sepolia.arbiscan.io",
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
    icon: "🧪",
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
    chainIdDecimal: 1313161768,
    rpcUrl: "https://0x4e454228.rpc.aurora-cloud.dev",
    explorerUrl: "https://0x4e454228.explorer.aurora-cloud.dev",
    currency: { name: "Omega", symbol: "OMEGA", decimals: 18 },
    icon: "Ω",
    walletType: "metamask",
  },
  bellecour: {
    key: "bellecour",
    name: "iExec Bellecour",
    chainId: "0x86", // 134 in hex
    chainIdDecimal: 134,
    rpcUrl: "https://bellecour.iex.ec",
    explorerUrl: "https://blockscout-bellecour.iex.ec",
    currency: { name: "xRLC", symbol: "xRLC", decimals: 18 },
    icon: "💬",
    logo: "https://assets.coingecko.com/coins/images/646/small/pL1VuXm.png", // iExec RLC logo
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
  near: {
    key: "near",
    name: "NEAR Protocol",
    chainId: "near-mainnet",
    chainIdDecimal: 0,
    rpcUrl: "https://rpc.mainnet.near.org",
    explorerUrl: "https://nearblocks.io",
    currency: { name: "NEAR", symbol: "NEAR", decimals: 24 },
    icon: "🔷",
    logo: "https://assets.coingecko.com/coins/images/10365/small/near_icon.png",
    walletType: "near",
  },
  rome: {
    key: "rome",
    name: "Rome Protocol",
    chainId: "0x1d97c", // 121212 in hex
    chainIdDecimal: 121212,
    rpcUrl: "https://esquiline-i.devnet.romeprotocol.xyz",
    explorerUrl: "https://romescout-esquiline-i.devnet.romeprotocol.xyz",
    currency: { name: "RSOL", symbol: "RSOL", decimals: 18 },
    icon: "🏛️",
    logo: undefined, // Rome doesn't have a CoinGecko entry yet
    walletType: "metamask",
  },
  fair: {
    key: "fair",
    name: "FAIR Testnet",
    chainId: "0x3a7", // 935 in hex
    chainIdDecimal: 935,
    rpcUrl: "https://testnet-rpc.fair.cloud",
    explorerUrl: "https://testnet-explorer.fair.cloud",
    currency: { name: "FAIR", symbol: "FAIR", decimals: 18 },
    icon: "⚖️",
    logo: undefined, // Fair doesn't have a CoinGecko entry yet
    walletType: "metamask",
  },
  monad: {
    key: "monad",
    name: "Monad",
    chainId: "0x1d4c0", // 120000 in hex (Monad testnet)
    chainIdDecimal: 120000,
    rpcUrl: "https://testnet-rpc.monad.xyz",
    explorerUrl: "https://testnet-explorer.monad.xyz",
    currency: { name: "MON", symbol: "MON", decimals: 18 },
    icon: "🔷",
    logo: undefined, // Monad doesn't have a CoinGecko entry yet
    walletType: "metamask",
  },
};

const EVM_NETWORK_KEYS = [
  "ethereum",
  "bsc",
  "polygon",
  "arbitrum",
  "arbitrumSepolia",
  "optimism",
  "base",
  "omega",
  "bellecour",
  "rome",
  "fair",
  "monad",
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
      console.log("[MultiNetworkConnectorHost] Event received:", {
        hasDetail: !!customEvent.detail,
        source: customEvent.detail?.source,
      });
      requestRef.current = customEvent.detail;
      setState({ open: true, isProcessing: false, error: null });
      console.log("[MultiNetworkConnectorHost] Modal state set to open");
    };

    console.log(
      "[MultiNetworkConnectorHost] Setting up event listener for:",
      NETWORK_SELECTOR_EVENT
    );
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
        // Show connecting message with uniform HTML output
        if (detail.logHtml) {
          const connectingHtml = `
            <div style="
              background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent));
              border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent);
              border-radius: 12px;
              padding: 16px;
              margin: 10px 0;
              display: flex;
              align-items: center;
              gap: 12px;
            ">
              <div style="color: var(--palette-primary, #00d4ff);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; animation: rotate 1s linear infinite;">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M3 21v-5h5"></path>
                </svg>
              </div>
              <div style="flex: 1;">
                <div style="
                  font-size: 16px;
                  font-weight: 600;
                  color: var(--palette-primary, #00d4ff);
                ">Connecting to ${network.name}...</div>
              </div>
            </div>
            <style>
              @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            </style>
          `;
          detail.logHtml(connectingHtml);
        } else {
          log(`Connecting to ${network.name}...`, "info");
        }

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
          log("No accounts found. Please unlock MetaMask.", "error");
          setState((prev) => ({ ...prev, isProcessing: false }));
          return;
        }

        const currentChainId: string = await ethereum.request({
          method: "eth_chainId",
        });

        if (currentChainId.toLowerCase() !== network.chainId.toLowerCase()) {
          log(`Switching to ${network.name}...`, "info");
          try {
            await ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: network.chainId }],
            });
          } catch (switchError: any) {
            if (switchError?.code === 4902) {
              log(`Adding ${network.name} to MetaMask...`, "info");
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
                log(`Failed to add network: ${addError.message}`, "error");
                setState((prev) => ({ ...prev, isProcessing: false }));
                return;
              }
            } else {
              log(
                `Failed to switch network: ${
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

        // Show connection success with uniform HTML output
        if (detail.logHtml) {
          const successHtml = `
            <div style="
              background: linear-gradient(135deg, color-mix(in srgb, var(--palette-secondary, #00ff88) 12%, transparent), color-mix(in srgb, var(--palette-success, #00ff88) 8%, transparent));
              border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
              border-radius: 12px;
              padding: 20px;
              margin: 12px 0;
            ">
              <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
              ">
                <div style="color: var(--palette-secondary, #00ff88);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div style="
                  font-size: 20px;
                  font-weight: 700;
                  color: var(--palette-secondary, #00ff88);
                  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
                ">Connected to ${network.name}!</div>
              </div>
              <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
                margin-top: 16px;
              ">
                <div style="
                  background: color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent);
                  border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent);
                  border-radius: 8px;
                  padding: 12px;
                ">
                  <div style="
                    font-size: 11px;
                    color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent);
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                  ">Network</div>
                  <div style="
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--palette-text, #ccd4e0);
                  ">${network.name}</div>
                </div>
                <div style="
                  background: color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent);
                  border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent);
                  border-radius: 8px;
                  padding: 12px;
                ">
                  <div style="
                    font-size: 11px;
                    color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent);
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                  ">Currency</div>
                  <div style="
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--palette-text, #ccd4e0);
                  ">${network.currency.symbol}</div>
                </div>
                <div style="
                  background: color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent);
                  border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent);
                  border-radius: 8px;
                  padding: 12px;
                ">
                  <div style="
                    font-size: 11px;
                    color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent);
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                  ">Address</div>
                  <div style="
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--palette-text, #ccd4e0);
                    font-family: 'Courier New', monospace;
                  ">${formatAddress(address)}</div>
                </div>
              </div>
            </div>
          `;
          detail.logHtml(successHtml);
        } else {
          log("", "info");
          log(`Connected to ${network.name}!`, "success");
          log(`Network: ${network.name}`, "info");
          log(`Currency: ${network.currency.symbol}`, "info");
          log(`Address: ${formatAddress(address)}`, "info");
          log("", "info");
        }

        if (detail.sound?.playWalletConnectSound) {
          detail.sound.playWalletConnectSound().catch(() => undefined);
        }

        try {
          const balance = await browserProvider.getBalance(address);
          const formatted = formatEther(balance);
          const balanceNum = Number(formatted).toFixed(4);

          if (detail.logHtml) {
            const balanceHtml = `
              <div style="
                background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent));
                border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
                border-radius: 8px;
                padding: 14px 16px;
                margin: 8px 0;
                display: flex;
                align-items: center;
                gap: 12px;
              ">
                <div style="color: var(--palette-secondary, #00ff88);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v12M6 12h12"></path>
                  </svg>
                </div>
                <div style="flex: 1;">
                  <div style="
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--palette-secondary, #00ff88);
                  ">${network.name} Wallet Balance: ${balanceNum} ${network.currency.symbol}</div>
                </div>
              </div>
            `;
            detail.logHtml(balanceHtml);
          } else {
            log(
              `${network.name} Wallet Balance: ${balanceNum} ${network.currency.symbol}`,
              "success"
            );
          }
        } catch (balanceError) {
          if (detail.logHtml) {
            const warningHtml = `
              <div style="
                background: color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent);
                border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 25%, transparent);
                border-radius: 8px;
                padding: 12px 16px;
                margin: 8px 0;
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--palette-text, #ccd4e0);
                font-size: 0.9em;
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; color: var(--palette-warning, #ffa502);">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Connected but could not fetch balance: ${String(
                  balanceError
                )}</span>
              </div>
            `;
            detail.logHtml(warningHtml);
          } else {
            log(
              `Connected but could not fetch balance: ${String(balanceError)}`,
              "warning"
            );
          }
        }

        closeModal();
      } catch (error: any) {
        log(`Connection failed: ${error?.message ?? error}`, "error");
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

  const handleConnectNear = useCallback(
    async (network: NetworkDefinition) => {
      const detail = requestRef.current;
      if (!detail) return;

      setState((prev) => ({ ...prev, isProcessing: true, error: null }));

      try {
        log("🔌 Connecting to NEAR Protocol...", "info");
        log("", "info");
        log("⚠️  NEAR wallet authentication requires a redirect", "warning");
        log("You will be redirected to NEAR wallet for authentication", "info");
        log(
          "After signing in, you'll be redirected back to the terminal",
          "info"
        );
        log("", "info");

        // Close modal first
        closeModal();

        // Execute the near connect command through the terminal
        // The terminal's executeCommand will handle the multichain context properly
        if (detail && typeof window !== "undefined") {
          // Use a small delay to ensure the modal closes first
          setTimeout(async () => {
            // Try to access the terminal's executeCommand through window
            // This is the standard way to trigger commands from UI components
            if ((window as any).__omegaExecuteCommand) {
              await (window as any).__omegaExecuteCommand("near connect");
            } else if (detail.log) {
              // Fallback: log a message and let user know to use the command
              detail.log(
                "💡 Use 'near connect' command to connect to NEAR wallet",
                "info"
              );
              detail.log(
                "NEAR wallet requires a redirect for authentication",
                "warning"
              );
            }
          }, 100);
        }
      } catch (error: any) {
        log(`❌ NEAR connection failed: ${error.message}`, "error");
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

      if (network.walletType === "near") {
        await handleConnectNear(network);
        return;
      }

      log(
        "Phantom wallet support is not yet available in this build.",
        "error"
      );
      setState((prev) => ({ ...prev, isProcessing: false }));
    },
    [handleConnectEvm, handleConnectNear, log]
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
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 1,
          transition: "opacity 0.3s ease",
          pointerEvents: "auto",
        }}
      >
        <div
          className="network-modal-overlay"
          onClick={() => !state.isProcessing && closeModal()}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 1,
          }}
        />
        <div
          className="network-modal-content"
          style={{
            position: "relative",
            background: `linear-gradient(135deg, var(--palette-surface, rgba(10, 15, 30, 0.95)) 0%, var(--palette-bg, rgba(15, 20, 35, 0.95)) 100%)`,
            border: `2px solid var(--palette-primary, #00d4ff)`,
            borderRadius: "12px",
            boxShadow: `0 0 40px var(--palette-primary-glow, rgba(0, 212, 255, 0.3)), inset 0 0 20px var(--palette-primary-glow, rgba(0, 212, 255, 0.1))`,
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
            zIndex: 2,
            padding: 0,
            animation: "modalSlideIn 0.3s ease-out",
            transition: "all 0.3s ease",
          }}
        >
          <div
            className="network-modal-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
              borderBottom: `1px solid var(--palette-border, rgba(0, 212, 255, 0.3))`,
              transition: "border-color 0.3s ease",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                color: "var(--palette-primary, #00d4ff)",
                fontFamily:
                  "var(--theme-font-primary, 'Courier New'), monospace",
                textTransform: "uppercase",
                letterSpacing: "2px",
                transition: "color 0.3s ease",
              }}
            >
              🌐 Select Network
            </h2>
            <button
              className="network-modal-close"
              onClick={() => !state.isProcessing && closeModal()}
              aria-label="Close selector"
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "var(--palette-muted, #666)",
                fontSize: "24px",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--palette-error, #ff0000)";
                e.currentTarget.style.background = "rgba(255, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--palette-muted, #666)";
                e.currentTarget.style.background = "none";
              }}
            >
              ✕
            </button>
          </div>
          <div
            className="network-modal-body"
            style={{
              padding: "20px",
            }}
          >
            <div
              className="network-section"
              style={{
                marginBottom: "20px",
              }}
            >
              <div
                className="network-section-title"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--palette-primary, #00d4ff)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  transition: "color 0.3s ease",
                }}
              >
                ⟠ EVM NETWORKS
              </div>
              <div
                className="network-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "12px",
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
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "16px",
                        background:
                          "var(--palette-bg-overlay, rgba(0, 212, 255, 0.05))",
                        border: `1px solid var(--palette-border, rgba(0, 212, 255, 0.3))`,
                        borderRadius: "8px",
                        cursor: state.isProcessing ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        minHeight: "120px",
                        opacity: state.isProcessing ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!state.isProcessing) {
                          e.currentTarget.style.background =
                            "var(--palette-primary-glow, rgba(0, 212, 255, 0.15))";
                          e.currentTarget.style.borderColor =
                            "var(--palette-primary, #00d4ff)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = `0 4px 12px var(--palette-primary-glow, rgba(0, 212, 255, 0.3))`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "var(--palette-bg-overlay, rgba(0, 212, 255, 0.05))";
                        e.currentTarget.style.borderColor =
                          "var(--palette-border, rgba(0, 212, 255, 0.3))";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        className="network-logo-wrapper"
                        style={{
                          marginBottom: "12px",
                          width: "48px",
                          height: "48px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {network.key === "omega" ? (
                          <div
                            className="network-icon omega-network-icon"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "48px",
                              height: "48px",
                              background:
                                "var(--palette-surface, rgba(0, 0, 0, 0.9))",
                              borderRadius: "50%",
                              fontSize: "32px",
                              fontWeight: "bold",
                              fontFamily: "serif, 'Times New Roman'",
                              color: "var(--palette-text, #ffffff)",
                              boxShadow: `0 0 12px var(--palette-primary-glow, rgba(255, 255, 255, 0.6))`,
                              border: `2px solid var(--palette-primary, #ffffff)`,
                              backdropFilter: "blur(10px)",
                              transition: "all 0.3s ease",
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
                              width: "48px",
                              height: "48px",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const fallback =
                                target.nextElementSibling as HTMLElement;
                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                        ) : (
                          <div
                            className="network-icon"
                            style={{
                              display: "none",
                              fontSize: "32px",
                            }}
                          >
                            {network.icon}
                          </div>
                        )}
                      </div>
                      <div
                        className="network-name"
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--palette-primary, #00d4ff)",
                          marginBottom: "4px",
                          textAlign: "center",
                          transition: "color 0.3s ease",
                        }}
                      >
                        {network.name}
                      </div>
                      <div
                        className="network-symbol"
                        style={{
                          fontSize: "12px",
                          color: "var(--palette-muted, #99ccff)",
                          textAlign: "center",
                          transition: "color 0.3s ease",
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
                marginBottom: "20px",
              }}
            >
              <div
                className="network-section-title"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--palette-primary, #00d4ff)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  transition: "color 0.3s ease",
                }}
              >
                ◎ SOLANA
              </div>
              <div
                className="network-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "12px",
                }}
              >
                <button
                  className="network-button"
                  onClick={() => handleConnectNetwork("solana")}
                  disabled={state.isProcessing}
                  type="button"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "16px",
                    background:
                      "var(--palette-bg-overlay, rgba(0, 212, 255, 0.05))",
                    border: `1px solid var(--palette-border, rgba(0, 212, 255, 0.3))`,
                    borderRadius: "8px",
                    cursor: state.isProcessing ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    minHeight: "120px",
                    opacity: state.isProcessing ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!state.isProcessing) {
                      e.currentTarget.style.background =
                        "var(--palette-primary-glow, rgba(0, 212, 255, 0.15))";
                      e.currentTarget.style.borderColor =
                        "var(--palette-primary, #00d4ff)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 4px 12px var(--palette-primary-glow, rgba(0, 212, 255, 0.3))`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "var(--palette-bg-overlay, rgba(0, 212, 255, 0.05))";
                    e.currentTarget.style.borderColor =
                      "var(--palette-border, rgba(0, 212, 255, 0.3))";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="network-logo-wrapper"
                    style={{
                      marginBottom: "12px",
                      width: "48px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {NETWORKS.solana?.logo && (
                      <img
                        src={NETWORKS.solana.logo}
                        alt="Solana"
                        className="network-logo"
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </div>
                  <div
                    className="network-name"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--palette-primary, #00d4ff)",
                      marginBottom: "4px",
                      textAlign: "center",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {NETWORKS.solana?.name || "Solana"}
                  </div>
                  <div
                    className="network-symbol"
                    style={{
                      fontSize: "12px",
                      color: "var(--palette-muted, #99ccff)",
                      textAlign: "center",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {NETWORKS.solana?.currency.symbol || "SOL"}
                  </div>
                </button>
              </div>
            </div>

            <div
              className="network-section"
              style={{
                marginBottom: "20px",
              }}
            >
              <div
                className="network-section-title"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--palette-primary, #00d4ff)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  transition: "color 0.3s ease",
                }}
              >
                🔷 NEAR PROTOCOL
              </div>
              <div
                className="network-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "12px",
                }}
              >
                <button
                  className="network-button"
                  onClick={() => handleConnectNetwork("near")}
                  disabled={state.isProcessing}
                  type="button"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "16px",
                    background:
                      "var(--palette-bg-overlay, rgba(0, 212, 255, 0.05))",
                    border: `1px solid var(--palette-border, rgba(0, 212, 255, 0.3))`,
                    borderRadius: "8px",
                    cursor: state.isProcessing ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    minHeight: "120px",
                    opacity: state.isProcessing ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!state.isProcessing) {
                      e.currentTarget.style.background =
                        "var(--palette-primary-glow, rgba(0, 212, 255, 0.15))";
                      e.currentTarget.style.borderColor =
                        "var(--palette-primary, #00d4ff)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 4px 12px var(--palette-primary-glow, rgba(0, 212, 255, 0.3))`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "var(--palette-bg-overlay, rgba(0, 212, 255, 0.05))";
                    e.currentTarget.style.borderColor =
                      "var(--palette-border, rgba(0, 212, 255, 0.3))";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="network-logo-wrapper"
                    style={{
                      marginBottom: "12px",
                      width: "48px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {NETWORKS.near?.logo && (
                      <img
                        src={NETWORKS.near.logo}
                        alt="NEAR Protocol"
                        className="network-logo"
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    )}
                    {!NETWORKS.near?.logo && (
                      <div
                        className="network-icon"
                        style={{
                          display: "flex",
                          fontSize: "32px",
                        }}
                      >
                        {NETWORKS.near?.icon || "🔷"}
                      </div>
                    )}
                  </div>
                  <div
                    className="network-name"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--palette-primary, #00d4ff)",
                      marginBottom: "4px",
                      textAlign: "center",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {NETWORKS.near?.name || "NEAR Protocol"}
                  </div>
                  <div
                    className="network-symbol"
                    style={{
                      fontSize: "12px",
                      color: "var(--palette-muted, #99ccff)",
                      textAlign: "center",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {NETWORKS.near?.currency.symbol || "NEAR"}
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div
            className="network-modal-footer"
            style={{
              padding: "20px",
              borderTop: `1px solid var(--palette-border, rgba(0, 212, 255, 0.3))`,
              textAlign: "center",
              transition: "border-color 0.3s ease",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "var(--palette-muted, #99ccff)",
                fontSize: "13px",
                transition: "color 0.3s ease",
              }}
            >
              💡 Make sure you have MetaMask (EVM), Phantom (Solana), or NEAR
              Wallet installed
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
