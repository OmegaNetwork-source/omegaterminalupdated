/**
 * Blues Player Commands
 *
 * Commands for controlling the Omega Blues Player.
 * Plays a fixed Dark Blues playlist from YouTube via hidden iframe.
 *
 * Commands:
 * - blues - Open Blues player and start playing
 * - blues play - Start playing
 * - blues pause - Pause/resume playback
 * - blues stop - Stop playback
 * - blues volume <0-100> - Set volume level
 * - blues help - Show help
 */

import type { Command, CommandContext } from "@/types/commands";

// ============================================================================
// Command Handlers
// ============================================================================

async function handlePlay(context: CommandContext, args: string[]) {
  context.log("🎵 Opening Omega Blues Player...", "info");
  
  // Dispatch event to open blues player panel
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:openBluesPlayer", {
        detail: { action: "play" },
      })
    );
    context.log("✅ Blues Player opened", "success");
    context.log("🎵 Now playing: Dark Blues Playlist", "info");
  } else {
    context.log("⚠️ Cannot open Blues Player in this context", "warning");
  }
}

function handlePause(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:bluesPlayerControl", {
        detail: { action: "toggle" },
      })
    );
    context.log("⏸️ Blues music paused/resumed", "info");
  }
}

function handleStop(context: CommandContext, args: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:bluesPlayerControl", {
        detail: { action: "pause" },
      })
    );
    context.log("⏹️ Blues music stopped", "info");
  }
}

function handleVolume(context: CommandContext, args: string[]) {
  const volume = args[2];
  if (!volume) {
    context.log("❌ Please provide a volume level (0-100)", "error");
    context.log('💡 Usage: blues volume 50', "info");
    return;
  }

  const volumeNum = parseInt(volume);
  if (isNaN(volumeNum) || volumeNum < 0 || volumeNum > 100) {
    context.log("❌ Volume must be a number between 0 and 100", "error");
    return;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omega:bluesPlayerControl", {
        detail: { action: "volume", value: volumeNum },
      })
    );
    context.log(`🔊 Volume set to ${volumeNum}%`, "success");
  }
}

function handleHelp(context: CommandContext, args: string[]) {
  context.log("🎵 Omega Blues Commands:", "info");
  context.log("", "output");
  context.log("  blues          - Open Omega Blues Player and start playing", "info");
  context.log("  blues play     - Start playing Dark Blues Playlist", "info");
  context.log("  blues pause    - Pause/resume Dark Blues Playlist", "info");
  context.log("  blues stop     - Stop Dark Blues Playlist", "info");
  context.log("  blues volume <0-100> - Set volume level", "info");
  context.log("  blues help     - Show this help message", "info");
  context.log("", "output");
  context.log("🎵 Features:", "info");
  context.log("  • Custom Dark Blues audio player", "info");
  context.log("  • Animated waveform visualization", "info");
  context.log("  • Play/pause controls", "info");
  context.log("  • Right panel integration", "info");
  context.log("", "output");
  context.log('💡 Example: blues volume 75', "info");
}

// ============================================================================
// Main Command
// ============================================================================

export const bluesCommand: Command = {
  name: "blues",
  description: "Omega Blues Player - Dark Blues playlist",
  usage: "blues <play|pause|stop|volume|help> [params]",
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
        context.log('Type "blues help" for available commands', "info");
    }
  },
};

// ============================================================================
// Exports
// ============================================================================

export const bluesCommands = [bluesCommand];




