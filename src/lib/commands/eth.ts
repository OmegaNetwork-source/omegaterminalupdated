/**
 * Ethereum Commands
 * Comprehensive Ethereum network commands including Uniswap, NFTs, tokens, and wallet operations
 */

import type { Command, CommandContext } from "@/types/commands";
import { config } from "@/lib/config";
import { createCommandLine, createUsageError } from "./command-output-helpers";
import { Contract, parseUnits, formatUnits } from "ethers";

/**
 * Ethereum command - Main router for Ethereum-specific features
 */
export const ethCommand: Command = {
  name: "eth",
  description: "Ethereum network commands (Uniswap, NFTs, tokens, wallet)",
  usage: "eth <uniswap|nft|token|wallet|balance|collections|help> [params]",
  category: "ethereum",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showEthHelp(context);
      return;
    }

    switch (subcommand) {
      case "uniswap":
      case "uni":
        await handleUniswap(context, args);
        break;
      case "nft":
        await handleNFT(context, args);
        break;
      case "token":
        await handleToken(context, args);
        break;
      case "wallet":
        await handleWallet(context, args);
        break;
      case "balance":
        await handleBalance(context, args);
        break;
      case "collections":
        await showEthCollections(context, args);
        break;
      default:
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
              <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Unknown Ethereum command</div>
              <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">Command: eth ${subcommand}</div>
              <div style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
                💡 Type ${createCommandLine("eth help", "eth help")} for available commands
              </div>
            </div>
          </div>
        `;
        context.logHtml(errorHtml);
    }
  },
};

function showEthHelp(context: CommandContext): void {
  const helpHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        font-size: 20px;
        font-weight: 700;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 24px;
        text-align: center;
        text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
      ">
        ╔════════════════════════════════════════╗<br/>
        ║     ETHEREUM NETWORK COMMANDS          ║<br/>
        ╚════════════════════════════════════════╝
      </div>

      <!-- Uniswap Section -->
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent) 100%);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
      ">
        <div style="
          font-size: 16px;
          font-weight: 600;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          🔄 Uniswap Trading
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
          ${createCommandLine("eth uniswap quote <tokenIn> <tokenOut> <amount>", "Get swap quote")}
          ${createCommandLine("eth uniswap swap", "Open swap interface")}
          ${createCommandLine("eth uniswap pools", "View top liquidity pools")}
          ${createCommandLine("eth uniswap tokens", "Browse popular tokens")}
          ${createCommandLine("eth uniswap price <token>", "Get token price")}
        </div>
      </div>

      <!-- NFT Section -->
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-warning, #ffa502) 8%, transparent) 0%, color-mix(in srgb, var(--palette-warning, #ffa502) 5%, transparent) 100%);
        border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 20%, transparent);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
      ">
        <div style="
          font-size: 16px;
          font-weight: 600;
          color: var(--palette-warning, #ffa502);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          🖼️ NFT Operations
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
          ${createCommandLine("eth nft deploy", "Deploy NFT collection")}
          ${createCommandLine("eth nft mint <collection>", "Mint NFT")}
          ${createCommandLine("eth collections [limit]", "View top collections")}
          ${createCommandLine("eth nft my", "View your NFTs")}
        </div>
      </div>

      <!-- Token Section -->
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-secondary, #00ff88) 8%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent) 100%);
        border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 20%, transparent);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
      ">
        <div style="
          font-size: 16px;
          font-weight: 600;
          color: var(--palette-secondary, #00ff88);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          🪙 Token Operations
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
          ${createCommandLine("eth token deploy", "Deploy ERC20 token")}
          ${createCommandLine("eth token info <address>", "View token info")}
          ${createCommandLine("eth token balance <address>", "Check token balance")}
        </div>
      </div>

      <!-- Wallet Section -->
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-accent, #ff00ff) 8%, transparent) 0%, color-mix(in srgb, var(--palette-accent, #ff00ff) 5%, transparent) 100%);
        border: 1px solid color-mix(in srgb, var(--palette-accent, #ff00ff) 20%, transparent);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
      ">
        <div style="
          font-size: 16px;
          font-weight: 600;
          color: var(--palette-accent, #ff00ff);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          💼 Wallet & Balance
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
          ${createCommandLine("eth wallet", "View wallet info")}
          ${createCommandLine("eth balance [address]", "Check ETH balance")}
          ${createCommandLine("eth balance tokens [address]", "Check token balances")}
        </div>
      </div>

      <!-- Examples -->
      <div style="
        background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
        border-radius: 12px;
        padding: 16px;
        margin-top: 20px;
      ">
        <div style="
          font-size: 14px;
          font-weight: 600;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 12px;
        ">
          💡 Examples
        </div>
        <div style="font-size: 12px; color: var(--palette-text, #e0e0e0); line-height: 1.8;">
          ${createCommandLine("eth uniswap quote USDC WETH 1000", "Get USDC → WETH quote")}<br/>
          ${createCommandLine("eth nft deploy", "Deploy new NFT collection")}<br/>
          ${createCommandLine("eth token deploy", "Deploy ERC20 token")}<br/>
          ${createCommandLine("eth balance", "Check your ETH balance")}
        </div>
      </div>
    </div>
  `;
  context.logHtml(helpHtml);
}

