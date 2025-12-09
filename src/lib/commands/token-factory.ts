/**
 * Token Factory Commands
 * Create ERC20 tokens on Omega Network
 * Migrated from js/commands/remaining.js createToken function (lines 986-1149)
 */

import type { Command, CommandContext } from "@/types/commands";
import { Contract, parseUnits } from "ethers";

// Factory contract address on Omega Network
const FACTORY_ADDRESS = "0x1f568dbb3a7b9ea05062b132094a848ef1443cfe";

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
export function isAwaitingTokenInput(): boolean {
  return creationState !== null && creationContext !== null;
}

/**
 * Cancel token creation
 */
export function cancelTokenCreation(): void {
  if (creationState && creationContext) {
    creationContext.log("Token creation cancelled.", "warning");
  }
  creationState = null;
  creationContext = null;
}

/**
 * Handle user input during token creation
 */
export function handleTokenCreationInput(input: string): boolean {
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
        creationContext.log('Enter token symbol (e.g., "MAT"):', "info");
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
        void deployToken(
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
async function deployToken(
  context: CommandContext,
  name: string,
  symbol: string,
  decimals: number,
  supply: string,
  mintable: boolean,
  pausable: boolean
): Promise<void> {
  try {
    context.log("🚀 Deploying token contract...", "info");

    const signer = await context.wallet.getSigner();
    if (!signer) {
      context.log("❌ No signer available", "error");
      return;
    }

    const factory = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

    // Parse supply with decimals
    const initialSupply = parseUnits(supply, decimals);

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
    if (receipt.logs && receipt.logs.length > 0) {
      for (const log of receipt.logs) {
        try {
          // Token address is usually in the first log
          if (log.topics && log.topics.length > 0) {
            const tokenAddress = `0x${log.topics[1].slice(26)}`;
            context.log("", "info");
            context.log("🎉 Your token is ready!", "success");
            context.log(`Token Address: ${tokenAddress}`, "output");
            context.log("", "info");
            context.log("📝 Next Steps:", "info");
            context.log(
              `1. View on Explorer: https://0x4e454228.explorer.aurora-cloud.dev/address/${tokenAddress}`,
              "output"
            );
            context.log(`2. Add to wallet: ${tokenAddress}`, "output");
            context.log(`3. Share with community!`, "output");
            break;
          }
        } catch (e) {
          // Continue to next log
        }
      }
    }
  } catch (error: any) {
    context.log(`❌ Failed to deploy token: ${error.message}`, "error");
    if (error.message.includes("user rejected")) {
      context.log("Transaction was rejected by user.", "warning");
    }
  }
}

/**
 * Create token command
 */
export const createCommand: Command = {
  name: "create",
  description: "Create a new ERC20 token on Omega Network",
  category: "token",
  handler: async (context: CommandContext) => {
    // Check wallet connection (matches vanilla js/commands/remaining.js line 988)
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

    // Show intro (matches vanilla line 997-1002)
    context.log("🚀 Omega Token Creator", "info");
    context.log(
      "This will deploy a new ERC20 token on the Omega Network",
      "info"
    );
    context.log("", "info");

    // Start interactive process (matches vanilla line 1005)
    context.log('Enter token name (e.g., "My Awesome Token"):', "info");
  },
};

export const tokenCommands: Command[] = [createCommand];
