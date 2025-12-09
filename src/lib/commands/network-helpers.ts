/**
 * Network Command Helpers
 * Shared utilities for network command implementations
 */

import type { CommandContext } from "@/types/commands";
import { createCommandLine } from "./command-output-helpers";

/**
 * Network configuration
 */
export interface NetworkConfig {
  name: string;
  value: string;
  nativeToken: string;
  nativeTokenSymbol: string;
  icon: string;
  tokens: Array<{ symbol: string; name: string; address: string; verified: boolean }>;
}

/**
 * Common network configurations
 */
export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  arbitrum: {
    name: "Arbitrum",
    value: "arbitrum",
    nativeToken: "ETH",
    nativeTokenSymbol: "ETH",
    icon: "🔵",
    tokens: [
      { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", verified: true },
      { symbol: "USDC", name: "USD Coin", address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", verified: true },
      { symbol: "USDT", name: "Tether USD", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", verified: true },
      { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", verified: true },
      { symbol: "WETH", name: "Wrapped Ether", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", verified: true },
      { symbol: "WBTC", name: "Wrapped BTC", address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", verified: true },
      { symbol: "DAI", name: "Dai Stablecoin", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", verified: true },
    ],
  },
  optimism: {
    name: "Optimism",
    value: "optimism",
    nativeToken: "ETH",
    nativeTokenSymbol: "ETH",
    icon: "🔴",
    tokens: [
      { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", verified: true },
      { symbol: "USDC", name: "USD Coin", address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", verified: true },
      { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042", verified: true },
      { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", verified: true },
      { symbol: "USDT", name: "Tether USD", address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", verified: true },
      { symbol: "DAI", name: "Dai Stablecoin", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", verified: true },
    ],
  },
  base: {
    name: "Base",
    value: "base",
    nativeToken: "ETH",
    nativeTokenSymbol: "ETH",
    icon: "🔷",
    tokens: [
      { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", verified: true },
      { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", verified: true },
      { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", verified: true },
      { symbol: "DAI", name: "Dai Stablecoin", address: "0x50c5725949A6F0c72E6C4a641F24049A917E0D6B", verified: true },
    ],
  },
  bnb: {
    name: "BNB Smart Chain",
    value: "bnb",
    nativeToken: "BNB",
    nativeTokenSymbol: "BNB",
    icon: "🟡",
    tokens: [
      { symbol: "BNB", name: "BNB", address: "0x0000000000000000000000000000000000000000", verified: true },
      { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", verified: true },
      { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", verified: true },
      { symbol: "BUSD", name: "Binance USD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", verified: true },
      { symbol: "WETH", name: "Wrapped Ether", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", verified: true },
      { symbol: "CAKE", name: "PancakeSwap", address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", verified: true },
      { symbol: "DAI", name: "Dai Stablecoin", address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", verified: true },
    ],
  },
};

/**
 * Create a network swap interface HTML
 */
export function createNetworkSwapInterfaceHTML(
  network: NetworkConfig,
  prefix: string
): string {
  const nativeToken = network.tokens.find(
    t => t.address === "0x0000000000000000000000000000000000000000" || 
         t.address === "0x0000000000000000000000000000000000001010"
  ) || network.tokens[0];

  return `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent), color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent));
      border: 1px solid var(--palette-primary, #00d4ff);
      padding: 20px;
      margin: 10px 0;
      border-radius: 8px;
    ">
      <h3 style="margin: 0 0 15px 0; color: var(--palette-primary, #00d4ff); font-size: 18px;">
        ${network.icon} ${network.name} Token Swap
      </h3>
      
      <!-- From token selection -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">From Token:</label>
        <div style="position: relative;">
          <input type="text" id="${prefix}FromSearch" placeholder="Search tokens..." 
            style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
          <div id="${prefix}FromList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 1000; display: none; border-radius: 0 0 4px 4px;"></div>
        </div>
        <input type="hidden" id="${prefix}FromTokenAddress" value="${nativeToken.address}">
        <div id="${prefix}FromTokenDisplay" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border-radius: 4px; color: var(--palette-primary, #00d4ff); border-left: 3px solid var(--palette-primary, #00d4ff); font-family: 'Courier New', monospace;">
          ${nativeToken.symbol} - ${nativeToken.name} <span style="color: var(--palette-success, #16c782); font-size: 12px;">✅ NATIVE</span><br>
          <span style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">${nativeToken.address.substring(0, 20)}...</span>
        </div>
      </div>
      
      <!-- To token selection -->  
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">To Token:</label>
        <div style="position: relative;">
          <input type="text" id="${prefix}ToSearch" placeholder="Search tokens..." 
            style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
          <div id="${prefix}ToList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 1000; display: none; border-radius: 0 0 4px 4px;"></div>
        </div>
        <input type="hidden" id="${prefix}ToTokenAddress" value="">
        <div id="${prefix}ToTokenDisplay" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border-radius: 4px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); border-left: 3px solid var(--palette-border, rgba(0, 212, 255, 0.3)); font-family: 'Courier New', monospace;">Select a token</div>
      </div>
      
      <!-- Amount input -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">Amount:</label>
        <input type="text" id="${prefix}SwapAmount" placeholder="1.0" 
          style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); color: var(--palette-text, #ffffff); border-radius: 4px; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
      </div>
      
      <!-- Action buttons -->
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <button id="${prefix}QuoteBtn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--palette-primary, #00bcf2), var(--palette-primary, #00d4ff)); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; transition: all 0.2s ease;" onmouseover="this.style.opacity = '0.9'; this.style.transform = 'scale(1.02)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'scale(1)';">
          Get Quote
        </button>
        <button id="${prefix}SwapBtn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--palette-secondary, #00ff88), var(--palette-primary, #00d4ff)); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; transition: all 0.2s ease;" onmouseover="this.style.opacity = '0.9'; this.style.transform = 'scale(1.02)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'scale(1)';">
          Execute Swap
        </button>
      </div>
      
      <div style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 10px; border-radius: 4px; border-left: 3px solid var(--palette-primary, #00d4ff);">
        <small style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
          🔍 Start typing to search for tokens. Powered by Uniswap & PancakeSwap on ${network.name}.
        </small>
      </div>
    </div>
  `;
}

/**
 * Setup swap interface event handlers (generic)
 */
export function setupNetworkSwapInterface(
  context: CommandContext,
  network: NetworkConfig,
  prefix: string,
  commandPrefix: string,
  swapHandler?: (context: CommandContext, fromToken: string, toToken: string, amount: string) => Promise<void>
): void {
  const fromSearch = document.getElementById(`${prefix}FromSearch`) as HTMLInputElement;
  const toSearch = document.getElementById(`${prefix}ToSearch`) as HTMLInputElement;
  const fromList = document.getElementById(`${prefix}FromList`);
  const toList = document.getElementById(`${prefix}ToList`);
  const quoteBtn = document.getElementById(`${prefix}QuoteBtn`);
  const swapBtn = document.getElementById(`${prefix}SwapBtn`);

  if (!fromSearch || !toSearch) return;

  const searchTokens = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return network.tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(lowerQuery) ||
        token.name.toLowerCase().includes(lowerQuery) ||
        token.address.toLowerCase().includes(lowerQuery)
    );
  };

  // Setup token search for "From" field
  let fromSearchTimeout: any;
  fromSearch.addEventListener("input", (e) => {
    clearTimeout(fromSearchTimeout);
    const query = (e.target as HTMLInputElement).value.trim();

    if (query.length < 1) {
      if (fromList) fromList.style.display = "none";
      return;
    }

    fromSearchTimeout = setTimeout(() => {
      if (fromList) {
        const results = searchTokens(query);
        fromList.innerHTML = "";

        if (results.length > 0) {
          results.slice(0, 10).forEach((token) => {
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
                `${prefix}FromTokenAddress`
              ) as HTMLInputElement;
              if (fromTokenAddressInput) {
                fromTokenAddressInput.value = token.address;
              }

              const fromTokenDisplay = document.getElementById(`${prefix}FromTokenDisplay`);
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
              if (fromList) fromList.style.display = "none";
            });

            fromList?.appendChild(item);
          });
          fromList!.style.display = "block";
        } else {
          fromList!.innerHTML =
            '<div style="padding: 8px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">No results found</div>';
          fromList!.style.display = "block";
        }
      }
    }, 300);
  });

  // Setup token search for "To" field
  let toSearchTimeout: any;
  toSearch.addEventListener("input", (e) => {
    clearTimeout(toSearchTimeout);
    const query = (e.target as HTMLInputElement).value.trim();

    if (query.length < 1) {
      if (toList) toList.style.display = "none";
      return;
    }

    toSearchTimeout = setTimeout(() => {
      if (toList) {
        const results = searchTokens(query);
        toList.innerHTML = "";

        if (results.length > 0) {
          results.slice(0, 10).forEach((token) => {
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
                `${prefix}ToTokenAddress`
              ) as HTMLInputElement;
              if (toTokenAddressInput) {
                toTokenAddressInput.value = token.address;
              }

              const toTokenDisplay = document.getElementById(`${prefix}ToTokenDisplay`);
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
              if (toList) toList.style.display = "none";
            });

            toList?.appendChild(item);
          });
          toList!.style.display = "block";
        } else {
          toList!.innerHTML =
            '<div style="padding: 8px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">No results found</div>';
          toList!.style.display = "block";
        }
      }
    }, 300);
  });

  // Quote button handler
  if (quoteBtn) {
    quoteBtn.addEventListener("click", async () => {
      const fromToken = (
        document.getElementById(`${prefix}FromTokenAddress`) as HTMLInputElement
      )?.value;
      const toToken = (
        document.getElementById(`${prefix}ToTokenAddress`) as HTMLInputElement
      )?.value;
      const amount = (document.getElementById(`${prefix}SwapAmount`) as HTMLInputElement)
        ?.value;

      if (!fromToken || !toToken || !amount) {
        context.log("❌ Please select both tokens and enter an amount", "error");
        return;
      }

      if (fromToken === toToken) {
        context.log("❌ Cannot swap the same token", "error");
        return;
      }

      context.log("📊 Getting swap quote...", "info");
      // Execute swap via handler
      if (swapHandler) {
        await swapHandler(context, fromToken, toToken, amount);
      } else {
        await executeNetworkSwap(context, commandPrefix, fromToken, toToken, amount);
      }
    });
  }

  // Swap button handler
  if (swapBtn) {
    swapBtn.addEventListener("click", async () => {
      const fromToken = (
        document.getElementById(`${prefix}FromTokenAddress`) as HTMLInputElement
      )?.value;
      const toToken = (
        document.getElementById(`${prefix}ToTokenAddress`) as HTMLInputElement
      )?.value;
      const amount = (document.getElementById(`${prefix}SwapAmount`) as HTMLInputElement)
        ?.value;

      if (!fromToken || !toToken || !amount) {
        context.log("❌ Please select both tokens and enter an amount", "error");
        return;
      }

      if (fromToken === toToken) {
        context.log("❌ Cannot swap the same token", "error");
        return;
      }

      context.log("💱 Executing swap...", "info");
      // Execute swap via handler
      if (swapHandler) {
        await swapHandler(context, fromToken, toToken, amount);
      } else {
        await executeNetworkSwap(context, commandPrefix, fromToken, toToken, amount);
      }
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

/**
 * Execute network swap (placeholder - actual implementation in network command files)
 */
export async function executeNetworkSwap(
  context: CommandContext,
  commandPrefix: string,
  fromToken: string,
  toToken: string,
  amount: string
): Promise<void> {
  // This will be handled by the specific network command handler
  // The network command files will import and use this, or implement their own
  context.log(`💱 Executing ${commandPrefix} swap...`, "info");
  context.log(`   From: ${amount} ${fromToken}`, "info");
  context.log(`   To: ${toToken}`, "info");
}

