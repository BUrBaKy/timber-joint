import type { StateCreator } from 'zustand'
import type { ProjectFile, MortiseTenonJoint } from '../types/project.types'

export interface ProjectSlice {
  project: ProjectFile
  filePath: string | null
  isDirty: boolean

  setProject: (project: ProjectFile, filePath: string | null) => void
  setFilePath: (filePath: string) => void
  setDirty: (dirty: boolean) => void
  addJoint: (joint: MortiseTenonJoint) => void
  updateJoint: (joint: MortiseTenonJoint) => void
  removeJoint: (id: string) => void
}

export const defaultProject = (): ProjectFile => ({
  version: '1.0',
  metadata: {
    name: 'Untitled Project',
    author: '',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  },
  joints: []
})

export const createProjectSlice: StateCreator<ProjectSlice, [['zustand/immer', never]]> = (set) => ({
  project: defaultProject(),
  filePath: null,
  isDirty: false,

  setProject: (project, filePath) =>
    set((state) => {
      state.project = project
      state.filePath = filePath
      state.isDirty = false
    }),

  setFilePath: (filePath) =>
    set((state) => {
      state.filePath = filePath
    }),

  setDirty: (dirty) =>
    set((state) => {
      state.isDirty = dirty
    }),

  addJoint: (joint) =>
    set((state) => {
      state.project.joints.push(joint)
      state.isDirty = true
    }),

  updateJoint: (joint) =>
    set((state) => {
      const idx = state.project.joints.findIndex((j) => j.id === joint.id)
      if (idx !== -1) {
        state.project.joints[idx] = joint
        state.isDirty = true
      }
    }),

  removeJoint: (id) =>
    set((state) => {
      state.project.joints = state.project.joints.filter((j) => j.id !== id)
      state.isDirty = true
    })
})
