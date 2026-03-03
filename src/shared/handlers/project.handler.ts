import fs from 'fs/promises'
import type { ProjectFile } from '../../renderer/types/project.types'

export function migrateProject(data: ProjectFile): ProjectFile {
  data.joints = data.joints.map((joint) => {
    if (!joint.geometry.secondary_width) {
      joint.geometry.secondary_width = joint.geometry.tenon_width * 2
    }
    if (!joint.geometry.secondary_height) {
      joint.geometry.secondary_height = joint.geometry.tenon_height * 1.5
    }
    if (!joint.geometry.member_angle) {
      joint.geometry.member_angle = 90
    }
    return joint
  })
  return data
}

export async function readProjectFile(
  filePath: string
): Promise<{ filePath: string; data: ProjectFile }> {
  const content = await fs.readFile(filePath, 'utf-8')
  const data: ProjectFile = JSON.parse(content)
  return { filePath, data: migrateProject(data) }
}

export async function writeProjectFile(filePath: string, data: ProjectFile): Promise<string> {
  data.metadata.modifiedAt = new Date().toISOString()
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  return filePath
}
