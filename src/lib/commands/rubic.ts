/**
 * Rubic SDK Commands
 *
 * Interactive commands for cross-chain and on-chain swaps using Rubic SDK.
 * Supports 8 confirmed networks: Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Solana, NEAR
 */

import type { Command, CommandContext } from "@/types/commands";
import { rubic } from "@/lib/api";
import type {
  RubicBlockchain,
  RubicToken,
  CalculateTradeParams,
  RubicTrade,
} from "@/types/rubic";
import { formatNumber, escapeHtml } from "@/lib/utils";
import { createCommandLine, createUsageError } from "./command-output-helpers";
import { BrowserProvider } from "ethers";

// ============================================================================
// Constants
// ============================================================================

const SUPPORTED_NETWORKS: RubicBlockchain[] = [
  "ethereum",
  "bsc",
  "polygon",
  "arbitrum",
  "optimism",
  "base",
  "solana",
  "near",
];

const NETWORK_DISPLAY_NAMES: Record<RubicBlockchain, string> = {
  ethereum: "Ethereum",
  bsc: "BNB Smart Chain",
  polygon: "Polygon",
  arbitrum: "Arbitrum One",
  optimism: "Optimism",
  base: "Base",
  solana: "Solana",
  near: "NEAR Protocol",
};

// Common native token addresses
const NATIVE_TOKENS: Record<RubicBlockchain, { address: string; symbol: string }> = {
  ethereum: { address: "0x0000000000000000000000000000000000000000", symbol: "ETH" },
  bsc: { address: "0x0000000000000000000000000000000000000000", symbol: "BNB" },
  polygon: { address: "0x0000000000000000000000000000000000000000", symbol: "MATIC" },
  arbitrum: { address: "0x0000000000000000000000000000000000000000", symbol: "ETH" },
  optimism: { address: "0x0000000000000000000000000000000000000000", symbol: "ETH" },
  base: { address: "0x0000000000000000000000000000000000000000", symbol: "ETH" },
  solana: { address: "", symbol: "SOL" },
  near: { address: "", symbol: "NEAR" },
};

// ============================================================================
// Interactive Swap State
// ============================================================================

interface SwapState {
  step:
    | "fromNetwork"
    | "fromToken"
    | "fromAmount"
    | "toNetwork"
    | "toToken"
    | "confirm"
    | null;
  fromNetwork?: RubicBlockchain;
  fromToken?: RubicToken;
  fromAmount?: string;
  toNetwork?: RubicBlockchain;
  toToken?: RubicToken;
  trades?: RubicTrade[];
  selectedTrade?: RubicTrade;
}

let swapState: SwapState | null = null;
let swapContext: CommandContext | null = null;

/**
 * Check if swap is awaiting input
 */
export function isAwaitingSwapInput(): boolean {
  return swapState !== null && swapContext !== null;
}

/**
 * Cancel swap
 */
export function cancelSwap(): void {
  if (swapState && swapContext) {
    swapContext.log("Swap cancelled.", "warning");
  }
  swapState = null;
  swapContext = null;
}

/**
 * Handle user input during swap
 */
