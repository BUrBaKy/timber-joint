import type { BridgeInterface } from './bridge.interface'
import type { EngineRequest, EngineResponse } from '../types/engine.types'
import type { ProjectFile } from '../types/project.types'

// WebSocket client — mirrors the EngineProcess request/response correlation pattern
class WsEngineClient {
  private ws: WebSocket | null = null
  private pending = new Map<string, (r: EngineResponse) => void>()
  private readonly url: string

  constructor() {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    this.url = `${proto}//${window.location.host}/ws`
  }

  private connect(): Promise<WebSocket> {
    if (this.ws?.readyState === WebSocket.OPEN) return Promise.resolve(this.ws)

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url)
      ws.onopen = () => { this.ws = ws; resolve(ws) }
      ws.onerror = (e) => reject(e)
      ws.onclose = () => { this.ws = null }
      ws.onmessage = (event) => {
        const response: EngineResponse = JSON.parse(event.data as string)
        const cb = this.pending.get(response.id)
        if (cb) { this.pending.delete(response.id); cb(response) }
      }
    })
  }

  async calculate(request: EngineRequest): Promise<EngineResponse> {
    const ws = await this.connect()
    return new Promise((resolve) => {
      this.pending.set(request.id, resolve)
      ws.send(JSON.stringify(request))
    })
  }
}

const wsClient = new WsEngineClient()

// Project file open: browser File API — no server round-trip needed
function openFilePicker(): Promise<{ filePath: string; data: ProjectFile } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.tjd'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      const data: ProjectFile = JSON.parse(await file.text())
      resolve({ filePath: file.name, data })
    }
    // Resolve null if the picker is dismissed without selecting
    input.addEventListener('cancel', () => resolve(null))
    input.click()
  })
}

// Project file save: triggers a browser download of the JSON
function saveFileDownload(filePath: string | null, data: ProjectFile): Promise<string | null> {
  data.metadata.modifiedAt = new Date().toISOString()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filePath ?? 'project.tjd'
  a.click()
  URL.revokeObjectURL(url)
  return Promise.resolve(filePath ?? 'project.tjd')
}

export const engine: BridgeInterface['engine'] = {
  calculate: (request) => wsClient.calculate(request)
}

export const project: BridgeInterface['project'] = {
  openFile: openFilePicker,
  saveFile: saveFileDownload
}
