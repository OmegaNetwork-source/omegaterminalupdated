/**
 * Trance Player Commands
 *
 * Commands for controlling the Omega Trance Player.
 * Plays a fixed Trance playlist from YouTube via hidden iframe.
 *
 * Commands:
 * - trance - Open Trance player and start playing
 * - trance play - Start playing
 * - trance pause - Pause/resume playback
 * - trance stop - Stop playback
 * - trance volume <0-100> - Set volume level
 * - trance help - Show help
 */

import type { Command, CommandContext } from "@/types/commands";
import { createCommandLine, createUsageError } from "./command-output-helpers";

// ============================================================================
// Command Handlers
// ============================================================================

async function handlePlay(context: CommandContext, args: string[]) {
  context.log("🎵 Opening Omega Trance Player...", "info");
  
  // Dispatch event to open trance player panel
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:openOmegaTrancePlayer", {
        detail: { action: "play" },
      })
    );
    context.log("✅ Trance Player opened", "success");
    context.log("🎵 Now playing: Trance Playlist", "info");
  } else {
    context.log("⚠️ Cannot open Trance Player in this context", "warning");
  }
}

function handlePause(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:trancePlayerControl", {
        detail: { action: "toggle" },
      })
    );
    context.log("⏸️ Trance Player toggled", "info");
  }
}

function handleStop(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:trancePlayerControl", {
        detail: { action: "pause" },
      })
    );
    window.dispatchEvent(new CustomEvent("omega:closeOmegaTrancePlayer"));
    context.log("⏹️ Trance Player stopped", "info");
  }
}

function handleVolume(context: CommandContext, args: string[]) {
  const volumeStr = args[2];
  if (!volumeStr) {
    const usageHtml = createUsageError("trance volume <0-100>", [
      "trance volume 75",
      "trance volume 50",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  const volumeNum = parseInt(volumeStr, 10);
  if (isNaN(volumeNum) || volumeNum < 0 || volumeNum > 100) {
    context.log("❌ Volume must be a number between 0 and 100", "error");
    return;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:trancePlayerControl", {
        detail: { action: "volume", value: volumeNum },
      })
    );
    context.log(`🔊 Volume set to ${volumeNum}%`, "success");
  }
}

function handleHelp(context: CommandContext, args: string[]) {
  context.log("🎵 Omega Trance Commands:", "info");
  context.log("", "output");
  context.log("  trance          - Open Omega Trance Player and start playing", "info");
  context.log("  trance play     - Start playing Trance Playlist", "info");
  context.log("  trance pause    - Pause/resume Trance Playlist", "info");
  context.log("  trance stop     - Stop Trance Playlist", "info");
  context.log("  trance volume <0-100> - Set volume level", "info");
  context.log("  trance help     - Show this help message", "info");
  context.log("", "output");
  context.log("🎵 Features:", "info");
  context.log("  • Custom Trance audio player", "info");
  context.log("  • Animated waveform visualization", "info");
  context.log("  • Play/pause controls", "info");
  context.log("  • Right panel integration", "info");
  context.log("", "output");
  const exampleHtml = createCommandLine("trance volume 75", "Set volume to 75%");
  context.logHtml(exampleHtml);
}

// ============================================================================
// Main Command
// ============================================================================

export const tranceCommand: Command = {
  name: "trance",
  description: "Omega Trance Player - Trance playlist",
  usage: "trance <play|pause|stop|volume|help> [params]",
  category: "entertainment",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    switch (subcommand) {
      case "play":
      case undefined:
        await handlePlay(context, args);
        break;
      case "pause":
        handlePause(context, args);
        break;
      case "stop":
        handleStop(context, args);
        break;
      case "volume":
        handleVolume(context, args);
        break;
      case "help":
        handleHelp(context, args);
        break;
      default:
        context.log(`Unknown subcommand: ${subcommand}`, "error");
        const helpHtml = createCommandLine("trance help", "See available commands");
        context.logHtml(helpHtml);
    }
  },
};

// ============================================================================
// Exports
// ============================================================================

export const tranceCommands = [tranceCommand];