async function showEthCollections(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const limit = parseInt(args[2]) || 10;

  context.log(`📊 Fetching top ${limit} Ethereum NFT collections...`, "info");
  context.log("🔗 Using Magic Eden API", "info");

  try {
    // Fetch from Magic Eden API via relayer
    const response = await fetch(
      `${config.RELAYER_URL}/magiceden/v2/eth/collections?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      context.log("❌ No collections found", "warning");
      return;
    }

    context.log("", "info");
    context.log(
      `✅ TOP ${Math.min(limit, data.length)} ETHEREUM NFT COLLECTIONS`,
      "success"
    );
    context.log("═══════════════════════════════════════", "output");
    context.log("", "info");

    data.slice(0, limit).forEach((collection: any, index: number) => {
      const name = collection.name || "Unknown Collection";
      const symbol = collection.symbol || "";
      const floorPrice = collection.floorPrice
        ? `${collection.floorPrice.toFixed(4)} ETH`
        : "N/A";
      const volume24h = collection.volume24h
        ? `${collection.volume24h.toFixed(2)} ETH`
        : "N/A";
      const image = collection.image || "";

      const html = `
        <div style="margin: 12px 0; padding: 16px; background: rgba(0, 188, 242, 0.05); border: 1px solid rgba(0, 188, 242, 0.3); border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${
              image
                ? `<img src="${image}" style="width: 48px; height: 48px; border-radius: 8px; background: #222;">`
                : ""
            }
            <div style="flex: 1;">
              <div style="font-size: 16px; font-weight: bold; color: #00bcf2; margin-bottom: 4px;">
                ${index + 1}. ${name} ${symbol ? `(${symbol})` : ""}
              </div>
              <div style="display: flex; gap: 20px; font-size: 13px;">
                <div>
                  <span style="color: #888;">Floor:</span> 
                  <span style="color: #00ff88; font-weight: bold;">${floorPrice}</span>
                </div>
                <div>
                  <span style="color: #888;">24h Vol:</span> 
                  <span style="color: #00bcf2; font-weight: bold;">${volume24h}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      context.logHtml(html);
    });

    context.log("", "info");
    context.log("💡 Data from Magic Eden Ethereum marketplace", "info");
  } catch (error: any) {
    context.log(`❌ Error fetching collections: ${error.message}`, "error");
    context.log("", "info");
    context.log(
      "💡 Make sure relayer is running with Magic Eden API proxy",
      "warning"
    );
  }
}

// ============================================
// UNISWAP HANDLERS
// ============================================

