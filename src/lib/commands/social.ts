/**
 * PredictSphere Commands - Social Graph
 * Commands: social:feed, social:follow, social:profile, social:leagues
 */

import type { Command, CommandContext } from "@/types/commands";
import { parseFlags, getFlagString, getFlagNumber } from "@/lib/terminal/flag-parser";
import { renderTable, renderCard } from "@/lib/terminal/renderers";
import { formatCurrency } from "@/lib/utils";

/**
 * social:feed - Show followed activity feed
 * Usage: social:feed [--limit <n>]
 */
async function handleSocialFeed(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const limit = getFlagNumber(parsed.flags, "limit", 20);

  context.log(`📰 Loading activity feed...`, "info");

  try {
    // TODO: Load from social API
    const feed = Array.from({ length: limit }, (_, i) => ({
      user: `@user${i + 1}`,
      action: i % 2 === 0 ? "forecast" : "comment",
      market: `polymarket:${10000 + i}`,
      time: `${i + 1}h ago`,
      content: i % 2 === 0 
        ? "Submitted forecast: 0.72" 
        : "Great analysis!",
    }));

    const html = renderTable(feed, [
      { key: "user", label: "User" },
      { key: "action", label: "Action" },
      { key: "market", label: "Market" },
      { key: "content", label: "Content" },
      { key: "time", label: "Time" },
    ]);

    context.logHtml(html);
    context.log(`✓ Loaded ${feed.length} items`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check network connection", "output");
    context.log("   • Verify username is correct", "output");
  }
}

/**
 * social:follow - Follow a user
 * Usage: social:follow <@username>
 */
async function handleSocialFollow(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const username = parsed.positional[0];

  if (!username) {
    context.log("❌ Usage: social:follow <@username>", "error");
    context.log("   Example: social:follow @yumi", "info");
    return;
  }

  const cleanUsername = username.startsWith("@") ? username.substring(1) : username;

  context.log(`👤 Following @${cleanUsername}...`, "info");

  try {
    // TODO: Follow user via API
    context.log(`✓ Now following @${cleanUsername}`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check network connection", "output");
    context.log("   • Verify username is correct", "output");
  }
}

/**
 * social:profile - View user profile and accuracy
 * Usage: social:profile <@username> [--range <time>]
 */
async function handleSocialProfile(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const username = parsed.positional[0];
  const range = getFlagString(parsed.flags, "range", "365d");

  if (!username) {
    context.log("❌ Usage: social:profile <@username> [--range <time>]", "error");
    context.log("   Example: social:profile @omega --range 365d", "info");
    return;
  }

  const cleanUsername = username.startsWith("@") ? username.substring(1) : username;

  context.log(`👤 Loading profile for @${cleanUsername}...`, "info");

  try {
    // TODO: Load from social API
    const profile = {
      username: cleanUsername,
      accuracy: "72%",
      brierScore: 0.18,
      forecasts: 234,
      followers: 156,
      following: 89,
      badges: ["Top Forecaster", "Crypto Expert"],
      range: range,
    };

    const html = renderCard(profile, `Profile: @${cleanUsername}`);
    context.logHtml(html);
    context.log(`✓ Profile loaded`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check network connection", "output");
    context.log("   • Verify username is correct", "output");
  }
}

/**
 * social:leagues - View leaderboards and leagues
 * Usage: social:leagues [--category <category>]
 */
async function handleSocialLeagues(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const category = getFlagString(parsed.flags, "category", "overall");

  context.log(`🏆 Loading ${category} leaderboard...`, "info");

  try {
    // TODO: Load from leagues API
    const leaderboard = Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      username: `@user${i + 1}`,
      accuracy: `${70 + i * 2}%`,
      brierScore: (0.15 - i * 0.01).toFixed(2),
      forecasts: 100 + i * 20,
    }));

    const html = renderTable(leaderboard, [
      { key: "rank", label: "Rank", align: "right" },
      { key: "username", label: "User" },
      { key: "accuracy", label: "Accuracy", align: "right" },
      { key: "brierScore", label: "Brier Score", align: "right" },
      { key: "forecasts", label: "Forecasts", align: "right" },
    ]);

    context.logHtml(html);
    context.log(`✓ Leaderboard loaded`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check network connection", "output");
    context.log("   • Verify username is correct", "output");
  }
}

export const socialFeedCommand: Command = {
  name: "social:feed",
  description: "Show followed activity feed",
  usage: "social:feed [--limit <n>]",
  category: "trading",
  handler: handleSocialFeed,
};

export const socialFollowCommand: Command = {
  name: "social:follow",
  description: "Follow a user",
  usage: "social:follow <@username>",
  category: "trading",
  handler: handleSocialFollow,
};

export const socialProfileCommand: Command = {
  name: "social:profile",
  description: "View user profile and accuracy",
  usage: "social:profile <@username> [--range <time>]",
  category: "trading",
  handler: handleSocialProfile,
};

export const socialLeaguesCommand: Command = {
  name: "social:leagues",
  description: "View leaderboards and leagues",
  usage: "social:leagues [--category <category>]",
  category: "trading",
  handler: handleSocialLeagues,
};

export const socialCommands: Command[] = [
  socialFeedCommand,
  socialFollowCommand,
  socialProfileCommand,
  socialLeaguesCommand,
];

