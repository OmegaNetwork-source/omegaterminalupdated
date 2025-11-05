import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    open: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild', // Use esbuild (default, no extra dependency needed)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'game-engine': [
            './src/engine/gameEngine.js',
            './src/engine/gfx.js',
            './src/engine/input.js',
            './src/engine/math.js',
          ],
          'game-systems': [
            './src/engine/ai.js',
            './src/engine/projectiles.js',
            './src/engine/weapons.js',
            './src/engine/terrain.js',
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  publicDir: 'public',
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: []
  }
});

