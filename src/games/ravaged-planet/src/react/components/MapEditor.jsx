import { useState, useRef, useEffect, useCallback } from 'react';
import { W, H } from '../../engine/constants';
import { drawCircle, drawRect } from '../../engine/gfx';
import { collapseTerrain, cacheImageData } from '../../engine/terrain';
import './MapEditor.css';

const TERRAIN_COLORS = [
  { name: 'Green', color: 'palegreen', border: 'green' },
  { name: 'White', color: 'white', border: 'lightgray' },
  { name: 'Sand', color: 'wheat', border: 'peru' },
  { name: 'Brown', color: 'burlywood', border: 'saddlebrown' },
  { name: 'Gray', color: 'gray', border: 'darkslategray' },
];

const BRUSH_SIZES = [1, 3, 5, 8, 12, 16, 24];

const TOOLS = {
  BRUSH: 'brush',
  ERASER: 'eraser',
  FILL: 'fill',
  LINE: 'line',
  MOUNTAIN: 'mountain',
};

// Helper function to convert color name/hex to RGB
const colorToRgb = (color) => {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.fillStyle = color;
  const computed = tempCtx.fillStyle;
  
  // Handle rgb/rgba format
  if (computed.startsWith('rgb')) {
    const matches = computed.match(/\d+/g);
    return {
      r: parseInt(matches[0]),
      g: parseInt(matches[1]),
      b: parseInt(matches[2]),
      a: matches[3] ? parseInt(matches[3]) : 255
    };
  }
  
  // Handle hex format
  if (computed.startsWith('#')) {
    const hex = computed.substring(1);
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
      a: 255
    };
  }
  
  // For named colors, use a temporary canvas to get the actual pixel
  tempCanvas.width = 1;
  tempCanvas.height = 1;
  tempCtx.fillStyle = color;
  tempCtx.fillRect(0, 0, 1, 1);
  const pixel = tempCtx.getImageData(0, 0, 1, 1).data;
  return {
    r: pixel[0],
    g: pixel[1],
    b: pixel[2],
    a: pixel[3]
  };
};

