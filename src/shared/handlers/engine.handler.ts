import type { EngineProcess } from '../engine/EngineProcess'
import type { EngineRequest, EngineResponse } from '../../renderer/types/engine.types'

export async function handleEngineCalculate(
  engineProcess: EngineProcess,
  request: EngineRequest
): Promise<EngineResponse> {
  console.log('[Engine] calculate', request.id)
  return engineProcess.calculate(request)
}
