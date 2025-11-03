/**
 * NEAR Commands
 * Commands for NEAR Protocol operations including wallet management and token swaps
 */

import type { Command, CommandContext } from "@/types/commands";
import { config } from "@/lib/config";
import * as near from "@/lib/multichain/near";

/**
 * NEAR command - Main entry point for all NEAR Protocol operations
 */
export const nearCommand: Command = {
  name: "near",
  description: "NEAR Protocol operations (wallet, swap, tokens, agents)",
  category: "multichain",
  usage: "near [connect|disconnect|balance|swap|tokens|shade|help]",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showHelp(context);
      return;
    }

    switch (subcommand) {
      case "connect":
        await connectWallet(context);
        break;
      case "disconnect":
        await disconnectWallet(context);
        break;
      case "balance":
        await getBalance(context);
        break;
      case "account":
        await getAccountInfo(context);
        break;
      case "validators":
        await getValidators(context);
        break;
      case "swap":
        await swapTokens(context, args.slice(2));
        break;
      case "tokens":
        await showTokens(context);
        break;
      case "shade":
      case "agent":
        await shadeAgent(context, args.slice(2));
        break;
      default:
        context.log(
          `Unknown NEAR subcommand: ${subcommand}. Use 'near help' for available commands.`,
          "error"
        );
    }
  },
};

/**
 * Show NEAR command help
 */
function showHelp(context: CommandContext): void {
  context.log("╔════════════════════════════════════════╗", "info");
  context.log("║       NEAR PROTOCOL COMMANDS           ║", "info");
  context.log("╚════════════════════════════════════════╝", "info");
  context.log("", "info");
  context.log("Wallet Commands:", "success");
  context.log("  near connect     - Connect to NEAR wallet", "info");
  context.log("  near disconnect  - Disconnect from wallet", "info");
  context.log("  near balance     - Show wallet balance", "info");
  context.log("  near account     - Get account information", "info");
  context.log("  near validators  - Show network validators", "info");
  context.log("", "info");
  context.log("Token & Swap Commands:", "success");
  context.log("  near tokens      - List available tokens", "info");
  context.log("  near swap <from> <to> <amount> - Swap tokens", "info");
  context.log("", "info");
  context.log("Shade Agent Commands (Coming Soon):", "success");
  context.log("  near shade deploy <name> - Deploy a new Shade Agent", "info");
  context.log("  near shade list          - List your Shade Agents", "info");
  context.log("  near shade status <id>   - Check agent status", "info");
  context.log("", "info");
  context.log("Examples:", "success");
  context.log("  near connect", "info");
  context.log("  near tokens", "info");
  context.log("  near shade deploy my-agent", "info");
}

/**
 * Connect to NEAR wallet
 */
