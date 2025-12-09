/**
 * Eclipse Commands
 * Commands for Eclipse network operations with Solar DEX and Deserialize integration
 */

import type { Command, CommandContext } from "@/types/commands";
import { config } from "@/lib/config";
import * as eclipse from "@/lib/multichain/eclipse";
import { createCommandLine, createUsageError } from "./command-output-helpers";
import { isAppMode } from "@/lib/utils/url-utils";

/**
 * Eclipse command - Main entry point for all Eclipse network operations
 */
export const eclipseCommand: Command = {
  name: "eclipse",
  description: "Eclipse network operations (wallet, tokens, swap)",
  category: "multichain",
  usage: "eclipse [connect|generate|balance|tokens|price|swap|help]",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showHelp(context);
      return;
    }

    switch (subcommand) {
      case "connect":
        await connectEclipse(context);
        break;
      case "generate":
        await generateWallet(context);
        break;
      case "balance":
        await checkBalance(context);
        break;
      case "tokens":
        await showTokenList(context);
        break;
      case "price":
        await getTokenPrice(context, args.slice(2));
        break;
      case "swap":
        // Check if app mode is enabled
        if (isAppMode()) {
          context.log("❌ Swap is not supported on mobile app version", "error");
          return;
        }
        
        if (args.length > 2) {
          await executeSwap(context, args.slice(2));
        } else {
          await showSwapInterface(context);
        }
        break;
      default:
        context.log(
          `Unknown Eclipse subcommand: ${subcommand}.`,
          "error"
        );
        const helpHtml = createCommandLine("eclipse help", "See available commands");
        context.logHtml(helpHtml);
    }
  },
};

/**
 * Show Eclipse command help
 */
function showHelp(context: CommandContext): void {
  context.log("╔════════════════════════════════════════╗", "info");
  context.log("║       ECLIPSE NETWORK COMMANDS         ║", "info");
  context.log("╚════════════════════════════════════════╝", "info");
  context.log("", "info");
  context.log("Wallet Commands:", "success");
  context.log("  eclipse connect  - Connect to Phantom wallet", "info");
  context.log("  eclipse generate - Generate a new browser wallet", "info");
  context.log("  eclipse balance  - Check wallet balance (ETH)", "info");
  context.log("", "info");
  context.log("Token & Swap Commands:", "success");
  context.log("  eclipse tokens       - List available tokens", "info");
  context.log("  eclipse price <mint> - Get token price", "info");
  context.log(
    "  eclipse swap         - Open interactive swap interface",
    "info"
  );
  context.log(
    "  eclipse swap execute <from> <to> <amount> [slippage] - Execute swap",
    "info"
  );
  context.log("", "info");
  context.log("Smart Routing:", "success");
  context.log("  • SOLAR token → Solar DEX", "info");
  context.log("  • Other tokens → Deserialize aggregator", "info");
  context.log("", "info");
  context.log("Examples:", "success");
  context.log("  eclipse connect", "info");
  context.log("  eclipse tokens", "info");
  context.log("  eclipse swap", "info");
  context.log("  eclipse swap execute So11...AA Bonk...AA 1000000 50", "info");
}

/**
 * Connect to Phantom wallet for Eclipse
 */
