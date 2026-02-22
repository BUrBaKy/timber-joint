#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."

echo "[build-engine] Configuring CMake (debug preset)..."
cmake --preset debug -S "$ROOT/engine"

echo "[build-engine] Building..."
cmake --build "$ROOT/engine/build/debug"

echo "[build-engine] Copying binary..."
node "$SCRIPT_DIR/copy-engine.js"

echo "[build-engine] Done."
