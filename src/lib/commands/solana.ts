/**
 * Solana Commands
 * Commands for Solana blockchain operations including wallet management and token swaps
 */

import type { Command, CommandContext } from "@/types/commands";
import { config } from "@/lib/config";
import * as solana from "@/lib/multichain/solana";
import { createCommandLine, createUsageError } from "./command-output-helpers";

/**
 * Solana command - Main entry point for all Solana operations
 */
export const solanaCommand: Command = {
  name: "solana",
  description: "Solana blockchain operations (wallet, swap, tokens)",
  category: "multichain",
  usage: "solana [connect|generate|status|test|search|quote|swap|help]",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showHelp(context);
      return;
    }

    switch (subcommand) {
      case "connect":
        await connectPhantom(context);
        break;
      case "generate":
        await generateWallet(context);
        break;
      case "status":
        await showWalletStatus(context);
        break;
      case "test":
        await testRpcConnectivity(context);
        break;
      case "search":
        await searchTokens(context, args.slice(2));
        break;
      case "quote":
        await getSwapQuote(context, args.slice(2));
        break;
      case "swap":
        if (args[2] === "execute" && args.length >= 6) {
          await executeSwap(context, args.slice(3));
        } else {
          await showSwapInterface(context);
        }
        break;
      default:
        context.log(
          `Unknown Solana subcommand: ${subcommand}.`,
          "error"
        );
        const helpHtml = createCommandLine("solana help", "See available commands");
        context.logHtml(helpHtml);
    }
  },
};

/**
 * Show Solana command help
 */
function showHelp(context: CommandContext): void {
  context.log("╔════════════════════════════════════════╗", "info");
  context.log("║       SOLANA BLOCKCHAIN COMMANDS       ║", "info");
  context.log("╚════════════════════════════════════════╝", "info");
  context.log("", "info");
  context.log("Wallet Commands:", "success");
  context.log("  solana connect        - Connect to Phantom wallet", "info");
  context.log(
    "  solana generate       - Generate a new browser wallet",
    "info"
  );
  context.log(
    "  solana status         - Show wallet connection status",
    "info"
  );
  context.log("  solana test           - Test RPC connectivity", "info");
  context.log("", "info");
  context.log("Token & Swap Commands:", "success");
  context.log("  solana search <query> - Search for tokens", "info");
  context.log("  solana quote <from> <to> <amount> - Get swap quote", "info");
  context.log(
    "  solana swap           - Open interactive swap interface",
    "info"
  );
  context.log(
    "  solana swap execute <from> <to> <amount> [slippage] - Execute swap",
    "info"
  );
  context.log("", "info");
  context.log("Examples:", "success");
  context.log("  solana connect", "info");
  context.log("  solana search BONK", "info");
  context.log("  solana swap", "info");
  context.log("  solana swap execute So11...AA Bonk...AA 1000000 50", "info");
}

/**
 * Connect to Phantom wallet
 */
