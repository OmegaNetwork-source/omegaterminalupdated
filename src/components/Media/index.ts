/**
 * Media Components Barrel Export
 *
 * Export point for all media player components.
 *
 * Components:
 * - SpotifyPanel: Spotify music player with OAuth authentication
 * - YouTubePanel: YouTube video player with search and playlist
 * - NewsReaderPanel: Crypto news reader with sentiment analysis
 * - MediaPanelContainer: Container that manages panel visibility
 *
 * Usage:
 *   import { MediaPanelContainer, MediaPanelContainerProps } from '@/components/Media';
 *
 *   // In your app layout or page dynamically load heavy panels:
 *   <MediaPanelContainer
 *     SpotifyPanel={SpotifyPanel}
 *     YouTubePanel={YouTubePanel}
 *     NewsReaderPanel={NewsReaderPanel}
 *   />
 */

export { SpotifyPanel } from "./SpotifyPanel";
export { YouTubePanel } from "./YouTubePanel";
export { NewsReaderPanel } from "./NewsReaderPanel";
export { MediaPanelContainer } from "./MediaPanelContainer";
export type { MediaPanelContainerProps } from "./MediaPanelContainer";
