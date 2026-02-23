import type { StateCreator } from 'zustand'
import type { MortiseTenonJoint } from '../types/project.types'
import type {
  MortiseTenonGeometry,
  MaterialConfig,
  LoadCase
} from '../types/engine.types'

export const defaultGeometry = (): MortiseTenonGeometry => ({
  beam_width: 100,
  beam_height: 200,
  secondary_width: 80,
  secondary_height: 150,
  tenon_width: 40,
  tenon_height: 100,
  tenon_length: 80,
  member_length: 2000,
  member_angle: 90
})

export const defaultMaterial = (): MaterialConfig => ({
  grade: 'C24',
  service_class: 2,
  load_duration_class: 'medium-term'
})

export const defaultLoads = (): LoadCase => ({
  Fv_Ed: 10.0,
  Ft_Ed: 2.0
})

export interface JointSlice {
  selectedJointId: string | null
  editingJoint: MortiseTenonJoint | null

  selectJoint: (id: string | null) => void
  setEditingJoint: (joint: MortiseTenonJoint | null) => void
  updateGeometry: (geometry: Partial<MortiseTenonGeometry>) => void
  updateMaterial: (material: Partial<MaterialConfig>) => void
  updateLoads: (loads: Partial<LoadCase>) => void
}

export const createJointSlice: StateCreator<JointSlice, [['zustand/immer', never]]> = (set) => ({
  selectedJointId: null,
  editingJoint: null,

  selectJoint: (id) =>
    set((state) => {
      state.selectedJointId = id
    }),

  setEditingJoint: (joint) =>
    set((state) => {
      state.editingJoint = joint
    }),

  updateGeometry: (geometry) =>
    set((state) => {
      if (state.editingJoint) {
        Object.assign(state.editingJoint.geometry, geometry)
      }
    }),

  updateMaterial: (material) =>
    set((state) => {
      if (state.editingJoint) {
        Object.assign(state.editingJoint.material, material)
      }
    }),

  updateLoads: (loads) =>
    set((state) => {
      if (state.editingJoint) {
        Object.assign(state.editingJoint.loads, loads)
      }
    })
})
