/**
 * Whoami Command - Session Information
 * Usage: whoami
 */

import type { Command, CommandContext } from "@/types/commands";
import { renderCard } from "@/lib/terminal/renderers";

/**
 * whoami - Show session information
 */
async function handleWhoami(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const sessionInfo: Record<string, any> = {
    "User ID": "anonymous",
    "Wallet Connected": context.wallet?.address ? "Yes" : "No",
    "Wallet Address": context.wallet?.address || "Not connected",
    "Theme": context.theme.currentTheme,
    "View Mode": context.viewMode?.viewMode || "standard",
    "GUI Theme": context.ui?.guiTheme || "terminal",
  };

  // Add wallet info if connected
  if (context.wallet?.address) {
    // Try to get balance
    try {
      const balance = await context.wallet.getBalance();
      if (balance) {
        sessionInfo["Balance"] = balance;
      }
    } catch {
      // Ignore balance errors
    }
  }

  const html = renderCard(sessionInfo, "Session Info");
  context.logHtml(html);
  context.log(`✓ Session information loaded`, "success");
}

export const whoamiCommand: Command = {
  name: "whoami",
  description: "Show session information",
  usage: "whoami",
  category: "system",
  handler: handleWhoami,
};

export const whoamiCommands: Command[] = [whoamiCommand];

