/**
 * Base Network Commands
 * Network operations for Base
 */

import type { Command, CommandContext } from "@/types/commands";
import { createUsageError, createSwapStatusNotice, createCommandLine } from "./command-output-helpers";
import { NETWORK_CONFIGS, createNetworkSwapInterfaceHTML, setupNetworkSwapInterface } from "./network-helpers";

const network = NETWORK_CONFIGS.base;

/**
 * Base command - Network operations for Base
 */
export const baseCommand: Command = {
  name: "base",
  description: "Base network operations",
  usage: "base <balance|swap|help>",
  category: "network",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showBaseHelp(context);
      return;
    }

    switch (subcommand) {
      case "balance":
        await getBaseBalance(context);
        break;
      case "swap":
        if (args.length >= 5) {
          await handleBaseSwap(context, args);
        } else {
          await showBaseSwapInterface(context);
        }
        break;
      default:
        context.log(`❌ Unknown subcommand: ${subcommand}`, "error");
        showBaseHelp(context);
    }
  },
};

function showBaseHelp(context: CommandContext): void {
  const helpLines: string[] = [
    "base",
    "",
    "Base network operations",
    "",
    "→ Usage: base <balance|swap|help>",
    "",
    "═ Commands ═",
    "",
    "base balance",
    "",
    `Check ${network.nativeTokenSymbol} balance on Base`,
    "",
    "→ Usage: base balance",
    "",
    "base swap",
    "",
    "Swap tokens on Base using Uniswap & PancakeSwap",
    "",
    "→ Usage: base swap <fromToken> <toToken> <amount>",
    `  Example: base swap ETH USDC 1`,
    "  Example: base swap USDC DAI 100",
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
        ═══ BASE NETWORK ═══
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
      const isCommand = line.startsWith("base ") && line.length < 50;
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

async function getBaseBalance(context: CommandContext): Promise<void> {
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
 * Show interactive Base swap interface
 */
async function showBaseSwapInterface(context: CommandContext): Promise<void> {
  if (!context.wallet?.address) {
    context.log("❌ Please connect your wallet first", "error");
    const helpHtml = `
      <div style="margin: 8px 0;">
        ${createCommandLine("connect", "Connect your wallet")}
        ${createCommandLine("base help", "See Base commands")}
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  context.log(`💱 ${network.name} Swap Interface`, "info");

  const html = createNetworkSwapInterfaceHTML(network, "base");
  context.logHtml(html);

  if (typeof window !== "undefined") {
    setTimeout(() => {
      setupNetworkSwapInterface(context, network, "base", "base", async (ctx, fromToken, toToken, amount) => {
        await handleBaseSwapDirect(ctx, fromToken, toToken, amount);
      });
    }, 100);
  }
}

async function handleBaseSwapDirect(
  context: CommandContext,
  fromToken: string,
  toToken: string,
  amount: string
): Promise<void> {
  const tokenMap: Record<string, string> = {};
  network.tokens.forEach(token => {
    tokenMap[token.address] = token.symbol;
  });

  const fromSymbol = tokenMap[fromToken] || fromToken;
  const toSymbol = tokenMap[toToken] || toToken;

  context.log(`💱 Preparing ${network.name} transaction...`, "info");
  context.log(`   From: ${amount} ${fromSymbol}`, "info");
  context.log(`   To: ${toSymbol}`, "info");
  context.log("", "info");

  try {
    context.logHtml(
      createSwapStatusNotice({
        network: network.name,
        status: "coming-soon",
        icon: "💱",
        title: `${network.name} Token Swap`,
        description: [
          `${network.name} token swap functionality is currently in development.`,
          `Swap ${amount} ${fromSymbol} for ${toSymbol} on ${network.name}.`,
          "For now, please use Uniswap or PancakeSwap directly for token swaps.",
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

async function handleBaseSwap(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const fromToken = args[2];
  const toToken = args[3];
  const amount = args[4];

  if (!fromToken || !toToken || !amount) {
    const usageHtml = createUsageError(`base swap <fromToken> <toToken> <amount>`, [
      "base swap ETH USDC 1",
      "base swap USDC DAI 100",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  if (!context.wallet?.address) {
    context.log("❌ Please connect your wallet first", "error");
    const helpHtml = `
      <div style="margin: 8px 0;">
        ${createCommandLine("connect", "Connect your wallet")}
        ${createCommandLine("base help", "See Base commands")}
      </div>
    `;
    context.logHtml(helpHtml);
    return;
  }

  await handleBaseSwapDirect(context, fromToken, toToken, amount);
}

export const baseCommands: Command[] = [baseCommand];

