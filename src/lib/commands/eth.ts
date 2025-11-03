/**
 * Ethereum Commands
 * Ethereum-specific commands including NFT collections via Magic Eden
 * Based on vanilla js/commands/ethereum-commands.js
 */

import type { Command, CommandContext } from "@/types/commands";

/**
 * Ethereum command - Main router for Ethereum-specific features
 */
export const ethCommand: Command = {
  name: "eth",
  description: "Ethereum network commands",
  usage: "eth <collections|help> [params]",
  category: "ethereum",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showEthHelp(context);
      return;
    }

    switch (subcommand) {
      case "collections":
        await showEthCollections(context, args);
        break;
      default:
        context.log(`Unknown eth command: ${subcommand}`, "error");
        context.log('Type "eth help" for available commands', "info");
    }
  },
};

function showEthHelp(context: CommandContext): void {
  context.log("╔════════════════════════════════════════╗", "info");
  context.log("║        ETHEREUM NFT COMMANDS           ║", "info");
  context.log("╚════════════════════════════════════════╝", "info");
  context.log("", "info");
  context.log("NFT Commands:", "success");
  context.log(
    "  eth collections [limit] - Show top Ethereum NFT collections",
    "info"
  );
  context.log("", "info");
  context.log("Examples:", "info");
  context.log("  eth collections      - Show top 10 collections", "info");
  context.log("  eth collections 20   - Show top 20 collections", "info");
  context.log("", "info");
  context.log("Data Source:", "info");
  context.log("  • Magic Eden API (Ethereum NFT marketplace)", "info");
  context.log("  • Real-time floor prices and volume data", "info");
}

async function showEthCollections(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const limit = parseInt(args[2]) || 10;

  context.log(`📊 Fetching top ${limit} Ethereum NFT collections...`, "info");
  context.log("🔗 Using Magic Eden API", "info");

  try {
    // Fetch from Magic Eden API via relayer
    const response = await fetch(
      `${config.RELAYER_URL}/magiceden/v2/eth/collections?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      context.log("❌ No collections found", "warning");
      return;
    }

    context.log("", "info");
    context.log(
      `✅ TOP ${Math.min(limit, data.length)} ETHEREUM NFT COLLECTIONS`,
      "success"
    );
    context.log("═══════════════════════════════════════", "output");
    context.log("", "info");

    data.slice(0, limit).forEach((collection: any, index: number) => {
      const name = collection.name || "Unknown Collection";
      const symbol = collection.symbol || "";
      const floorPrice = collection.floorPrice
        ? `${collection.floorPrice.toFixed(4)} ETH`
        : "N/A";
      const volume24h = collection.volume24h
        ? `${collection.volume24h.toFixed(2)} ETH`
        : "N/A";
      const image = collection.image || "";

      const html = `
        <div style="margin: 12px 0; padding: 16px; background: rgba(0, 188, 242, 0.05); border: 1px solid rgba(0, 188, 242, 0.3); border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${
              image
                ? `<img src="${image}" style="width: 48px; height: 48px; border-radius: 8px; background: #222;">`
                : ""
            }
            <div style="flex: 1;">
              <div style="font-size: 16px; font-weight: bold; color: #00bcf2; margin-bottom: 4px;">
                ${index + 1}. ${name} ${symbol ? `(${symbol})` : ""}
              </div>
              <div style="display: flex; gap: 20px; font-size: 13px;">
                <div>
                  <span style="color: #888;">Floor:</span> 
                  <span style="color: #00ff88; font-weight: bold;">${floorPrice}</span>
                </div>
                <div>
                  <span style="color: #888;">24h Vol:</span> 
                  <span style="color: #00bcf2; font-weight: bold;">${volume24h}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      context.logHtml(html);
    });

    context.log("", "info");
    context.log("💡 Data from Magic Eden Ethereum marketplace", "info");
  } catch (error: any) {
    context.log(`❌ Error fetching collections: ${error.message}`, "error");
    context.log("", "info");
    context.log(
      "💡 Make sure relayer is running with Magic Eden API proxy",
      "warning"
    );
  }
}

export const ethCommands: Command[] = [ethCommand];
