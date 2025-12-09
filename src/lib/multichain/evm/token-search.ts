/**
 * EVM Token Search
 * Dynamic token search for Uniswap, PancakeSwap, and other EVM DEXs
 */

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  verified: boolean;
  chainId: number;
}

/**
 * Chain ID to network name mapping
 */
const CHAIN_NAMES: Record<number, string> = {
  1: "ethereum",
  42161: "arbitrum",
  10: "optimism",
  8453: "base",
  137: "polygon",
  56: "bnb",
};

/**
 * Search tokens using CoinGecko API (supports all EVM chains)
 */
export async function searchTokensCoinGecko(
  query: string,
  chainId: number
): Promise<TokenInfo[]> {
  try {
    const chainName = CHAIN_NAMES[chainId];
    if (!chainName) {
      return [];
    }

    // CoinGecko API endpoint for token search
    const apiUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;

    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("[Token Search] CoinGecko API error, trying alternative");
      return await searchTokensAlternative(query, chainId);
    }

    const data = await response.json();
    const coins = data.coins || [];

    // Filter and map to TokenInfo
    const tokens: TokenInfo[] = [];
    for (const coin of coins.slice(0, 20)) {
      try {
        // Get token details including contract address
        const detailUrl = `https://api.coingecko.com/api/v3/coins/${coin.id}`;
        const detailResponse = await fetch(detailUrl);
        
        if (detailResponse.ok) {
          const detail = await detailResponse.json();
          const platforms = detail.platforms || {};
          
          // Get contract address for the specific chain
          let contractAddress: string | null = null;
          
          if (chainId === 1) {
            contractAddress = platforms.ethereum || null;
          } else if (chainId === 42161) {
            contractAddress = platforms["arbitrum-one"] || null;
          } else if (chainId === 10) {
            contractAddress = platforms["optimistic-ethereum"] || null;
          } else if (chainId === 8453) {
            contractAddress = platforms.base || null;
          } else if (chainId === 137) {
            contractAddress = platforms["polygon-pos"] || null;
          } else if (chainId === 56) {
            contractAddress = platforms["binance-smart-chain"] || null;
          }

          if (contractAddress && contractAddress.toLowerCase() !== "0x0000000000000000000000000000000000000000") {
            tokens.push({
              address: contractAddress.toLowerCase(),
              symbol: detail.symbol?.toUpperCase() || coin.symbol?.toUpperCase() || "",
              name: detail.name || coin.name || "",
              decimals: 18, // Default, will be fetched if needed
              logoURI: detail.image?.small || coin.thumb,
              verified: true, // CoinGecko tokens are generally verified
              chainId,
            });
          }
        }
      } catch (err) {
        // Skip this token if detail fetch fails
        continue;
      }
    }

    return tokens;
  } catch (error: any) {
    console.error("[Token Search] CoinGecko error:", error);
    return await searchTokensAlternative(query, chainId);
  }
}

/**
 * Alternative token search using Token Lists and direct address lookup
 */
async function searchTokensAlternative(
  query: string,
  chainId: number
): Promise<TokenInfo[]> {
  try {
    const tokens: TokenInfo[] = [];
    const lowerQuery = query.toLowerCase().trim();

    // If query looks like an address, try to fetch token info directly
    if (lowerQuery.startsWith("0x") && lowerQuery.length === 42) {
      const tokenInfo = await fetchTokenByAddress(query, chainId);
      if (tokenInfo) {
        tokens.push(tokenInfo);
      }
      return tokens;
    }

    // Use Uniswap Token Lists for major chains
    const tokenListUrls: Record<number, string> = {
      1: "https://tokens.uniswap.org",
      42161: "https://token-list.arbitrum.io/ArbTokenLists/arbed_arb_whitelist_era.json",
      10: "https://static.optimism.io/optimism.tokenlist.json",
      8453: "https://static.optimism.io/base.tokenlist.json",
      137: "https://tokens.uniswap.org",
      56: "https://tokens.pancakeswap.finance/pancakeswap-extended.json",
    };

    const tokenListUrl = tokenListUrls[chainId];
    if (!tokenListUrl) {
      return tokens;
    }

    const response = await fetch(tokenListUrl);
    if (!response.ok) {
      return tokens;
    }

    const data = await response.json();
    const tokenList = data.tokens || [];

    // Search through token list
    for (const token of tokenList) {
      if (
        token.chainId === chainId &&
        (token.symbol?.toLowerCase().includes(lowerQuery) ||
          token.name?.toLowerCase().includes(lowerQuery) ||
          token.address?.toLowerCase().includes(lowerQuery))
      ) {
        tokens.push({
          address: token.address.toLowerCase(),
          symbol: token.symbol || "",
          name: token.name || "",
          decimals: token.decimals || 18,
          logoURI: token.logoURI,
          verified: true,
          chainId,
        });

        if (tokens.length >= 20) break;
      }
    }

    return tokens;
  } catch (error: any) {
    console.error("[Token Search] Alternative search error:", error);
    return [];
  }
}

/**
 * Fetch token information by contract address
 */
