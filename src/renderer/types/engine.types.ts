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
  beam_width: number           // mm (primary member)
  beam_height: number          // mm (primary member)
  secondary_width: number      // mm (secondary member cross-section)
  secondary_height: number     // mm (secondary member cross-section)
  tenon_width: number          // mm (must be ≤ secondary_width)
  tenon_height: number         // mm (must be ≤ secondary_height)
  tenon_length: number         // mm (protrusion into mortise)
  member_length: number        // mm (primary member length)
  member_angle: number         // degrees (0-90, typically 90 for perpendicular)
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

export interface CalculationIntermediates {
  grade_used: string
  fv_k:    number  // MPa — characteristic shear strength
  fc90_k:  number  // MPa — characteristic compression perp.
  kmod:    number  // modification factor
  gamma_M: number  // partial material factor
  fv_d:    number  // MPa — design shear strength
  fc90_d:  number  // MPa — design compression perp.
  A_shear:   number  // mm²
  A_bearing: number  // mm²
}

export interface EngineResultPayload {
  summary:       SummaryResult
  checks:        CheckResult[]
  intermediates: CalculationIntermediates
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
