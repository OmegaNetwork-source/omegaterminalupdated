/**
 * Performance Monitoring System for Ravaged Planet
 * Tracks FPS, frame time, and other performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.enabled = false;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.frameTime = 16.67;
    this.minFrameTime = Infinity;
    this.maxFrameTime = 0;
    
    // Metric counters
    this.metrics = {
      drawCalls: 0,
      particleCount: 0,
      projectileCount: 0,
      terrainChecks: 0,
      stateUpdates: 0,
    };
    
    // Frame time history for smoothing
    this.frameTimeHistory = [];
    this.maxHistory = 60; // Keep last 60 frames
    
    // Performance thresholds
    this.TARGET_FPS = 60;
    this.TARGET_FRAME_TIME = 1000 / 60; // 16.67ms
    this.WARNING_FRAME_TIME = 25; // 40 fps
    this.CRITICAL_FRAME_TIME = 33; // 30 fps
  }
  
  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) {
      console.log('[PerfMon] Performance monitoring enabled');
    }
  }
  
  /**
   * Called at the start of each frame
   */
  beginFrame() {
    if (!this.enabled) return;
    
    this.frameStartTime = performance.now();
    
    // Reset per-frame metrics
    this.metrics.drawCalls = 0;
    this.metrics.terrainChecks = 0;
  }
  
  /**
   * Called at the end of each frame
   */
  endFrame() {
    if (!this.enabled) return;
    
    const now = performance.now();
    const frameTime = now - this.frameStartTime;
    const deltaTime = now - this.lastTime;
    
    this.frameCount++;
    this.lastTime = now;
    
    // Update frame time stats
    this.frameTime = frameTime;
    this.minFrameTime = Math.min(this.minFrameTime, frameTime);
    this.maxFrameTime = Math.max(this.maxFrameTime, frameTime);
    
    // Add to history
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > this.maxHistory) {
      this.frameTimeHistory.shift();
    }
    
    // Calculate FPS (smoothed over last second)
    if (deltaTime > 0) {
      const instantFps = 1000 / deltaTime;
      this.fps = this.fps * 0.9 + instantFps * 0.1; // Smooth FPS
    }
    
    // Check for performance issues
    if (frameTime > this.CRITICAL_FRAME_TIME) {
      console.warn(`[PerfMon] Critical frame time: ${frameTime.toFixed(2)}ms (< 30 FPS)`);
    } else if (frameTime > this.WARNING_FRAME_TIME) {
      console.warn(`[PerfMon] Slow frame time: ${frameTime.toFixed(2)}ms (< 40 FPS)`);
    }
  }
  
  /**
   * Track a draw call
   */
  trackDrawCall() {
    if (!this.enabled) return;
    this.metrics.drawCalls++;
  }
  
  /**
   * Track terrain collision check
   */
  trackTerrainCheck() {
    if (!this.enabled) return;
    this.metrics.terrainChecks++;
  }
  
  /**
   * Track state update
   */
  trackStateUpdate() {
    if (!this.enabled) return;
    this.metrics.stateUpdates++;
  }
  
  /**
   * Update particle count
   */
  setParticleCount(count) {
    if (!this.enabled) return;
    this.metrics.particleCount = count;
  }
  
  /**
   * Update projectile count
   */
  setProjectileCount(count) {
    if (!this.enabled) return;
    this.metrics.projectileCount = count;
  }
  
  /**
   * Get current performance stats
   */
  getStats() {
    const avgFrameTime = this.frameTimeHistory.length > 0
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : this.frameTime;
    
    return {
      fps: Math.round(this.fps),
      frameTime: this.frameTime.toFixed(2),
      avgFrameTime: avgFrameTime.toFixed(2),
      minFrameTime: this.minFrameTime.toFixed(2),
      maxFrameTime: this.maxFrameTime.toFixed(2),
      ...this.metrics,
    };
  }
  
  /**
   * Get performance grade (A-F)
   */
  getPerformanceGrade() {
    const avgFrameTime = this.frameTimeHistory.length > 0
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : this.frameTime;
    
    if (avgFrameTime <= 16.67) return 'A'; // 60+ FPS
    if (avgFrameTime <= 20) return 'B'; // 50+ FPS
    if (avgFrameTime <= 25) return 'C'; // 40+ FPS
    if (avgFrameTime <= 33) return 'D'; // 30+ FPS
    return 'F'; // < 30 FPS
  }
  
  /**
   * Log performance summary
   */
  logSummary() {
    if (!this.enabled) return;
    
    const stats = this.getStats();
    const grade = this.getPerformanceGrade();
    
    console.group('[PerfMon] Performance Summary');
    console.log(`Grade: ${grade}`);
    console.log(`FPS: ${stats.fps}`);
    console.log(`Frame Time: ${stats.frameTime}ms (avg: ${stats.avgFrameTime}ms)`);
    console.log(`Frame Time Range: ${stats.minFrameTime}ms - ${stats.maxFrameTime}ms`);
    console.log(`Draw Calls: ${stats.drawCalls}`);
    console.log(`Particles: ${stats.particleCount}`);
    console.log(`Projectiles: ${stats.projectileCount}`);
    console.log(`Terrain Checks: ${stats.terrainChecks}`);
    console.log(`State Updates: ${stats.stateUpdates}`);
    console.groupEnd();
  }
  
  /**
   * Reset all metrics
   */
  reset() {
    this.frameCount = 0;
    this.minFrameTime = Infinity;
    this.maxFrameTime = 0;
    this.frameTimeHistory = [];
    
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = 0;
    });
  }
  
  /**
   * Create performance HUD overlay
   */
  createHUD() {
    if (typeof document === 'undefined') return null;
    
    const hud = document.createElement('div');
    hud.id = 'perf-monitor-hud';
    hud.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      min-width: 200px;
      pointer-events: none;
    `;
    
    document.body.appendChild(hud);
    return hud;
  }
  
  /**
   * Update HUD display
   */
  updateHUD(hud) {
    if (!hud || !this.enabled) return;
    
    const stats = this.getStats();
    const grade = this.getPerformanceGrade();
    
    // Color code FPS
    let fpsColor = '#0f0'; // Green
    if (stats.fps < 40) fpsColor = '#ff0'; // Yellow
    if (stats.fps < 30) fpsColor = '#f00'; // Red
    
    hud.innerHTML = `
      <div><strong>Performance [${grade}]</strong></div>
      <div style="color: ${fpsColor}">FPS: ${stats.fps}</div>
      <div>Frame: ${stats.frameTime}ms</div>
      <div>Avg: ${stats.avgFrameTime}ms</div>
      <div>Min/Max: ${stats.minFrameTime}/${stats.maxFrameTime}ms</div>
      <div>─────────────</div>
      <div>Draws: ${stats.drawCalls}</div>
      <div>Particles: ${stats.particleCount}</div>
      <div>Projectiles: ${stats.projectileCount}</div>
      <div>Terrain: ${stats.terrainChecks}</div>
    `;
  }
}

// Export singleton instance
export const perfMon = new PerformanceMonitor();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.perfMon = perfMon;
}

export default perfMon;








