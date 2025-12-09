/**
 * YouTube Commands
 *
 * Commands for controlling YouTube video player.
 * Integrates with YouTube IFrame API and Data API v3 via YouTubeProvider.
 *
 * Commands:
 * - youtube open - Open YouTube player panel
 * - youtube close - Close YouTube player panel
 * - youtube search <query> - Search for videos
 * - youtube play <video-id> - Play specific video
 * - youtube pause - Pause playback
 * - youtube next - Play next video in playlist
 * - youtube prev - Play previous video
 * - youtube mute - Mute audio
 * - youtube unmute - Unmute audio
 * - youtube help - Show help
 *
 * Note: Full YouTube player UI with sidebar panels is deferred to Phase 15 (futuristic UI system).
 * For Phase 12, commands provide informative messages about upcoming features and configuration.
 */

import type { Command, CommandContext } from "@/types/commands";
import { isAppMode } from "@/lib/utils/url-utils";
import config from "@/lib/config";
import { createCommandLine, createUsageError } from "./command-output-helpers";

// ============================================================================
// Command Handlers
// ============================================================================

async function handleOpen(context: CommandContext, args: string[]) {
  try {
    // Get YouTube from media context
    if (context.media?.youtube?.openPanel) {
      context.media.youtube.openPanel();
      context.log("🎥 Opening YouTube player panel...", "info");
      context.log("", "output");
      context.log("📺 Panel opened in right sidebar", "success");
      context.log("", "output");
      context.log("💡 Default videos from Bloomberg Technology will load", "info");
      context.log("💡 Use 'youtube search <query>' to find other videos", "info");
      return;
    }
    
    context.log("🎥 Opening YouTube player panel...", "info");
    context.log("⚠️  YouTube context not available", "warning");
  } catch (error: any) {
    context.log(`❌ Failed to open YouTube panel: ${error.message}`, "error");
  }
}

async function handleClose(context: CommandContext, args: string[]) {
  try {
    if (context.media?.youtube?.closePanel) {
      context.media.youtube.closePanel();
      context.log("🎥 Closing YouTube player panel...", "info");
      context.log("✓ Panel closed", "success");
    } else {
      context.log("🎥 YouTube panel already closed", "info");
    }
  } catch (error: any) {
    context.log(`❌ Failed to close YouTube panel: ${error.message}`, "error");
  }
}

async function handleSearch(context: CommandContext, args: string[]) {
  const query = args.slice(2).join(" ");

  if (!query) {
    const usageHtml = createUsageError("youtube search <query>", [
      "youtube search lofi hip hop",
      "youtube search coding music",
    ]);
    context.logHtml(usageHtml);
    return;
  }

  try {
    if (context.media?.youtube?.searchVideos) {
      context.log(`🔍 Searching YouTube for "${query}"...`, "info");
      await context.media.youtube.searchVideos(query);
      context.log("", "output");
      context.log("✓ Search complete - check the YouTube panel", "success");
    } else {
      context.log(`🔍 Searching YouTube for "${query}"...`, "info");
      context.log("⚠️  YouTube context not available", "warning");
    }
  } catch (error: any) {
    context.log(`❌ Search failed: ${error.message}`, "error");
  }
}

async function handlePlay(context: CommandContext, args: string[]) {
  const videoId = args[2];

  if (!videoId) {
    // Resume playback or play first in playlist
    if (context.media?.youtube?.togglePlayPause) {
      context.media.youtube.togglePlayPause();
      context.log("▶️  Toggling playback...", "info");
    } else {
      context.log("▶️  Play/pause requires YouTube panel to be open", "info");
    }
    return;
  }

  try {
    // Play specific video by ID
    if (context.media?.youtube?.playVideo) {
      context.log(`▶️  Playing video: ${videoId}...`, "info");
      context.media.youtube.playVideo(videoId, 0);
      context.log("✓ Video loading in player", "success");
    } else {
      context.log(`▶️  Would play: ${videoId}`, "info");
      context.log("⚠️  YouTube panel must be open first", "warning");
      const helpHtml = createCommandLine("youtube open", "Open YouTube panel first");
      context.logHtml(helpHtml);
    }
  } catch (error: any) {
    context.log(`❌ Failed to play video: ${error.message}`, "error");
  }
}

async function handlePause(context: CommandContext, args: string[]) {
  try {
    if (context.media?.youtube?.togglePlayPause) {
      context.media.youtube.togglePlayPause();
      context.log("⏸️  Pausing playback...", "info");
      context.log("✓ Playback paused", "success");
    } else {
      context.log("⏸️  Pause requires YouTube panel to be open", "info");
    }
  } catch (error: any) {
    context.log(`❌ Failed to pause: ${error.message}`, "error");
  }
}

async function handleNext(context: CommandContext, args: string[]) {
  try {
    if (context.media?.youtube?.next) {
      context.media.youtube.next();
      context.log("⏭️  Playing next video...", "info");
      context.log("✓ Next video loading", "success");
    } else {
      context.log("⏭️  Next requires YouTube panel to be open", "info");
    }
  } catch (error: any) {
    context.log(`❌ Failed to play next: ${error.message}`, "error");
  }
}

