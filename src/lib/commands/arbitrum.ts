/**
 * Arbitrum Network Commands
 * Network operations for Arbitrum
 */

import type { Command, CommandContext } from "@/types/commands";
import { createUsageError, createSwapStatusNotice, createCommandLine } from "./command-output-helpers";
import { NETWORK_CONFIGS, createNetworkSwapInterfaceHTML, setupNetworkSwapInterface } from "./network-helpers";

const network = NETWORK_CONFIGS.arbitrum;

/**
 * Arbitrum command - Network operations for Arbitrum
 */
export const arbitrumCommand: Command = {
  name: "arbitrum",
  description: "Arbitrum network operations",
  usage: "arbitrum <balance|swap|help>",
  category: "network",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showArbitrumHelp(context);
      return;
    }

    switch (subcommand) {
      case "balance":
        await getArbitrumBalance(context);
        break;
      case "swap":
        if (args.length >= 5) {
          await handleArbitrumSwap(context, args);
        } else {
          await showArbitrumSwapInterface(context);
        }
        break;
      default:
        context.log(`❌ Unknown subcommand: ${subcommand}`, "error");
        showArbitrumHelp(context);
    }
  },
};

function showArbitrumHelp(context: CommandContext): void {
  const helpLines: string[] = [
    "arbitrum",
    "",
    "Arbitrum network operations",
    "",
    "→ Usage: arbitrum <balance|swap|help>",
    "",
    "═ Commands ═",
    "",
    "arbitrum balance",
    "",
    `Check ${network.nativeTokenSymbol} balance on Arbitrum`,
    "",
    "→ Usage: arbitrum balance",
    "",
    "arbitrum swap",
    "",
    "Swap tokens on Arbitrum using Uniswap & PancakeSwap",
    "",
    "→ Usage: arbitrum swap <fromToken> <toToken> <amount>",
    `  Example: arbitrum swap ETH USDC 1`,
    "  Example: arbitrum swap USDC ARB 100",
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
        ═══ ARBITRUM NETWORK ═══
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
      const isCommand = line.startsWith("arbitrum ") && line.length < 50;
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

async function getArbitrumBalance(context: CommandContext): Promise<void> {
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

  context.log(`💰 Fetching ${network.name} balance...`, "info");

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
          💰 ${network.name} Balance
        </div>
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="margin-bottom: 12px;">
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">${network.nativeTokenSymbol} Balance:</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 18px; font-weight: bold;">
              Loading...
            </div>
          </div>
          <div style="color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent); font-size: 11px; margin-top: 8px;">
            💡 Connect to ${network.name} network to view balance
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
 * Show interactive Arbitrum swap interface
 */
async function showArbitrumSwapInterface(context: CommandContext): Promise<void> {
  if (!context.wallet?.address) {
    context.log("❌ Please connect your wallet first", "error");
    const helpHtml = `
      <div style="margin: 8px 0;">
        ${createCommandLine("connect", "Connect your wallet")}
        ${createCommandLine("arbitrum help", "See Arbitrum commands")}
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  context.log(`💱 ${network.name} Swap Interface`, "info");

  const html = createNetworkSwapInterfaceHTML(network, "arbitrum");
  context.logHtml(html);

  if (typeof window !== "undefined") {
    setTimeout(() => {
      setupNetworkSwapInterface(context, network, "arbitrum", "arbitrum", async (ctx, fromToken, toToken, amount) => {
        await handleArbitrumSwapDirect(ctx, fromToken, toToken, amount);
      });
    }, 100);
  }
}

async function handleArbitrumSwapDirect(
  context: CommandContext,
  fromToken: string,
  toToken: string,
  amount: string
): Promise<void> {
}

async function handleArbitrumSwap(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const fromToken = args[2];
  const toToken = args[3];
  const amount = args[4];

  if (!fromToken || !toToken || !amount) {
    const usageHtml = createUsageError(`arbitrum swap <fromToken> <toToken> <amount>`, [
      "arbitrum swap ETH USDC 1",
      "arbitrum swap USDC ARB 100",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  if (!context.wallet?.address) {
    context.log("❌ Please connect your wallet first", "error");
    const helpHtml = `
      <div style="margin: 8px 0;">
        ${createCommandLine("connect", "Connect your wallet")}
        ${createCommandLine("arbitrum help", "See Arbitrum commands")}
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  await handleArbitrumSwapDirect(context, fromToken, toToken, amount);
}

export const arbitrumCommands: Command[] = [arbitrumCommand];

