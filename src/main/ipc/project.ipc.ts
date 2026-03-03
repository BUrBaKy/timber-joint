import { ipcMain, dialog } from 'electron'
import { readProjectFile, writeProjectFile } from '../../shared/handlers/project.handler'
import type { ProjectFile } from '../../renderer/types/project.types'

export function registerProjectIpc(): void {
  ipcMain.handle('project:open', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Open Project',
      filters: [{ name: 'Timber Joint Project', extensions: ['tjd'] }],
      properties: ['openFile']
    })

    if (canceled || filePaths.length === 0) return null
    return readProjectFile(filePaths[0])
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

    return writeProjectFile(targetPath, data)
  })
}
