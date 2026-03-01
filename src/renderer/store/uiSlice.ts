import type { StateCreator } from 'zustand'

export type InputTab = 'geometry' | 'material' | 'loads'
export type SelectedMember = 'primary' | 'secondary' | 'tenon' | 'mortise' | null
export type ViewMode = 'rendered' | 'transparent' | 'wireframe'
export type MainView = '3d' | 'report'

export interface UISlice {
  activeTab: InputTab
  resultsPanelExpanded: boolean
  sidebarWidth: number
  selectedMember: SelectedMember
  viewMode: ViewMode
  transparency: number  // 0-100, where 100 is fully opaque
  mainView: MainView

  setActiveTab: (tab: InputTab) => void
  setResultsPanelExpanded: (expanded: boolean) => void
  setSidebarWidth: (width: number) => void
  setSelectedMember: (member: SelectedMember) => void
  setViewMode: (mode: ViewMode) => void
  setTransparency: (value: number) => void
  setMainView: (view: MainView) => void
}

export const createUISlice: StateCreator<UISlice, [['zustand/immer', never]]> = (set) => ({
  activeTab: 'geometry',
  resultsPanelExpanded: true,
  sidebarWidth: 320,
  selectedMember: null,
  viewMode: 'rendered',
  transparency: 50,  // Default 50% opacity in transparent mode
  mainView: '3d',

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
    }),

  setSelectedMember: (member) =>
    set((state) => {
      state.selectedMember = member
    }),

  setViewMode: (mode) =>
    set((state) => {
      state.viewMode = mode
    }),

  setTransparency: (value) =>
    set((state) => {
      state.transparency = Math.max(0, Math.min(100, value))
    }),

  setMainView: (view) =>
    set((state) => {
      state.mainView = view
    }),
})
