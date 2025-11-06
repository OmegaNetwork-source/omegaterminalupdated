/**
 * Magic Eden NFT Commands Module
 * Migrated from js/commands/magiceden-commands.js to TypeScript
 * Includes: view, activities, stats, listings, holders, attributes, trending
 *
 * Note: Uses relayer proxy (no API key needed)
 * Note: All prices in SOL (converted from lamports)
 */

import type { Command, CommandContext } from "@/types/commands";
import { magiceden } from "@/lib/api";
import { formatSOL, formatTime, getActivityEmoji } from "@/lib/api/magiceden";
import { escapeHtml, formatNumber } from "@/lib/utils";
import { createUsageError } from "./command-output-helpers";

/**
 * Helper function to create Magic Eden NFT grid HTML
 * Uses formatting helpers from magiceden API module
 */
function createMagicEdenGridHTML(
  listings: any[],
  collectionSymbol: string
): string {
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin: 0;">
      ${listings
        .map((listing) => {
          const imageUrl =
            listing.extra?.img ||
            listing.token?.image ||
            listing.img ||
            listing.image ||
            "";
          const tokenName =
            listing.tokenName ||
            listing.token?.name ||
            listing.name ||
            "Unknown";
          const price = listing.priceInfo || listing.price;
          const priceFormatted = formatSOL(price);

          return `
          <div style="
            background: rgba(0, 212, 255, 0.02);
            border: 1px solid rgba(0, 212, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
            transition: all 0.15s;
            cursor: pointer;
          " onmouseover="this.style.borderColor='rgba(0, 212, 255, 0.4)'; this.style.background='rgba(0, 212, 255, 0.05)'" onmouseout="this.style.borderColor='rgba(0, 212, 255, 0.1)'; this.style.background='rgba(0, 212, 255, 0.02)'">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(
            tokenName
          )}" style="
              width: 100%;
              aspect-ratio: 1;
              object-fit: cover;
              display: block;
            " onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%2300D4FF%22 width=%22100%22 height=%22100%22/><text fill=%22%23fff%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2230%22>◎</text></svg>'" />
            <div style="padding: 4px 6px;">
              <div style="color: rgba(255, 255, 255, 0.7); font-weight: 400; font-size: 9px; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(
                tokenName
              )}">
                ${escapeHtml(tokenName)}
              </div>
              <div style="color: #00FF88; font-weight: 600; font-size: 10px;">
                ${priceFormatted}
              </div>
            </div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

/**
 * Magic Eden command - main Solana NFT marketplace command
 */
const magicedenCommand: Command = {
  name: "magiceden",
  aliases: ["me"],
  description: "Magic Eden Solana NFT marketplace",
  usage:
    "magiceden <view|activities|stats|listings|holders|attributes|trending|help> [params]",
  category: "nft",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand) {
      // Show help
      showHelp(context);
      return;
    }

    switch (subcommand) {
      case "view":
        await handleView(context, args);
        break;
      case "activities":
        await handleActivities(context, args);
        break;
      case "stats":
        await handleStats(context, args);
        break;
      case "listings":
        await handleListings(context, args);
        break;
      case "holders":
        await handleHolders(context, args);
        break;
      case "attributes":
        await handleAttributes(context, args);
        break;
      case "trending":
        await handleTrending(context, args);
        break;
      case "help":
      default:
        showHelp(context);
        break;
    }
  },
};

/**
 * View handler - display collection with stats and listings
 */
async function handleView(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const symbol = args[2];
  const limit = parseInt(args[3]) || 5;

  if (!symbol) {
    const usageHtml = createUsageError("magiceden view <symbol> [limit]", [
      "magiceden view degods 5",
      "magiceden view solana-monkey-business",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`🔍 Loading Magic Eden collection: ${symbol}`, "info");

  // Fetch stats and listings
  const [statsResult, listingsResult] = await Promise.all([
    magiceden.fetchStats(symbol),
    magiceden.fetchListings(symbol, 20),
  ]);

  if (!statsResult.success || !statsResult.stats) {
    context.log(`❌ ${statsResult.error || "Collection not found"}`, "error");
    return;
  }

  const stats = statsResult.stats;
  const listings = listingsResult.listings || [];

  // Display collection header with stats
  context.logHtml(`
    <div style="
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 128, 255, 0.1));
      border: 2px solid rgba(0, 212, 255, 0.3);
      border-radius: 8px;
      padding: 20px;
      margin: 16px 0;
    ">
      <div style="font-size: 1.8em; font-weight: bold; color: #00D4FF; margin-bottom: 16px;">
        ◎ ${escapeHtml(stats.name || symbol)}
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px;">
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 4px;">Floor Price</div>
          <div style="font-size: 1.5em; font-weight: bold; color: #00FF88;">
            ${stats.floorPrice ? formatSOL(stats.floorPrice) : "N/A"}
          </div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px;">
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 4px;">Total Volume</div>
          <div style="font-size: 1.5em; font-weight: bold;">
            ${stats.volumeAll ? formatSOL(stats.volumeAll) : "N/A"}
          </div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px;">
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 4px;">Avg Price (24h)</div>
          <div style="font-size: 1.5em; font-weight: bold;">
            ${stats.avgPrice24hr ? formatSOL(stats.avgPrice24hr) : "N/A"}
          </div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px;">
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em; margin-bottom: 4px;">Listed</div>
          <div style="font-size: 1.5em; font-weight: bold;">
            ${stats.listedCount ? formatNumber(stats.listedCount) : "N/A"}
          </div>
        </div>
      </div>
    </div>
  `);

  // Display NFT grid
  if (listings.length > 0) {
    context.log(
      `📦 Showing ${Math.min(limit, listings.length)} of ${
        listings.length
      } listings:`,
      "info"
    );
    context.log("", "output");
    context.logHtml(createMagicEdenGridHTML(listings.slice(0, limit), symbol));

    if (listings.length > limit) {
      context.log("", "output");
      context.log(
        `💡 Use 'magiceden listings ${symbol} ${listings.length}' to see all listings`,
        "info"
      );
    }
  } else {
    context.log("📭 No listings available", "warning");
  }
}

/**
 * Activities handler - display recent activities
 */
async function handleActivities(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const symbol = args[2];
  const limit = parseInt(args[3]) || 10;

  if (!symbol) {
    const usageHtml = createUsageError("magiceden activities <symbol> [limit]", [
      "magiceden activities degods 10",
      "magiceden activities solana-monkey-business",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`📊 Loading recent activities for: ${symbol}`, "info");

  const result = await magiceden.fetchActivities(symbol, limit);

  if (!result.success || result.activities.length === 0) {
    context.log(`❌ ${result.error || "No activities found"}`, "error");
    return;
  }

  context.log(
    `✅ Found ${result.activities.length} recent activities:`,
    "success"
  );
  context.log("", "output");

  for (const activity of result.activities) {
    const emoji = getActivityEmoji(activity.type);
    const price = activity.priceInfo || activity.price;
    const priceFormatted = price ? formatSOL(price) : "N/A";
    const time = activity.blockTime
      ? formatTime(activity.blockTime)
      : "Unknown";

    context.log(
      `${emoji} ${activity.type.toUpperCase()} - ${priceFormatted} - ${time}`,
      "output"
    );
  }
}

/**
 * Stats handler - display collection statistics
 */
async function handleStats(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const symbol = args[2];

  if (!symbol) {
    const usageHtml = createUsageError("magiceden stats <symbol>", [
      "magiceden stats degods",
      "magiceden stats solana-monkey-business",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`📊 Loading stats for: ${symbol}`, "info");

  const result = await magiceden.fetchStats(symbol);

  if (!result.success || !result.stats) {
    context.log(`❌ ${result.error || "Stats not found"}`, "error");
    return;
  }

  const stats = result.stats;

  context.logHtml(`
    <div style="
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 128, 255, 0.1));
      border: 2px solid rgba(0, 212, 255, 0.3);
      border-radius: 8px;
      padding: 20px;
      margin: 16px 0;
    ">
      <div style="font-size: 1.6em; font-weight: bold; color: #00D4FF; margin-bottom: 16px;">
        📊 ${escapeHtml(stats.name || symbol)} Statistics
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 8px;">
          <div style="color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">Floor Price</div>
          <div style="font-size: 1.8em; font-weight: bold; color: #00FF88;">
            ${stats.floorPrice ? formatSOL(stats.floorPrice) : "N/A"}
          </div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 8px;">
          <div style="color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">Total Volume</div>
          <div style="font-size: 1.8em; font-weight: bold;">
            ${stats.volumeAll ? formatSOL(stats.volumeAll) : "N/A"}
          </div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 8px;">
          <div style="color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">Avg Price (24h)</div>
          <div style="font-size: 1.8em; font-weight: bold;">
            ${stats.avgPrice24hr ? formatSOL(stats.avgPrice24hr) : "N/A"}
          </div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 8px;">
          <div style="color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">Listed Count</div>
          <div style="font-size: 1.8em; font-weight: bold;">
            ${stats.listedCount ? formatNumber(stats.listedCount) : "N/A"}
          </div>
        </div>
      </div>
    </div>
  `);
}

/**
 * Listings handler - display current listings
 */
async function handleListings(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const symbol = args[2];
  const limit = parseInt(args[3]) || 10;

  if (!symbol) {
    const usageHtml = createUsageError("magiceden listings <symbol> [limit]", [
      "magiceden listings degods 10",
      "magiceden listings solana-monkey-business",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`📦 Loading ${limit} listings for: ${symbol}`, "info");

  const result = await magiceden.fetchListings(symbol, limit);

  if (!result.success || result.listings.length === 0) {
    context.log(`❌ ${result.error || "No listings found"}`, "error");
    return;
  }

  context.log(`✅ Found ${result.listings.length} listings:`, "success");
  context.log("", "output");

  context.logHtml(createMagicEdenGridHTML(result.listings, symbol));
}

/**
 * Holders handler - display holder statistics
 */
async function handleHolders(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const symbol = args[2];

  if (!symbol) {
    const usageHtml = createUsageError("magiceden holders <symbol>", [
      "magiceden holders degods",
      "magiceden holders solana-monkey-business",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`👥 Loading holder stats for: ${symbol}`, "info");

  const result = await magiceden.fetchHolderStats(symbol);

  if (!result.success || !result.holderStats) {
    context.log(`❌ ${result.error || "Holder stats not found"}`, "error");
    return;
  }

  const stats = result.holderStats;

  context.logHtml(`
    <div style="
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 128, 255, 0.1));
      border: 2px solid rgba(0, 212, 255, 0.3);
      border-radius: 8px;
      padding: 20px;
      margin: 16px 0;
    ">
      <div style="font-size: 1.6em; font-weight: bold; color: #00D4FF; margin-bottom: 16px;">
        👥 Holder Statistics
      </div>
      <div style="line-height: 1.8;">
        ${JSON.stringify(stats, null, 2)}
      </div>
    </div>
  `);
}

/**
 * Attributes handler - display collection attributes
 */
async function handleAttributes(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const symbol = args[2];

  if (!symbol) {
    const usageHtml = createUsageError("magiceden attributes <symbol>", [
      "magiceden attributes degods",
      "magiceden attributes solana-monkey-business",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`🎨 Loading attributes for: ${symbol}`, "info");

  const result = await magiceden.fetchAttributes(symbol);

  if (!result.success || result.attributes.length === 0) {
    context.log(`❌ ${result.error || "No attributes found"}`, "error");
    return;
  }

  context.log(
    `✅ Found ${result.attributes.length} attribute types:`,
    "success"
  );
  context.log("", "output");

  // Display attributes
  for (const attr of result.attributes.slice(0, 10)) {
    context.log(
      `  ${attr.trait_type || "Attribute"}: ${attr.value || "N/A"}`,
      "output"
    );
  }

  if (result.attributes.length > 10) {
    context.log("", "output");
    context.log(`  ... and ${result.attributes.length - 10} more`, "info");
  }
}

/**
 * Trending handler - display trending collections
 */
async function handleTrending(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const timeRange = (args[2] as "1h" | "1d" | "7d" | "30d") || "1d";

  // Validate timeRange
  const validTimeRanges = ["1h", "1d", "7d", "30d"];
  if (!validTimeRanges.includes(timeRange)) {
    context.log("❌ Invalid time range. Use: 1h, 1d, 7d, or 30d", "error");
    return;
  }

  context.log(`📈 Loading trending collections (${timeRange})...`, "info");

  const result = await magiceden.fetchTrending(timeRange);

  if (!result.success || result.collections.length === 0) {
    context.log(
      `❌ ${result.error || "No trending collections found"}`,
      "error"
    );
    return;
  }

  context.log(
    `✅ Top ${Math.min(5, result.collections.length)} trending collections:`,
    "success"
  );
  context.log("", "output");

  // Display top 5 collections
  const topCollections = result.collections.slice(0, 5);

  for (let i = 0; i < topCollections.length; i++) {
    const collection = topCollections[i];
    const symbol =
      collection.symbol || collection.collectionSymbol || "unknown";
    const name = collection.name || symbol;
    const floorPrice = collection.floorPrice || collection.fp;

    context.log(`  ${i + 1}. ${name}`, "output");
    context.log(
      `     Floor: ${floorPrice ? formatSOL(floorPrice) : "N/A"}`,
      "info"
    );
    context.log(`     Command: magiceden view ${symbol}`, "info");
    context.log("", "output");
  }
}

/**
 * Show help message
 */
function showHelp(context: CommandContext): void {
  context.logHtml(`
    <div style="
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 128, 255, 0.1));
      border: 2px solid rgba(0, 212, 255, 0.3);
      border-radius: 8px;
      padding: 24px;
      margin: 16px 0;
    ">
      <div style="font-size: 2em; margin-bottom: 16px;">◎ Magic Eden Commands</div>
      
      <div style="margin-bottom: 20px;">
        <strong style="color: #00D4FF;">Collection View:</strong><br/>
        <code>magiceden view &lt;symbol&gt; [limit]</code> - View collection with stats and NFTs<br/>
        <code>magiceden stats &lt;symbol&gt;</code> - Collection statistics<br/>
        <code>magiceden listings &lt;symbol&gt; [limit]</code> - Current listings
      </div>

      <div style="margin-bottom: 20px;">
        <strong style="color: #00D4FF;">Activity:</strong><br/>
        <code>magiceden activities &lt;symbol&gt; [limit]</code> - Recent activities<br/>
        <code>magiceden trending [timeRange]</code> - Trending collections (1h, 1d, 7d, 30d)
      </div>

      <div style="margin-bottom: 20px;">
        <strong style="color: #00D4FF;">Details:</strong><br/>
        <code>magiceden holders &lt;symbol&gt;</code> - Holder statistics<br/>
        <code>magiceden attributes &lt;symbol&gt;</code> - Collection attributes
      </div>

      <div style="background: rgba(0, 212, 255, 0.1); padding: 12px; border-radius: 6px; margin-top: 16px;">
        <strong>💡 Quick Start:</strong><br/>
        <code>magiceden view degods</code> - View DeGods collection<br/>
        <code>magiceden trending 1d</code> - Top trending collections today<br/>
        <br/>
        <em>Aliases: me, magiceden</em>
      </div>
    </div>
  `);
}

/**
 * Export Magic Eden commands
 */
export const magicedenCommands: Command[] = [magicedenCommand];
