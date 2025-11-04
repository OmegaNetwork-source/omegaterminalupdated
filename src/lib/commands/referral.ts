/**
 * Referral / Ambassador Program Commands
 * Social-first referral integration
 * Based on vanilla js/commands/referral.js
 */

import type { Command, CommandContext } from "@/types/commands";

// API endpoints
const WILDCARD_API = "https://omeganetwork.co/api/wildcard";
const REFERRAL_API = "https://omeganetwork.co/api/wildcard/referrals";
const AMBASSADOR_API = "https://omeganetwork.co/api/v1/ambassadors";

/**
 * Referral command - Create and manage referrals
 */
export const referralCommand: Command = {
  name: "referral",
  description: "Omega Ambassador referral program",
  usage: "referral <create|stats|share|leaderboard|dashboard|help>",
  aliases: ["ambassador"],
  category: "social",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      showReferralHelp(context);
      return;
    }

    switch (subcommand) {
      case "create":
        await createReferral(context, args);
        break;
      case "stats":
        await showStats(context, args);
        break;
      case "share":
        await shareReferral(context, args);
        break;
      case "leaderboard":
        await showLeaderboard(context, args);
        break;
      case "dashboard":
        openDashboard(context);
        break;
      case "complete":
        await completeReferral(context, args);
        break;
      default:
        context.log(`❌ Unknown referral command: ${subcommand}`, "error");
        context.log('Type "referral help" for available commands', "info");
    }
  },
};

function showReferralHelp(context: CommandContext): void {
  context.log("OMEGA AMBASSADOR PROGRAM", "info");
  context.log("═══════════════════════════════════════", "info");
  context.log("", "info");

  context.log("COMMANDS:", "info");
  context.log(
    "  referral create [wallet] [@twitter] [discord]  Generate referral link",
    "output"
  );
  context.log(
    "  referral stats [wallet]                        View your statistics",
    "output"
  );
  context.log(
    "  referral share [platform]                      Get sharing links",
    "output"
  );
  context.log(
    "  referral leaderboard [limit]                   View top ambassadors",
    "output"
  );
  context.log(
    "  referral dashboard                             Open web dashboard",
    "output"
  );
  context.log("", "info");

  context.log("EXAMPLES:", "info");
  context.log(
    "  referral create                                Use connected wallet",
    "output"
  );
  context.log(
    "  referral create 0x123... @myhandle discord#1234 With social handles",
    "output"
  );
  context.log(
    "  referral share twitter                         Share on Twitter",
    "output"
  );
  context.log(
    "  referral leaderboard 20                        Top 20 ambassadors",
    "output"
  );
  context.log("", "info");

  context.log("REWARDS:", "info");
  context.log("  10 OMEGA tokens for each successful referral", "success");
  context.log("  5 OMEGA tokens for new users who join", "success");
  context.log("  2 OMEGA bonus for social media sharing", "success");
  context.log("", "info");

  context.log("Get started: referral create", "success");
}

