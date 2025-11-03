/**
 * DeFi Llama Commands
 *
 * Provides TVL data, protocol rankings, chain analytics, and token prices.
 * Matches styling from defillama-api-plugin.js for consistency.
 */

import type { Command, CommandContext } from "@/types/commands";
import { defillama } from "@/lib/api";
import { formatNumber, formatCurrency, escapeHtml } from "@/lib/utils";

/**
 * Format large currency values with K/M/B suffixes
 * Matches the plugin implementation
 */
function formatLlamaCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Convert protocol name to slug
 * Replaces spaces with dashes and lowercases
 */
function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/**
 * DeFi Llama command
 * TVL and protocol data
 */
export const defillamaCommand: Command = {
  name: "defillama",
  aliases: ["llama"],
  description: "DeFi Llama TVL and protocol data",
  usage:
    "defillama <tvl|protocols|chains|price|tokens|trending|debug> [params]",
  category: "api",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand) {
      context.log("🦙 DeFi Llama - DeFi Analytics");
      context.log("");
      context.log("TVL Commands:");
      context.log("  defillama tvl                  - Total DeFi TVL");
      context.log("  defillama tvl <protocol>       - Protocol TVL");
      context.log("  defillama protocols [limit]    - Top protocols");
      context.log("  defillama chains [limit]       - Top chains");
      context.log("  defillama trending             - Trending protocols");
      context.log("");
      context.log("Price Commands:");
      context.log("  defillama price <token>        - Token price");
      context.log("  defillama tokens <token,token> - Multiple prices");
      context.log("  defillama debug <token>        - Debug token lookup");
      context.log("");
      context.log("Examples:");
      context.log("  defillama tvl");
      context.log("  defillama tvl uniswap");
      context.log("  defillama protocols 10");
      context.log("  defillama chains 15");
      context.log("  defillama price eth");
      context.log("  defillama tokens eth,btc,sol");
      return;
    }

    switch (subcommand) {
      case "tvl":
        await handleTvl(context, args);
        break;
      case "protocols":
        await handleProtocols(context, args);
        break;
      case "chains":
        await handleChains(context, args);
        break;
      case "price":
        await handlePrice(context, args);
        break;
      case "tokens":
        await handleTokens(context, args);
        break;
      case "trending":
        await handleTrending(context);
        break;
      case "debug":
        await handleDebug(context, args);
        break;
      default:
        context.log(`Unknown subcommand: ${subcommand}`);
        context.log('Use "defillama" to see available commands');
    }
  },
};

/**
 * Handle TVL command
 */
