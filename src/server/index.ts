import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import path from 'path'
import { EngineProcess } from '../shared/engine/EngineProcess'
import { resolveServerEnginePath } from './enginePath'
import { handleEngineCalculate } from '../shared/handlers/engine.handler'
import type { EngineRequest } from '../renderer/types/engine.types'

const PORT = parseInt(process.env.PORT ?? '3000', 10)
const IS_DEV = process.env.NODE_ENV === 'development'

// Start the C++ engine subprocess
const engineProcess = new EngineProcess(resolveServerEnginePath())
engineProcess.start()

const app = express()
app.use(express.json())

// Serve the built web renderer in production.
// In dev, Vite (port 5173) serves the renderer and proxies /ws here.
if (!IS_DEV) {
  // When bundled with esbuild, __dirname is the directory of out/server.js → out/
  const RENDERER_DIR = process.env.RENDERER_DIR ?? path.join(__dirname, 'web-renderer')
  app.use(express.static(RENDERER_DIR))
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(RENDERER_DIR, 'index.html'))
  })
}

const server = createServer(app)

// WebSocket endpoint: receives EngineRequests, returns EngineResponses
const wss = new WebSocketServer({ server, path: '/ws' })

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    try {
      const request: EngineRequest = JSON.parse(data.toString())
      const response = await handleEngineCalculate(engineProcess, request)
      ws.send(JSON.stringify(response))
    } catch (err) {
      console.error('[WS] Error handling message:', err)
    }
  })
})

server.listen(PORT, () => {
  console.log(`[Server] Timber Joint Designer running at http://localhost:${PORT}`)
  if (IS_DEV) {
    console.log('[Server] Dev mode — open http://localhost:5173 (Vite handles the UI)')
  }
})

process.on('SIGTERM', () => {
  engineProcess.stop()
  server.close(() => process.exit(0))
})
