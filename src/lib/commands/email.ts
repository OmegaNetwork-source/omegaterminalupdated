/**
 * Email / Encrypted Messaging Commands
 * On-chain encrypted messaging system
 * Based on vanilla js/commands/remaining.js email/inbox implementation
 */

import type { Command, CommandContext } from "@/types/commands";
import { Contract } from "ethers";

// Direct Message contract address and ABI
const DM_CONTRACT_ADDRESS = "0x26e31516e5e7790f8aaa35278735970a93fee213";
const DM_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "DirectMessage",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "ensName", type: "string" },
      { internalType: "string", name: "message", type: "string" },
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

/**
 * Email command - Send encrypted on-chain messages
 */
export const emailCommand: Command = {
  name: "email",
  description: "Send on-chain encrypted messages",
  usage: "email [clearkey]",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (args[1] === "clearkey") {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("e2ee-private-key");
      }
      context.log("E2EE private key cleared from memory.", "success");
      return;
    }

    if (!context.wallet.state.isConnected) {
      context.log(
        "❌ Please connect your wallet first using: connect",
        "error"
      );
      return;
    }

    context.log("📧 Send an on-chain encrypted message", "info");
    context.log("", "info");
    context.log("💡 Email messaging integration coming soon", "warning");
    context.log(
      "📊 This will allow you to send encrypted messages on-chain",
      "info"
    );
    context.log("", "info");
    context.log("Usage (when implemented):", "info");
    context.log("1. Run 'email' command", "output");
    context.log("2. Enter recipient address or ENS", "output");
    context.log("3. Type your message", "output");
    context.log("4. Message is encrypted and sent on-chain", "output");
    context.log("", "info");
    context.log('💡 Use "inbox" to view received messages', "info");
  },
};

/**
 * Inbox command - View encrypted messages
 */
export const inboxCommand: Command = {
  name: "inbox",
  description: "View your encrypted on-chain messages",
  usage: "inbox [all]",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (!context.wallet.state.isConnected) {
      context.log(
        "❌ Please connect your wallet first using: connect",
        "error"
      );
      return;
    }

    const showAll = args[1] === "all";
    await showInbox(context, showAll);
  },
};

async function showInbox(
  context: CommandContext,
  showAll: boolean
): Promise<void> {
  try {
    context.log("📬 Fetching inbox messages...", "info");

    const signer = await context.wallet.getSigner();
    if (!signer) {
      context.log("❌ Unable to get wallet signer", "error");
      return;
    }

    const provider = signer.provider;
    if (!provider) {
      context.log("❌ Unable to get provider", "error");
      return;
    }

    const dmContract = new Contract(DM_CONTRACT_ADDRESS, DM_ABI, provider);
    const myAddr = context.wallet.state.address;

    if (!myAddr) {
      context.log("❌ No wallet address available", "error");
      return;
    }

    // Create filter for messages sent to this address
    const filter = dmContract.filters.DirectMessage(null, myAddr);

    context.log("📬 Scanning blockchain for messages...", "info");

    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 100000);

    const events = await dmContract.queryFilter(filter, fromBlock, "latest");

    if (events.length === 0) {
      context.log("📭 No messages found in your inbox", "info");
      context.log(
        "💡 Messages are fetched from the last 100,000 blocks",
        "info"
      );
      return;
    }

    context.log(`=== INBOX (${events.length} messages) ===`, "info");
    context.log("", "info");

    const messagesToShow = showAll ? events : events.slice(-10).reverse();

    for (const event of messagesToShow) {
      if (event.args) {
        const from = event.args[0] as string;
        const message = event.args[2] as string;
        const timestamp = Number(event.args[3]) * 1000;
        const date = new Date(timestamp).toLocaleString();

        const html = `
          <div style="border: 1px solid #00bcf2; padding: 12px; margin: 8px 0; border-radius: 8px; background: rgba(0, 188, 242, 0.05);">
            <div style="margin-bottom: 4px;">
              <b style="color: #00bcf2;">From:</b> 
              <span style="font-family: monospace; color: #888; cursor: pointer;" onclick="navigator.clipboard.writeText('${from}')" title="Click to copy">
                ${from}
              </span>
            </div>
            <div style="margin-bottom: 4px;">
              <b style="color: #00bcf2;">Date:</b> ${date}
            </div>
            <div style="margin-top: 8px; padding: 8px; background: rgba(0, 0, 0, 0.2); border-radius: 4px;">
              <b style="color: #00bcf2;">Message:</b><br/>
              ${message}
            </div>
          </div>
        `;

        context.logHtml(html);
      }
    }

    if (!showAll && events.length > 10) {
      context.log("", "info");
      context.log(
        `Showing last 10 messages. Use "inbox all" to show all ${events.length} messages.`,
        "info"
      );
    }
  } catch (error: any) {
    context.log(`❌ Failed to fetch inbox: ${error.message}`, "error");
    context.log("💡 Make sure you're connected to the Omega Network", "info");
  }
}

function generateMockReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * DM Command - Direct Message (alias for email)
 */
export const dmCommand: Command = {
  name: "dm",
  description: "Send direct message (alias for email)",
  usage: "dm <recipient> <message>",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (!args[1]) {
      context.log("Usage: dm <recipient> <message>", "error");
      context.log("Example: dm 0x123...abc Hello there!", "info");
      return;
    }

    if (args.length < 3) {
      context.log("❌ Please provide a message", "error");
      context.log("Usage: dm <recipient> <message>", "info");
      return;
    }

    if (!context.wallet.state.isConnected) {
      context.log(
        "❌ Please connect your wallet first using: connect",
        "error"
      );
      return;
    }

    const recipient = args[1];
    const message = args.slice(2).join(" ");

    context.log(`💬 Sending direct message to ${recipient}...`, "info");
    context.log(`Message: "${message}"`, "output");
    context.log("", "output");
    context.log("💡 Direct messaging integration coming soon", "warning");
    context.log("📊 This will send an encrypted on-chain message", "info");
    context.log("", "info");
    context.log('💡 Use "inbox" to view received messages', "info");
  },
};

/**
 * Messages Command - Alias for inbox
 */
export const messagesCommand: Command = {
  name: "messages",
  description: "View messages (alias for inbox)",
  usage: "messages [all]",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    const showAll = args[1] === "all";
    await inboxCommand.handler(context, ["inbox", ...(showAll ? ["all"] : [])]);
  },
};

export const emailCommands: Command[] = [
  emailCommand,
  inboxCommand,
  dmCommand,
  messagesCommand,
];
