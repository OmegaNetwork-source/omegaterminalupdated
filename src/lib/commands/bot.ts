/**
 * Bot Commands
 * Commands for managing and using various trading, social, and automation bots
 */

import type { Command } from "@/types/commands";
import { createCommandLine, createUsageError } from "./command-output-helpers";
import {
  ALL_BOTS,
  TRADING_BOTS,
  SCALPING_BOTS,
  TELEGRAM_BOTS,
  DISCORD_BOTS,
  PREDICTION_MARKET_BOTS,
  getBot,
  getBotsByType,
  getBotsByPlatform,
  searchBots,
} from "@/lib/data/bots";
import { escapeHtml } from "@/lib/utils";

const COMING_SOON_MESSAGE = `
🚧 This feature is coming soon!

We're building a comprehensive bot marketplace that will allow you to:
- Deploy and manage trading bots
- Set up Telegram and Discord bots
- Configure prediction market bots
- Monitor bot performance
- Automate your trading and social strategies

Stay tuned for updates!
`;

function showComingSoon(context: any, featureName: string, preview?: string) {
  context.log(`🚧 ${featureName} - Coming Soon`, "info");
  context.log(COMING_SOON_MESSAGE, "output");
  if (preview) {
    context.log(`\n📋 Preview: ${preview}`, "info");
  }
}

async function handleList(context: any, args: string[]) {
  const category = args[2]?.toLowerCase();

  if (!category) {
    // Show all bots grouped by category
    context.log("🤖 Available Bots", "info");
    context.log("═══════════════════════════════════════", "output");
    
    context.log(`\n📈 Trading Bots (${TRADING_BOTS.length}):`, "info");
    TRADING_BOTS.forEach((bot, index) => {
      context.log(`  ${index + 1}. ${bot.name}`, "output");
      context.log(`     ${bot.description}`, "output");
    });

    context.log(`\n⚡ Scalping Bots (${SCALPING_BOTS.length}):`, "info");
    SCALPING_BOTS.forEach((bot, index) => {
      context.log(`  ${index + 1}. ${bot.name}`, "output");
      context.log(`     ${bot.description}`, "output");
    });

    context.log(`\n💬 Telegram Bots (${TELEGRAM_BOTS.length}):`, "info");
    TELEGRAM_BOTS.forEach((bot, index) => {
      context.log(`  ${index + 1}. ${bot.name}`, "output");
      context.log(`     ${bot.description}`, "output");
    });

    context.log(`\n🎮 Discord Bots (${DISCORD_BOTS.length}):`, "info");
    DISCORD_BOTS.forEach((bot, index) => {
      context.log(`  ${index + 1}. ${bot.name}`, "output");
      context.log(`     ${bot.description}`, "output");
    });

    context.log(`\n🎯 Prediction Market Bots (${PREDICTION_MARKET_BOTS.length}):`, "info");
    PREDICTION_MARKET_BOTS.forEach((bot, index) => {
      context.log(`  ${index + 1}. ${bot.name}`, "output");
      context.log(`     ${bot.description}`, "output");
    });

    context.log(`\n💡 Use "bot list <category>" to see bots in a specific category`, "info");
    context.log(`💡 Use "bot info <name>" to see detailed bot information`, "info");
    return;
  }

  // Show bots by category
  const categoryMap: Record<string, string> = {
    trading: "trading",
    scalping: "scalping",
    telegram: "telegram",
    discord: "discord",
    "prediction-market": "prediction-market",
    prediction: "prediction-market",
    arbitrage: "arbitrage",
    liquidity: "liquidity",
    portfolio: "portfolio-management",
  };

  const botType = categoryMap[category] || category;
  const bots = getBotsByType(botType);

  if (bots.length === 0) {
    context.log(`No bots found for category: ${category}`, "warning");
    context.log("Available categories: trading, scalping, telegram, discord, prediction-market", "info");
    return;
  }

  context.log(`🤖 ${category.charAt(0).toUpperCase() + category.slice(1)} Bots (${bots.length}):`, "info");
  context.log("═══════════════════════════════════════", "output");
  
  bots.forEach((bot, index) => {
    context.log(`\n${index + 1}. ${bot.name}`, "output");
    context.log(`   ${bot.description}`, "output");
    context.log(`   Platform: ${bot.platform}`, "output");
    context.log(`   Status: ${bot.status}`, "output");
  });
}

