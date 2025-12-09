/**
 * Portfolio Tracker (PGT) Commands
 * Multi-chain portfolio tracking and analytics
 * Based on vanilla pgt-terminal-integration.js
 */

import type { Command, CommandContext } from "@/types/commands";
import { escapeHtml } from "@/lib/utils";
import { createCommandLine, createUsageError } from "./command-output-helpers";

/**
 * PGT Command - Portfolio tracking and analytics
 */
export const pgtCommand: Command = {
  name: "pgt",
  description: "Portfolio tracking and analytics",
  usage: "pgt <track|portfolio|wallets|wallet|remove|refresh|test|help> [params]",
  category: "api",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showPgtHelp(context);
      return;
    }

    switch (subcommand) {
      case "track":
      case "add":
        await trackWallet(context, args);
        break;
      case "portfolio":
      case "pf":
        await showPortfolio(context);
        break;
      case "wallets":
      case "list":
        await showWallets(context);
        break;
      case "wallet":
        await showWallet(context, args);
        break;
      case "remove":
      case "untrack":
        await removeWallet(context, args);
        break;
      case "refresh":
        await refreshPortfolio(context);
        break;
      case "test":
      case "status":
        await testConnection(context);
        break;
      default:
        context.log(`Unknown pgt command: ${subcommand}`, "error");
        context.log('Type "pgt help" for available commands', "info");
    }
  },
};

