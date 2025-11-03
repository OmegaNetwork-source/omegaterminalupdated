/**
 * OpenSea NFT Commands Module
 * Migrated from js/plugins/opensea-enhanced-plugin.js to TypeScript
 * Includes: setup, search, collection, assets, item, analytics, floor, trending, buy, bid, sell, portfolio, watchlist
 *
 * Note: Trading functionality (buy/bid/sell via OpenSea SDK) deferred to Phase 15
 * Note: Portfolio/watchlist/alerts features deferred to Phase 15
 */

import type { Command, CommandContext } from "@/types/commands";
import { opensea } from "@/lib/api";
import { escapeHtml, formatNumber } from "@/lib/utils";

/**
 * Helper function to create NFT card HTML
 */
function createNFTCardHTML(
  nft: any,
  collectionSlug: string,
  contractAddress: string,
  index: number
): string {
  const imageUrl =
    nft.display_image_url || nft.image_url || nft.animation_url || "";
  const name = nft.name || `#${nft.identifier}`;
  const hasPrice = nft.listing?.price?.current?.value;
  const price = hasPrice
    ? `${(
        nft.listing.price.current.value /
        Math.pow(10, nft.listing.price.current.decimals)
      ).toFixed(4)} ${nft.listing.price.current.currency}`
    : null;

  return `
    <div style="
      background: rgba(255, 255, 255, 0.95);
      border: 2px solid rgba(138, 43, 226, 0.2);
      border-radius: 20px;
      overflow: hidden;
      backdrop-filter: blur(30px);
      box-shadow: 0 12px 32px rgba(138, 43, 226, 0.15);
      transition: all 0.3s ease;
    ">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" style="
        width: 100%;
        height: 220px;
        object-fit: cover;
        display: block;
      " onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%238A2BE2%22 width=%22100%22 height=%22100%22/><text fill=%22%23fff%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2230%22>🖼️</text></svg>'" />
      <div style="padding: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <div style="font-size: 1.2em; font-weight: bold; color: #4B0082;">${escapeHtml(
              name
            )}</div>
            <div style="color: #666; font-size: 0.85em;">${escapeHtml(
              collectionSlug
            )}</div>
          </div>
          <div style="
            background: #8A2BE2;
            color: #fff;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.8em;
          ">${index}</div>
        </div>
        <div style="
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 14px;
          text-align: center;
          background: ${
            price ? "rgba(52, 199, 89, 0.15)" : "rgba(255, 149, 0, 0.15)"
          };
          border: 2px solid ${
            price ? "rgba(52, 199, 89, 0.4)" : "rgba(255, 149, 0, 0.4)"
          };
        ">
          <div style="font-weight: bold; font-size: 1em; color: ${
            price ? "#34C759" : "#FF9500"
          };">
            ${price ? "FOR SALE" : "NOT FOR SALE"}
          </div>
          ${
            price
              ? `<div style="font-weight: bold; font-size: 1.3em; color: #34C759;">${price}</div>`
              : ""
          }
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="terminal.executeCommand('nft item ${escapeHtml(
            contractAddress
          )} ${escapeHtml(nft.identifier)}')" style="
            background: #8A2BE2;
            color: #fff;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.8em;
            font-weight: bold;
            flex: 1;
          ">View</button>
          ${
            price
              ? `<button onclick="terminal.executeCommand('nft buy ${escapeHtml(
                  contractAddress
                )} ${escapeHtml(nft.identifier)}')" style="
            background: #34C759;
            color: #fff;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.8em;
            font-weight: bold;
            flex: 1;
          ">Buy</button>`
              : `<button onclick="terminal.executeCommand('nft bid ${escapeHtml(
                  contractAddress
                )} ${escapeHtml(nft.identifier)}')" style="
            background: #FF9500;
            color: #fff;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.8em;
            font-weight: bold;
            flex: 1;
          ">Bid</button>`
          }
        </div>
      </div>
    </div>
  `;
}

/**
 * OpenSea command - main NFT marketplace command
 */
const openseaCommand: Command = {
  name: "nft",
  aliases: ["opensea"],
  description: "OpenSea NFT marketplace",
  usage:
    "nft <setup|search|collection|assets|item|analytics|floor|trending|help> [params]",
  category: "nft",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand) {
      // Show help
      showHelp(context);
      return;
    }

    switch (subcommand) {
      case "setup":
      case "config":
        await handleSetup(context, args);
        break;
      case "search":
        await handleSearch(context, args);
        break;
      case "collection":
        await handleCollection(context, args);
        break;
      case "assets":
        await handleAssets(context, args);
        break;
      case "item":
        await handleItem(context, args);
        break;
      case "analytics":
        await handleAnalytics(context, args);
        break;
      case "floor":
        await handleFloor(context, args);
        break;
      case "trending":
        await handleTrending(context, args);
        break;
      case "buy":
        await handleBuy(context, args);
        break;
      case "bid":
        await handleBid(context, args);
        break;
      case "sell":
        await handleSell(context, args);
        break;
      case "portfolio":
        await handlePortfolio(context, args);
        break;
      case "watchlist":
        await handleWatchlist(context, args);
        break;
      case "help":
      default:
        showHelp(context);
        break;
    }
  },
};

/**
 * Setup handler - configure OpenSea API key
 */
async function handleSetup(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const apiKey = args[2];

  if (apiKey) {
    // Set API key
    opensea.setApiKey(apiKey);
    const masked =
      apiKey.substring(0, 8) + "..." + apiKey.substring(apiKey.length - 4);
    context.log(`✅ OpenSea API key configured: ${masked}`, "success");
    context.log("   Test your key with: nft search azuki", "info");
  } else {
    // Show setup instructions
    context.logHtml(`
      <div style="
        background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(154, 76, 240, 0.1));
        border: 2px solid rgba(138, 43, 226, 0.3);
        border-radius: 16px;
        padding: 24px;
        margin: 16px 0;
        backdrop-filter: blur(10px);
      ">
        <div style="font-size: 2em; margin-bottom: 16px;">🔑 OpenSea API Setup</div>
        <div style="margin-bottom: 20px; line-height: 1.6;">
          <strong>Get your free OpenSea API key:</strong><br/>
          <ol style="margin: 12px 0; padding-left: 24px;">
            <li>Visit <a href="https://docs.opensea.io/reference/api-keys" target="_blank" style="color: #8A2BE2;">OpenSea API Keys</a></li>
            <li>Sign up or log in to your OpenSea account</li>
            <li>Request a free API key (no credit card required)</li>
            <li>Copy your API key</li>
            <li>Return here and run: <code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px;">nft setup YOUR_API_KEY</code></li>
          </ol>
        </div>
        <div style="background: rgba(255, 149, 0, 0.1); border-left: 3px solid #FF9500; padding: 12px; border-radius: 4px;">
          <strong>⚠️ Note:</strong> API key is stored in browser localStorage and only used for this session.
        </div>
      </div>
    `);
  }
}

/**
 * Search handler - search for NFT collections
 */
async function handleSearch(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const query = args.slice(2).join(" ");

  if (!query) {
    context.log("❌ Please provide a search query", "error");
    context.log("   Usage: nft search <query>", "info");
    return;
  }

  context.log(`🔍 Searching for: ${query}`, "info");

  const result = await opensea.searchCollections(query);

  if (!result.success || result.collections.length === 0) {
    context.log("❌ No collections found", "error");
    return;
  }

  context.log(`✅ Found ${result.collections.length} collections:`, "success");
  context.log("", "output");

  // Display up to 5 results
  const collections = result.collections.slice(0, 5);

  for (const collection of collections) {
    context.logHtml(`
      <div style="
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(138, 43, 226, 0.2);
        border-radius: 12px;
        padding: 16px;
        margin: 12px 0;
      ">
        <div style="font-size: 1.3em; font-weight: bold; color: #8A2BE2; margin-bottom: 8px;">
          ${escapeHtml(collection.name)}
        </div>
        <div style="color: #666; margin-bottom: 12px;">
          ${escapeHtml(collection.description)}
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="terminal.executeCommand('nft assets ${escapeHtml(
            collection.slug
          )}')" style="
            background: #8A2BE2;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
          ">View NFTs</button>
          <button onclick="terminal.executeCommand('nft analytics ${escapeHtml(
            collection.slug
          )}')" style="
            background: #34C759;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
          ">Analytics</button>
        </div>
      </div>
    `);
  }
}

/**
 * Collection handler - display collection details
 */
async function handleCollection(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const slug = args[2];

  if (!slug) {
    context.log("❌ Please provide a collection slug", "error");
    context.log("   Usage: nft collection <slug>", "info");
    return;
  }

  context.log(`📦 Loading collection: ${slug}`, "info");

  const result = await opensea.getCollection(slug);

  if (!result.success || !result.collection) {
    context.log(`❌ ${result.error || "Collection not found"}`, "error");
    if (result.error?.includes("API key")) {
      context.log(
        "💡 Configure your API key with: nft setup <your-api-key>",
        "info"
      );
    }
    return;
  }

  const collection = result.collection;

  context.logHtml(`
    <div style="
      background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(154, 76, 240, 0.1));
      border: 2px solid rgba(138, 43, 226, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin: 16px 0;
    ">
      ${
        collection.banner_image_url
          ? `<img src="${escapeHtml(
              collection.banner_image_url
            )}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 16px;" />`
          : ""
      }
      <div style="display: flex; gap: 16px; align-items: start; margin-bottom: 16px;">
        ${
          collection.image_url
            ? `<img src="${escapeHtml(
                collection.image_url
              )}" style="width: 80px; height: 80px; border-radius: 12px; object-fit: cover;" />`
            : ""
        }
        <div style="flex: 1;">
          <div style="font-size: 1.8em; font-weight: bold; color: #8A2BE2; margin-bottom: 8px;">
            ${escapeHtml(collection.name)}
          </div>
          <div style="color: #666; margin-bottom: 12px;">
            ${escapeHtml(collection.description || "No description available")}
          </div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 16px;">
        <div style="background: rgba(255,255,255,0.5); padding: 12px; border-radius: 8px;">
          <div style="color: #666; font-size: 0.9em;">Total Supply</div>
          <div style="font-size: 1.3em; font-weight: bold;">${
            collection.total_supply
              ? formatNumber(collection.total_supply)
              : "N/A"
          }</div>
        </div>
        <div style="background: rgba(255,255,255,0.5); padding: 12px; border-radius: 8px;">
          <div style="color: #666; font-size: 0.9em;">Category</div>
          <div style="font-size: 1.3em; font-weight: bold;">${
            collection.category || "N/A"
          }</div>
        </div>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button onclick="terminal.executeCommand('nft assets ${escapeHtml(
          slug
        )}')" style="
          background: #8A2BE2;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          flex: 1;
        ">View NFTs</button>
        <button onclick="terminal.executeCommand('nft analytics ${escapeHtml(
          slug
        )}')" style="
          background: #34C759;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          flex: 1;
        ">Analytics</button>
      </div>
    </div>
  `);
}

/**
 * Assets handler - display collection NFTs
 */
async function handleAssets(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const slug = args[2];
  const limit = parseInt(args[3]) || 12;

  if (!slug) {
    context.log("❌ Please provide a collection slug", "error");
    context.log("   Usage: nft assets <slug> [limit]", "info");
    return;
  }

  context.log(`🖼️  Loading ${limit} NFTs from ${slug}...`, "info");

  // Fetch both collection details (for contract address) and NFTs
  const [collectionResult, nftsResult] = await Promise.all([
    opensea.getCollection(slug),
    opensea.getCollectionNFTs(slug, limit),
  ]);

  if (!nftsResult.success || nftsResult.nfts.length === 0) {
    context.log(`❌ ${nftsResult.error || "No NFTs found"}`, "error");
    if (nftsResult.error?.includes("API key")) {
      context.log(
        "💡 Configure your API key with: nft setup <your-api-key>",
        "info"
      );
    }
    return;
  }

  // Extract contract address from collection or first NFT
  let contractAddress = "";
  if (collectionResult.success && collectionResult.collection?.contracts?.[0]) {
    contractAddress = collectionResult.collection.contracts[0].address;
  } else if (nftsResult.nfts[0]?.contract) {
    contractAddress = nftsResult.nfts[0].contract;
  }

  if (!contractAddress) {
    context.log(
      "⚠️ Warning: Could not determine contract address. Commands may not work correctly.",
      "warning"
    );
  }

  context.log(`✅ Loaded ${nftsResult.nfts.length} NFTs`, "success");
  context.log("", "output");

  // Display NFTs in grid
  const gridHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 16px 0;">
      ${nftsResult.nfts
        .map((nft, index) =>
          createNFTCardHTML(
            nft,
            slug,
            nft.contract || contractAddress,
            index + 1
          )
        )
        .join("")}
    </div>
  `;

  context.logHtml(gridHTML);
}

