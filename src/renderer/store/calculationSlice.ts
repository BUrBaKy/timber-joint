import type { StateCreator } from 'zustand'
import type { EngineResultPayload, EngineErrorPayload } from '../types/engine.types'

export type CalculationStatus = 'idle' | 'pending' | 'success' | 'error'

export interface CalculationSlice {
  calcStatus: CalculationStatus
  calcResult: EngineResultPayload | null
  calcError: EngineErrorPayload | null

  setCalcPending: () => void
  setCalcResult: (result: EngineResultPayload) => void
  setCalcError: (error: EngineErrorPayload) => void
  resetCalc: () => void
}

export const createCalculationSlice: StateCreator<CalculationSlice, [['zustand/immer', never]]> = (set) => ({
  calcStatus: 'idle',
  calcResult: null,
  calcError: null,

  setCalcPending: () =>
    set((state) => {
      state.calcStatus = 'pending'
      state.calcError = null
    }),

  setCalcResult: (result) =>
    set((state) => {
      state.calcStatus = 'success'
      state.calcResult = result
      state.calcError = null
    }),

  setCalcError: (error) =>
    set((state) => {
      state.calcStatus = 'error'
      state.calcError = error
    }),

  resetCalc: () =>
    set((state) => {
      state.calcStatus = 'idle'
      state.calcResult = null
      state.calcError = null
    })
})
