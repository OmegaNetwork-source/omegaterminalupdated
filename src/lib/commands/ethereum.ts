/**
 * Ethereum Network Commands
 * CowSwap integration for Ethereum token swaps
 */

import type { Command, CommandContext } from "@/types/commands";
import { createUsageError, createSwapStatusNotice, createCommandLine } from "./command-output-helpers";

/**
 * Ethereum command - Network operations for Ethereum
 */
export const ethereumCommand: Command = {
  name: "ethereum",
  description: "Ethereum network operations with CowSwap",
  usage: "ethereum <balance|swap|help>",
  category: "network",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showEthereumHelp(context);
      return;
    }

    switch (subcommand) {
      case "balance":
        await getEthereumBalance(context);
        break;
      case "swap":
        if (args.length >= 5) {
          await handleEthereumSwap(context, args);
        } else {
          await showEthereumSwapInterface(context);
        }
        break;
      default:
        context.log(`❌ Unknown subcommand: ${subcommand}`, "error");
        showEthereumHelp(context);
    }
  },
};

function showEthereumHelp(context: CommandContext): void {
  const helpLines: string[] = [
    "ethereum",
    "",
    "Ethereum network operations with CowSwap",
    "",
    "→ Usage: ethereum <balance|swap|help>",
    "",
    "═ Commands ═",
    "",
    "ethereum balance",
    "",
    "Check ETH balance on Ethereum",
    "",
    "→ Usage: ethereum balance",
    "",
    "ethereum swap",
    "",
    "Swap tokens on Ethereum using CowSwap (MEV-protected)",
    "",
    "→ Usage: ethereum swap <fromToken> <toToken> <amount>",
    "  Example: ethereum swap ETH USDC 1",
    "  Example: ethereum swap USDC DAI 100",
    "",
  ];

  let helpHtml = `
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
        ═══ ETHEREUM NETWORK ═══
      </div>
  `;

  helpLines.forEach((line) => {
    if (line.trim() === "") {
      helpHtml += `<div style="margin: 4px 0;"></div>`;
    } else if (line.startsWith("═ ")) {
      helpHtml += `
        <div style="
          font-size: 14px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin: 16px 0 8px 0;
          padding: 4px 0;
        ">
          ${line}
        </div>
      `;
    } else if (line.startsWith("→ Usage:")) {
      helpHtml += `
        <div style="
          color: var(--palette-secondary, #00ff88);
          margin-left: 20px;
          margin-top: 2px;
          font-size: 0.9em;
        ">
          ${line}
        </div>
      `;
    } else if (line.startsWith("  Example:")) {
      helpHtml += `
        <div style="
          color: var(--palette-text, #e0e0e0);
          margin-left: 20px;
          margin-top: 2px;
          font-size: 0.85em;
        ">
          ${line}
        </div>
      `;
    } else {
      const isCommand = line.startsWith("ethereum ") && line.length < 50;
      if (isCommand) {
        const commandText = line.replace(/ <[^>]+>/g, "").trim();
        const escapedCommand = commandText.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        helpHtml += `
          <div 
            class="omega-help-command" 
            data-command="${escapedCommand}"
            style="
              color: var(--palette-secondary, #00ff88);
              font-weight: bold;
              margin-left: 0;
              margin-top: 8px;
              font-family: 'Courier New', monospace;
              cursor: pointer;
              display: inline-block;
              padding: 2px 4px;
              border-radius: 3px;
              transition: all 0.2s ease;
              user-select: none;
            "
            onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)'; this.style.textShadow = '0 0 8px var(--palette-secondary-glow, rgba(0, 255, 136, 0.5))';"
            onmouseout="this.style.background = 'transparent'; this.style.textShadow = 'none';"
            title="Click to add '${escapedCommand}' to terminal input"
          >
            ${line}
          </div>
        `;
      } else {
        helpHtml += `
          <div style="
            color: var(--palette-text, #e0e0e0);
            margin-left: 0;
            margin-top: 2px;
            line-height: 1.4;
          ">
            ${line}
          </div>
        `;
      }
    }
  });

  helpHtml += `</div>`;
  context.logHtml(helpHtml);
}