async function handleInfo(context: any, args: string[]) {
  const botName = args.slice(2).join(" ").toLowerCase();
  if (!botName) {
    const usageHtml = createUsageError("bot info", [
      "bot info DCA Trading Bot"
    ]);
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  showComingSoon(
    context,
    "Bot Information",
    "This will show detailed information about a bot including configuration, features, and setup instructions."
  );

  const bot = getBot(botName);
  if (bot) {
    context.log(`\n📋 ${bot.name} (Preview):`, "info");
    context.log(`  Description: ${bot.description}`, "output");
    context.log(`  Type: ${bot.type}`, "output");
    context.log(`  Platform: ${bot.platform}`, "output");
    context.log(`  Status: ${bot.status}`, "output");
    
    if (bot.features.length > 0) {
      context.log(`\n  Features:`, "info");
      bot.features.forEach((feature) => {
        context.log(`    - ${feature}`, "output");
      });
    }

    if (bot.pricing) {
      context.log(`\n  Pricing: ${bot.pricing.type}`, "info");
      if (bot.pricing.amount) {
        context.log(`    ${bot.pricing.amount} ${bot.pricing.currency || ""}`, "output");
      }
    }

    if (bot.supportLinks) {
      context.log(`\n  Support Links:`, "info");
      if (bot.supportLinks.discord) {
        context.log(`    Discord: ${bot.supportLinks.discord}`, "output");
      }
      if (bot.supportLinks.telegram) {
        context.log(`    Telegram: ${bot.supportLinks.telegram}`, "output");
      }
    }
  } else {
    context.log(`Bot '${botName}' not found`, "error");
    context.log("Use 'bot list' to see available bots", "info");
  }
}

async function handleDeploy(context: any, args: string[]) {
  const botName = args.slice(2).join(" ");
  if (!botName) {
    const usageHtml = createUsageError("bot deploy", [
      "bot deploy DCA Trading Bot"
    ]);
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  showComingSoon(
    context,
    "Bot Deployment",
    `This will deploy and configure the ${botName} bot with guided setup wizard.`
  );

  const bot = getBot(botName);
  if (bot) {
    context.log(`\n📋 ${bot.name} Deployment (Preview):`, "info");
    context.log(`  Type: ${bot.type}`, "output");
    context.log(`  Platform: ${bot.platform}`, "output");
    
    if (bot.parameters.length > 0) {
      context.log(`\n  Required Parameters:`, "info");
      bot.parameters.forEach((param) => {
        context.log(`    - ${param.name} (${param.type}): ${param.description}`, "output");
      });
    }

    if (bot.setupTime) {
      context.log(`\n  Estimated Setup Time: ${bot.setupTime}`, "output");
    }
  } else {
    context.log(`Bot '${botName}' not found`, "error");
  }
}

async function handleStart(context: any, args: string[]) {
  const botName = args.slice(2).join(" ");
  if (!botName) {
    const usageHtml = createUsageError("bot start", []);
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  showComingSoon(
    context,
    "Start Bot",
    "This will start a deployed bot instance."
  );

  context.log(`\n🚀 Would start: ${botName}`, "info");
}

async function handleStop(context: any, args: string[]) {
  const botName = args.slice(2).join(" ");
  if (!botName) {
    const usageHtml = createUsageError("bot stop", []);
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  showComingSoon(
    context,
    "Stop Bot",
    "This will stop a running bot instance."
  );

  context.log(`\n🛑 Would stop: ${botName}`, "info");
}

async function handleStatus(context: any, args: string[]) {
  const botName = args.slice(2).join(" ");
  
  showComingSoon(
    context,
    "Bot Status",
    "This will show the status and performance metrics of bot instances."
  );

  if (botName) {
    context.log(`\n📊 Status for: ${botName}`, "info");
    context.log("  Status: Not deployed", "output");
    context.log("  Use 'bot deploy' to deploy this bot", "info");
  } else {
    context.log(`\n📊 Bot Instances Status:`, "info");
    context.log("  No active bot instances", "output");
    context.log("  Use 'bot deploy <name>' to deploy a bot", "info");
  }
}

async function handleSearch(context: any, args: string[]) {
  const query = args.slice(2).join(" ");
  if (!query) {
    const usageHtml = createUsageError("bot search", [
      "bot search trading"
    ]);
    context.logHtml(usageHtml);
    context.log("", "output");
    return;
  }

  showComingSoon(
    context,
    "Bot Search",
    `This will search for bots matching "${query}".`
  );

  const bots = searchBots(query);
  if (bots.length > 0) {
    context.log(`\n🔍 Found ${bots.length} bot(s):`, "info");
    bots.forEach((bot, index) => {
      context.log(`  ${index + 1}. ${bot.name} (${bot.type})`, "output");
    });
  } else {
    context.log(`No bots found matching "${query}"`, "warning");
  }
}

async function handleCategories(context: any) {
  showComingSoon(
    context,
    "Bot Categories",
    "This will list all available bot categories and their descriptions."
  );

  context.log("\n📂 Bot Categories (Preview):", "info");
  context.log("  • Trading Bots - Automated trading strategies", "output");
  context.log("  • Scalping Bots - High-frequency trading bots", "output");
  context.log("  • Telegram Bots - Telegram integration bots", "output");
  context.log("  • Discord Bots - Discord server bots", "output");
  context.log("  • Prediction Market Bots - Prediction market trading", "output");
  context.log("  • Arbitrage Bots - Cross-exchange arbitrage", "output");
  context.log("  • Liquidity Bots - Automated LP management", "output");
  context.log("  • Portfolio Bots - Portfolio management bots", "output");
}

async function handleHelp(context: any) {
  const helpHtml = `
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
      ">🤖 BOT COMMANDS</div>
      
      <div style="
        font-size: 14px;
        font-weight: 600;
        color: var(--palette-secondary, #00ff88);
        margin: 16px 0 12px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">📋 Available Commands</div>
      
      ${createCommandLine("bot list [category]", "List all bots or by category")}
      ${createCommandLine("bot info <name>", "Show detailed bot information")}
      ${createCommandLine("bot deploy <name>", "Deploy and configure a bot")}
      ${createCommandLine("bot start <name>", "Start a deployed bot")}
      ${createCommandLine("bot stop <name>", "Stop a running bot")}
      ${createCommandLine("bot status [name]", "Show bot status and metrics")}
      ${createCommandLine("bot search <keyword>", "Search bots by keyword")}
      ${createCommandLine("bot categories", "List all bot categories")}
      ${createCommandLine("bot help", "Show this help message")}
      
      <div style="
        font-size: 14px;
        font-weight: 600;
        color: var(--palette-secondary, #00ff88);
        margin: 20px 0 12px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">🎯 Examples</div>
      
      ${createCommandLine("bot list", "List all bots")}
      ${createCommandLine("bot list trading", "List trading bots")}
      ${createCommandLine("bot info DCA Trading Bot", "Get bot details")}
      ${createCommandLine("bot deploy Crypto Price Tracker", "Deploy a bot")}
      ${createCommandLine("bot search telegram", "Search for bots")}
      
      <div style="
        margin-top: 20px;
        padding: 12px;
        background: color-mix(in srgb, var(--palette-warning, #ffaa00) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--palette-warning, #ffaa00) 30%, transparent);
        border-radius: 6px;
        font-size: 12px;
        color: var(--palette-text, #ccd4e0);
      ">
        <span style="color: var(--palette-warning, #ffaa00);">🚧</span>
        <span style="margin-left: 8px;">NOTE: All features are currently in development. Commands will show preview data and 'coming soon' messages.</span>
      </div>
    </div>
  `;
  
  context.logHtml(helpHtml);
  context.log("", "output");
}


export const botCommand: Command = {
  name: "bot",
  aliases: ["bots", "bot-marketplace"],
  description: "Bot marketplace and management (trading, social, automation bots)",
  usage: "bot <list|info|deploy|start|stop|status|search|categories|help>",
  category: "bots",
  handler: async (context, args) => {
    const subcommand = (args[1] || "help").toLowerCase();

    switch (subcommand) {
      case "list":
        await handleList(context, args);
        break;
      case "info":
        await handleInfo(context, args);
        break;
      case "deploy":
        await handleDeploy(context, args);
        break;
      case "start":
        await handleStart(context, args);
        break;
      case "stop":
        await handleStop(context, args);
        break;
      case "status":
        await handleStatus(context, args);
        break;
      case "search":
        await handleSearch(context, args);
        break;
      case "categories":
        await handleCategories(context);
        break;
      case "help":
      default:
        await handleHelp(context);
        break;
    }
  },
};

export const botCommands: Command[] = [botCommand];

