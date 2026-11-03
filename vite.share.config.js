import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// Builds the wrap builder on its own, as one script and one stylesheet, so it can be shared as a
// standalone page (a hosted preview link) without the rest of the site. `npm run build:share`
// writes it to share-dist/.
export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  base: './',
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  // Library builds leave this for the host app to replace; there is no host app here.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    outDir: 'share-dist',
    emptyOutDir: true,
    copyPublicDir: false,
    minify: 'esbuild',
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(projectRoot, 'src/share/main.jsx'),
      formats: ['es'],
      fileName: () => 'wrap-builder.js'
    }
  }
})
