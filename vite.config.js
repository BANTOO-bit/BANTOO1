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
            // Cache Google Fonts Stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-stylesheets', expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 } }
          },
          {
            // Cache Google Fonts Webfonts
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-webfonts', expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }, cacheableResponse: { statuses: [0, 200] } }
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
    chunkSizeWarningLimit: 1000,
  },
  // Fix #2: Strip console.log/warn in production builds only
  // IMPORTANT: use undefined for dev to preserve Vite's default JSX transform
  esbuild: mode === 'production' ? {
    drop: ['console', 'debugger'],
  } : undefined,
}))
