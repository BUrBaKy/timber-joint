import type { EngineRequest, EngineResponse } from '../types/engine.types'
import type { ProjectFile } from '../types/project.types'

/**
 * Typed wrappers around window.electronAPI (set by preload contextBridge).
 */

export const engine = {
  calculate: (request: EngineRequest): Promise<EngineResponse> => {
    return window.electronAPI.engine.calculate(request)
  }
}

export const project = {
  openFile: (): Promise<{ filePath: string; data: ProjectFile } | null> => {
    return window.electronAPI.project.openFile()
  },
  saveFile: (filePath: string | null, data: ProjectFile): Promise<string | null> => {
    return window.electronAPI.project.saveFile(filePath, data)
  }
}
