/**
 * useYouTube Hook
 *
 * Custom React hook for accessing YouTube player context.
 * Provides access to player state and video playback controls.
 *
 * @returns YouTube context value with:
 *   - playerState: Current player state (video, playing, playlist, etc.)
 *   - searchResults: Array of videos from search
 *   - initializeAPI: Function to load YouTube IFrame API
 *   - createPlayer: Function to create player instance
 *   - searchVideos: Function to search YouTube
 *   - getDefaultChannelVideos: Function to load Bloomberg Technology videos
 *   - playVideo: Function to play a specific video
 *   - togglePlayPause: Function to toggle playback
 *   - next: Function to play next video in playlist
 *   - previous: Function to play previous video in playlist
 *   - toggleMute: Function to toggle mute
 *   - openPanel: Function to show YouTube panel
 *   - closePanel: Function to hide YouTube panel
 *
 * @throws Error if used outside YouTubeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { playerState, searchVideos, playVideo } = useYouTube();
 *
 *   const handleSearch = async () => {
 *     await searchVideos('lofi hip hop');
 *   };
 *
 *   return (
 *     <div>
 *       {playerState.currentVideoId && (
 *         <p>Playing: {playerState.currentVideoId}</p>
 *       )}
 *       <button onClick={handleSearch}>Search Videos</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * Note: YouTube API key is optional for basic playback but required for search functionality.
 */

export { useYouTube } from "@/providers/YouTubeProvider";
