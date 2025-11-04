/**
 * Funky Player Commands
 *
 * Commands for controlling the Omega Funky Player.
 * Plays a fixed Funky playlist from YouTube via hidden iframe.
 *
 * Commands:
 * - funky - Open Funky player and start playing
 * - funky play - Start playing
 * - funky pause - Pause/resume playback
 * - funky stop - Stop playback
 * - funky volume <0-100> - Set volume level
 * - funky help - Show help
 */

import type { Command, CommandContext } from "@/types/commands";

// ============================================================================
// Command Handlers
// ============================================================================

async function handlePlay(context: CommandContext, args: string[]) {
  context.log("🎵 Opening Omega Funky Player...", "info");
  
  // Dispatch event to open funky player panel
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:openFunkyPlayer", {
        detail: { action: "play" },
      })
    );
    context.log("✅ Funky Player opened", "success");
    context.log("🎵 Now playing: Funky Playlist", "info");
  } else {
    context.log("⚠️ Cannot open Funky Player in this context", "warning");
  }
}

function handlePause(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:funkyPlayerControl", {
        detail: { action: "toggle" },
      })
    );
    context.log("⏸️ Funky music paused/resumed", "info");
  }
}

function handleStop(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:funkyPlayerControl", {
        detail: { action: "pause" },
      })
    );
    context.log("⏹️ Funky music stopped", "info");
  }
}

function handleVolume(context: CommandContext, args: string[]) {
  const volume = args[2];
  if (!volume) {
    context.log("❌ Please provide a volume level (0-100)", "error");
    context.log('💡 Usage: funky volume 50', "info");
    return;
  }

  const volumeNum = parseInt(volume);
  if (isNaN(volumeNum) || volumeNum < 0 || volumeNum > 100) {
    context.log("❌ Volume must be a number between 0 and 100", "error");
    return;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:funkyPlayerControl", {
        detail: { action: "volume", value: volumeNum },
      })
    );
    context.log(`🔊 Volume set to ${volumeNum}%`, "success");
  }
}

function handleHelp(context: CommandContext, args: string[]) {
  context.log("🎵 Omega Funky Commands:", "info");
  context.log("", "output");
  context.log("  funky          - Open Omega Funky Player and start playing", "info");
  context.log("  funky play     - Start playing Funky Playlist", "info");
  context.log("  funky pause    - Pause/resume Funky Playlist", "info");
  context.log("  funky stop     - Stop Funky Playlist", "info");
  context.log("  funky volume <0-100> - Set volume level", "info");
  context.log("  funky help     - Show this help message", "info");
  context.log("", "output");
  context.log("🎵 Features:", "info");
  context.log("  • Custom Funky audio player", "info");
  context.log("  • Animated waveform visualization", "info");
  context.log("  • Play/pause controls", "info");
  context.log("  • Right panel integration", "info");
  context.log("", "output");
  context.log('💡 Example: funky volume 75', "info");
}

// ============================================================================
// Main Command
// ============================================================================

export const funkyCommand: Command = {
  name: "funky",
  description: "Omega Funky Player - Funky playlist",
  usage: "funky <play|pause|stop|volume|help> [params]",
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
        context.log('Type "funky help" for available commands', "info");
    }
  },
};

// ============================================================================
// Exports
// ============================================================================

export const funkyCommands = [funkyCommand];

