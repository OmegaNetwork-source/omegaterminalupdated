/**
 * Polygon Network Commands
 * Bridge, swap, and network operations for Polygon
 */

import type { Command, CommandContext } from "@/types/commands";
import { createUsageError, createSwapStatusNotice, createCommandLine } from "./command-output-helpers";

/**
 * Polygon command - Network operations for Polygon
 */
export const polygonCommand: Command = {
  name: "polygon",
  description: "Polygon network operations",
  usage: "polygon <balance|bridge|swap|help>",
  category: "network",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showPolygonHelp(context);
      return;
    }

    switch (subcommand) {
      case "balance":
        await getPolygonBalance(context);
        break;
      case "bridge":
        if (args.length >= 5) {
          await handlePolygonBridge(context, args);
        } else {
          await showPolygonBridgeInterface(context);
        }
        break;
      case "swap":
        if (args.length >= 5) {
          await handlePolygonSwap(context, args);
        } else {
          await showPolygonSwapInterface(context);
        }
        break;
      default:
        context.log(`❌ Unknown subcommand: ${subcommand}`, "error");
        showPolygonHelp(context);
    }
  },
};

function showPolygonHelp(context: CommandContext): void {
  const helpLines: string[] = [
    "polygon",
    "",
    "Polygon network operations",
    "",
    "→ Usage: polygon <balance|bridge|swap|help>",
    "",
    "═ Commands ═",
    "",
    "polygon balance",
    "",
    "Check MATIC balance on Polygon",
    "",
    "→ Usage: polygon balance",
    "",
    "polygon bridge",
    "",
    "Bridge assets to/from Polygon",
    "",
    "→ Usage: polygon bridge <from> <to> <amount> <token>",
    "  Example: polygon bridge ethereum polygon 100 USDC",
    "",
    "polygon swap",
    "",
    "Swap tokens on Polygon using DEX aggregators",
    "",
    "→ Usage: polygon swap <fromToken> <toToken> <amount>",
    "  Example: polygon swap USDC MATIC 100",
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
        ═══ POLYGON NETWORK ═══
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
      const isCommand = line.startsWith("polygon ") && line.length < 50;
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

async function getPolygonBalance(context: CommandContext): Promise<void> {
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

  context.log("💰 Fetching Polygon balance...", "info");

  try {
    // In production, this would query Polygon RPC
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
          💰 Polygon Balance
        </div>
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="margin-bottom: 12px;">
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">MATIC Balance:</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 18px; font-weight: bold;">
              Loading...
            </div>
          </div>
          <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); font-size: 11px; margin-top: 8px;">
            💡 Connect to Polygon network to view balance
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
 * Show interactive Polygon bridge interface
 */
async function showPolygonBridgeInterface(context: CommandContext): Promise<void> {
  if (!context.wallet?.address) {
    context.log("❌ Please connect your wallet first", "error");
    const helpHtml = `
      <div style="margin: 8px 0;">
        ${createCommandLine("connect", "Connect your wallet")}
        ${createCommandLine("polygon help", "See Polygon commands")}
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  context.log("🌉 Polygon Bridge Interface", "info");

  const html = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent), color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent));
      border: 1px solid var(--palette-primary, #00d4ff);
      padding: 20px;
      margin: 10px 0;
      border-radius: 8px;
    ">
      <h3 style="margin: 0 0 15px 0; color: var(--palette-primary, #00d4ff); font-size: 18px;">
        🌉 Polygon Bridge
      </h3>
      
      <!-- From chain selection -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">From Chain:</label>
        <div style="position: relative;">
          <input type="text" id="polygonBridgeFromChain" placeholder="Search chains (e.g., Ethereum, Polygon, Arbitrum)..." 
            style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
          <div id="polygonBridgeFromChainList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 1000; display: none; border-radius: 0 0 4px 4px;"></div>
        </div>
        <input type="hidden" id="polygonBridgeFromChainValue" value="">
        <div id="polygonBridgeFromChainDisplay" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border-radius: 4px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); border-left: 3px solid var(--palette-border, rgba(0, 212, 255, 0.3)); font-family: 'Courier New', monospace;">Select source chain</div>
      </div>
      
      <!-- To chain selection -->  
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">To Chain:</label>
        <div style="position: relative;">
          <input type="text" id="polygonBridgeToChain" placeholder="Search chains (e.g., Polygon, Ethereum, Arbitrum)..." 
            style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
          <div id="polygonBridgeToChainList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 1000; display: none; border-radius: 0 0 4px 4px;"></div>
        </div>
        <input type="hidden" id="polygonBridgeToChainValue" value="">
        <div id="polygonBridgeToChainDisplay" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border-radius: 4px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); border-left: 3px solid var(--palette-border, rgba(0, 212, 255, 0.3)); font-family: 'Courier New', monospace;">Select destination chain</div>
      </div>
      
      <!-- Token selection -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">Token:</label>
        <div style="position: relative;">
          <input type="text" id="polygonBridgeToken" placeholder="Search tokens (e.g., USDC, MATIC, ETH)..." 
            style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
          <div id="polygonBridgeTokenList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 1000; display: none; border-radius: 0 0 4px 4px;"></div>
        </div>
        <input type="hidden" id="polygonBridgeTokenValue" value="">
        <div id="polygonBridgeTokenDisplay" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border-radius: 4px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); border-left: 3px solid var(--palette-border, rgba(0, 212, 255, 0.3)); font-family: 'Courier New', monospace;">Select token</div>
      </div>
      
      <!-- Amount input -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">Amount:</label>
        <input type="text" id="polygonBridgeAmount" placeholder="100.0" 
          style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); color: var(--palette-text, #ffffff); border-radius: 4px; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
      </div>
      
      <!-- Action button -->
      <div style="margin-bottom: 15px;">
        <button id="polygonBridgeBtn" style="width: 100%; padding: 12px; background: linear-gradient(135deg, var(--palette-primary, #00bcf2), var(--palette-primary, #00d4ff)); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; transition: all 0.2s ease;" onmouseover="this.style.opacity = '0.9'; this.style.transform = 'scale(1.02)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'scale(1)';">
          Initiate Bridge
        </button>
      </div>
      
      <div style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 10px; border-radius: 4px; border-left: 3px solid var(--palette-primary, #00d4ff);">
        <small style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
          🌉 Bridge assets between Polygon and other supported chains. Select source chain, destination chain, token, and amount.
        </small>
      </div>
    </div>
  `;

  context.logHtml(html);

  // Setup event handlers after rendering
  if (typeof window !== "undefined") {
    setTimeout(() => {
      setupPolygonBridgeInterface(context);
    }, 100);
  }
}

/**
 * Setup Polygon bridge interface event handlers
 */
function setupPolygonBridgeInterface(context: CommandContext): void {
  const fromChainSearch = document.getElementById("polygonBridgeFromChain") as HTMLInputElement;
  const toChainSearch = document.getElementById("polygonBridgeToChain") as HTMLInputElement;
  const tokenSearch = document.getElementById("polygonBridgeToken") as HTMLInputElement;
  const bridgeBtn = document.getElementById("polygonBridgeBtn");

  if (!fromChainSearch || !toChainSearch || !tokenSearch) return;

  // Supported chains
  const supportedChains = [
    { name: "Ethereum", value: "ethereum", icon: "⟠" },
    { name: "Polygon", value: "polygon", icon: "🟣" },
    { name: "Arbitrum", value: "arbitrum", icon: "🔵" },
    { name: "Optimism", value: "optimism", icon: "🔴" },
    { name: "Base", value: "base", icon: "🔷" },
    { name: "BSC", value: "bsc", icon: "🟡" },
  ];

  // Common bridgeable tokens
  const bridgeableTokens = [
    { symbol: "USDC", name: "USD Coin", verified: true },
    { symbol: "USDT", name: "Tether USD", verified: true },
    { symbol: "MATIC", name: "Polygon", verified: true },
    { symbol: "ETH", name: "Ethereum", verified: true },
    { symbol: "WETH", name: "Wrapped Ether", verified: true },
    { symbol: "DAI", name: "Dai Stablecoin", verified: true },
  ];

  // Chain search function
  const searchChains = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return supportedChains.filter(
      (chain) =>
        chain.name.toLowerCase().includes(lowerQuery) ||
        chain.value.toLowerCase().includes(lowerQuery)
    );
  };

  // Token search function
  const searchTokens = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return bridgeableTokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(lowerQuery) ||
        token.name.toLowerCase().includes(lowerQuery)
    );
  };

  // Setup chain search for "From" field
  let fromChainTimeout: any;
  fromChainSearch.addEventListener("input", (e) => {
    clearTimeout(fromChainTimeout);
    const query = (e.target as HTMLInputElement).value.trim();
    const fromList = document.getElementById("polygonBridgeFromChainList");

    if (query.length < 1) {
      if (fromList) fromList.style.display = "none";
      return;
    }

    fromChainTimeout = setTimeout(() => {
      if (fromList) {
        const results = searchChains(query);
        fromList.innerHTML = "";

        if (results.length > 0) {
          results.forEach((chain) => {
            const item = document.createElement("div");
            item.style.cssText =
              "padding: 8px; cursor: pointer; border-bottom: 1px solid var(--palette-border, rgba(0, 212, 255, 0.2)); display: flex; align-items: center; gap: 8px; transition: background 0.2s ease;";
            item.onmouseover = () => {
              item.style.background = "color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent)";
            };
            item.onmouseout = () => {
              item.style.background = "transparent";
            };

            item.innerHTML = `
              <span style="font-size: 18px;">${chain.icon}</span>
              <div style="flex: 1; font-weight: bold; color: var(--palette-text, #e0e0e0);">${chain.name}</div>
            `;

            item.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              const fromChainValue = document.getElementById("polygonBridgeFromChainValue") as HTMLInputElement;
              if (fromChainValue) {
                fromChainValue.value = chain.value;
              }

              const fromChainDisplay = document.getElementById("polygonBridgeFromChainDisplay");
              if (fromChainDisplay) {
                fromChainDisplay.innerHTML = `${chain.icon} ${chain.name}`;
                fromChainDisplay.style.borderLeftColor = "var(--palette-primary, #00d4ff)";
                fromChainDisplay.style.color = "var(--palette-primary, #00d4ff)";
              }

              fromChainSearch.value = "";
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

  // Setup chain search for "To" field (similar logic)
  let toChainTimeout: any;
  toChainSearch.addEventListener("input", (e) => {
    clearTimeout(toChainTimeout);
    const query = (e.target as HTMLInputElement).value.trim();
    const toList = document.getElementById("polygonBridgeToChainList");

    if (query.length < 1) {
      if (toList) toList.style.display = "none";
      return;
    }

    toChainTimeout = setTimeout(() => {
      if (toList) {
        const results = searchChains(query);
        toList.innerHTML = "";

        if (results.length > 0) {
          results.forEach((chain) => {
            const item = document.createElement("div");
            item.style.cssText =
              "padding: 8px; cursor: pointer; border-bottom: 1px solid var(--palette-border, rgba(0, 212, 255, 0.2)); display: flex; align-items: center; gap: 8px; transition: background 0.2s ease;";
            item.onmouseover = () => {
              item.style.background = "color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent)";
            };
            item.onmouseout = () => {
              item.style.background = "transparent";
            };

            item.innerHTML = `
              <span style="font-size: 18px;">${chain.icon}</span>
              <div style="flex: 1; font-weight: bold; color: var(--palette-text, #e0e0e0);">${chain.name}</div>
            `;

            item.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              const toChainValue = document.getElementById("polygonBridgeToChainValue") as HTMLInputElement;
              if (toChainValue) {
                toChainValue.value = chain.value;
              }

              const toChainDisplay = document.getElementById("polygonBridgeToChainDisplay");
              if (toChainDisplay) {
                toChainDisplay.innerHTML = `${chain.icon} ${chain.name}`;
                toChainDisplay.style.borderLeftColor = "var(--palette-primary, #00d4ff)";
                toChainDisplay.style.color = "var(--palette-primary, #00d4ff)";
              }

              toChainSearch.value = "";
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

  // Setup token search
  let tokenTimeout: any;
  tokenSearch.addEventListener("input", (e) => {
    clearTimeout(tokenTimeout);
    const query = (e.target as HTMLInputElement).value.trim();
    const tokenList = document.getElementById("polygonBridgeTokenList");

    if (query.length < 1) {
      if (tokenList) tokenList.style.display = "none";
      return;
    }

    tokenTimeout = setTimeout(() => {
      if (tokenList) {
        const results = searchTokens(query);
        tokenList.innerHTML = "";

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

            item.innerHTML = `
              <div style="flex: 1;">
                <div style="font-weight: bold; color: var(--palette-text, #e0e0e0);">${token.symbol}</div>
                <div style="font-size: 12px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);">${token.name}</div>
              </div>
              ${verificationBadge}
            `;

            item.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              const tokenValue = document.getElementById("polygonBridgeTokenValue") as HTMLInputElement;
              if (tokenValue) {
                tokenValue.value = token.symbol;
              }

              const tokenDisplay = document.getElementById("polygonBridgeTokenDisplay");
              if (tokenDisplay) {
                tokenDisplay.innerHTML = `${token.symbol} - ${token.name} ${verificationBadge}`;
                tokenDisplay.style.borderLeftColor = token.verified
                  ? "var(--palette-primary, #00d4ff)"
                  : "var(--palette-error, #ff4d4f)";
                tokenDisplay.style.color = token.verified
                  ? "var(--palette-primary, #00d4ff)"
                  : "var(--palette-warning, #ffa502)";
              }

              tokenSearch.value = "";
              if (tokenList) tokenList.style.display = "none";
            });

            tokenList?.appendChild(item);
          });
          tokenList!.style.display = "block";
        } else {
          tokenList!.innerHTML =
            '<div style="padding: 8px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">No results found</div>';
          tokenList!.style.display = "block";
        }
      }
    }, 300);
  });

  // Bridge button handler
  if (bridgeBtn) {
    bridgeBtn.addEventListener("click", async () => {
      const fromChain = (
        document.getElementById("polygonBridgeFromChainValue") as HTMLInputElement
      )?.value;
      const toChain = (
        document.getElementById("polygonBridgeToChainValue") as HTMLInputElement
      )?.value;
      const token = (
        document.getElementById("polygonBridgeTokenValue") as HTMLInputElement
      )?.value;
      const amount = (document.getElementById("polygonBridgeAmount") as HTMLInputElement)
        ?.value;

      if (!fromChain || !toChain || !token || !amount) {
        context.log(
          "❌ Please select chains, token, and enter an amount",
          "error"
        );
        return;
      }

      if (fromChain === toChain) {
        context.log("❌ Source and destination chains must be different", "error");
        return;
      }

      context.log("🌉 Initiating bridge transaction...", "info");
      await handlePolygonBridge(context, ["", "", fromChain, toChain, amount, token]);
    });
  }

  // Focus management
  [fromChainSearch, toChainSearch, tokenSearch].forEach((input) => {
    input.setAttribute("tabindex", "1");
    input.style.cursor = "text";
    input.addEventListener("click", (e) => {
      e.stopPropagation();
      (e.target as HTMLInputElement).focus();
    });
  });
}

async function handlePolygonBridge(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const fromChain = args[2]?.toLowerCase();
  const toChain = args[3]?.toLowerCase();
  const amount = args[4];
  const token = args[5]?.toUpperCase() || "USDC";

  if (!fromChain || !toChain || !amount) {
    const usageHtml = createUsageError("polygon bridge <from> <to> <amount> [token]", [
      "polygon bridge ethereum polygon 100 USDC",
      "polygon bridge polygon ethereum 50 MATIC",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log("🌉 Preparing bridge transaction...", "info");

  try {
    // Show bridge status notice (similar to NEAR swap)
    context.logHtml(
      createSwapStatusNotice({
        network: "Polygon",
        status: "coming-soon",
        icon: "🌉",
        title: "Polygon Bridge",
        description: [
          "Cross-chain bridge functionality is currently in development.",
          `Bridge ${amount} ${token} from ${fromChain} to ${toChain}.`,
          "For now, please use Polygon Bridge directly for cross-chain transfers.",
        ],
        action: {
          href: "https://portal.polygon.technology",
          label: "Open Polygon Bridge",
        },
        note: "Full bridge integration coming in future updates! 🚀",
      })
    );
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Show interactive Polygon swap interface
 */
async function showPolygonSwapInterface(context: CommandContext): Promise<void> {
  if (!context.wallet?.address) {
    context.log("❌ Please connect your wallet first", "error");
    const helpHtml = `
      <div style="margin: 8px 0;">
        ${createCommandLine("connect", "Connect your wallet")}
        ${createCommandLine("polygon help", "See Polygon commands")}
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  context.log("💱 Polygon Swap Interface", "info");

  const html = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent), color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent));
      border: 1px solid var(--palette-primary, #00d4ff);
      padding: 20px;
      margin: 10px 0;
      border-radius: 8px;
    ">
      <h3 style="margin: 0 0 15px 0; color: var(--palette-primary, #00d4ff); font-size: 18px;">
        🟣 Polygon Token Swap
      </h3>
      
      <!-- From token selection -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">From Token:</label>
        <div style="position: relative;">
          <input type="text" id="polygonFromSearch" placeholder="Search tokens (e.g., MATIC, USDC, WETH)..." 
            style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
          <div id="polygonFromList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 1000; display: none; border-radius: 0 0 4px 4px;"></div>
        </div>
        <input type="hidden" id="polygonFromTokenAddress" value="0x0000000000000000000000000000000000001010">
        <div id="polygonFromTokenDisplay" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border-radius: 4px; color: var(--palette-primary, #00d4ff); border-left: 3px solid var(--palette-primary, #00d4ff); font-family: 'Courier New', monospace;">
          MATIC - Polygon <span style="color: var(--palette-success, #16c782); font-size: 12px;">✅ NATIVE</span><br>
          <span style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">0x0000000000000000000000000000000000001010</span>
        </div>
      </div>
      
      <!-- To token selection -->  
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">To Token:</label>
        <div style="position: relative;">
          <input type="text" id="polygonToSearch" placeholder="Search tokens (e.g., USDC, WETH, DAI)..." 
            style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
          <div id="polygonToList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 1000; display: none; border-radius: 0 0 4px 4px;"></div>
        </div>
        <input type="hidden" id="polygonToTokenAddress" value="">
        <div id="polygonToTokenDisplay" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); border-radius: 4px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); border-left: 3px solid var(--palette-border, rgba(0, 212, 255, 0.3)); font-family: 'Courier New', monospace;">Select a token</div>
      </div>
      
      <!-- Amount input -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">Amount:</label>
        <input type="text" id="polygonSwapAmount" placeholder="1.0" 
          style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); color: var(--palette-text, #ffffff); border-radius: 4px; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
      </div>
      
      <!-- Action buttons -->
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <button id="polygonQuoteBtn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--palette-primary, #00bcf2), var(--palette-primary, #00d4ff)); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; transition: all 0.2s ease;" onmouseover="this.style.opacity = '0.9'; this.style.transform = 'scale(1.02)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'scale(1)';">
          Get Quote
        </button>
        <button id="polygonSwapBtn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--palette-secondary, #00ff88), var(--palette-primary, #00d4ff)); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; transition: all 0.2s ease;" onmouseover="this.style.opacity = '0.9'; this.style.transform = 'scale(1.02)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'scale(1)';">
          Execute Swap
        </button>
      </div>
      
      <div style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 10px; border-radius: 4px; border-left: 3px solid var(--palette-primary, #00d4ff);">
        <small style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
          🔍 Start typing to search for tokens by name or symbol. Best rates across all Polygon DEXs (Uniswap, QuickSwap, SushiSwap).
        </small>
      </div>
    </div>
  `;

  context.logHtml(html);

  // Setup event handlers after rendering
  if (typeof window !== "undefined") {
    setTimeout(() => {
      setupPolygonSwapInterface(context);
    }, 100);
  }
}

/**
 * Setup Polygon swap interface event handlers
 */
function setupPolygonSwapInterface(context: CommandContext): void {
  const fromSearch = document.getElementById("polygonFromSearch") as HTMLInputElement;
  const toSearch = document.getElementById("polygonToSearch") as HTMLInputElement;
  const fromList = document.getElementById("polygonFromList");
  const toList = document.getElementById("polygonToList");
  const quoteBtn = document.getElementById("polygonQuoteBtn");
  const swapBtn = document.getElementById("polygonSwapBtn");

  if (!fromSearch || !toSearch) return;

  // Common Polygon tokens
  const commonTokens = [
    { symbol: "MATIC", name: "Polygon", address: "0x0000000000000000000000000000000000001010", verified: true },
    { symbol: "USDC", name: "USD Coin", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", verified: true },
    { symbol: "USDT", name: "Tether USD", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", verified: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", verified: true },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", verified: true },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", verified: true },
    { symbol: "AAVE", name: "Aave Token", address: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", verified: true },
    { symbol: "LINK", name: "Chainlink", address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", verified: true },
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
                "polygonFromTokenAddress"
              ) as HTMLInputElement;
              if (fromTokenAddressInput) {
                fromTokenAddressInput.value = token.address;
              }

              const fromTokenDisplay = document.getElementById("polygonFromTokenDisplay");
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
                "polygonToTokenAddress"
              ) as HTMLInputElement;
              if (toTokenAddressInput) {
                toTokenAddressInput.value = token.address;
              }

              const toTokenDisplay = document.getElementById("polygonToTokenDisplay");
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
        document.getElementById("polygonFromTokenAddress") as HTMLInputElement
      )?.value;
      const toToken = (
        document.getElementById("polygonToTokenAddress") as HTMLInputElement
      )?.value;
      const amount = (document.getElementById("polygonSwapAmount") as HTMLInputElement)
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

      context.log("📊 Getting swap quote...", "info");
      await handlePolygonSwap(context, ["", "", fromToken, toToken, amount]);
    });
  }

  // Swap button handler
  if (swapBtn) {
    swapBtn.addEventListener("click", async () => {
      const fromToken = (
        document.getElementById("polygonFromTokenAddress") as HTMLInputElement
      )?.value;
      const toToken = (
        document.getElementById("polygonToTokenAddress") as HTMLInputElement
      )?.value;
      const amount = (document.getElementById("polygonSwapAmount") as HTMLInputElement)
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

      context.log("💱 Executing swap...", "info");
      await handlePolygonSwap(context, ["", "", fromToken, toToken, amount]);
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

async function handlePolygonSwap(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const fromToken = args[2]; // Can be address or symbol
  const toToken = args[3]; // Can be address or symbol
  const amount = args[4];

  if (!fromToken || !toToken || !amount) {
    const usageHtml = createUsageError("polygon swap <fromToken> <toToken> <amount>", [
      "polygon swap USDC MATIC 100",
      "polygon swap WETH USDC 1",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  if (!context.wallet?.address) {
    context.log("❌ Please connect your wallet first", "error");
    const helpHtml = `
      <div style="margin: 8px 0;">
        ${createCommandLine("connect", "Connect your wallet")}
        ${createCommandLine("polygon help", "See Polygon commands")}
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  // Get token symbols for display
  const tokenMap: Record<string, string> = {
    "0x0000000000000000000000000000000000001010": "MATIC",
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": "USDC",
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F": "USDT",
    "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619": "WETH",
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063": "DAI",
  };

  const fromSymbol = tokenMap[fromToken] || fromToken;
  const toSymbol = tokenMap[toToken] || toToken;

  context.log("💱 Preparing token swap...", "info");
  context.log(`   From: ${amount} ${fromSymbol}`, "info");
  context.log(`   To: ${toSymbol}`, "info");
  context.log("", "info");

  try {
    // Show swap status notice (similar to NEAR swap)
    context.logHtml(
      createSwapStatusNotice({
        network: "Polygon",
        status: "coming-soon",
        icon: "💱",
        title: "Polygon Token Swap",
        description: [
          "Polygon token swap functionality is currently in development.",
          `Swap ${amount} ${fromSymbol} for ${toSymbol} on Polygon.`,
          "For now, please use Uniswap or 1inch directly for Polygon token swaps.",
        ],
        action: {
          href: "https://app.uniswap.org",
          label: "Open Uniswap",
        },
        note: "Full swap integration coming in future updates! 🚀",
      })
    );
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

export const polygonCommands: Command[] = [polygonCommand];

