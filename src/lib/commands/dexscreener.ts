/**
 * DexScreener and GeckoTerminal Commands
 *
 * Provides token search, trending tokens, and DEX analytics.
 * Advanced features (portfolio, watchlist, alerts, gem discovery) deferred to Phase 15.
 */

import type { Command, CommandContext } from "@/types/commands";
import { dexscreener, geckoterminal } from "@/lib/api";
import { formatNumber, escapeHtml } from "@/lib/utils";

/**
 * DexScreener command
 * Search and analyze token pairs across multiple DEXes
 */
export const dexscreenerCommand: Command = {
  name: "dexscreener",
  description: "DexScreener token search and analytics",
  usage: "dexscreener <search|trending|analytics|portfolio> [query]",
  aliases: ["ds", "dex"],
  category: "api",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand) {
      const helpLines: string[] = [];
      
      helpLines.push("═══ DexScreener Token Analytics ═══");
      helpLines.push("");
      helpLines.push("search");
      helpLines.push("");
      helpLines.push("Search for tokens across multiple DEXes");
      helpLines.push("");
      helpLines.push("→ Usage: ds search <query>");
      helpLines.push("");
      helpLines.push("trending");
      helpLines.push("");
      helpLines.push("Show trending tokens");
      helpLines.push("");
      helpLines.push("→ Usage: ds trending");
      helpLines.push("");
      helpLines.push("analytics");
      helpLines.push("");
      helpLines.push("Detailed token analytics");
      helpLines.push("");
      helpLines.push("→ Usage: ds analytics <token>");
      helpLines.push("");
      helpLines.push("portfolio");
      helpLines.push("");
      helpLines.push("Portfolio tracking interface");
      helpLines.push("");
      helpLines.push("→ Usage: ds portfolio");
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
            ═══ DexScreener Token Analytics ═══
          </div>
      `;

      helpLines.forEach((line) => {
        if (line.trim() === "") {
          helpHtml += `<div style="margin: 4px 0;"></div>`;
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
                data-command="ds ${escapedCommand}"
                style="
                  color: var(--palette-secondary, #00ff88);
                  font-weight: bold;
                  margin-left: 0;
                  margin-top: 8px;
                  font-family: 'Courier New', monospace;
                "
                title="Click to add 'ds ${escapedCommand}' to terminal input"
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
      case "search":
        await searchTokens(context, args);
        break;
      case "trending":
        await getTrending(context);
        break;
      case "analytics":
        await showAnalytics(context, args);
        break;
      case "portfolio":
        await showPortfolio(context);
        break;
      default:
        context.log(`Unknown subcommand: ${subcommand}`, "error");
        context.log('Use "ds" to see available commands', "info");
    }
  },
};

// Note: "ds" is already registered as an alias of "dexscreener" command above
// No need for separate dsCommand

/**
 * Search for tokens on DexScreener
 */
async function searchTokens(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const query = args.slice(2).join(" ");

  if (!query) {
    context.log("Usage: ds search <query>", "error");
    context.log("Example: ds search WETH", "info");
    return;
  }

  context.log(`Searching DexScreener for: ${query}`, "info");
  context.log("", "output");

  const result = await dexscreener.searchTokens(query);

  if (!result.success || result.pairs.length === 0) {
    if (result.error) {
      context.log(`❌ Error: ${result.error}`, "error");
      context.log("💡 Trying alternative search methods...", "info");
    } else {
      context.log("❌ No tokens found", "error");
      context.log("💡 Try searching with full token name or contract address", "info");
      context.log("💡 Examples: ds search bitcoin, ds search 0x...", "info");
    }
    return;
  }

  // Display up to 5 results with styled HTML
  const pairs = result.pairs.slice(0, 5);

  pairs.forEach((pair, index) => {
    const priceChange24h = pair.priceChange?.h24 || 0;
    const changeColorVar = priceChange24h >= 0 
      ? "var(--palette-success, #00ff88)" 
      : "var(--palette-error, #ff3333)";
    const changePrefix = priceChange24h >= 0 ? "+" : "";

    const html = `
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 8px; padding: 15px; margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: var(--palette-primary, #00d4ff); color: var(--palette-text, #e0e0e0); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${
              index + 1
            }</div>
            <span style="font-size: 18px; font-weight: bold; color: var(--palette-primary, #00d4ff);">${escapeHtml(
              pair.baseToken.symbol
            )}</span>
            <span style="font-size: 12px; color: var(--palette-text, #e0e0e0); opacity: 0.7;">${escapeHtml(
              pair.chainId
            )}</span>
          </div>
        </div>
        <div style="font-size: 14px; color: var(--palette-text, #e0e0e0); margin-bottom: 8px;">${escapeHtml(
          pair.baseToken.name
        )}</div>
        <div style="font-size: 16px; color: var(--palette-secondary, #00ff88); font-weight: bold; margin-bottom: 8px;">$${
          pair.priceUsd
        }</div>
        <div style="font-size: 12px; color: var(--palette-text, #e0e0e0); opacity: 0.7; margin-bottom: 8px; word-break: break-all;">
          ${escapeHtml(pair.baseToken.address)}
          <button onclick="navigator.clipboard.writeText('${escapeHtml(
            pair.baseToken.address
          )}')" style="background: rgba(0, 212, 255, 0.2); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.5)); color: var(--palette-primary, #00d4ff); padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-left: 8px;">Copy</button>
        </div>
        ${
          pair.volume?.h24
            ? `<div style="font-size: 13px; color: var(--palette-text, #e0e0e0); margin-bottom: 4px;">24h Volume: $${formatNumber(
                pair.volume.h24
              )}</div>`
            : ""
        }
        ${
          priceChange24h !== 0
            ? `<div style="font-size: 13px; color: ${changeColorVar}; font-weight: bold;">24h Change: ${changePrefix}${priceChange24h.toFixed(
                2
              )}%</div>`
            : ""
        }
        ${
          pair.url
            ? `<div style="margin-top: 8px;"><a href="${pair.url}" target="_blank" style="color: var(--palette-primary, #00d4ff); text-decoration: underline; font-size: 13px;">View on DexScreener</a></div>`
            : ""
        }
      </div>
    `;

    context.logHtml(html);
  });

  if (result.pairs.length > 5) {
    context.log("", "output");
    context.log(`Showing 5 of ${result.pairs.length} results`, "info");
  }
}

/**
 * Get trending tokens
 */
async function getTrending(context: CommandContext): Promise<void> {
  context.log("Fetching trending tokens...", "info");
  context.log("", "output");

  const result = await dexscreener.getTrendingTokens();

  if (!result.success || result.pairs.length === 0) {
    if (result.error) {
      context.log(`❌ Error: ${result.error}`, "error");
    } else {
      context.log("❌ No trending tokens found", "error");
      context.log("💡 Try: ds search WETH or ds search USDC", "info");
    }
    return;
  }

  const pairs = result.pairs.slice(0, 10);

  pairs.forEach((pair, index) => {
    const priceChange24h = pair.priceChange?.h24 || 0;
    const changeColorVar = priceChange24h >= 0 
      ? "var(--palette-success, #00ff88)" 
      : "var(--palette-error, #ff3333)";
    const changePrefix = priceChange24h >= 0 ? "+" : "";

    const html = `
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3)); border-radius: 8px; padding: 15px; margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: var(--palette-primary, #00d4ff); color: var(--palette-text, #e0e0e0); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${
              index + 1
            }</div>
            <span style="font-size: 18px; font-weight: bold; color: var(--palette-primary, #00d4ff);">${escapeHtml(
              pair.baseToken.symbol
            )}</span>
            <span style="font-size: 12px; color: var(--palette-text, #e0e0e0); opacity: 0.7;">${escapeHtml(
              pair.chainId
            )}</span>
          </div>
        </div>
        <div style="font-size: 14px; color: var(--palette-text, #e0e0e0); margin-bottom: 8px;">${escapeHtml(
          pair.baseToken.name
        )}</div>
        <div style="font-size: 16px; color: var(--palette-secondary, #00ff88); font-weight: bold; margin-bottom: 8px;">$${
          pair.priceUsd
        }</div>
        <div style="font-size: 12px; color: var(--palette-text, #e0e0e0); opacity: 0.7; margin-bottom: 8px; word-break: break-all;">
          ${escapeHtml(pair.baseToken.address)}
          <button onclick="navigator.clipboard.writeText('${escapeHtml(
            pair.baseToken.address
          )}')" style="background: rgba(0, 212, 255, 0.2); border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.5)); color: var(--palette-primary, #00d4ff); padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-left: 8px;">Copy</button>
        </div>
        ${
          pair.volume?.h24
            ? `<div style="font-size: 13px; color: var(--palette-text, #e0e0e0); margin-bottom: 4px;">24h Volume: $${formatNumber(
                pair.volume.h24
              )}</div>`
            : ""
        }
        ${
          priceChange24h !== 0
            ? `<div style="font-size: 13px; color: ${changeColorVar}; font-weight: bold;">24h Change: ${changePrefix}${priceChange24h.toFixed(
                2
              )}%</div>`
            : ""
        }
        ${
          pair.url
            ? `<div style="margin-top: 8px;"><a href="${pair.url}" target="_blank" style="color: var(--palette-primary, #00d4ff); text-decoration: underline; font-size: 13px;">View on DexScreener</a></div>`
            : ""
        }
      </div>
    `;

    context.logHtml(html);
  });
}

/**
 * Show analytics for a token
 */
async function showAnalytics(
  context: CommandContext,
  args?: string[]
): Promise<void> {
  const token = args && args[2] ? args[2].toUpperCase() : null;

  if (!token) {
    context.log("❌ Usage: ds analytics <token>", "error");
    context.log("💡 Example: ds analytics ETH", "info");
    return;
  }

  context.log(`📊 DEXSCREENER ANALYTICS: ${token}`, "info");
  context.log(`🔗 Fetching analytics data for ${token}...`, "info");

  const result = await dexscreener.searchTokens(token);

  if (!result.success || result.pairs.length === 0) {
    context.log(`❌ No data found for ${token}`, "error");
    return;
  }

  const pair = result.pairs[0];
  if (!pair) {
    context.log("No pair data found", "error");
    return;
  }

  const html = `
    <div style="background: linear-gradient(135deg, rgba(0, 188, 242, 0.15), rgba(255, 255, 255, 0.05)); border: 2px solid rgba(0, 188, 242, 0.4); border-radius: 16px; padding: 24px; margin: 10px 0; backdrop-filter: blur(20px); box-shadow: 0 4px 24px rgba(0, 188, 242, 0.2);">
      <div style="font-size: 24px; font-weight: bold; color: #00bcf2; margin-bottom: 16px;">
        📊 ${escapeHtml(pair.baseToken.symbol)} Analytics
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;">
        <div style="background: rgba(0, 188, 242, 0.1); padding: 12px; border-radius: 8px;">
          <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Current Price</div>
          <div style="color: #00ff88; font-size: 20px; font-weight: bold;">$${
            pair.priceUsd
          }</div>
        </div>
        <div style="background: rgba(0, 188, 242, 0.1); padding: 12px; border-radius: 8px;">
          <div style="color: #888; font-size: 12px; margin-bottom: 4px;">24h Change</div>
          <div style="color: ${
            (pair.priceChange?.h24 || 0) >= 0 ? "#34C759" : "#FF3B30"
          }; font-size: 20px; font-weight: bold;">
            ${(pair.priceChange?.h24 || 0) >= 0 ? "+" : ""}${(
    pair.priceChange?.h24 || 0
  ).toFixed(2)}%
          </div>
        </div>
        <div style="background: rgba(0, 188, 242, 0.1); padding: 12px; border-radius: 8px;">
          <div style="color: #888; font-size: 12px; margin-bottom: 4px;">24h Volume</div>
          <div style="color: #00bcf2; font-size: 20px; font-weight: bold;">$${formatNumber(
            pair.volume?.h24 || 0
          )}</div>
        </div>
        <div style="background: rgba(0, 188, 242, 0.1); padding: 12px; border-radius: 8px;">
          <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Liquidity</div>
          <div style="color: #00bcf2; font-size: 20px; font-weight: bold;">$${formatNumber(
            pair.liquidity?.usd || 0
          )}</div>
        </div>
      </div>
      
      <div style="margin-top: 16px;">
        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">Token Address</div>
        <div style="font-family: monospace; color: #00bcf2; word-break: break-all;">${escapeHtml(
          pair.baseToken.address
        )}</div>
      </div>
      
      ${
        pair.url
          ? `<div style="margin-top: 16px;"><a href="${pair.url}" target="_blank" style="background: #00bcf2; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block;">View Full Analytics</a></div>`
          : ""
      }
    </div>
  `;

  context.logHtml(html);
  context.log("💡 This shows comprehensive analytics for the token", "info");
}

/**
 * Show portfolio tracking interface
 */
async function showPortfolio(context: CommandContext): Promise<void> {
  context.log("💼 DEXSCREENER PORTFOLIO", "info");
  context.log("🔗 Fetching portfolio data...", "info");

  const html = `
    <div style="background: linear-gradient(135deg, rgba(0, 188, 242, 0.15), rgba(255, 255, 255, 0.05)); border: 2px solid rgba(0, 188, 242, 0.4); border-radius: 16px; padding: 24px; margin: 10px 0; backdrop-filter: blur(20px); box-shadow: 0 4px 24px rgba(0, 188, 242, 0.2);">
      <div style="font-size: 24px; font-weight: bold; color: #00bcf2; margin-bottom: 16px;">
        💼 Portfolio Tracking
      </div>
      
      <div style="background: rgba(0, 188, 242, 0.1); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <div style="color: #cccccc; margin-bottom: 12px;">
          Track your token holdings and portfolio performance across all chains.
        </div>
        <div style="color: #888; font-size: 14px;">
          <b>Features:</b>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Multi-chain portfolio tracking</li>
            <li>Real-time price updates</li>
            <li>P&L calculations</li>
            <li>Token watchlists</li>
            <li>Price alerts</li>
          </ul>
        </div>
      </div>
      
      <div style="background: rgba(0, 188, 242, 0.1); padding: 12px; border-radius: 8px;">
        <div style="color: #00bcf2; font-size: 14px; margin-bottom: 8px;"><b>💡 Quick Start:</b></div>
        <div style="color: #cccccc; font-size: 13px; font-family: monospace;">
          pgt track &lt;address&gt;<br/>
          pgt portfolio<br/>
          pgt wallets
        </div>
      </div>
    </div>
  `;

  context.logHtml(html);
  context.log(
    '💡 Use "pgt" commands for wallet-based portfolio tracking',
    "info"
  );
}

/**
 * GeckoTerminal command
 * Search DEX pairs on GeckoTerminal
 */
export const geckoterminalCommand: Command = {
  name: "geckoterminal",
  description: "GeckoTerminal DEX data",
  usage: "geckoterminal <search|networks|dexes> [params]",
  aliases: ["cg"],
  category: "api",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand) {
      context.log("GeckoTerminal - DEX Analytics", "info");
      context.log("", "output");
      context.log("Available Commands:", "info");
      context.log("  cg search <query>     - Search for token pairs", "output");
      context.log("  cg networks           - List supported networks", "output");
      context.log("  cg dexes <network>    - List DEXes on a network", "output");
      context.log("", "output");
      context.log("Examples:", "info");
      context.log("  cg search USDC", "output");
      context.log("  cg networks", "output");
      context.log("  cg dexes eth", "output");
      return;
    }

    switch (subcommand) {
      case "search":
        await cgSearch(context, args);
        break;
      case "networks":
        await cgNetworks(context);
        break;
      case "dexes":
        await cgDexes(context, args);
        break;
      default:
        context.log(`Unknown subcommand: ${subcommand}`, "error");
        context.log('Use "cg" to see available commands', "info");
    }
  },
};

/**
 * Search token pairs on GeckoTerminal
 */
async function cgSearch(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const query = args.slice(2).join(" ");

  if (!query) {
    context.log("Usage: cg search <query>", "error");
    context.log("Example: cg search USDC", "info");
    return;
  }

  context.log(`Searching GeckoTerminal for: ${query}`, "info");
  context.log("", "output");

  const result = await geckoterminal.searchPairs(query);

  if (!result.success || result.pairs.length === 0) {
    context.log(result.error || "No pairs found", "error");
    return;
  }

  result.pairs.forEach((pair) => {
    const priceChange24h = parseFloat(
      pair.attributes.price_change_percentage?.h24 || "0"
    );
    const changeColor = priceChange24h >= 0 ? "#00ff88" : "#ff3333";
    const changePrefix = priceChange24h >= 0 ? "+" : "";

    const cardHtml = `
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(0, 188, 242, 0.3); border-radius: 8px; padding: 15px; margin: 10px 0;">
        <div style="font-size: 18px; font-weight: bold; color: #00bcf2; margin-bottom: 10px;">${escapeHtml(
          pair.attributes.name
        )}</div>
        <div style="font-size: 16px; color: #00ff88; font-weight: bold; margin-bottom: 8px;">Price: $${
          pair.attributes.base_token_price_usd
        }</div>
        <div style="font-size: 13px; color: ${changeColor}; font-weight: bold; margin-bottom: 8px;">24h Change: ${changePrefix}${priceChange24h.toFixed(
      2
    )}%</div>
        <div style="font-size: 13px; color: #ffffff; margin-bottom: 4px;">24h Volume: $${formatNumber(
          parseFloat(pair.attributes.volume_usd?.h24 || "0")
        )}</div>
        <div style="font-size: 13px; color: #cccccc; margin-bottom: 4px;">Network: ${escapeHtml(
          pair.attributes.network_id
        )}</div>
        <div style="font-size: 13px; color: #cccccc;">DEX: ${escapeHtml(
          pair.attributes.dex_id
        )}</div>
      </div>
    `;

    context.logHtml(cardHtml);
  });
}

/**
 * List supported networks
 */
async function cgNetworks(context: CommandContext): Promise<void> {
  context.log("Fetching networks...", "info");
  context.log("", "output");

  const result = await geckoterminal.getNetworks();

  if (!result.success || result.networks.length === 0) {
    context.log(result.error || "No networks found", "error");
    return;
  }

  const html = `
    <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(0, 188, 242, 0.3); border-radius: 8px; padding: 15px; margin: 10px 0;">
      <div style="font-size: 18px; font-weight: bold; color: #00bcf2; margin-bottom: 10px;">Supported Networks</div>
      <div style="font-size: 14px; color: #ffffff;">
        ${result.networks
          .map(
            (network) =>
              `<div style="margin-bottom: 8px;">
                <span style="color: #00ff88; font-weight: bold;">${escapeHtml(
                  network.attributes?.name || network.id
                )}</span>
                <span style="color: #cccccc; font-size: 12px;"> (${escapeHtml(
                  network.id
                )})</span>
                ${
                  network.attributes?.coingecko_asset_platform_id
                    ? `<span style="color: #888; font-size: 11px;"> - ${escapeHtml(
                        network.attributes.coingecko_asset_platform_id
                      )}</span>`
                    : ""
                }
              </div>`
          )
          .join("")}
      </div>
    </div>
  `;

  context.logHtml(html);
}

/**
 * List DEXes on a network
 */
async function cgDexes(context: CommandContext, args: string[]): Promise<void> {
  const network = args[2];

  if (!network) {
    context.log("Usage: cg dexes <network>", "error");
    context.log("Example: cg dexes eth", "info");
    return;
  }

  context.log(`Fetching DEXes on ${network}...`, "info");
  context.log("", "output");

  const result = await geckoterminal.getDexes(network);

  if (!result.success || result.dexes.length === 0) {
    context.log(result.error || "No DEXes found", "error");
    return;
  }

  const html = `
    <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(0, 188, 242, 0.3); border-radius: 8px; padding: 15px; margin: 10px 0;">
      <div style="font-size: 18px; font-weight: bold; color: #00bcf2; margin-bottom: 10px;">DEXes on ${escapeHtml(
        network
      )}</div>
      <div style="font-size: 14px; color: #ffffff;">
        ${result.dexes
          .map(
            (dex) =>
              `<div style="margin-bottom: 8px;">
                <span style="color: #00ff88; font-weight: bold;">${escapeHtml(
                  dex.attributes?.name || dex.id
                )}</span>
                <span style="color: #cccccc; font-size: 12px;"> (${escapeHtml(
                  dex.id
                )})</span>
              </div>`
          )
          .join("")}
      </div>
    </div>
  `;

  context.logHtml(html);
}

// Note: "cg" is already registered as an alias of "geckoterminal" command above
// No need for separate cgCommand

export const apiCommands = [
  dexscreenerCommand,
  geckoterminalCommand,
];
