# Game Asset Enhancement System

This directory contains the enhanced asset system for PGT Battle Tanks, allowing easy customization and upgrading of game visuals.

## Structure

- **AssetManager.js** - Central asset configuration and registry
- **TerrainGenerators.js** - Enhanced terrain types (mountain, sand, volcano, wasteland, city, forest)
- **SkyGenerators.js** - Enhanced sky types (sunset, night, storm, desert, space)
- **index.js** - Asset system initialization

## Usage

### Configuring Assets

```javascript
import { setAssetConfig, getAssetConfig } from './assets/AssetManager.js';

// Set terrain type
setAssetConfig({
  terrain: {
    type: 'volcano', // 'random', 'mountain', 'sand', 'volcano', 'wasteland', 'city', 'forest'
    style: 'enhanced'
  },
  sky: {
    type: 'sunset', // 'random', 'default', 'sunset', 'night', 'storm', 'desert', 'space'
    style: 'enhanced'
  }
});
```

### Available Terrain Types

- **mountain** - Mountainous terrain with peaks and valleys
- **sand** - Desert terrain with dunes
- **volcano** - Jagged volcanic terrain
- **wasteland** - Post-apocalyptic wasteland
- **city** - Urban ruins with buildings
- **forest** - Organic forest hills

### Available Sky Types

- **default** - Standard gradient sky (original)
- **sunset** - Warm sunset colors with sun
- **night** - Deep space with stars
- **storm** - Dark stormy sky with clouds
- **desert** - Bright hazy desert sky
- **space** - Deep space with nebula

## Adding New Assets

### Adding a New Terrain Type

1. Create a generator function in `TerrainGenerators.js`:

```javascript
export function generateMyTerrain(ctx) {
  ctx.color = '#HEXCOLOR';
  // ... terrain generation code
}
```

2. Add it to `TERRAIN_GENERATORS`:

```javascript
export const TERRAIN_GENERATORS = {
  // ... existing generators
  myTerrain: generateMyTerrain
};
```

3. Register it in `index.js` (automatic via `TERRAIN_GENERATORS`)

### Adding a New Sky Type

Follow the same pattern in `SkyGenerators.js`

## Tank Enhancements

Tank sprites are currently in `tankSprites.js`. To enhance:
- Modify `createTankSprite()` for better visuals
- Add new animation states
- Update `createTankSprites()` for enhanced animations

## Future Enhancements

- Image-based asset loading
- Custom texture support
- Particle effect customization
- Sound asset management
- Theme packs



