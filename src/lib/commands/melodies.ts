/**
 * Melodies Player Commands
 *
 * Commands for controlling the Omega Melodies Player.
 * Plays a fixed Melodies playlist from YouTube via hidden iframe.
 *
 * Commands:
 * - melodies - Open Melodies player and start playing
 * - melodies play - Start playing
 * - melodies pause - Pause/resume playback
 * - melodies stop - Stop playback
 * - melodies volume <0-100> - Set volume level
 * - melodies help - Show help
 */

import type { Command, CommandContext } from "@/types/commands";
import { createCommandLine, createUsageError } from "./command-output-helpers";

// ============================================================================
// Command Handlers
// ============================================================================

async function handlePlay(context: CommandContext, args: string[]) {
  context.log("🎵 Opening Omega Melodies Player...", "info");
  
  // Dispatch event to open melodies player panel
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:openOmegaMelodiesPlayer", {
        detail: { action: "play" },
      })
    );
    context.log("✅ Melodies Player opened", "success");
    context.log("🎵 Now playing: Omega Melodies", "info");
  } else {
    context.log("⚠️ Cannot open Melodies Player in this context", "warning");
  }
}

function handlePause(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:melodiesPlayerControl", {
        detail: { action: "toggle" },
      })
    );
    context.log("⏸️ Melodies Player toggled", "info");
  }
}

function handleStop(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:melodiesPlayerControl", {
        detail: { action: "pause" },
      })
    );
    window.dispatchEvent(new CustomEvent("omega:closeOmegaMelodiesPlayer"));
    context.log("⏹️ Melodies Player stopped", "info");
  }
}

function handleVolume(context: CommandContext, args: string[]) {
  const volumeStr = args[2];
  if (!volumeStr) {
    const usageHtml = createUsageError("melodies volume <0-100>", [
      "melodies volume 75",
      "melodies volume 50",
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
      new CustomEvent("omega:melodiesPlayerControl", {
        detail: { action: "volume", value: volumeNum },
      })
    );
    context.log(`🔊 Volume set to ${volumeNum}%`, "success");
  }
}

function handleHelp(context: CommandContext, args: string[]) {
  context.log("🎵 Omega Melodies Commands:", "info");
  context.log("", "output");
  context.log("  melodies          - Open Omega Melodies Player and start playing", "info");
  context.log("  melodies play     - Start playing Omega Melodies", "info");
  context.log("  melodies pause    - Pause/resume Omega Melodies", "info");
  context.log("  melodies stop     - Stop Omega Melodies", "info");
  context.log("  melodies volume <0-100> - Set volume level", "info");
  context.log("  melodies help     - Show this help message", "info");
  context.log("", "output");
  context.log("🎵 Features:", "info");
  context.log("  ✨ Custom Melodies audio player", "info");
  context.log("  ✨ Animated waveform visualization", "info");
  context.log("  ✨ Play/pause controls", "info");
  context.log("  ✨ Right panel integration", "info");
  context.log("", "output");
  const exampleHtml = createCommandLine("melodies volume 75", "Set volume to 75%");
  context.logHtml(exampleHtml);
}

// ============================================================================
// Main Command
// ============================================================================

export const melodiesCommand: Command = {
  name: "melodies",
  description: "Omega Melodies Player - Melodies playlist",
  usage: "melodies <play|pause|stop|volume|help> [params]",
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
        const helpHtml = createCommandLine("melodies help", "See available commands");
        context.logHtml(helpHtml);
    }
  },
};

// ============================================================================
// Exports
// ============================================================================

export const melodiesCommands = [melodiesCommand];
