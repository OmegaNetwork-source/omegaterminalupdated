# Game Asset Enhancement System

## Overview

Your game now has a complete **modular asset enhancement system** that allows you to easily upgrade and customize:

- **Terrain Types** - Multiple terrain generators (mountain, sand, volcano, wasteland, city, forest)
- **Sky Types** - Enhanced sky generators (sunset, night, storm, desert, space)
- **Tank Sprites** - Enhanced tank visuals with animations
- **Future Extensions** - Easy to add images, textures, and custom assets

## Quick Start

### Using the Asset Settings UI

1. **In-Game Menu**: Click the **"ENHANCE ASSETS"** button when the menu is visible
2. **Select Assets**: Choose terrain and sky types from dropdowns
3. **Apply**: Settings apply to the next game level

### Configuring Assets Programmatically

```javascript
import { setAssetConfig } from './engine/assets/AssetManager.js';

// Set specific terrain and sky
setAssetConfig({
  terrain: { type: 'volcano', style: 'enhanced' },
  sky: { type: 'sunset', style: 'enhanced' }
});
```

## Available Asset Types

### Terrain Types

| Type | Description |
|------|-------------|
| **mountain** | Mountainous terrain with peaks and valleys |
| **sand** | Desert terrain with rolling dunes |
| **volcano** | Jagged volcanic terrain with dark rocks |
| **wasteland** | Post-apocalyptic wasteland with debris |
| **city** | Urban ruins with destroyed buildings |
| **forest** | Organic forest hills with grass |
| **random** | Randomly selects a terrain type each level |

### Sky Types

| Type | Description |
|------|-------------|
| **default** | Standard gradient sky (original style) |
| **sunset** | Warm sunset with orange/purple gradient and sun |
| **night** | Deep space sky with stars |
| **storm** | Dark stormy sky with clouds |
| **desert** | Bright hazy desert sky |
| **space** | Deep space with nebula colors and stars |
| **random** | Randomly selects a sky type each level |

## File Structure

```
src/engine/assets/
├── AssetManager.js          # Central configuration and registry
├── TerrainGenerators.js     # All terrain generation functions
├── SkyGenerators.js         # All sky generation functions
├── index.js                 # Asset system initialization
└── README.md                # Detailed documentation
```

## How It Works

1. **Lazy Loading**: Asset system loads in the background
2. **Fallback**: If enhanced assets aren't available, uses original generators
3. **Modular**: Each generator is independent and easy to modify
4. **Extensible**: Add new generators by registering them

## Customization Guide

### Adding a New Terrain Type

1. Create a function in `TerrainGenerators.js`:
```javascript
export function generateMyTerrain(ctx) {
  ctx.color = '#HEXCOLOR';
  const {width, height} = ctx.canvas;
  // Your terrain generation code
}
```

2. Add to `TERRAIN_GENERATORS` object:
```javascript
export const TERRAIN_GENERATORS = {
  // ... existing
  myTerrain: generateMyTerrain
};
```

3. It will automatically be registered and available!

### Adding a New Sky Type

Follow the same pattern in `SkyGenerators.js`

### Enhancing Tank Sprites

Modify `tankSprites.js`:
- Update `createTankSprite()` for better visuals
- Add new animation frames
- Enhance details and colors

### Using Image Assets

To use image files instead of procedural generation:

```javascript
import { loadImage } from '../gfx.js';

export async function generateImageTerrain(ctx) {
  const image = await loadImage('/assets/terrain/mountain.png');
  ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
}
```

## Configuration

Default configuration (in `AssetManager.js`):
```javascript
ASSET_CONFIG = {
  terrain: {
    type: 'random',  // Change to specific type
    style: 'enhanced'
  },
  sky: {
    type: 'random',  // Change to specific type
    style: 'enhanced'
  }
}
```

## Next Steps for Enhancement

1. **Image Assets**: Add PNG/JPG images for backgrounds and sprites
2. **Particle Effects**: Enhance explosion and trail effects
3. **Animations**: Add animated backgrounds and effects
4. **Themes**: Create theme packs (sci-fi, fantasy, modern)
5. **Sound Assets**: Manage sound effects and music

The system is ready for all of these enhancements!