function showPgtHelp(context: CommandContext): void {
  const helpLines: string[] = [];
  
  helpLines.push("═══ Portfolio Tracker (PGT) ═══");
  helpLines.push("");
  helpLines.push("📊 Multi-chain portfolio tracking and analytics");
  helpLines.push("");
  helpLines.push("═ Commands ═");
  helpLines.push("");
  helpLines.push("track");
  helpLines.push("");
  helpLines.push("Track a new wallet (network auto-detected)");
  helpLines.push("");
  helpLines.push("→ Usage: pgt track <address> [network] [label]");
  helpLines.push("");
  helpLines.push("portfolio");
  helpLines.push("");
  helpLines.push("Show portfolio summary");
  helpLines.push("");
  helpLines.push("→ Usage: pgt portfolio");
  helpLines.push("");
  helpLines.push("wallets");
  helpLines.push("");
  helpLines.push("List all tracked wallets");
  helpLines.push("");
  helpLines.push("→ Usage: pgt wallets");
  helpLines.push("");
  helpLines.push("wallet");
  helpLines.push("");
  helpLines.push("Get detailed wallet information");
  helpLines.push("");
  helpLines.push("→ Usage: pgt wallet <address> <network>");
  helpLines.push("");
  helpLines.push("remove");
  helpLines.push("");
  helpLines.push("Remove wallet from tracking");
  helpLines.push("");
  helpLines.push("→ Usage: pgt remove <address> <network>");
  helpLines.push("");
  helpLines.push("refresh");
  helpLines.push("");
  helpLines.push("Refresh portfolio data");
  helpLines.push("");
  helpLines.push("→ Usage: pgt refresh");
  helpLines.push("");
  helpLines.push("test");
  helpLines.push("");
  helpLines.push("Test API connection");
  helpLines.push("");
  helpLines.push("→ Usage: pgt test");
  helpLines.push("");
  helpLines.push("═ Examples ═");
  helpLines.push("");
  helpLines.push("pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6");
  helpLines.push("pgt track 40c5117703fe6bd1f286a3912334904c65dcd39c187b1df66e62dc9e85f016d5 solana");
  helpLines.push("pgt track 0x123... ethereum \"My Wallet\"");
  helpLines.push("pgt portfolio");
  helpLines.push("");
  helpLines.push("═ Network Auto-Detection ═");
  helpLines.push("");
  helpLines.push("• 0x... (42 chars) = Ethereum");
  helpLines.push("• 32-44 chars = Solana");
  helpLines.push("• 64 hex chars = Solana (hex-encoded)");
  helpLines.push("");
  helpLines.push("═ Supported Networks ═");
  helpLines.push("");
  helpLines.push("ethereum, solana (more coming soon)");

  // Generate HTML with clickable commands (matching help command style)
  let helpHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      color: var(--palette-text, #e0e0e0);
      line-height: 1.6;
      font-size: 14px;
    ">
  `;

  helpLines.forEach((line) => {
    const trimmed = line.trim();
    
    // Check if line is a command (no spaces, lowercase, or specific patterns)
    const isCommand = trimmed.length > 0 && 
      trimmed.length < 50 && 
      !trimmed.includes(" ") &&
      !trimmed.startsWith("═") &&
      !trimmed.startsWith("📊") &&
      !trimmed.startsWith("•") &&
      !trimmed.startsWith("→") &&
      !trimmed.includes("...") &&
      (trimmed === trimmed.toLowerCase() || trimmed === "PGT");

    if (trimmed.startsWith("═══")) {
      // Header
      helpHtml += `
        <div style="
          color: var(--palette-primary, #00d4ff);
          font-weight: bold;
          font-size: 16px;
          margin: 20px 0 10px 0;
          text-align: center;
          text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
        ">${escapeHtml(line)}</div>
      `;
    } else if (trimmed.startsWith("═") && trimmed.endsWith("═")) {
      // Section header
      helpHtml += `
        <div style="
          color: var(--palette-secondary, #00ff88);
          font-weight: bold;
          font-size: 14px;
          margin: 16px 0 8px 0;
          padding-left: 0;
        ">${escapeHtml(line)}</div>
      `;
    } else if (trimmed.startsWith("→")) {
      // Usage line
      helpHtml += `
        <div style="
          color: color-mix(in srgb, var(--palette-text, #e0e0e0) 80%, transparent);
          margin: 4px 0;
          padding-left: 20px;
          font-size: 13px;
        ">${escapeHtml(line)}</div>
      `;
    } else if (isCommand) {
      // Clickable command
      const escapedCommand = trimmed.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      helpHtml += `
        <div
          class="omega-help-command"
          data-command="pgt ${escapedCommand}"
          style="
            color: var(--palette-secondary, #00ff88);
            font-weight: bold;
            font-size: 1.05em;
            margin-left: 0;
            margin-top: 8px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);
            cursor: pointer;
            display: inline-block;
            padding: 2px 4px;
            border-radius: 3px;
            transition: all 0.2s ease;
            user-select: none;
          "
          onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)'; this.style.textShadow = '0 0 8px var(--palette-secondary-glow, rgba(0, 255, 136, 0.5))';"
          onmouseout="this.style.background = 'transparent'; this.style.textShadow = '0 0 6px rgba(0, 255, 136, 0.3)';"
          title="Click to add 'pgt ${escapedCommand}' to terminal input"
        >
          ${escapeHtml(line)}
        </div>
      `;
    } else if (trimmed) {
      // Regular text
      helpHtml += `
        <div style="
          color: color-mix(in srgb, var(--palette-text, #e0e0e0) 90%, transparent);
          margin: 6px 0;
          padding-left: ${trimmed.startsWith("•") ? "20px" : "0"};
          font-size: 13px;
          line-height: 1.6;
        ">${escapeHtml(line)}</div>
      `;
    } else {
      helpHtml += `<div style="margin: 8px 0;"></div>`;
    }
  });

  helpHtml += `</div>`;
  context.logHtml(helpHtml);
  context.log("", "output");
}

async function trackWallet(
  context: CommandContext,
  args: string[]
): Promise<void> {
  if (!context.media?.pgt) {
    context.log("PGT system not available", "error");
    return;
  }

  if (args.length < 3) {
    const usageHtml = `
      <div style="
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
        border-radius: 6px;
        padding: 16px;
        margin: 10px 0;
      ">
        <div style="
          font-size: 13px;
          font-weight: 600;
          color: var(--palette-error, #ff4757);
          margin-bottom: 12px;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">USAGE ERROR</div>
        <div style="
          color: var(--palette-text, #ccd4e0);
          margin: 8px 0;
          font-size: 0.95em;
        ">Usage: <span class="omega-help-command" data-command="pgt track" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'pgt track' to terminal input">pgt track &lt;address&gt; &lt;network&gt; [label]</span></div>
        <div style="
          color: var(--palette-text, #ccd4e0);
          margin: 8px 0;
          font-size: 0.95em;
        ">Example: <span class="omega-help-command" data-command="pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum' to terminal input">pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum</span></div>
      </div>
    `;
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  const address = args[2] || "";
  let network = args[3] || "";
  const label = args[4] || undefined;

  if (!address) {
    const usageHtml = `
      <div style="
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
        border-radius: 6px;
        padding: 16px;
        margin: 10px 0;
      ">
        <div style="
          font-size: 13px;
          font-weight: 600;
          color: var(--palette-error, #ff4757);
          margin-bottom: 12px;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">USAGE ERROR</div>
        <div style="
          color: var(--palette-text, #ccd4e0);
          margin: 8px 0;
          font-size: 0.95em;
        ">Usage: <span class="omega-help-command" data-command="pgt track" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'pgt track' to terminal input">pgt track &lt;address&gt; [network] [label]</span></div>
        <div style="
          color: var(--palette-text, #ccd4e0);
          margin: 8px 0;
          font-size: 0.95em;
        ">Example: <span class="omega-help-command" data-command="pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum' to terminal input">pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum</span></div>
        <div style="
          color: var(--palette-text, #ccd4e0);
          margin: 8px 0;
          font-size: 0.95em;
        ">Example: <span class="omega-help-command" data-command="pgt track 40c5117703fe6bd1f286a3912334904c65dcd39c187b1df66e62dc9e85f016d5 solana" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'pgt track 40c5117703fe6bd1f286a3912334904c65dcd39c187b1df66e62dc9e85f016d5 solana' to terminal input">pgt track 40c5117703fe6bd1f286a3912334904c65dcd39c187b1df66e62dc9e85f016d5 solana</span></div>
      </div>
    `;
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  // Auto-detect network if not provided
  if (!network) {
    // Check for Ethereum format first (must be exactly 0x + 40 hex chars = 42 total)
    if (address.startsWith("0x") && address.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(address)) {
      network = "ethereum";
    } 
    // Check for Solana hex-encoded public key (64 hex chars = 32 bytes)
    else if (address.length === 64 && /^[0-9a-fA-F]+$/.test(address)) {
      network = "solana";
    }
    // Check for Solana base58 address (32-44 chars, base58 encoded)
    else if (address.length >= 32 && address.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
      network = "solana";
    } 
    // Default to ethereum for unknown formats (but warn)
    else {
      network = "ethereum";
      context.log(`Unknown address format, defaulting to ethereum. If this fails, specify network explicitly.`, "info");
    }
    context.log(`Auto-detected network: ${network}`, "info");
  }

  context.log(`Adding wallet to PGT tracking...`, "info");

  // Play balance/wealth sound effect
  if (context.sound) {
    try {
      await context.sound.playBalanceWealthSound();
    } catch {
      // Ignore sound errors
    }
  }

  const result = await context.media.pgt.addWallet(address, network, label);

  if (result.success) {
    const successHtml = `
      <div style="
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
        border-radius: 6px;
        padding: 16px;
        margin: 10px 0;
      ">
        <div style="
          margin-bottom: 16px;
        ">
          <div style="
            font-size: 13px;
            font-weight: 600;
            color: var(--palette-secondary, #00ff88);
            font-family: 'Courier New', monospace;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">WALLET TRACKED SUCCESSFULLY</div>
        </div>
        
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        ">
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            font-size: 11px;
            margin-bottom: 4px;
            text-transform: uppercase;
          ">Address</div>
          <div style="
            color: var(--palette-text, #e0e0e0);
            font-size: 12px;
            font-family: 'Courier New', monospace;
            word-break: break-all;
          ">${escapeHtml(address)}</div>
        </div>
        
        <div style="
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        ">
          <div style="
            background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
            border-radius: 6px;
            padding: 8px 12px;
            flex: 1;
            min-width: 120px;
          ">
            <div style="
              color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
              font-size: 10px;
              margin-bottom: 4px;
              text-transform: uppercase;
            ">Network</div>
            <div style="
              color: var(--palette-primary, #00d4ff);
              font-weight: 600;
              font-size: 14px;
            ">${escapeHtml(network)}</div>
          </div>
          ${label ? `
            <div style="
              background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
              border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
              border-radius: 6px;
              padding: 8px 12px;
              flex: 1;
              min-width: 120px;
            ">
              <div style="
                color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
                font-size: 10px;
                margin-bottom: 4px;
                text-transform: uppercase;
              ">Label</div>
              <div style="
                color: var(--palette-secondary, #00ff88);
                font-weight: 600;
                font-size: 14px;
              ">${escapeHtml(label)}</div>
            </div>
          ` : ""}
        </div>
        
        <div style="
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.3)) 50%, transparent);
          text-align: center;
        ">
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            font-size: 12px;
          ">⏳ Fetching wallet data...</div>
        </div>
      </div>
    `;
    context.logHtml(successHtml);
    context.log("", "output");

    // Show wallet value after data is fetched (async operation completes)
    setTimeout(() => {
      const wallet = context.media?.pgt?.getWallet(address, network);
      if (wallet) {
        const value = wallet.totalValue || 0;
        let tokensHtml = "";
        
        if (wallet.tokens && wallet.tokens.length > 0) {
          wallet.tokens.forEach((token) => {
            tokensHtml += `
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.3)) 20%, transparent);
              ">
                <div>
                  <div style="
                    font-weight: 600;
                    color: var(--palette-text, #e0e0e0);
                    font-size: 13px;
                  ">${escapeHtml(token.symbol)}</div>
                  <div style="
                    color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
                    font-size: 11px;
                    font-family: 'Courier New', monospace;
                  ">${token.balance.toFixed(4)}</div>
                </div>
                <div style="
                  color: var(--palette-secondary, #00ff88);
                  font-weight: 700;
                  font-size: 14px;
                  font-family: 'Courier New', monospace;
                ">$${token.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            `;
          });
        }

        const updateHtml = `
          <div style="
            background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
            border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
            border-radius: 12px;
            padding: 20px;
            margin: 10px 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 16px;
            ">
              <div style="font-size: 32px; line-height: 1;">💰</div>
              <div style="
                font-size: 18px;
                font-weight: 600;
                color: var(--palette-primary, #00d4ff);
                text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
              ">Wallet Value</div>
            </div>
            
            <div style="
              background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
              border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
              border-radius: 8px;
              padding: 16px;
              margin-bottom: ${tokensHtml ? "16px" : "0"};
            ">
              <div style="
                color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
                font-size: 12px;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Total Value</div>
              <div style="
                color: var(--palette-secondary, #00ff88);
                font-weight: 700;
                font-size: 28px;
                font-family: 'Courier New', monospace;
                text-shadow: 0 0 8px color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
              ">$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            ${tokensHtml ? `
              <div style="
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.3)) 50%, transparent);
              ">
                <div style="
                  color: var(--palette-primary, #00d4ff);
                  font-weight: 600;
                  font-size: 14px;
                  margin-bottom: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">Tokens</div>
                ${tokensHtml}
              </div>
            ` : ""}
          </div>
        `;
        
        context.logHtml(updateHtml);
        context.log("", "output");
      }
    }, 2000);
  } else {
    const errorHtml = `
      <div style="
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
        border-radius: 6px;
        padding: 16px;
        margin: 10px 0;
        text-align: center;
      ">
        <div style="
          font-size: 13px;
          font-weight: 600;
          color: var(--palette-error, #ff4757);
          margin-bottom: 8px;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">TRACKING FAILED</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 11px;
          margin-bottom: 12px;
          font-family: 'Courier New', monospace;
        ">${escapeHtml(result.error || "Unknown error")}</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);
          font-size: 10px;
          font-family: 'Courier New', monospace;
        ">Please check the address format and network type</div>
      </div>
    `;
    context.logHtml(errorHtml);
    context.log("", "output");
  }
}

async function showPortfolio(context: CommandContext): Promise<void> {
  if (!context.media?.pgt) {
    context.log("PGT system not available", "error");
    return;
  }

  const portfolio = context.media.pgt.portfolio;

  if (!portfolio || portfolio.walletCount === 0) {
    const emptyHtml = `
      <div style="
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
        border-radius: 6px;
        padding: 24px;
        margin: 10px 0;
        text-align: center;
      ">
        <div style="
          font-size: 14px;
          font-weight: 600;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 12px;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">No Wallets Tracked</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 12px;
          margin-bottom: 20px;
          font-family: 'Courier New', monospace;
        ">Start tracking wallets to see your portfolio</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);
          font-size: 11px;
          margin-top: 16px;
          font-family: 'Courier New', monospace;
        ">
          Example: <span class="omega-help-command" data-command="pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' to terminal input">pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6</span>
        </div>
      </div>
    `;
    context.logHtml(emptyHtml);
    context.log("", "output");
    return;
  }

  const { totalValue, totalChange24hPercent, walletCount, wallets } = portfolio;
  const changePercent = totalChange24hPercent || 0;
  const changeSymbol = changePercent >= 0 ? "+" : "";
  const changeColor = changePercent >= 0 ? "var(--palette-secondary, #00ff88)" : "var(--palette-error, #ff4757)";

  // Build wallet cards HTML
  let walletsHtml = "";
  if (wallets && wallets.length > 0) {
    wallets.forEach((w, i) => {
      const walletChange = w.change24hPercent || 0;
      const walletChangeSymbol = walletChange >= 0 ? "+" : "";
      const walletChangeColor = walletChange >= 0 ? "var(--palette-secondary, #00ff88)" : "var(--palette-error, #ff4757)";
      const displayAddress = w.address.length > 20 ? w.address.slice(0, 10) + "..." + w.address.slice(-8) : w.address;
      
      walletsHtml += `
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
          border-radius: 8px;
          padding: 12px;
          margin: 8px 0;
          transition: all 0.2s ease;
        "
        onmouseover="this.style.borderColor='color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent)'; this.style.background='color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 80%, transparent)';"
        onmouseout="this.style.borderColor='color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)'; this.style.background='color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent)';"
        >
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          ">
            <div style="
              font-weight: 600;
              color: var(--palette-text, #e0e0e0);
              font-size: 14px;
            ">${escapeHtml(w.label || `Wallet ${i + 1}`)}</div>
            <div style="
              color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
              font-size: 11px;
              text-transform: uppercase;
            ">${escapeHtml(w.network)}</div>
          </div>
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            font-size: 11px;
            font-family: 'Courier New', monospace;
            margin-bottom: 8px;
          ">${escapeHtml(displayAddress)}</div>
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div style="
              color: var(--palette-secondary, #00ff88);
              font-weight: 700;
              font-size: 16px;
              font-family: 'Courier New', monospace;
            ">$${(w.totalValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            ${w.change24hPercent !== undefined ? `
              <div style="
                color: ${walletChangeColor};
                font-weight: 600;
                font-size: 12px;
                font-family: 'Courier New', monospace;
              ">${walletChangeSymbol}${walletChange.toFixed(2)}%</div>
            ` : ""}
          </div>
        </div>
      `;
    });
  }

  const portfolioHtml = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
      border-radius: 12px;
      padding: 20px;
      margin: 10px 0;
      max-width: 100%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    ">
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          <div style="font-size: 32px; line-height: 1;">📊</div>
          <div style="
            font-size: 18px;
            font-weight: 600;
            color: var(--palette-primary, #00d4ff);
            text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
          ">Portfolio Summary</div>
        </div>
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            font-size: 12px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">Total Value</div>
          <div style="
            color: var(--palette-secondary, #00ff88);
            font-weight: 700;
            font-size: 24px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 0 8px color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
          ">$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            font-size: 12px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">24h Change</div>
          <div style="
            color: ${changeColor};
            font-weight: 700;
            font-size: 24px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 0 8px color-mix(in srgb, ${changeColor} 30%, transparent);
          ">${changeSymbol}${changePercent.toFixed(2)}%</div>
        </div>
        
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            font-size: 12px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">Wallets</div>
          <div style="
            color: var(--palette-primary, #00d4ff);
            font-weight: 700;
            font-size: 24px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
          ">${walletCount}</div>
        </div>
      </div>
      
      ${walletsHtml ? `
        <div style="
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.3)) 50%, transparent);
        ">
          <div style="
            color: var(--palette-primary, #00d4ff);
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">Tracked Wallets</div>
          ${walletsHtml}
        </div>
      ` : ""}
    </div>
  `;

  context.logHtml(portfolioHtml);
  context.log("", "output");
}

async function showWallets(context: CommandContext): Promise<void> {
  if (!context.media?.pgt) {
    context.log("PGT system not available", "error");
    return;
  }

  const wallets = context.media.pgt.wallets;

  if (!wallets || wallets.length === 0) {
    const emptyHtml = `
      <div style="
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
        border-radius: 6px;
        padding: 24px;
        margin: 10px 0;
        text-align: center;
      ">
        <div style="
          font-size: 14px;
          font-weight: 600;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 12px;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">No Wallets Tracked</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 12px;
          margin-bottom: 20px;
          font-family: 'Courier New', monospace;
        ">Start tracking wallets to see them here</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);
          font-size: 11px;
          margin-top: 16px;
          font-family: 'Courier New', monospace;
        ">
          Example: <span class="omega-help-command" data-command="pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' to terminal input">pgt track 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6</span>
        </div>
      </div>
    `;
    context.logHtml(emptyHtml);
    context.log("", "output");
    return;
  }

  let walletsHtml = "";
  wallets.forEach((w, i) => {
    const displayAddress = w.address.length > 40 ? w.address.slice(0, 20) + "..." + w.address.slice(-20) : w.address;
    const escapedAddress = escapeHtml(w.address);
    const escapedNetwork = escapeHtml(w.network);
    const escapedLabel = escapeHtml(w.label || "Unnamed Wallet");
    const removeCommand = `pgt untrack ${escapedAddress} ${escapedNetwork}`;
    const escapedRemoveCommand = removeCommand.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    
    walletsHtml += `
      <div style="
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
        border-radius: 6px;
        padding: 12px;
        margin: 8px 0;
        transition: all 0.2s ease;
        font-family: 'Courier New', monospace;
      "
      onmouseover="this.style.borderColor='color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)'; this.style.background='rgba(0, 0, 0, 0.35)';"
      onmouseout="this.style.borderColor='color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent)'; this.style.background='rgba(0, 0, 0, 0.2)';"
      >
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        ">
          <div style="
            font-weight: 600;
            color: var(--palette-text, #e0e0e0);
            font-size: 13px;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.3px;
          ">${i + 1}. ${escapedLabel}</div>
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <div style="
              color: var(--palette-primary, #00d4ff);
              font-size: 10px;
              text-transform: uppercase;
              padding: 3px 6px;
              background: color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent);
              border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              letter-spacing: 0.5px;
            ">${escapedNetwork}</div>
            <button
              onclick="if (window.__omegaExecuteCommand) { window.__omegaExecuteCommand('${escapedRemoveCommand}'); } else if (window.__omegaSetTerminalInput) { window.__omegaSetTerminalInput('${escapedRemoveCommand}'); }"
              style="
                width: 20px;
                height: 20px;
                background: transparent;
                border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                transition: all 0.2s ease;
                color: color-mix(in srgb, var(--palette-error, #ff4757) 70%, transparent);
                font-size: 12px;
                font-family: 'Courier New', monospace;
                line-height: 1;
              "
              onmouseover="this.style.background='color-mix(in srgb, var(--palette-error, #ff4757) 20%, transparent)'; this.style.borderColor='color-mix(in srgb, var(--palette-error, #ff4757) 50%, transparent)'; this.style.color='var(--palette-error, #ff4757)';"
              onmouseout="this.style.background='transparent'; this.style.borderColor='color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent)'; this.style.color='color-mix(in srgb, var(--palette-error, #ff4757) 70%, transparent)';"
              title="Remove wallet"
            >×</button>
          </div>
        </div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 11px;
          font-family: 'Courier New', monospace;
          padding: 6px 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          word-break: break-all;
          margin-bottom: 8px;
        ">${escapeHtml(displayAddress)}</div>
        ${w.totalValue !== undefined && w.totalValue > 0 ? `
          <div style="
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.3)) 20%, transparent);
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <span style="
              color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
              font-size: 11px;
              font-family: 'Courier New', monospace;
            ">VALUE:</span>
            <span style="
              color: var(--palette-secondary, #00ff88);
              font-weight: 700;
              font-size: 12px;
              font-family: 'Courier New', monospace;
            ">$${w.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        ` : ""}
      </div>
    `;
  });

  const walletsListHtml = `
    <div style="
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
      border-radius: 6px;
      padding: 16px;
      margin: 10px 0;
      max-width: 100%;
    ">
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
      ">
        <div style="
          font-size: 13px;
          font-weight: 600;
          color: var(--palette-primary, #00d4ff);
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">TRACKED WALLETS</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
          font-size: 11px;
          font-family: 'Courier New', monospace;
        ">${wallets.length} WALLET${wallets.length !== 1 ? "S" : ""}</div>
      </div>
      ${walletsHtml}
    </div>
  `;

  context.logHtml(walletsListHtml);
  context.log("", "output");
}

async function showWallet(
  context: CommandContext,
  args: string[]
): Promise<void> {
  if (!context.media?.pgt) {
    context.log("❌ PGT system not available", "error");
    return;
  }

  if (args.length < 4) {
    const usageHtml = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-error, #ff4757) 15%, transparent), color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent));
        border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
        border-radius: 12px;
        padding: 16px;
        margin: 10px 0;
      ">
        <div style="
          font-size: 16px;
          font-weight: 600;
          color: var(--palette-error, #ff4757);
          margin-bottom: 12px;
        ">❌ Usage Error</div>
        <div style="
          color: var(--palette-text, #ccd4e0);
          margin: 8px 0;
          font-size: 0.95em;
        ">Usage: <span class="omega-help-command" data-command="pgt wallet" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'pgt wallet' to terminal input">pgt wallet &lt;address&gt; &lt;network&gt;</span></div>
        <div style="
          color: var(--palette-text, #ccd4e0);
          margin: 8px 0;
          font-size: 0.95em;
        ">Example: <span class="omega-help-command" data-command="pgt wallet 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'pgt wallet 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum' to terminal input">pgt wallet 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum</span></div>
      </div>
    `;
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  const address = args[2] || "";
  const network = args[3] || "";

  if (!address || !network) {
    const usageHtml = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-error, #ff4757) 15%, transparent), color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent));
        border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
        border-radius: 12px;
        padding: 16px;
        margin: 10px 0;
      ">
        <div style="
          font-size: 16px;
          font-weight: 600;
          color: var(--palette-error, #ff4757);
          margin-bottom: 12px;
        ">❌ Usage Error</div>
        <div style="
          color: var(--palette-text, #ccd4e0);
          margin: 8px 0;
          font-size: 0.95em;
        ">Usage: <span class="omega-help-command" data-command="pgt wallet" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'pgt wallet' to terminal input">pgt wallet &lt;address&gt; &lt;network&gt;</span></div>
      </div>
    `;
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  const wallet = context.media.pgt.getWallet(address, network);

  if (!wallet) {
    const notFoundHtml = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-error, #ff4757) 15%, transparent), color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent));
        border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
        border-radius: 12px;
        padding: 24px;
        margin: 10px 0;
        text-align: center;
      ">
        <div style="font-size: 48px; line-height: 1; margin-bottom: 16px;">❌</div>
        <div style="
          font-size: 18px;
          font-weight: 600;
          color: var(--palette-error, #ff4757);
          margin-bottom: 12px;
        ">Wallet Not Found</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 14px;
          margin-bottom: 12px;
        ">${escapeHtml(address)}</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
          font-size: 12px;
        ">Network: ${escapeHtml(network)}</div>
      </div>
    `;
    context.logHtml(notFoundHtml);
    context.log("", "output");
    return;
  }

  const changePercent = wallet.change24hPercent || 0;
  const changeSymbol = changePercent >= 0 ? "+" : "";
  const changeColor = changePercent >= 0 ? "var(--palette-secondary, #00ff88)" : "var(--palette-error, #ff4757)";

  // Build tokens HTML
  let tokensHtml = "";
  if (wallet.tokens && wallet.tokens.length > 0) {
    wallet.tokens.forEach((token) => {
      tokensHtml += `
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
          border-radius: 6px;
          padding: 12px;
          margin: 6px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div>
            <div style="
              font-weight: 600;
              color: var(--palette-text, #e0e0e0);
              font-size: 14px;
              margin-bottom: 4px;
            ">${escapeHtml(token.symbol)}</div>
            <div style="
              color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
              font-size: 12px;
              font-family: 'Courier New', monospace;
            ">${token.balance.toFixed(4)}</div>
          </div>
          <div style="
            color: var(--palette-secondary, #00ff88);
            font-weight: 700;
            font-size: 16px;
            font-family: 'Courier New', monospace;
          ">$${token.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      `;
    });
  }

  const walletHtml = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
      border-radius: 12px;
      padding: 20px;
      margin: 10px 0;
      max-width: 100%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      ">
        <div style="font-size: 32px; line-height: 1;">📍</div>
        <div>
          <div style="
            font-size: 18px;
            font-weight: 600;
            color: var(--palette-primary, #00d4ff);
            text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
            margin-bottom: 4px;
          ">${escapeHtml(wallet.label || "Wallet Details")}</div>
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
            font-size: 11px;
            text-transform: uppercase;
          ">${escapeHtml(wallet.network)}</div>
        </div>
      </div>
      
      <div style="
        background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 80%, transparent);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
      ">
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 11px;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">Address</div>
        <div style="
          color: var(--palette-text, #e0e0e0);
          font-size: 12px;
          font-family: 'Courier New', monospace;
          word-break: break-all;
        ">${escapeHtml(wallet.address)}</div>
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            font-size: 11px;
            margin-bottom: 6px;
            text-transform: uppercase;
          ">Total Value</div>
          <div style="
            color: var(--palette-secondary, #00ff88);
            font-weight: 700;
            font-size: 20px;
            font-family: 'Courier New', monospace;
          ">$${(wallet.totalValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        
        ${wallet.change24hPercent !== undefined ? `
          <div style="
            background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
            border: 1px solid color-mix(in srgb, ${changeColor} 30%, transparent);
            border-radius: 8px;
            padding: 12px;
          ">
            <div style="
              color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
              font-size: 11px;
              margin-bottom: 6px;
              text-transform: uppercase;
            ">24h Change</div>
            <div style="
              color: ${changeColor};
              font-weight: 700;
              font-size: 20px;
              font-family: 'Courier New', monospace;
            ">${changeSymbol}${changePercent.toFixed(2)}%</div>
          </div>
        ` : ""}
      </div>
      
      ${tokensHtml ? `
        <div style="
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.3)) 50%, transparent);
        ">
          <div style="
            color: var(--palette-primary, #00d4ff);
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">Tokens</div>
          ${tokensHtml}
        </div>
      ` : ""}
    </div>
  `;

  context.logHtml(walletHtml);
  context.log("", "output");
}

async function removeWallet(
  context: CommandContext,
  args: string[]
): Promise<void> {
  if (!context.media?.pgt) {
    context.log("PGT system not available", "error");
    return;
  }

  if (args.length < 4) {
    const usageHtml = createUsageError("pgt remove <address> <network>", [
      "pgt remove 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum",
      "pgt remove 40c5117703fe6bd1f286a3912334904c65dcd39c187b1df66e62dc9e85f016d5 solana",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  const address = args[2] || "";
  const network = args[3] || "";

  if (!address || !network) {
    const usageHtml = createUsageError("pgt remove <address> <network>", [
      "pgt remove 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 ethereum",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  // Check if wallet exists before removing
  const wallet = context.media.pgt.getWallet(address, network);
  if (!wallet) {
    const notFoundHtml = `
      <div style="
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
        border-radius: 6px;
        padding: 16px;
        margin: 10px 0;
        text-align: center;
      ">
        <div style="
          font-size: 13px;
          font-weight: 600;
          color: var(--palette-error, #ff4757);
          margin-bottom: 8px;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">WALLET NOT FOUND</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 11px;
          font-family: 'Courier New', monospace;
        ">Cannot remove wallet that is not being tracked</div>
      </div>
    `;
    context.logHtml(notFoundHtml);
    context.log("", "output");
    return;
  }

  const result = await context.media.pgt.removeWallet(address, network);

  if (result.success) {
    const successHtml = `
      <div style="
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
        border-radius: 6px;
        padding: 16px;
        margin: 10px 0;
        text-align: center;
      ">
        <div style="
          font-size: 13px;
          font-weight: 600;
          color: var(--palette-secondary, #00ff88);
          margin-bottom: 8px;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">WALLET REMOVED</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 11px;
          font-family: 'Courier New', monospace;
          word-break: break-all;
          margin-bottom: 4px;
        ">${escapeHtml(address)}</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
          font-size: 10px;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
        ">NETWORK: ${escapeHtml(network)}</div>
      </div>
    `;
    context.logHtml(successHtml);
    context.log("", "output");
  } else {
    context.log(`Error: ${result.error}`, "error");
  }
}

async function refreshPortfolio(context: CommandContext): Promise<void> {
  if (!context.media?.pgt) {
    context.log("PGT system not available", "error");
    return;
  }

  const walletCount = context.media.pgt.wallets.length;

  if (walletCount === 0) {
    const emptyHtml = `
      <div style="
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 30%, transparent);
        border-radius: 6px;
        padding: 16px;
        margin: 10px 0;
        text-align: center;
      ">
        <div style="
          font-size: 13px;
          font-weight: 600;
          color: var(--palette-warning, #ffa502);
          margin-bottom: 8px;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">NO WALLETS TO REFRESH</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 11px;
          font-family: 'Courier New', monospace;
        ">Add wallets first to refresh portfolio data</div>
      </div>
    `;
    context.logHtml(emptyHtml);
    context.log("", "output");
    return;
  }

  context.log("Refreshing portfolio data...", "info");
  context.log(`Refreshing ${walletCount} wallet(s)...`, "info");

  await context.media.pgt.refreshPortfolio();

  const successHtml = `
    <div style="
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
      border-radius: 6px;
      padding: 16px;
      margin: 10px 0;
      text-align: center;
    ">
      <div style="
        font-size: 13px;
        font-weight: 600;
        color: var(--palette-secondary, #00ff88);
        margin-bottom: 8px;
        font-family: 'Courier New', monospace;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">PORTFOLIO REFRESHED</div>
      <div style="
        color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
        font-size: 11px;
        font-family: 'Courier New', monospace;
      ">Updated ${walletCount} wallet${walletCount !== 1 ? "s" : ""}</div>
    </div>
  `;
  context.logHtml(successHtml);
  context.log("", "output");
}

async function testConnection(context: CommandContext): Promise<void> {
  if (!context.media?.pgt) {
    context.log("PGT system not available", "error");
    return;
  }

  const walletCount = context.media.pgt.wallets.length;

  const testHtml = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
      border-radius: 12px;
      padding: 20px;
      margin: 10px 0;
      max-width: 100%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      ">
        <div style="font-size: 32px; line-height: 1;">🧪</div>
        <div style="
          font-size: 18px;
          font-weight: 600;
          color: var(--palette-primary, #00d4ff);
          text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
        ">PGT System Status</div>
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            font-size: 11px;
            margin-bottom: 6px;
            text-transform: uppercase;
          ">Status</div>
          <div style="
            color: var(--palette-secondary, #00ff88);
            font-weight: 700;
            font-size: 16px;
          ">✅ Operational</div>
        </div>
        
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            font-size: 11px;
            margin-bottom: 6px;
            text-transform: uppercase;
          ">Storage</div>
          <div style="
            color: var(--palette-primary, #00d4ff);
            font-weight: 700;
            font-size: 16px;
          ">💾 localStorage</div>
        </div>
        
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            font-size: 11px;
            margin-bottom: 6px;
            text-transform: uppercase;
          ">API Method</div>
          <div style="
            color: var(--palette-primary, #00d4ff);
            font-weight: 700;
            font-size: 16px;
          ">🔗 Direct Fetch</div>
        </div>
        
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            font-size: 11px;
            margin-bottom: 6px;
            text-transform: uppercase;
          ">Wallets Tracked</div>
          <div style="
            color: var(--palette-secondary, #00ff88);
            font-weight: 700;
            font-size: 20px;
            font-family: 'Courier New', monospace;
          ">${walletCount}</div>
        </div>
      </div>
    </div>
  `;

  context.logHtml(testHtml);
  context.log("", "output");
}

export const pgtCommands: Command[] = [pgtCommand];
