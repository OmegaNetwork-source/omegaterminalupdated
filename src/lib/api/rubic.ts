/**
 * Rubic SDK API Client
 *
 * SDK wrapper for Rubic cross-chain and on-chain swap integration.
 * Provides trade calculation and swap execution across 70+ blockchains.
 *
 * This client encapsulates Rubic SDK functionality, providing a clean API
 * for seamless token swaps across multiple networks including:
 * - Ethereum, BSC, Polygon, Arbitrum, Optimism, Base (EVM)
 * - Solana, NEAR Protocol (Non-EVM)
 */

import type {
  RubicBlockchain,
  RubicToken,
  CalculateTradeParams,
  RubicTrade,
  ExecuteSwapParams,
  SwapResult,
  RubicSDKInitResult,
  RubicSDKConfig,
  NetworkChainId,
} from "@/types/rubic";

// ============================================================================
// Constants
// ============================================================================

/** Network chain ID mapping */
const NETWORK_CHAIN_IDS: Record<RubicBlockchain, number> = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
  solana: 0, // Non-EVM
  near: 0, // Non-EVM
};

/** Network name mapping */
const NETWORK_NAMES: Record<RubicBlockchain, string> = {
  ethereum: "Ethereum",
  bsc: "BNB Smart Chain",
  polygon: "Polygon",
  arbitrum: "Arbitrum One",
  optimism: "Optimism",
  base: "Base",
  solana: "Solana",
  near: "NEAR Protocol",
};

/** Default RPC URLs for confirmed networks - using same RPCs as selectNetwork model */
// These match the RPC URLs defined in MultiNetworkConnectorHost.tsx
const DEFAULT_RPC_URLS: Record<RubicBlockchain, string[]> = {
  ethereum: [
    "https://eth.llamarpc.com", // From selectNetwork model
  ],
  bsc: [
    "https://bsc-dataseed.binance.org", // From selectNetwork model
  ],
  polygon: [
    "https://polygon.llamarpc.com", // More reliable public RPC
    "https://polygon-rpc.publicnode.com", // Public node
    "https://rpc-mainnet.maticvigil.com", // MaticVigil
    "https://polygon-rpc.com", // Official Polygon RPC
    "https://polygon.blockpi.network/v1/rpc/public", // BlockPI
    "https://polygon.chainstacklabs.com", // Chainstack
    "https://rpc.ankr.com/polygon", // Ankr
  ],
  arbitrum: [
    "https://arb1.arbitrum.io/rpc", // From selectNetwork model
  ],
  optimism: [
    "https://mainnet.optimism.io", // From selectNetwork model
  ],
  base: [
    "https://mainnet.base.org", // From selectNetwork model
  ],
  solana: [
    "https://api.mainnet-beta.solana.com", // From selectNetwork model
  ],
  near: [
    "https://rpc.mainnet.near.org", // From selectNetwork model
  ],
};

/** Native token addresses (use empty string for native tokens) */
const NATIVE_TOKEN_ADDRESSES: Record<RubicBlockchain, string> = {
  ethereum: "0x0000000000000000000000000000000000000000", // ETH
  bsc: "0x0000000000000000000000000000000000000000", // BNB
  polygon: "0x0000000000000000000000000000000000000000", // MATIC
  arbitrum: "0x0000000000000000000000000000000000000000", // ETH
  optimism: "0x0000000000000000000000000000000000000000", // ETH
  base: "0x0000000000000000000000000000000000000000", // ETH
  solana: "", // SOL (non-EVM)
  near: "", // NEAR (non-EVM)
};

// ============================================================================
// Module-level variables
// ============================================================================

/** Cached Rubic SDK instance */
let rubicSDKInstance: any = null;

/** Current provider */
let currentProvider: any = null;

/** SDK initialization status */
let isInitialized = false;

/** Cached SDK exports (BLOCKCHAIN_NAME, Token, etc.) */
let sdkExports: any = null;

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Map internal network key to Rubic SDK blockchain name
 */
function mapToRubicBlockchain(networkKey: string): RubicBlockchain | null {
  const mapping: Record<string, RubicBlockchain> = {
    ethereum: "ethereum",
    bsc: "bsc",
    polygon: "polygon",
    arbitrum: "arbitrum",
    optimism: "optimism",
    base: "base",
    solana: "solana",
    near: "near",
  };

  return mapping[networkKey.toLowerCase()] || null;
}

/**
 * Convert our token format to Rubic SDK Token format
 * The SDK expects blockchain to be the actual string value from BLOCKCHAIN_NAME
 * (e.g., "ETH" for Ethereum, "BASE" for Base, "BSC" for BSC)
 */