async function handlePrev(context: CommandContext, args: string[]) {
  try {
    if (context.media?.youtube?.previous) {
      context.media.youtube.previous();
      context.log("⏮️  Playing previous video...", "info");
      context.log("✓ Previous video loading", "success");
    } else {
      context.log("⏮️  Previous requires YouTube panel to be open", "info");
    }
  } catch (error: any) {
    context.log(`❌ Failed to play previous: ${error.message}`, "error");
  }
}

async function handleMute(context: CommandContext, args: string[]) {
  try {
    if (context.media?.youtube?.toggleMute) {
      context.media.youtube.toggleMute();
      context.log("🔇 Muting audio...", "info");
      context.log("✓ Audio muted", "success");
    } else {
      context.log("🔇 Mute requires YouTube panel to be open", "info");
    }
  } catch (error: any) {
    context.log(`❌ Failed to mute: ${error.message}`, "error");
  }
}

async function handleUnmute(context: CommandContext, args: string[]) {
  try {
    if (context.media?.youtube?.toggleMute) {
      context.media.youtube.toggleMute(); // Toggle works for both mute/unmute
      context.log("🔊 Unmuting audio...", "info");
      context.log("✓ Audio unmuted", "success");
    } else {
      context.log("🔊 Unmute requires YouTube panel to be open", "info");
    }
  } catch (error: any) {
    context.log(`❌ Failed to unmute: ${error.message}`, "error");
  }
}

async function handleHelp(context: CommandContext, args: string[]) {
  context.log(
    "╔═══════════════════════════════════════════════════════════╗",
    "info"
  );
  context.log(
    "║                   YOUTUBE PLAYER HELP                     ║",
    "info"
  );
  context.log(
    "╚═══════════════════════════════════════════════════════════╝",
    "info"
  );
  context.log("", "info");
  context.log("📺 PLAYER CONTROLS:", "info");
  context.log("  youtube open              Open YouTube player panel", "info");
  context.log("  youtube close             Close YouTube player panel", "info");
  context.log("  youtube search <query>    Search for videos", "info");
  context.log("  youtube play <video-id>   Play specific video by ID", "info");
  context.log("  youtube pause             Pause current video", "info");
  context.log(
    "  youtube next              Play next video in playlist",
    "info"
  );
  context.log("  youtube prev              Play previous video", "info");
  context.log("  youtube mute              Mute audio", "info");
  context.log("  youtube unmute            Unmute audio", "info");
  context.log("  youtube help              Show this help", "info");
  context.log("", "info");
  context.log("💡 EXAMPLES:", "info");
  context.log(
    "  youtube search lofi hip hop        Search for lofi videos",
    "info"
  );
  context.log(
    "  youtube search coding music        Search for coding music",
    "info"
  );
  context.log(
    "  youtube search crypto news         Search for crypto news",
    "info"
  );
  context.log(
    "  youtube play dQw4w9WgXcQ           Play specific video",
    "info"
  );
  context.log("", "info");
  context.log("✨ FEATURES (Phase 15):", "info");
  context.log("  • Search YouTube with any query", "info");
  context.log("  • Watch videos in sidebar panel", "info");
  context.log("  • Click thumbnails to play", "info");
  context.log("  • Auto-play next video in playlist", "info");
  context.log("  • Full playback controls", "info");
  context.log("  • Works with all themes", "info");
  context.log("", "info");
  context.log("🎯 QUICK START:", "info");
  context.log("  1. youtube open", "info");
  context.log("  2. youtube search your favorite topic", "info");
  context.log("  3. Click any thumbnail to watch!", "info");
  context.log("", "info");
  context.log("💡 TIP: YouTube player appears in the right sidebar", "info");
  context.log('        Use "view futuristic" for the best experience', "info");
}

// ============================================================================
// Main Command
// ============================================================================

export const youtubeCommand: Command = {
  name: "youtube",
  aliases: ["yt"],
  description: "YouTube video player",
  usage:
    "youtube <open|close|search|play|pause|next|prev|mute|unmute|help> [params]",
  category: "media",
  handler: async (context: CommandContext, args: string[]) => {
    // Check if app mode is enabled - disable YouTube completely
    if (isAppMode()) {
      context.log("❌ YouTube is not supported on mobile app version", "error");
      return;
    }
    
    const subcommand = args[1]?.toLowerCase();

    switch (subcommand) {
      case "open":
        await handleOpen(context, args);
        break;
      case "close":
        await handleClose(context, args);
        break;
      case "search":
        await handleSearch(context, args);
        break;
      case "play":
        await handlePlay(context, args);
        break;
      case "pause":
        await handlePause(context, args);
        break;
      case "next":
        await handleNext(context, args);
        break;
      case "prev":
      case "previous":
        await handlePrev(context, args);
        break;
      case "mute":
        await handleMute(context, args);
        break;
      case "unmute":
        await handleUnmute(context, args);
        break;
      case "help":
      case undefined:
        await handleHelp(context, args);
        break;
      default:
        context.log(`Unknown subcommand: ${subcommand}`, "error");
        const helpHtml = createCommandLine("youtube help", "See available commands");
        context.logHtml(helpHtml);
    }
  },
};

// ============================================================================
// Exports
// ============================================================================

export const youtubeCommands = [youtubeCommand];
