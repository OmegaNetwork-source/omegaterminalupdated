/**
 * useSpotify Hook
 *
 * Custom React hook for accessing Spotify player context.
 * Provides access to authentication state, player state, and playback controls.
 *
 * @returns Spotify context value with:
 *   - authState: Current authentication state
 *   - playerState: Current player state (track, playing, position, etc.)
 *   - searchResults: Array of tracks from search
 *   - playlists: Array of user playlists
 *   - error: Current error message (if any)
 *   - clearError: Function to clear error
 *   - authenticate: Function to initiate OAuth authentication
 *   - logout: Function to disconnect and clear session
 *   - searchTracks: Function to search Spotify catalog
 *   - getUserPlaylists: Function to fetch user playlists
 *   - playTrack: Function to play a specific track by URI
 *   - playPlaylist: Function to play a playlist by URI
 *   - togglePlayPause: Function to toggle playback
 *   - skipNext: Function to skip to next track
 *   - skipPrevious: Function to skip to previous track
 *   - setVolume: Function to set volume (0-100)
 *   - transferPlayback: Function to transfer playback to this device
 *   - openPanel: Function to show Spotify panel
 *   - closePanel: Function to hide Spotify panel
 *
 * @throws Error if used outside SpotifyProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { authState, playerState, authenticate, playTrack } = useSpotify();
 *
 *   const handleAuth = async () => {
 *     await authenticate();
 *   };
 *
 *   return (
 *     <div>
 *       {!authState.isAuthenticated ? (
 *         <button onClick={handleAuth}>Connect to Spotify</button>
 *       ) : (
 *         <p>Connected as {playerState.currentTrack?.name}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * Note: Spotify Premium account required for Web Playback SDK.
 */

export { useSpotify } from "@/providers/SpotifyProvider";

