import path from 'node:path'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Photo Sphere Viewer bundles three internally; dedupe avoids a second copy via Vite pre-bundling.
    dedupe: ['three'],
  },
  optimizeDeps: {
    // Use the package's native ESM — pre-bundling breaks FileLoader for large panorama assets.
    exclude: ['@photo-sphere-viewer/core'],
  },
})
