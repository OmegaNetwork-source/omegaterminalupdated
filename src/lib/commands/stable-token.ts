/**
 * Stable Token Factory Commands
 * Create ERC20 tokens on Stable Network
 * Similar to token-factory.ts but for Stable Network
 */

import type { Command, CommandContext } from "@/types/commands";
import { Contract } from "ethers";
import { handleStableTransactions } from "./stable-transactions";

// Factory contract address on Stable Network
const FACTORY_ADDRESS = "0xdC43DCAE0c13f11f425cAB7240A035137B2f6f6F";

// Factory ABI (only the createToken function)
const FACTORY_ABI = [
  {
    inputs: [
      { internalType: "string", name: "name_", type: "string" },
      { internalType: "string", name: "symbol_", type: "string" },
      { internalType: "uint8", name: "decimals_", type: "uint8" },
      {
        internalType: "uint256",
        name: "initialSupply_",
        type: "uint256",
      },
      { internalType: "bool", name: "mintable_", type: "bool" },
      { internalType: "bool", name: "pausable_", type: "bool" },
    ],
    name: "createToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "tokenAddress", type: "address" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "string", name: "symbol", type: "string" },
      { indexed: false, internalType: "uint8", name: "decimals", type: "uint8" },
      { indexed: false, internalType: "uint256", name: "initialSupply", type: "uint256" },
      { indexed: false, internalType: "bool", name: "mintable", type: "bool" },
      { indexed: false, internalType: "bool", name: "pausable", type: "bool" },
    ],
    name: "TokenCreated",
    type: "event",
  },
];

/**
 * Token creation state
 */
interface TokenCreationState {
  step:
    | "name"
    | "symbol"
    | "decimals"
    | "supply"
    | "mintable"
    | "pausable"
    | "confirm"
    | null;
  name?: string;
  symbol?: string;
  decimals?: number;
  supply?: string;
  mintable?: boolean;
  pausable?: boolean;
}

// Global state for interactive token creation
let creationState: TokenCreationState | null = null;
let creationContext: CommandContext | null = null;

/**
 * Check if token creation is awaiting input
 */
export function isAwaitingStableTokenInput(): boolean {
  return creationState !== null && creationContext !== null;
}

/**
 * Cancel token creation
 */
export function cancelStableTokenCreation(): void {
  if (creationState && creationContext) {
    creationContext.log("Token creation cancelled.", "warning");
  }
  creationState = null;
  creationContext = null;
}

/**
 * Handle user input during token creation
 */
export function handleStableTokenCreationInput(input: string): boolean {
  if (!creationState || !creationContext) {
    return false;
  }

  const trimmed = input.trim();

  try {
    switch (creationState.step) {
      case "name":
        if (!trimmed) {
          creationContext.log("Token creation cancelled.", "warning");
          creationState = null;
          creationContext = null;
          return true;
        }
        creationState.name = trimmed;
        creationState.step = "symbol";
        creationContext.log('Enter token symbol (e.g., "STK"):', "info");
        return true;

      case "symbol":
        if (!trimmed) {
          creationContext.log("Token creation cancelled.", "warning");
          creationState = null;
          creationContext = null;
          return true;
        }
        creationState.symbol = trimmed;
        creationState.step = "decimals";
        creationContext.log("Enter decimals (default 18):", "info");
        return true;

      case "decimals":
        let decimals = 18;
        if (trimmed) {
          const parsed = parseInt(trimmed);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 36) {
            decimals = parsed;
          }
        }
        creationState.decimals = decimals;
        creationState.step = "supply";
        creationContext.log("Enter initial supply (e.g., 1000000):", "info");
        return true;

      case "supply":
        if (!trimmed) {
          creationContext.log("Token creation cancelled.", "warning");
          creationState = null;
          creationContext = null;
          return true;
        }
        creationState.supply = trimmed;
        creationState.step = "mintable";
        creationContext.log("Mintable? (yes/no, default yes):", "info");
        return true;

      case "mintable":
        creationState.mintable = !trimmed || trimmed.toLowerCase() !== "no";
        creationState.step = "pausable";
        creationContext.log("Pausable? (yes/no, default yes):", "info");
        return true;

      case "pausable":
        creationState.pausable = !trimmed || trimmed.toLowerCase() !== "no";
        creationState.step = "confirm";

        // Show summary
        creationContext.log("", "info");
        creationContext.log("📋 Token Details:", "info");
        creationContext.log(`Name: ${creationState.name}`, "output");
        creationContext.log(`Symbol: ${creationState.symbol}`, "output");
        creationContext.log(`Decimals: ${creationState.decimals}`, "output");
        creationContext.log(
          `Initial Supply: ${creationState.supply}`,
          "output"
        );
        creationContext.log(
          `Mintable: ${creationState.mintable ? "Yes" : "No"}`,
          "output"
        );
        creationContext.log(
          `Pausable: ${creationState.pausable ? "Yes" : "No"}`,
          "output"
        );
        creationContext.log("", "info");
        creationContext.log("Deploy token? (yes/no):", "info");
        return true;

      case "confirm":
        if (trimmed.toLowerCase() !== "yes") {
          creationContext.log("Token creation cancelled.", "warning");
          creationState = null;
          creationContext = null;
          return true;
        }

        // Deploy token
        void deployStableToken(
          creationContext,
          creationState.name!,
          creationState.symbol!,
          creationState.decimals!,
          creationState.supply!,
          creationState.mintable!,
          creationState.pausable!
        );

        creationState = null;
        creationContext = null;
        return true;
    }
  } catch (error: any) {
    creationContext.log(`Error: ${error.message}`, "error");
    creationState = null;
    creationContext = null;
    return true;
  }

  return false;
}

