"use client";

/**
 * PGT Provider
 * Portfolio Global Tracker - Manages wallet tracking and portfolio data
 * Based on vanilla pgt-terminal-integration.js
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { JsonRpcProvider, formatEther } from "ethers";
import { PublicKey } from "@solana/web3.js";
import type { PGTWallet, PGTPortfolio } from "@/types/api";

interface PGTContextValue {
  wallets: PGTWallet[];
  portfolio: PGTPortfolio | null;
  isLoading: boolean;
  addWallet: (address: string, network: string, label?: string) => Promise<{ success: boolean; error?: string }>;
  removeWallet: (address: string, network: string) => Promise<{ success: boolean; error?: string }>;
  getWallet: (address: string, network: string) => PGTWallet | null;
  refreshPortfolio: () => Promise<void>;
  refreshWallet: (address: string, network: string) => Promise<void>;
}

const PGTContext = createContext<PGTContextValue | null>(null);

export function PGTProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<PGTWallet[]>([]);
  const [portfolio, setPortfolio] = useState<PGTPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePortfolio = useCallback((walletsList: PGTWallet[]) => {
    let totalValue = 0;
    let totalChange24h = 0;
    const networks = new Set<string>();

    walletsList.forEach((w) => {
      totalValue += w.totalValue || 0;
      totalChange24h += w.change24h || 0;
      networks.add(w.network);
    });

    // Calculate weighted average 24h change percentage
    // Formula: (sum of all wallet 24h changes) / (sum of all wallet values) * 100
    let totalChange24hPercent = 0;
    if (totalValue > 0) {
      totalChange24hPercent = (totalChange24h / totalValue) * 100;
    }
    
    // Ensure we're not dividing by zero and handle edge cases
    if (isNaN(totalChange24hPercent) || !isFinite(totalChange24hPercent)) {
      console.warn("Invalid totalChange24hPercent calculated, defaulting to 0");
      totalChange24hPercent = 0;
    }

    const portfolioData = {
      totalValue,
      totalChange24h,
      totalChange24hPercent,
      walletCount: walletsList.length,
      networks: Array.from(networks),
      wallets: walletsList.map((w) => ({
        address: w.address,
        network: w.network,
        label: w.label,
        totalValue: w.totalValue,
        change24h: w.change24h,
        change24hPercent: w.change24hPercent,
        lastUpdated: w.lastUpdated,
      })),
    };

    console.log("📊 Portfolio calculated:", portfolioData);
    setPortfolio(portfolioData);
  }, []);

  const loadWallets = useCallback(() => {
    try {
      if (typeof window === "undefined") return;

      const saved = localStorage.getItem("omega-pgt-wallets");
      if (saved) {
        const parsedWallets = JSON.parse(saved);
        console.log(`📂 Loaded ${parsedWallets.length} wallets from localStorage`);
        setWallets(parsedWallets);

        // Calculate portfolio from loaded wallets
        calculatePortfolio(parsedWallets);
      }
    } catch (error) {
      console.error("Error loading wallets:", error);
      setWallets([]);
    }
  }, [calculatePortfolio]);

  // Load wallets from localStorage on mount
  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const saveWallets = useCallback(
    (walletsToSave: PGTWallet[]) => {
      try {
        if (typeof window === "undefined") return;

        localStorage.setItem("omega-pgt-wallets", JSON.stringify(walletsToSave));
        setWallets(walletsToSave);
        calculatePortfolio(walletsToSave);
      } catch (error) {
        console.error("Error saving wallets:", error);
      }
    },
    [calculatePortfolio]
  );

  const fetchEthereumBalance = useCallback(async (address: string) => {
    // Ensure we're client-side only
    if (typeof window === "undefined") {
      throw new Error("fetchEthereumBalance can only be called client-side");
    }

    // Validate Ethereum address format (must start with 0x and be 42 chars)
    if (!address.startsWith("0x") || address.length !== 42 || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error(`Invalid Ethereum address format: ${address}. Expected 0x-prefixed 42-character hexadecimal address. This address may be for a different network (e.g., Solana).`);
    }

    try {
      console.log(`🔍 Fetching Ethereum balance for ${address}...`);
      
      // Get ETH price from CoinGecko via server-side proxy to avoid CORS
      const priceResp = await fetch(
        "/api/coingecko/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true",
        { 
          cache: "no-store",
          method: "GET",
        }
      );
      
      if (!priceResp.ok) {
        throw new Error(`CoinGecko API error: ${priceResp.status}`);
      }

      const priceData = await priceResp.json();
      const ethPrice = priceData.ethereum?.usd || 0;
      const ethChange24h = priceData.ethereum?.usd_24h_change || 0;

      if (ethPrice === 0) {
        throw new Error("Failed to fetch ETH price from CoinGecko");
      }

      console.log(`💰 Current ETH price: $${ethPrice}`);

      let ethBalance = 0;

      // Use ethers.js v6
      const rpcEndpoints = [
        "https://eth.llamarpc.com",
        "https://rpc.ankr.com/eth",
        "https://ethereum.publicnode.com",
        "https://eth-mainnet.public.blastapi.io",
      ];

      for (const rpcUrl of rpcEndpoints) {
        try {
          const provider = new JsonRpcProvider(rpcUrl);
          const balance = await provider.getBalance(address);
          ethBalance = parseFloat(formatEther(balance));
          if (ethBalance >= 0) {
            console.log(`✅ Got balance from ${rpcUrl}: ${ethBalance} ETH`);
            break;
          }
        } catch (rpcError) {
          console.warn(`⚠️ ${rpcUrl} failed:`, rpcError);
          continue;
        }
      }

      // Fallback: try direct RPC call if ethers failed
      if (ethBalance === 0) {
        try {
          const response = await fetch("https://eth.llamarpc.com", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "eth_getBalance",
              params: [address, "latest"],
              id: 1,
            }),
            cache: "no-store",
          });
          
          if (!response.ok) {
            throw new Error(`RPC response error: ${response.status}`);
          }

          const data = await response.json();
          if (data.result) {
            ethBalance = parseInt(data.result, 16) / 1e18;
            console.log(`✅ Fallback RPC succeeded: ${ethBalance} ETH`);
          }
        } catch (error) {
          console.error("Direct RPC fallback failed:", error);
        }
      }

      const totalValue = ethBalance * ethPrice;
      const change24h = totalValue * (ethChange24h / 100);

      return {
        totalValue,
        change24h,
        change24hPercent: ethChange24h,
        tokens: [
          {
            symbol: "ETH",
            balance: ethBalance,
            value: totalValue,
            price: ethPrice,
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching Ethereum data:", error);
      throw error;
    }
  }, []);

  const fetchSolanaBalance = useCallback(async (address: string) => {
    // Ensure we're client-side only
    if (typeof window === "undefined") {
      throw new Error("fetchSolanaBalance can only be called client-side");
    }

    try {
      console.log(`🔍 Fetching Solana balance for ${address}...`);
      
      // Convert hex address to base58 if needed (Solana RPC requires base58)
      let solanaAddress = address;
      if (address.length === 64 && /^[0-9a-fA-F]+$/.test(address)) {
        // Hex-encoded public key (64 hex chars = 32 bytes)
        try {
          // Convert hex string to Uint8Array (32 bytes)
          const hexBytes = new Uint8Array(
            address.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
          );
          const publicKey = new PublicKey(hexBytes);
          solanaAddress = publicKey.toBase58();
          console.log(`✅ Converted hex to base58: ${solanaAddress}`);
        } catch (convertError) {
          console.error("Failed to convert hex to base58:", convertError);
          throw new Error(`Invalid Solana address format: ${address}. Expected base58 or hex-encoded public key.`);
        }
      } else if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
        // Check if it's a valid base58 Solana address
        throw new Error(`Invalid Solana address format: ${address}. Expected base58 or 64-char hex.`);
      }

      console.log(`📡 Calling Solana RPC with address: ${solanaAddress}`);
      
      // Try multiple Solana RPC endpoints for reliability
      const rpcEndpoints = [
        "https://api.mainnet-beta.solana.com",
        "https://solana-api.projectserum.com",
        "https://rpc.ankr.com/solana",
        "https://solana-mainnet.rpc.extrnode.com",
      ];

      let solBalance = 0;
      let lastError: Error | null = null;

      for (const rpcUrl of rpcEndpoints) {
        try {
          console.log(`🔄 Trying RPC endpoint: ${rpcUrl}`);
          const response = await fetch(rpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getBalance",
              params: [solanaAddress],
            }),
            cache: "no-store",
          });

          // Parse response even if status is not OK (some RPCs return 200 with error in JSON)
          const data = await response.json();
          
          if (data.error) {
            const errorMsg = data.error.message || JSON.stringify(data.error);
            console.warn(`⚠️ ${rpcUrl} returned error: ${errorMsg}`);
            lastError = new Error(`Solana RPC error: ${errorMsg}`);
            continue; // Try next endpoint
          }

          if (data.result?.value !== undefined) {
            solBalance = data.result.value / 1e9;
            console.log(`✅ Successfully fetched balance from ${rpcUrl}: ${solBalance} SOL`);
            break; // Success, exit loop
          } else {
            console.warn(`⚠️ ${rpcUrl} returned unexpected response format`);
            lastError = new Error("Unexpected response format from Solana RPC");
            continue;
          }
        } catch (fetchError) {
          console.warn(`⚠️ ${rpcUrl} failed:`, fetchError);
          lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
          continue; // Try next endpoint
        }
      }

      // If all endpoints failed, throw the last error
      if (solBalance === 0 && lastError) {
        throw lastError;
      }

      console.log(`💰 SOL Balance: ${solBalance} SOL`);

      // Get SOL price via server-side proxy to avoid CORS
      const priceResp = await fetch(
        "/api/coingecko/price?ids=solana&vs_currencies=usd&include_24hr_change=true",
        { cache: "no-store" }
      );
      
      if (!priceResp.ok) {
        throw new Error(`CoinGecko API error: ${priceResp.status}`);
      }

      const priceData = await priceResp.json();
      const solPrice = priceData.solana?.usd || 0;
      const solChange24h = priceData.solana?.usd_24h_change || 0;

      if (solPrice === 0) {
        throw new Error("Failed to fetch SOL price from CoinGecko");
      }

      const totalValue = solBalance * solPrice;
      const change24h = totalValue * (solChange24h / 100);

      console.log(`✅ Solana portfolio calculated:`, {
        balance: `${solBalance} SOL`,
        price: `$${solPrice}`,
        totalValue: `$${totalValue.toFixed(2)}`,
        change24h: `${solChange24h.toFixed(2)}%`
      });

      return {
        totalValue,
        change24h,
        change24hPercent: solChange24h,
        tokens: [
          {
            symbol: "SOL",
            balance: solBalance,
            value: totalValue,
            price: solPrice,
          },
        ],
      };
    } catch (error) {
      console.error("❌ Error fetching Solana data:", error);
      throw error; // Re-throw to show actual error message
    }
  }, []);

  const fetchWalletData = useCallback(
    async (address: string, network: string) => {
      const networkLower = network.toLowerCase();
      
      // Auto-detect network if stored network doesn't match address format
      let detectedNetwork = networkLower;
      
      // Check if address format matches network
      if (networkLower === "ethereum" || networkLower === "eth") {
        // Verify it's actually an Ethereum address
        if (!address.startsWith("0x") || address.length !== 42 || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
          // Not a valid Ethereum address - auto-detect
          console.warn(`⚠️ Address ${address} doesn't match Ethereum format, auto-detecting network...`);
          
          // Check for Solana format (64 hex chars or base58)
          if (address.length === 64 && /^[0-9a-fA-F]+$/.test(address)) {
            detectedNetwork = "solana";
            console.log(`🔍 Auto-detected as Solana (hex-encoded)`);
          } else if (address.length >= 32 && address.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
            detectedNetwork = "solana";
            console.log(`🔍 Auto-detected as Solana (base58)`);
          } else {
            // Unknown format, try Ethereum first (might fail)
            console.warn(`⚠️ Unknown address format, trying Ethereum...`);
          }
        }
      }
      
      // Route to appropriate fetch function based on detected network
      if (detectedNetwork === "solana" || detectedNetwork === "sol") {
        return await fetchSolanaBalance(address);
      } else {
        // Ethereum or other EVM chains
        return await fetchEthereumBalance(address);
      }
    },
    [fetchEthereumBalance, fetchSolanaBalance]
  );

  const addWallet = useCallback(
    async (
      address: string,
      network: string,
      label?: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        setIsLoading(true);

        // Check if already tracked
        const existing = wallets.find(
          (w) =>
            w.address.toLowerCase() === address.toLowerCase() &&
            w.network.toLowerCase() === network.toLowerCase()
        );

        if (existing) {
          // Refresh existing wallet
          const data = await fetchWalletData(address, network);
          existing.totalValue = data.totalValue;
          existing.change24h = data.change24h;
          existing.change24hPercent = data.change24hPercent;
          existing.tokens = data.tokens;
          existing.lastUpdated = new Date().toISOString();
          
          const updatedWallets = wallets.map((w) =>
            w.address.toLowerCase() === address.toLowerCase() &&
            w.network.toLowerCase() === network.toLowerCase()
              ? existing
              : w
          );
          
          saveWallets(updatedWallets);
          setIsLoading(false);
          return { success: true };
        }

        // Fetch blockchain data
        console.log(`📡 Fetching blockchain data for ${address} on ${network}...`);
        const data = await fetchWalletData(address, network);
        console.log(`✅ Fetched wallet data:`, {
          totalValue: data.totalValue,
          change24h: data.change24h,
          change24hPercent: data.change24hPercent,
          tokens: data.tokens.length
        });

        // Create wallet object
        const wallet: PGTWallet = {
          address,
          network: network.toLowerCase(),
          label: label || `${network} Wallet`,
          totalValue: data.totalValue,
          change24h: data.change24h,
          change24hPercent: data.change24hPercent,
          tokens: data.tokens,
          addedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };

        console.log(`💾 Saving wallet:`, wallet);
        const updatedWallets = [...wallets, wallet];
        saveWallets(updatedWallets);
        setIsLoading(false);

        console.log(`✅ Wallet added and portfolio updated`);
        return { success: true };
      } catch (error) {
        setIsLoading(false);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch wallet data. Please check if the address is correct.",
        };
      }
    },
    [wallets, fetchWalletData, saveWallets]
  );

  const removeWallet = useCallback(
    async (
      address: string,
      network: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const updatedWallets = wallets.filter(
          (w) =>
            !(
              w.address.toLowerCase() === address.toLowerCase() &&
              w.network.toLowerCase() === network.toLowerCase()
            )
        );
        saveWallets(updatedWallets);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to remove wallet",
        };
      }
    },
    [wallets, saveWallets]
  );

  const getWallet = useCallback(
    (address: string, network: string): PGTWallet | null => {
      return (
        wallets.find(
          (w) =>
            w.address.toLowerCase() === address.toLowerCase() &&
            w.network.toLowerCase() === network.toLowerCase()
        ) || null
      );
    },
    [wallets]
  );

  const refreshWallet = useCallback(
    async (address: string, network: string): Promise<void> => {
      try {
        const wallet = getWallet(address, network);
        if (!wallet) {
          console.warn(`Wallet not found: ${address} (${network})`);
          return;
        }

        // Fetch wallet data (with auto-detection if needed)
        const data = await fetchWalletData(address, network);
        
        // Update wallet with new data
        wallet.totalValue = data.totalValue;
        wallet.change24h = data.change24h;
        wallet.change24hPercent = data.change24hPercent;
        wallet.tokens = data.tokens;
        wallet.lastUpdated = new Date().toISOString();

        // Update network if it was auto-detected differently
        const networkLower = network.toLowerCase();
        if (networkLower === "ethereum" || networkLower === "eth") {
          // Check if address is actually Solana
          if (address.length === 64 && /^[0-9a-fA-F]+$/.test(address)) {
            wallet.network = "solana";
            console.log(`🔄 Updated wallet network from ethereum to solana: ${address}`);
          } else if (address.length >= 32 && address.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
            wallet.network = "solana";
            console.log(`🔄 Updated wallet network from ethereum to solana: ${address}`);
          }
        }

        const updatedWallets = wallets.map((w) =>
          w.address.toLowerCase() === address.toLowerCase() &&
          w.network.toLowerCase() === network.toLowerCase()
            ? wallet
            : w
        );

        saveWallets(updatedWallets);
        console.log(`✅ Refreshed wallet: ${address} (${wallet.network})`);
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        console.error(`Error refreshing wallet ${address} (${network}):`, errorMsg);
        
        // Don't throw - just log the error so other wallets can still refresh
        // The wallet will keep its last known values
      }
    },
    [wallets, getWallet, fetchWalletData, saveWallets]
  );

  const refreshPortfolio = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log(`🔄 Refreshing portfolio for ${wallets.length} wallet(s)...`);
      
      // Refresh all wallets
      const refreshPromises = wallets.map((wallet) =>
        refreshWallet(wallet.address, wallet.network)
      );
      
      await Promise.all(refreshPromises);
      console.log(`✅ Portfolio refresh complete`);
      setIsLoading(false);
    } catch (error) {
      console.error("Error refreshing portfolio:", error);
      setIsLoading(false);
    }
  }, [wallets, refreshWallet]);

  // Auto-refresh every 60 seconds (must be after refreshPortfolio is defined)
  useEffect(() => {
    if (wallets.length > 0) {
      // Initial refresh when wallets are loaded
      refreshPortfolio();
      
      // Set up interval for auto-refresh
      refreshIntervalRef.current = setInterval(() => {
        refreshPortfolio();
      }, 60000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [wallets.length, refreshPortfolio]);

  const value: PGTContextValue = {
    wallets,
    portfolio,
    isLoading,
    addWallet,
    removeWallet,
    getWallet,
    refreshPortfolio,
    refreshWallet,
  };

  return <PGTContext.Provider value={value}>{children}</PGTContext.Provider>;
}

export function usePGT(): PGTContextValue {
  const context = useContext(PGTContext);
  if (!context) {
    throw new Error("usePGT must be used within PGTProvider");
  }
  return context;
}

