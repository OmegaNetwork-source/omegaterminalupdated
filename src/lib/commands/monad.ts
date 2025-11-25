/**
 * Monad Network Commands
 * MACE API Integration for Monad DEX Aggregator
 */

import type { Command, CommandContext } from "@/types/commands";
import {
  getSupportedAssets,
  searchAssets,
  getTokenBalances,
  getExchangeRate,
  getBestRoutes,
  getSupportedExchanges,
  getRouterAddress,
} from "@/lib/api/mace";
import { formatEther, parseUnits, formatUnits } from "ethers";

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Format token amount with decimals
 */
function formatTokenAmount(amount: string, decimals: number = 18): string {
  try {
    const parsed = BigInt(amount);
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = parsed / divisor;
    const remainder = parsed % divisor;
    
    if (remainder === BigInt(0)) {
      return whole.toString();
    }
    
    const remainderStr = remainder.toString().padStart(Number(decimals), "0");
    const trimmed = remainderStr.replace(/0+$/, "");
    return `${whole}.${trimmed}`;
  } catch {
    return amount;
  }
}

/**
 * Monad Command - Monad Network Integration with MACE API
 */
export const monadCommand: Command = {
  name: "monad",
  description: "Monad Network operations with MACE DEX Aggregator",
  usage:
    "monad <connect|tokens|balance|swap|quote|exchanges|help>",
  category: "blockchain",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      context.log("🔷 MONAD NETWORK COMMANDS", "info");
      context.log("═══════════════════════════", "output");
      context.log("", "output");
      context.log("📋 AVAILABLE COMMANDS:", "info");
      context.log("  monad connect     Connect wallet to MONAD Network", "output");
      context.log("  monad tokens      List all supported tokens", "output");
      context.log("  monad balance     Check token balances for your wallet", "output");
      context.log("  monad swap        Find best swap routes", "output");
      context.log("  monad quote       Get price quote between tokens", "output");
      context.log("  monad exchanges   View supported DEX exchanges", "output");
      context.log("  monad help        Show this help message", "output");
      context.log("", "output");
      context.log(
        "💡 Powered by MACE DEX Aggregator API",
        "info"
      );
      context.log("   https://api.mace.ag/swaps", "info");
      return;
    }

    switch (subcommand) {
      case "connect": {
        context.log("🔷 Connecting to MONAD Network...", "info");
        
        // Check if wallet is connected
        if (!context.wallet?.state?.isConnected) {
          context.log("❌ Please connect your wallet first", "error");
          context.log("   Use 'connect' command to connect MetaMask", "output");
          return;
        }

        // Check if on Monad network (Chain ID 143)
        const currentChainId = context.wallet.state.chainId;
        if (currentChainId !== 143) {
          context.log("⚠️  Not connected to Monad Mainnet", "warning");
          context.log(`   Current Chain ID: ${currentChainId}`, "output");
          context.log("   Please switch to Monad Mainnet (Chain ID: 143)", "output");
          context.log("", "output");
          context.log("   Opening network selector...", "info");
          
          // Trigger network selector
          if (typeof window !== "undefined") {
            const { openNetworkSelector } = await import("@/lib/wallet/networkSelector");
            openNetworkSelector({
              log: (msg, type) => context.log(msg, type || "output"),
              wallet: context.wallet,
              source: "command",
            });
          }
          return;
        }

        const address = context.wallet.state.address;
        context.log("✅ Connected to Monad Mainnet", "success");
        context.log(`📍 Address: ${address}`, "output");
        break;
      }

      case "tokens": {
        context.log("🔷 Fetching supported tokens...", "info");
        
        try {
          const pageSize = args[2] ? parseInt(args[2]) : 50;
          const page = args[3] ? parseInt(args[3]) : 0;
          
          const data = await getSupportedAssets({
            page,
            pageSize: Math.min(pageSize, 100),
            sortBy: "volume24H",
          });

          // Handle both paginated and non-paginated responses
          const tokens = Array.isArray(data) ? data : (data.items || []);
          
          if (tokens.length === 0) {
            context.log("❌ No tokens found", "error");
            return;
          }

          context.log("", "output");
          context.log(`📊 Found ${tokens.length} token${tokens.length !== 1 ? "s" : ""}`, "info");
          context.log("", "output");

          // Escape HTML to prevent XSS
          const escapeHtml = (str: string) => {
            const map: Record<string, string> = {
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#039;",
            };
            return str.replace(/[&<>"']/g, (m) => map[m]);
          };

          // Build HTML for token list
          const tokensHtml = tokens.map((token: any, index: number) => {
            const num = (page * pageSize) + index + 1;
            const symbol = escapeHtml(token.symbol || "Unknown");
            const name = escapeHtml(token.name || "N/A");
            const address = token.token || "N/A";
            const decimals = token.decimals || 18;
            const verified = token.verified;
            const logoUrl = token.logo && !token.logo.startsWith("data:") ? token.logo : null;
            
            // Format address for display
            const displayAddress = address.length > 42 
              ? `${address.substring(0, 20)}...${address.substring(address.length - 6)}`
              : address;
            const escapedAddress = escapeHtml(displayAddress);

            return `
              <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                margin: 8px 0;
                background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 40%, transparent);
                border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
                border-radius: 8px;
                transition: all 0.2s ease;
              " onmouseover="this.style.borderColor='color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)'; this.style.background='color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent)';" onmouseout="this.style.borderColor='color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent)'; this.style.background='color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 40%, transparent)';">
                <div style="
                  flex: 0 0 40px;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
                  border-radius: 8px;
                  border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
                  overflow: hidden;
                ">
                  ${logoUrl ? `
                    <img 
                      src="${escapeHtml(logoUrl)}" 
                      alt="${symbol}"
                      style="
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                      "
                      onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                    />
                    <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 18px;">
                      🔷
                    </div>
                  ` : `
                    <div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 18px;">
                      🔷
                    </div>
                  `}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                  ">
                    <span style="
                      color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);
                      font-size: 12px;
                      font-weight: 600;
                    ">${num}.</span>
                    <span style="
                      color: var(--palette-primary, #00d4ff);
                      font-weight: 600;
                      font-size: 14px;
                    ">${symbol}</span>
                    ${verified ? `
                      <span style="
                        color: var(--palette-success, #16c782);
                        font-size: 12px;
                      ">✅</span>
                    ` : `
                      <span style="
                        color: var(--palette-error, #ff6666);
                        font-size: 12px;
                      ">❌</span>
                    `}
                  </div>
                  <div style="
                    color: color-mix(in srgb, var(--palette-text, #ffffff) 80%, transparent);
                    font-size: 12px;
                    margin-bottom: 2px;
                  ">${name}</div>
                  <div style="
                    color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);
                    font-size: 11px;
                    font-family: monospace;
                  ">${escapedAddress}</div>
                  <div style="
                    color: color-mix(in srgb, var(--palette-text, #ffffff) 50%, transparent);
                    font-size: 11px;
                    margin-top: 4px;
                  ">${decimals} decimals</div>
                </div>
              </div>
            `;
          }).join("");

          const html = `
            <div style="margin: 16px 0;">
              ${tokensHtml}
              ${!Array.isArray(data) && data.remaining_pages > 0 ? `
                <div style="
                  padding: 12px;
                  margin-top: 16px;
                  background: color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent);
                  border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
                  border-radius: 8px;
                  text-align: center;
                  color: var(--palette-primary, #00d4ff);
                  font-size: 12px;
                ">
                  ... and ${data.remaining_pages} more page(s)<br/>
                  <span style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); font-size: 11px; margin-top: 4px; display: block;">
                    Use: <code style="background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent); padding: 2px 6px; border-radius: 4px;">monad tokens ${pageSize} ${page + 1}</code>
                  </span>
                </div>
              ` : ""}
            </div>
          `;

          context.logHtml(html);

        } catch (error) {
          context.log(`❌ Failed to fetch tokens: ${error instanceof Error ? error.message : String(error)}`, "error");
        }
        break;
      }

      case "balance": {
        context.log("💰 Checking token balances...", "info");

        // Check if wallet is connected
        if (!context.wallet?.state?.isConnected) {
          context.log("❌ Please connect your wallet first", "error");
          context.log("   Use 'monad connect' or 'connect' command", "output");
          return;
        }

        const address = context.wallet.state.address;
        if (!address) {
          context.log("❌ Wallet address not available", "error");
          return;
        }

        try {
          context.log(`📍 Address: ${address}`, "output");
          context.log("", "output");

          const data = await getTokenBalances(address, {
            omitZeros: true,
            omitErrors: true,
            sortBy: "volume24H",
          });

          // Handle both object and array responses
          const balances = typeof data === "object" && !Array.isArray(data) 
            ? Object.entries(data).filter(([_, value]) => {
                // Filter out errors
                return typeof value === "string" || (typeof value === "object" && !value.errorKind);
              })
            : [];

          if (balances.length === 0) {
            context.log("❌ No token balances found", "error");
            context.log("   This address may not have any tokens indexed yet", "output");
            return;
          }

          context.log(`📊 Found ${balances.length} token balance${balances.length !== 1 ? "s" : ""}`, "info");
          context.log("", "output");

          balances.forEach(([tokenId, balance]: [string, any]) => {
            if (typeof balance === "string") {
              // Simple balance string
              context.log(`  ${tokenId}: ${balance}`, "output");
            } else if (balance && typeof balance === "object" && !balance.errorKind) {
              // This shouldn't happen with omitErrors, but handle it
              context.log(`  ${tokenId}: ${balance}`, "output");
            }
          });
        } catch (error) {
          context.log(`❌ Failed to fetch balances: ${error instanceof Error ? error.message : String(error)}`, "error");
        }
        break;
      }

      case "swap": {
        // Show interactive swap interface
        await showMonadSwapInterface(context);
        break;
      }

      case "quote": {
        context.log("💵 Getting price quote...", "info");

        const inToken = args[2];
        const outToken = args[3];

        if (!inToken || !outToken) {
          context.log("❌ Missing required parameters", "error");
          context.log("", "output");
          context.log("Usage: monad quote <inputToken> <outputToken>", "output");
          context.log("", "output");
          context.log("Examples:", "output");
          context.log("  monad quote native 0x...", "output");
          context.log("  monad quote 0x... native", "output");
          return;
        }

        try {
          const quote = await getExchangeRate({
            inToken,
            outToken,
            lastNSeconds: 60,
          });

          context.log("", "output");
          context.log("📊 Exchange Rate:", "info");
          context.log(`   Average: ${quote.average || "N/A"}`, "output");
          context.log(`   Minimum: ${quote.minimum || "N/A"}`, "output");
          context.log(`   Maximum: ${quote.maximum || "N/A"}`, "output");
          context.log(`   Median: ${quote.median || "N/A"}`, "output");
          if (quote.stale) {
            context.log("   ⚠️  Data may be stale", "warning");
          }
        } catch (error) {
          context.log(`❌ Failed to get quote: ${error instanceof Error ? error.message : String(error)}`, "error");
        }
        break;
      }

      case "exchanges": {
        context.log("🏪 Fetching supported exchanges...", "info");

        try {
          const pageSize = args[2] ? parseInt(args[2]) : 20;
          const page = args[3] ? parseInt(args[3]) : 0;

          const data = await getSupportedExchanges({
            page,
            pageSize: Math.min(pageSize, 100),
          });

          // Handle both array and paginated responses
          const exchanges = Array.isArray(data) ? data : (data.items || []);

          if (exchanges.length === 0) {
            context.log("❌ No exchanges found", "error");
            return;
          }

          context.log("", "output");
          context.log(`📊 Found ${exchanges.length} exchange${exchanges.length !== 1 ? "s" : ""}`, "info");
          context.log("", "output");

          exchanges.forEach((exchange: any, index: number) => {
            context.log(`  ${index + 1}. ${exchange.name || "Unknown"}`, "output");
            context.log(`     Address: ${exchange.exchange || "N/A"}`, "output");
            context.log(`     Brand: ${exchange.brand || "N/A"}`, "output");
            if (exchange.tokens && exchange.tokens.length > 0) {
              context.log(`     Pairs: ${exchange.tokens.length}`, "output");
            }
            context.log("", "output");
          });

          if (!Array.isArray(data) && data.remaining_pages > 0) {
            context.log(`   ... and ${data.remaining_pages} more page(s)`, "info");
            context.log(`   Use: monad exchanges ${pageSize} ${page + 1}`, "output");
          }
        } catch (error) {
          context.log(`❌ Failed to fetch exchanges: ${error instanceof Error ? error.message : String(error)}`, "error");
        }
        break;
      }

      default:
        context.log(`❌ Unknown MONAD command: ${subcommand}`, "error");
        context.log('Type "monad help" for available commands', "info");
    }
  },
};

/**
 * Show interactive Monad swap interface with token search and quotes
 */
async function showMonadSwapInterface(context: CommandContext): Promise<void> {
  if (!context.wallet?.state?.isConnected) {
    context.log("❌ Please connect your wallet first", "error");
    context.log("   Use 'monad connect' or 'connect' command", "output");
    return;
  }

  context.log("💱 Monad Swap", "info");

  const html = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent), color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent));
      border: 1px solid var(--palette-primary, #00d4ff);
      padding: 20px;
      margin: 10px 0;
      border-radius: 8px;
    ">
      <h3 style="margin: 0 0 15px 0; color: var(--palette-primary, #00d4ff); font-size: 18px;">
        🔷 Monad Swap
      </h3>
      
      <!-- From Token -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">From Token:</label>
        <div style="display: flex; gap: 8px;">
          <select id="monadFromDropdown" style="
            flex: 1;
            padding: 8px;
            background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 80%, transparent);
            color: var(--palette-text, #ffffff);
            border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            position: relative;
            z-index: 10;
            pointer-events: auto;
          ">
            <option value="native" style="background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 100%, transparent); color: var(--palette-text, #ffffff);">MON (Native)</option>
            <option value="loading" style="background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 100%, transparent); color: var(--palette-text, #ffffff);">Loading tokens...</option>
          </select>
          <div style="position: relative; flex: 1;">
            <input type="text" id="monadFromSearch" placeholder="Or enter contract address..." 
              style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
            <div id="monadFromList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 1000; display: none; border-radius: 0 0 4px 4px;"></div>
          </div>
        </div>
        <input type="hidden" id="monadFromTokenAddress" value="native">
        <div id="monadFromTokenDisplay" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent); border-radius: 4px; color: var(--palette-primary, #00d4ff); border-left: 3px solid var(--palette-primary, #00d4ff); font-family: 'Courier New', monospace;">
          MON - Monad <span style="color: var(--palette-success, #16c782); font-size: 12px;">✅ NATIVE</span><br>
          <span style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">native</span>
        </div>
      </div>
      
      <!-- To Token -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">To Token:</label>
        <div style="display: flex; gap: 8px;">
          <select id="monadToDropdown" style="
            flex: 1;
            padding: 8px;
            background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 80%, transparent);
            color: var(--palette-text, #ffffff);
            border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            position: relative;
            z-index: 10;
            pointer-events: auto;
          ">
            <option value="" style="background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 100%, transparent); color: var(--palette-text, #ffffff);">Select a token...</option>
            <option value="loading" style="background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 100%, transparent); color: var(--palette-text, #ffffff);">Loading tokens...</option>
          </select>
          <div style="position: relative; flex: 1;">
            <input type="text" id="monadToSearch" placeholder="Or enter contract address..." 
              style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent); color: var(--palette-text, #ffffff); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px; box-sizing: border-box; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
            <div id="monadToList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-top: none; z-index: 1000; display: none; border-radius: 0 0 4px 4px;"></div>
          </div>
        </div>
        <input type="hidden" id="monadToTokenAddress" value="">
        <div id="monadToTokenDisplay" style="margin-top: 5px; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent); border-radius: 4px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); border-left: 3px solid var(--palette-border, rgba(0, 212, 255, 0.3)); font-family: 'Courier New', monospace;">Select a token</div>
      </div>
      
      <!-- Amount Input -->
      <div style="margin-bottom: 15px;">
        <label style="color: var(--palette-text, #e0e0e0); display: block; margin-bottom: 5px; font-weight: 600;">Amount:</label>
        <input type="text" id="monadSwapAmount" placeholder="1.0" 
          style="width: 100%; padding: 8px; background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); color: var(--palette-text, #ffffff); border-radius: 4px; cursor: text; font-family: 'Courier New', monospace;" autocomplete="off">
      </div>
      
      <!-- Action buttons -->
      <div style="display: flex; justify-content: center; margin-bottom: 15px;">
        <button id="monadSwapBtn" style="padding: 12px 48px; background: linear-gradient(135deg, #00d4ff, #00bcf2); color: #000000; border: 2px solid #00d4ff; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; transition: all 0.2s ease; font-size: 14px; box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);" onmouseover="this.style.opacity = '0.9'; this.style.transform = 'scale(1.02)'; this.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.5)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'scale(1)'; this.style.boxShadow = '0 2px 8px rgba(0, 212, 255, 0.3)';">
          Execute Swap
        </button>
      </div>
      
      <!-- Quote Display Area -->
      <div id="monadQuoteDisplay" style="
        background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 80%, transparent);
        border: 1px solid var(--palette-primary, #00d4ff);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 15px;
        display: block !important;
        position: relative;
        z-index: 1;
        pointer-events: auto;
        min-height: 60px;
        overflow: visible;
        visibility: visible !important;
      ">
        <div style="color: var(--palette-primary, #00d4ff); font-weight: 600; margin-bottom: 8px; font-size: 14px;">💵 Price Quote</div>
        <div id="monadQuoteContent" style="color: var(--palette-text, #e0e0e0); font-size: 12px; font-family: monospace; line-height: 1.6; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">Select tokens and enter amount to see quote</div>
      </div>
      
      <div style="background: color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent); padding: 10px; border-radius: 4px; border-left: 3px solid var(--palette-primary, #00d4ff);">
        <small style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
          🔍 Select from dropdown or enter contract address. Best rates across all Monad DEXs.
        </small>
      </div>
    </div>
  `;

  context.logHtml(html);

  // Setup event handlers after rendering
  if (typeof window !== "undefined") {
    setTimeout(() => {
      setupMonadSwapInterface(context);
    }, 100);
  }
}

/**
 * Setup Monad swap interface event handlers
 */
function setupMonadSwapInterface(context: CommandContext): void {
  const fromSearch = document.getElementById("monadFromSearch") as HTMLInputElement;
  const toSearch = document.getElementById("monadToSearch") as HTMLInputElement;
  const fromDropdown = document.getElementById("monadFromDropdown") as HTMLSelectElement;
  const toDropdown = document.getElementById("monadToDropdown") as HTMLSelectElement;
  const fromList = document.getElementById("monadFromList");
  const toList = document.getElementById("monadToList");
  const swapBtn = document.getElementById("monadSwapBtn");
  const quoteDisplay = document.getElementById("monadQuoteDisplay");
  const quoteContent = document.getElementById("monadQuoteContent");
  
  // Debounce timer for auto-quote
  let autoQuoteTimer: any = null;
  let isFetchingQuote = false;
  let lastQuoteParams: { fromToken: string; toToken: string; amount: string } | null = null;

  if (!fromSearch || !toSearch || !fromDropdown || !toDropdown) return;

  // Cache for tokens
  let allTokens: any[] = [];
  let tokensLoaded = false;

  // Helper to update token display
  const updateTokenDisplay = (tokenId: string, displayElement: HTMLElement, addressInput: HTMLInputElement, isFrom: boolean) => {
    if (tokenId === "native") {
      displayElement.innerHTML = `MON - Monad <span style="color: var(--palette-success, #16c782); font-size: 12px;">✅ NATIVE</span><br><span style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">native</span>`;
      displayElement.style.borderLeftColor = "var(--palette-primary, #00d4ff)";
      displayElement.style.color = "var(--palette-primary, #00d4ff)";
      addressInput.value = "native";
      return;
    }

    // Check if it's a contract address (starts with 0x)
    if (tokenId.startsWith("0x") && tokenId.length === 42) {
      // It's a contract address
      const shortAddr = tokenId.substring(0, 10) + "..." + tokenId.substring(tokenId.length - 8);
      displayElement.innerHTML = `Custom Token <span style="color: var(--palette-warning, #f2b705); font-size: 12px;">⚠️ UNVERIFIED</span><br><span style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">${escapeHtml(shortAddr)}</span>`;
      displayElement.style.borderLeftColor = "var(--palette-error, #ff6666)";
      displayElement.style.color = "var(--palette-warning, #f2b705)";
      addressInput.value = tokenId;
      return;
    }

    // Find token in list
    const token = allTokens.find((t: any) => t.token === tokenId);
    if (token) {
      const logoUrl = token.logo && !token.logo.startsWith("data:") ? token.logo : null;
      const logoHtml = logoUrl ? `<img src="${escapeHtml(logoUrl)}" style="width: 20px; height: 20px; border-radius: 50%; vertical-align: middle; margin-right: 6px; object-fit: contain;" onerror="this.style.display='none';">` : "🔷 ";
      const isVerified = token.verified;
      const verificationBadge = isVerified
        ? '<span style="color: var(--palette-success, #16c782); font-size: 12px;">✅ VERIFIED</span>'
        : '<span style="color: var(--palette-error, #ff6666); font-size: 12px;">⚠️ UNVERIFIED</span>';
      const shortAddr = token.token && token.token.length > 20
        ? token.token.substring(0, 10) + "..." + token.token.substring(token.token.length - 8)
        : token.token || "native";
      displayElement.innerHTML = `${logoHtml}${escapeHtml(token.symbol || "Unknown")} - ${escapeHtml(token.name || "Unknown")} ${verificationBadge}<br><span style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">${escapeHtml(shortAddr)}</span>`;
      displayElement.style.borderLeftColor = isVerified ? "var(--palette-primary, #00d4ff)" : "var(--palette-error, #ff6666)";
      displayElement.style.color = isVerified ? "var(--palette-primary, #00d4ff)" : "var(--palette-warning, #f2b705)";
      addressInput.value = token.token || "native";
    }
  };

  // Load all tokens on mount and populate dropdowns
  const loadTokens = async () => {
    // Only load once
    if (tokensLoaded) return;
    
    try {
      const response = await fetch("/api/mace/assets?pageSize=100&sortBy=volume24H");
      if (response.ok) {
        const data = await response.json();
        allTokens = Array.isArray(data) ? data : (data.items || []);
        tokensLoaded = true;

        // Preserve current selections before repopulating
        const fromCurrentValue = fromDropdown?.value || "native";
        const toCurrentValue = toDropdown?.value || "";

        // Populate dropdowns
        if (fromDropdown) {
          fromDropdown.innerHTML = '<option value="native" style="background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 100%, transparent); color: var(--palette-text, #ffffff);">MON (Native)</option>';
          allTokens.forEach((token: any) => {
            const option = document.createElement("option");
            option.value = token.token || "";
            option.textContent = `${token.symbol || "Unknown"} - ${token.name || "Unknown"}${token.verified ? " ✅" : ""}`;
            option.style.background = "color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 100%, transparent)";
            option.style.color = "var(--palette-text, #ffffff)";
            fromDropdown.appendChild(option);
          });
          // Restore selection
          if (fromCurrentValue && fromDropdown.querySelector(`option[value="${fromCurrentValue}"]`)) {
            fromDropdown.value = fromCurrentValue;
          }
        }

        if (toDropdown) {
          toDropdown.innerHTML = '<option value="" style="background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 100%, transparent); color: var(--palette-text, #ffffff);">Select a token...</option>';
          const nativeOption = document.createElement("option");
          nativeOption.value = "native";
          nativeOption.textContent = "MON (Native)";
          nativeOption.style.background = "color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 100%, transparent)";
          nativeOption.style.color = "var(--palette-text, #ffffff)";
          toDropdown.appendChild(nativeOption);
          allTokens.forEach((token: any) => {
            const option = document.createElement("option");
            option.value = token.token || "";
            option.textContent = `${token.symbol || "Unknown"} - ${token.name || "Unknown"}${token.verified ? " ✅" : ""}`;
            option.style.background = "color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 100%, transparent)";
            option.style.color = "var(--palette-text, #ffffff)";
            toDropdown.appendChild(option);
          });
          // Restore selection
          if (toCurrentValue && toDropdown.querySelector(`option[value="${toCurrentValue}"]`)) {
            toDropdown.value = toCurrentValue;
          }
        }
      }
    } catch (err) {
      console.error("[Monad Swap] Failed to load tokens:", err);
      if (fromDropdown) fromDropdown.innerHTML = '<option value="native">MON (Native)</option><option value="">Failed to load tokens</option>';
      if (toDropdown) toDropdown.innerHTML = '<option value="">Failed to load tokens</option>';
    }
  };
  loadTokens();

  // Handle dropdown selection for "From"
  if (fromDropdown) {
    fromDropdown.addEventListener("change", (e) => {
      try {
        const selectedValue = (e.target as HTMLSelectElement).value;
        const fromTokenAddressInput = document.getElementById("monadFromTokenAddress") as HTMLInputElement;
        const fromTokenDisplay = document.getElementById("monadFromTokenDisplay");
        if (fromTokenAddressInput && fromTokenDisplay) {
          updateTokenDisplay(selectedValue, fromTokenDisplay, fromTokenAddressInput, true);
          // Clear search input
          if (fromSearch) fromSearch.value = "";
          if (fromList) fromList.style.display = "none";
          // Trigger auto-quote after a delay (only if params changed)
          clearTimeout(autoQuoteTimer);
          autoQuoteTimer = setTimeout(() => {
            fetchQuoteAuto();
          }, 1000);
        }
      } catch (error) {
        console.error("[Monad Swap] Error in from dropdown handler:", error);
      }
    });
  }

  // Handle dropdown selection for "To"
  if (toDropdown) {
    toDropdown.addEventListener("change", (e) => {
      try {
        const selectedValue = (e.target as HTMLSelectElement).value;
        if (!selectedValue) {
          // Clear display if no selection
          const toTokenAddressInput = document.getElementById("monadToTokenAddress") as HTMLInputElement;
          const toTokenDisplay = document.getElementById("monadToTokenDisplay");
          if (toTokenAddressInput && toTokenDisplay) {
            toTokenAddressInput.value = "";
            toTokenDisplay.innerHTML = "Select a token";
            toTokenDisplay.style.borderLeftColor = "var(--palette-border, rgba(0, 212, 255, 0.3))";
            toTokenDisplay.style.color = "color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent)";
          }
          return;
        }
        const toTokenAddressInput = document.getElementById("monadToTokenAddress") as HTMLInputElement;
        const toTokenDisplay = document.getElementById("monadToTokenDisplay");
        if (toTokenAddressInput && toTokenDisplay) {
          updateTokenDisplay(selectedValue, toTokenDisplay, toTokenAddressInput, false);
          // Clear search input
          if (toSearch) toSearch.value = "";
          if (toList) toList.style.display = "none";
          // Trigger auto-quote after a delay (only if params changed)
          clearTimeout(autoQuoteTimer);
          autoQuoteTimer = setTimeout(() => {
            fetchQuoteAuto();
          }, 1000);
        }
      } catch (error) {
        console.error("[Monad Swap] Error in to dropdown handler:", error);
      }
    });
  }

  // Handle manual contract address input for "From"
  if (fromSearch) {
    fromSearch.addEventListener("blur", (e) => {
      const value = (e.target as HTMLInputElement).value.trim();
      if (value && value.startsWith("0x") && value.length === 42) {
        const fromTokenAddressInput = document.getElementById("monadFromTokenAddress") as HTMLInputElement;
        const fromTokenDisplay = document.getElementById("monadFromTokenDisplay");
        if (fromTokenAddressInput && fromTokenDisplay) {
          updateTokenDisplay(value, fromTokenDisplay, fromTokenAddressInput, true);
          // Reset dropdown
          if (fromDropdown) fromDropdown.value = "";
          // Trigger auto-quote
          clearTimeout(autoQuoteTimer);
          autoQuoteTimer = setTimeout(() => {
            fetchQuoteAuto();
          }, 500);
        }
      }
    });
  }

  // Handle manual contract address input for "To"
  if (toSearch) {
    toSearch.addEventListener("blur", (e) => {
      const value = (e.target as HTMLInputElement).value.trim();
      if (value && value.startsWith("0x") && value.length === 42) {
        const toTokenAddressInput = document.getElementById("monadToTokenAddress") as HTMLInputElement;
        const toTokenDisplay = document.getElementById("monadToTokenDisplay");
        if (toTokenAddressInput && toTokenDisplay) {
          updateTokenDisplay(value, toTokenDisplay, toTokenAddressInput, false);
          // Reset dropdown
          if (toDropdown) toDropdown.value = "";
          // Trigger auto-quote
          clearTimeout(autoQuoteTimer);
          autoQuoteTimer = setTimeout(() => {
            fetchQuoteAuto();
          }, 500);
        }
      }
    });
  }

  // Helper to search tokens
  const searchTokensLocal = (query: string): any[] => {
    if (!tokensLoaded || query.length < 1) return [];
    const lowerQuery = query.toLowerCase();
    return allTokens.filter((token: any) => {
      const symbol = (token.symbol || "").toLowerCase();
      const name = (token.name || "").toLowerCase();
      const address = (token.token || "").toLowerCase();
      return symbol.includes(lowerQuery) || name.includes(lowerQuery) || address.includes(lowerQuery);
    }).slice(0, 10);
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
      const tokens = searchTokensLocal(query);
      
      if (fromList) {
        fromList.innerHTML = "";
        
        if (tokens.length > 0) {
          tokens.forEach((token: any) => {
            const item = document.createElement("div");
            item.style.cssText = "padding: 8px; cursor: pointer; border-bottom: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.3)) 50%, transparent); display: flex; align-items: center; gap: 8px; transition: background 0.2s ease;";
            item.onmouseover = () => item.style.background = "color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent)";
            item.onmouseout = () => item.style.background = "transparent";

            const logoUrl = token.logo && !token.logo.startsWith("data:") ? token.logo : null;
            let content = "";
            if (logoUrl) {
              content += `<img src="${escapeHtml(logoUrl)}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: contain;" onerror="this.style.display='none';">`;
            } else {
              content += `<div style="width: 24px; height: 24px; border-radius: 50%; background: color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent); display: flex; align-items: center; justify-content: center; font-size: 12px;">🔷</div>`;
            }
            content += `<div style="flex: 1;"><div style="font-weight: bold; color: var(--palette-text, #ffffff);">${escapeHtml(token.symbol || "Unknown")}</div><div style="font-size: 12px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);">${escapeHtml(token.name || "Unknown")}</div></div>`;
            if (token.verified) {
              content += `<span style="color: var(--palette-success, #16c782); font-size: 12px;">✅</span>`;
            }

            item.innerHTML = content;

            item.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              const fromTokenAddressInput = document.getElementById("monadFromTokenAddress") as HTMLInputElement;
              const fromTokenDisplay = document.getElementById("monadFromTokenDisplay");
              if (fromTokenAddressInput && fromTokenDisplay) {
                const tokenId = token.token || "native";
                updateTokenDisplay(tokenId, fromTokenDisplay, fromTokenAddressInput, true);
                // Update dropdown to match
                if (fromDropdown) fromDropdown.value = tokenId;
                // Trigger auto-quote
                clearTimeout(autoQuoteTimer);
                autoQuoteTimer = setTimeout(() => {
                  fetchQuoteAuto();
                }, 500);
              }

              fromSearch.value = "";
              if (fromList) fromList.style.display = "none";
            });

            fromList.appendChild(item);
          });
        } else {
          fromList.innerHTML = '<div style="padding: 8px; color: color-mix(in srgb, var(--palette-text, #ffffff) 50%, transparent);">No results found</div>';
        }
        fromList.style.display = "block";
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
      const tokens = searchTokensLocal(query);
      
      if (toList) {
        toList.innerHTML = "";
        
        if (tokens.length > 0) {
          tokens.forEach((token: any) => {
            const item = document.createElement("div");
            item.style.cssText = "padding: 8px; cursor: pointer; border-bottom: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.3)) 50%, transparent); display: flex; align-items: center; gap: 8px; transition: background 0.2s ease;";
            item.onmouseover = () => item.style.background = "color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent)";
            item.onmouseout = () => item.style.background = "transparent";

            const logoUrl = token.logo && !token.logo.startsWith("data:") ? token.logo : null;
            let content = "";
            if (logoUrl) {
              content += `<img src="${escapeHtml(logoUrl)}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: contain;" onerror="this.style.display='none';">`;
            } else {
              content += `<div style="width: 24px; height: 24px; border-radius: 50%; background: color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent); display: flex; align-items: center; justify-content: center; font-size: 12px;">🔷</div>`;
            }
            content += `<div style="flex: 1;"><div style="font-weight: bold; color: var(--palette-text, #ffffff);">${escapeHtml(token.symbol || "Unknown")}</div><div style="font-size: 12px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);">${escapeHtml(token.name || "Unknown")}</div></div>`;
            if (token.verified) {
              content += `<span style="color: var(--palette-success, #16c782); font-size: 12px;">✅</span>`;
            }

            item.innerHTML = content;

            item.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              const toTokenAddressInput = document.getElementById("monadToTokenAddress") as HTMLInputElement;
              const toTokenDisplay = document.getElementById("monadToTokenDisplay");
              if (toTokenAddressInput && toTokenDisplay) {
                const tokenId = token.token || "";
                updateTokenDisplay(tokenId, toTokenDisplay, toTokenAddressInput, false);
                // Update dropdown to match
                if (toDropdown) toDropdown.value = tokenId;
                // Trigger auto-quote
                clearTimeout(autoQuoteTimer);
                autoQuoteTimer = setTimeout(() => {
                  fetchQuoteAuto();
                }, 500);
              }

              toSearch.value = "";
              if (toList) toList.style.display = "none";
            });

            toList.appendChild(item);
          });
        } else {
          toList.innerHTML = '<div style="padding: 8px; color: color-mix(in srgb, var(--palette-text, #ffffff) 50%, transparent);">No results found</div>';
        }
        toList.style.display = "block";
      }
    }, 300);
  });

  // Auto-fetch quote when tokens and amount are available
  const fetchQuoteAuto = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingQuote) {
      console.log("[Monad Swap] Quote fetch already in progress, skipping");
      return;
    }

    try {
      // Re-get elements to ensure they still exist
      const fromTokenInput = document.getElementById("monadFromTokenAddress") as HTMLInputElement;
      const toTokenInput = document.getElementById("monadToTokenAddress") as HTMLInputElement;
      const amountInput = document.getElementById("monadSwapAmount") as HTMLInputElement;
      const quoteDisplayEl = document.getElementById("monadQuoteDisplay");
      const quoteContentEl = document.getElementById("monadQuoteContent");

      if (!fromTokenInput || !toTokenInput || !amountInput || !quoteDisplayEl || !quoteContentEl) {
        console.warn("[Monad Swap] Elements not found, skipping quote fetch");
        return;
      }

      const fromToken = fromTokenInput.value || "native";
      const toToken = toTokenInput.value;
      const amount = amountInput.value;

      // Check if params have changed - if not, don't refetch
      const currentParams = { fromToken, toToken, amount };
      if (lastQuoteParams && 
          lastQuoteParams.fromToken === currentParams.fromToken &&
          lastQuoteParams.toToken === currentParams.toToken &&
          lastQuoteParams.amount === currentParams.amount) {
        console.log("[Monad Swap] Quote params unchanged, keeping existing quote");
        return;
      }

      if (!toToken || !amount || parseFloat(amount) <= 0) {
        // Show placeholder
        quoteContentEl.innerHTML = '<div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">Select tokens and enter amount to see quote</div>';
        quoteDisplayEl.style.display = "block";
        lastQuoteParams = null; // Reset since we don't have valid params
        return;
      }

      // Mark as fetching
      isFetchingQuote = true;

      // Show loading state
      quoteContentEl.innerHTML = '<div style="color: var(--palette-primary, #00d4ff);">⏳ Fetching quote...</div>';
      quoteDisplayEl.style.display = "block";

      const response = await fetch("/api/mace/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inToken: fromToken,
          outToken: toToken,
          lastNSeconds: 60,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.statusText} - ${errorText}`);
      }

      const quote = await response.json();

      // Re-get elements again after async operation
      const quoteDisplayAfter = document.getElementById("monadQuoteDisplay");
      const quoteContentAfter = document.getElementById("monadQuoteContent");
      
      if (!quoteDisplayAfter || !quoteContentAfter) {
        console.warn("[Monad Swap] Quote display elements disappeared");
        return;
      }

      const inputAmount = parseFloat(amount);
      const rate = quote.average || 0;
      const outputAmount = inputAmount * rate;

      // Get token symbols for display
      const fromTokenData = allTokens.find((t: any) => t.token === fromToken || (fromToken === "native" && (t.token === "native" || t.symbol === "MON")));
      const toTokenData = allTokens.find((t: any) => t.token === toToken || (toToken === "native" && (t.token === "native" || t.symbol === "MON")));
      const fromSymbol = fromTokenData?.symbol || (fromToken === "native" ? "MON" : "");
      const toSymbol = toTokenData?.symbol || (toToken === "native" ? "MON" : "");

      quoteContentAfter.innerHTML = `
        <div style="margin-bottom: 8px;">
          <strong style="color: var(--palette-text, #ffffff);">Rate:</strong> <span style="color: var(--palette-primary, #00d4ff);">1 ${fromSymbol} = ${rate.toFixed(6)} ${toSymbol}</span>
        </div>
        <div style="margin-bottom: 8px;">
          <strong style="color: var(--palette-text, #ffffff);">Input:</strong> <span style="color: var(--palette-text, #e0e0e0);">${amount} ${fromSymbol}</span>
        </div>
        <div style="margin-bottom: 8px; padding: 8px; background: color-mix(in srgb, var(--palette-success, #16c782) 15%, transparent); border-radius: 4px; border-left: 3px solid var(--palette-success, #16c782);">
          <strong style="color: var(--palette-text, #ffffff);">Expected Output:</strong> <span style="color: var(--palette-success, #16c782); font-size: 14px; font-weight: bold;">${outputAmount.toFixed(6)} ${toSymbol}</span>
        </div>
        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.3)) 50%, transparent);">
          <div style="margin-bottom: 4px; font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);">
            <strong>Min:</strong> ${quote.minimum?.toFixed(6) || "N/A"} | 
            <strong>Max:</strong> ${quote.maximum?.toFixed(6) || "N/A"} | 
            <strong>Median:</strong> ${quote.median?.toFixed(6) || "N/A"}
          </div>
          ${quote.stale ? '<div style="color: var(--palette-warning, #f2b705); margin-top: 8px; font-size: 11px;">⚠️ Data may be stale</div>' : ""}
        </div>
      `;
      // Force display to stay visible with !important
      quoteDisplayAfter.style.setProperty("display", "block", "important");
      quoteDisplayAfter.style.setProperty("visibility", "visible", "important");
      quoteDisplayAfter.style.setProperty("opacity", "1", "important");
      // Don't scroll, just keep it visible - removed scrollIntoView to prevent issues
      
      // Save successful quote params
      lastQuoteParams = { fromToken, toToken, amount };
    } catch (error) {
      // Show error in quote display
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[Monad Swap] Auto-quote error:", error);
      const quoteDisplayErr = document.getElementById("monadQuoteDisplay");
      const quoteContentErr = document.getElementById("monadQuoteContent");
      if (quoteDisplayErr && quoteContentErr) {
        quoteContentErr.innerHTML = `<div style="color: var(--palette-error, #ff6666);">❌ Failed to fetch quote: ${escapeHtml(errorMsg)}</div>`;
        quoteDisplayErr.style.display = "block";
      }
      lastQuoteParams = null; // Reset on error
    } finally {
      // Always reset fetching flag
      isFetchingQuote = false;
    }
  };

  // Auto-quote when amount changes
  const amountInput = document.getElementById("monadSwapAmount") as HTMLInputElement;
  if (amountInput) {
    amountInput.addEventListener("input", () => {
      // Reset last quote params so it will refetch when amount changes
      lastQuoteParams = null;
      clearTimeout(autoQuoteTimer);
      autoQuoteTimer = setTimeout(() => {
        fetchQuoteAuto();
      }, 1000);
    });
  }

  // Auto-quote is already handled by dropdown change handlers above
  // No need for separate setup

  // Swap button handler
  if (swapBtn) {
    swapBtn.addEventListener("click", async () => {
      const fromTokenInput = document.getElementById("monadFromTokenAddress") as HTMLInputElement;
      const toTokenInput = document.getElementById("monadToTokenAddress") as HTMLInputElement;
      const amountInput = document.getElementById("monadSwapAmount") as HTMLInputElement;

      const fromToken = fromTokenInput?.value || "native";
      const toToken = toTokenInput?.value;
      const amount = amountInput?.value;

      if (!toToken) {
        context.log("❌ Please select a 'To' token", "error");
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        context.log("❌ Please enter a valid amount", "error");
        return;
      }

      try {
        swapBtn.textContent = "Finding Routes...";
        swapBtn.disabled = true;

        // Get token decimals (default to 18)
        const fromTokenData = allTokens.find((t: any) => t.token === fromToken || (fromToken === "native" && (t.token === "native" || t.symbol === "MON")));
        const toTokenData = allTokens.find((t: any) => t.token === toToken || (toToken === "native" && (t.token === "native" || t.symbol === "MON")));
        const fromDecimals = fromTokenData?.decimals || 18;
        const toDecimals = toTokenData?.decimals || 18;

        const amountWei = parseUnits(amount, fromDecimals).toString();

        // Get routes via API proxy
        const routesResponse = await fetch("/api/mace/routes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            in: [{ token: fromToken, amount: amountWei }],
            out: [{ token: toToken }],
            maxRoutes: 3,
            from: context.wallet?.state?.address || null,
            solver: {
              includeTransactionInfo: true,
            },
          }),
        });

        if (!routesResponse.ok) {
          throw new Error(`API error: ${routesResponse.statusText}`);
        }

        const routes = await routesResponse.json();

        if (!routes.routes || routes.routes.length === 0) {
          context.log("❌ No swap routes found", "error");
          if (quoteDisplay && quoteContent) {
            quoteContent.innerHTML = '<div style="color: var(--palette-error, #ff6666);">❌ No swap routes found</div>';
            quoteDisplay.style.setProperty("display", "block", "important");
          }
          return;
        }

        // Automatically execute the best route (first route)
        const bestRoute = routes.routes[0];
        
        if (!bestRoute.transaction || !bestRoute.transaction.data) {
          context.log("❌ Best route has no transaction data", "error");
          if (quoteDisplay && quoteContent) {
            quoteContent.innerHTML = '<div style="color: var(--palette-error, #ff6666);">❌ Best route has no transaction data available</div>';
            quoteDisplay.style.setProperty("display", "block", "important");
          }
          return;
        }

        // Show executing message
        const fromSymbol = fromTokenData?.symbol || (fromToken === "native" ? "MON" : "");
        const toSymbol = toTokenData?.symbol || (toToken === "native" ? "MON" : "");
        
        // Update UI to show executing
        if (quoteDisplay && quoteContent) {
          const output = bestRoute.expectedOut?.[0];
          const outputAmount = output ? formatTokenAmount(output.amount, toDecimals) : "N/A";
          
          quoteContent.innerHTML = `
            <div style="margin-bottom: 12px; padding: 12px; background: color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent); border-radius: 8px; border-left: 3px solid var(--palette-primary, #00d4ff);">
              <div style="font-weight: 600; color: var(--palette-primary, #00d4ff); margin-bottom: 8px; font-size: 14px;">🔄 Executing Best Route</div>
              <div style="font-size: 12px; color: var(--palette-text, #e0e0e0); margin-bottom: 4px;">
                <strong>Expected Output:</strong> <span style="color: var(--palette-success, #16c782); font-weight: bold;">${outputAmount} ${toSymbol}</span>
              </div>
              <div style="font-size: 12px; color: var(--palette-text, #e0e0e0);">
                <strong>Gas:</strong> ${bestRoute.gasConsumed?.toLocaleString() || "N/A"} units
              </div>
            </div>
            <div style="color: var(--palette-primary, #00d4ff); font-size: 12px; text-align: center; padding: 8px;">
              ⏳ Sending transaction to wallet...
            </div>
          `;
          quoteDisplay.style.setProperty("display", "block", "important");
        }

        // Execute the best route
        await executeSwapRoute(bestRoute, context, fromSymbol, toSymbol, toDecimals, fromToken, amount);
      } catch (error) {
        context.log(`❌ Failed to find swap routes: ${error instanceof Error ? error.message : String(error)}`, "error");
      } finally {
        // Always re-enable the button to keep interface interactive
        if (swapBtn) {
          swapBtn.textContent = "Execute Swap";
          swapBtn.disabled = false;
        }
      }
    });
  }

  // Add click outside handler to close search dropdowns
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest("#monadFromSearch") && !target.closest("#monadFromList")) {
      if (fromList) fromList.style.display = "none";
    }
    if (!target.closest("#monadToSearch") && !target.closest("#monadToList")) {
      if (toList) toList.style.display = "none";
    }
  });
}

/**
 * Execute a swap route transaction
 */
async function executeSwapRoute(
  route: any,
  context: CommandContext,
  fromSymbol: string,
  toSymbol: string,
  toDecimals: number,
  fromToken?: string,
  amount?: string
): Promise<void> {
  if (!route.transaction || !route.transaction.data) {
    context.log("❌ No transaction data available for this route", "error");
    return;
  }

  if (!context.wallet?.state?.isConnected) {
    context.log("❌ Wallet not connected", "error");
    return;
  }

  try {
    context.log("", "output");
    context.log("🔄 Executing swap transaction...", "info");
    context.log(`   Router: ${route.transaction.to}`, "output");
    
    const signer = await context.wallet.getSigner();
    if (!signer || !signer.provider) {
      context.log("❌ Failed to obtain signer for transaction", "error");
      return;
    }

    // Check balance if native token is involved
    const value = BigInt(route.transaction.value || "0x0");
    if (value > 0n) {
      const balance = await signer.provider.getBalance(context.wallet.state.address);
      if (balance < value) {
        const balanceEth = formatEther(balance);
        const valueEth = formatEther(value);
        context.log("", "output");
        context.log(`❌ Insufficient balance`, "error");
        context.log(`   Required: ${valueEth} MON`, "error");
        context.log(`   Available: ${balanceEth} MON`, "error");
        
        const quoteDisplay = document.getElementById("monadQuoteDisplay");
        const quoteContent = document.getElementById("monadQuoteContent");
        if (quoteDisplay && quoteContent) {
          quoteContent.innerHTML = `
            <div style="padding: 12px; background: color-mix(in srgb, var(--palette-error, #ff6666) 15%, transparent); border-radius: 8px; border-left: 3px solid var(--palette-error, #ff6666);">
              <div style="font-weight: 600; color: var(--palette-error, #ff6666); margin-bottom: 8px; font-size: 14px;">❌ Insufficient Balance</div>
              <div style="font-size: 12px; color: var(--palette-text, #e0e0e0); margin-bottom: 4px;">
                <strong>Required:</strong> ${valueEth} MON
              </div>
              <div style="font-size: 12px; color: var(--palette-text, #e0e0e0);">
                <strong>Available:</strong> ${balanceEth} MON
              </div>
            </div>
          `;
          quoteDisplay.style.setProperty("display", "block", "important");
        }
        return;
      }
    }

    // Prepare transaction with gas limit override
    const txRequest: any = {
      to: route.transaction.to,
      data: route.transaction.data,
      value: route.transaction.value || "0x0",
    };

    // Try to estimate gas, but don't fail if it errors
    try {
      const estimatedGas = await signer.estimateGas(txRequest);
      txRequest.gasLimit = estimatedGas + (estimatedGas / 10n); // Add 10% buffer
      context.log(`   Estimated gas: ${estimatedGas.toString()}`, "output");
    } catch (gasError: any) {
      console.warn("[Monad Swap] Gas estimation failed, using default:", gasError);
      // Use a reasonable default gas limit (500k)
      txRequest.gasLimit = 500000n;
      context.log(`   Using default gas limit: 500,000`, "output");
    }

    context.log("   Sending transaction to wallet for approval...", "info");
    
    // Send transaction
    const tx = await signer.sendTransaction(txRequest);
    
    context.log("", "output");
    context.log(`✅ Transaction sent: ${tx.hash}`, "success");
    context.log("   Waiting for confirmation...", "info");

    // Wait for confirmation
    const receipt = await tx.wait();
    
    context.log("", "output");
    context.log(`✅ Transaction confirmed in block ${receipt.blockNumber || "unknown"}`, "success");
    
    if (route.expectedOut && route.expectedOut.length > 0) {
      const output = route.expectedOut[0];
      const outputAmount = formatTokenAmount(output.amount, toDecimals);
      context.log(`   Expected output: ${outputAmount} ${toSymbol}`, "output");
    }

    // Update quote display to show success
    const quoteDisplay = document.getElementById("monadQuoteDisplay");
    const quoteContent = document.getElementById("monadQuoteContent");
    if (quoteDisplay && quoteContent) {
      const output = route.expectedOut?.[0];
      const outputAmount = output ? formatTokenAmount(output.amount, toDecimals) : "N/A";
      quoteContent.innerHTML = `
        <div style="margin-bottom: 12px; padding: 12px; background: color-mix(in srgb, var(--palette-success, #16c782) 15%, transparent); border-radius: 8px; border-left: 3px solid var(--palette-success, #16c782);">
          <div style="font-weight: 600; color: var(--palette-success, #16c782); margin-bottom: 8px; font-size: 14px;">✅ Swap Executed Successfully</div>
          <div style="font-size: 12px; color: var(--palette-text, #e0e0e0); margin-bottom: 4px;">
            <strong>Transaction:</strong> <span style="font-family: monospace; color: var(--palette-primary, #00d4ff);">${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}</span>
          </div>
          <div style="font-size: 12px; color: var(--palette-text, #e0e0e0); margin-bottom: 4px;">
            <strong>Block:</strong> ${receipt.blockNumber || "unknown"}
          </div>
          <div style="font-size: 12px; color: var(--palette-text, #e0e0e0);">
            <strong>Expected Output:</strong> <span style="color: var(--palette-success, #16c782); font-weight: bold;">${outputAmount} ${toSymbol}</span>
          </div>
        </div>
      `;
      quoteDisplay.style.setProperty("display", "block", "important");
    }

  } catch (error: any) {
    let errorMsg = error?.message || String(error);
    let userFriendlyMsg = errorMsg;

    // Provide more user-friendly error messages
    if (errorMsg.includes("missing revert data") || errorMsg.includes("CALL_EXCEPTION")) {
      userFriendlyMsg = "Transaction would fail on-chain. Possible reasons:\n• Insufficient token balance\n• Token approval needed\n• Slippage too high\n• Route no longer valid";
    } else if (errorMsg.includes("insufficient funds") || errorMsg.includes("balance")) {
      userFriendlyMsg = "Insufficient balance for this transaction";
    } else if (errorMsg.includes("user rejected") || errorMsg.includes("denied")) {
      userFriendlyMsg = "Transaction rejected by user";
    } else if (errorMsg.includes("nonce")) {
      userFriendlyMsg = "Transaction nonce error. Please try again.";
    }

    context.log("", "output");
    context.log(`❌ Transaction failed: ${userFriendlyMsg}`, "error");
    if (errorMsg !== userFriendlyMsg) {
      context.log(`   Technical details: ${errorMsg}`, "output");
    }
    
    // Show error in quote display
    const quoteDisplay = document.getElementById("monadQuoteDisplay");
    const quoteContent = document.getElementById("monadQuoteContent");
    if (quoteDisplay && quoteContent) {
      const errorLines = userFriendlyMsg.split('\n').map(line => escapeHtml(line));
      quoteContent.innerHTML = `
        <div style="padding: 12px; background: color-mix(in srgb, var(--palette-error, #ff6666) 15%, transparent); border-radius: 8px; border-left: 3px solid var(--palette-error, #ff6666);">
          <div style="font-weight: 600; color: var(--palette-error, #ff6666); margin-bottom: 8px; font-size: 14px;">❌ Swap Failed</div>
          <div style="font-size: 12px; color: var(--palette-text, #e0e0e0); line-height: 1.6;">
            ${errorLines.map(line => `<div>${line}</div>`).join("")}
          </div>
          ${errorMsg !== userFriendlyMsg ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid color-mix(in srgb, var(--palette-error, #ff6666) 30%, transparent); font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);">
              <strong>Details:</strong> ${escapeHtml(errorMsg.substring(0, 200))}
            </div>
          ` : ""}
        </div>
      `;
      quoteDisplay.style.setProperty("display", "block", "important");
    }
  }
}

export const monadCommands: Command[] = [monadCommand];
