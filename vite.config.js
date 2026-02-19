import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
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
  // Fix #1: Inject Sentry DSN into index.html __SENTRY_DSN__ placeholder
  define: {
    '__SENTRY_DSN__': JSON.stringify(process.env.VITE_SENTRY_DSN || ''),
  },
}))