export function MapEditor({ onClose, onSave }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [tool, setTool] = useState(TOOLS.BRUSH);
  const [brushSize, setBrushSize] = useState(5);
  const [terrainColor, setTerrainColor] = useState(TERRAIN_COLORS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [lineStartPoint, setLineStartPoint] = useState(null);
  const [previewPoint, setPreviewPoint] = useState(null);
  const previewCanvasRef = useRef(null);
  const [mapName, setMapName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedMaps, setSavedMaps] = useState([]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;
    ctxRef.current = ctx;

    // Start with empty canvas (transparent)
    ctx.clearRect(0, 0, W, H);

    // Load saved maps
    loadSavedMapsList();

    return () => {
      ctxRef.current = null;
    };
  }, []);

  const loadSavedMapsList = useCallback(() => {
    try {
      const mapsJson = localStorage.getItem('pgt-battle-tanks-maps');
      if (mapsJson) {
        const maps = JSON.parse(mapsJson);
        setSavedMaps(maps);
      }
    } catch (e) {
      console.error('Failed to load maps list:', e);
    }
  }, []);

  const getCanvasPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    return { x: Math.max(0, Math.min(W - 1, x)), y: Math.max(0, Math.min(H - 1, y)) };
  }, []);

  const drawPoint = useCallback((ctx, x, y, size, color, isErase = false) => {
    if (isErase) {
      ctx.globalCompositeOperation = 'destination-out';
      drawCircle(ctx, x, y, size, 'black');
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = color;
      drawCircle(ctx, x, y, size, color);
    }
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const fillArea = useCallback((ctx, startX, startY, fillColorName) => {
    const canvas = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Get target color at start point
    const startIdx = (Math.floor(startY) * width + Math.floor(startX)) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];
    const targetA = data[startIdx + 3];

    // Convert fill color to RGB
    const fillRgb = colorToRgb(fillColorName);
    const fillR = fillRgb.r;
    const fillG = fillRgb.g;
    const fillB = fillRgb.b;

    // Check if already filled (with tolerance for similar colors)
    const tolerance = 5;
    if (Math.abs(targetR - fillR) < tolerance && 
        Math.abs(targetG - fillG) < tolerance && 
        Math.abs(targetB - fillB) < tolerance && 
        targetA > 0) {
      return;
    }

    // Flood fill algorithm
    const stack = [[Math.floor(startX), Math.floor(startY)]];
    const visited = new Set();
    const visitedArray = new Uint8Array(width * height);

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Check if matches target color (with tolerance)
      if (Math.abs(r - targetR) <= tolerance && 
          Math.abs(g - targetG) <= tolerance && 
          Math.abs(b - targetB) <= tolerance && 
          Math.abs(a - targetA) <= tolerance) {
        visited.add(key);
        visitedArray[y * width + x] = 1;
        data[idx] = fillR;
        data[idx + 1] = fillG;
        data[idx + 2] = fillB;
        data[idx + 3] = 255;

        // Add neighbors
        if (x + 1 < width && !visitedArray[y * width + x + 1]) stack.push([x + 1, y]);
        if (x - 1 >= 0 && !visitedArray[y * width + x - 1]) stack.push([x - 1, y]);
        if (y + 1 < height && !visitedArray[(y + 1) * width + x]) stack.push([x, y + 1]);
        if (y - 1 >= 0 && !visitedArray[(y - 1) * width + x]) stack.push([x, y - 1]);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  const drawLine = useCallback((ctx, x1, y1, x2, y2, color, width) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      const x = Math.round(x1 + dx * t);
      const y = Math.round(y1 + dy * t);
      drawPoint(ctx, x, y, width, color, false);
    }
  }, [drawPoint]);

  const drawMountain = useCallback((ctx, centerX, centerY, size, color) => {
    const height = size;
    const width = size * 1.5;
    
    // Draw triangular mountain peak
    for (let y = 0; y < height; y++) {
      const lineWidth = Math.round((width / height) * (height - y));
      const startX = centerX - Math.floor(lineWidth / 2);
      const endX = centerX + Math.floor(lineWidth / 2);
      
      for (let x = startX; x <= endX; x++) {
        if (x >= 0 && x < W && centerY - y >= 0 && centerY - y < H) {
          drawRect(ctx, x, centerY - y, 1, 1, color);
        }
      }
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    const point = getCanvasPoint(e);
    if (!point) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    if (tool === TOOLS.FILL) {
      fillArea(ctx, point.x, point.y, terrainColor.color);
      return;
    } else if (tool === TOOLS.MOUNTAIN) {
      drawMountain(ctx, point.x, point.y, brushSize * 8, terrainColor.color);
      return;
    } else if (tool === TOOLS.LINE) {
      setIsDrawing(true);
      setLineStartPoint(point);
      setPreviewPoint(point);
      return;
    }

    setIsDrawing(true);
    setLastPoint(point);

    if (tool === TOOLS.BRUSH) {
      drawPoint(ctx, point.x, point.y, brushSize, terrainColor.color, false);
    } else if (tool === TOOLS.ERASER) {
      drawPoint(ctx, point.x, point.y, brushSize, 'black', true);
    }
  }, [tool, brushSize, terrainColor, getCanvasPoint, drawPoint, fillArea, drawMountain]);

  const handleMouseMove = useCallback((e) => {
    const point = getCanvasPoint(e);
    if (!point) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    // Line tool preview
    if (tool === TOOLS.LINE && isDrawing && lineStartPoint) {
      setPreviewPoint(point);
      // Update preview canvas
      if (previewCanvasRef.current) {
        const previewCtx = previewCanvasRef.current.getContext('2d');
        previewCtx.clearRect(0, 0, W, H);
        previewCtx.strokeStyle = terrainColor.color;
        previewCtx.lineWidth = brushSize;
        previewCtx.beginPath();
        previewCtx.moveTo(lineStartPoint.x, lineStartPoint.y);
        previewCtx.lineTo(point.x, point.y);
        previewCtx.stroke();
      }
      return;
    }

    if (!isDrawing) return;
    if (!lastPoint) return;

    if (tool === TOOLS.BRUSH) {
      // Draw line between last point and current point
      const dx = point.x - lastPoint.x;
      const dy = point.y - lastPoint.y;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        const x = Math.round(lastPoint.x + dx * t);
        const y = Math.round(lastPoint.y + dy * t);
        drawPoint(ctx, x, y, brushSize, terrainColor.color, false);
      }
      setLastPoint(point);
    } else if (tool === TOOLS.ERASER) {
      // Erase line between last point and current point
      const dx = point.x - lastPoint.x;
      const dy = point.y - lastPoint.y;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        const x = Math.round(lastPoint.x + dx * t);
        const y = Math.round(lastPoint.y + dy * t);
        drawPoint(ctx, x, y, brushSize, 'black', true);
      }
      setLastPoint(point);
    }
  }, [isDrawing, tool, brushSize, terrainColor, lastPoint, lineStartPoint, previewPoint, getCanvasPoint, drawPoint]);

  const handleMouseUp = useCallback(() => {
    const ctx = ctxRef.current;
    
    // Complete line tool
    if (tool === TOOLS.LINE && isDrawing && lineStartPoint && previewPoint) {
      if (ctx) {
        drawLine(ctx, lineStartPoint.x, lineStartPoint.y, previewPoint.x, previewPoint.y, terrainColor.color, brushSize);
      }
      // Clear preview
      if (previewCanvasRef.current) {
        const previewCtx = previewCanvasRef.current.getContext('2d');
        previewCtx.clearRect(0, 0, W, H);
      }
    }

    setIsDrawing(false);
    setLastPoint(null);
    setLineStartPoint(null);
    setPreviewPoint(null);
  }, [tool, isDrawing, lineStartPoint, previewPoint, terrainColor, brushSize, drawLine]);

  const handleClear = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (window.confirm('Clear the entire map? This cannot be undone.')) {
      ctx.clearRect(0, 0, W, H);
    }
  }, []);

  const handleCollapse = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    // Collapse terrain (gravity effect)
    const { width, height } = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, width, height);

    for (let x = 0; x < width; x++) {
      let land = 0;
      for (let y = 0; y < height; y++) {
        const index = y * width * 4 + x * 4 + 3;
        if (imageData.data[index] > 0) land++;
      }

      ctx.clearRect(x, 0, 1, height);
      if (land > 0 && ctx.fillStyle) {
        ctx.fillStyle = terrainColor.color;
        drawRect(ctx, x, height - land, 1, land, terrainColor.color);
      }
    }
  }, [terrainColor]);

  const handleSave = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    let nameToSave = mapName.trim();
    if (!nameToSave) {
      nameToSave = window.prompt('Enter map name:');
      if (!nameToSave || nameToSave.trim() === '') return;
      nameToSave = nameToSave.trim();
    }

    try {
      const imageData = ctx.getImageData(0, 0, W, H);
      const mapData = {
        name: nameToSave,
        data: Array.from(imageData.data),
        width: W,
        height: H,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      const mapsJson = localStorage.getItem('pgt-battle-tanks-maps');
      let maps = [];
      if (mapsJson) {
        maps = JSON.parse(mapsJson);
      }

      // Check if map with same name exists
      const existingIndex = maps.findIndex(m => m.name === mapData.name);
      if (existingIndex >= 0) {
        if (window.confirm(`Map "${mapData.name}" already exists. Overwrite?`)) {
          maps[existingIndex] = mapData;
        } else {
          return;
        }
      } else {
        maps.push(mapData);
      }

      localStorage.setItem('pgt-battle-tanks-maps', JSON.stringify(maps));
      loadSavedMapsList();
      
      alert(`Map "${mapData.name}" saved successfully!`);
      setMapName('');
      setShowSaveDialog(false);
    } catch (e) {
      console.error('Failed to save map:', e);
      alert('Failed to save map. Storage may be full.');
    }
  }, [mapName, loadSavedMapsList]);

  const handleLoad = useCallback((mapData) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    try {
      const imageData = new ImageData(
        new Uint8ClampedArray(mapData.data),
        mapData.width,
        mapData.height
      );
      ctx.putImageData(imageData, 0, 0);
      cacheImageData(ctx);
      setShowLoadDialog(false);
    } catch (e) {
      console.error('Failed to load map:', e);
      alert('Failed to load map.');
    }
  }, []);

  const handleDelete = useCallback((mapName) => {
    if (!window.confirm(`Delete map "${mapName}"?`)) return;

    try {
      const mapsJson = localStorage.getItem('pgt-battle-tanks-maps');
      if (mapsJson) {
        const maps = JSON.parse(mapsJson);
        const filtered = maps.filter(m => m.name !== mapName);
        localStorage.setItem('pgt-battle-tanks-maps', JSON.stringify(filtered));
        loadSavedMapsList();
      }
    } catch (e) {
      console.error('Failed to delete map:', e);
      alert('Failed to delete map.');
    }
  }, [loadSavedMapsList]);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'map.png';
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Failed to export map:', e);
      alert('Failed to export map.');
    }
  }, []);

  return (
    <div className="map-editor-overlay">
      <div className="map-editor-container">
        <div className="map-editor-header">
          <h2>MAP EDITOR</h2>
          <button className="map-editor-close" onClick={onClose}>✕</button>
        </div>

        <div className="map-editor-content">
          <div className="map-editor-toolbar">
            <div className="toolbar-section">
              <label>Tool:</label>
              <div className="tool-buttons">
                <button
                  className={tool === TOOLS.BRUSH ? 'active' : ''}
                  onClick={() => setTool(TOOLS.BRUSH)}
                  title="Brush"
                >
                  🖌️ Brush
                </button>
                <button
                  className={tool === TOOLS.ERASER ? 'active' : ''}
                  onClick={() => setTool(TOOLS.ERASER)}
                  title="Eraser"
                >
                  🧹 Eraser
                </button>
                <button
                  className={tool === TOOLS.FILL ? 'active' : ''}
                  onClick={() => setTool(TOOLS.FILL)}
                  title="Fill"
                >
                  🪣 Fill
                </button>
                <button
                  className={tool === TOOLS.LINE ? 'active' : ''}
                  onClick={() => setTool(TOOLS.LINE)}
                  title="Line"
                >
                  📏 Line
                </button>
                <button
                  className={tool === TOOLS.MOUNTAIN ? 'active' : ''}
                  onClick={() => setTool(TOOLS.MOUNTAIN)}
                  title="Mountain"
                >
                  ⛰️ Mountain
                </button>
              </div>
            </div>

            <div className="toolbar-section">
              <label>Brush Size:</label>
              <div className="brush-size-selector">
                {BRUSH_SIZES.map(size => (
                  <button
                    key={size}
                    className={brushSize === size ? 'active' : ''}
                    onClick={() => setBrushSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="toolbar-section">
              <label>Terrain Color:</label>
              <div className="color-selector">
                {TERRAIN_COLORS.map((color, idx) => (
                  <button
                    key={idx}
                    className={`color-button ${terrainColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color.color, borderColor: color.border }}
                    onClick={() => setTerrainColor(color)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="toolbar-section">
              <button onClick={handleClear}>Clear</button>
              <button onClick={handleCollapse}>Collapse</button>
              <button onClick={() => setShowSaveDialog(true)}>Save Map</button>
              <button onClick={() => { setShowLoadDialog(true); loadSavedMapsList(); }}>Load Map</button>
              <button onClick={handleExport}>Export PNG</button>
            </div>
          </div>

          <div className="map-editor-canvas-container">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <canvas
                ref={canvasRef}
                className="map-editor-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              {/* Line preview overlay */}
              {tool === TOOLS.LINE && isDrawing && lineStartPoint && (
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: 10,
                    imageRendering: 'pixelated',
                  }}
                  width={W}
                  height={H}
                />
              )}
            </div>
            <div className="map-editor-info">
              Canvas: {W} × {H}px | Tool: {tool} | Brush: {brushSize}px
            </div>
          </div>
        </div>

        {showSaveDialog && (
          <div className="map-editor-dialog-overlay">
            <div className="map-editor-dialog">
              <h3>Save Map</h3>
              <input
                type="text"
                placeholder="Map name"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const originalMapName = mapName;
                    setMapName(originalMapName);
                    handleSave();
                  } else if (e.key === 'Escape') {
                    setShowSaveDialog(false);
                  }
                }}
                autoFocus
              />
              <div className="dialog-buttons">
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showLoadDialog && (
          <div className="map-editor-dialog-overlay">
            <div className="map-editor-dialog map-editor-load-dialog">
              <h3>Load Map</h3>
              <div className="saved-maps-list">
                {savedMaps.length === 0 ? (
                  <p>No saved maps found.</p>
                ) : (
                  savedMaps.map((map, idx) => (
                    <div key={idx} className="saved-map-item">
                      <span>{map.name}</span>
                      <div>
                        <button onClick={() => handleLoad(map)}>Load</button>
                        <button onClick={() => handleDelete(map.name)}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="dialog-buttons">
                <button onClick={() => setShowLoadDialog(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