export function handleSwapInput(input: string): boolean {
  if (!swapState || !swapContext) {
    return false;
  }

  const trimmed = input.trim().toLowerCase();

  try {
    switch (swapState.step) {
      case "fromNetwork":
        if (!trimmed || trimmed === "cancel") {
          cancelSwap();
          return true;
        }
        const fromNet = findNetwork(trimmed);
        if (!fromNet) {
          swapContext.log(
            `Invalid network. Supported: ${SUPPORTED_NETWORKS.join(", ")}`,
            "error"
          );
          swapContext.log("Enter source network:", "info");
          return true;
        }
        swapState.fromNetwork = fromNet;
        swapState.step = "fromToken";
        swapContext.log(
          `Source network: ${NETWORK_DISPLAY_NAMES[fromNet]}`,
          "success"
        );
        swapContext.log(
          'Enter source token address (or "native" for native token):',
          "info"
        );
        return true;

      case "fromToken":
        if (!trimmed || trimmed === "cancel") {
          cancelSwap();
          return true;
        }
        const fromTokenAddr =
          trimmed === "native"
            ? NATIVE_TOKENS[swapState.fromNetwork!].address
            : trimmed;
        swapState.fromToken = {
          blockchain: swapState.fromNetwork!,
          address: fromTokenAddr,
        };
        swapState.step = "fromAmount";
        swapContext.log(
          `Source token: ${trimmed === "native" ? NATIVE_TOKENS[swapState.fromNetwork!].symbol : fromTokenAddr}`,
          "success"
        );
        swapContext.log("Enter amount to swap:", "info");
        return true;

      case "fromAmount":
        if (!trimmed || trimmed === "cancel") {
          cancelSwap();
          return true;
        }
        const amount = parseFloat(trimmed);
        if (isNaN(amount) || amount <= 0) {
          swapContext.log("Invalid amount. Please enter a positive number.", "error");
          swapContext.log("Enter amount to swap:", "info");
          return true;
        }
        swapState.fromAmount = trimmed;
        swapState.step = "toNetwork";
        swapContext.log(`Amount: ${trimmed}`, "success");
        swapContext.log("Enter destination network:", "info");
        return true;

      case "toNetwork":
        if (!trimmed || trimmed === "cancel") {
          cancelSwap();
          return true;
        }
        const toNet = findNetwork(trimmed);
        if (!toNet) {
          swapContext.log(
            `Invalid network. Supported: ${SUPPORTED_NETWORKS.join(", ")}`,
            "error"
          );
          swapContext.log("Enter destination network:", "info");
          return true;
        }
        swapState.toNetwork = toNet;
        swapState.step = "toToken";
        swapContext.log(
          `Destination network: ${NETWORK_DISPLAY_NAMES[toNet]}`,
          "success"
        );
        swapContext.log(
          'Enter destination token address (or "native" for native token):',
          "info"
        );
        return true;

      case "toToken":
        if (!trimmed || trimmed === "cancel") {
          cancelSwap();
          return true;
        }
        const toTokenAddr =
          trimmed === "native"
            ? NATIVE_TOKENS[swapState.toNetwork!].address
            : trimmed;
        swapState.toToken = {
          blockchain: swapState.toNetwork!,
          address: toTokenAddr,
        };
        swapState.step = "confirm";
        swapContext.log(
          `Destination token: ${trimmed === "native" ? NATIVE_TOKENS[swapState.toNetwork!].symbol : toTokenAddr}`,
          "success"
        );
        // Calculate trades
        void calculateTradesForSwap();
        return true;

      case "confirm":
        if (trimmed === "yes" || trimmed === "y") {
          void executeSwapFromState();
        } else if (trimmed === "no" || trimmed === "n" || trimmed === "cancel") {
          cancelSwap();
        } else {
          swapContext.log('Please enter "yes" or "no":', "warning");
          swapContext.log("Confirm swap? (yes/no):", "info");
        }
        return true;

      default:
        return false;
    }
  } catch (error) {
    swapContext?.log(
      `Error: ${error instanceof Error ? error.message : String(error)}`,
      "error"
    );
    cancelSwap();
    return true;
  }
}

/**
 * Find network by name or alias
 */
function findNetwork(input: string): RubicBlockchain | null {
  const normalized = input.toLowerCase().trim();
  const mapping: Record<string, RubicBlockchain> = {
    ethereum: "ethereum",
    eth: "ethereum",
    "1": "ethereum",
    bsc: "bsc",
    binance: "bsc",
    "binance smart chain": "bsc",
    "56": "bsc",
    polygon: "polygon",
    matic: "polygon",
    "137": "polygon",
    arbitrum: "arbitrum",
    "42161": "arbitrum",
    optimism: "optimism",
    "10": "optimism",
    base: "base",
    "8453": "base",
    solana: "solana",
    sol: "solana",
    near: "near",
    "near protocol": "near",
  };
  return mapping[normalized] || null;
}

/**
 * Calculate trades for current swap state
 */
