import type { MortiseTenonGeometry, MaterialConfig, LoadCase } from './engine.types'

export interface MortiseTenonJoint {
  id: string
  name: string
  geometry: MortiseTenonGeometry
  material: MaterialConfig
  loads: LoadCase
}

export interface ProjectMetadata {
  name: string
  author: string
  createdAt: string
  modifiedAt: string
}

export interface ProjectFile {
  version: '1.0'
  metadata: ProjectMetadata
  joints: MortiseTenonJoint[]
}
