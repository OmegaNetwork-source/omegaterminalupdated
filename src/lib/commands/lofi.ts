/**
 * Lo-Fi Player Commands
 *
 * Commands for controlling the Omega Lo-Fi Player.
 * Plays a fixed Lo-Fi playlist from YouTube via hidden iframe.
 *
 * Commands:
 * - lofi - Open Lo-Fi player and start playing
 * - lofi play - Start playing
 * - lofi pause - Pause/resume playback
 * - lofi stop - Stop playback
 * - lofi volume <0-100> - Set volume level
 * - lofi help - Show help
 */

import type { Command, CommandContext } from "@/types/commands";
import { createCommandLine, createUsageError } from "./command-output-helpers";

// ============================================================================
// Command Handlers
// ============================================================================

async function handlePlay(context: CommandContext, args: string[]) {
  context.log("🎵 Opening Omega Lo-Fi Player...", "info");
  
  // Dispatch event to open lofi player panel
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:openLoFiPlayer", {
        detail: { action: "play" },
      })
    );
    context.log("✅ Lo-Fi Player opened", "success");
    context.log("🎵 Now playing: Lo-Fi Playlist", "info");
  } else {
    context.log("⚠️ Cannot open Lo-Fi Player in this context", "warning");
  }
}

function handlePause(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:lofiPlayerControl", {
        detail: { action: "toggle" },
      })
    );
    context.log("⏸️ Lo-Fi music paused/resumed", "info");
  }
}

function handleStop(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:lofiPlayerControl", {
        detail: { action: "pause" },
      })
    );
    context.log("⏹️ Lo-Fi music stopped", "info");
  }
}

function handleVolume(context: CommandContext, args: string[]) {
  const volume = args[2];
  if (!volume) {
    const usageHtml = createUsageError("lofi volume <0-100>", [
      "lofi volume 50",
      "lofi volume 75",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  const volumeNum = parseInt(volume);
  if (isNaN(volumeNum) || volumeNum < 0 || volumeNum > 100) {
    context.log("❌ Volume must be a number between 0 and 100", "error");
    return;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:lofiPlayerControl", {
        detail: { action: "volume", value: volumeNum },
      })
    );
    context.log(`🔊 Volume set to ${volumeNum}%`, "success");
  }
}

function handleHelp(context: CommandContext, args: string[]) {
  context.log("🎵 Omega Lo-Fi Commands:", "info");
  context.log("", "output");
  context.log("  lofi          - Open Omega Lo-Fi Player and start playing", "info");
  context.log("  lofi play     - Start playing Lo-Fi Playlist", "info");
  context.log("  lofi pause    - Pause/resume Lo-Fi Playlist", "info");
  context.log("  lofi stop     - Stop Lo-Fi Playlist", "info");
  context.log("  lofi volume <0-100> - Set volume level", "info");
  context.log("  lofi help     - Show this help message", "info");
  context.log("", "output");
  context.log("🎵 Features:", "info");
  context.log("  • Custom Lo-Fi audio player", "info");
  context.log("  • Animated waveform visualization", "info");
  context.log("  • Play/pause controls", "info");
  context.log("  • Right panel integration", "info");
  context.log("", "output");
  const exampleHtml = createCommandLine("lofi volume 75", "Set volume to 75%");
  context.logHtml(exampleHtml);
}

// ============================================================================
// Main Command
// ============================================================================

export const lofiCommand: Command = {
  name: "lofi",
  description: "Omega Lo-Fi Player - Lo-Fi playlist",
  usage: "lofi <play|pause|stop|volume|help> [params]",
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
        const helpHtml = createCommandLine("lofi help", "See available commands");
        context.logHtml(helpHtml);
    }
  },
};

// ============================================================================
// Exports
// ============================================================================

export const lofiCommands = [lofiCommand];