async function calculateTradesForSwap(): Promise<void> {
  if (!swapState || !swapContext) return;

  swapContext.log("Calculating best routes...", "info");

  try {
    // Convert amount to wei (assuming 18 decimals for most tokens)
    // In production, you'd fetch token decimals
    const fromAmountWei = (
      parseFloat(swapState.fromAmount || "0") *
      10 ** 18
    ).toString();

    const params: CalculateTradeParams = {
      fromToken: swapState.fromToken!,
      fromAmount: fromAmountWei,
      toToken: swapState.toToken!,
      slippageTolerance: 1,
    };

    const result = await rubic.calculateTrade(params);

    if (!result.success || result.trades.length === 0) {
      swapContext.log(
        result.error || "No trade routes found",
        "error"
      );
      cancelSwap();
      return;
    }

    swapState.trades = result.trades;
    swapState.selectedTrade = result.trades[0]!; // Select best trade

    // Display trade options
    displayTradeOptions();
  } catch (error) {
    swapContext?.log(
      `Failed to calculate trades: ${error instanceof Error ? error.message : String(error)}`,
      "error"
    );
    cancelSwap();
  }
}

/**
 * Display trade options
 */
function displayTradeOptions(): void {
  if (!swapState || !swapContext || !swapState.trades) return;

  const trade = swapState.selectedTrade!;
  const fromAmount = parseFloat(swapState.fromAmount || "0");
  // toAmount is already in human-readable format from the SDK
  const toAmount = parseFloat(trade.toAmount);

  const html = `
    <div style="
      background: linear-gradient(135deg, 
        color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent), 
        color-mix(in srgb, var(--palette-secondary, #00ff88) 8%, transparent)
      );
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
      border-radius: 12px;
      padding: 20px;
      margin: 12px 0;
    ">
      <div style="
        font-size: 18px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
        text-align: center;
      ">
        💱 Swap Quote
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 16px;
        align-items: center;
        margin-bottom: 16px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(0, 0, 0, 0.3)) 50%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.2)) 50%, transparent);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="
            font-size: 11px;
            color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent);
            margin-bottom: 4px;
            text-transform: uppercase;
          ">From</div>
          <div style="
            font-size: 16px;
            font-weight: 600;
            color: var(--palette-text, #ccd4e0);
          ">${fromAmount.toFixed(6)}</div>
          <div style="
            font-size: 12px;
            color: var(--palette-muted, #99ccff);
          ">${NETWORK_DISPLAY_NAMES[swapState.fromNetwork!]}</div>
        </div>
        
        <div style="
          font-size: 24px;
          color: var(--palette-secondary, #00ff88);
        ">→</div>
        
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(0, 0, 0, 0.3)) 50%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.2)) 50%, transparent);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="
            font-size: 11px;
            color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent);
            margin-bottom: 4px;
            text-transform: uppercase;
          ">To</div>
          <div style="
            font-size: 16px;
            font-weight: 600;
            color: var(--palette-text, #ccd4e0);
          ">${toAmount.toFixed(6)}</div>
          <div style="
            font-size: 12px;
            color: var(--palette-muted, #99ccff);
          ">${NETWORK_DISPLAY_NAMES[swapState.toNetwork!]}</div>
        </div>
      </div>
      
      ${trade.provider ? `
        <div style="
          font-size: 12px;
          color: var(--palette-muted, #99ccff);
          text-align: center;
          margin-bottom: 12px;
        ">
          Provider: ${escapeHtml(trade.provider)}
        </div>
      ` : ""}
      
      ${trade.estimatedGas ? `
        <div style="
          font-size: 12px;
          color: var(--palette-muted, #99ccff);
          text-align: center;
          margin-bottom: 12px;
        ">
          Estimated Gas: ${escapeHtml(trade.estimatedGas)}
        </div>
      ` : ""}
      
      <div style="
        text-align: center;
        margin-top: 16px;
      ">
        <div style="
          color: var(--palette-text, #ccd4e0);
          margin-bottom: 8px;
        ">Confirm swap? (yes/no)</div>
      </div>
    </div>
  `;

  swapContext.logHtml(html);
}

/**
 * Execute swap from state
 */
async function executeSwapFromState(): Promise<void> {
  if (!swapState || !swapContext || !swapState.selectedTrade) return;

  swapContext.log("Executing swap...", "info");

  try {
    // Get wallet address
    const address = swapContext.wallet.state.address;
    if (!address) {
      swapContext.log("No wallet connected. Please connect a wallet first.", "error");
      cancelSwap();
      return;
    }

    // Initialize SDK if needed
    const provider = swapContext.wallet.getProvider();
    if (!provider) {
      swapContext.log("No provider available. Please connect a wallet.", "error");
      cancelSwap();
      return;
    }

    // Convert to BrowserProvider if needed (ethers v6)
    const browserProvider = provider instanceof BrowserProvider 
      ? provider 
      : new BrowserProvider(provider);

    // Initialize Rubic SDK
    const initResult = await rubic.initializeSDK({ provider: browserProvider });
    if (!initResult.success) {
      swapContext.log(
        `Failed to initialize Rubic SDK: ${initResult.error}`,
        "error"
      );
      cancelSwap();
      return;
    }

    // Execute swap
    const result = await rubic.executeSwap({
      trade: swapState.selectedTrade,
      userAddress: address,
      slippageTolerance: 1,
    });

    if (result.success && result.transactionHash) {
      const html = `
        <div style="
          background: linear-gradient(135deg, 
            color-mix(in srgb, var(--palette-secondary, #00ff88) 12%, transparent), 
            color-mix(in srgb, var(--palette-success, #00ff88) 8%, transparent)
          );
          border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
          border-radius: 12px;
          padding: 20px;
          margin: 12px 0;
        ">
          <div style="
            font-size: 18px;
            font-weight: bold;
            color: var(--palette-secondary, #00ff88);
            margin-bottom: 12px;
            text-align: center;
          ">
            ✅ Swap Executed Successfully!
          </div>
          <div style="
            font-size: 14px;
            color: var(--palette-text, #ccd4e0);
            text-align: center;
            word-break: break-all;
          ">
            Transaction Hash: ${escapeHtml(result.transactionHash)}
          </div>
        </div>
      `;
      swapContext.logHtml(html);
      swapContext.log("Swap executed successfully!", "success");
    } else {
      swapContext.log(
        `Swap failed: ${result.error || "Unknown error"}`,
        "error"
      );
    }
  } catch (error) {
    swapContext.log(
      `Swap execution error: ${error instanceof Error ? error.message : String(error)}`,
      "error"
    );
  } finally {
    cancelSwap();
  }
}

// ============================================================================
// Command Handlers
// ============================================================================

/**
 * Handle swap command
 */
async function handleSwap(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Check if already in swap flow
  if (isAwaitingSwapInput()) {
    context.log("A swap is already in progress. Complete or cancel it first.", "warning");
    return;
  }

  // Initialize swap state
  swapState = {
    step: "fromNetwork",
  };
  swapContext = context;

  context.log("💱 Rubic Cross-Chain Swap", "info");
  context.log("", "info");
  context.log("Supported networks:", "info");
  SUPPORTED_NETWORKS.forEach((net) => {
    context.log(`  • ${NETWORK_DISPLAY_NAMES[net]}`, "output");
  });
  context.log("", "info");
  context.log("Enter source network (or 'cancel' to abort):", "info");
}

/**
 * Handle quote command
 */
async function handleQuote(
  context: CommandContext,
  args: string[]
): Promise<void> {
  if (args.length < 6) {
    context.log("Usage: rubic quote <fromNetwork> <fromToken> <amount> <toNetwork> <toToken>", "error");
    context.log("Example: rubic quote ethereum native 1 polygon native", "info");
    return;
  }

  // Parse arguments (case-insensitive)
  const fromNetworkInput = (args[2] || "").toLowerCase();
  const fromNetwork = findNetwork(fromNetworkInput);
  const fromTokenInput = args[3] || "";
  const fromTokenAddr = fromTokenInput.toLowerCase() === "native" 
    ? (fromNetwork ? NATIVE_TOKENS[fromNetwork]?.address || "" : "") 
    : fromTokenInput;
  const fromAmount = args[4] || "";
  const toNetworkInput = (args[5] || "").toLowerCase();
  const toNetwork = findNetwork(toNetworkInput);
  const toTokenInput = args[6] || "";
  const toTokenAddr = toTokenInput.toLowerCase() === "native" 
    ? (toNetwork ? NATIVE_TOKENS[toNetwork]?.address || "" : "") 
    : toTokenInput;

  if (!fromNetwork || !toNetwork) {
    context.log(`Invalid network. Received: "${args[2]}" and "${args[5]}". Use: ethereum, bsc, polygon, arbitrum, optimism, base, solana, near`, "error");
    context.log(`Parsed as: fromNetwork=${fromNetwork}, toNetwork=${toNetwork}`, "info");
    return;
  }

  if (!fromTokenAddr || !toTokenAddr) {
    context.log("Invalid token addresses. Use token address or 'native' for native tokens.", "error");
    return;
  }

  context.log("Calculating quote...", "info");

  try {
    // Initialize SDK (quotes don't require a wallet, but SDK needs to be initialized)
    // Try to get provider if available, but initialize even without it
    let initConfig: any = {};
    const provider = context.wallet.getProvider();
    if (provider) {
      // Convert to BrowserProvider if needed (ethers v6)
      const browserProvider = provider instanceof BrowserProvider 
        ? provider 
        : new BrowserProvider(provider);
      initConfig.provider = browserProvider;
    }
    
    // Initialize SDK (can work without provider for quotes)
    context.log("Initializing Rubic SDK...", "info");
    const initResult = await rubic.initializeSDK(initConfig);
    if (!initResult.success) {
      context.log(
        `❌ Failed to initialize Rubic SDK: ${initResult.error}`,
        "error"
      );
      context.log("Note: SDK initialization may require network connectivity.", "info");
      return;
    }
    context.log("✅ Rubic SDK initialized successfully", "success");

    // The Rubic SDK expects amount in human-readable format (e.g., "1" for 1 token)
    // The SDK will convert it internally using the token's decimals
    // DO NOT convert to wei here - the SDK handles that conversion
    
    // Log for debugging
    console.log(`[Rubic Quote] Amount (human-readable):`, {
      input: fromAmount,
      passingToSDK: fromAmount,
    });

    const params: CalculateTradeParams = {
      fromToken: {
        blockchain: fromNetwork,
        address: fromTokenAddr,
      },
      fromAmount: fromAmount, // Pass human-readable amount, SDK converts internally
      toToken: {
        blockchain: toNetwork,
        address: toTokenAddr,
      },
      slippageTolerance: 1, // 1% slippage
    };

    context.log(`Calculating trade: ${fromAmount} on ${NETWORK_DISPLAY_NAMES[fromNetwork]} → ${NETWORK_DISPLAY_NAMES[toNetwork]}...`, "info");
    const result = await rubic.calculateTrade(params);

    if (!result.success || result.trades.length === 0) {
      context.log(result.error || "No quotes available", "error");
      return;
    }

    const bestTrade = result.trades[0]!;
    // toAmount is already in human-readable format from the SDK
    const toAmount = parseFloat(bestTrade.toAmount);

    const html = `
      <div style="
        background: linear-gradient(135deg, 
          color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent), 
          color-mix(in srgb, var(--palette-secondary, #00ff88) 8%, transparent)
        );
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
        border-radius: 12px;
        padding: 20px;
        margin: 12px 0;
      ">
        <div style="
          font-size: 18px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 16px;
          text-align: center;
        ">
          💱 Swap Quote
        </div>
        
        <div style="
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 16px;
          align-items: center;
        ">
          <div style="
            background: color-mix(in srgb, var(--palette-surface, rgba(0, 0, 0, 0.3)) 50%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.2)) 50%, transparent);
            border-radius: 8px;
            padding: 12px;
          ">
            <div style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent); margin-bottom: 4px; text-transform: uppercase;">From</div>
            <div style="font-size: 16px; font-weight: 600; color: var(--palette-text, #ccd4e0);">${fromAmount}</div>
            <div style="font-size: 12px; color: var(--palette-muted, #99ccff);">${NETWORK_DISPLAY_NAMES[fromNetwork]}</div>
          </div>
          
          <div style="font-size: 24px; color: var(--palette-secondary, #00ff88);">→</div>
          
          <div style="
            background: color-mix(in srgb, var(--palette-surface, rgba(0, 0, 0, 0.3)) 50%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.2)) 50%, transparent);
            border-radius: 8px;
            padding: 12px;
          ">
            <div style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent); margin-bottom: 4px; text-transform: uppercase;">To</div>
            <div style="font-size: 16px; font-weight: 600; color: var(--palette-text, #ccd4e0);">${toAmount.toFixed(6)}</div>
            <div style="font-size: 12px; color: var(--palette-muted, #99ccff);">${NETWORK_DISPLAY_NAMES[toNetwork]}</div>
          </div>
        </div>
        
        ${bestTrade.provider ? `
          <div style="font-size: 12px; color: var(--palette-muted, #99ccff); text-align: center; margin-top: 12px;">
            Provider: ${escapeHtml(bestTrade.provider)}
          </div>
        ` : ""}
      </div>
    `;

    context.logHtml(html);
  } catch (error) {
    context.log(
      `Failed to get quote: ${error instanceof Error ? error.message : String(error)}`,
      "error"
    );
  }
}

/**
 * Handle tokens command - fetch available tokens
 */
async function handleTokens(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const network = args[2] ? findNetwork(args[2]) : null;

  if (!network) {
    context.log("Usage: rubic tokens <network>", "error");
    context.log("Supported networks:", "info");
    SUPPORTED_NETWORKS.forEach((net) => {
      context.log(`  • ${NETWORK_DISPLAY_NAMES[net]}`, "output");
    });
    return;
  }

  context.log(`Fetching available tokens on ${NETWORK_DISPLAY_NAMES[network]}...`, "info");
  context.log("", "info");

  // Note: Rubic SDK doesn't have a direct "list tokens" API
  // In production, you'd need to:
  // 1. Use Rubic's backend API to fetch token list
  // 2. Or maintain a curated list of popular tokens
  // 3. Or use a token registry like CoinGecko

  // For now, show common tokens
  const commonTokens: Record<RubicBlockchain, Array<{ symbol: string; address: string; name: string }>> = {
    ethereum: [
      { symbol: "ETH", address: "0x0000000000000000000000000000000000000000", name: "Ethereum" },
      { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", name: "USD Coin" },
      { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", name: "Tether" },
      { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", name: "Wrapped ETH" },
      { symbol: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", name: "Dai Stablecoin" },
    ],
    bsc: [
      { symbol: "BNB", address: "0x0000000000000000000000000000000000000000", name: "BNB" },
      { symbol: "USDC", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", name: "USD Coin" },
      { symbol: "USDT", address: "0x55d398326f99059fF775485246999027B3197955", name: "Tether" },
      { symbol: "BUSD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", name: "Binance USD" },
    ],
    polygon: [
      { symbol: "MATIC", address: "0x0000000000000000000000000000000000000000", name: "Polygon" },
      { symbol: "USDC", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", name: "USD Coin" },
      { symbol: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", name: "Tether" },
      { symbol: "WMATIC", address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", name: "Wrapped MATIC" },
    ],
    arbitrum: [
      { symbol: "ETH", address: "0x0000000000000000000000000000000000000000", name: "Ethereum" },
      { symbol: "USDC", address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", name: "USD Coin" },
      { symbol: "USDT", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", name: "Tether" },
    ],
    optimism: [
      { symbol: "ETH", address: "0x0000000000000000000000000000000000000000", name: "Ethereum" },
      { symbol: "USDC", address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", name: "USD Coin" },
    ],
    base: [
      { symbol: "ETH", address: "0x0000000000000000000000000000000000000000", name: "Ethereum" },
      { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", name: "USD Coin" },
    ],
    solana: [
      { symbol: "SOL", address: "", name: "Solana" },
      { symbol: "USDC", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", name: "USD Coin" },
      { symbol: "USDT", address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", name: "Tether" },
    ],
    near: [
      { symbol: "NEAR", address: "", name: "NEAR Protocol" },
      { symbol: "USDC", address: "17208628f84f5d6ad33f0da3bbbeb27eef1c4e97", name: "USD Coin" },
    ],
  };

  const tokens = commonTokens[network] || [];

  const html = `
    <div style="
      background: linear-gradient(135deg, 
        color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent), 
        color-mix(in srgb, var(--palette-secondary, #00ff88) 8%, transparent)
      );
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
      border-radius: 12px;
      padding: 20px;
      margin: 12px 0;
    ">
      <div style="
        font-size: 18px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
        text-align: center;
      ">
        🪙 Available Tokens on ${NETWORK_DISPLAY_NAMES[network]}
      </div>
      
      <div style="
        display: grid;
        gap: 8px;
      ">
        ${tokens.map((token) => `
          <div style="
            background: color-mix(in srgb, var(--palette-surface, rgba(0, 0, 0, 0.3)) 50%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.2)) 50%, transparent);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div>
              <div style="font-size: 14px; font-weight: 600; color: var(--palette-text, #ccd4e0);">
                ${escapeHtml(token.symbol)} - ${escapeHtml(token.name)}
              </div>
              ${token.address ? `
                <div style="font-size: 11px; color: var(--palette-muted, #99ccff); font-family: monospace; word-break: break-all;">
                  ${escapeHtml(token.address)}
                </div>
              ` : `
                <div style="font-size: 11px; color: var(--palette-muted, #99ccff);">
                  Native token
                </div>
              `}
            </div>
          </div>
        `).join("")}
      </div>
      
      <div style="
        font-size: 12px;
        color: var(--palette-muted, #99ccff);
        text-align: center;
        margin-top: 16px;
        font-style: italic;
      ">
        Note: This is a curated list. Rubic supports 15,500+ tokens across all networks.
      </div>
    </div>
  `;

  context.logHtml(html);
}

/**
 * Handle networks command
 */
async function handleNetworks(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const html = `
    <div style="
      background: linear-gradient(135deg, 
        color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent), 
        color-mix(in srgb, var(--palette-secondary, #00ff88) 8%, transparent)
      );
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
      border-radius: 12px;
      padding: 20px;
      margin: 12px 0;
    ">
      <div style="
        font-size: 18px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
        text-align: center;
      ">
        🌐 Supported Networks
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      ">
        ${SUPPORTED_NETWORKS.map((net) => {
          const chainId = rubic.getNetworkChainId(net);
          return `
            <div style="
              background: color-mix(in srgb, var(--palette-surface, rgba(0, 0, 0, 0.3)) 50%, transparent);
              border: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.2)) 50%, transparent);
              border-radius: 8px;
              padding: 12px;
            ">
              <div style="font-size: 14px; font-weight: 600; color: var(--palette-text, #ccd4e0);">
                ${NETWORK_DISPLAY_NAMES[net]}
              </div>
              ${chainId ? `
                <div style="font-size: 11px; color: var(--palette-muted, #99ccff);">
                  Chain ID: ${chainId}
                </div>
              ` : `
                <div style="font-size: 11px; color: var(--palette-muted, #99ccff);">
                  Non-EVM
                </div>
              `}
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  context.logHtml(html);
}

/**
 * Handle help command
 */
function handleHelp(context: CommandContext): void {
  const helpHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        font-size: 18px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 20px;
        text-align: center;
        padding: 8px;
        border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        border-radius: 4px;
      ">
        ═══ Rubic Cross-Chain Swap ═══
      </div>
      
      <div style="margin: 12px 0;">
        <div class="omega-help-command" 
          data-command="rubic swap"
          style="
            color: var(--palette-secondary, #00ff88);
            font-weight: bold;
            font-size: 1.05em;
            margin-top: 8px;
            cursor: pointer;
            display: inline-block;
            padding: 2px 4px;
            border-radius: 3px;
          ">
          swap
        </div>
        <div style="color: var(--palette-text, #e0e0e0); margin-left: 20px; margin-top: 4px;">
          Interactive cross-chain swap
        </div>
        <div style="color: var(--palette-secondary, #00ff88); margin-left: 20px; margin-top: 2px; font-size: 0.9em;">
          → Usage: rubic swap
        </div>
      </div>
      
      <div style="margin: 12px 0;">
        <div class="omega-help-command" 
          data-command="rubic quote"
          style="
            color: var(--palette-secondary, #00ff88);
            font-weight: bold;
            font-size: 1.05em;
            margin-top: 8px;
            cursor: pointer;
            display: inline-block;
            padding: 2px 4px;
            border-radius: 3px;
          ">
          quote
        </div>
        <div style="color: var(--palette-text, #e0e0e0); margin-left: 20px; margin-top: 4px;">
          Get swap quote without executing
        </div>
        <div style="color: var(--palette-secondary, #00ff88); margin-left: 20px; margin-top: 2px; font-size: 0.9em;">
          → Usage: rubic quote &lt;fromNetwork&gt; &lt;fromToken&gt; &lt;amount&gt; &lt;toNetwork&gt; &lt;toToken&gt;
        </div>
        <div style="color: var(--palette-muted, #99ccff); margin-left: 20px; margin-top: 2px; font-size: 0.85em;">
          Example: rubic quote ethereum native 1 polygon native
        </div>
      </div>
      
      <div style="margin: 12px 0;">
        <div class="omega-help-command" 
          data-command="rubic tokens"
          style="
            color: var(--palette-secondary, #00ff88);
            font-weight: bold;
            font-size: 1.05em;
            margin-top: 8px;
            cursor: pointer;
            display: inline-block;
            padding: 2px 4px;
            border-radius: 3px;
          ">
          tokens
        </div>
        <div style="color: var(--palette-text, #e0e0e0); margin-left: 20px; margin-top: 4px;">
          List available tokens on a network
        </div>
        <div style="color: var(--palette-secondary, #00ff88); margin-left: 20px; margin-top: 2px; font-size: 0.9em;">
          → Usage: rubic tokens &lt;network&gt;
        </div>
      </div>
      
      <div style="margin: 12px 0;">
        <div class="omega-help-command" 
          data-command="rubic networks"
          style="
            color: var(--palette-secondary, #00ff88);
            font-weight: bold;
            font-size: 1.05em;
            margin-top: 8px;
            cursor: pointer;
            display: inline-block;
            padding: 2px 4px;
            border-radius: 3px;
          ">
          networks
        </div>
        <div style="color: var(--palette-text, #e0e0e0); margin-left: 20px; margin-top: 4px;">
          Show all supported networks
        </div>
        <div style="color: var(--palette-secondary, #00ff88); margin-left: 20px; margin-top: 2px; font-size: 0.9em;">
          → Usage: rubic networks
        </div>
      </div>
    </div>
  `;

  context.logHtml(helpHtml);
}

// ============================================================================
// Main Command
// ============================================================================

export const rubicCommand: Command = {
  name: "rubic",
  description: "Rubic cross-chain swap commands",
  usage: "rubic <swap|quote|tokens|networks|help>",
  aliases: ["swap", "rubic-swap"],
  category: "wallet",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    switch (subcommand) {
      case "swap":
        await handleSwap(context, args);
        break;

      case "quote":
        await handleQuote(context, args);
        break;

      case "tokens":
        await handleTokens(context, args);
        break;

      case "networks":
        await handleNetworks(context, args);
        break;

      case "help":
      case undefined:
        handleHelp(context);
        break;

      default:
        context.log(`Unknown subcommand: ${subcommand}`, "error");
        handleHelp(context);
        break;
    }
  },
};

export const rubicCommands: Command[] = [rubicCommand];

