/**
 * useSpotify Hook
 *
 * Custom React hook for accessing Spotify player context.
 * Provides access to authentication state, player state, and playback controls.
 *
 * @returns Spotify context value with:
 *   - authState: Authentication status and token information
 *   - playerState: Current playback state (track, playing, position, etc.)
 *   - searchResults: Array of tracks from search
 *   - playlists: Array of user playlists
 *   - authenticate: Function to initiate OAuth flow
 *   - logout: Function to disconnect and clear session
 *   - searchTracks: Function to search Spotify catalog
 *   - getUserPlaylists: Function to fetch user playlists
 *   - playTrack: Function to play a specific track
 *   - playPlaylist: Function to play a playlist
 *   - togglePlayPause: Function to toggle playback
 *   - skipNext: Function to skip to next track
 *   - skipPrevious: Function to skip to previous track
 *   - setVolume: Function to set volume (0-100)
 *   - transferPlayback: Function to transfer playback to Omega Terminal device
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
 *   if (!authState.isAuthenticated) {
 *     return <button onClick={authenticate}>Connect Spotify</button>;
 *   }
 *
 *   return (
 *     <div>
 *       {playerState.currentTrack && (
 *         <p>Now Playing: {playerState.currentTrack.name}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * Note: Spotify Premium account is required for Web Playback SDK functionality.
 */

export { useSpotify } from "@/providers/SpotifyProvider";