async function connectPhantom(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    context.log("🔌 Connecting to Phantom wallet...", "info");

    const success = await context.multichain.solana.connectPhantom();

    if (success) {
      const state = context.multichain.solana.state;
      context.log("✅ Connected to Phantom wallet", "success");
      context.log(`📍 Public Key: ${state.publicKey}`, "info");

      // Get balance
      if (state.publicKey) {
        const balance = await context.multichain.solana.getBalance(
          state.publicKey
        );
        if (balance !== null) {
          context.log(`💰 Balance: ${balance.toFixed(4)} SOL`, "info");
        }
      }
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
 * Generate a new Solana browser wallet
 */
async function generateWallet(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    context.log("🔧 Generating new Solana wallet...", "info");

    const wallet = await context.multichain.solana.generateWallet();

    if (wallet) {
      context.log("✅ Wallet generated successfully!", "success");
      context.log("", "info");

      // Display public key with copy button
      context.logHtml(`
        <div style="margin: 10px 0; padding: 10px; background: #2a2a2a; border-left: 3px solid #00bfff; border-radius: 4px;">
          <div style="color: #cccccc; margin-bottom: 5px;">📍 Public Key:</div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <code style="flex: 1; background: #333; padding: 8px; border-radius: 3px; color: #00bfff; word-break: break-all;">
              ${wallet.publicKey}
            </code>
            <button 
              onclick="navigator.clipboard.writeText('${wallet.publicKey}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 1000);"
              style="padding: 8px 12px; background: linear-gradient(45deg, #0080ff, #00bfff); color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;"
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
            <code id="secretKey_${Date.now()}" style="flex: 1; background: #333; padding: 8px; border-radius: 3px; color: #ff6b6b; word-break: break-all; filter: blur(5px); cursor: pointer;">
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
              style="padding: 8px 12px; background: linear-gradient(45deg, #0080ff, #00bfff); color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;"
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
      const balance = await context.multichain.solana.getBalance(
        wallet.publicKey
      );
      if (balance !== null) {
        context.log(`💰 Balance: ${balance.toFixed(4)} SOL`, "info");
      }
    } else {
      context.log("❌ Failed to generate wallet", "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Show wallet connection status
 */
async function showWalletStatus(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    const state = context.multichain.solana.state;

    context.log("╔════════════════════════════════════════╗", "info");
    context.log("║        SOLANA WALLET STATUS            ║", "info");
    context.log("╚════════════════════════════════════════╝", "info");
    context.log("", "info");

    if (state.connected && state.publicKey) {
      context.log(
        `✅ Status: Connected (${
          state.type === "phantom" ? "Phantom" : "Browser Wallet"
        })`,
        "success"
      );
      context.log(`📍 Public Key: ${state.publicKey}`, "info");

      // Update balance
      const balance = await context.multichain.solana.getBalance(
        state.publicKey
      );
      if (balance !== null) {
        context.log(`💰 Balance: ${balance.toFixed(4)} SOL`, "info");
      }

      context.log("", "info");
      context.log("Available commands:", "info");
      context.log("  • solana search <token> - Search for tokens", "info");
      context.log("  • solana swap           - Open swap interface", "info");
    } else {
      context.log("❌ Status: Not Connected", "error");
      context.log("", "info");
      context.log("To get started:", "info");
      context.log("  • solana connect  - Connect Phantom wallet", "info");
      context.log("  • solana generate - Generate browser wallet", "info");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Test RPC connectivity
 */
async function testRpcConnectivity(context: CommandContext): Promise<void> {
  try {
    context.log("🔍 Testing Solana RPC connectivity...", "info");
    context.log(`📡 RPC URL: ${config.SOLANA_RPC_URL}`, "info");
    context.log("", "info");

    const result = await solana.testRpcConnectivity();

    if (result.success) {
      context.log("✅ RPC connectivity test successful!", "success");
      context.log(`🔢 Version: ${result.version}`, "info");
      context.log(`📊 Current Slot: ${result.slot}`, "info");
    } else {
      context.log("❌ RPC connectivity test failed", "error");
      context.log(`Error: ${result.error}`, "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Search for tokens with rich UI
 */
async function searchTokens(
  context: CommandContext,
  args: string[]
): Promise<void> {
  try {
    const query = args.join(" ");

    if (!query) {
      const usageHtml = createUsageError("solana search <token name or symbol>", [
        "solana search USDC",
        "solana search Solana",
      ]);
      context.logHtml(usageHtml);
      return;
    }

    context.log(`🔍 Searching Solana tokens for: ${query}`, "info");

    const tokens = await solana.searchTokens(query);

    if (tokens.length === 0) {
      context.log("❌ No tokens found", "warning");
      return;
    }

    context.log(`✅ Found ${tokens.length} tokens`, "success");
    context.log("", "info");

    // Display tokens with rich card UI matching vanilla version
    tokens.slice(0, 10).forEach((token, index) => {
      const logoUri = (token as any).logoURI || (token as any).icon || "";
      const usdPrice = (token as any).usdPrice;
      const volume24h =
        (token as any).volume24h || (token as any).stats24h?.buyVolume;
      const holderCount = (token as any).holderCount;
      const audit = (token as any).audit;
      const cexes = (token as any).cexes;
      const mcap = (token as any).mcap;
      const fdv = (token as any).fdv;

      let cardHtml = `<div style='display:flex;align-items:center;justify-content:space-between;gap:14px;margin:16px 0;padding:16px;background:rgba(138,43,226,0.1);border:1px solid rgba(138,43,226,0.3);border-radius:12px;'>`;

      // Left: logo, name, symbol, mint
      cardHtml += `<div style='display:flex;align-items:center;gap:14px;flex:1;'>`;
      if (logoUri) {
        cardHtml += `<img src='${logoUri}' alt='icon' style='width:48px;height:48px;border-radius:50%;background:#fff;padding:2px;'>`;
      }
      cardHtml += `<div style='flex:1;'>
        <div><span style='font-size:1.2em;font-weight:bold;color:#fff;'>${
          token.name || ""
        }</span> <span style='color:#9370db;font-weight:bold;'>(${
        token.symbol || ""
      })</span></div>
        <div style='margin-top:4px;font-size:0.85em;'>
          <span style='color:#888;'>Mint:</span> <span class='copyable' style='font-family:monospace;color:#9370db;cursor:pointer;' onclick="navigator.clipboard.writeText('${
            token.address || ""
          }')" title="Click to copy">${token.address?.substring(
        0,
        8
      )}...${token.address?.substring(token.address.length - 6)}</span>
        </div>`;

      if (usdPrice !== undefined)
        cardHtml += `<div style='margin-top:4px;'><span style='color:#888;'>Price:</span> <b style='color:#00ff88;'>$${Number(
          usdPrice
        ).toLocaleString(undefined, { maximumFractionDigits: 8 })}</b></div>`;
      if (volume24h !== undefined)
        cardHtml += `<div style='margin-top:2px;'><span style='color:#888;'>24h Volume:</span> <b style='color:#00bcf2;'>$${Number(
          volume24h
        ).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></div>`;
      if (holderCount !== undefined)
        cardHtml += `<div style='margin-top:2px;'><span style='color:#888;'>Holders:</span> <b style='color:#ffd700;'>${Number(
          holderCount
        ).toLocaleString()}</b></div>`;

      cardHtml += `</div></div>`;

      // Middle: audit and CEXes
      if (audit || cexes) {
        cardHtml += `<div style='min-width:200px;text-align:center;padding:12px;background:rgba(0,0,0,0.2);border-radius:8px;'>`;
        if (audit) {
          cardHtml += `<div style='margin-bottom:8px;'><b style='color:#00bcf2;'>Audit</b><br>`;
          if (audit.mintAuthorityDisabled !== undefined)
            cardHtml += `<div style='font-size:0.9em;margin-top:4px;'><span style='color:#888;'>Mint Authority:</span> <b style='color:${
              audit.mintAuthorityDisabled ? "#00ff88" : "#ff3333"
            };'>${
              audit.mintAuthorityDisabled ? "Disabled ✓" : "Enabled"
            }</b></div>`;
          if (audit.freezeAuthorityDisabled !== undefined)
            cardHtml += `<div style='font-size:0.9em;margin-top:2px;'><span style='color:#888;'>Freeze Authority:</span> <b style='color:${
              audit.freezeAuthorityDisabled ? "#00ff88" : "#ff3333"
            };'>${
              audit.freezeAuthorityDisabled ? "Disabled ✓" : "Enabled"
            }</b></div>`;
          if (audit.topHoldersPercentage !== undefined)
            cardHtml += `<div style='font-size:0.9em;margin-top:2px;'><span style='color:#888;'>Top Holders:</span> <b style='color:#ffd700;'>${Number(
              audit.topHoldersPercentage
            ).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}%</b></div>`;
          cardHtml += `</div>`;
        }
        if (cexes && Array.isArray(cexes) && cexes.length > 0) {
          cardHtml += `<div style='margin-top:8px;'><b style='color:#00bcf2;'>CEX Listings</b><br><span style='font-size:0.9em;color:#ffd700;'>${cexes.join(
            ", "
          )}</span></div>`;
        }
        cardHtml += `</div>`;
      }

      // Right: mcap and fdv
      if (mcap || fdv) {
        cardHtml += `<div style='text-align:right;min-width:150px;padding:12px;background:rgba(0,0,0,0.2);border-radius:8px;'>`;
        if (mcap !== undefined)
          cardHtml += `<div><span style='color:#888;font-size:0.9em;'>Market Cap</span><br><b style='color:#00ff88;font-size:1.1em;'>$${Number(
            mcap
          ).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></div>`;
        if (fdv !== undefined)
          cardHtml += `<div style='margin-top:8px;'><span style='color:#888;font-size:0.9em;'>FDV</span><br><b style='color:#00bcf2;font-size:1.1em;'>$${Number(
            fdv
          ).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></div>`;
        cardHtml += `</div>`;
      }

      cardHtml += `</div>`;

      // Add swap buttons section
      let swapSection = `<div style='margin-top:8px;padding:12px;background:rgba(0,255,0,0.05);border:1px solid rgba(0,255,0,0.3);border-radius:8px;'>`;
      swapSection += `<div style='font-weight:bold;margin-bottom:8px;color:#00ff88;'>Quick Swap Actions:</div>`;
      swapSection += `<div style='display:flex;gap:8px;flex-wrap:wrap;'>`;

      // Swap buttons (Note: In Next.js these would dispatch events)
      swapSection += `<button onclick="window.dispatchEvent(new CustomEvent('terminal-command', {detail: 'solana swap execute So11111111111111111111111111111111111111112 ${token.address} 1000000000'}))" style='background:#00ff88;color:#000;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;'>Swap 1 SOL → ${token.symbol}</button>`;
      swapSection += `<button onclick="window.dispatchEvent(new CustomEvent('terminal-command', {detail: 'solana swap execute ${token.address} So11111111111111111111111111111111111111112 1000000'}))" style='background:#ff6600;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;'>Swap 1M ${token.symbol} → SOL</button>`;
      swapSection += `<button onclick="alert('Custom swap coming soon!')" style='background:#0066ff;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;'>Custom Swap</button>`;

      swapSection += `</div></div>`;

      context.logHtml(cardHtml + swapSection);
    });

    if (tokens.length > 10) {
      context.log("", "info");
      context.log(`... and ${tokens.length - 10} more tokens`, "info");
    }

    context.log("", "info");
    context.log("💡 Click 'Copy' to copy token address", "info");
    context.log(
      "💡 Use quick swap buttons or 'solana swap' for custom amounts",
      "info"
    );
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Get swap quote
 */
async function getSwapQuote(
  context: CommandContext,
  args: string[]
): Promise<void> {
  try {
    if (args.length < 3) {
      const usageHtml = createUsageError("solana quote <from_mint> <to_mint> <amount>", [
        "solana quote So11111111111111111111111111111111111111112 EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v 1000000",
      ]);
      context.logHtml(usageHtml);
      return;
    }

    const [fromMint, toMint, amount] = args;

    context.log("💱 Getting swap quote...", "info");

    const quote = await solana.getSwapQuote(fromMint!, toMint!, amount!);

    if (quote) {
      context.log("✅ Quote received:", "success");
      context.log(`   Input: ${quote.inAmount}`, "info");
      context.log(`   Output: ${quote.outAmount}`, "info");
      context.log(`   Price Impact: ${quote.priceImpactPct}%`, "info");
      context.log("", "info");
      const helpHtml = createCommandLine("solana swap", "Use for interactive swapping");
      context.logHtml(helpHtml);
    } else {
      context.log("❌ Failed to get quote", "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Show interactive swap interface with token search
 */
async function showSwapInterface(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    const state = context.multichain.solana.state;

    if (!state.connected || !state.publicKey) {
      context.log("❌ Please connect your wallet first", "error");
      const helpHtml = `
        <div style="margin: 8px 0;">
          ${createCommandLine("solana connect", "Connect your Solana wallet")}
          ${createCommandLine("solana generate", "Generate a new Solana wallet")}
        </div>
      `;
      context.logHtml(helpHtml);
      return;
    }

    context.log("💱 Solana Swap Interface with Token Search", "info");

    const html = `
      <div style="background: #1a1a1a; border: 1px solid #00bfff; padding: 20px; margin: 10px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #00bfff;">🟣 Solana Swap</h3>
        
        <!-- From token selection -->
        <div style="margin-bottom: 15px;">
          <label style="color: #cccccc; display: block; margin-bottom: 5px;">From Token:</label>
          <div style="position: relative;">
            <input type="text" id="solanaFromSearch" placeholder="Search tokens..." 
              style="width: 100%; padding: 8px; background: #222; color: #fff; border: 1px solid #444; border-radius: 3px; box-sizing: border-box; cursor: text;" autocomplete="off">
            <div id="solanaFromList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: #222; border: 1px solid #444; border-top: none; z-index: 1000; display: none;"></div>
          </div>
          <input type="hidden" id="fromTokenAddress" value="So11111111111111111111111111111111111111112">
          <div id="fromTokenDisplay" style="margin-top: 5px; padding: 8px; background: #333; border-radius: 3px; color: #00bfff; border-left: 3px solid #00bfff;">
            SOL - Solana <span style="color: #00ff00; font-size: 12px;">✅ VERIFIED</span><br>
            <span style="font-size: 11px; color: #888;">So11111111111111111111111111111111111111112</span>
          </div>
        </div>
        
        <!-- To token selection -->  
        <div style="margin-bottom: 15px;">
          <label style="color: #cccccc; display: block; margin-bottom: 5px;">To Token:</label>
          <div style="position: relative;">
            <input type="text" id="solanaToSearch" placeholder="Search tokens..." 
              style="width: 100%; padding: 8px; background: #222; color: #fff; border: 1px solid #444; border-radius: 3px; box-sizing: border-box; cursor: text;" autocomplete="off">
            <div id="solanaToList" style="position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: #222; border: 1px solid #444; border-top: none; z-index: 1000; display: none;"></div>
          </div>
          <input type="hidden" id="toTokenAddress" value="">
          <div id="toTokenDisplay" style="margin-top: 5px; padding: 8px; background: #333; border-radius: 3px; color: #cccccc; border-left: 3px solid #666;">Select a token</div>
        </div>
        
        <!-- Amount input -->
        <div style="margin-bottom: 15px;">
          <label style="color: #cccccc; display: block; margin-bottom: 5px;">Amount:</label>
          <input type="text" id="swapAmount" placeholder="1.0" 
            style="width: 100%; padding: 8px; background: #333; border: 1px solid #555; color: #fff; border-radius: 4px; cursor: text;" autocomplete="off">
        </div>
        
        <!-- Action buttons -->
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <button id="solanaQuoteBtn" style="flex: 1; padding: 12px; background: linear-gradient(45deg, #0080ff, #00bfff); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Get Quote</button>
          <button id="solanaSwapBtn" style="flex: 1; padding: 12px; background: linear-gradient(45deg, #00bfff, #0080ff); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Execute Swap</button>
        </div>
        
        <div style="background: #2a2a2a; padding: 10px; border-radius: 4px; border-left: 3px solid #00bfff;">
          <small style="color: #cccccc;">🔍 Start typing to search for tokens by name or symbol. Best rates across all Solana DEXs.</small>
        </div>
      </div>
    `;

    context.logHtml(html);

    // Setup event handlers after rendering
    if (typeof window !== "undefined") {
      setTimeout(() => {
        setupSwapInterface(context);
      }, 100);
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Setup swap interface event handlers
 */
function setupSwapInterface(context: CommandContext): void {
  const fromSearch = document.getElementById(
    "solanaFromSearch"
  ) as HTMLInputElement;
  const toSearch = document.getElementById(
    "solanaToSearch"
  ) as HTMLInputElement;
  const fromList = document.getElementById("solanaFromList");
  const toList = document.getElementById("solanaToList");
  const quoteBtn = document.getElementById("solanaQuoteBtn");
  const swapBtn = document.getElementById("solanaSwapBtn");

  if (!fromSearch || !toSearch) return;

  // Setup token search for "From" field
  let fromSearchTimeout: any;
  fromSearch.addEventListener("input", async (e) => {
    clearTimeout(fromSearchTimeout);
    const query = (e.target as HTMLInputElement).value.trim();

    if (query.length < 2) {
      if (fromList) fromList.style.display = "none";
      return;
    }

    fromSearchTimeout = setTimeout(async () => {
      if (fromList) {
        fromList.innerHTML =
          '<div style="padding: 8px; color: #666;">Searching...</div>';
        fromList.style.display = "block";
      }

      try {
        const tokens = await solana.searchTokens(query);

        if (fromList) {
          fromList.innerHTML = "";

          if (tokens && tokens.length > 0) {
            tokens.slice(0, 10).forEach((token) => {
              const item = document.createElement("div");
              item.style.cssText =
                "padding: 8px; cursor: pointer; border-bottom: 1px solid #333; display: flex; align-items: center; gap: 8px;";

              const logoUri = (token as any).logoURI || "";
              let content = "";
              if (logoUri) {
                content += `<img src="${logoUri}" style="width: 20px; height: 20px; border-radius: 50%;">`;
              }
              content += `<div><div style="font-weight: bold;">${
                token.symbol || "Unknown"
              }</div><div style="font-size: 12px; color: #888;">${
                token.name || "Unknown"
              }</div></div>`;

              item.innerHTML = content;

              item.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const fromTokenAddressInput = document.getElementById(
                  "fromTokenAddress"
                ) as HTMLInputElement;
                if (fromTokenAddressInput) {
                  fromTokenAddressInput.value = token.address || "";
                }

                const isVerified =
                  token.verified ||
                  (token.tags && token.tags.includes("verified"));
                const verificationBadge = isVerified
                  ? '<span style="color: #00ff00; font-size: 12px;">✅ VERIFIED</span>'
                  : '<span style="color: #ff4444; font-size: 12px;">⚠️ UNVERIFIED</span>';

                const shortAddr =
                  token.address.substring(0, 8) +
                  "..." +
                  token.address.substring(token.address.length - 8);

                const fromTokenDisplay =
                  document.getElementById("fromTokenDisplay");
                if (fromTokenDisplay) {
                  fromTokenDisplay.innerHTML = `${token.symbol} - ${token.name} ${verificationBadge}<br><span style="font-size: 11px; color: #888;">${shortAddr}</span>`;
                  fromTokenDisplay.style.borderLeftColor = isVerified
                    ? "#00bfff"
                    : "#ff4444";
                  fromTokenDisplay.style.color = isVerified
                    ? "#00bfff"
                    : "#ffaa00";
                }

                fromSearch.value = "";
                if (fromList) fromList.style.display = "none";
              });

              fromList.appendChild(item);
            });
          } else {
            fromList.innerHTML =
              '<div style="padding: 8px; color: #666;">No results found</div>';
          }
        }
      } catch (err) {
        if (fromList) {
          fromList.innerHTML =
            '<div style="padding: 8px; color: #666;">Search failed</div>';
        }
      }
    }, 300);
  });

  // Setup token search for "To" field (similar logic)
  let toSearchTimeout: any;
  toSearch.addEventListener("input", async (e) => {
    clearTimeout(toSearchTimeout);
    const query = (e.target as HTMLInputElement).value.trim();

    if (query.length < 2) {
      if (toList) toList.style.display = "none";
      return;
    }

    toSearchTimeout = setTimeout(async () => {
      if (toList) {
        toList.innerHTML =
          '<div style="padding: 8px; color: #666;">Searching...</div>';
        toList.style.display = "block";
      }

      try {
        const tokens = await solana.searchTokens(query);

        if (toList) {
          toList.innerHTML = "";

          if (tokens && tokens.length > 0) {
            tokens.slice(0, 10).forEach((token) => {
              const item = document.createElement("div");
              item.style.cssText =
                "padding: 8px; cursor: pointer; border-bottom: 1px solid #333; display: flex; align-items: center; gap: 8px;";

              const logoUri = (token as any).logoURI || "";
              let content = "";
              if (logoUri) {
                content += `<img src="${logoUri}" style="width: 20px; height: 20px; border-radius: 50%;">`;
              }
              content += `<div><div style="font-weight: bold;">${
                token.symbol || "Unknown"
              }</div><div style="font-size: 12px; color: #888;">${
                token.name || "Unknown"
              }</div></div>`;

              item.innerHTML = content;

              item.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const toTokenAddressInput = document.getElementById(
                  "toTokenAddress"
                ) as HTMLInputElement;
                if (toTokenAddressInput) {
                  toTokenAddressInput.value = token.address || "";
                }

                const isVerified =
                  token.verified ||
                  (token.tags && token.tags.includes("verified"));
                const verificationBadge = isVerified
                  ? '<span style="color: #00ff00; font-size: 12px;">✅ VERIFIED</span>'
                  : '<span style="color: #ff4444; font-size: 12px;">⚠️ UNVERIFIED</span>';

                const shortAddr =
                  token.address.substring(0, 8) +
                  "..." +
                  token.address.substring(token.address.length - 8);

                const toTokenDisplay =
                  document.getElementById("toTokenDisplay");
                if (toTokenDisplay) {
                  toTokenDisplay.innerHTML = `${token.symbol} - ${token.name} ${verificationBadge}<br><span style="font-size: 11px; color: #888;">${shortAddr}</span>`;
                  toTokenDisplay.style.borderLeftColor = isVerified
                    ? "#00bfff"
                    : "#ff4444";
                  toTokenDisplay.style.color = isVerified
                    ? "#00bfff"
                    : "#ffaa00";
                }

                toSearch.value = "";
                if (toList) toList.style.display = "none";
              });

              toList.appendChild(item);
            });
          } else {
            toList.innerHTML =
              '<div style="padding: 8px; color: #666;">No results found</div>';
          }
        }
      } catch (err) {
        if (toList) {
          toList.innerHTML =
            '<div style="padding: 8px; color: #666;">Search failed</div>';
        }
      }
    }, 300);
  });

  // Quote button handler
  if (quoteBtn) {
    quoteBtn.addEventListener("click", async () => {
      const fromToken = (
        document.getElementById("fromTokenAddress") as HTMLInputElement
      )?.value;
      const toToken = (
        document.getElementById("toTokenAddress") as HTMLInputElement
      )?.value;
      const amount = (document.getElementById("swapAmount") as HTMLInputElement)
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

      // Convert amount to proper decimals
      const decimals =
        fromToken === "So11111111111111111111111111111111111111112" ? 9 : 6;
      const swapAmount = Math.floor(
        parseFloat(amount) * Math.pow(10, decimals)
      );

      await getSwapQuote(context, [
        "",
        "",
        fromToken,
        toToken,
        swapAmount.toString(),
      ]);
    });
  }

  // Swap button handler
  if (swapBtn) {
    swapBtn.addEventListener("click", async () => {
      const fromToken = (
        document.getElementById("fromTokenAddress") as HTMLInputElement
      )?.value;
      const toToken = (
        document.getElementById("toTokenAddress") as HTMLInputElement
      )?.value;
      const amount = (document.getElementById("swapAmount") as HTMLInputElement)
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

      // Convert amount to proper decimals
      const decimals =
        fromToken === "So11111111111111111111111111111111111111112" ? 9 : 6;
      const swapAmount = Math.floor(
        parseFloat(amount) * Math.pow(10, decimals)
      );

      await executeSwap(context, [
        "",
        "",
        "",
        fromToken,
        toToken,
        swapAmount.toString(),
      ]);
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
 * Execute a token swap
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

    const state = context.multichain.solana.state;

    if (!state.connected || !state.publicKey) {
      context.log("❌ Please connect your wallet first", "error");
      const helpHtml = `
        <div style="margin: 8px 0;">
          ${createCommandLine("solana connect", "Connect your Solana wallet")}
          ${createCommandLine("solana generate", "Generate a new Solana wallet")}
        </div>
      `;
      context.logHtml(helpHtml);
      return;
    }

    if (args.length < 3) {
      const usageHtml = createUsageError("solana swap execute <from_mint> <to_mint> <amount> [slippage_bps]", [
        "solana swap execute So11111111111111111111111111111111111111112 EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v 1000000",
        "solana swap execute So11...AA Bonk...AA 1000000 50",
      ]);
      context.logHtml(usageHtml);
      return;
    }

    const [fromMint, toMint, amount] = args;
    const slippageBps = args[3] ? parseInt(args[3]) : 50;

    context.log("💱 Executing swap...", "info");
    context.log(`   From: ${fromMint}`, "info");
    context.log(`   To: ${toMint}`, "info");
    context.log(`   Amount: ${amount}`, "info");
    context.log(`   Slippage: ${slippageBps / 100}%`, "info");
    context.log("", "info");

    // Step 1: Get swap quote
    context.log("📊 Getting swap quote...", "info");
    const quote = await solana.getSwapQuote(
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
    const txResult = await solana.getSwapTransaction(quote, state.publicKey);

    if (!txResult || !txResult.swapTransaction) {
      context.log("❌ Failed to build swap transaction", "error");
      return;
    }

    context.log("✅ Transaction built", "success");
    context.log("", "info");

    // Step 3: Send transaction
    context.log("📤 Sending transaction...", "info");
    const signature = await context.multichain.solana.sendTransaction(
      txResult.swapTransaction
    );

    if (signature) {
      context.log("✅ Swap executed successfully!", "success");
      context.log(`🔗 Signature: ${signature}`, "info");
      context.log("", "info");
      context.log(
        `🔍 View on Solana Explorer: https://explorer.solana.com/tx/${signature}`,
        "info"
      );
      context.log(
        `🔍 View on Solscan: https://solscan.io/tx/${signature}`,
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
 * Export Solana commands
 */
export const solanaCommands: Command[] = [solanaCommand];
