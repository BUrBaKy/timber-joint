export type TimberGrade =
  | 'C14' | 'C16' | 'C18' | 'C20' | 'C22' | 'C24' | 'C27' | 'C30' | 'C35' | 'C40'
  | 'GL24h' | 'GL28h' | 'GL32h' | 'GL36h'

export type ServiceClass = 1 | 2 | 3

export type LoadDurationClass =
  | 'permanent'
  | 'long-term'
  | 'medium-term'
  | 'short-term'
  | 'instantaneous'

export interface MortiseTenonGeometry {
  beam_width: number      // mm
  beam_height: number     // mm
  tenon_width: number     // mm
  tenon_height: number    // mm
  tenon_length: number    // mm
  member_length: number   // mm
}

export interface MaterialConfig {
  grade: TimberGrade
  service_class: ServiceClass
  load_duration_class: LoadDurationClass
}

export interface LoadCase {
  Fv_Ed: number   // design shear force (kN)
  Ft_Ed: number   // design axial force (kN)
}

export interface MortiseTenonJointInput {
  type: 'MORTISE_TENON'
  geometry: MortiseTenonGeometry
  material: MaterialConfig
}

export interface EngineRequest {
  id: string
  type: 'calculate'
  payload: {
    joint: MortiseTenonJointInput
    loads: LoadCase
  }
}

export interface CheckResult {
  id: string
  label: string
  Rd: number
  Ed: number
  utilisation: number
  unit: string
  passed: boolean
}

export interface SummaryResult {
  passed: boolean
  max_utilisation: number
  governing_check: string
}

export interface EngineResultPayload {
  summary: SummaryResult
  checks: CheckResult[]
}

export interface EngineErrorPayload {
  code: string
  message: string
  field?: string
}

export interface EngineResponse {
  id: string
  type: 'result' | 'error'
  payload: EngineResultPayload | EngineErrorPayload
}

export function isEngineResult(resp: EngineResponse): resp is EngineResponse & { payload: EngineResultPayload } {
  return resp.type === 'result'
}

export function isEngineError(resp: EngineResponse): resp is EngineResponse & { payload: EngineErrorPayload } {
  return resp.type === 'error'
}
