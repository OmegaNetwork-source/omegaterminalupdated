import { useState, useEffect, useCallback } from 'react';
import { getSavedMaps, setSelectedMapName, getSelectedMapName, clearSelectedMap } from '../../utils/mapStorage';
import './MapSelector.css';

export function MapSelector({ onClose }) {
  const [maps, setMaps] = useState([]);
  const [selectedMapName, setSelectedMapNameState] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadMaps();
    const current = getSelectedMapName();
    setSelectedMapNameState(current);
  }, []);

  const loadMaps = useCallback(() => {
    const savedMaps = getSavedMaps();
    setMaps(savedMaps);
  }, []);

  const handleSelectMap = useCallback((mapName) => {
    if (mapName) {
      setSelectedMapName(mapName);
      setSelectedMapNameState(mapName);
    } else {
      clearSelectedMap();
      setSelectedMapNameState(null);
    }
  }, []);

  const handleDeleteMap = useCallback((mapName) => {
    if (!window.confirm(`Delete map "${mapName}"?`)) return;

    try {
      const mapsJson = localStorage.getItem('pgt-battle-tanks-maps');
      if (mapsJson) {
        const allMaps = JSON.parse(mapsJson);
        const filtered = allMaps.filter(m => m.name !== mapName);
        localStorage.setItem('pgt-battle-tanks-maps', JSON.stringify(filtered));
        
        if (selectedMapNameState === mapName) {
          clearSelectedMap();
          setSelectedMapNameState(null);
        }
        
        loadMaps();
      }
    } catch (e) {
      console.error('Failed to delete map:', e);
      alert('Failed to delete map.');
    }
  }, [selectedMapNameState, loadMaps]);

  const filteredMaps = filter
    ? maps.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()))
    : maps;

  return (
    <div className="map-selector-overlay">
      <div className="map-selector-container">
        <div className="map-selector-header">
          <h2>SELECT MAP</h2>
          <button className="map-selector-close" onClick={onClose}>✕</button>
        </div>

        <div className="map-selector-content">
          <div className="map-selector-options">
            <label>
              <input
                type="radio"
                checked={selectedMapNameState === null}
                onChange={() => handleSelectMap(null)}
              />
              <span>Random Generated Maps (Default)</span>
            </label>
            <p className="map-selector-description">
              Use procedurally generated terrain for each game
            </p>
          </div>

          <div className="map-selector-divider" />

          <div className="map-selector-custom">
            <h3>Custom Maps</h3>
            <input
              type="text"
              placeholder="Search maps..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="map-selector-search"
            />
            <div className="maps-list">
              {filteredMaps.length === 0 ? (
                <div className="no-maps">
                  {filter ? 'No maps match your search.' : 'No custom maps saved yet. Use the Map Editor to create one!'}
                </div>
              ) : (
                filteredMaps.map((map, idx) => (
                  <div
                    key={idx}
                    className={`map-item ${selectedMapNameState === map.name ? 'selected' : ''}`}
                  >
                    <label className="map-item-label">
                      <input
                        type="radio"
                        checked={selectedMapNameState === map.name}
                        onChange={() => handleSelectMap(map.name)}
                      />
                      <span className="map-item-name">{map.name}</span>
                      <span className="map-item-date">
                        {new Date(map.createdAt).toLocaleDateString()}
                      </span>
                    </label>
                    <button
                      className="map-item-delete"
                      onClick={() => handleDeleteMap(map.name)}
                      title="Delete map"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="map-selector-footer">
          <div className="map-selector-info">
            {selectedMapNameState ? (
              <>Selected: <strong>{selectedMapNameState}</strong></>
            ) : (
              <>Using: <strong>Random Maps</strong></>
            )}
          </div>
          <button className="map-selector-apply" onClick={onClose}>
            APPLY & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}



