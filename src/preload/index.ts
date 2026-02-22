import { contextBridge, ipcRenderer } from 'electron'
import type { EngineRequest, EngineResponse } from '../renderer/types/engine.types'
import type { ProjectFile } from '../renderer/types/project.types'

const electronAPI = {
  engine: {
    calculate: (request: EngineRequest): Promise<EngineResponse> =>
      ipcRenderer.invoke('engine:calculate', request)
  },
  project: {
    openFile: (): Promise<{ filePath: string; data: ProjectFile } | null> =>
      ipcRenderer.invoke('project:open'),
    saveFile: (filePath: string | null, data: ProjectFile): Promise<string | null> =>
      ipcRenderer.invoke('project:save', filePath, data)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// TypeScript global augmentation for renderer
declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
