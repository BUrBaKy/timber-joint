import { ipcMain, dialog } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import type { ProjectFile } from '../../renderer/types/project.types'

export function registerProjectIpc(): void {
  ipcMain.handle('project:open', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Open Project',
      filters: [{ name: 'Timber Joint Project', extensions: ['tjd'] }],
      properties: ['openFile']
    })

    if (canceled || filePaths.length === 0) return null

    const filePath = filePaths[0]
    const content = await fs.readFile(filePath, 'utf-8')
    const data: ProjectFile = JSON.parse(content)
    
    // Migrate old projects: add secondary member dimensions if missing
    data.joints = data.joints.map(joint => {
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
    
    return { filePath, data }
  })

  ipcMain.handle('project:save', async (_event, filePath: string | null, data: ProjectFile) => {
    let targetPath = filePath

    if (!targetPath) {
      const { canceled, filePath: chosen } = await dialog.showSaveDialog({
        title: 'Save Project',
        defaultPath: 'project.tjd',
        filters: [{ name: 'Timber Joint Project', extensions: ['tjd'] }]
      })
      if (canceled || !chosen) return null
      targetPath = chosen
    }

    // Update modifiedAt before saving
    data.metadata.modifiedAt = new Date().toISOString()
    await fs.writeFile(targetPath, JSON.stringify(data, null, 2), 'utf-8')
    return targetPath
  })
}