/**
 * Deploy token using factory contract
 */
async function deployStableToken(
  context: CommandContext,
  name: string,
  symbol: string,
  decimals: number,
  supply: string,
  mintable: boolean,
  pausable: boolean
): Promise<void> {
  try {
    // Check if factory address is set
    if (FACTORY_ADDRESS === "0x0000000000000000000000000000000000000000") {
      context.log("❌ Factory contract not deployed yet!", "error");
      context.log("", "output");
      context.log("📝 Please deploy the factory contract first:", "info");
      context.log("1. Go to https://remix.ethereum.org/", "output");
      context.log("2. Use the StableTokenFactoryStandalone.sol contract", "output");
      context.log("3. Deploy to Stable Network testnet (Chain ID: 2201)", "output");
      context.log("4. Update FACTORY_ADDRESS in stable-token.ts", "output");
      context.log("5. RPC: https://rpc.testnet.stable.xyz", "output");
      return;
    }

    context.log("🚀 Deploying token contract...", "info");

    const signer = await context.wallet.getSigner();
    if (!signer) {
      context.log("❌ No signer available", "error");
      context.log("Please connect your wallet first", "info");
      return;
    }

    // Check if provider is available
    if (!signer.provider) {
      context.log("❌ No provider available", "error");
      context.log("Please connect your wallet first", "info");
      return;
    }

    // Check if connected to Stable Network
    try {
      const network = await signer.provider.getNetwork();
      if (network.chainId !== 2201n) {
        context.log("⚠️ Warning: Not connected to Stable Network (Chain ID: 2201)", "warning");
        context.log("Please switch to Stable Network testnet", "info");
        context.log("Current Chain ID: " + network.chainId.toString(), "output");
      }
    } catch (error: any) {
      context.log("⚠️ Warning: Could not verify network", "warning");
      context.log("Proceeding with deployment...", "info");
    }

    const factory = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

    // Convert supply to number (contract will multiply by 10^decimals internally)
    // The contract expects initialSupply_ in whole tokens, not in wei
    const initialSupply = BigInt(supply);

    // Calculate what the final supply will be for display
    const finalSupply = BigInt(supply) * (10n ** BigInt(decimals));

    context.log(`📝 Creating token: ${name} (${symbol})`, "info");
    context.log(`   Initial Supply: ${supply} tokens (will be ${finalSupply.toString()} in smallest units)`, "output");
    context.log(`   Decimals: ${decimals}`, "output");
    context.log(`   Mintable: ${mintable ? "Yes" : "No"}`, "output");
    context.log(`   Pausable: ${pausable ? "Yes" : "No"}`, "output");
    context.log("", "info");

    const tx = await factory.createToken(
      name,
      symbol,
      decimals,
      initialSupply,
      mintable,
      pausable
    );

    context.log(`✅ Token deployment submitted! Hash: ${tx.hash}`, "success");
    context.log("⏳ Waiting for confirmation...", "info");

    const receipt = await tx.wait();
    context.log(
      `✅ Token deployed successfully! Block: ${receipt.blockNumber}`,
      "success"
    );

    // Try to extract token address from events
    let tokenAddress: string | null = null;
    if (receipt.logs && receipt.logs.length > 0) {
      // Look for TokenCreated event
      const iface = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer).interface;
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log as any);
          if (parsed && parsed.name === "TokenCreated") {
            tokenAddress = parsed.args.tokenAddress;
            break;
          }
        } catch (e) {
          // Continue to next log
        }
      }
    }

    context.log("", "info");
    context.log("🎉 Your token is ready!", "success");
    if (tokenAddress) {
      context.log(`Token Address: ${tokenAddress}`, "output");
    }
    context.log("", "info");
    context.log("📝 Next Steps:", "info");
    if (tokenAddress) {
      context.log(
        `1. View on Explorer: https://testnet.stablescan.xyz/address/${tokenAddress}`,
        "output"
      );
      context.log(`2. Add to wallet: ${tokenAddress}`, "output");
    }
    context.log(`3. Share with community!`, "output");
  } catch (error: any) {
    context.log(`❌ Failed to deploy token: ${error.message}`, "error");
    if (error.message.includes("user rejected")) {
      context.log("Transaction was rejected by user.", "warning");
    } else if (error.message.includes("insufficient funds")) {
      context.log("💡 Get testnet tokens from: https://faucet.stable.xyz", "info");
    }
  }
}

