/**
 * Uniswap Commands
 * Multi-chain Uniswap integration for token swaps
 */

import type { Command, CommandContext } from "@/types/commands";
import { createUsageError, createSwapStatusNotice, createCommandLine } from "./command-output-helpers";
import { parseUnits, formatUnits } from "ethers";
import { getUniswapQuote, buildUniswapSwapTransaction, isNativeToken, getNativeTokenAddress } from "@/lib/multichain/evm/uniswap";
import { searchUniswapTokens, type TokenInfo } from "@/lib/multichain/evm/token-search";
import { isAppMode } from "@/lib/utils/url-utils";

/**
 * Supported networks for Uniswap
 */
const SUPPORTED_NETWORKS = [
  { name: "Ethereum", value: "ethereum", chainId: 1 },
  { name: "Arbitrum", value: "arbitrum", chainId: 42161 },
  { name: "Optimism", value: "optimism", chainId: 10 },
  { name: "Base", value: "base", chainId: 8453 },
  { name: "Polygon", value: "polygon", chainId: 137 },
  { name: "BNB", value: "bnb", chainId: 56 },
];

/**
 * Common tokens across networks
 */
const COMMON_TOKENS: Record<string, Array<{ symbol: string; name: string; address: string; verified: boolean }>> = {
  ethereum: [
    { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", verified: true },
    { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", verified: true },
    { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", verified: true },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", verified: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", verified: true },
  ],
  arbitrum: [
    { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", verified: true },
    { symbol: "USDC", name: "USD Coin", address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", verified: true },
    { symbol: "USDT", name: "Tether USD", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", verified: true },
    { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", verified: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", verified: true },
  ],
  optimism: [
    { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", verified: true },
    { symbol: "USDC", name: "USD Coin", address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", verified: true },
    { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042", verified: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", verified: true },
  ],
  base: [
    { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", verified: true },
    { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", verified: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", verified: true },
  ],
  polygon: [
    { symbol: "MATIC", name: "Polygon", address: "0x0000000000000000000000000000000000001010", verified: true },
    { symbol: "USDC", name: "USD Coin", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", verified: true },
    { symbol: "USDT", name: "Tether USD", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", verified: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", verified: true },
  ],
  bnb: [
    { symbol: "BNB", name: "BNB", address: "0x0000000000000000000000000000000000000000", verified: true },
    { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", verified: true },
    { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", verified: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", verified: true },
  ],
};

/**
 * Uniswap command - Multi-chain token swaps
 */
export const uniswapCommand: Command = {
  name: "uniswap",
  description: "Uniswap token swaps across multiple networks",
  usage: "uniswap [network] [swap|help]",
  category: "network",
  handler: async (context: CommandContext, args: string[]) => {
    const network = args[1]?.toLowerCase();
    const subcommand = args[2]?.toLowerCase();

    if (!network || network === "help") {
      showUniswapHelp(context);
      return;
    }

    if (subcommand === "help" || !subcommand) {
      showUniswapNetworkHelp(context, network);
      return;
    }

    if (subcommand === "swap") {
      // Check if app mode is enabled
      if (isAppMode()) {
        context.log("❌ Swap is not supported on mobile app version", "error");
        return;
      }
      
      if (args.length >= 6) {
        await handleUniswapSwap(context, args);
      } else {
        await showUniswapSwapInterface(context, network);
      }
    } else {
      context.log(`❌ Unknown subcommand: ${subcommand}`, "error");
      showUniswapNetworkHelp(context, network);
    }
  },
};

function showUniswapHelp(context: CommandContext): void {
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
        ═══ UNISWAP MULTI-CHAIN ═══
      </div>
      <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 16px;">
        Uniswap token swaps across multiple networks
      </div>
      <div style="color: var(--palette-primary, #00d4ff); font-weight: bold; margin: 16px 0 8px 0;">
        Supported Networks:
      </div>
      ${SUPPORTED_NETWORKS.map(net => `
        <div style="margin-left: 20px; margin-bottom: 4px;">
          <span class="omega-help-command" data-command="uniswap ${net.value} swap" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';">
            uniswap ${net.value} swap
          </span> - ${net.name}
        </div>
      `).join("")}
      <div style="margin-top: 16px; color: var(--palette-text, #e0e0e0);">
        → Usage: uniswap &lt;network&gt; swap [fromToken] [toToken] [amount]
      </div>
      <div style="margin-top: 8px; color: var(--palette-text, #e0e0e0); font-size: 0.9em;">
        Example: uniswap ethereum swap ETH USDC 1
      </div>
    </div>
  `;
  context.logHtml(helpHtml);
}

function showUniswapNetworkHelp(context: CommandContext, network: string): void {
  const networkInfo = SUPPORTED_NETWORKS.find(n => n.value === network);
  if (!networkInfo) {
    context.log(`❌ Unsupported network: ${network}`, "error");
    showUniswapHelp(context);
    return;
  }

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
        ═══ UNISWAP - ${networkInfo.name.toUpperCase()} ═══
      </div>
      <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 16px;">
        Uniswap token swaps on ${networkInfo.name}
      </div>
      <div style="color: var(--palette-secondary, #00ff88); margin: 16px 0 8px 0; font-weight: bold;">
        → Usage: uniswap ${network} swap [fromToken] [toToken] [amount]
      </div>
      <div style="color: var(--palette-text, #e0e0e0); margin-top: 8px; font-size: 0.9em;">
        Example: uniswap ${network} swap ETH USDC 1
      </div>
      <div style="color: var(--palette-text, #e0e0e0); margin-top: 8px; font-size: 0.9em;">
        Or: uniswap ${network} swap (opens interactive interface)
      </div>
    </div>
  `;
  context.logHtml(helpHtml);
}

/**
 * Show interactive Uniswap swap interface
 */
async function showUniswapSwapInterface(context: CommandContext, network: string): Promise<void> {
  if (!context.wallet?.address) {
    context.log("❌ Please connect your wallet first", "error");
    const helpHtml = `
      <div style="margin: 8px 0;">
        ${createCommandLine("connect", "Connect your wallet")}
        ${createCommandLine("uniswap help", "See Uniswap commands")}
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  const networkInfo = SUPPORTED_NETWORKS.find(n => n.value === network);
  if (!networkInfo) {
    context.log(`❌ Unsupported network: ${network}`, "error");
    return;
  }

  const tokens = COMMON_TOKENS[network] || COMMON_TOKENS.ethereum;
  if (!tokens || tokens.length === 0) {
    context.log(`❌ No tokens available for network: ${network}`, "error");
    return;
  }
  const nativeToken = tokens.find(t => t.address === "0x0000000000000000000000000000000000000000" || t.address === "0x0000000000000000000000000000000000001010") || tokens[0];
  if (!nativeToken) {
    context.log(`❌ No native token found for network: ${network}`, "error");
    return;
  }

  context.log(`💱 Uniswap Swap Interface - ${networkInfo.name}`, "info");

  const html = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent), color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent));
      border: 1px solid var(--palette-primary, #00d4ff);
      padding: 20px;
      margin: 10px 0;
      border-radius: 8px;
    ">
      <h3 style="margin: 0 0 15px 0; color: var(--palette-primary, #00d4ff); font-size: 18px;">
        🦄 Uniswap Token Swap - ${networkInfo.name}
      </h3>
      
      <!-- From token selection -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">From Token:</label>
        <div style="position: relative;">
          <input type="text" id="uniswapFromSearch_${network}" placeholder="Search tokens..." 
            style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
          <div id="uniswapFromList_${network}" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 10000; display: none; border-radius: 0 0 4px 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);"></div>
        </div>
        <input type="hidden" id="uniswapFromTokenAddress_${network}" value="${nativeToken.address}">
        <div id="uniswapFromTokenDisplay_${network}" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border-radius: 4px; color: var(--palette-primary, #00d4ff); border-left: 3px solid var(--palette-primary, #00d4ff); font-family: 'Courier New', monospace;">
          ${nativeToken.symbol} - ${nativeToken.name} <span style="color: var(--palette-success, #16c782); font-size: 12px;">✅ NATIVE</span><br>
          <span style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">${nativeToken.address.substring(0, 20)}...</span>
        </div>
      </div>
      
      <!-- To token selection -->  
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">To Token:</label>
        <div style="position: relative;">
          <input type="text" id="uniswapToSearch_${network}" placeholder="Search tokens..." 
            style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
          <div id="uniswapToList_${network}" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 10000; display: none; border-radius: 0 0 4px 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);"></div>
        </div>
        <input type="hidden" id="uniswapToTokenAddress_${network}" value="">
        <div id="uniswapToTokenDisplay_${network}" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border-radius: 4px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); border-left: 3px solid var(--palette-border, rgba(0, 212, 255, 0.3)); font-family: 'Courier New', monospace;">Select a token</div>
      </div>
      
      <!-- Amount input -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">Amount:</label>
        <input type="text" id="uniswapSwapAmount_${network}" placeholder="1.0" 
          style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); color: var(--palette-text, #ffffff); border-radius: 4px; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
      </div>
      
      <!-- Action buttons -->
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <button id="uniswapQuoteBtn_${network}" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--palette-primary, #00bcf2), var(--palette-primary, #00d4ff)); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; transition: all 0.2s ease;" onmouseover="this.style.opacity = '0.9'; this.style.transform = 'scale(1.02)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'scale(1)';">
          Get Quote
        </button>
        <button id="uniswapSwapBtn_${network}" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--palette-secondary, #00ff88), var(--palette-primary, #00d4ff)); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; transition: all 0.2s ease;" onmouseover="this.style.opacity = '0.9'; this.style.transform = 'scale(1.02)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'scale(1)';">
          Execute Swap
        </button>
      </div>
      
      <div style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 10px; border-radius: 4px; border-left: 3px solid var(--palette-primary, #00d4ff);">
        <small style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
          🦄 Start typing to search for tokens. Powered by Uniswap on ${networkInfo.name}.
        </small>
      </div>
    </div>
  `;

  context.logHtml(html);

  // Setup event handlers - use longer timeout to ensure DOM is ready
  if (typeof window !== "undefined" && tokens) {
    setTimeout(() => {
      setupUniswapSwapInterface(context, network, tokens);
    }, 200);
  }
}

/**
 * Setup Uniswap swap interface event handlers
 */
function setupUniswapSwapInterface(context: CommandContext, network: string, tokens: Array<{ symbol: string; name: string; address: string; verified: boolean }>): void {
  const fromSearch = document.getElementById(`uniswapFromSearch_${network}`) as HTMLInputElement;
  const toSearch = document.getElementById(`uniswapToSearch_${network}`) as HTMLInputElement;
  const fromList = document.getElementById(`uniswapFromList_${network}`);
  const toList = document.getElementById(`uniswapToList_${network}`);
  const quoteBtn = document.getElementById(`uniswapQuoteBtn_${network}`);
  const swapBtn = document.getElementById(`uniswapSwapBtn_${network}`);

  if (!fromSearch || !toSearch) {
    console.warn(`[Uniswap] Search inputs not found for network: ${network}`);
    return;
  }

  if (!fromList || !toList) {
    console.warn(`[Uniswap] Dropdown lists not found for network: ${network}`);
    return;
  }

  // Setup token search handlers with dynamic API search
  let fromSearchTimeout: any;
  fromSearch.addEventListener("input", async (e) => {
    clearTimeout(fromSearchTimeout);
    const query = (e.target as HTMLInputElement).value.trim();

    if (query.length < 1) {
      fromList.style.display = "none";
      return;
    }

    // Show loading state
    fromList.innerHTML = '<div style="padding: 8px; color: var(--palette-text, #e0e0e0);">🔍 Searching tokens...</div>';
    fromList.style.display = "block";
    fromList.style.zIndex = "10000";

    fromSearchTimeout = setTimeout(async () => {
      try {
        const networkInfo = SUPPORTED_NETWORKS.find(n => n.value === network);
        if (!networkInfo) {
          fromList.innerHTML = '<div style="padding: 8px; color: var(--palette-error, #ff4d4f);">❌ Unsupported network</div>';
          fromList.style.display = "block";
          return;
        }

        // Search tokens dynamically via API
        const results = await searchUniswapTokens(query, networkInfo.chainId);
        fromList.innerHTML = "";

        if (results.length > 0) {
          results.forEach((token) => {
            const item = document.createElement("div");
            item.style.cssText =
              "padding: 8px; cursor: pointer; border-bottom: 1px solid var(--palette-border, rgba(0, 212, 255, 0.2)); display: flex; align-items: center; gap: 8px; transition: background 0.2s ease;";
            item.onmouseover = () => {
              item.style.background = "color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent)";
            };
            item.onmouseout = () => {
              item.style.background = "transparent";
            };

            const verificationBadge = token.verified
              ? '<span style="color: var(--palette-success, #16c782); font-size: 12px;">✅ VERIFIED</span>'
              : '<span style="color: var(--palette-error, #ff4d4f); font-size: 12px;">⚠️ UNVERIFIED</span>';

            const shortAddr =
              token.address.substring(0, 10) +
              "..." +
              token.address.substring(token.address.length - 8);

            item.innerHTML = `
              <div style="flex: 1;">
                <div style="font-weight: bold; color: var(--palette-text, #e0e0e0);">${token.symbol}</div>
                <div style="font-size: 12px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);">${token.name}</div>
              </div>
              <div style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">${shortAddr}</div>
              ${verificationBadge}
            `;

            item.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              const fromTokenAddressInput = document.getElementById(
                `uniswapFromTokenAddress_${network}`
              ) as HTMLInputElement;
              if (fromTokenAddressInput) {
                fromTokenAddressInput.value = token.address;
              }

              const fromTokenDisplay = document.getElementById(`uniswapFromTokenDisplay_${network}`);
              if (fromTokenDisplay) {
                fromTokenDisplay.innerHTML = `${token.symbol} - ${token.name} ${verificationBadge}<br><span style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">${shortAddr}</span>`;
                fromTokenDisplay.style.borderLeftColor = token.verified
                  ? "var(--palette-primary, #00d4ff)"
                  : "var(--palette-error, #ff4d4f)";
                fromTokenDisplay.style.color = token.verified
                  ? "var(--palette-primary, #00d4ff)"
                  : "var(--palette-warning, #ffa502)";
              }

              fromSearch.value = "";
              fromList.style.display = "none";
            });

            fromList.appendChild(item);
          });
          fromList.style.display = "block";
        } else {
          fromList.innerHTML =
            '<div style="padding: 8px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">No results found</div>';
          fromList.style.display = "block";
        }
      } catch (error) {
        console.error("[Uniswap] Token search error:", error);
        fromList.innerHTML = '<div style="padding: 8px; color: var(--palette-error, #ff4d4f);">❌ Search error. Please try again.</div>';
        fromList.style.display = "block";
      }
    }, 300);
  });

  // Close dropdowns when clicking outside (scoped to this interface)
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const fromSearchContainer = document.getElementById(`uniswapFromSearch_${network}`)?.parentElement;
    const toSearchContainer = document.getElementById(`uniswapToSearch_${network}`)?.parentElement;
    
    if (fromSearchContainer && !fromSearchContainer.contains(target)) {
      fromList.style.display = "none";
    }
    if (toSearchContainer && !toSearchContainer.contains(target)) {
      toList.style.display = "none";
    }
  };
  
  // Add click outside listener
  setTimeout(() => {
    document.addEventListener("click", handleClickOutside);
  }, 100);

  // Setup "To" token search with dynamic API search
  let toSearchTimeout: any;
  toSearch.addEventListener("input", async (e) => {
    clearTimeout(toSearchTimeout);
    const query = (e.target as HTMLInputElement).value.trim();

    if (query.length < 1) {
      toList.style.display = "none";
      return;
    }

    // Show loading state
    toList.innerHTML = '<div style="padding: 8px; color: var(--palette-text, #e0e0e0);">🔍 Searching tokens...</div>';
    toList.style.display = "block";
    toList.style.zIndex = "10000";

    toSearchTimeout = setTimeout(async () => {
      try {
        const networkInfo = SUPPORTED_NETWORKS.find(n => n.value === network);
        if (!networkInfo) {
          toList.innerHTML = '<div style="padding: 8px; color: var(--palette-error, #ff4d4f);">❌ Unsupported network</div>';
          toList.style.display = "block";
          return;
        }

        // Search tokens dynamically via API
        const results = await searchUniswapTokens(query, networkInfo.chainId);
        toList.innerHTML = "";

        if (results.length > 0) {
          results.forEach((token) => {
            const item = document.createElement("div");
            item.style.cssText =
              "padding: 8px; cursor: pointer; border-bottom: 1px solid var(--palette-border, rgba(0, 212, 255, 0.2)); display: flex; align-items: center; gap: 8px; transition: background 0.2s ease;";
            item.onmouseover = () => {
              item.style.background = "color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent)";
            };
            item.onmouseout = () => {
              item.style.background = "transparent";
            };

            const verificationBadge = token.verified
              ? '<span style="color: var(--palette-success, #16c782); font-size: 12px;">✅ VERIFIED</span>'
              : '<span style="color: var(--palette-error, #ff4d4f); font-size: 12px;">⚠️ UNVERIFIED</span>';

            const shortAddr =
              token.address.substring(0, 10) +
              "..." +
              token.address.substring(token.address.length - 8);

            item.innerHTML = `
              <div style="flex: 1;">
                <div style="font-weight: bold; color: var(--palette-text, #e0e0e0);">${token.symbol}</div>
                <div style="font-size: 12px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);">${token.name}</div>
              </div>
              <div style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">${shortAddr}</div>
              ${verificationBadge}
            `;

            item.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              const toTokenAddressInput = document.getElementById(
                `uniswapToTokenAddress_${network}`
              ) as HTMLInputElement;
              if (toTokenAddressInput) {
                toTokenAddressInput.value = token.address;
              }

              const toTokenDisplay = document.getElementById(`uniswapToTokenDisplay_${network}`);
              if (toTokenDisplay) {
                toTokenDisplay.innerHTML = `${token.symbol} - ${token.name} ${verificationBadge}<br><span style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">${shortAddr}</span>`;
                toTokenDisplay.style.borderLeftColor = token.verified
                  ? "var(--palette-primary, #00d4ff)"
                  : "var(--palette-error, #ff4d4f)";
                toTokenDisplay.style.color = token.verified
                  ? "var(--palette-primary, #00d4ff)"
                  : "var(--palette-warning, #ffa502)";
              }

              toSearch.value = "";
              toList.style.display = "none";
            });

            toList.appendChild(item);
          });
          toList.style.display = "block";
        } else {
          toList.innerHTML =
            '<div style="padding: 8px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">No results found</div>';
          toList.style.display = "block";
        }
      } catch (error) {
        console.error("[Uniswap] Token search error:", error);
        toList.innerHTML = '<div style="padding: 8px; color: var(--palette-error, #ff4d4f);">❌ Search error. Please try again.</div>';
        toList.style.display = "block";
      }
    }, 300);
  });

  // Quote button handler
  if (quoteBtn) {
    quoteBtn.addEventListener("click", async () => {
      const fromToken = (
        document.getElementById(`uniswapFromTokenAddress_${network}`) as HTMLInputElement
      )?.value;
      const toToken = (
        document.getElementById(`uniswapToTokenAddress_${network}`) as HTMLInputElement
      )?.value;
      const amount = (document.getElementById(`uniswapSwapAmount_${network}`) as HTMLInputElement)
        ?.value;

      if (!fromToken || !toToken || !amount) {
        context.log("❌ Please select both tokens and enter an amount", "error");
        return;
      }

      if (fromToken === toToken) {
        context.log("❌ Cannot swap the same token", "error");
        return;
      }

      context.log("📊 Getting Uniswap quote...", "info");
      await handleUniswapSwap(context, ["", "", network, "swap", fromToken, toToken, amount]);
    });
  }

  // Swap button handler
  if (swapBtn) {
    swapBtn.addEventListener("click", async () => {
      const fromToken = (
        document.getElementById(`uniswapFromTokenAddress_${network}`) as HTMLInputElement
      )?.value;
      const toToken = (
        document.getElementById(`uniswapToTokenAddress_${network}`) as HTMLInputElement
      )?.value;
      const amount = (document.getElementById(`uniswapSwapAmount_${network}`) as HTMLInputElement)
        ?.value;

      if (!fromToken || !toToken || !amount) {
        context.log("❌ Please select both tokens and enter an amount", "error");
        return;
      }

      if (fromToken === toToken) {
        context.log("❌ Cannot swap the same token", "error");
        return;
      }

      context.log("💱 Executing Uniswap swap...", "info");
      await handleUniswapSwap(context, ["", "", network, "swap", fromToken, toToken, amount]);
    });
  }

  // Focus management
  [fromSearch, toSearch].forEach((input) => {
    input.setAttribute("tabindex", "1");
    input.style.cursor = "text";
    input.addEventListener("click", (e) => {
      e.stopPropagation();
      (e.target as HTMLInputElement).focus();
    });
  });
}

async function handleUniswapSwap(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const network = args[2];
  const fromToken = args[4];
  const toToken = args[5];
  const amount = args[6];

  if (!network || !fromToken || !toToken || !amount) {
    const usageHtml = createUsageError("uniswap <network> swap <fromToken> <toToken> <amount>", [
      "uniswap ethereum swap ETH USDC 1",
      "uniswap arbitrum swap ETH USDC 0.5",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  const networkInfo = SUPPORTED_NETWORKS.find(n => n.value === network);
  if (!networkInfo) {
    context.log(`❌ Unsupported network: ${network}`, "error");
    return;
  }

  if (!context.wallet?.address) {
    context.log("❌ Please connect your wallet first", "error");
    const helpHtml = `
      <div style="margin: 8px 0;">
        ${createCommandLine("connect", "Connect your wallet")}
        ${createCommandLine("uniswap help", "See Uniswap commands")}
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  // Try to find token info from common tokens first, then search dynamically
  const tokens = COMMON_TOKENS[network] || COMMON_TOKENS.ethereum;
  let fromTokenInfo = tokens?.find(t => 
    t.symbol.toLowerCase() === fromToken.toLowerCase() || 
    t.address.toLowerCase() === fromToken.toLowerCase()
  );
  let toTokenInfo = tokens?.find(t => 
    t.symbol.toLowerCase() === toToken.toLowerCase() || 
    t.address.toLowerCase() === toToken.toLowerCase()
  );

  // If not found in common tokens, search dynamically
  if (!fromTokenInfo && !isNativeToken(fromToken) && fromToken.startsWith("0x")) {
    const searchResults = await searchUniswapTokens(fromToken, networkInfo.chainId);
    fromTokenInfo = searchResults.find(t => t.address.toLowerCase() === fromToken.toLowerCase()) || undefined;
  } else if (!fromTokenInfo) {
    const searchResults = await searchUniswapTokens(fromToken, networkInfo.chainId);
    fromTokenInfo = searchResults[0];
  }

  if (!toTokenInfo && !isNativeToken(toToken) && toToken.startsWith("0x")) {
    const searchResults = await searchUniswapTokens(toToken, networkInfo.chainId);
    toTokenInfo = searchResults.find(t => t.address.toLowerCase() === toToken.toLowerCase()) || undefined;
  } else if (!toTokenInfo) {
    const searchResults = await searchUniswapTokens(toToken, networkInfo.chainId);
    toTokenInfo = searchResults[0];
  }

  const fromTokenAddress = fromTokenInfo?.address || 
    (isNativeToken(fromToken) ? getNativeTokenAddress(networkInfo.chainId) : fromToken);
  const toTokenAddress = toTokenInfo?.address || 
    (isNativeToken(toToken) ? getNativeTokenAddress(networkInfo.chainId) : toToken);

  const fromSymbol = fromTokenInfo?.symbol || fromToken;
  const toSymbol = toTokenInfo?.symbol || toToken;

  // Get token decimals (default to 18 for native tokens)
  let fromTokenDecimals = 18;
  if (!isNativeToken(fromTokenAddress)) {
    // Try to fetch decimals from token info or use default
    const tokenInfo = await searchUniswapTokens(fromSymbol, networkInfo.chainId);
    const foundToken = tokenInfo.find(t => t.address.toLowerCase() === fromTokenAddress.toLowerCase());
    if (foundToken) {
      fromTokenDecimals = foundToken.decimals || 18;
    }
  }

  // Parse amount with correct decimals
  let amountInWei: string;
  try {
    amountInWei = parseUnits(amount, fromTokenDecimals).toString();
  } catch (error) {
    context.log(`❌ Invalid amount: ${amount}`, "error");
    return;
  }

  context.log("💱 Preparing Uniswap transaction...", "info");
  context.log(`   Network: ${networkInfo.name}`, "info");
  context.log(`   From: ${amount} ${fromSymbol}`, "info");
  context.log(`   To: ${toSymbol}`, "info");
  context.log("", "info");

  try {
    // Step 1: Get quote
    context.log("📊 Getting Uniswap quote...", "info");
    const quote = await getUniswapQuote({
      tokenIn: fromTokenAddress,
      tokenOut: toTokenAddress,
      amountIn: amountInWei,
      recipient: context.wallet.address,
      chainId: networkInfo.chainId,
      slippageTolerance: 50, // 0.5%
    });

    if (!quote) {
      context.log("❌ Failed to get swap quote. Please check token addresses and try again.", "error");
      return;
    }

    // Get output token decimals
    let toTokenDecimals = 18;
    if (!isNativeToken(toTokenAddress)) {
      const tokenInfo = await searchUniswapTokens(toSymbol, networkInfo.chainId);
      const foundToken = tokenInfo.find(t => t.address.toLowerCase() === toTokenAddress.toLowerCase());
      if (foundToken) {
        toTokenDecimals = foundToken.decimals || 18;
      }
    }

    context.log("✅ Quote received:", "success");
    context.log(`   Input: ${formatUnits(quote.inputAmount, fromTokenDecimals)} ${fromSymbol}`, "info");
    context.log(`   Output: ${formatUnits(quote.outputAmount, toTokenDecimals)} ${toSymbol}`, "info");
    context.log(`   Price Impact: ${quote.priceImpact.toFixed(2)}%`, "info");
    context.log(`   Estimated Gas: ${quote.gasEstimate}`, "info");
    context.log("", "info");

    // Step 2: Build transaction
    context.log("🔨 Building swap transaction...", "info");
    const txParams = await buildUniswapSwapTransaction({
      tokenIn: fromTokenAddress,
      tokenOut: toTokenAddress,
      amountIn: amountInWei,
      recipient: context.wallet.address,
      chainId: networkInfo.chainId,
      slippageTolerance: 50,
    });

    if (!txParams) {
      context.log("❌ Failed to build transaction", "error");
      return;
    }

    // Step 3: Get signer and send transaction
    context.log("📤 Signing and sending transaction...", "info");
    const signer = await context.wallet.getSigner();
    if (!signer) {
      context.log("❌ Failed to get wallet signer", "error");
      return;
    }

    const tx = await signer.sendTransaction({
      to: txParams.to,
      data: txParams.data,
      value: txParams.value,
      gasLimit: txParams.gasLimit,
    });

    context.log(`✅ Transaction sent! Hash: ${tx.hash}`, "success");
    context.log("", "info");

    // Wait for confirmation
    context.log("⏳ Waiting for confirmation...", "info");
    const receipt = await tx.wait();

    if (receipt) {
      context.log("✅ Swap executed successfully!", "success");
      context.log(`   Block: ${receipt.blockNumber}`, "info");
      context.log(`   Gas Used: ${receipt.gasUsed.toString()}`, "info");
      context.log("", "info");

      // Show explorer links based on network
      const explorerUrls: Record<number, string> = {
        1: `https://etherscan.io/tx/${tx.hash}`,
        42161: `https://arbiscan.io/tx/${tx.hash}`,
        10: `https://optimistic.etherscan.io/tx/${tx.hash}`,
        8453: `https://basescan.org/tx/${tx.hash}`,
        137: `https://polygonscan.com/tx/${tx.hash}`,
        56: `https://bscscan.com/tx/${tx.hash}`,
      };

      const explorerUrl = explorerUrls[networkInfo.chainId];
      if (explorerUrl) {
        context.logHtml(`
          <div style="margin: 8px 0;">
            <a href="${explorerUrl}" target="_blank" style="color: var(--palette-primary, #00d4ff); text-decoration: underline;">
              🔍 View on Block Explorer →
            </a>
          </div>
        `);
      }
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    if (error.code === "ACTION_REJECTED") {
      context.log("Transaction was rejected by user", "warning");
    }
  }
}

export const uniswapCommands: Command[] = [uniswapCommand];

