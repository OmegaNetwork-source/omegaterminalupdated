# Omega Terminal Sound Effects System

## Overview

The Omega Terminal Sound Effects System provides audio feedback for user interactions throughout the terminal interface. The system supports MP4 audio files and automatically plays appropriate sounds for different user actions.

## Features

- **MP4 Audio Support**: Uses MP4 files for high-quality audio playback
- **Automatic Sound Triggers**: Sounds play automatically for interface interactions
- **Volume Control**: Adjustable volume levels with user preferences
- **Sound Management**: Start/stop control with proper cleanup
- **Mobile Support**: Touch-friendly sound triggers
- **User Preferences**: Settings saved to localStorage

## Sound Effects

### Interface Selection
- **Basic Terminal**: `oh-fucking.mp3` - When user selects Basic Terminal
- **Dashboard**: `wookie.mp4.mp3` - When user selects Dashboard
- **Trigger**: When user selects interface option in welcome screen
- **Volume**: 0.8 (80%)
- **Duration**: Plays to natural end

### Button Clicks
- **Sound**: `button-click.mp4`
- **Trigger**: When user clicks any button or clickable element
- **Volume**: 0.5 (50%)
- **Duration**: 0.5 seconds

### Command Execution
- **Sound**: `command-execute.mp4`
- **Trigger**: When user executes a terminal command
- **Volume**: 0.6 (60%)
- **Duration**: 1 second

### System Notifications
- **Success**: `success.mp4` (0.7 volume, 1.2 seconds)
- **Error**: `error.mp4` (0.6 volume, 0.8 seconds)
- **Warning**: `system-notify.mp4` (0.5 volume, 1.5 seconds)

### Wallet Connection
- **Sound**: `robot-gmb.mp3`
- **Trigger**: When user successfully connects any wallet (NEAR, MetaMask, etc.)
- **Volume**: 0.8 (80%)
- **Duration**: 2 seconds

### AI Toggle
- **Sound**: `i-am-a-robot.mp3`
- **Trigger**: When user toggles AI on (NEAR AI or OpenAI)
- **Volume**: 1.0 (100%)
- **Duration**: Plays to natural end (no auto-cutoff)

## File Structure

```
sounds/
├── wookie.mp4.mp3         # Interface selection sound (Wookie)
├── robot-gmb.mp3          # Wallet connection success sound
├── i-am-a-robot.mp3       # AI toggle activation sound
├── so-you-rich.mp3        # Balance/wealth and chart viewer sound
├── oh-fucking.mp3         # Basic view activation sound
├── you-cocky.mp3          # Clear terminal sound
├── grandmas-boy.mp3       # Modern UI theme selection sound
├── button-click.mp4        # Button click feedback
├── command-execute.mp4     # Command execution sound
├── system-notify.mp4       # System notifications
├── error.mp4              # Error messages
├── success.mp4            # Success messages
└── README.md              # Sound file documentation

js/plugins/
└── omega-sound-effects.js  # Main sound effects system
```

## Integration Points

### 1. Interface Selection
**File**: `js/futuristic/futuristic-welcome-screen-new.js`
**Function**: `selectViewMode()`
**Integration**: Different sounds play based on selection:
- Basic Terminal: `oh-fucking.mp3` (basic view sound)
- Dashboard: `wookie.mp4.mp3` (interface select sound)

### 2. Command Execution
**File**: `js/terminal-core.js`
**Function**: `executeCommand()`
**Integration**: Sound plays before command routing

### 3. Message Types
**File**: `js/futuristic/terminal-theme-bridge.js`
**Function**: `terminal.log()`
**Integration**: Different sounds for error, success, and warning messages

### 4. Global Button Clicks
**File**: `js/plugins/omega-sound-effects.js`
**Function**: `attachGlobalButtonSounds()`
**Integration**: Automatic sound for all button-like elements

### 5. Wallet Connection Success
**Files**: 
- `js/commands/near.js` - NEAR wallet connection
- `js/commands/wallet-commands.js` - Shade Agent wallet
- `js/plugins/multi-network-connector.js` - Multi-network connections
**Function**: `playWalletConnectSound()`
**Integration**: Robot sound plays when any wallet connects successfully

### 6. AI Toggle Activation
**Files**: 
- `js/terminal-core.js` - Core terminal AI provider management
- `terminal.html` - Main terminal AI toggle functionality
- `js/futuristic/futuristic-dashboard-transform.js` - Dashboard AI toggle
**Function**: `playAIToggleSound()`
**Integration**: Robot sound plays when AI is toggled on (NEAR AI or OpenAI)

### 7. Balance/Wealth Check
**Files**: 
- `js/commands/wallet-commands.js` - General wallet balance command
- `js/commands/api.js` - PGT track command
- `js/commands/near.js` - NEAR balance command
- `terminal.html` - FAIR, Rome, and Monad balance commands
**Function**: `playBalanceWealthSound()`
**Integration**: "So you rich" sound plays when balance is checked or portfolio is tracked

### 8. Chart Viewer Opening
**Files**: 
- `js/commands/api.js` - Chart command
- `js/futuristic/futuristic-dashboard-transform.js` - Chart viewer functionality
- `terminal.html` - Chart command implementation
**Function**: `playChartViewerSound()`
**Integration**: "So you rich" sound plays when chart viewer is opened

