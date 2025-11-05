// Map storage utilities for saving/loading custom maps

const STORAGE_KEY = 'pgt-battle-tanks-maps';
const SELECTED_MAP_KEY = 'pgt-battle-tanks-selected-map';

export function saveMap(mapData) {
  try {
    const maps = getSavedMaps();
    const existingIndex = maps.findIndex(m => m.name === mapData.name);
    
    if (existingIndex >= 0) {
      maps[existingIndex] = mapData;
    } else {
      maps.push(mapData);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
    return true;
  } catch (e) {
    console.error('Failed to save map:', e);
    return false;
  }
}

export function getSavedMaps() {
  try {
    const mapsJson = localStorage.getItem(STORAGE_KEY);
    return mapsJson ? JSON.parse(mapsJson) : [];
  } catch (e) {
    console.error('Failed to load maps:', e);
    return [];
  }
}

export function getMapByName(name) {
  const maps = getSavedMaps();
  return maps.find(m => m.name === name);
}

export function deleteMap(name) {
  try {
    const maps = getSavedMaps();
    const filtered = maps.filter(m => m.name !== name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // If deleted map was selected, clear selection
    const selected = getSelectedMapName();
    if (selected === name) {
      clearSelectedMap();
    }
    
    return true;
  } catch (e) {
    console.error('Failed to delete map:', e);
    return false;
  }
}

export function setSelectedMapName(mapName) {
  if (mapName) {
    localStorage.setItem(SELECTED_MAP_KEY, mapName);
  } else {
    localStorage.removeItem(SELECTED_MAP_KEY);
  }
}

export function getSelectedMapName() {
  return localStorage.getItem(SELECTED_MAP_KEY);
}

export function clearSelectedMap() {
  localStorage.removeItem(SELECTED_MAP_KEY);
}

export function getSelectedMap() {
  const mapName = getSelectedMapName();
  if (!mapName) return null;
  return getMapByName(mapName);
}



