/**
 * Spotify Integration Commands
 * Control Spotify playback, search music, and manage player
 * Based on vanilla js/commands/entertainment.js spotify implementation
 */

import type { Command, CommandContext } from "@/types/commands";

/**
 * Spotify command - Music player controls
 */
export const spotifyCommand: Command = {
  name: "spotify",
  description: "Spotify music player integration",
  usage: "spotify <open|connect|disconnect|play|next|prev|search|close|help>",
  category: "entertainment",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "open" || subcommand === "player") {
      openSpotifyPlayer(context);
      return;
    }

    switch (subcommand) {
      case "connect":
      case "login":
        await connectSpotify(context);
        break;
      case "disconnect":
      case "logout":
        disconnectSpotify(context);
        break;
      case "close":
        closeSpotifyPlayer(context);
        break;
      case "play":
      case "pause":
        togglePlayback(context);
        break;
      case "next":
        nextTrack(context);
        break;
      case "prev":
      case "previous":
        previousTrack(context);
        break;
      case "search":
        await searchMusic(context, args);
        break;
      case "help":
        showSpotifyHelp(context);
        break;
      default:
        context.log(`Unknown spotify command: ${subcommand}`, "error");
        context.log('Type "spotify help" for available commands', "info");
    }
  },
};

function openSpotifyPlayer(context: CommandContext): void {
  context.log("🎵 Opening Spotify player...", "info");

  // Use the actual Spotify panel from context
  if (context.media?.spotify?.openPanel) {
    try {
      context.media.spotify.openPanel();
      context.log("✅ Spotify player opened", "success");
    } catch (error: any) {
      context.log(`❌ Error opening Spotify panel: ${error.message}`, "error");
    }
  } else {
    context.log("❌ Spotify player not available", "error");
    context.log("💡 Make sure the app has loaded completely", "warning");
  }
}

async function connectSpotify(context: CommandContext): Promise<void> {
  context.log("🎵 Connecting to Spotify...", "info");

  // Use the actual Spotify authenticate function from context
  if (context.media?.spotify?.authenticate) {
    try {
      await context.media.spotify.authenticate();
      context.log("✅ Spotify authentication started", "success");
      context.log("💡 Follow the prompts in your browser", "info");
    } catch (error: any) {
      // Check if it's a missing client_id error
      if (
        error.message.includes("client_id") ||
        error.message.includes("CLIENT_ID")
      ) {
        context.log("❌ Spotify Client ID not configured", "error");
        context.log("", "output");
        context.log("🔧 SETUP REQUIRED:", "warning");
        context.log("", "output");
        context.log("📝 Step 1: Get Spotify Credentials", "info");
        context.log(
          "  1. Go to https://developer.spotify.com/dashboard",
          "output"
        );
        context.log('  2. Create a new app (name: "Omega Terminal")', "output");
        context.log("  3. Copy your Client ID", "output");
        context.log("", "output");
        context.log("📝 Step 2: Configure Environment", "info");
        context.log(
          "  1. Create file: omega-terminal-nextjs/.env.local",
          "output"
        );
        context.log("  2. Add this line:", "output");
        context.log(
          "     NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here",
          "success"
        );
        context.log("", "output");
        context.log("📝 Step 3: Add Redirect URI in Spotify Dashboard", "info");
        const redirectUri =
          typeof window !== "undefined"
            ? `${window.location.origin}/spotify-callback.html`
            : "http://localhost:3000/spotify-callback.html";
        context.log(
          `  Add this to your Spotify app's redirect URIs:`,
          "output"
        );
        context.log(`  ${redirectUri}`, "success");
        context.log("", "output");
        context.log("📝 Step 4: Restart the App", "info");
        context.log("  Stop the dev server and run: npm run dev", "output");
        context.log("", "output");
        context.log(
          "⚠️  Note: Spotify Premium account required for playback",
          "warning"
        );
      } else {
        context.log(`❌ Error authenticating: ${error.message}`, "error");
      }
    }
  } else {
    context.log("❌ Spotify authentication not available", "error");
    context.log("💡 Spotify integration requires API credentials", "warning");
  }
}

function disconnectSpotify(context: CommandContext): void {
  // Use the actual Spotify logout function from context
  if (context.media?.spotify?.logout) {
    try {
      context.media.spotify.logout();
      context.log("✅ Disconnected from Spotify", "success");
    } catch (error: any) {
      context.log(`❌ Error disconnecting: ${error.message}`, "error");
    }
  } else {
    // Fallback to clearing localStorage
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("spotify-auth-token");
    }
    context.log("✅ Disconnected from Spotify", "success");
  }
}

