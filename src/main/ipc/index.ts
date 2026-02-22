import type { EngineProcess } from '../engine/EngineProcess'
import { registerEngineIpc } from './engine.ipc'
import { registerProjectIpc } from './project.ipc'

export function registerAllIpc(engineProcess: EngineProcess): void {
  registerEngineIpc(engineProcess)
  registerProjectIpc()
}
