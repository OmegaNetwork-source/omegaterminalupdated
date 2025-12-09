/**
 * Tech Player Commands
 *
 * Commands for controlling the Omega Tech Player.
 * Plays a fixed Tech playlist from YouTube via hidden iframe.
 *
 * Commands:
 * - tech - Open Tech player and start playing
 * - tech play - Start playing
 * - tech pause - Pause/resume playback
 * - tech stop - Stop playback
 * - tech volume <0-100> - Set volume level
 * - tech help - Show help
 */

import type { Command, CommandContext } from "@/types/commands";
import { createCommandLine, createUsageError } from "./command-output-helpers";

// ============================================================================
// Command Handlers
// ============================================================================

async function handlePlay(context: CommandContext, args: string[]) {
  context.log("🎵 Opening Omega Tech Player...", "info");
  
  // Dispatch event to open tech player panel
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:openTechPlayer", {
        detail: { action: "play" },
      })
    );
    context.log("✅ Tech Player opened", "success");
    context.log("🎵 Now playing: Tech Playlist", "info");
  } else {
    context.log("⚠️ Cannot open Tech Player in this context", "warning");
  }
}

function handlePause(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:techPlayerControl", {
        detail: { action: "toggle" },
      })
    );
    context.log("⏸️ Tech music paused/resumed", "info");
  }
}

function handleStop(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:techPlayerControl", {
        detail: { action: "pause" },
      })
    );
    context.log("⏹️ Tech music stopped", "info");
  }
}

function handleVolume(context: CommandContext, args: string[]) {
  const volume = args[2];
  if (!volume) {
    const usageHtml = createUsageError("tech volume <0-100>", [
      "tech volume 50",
      "tech volume 75",
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
      new CustomEvent("omega:techPlayerControl", {
        detail: { action: "volume", value: volumeNum },
      })
    );
    context.log(`🔊 Volume set to ${volumeNum}%`, "success");
  }
}

function handleHelp(context: CommandContext, args: string[]) {
  context.log("🎵 Omega Tech Commands:", "info");
  context.log("", "output");
  context.log("  tech          - Open Omega Tech Player and start playing", "info");
  context.log("  tech play     - Start playing Tech Playlist", "info");
  context.log("  tech pause    - Pause/resume Tech Playlist", "info");
  context.log("  tech stop     - Stop Tech Playlist", "info");
  context.log("  tech volume <0-100> - Set volume level", "info");
  context.log("  tech help     - Show this help message", "info");
  context.log("", "output");
  context.log("🎵 Features:", "info");
  context.log("  • Custom Tech audio player", "info");
  context.log("  • Animated waveform visualization", "info");
  context.log("  • Play/pause controls", "info");
  context.log("  • Right panel integration", "info");
  context.log("", "output");
  const exampleHtml = createCommandLine("tech volume 75", "Set volume to 75%");
  context.logHtml(exampleHtml);
}

// ============================================================================
// Main Command
// ============================================================================

export const techCommand: Command = {
  name: "tech",
  description: "Omega Tech Player - Tech playlist",
  usage: "tech <play|pause|stop|volume|help> [params]",
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
        const helpHtml = createCommandLine("tech help", "See available commands");
        context.logHtml(helpHtml);
    }
  },
};

// ============================================================================
// Exports
// ============================================================================

export const techCommands = [techCommand];




