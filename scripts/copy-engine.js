#!/usr/bin/env node
/**
 * Copies the built C++ binary into resources/bin/
 * Tries release build first, falls back to debug.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const BIN_NAME = process.platform === 'win32' ? 'timber-engine.exe' : 'timber-engine'

const CANDIDATES = [
  path.join(ROOT, 'engine', 'build', 'release', 'Release', BIN_NAME),
  path.join(ROOT, 'engine', 'build', 'release', BIN_NAME),
  path.join(ROOT, 'engine', 'build', 'debug', 'Debug', BIN_NAME),
  path.join(ROOT, 'engine', 'build', 'debug',   BIN_NAME),
]

const DEST_DIR = path.join(ROOT, 'resources', 'bin')
const DEST     = path.join(DEST_DIR, BIN_NAME)

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true })
}

let copied = false
for (const src of CANDIDATES) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, DEST)
    console.log(`[copy-engine] Copied ${src} → ${DEST}`)
    copied = true
    break
  }
}

if (!copied) {
  console.error('[copy-engine] ERROR: No built binary found. Run npm run setup:engine first.')
  process.exit(1)
}
