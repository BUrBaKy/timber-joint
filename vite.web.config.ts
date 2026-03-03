import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Web build uses the WebSocket bridge instead of the Electron bridge
      { find: '@renderer/api/bridge', replacement: resolve('src/renderer/api/bridge.web.ts') },
      { find: '@renderer', replacement: resolve('src/renderer') },
      { find: '@shared', replacement: resolve('src/shared') }
    ]
  },
  root: 'src/renderer',
  build: {
    outDir: resolve('out/web-renderer'),
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy: {
      // Forward WebSocket engine requests to the Node server.
      // NOTE: Do NOT add an /api proxy here — the renderer has source files
      // under src/renderer/api/ and a broad prefix would intercept those module requests.
      '/ws': { target: 'ws://localhost:3000', ws: true }
    }
  }
})
