import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@shared': resolve('src/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: [
        // More specific alias first — Electron build uses the Electron bridge
        { find: '@renderer/api/bridge', replacement: resolve('src/renderer/api/bridge.electron.ts') },
        { find: '@renderer', replacement: resolve('src/renderer') },
        { find: '@shared', replacement: resolve('src/shared') }
      ]
    },
    plugins: [react()]
  }
})
