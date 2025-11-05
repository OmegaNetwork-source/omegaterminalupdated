import { useState, useEffect } from 'react';
import './AssetSettings.css';

/**
 * Asset Settings Component
 * Allows players to configure game visuals
 */
export function AssetSettings({ onClose }) {
  const [terrainType, setTerrainType] = useState('random');
  const [skyType, setSkyType] = useState('random');

  useEffect(() => {
    // Load current asset config
    import('../../engine/assets/AssetManager.js').then(module => {
      if (module && module.getAssetConfig) {
        const config = module.getAssetConfig();
        setTerrainType(config.terrain?.type || 'random');
        setSkyType(config.sky?.type || 'random');
      }
    }).catch(() => {});
  }, []);

  const handleApply = async () => {
    try {
      const assetModule = await import('../../engine/assets/AssetManager.js');
      if (assetModule && assetModule.setAssetConfig) {
        assetModule.setAssetConfig({
          terrain: { type: terrainType, style: 'enhanced' },
          sky: { type: skyType, style: 'enhanced' }
        });
      }
      onClose?.();
    } catch (e) {
      console.error('Failed to apply asset settings:', e);
      onClose?.();
    }
  };

  return (
    <div className="asset-settings-overlay">
      <div className="asset-settings-content">
        <h2 className="asset-settings-title">ENHANCE GAME ASSETS</h2>
        
        <div className="asset-section">
          <label className="asset-label">TERRAIN TYPE</label>
          <select 
            value={terrainType} 
            onChange={(e) => setTerrainType(e.target.value)}
            className="asset-select"
          >
            <option value="random">Random</option>
            <option value="mountain">Mountain</option>
            <option value="sand">Sand/Desert</option>
            <option value="volcano">Volcano</option>
            <option value="wasteland">Wasteland</option>
            <option value="city">City Ruins</option>
            <option value="forest">Forest</option>
          </select>
        </div>

        <div className="asset-section">
          <label className="asset-label">SKY TYPE</label>
          <select 
            value={skyType} 
            onChange={(e) => setSkyType(e.target.value)}
            className="asset-select"
          >
            <option value="random">Random</option>
            <option value="default">Default</option>
            <option value="sunset">Sunset</option>
            <option value="night">Night</option>
            <option value="storm">Storm</option>
            <option value="desert">Desert</option>
            <option value="space">Space</option>
          </select>
        </div>

        <div className="asset-actions">
          <button onClick={handleApply} className="asset-button apply">
            APPLY
          </button>
          <button onClick={onClose} className="asset-button cancel">
            CANCEL
          </button>
        </div>

        <div className="asset-info">
          <p>Changes will apply to the next game level.</p>
          <p>Enhanced assets include improved visuals and more variety!</p>
        </div>
      </div>
    </div>
  );
}

