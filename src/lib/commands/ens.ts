/**
 * ENS (Ethereum Name Service) Commands for Omega Network
 * Based on vanilla js/commands/remaining.js ens implementation
 */

import type { Command, CommandContext } from "@/types/commands";
import { Contract } from "ethers";
import { createCommandLine, createUsageError } from "./command-output-helpers";

// Omega Network ENS contract address
const ENS_CONTRACT_ADDRESS = "0xd9ce49734db4f033362d2fd51d52f24cabeb87fa";

// ENS contract ABI
const ENS_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "NameRegistered",
    type: "event",
  },
  {
    inputs: [{ internalType: "string", name: "name", type: "string" }],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "address", name: "newOwner", type: "address" },
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "", type: "string" }],
    name: "names",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "name", type: "string" }],
    name: "resolve",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

/**
 * ENS command - Omega Network ENS operations
 */
export const ensCommand: Command = {
  name: "ens",
  description: "Omega Network ENS (name service)",
  usage: "ens <register|resolve|search> <name>",
  category: "utility",
  handler: async (context: CommandContext, args: string[]) => {
    if (!args || args.length < 2) {
      showEnsHelp(context);
      return;
    }

    const subCommand = args[1].toLowerCase();

    switch (subCommand) {
      case "register":
        await registerName(context, args);
        break;
      case "resolve":
        await resolveName(context, args);
        break;
      case "search":
        await searchName(context, args);
        break;
      case "help":
        showEnsHelp(context);
        break;
      default:
        context.log(`❌ Unknown ENS command: ${subCommand}`, "error");
        showEnsHelp(context);
    }
  },
};

function showEnsHelp(context: CommandContext): void {
  context.log("🌐 OMEGA NETWORK ENS", "info");
  context.log("════════════════════════════════════", "output");
  context.log("", "info");
  context.log("COMMANDS:", "info");
  context.log("  ens register <name>  - Register a new ENS name", "output");
  context.log("  ens resolve <name>   - Get address for ENS name", "output");
  context.log("  ens search <name>    - Check if ENS name exists", "output");
  context.log("", "output");
  context.log("EXAMPLES:", "info");
  context.log("  ens register myname    - Register a new ENS name", "output");
  context.log("  ens resolve myname     - Get address for ENS name", "output");
  context.log("  ens search myname      - Check if ENS name exists", "output");
}

async function registerName(
  context: CommandContext,
  args: string[]
): Promise<void> {
  if (!args[2]) {
    const usageHtml = createUsageError("ens register <name>", [
      "ens register myname",
      "ens register alice",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  if (!context.wallet.state.isConnected) {
    context.log("❌ Please connect your wallet first.", "error");
    const helpHtml = createCommandLine("connect", "Connect your wallet");
    context.logHtml(helpHtml);
    return;
  }

  const name = args[2];
  context.log(`📝 Registering ENS name: ${name}...`, "info");

  try {
    const signer = await context.wallet.getSigner();
    if (!signer) {
      context.log("❌ Unable to get wallet signer", "error");
      return;
    }

    const ens = new Contract(ENS_CONTRACT_ADDRESS, ENS_ABI, signer);
    const tx = await ens.register(name);

    context.log(`✅ Registration transaction sent: ${tx.hash}`, "success");
    context.log("⏳ Waiting for confirmation...", "info");

    await tx.wait();
    context.log(`✅ Name registered: ${name}`, "success");
    context.logHtml(
      `🔍 <a href="https://0x4e454228.explorer.aurora-cloud.dev/tx/${tx.hash}" target="_blank">View on Explorer</a>`
    );
  } catch (err: any) {
    context.log(`❌ Registration failed: ${err.message}`, "error");
    if (err.message.includes("already exists")) {
      context.log("💡 This name is already registered by someone else", "info");
    }
  }
}

async function resolveName(
  context: CommandContext,
  args: string[]
): Promise<void> {
  if (!args[2]) {
    const usageHtml = createUsageError("ens resolve <name>", [
      "ens resolve myname",
      "ens resolve alice",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  const name = args[2];
  context.log(`🌐 Resolving ENS name: ${name}...`, "info");

  try {
    const signer = await context.wallet.getSigner();
    const provider = signer?.provider || (await context.wallet.getProvider());

    if (!provider) {
      context.log("❌ Unable to get provider", "error");
      return;
    }

    const ens = new Contract(ENS_CONTRACT_ADDRESS, ENS_ABI, provider);
    const address = await ens.resolve(name);

    if (address && address !== "0x0000000000000000000000000000000000000000") {
      context.logHtml(
        `✅ <b>${name}</b> resolves to <span style="font-family: monospace; cursor: pointer;" onclick="navigator.clipboard.writeText('${address}'); this.nextElementSibling.style.display='inline';">${address}</span><span style="display: none; color: #00ff88; margin-left: 8px;">✓ Copied!</span>`
      );
    } else {
      context.log(`❌ Name not found: ${name}`, "error");
      context.log("💡 This ENS name has not been registered yet", "info");
    }
  } catch (err: any) {
    context.log(`❌ Resolve failed: ${err.message}`, "error");
  }
}

async function searchName(
  context: CommandContext,
  args: string[]
): Promise<void> {
  if (!args[2]) {
    const usageHtml = createUsageError("ens search <name>", [
      "ens search myname",
      "ens search alice",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  const name = args[2];
  context.log(`🔍 Searching for ENS name: ${name}...`, "info");

  try {
    const signer = await context.wallet.getSigner();
    const provider = signer?.provider || (await context.wallet.getProvider());

    if (!provider) {
      context.log("❌ Unable to get provider", "error");
      return;
    }

    const ens = new Contract(ENS_CONTRACT_ADDRESS, ENS_ABI, provider);
    const address = await ens.resolve(name);

    if (address && address !== "0x0000000000000000000000000000000000000000") {
      context.logHtml(
        `✅ <b>${name}</b> is owned by <span style="font-family: monospace; cursor: pointer;" onclick="navigator.clipboard.writeText('${address}'); this.nextElementSibling.style.display='inline';">${address}</span><span style="display: none; color: #00ff88; margin-left: 8px;">✓ Copied!</span>`
      );
    } else {
      context.log(`❌ Name not found: ${name}`, "error");
      context.log("💡 This ENS name is available for registration", "info");
    }
  } catch (err: any) {
    context.log(`❌ ENS search failed: ${err.message}`, "error");
  }
}

export const ensCommands: Command[] = [ensCommand];
