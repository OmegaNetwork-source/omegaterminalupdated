# Sound Effects Library

Audio files for Omega Terminal user interactions.

## File List

| Filename         | Sound ID         | Purpose             | Duration    | Volume | Preload | Usage Context                                       |
| ---------------- | ---------------- | ------------------- | ----------- | ------ | ------- | --------------------------------------------------- |
| wookie.mp4.mp3   | interface-select | Interface Selection | 2000ms      | 0.8    | Yes     | Welcome screen mode selection, generic button click |
| wookie.mp4.mp3   | command-execute  | Command Execution   | null (full) | 0.7    | No      | Terminal command execution                          |
| robot-gmb.mp3    | wallet-connect   | Wallet Connection   | 2000ms      | 0.8    | Yes     | Successful MetaMask/session wallet connection       |
| i-am-a-robot.mp3 | ai-toggle        | AI Toggle           | null (full) | 1.0    | Yes     | AI provider activation/toggle                       |
| so-you-rich.mp3  | balance-wealth   | Balance/Wealth      | null (full) | 0.8    | Yes     | Balance check command                               |
| so-you-rich.mp3  | chart-viewer     | Chart Viewer        | null (full) | 0.8    | Yes     | Chart viewer activation                             |
| oh-fucking.mp3   | basic-view       | Basic View          | null (full) | 0.8    | No      | Switching to basic terminal mode                    |
| you-cocky.mp3    | clear-terminal   | Clear Terminal      | null (full) | 0.8    | No      | Clear terminal command                              |
| grandmas-boy.mp3 | modern-ui-theme  | Modern UI Theme     | null (full) | 0.8    | Yes     | Modern theme selection                              |
| grandmas-boy.mp3 | help-command     | Help Command        | null (full) | 0.8    | Yes     | Help command execution                              |

**Note:** Duration `null` means the sound plays fully until completion. Preload `No` means the file is loaded on-demand rather than at startup.

## Usage

These sounds are loaded and played by the SoundEffectsProvider. Most are preloaded on app startup; some larger files are loaded on-demand. Access them at runtime via the `useSoundEffects` hook.

## Technical Details

- Audio format: MP3 for broad browser compatibility
- Preloading: Most sounds preload; some are lazy-loaded based on `preload` flag
- Web Audio API: Uses AudioContext with HTMLAudioElement for playback
- Autoplay: Audio context resumes on first user interaction if suspended

## File Verification

All registered sound files in `SoundEffectsProvider.tsx` have corresponding MP3 files in this directory:

✅ **Verified Files:**

- `wookie.mp4.mp3` (29 KB) - MPEG ADTS, layer III, v1, 80 kbps, 44.1 kHz, Monaural
- `robot-gmb.mp3` (63 KB) - MPEG ADTS, layer III, v1, 128 kbps, 44.1 kHz, Monaural
- `i-am-a-robot.mp3` (68 KB) - MPEG ADTS, layer III, v1, 128 kbps, 44.1 kHz, Monaural
- `so-you-rich.mp3` (29 KB) - MPEG ADTS, layer III, v1, 128 kbps, 44.1 kHz, Monaural
- `oh-fucking.mp3` (111 KB) - MPEG ADTS, layer III, v1, 128 kbps, 44.1 kHz, Monaural
- `you-cocky.mp3` (59 KB) - MPEG ADTS, layer III, v1, 128 kbps, 44.1 kHz, Monaural
- `grandmas-boy.mp3` (71 KB) - MPEG ADTS, layer III, v1, 128 kbps, 44.1 kHz, Stereo

All files are valid MP3 format and should be accessible at `/sounds/<filename>` via Next.js static file serving.

## Licensing

⚠️ **Important:** These audio files may contain third-party copyrighted content. Verify licensing/attribution details for any third-party audio used. Replace with royalty-free alternatives for production deployments if needed.

**Note:** Files in this directory are served at `/sounds/<filename>` by Next.js. Ensure filenames in code (`SoundEffectsProvider.tsx`) exactly match the filenames in this directory (case-sensitive on some hosts).
