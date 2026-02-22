import { app } from 'electron'
import path from 'path'
import fs from 'fs'

/**
 * Resolves the path to the C++ engine binary.
 * In development: looks in resources/bin/
 * In production (packaged): looks in process.resourcesPath/bin/
 */
export function resolveEnginePath(): string {
  const binaryName = process.platform === 'win32' ? 'timber-engine.exe' : 'timber-engine'

  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'bin', binaryName)
  }

  // Development: try resources/bin relative to project root
  const devPath = path.join(app.getAppPath(), '..', 'resources', 'bin', binaryName)
  if (fs.existsSync(devPath)) {
    return devPath
  }

  // Fallback for electron-vite dev server layout
  return path.join(process.cwd(), 'resources', 'bin', binaryName)
}