async function handleUniswap(context: CommandContext, args: string[]): Promise<void> {
  const action = args[2]?.toLowerCase();
  
  if (!action || action === "help") {
    const helpHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          font-size: 18px;
          font-weight: 700;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 20px;
        ">
          🔄 Uniswap Trading Commands
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
          ${createCommandLine("eth uniswap quote <tokenIn> <tokenOut> <amount>", "Get swap quote")}
          ${createCommandLine("eth uniswap swap", "Open swap interface")}
          ${createCommandLine("eth uniswap pools [limit]", "View top liquidity pools")}
          ${createCommandLine("eth uniswap tokens [limit]", "Browse popular tokens")}
          ${createCommandLine("eth uniswap price <token>", "Get token price")}
        </div>
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  switch (action) {
    case "quote":
      await handleUniswapQuote(context, args);
      break;
    case "swap":
      await handleUniswapSwap(context, args);
      break;
    case "pools":
      await handleUniswapPools(context, args);
      break;
    case "tokens":
      await handleUniswapTokens(context, args);
      break;
    case "price":
      await handleUniswapPrice(context, args);
      break;
    default:
      const errorHtml = createUsageError("eth uniswap <action>", [
        "eth uniswap quote USDC WETH 1000",
        "eth uniswap pools 20",
        "eth uniswap price USDC"
      ]);
      context.logHtml(errorHtml);
  }
}

async function handleUniswapQuote(context: CommandContext, args: string[]): Promise<void> {
  const tokenIn = args[3];
  const tokenOut = args[4];
  const amount = args[5];

  if (!tokenIn || !tokenOut || !amount) {
    const errorHtml = createUsageError("eth uniswap quote <tokenIn> <tokenOut> <amount>", [
      "eth uniswap quote USDC WETH 1000",
      "eth uniswap quote ETH USDC 1"
    ]);
    context.logHtml(errorHtml);
    return;
  }

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        🔄 Fetching Uniswap quote for ${amount} ${tokenIn} → ${tokenOut}...
      </div>
    </div>
  `;
  context.logHtml(infoHtml);

  try {
    // Use Uniswap API via relayer (or direct API call)
    // For now, we'll use a mock/placeholder that can be connected to real Uniswap API
    const response = await fetch(
      `${config.RELAYER_URL}/uniswap/v3/quote?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amount=${amount}`
    );

    if (!response.ok) {
      // If relayer doesn't have Uniswap endpoint, show helpful message
      const fallbackHtml = `
        <div style="
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          color: var(--palette-text, #e0e0e0);
          padding: 12px;
        ">
          <div style="
            background: color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent);
            border: 1px solid var(--palette-warning, #ffa502);
            border-radius: 8px;
            padding: 16px;
          ">
            <div style="color: var(--palette-warning, #ffa502); font-weight: bold; margin-bottom: 12px;">⚠️ Uniswap Integration</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 12px;">
              Uniswap API integration is being set up. For now, you can:
            </div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; line-height: 1.8;">
              • Visit <a href="https://app.uniswap.org" target="_blank" rel="noopener noreferrer" style="color: var(--palette-primary, #00d4ff); text-decoration: underline;">app.uniswap.org</a> for live trading<br/>
              • Use ${createCommandLine("eth uniswap pools", "eth uniswap pools")} to view liquidity pools<br/>
              • Check ${createCommandLine("eth uniswap price " + tokenIn, "eth uniswap price " + tokenIn)} for token prices
            </div>
          </div>
        </div>
      `;
      context.logHtml(fallbackHtml);
      return;
    }

    const data = await response.json();
    // Display quote data with HTML formatting
    // This would show: amount in, amount out, price impact, route, etc.
  } catch (error: any) {
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching quote</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
  }
}

async function handleUniswapSwap(context: CommandContext, args: string[]): Promise<void> {
  const swapHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 16px;
      ">
        <div style="
          font-size: 18px;
          font-weight: 700;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 20px;
          text-align: center;
        ">
          🔄 Uniswap Swap Interface
        </div>
        <div style="
          background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        ">
          <div style="color: var(--palette-text, #e0e0e0); font-size: 14px; margin-bottom: 16px; text-align: center;">
            To execute swaps on Uniswap, visit the official interface:
          </div>
          <div style="text-align: center; margin-bottom: 16px;">
            <a 
              href="https://app.uniswap.org" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                color: var(--palette-primary, #00d4ff);
                text-decoration: none;
                font-size: 14px;
                padding: 10px 20px;
                border: 2px solid var(--palette-primary, #00d4ff);
                border-radius: 8px;
                display: inline-block;
                font-weight: 600;
                transition: all 0.2s ease;
              "
              onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)';"
              onmouseout="this.style.background = 'transparent';"
            >
              🚀 Open Uniswap →
            </a>
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; text-align: center; line-height: 1.6;">
            💡 Use ${createCommandLine("eth uniswap quote", "eth uniswap quote")} to get swap quotes<br/>
            💡 Use ${createCommandLine("eth uniswap pools", "eth uniswap pools")} to view liquidity pools
          </div>
        </div>
      </div>
    </div>
  `;
  context.logHtml(swapHtml);
}

async function handleUniswapPools(context: CommandContext, args: string[]): Promise<void> {
  const limit = parseInt(args[3]) || 20;
  
  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        📊 Fetching top ${limit} Uniswap liquidity pools...
      </div>
    </div>
  `;
  context.logHtml(infoHtml);

  try {
    // Fetch from Uniswap API or use relayer
    const response = await fetch(
      `${config.RELAYER_URL}/uniswap/v3/pools?limit=${limit}`
    );

    if (!response.ok) {
      // Show helpful fallback
      const fallbackHtml = `
        <div style="
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          color: var(--palette-text, #e0e0e0);
          padding: 12px;
        ">
          <div style="
            background: color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent);
            border: 1px solid var(--palette-warning, #ffa502);
            border-radius: 8px;
            padding: 16px;
          ">
            <div style="color: var(--palette-warning, #ffa502); font-weight: bold; margin-bottom: 12px;">⚠️ Uniswap Pools</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 12px;">
              View top Uniswap pools at:
            </div>
            <div style="text-align: center;">
              <a 
                href="https://info.uniswap.org/#/pools" 
                target="_blank" 
                rel="noopener noreferrer"
                style="
                  color: var(--palette-primary, #00d4ff);
                  text-decoration: none;
                  font-size: 13px;
                  padding: 8px 16px;
                  border: 1px solid var(--palette-primary, #00d4ff);
                  border-radius: 6px;
                  display: inline-block;
                "
              >
                📊 View Uniswap Pools →
              </a>
            </div>
          </div>
        </div>
      `;
      context.logHtml(fallbackHtml);
      return;
    }

    const data = await response.json();
    // Display pools with HTML formatting
  } catch (error: any) {
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching pools</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
  }
}

async function handleUniswapTokens(context: CommandContext, args: string[]): Promise<void> {
  const limit = parseInt(args[3]) || 20;
  
  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        🪙 Fetching popular Uniswap tokens...
      </div>
    </div>
  `;
  context.logHtml(infoHtml);

  // Popular Ethereum tokens for display
  const popularTokens = [
    { symbol: "WETH", name: "Wrapped Ether", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
    { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
    { symbol: "UNI", name: "Uniswap", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" },
    { symbol: "LINK", name: "Chainlink", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA" },
    { symbol: "AAVE", name: "Aave Token", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" },
  ];

  let tokensHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        font-size: 16px;
        font-weight: 700;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
        text-align: center;
      ">
        🪙 Popular Uniswap Tokens
      </div>
  `;

  popularTokens.slice(0, limit).forEach((token, index) => {
    tokensHtml += `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00d4ff) 2%, transparent) 100%);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            width: 40px;
            height: 40px;
            background: color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: var(--palette-primary, #00d4ff);
            font-size: 14px;
          ">${token.symbol.substring(0, 2)}</div>
          <div style="flex: 1;">
            <div style="font-size: 14px; font-weight: 600; color: var(--palette-text, #e0e0e0); margin-bottom: 4px;">
              ${index + 1}. ${token.name} (${token.symbol})
            </div>
            <div style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #e0e0e0) 60%, transparent); font-family: monospace;">
              ${token.address}
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <span 
              class="omega-help-command"
              data-command="eth uniswap price ${token.symbol}"
              style="
                color: var(--palette-secondary, #00ff88);
                font-size: 11px;
                padding: 4px 8px;
                border: 1px solid var(--palette-secondary, #00ff88);
                border-radius: 4px;
                cursor: pointer;
              "
              title="Get ${token.symbol} price"
            >
              Price
            </span>
            <span 
              class="omega-help-command"
              data-command="eth uniswap quote ${token.symbol} WETH 1000"
              style="
                color: var(--palette-primary, #00d4ff);
                font-size: 11px;
                padding: 4px 8px;
                border: 1px solid var(--palette-primary, #00d4ff);
                border-radius: 4px;
                cursor: pointer;
              "
              title="Get quote"
            >
              Quote
            </span>
          </div>
        </div>
      </div>
    `;
  });

  tokensHtml += `
      <div style="
        margin-top: 16px;
        padding: 12px;
        background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
        border-radius: 8px;
        text-align: center;
      ">
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
          💡 Click "Price" or "Quote" buttons above to interact with tokens
        </div>
      </div>
    </div>
  `;
  context.logHtml(tokensHtml);
}

async function handleUniswapPrice(context: CommandContext, args: string[]): Promise<void> {
  const token = args[3];
  
  if (!token) {
    const errorHtml = createUsageError("eth uniswap price <token>", [
      "eth uniswap price USDC",
      "eth uniswap price WETH"
    ]);
    context.logHtml(errorHtml);
    return;
  }

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        💰 Fetching ${token} price...
      </div>
    </div>
  `;
  context.logHtml(infoHtml);

  // For now, show a helpful message with link to Uniswap
  const priceHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent);
        border-radius: 12px;
        padding: 20px;
      ">
        <div style="
          font-size: 16px;
          font-weight: 700;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 16px;
          text-align: center;
        ">
          💰 ${token} Price Information
        </div>
        <div style="
          background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          margin-bottom: 16px;
        ">
          <div style="color: var(--palette-text, #e0e0e0); font-size: 13px; margin-bottom: 12px;">
            View real-time ${token} price and trading data:
          </div>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a 
              href="https://app.uniswap.org" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                color: var(--palette-primary, #00d4ff);
                text-decoration: none;
                font-size: 12px;
                padding: 8px 16px;
                border: 1px solid var(--palette-primary, #00d4ff);
                border-radius: 6px;
                display: inline-block;
              "
            >
              Uniswap →
            </a>
            <a 
              href="https://info.uniswap.org/#/tokens/${token}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                color: var(--palette-secondary, #00ff88);
                text-decoration: none;
                font-size: 12px;
                padding: 8px 16px;
                border: 1px solid var(--palette-secondary, #00ff88);
                border-radius: 6px;
                display: inline-block;
              "
            >
              Token Info →
            </a>
          </div>
        </div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; text-align: center;">
          💡 Use ${createCommandLine("eth uniswap quote " + token + " WETH 1000", "eth uniswap quote " + token + " WETH 1000")} to get swap quotes
        </div>
      </div>
    </div>
  `;
  context.logHtml(priceHtml);
}

// ============================================
// NFT HANDLERS
// ============================================

async function handleNFT(context: CommandContext, args: string[]): Promise<void> {
  const action = args[2]?.toLowerCase();
  
  if (!action || action === "help") {
    const helpHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          font-size: 18px;
          font-weight: 700;
          color: var(--palette-warning, #ffa502);
          margin-bottom: 20px;
        ">
          🖼️ NFT Operations
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
          ${createCommandLine("eth nft deploy", "Deploy NFT collection")}
          ${createCommandLine("eth nft mint <collection>", "Mint NFT to collection")}
          ${createCommandLine("eth nft my", "View your NFTs")}
          ${createCommandLine("eth collections [limit]", "View top collections")}
        </div>
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  switch (action) {
    case "deploy":
      await handleNFTDeploy(context, args);
      break;
    case "mint":
      await handleNFTMint(context, args);
      break;
    case "my":
      await handleNFTMy(context, args);
      break;
    default:
      const errorHtml = createUsageError("eth nft <action>", [
        "eth nft deploy",
        "eth nft mint 0x123...",
        "eth nft my"
      ]);
      context.logHtml(errorHtml);
  }
}

async function handleNFTDeploy(context: CommandContext, args: string[]): Promise<void> {
  if (!context.wallet.state.isConnected || !context.wallet.address) {
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
          padding: 16px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 12px;">❌ Wallet Not Connected</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 12px;">
            Connect your wallet to deploy NFT collections:
          </div>
          <div style="text-align: center;">
            ${createCommandLine("connect", "Connect Wallet")}
          </div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
    return;
  }

  const deployHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent) 0%, color-mix(in srgb, var(--palette-warning, #ffa502) 6%, transparent) 100%);
        border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 25%, transparent);
        border-radius: 12px;
        padding: 24px;
      ">
        <div style="
          font-size: 18px;
          font-weight: 700;
          color: var(--palette-warning, #ffa502);
          margin-bottom: 20px;
          text-align: center;
        ">
          🖼️ Deploy NFT Collection
        </div>
        <div style="
          background: color-mix(in srgb, var(--palette-warning, #ffa502) 5%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 15%, transparent);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        ">
          <div style="color: var(--palette-text, #e0e0e0); font-size: 13px; margin-bottom: 16px;">
            <strong>Collection Details:</strong>
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; line-height: 1.8; margin-bottom: 16px;">
            • Name: [Enter collection name]<br/>
            • Symbol: [Enter collection symbol]<br/>
            • Max Supply: [Enter max supply]<br/>
            • Base URI: [Enter metadata URI]
          </div>
          <div style="
            background: color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
          ">
            <div style="color: var(--palette-primary, #00d4ff); font-weight: 600; margin-bottom: 8px;">📋 Deployment Steps:</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; line-height: 1.8;">
              1. Enter collection name and symbol<br/>
              2. Set maximum supply (or unlimited)<br/>
              3. Configure metadata URI<br/>
              4. Review gas estimate<br/>
              5. Deploy contract
            </div>
          </div>
          <div style="text-align: center; margin-top: 16px;">
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 12px;">
              NFT deployment interface coming soon. For now, use:
            </div>
            <a 
              href="https://www.openzeppelin.com/contracts" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                color: var(--palette-warning, #ffa502);
                text-decoration: none;
                font-size: 13px;
                padding: 10px 20px;
                border: 2px solid var(--palette-warning, #ffa502);
                border-radius: 8px;
                display: inline-block;
                font-weight: 600;
              "
            >
              📚 OpenZeppelin Contracts →
            </a>
          </div>
        </div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; text-align: center; line-height: 1.6;">
          💡 Connected wallet: ${context.wallet.address.substring(0, 6)}...${context.wallet.address.substring(38)}<br/>
          💡 Estimated gas: ~2,000,000 - 3,000,000 gas
        </div>
      </div>
    </div>
  `;
  context.logHtml(deployHtml);
}

async function handleNFTMint(context: CommandContext, args: string[]): Promise<void> {
  const collection = args[3];
  
  if (!collection) {
    const errorHtml = createUsageError("eth nft mint <collection>", [
      "eth nft mint 0x1234...",
      "eth nft mint MyCollection"
    ]);
    context.logHtml(errorHtml);
    return;
  }

  if (!context.wallet.state.isConnected) {
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
          padding: 16px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 12px;">❌ Wallet Not Connected</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 12px;">
            Connect your wallet to mint NFTs:
          </div>
          <div style="text-align: center;">
            ${createCommandLine("connect", "Connect Wallet")}
          </div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
    return;
  }

  const mintHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent) 0%, color-mix(in srgb, var(--palette-warning, #ffa502) 6%, transparent) 100%);
        border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 25%, transparent);
        border-radius: 12px;
        padding: 24px;
      ">
        <div style="
          font-size: 18px;
          font-weight: 700;
          color: var(--palette-warning, #ffa502);
          margin-bottom: 20px;
          text-align: center;
        ">
          🎨 Mint NFT
        </div>
        <div style="
          background: color-mix(in srgb, var(--palette-warning, #ffa502) 5%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 15%, transparent);
          border-radius: 8px;
          padding: 20px;
        ">
          <div style="color: var(--palette-text, #e0e0e0); font-size: 13px; margin-bottom: 12px;">
            <strong>Collection:</strong> ${collection}
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; line-height: 1.8; margin-bottom: 16px;">
            NFT minting interface coming soon. For now, you can:
          </div>
          <div style="text-align: center;">
            <a 
              href="https://opensea.io" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                color: var(--palette-warning, #ffa502);
                text-decoration: none;
                font-size: 13px;
                padding: 10px 20px;
                border: 2px solid var(--palette-warning, #ffa502);
                border-radius: 8px;
                display: inline-block;
                font-weight: 600;
              "
            >
              🖼️ OpenSea →
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
  context.logHtml(mintHtml);
}

async function handleNFTMy(context: CommandContext, args: string[]): Promise<void> {
  if (!context.wallet.state.isConnected || !context.wallet.address) {
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
          padding: 16px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 12px;">❌ Wallet Not Connected</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 12px;">
            Connect your wallet to view your NFTs:
          </div>
          <div style="text-align: center;">
            ${createCommandLine("connect", "Connect Wallet")}
          </div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
    return;
  }

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        🖼️ Fetching your NFTs...
      </div>
    </div>
  `;
  context.logHtml(infoHtml);

  try {
    // Fetch NFTs from OpenSea or other API
    const response = await fetch(
      `${config.RELAYER_URL}/opensea/api/v2/chain/ethereum/account/${context.wallet.address}/nfts`
    );

    if (!response.ok) {
      // Show helpful fallback
      const fallbackHtml = `
        <div style="
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          color: var(--palette-text, #e0e0e0);
          padding: 12px;
        ">
          <div style="
            background: linear-gradient(135deg, color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent) 0%, color-mix(in srgb, var(--palette-warning, #ffa502) 6%, transparent) 100%);
            border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 25%, transparent);
            border-radius: 12px;
            padding: 24px;
          ">
            <div style="
              font-size: 18px;
              font-weight: 700;
              color: var(--palette-warning, #ffa502);
              margin-bottom: 16px;
              text-align: center;
            ">
              🖼️ Your NFTs
            </div>
            <div style="
              background: color-mix(in srgb, var(--palette-warning, #ffa502) 5%, transparent);
              border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 15%, transparent);
              border-radius: 8px;
              padding: 20px;
              text-align: center;
            ">
              <div style="color: var(--palette-text, #e0e0e0); font-size: 13px; margin-bottom: 16px;">
                View your NFTs on OpenSea:
              </div>
              <div style="margin-bottom: 12px;">
                <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; font-family: monospace; margin-bottom: 8px;">
                  ${context.wallet.address}
                </div>
                <a 
                  href="https://opensea.io/${context.wallet.address}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style="
                    color: var(--palette-warning, #ffa502);
                    text-decoration: none;
                    font-size: 13px;
                    padding: 10px 20px;
                    border: 2px solid var(--palette-warning, #ffa502);
                    border-radius: 8px;
                    display: inline-block;
                    font-weight: 600;
                  "
                >
                  🖼️ View on OpenSea →
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      context.logHtml(fallbackHtml);
      return;
    }

    const data = await response.json();
    // Display NFTs with HTML formatting
  } catch (error: any) {
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching NFTs</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
  }
}

// ============================================
// TOKEN HANDLERS
// ============================================

async function handleToken(context: CommandContext, args: string[]): Promise<void> {
  const action = args[2]?.toLowerCase();
  
  if (!action || action === "help") {
    const helpHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          font-size: 18px;
          font-weight: 700;
          color: var(--palette-secondary, #00ff88);
          margin-bottom: 20px;
        ">
          🪙 Token Operations
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
          ${createCommandLine("eth token deploy", "Deploy ERC20 token")}
          ${createCommandLine("eth token info <address>", "View token information")}
          ${createCommandLine("eth token balance <address> [wallet]", "Check token balance")}
        </div>
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  switch (action) {
    case "deploy":
      await handleTokenDeploy(context, args);
      break;
    case "info":
      await handleTokenInfo(context, args);
      break;
    case "balance":
      await handleTokenBalance(context, args);
      break;
    default:
      const errorHtml = createUsageError("eth token <action>", [
        "eth token deploy",
        "eth token info 0x123...",
        "eth token balance 0x123..."
      ]);
      context.logHtml(errorHtml);
  }
}

async function handleTokenDeploy(context: CommandContext, args: string[]): Promise<void> {
  if (!context.wallet.state.isConnected || !context.wallet.address) {
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
          padding: 16px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 12px;">❌ Wallet Not Connected</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 12px;">
            Connect your wallet to deploy tokens:
          </div>
          <div style="text-align: center;">
            ${createCommandLine("connect", "Connect Wallet")}
          </div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
    return;
  }

  const deployHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%);
        border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 25%, transparent);
        border-radius: 12px;
        padding: 24px;
      ">
        <div style="
          font-size: 18px;
          font-weight: 700;
          color: var(--palette-secondary, #00ff88);
          margin-bottom: 20px;
          text-align: center;
        ">
          🪙 Deploy ERC20 Token
        </div>
        <div style="
          background: color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        ">
          <div style="color: var(--palette-text, #e0e0e0); font-size: 13px; margin-bottom: 16px;">
            <strong>Token Parameters:</strong>
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; line-height: 1.8; margin-bottom: 16px;">
            • Name: [Enter token name]<br/>
            • Symbol: [Enter token symbol]<br/>
            • Decimals: [Enter decimals, default: 18]<br/>
            • Initial Supply: [Enter initial supply]
          </div>
          <div style="
            background: color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
          ">
            <div style="color: var(--palette-primary, #00d4ff); font-weight: 600; margin-bottom: 8px;">📋 Deployment Steps:</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; line-height: 1.8;">
              1. Enter token name and symbol<br/>
              2. Set decimals (typically 18)<br/>
              3. Set initial supply<br/>
              4. Review gas estimate (~1,500,000 - 2,000,000 gas)<br/>
              5. Deploy contract
            </div>
          </div>
          <div style="text-align: center; margin-top: 16px;">
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 12px;">
              Token deployment interface coming soon. For now, use:
            </div>
            <a 
              href="https://www.openzeppelin.com/contracts" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                color: var(--palette-secondary, #00ff88);
                text-decoration: none;
                font-size: 13px;
                padding: 10px 20px;
                border: 2px solid var(--palette-secondary, #00ff88);
                border-radius: 8px;
                display: inline-block;
                font-weight: 600;
              "
            >
              📚 OpenZeppelin Contracts →
            </a>
          </div>
        </div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; text-align: center; line-height: 1.6;">
          💡 Connected wallet: ${context.wallet.address.substring(0, 6)}...${context.wallet.address.substring(38)}<br/>
          💡 Estimated gas: ~1,500,000 - 2,000,000 gas
        </div>
      </div>
    </div>
  `;
  context.logHtml(deployHtml);
}

async function handleTokenInfo(context: CommandContext, args: string[]): Promise<void> {
  const address = args[3];
  
  if (!address) {
    const errorHtml = createUsageError("eth token info <address>", [
      "eth token info 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "eth token info 0x6B175474E89094C44Da98b954EedeAC495271d0F"
    ]);
    context.logHtml(errorHtml);
    return;
  }

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        🔍 Fetching token information...
      </div>
    </div>
  `;
  context.logHtml(infoHtml);

  try {
    // Fetch token info from Etherscan or similar
    const provider = context.wallet.getProvider();
    if (!provider) {
      throw new Error("Provider not available");
    }

    // ERC20 standard ABI (name, symbol, decimals, totalSupply)
    const erc20Abi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
    ];

    const tokenContract = new Contract(address, erc20Abi, provider);
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.name().catch(() => "Unknown"),
      tokenContract.symbol().catch(() => "UNKNOWN"),
      tokenContract.decimals().catch(() => 18),
      tokenContract.totalSupply().catch(() => 0),
    ]);

    const tokenInfoHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%);
          border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 25%, transparent);
          border-radius: 12px;
          padding: 24px;
        ">
          <div style="
            font-size: 18px;
            font-weight: 700;
            color: var(--palette-secondary, #00ff88);
            margin-bottom: 20px;
            text-align: center;
          ">
            🪙 Token Information
          </div>
          <div style="
            background: color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 16px;
          ">
            <div style="margin-bottom: 12px;">
              <div style="color: var(--palette-secondary, #00ff88); font-weight: 600; margin-bottom: 4px;">Name:</div>
              <div style="color: var(--palette-text, #e0e0e0); font-size: 14px;">${name}</div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="color: var(--palette-secondary, #00ff88); font-weight: 600; margin-bottom: 4px;">Symbol:</div>
              <div style="color: var(--palette-text, #e0e0e0); font-size: 14px;">${symbol}</div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="color: var(--palette-secondary, #00ff88); font-weight: 600; margin-bottom: 4px;">Decimals:</div>
              <div style="color: var(--palette-text, #e0e0e0); font-size: 14px;">${decimals}</div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="color: var(--palette-secondary, #00ff88); font-weight: 600; margin-bottom: 4px;">Total Supply:</div>
              <div style="color: var(--palette-text, #e0e0e0); font-size: 14px;">${formatUnits(totalSupply, decimals)}</div>
            </div>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 20%, transparent);">
              <div style="color: var(--palette-secondary, #00ff88); font-weight: 600; margin-bottom: 4px;">Contract Address:</div>
              <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; font-family: monospace; word-break: break-all;">${address}</div>
            </div>
          </div>
          <div style="text-align: center;">
            <a 
              href="https://etherscan.io/token/${address}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                color: var(--palette-secondary, #00ff88);
                text-decoration: none;
                font-size: 12px;
                padding: 8px 16px;
                border: 1px solid var(--palette-secondary, #00ff88);
                border-radius: 6px;
                display: inline-block;
              "
            >
              📊 View on Etherscan →
            </a>
          </div>
        </div>
      </div>
    `;
    context.logHtml(tokenInfoHtml);
  } catch (error: any) {
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching token info</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
  }
}

async function handleTokenBalance(context: CommandContext, args: string[]): Promise<void> {
  const tokenAddress = args[3];
  const walletAddress = args[4] || context.wallet.address;
  
  if (!tokenAddress) {
    const errorHtml = createUsageError("eth token balance <tokenAddress> [walletAddress]", [
      "eth token balance 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "eth token balance 0x123... 0x456..."
    ]);
    context.logHtml(errorHtml);
    return;
  }

  if (!walletAddress) {
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
          padding: 16px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 12px;">❌ Wallet Address Required</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            Connect your wallet or provide a wallet address:
          </div>
          <div style="text-align: center; margin-top: 12px;">
            ${createCommandLine("connect", "Connect Wallet")}
          </div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
    return;
  }

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        💰 Fetching token balance...
      </div>
    </div>
  `;
  context.logHtml(infoHtml);

  try {
    const provider = context.wallet.getProvider();
    if (!provider) {
      throw new Error("Provider not available");
    }

    const erc20Abi = [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
    ];

    const tokenContract = new Contract(tokenAddress, erc20Abi, provider);
    const [balance, decimals, symbol] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.decimals().catch(() => 18),
      tokenContract.symbol().catch(() => "TOKEN"),
    ]);

    const formattedBalance = formatUnits(balance, decimals);

    const balanceHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%);
          border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 25%, transparent);
          border-radius: 12px;
          padding: 24px;
        ">
          <div style="
            font-size: 18px;
            font-weight: 700;
            color: var(--palette-secondary, #00ff88);
            margin-bottom: 20px;
            text-align: center;
          ">
            💰 Token Balance
          </div>
          <div style="
            background: color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          ">
            <div style="font-size: 32px; font-weight: 700; color: var(--palette-secondary, #00ff88); margin-bottom: 8px;">
              ${formattedBalance}
            </div>
            <div style="font-size: 16px; color: var(--palette-text, #e0e0e0); margin-bottom: 16px;">
              ${symbol}
            </div>
            <div style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #e0e0e0) 60%, transparent); font-family: monospace; word-break: break-all; margin-top: 16px; padding-top: 16px; border-top: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 20%, transparent);">
              Wallet: ${walletAddress}<br/>
              Token: ${tokenAddress}
            </div>
          </div>
        </div>
      </div>
    `;
    context.logHtml(balanceHtml);
  } catch (error: any) {
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching balance</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
  }
}

// ============================================
// WALLET HANDLERS
// ============================================

async function handleWallet(context: CommandContext, args: string[]): Promise<void> {
  if (!context.wallet.state.isConnected || !context.wallet.address) {
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
          padding: 16px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 12px;">❌ Wallet Not Connected</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 12px;">
            Connect your wallet to view wallet information:
          </div>
          <div style="text-align: center;">
            ${createCommandLine("connect", "Connect Wallet")}
          </div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
    return;
  }

  try {
    const provider = context.wallet.getProvider();
    if (!provider) {
      throw new Error("Provider not available");
    }

    const balance = await provider.getBalance(context.wallet.address);
    const formattedBalance = formatUnits(balance, 18);

    const walletHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-accent, #ff00ff) 10%, transparent) 0%, color-mix(in srgb, var(--palette-accent, #ff00ff) 6%, transparent) 100%);
          border: 1px solid color-mix(in srgb, var(--palette-accent, #ff00ff) 25%, transparent);
          border-radius: 12px;
          padding: 24px;
        ">
          <div style="
            font-size: 18px;
            font-weight: 700;
            color: var(--palette-accent, #ff00ff);
            margin-bottom: 20px;
            text-align: center;
          ">
            💼 Wallet Information
          </div>
          <div style="
            background: color-mix(in srgb, var(--palette-accent, #ff00ff) 5%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-accent, #ff00ff) 15%, transparent);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 16px;
          ">
            <div style="margin-bottom: 16px;">
              <div style="color: var(--palette-accent, #ff00ff); font-weight: 600; margin-bottom: 4px;">Address:</div>
              <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; font-family: monospace; word-break: break-all;">${context.wallet.address}</div>
            </div>
            <div style="margin-bottom: 16px;">
              <div style="color: var(--palette-accent, #ff00ff); font-weight: 600; margin-bottom: 4px;">ETH Balance:</div>
              <div style="color: var(--palette-text, #e0e0e0); font-size: 20px; font-weight: 700;">${formattedBalance} ETH</div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 16px;">
              <a 
                href="https://etherscan.io/address/${context.wallet.address}" 
                target="_blank" 
                rel="noopener noreferrer"
                style="
                  color: var(--palette-accent, #ff00ff);
                  text-decoration: none;
                  font-size: 12px;
                  padding: 8px 16px;
                  border: 1px solid var(--palette-accent, #ff00ff);
                  border-radius: 6px;
                  display: inline-block;
                "
              >
                📊 Etherscan →
              </a>
              ${createCommandLine("eth balance tokens", "View Token Balances")}
            </div>
          </div>
        </div>
      </div>
    `;
    context.logHtml(walletHtml);
  } catch (error: any) {
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching wallet info</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
  }
}

// ============================================
// BALANCE HANDLERS
// ============================================

async function handleBalance(context: CommandContext, args: string[]): Promise<void> {
  const type = args[2]?.toLowerCase();
  const address = args[3] || context.wallet.address;

  if (!address) {
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
          padding: 16px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 12px;">❌ Address Required</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 12px;">
            Connect your wallet or provide an address:
          </div>
          <div style="text-align: center;">
            ${createCommandLine("connect", "Connect Wallet")}
          </div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
    return;
  }

  if (type === "tokens") {
    await handleTokenBalances(context, address);
    return;
  }

  // Default: ETH balance
  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        💰 Fetching ETH balance for ${address.substring(0, 6)}...${address.substring(38)}...
      </div>
    </div>
  `;
  context.logHtml(infoHtml);

  try {
    const provider = context.wallet.getProvider();
    if (!provider) {
      throw new Error("Provider not available");
    }

    const balance = await provider.getBalance(address);
    const formattedBalance = formatUnits(balance, 18);

    const balanceHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00d4ff) 6%, transparent) 100%);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent);
          border-radius: 12px;
          padding: 24px;
        ">
          <div style="
            font-size: 18px;
            font-weight: 700;
            color: var(--palette-primary, #00d4ff);
            margin-bottom: 20px;
            text-align: center;
          ">
            💰 ETH Balance
          </div>
          <div style="
            background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          ">
            <div style="font-size: 32px; font-weight: 700; color: var(--palette-primary, #00d4ff); margin-bottom: 8px;">
              ${formattedBalance}
            </div>
            <div style="font-size: 16px; color: var(--palette-text, #e0e0e0); margin-bottom: 16px;">
              ETH
            </div>
            <div style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #e0e0e0) 60%, transparent); font-family: monospace; word-break: break-all; margin-top: 16px; padding-top: 16px; border-top: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);">
              ${address}
            </div>
          </div>
          <div style="text-align: center; margin-top: 16px;">
            <a 
              href="https://etherscan.io/address/${address}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                color: var(--palette-primary, #00d4ff);
                text-decoration: none;
                font-size: 12px;
                padding: 8px 16px;
                border: 1px solid var(--palette-primary, #00d4ff);
                border-radius: 6px;
                display: inline-block;
              "
            >
              📊 View on Etherscan →
            </a>
          </div>
        </div>
      </div>
    `;
    context.logHtml(balanceHtml);
  } catch (error: any) {
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching balance</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
  }
}

async function handleTokenBalances(context: CommandContext, address: string): Promise<void> {
  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        💰 Fetching token balances...
      </div>
    </div>
  `;
  context.logHtml(infoHtml);

  // Popular tokens to check
  const popularTokens = [
    { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
    { symbol: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
    { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
    { symbol: "UNI", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" },
  ];

  try {
    const provider = context.wallet.getProvider();
    if (!provider) {
      throw new Error("Provider not available");
    }

    const erc20Abi = [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
    ];

    const balances = await Promise.all(
      popularTokens.map(async (token) => {
        try {
          const contract = new Contract(token.address, erc20Abi, provider);
          const [balance, decimals] = await Promise.all([
            contract.balanceOf(address),
            contract.decimals().catch(() => 18),
          ]);
          return {
            ...token,
            balance: formatUnits(balance, decimals),
            hasBalance: !balance.isZero(),
          };
        } catch {
          return { ...token, balance: "0", hasBalance: false };
        }
      })
    );

    const tokensWithBalance = balances.filter((t) => t.hasBalance);

    let balancesHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          font-size: 16px;
          font-weight: 700;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 16px;
          text-align: center;
        ">
          💰 Token Balances
        </div>
    `;

    if (tokensWithBalance.length === 0) {
      balancesHtml += `
        <div style="
          background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        ">
          <div style="color: var(--palette-text, #e0e0e0); font-size: 13px;">
            No token balances found for popular tokens.
          </div>
        </div>
      `;
    } else {
      tokensWithBalance.forEach((token) => {
        balancesHtml += `
          <div style="
            background: linear-gradient(135deg, color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 2%, transparent) 100%);
            border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 20%, transparent);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 14px; font-weight: 600; color: var(--palette-text, #e0e0e0);">
                  ${token.symbol}
                </div>
                <div style="font-size: 18px; font-weight: 700; color: var(--palette-secondary, #00ff88);">
                  ${token.balance}
                </div>
              </div>
              <span 
                class="omega-help-command"
                data-command="eth token info ${token.address}"
                style="
                  color: var(--palette-primary, #00d4ff);
                  font-size: 11px;
                  padding: 6px 12px;
                  border: 1px solid var(--palette-primary, #00d4ff);
                  border-radius: 6px;
                  cursor: pointer;
                "
                title="View token info"
              >
                Info
              </span>
            </div>
          </div>
        `;
      });
    }

    balancesHtml += `
        <div style="
          margin-top: 16px;
          padding: 12px;
          background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
          border-radius: 8px;
          text-align: center;
        ">
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; line-height: 1.6;">
            💡 Showing balances for popular tokens only<br/>
            💡 Use ${createCommandLine("eth token balance <address>", "eth token balance <address>")} for specific tokens
          </div>
        </div>
      </div>
    `;
    context.logHtml(balancesHtml);
  } catch (error: any) {
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
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error fetching token balances</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    context.logHtml(errorHtml);
  }
}

export const ethCommands: Command[] = [ethCommand];
