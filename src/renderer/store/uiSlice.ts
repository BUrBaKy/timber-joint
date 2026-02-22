import type { StateCreator } from 'zustand'

export type InputTab = 'geometry' | 'material' | 'loads'

export interface UISlice {
  activeTab: InputTab
  resultsPanelExpanded: boolean
  sidebarWidth: number

  setActiveTab: (tab: InputTab) => void
  setResultsPanelExpanded: (expanded: boolean) => void
  setSidebarWidth: (width: number) => void
}

export const createUISlice: StateCreator<UISlice, [['zustand/immer', never]]> = (set) => ({
  activeTab: 'geometry',
  resultsPanelExpanded: true,
  sidebarWidth: 320,

  setActiveTab: (tab) =>
    set((state) => {
      state.activeTab = tab
    }),

  setResultsPanelExpanded: (expanded) =>
    set((state) => {
      state.resultsPanelExpanded = expanded
    }),

  setSidebarWidth: (width) =>
    set((state) => {
      state.sidebarWidth = width
    })
})
