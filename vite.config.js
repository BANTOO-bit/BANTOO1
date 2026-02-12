import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Generate source maps for debugging
    sourcemap: false,
    // Chunk splitting configuration
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: {
          // Vendor chunks - split large dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
        },
      },
    },
    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 500,
  },
})