/**
 * Item handler - display individual NFT details
 * Accepts either contract address or collection slug (will resolve to contract)
 */
async function handleItem(
  context: CommandContext,
  args: string[]
): Promise<void> {
  let contractAddressOrSlug = args[2];
  const tokenId = args[3];

  if (!contractAddressOrSlug || !tokenId) {
    context.log(
      "❌ Please provide contract address/slug and token ID",
      "error"
    );
    context.log("   Usage: nft item <contractAddress> <tokenId>", "info");
    context.log(
      "   Note: Contract address is preferred. Collection slug will be resolved automatically.",
      "info"
    );
    return;
  }

  // Check if it's a slug (not starting with 0x) and resolve to contract address
  let contractAddress = contractAddressOrSlug;
  if (!contractAddressOrSlug.startsWith("0x")) {
    context.log(`🔄 Resolving collection slug to contract address...`, "info");
    const collectionResult = await opensea.getCollection(contractAddressOrSlug);
    if (
      collectionResult.success &&
      collectionResult.collection?.contracts?.[0]
    ) {
      contractAddress = collectionResult.collection.contracts[0].address;
      context.log(`✅ Resolved to: ${contractAddress}`, "success");
    } else {
      context.log(
        "⚠️ Could not resolve slug to contract address, using as-is",
        "warning"
      );
    }
  }

  context.log(`🔍 Loading NFT: ${contractAddress} #${tokenId}`, "info");

  const result = await opensea.getNFTDetails(contractAddress, tokenId);

  if (!result.success || !result.nft) {
    context.log(`❌ ${result.error || "NFT not found"}`, "error");
    return;
  }

  const nft = result.nft;
  const imageUrl =
    nft.display_image_url || nft.image_url || nft.animation_url || "";
  const name = nft.name || `#${nft.identifier}`;
  const hasPrice = nft.listing?.price?.current?.value;
  const price = hasPrice
    ? `${(
        nft.listing.price.current.value /
        Math.pow(10, nft.listing.price.current.decimals)
      ).toFixed(4)} ${nft.listing.price.current.currency}`
    : "Not for sale";

  context.logHtml(`
    <div style="
      background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(154, 76, 240, 0.1));
      border: 2px solid rgba(138, 43, 226, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin: 16px 0;
      display: flex;
      gap: 24px;
    ">
      <div style="flex: 0 0 300px;">
        <img src="${escapeHtml(
          imageUrl
        )}" style="width: 100%; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);" />
      </div>
      <div style="flex: 1;">
        <div style="font-size: 2em; font-weight: bold; color: #8A2BE2; margin-bottom: 12px;">
          ${escapeHtml(name)}
        </div>
        <div style="color: #666; margin-bottom: 16px;">
          Contract: ${escapeHtml(contractAddress)}
        </div>
        ${
          nft.description
            ? `<div style="margin-bottom: 16px; line-height: 1.6;">${escapeHtml(
                nft.description
              )}</div>`
            : ""
        }
        <div style="background: rgba(255,255,255,0.5); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
          <div style="color: #666; margin-bottom: 8px;">Price</div>
          <div style="font-size: 1.8em; font-weight: bold; color: ${
            hasPrice ? "#34C759" : "#FF9500"
          };">
            ${price}
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          ${
            hasPrice
              ? `<button onclick="terminal.executeCommand('nft buy ${escapeHtml(
                  contractAddress
                )} ${escapeHtml(tokenId)}')" style="
            background: #34C759;
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            flex: 1;
          ">Buy Now</button>`
              : ""
          }
          <button onclick="terminal.executeCommand('nft bid ${escapeHtml(
            contractAddress
          )} ${escapeHtml(tokenId)}')" style="
            background: #FF9500;
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            flex: 1;
          ">Make Offer</button>
        </div>
      </div>
    </div>
  `);
}

/**
 * Analytics handler - display collection analytics
 */
async function handleAnalytics(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const slug = args[2];

  if (!slug) {
    context.log("❌ Please provide a collection slug", "error");
    context.log("   Usage: nft analytics <slug>", "info");
    return;
  }

  context.log(`📊 Loading analytics for: ${slug}`, "info");

  const [collectionResult, statsResult] = await Promise.all([
    opensea.getCollection(slug),
    opensea.getCollectionStats(slug),
  ]);

  if (!collectionResult.success || !collectionResult.collection) {
    context.log(
      `❌ ${collectionResult.error || "Collection not found"}`,
      "error"
    );
    return;
  }

  const collection = collectionResult.collection;
  const stats = statsResult.stats;

  context.logHtml(`
    <div style="
      background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(154, 76, 240, 0.1));
      border: 2px solid rgba(138, 43, 226, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin: 16px 0;
    ">
      <div style="font-size: 1.8em; font-weight: bold; color: #8A2BE2; margin-bottom: 16px;">
        📊 ${escapeHtml(collection.name)} Analytics
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        ${
          stats
            ? `
          <div style="background: rgba(255,255,255,0.5); padding: 16px; border-radius: 12px;">
            <div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">Floor Price</div>
            <div style="font-size: 1.5em; font-weight: bold;">${
              stats.total.floor_price
                ? formatNumber(stats.total.floor_price) +
                  " " +
                  stats.total.floor_price_symbol
                : "N/A"
            }</div>
          </div>
          <div style="background: rgba(255,255,255,0.5); padding: 16px; border-radius: 12px;">
            <div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">Total Volume</div>
            <div style="font-size: 1.5em; font-weight: bold;">${formatNumber(
              stats.total.volume
            )} ETH</div>
          </div>
          <div style="background: rgba(255,255,255,0.5); padding: 16px; border-radius: 12px;">
            <div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">Total Sales</div>
            <div style="font-size: 1.5em; font-weight: bold;">${formatNumber(
              stats.total.sales
            )}</div>
          </div>
          <div style="background: rgba(255,255,255,0.5); padding: 16px; border-radius: 12px;">
            <div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">Owners</div>
            <div style="font-size: 1.5em; font-weight: bold;">${formatNumber(
              stats.total.num_owners
            )}</div>
          </div>
        `
            : `
          <div style="background: rgba(255,149,0,0.1); padding: 16px; border-radius: 12px; grid-column: 1 / -1;">
            <div>⚠️ Statistics require API key. Use: nft setup <your-api-key></div>
          </div>
        `
        }
      </div>
    </div>
  `);
}

/**
 * Floor handler - display floor price
 */
async function handleFloor(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const slug = args[2];

  if (!slug) {
    context.log("❌ Please provide a collection slug", "error");
    context.log("   Usage: nft floor <slug>", "info");
    return;
  }

  context.log(`📊 Loading floor price for: ${slug}`, "info");

  const statsResult = await opensea.getCollectionStats(slug);

  if (!statsResult.success || !statsResult.stats) {
    context.log(`❌ ${statsResult.error || "Stats not found"}`, "error");
    return;
  }

  const floorPrice = statsResult.stats.total.floor_price;
  const floorSymbol = statsResult.stats.total.floor_price_symbol;

  context.log(
    `✅ Floor Price: ${formatNumber(floorPrice)} ${floorSymbol}`,
    "success"
  );
}

/**
 * Trending handler - display trending collections
 */
async function handleTrending(
  context: CommandContext,
  args: string[]
): Promise<void> {
  context.log("📈 Trending NFT Collections (Demo Data)", "info");
  context.log("", "output");
  context.log("   Coming soon: Live trending data from OpenSea", "info");
  context.log(
    "   Use: nft search <collection> to explore specific collections",
    "info"
  );
}

/**
 * Buy handler - OpenSea SDK trading (Phase 15)
 */
async function handleBuy(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const collection = args[2];
  const tokenId = args[3];

  if (!collection || !tokenId) {
    context.log("❌ Please provide collection and token ID", "error");
    context.log("   Usage: nft buy <collection> <tokenId>", "info");
    return;
  }

  context.logHtml(`
    <div style="
      background: rgba(255, 149, 0, 0.1);
      border: 2px solid rgba(255, 149, 0, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 16px 0;
    ">
      <div style="font-size: 1.5em; margin-bottom: 12px;">🛒 Buy NFT</div>
      <div style="margin-bottom: 16px;">
        <strong>Collection:</strong> ${escapeHtml(collection)}<br/>
        <strong>Token ID:</strong> ${escapeHtml(tokenId)}
      </div>
      <div style="background: rgba(255, 149, 0, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
        <strong>⚠️ Trading Integration Coming in Phase 15</strong><br/>
        OpenSea SDK integration for buy/sell/bid functionality will be available in the futuristic UI system.
      </div>
      <div style="margin-top: 16px;">
        <strong>For now, you can:</strong><br/>
        • View NFT on OpenSea: <a href="https://opensea.io/assets/ethereum/${escapeHtml(
          collection
        )}/${escapeHtml(
    tokenId
  )}" target="_blank" style="color: #FF9500;">Open in OpenSea</a><br/>
        • Use 'pgt' commands for wallet tracking<br/>
        • Explore collections with 'nft search' and 'nft analytics'
      </div>
    </div>
  `);
}

/**
 * Bid handler - OpenSea SDK trading (Phase 15)
 */
async function handleBid(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const collection = args[2];
  const tokenId = args[3];

  if (!collection || !tokenId) {
    context.log("❌ Please provide collection and token ID", "error");
    context.log("   Usage: nft bid <collection> <tokenId>", "info");
    return;
  }

  context.logHtml(`
    <div style="
      background: rgba(255, 149, 0, 0.1);
      border: 2px solid rgba(255, 149, 0, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 16px 0;
    ">
      <div style="font-size: 1.5em; margin-bottom: 12px;">🎯 Make Offer</div>
      <div style="margin-bottom: 16px;">
        <strong>Collection:</strong> ${escapeHtml(collection)}<br/>
        <strong>Token ID:</strong> ${escapeHtml(tokenId)}
      </div>
      <div style="background: rgba(255, 149, 0, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
        <strong>⚠️ Trading Integration Coming in Phase 15</strong><br/>
        OpenSea SDK integration for buy/sell/bid functionality will be available in the futuristic UI system.
      </div>
      <div style="margin-top: 16px;">
        <strong>For now, you can:</strong><br/>
        • View NFT on OpenSea: <a href="https://opensea.io/assets/ethereum/${escapeHtml(
          collection
        )}/${escapeHtml(
    tokenId
  )}" target="_blank" style="color: #FF9500;">Open in OpenSea</a>
      </div>
    </div>
  `);
}

/**
 * Sell handler - OpenSea SDK trading (Phase 15)
 */
async function handleSell(
  context: CommandContext,
  args: string[]
): Promise<void> {
  context.logHtml(`
    <div style="
      background: rgba(255, 149, 0, 0.1);
      border: 2px solid rgba(255, 149, 0, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 16px 0;
    ">
      <div style="font-size: 1.5em; margin-bottom: 12px;">💰 Sell NFT</div>
      <div style="background: rgba(255, 149, 0, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
        <strong>⚠️ Trading Integration Coming in Phase 15</strong><br/>
        OpenSea SDK integration for selling NFTs will be available in the futuristic UI system.
      </div>
      <div style="margin-top: 16px;">
        <strong>For now, you can:</strong><br/>
        • List your NFTs on OpenSea: <a href="https://opensea.io" target="_blank" style="color: #FF9500;">opensea.io</a><br/>
        • Use 'pgt' commands for wallet tracking
      </div>
    </div>
  `);
}

/**
 * Portfolio handler - NFT portfolio tracking (Phase 15)
 */
async function handlePortfolio(
  context: CommandContext,
  args: string[]
): Promise<void> {
  context.logHtml(`
    <div style="
      background: rgba(52, 199, 89, 0.1);
      border: 2px solid rgba(52, 199, 89, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 16px 0;
    ">
      <div style="font-size: 1.5em; margin-bottom: 12px;">📊 NFT Portfolio</div>
      <div style="background: rgba(52, 199, 89, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
        <strong>📅 Feature Coming in Phase 15</strong><br/>
        Portfolio tracking will include:<br/>
        • Your owned NFTs across collections<br/>
        • Portfolio value tracking<br/>
        • Profit/loss analytics<br/>
        • Collection insights
      </div>
      <div style="margin-top: 16px;">
        <strong>Available now:</strong><br/>
        • Use 'pgt' commands for token tracking<br/>
        • Explore collections with 'nft search' and 'nft analytics'
      </div>
    </div>
  `);
}

/**
 * Watchlist handler - NFT watchlist and alerts (Phase 15)
 */
async function handleWatchlist(
  context: CommandContext,
  args: string[]
): Promise<void> {
  context.logHtml(`
    <div style="
      background: rgba(52, 199, 89, 0.1);
      border: 2px solid rgba(52, 199, 89, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 16px 0;
    ">
      <div style="font-size: 1.5em; margin-bottom: 12px;">⭐ NFT Watchlist</div>
      <div style="background: rgba(52, 199, 89, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
        <strong>📅 Feature Coming in Phase 15</strong><br/>
        Watchlist will include:<br/>
        • Save favorite collections<br/>
        • Floor price alerts<br/>
        • New listing notifications<br/>
        • Rare trait tracking
      </div>
      <div style="margin-top: 16px;">
        <strong>Available now:</strong><br/>
        • Explore collections with 'nft search'<br/>
        • Track analytics with 'nft analytics <slug>'
      </div>
    </div>
  `);
}

/**
 * Show help message
 */
function showHelp(context: CommandContext): void {
  context.logHtml(`
    <div style="
      background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(154, 76, 240, 0.1));
      border: 2px solid rgba(138, 43, 226, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin: 16px 0;
    ">
      <div style="font-size: 2em; margin-bottom: 16px;">🎨 OpenSea NFT Commands</div>
      
      <div style="margin-bottom: 20px;">
        <strong style="color: #8A2BE2;">Setup:</strong><br/>
        <code>nft setup &lt;api-key&gt;</code> - Configure OpenSea API key<br/>
        <code>nft config</code> - View current configuration
      </div>

      <div style="margin-bottom: 20px;">
        <strong style="color: #8A2BE2;">Discovery:</strong><br/>
        <code>nft search &lt;query&gt;</code> - Search for collections<br/>
        <code>nft collection &lt;slug&gt;</code> - View collection details<br/>
        <code>nft assets &lt;slug&gt; [limit]</code> - View collection NFTs<br/>
        <code>nft item &lt;contractAddress&gt; &lt;tokenId&gt;</code> - View specific NFT (also accepts slug)
      </div>

      <div style="margin-bottom: 20px;">
        <strong style="color: #8A2BE2;">Analytics:</strong><br/>
        <code>nft analytics &lt;slug&gt;</code> - Collection analytics<br/>
        <code>nft floor &lt;slug&gt;</code> - Floor price<br/>
        <code>nft trending</code> - Trending collections
      </div>

      <div style="margin-bottom: 20px;">
        <strong style="color: #8A2BE2;">Trading (Phase 15):</strong><br/>
        <code>nft buy &lt;contractAddress&gt; &lt;tokenId&gt;</code> - Buy NFT<br/>
        <code>nft bid &lt;contractAddress&gt; &lt;tokenId&gt;</code> - Make offer<br/>
        <code>nft sell</code> - Sell NFT
      </div>

      <div style="margin-bottom: 20px;">
        <strong style="color: #8A2BE2;">Portfolio (Phase 15):</strong><br/>
        <code>nft portfolio</code> - View your NFT portfolio<br/>
        <code>nft watchlist</code> - Manage watchlist
      </div>

      <div style="background: rgba(255, 149, 0, 0.1); padding: 12px; border-radius: 8px; margin-top: 16px;">
        <strong>💡 Quick Start:</strong><br/>
        1. Get free API key: <a href="https://docs.opensea.io/reference/api-keys" target="_blank" style="color: #FF9500;">OpenSea API Keys</a><br/>
        2. Configure: <code>nft setup YOUR_API_KEY</code><br/>
        3. Explore: <code>nft search azuki</code>
      </div>
    </div>
  `);
}

/**
 * Export OpenSea commands
 */
export const openseaCommands: Command[] = [openseaCommand];
