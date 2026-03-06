import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Don't generate manifest — we already have public/manifest.json
      manifest: false,
      workbox: {
        // Don't precache the Firebase service worker
        globIgnores: ['**/firebase-messaging-sw.js'],
        // Cache strategies for runtime requests
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 } }
          },
          {
            // Cache map tiles
            urlPattern: /^https:\/\/.*\.basemaps\.cartocdn\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'map-tiles-cache', expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 } }
          },
          {
            // Network-only for Supabase API — data must always be fresh
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    exclude: ['node_modules/**', 'dist/**', 'e2e/**', 'tests/e2e/**'],
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
            return 'vendor-leaflet'
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase'
          }
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase'
          }
          if (id.includes('node_modules/@sentry')) {
            return 'vendor-sentry'
          }
          if (id.includes('node_modules/@turf')) {
            return 'vendor-turf'
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
    minify: 'esbuild',
  },
  // Fix #2: Strip console.log/warn in production builds only
  // IMPORTANT: use undefined for dev to preserve Vite's default JSX transform
  esbuild: mode === 'production' ? {
    drop: ['console', 'debugger'],
  } : undefined,
}))
