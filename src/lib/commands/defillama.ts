/**
 * DeFi Llama Commands
 *
 * Provides TVL data, protocol rankings, chain analytics, and token prices.
 * Matches styling from defillama-api-plugin.js for consistency.
 */

import type { Command, CommandContext } from "@/types/commands";
import { defillama } from "@/lib/api";
import { formatNumber, formatCurrency, escapeHtml } from "@/lib/utils";
import { createCommandLine, createUsageError } from "./command-output-helpers";

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
      const helpLines: string[] = [];
      
      helpLines.push("═══ DeFi Llama Analytics ═══");
      helpLines.push("");
      helpLines.push("═ TVL Commands ═");
      helpLines.push("");
      helpLines.push("tvl");
      helpLines.push("");
      helpLines.push("Total DeFi TVL across all chains or specific protocol TVL");
      helpLines.push("");
      helpLines.push("→ Usage: defillama tvl | defillama tvl <protocol>");
      helpLines.push("");
      helpLines.push("protocols");
      helpLines.push("");
      helpLines.push("Top protocols by TVL");
      helpLines.push("");
      helpLines.push("→ Usage: defillama protocols [limit]");
      helpLines.push("");
      helpLines.push("chains");
      helpLines.push("");
      helpLines.push("TVL by blockchain");
      helpLines.push("");
      helpLines.push("→ Usage: defillama chains [limit]");
      helpLines.push("");
      helpLines.push("trending");
      helpLines.push("");
      helpLines.push("Trending protocols by 24h change");
      helpLines.push("");
      helpLines.push("→ Usage: defillama trending");
      helpLines.push("");
      helpLines.push("═ Price Commands ═");
      helpLines.push("");
      helpLines.push("price");
      helpLines.push("");
      helpLines.push("Current token price");
      helpLines.push("");
      helpLines.push("→ Usage: defillama price <token>");
      helpLines.push("");
      helpLines.push("tokens");
      helpLines.push("");
      helpLines.push("Multiple token prices");
      helpLines.push("");
      helpLines.push("→ Usage: defillama tokens <token,token>");
      helpLines.push("");
      helpLines.push("debug");
      helpLines.push("");
      helpLines.push("Debug token price lookup");
      helpLines.push("");
      helpLines.push("→ Usage: defillama debug <token>");
      helpLines.push("");

      // Generate HTML output with uniform styling
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
            ═══ DeFi Llama Analytics ═══
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
        } else {
          const isCommand = line.length > 0 && 
            line.trim().length < 30 &&
            !line.includes(" ") &&
            line === line.toLowerCase() &&
            line.match(/^[a-z0-9-]+$/);

          if (isCommand) {
            const escapedCommand = line.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
            helpHtml += `
              <div 
                class="omega-help-command" 
                data-command="defillama ${escapedCommand}"
                style="
                  color: var(--palette-secondary, #00ff88);
                  font-weight: bold;
                  font-size: 1.05em;
                  margin-left: 0;
                  margin-top: 8px;
                  font-family: 'Courier New', monospace;
                  text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);
                  cursor: pointer;
                  display: inline-block;
                  padding: 2px 4px;
                  border-radius: 3px;
                  transition: all 0.2s ease;
                  user-select: none;
                "
                onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)'; this.style.textShadow = '0 0 8px var(--palette-secondary-glow, rgba(0, 255, 136, 0.5))';"
                onmouseout="this.style.background = 'transparent'; this.style.textShadow = '0 0 6px rgba(0, 255, 136, 0.3)';"
                title="Click to add 'defillama ${escapedCommand}' to terminal input"
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
        context.log(`Unknown subcommand: ${subcommand}`, "error");
        const helpHtml = createCommandLine("defillama", "See available commands");
        context.logHtml(helpHtml);
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
    context.log(`Fetching TVL for ${protocol}...`, "info");
    context.log("", "output");

    const result = await defillama.getProtocolTVL(protocol);

    if (!result.success || !result.protocol) {
      context.log(result.error || "Protocol not found", "error");
      context.log("", "output");
      context.log("Try searching with the protocol slug:", "info");
      context.log('  e.g., "uniswap", "aave", "curve"', "output");
      return;
    }

    const p = result.protocol;

    const html = `
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 8px; padding: 15px; margin: 10px 0;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          ${
            p.logo
              ? `<img src="${p.logo}" alt="${escapeHtml(
                  p.name
                )}" style="width: 48px; height: 48px; border-radius: 8px; border: 2px solid var(--palette-primary, #00d4ff);" />`
              : `<div style="width: 48px; height: 48px; border-radius: 8px; background: var(--palette-primary, #00d4ff); color: var(--palette-text, #e0e0e0); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px;">${escapeHtml(
                  p.name?.[0] || "?"
                )}</div>`
          }
          <div>
            <div style="font-size: 24px; font-weight: bold; color: var(--palette-primary, #00d4ff);">${escapeHtml(
              p.name
            )}</div>
            ${
              p.category
                ? `<div style="color: var(--palette-text, #e0e0e0); opacity: 0.7; font-size: 14px;">${escapeHtml(
                    p.category
                  )}</div>`
                : ""
            }
          </div>
        </div>
        <div style="font-size: 32px; color: var(--palette-secondary, #00ff88); font-weight: bold; margin-bottom: 8px;">${formatLlamaCurrency(
          p.tvl
        )}</div>
        ${
          p.change_1d
            ? `<div style="font-size: 16px; color: ${
                p.change_1d >= 0 ? "var(--palette-success, #00ff88)" : "var(--palette-error, #ff3333)"
              }; font-weight: bold; margin-bottom: 12px;">${
                p.change_1d >= 0 ? "+" : ""
              }${p.change_1d.toFixed(2)}% (24h)</div>`
            : ""
        }
        ${
          p.chains && p.chains.length > 0
            ? `<div style="color: var(--palette-text, #e0e0e0); opacity: 0.7; font-size: 12px; margin-top: 8px;">Chains: ${p.chains.join(
                ", "
              )}</div>`
            : ""
        }
        ${
          p.url
            ? `<div style="margin-top: 12px;"><a href="${p.url}" target="_blank" style="background: var(--palette-primary, #00d4ff); color: var(--palette-text, #e0e0e0); text-decoration: none; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: bold; display: inline-block; transition: opacity 0.2s;">Visit Protocol</a></div>`
            : ""
        }
      </div>
    `;

    context.logHtml(html);
  } else {
    // Total DeFi TVL
    context.log("Fetching total DeFi TVL...", "info");
    context.log("", "output");

    const result = await defillama.getTotalTVL();

    if (!result.success) {
      context.log(result.error || "Failed to fetch TVL", "error");
      return;
    }

    const html = `
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 8px; padding: 24px; margin: 10px 0; text-align: center;">
        <div style="font-size: 20px; color: var(--palette-primary, #00d4ff); font-weight: bold; margin-bottom: 16px;">🦙 Total DeFi TVL</div>
        <div style="font-size: 48px; color: var(--palette-secondary, #00ff88); font-weight: bold; margin-bottom: 8px;">${formatLlamaCurrency(
          result.tvl
        )}</div>
        <div style="font-size: 16px; color: var(--palette-text, #e0e0e0); opacity: 0.7;">Across ${
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
  const limit = parseInt(args[2] || "10") || 10;

  context.log(`Fetching top ${limit} protocols...`, "info");
  context.log("", "output");

  const result = await defillama.getTopProtocols(limit);

  if (!result.success || result.protocols.length === 0) {
    context.log(result.error || "No protocols found", "error");
    return;
  }

  result.protocols.forEach((p, index) => {
    const html = `
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 8px; padding: 15px; margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: var(--palette-primary, #00d4ff); color: var(--palette-text, #e0e0e0); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${
              index + 1
            }</div>
            ${
              p.logo
                ? `<img src="${p.logo}" alt="${escapeHtml(
                    p.name
                  )}" style="width: 36px; height: 36px; border-radius: 8px; border: 2px solid var(--palette-primary, #00d4ff);" />`
                : `<div style="width: 36px; height: 36px; border-radius: 8px; background: var(--palette-primary, #00d4ff); color: var(--palette-text, #e0e0e0); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">${escapeHtml(
                    p.name?.[0] || "?"
                  )}</div>`
            }
            <span style="font-size: 18px; font-weight: bold; color: var(--palette-primary, #00d4ff);">${escapeHtml(
              p.name
            )}</span>
            ${
              p.category
                ? `<span style="font-size: 12px; color: var(--palette-text, #e0e0e0); opacity: 0.7;">${escapeHtml(
                    p.category
                  )}</span>`
                : ""
            }
          </div>
        </div>
        <div style="font-size: 16px; color: var(--palette-secondary, #00ff88); font-weight: bold; margin-bottom: 8px;">${formatLlamaCurrency(
          p.tvl
        )}</div>
        ${
          p.change_1d !== undefined
            ? `<div style="font-size: 13px; color: ${
                p.change_1d >= 0 ? "var(--palette-success, #00ff88)" : "var(--palette-error, #ff3333)"
              }; font-weight: bold;">${
                p.change_1d >= 0 ? "+" : ""
              }${p.change_1d.toFixed(2)}%</div>`
            : ""
        }
        ${
          p.chains && p.chains.length > 0
            ? `<div style="color: var(--palette-text, #e0e0e0); opacity: 0.7; font-size: 12px; margin-top: 8px;">Chains: ${p.chains
                .slice(0, 5)
                .join(", ")}${p.chains.length > 5 ? "..." : ""}</div>`
            : ""
        }
        ${
          p.url
            ? `<div style="margin-top: 8px;"><a href="${p.url}" target="_blank" style="color: var(--palette-primary, #00d4ff); text-decoration: underline; font-size: 13px;">View on DeFi Llama</a></div>`
            : ""
        }
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
  const limit = parseInt(args[2] || "15") || 15;

  context.log(`Fetching top ${limit} chains...`, "info");
  context.log("", "output");

  const result = await defillama.getChainTVLs(limit);

  if (!result.success || result.chains.length === 0) {
    context.log(result.error || "No chains found", "error");
    return;
  }

  result.chains.forEach((c, index) => {
    const html = `
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 8px; padding: 15px; margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: var(--palette-primary, #00d4ff); color: var(--palette-text, #e0e0e0); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${
              index + 1
            }</div>
            <span style="font-size: 18px; font-weight: bold; color: var(--palette-primary, #00d4ff);">${escapeHtml(
              c.name
            )}</span>
            ${
              c.tokenSymbol
                ? `<span style="font-size: 12px; color: var(--palette-text, #e0e0e0); opacity: 0.7;">${escapeHtml(
                    c.tokenSymbol
                  )}</span>`
                : ""
            }
          </div>
        </div>
        <div style="font-size: 16px; color: var(--palette-secondary, #00ff88); font-weight: bold; margin-bottom: 8px;">${formatLlamaCurrency(
          c.tvl
        )}</div>
        ${
          c.change_1d !== undefined
            ? `<div style="font-size: 13px; color: ${
                c.change_1d >= 0 ? "var(--palette-success, #00ff88)" : "var(--palette-error, #ff3333)"
              }; font-weight: bold;">${c.change_1d >= 0 ? "+" : ""}${c.change_1d.toFixed(
                2
              )}%</div>`
            : ""
        }
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
    const usageHtml = createUsageError("defillama price <token>", [
      "defillama price eth",
      "defillama price btc",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`Fetching price for ${token}...`, "info");
  context.log("", "output");

  const result = await defillama.getTokenPrice(token);

  if (!result.success || !result.price) {
    context.log(result.error || "Token not found", "error");
    context.log("", "output");
    context.log("Try common tokens: eth, btc, sol, usdc, usdt", "info");
    const helpHtml = createCommandLine("defillama debug <token>", "Debug token lookup");
    context.logHtml(helpHtml);
    return;
  }

  const price = result.price;
  const lastUpdate = new Date(price.timestamp).toLocaleString();

  const html = `
    <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 8px; padding: 20px; margin: 10px 0; text-align: center;">
      <div style="font-size: 24px; font-weight: bold; color: var(--palette-primary, #00d4ff); margin-bottom: 8px; text-transform: uppercase;">${escapeHtml(
        price.symbol
      )}</div>
      <div style="font-size: 36px; color: var(--palette-secondary, #00ff88); font-weight: bold; margin-bottom: 8px;">$${price.price.toFixed(
        6
      )}</div>
      <div style="font-size: 12px; color: var(--palette-text, #e0e0e0); opacity: 0.7;">Last updated: ${lastUpdate}</div>
      ${
        price.confidence
          ? `<div style="font-size: 12px; color: var(--palette-text, #e0e0e0); opacity: 0.7; margin-top: 4px;">Confidence: ${(
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
    const usageHtml = createUsageError("defillama tokens <token,token,...>", [
      "defillama tokens eth,btc,sol",
      "defillama tokens usdc,usdt",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  const tokens = tokensArg
    .toLowerCase()
    .split(",")
    .map((t) => t.trim());

  context.log(`Fetching prices for ${tokens.length} tokens...`, "info");
  context.log("", "output");

  const result = await defillama.getMultipleTokenPrices(tokens);

  if (!result.success || Object.keys(result.prices).length === 0) {
    context.log(result.error || "No prices found", "error");
    return;
  }

  context.log("Token Prices:", "info");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");

  tokens.forEach((token) => {
    const price = result.prices[token];
    if (price) {
      context.logHtml(
        `<div style="margin: 8px 0; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 4px;"><span style="color: var(--palette-primary, #00d4ff); font-weight: bold; text-transform: uppercase; width: 80px; display: inline-block;">${escapeHtml(
          token
        )}</span> <span style="color: var(--palette-secondary, #00ff88); font-weight: bold;">$${price.price.toFixed(
          6
        )}</span></div>`
      );
    } else {
      context.log(`${token.toUpperCase()}: Not found`, "error");
    }
  });

  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
}

/**
 * Handle trending command
 */
async function handleTrending(context: CommandContext): Promise<void> {
  context.log("Fetching trending protocols...", "info");
  context.log("", "output");

  const result = await defillama.getTrendingProtocols();

  if (!result.success || result.protocols.length === 0) {
    context.log(result.error || "No trending protocols found", "error");
    return;
  }

  context.log("🔥 Trending Protocols (24h Gainers)", "info");
  context.log("", "output");

  result.protocols.forEach((p, index) => {
    const html = `
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 8px; padding: 15px; margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: var(--palette-primary, #00d4ff); color: var(--palette-text, #e0e0e0); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${
              index + 1
            }</div>
            ${
              p.logo
                ? `<img src="${p.logo}" alt="${escapeHtml(
                    p.name
                  )}" style="width: 36px; height: 36px; border-radius: 8px; border: 2px solid var(--palette-primary, #00d4ff);" />`
                : `<div style="width: 36px; height: 36px; border-radius: 8px; background: var(--palette-primary, #00d4ff); color: var(--palette-text, #e0e0e0); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">${escapeHtml(
                    p.name?.[0] || "?"
                  )}</div>`
            }
            <span style="font-size: 18px; font-weight: bold; color: var(--palette-primary, #00d4ff);">${escapeHtml(
              p.name
            )}</span>
            ${
              p.category
                ? `<span style="font-size: 12px; color: var(--palette-text, #e0e0e0); opacity: 0.7;">${escapeHtml(
                    p.category
                  )}</span>`
                : ""
            }
          </div>
        </div>
        <div style="font-size: 16px; color: var(--palette-secondary, #00ff88); font-weight: bold; margin-bottom: 8px;">${formatLlamaCurrency(
          p.tvl
        )}</div>
        <div style="font-size: 13px; color: var(--palette-success, #00ff88); font-weight: bold;">+${p.change_1d?.toFixed(
          2
        )}%</div>
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
    const usageHtml = createUsageError("defillama debug <token>", [
      "defillama debug eth",
      "defillama debug btc",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  context.log(`🔍 Debugging token lookup for: ${token}`, "info");
  context.log("", "output");

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

  context.log(`Token Mapping:`, "info");
  context.log(`  Input: ${token}`, "output");
  context.log(`  Mapped: ${mappedToken}`, "output");
  context.log("", "output");

  const result = await defillama.getTokenPrice(token);

  context.log(`API Request:`, "info");
  context.log(`  URL: https://coins.llama.fi/prices/current/${mappedToken}`, "output");
  context.log("", "output");

  if (result.success && result.price) {
    context.log(`✅ Success!`, "success");
    context.log(`  Symbol: ${result.price.symbol}`, "output");
    context.log(`  Price: $${result.price.price}`, "output");
    context.log(
      `  Timestamp: ${new Date(result.price.timestamp).toLocaleString()}`,
      "output"
    );
    context.log(`  Confidence: ${result.price.confidence}`, "output");
  } else {
    context.log(`❌ Failed`, "error");
    context.log(`  Error: ${result.error || "Unknown error"}`, "error");
    context.log("", "output");
    context.log("Try these common tokens:", "info");
    context.log("  eth, btc, sol, usdc, usdt, bnb, ada, dot", "output");
  }
}

export const defillamaCommands = [defillamaCommand];