async function getEthereumBalance(context: CommandContext): Promise<void> {
  if (!context.wallet?.address) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Wallet not connected</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            💡 Use <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px; cursor: pointer;" class="omega-help-command" data-command="connect">connect</code> to connect your wallet
          </div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
    return;
  }

  context.log("💰 Fetching Ethereum balance...", "info");

  try {
    const balanceHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          font-size: 16px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 16px;
          padding: 8px;
          border-bottom: 2px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        ">
          💰 Ethereum Balance
        </div>
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="margin-bottom: 12px;">
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">ETH Balance:</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 18px; font-weight: bold;">
              Loading...
            </div>
          </div>
          <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); font-size: 11px; margin-top: 8px;">
            💡 Connect to Ethereum network to view balance
          </div>
        </div>
      </div>
    `;
    context.logHtml(balanceHtml);
  } catch (error: any) {
    context.log(`❌ ${error.message}`, "error");
  }
}

/**
 * Show interactive Ethereum swap interface with CowSwap
 */
async function showEthereumSwapInterface(context: CommandContext): Promise<void> {
  if (!context.wallet?.address) {
    context.log("❌ Please connect your wallet first", "error");
    const helpHtml = `
      <div style="margin: 8px 0;">
        ${createCommandLine("connect", "Connect your wallet")}
        ${createCommandLine("ethereum help", "See Ethereum commands")}
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  context.log("💱 Ethereum Swap Interface (CowSwap)", "info");

  const html = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent), color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent));
      border: 1px solid var(--palette-primary, #00d4ff);
      padding: 20px;
      margin: 10px 0;
      border-radius: 8px;
    ">
      <h3 style="margin: 0 0 15px 0; color: var(--palette-primary, #00d4ff); font-size: 18px;">
        ⟠ Ethereum Token Swap (CowSwap)
      </h3>
      
      <!-- From token selection -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">From Token:</label>
        <div style="position: relative;">
          <input type="text" id="ethereumFromSearch" placeholder="Search tokens (e.g., ETH, USDC, DAI, WETH)..." 
            style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
          <div id="ethereumFromList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 1000; display: none; border-radius: 0 0 4px 4px;"></div>
        </div>
        <input type="hidden" id="ethereumFromTokenAddress" value="0x0000000000000000000000000000000000000000">
        <div id="ethereumFromTokenDisplay" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border-radius: 4px; color: var(--palette-primary, #00d4ff); border-left: 3px solid var(--palette-primary, #00d4ff); font-family: 'Courier New', monospace;">
          ETH - Ethereum <span style="color: var(--palette-success, #16c782); font-size: 12px;">✅ NATIVE</span><br>
          <span style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">0x0000000000000000000000000000000000000000</span>
        </div>
      </div>
      
      <!-- To token selection -->  
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">To Token:</label>
        <div style="position: relative;">
          <input type="text" id="ethereumToSearch" placeholder="Search tokens (e.g., USDC, DAI, WETH, USDT)..." 
            style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
          <div id="ethereumToList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 1000; display: none; border-radius: 0 0 4px 4px;"></div>
        </div>
        <input type="hidden" id="ethereumToTokenAddress" value="">
        <div id="ethereumToTokenDisplay" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border-radius: 4px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); border-left: 3px solid var(--palette-border, rgba(0, 212, 255, 0.3)); font-family: 'Courier New', monospace;">Select a token</div>
      </div>
      
      <!-- Amount input -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">Amount:</label>
        <input type="text" id="ethereumSwapAmount" placeholder="1.0" 
          style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); color: var(--palette-text, #ffffff); border-radius: 4px; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
      </div>
      
      <!-- Action buttons -->
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <button id="ethereumQuoteBtn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--palette-primary, #00bcf2), var(--palette-primary, #00d4ff)); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; transition: all 0.2s ease;" onmouseover="this.style.opacity = '0.9'; this.style.transform = 'scale(1.02)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'scale(1)';">
          Get Quote
        </button>
        <button id="ethereumSwapBtn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--palette-secondary, #00ff88), var(--palette-primary, #00d4ff)); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; transition: all 0.2s ease;" onmouseover="this.style.opacity = '0.9'; this.style.transform = 'scale(1.02)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'scale(1)';">
          Execute Swap
        </button>
      </div>
      
      <div style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 10px; border-radius: 4px; border-left: 3px solid var(--palette-primary, #00d4ff);">
        <small style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
          🔍 Start typing to search for tokens by name or symbol. Powered by CowSwap - MEV-protected swaps with gasless orders.
        </small>
      </div>
    </div>
  `;

  context.logHtml(html);

  // Setup event handlers after rendering
  if (typeof window !== "undefined") {
    setTimeout(() => {
      setupEthereumSwapInterface(context);
    }, 100);
  }
}

/**
 * Setup Ethereum swap interface event handlers
 */
function setupEthereumSwapInterface(context: CommandContext): void {
  const fromSearch = document.getElementById("ethereumFromSearch") as HTMLInputElement;
  const toSearch = document.getElementById("ethereumToSearch") as HTMLInputElement;
  const fromList = document.getElementById("ethereumFromList");
  const toList = document.getElementById("ethereumToList");
  const quoteBtn = document.getElementById("ethereumQuoteBtn");
  const swapBtn = document.getElementById("ethereumSwapBtn");

  if (!fromSearch || !toSearch) return;

  // Common Ethereum tokens
  const commonTokens = [
    { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", verified: true },
    { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", verified: true },
    { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", verified: true },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", verified: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", verified: true },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", verified: true },
    { symbol: "UNI", name: "Uniswap", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", verified: true },
    { symbol: "LINK", name: "Chainlink", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", verified: true },
    { symbol: "AAVE", name: "Aave Token", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", verified: true },
    { symbol: "MKR", name: "Maker", address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", verified: true },
  ];

  // Token search function
  const searchTokens = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return commonTokens.filter(
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
                "ethereumFromTokenAddress"
              ) as HTMLInputElement;
              if (fromTokenAddressInput) {
                fromTokenAddressInput.value = token.address;
              }

              const fromTokenDisplay = document.getElementById("ethereumFromTokenDisplay");
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

  // Setup token search for "To" field (similar logic)
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
                "ethereumToTokenAddress"
              ) as HTMLInputElement;
              if (toTokenAddressInput) {
                toTokenAddressInput.value = token.address;
              }

              const toTokenDisplay = document.getElementById("ethereumToTokenDisplay");
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
        document.getElementById("ethereumFromTokenAddress") as HTMLInputElement
      )?.value;
      const toToken = (
        document.getElementById("ethereumToTokenAddress") as HTMLInputElement
      )?.value;
      const amount = (document.getElementById("ethereumSwapAmount") as HTMLInputElement)
        ?.value;

      if (!fromToken || !toToken || !amount) {
        context.log(
          "❌ Please select both tokens and enter an amount",
          "error"
        );
        return;
      }

      if (fromToken === toToken) {
        context.log("❌ Cannot swap the same token", "error");
        return;
      }

      context.log("📊 Getting CowSwap quote...", "info");
      await handleEthereumSwap(context, ["", "", fromToken, toToken, amount]);
    });
  }

  // Swap button handler
  if (swapBtn) {
    swapBtn.addEventListener("click", async () => {
      const fromToken = (
        document.getElementById("ethereumFromTokenAddress") as HTMLInputElement
      )?.value;
      const toToken = (
        document.getElementById("ethereumToTokenAddress") as HTMLInputElement
      )?.value;
      const amount = (document.getElementById("ethereumSwapAmount") as HTMLInputElement)
        ?.value;

      if (!fromToken || !toToken || !amount) {
        context.log(
          "❌ Please select both tokens and enter an amount",
          "error"
        );
        return;
      }

      if (fromToken === toToken) {
        context.log("❌ Cannot swap the same token", "error");
        return;
      }

      context.log("💱 Executing CowSwap...", "info");
      await handleEthereumSwap(context, ["", "", fromToken, toToken, amount]);
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

async function handleEthereumSwap(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const fromToken = args[2];
  const toToken = args[3];
  const amount = args[4];

  if (!fromToken || !toToken || !amount) {
    const usageHtml = createUsageError("ethereum swap <fromToken> <toToken> <amount>", [
      "ethereum swap ETH USDC 1",
      "ethereum swap USDC DAI 100",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  if (!context.wallet?.address) {
    context.log("❌ Please connect your wallet first", "error");
    const helpHtml = `
      <div style="margin: 8px 0;">
        ${createCommandLine("connect", "Connect your wallet")}
        ${createCommandLine("ethereum help", "See Ethereum commands")}
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  // Get token symbols for display
  const tokenMap: Record<string, string> = {
    "0x0000000000000000000000000000000000000000": "ETH",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH",
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "WBTC",
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984": "UNI",
    "0x514910771AF9Ca656af840dff83E8264EcF986CA": "LINK",
    "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9": "AAVE",
    "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2": "MKR",
  };

  const fromSymbol = tokenMap[fromToken] || fromToken;
  const toSymbol = tokenMap[toToken] || toToken;

  context.log("💱 Preparing CowSwap transaction...", "info");
  context.log(`   From: ${amount} ${fromSymbol}`, "info");
  context.log(`   To: ${toSymbol}`, "info");
  context.log("", "info");

  try {
    // Show swap status notice
    context.logHtml(
      createSwapStatusNotice({
        network: "Ethereum",
        status: "coming-soon",
        icon: "💱",
        title: "Ethereum Token Swap (CowSwap)",
        description: [
          "Ethereum token swap functionality via CowSwap is currently in development.",
          `Swap ${amount} ${fromSymbol} for ${toSymbol} on Ethereum.`,
          "CowSwap provides MEV-protected swaps with gasless orders and optimal price execution.",
          "For now, please use CowSwap directly for Ethereum token swaps.",
        ],
        action: {
          href: "https://swap.cow.fi",
          label: "Open CowSwap",
        },
        note: "Full CowSwap integration coming in future updates! 🚀",
      })
    );
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

export const ethereumCommands: Command[] = [ethereumCommand];

