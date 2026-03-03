import type { EngineRequest, EngineResponse } from '../types/engine.types'
import type { ProjectFile } from '../types/project.types'

export interface BridgeInterface {
  engine: {
    calculate(request: EngineRequest): Promise<EngineResponse>
  }
  project: {
    openFile(): Promise<{ filePath: string; data: ProjectFile } | null>
    saveFile(filePath: string | null, data: ProjectFile): Promise<string | null>
  }
}