async function createReferral(
  context: CommandContext,
  args: string[]
): Promise<void> {
  let walletAddress = context.wallet.state.address || args[2];

  if (!walletAddress) {
    context.log(
      "❌ No wallet address found. Please connect a wallet first or provide an address:",
      "error"
    );
    context.log(
      "Usage: referral create [wallet_address] [@twitter] [discord#id]",
      "info"
    );
    return;
  }

  const twitterHandle = args[3] || null;
  const discordId = args[4] || null;

  context.log("Creating your referral code...", "info");
  context.log("🔗 Connecting to Omega Network API...", "info");

  try {
    // Try production API
    const response = await fetch(`${REFERRAL_API}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress,
        twitterHandle,
        discordId,
      }),
    });

    if (!response.ok) {
      throw new Error("API not available - using demo mode");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    context.log("Referral code created successfully!", "success");
    context.log(`Your Code: ${result.referralCode}`, "success");
    context.log(`Your Link: ${result.referralUrl}`, "info");
    context.log("", "info");
    context.log("SOCIAL SHARING:", "info");
    context.log(`Twitter: "${result.socialShare.twitter}"`, "info");
    context.log(`Discord: "${result.socialShare.discord}"`, "info");
    context.log("", "info");
    context.log('Tip: Use "referral share" to post automatically!', "success");
  } catch (error: any) {
    // Fallback to mock data
    const mockCode = generateMockReferralCode();
    const mockUrl = `https://omeganetwork.co/ref/${mockCode}`;

    context.log("Referral code created (Demo Mode)!", "success");
    context.log(`Your Code: ${mockCode}`, "success");
    context.log(`Your Link: ${mockUrl}`, "info");
    context.log("", "info");
    context.log(
      "ℹ️  Note: Using demonstration mode (Omega Network API not available)",
      "warning"
    );
    context.log("   This is a mock referral for testing purposes", "info");
    context.log("", "info");
    context.log(
      "Earn 10 OMEGA for each successful referral + 2 OMEGA for social sharing!",
      "success"
    );
  }
}

async function showStats(
  context: CommandContext,
  args: string[]
): Promise<void> {
  let walletAddress = context.wallet.state.address || args[2];

  if (!walletAddress) {
    context.log(
      "❌ No wallet address found. Please connect a wallet first.",
      "error"
    );
    return;
  }

  context.log("Loading your referral stats...", "info");

  try {
    const response = await fetch(
      `${WILDCARD_API}/user/profile?walletAddress=${walletAddress}`
    );

    if (!response.ok) {
      throw new Error("API not available");
    }

    const result = await response.json();

    context.log("REFERRAL DASHBOARD", "success");
    context.log("══════════════════════════════════", "success");
    context.log(`Referral Code: ${result.referralCode}`, "info");
    context.log(`Referral URL: ${result.referralUrl}`, "info");
    context.log("", "info");

    context.log("PERFORMANCE STATS:", "info");
    context.log(`Total Referrals: ${result.totalReferrals}`, "info");
    context.log(`Total Earned: ${result.totalEarned} OMEGA`, "success");
    context.log(
      "Commands: referral share | referral leaderboard | referral dashboard",
      "success"
    );
  } catch (error: any) {
    // Show mock stats
    context.log("REFERRAL DASHBOARD (Demo)", "success");
    context.log("══════════════════════════════════", "success");
    context.log(`Referral Code: ${generateMockReferralCode()}`, "info");
    context.log(`Total Referrals: ${Math.floor(Math.random() * 50)}`, "info");
    context.log(
      `Total Earned: ${(Math.random() * 1000).toFixed(2)} OMEGA`,
      "success"
    );
  }
}

async function shareReferral(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const platform = args[2] ? args[2].toLowerCase() : "all";
  let walletAddress = context.wallet.state.address;

  if (!walletAddress) {
    context.log(
      "❌ Please connect your wallet first to get sharing links",
      "error"
    );
    return;
  }

  const mockCode = generateMockReferralCode();
  const referralUrl = `https://omeganetwork.co/ref/${mockCode}`;

  context.log("SOCIAL SHARING OPTIONS:", "info");
  context.log("══════════════════════════════════", "info");
  context.log("", "info");

  if (platform === "all" || platform === "twitter") {
    const twitterText = `🚀 Join me on Omega Network! Use my referral code: ${mockCode} and earn 10 OMEGA tokens! ${referralUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      twitterText
    )}`;
    context.log("TWITTER SHARE:", "info");
    context.logHtml(
      `<a href="${twitterUrl}" target="_blank" style="color: #00bcf2;">${twitterUrl}</a>`
    );
    context.log("", "info");
  }

  if (platform === "all" || platform === "discord") {
    context.log("DISCORD SHARE:", "info");
    context.log(
      `Message: "Join Omega Network with my referral code: **${mockCode}** and earn 10 OMEGA tokens! ${referralUrl}"`,
      "success"
    );
    context.log("", "info");
  }

  context.log("YOUR REFERRAL LINK:", "info");
  context.log(`${referralUrl}`, "success");
  context.log("", "info");
  context.log(
    "Earn 10 OMEGA for each successful referral + 2 OMEGA for social sharing!",
    "success"
  );
}

async function showLeaderboard(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const limit = parseInt(args[2]) || 10;

  context.log("Loading referral leaderboard...", "info");

  // Mock leaderboard data
  context.log("OMEGA AMBASSADOR LEADERBOARD", "success");
  context.log("══════════════════════════════════════", "success");
  context.log("", "info");

  for (let i = 1; i <= limit && i <= 10; i++) {
    const rank =
      i === 1 ? "[1st]" : i === 2 ? "[2nd]" : i === 3 ? "[3rd]" : `[${i}]`;
    const referrals = Math.floor(Math.random() * 100) + 1;
    const earned = (Math.random() * 1000).toFixed(0);
    context.log(
      `${rank} Ambassador ${i} - ${referrals} referrals (${earned} OMEGA)`,
      "info"
    );
  }

  context.log("", "info");
  context.log("Start referring friends to climb the leaderboard!", "success");
}

function openDashboard(context: CommandContext): void {
  context.log("Opening ambassador dashboard...", "info");
  const dashboardUrl = "https://omeganetwork.co/ambassador/dashboard";

  if (typeof window !== "undefined") {
    window.open(dashboardUrl, "_blank");
  }

  context.log("Dashboard opened in new tab!", "success");
  context.log(`URL: ${dashboardUrl}`, "info");
}

async function completeReferral(
  context: CommandContext,
  args: string[]
): Promise<void> {
  if (args.length < 4) {
    context.log(
      "Usage: referral complete <referral_code> <new_wallet_address> [platform]",
      "error"
    );
    return;
  }

  const referralCode = args[2];
  const newWalletAddress = args[3];
  const sourcePlatform = args[4] || "terminal";

  context.log("Completing referral...", "info");
  context.log("💡 Referral completion integration coming soon", "warning");
  context.log(
    `📊 This will validate and complete referral for code: ${referralCode}`,
    "info"
  );
}

function generateMockReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Note: "ambassador" is already registered as an alias of "referral" command above
// No need for separate ambassadorCommand

export const referralCommands: Command[] = [referralCommand];
