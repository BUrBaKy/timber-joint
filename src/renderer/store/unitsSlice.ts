import type { StateCreator } from 'zustand'
import type { DistanceUnit, ForceUnit, StressUnit } from '../lib/units'

export interface UnitsSettings {
  distanceUnit: DistanceUnit
  forceUnit:    ForceUnit
  stressUnit:   StressUnit
  decimals:     number  // 0–6
}

export interface UnitsSlice {
  units: UnitsSettings
  setDistanceUnit: (u: DistanceUnit) => void
  setForceUnit:    (u: ForceUnit) => void
  setStressUnit:   (u: StressUnit) => void
  setDecimals:     (n: number) => void
}

export const createUnitsSlice: StateCreator<UnitsSlice, [['zustand/immer', never]]> = (set) => ({
  units: {
    distanceUnit: 'mm',
    forceUnit:    'kN',
    stressUnit:   'MPa',
    decimals:     2,
  },

  setDistanceUnit: (u) => set((s) => { s.units.distanceUnit = u }),
  setForceUnit:    (u) => set((s) => { s.units.forceUnit    = u }),
  setStressUnit:   (u) => set((s) => { s.units.stressUnit   = u }),
  setDecimals:     (n) => set((s) => { s.units.decimals     = Math.max(0, Math.min(6, n)) }),
})
