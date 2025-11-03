/**
 * Sound effects system type definitions.
 * These types model sound registration, playback options, provider state, and context API.
 */

export type SoundName =
  | "interface-select"
  | "button-click"
  | "command-execute"
  | "system-notify"
  | "error"
  | "success"
  | "wallet-connect"
  | "ai-toggle"
  | "balance-wealth"
  | "chart-viewer"
  | "basic-view"
  | "clear-terminal"
  | "modern-ui-theme"
  | "help-command";

/**
 * Configuration for a single sound effect.
 * - src: URL path to the audio file served by Next.js public directory
 * - volume: base volume for this sound (0.0 - 1.0)
 * - duration: optional auto-stop timeout in milliseconds; null allows natural end
 * - description: human-readable purpose of the sound
 * - preload: whether to load the audio element eagerly on registration
 * - loop: whether playback should loop
 * - audioElement: cached/preloaded HTMLAudioElement instance (if any)
 */
export interface SoundConfig {
  src: string;
  volume?: number;
  duration?: number | null;
  description?: string;
  preload?: boolean;
  loop?: boolean;
  audioElement?: HTMLAudioElement | undefined;
}

/**
 * Options to customize playback at call time.
 * - volume: multiplier applied to the sound's base volume
 * - loop: overrides the config loop setting for this playback
 */
export interface SoundPlayOptions {
  volume?: number;
  loop?: boolean;
}

/**
 * Lightweight information about a registered sound, suitable for UI.
 */
export interface SoundInfo {
  name: string;
  description: string;
  duration: number | null;
  volume: number;
  isPlaying: boolean;
}

/**
 * Global state of the sound effects system.
 * - isEnabled: master on/off switch
 * - volume: master volume applied to all sounds (0.0 - 1.0)
 * - currentlyPlaying: set of sound names currently active
 * - audioContextState: Web Audio API context state if available
 */
export interface SoundEffectsState {
  isEnabled: boolean;
  volume: number;
  currentlyPlaying: Set<string>;
  audioContextState: "suspended" | "running" | "closed" | null;
}

/**
 * Context value exposed by the SoundEffectsProvider.
 * Includes state, generic controls, and convenience methods for key UX events.
 */
export interface SoundEffectsContextValue {
  state: SoundEffectsState;
  playSound: (name: SoundName, options?: SoundPlayOptions) => Promise<void>;
  stopSound: (name: string) => void;
  stopAllSounds: () => void;
  setVolume: (volume: number) => void;
  setEnabled: (enabled: boolean) => void;
  getRegisteredSounds: () => SoundInfo[];
  isPlaying: (name: string) => boolean;

  // Convenience methods for common interactions
  playWalletConnectSound: (options?: SoundPlayOptions) => Promise<void>;
  playAIToggleSound: (options?: SoundPlayOptions) => Promise<void>;
  playBalanceWealthSound: (options?: SoundPlayOptions) => Promise<void>;
  playChartViewerSound: (options?: SoundPlayOptions) => Promise<void>;
  playBasicViewSound: (options?: SoundPlayOptions) => Promise<void>;
  playClearTerminalSound: (options?: SoundPlayOptions) => Promise<void>;
  playModernUIThemeSound: (options?: SoundPlayOptions) => Promise<void>;
  playHelpCommandSound: (options?: SoundPlayOptions) => Promise<void>;
}