async function handleTvl(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const protocol = args[2];

  if (protocol) {
    // Protocol-specific TVL
    context.log(`Fetching TVL for ${protocol}...`);
    context.log("");

    const result = await defillama.getProtocolTVL(protocol);

    if (!result.success || !result.protocol) {
      context.log(result.error || "Protocol not found");
      context.log("");
      context.log("Try searching with the protocol slug:");
      context.log('  e.g., "uniswap", "aave", "curve"');
      return;
    }

    const p = result.protocol;

    const html = `
      <div style="background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), rgba(255, 255, 255, 0.05)); border: 1px solid rgba(52, 199, 89, 0.3); border-radius: 16px; padding: 20px; margin: 10px 0; backdrop-filter: blur(20px); box-shadow: 0 4px 16px rgba(52, 199, 89, 0.1);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          ${
            p.logo
              ? `<img src="${p.logo}" alt="${escapeHtml(
                  p.name
                )}" style="width: 48px; height: 48px; border-radius: 8px; border: 2px solid #34C759;" />`
              : `<div style="width: 48px; height: 48px; border-radius: 8px; background: #34C759; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px;">${escapeHtml(
                  p.name[0]
                )}</div>`
          }
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #1B5E20;">${escapeHtml(
              p.name
            )}</div>
            ${
              p.category
                ? `<div style="color: #666; font-size: 14px;">${escapeHtml(
                    p.category
                  )}</div>`
                : ""
            }
          </div>
        </div>
        <div style="font-size: 32px; color: #2E7D32; font-weight: bold; margin-bottom: 8px;">${formatLlamaCurrency(
          p.tvl
        )}</div>
        ${
          p.change_1d
            ? `<div style="font-size: 16px; color: ${
                p.change_1d >= 0 ? "#34C759" : "#FF3B30"
              }; font-weight: bold; margin-bottom: 12px;">${
                p.change_1d >= 0 ? "+" : ""
              }${p.change_1d.toFixed(2)}% (24h)</div>`
            : ""
        }
        ${
          p.chains && p.chains.length > 0
            ? `<div style="color: #888; font-size: 12px; margin-top: 8px;">Chains: ${p.chains.join(
                ", "
              )}</div>`
            : ""
        }
        ${
          p.url
            ? `<div style="margin-top: 12px;"><a href="${p.url}" target="_blank" style="background: #34C759; color: #fff; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block;">Visit Protocol</a></div>`
            : ""
        }
      </div>
    `;

    context.logHtml(html);
  } else {
    // Total DeFi TVL
    context.log("Fetching total DeFi TVL...");
    context.log("");

    const result = await defillama.getTotalTVL();

    if (!result.success) {
      context.log(result.error || "Failed to fetch TVL");
      return;
    }

    const html = `
      <div style="background: linear-gradient(135deg, rgba(52, 199, 89, 0.2), rgba(255, 255, 255, 0.05)); border: 2px solid rgba(52, 199, 89, 0.4); border-radius: 16px; padding: 24px; margin: 10px 0; backdrop-filter: blur(20px); box-shadow: 0 4px 24px rgba(52, 199, 89, 0.2); text-align: center;">
        <div style="font-size: 20px; color: #34C759; font-weight: bold; margin-bottom: 16px;">🦙 Total DeFi TVL</div>
        <div style="font-size: 48px; color: #2E7D32; font-weight: bold; margin-bottom: 8px;">${formatLlamaCurrency(
          result.tvl
        )}</div>
        <div style="font-size: 16px; color: #888;">Across ${
          result.chainCount
        } chains</div>
      </div>
    `;

    context.logHtml(html);
  }
}

/**
 * Handle protocols command
 */
async function handleProtocols(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const limit = parseInt(args[2]) || 10;

  context.log(`Fetching top ${limit} protocols...`);
  context.log("");

  const result = await defillama.getTopProtocols(limit);

  if (!result.success || result.protocols.length === 0) {
    context.log(result.error || "No protocols found");
    return;
  }

  result.protocols.forEach((p, index) => {
    const html = `
      <div style="background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), rgba(255, 255, 255, 0.05)); border: 1px solid rgba(52, 199, 89, 0.3); border-radius: 16px; padding: 16px; margin: 8px 0; backdrop-filter: blur(20px); box-shadow: 0 4px 16px rgba(52, 199, 89, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
            <div style="background: #34C759; color: #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${
              index + 1
            }</div>
            ${
              p.logo
                ? `<img src="${p.logo}" alt="${escapeHtml(
                    p.name
                  )}" style="width: 36px; height: 36px; border-radius: 8px; border: 2px solid #34C759;" />`
                : `<div style="width: 36px; height: 36px; border-radius: 8px; background: #34C759; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">${escapeHtml(
                    p.name[0]
                  )}</div>`
            }
            <div style="flex: 1;">
              <div style="font-size: 18px; font-weight: bold; color: #1B5E20;">${escapeHtml(
                p.name
              )}</div>
              ${
                p.category
                  ? `<div style="color: #666; font-size: 14px;">${escapeHtml(
                      p.category
                    )}</div>`
                  : ""
              }
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 20px; color: #2E7D32; font-weight: bold;">${formatLlamaCurrency(
              p.tvl
            )}</div>
            ${
              p.change_1d !== undefined
                ? `<div style="font-size: 14px; color: ${
                    p.change_1d >= 0 ? "#34C759" : "#FF3B30"
                  }; font-weight: bold;">${
                    p.change_1d >= 0 ? "+" : ""
                  }${p.change_1d.toFixed(2)}%</div>`
                : ""
            }
          </div>
        </div>
        ${
          p.chains && p.chains.length > 0
            ? `<div style="color: #888; font-size: 12px; margin-top: 8px;">Chains: ${p.chains
                .slice(0, 5)
                .join(", ")}${p.chains.length > 5 ? "..." : ""}</div>`
            : ""
        }
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
          ${
            p.url
              ? `<a href="${p.url}" target="_blank" style="background: #34C759; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold;">Visit Protocol</a>`
              : ""
          }
          <button onclick="window.dispatchEvent(new CustomEvent('terminal-command', {detail: 'defillama tvl ${
            p.slug || toSlug(p.name)
          }'}))" style="background: #007AFF; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; border: none; cursor: pointer;">Detailed TVL</button>
        </div>
      </div>
    `;

    context.logHtml(html);
  });
}

/**
 * Handle chains command
 */
async function handleChains(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const limit = parseInt(args[2]) || 15;

  context.log(`Fetching top ${limit} chains...`);
  context.log("");

  const result = await defillama.getChainTVLs(limit);

  if (!result.success || result.chains.length === 0) {
    context.log(result.error || "No chains found");
    return;
  }

  result.chains.forEach((c, index) => {
    const html = `
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(0, 122, 255, 0.2); border-radius: 16px; padding: 16px; margin: 8px 0; backdrop-filter: blur(20px); box-shadow: 0 4px 16px rgba(0, 122, 255, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
            <div style="background: #007AFF; color: #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${
              index + 1
            }</div>
            <div style="flex: 1;">
              <div style="font-size: 18px; font-weight: bold; color: #1565C0;">${escapeHtml(
                c.name
              )}</div>
              ${
                c.tokenSymbol
                  ? `<div style="color: #666; font-size: 14px;">${escapeHtml(
                      c.tokenSymbol
                    )}</div>`
                  : ""
              }
            </div>
          </div>
          <div style="text-align: right;">
            <div style="color: #1565C0; font-weight: bold; font-size: 18px;">${formatLlamaCurrency(
              c.tvl
            )}</div>
            ${
              c.change_1d !== undefined
                ? `<div style="font-size: 14px; color: ${
                    c.change_1d >= 0 ? "#34C759" : "#FF3B30"
                  };">${c.change_1d >= 0 ? "+" : ""}${c.change_1d.toFixed(
                    2
                  )}%</div>`
                : ""
            }
          </div>
        </div>
      </div>
    `;

    context.logHtml(html);
  });
}

/**
 * Handle price command
 */
async function handlePrice(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const token = args[2]?.toLowerCase();

  if (!token) {
    context.log("Usage: defillama price <token>");
    context.log("Example: defillama price eth");
    return;
  }

  context.log(`Fetching price for ${token}...`);
  context.log("");

  const result = await defillama.getTokenPrice(token);

  if (!result.success || !result.price) {
    context.log(result.error || "Token not found");
    context.log("");
    context.log("Try common tokens: eth, btc, sol, usdc, usdt");
    context.log("Or use: defillama debug <token>");
    return;
  }

  const price = result.price;
  const lastUpdate = new Date(price.timestamp).toLocaleString();

  const html = `
    <div style="background: linear-gradient(135deg, rgba(0, 122, 255, 0.2), rgba(255, 255, 255, 0.05)); border: 2px solid rgba(0, 122, 255, 0.4); border-radius: 16px; padding: 20px; margin: 10px 0; backdrop-filter: blur(20px); box-shadow: 0 4px 24px rgba(0, 122, 255, 0.2);">
      <div style="font-size: 24px; font-weight: bold; color: #007AFF; margin-bottom: 8px; text-transform: uppercase;">${escapeHtml(
        price.symbol
      )}</div>
      <div style="font-size: 36px; color: #00ff88; font-weight: bold; margin-bottom: 8px;">$${price.price.toFixed(
        6
      )}</div>
      <div style="font-size: 12px; color: #888;">Last updated: ${lastUpdate}</div>
      ${
        price.confidence
          ? `<div style="font-size: 12px; color: #888; margin-top: 4px;">Confidence: ${(
              price.confidence * 100
            ).toFixed(1)}%</div>`
          : ""
      }
    </div>
  `;

  context.logHtml(html);
}

/**
 * Handle tokens command
 */
async function handleTokens(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const tokensArg = args[2];

  if (!tokensArg) {
    context.log("Usage: defillama tokens <token,token,...>");
    context.log("Example: defillama tokens eth,btc,sol");
    return;
  }

  const tokens = tokensArg
    .toLowerCase()
    .split(",")
    .map((t) => t.trim());

  context.log(`Fetching prices for ${tokens.length} tokens...`);
  context.log("");

  const result = await defillama.getMultipleTokenPrices(tokens);

  if (!result.success || Object.keys(result.prices).length === 0) {
    context.log(result.error || "No prices found");
    return;
  }

  context.log("Token Prices:");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  tokens.forEach((token) => {
    const price = result.prices[token];
    if (price) {
      context.logHtml(
        `<div style="margin: 8px 0;"><span style="color: #007AFF; font-weight: bold; text-transform: uppercase; width: 80px; display: inline-block;">${escapeHtml(
          token
        )}</span> <span style="color: #00ff88; font-weight: bold;">$${price.price.toFixed(
          6
        )}</span></div>`
      );
    } else {
      context.log(`${token.toUpperCase()}: Not found`);
    }
  });

  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

/**
 * Handle trending command
 */
async function handleTrending(context: CommandContext): Promise<void> {
  context.log("Fetching trending protocols...");
  context.log("");

  const result = await defillama.getTrendingProtocols();

  if (!result.success || result.protocols.length === 0) {
    context.log(result.error || "No trending protocols found");
    return;
  }

  context.log("🔥 Trending Protocols (24h Gainers)");
  context.log("");

  result.protocols.forEach((p, index) => {
    const html = `
      <div style="background: linear-gradient(135deg, rgba(52, 199, 89, 0.15), rgba(255, 255, 255, 0.05)); border: 1px solid rgba(52, 199, 89, 0.4); border-radius: 16px; padding: 16px; margin: 8px 0; backdrop-filter: blur(20px); box-shadow: 0 4px 16px rgba(52, 199, 89, 0.15);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
            <div style="background: #34C759; color: #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${
              index + 1
            }</div>
            ${
              p.logo
                ? `<img src="${p.logo}" alt="${escapeHtml(
                    p.name
                  )}" style="width: 36px; height: 36px; border-radius: 8px; border: 2px solid #34C759;" />`
                : `<div style="width: 36px; height: 36px; border-radius: 8px; background: #34C759; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">${escapeHtml(
                    p.name[0]
                  )}</div>`
            }
            <div style="flex: 1;">
              <div style="font-size: 18px; font-weight: bold; color: #1B5E20;">${escapeHtml(
                p.name
              )}</div>
              ${
                p.category
                  ? `<div style="color: #666; font-size: 14px;">${escapeHtml(
                      p.category
                    )}</div>`
                  : ""
              }
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 20px; color: #2E7D32; font-weight: bold;">${formatLlamaCurrency(
              p.tvl
            )}</div>
            <div style="font-size: 16px; color: #34C759; font-weight: bold;">+${p.change_1d?.toFixed(
              2
            )}%</div>
          </div>
        </div>
      </div>
    `;

    context.logHtml(html);
  });
}

/**
 * Handle debug command
 */
async function handleDebug(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const token = args[2]?.toLowerCase();

  if (!token) {
    context.log("Usage: defillama debug <token>");
    context.log("Example: defillama debug eth");
    return;
  }

  context.log(`🔍 Debugging token lookup for: ${token}`);
  context.log("");

  // Show token mapping
  const normalizedSymbol = token.toLowerCase();
  const TOKEN_MAPPINGS: Record<string, string> = {
    eth: "coingecko:ethereum",
    ethereum: "coingecko:ethereum",
    btc: "coingecko:bitcoin",
    bitcoin: "coingecko:bitcoin",
    sol: "coingecko:solana",
    solana: "coingecko:solana",
    usdc: "coingecko:usd-coin",
    usdt: "coingecko:tether",
    bnb: "coingecko:binancecoin",
    ada: "coingecko:cardano",
    dot: "coingecko:polkadot",
    avax: "coingecko:avalanche-2",
    matic: "coingecko:matic-network",
    link: "coingecko:chainlink",
    uni: "coingecko:uniswap",
    aave: "coingecko:aave",
    crv: "coingecko:curve-dao-token",
  };

  const mappedToken =
    TOKEN_MAPPINGS[normalizedSymbol] || `coingecko:${normalizedSymbol}`;

  context.log(`Token Mapping:`);
  context.log(`  Input: ${token}`);
  context.log(`  Mapped: ${mappedToken}`);
  context.log("");

  const result = await defillama.getTokenPrice(token);

  context.log(`API Request:`);
  context.log(`  URL: https://coins.llama.fi/prices/current/${mappedToken}`);
  context.log("");

  if (result.success && result.price) {
    context.log(`✅ Success!`);
    context.log(`  Symbol: ${result.price.symbol}`);
    context.log(`  Price: $${result.price.price}`);
    context.log(
      `  Timestamp: ${new Date(result.price.timestamp).toLocaleString()}`
    );
    context.log(`  Confidence: ${result.price.confidence}`);
  } else {
    context.log(`❌ Failed`);
    context.log(`  Error: ${result.error}`);
    context.log("");
    context.log("Try these common tokens:");
    context.log("  eth, btc, sol, usdc, usdt, bnb, ada, dot");
  }
}

export const defillamaCommands = [defillamaCommand];