async function fetchTokenByAddress(
  address: string,
  chainId: number
): Promise<TokenInfo | null> {
  try {
    // Try to fetch from blockchain explorer APIs
    const explorerApis: Record<number, (addr: string) => Promise<TokenInfo | null>> = {
      1: async (addr) => {
        // Etherscan API
        const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || "";
        const url = `https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=${addr}&apikey=${apiKey}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "1" && data.result?.[0]) {
            const token = data.result[0];
            return {
              address: addr.toLowerCase(),
              symbol: token.symbol || "",
              name: token.name || "",
              decimals: parseInt(token.decimals || "18"),
              verified: true,
              chainId: 1,
            };
          }
        }
        return null;
      },
      56: async (addr) => {
        // BSCScan API
        const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || "";
        const url = `https://api.bscscan.com/api?module=token&action=tokeninfo&contractaddress=${addr}&apikey=${apiKey}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "1" && data.result?.[0]) {
            const token = data.result[0];
            return {
              address: addr.toLowerCase(),
              symbol: token.symbol || "",
              name: token.name || "",
              decimals: parseInt(token.decimals || "18"),
              verified: true,
              chainId: 56,
            };
          }
        }
        return null;
      },
    };

    const fetcher = explorerApis[chainId];
    if (fetcher) {
      return await fetcher(address);
    }

    // Fallback: return basic info if address is valid
    if (address.startsWith("0x") && address.length === 42) {
      return {
        address: address.toLowerCase(),
        symbol: "TOKEN",
        name: "Unknown Token",
        decimals: 18,
        verified: false,
        chainId,
      };
    }

    return null;
  } catch (error: any) {
    console.error("[Token Search] Error fetching token by address:", error);
    return null;
  }
}

/**
 * Search tokens for Uniswap (uses multiple sources)
 */
export async function searchUniswapTokens(
  query: string,
  chainId: number
): Promise<TokenInfo[]> {
  // Try CoinGecko first (most comprehensive)
  let tokens = await searchTokensCoinGecko(query, chainId);
  
  // If no results, try alternative methods
  if (tokens.length === 0) {
    tokens = await searchTokensAlternative(query, chainId);
  }

  // Add native token if query matches
  const nativeTokens: Record<number, { symbol: string; name: string }> = {
    1: { symbol: "ETH", name: "Ethereum" },
    42161: { symbol: "ETH", name: "Ethereum" },
    10: { symbol: "ETH", name: "Ethereum" },
    8453: { symbol: "ETH", name: "Ethereum" },
    137: { symbol: "MATIC", name: "Polygon" },
    56: { symbol: "BNB", name: "BNB" },
  };

  const native = nativeTokens[chainId];
  const lowerQuery = query.toLowerCase();
  if (
    native &&
    (lowerQuery === native.symbol.toLowerCase() ||
      lowerQuery === native.name.toLowerCase() ||
      lowerQuery === "native" ||
      lowerQuery === "eth" ||
      lowerQuery === "matic" ||
      lowerQuery === "bnb")
  ) {
    tokens.unshift({
      address: "0x0000000000000000000000000000000000000000",
      symbol: native.symbol,
      name: native.name,
      decimals: 18,
      verified: true,
      chainId,
    });
  }

  return tokens.slice(0, 20); // Limit to 20 results
}

/**
 * Search tokens for PancakeSwap (uses multiple sources)
 */
export async function searchPancakeSwapTokens(
  query: string,
  chainId: number
): Promise<TokenInfo[]> {
  // PancakeSwap primarily uses BNB Chain, but also supports other chains
  let tokens = await searchTokensCoinGecko(query, chainId);
  
  // Also try PancakeSwap token list
  if (chainId === 56) {
    try {
      const response = await fetch("https://tokens.pancakeswap.finance/pancakeswap-extended.json");
      if (response.ok) {
        const data = await response.json();
        const tokenList = data.tokens || [];
        const lowerQuery = query.toLowerCase();
        
        for (const token of tokenList) {
          if (
            token.chainId === chainId &&
            (token.symbol?.toLowerCase().includes(lowerQuery) ||
              token.name?.toLowerCase().includes(lowerQuery) ||
              token.address?.toLowerCase().includes(lowerQuery))
          ) {
            const exists = tokens.some(t => t.address.toLowerCase() === token.address.toLowerCase());
            if (!exists) {
              tokens.push({
                address: token.address.toLowerCase(),
                symbol: token.symbol || "",
                name: token.name || "",
                decimals: token.decimals || 18,
                logoURI: token.logoURI,
                verified: true,
                chainId,
              });
            }
          }
          if (tokens.length >= 20) break;
        }
      }
    } catch (error) {
      console.error("[Token Search] PancakeSwap list error:", error);
    }
  }

  // Add native token if query matches
  const nativeTokens: Record<number, { symbol: string; name: string }> = {
    1: { symbol: "ETH", name: "Ethereum" },
    42161: { symbol: "ETH", name: "Ethereum" },
    10: { symbol: "ETH", name: "Ethereum" },
    8453: { symbol: "ETH", name: "Ethereum" },
    137: { symbol: "MATIC", name: "Polygon" },
    56: { symbol: "BNB", name: "BNB" },
  };

  const native = nativeTokens[chainId];
  const lowerQuery = query.toLowerCase();
  if (
    native &&
    (lowerQuery === native.symbol.toLowerCase() ||
      lowerQuery === native.name.toLowerCase() ||
      lowerQuery === "native")
  ) {
    tokens.unshift({
      address: "0x0000000000000000000000000000000000000000",
      symbol: native.symbol,
      name: native.name,
      decimals: 18,
      verified: true,
      chainId,
    });
  }

  return tokens.slice(0, 20); // Limit to 20 results
}

