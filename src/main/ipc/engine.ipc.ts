import { ipcMain } from 'electron'
import type { EngineProcess } from '../../shared/engine/EngineProcess'
import { handleEngineCalculate } from '../../shared/handlers/engine.handler'
import type { EngineRequest } from '../../renderer/types/engine.types'

export function registerEngineIpc(engineProcess: EngineProcess): void {
  ipcMain.handle('engine:calculate', async (_event, request: EngineRequest) => {
    return handleEngineCalculate(engineProcess, request)
  })
}