/**
 * Create token command
 */
export const stableTokenCreateCommand: Command = {
  name: "stable",
  aliases: ["stable-token"],
  description: "Create a new ERC20 token on Stable Network",
  usage: "stable token create",
  category: "farming",
  handler: async (context: CommandContext, args: string[]) => {
    console.log("[Stable Token] Handler called with args:", args);
    const subcommand = args[1]?.toLowerCase();
    console.log("[Stable Token] Subcommand:", subcommand);
    
    // Handle transactions subcommand
    if (subcommand === "transactions") {
      console.log("[Stable Token] Routing to handleStableTransactions");
      await handleStableTransactions(context, args);
      return;
    }
    
    if (subcommand === "token" && args[2]?.toLowerCase() === "create") {
      // Check wallet connection
      if (!context.wallet.state.isConnected || !context.wallet.state.address) {
        context.log(
          "❌ Please connect your wallet first using: connect",
          "error"
        );
        return;
      }

      // Initialize creation state
      creationState = {
        step: "name",
      };
      creationContext = context;

      // Show intro
      context.log("🚀 Stable Network Token Creator", "info");
      context.log(
        "This will deploy a new ERC20 token on Stable Network testnet",
        "info"
      );
      context.log("", "info");

      // Start interactive process
      context.log('Enter token name (e.g., "My Awesome Token"):', "info");
    } else {
      const usageHtml = `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
          border-radius: 12px;
          padding: 20px;
          margin: 10px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        ">
          <div style="
            font-size: 18px;
            font-weight: 600;
            color: var(--palette-primary, #00d4ff);
            margin-bottom: 16px;
            text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
          ">🪙 STABLE TOKEN CREATOR</div>
          
          <div style="
            font-size: 14px;
            font-weight: 600;
            color: var(--palette-secondary, #00ff88);
            margin: 16px 0 12px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">Usage</div>
          
          <div style="
            font-size: 13px;
            color: var(--palette-text, #ccd4e0);
            line-height: 1.8;
            margin-bottom: 12px;
          ">
            <div style="margin-bottom: 8px;">
              <span class="omega-help-command" data-command="stable token create" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'stable token create' to terminal input">stable token create</span> - Create a new token
            </div>
            <div style="margin-bottom: 8px;">
              <span class="omega-help-command" data-command="stable transactions start" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'stable transactions start' to terminal input">stable transactions start</span> - Start continuous transactions
            </div>
            <div style="margin-bottom: 8px;">
              <span class="omega-help-command" data-command="stable transactions stop" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'stable transactions stop' to terminal input">stable transactions stop</span> - Stop continuous transactions
            </div>
          </div>
        </div>
      `;
      context.logHtml(usageHtml);
      context.log("", "output");
    }
  },
};

export const stableTokenCommands: Command[] = [stableTokenCreateCommand];

