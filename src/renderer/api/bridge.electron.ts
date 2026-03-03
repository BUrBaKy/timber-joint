import type { BridgeInterface } from './bridge.interface'
import type { EngineRequest, EngineResponse } from '../types/engine.types'
import type { ProjectFile } from '../types/project.types'

export const engine: BridgeInterface['engine'] = {
  calculate: (request: EngineRequest): Promise<EngineResponse> =>
    window.electronAPI.engine.calculate(request)
}

export const project: BridgeInterface['project'] = {
  openFile: (): Promise<{ filePath: string; data: ProjectFile } | null> =>
    window.electronAPI.project.openFile(),
  saveFile: (filePath: string | null, data: ProjectFile): Promise<string | null> =>
    window.electronAPI.project.saveFile(filePath, data)
}