async function convertTokenToSDKFormat(token: RubicToken): Promise<any> {
  if (!rubicSDKInstance) {
    throw new Error("SDK not initialized");
  }

  // Map our blockchain names to SDK blockchain string values
  // Note: BLOCKCHAIN_NAME.ETHEREUM = "ETH", BLOCKCHAIN_NAME.BASE = "BASE", etc.
  const blockchainMap: Record<RubicBlockchain, string> = {
    ethereum: "ETH",
    bsc: "BSC",
    polygon: "POLYGON",
    arbitrum: "ARBITRUM",
    optimism: "OPTIMISM",
    base: "BASE",
    solana: "SOLANA",
    near: "NEAR",
  };

  const sdkBlockchainValue = blockchainMap[token.blockchain];
  if (!sdkBlockchainValue) {
    throw new Error(`Unsupported blockchain: ${token.blockchain}`);
  }

  // Get BLOCKCHAIN_NAME and Token from stored SDK exports
  let BLOCKCHAIN_NAME: any = null;
  let Token: any = null;

  // Try multiple locations for BLOCKCHAIN_NAME and Token
  if (sdkExports?.BLOCKCHAIN_NAME) {
    BLOCKCHAIN_NAME = sdkExports.BLOCKCHAIN_NAME;
    console.log("[Rubic SDK] Using BLOCKCHAIN_NAME from sdkExports");
  } else if (sdkExports?.common?.BLOCKCHAIN_NAME) {
    BLOCKCHAIN_NAME = sdkExports.common.BLOCKCHAIN_NAME;
    console.log("[Rubic SDK] Using BLOCKCHAIN_NAME from sdkExports.common");
  } else if (typeof window !== "undefined") {
    // Try from window if loaded from CDN
    const windowAny = window as any;
    if (windowAny.RubicSDK?.BLOCKCHAIN_NAME) {
      BLOCKCHAIN_NAME = windowAny.RubicSDK.BLOCKCHAIN_NAME;
      console.log("[Rubic SDK] Using BLOCKCHAIN_NAME from window.RubicSDK");
    } else if (windowAny.rubicSDK?.BLOCKCHAIN_NAME) {
      BLOCKCHAIN_NAME = windowAny.rubicSDK.BLOCKCHAIN_NAME;
      console.log("[Rubic SDK] Using BLOCKCHAIN_NAME from window.rubicSDK");
    }
  }

  if (!BLOCKCHAIN_NAME) {
    console.error(
      "[Rubic SDK] BLOCKCHAIN_NAME not found! Available in sdkExports:",
      Object.keys(sdkExports || {})
    );
  }

  if (sdkExports?.Token) {
    Token = sdkExports.Token;
    console.log("[Rubic SDK] Using Token from sdkExports");
  } else if (sdkExports?.common?.Token) {
    Token = sdkExports.common.Token;
    console.log("[Rubic SDK] Using Token from sdkExports.common");
  } else if (typeof window !== "undefined") {
    const windowAny = window as any;
    if (windowAny.RubicSDK?.Token) {
      Token = windowAny.RubicSDK.Token;
      console.log("[Rubic SDK] Using Token from window.RubicSDK");
    } else if (windowAny.rubicSDK?.Token) {
      Token = windowAny.rubicSDK.Token;
      console.log("[Rubic SDK] Using Token from window.rubicSDK");
    }
  }

  if (!Token) {
    console.error(
      "[Rubic SDK] Token not found! Available in sdkExports:",
      Object.keys(sdkExports || {})
    );
  }

  // Map our blockchain names to SDK enum keys
  // The SDK expects the enum key (e.g., BLOCKCHAIN_NAME.ETHEREUM), not the string value
  const blockchainEnumKeyMap: Record<RubicBlockchain, string> = {
    ethereum: "ETHEREUM",
    bsc: "BINANCE_SMART_CHAIN",
    polygon: "POLYGON",
    arbitrum: "ARBITRUM",
    optimism: "OPTIMISM",
    base: "BASE",
    solana: "SOLANA",
    near: "NEAR",
  };

  const enumKey = blockchainEnumKeyMap[token.blockchain];
  let blockchainConstant: any = sdkBlockchainValue; // Fallback to string value

  // Try to get the actual enum constant from BLOCKCHAIN_NAME
  if (BLOCKCHAIN_NAME && enumKey && BLOCKCHAIN_NAME[enumKey]) {
    blockchainConstant = BLOCKCHAIN_NAME[enumKey];
    console.log(
      `[Rubic SDK] Using blockchain constant: ${enumKey} = ${blockchainConstant}`
    );
  } else {
    console.warn(
      `[Rubic SDK] Could not find BLOCKCHAIN_NAME.${enumKey}, using string value: ${sdkBlockchainValue}`
    );
  }

  // Use Token.createToken() static method if available
  // This is the recommended way to create tokens
  if (Token?.createToken) {
    try {
      const tokenInstance = await Token.createToken({
        blockchain: blockchainConstant,
        address: token.address,
      });
      console.log(`[Rubic SDK] Created token:`, tokenInstance);
      return tokenInstance;
    } catch (error) {
      console.error("[Rubic SDK] Token.createToken error:", error);
      console.error(
        "[Rubic SDK] Attempted with blockchain:",
        blockchainConstant
      );
      // Fallback to TokenBaseStruct
    }
  }

  // Fallback: return TokenBaseStruct format (the SDK might accept this directly)
  console.log(
    `[Rubic SDK] Using TokenBaseStruct format with blockchain: ${blockchainConstant}`
  );
  return {
    blockchain: blockchainConstant,
    address: token.address,
  };
}

