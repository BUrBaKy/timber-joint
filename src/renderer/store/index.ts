import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createProjectSlice, type ProjectSlice } from './projectSlice'
import { createJointSlice, type JointSlice } from './jointSlice'
import { createCalculationSlice, type CalculationSlice } from './calculationSlice'
import { createUISlice, type UISlice } from './uiSlice'
import { createUnitsSlice, type UnitsSlice } from './unitsSlice'

export type AppStore = ProjectSlice & JointSlice & CalculationSlice & UISlice & UnitsSlice

export const useStore = create<AppStore>()(
  immer((...a) => ({
    ...createProjectSlice(...a),
    ...createJointSlice(...a),
    ...createCalculationSlice(...a),
    ...createUISlice(...a),
    ...createUnitsSlice(...a),
  }))
)
