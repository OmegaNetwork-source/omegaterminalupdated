/**
 * Spotify Integration Commands
 * Control Spotify playback, search music, and manage player
 * Based on Spotify Web Playback SDK example
 */

import type { Command, CommandContext } from "@/types/commands";

/**
 * Spotify command - Music player controls
 */
export const spotifyCommand: Command = {
  name: "spotify",
  description: "Spotify music player integration",
  usage: "spotify <open|connect|disconnect|play|pause|next|prev|search|playlists|close|help>",
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
      case "playlists":
        await listPlaylists(context);
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

  if (context.media?.spotify?.authenticate) {
    try {
      await context.media.spotify.authenticate();
      context.log("✅ Spotify authentication started", "success");
      context.log("💡 Follow the prompts in your browser", "info");
    } catch (error: any) {
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
            : "http://127.0.0.1:3000/spotify-callback.html";
        context.log(
          `  Add this EXACT URL to your Spotify app's redirect URIs:`,
          "output"
        );
        context.log(`  ${redirectUri}`, "success");
        context.log("", "output");
        context.log("  ⚠️  Important: Use 127.0.0.1 (NOT localhost) for local dev", "warning");
        context.log("  ⚠️  Add both http://127.0.0.1:PORT/spotify-callback.html", "warning");
        context.log("  ⚠️  The redirect URI must match EXACTLY (including port)", "warning");
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
  if (context.media?.spotify?.logout) {
    try {
      context.media.spotify.logout();
      context.log("✅ Disconnected from Spotify", "success");
    } catch (error: any) {
      context.log(`❌ Error disconnecting: ${error.message}`, "error");
    }
  } else {
    context.log("✅ Disconnected from Spotify", "success");
  }
}

function closeSpotifyPlayer(context: CommandContext): void {
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

  if (context.media?.spotify?.searchTracks) {
    try {
      if (context.media.spotify.openPanel) {
        context.media.spotify.openPanel();
      }
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

async function listPlaylists(context: CommandContext): Promise<void> {
  context.log("📋 Loading playlists...", "info");

  if (context.media?.spotify?.getUserPlaylists) {
    try {
      if (context.media.spotify.openPanel) {
        context.media.spotify.openPanel();
      }
      setTimeout(async () => {
        try {
          await context.media?.spotify?.getUserPlaylists();
          context.log(
            `✅ Playlists loaded in Spotify panel`,
            "success"
          );
        } catch (error: any) {
          context.log(`❌ Failed to load playlists: ${error.message}`, "error");
        }
      }, 500);
    } catch (error: any) {
      context.log(`❌ Error loading playlists: ${error.message}`, "error");
    }
  } else {
    context.log("💡 Playlists not available", "warning");
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
  context.log("spotify playlists      - Load your playlists", "output");
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

export const spotifyCommands: Command[] = [spotifyCommand];

