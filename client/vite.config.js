import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'es-toolkit/compat/get': path.resolve(__dirname, 'src/compat-shims/get.js'),
      'es-toolkit/compat/omit': path.resolve(__dirname, 'src/compat-shims/omit.js'),
      'es-toolkit/compat/range': path.resolve(__dirname, 'src/compat-shims/range.js'),
      'es-toolkit/compat/last': path.resolve(__dirname, 'src/compat-shims/last.js'),
      'es-toolkit/compat/maxBy': path.resolve(__dirname, 'src/compat-shims/maxBy.js'),
      'es-toolkit/compat/minBy': path.resolve(__dirname, 'src/compat-shims/minBy.js'),
      'es-toolkit/compat/uniqBy': path.resolve(__dirname, 'src/compat-shims/uniqBy.js'),
      'es-toolkit/compat/sortBy': path.resolve(__dirname, 'src/compat-shims/sortBy.js'),
      'es-toolkit/compat/isPlainObject': path.resolve(__dirname, 'src/compat-shims/isPlainObject.js'),
      'es-toolkit/compat/sumBy': path.resolve(__dirname, 'src/compat-shims/sumBy.js'),
      'es-toolkit/compat/throttle': path.resolve(__dirname, 'src/compat-shims/throttle.js'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
