import { ipcMain } from 'electron'
import type { EngineProcess } from '../engine/EngineProcess'
import type { EngineRequest } from '../../renderer/types/engine.types'

export function registerEngineIpc(engineProcess: EngineProcess): void {
  ipcMain.handle('engine:calculate', async (_event, request: EngineRequest) => {
    console.log('[IPC] engine:calculate', request.id)
    return engineProcess.calculate(request)
  })
}
