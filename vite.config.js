import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Anchor the app to this repo so dev/preview never follows a wrong cwd (e.g. parent folder).
const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  resolve: {
    // Avoid two React copies (invalid hook call / useState of null on some routes).
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime']
  },
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    strictPort: false,
    open: true, // Automatically open browser
    proxy: {
      // The wrap builder's Square checkout is a Cloud Function (functions/index.js). Firebase
      // Hosting routes /api/wrap to it in production; here it's the emulator (npm run functions:dev).
      '/api/wrap': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        rewrite: (requestPath) => `/shawaramaalley/us-central1/wrapOrders${requestPath}`
      }
    }
  }
})