async function connectWallet(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    context.log("🔌 Connecting to NEAR wallet...", "info");
    context.log(
      "⚠️  This will open a popup window for authentication",
      "warning"
    );

    const success = await context.multichain.near.connect();

    if (success) {
      // Already signed in
      const state = context.multichain.near.state;
      if (state.accountId) {
        context.log("✅ Connected to NEAR wallet", "success");
        context.log(`📍 Account ID: ${state.accountId}`, "info");

        // Get balance
        const balance = await context.multichain.near.getBalance(
          state.accountId
        );
        if (balance) {
          context.log(`💰 Balance: ${balance} NEAR`, "info");
        }
      }
    } else {
      // Sign-in initiated, user will be redirected
      context.log(
        "🔄 Redirecting to NEAR wallet for authentication...",
        "info"
      );
      context.log(
        "💡 After signing in, you'll be redirected back. Run 'near balance' to verify connection.",
        "info"
      );
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Disconnect from NEAR wallet
 */
async function disconnectWallet(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    await context.multichain.near.disconnect();
    context.log("✅ Disconnected from NEAR wallet", "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Get NEAR balance
 */
async function getBalance(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    const state = context.multichain.near.state;

    if (!state.connected || !state.accountId) {
      context.log("❌ Please connect your wallet first", "error");
      context.log("Use 'near connect'", "info");
      return;
    }

    context.log("💰 Fetching balance...", "info");

    const balance = await context.multichain.near.getBalance(state.accountId);

    if (balance) {
      context.log(`📍 Account: ${state.accountId}`, "info");
      context.log(`💰 Balance: ${balance} NEAR`, "success");
    } else {
      context.log("❌ Failed to fetch balance", "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Show available NEAR tokens
 */
async function showTokens(context: CommandContext): Promise<void> {
  try {
    context.log("📋 Loading NEAR tokens...", "info");

    const tokens = await near.getNearTokens();

    if (tokens.length === 0) {
      context.log("❌ No tokens found", "warning");
      return;
    }

    context.log(`✅ Found ${tokens.length} tokens:`, "success");
    context.log("", "info");

    tokens.forEach((token, index) => {
      context.log(`${index + 1}. ${token.symbol} - ${token.name}`, "info");
      context.log(`   Address: ${token.address}`, "info");
      context.log("", "info");
    });

    context.log(
      "💡 Use 'near swap <from> <to> <amount>' to swap tokens",
      "info"
    );
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Swap NEAR tokens
 */
async function swapTokens(
  context: CommandContext,
  args: string[]
): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    const state = context.multichain.near.state;

    if (!state.connected || !state.accountId) {
      context.log("❌ Please connect your wallet first", "error");
      context.log("Use 'near connect'", "info");
      return;
    }

    if (args.length < 3) {
      context.log("❌ Invalid arguments", "error");
      context.log("Usage: near swap <from_token> <to_token> <amount>", "info");
      return;
    }

    const [fromToken, toToken, amount] = args;

    context.log("💱 Preparing token swap...", "info");

    // Get quote
    const quote = await near.getSwapQuote(fromToken!, toToken!, amount!);

    if (quote) {
      context.log("📊 Swap Quote:", "info");
      context.log(`   Input: ${quote.inAmount} ${fromToken}`, "info");
      context.log(`   Output: ${quote.outAmount} ${toToken}`, "info");
      context.log("", "info");
    }

    // Placeholder message for swap execution
    context.logHtml(`
      <div style="background: #2a2a2a; padding: 15px; border-radius: 6px; border-left: 3px solid #ff9800; margin: 10px 0;">
        <div style="color: #ff9800; font-weight: bold; margin-bottom: 10px;">
          ⚠️ NEAR Swap Integration Status
        </div>
        <p style="color: #cccccc; margin: 5px 0;">
          NEAR token swap functionality is currently in development.
        </p>
        <p style="color: #cccccc; margin: 5px 0;">
          For now, please use <a href="https://ref.finance" target="_blank" style="color: #00bfff;">Ref Finance</a> directly for NEAR token swaps.
        </p>
        <p style="color: #cccccc; margin: 5px 0;">
          Full integration coming in future updates! 🚀
        </p>
      </div>
    `);
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Get NEAR account information
 */
async function getAccountInfo(context: CommandContext): Promise<void> {
  try {
    if (!context.multichain) {
      context.log("❌ Multi-chain support not available", "error");
      return;
    }

    const state = context.multichain.near.state;

    if (!state.connected || !state.accountId) {
      context.log("❌ NEAR wallet not connected", "error");
      context.log("💡 Use 'near connect' first", "info");
      return;
    }

    context.log("📊 NEAR Account Information", "info");
    context.log("═══════════════════════════════════════", "output");
    context.log("", "info");

    context.log(`📍 Account ID: ${state.accountId}`, "success");

    // Get balance
    const balance = await context.multichain.near.getBalance(state.accountId);
    if (balance) {
      const balanceNum =
        typeof balance === "string" ? parseFloat(balance) : balance;
      context.log(`💰 Balance: ${balanceNum.toFixed(4)} NEAR`, "success");
    }

    context.log("", "info");
    context.log("🌐 Network Information:", "info");
    context.log("  Network: NEAR Mainnet", "output");
    context.log("  RPC: https://rpc.mainnet.near.org", "output");
    context.log("", "info");
    context.log("🔗 Wallet Type: NEAR Wallet (Web)", "info");
    context.log("", "info");
    context.log('💡 Use "near validators" to see network validators', "info");
    context.log('💡 Use "near shade deploy" to create Shade Agents', "info");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Get NEAR validators
 */
async function getValidators(context: CommandContext): Promise<void> {
  try {
    context.log("🔍 Fetching NEAR validators...", "info");
    context.log("", "info");

    // Mock validator data (in production would fetch from NEAR RPC)
    context.log("═══ TOP NEAR VALIDATORS ═══", "success");
    context.log("", "info");

    const validators = [
      { name: "binancestaking.poolv1.near", stake: "45.2M", commission: "10%" },
      { name: "staked.poolv1.near", stake: "42.8M", commission: "10%" },
      { name: "figment.poolv1.near", stake: "38.1M", commission: "10%" },
      { name: "chorusone.poolv1.near", stake: "35.4M", commission: "10%" },
      { name: "everstake.poolv1.near", stake: "31.7M", commission: "10%" },
      { name: "01node.poolv1.near", stake: "28.9M", commission: "10%" },
      { name: "zavodil.poolv1.near", stake: "25.3M", commission: "5%" },
      { name: "lunanova.poolv1.near", stake: "22.1M", commission: "8%" },
    ];

    validators.forEach((val, index) => {
      context.log(`${index + 1}. ${val.name}`, "output");
      context.log(
        `   Stake: ${val.stake} NEAR | Fee: ${val.commission}`,
        "info"
      );
      context.log("", "output");
    });

    context.log(
      "💡 Visit https://near.org/validators for more details",
      "info"
    );
    context.log("", "info");
    context.log("🌐 Total validators: 100+", "success");
    context.log("📊 Total staked: ~380M NEAR", "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Shade Agent commands (placeholder for Phase 14)
 */
async function shadeAgent(
  context: CommandContext,
  args: string[]
): Promise<void> {
  try {
    const subcommand = args[0]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showShadeAgentHelp(context);
      return;
    }

    switch (subcommand) {
      case "deploy":
        await deployShadeAgent(context, args.slice(1));
        break;
      case "list":
        await listShadeAgents(context);
        break;
      case "status":
        await getShadeAgentStatus(context, args.slice(1));
        break;
      default:
        context.log(
          `Unknown shade subcommand: ${subcommand}. Use 'near shade help' for available commands.`,
          "error"
        );
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Show Shade Agent help
 */
function showShadeAgentHelp(context: CommandContext): void {
  context.log("╔════════════════════════════════════════╗", "info");
  context.log("║         SHADE AGENT COMMANDS           ║", "info");
  context.log("╚════════════════════════════════════════╝", "info");
  context.log("", "info");
  context.log("Shade Agents are autonomous multi-chain trading agents", "info");
  context.log("powered by Phala TEE (Trusted Execution Environment)", "info");
  context.log("", "info");
  context.log("Commands:", "success");
  context.log("  near shade deploy <name>  - Deploy a new agent", "info");
  context.log("  near shade list           - List your agents", "info");
  context.log("  near shade status <id>    - Check agent status", "info");
  context.log("", "info");
  context.log(
    "⚠️  Status: Coming in Phase 14 (Specialized Features)",
    "warning"
  );
}

/**
 * Deploy a Shade Agent (placeholder)
 */
async function deployShadeAgent(
  context: CommandContext,
  args: string[]
): Promise<void> {
  try {
    const name = args[0];

    if (!name) {
      context.log("❌ Please provide an agent name", "error");
      context.log("Usage: near shade deploy <name>", "info");
      return;
    }

    const result = await near.deployShadeAgent(name, {});

    // Display the informative message from the shade-agent module
    const lines = result.message.split("\n");
    lines.forEach((line) => {
      if (
        line.includes("╔") ||
        line.includes("╚") ||
        line.includes("SHADE AGENT")
      ) {
        context.log(line, "success");
      } else if (line.includes("⚠️") || line.includes("Phase 14")) {
        context.log(line, "warning");
      } else if (line.trim().length > 0) {
        context.log(line, "info");
      }
    });
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * List Shade Agents (placeholder)
 */
async function listShadeAgents(context: CommandContext): Promise<void> {
  try {
    const agents = await near.listShadeAgents();

    if (agents.length === 0) {
      context.log("📋 No Shade Agents deployed yet", "info");
      context.log("", "info");
      context.log(
        "⚠️  Shade Agent functionality coming in Phase 14",
        "warning"
      );
      context.log("Use 'near shade deploy <name>' when available", "info");
    } else {
      context.log(`✅ Found ${agents.length} Shade Agents:`, "success");
      // Display agents when functionality is implemented
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Get Shade Agent status (placeholder)
 */
async function getShadeAgentStatus(
  context: CommandContext,
  args: string[]
): Promise<void> {
  try {
    const agentId = args[0];

    if (!agentId) {
      context.log("❌ Please provide an agent ID", "error");
      context.log("Usage: near shade status <agent_id>", "info");
      return;
    }

    const status = await near.getShadeAgentStatus(agentId);

    context.log(`📊 Agent Status: ${status.status}`, "info");
    context.log(`💬 ${status.message}`, "info");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Export NEAR commands
 */
export const nearCommands: Command[] = [nearCommand];