### 9. Basic View Selection
**Files**: 
- `js/futuristic/futuristic-welcome-screen-new.js` - Interface selection in welcome screen
**Function**: `playBasicViewSound()`
**Integration**: "Oh fucking" sound plays when user selects Basic Terminal interface in welcome screen

### 10. Clear Terminal
**Files**: 
- `js/commands/basic.js` - Clear command implementation
**Function**: `playClearTerminalSound()`
**Integration**: "You cocky" sound plays when user clears the terminal

### 11. Modern UI Theme Selection
**Files**: 
- `js/plugins/apple-ui-plugin.js` - Apple UI theme activation
- `js/themes.js` - Theme system modern UI handling
- `js/futuristic/futuristic-dashboard-transform.js` - Theme cycling functionality
**Function**: `playModernUIThemeSound()`
**Integration**: "Grandma's Boy" sound plays when user selects modern UI theme (modern, apple, modern-ui, modernui)

### 12. Help Command
**Files**: 
- `js/commands/basic.js` - Help command implementation
**Function**: `playHelpCommandSound()`
**Integration**: "Grandma's Boy" sound plays when user calls help command

## Usage

### Basic Usage
The sound effects system is automatically initialized when the terminal loads. No additional setup is required.

### Programmatic Control

```javascript
// Play a specific sound
window.OmegaSoundEffects.playSound('interface-select', { volume: 0.8 });

// Check if sounds are enabled
const enabled = window.OmegaSoundEffects.isSoundEnabled();

// Enable/disable sounds
window.OmegaSoundEffects.setEnabled(true);

// Set volume (0.0 to 1.0)
window.OmegaSoundEffects.setVolume(0.7);

// Stop all sounds
window.OmegaSoundEffects.stopAllSounds();

// Get registered sounds
const sounds = window.OmegaSoundEffects.getRegisteredSounds();
```

### Adding Custom Sounds

```javascript
// Register a new sound
window.OmegaSoundEffects.registerSound('custom-sound', {
    src: 'sounds/custom-sound.mp4',
    volume: 0.7,
    duration: 1000,
    description: 'Custom sound effect'
});

// Play the custom sound
window.OmegaSoundEffects.playSound('custom-sound');
```

### Attaching Sounds to Elements

```javascript
// Attach sound to specific element
window.OmegaSoundEffects.attachSoundToElement('myButton', 'button-click');

// Attach sound to all elements with a class
window.OmegaSoundEffects.attachSoundToClass('clickable', 'button-click');
```

## Configuration

### User Preferences
The system automatically saves user preferences to localStorage:
- `omega-sound-effects-enabled`: Boolean for sound enable/disable
- `omega-sound-effects-volume`: Number for volume level (0.0-1.0)

### Sound File Requirements
- **Format**: MP4 (H.264 video with AAC audio)
- **Duration**: 0.5-2 seconds recommended
- **Volume**: Normalized to prevent clipping
- **Sample Rate**: 44.1kHz or 48kHz
- **Bitrate**: 128kbps or higher

## Testing

### Test Page
Open `test-sound-effects.html` in a browser to test all sound effects functionality.

### Browser Console Testing
```javascript
// Test interface selection sound
window.OmegaSoundEffects.playSound('interface-select');

// Test button click sound
window.OmegaSoundEffects.playSound('button-click');

// Test command execution sound
window.OmegaSoundEffects.playSound('command-execute');

// Test system notification sounds
window.OmegaSoundEffects.playSound('success');
window.OmegaSoundEffects.playSound('error');
window.OmegaSoundEffects.playSound('system-notify');
```

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Full support with touch events

## Performance Considerations

- **Preloading**: Sounds are preloaded for instant playback
- **Memory Management**: Audio elements are properly cleaned up
- **Volume Control**: Efficient volume management without re-encoding
- **Event Handling**: Optimized event listeners with proper cleanup

## Troubleshooting

### Common Issues

1. **No Sound Playing**
   - Check if sound effects are enabled: `window.OmegaSoundEffects.isSoundEnabled()`
   - Verify volume level: `window.OmegaSoundEffects.volume`
   - Check browser audio permissions

2. **Sound Files Not Found**
   - Ensure MP4 files exist in the `sounds/` directory
   - Check file paths are correct
   - Verify file permissions

3. **Audio Context Issues**
   - Modern browsers require user interaction before playing audio
   - The system automatically handles audio context initialization

### Debug Mode
Enable debug logging by opening browser console. The system logs all sound operations for troubleshooting.

## Future Enhancements

- **Sound Themes**: Different sound packs for different themes
- **Custom Sound Upload**: User-uploaded sound effects
- **Sound Scheduling**: Delayed or scheduled sound playback
- **Advanced Audio Effects**: Reverb, echo, and other audio processing
- **Sound Visualization**: Visual feedback for audio playback

## Contributing

When adding new sound effects:

1. Create MP4 file following the specifications
2. Add to `sounds/` directory
3. Register in `loadDefaultSounds()` method
4. Integrate trigger points in appropriate files
5. Test thoroughly across different browsers
6. Update documentation

## License

This sound effects system is part of the Omega Terminal project and follows the same licensing terms.