async function connectEclipse(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    context.log("🔌 Connecting to Phantom wallet (Eclipse network)...", "info");

    const success = await context.multichain.eclipse.connectPhantom();

    if (success) {
      const state = context.multichain.eclipse.state;
      context.log("✅ Connected to Phantom wallet", "success");
      context.log(`📍 Public Key: ${state.publicKey}`, "info");

      // Get balance
      if (state.publicKey) {
        const balance = await context.multichain.eclipse.getBalance(
          state.publicKey
        );
        if (balance !== null) {
          context.log(`💰 Balance: ${balance.toFixed(4)} ETH`, "info");
        }
      }

      context.log("", "info");
      context.log("ℹ️  Eclipse uses ETH as native currency", "info");
    } else {
      context.log(
        "❌ Failed to connect. Please install Phantom wallet or approve the connection.",
        "error"
      );
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Generate a new Eclipse browser wallet
 */
async function generateWallet(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    context.log("🔧 Generating new Eclipse wallet...", "info");

    const wallet = await context.multichain.eclipse.generateWallet();

    if (wallet) {
      context.log("✅ Wallet generated successfully!", "success");
      context.log("", "info");

      // Display public key with copy button
      context.logHtml(`
        <div style="margin: 10px 0; padding: 10px; background: #2a2a2a; border-left: 3px solid #9333ea; border-radius: 4px;">
          <div style="color: #cccccc; margin-bottom: 5px;">📍 Public Key:</div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <code style="flex: 1; background: #333; padding: 8px; border-radius: 3px; color: #9333ea; word-break: break-all;">
              ${wallet.publicKey}
            </code>
            <button 
              onclick="navigator.clipboard.writeText('${wallet.publicKey}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 1000);"
              style="padding: 8px 12px; background: linear-gradient(45deg, #6b46c1, #9333ea); color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;"
            >
              Copy
            </button>
          </div>
        </div>
      `);

      // Display secret key with reveal button
      context.logHtml(`
        <div style="margin: 10px 0; padding: 10px; background: #2a2a2a; border-left: 3px solid #ff6b6b; border-radius: 4px;">
          <div style="color: #ff6b6b; margin-bottom: 5px;">🔐 Secret Key (Keep this safe!):</div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <code id="secretKey_eclipse_${Date.now()}" style="flex: 1; background: #333; padding: 8px; border-radius: 3px; color: #ff6b6b; word-break: break-all; filter: blur(5px); cursor: pointer;">
              ${wallet.secretKey}
            </code>
            <button 
              onclick="const el = this.previousElementSibling; el.style.filter = el.style.filter === 'none' ? 'blur(5px)' : 'none'; this.textContent = el.style.filter === 'none' ? 'Hide' : 'Reveal';"
              style="padding: 8px 12px; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;"
            >
              Reveal
            </button>
            <button 
              onclick="navigator.clipboard.writeText('${
                wallet.secretKey
              }'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 1000);"
              style="padding: 8px 12px; background: linear-gradient(45deg, #6b46c1, #9333ea); color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;"
            >
              Copy
            </button>
          </div>
        </div>
      `);

      context.log(
        "⚠️  IMPORTANT: Save your secret key in a secure location!",
        "warning"
      );
      context.log(
        "💡 Your wallet is now active and stored in the browser.",
        "info"
      );

      // Get initial balance
      const balance = await context.multichain.eclipse.getBalance(
        wallet.publicKey
      );
      if (balance !== null) {
        context.log(`💰 Balance: ${balance.toFixed(4)} ETH`, "info");
      }
    } else {
      context.log("❌ Failed to generate wallet", "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Check Eclipse wallet balance
 */
async function checkBalance(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    const state = context.multichain.eclipse.state;

    if (!state.connected || !state.publicKey) {
      context.log("❌ Please connect your wallet first", "error");
      const helpHtml = `
        <div style="margin: 8px 0;">
          ${createCommandLine("eclipse connect", "Connect your Eclipse wallet")}
          ${createCommandLine("eclipse generate", "Generate a new Eclipse wallet")}
        </div>
      `;
      context.logHtml(helpHtml);
      return;
    }

    context.log("💰 Fetching balance...", "info");

    const balance = await context.multichain.eclipse.getBalance(
      state.publicKey
    );

    if (balance !== null) {
      context.log(`📍 Public Key: ${state.publicKey}`, "info");
      context.log(`💰 Balance: ${balance.toFixed(4)} ETH`, "success");
      context.log("", "info");
      context.log("ℹ️  Eclipse uses ETH as native currency", "info");
    } else {
      context.log("❌ Failed to fetch balance", "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Show Eclipse token list
 */
async function showTokenList(context: CommandContext): Promise<void> {
  try {
    context.log("📋 Loading Eclipse tokens...", "info");
    context.log("🔄 Fetching from Solar DEX and Deserialize...", "info");

    const tokenList = await eclipse.getTokenList();

    context.log("", "info");
    context.log(`✅ Total Tokens: ${tokenList.merged.length}`, "success");
    context.log(`   Solar DEX: ${tokenList.solarTokens.length} tokens`, "info");
    context.log(
      `   Deserialize: ${tokenList.deserializeTokens.length} tokens`,
      "info"
    );
    context.log("", "info");

    // Display top tokens
    const topTokens = tokenList.merged.slice(0, 15);
    context.log("Top Tokens:", "success");

    topTokens.forEach((token, index) => {
      const dex = token.tags?.includes("solar-dex")
        ? "🌟 Solar"
        : "🔷 Deserialize";
      context.log(
        `${index + 1}. ${token.symbol} - ${token.name} ${dex}`,
        "info"
      );
      if (token.address === config.SOLAR_TOKEN_ADDRESS) {
        context.log(`   ⚡ SOLAR token (uses Solar DEX)`, "info");
      }
    });

    if (tokenList.merged.length > 15) {
      context.log(
        `... and ${tokenList.merged.length - 15} more tokens`,
        "info"
      );
    }

    context.log("", "info");
    const helpHtml = createCommandLine("eclipse swap", "Swap tokens");
    context.logHtml(helpHtml);
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Get token price from both DEXs
 */
async function getTokenPrice(
  context: CommandContext,
  args: string[]
): Promise<void> {
  try {
    const mint = args[0];

    if (!mint) {
      const usageHtml = createUsageError("eclipse price <mint_address>", [
        "eclipse price So11111111111111111111111111111111111111112",
        "eclipse price EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      ]);
      context.logHtml(usageHtml);
      return;
    }

    context.log(`💰 Fetching price for ${mint}...`, "info");

    const priceData = await eclipse.getTokenPrice(mint);

    context.log("", "info");
    context.log("📊 Price Comparison:", "success");

    if (priceData.solarPrice) {
      context.log(`   Solar DEX: $${priceData.solarPrice.toFixed(6)}`, "info");
    } else {
      context.log(`   Solar DEX: N/A`, "info");
    }

    if (priceData.deserializePrice) {
      context.log(
        `   Deserialize: $${priceData.deserializePrice.toFixed(6)}`,
        "info"
      );
    } else {
      context.log(`   Deserialize: N/A`, "info");
    }

    context.log(`   Source: ${priceData.source}`, "info");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Show interactive swap interface
 */
async function showSwapInterface(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    const state = context.multichain.eclipse.state;

    if (!state.connected || !state.publicKey) {
      context.log("❌ Please connect your wallet first", "error");
      const helpHtml = `
        <div style="margin: 8px 0;">
          ${createCommandLine("eclipse connect", "Connect your Eclipse wallet")}
          ${createCommandLine("eclipse generate", "Generate a new Eclipse wallet")}
        </div>
      `;
      context.logHtml(helpHtml);
      return;
    }

    context.log("💱 Opening Eclipse swap interface...", "info");
    context.log("", "info");

    // Determine routing for SOLAR token
    const solarRouting = config.SOLAR_TOKEN_ADDRESS;

    // Display interactive swap interface via HTML
    context.logHtml(`
      <div style="background: #1a1a1a; border: 1px solid #9333ea; padding: 20px; margin: 10px 0; border-radius: 8px; font-family: 'Courier New', monospace;">
        <div style="color: #9333ea; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
          🌙 Eclipse Token Swap (Smart Routing)
        </div>
        
        <div style="background: #2a2a2a; padding: 15px; border-radius: 6px; border-left: 3px solid #9333ea; margin-bottom: 15px;">
          <div style="color: #cccccc; margin-bottom: 10px;">
            <strong>Connected Wallet:</strong> ${
              state.type === "phantom" ? "Phantom" : "Browser Wallet"
            }
          </div>
          <div style="color: #9333ea; font-family: monospace; word-break: break-all;">
            ${state.publicKey}
          </div>
          <div style="color: #cccccc; margin-top: 10px;">
            <strong>Balance:</strong> ${
              state.balance?.toFixed(4) || "0.0000"
            } ETH
          </div>
        </div>

        <div style="background: #2a2a2a; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <div style="color: #9333ea; font-weight: bold; margin-bottom: 10px;">
            🚀 Smart Routing System
          </div>
          <div style="display: flex; gap: 10px; margin-bottom: 8px;">
            <div style="flex: 1; padding: 10px; background: #1a1a1a; border-left: 3px solid #4169e1; border-radius: 4px;">
              <div style="color: #4169e1; font-weight: bold; margin-bottom: 5px;">☀️ Solar DEX</div>
              <div style="color: #cccccc; font-size: 12px;">SOLAR token swaps</div>
            </div>
            <div style="flex: 1; padding: 10px; background: #1a1a1a; border-left: 3px solid #ff8c00; border-radius: 4px;">
              <div style="color: #ff8c00; font-weight: bold; margin-bottom: 5px;">🔷 Deserialize</div>
              <div style="color: #cccccc; font-size: 12px;">All other tokens</div>
            </div>
          </div>
          <div style="color: #888; font-size: 11px; margin-top: 10px;">
            * System automatically routes to the best DEX based on tokens selected
          </div>
        </div>

        <div style="background: #2a2a2a; padding: 15px; border-radius: 6px;">
          <p style="color: #cccccc; margin: 0 0 10px 0;">
            ℹ️ Full interactive swap interface coming soon!
          </p>
          <p style="color: #cccccc; margin: 0 0 10px 0;">
            Available commands:
          </p>
          <code style="background: #333; padding: 8px; border-radius: 3px; color: #9333ea; display: block; margin-bottom: 5px;">
            eclipse tokens - View all available tokens
          </code>
          <code style="background: #333; padding: 8px; border-radius: 3px; color: #9333ea; display: block;">
            eclipse price &lt;mint&gt; - Get token price
          </code>
        </div>
      </div>
    `);
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Execute a token swap on Eclipse with smart routing
 */
async function executeSwap(
  context: CommandContext,
  args: string[]
): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    const state = context.multichain.eclipse.state;

    if (!state.connected || !state.publicKey) {
      context.log("❌ Please connect your wallet first", "error");
      const helpHtml = `
        <div style="margin: 8px 0;">
          ${createCommandLine("eclipse connect", "Connect your Eclipse wallet")}
          ${createCommandLine("eclipse generate", "Generate a new Eclipse wallet")}
        </div>
      `;
      context.logHtml(helpHtml);
      return;
    }

    if (args.length < 3) {
      const usageHtml = createUsageError("eclipse swap execute <from_mint> <to_mint> <amount> [slippage_bps]", [
        "eclipse swap execute So11111111111111111111111111111111111111112 EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v 1000000",
        "eclipse swap execute So11...AA Bonk...AA 1000000 50",
      ]);
      context.logHtml(usageHtml);
      return;
    }

    const [fromMint, toMint, amount] = args;
    const slippageBps = args[3] ? parseInt(args[3]) : 50;

    // Determine routing
    const dex = eclipse.determineSwapRoute(fromMint!, toMint!);
    const dexName = dex === "solar-dex" ? "Solar DEX" : "Deserialize";

    context.log("💱 Executing Eclipse swap...", "info");
    context.log(`   From: ${fromMint}`, "info");
    context.log(`   To: ${toMint}`, "info");
    context.log(`   Amount: ${amount}`, "info");
    context.log(`   Slippage: ${slippageBps / 100}%`, "info");
    context.log(`   Route: ${dexName}`, "info");
    context.log("", "info");

    // Step 1: Get swap quote
    context.log(`📊 Getting swap quote from ${dexName}...`, "info");
    const quote = await eclipse.getSwapQuote(
      fromMint!,
      toMint!,
      amount!,
      slippageBps
    );

    if (!quote) {
      context.log("❌ Failed to get swap quote", "error");
      return;
    }

    context.log("✅ Quote received:", "success");
    context.log(`   Input: ${quote.inAmount}`, "info");
    context.log(`   Output: ${quote.outAmount}`, "info");
    context.log(`   Price Impact: ${quote.priceImpactPct}%`, "info");
    context.log("", "info");

    // Step 2: Get swap transaction
    context.log("🔨 Building swap transaction...", "info");
    const txResult = await eclipse.getSwapTransaction(
      fromMint!,
      toMint!,
      amount!,
      slippageBps,
      state.publicKey
    );

    if (!txResult || !txResult.swapTransaction) {
      context.log("❌ Failed to build swap transaction", "error");
      return;
    }

    context.log("✅ Transaction built", "success");
    context.log("", "info");

    // Step 3: Send transaction
    context.log("📤 Sending transaction to Eclipse network...", "info");
    const signature = await context.multichain.eclipse.sendTransaction(
      txResult.swapTransaction
    );

    if (signature) {
      context.log("✅ Swap executed successfully!", "success");
      context.log(`🔗 Signature: ${signature}`, "info");
      context.log("", "info");
      context.log(
        `🔍 View on Eclipse Explorer: https://explorer.eclipse.xyz/tx/${signature}`,
        "info"
      );
    } else {
      context.log("❌ Failed to send transaction", "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Export Eclipse commands
 */
export const eclipseCommands: Command[] = [eclipseCommand];