function closeSpotifyPlayer(context: CommandContext): void {
  // Use the actual Spotify closePanel function from context
  if (context.media?.spotify?.closePanel) {
    try {
      context.media.spotify.closePanel();
      context.log("✅ Spotify player closed", "success");
    } catch (error: any) {
      context.log(`❌ Error closing Spotify panel: ${error.message}`, "error");
    }
  } else {
    context.log("✅ Spotify player closed", "success");
  }
}

function togglePlayback(context: CommandContext): void {
  // Use the actual Spotify togglePlayPause function from context
  if (context.media?.spotify?.togglePlayPause) {
    try {
      context.media.spotify.togglePlayPause();
      context.log("▶️  Playback toggled", "success");
    } catch (error: any) {
      context.log(`❌ Error toggling playback: ${error.message}`, "error");
    }
  } else {
    context.log("▶️  Playback control not available", "warning");
    context.log("💡 Connect to Spotify first: spotify connect", "info");
  }
}

function nextTrack(context: CommandContext): void {
  // Use the actual Spotify skipNext function from context
  if (context.media?.spotify?.skipNext) {
    try {
      context.media.spotify.skipNext();
      context.log("⏭️  Next track", "success");
    } catch (error: any) {
      context.log(`❌ Error skipping track: ${error.message}`, "error");
    }
  } else {
    context.log("⏭️  Track control not available", "warning");
    context.log("💡 Connect to Spotify first: spotify connect", "info");
  }
}

function previousTrack(context: CommandContext): void {
  // Use the actual Spotify skipPrevious function from context
  if (context.media?.spotify?.skipPrevious) {
    try {
      context.media.spotify.skipPrevious();
      context.log("⏮️  Previous track", "success");
    } catch (error: any) {
      context.log(
        `❌ Error going to previous track: ${error.message}`,
        "error"
      );
    }
  } else {
    context.log("⏮️  Track control not available", "warning");
    context.log("💡 Connect to Spotify first: spotify connect", "info");
  }
}

async function searchMusic(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const query = args.slice(2).join(" ");
  if (!query) {
    context.log("❌ Usage: spotify search <query>", "error");
    context.log("💡 Example: spotify search lofi hip hop", "info");
    return;
  }

  context.log(`🔍 Searching for: ${query}`, "info");

  // Use the actual Spotify searchTracks function from context
  if (context.media?.spotify?.searchTracks) {
    try {
      // Open panel first
      if (context.media.spotify.openPanel) {
        context.media.spotify.openPanel();
      }
      // Search after a brief delay to let panel open
      setTimeout(async () => {
        try {
          await context.media?.spotify?.searchTracks(query);
          context.log(
            `✅ Search results displayed in Spotify panel`,
            "success"
          );
        } catch (error: any) {
          context.log(`❌ Search failed: ${error.message}`, "error");
        }
      }, 500);
    } catch (error: any) {
      context.log(`❌ Error searching: ${error.message}`, "error");
    }
  } else {
    context.log("💡 Music search not available", "warning");
    context.log("💡 Connect to Spotify first: spotify connect", "info");
  }
}

function showSpotifyHelp(context: CommandContext): void {
  context.log("🎵 Spotify Player Commands", "info");
  context.log("", "info");
  context.log("spotify [open]         - Open Spotify player", "output");
  context.log("spotify connect        - Connect to Spotify", "output");
  context.log("spotify disconnect     - Disconnect", "output");
  context.log("spotify play           - Toggle play/pause", "output");
  context.log("spotify next           - Next track", "output");
  context.log("spotify prev           - Previous track", "output");
  context.log("spotify search <query> - Search music", "output");
  context.log("spotify close          - Close player", "output");
  context.log("", "info");
  context.log("📝 Setup Instructions:", "warning");
  context.log("1. Go to https://developer.spotify.com/dashboard", "output");
  context.log('2. Create a new app (name: "Omega Terminal")', "output");
  context.log("3. Add redirect URI to your app settings", "output");
  context.log("4. Configure environment variables", "output");
  context.log("", "info");
  context.log("🎧 Listen to music while coding!", "success");
}

function setupSpotifyHandlers(context: CommandContext): void {
  // No longer needed - we use context methods directly
  // This function is kept for backwards compatibility but does nothing
}

export const spotifyCommands: Command[] = [spotifyCommand];
