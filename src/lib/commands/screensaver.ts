/**
 * Screensaver Commands
 *
 * Commands for controlling the screensaver feature.
 * Displays a fullscreen YouTube playlist video with no sound.
 *
 * Commands:
 * - screensaver - Open screensaver
 * - screensaver on - Open screensaver
 * - screensaver off - Close screensaver
 * - screensaver help - Show help
 */

import type { Command, CommandContext } from "@/types/commands";

// ============================================================================
// Command Handlers
// ============================================================================

async function handleOpen(context: CommandContext, args: string[]) {
  context.log("🖥️ Opening screensaver...", "info");

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:openScreensaver", {
        detail: {},
      })
    );
    context.log("✅ Screensaver activated", "success");
    context.log("💡 Press ESC or click the X button to close", "info");
  } else {
    context.log("⚠️ Cannot open screensaver in this context", "warning");
  }
}

function handleClose(context: CommandContext, args: string[]) {
  context.log("🖥️ Closing screensaver...", "info");

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:closeScreensaver", {
        detail: {},
      })
    );
    context.log("✅ Screensaver deactivated", "success");
  }
}

function handleHelp(context: CommandContext, args: string[]) {
  context.log("🖥️ Screensaver Commands:", "info");
  context.log("", "output");
  context.log("  screensaver      - Open screensaver (fullscreen video)", "info");
  context.log("  screensaver on   - Open screensaver", "info");
  context.log("  screensaver off  - Close screensaver", "info");
  context.log("  screensaver help - Show this help message", "info");
  context.log("", "output");
  context.log("🖥️ Features:", "info");
  context.log("  • Fullscreen YouTube video playlist", "info");
  context.log("  • Muted playback (no sound)", "info");
  context.log("  • Auto-cycles through playlist", "info");
  context.log("  • Press ESC or click X to close", "info");
  context.log("", "output");
  context.log("💡 Tip: Use this as a relaxing visual background", "info");
}

// ============================================================================
// Main Command
// ============================================================================

export const screensaverCommand: Command = {
  name: "screensaver",
  description: "Screensaver - Fullscreen video playlist",
  usage: "screensaver <on|off|help>",
  category: "entertainment",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    switch (subcommand) {
      case "on":
      case undefined:
        await handleOpen(context, args);
        break;
      case "off":
        handleClose(context, args);
        break;
      case "help":
        handleHelp(context, args);
        break;
      default:
        context.log(`Unknown subcommand: ${subcommand}`, "error");
        context.log('Type "screensaver help" for available commands', "info");
    }
  },
};

// ============================================================================
// Exports
// ============================================================================

export const screensaverCommands = [screensaverCommand];