/**
 * Ensure SDK is initialized
 */
function ensureInitialized(): void {
  if (!isInitialized || !rubicSDKInstance) {
    throw new Error(
      "Rubic SDK not initialized. Call initializeSDK first. Note: SDK can be initialized without a provider for quote calculations."
    );
  }
}

/**
 * Convert chain ID to Rubic blockchain name
 */
export function chainIdToRubicBlockchain(
  chainId: number
): RubicBlockchain | null {
  const mapping: Record<number, RubicBlockchain> = {
    1: "ethereum",
    56: "bsc",
    137: "polygon",
    42161: "arbitrum",
    10: "optimism",
    8453: "base",
  };

  return mapping[chainId] || null;
}

// ============================================================================
// Core SDK methods
// ============================================================================

/**
 * Initialize Rubic SDK
 *
 * Initializes the Rubic SDK with provider and network configuration.
 * Must be called before any other SDK operations.
 *
 * @param config - SDK configuration including provider and networks
 * @returns Success status with optional error message
 *
 * @example
 * const provider = await wallet.getProvider();
 * const result = await initializeSDK({ provider });
 * if (!result.success) {
 *   console.error('Failed to initialize:', result.error);
 * }
 */
export async function initializeSDK(
  config: RubicSDKConfig = {}
): Promise<RubicSDKInitResult> {
  try {
    // Always reinitialize to reset RPC state and avoid cached failures
    // The SDK may cache failed RPCs, so we need to create a fresh instance
    // Clear any existing instance and state
    if (rubicSDKInstance) {
      // Try to clean up existing instance if it has a destroy/cleanup method
      if (typeof rubicSDKInstance.destroy === "function") {
        try {
          await rubicSDKInstance.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
    isInitialized = false;
    rubicSDKInstance = null;
    sdkExports = null;

    // Load SDK from CDN to avoid webpack bundling issues
    // The CDN version is pre-built and doesn't have the _interopRequireDefault issue
    let SDK: any;
    try {
      // First, try to load from CDN (wait for script to load if needed)
      if (typeof window !== "undefined") {
        const windowAny = window as any;

        // Wait for CDN script to load (max 5 seconds)
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds with 100ms intervals
        while (
          attempts < maxAttempts &&
          !windowAny.RubicSDK &&
          !windowAny.rubicSDK &&
          !windowAny.Rubic &&
          !windowAny.rubic
        ) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        // Check if SDK is available from CDN
        if (windowAny.RubicSDK) {
          SDK = windowAny.RubicSDK;
          console.log("[Rubic SDK] Loaded from CDN (RubicSDK)");
        } else if (windowAny.rubicSDK) {
          SDK = windowAny.rubicSDK;
          console.log("[Rubic SDK] Loaded from CDN (rubicSDK)");
        } else if (windowAny.Rubic) {
          SDK = windowAny.Rubic;
          console.log("[Rubic SDK] Loaded from CDN (Rubic)");
        } else if (windowAny.rubic) {
          SDK = windowAny.rubic;
          console.log("[Rubic SDK] Loaded from CDN (rubic)");
        }

        // If SDK is an object with SDK property, extract it
        if (SDK && typeof SDK === "object" && SDK.SDK) {
          SDK = SDK.SDK;
        }
      }

      // If not available from CDN, try npm package
      if (!SDK || (typeof SDK !== "function" && typeof SDK !== "object")) {
        // Try dynamic import - webpack should handle it with our config
        const sdkModule = await import("rubic-sdk");

        // The SDK exports the SDK class as a named export
        // Try different possible export patterns
        SDK = sdkModule.SDK;

        // If not found, try default export patterns
        if (!SDK) {
          SDK = sdkModule.default?.SDK || sdkModule.default;
        }

        // If still not found, the entire module might be the SDK
        if (!SDK && typeof sdkModule === "object") {
          // Check if SDK is a property of the module
          const moduleKeys = Object.keys(sdkModule);
          for (const key of moduleKeys) {
            if (key === "SDK" || key.toLowerCase().includes("sdk")) {
              SDK = (sdkModule as any)[key];
              if (
                SDK &&
                (typeof SDK === "function" || typeof SDK === "object")
              ) {
                break;
              }
            }
          }
        }

        if (!SDK || (typeof SDK !== "function" && typeof SDK !== "object")) {
          // Log available exports for debugging
          console.error(
            "[Rubic SDK] Available exports:",
            Object.keys(sdkModule)
          );
          return {
            success: false,
            error:
              "Rubic SDK class not found. Available exports: " +
              Object.keys(sdkModule).join(", "),
          };
        }
      }
    } catch (importError) {
      const errorMessage =
        importError instanceof Error
          ? importError.message
          : String(importError);
      console.error("[Rubic SDK] Import error:", importError);
      console.error(
        "[Rubic SDK] Error stack:",
        importError instanceof Error ? importError.stack : "No stack"
      );
      return {
        success: false,
        error: `Failed to import Rubic SDK: ${errorMessage}. This may be a module compatibility issue. The webpack helper _interopRequireDefault may be missing.`,
      };
    }

    // Store provider
    currentProvider = config.provider;

    // Build RPC providers configuration
    // The SDK expects rpcProviders to be an object with blockchain names as keys
    const rpcProviders: any = {};

    // Configure confirmed networks
    const confirmedNetworks: RubicBlockchain[] = [
      "ethereum",
      "bsc",
      "polygon",
      "arbitrum",
      "optimism",
      "base",
      "solana",
      "near",
    ];

    // Map our network names to Rubic SDK blockchain names for RPC providers
    // The SDK expects EvmBlockchainName which are the string values (e.g., "ETH", "BSC")
    // NOT the enum keys (e.g., "ETHEREUM", "BINANCE_SMART_CHAIN")
    // The error "Provider for ETH was not initialized" confirms it expects "ETH"
    const rubicBlockchainNames: Record<RubicBlockchain, string> = {
      ethereum: "ETH",
      bsc: "BSC",
      polygon: "POLYGON",
      arbitrum: "ARBITRUM",
      optimism: "OPTIMISM",
      base: "BASE",
      solana: "SOLANA",
      near: "NEAR",
    };

    for (const network of confirmedNetworks) {
      // Use custom RPC URL if provided, otherwise use default list with fallbacks
      const rpcUrls = config.networks?.[network]?.rpcUrl
        ? [config.networks[network].rpcUrl]
        : DEFAULT_RPC_URLS[network];
      const rubicBlockchainName = rubicBlockchainNames[network];

      // RPC provider structure: { rpcList: string[] }
      // Provide multiple RPCs as fallbacks - SDK will try them in order
      rpcProviders[rubicBlockchainName] = {
        rpcList: rpcUrls,
      };

      console.log(
        `[Rubic SDK] Configured RPC for ${network} (${rubicBlockchainName}):`,
        rpcUrls.length,
        "RPCs"
      );
    }

    console.log(
      "[Rubic SDK] RPC Providers configuration:",
      Object.keys(rpcProviders)
    );

    // Store SDK exports (BLOCKCHAIN_NAME, Token, etc.) for token creation
    // These are needed for creating tokens with the correct blockchain constants
    try {
      // Try to get exports from the SDK module
      const sdkModule = await import("rubic-sdk");
      sdkExports = sdkModule;

      // Log available exports for debugging
      console.log("[Rubic SDK] Available SDK exports:", Object.keys(sdkModule));

      // Also check if SDK class has these exports directly
      if (SDK.BLOCKCHAIN_NAME) {
        sdkExports.BLOCKCHAIN_NAME = SDK.BLOCKCHAIN_NAME;
        console.log("[Rubic SDK] Found BLOCKCHAIN_NAME on SDK class");
      }
      if (SDK.Token) {
        sdkExports.Token = SDK.Token;
        console.log("[Rubic SDK] Found Token on SDK class");
      }
      if (SDK.common) {
        sdkExports.common = SDK.common;
        console.log("[Rubic SDK] Found common on SDK class");
      }

      // Check if exports are in the module directly
      if (sdkModule.BLOCKCHAIN_NAME) {
        console.log(
          "[Rubic SDK] Found BLOCKCHAIN_NAME in module, keys:",
          Object.keys(sdkModule.BLOCKCHAIN_NAME).slice(0, 10)
        );
      }
      if (sdkModule.Token) {
        console.log("[Rubic SDK] Found Token in module");
      }
    } catch (e) {
      console.warn("[Rubic SDK] Could not load SDK exports:", e);
    }

    // Initialize SDK using the static createSDK method
    // The SDK requires a Configuration object with rpcProviders
    try {
      if (typeof SDK.createSDK !== "function") {
        return {
          success: false,
          error:
            "Rubic SDK.createSDK method not found. Please check SDK version compatibility.",
        };
      }

      // Build configuration object for Rubic SDK
      const sdkConfig: any = {
        rpcProviders,
        // walletProvider will be set when user connects wallet
        // providerAddress can be set for fee sharing
        providerAddress: config.referrerAddress
          ? { evm: config.referrerAddress }
          : undefined,
        // Let SDK make direct API calls - no proxy
        // Rubic APIs should have proper CORS headers for client-side SDK
      };

      // Create SDK instance
      rubicSDKInstance = await SDK.createSDK(sdkConfig);

      isInitialized = true;

      console.log(
        "[Rubic SDK] Initialized successfully with networks:",
        confirmedNetworks
      );
      console.log(
        "[Rubic SDK] RPC Providers configured:",
        Object.keys(rpcProviders).map((key) => ({
          blockchain: key,
          rpcCount: rpcProviders[key]?.rpcList?.length || 0,
          rpcs: rpcProviders[key]?.rpcList || [],
        }))
      );

      return { success: true };
    } catch (initError) {
      return {
        success: false,
        error:
          initError instanceof Error
            ? initError.message
            : "Failed to initialize Rubic SDK",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to initialize Rubic SDK",
    };
  }
}

/**
 * Calculate on-chain trade
 *
 * Calculates the best trade route for swapping tokens within the same blockchain.
 *
 * @param params - Trade calculation parameters
 * @returns Array of trade options or error
 *
 * @example
 * const trades = await calculateOnChainTrade({
 *   fromToken: { blockchain: 'ethereum', address: '0x...' },
 *   fromAmount: '1000000000000000000',
 *   toToken: { blockchain: 'ethereum', address: '0x...' }
 * });
 */
export async function calculateOnChainTrade(
  params: CalculateTradeParams
): Promise<{ trades: RubicTrade[]; success: boolean; error?: string }> {
  try {
    ensureInitialized();

    if (!rubicSDKInstance) {
      return {
        trades: [],
        success: false,
        error: "Rubic SDK instance not available",
      };
    }

    // Check if both tokens are on the same blockchain
    if (params.fromToken.blockchain !== params.toToken.blockchain) {
      return {
        trades: [],
        success: false,
        error:
          "On-chain trades require tokens on the same blockchain. Use calculateCrossChainTrade for cross-chain swaps.",
      };
    }

    // Convert tokens to SDK format
    const fromTokenSDK = await convertTokenToSDKFormat(params.fromToken);
    const toTokenSDK = await convertTokenToSDKFormat(params.toToken);

    // Use instantTrades API if available
    let trades: any[] = [];

    // The SDK expects Token objects and amount as a number (human-readable format)
    const amountAsNumber = parseFloat(params.fromAmount);
    const slippage =
      params.slippageTolerance && !isNaN(params.slippageTolerance)
        ? params.slippageTolerance
        : 1;

    console.log(`[Rubic SDK] Amount for on-chain:`, {
      humanReadable: params.fromAmount,
      asNumber: amountAsNumber,
    });

    try {
      // According to docs: https://docs.rubic.finance/integrate-sdk/trade-calculation
      // On-chain trades should use sdk.onChainManager.calculateTrade()
      // Returns: Promise<Array<OnChainTrade | OnChainTradeError>>
      if (rubicSDKInstance.onChainManager?.calculateTrade) {
        // Call method directly on the instance to preserve 'this' context
        console.log(`[Rubic SDK] Calling onChainManager.calculateTrade`);
        try {
          const result = await rubicSDKInstance.onChainManager.calculateTrade(
            fromTokenSDK,
            amountAsNumber, // string | number as per docs
            toTokenSDK, // Token | string | PriceToken as per docs
            {
              slippageTolerance: slippage,
            }
          );
          // Result is Array<OnChainTrade | OnChainTradeError>
          trades = Array.isArray(result) ? result : [result];
        } catch (e1) {
          console.log(`[Rubic SDK] Trying without options object`);
          const result = await rubicSDKInstance.onChainManager.calculateTrade(
            fromTokenSDK,
            amountAsNumber,
            toTokenSDK
          );
          trades = Array.isArray(result) ? result : [result];
        }
      } else if (rubicSDKInstance.instantTrades?.calculateTrade) {
        // Fallback to instantTrades if onChainManager not available
        console.log(
          `[Rubic SDK] Calling instantTrades.calculateTrade (fallback)`
        );
        try {
          const result = await rubicSDKInstance.instantTrades.calculateTrade(
            fromTokenSDK,
            amountAsNumber,
            toTokenSDK,
            {
              slippageTolerance: slippage,
            }
          );
          trades = Array.isArray(result) ? result : [result];
        } catch (e1) {
          console.log(`[Rubic SDK] Trying without options object`);
          const result = await rubicSDKInstance.instantTrades.calculateTrade(
            fromTokenSDK,
            amountAsNumber,
            toTokenSDK
          );
          trades = Array.isArray(result) ? result : [result];
        }
      } else {
        return {
          trades: [],
          success: false,
          error: "On-chain trade calculation not available in this SDK version",
        };
      }
    } catch (error) {
      console.error("[Rubic SDK] calculateTrade error:", error);
      console.error("[Rubic SDK] fromTokenSDK:", fromTokenSDK);
      console.error("[Rubic SDK] toTokenSDK:", toTokenSDK);
      console.error("[Rubic SDK] fromAmount:", params.fromAmount);
      console.error("[Rubic SDK] slippageTolerance:", params.slippageTolerance);
      throw error;
    }

    // Log the raw result to understand the structure
    console.log(`[Rubic SDK] Raw on-chain trades result:`, trades);
    console.log(`[Rubic SDK] On-chain trades count:`, trades.length);
    if (trades.length > 0) {
      console.log(`[Rubic SDK] First on-chain trade structure:`, trades[0]);
    }

    // Filter out OnChainTradeError objects - only keep valid trades
    // According to docs: result is Array<OnChainTrade | OnChainTradeError>
    // OnChainTradeError has an error property, OnChainTrade has trade data
    const validTrades = trades.filter((tradeOrError: any) => {
      // If it has an error property but no trade data, it's an error
      if (tradeOrError.error && !tradeOrError.to && !tradeOrError.toAmount) {
        console.log(
          `[Rubic SDK] Filtered out on-chain trade error:`,
          tradeOrError.error
        );
        return false;
      }
      // Valid trade has to/toAmount or expectedOutput
      return (
        tradeOrError.to || tradeOrError.toAmount || tradeOrError.expectedOutput
      );
    });

    console.log(`[Rubic SDK] Valid on-chain trades count:`, validTrades.length);

    // Map valid trades to our format
    const mappedTrades: RubicTrade[] = validTrades.map((trade: any) => ({
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.fromAmount,
      toAmount:
        trade.toAmount ||
        trade.expectedOutput ||
        trade.to?.tokenAmount?.toString() ||
        "0",
      estimatedGas: trade.gas || trade.estimatedGas || trade.gasLimit,
      fee: trade.fee || trade.totalFee,
      provider: trade.provider || trade.dex || trade.dexType,
      route: trade.route || [params.fromToken.blockchain],
      priceImpact: trade.priceImpact,
      executionTime: trade.executionTime,
    }));

    if (mappedTrades.length === 0) {
      return {
        trades: [],
        success: false,
        error:
          "No valid on-chain trades found. All DEXs may have failed or the route is not supported.",
      };
    }

    return {
      trades: mappedTrades,
      success: true,
    };
  } catch (error) {
    return {
      trades: [],
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to calculate trade",
    };
  }
}

/**
 * Calculate cross-chain trade
 *
 * Calculates the best trade route for swapping tokens across different blockchains.
 *
 * @param params - Trade calculation parameters
 * @returns Array of trade options or error
 *
 * @example
 * const trades = await calculateCrossChainTrade({
 *   fromToken: { blockchain: 'ethereum', address: '0x...' },
 *   fromAmount: '1000000000000000000',
 *   toToken: { blockchain: 'polygon', address: '0x...' }
 * });
 */
export async function calculateCrossChainTrade(
  params: CalculateTradeParams
): Promise<{ trades: RubicTrade[]; success: boolean; error?: string }> {
  try {
    ensureInitialized();

    if (!rubicSDKInstance) {
      return {
        trades: [],
        success: false,
        error: "Rubic SDK instance not available",
      };
    }

    // Convert tokens to SDK format
    const fromTokenSDK = await convertTokenToSDKFormat(params.fromToken);
    const toTokenSDK = await convertTokenToSDKFormat(params.toToken);

    // Use crossChain API if available
    let trades: any[] = [];

    // The SDK expects Token objects and amount as a number (human-readable format)
    // According to SDK examples, fromAmount should be a number like 1, not a string in wei
    const amountAsNumber = parseFloat(params.fromAmount);

    console.log(`[Rubic SDK] Amount for cross-chain:`, {
      humanReadable: params.fromAmount,
      asNumber: amountAsNumber,
    });

    // Inspect SDK structure to understand available methods
    console.log(`[Rubic SDK] crossChain structure:`, {
      hasCrossChain: !!rubicSDKInstance.crossChain,
      hasCrossChainManager: !!rubicSDKInstance.crossChainManager,
      crossChainKeys: rubicSDKInstance.crossChain
        ? Object.keys(rubicSDKInstance.crossChain)
        : [],
      crossChainManagerKeys: rubicSDKInstance.crossChainManager
        ? Object.keys(rubicSDKInstance.crossChainManager)
        : [],
    });

    // The SDK's calculateTrade might need an options object
    // Try with options object that includes slippage and other settings
    const slippage =
      params.slippageTolerance && !isNaN(params.slippageTolerance)
        ? params.slippageTolerance
        : 1;

    try {
      // According to docs: https://docs.rubic.finance/integrate-sdk/trade-calculation
      // Cross-chain trades should use sdk.crossChainManager.calculateTrade()
      // Returns: Promise<WrappedCrossChainTrade[]>
      // WrappedCrossChainTrade has: { trade: CrossChainTrade | null, tradeType: CrossChainTradeType, error?: RubicSdkError }
      if (rubicSDKInstance.crossChainManager?.calculateTrade) {
        // Call method directly on the instance to preserve 'this' context
        console.log(`[Rubic SDK] Calling crossChainManager.calculateTrade`);
        try {
          const result =
            await rubicSDKInstance.crossChainManager.calculateTrade(
              fromTokenSDK, // Token | { address: string, blockchain: BlockchainName } | PriceToken
              amountAsNumber, // string | number | BigNumber as per docs
              toTokenSDK, // Token | { address: string, blockchain: BlockchainName } | PriceToken
              {
                slippageTolerance: slippage,
              }
            );
          // Result is WrappedCrossChainTrade[]
          trades = Array.isArray(result) ? result : [result];
        } catch (e1) {
          console.log(`[Rubic SDK] Trying without options object`);
          const result =
            await rubicSDKInstance.crossChainManager.calculateTrade(
              fromTokenSDK,
              amountAsNumber,
              toTokenSDK
            );
          trades = Array.isArray(result) ? result : [result];
        }
      } else if (rubicSDKInstance.crossChain?.calculateTrade) {
        // Fallback to crossChain if crossChainManager not available
        console.log(`[Rubic SDK] Calling crossChain.calculateTrade (fallback)`);
        try {
          const result = await rubicSDKInstance.crossChain.calculateTrade(
            fromTokenSDK,
            amountAsNumber,
            toTokenSDK,
            {
              slippageTolerance: slippage,
            }
          );
          trades = Array.isArray(result) ? result : [result];
        } catch (e1) {
          console.log(`[Rubic SDK] Trying without options object`);
          const result = await rubicSDKInstance.crossChain.calculateTrade(
            fromTokenSDK,
            amountAsNumber,
            toTokenSDK
          );
          trades = Array.isArray(result) ? result : [result];
        }
      } else {
        return {
          trades: [],
          success: false,
          error:
            "Cross-chain trade calculation not available in this SDK version",
        };
      }
    } catch (error) {
      console.error("[Rubic SDK] calculateCrossChainTrade error:", error);
      console.error("[Rubic SDK] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      console.error("[Rubic SDK] fromTokenSDK:", fromTokenSDK);
      console.error("[Rubic SDK] toTokenSDK:", toTokenSDK);
      console.error("[Rubic SDK] fromAmount:", params.fromAmount);
      console.error("[Rubic SDK] slippageTolerance:", params.slippageTolerance);

      // If the error is about no trades found, return empty array instead of throwing
      if (
        error instanceof Error &&
        error.message.includes("No success providers")
      ) {
        return {
          trades: [],
          success: false,
          error:
            "No valid trades found. All providers failed or the route is not supported.",
        };
      }

      throw error;
    }

    // Log the raw result to understand the structure
    console.log(`[Rubic SDK] Raw cross-chain trades result:`, trades);
    console.log(`[Rubic SDK] Cross-chain trades count:`, trades.length);
    if (trades.length > 0) {
      console.log(`[Rubic SDK] First cross-chain trade structure:`, trades[0]);
    }

    // According to docs: result is WrappedCrossChainTrade[]
    // WrappedCrossChainTrade structure:
    // { trade: CrossChainTrade | null, tradeType: CrossChainTradeType, error?: RubicSdkError }
    // Filter out wrapped trades where trade is null or has critical errors
    const validTrades = trades.filter((wrappedTrade: any) => {
      // Valid wrapped trade has a non-null trade property
      if (wrappedTrade.trade !== null && wrappedTrade.trade !== undefined) {
        return true;
      }
      // Log filtered trades for debugging
      if (wrappedTrade.error) {
        console.log(`[Rubic SDK] Filtered out cross-chain trade with error:`, {
          tradeType: wrappedTrade.tradeType,
          error: wrappedTrade.error,
        });
      }
      return false;
    });

    console.log(
      `[Rubic SDK] Valid cross-chain trades count:`,
      validTrades.length
    );

    // Map WrappedCrossChainTrade to our format
    // Each validTrades item is a WrappedCrossChainTrade with { trade, tradeType, error? }
    // Use the first trade (index 0) as it's already sorted by the SDK
    const bestTrade = validTrades[0];

    if (!bestTrade || !bestTrade.trade) {
      return {
        trades: [],
        success: false,
        error: "No valid cross-chain trades found.",
      };
    }

    const trade = bestTrade.trade;

    // Log the trade structure for debugging
    console.log(`[Rubic SDK] Best trade structure:`, {
      actualTokenAmount: trade.actualTokenAmount,
      toTokenAmountMin: trade.toTokenAmountMin,
      toWeiAmount: trade.to?.weiAmount,
      toDecimals: trade.to?.decimals,
      to: trade.to,
      hasActualTokenAmount: !!trade.actualTokenAmount,
      tradeKeys: Object.keys(trade),
    });

    // Extract amount - CrossChainTrade has actualTokenAmount (human-readable) or to.weiAmount
    // actualTokenAmount is the human-readable amount we want to display
    let toAmount = "0";

    if (trade.actualTokenAmount) {
      toAmount = String(trade.actualTokenAmount);
    } else if (trade.toTokenAmountMin) {
      toAmount = String(trade.toTokenAmountMin);
    } else if (trade.to?.weiAmount) {
      // Convert wei to human-readable format
      const weiAmount = parseFloat(String(trade.to.weiAmount));
      const decimals = trade.to.decimals || 18;
      toAmount = (weiAmount / 10 ** decimals).toString();
    } else if (trade.toAmount) {
      toAmount = String(trade.toAmount);
    }

    console.log(`[Rubic SDK] Extracted toAmount:`, toAmount);

    // Extract fee from feeInfo
    const fee =
      trade.feeInfo?.rubicProxy?.fixedFee?.amount ||
      trade.fee ||
      trade.totalFee ||
      "0";

    // Extract provider/bridge type
    const provider =
      trade.type ||
      trade.bridgeType ||
      bestTrade.tradeType ||
      trade.provider ||
      "unknown";

    // Extract route path
    const route = trade.routePath?.map((path: any) => path.provider) || [
        provider,
      ] || [params.fromToken.blockchain, params.toToken.blockchain];

    const mappedTrade: RubicTrade = {
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.fromAmount,
      toAmount: toAmount.toString(),
      estimatedGas:
        trade.gasData?.gasLimit?.toString() ||
        trade.gas ||
        trade.estimatedGas ||
        trade.gasLimit,
      fee: fee.toString(),
      provider: provider,
      route: route,
      priceImpact: trade.priceImpact || null,
      executionTime: trade.executionTime || 90, // Default 90 seconds for cross-chain
    };

    return {
      trades: [mappedTrade],
      success: true,
    };
  } catch (error) {
    return {
      trades: [],
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to calculate trade",
    };
  }
}

/**
 * Calculate trade (auto-detect on-chain vs cross-chain)
 *
 * Automatically determines if the trade is on-chain or cross-chain
 * and calls the appropriate calculation method.
 *
 * @param params - Trade calculation parameters
 * @returns Array of trade options or error
 */
export async function calculateTrade(
  params: CalculateTradeParams
): Promise<{ trades: RubicTrade[]; success: boolean; error?: string }> {
  const isCrossChain =
    params.fromToken.blockchain !== params.toToken.blockchain;

  if (isCrossChain) {
    return calculateCrossChainTrade(params);
  } else {
    return calculateOnChainTrade(params);
  }
}

/**
 * Execute swap
 *
 * Executes a swap transaction based on the calculated trade.
 *
 * @param params - Swap execution parameters
 * @returns Swap result with transaction hash or error
 *
 * @example
 * const result = await executeSwap({
 *   trade: bestTrade,
 *   userAddress: '0x...'
 * });
 * if (result.success) {
 *   console.log('Swap executed! TX:', result.transactionHash);
 * }
 */
export async function executeSwap(
  params: ExecuteSwapParams
): Promise<SwapResult> {
  try {
    ensureInitialized();

    if (!rubicSDKInstance) {
      return {
        success: false,
        error: "Rubic SDK instance not available",
      };
    }

    if (!currentProvider) {
      return {
        success: false,
        error: "Provider not available. Please initialize SDK with a provider.",
      };
    }

    // Determine if it's on-chain or cross-chain
    const isCrossChain =
      params.trade.fromToken.blockchain !== params.trade.toToken.blockchain;

    let transactionHash: string | undefined;

    // Execute swap based on type
    if (isCrossChain) {
      if (rubicSDKInstance.crossChain?.swap) {
        const result = await rubicSDKInstance.crossChain.swap(
          params.trade,
          params.userAddress,
          { slippageTolerance: params.slippageTolerance || 1 }
        );
        transactionHash = result.txHash || result.transactionHash;
      } else if (rubicSDKInstance.crossChainManager?.executeTrade) {
        const result = await rubicSDKInstance.crossChainManager.executeTrade(
          params.trade,
          params.userAddress
        );
        transactionHash = result.txHash || result.transactionHash;
      } else {
        return {
          success: false,
          error: "Cross-chain swap execution not available in this SDK version",
        };
      }
    } else {
      if (rubicSDKInstance.instantTrades?.swap) {
        const result = await rubicSDKInstance.instantTrades.swap(
          params.trade,
          params.userAddress,
          { slippageTolerance: params.slippageTolerance || 1 }
        );
        transactionHash = result.txHash || result.transactionHash;
      } else if (rubicSDKInstance.onChainManager?.executeTrade) {
        const result = await rubicSDKInstance.onChainManager.executeTrade(
          params.trade,
          params.userAddress
        );
        transactionHash = result.txHash || result.transactionHash;
      } else {
        return {
          success: false,
          error: "On-chain swap execution not available in this SDK version",
        };
      }
    }

    if (!transactionHash) {
      return {
        success: false,
        error: "Swap executed but no transaction hash returned",
      };
    }

    return {
      success: true,
      transactionHash,
      trade: params.trade,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to execute swap",
    };
  }
}

/**
 * Get supported networks
 *
 * @returns Array of supported blockchain names
 */
export function getSupportedNetworks(): RubicBlockchain[] {
  return [
    "ethereum",
    "bsc",
    "polygon",
    "arbitrum",
    "optimism",
    "base",
    "solana",
    "near",
  ];
}

/**
 * Check if network is supported
 *
 * @param network - Network key or blockchain name
 * @returns True if network is supported
 */
export function isNetworkSupported(network: string): boolean {
  const rubicBlockchain = mapToRubicBlockchain(network);
  if (!rubicBlockchain) return false;
  return getSupportedNetworks().includes(rubicBlockchain);
}

/**
 * Get network chain ID
 *
 * @param blockchain - Rubic blockchain name
 * @returns Chain ID or null if not found
 */
export function getNetworkChainId(blockchain: RubicBlockchain): number | null {
  return NETWORK_CHAIN_IDS[blockchain] ?? null;
}

/**
 * Get network name
 *
 * @param blockchain - Rubic blockchain name
 * @returns Network display name
 */
export function getNetworkName(blockchain: RubicBlockchain): string {
  return NETWORK_NAMES[blockchain] || blockchain;
}

/**
 * Get native token address for a blockchain
 *
 * @param blockchain - Rubic blockchain name
 * @returns Native token address (empty string for non-EVM)
 */
export function getNativeTokenAddress(blockchain: RubicBlockchain): string {
  return NATIVE_TOKEN_ADDRESSES[blockchain] || "";
}
