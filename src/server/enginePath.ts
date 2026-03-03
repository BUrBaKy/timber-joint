import path from 'path'

/**
 * Resolves the path to the C++ engine binary for the web server.
 * Override with ENGINE_PATH env var for custom deployments.
 * Default: resources/bin/ relative to process.cwd() (works in both dev and Docker).
 */
export function resolveServerEnginePath(): string {
  if (process.env.ENGINE_PATH) return process.env.ENGINE_PATH
  const binaryName = process.platform === 'win32' ? 'timber-engine.exe' : 'timber-engine'
  return path.join(process.cwd(), 'resources', 'bin', binaryName)
}
