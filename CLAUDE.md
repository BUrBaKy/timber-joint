# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# First-time setup (after clone)
npm install
npm run setup:engine        # CMake configure + debug build + copy binary to resources/bin/

# Daily development
npm run dev                 # electron-vite dev server + Electron window (HMR enabled)

# C++ engine only
npm run engine:configure    # cmake --preset debug -S engine
npm run engine:build:debug  # cmake --build engine/build/debug
npm run engine:copy         # copy built binary to resources/bin/

# Distribution builds
npm run package:win         # NSIS installer
npm run package:linux       # AppImage
npm run package:mac         # DMG
```

The C++ engine must be built and copied to `resources/bin/timber-engine[.exe]` before `npm run dev` will work. The engine binary is gitignored; it must always be built locally.

## Architecture

The app has three distinct layers that communicate across two boundaries.

### Three-layer stack

```
Renderer (React + R3F)
    ↕  Electron contextBridge (ipcRenderer.invoke)
Main Process (Node.js)
    ↕  stdin/stdout JSON-Lines
C++ Engine (timber-engine binary)
```

### Layer 1 — C++ Engine (`engine/`)

A standalone process that reads JSON-Lines from stdin and writes JSON-Lines to stdout. It never exits between calculations; it is spawned once at app start and kept alive.

- Entry point: `engine/src/main.cpp` — a `while(getline)` loop that calls `ipc::dispatch(line)`
- Dispatcher: `engine/src/ipc/MessageDispatcher.cpp` — parses JSON, routes by `type` field, writes response
- EC5 calculations: `engine/src/ec5/MortiseTenon.cpp` — the only calculation module currently
- JSON field names are centralized in `engine/include/ipc/Protocol.h` as `constexpr string_view` constants — **always use these, never hardcode strings**
- `spdlog` logs go to file only; stdout is exclusively JSON. Nothing else must ever be written to stdout.

**Protocol envelope** (both directions):
```json
{ "id": "uuid", "type": "calculate|result|error", "payload": { ... } }
```

### Layer 2 — Electron Main Process (`src/main/`)

- `src/main/index.ts` — creates `BrowserWindow`, spawns engine, registers IPC handlers
- `src/main/engine/EngineProcess.ts` — manages the child process; maintains a `Map<id, {resolve, reject}>` for in-flight requests
- `src/main/engine/enginePath.ts` — resolves the binary path: `resources/bin/` in dev, `process.resourcesPath/bin/` when packaged
- `src/main/ipc/engine.ipc.ts` — registers `ipcMain.handle('engine:calculate', ...)` and forwards to `EngineProcess`
- `src/main/ipc/project.ipc.ts` — handles `project:open` and `project:save` (native file dialogs + JSON read/write)

### Layer 3 — Renderer (`src/renderer/`)

**contextBridge API** (defined in `src/preload/index.ts`, typed on `Window`):
```typescript
window.electronAPI.engine.calculate(request)   // → Promise<EngineResponse>
window.electronAPI.project.openFile()           // → Promise<{filePath, data} | null>
window.electronAPI.project.saveFile(path, data) // → Promise<string | null>
```

**Always call the bridge through `src/renderer/api/bridge.ts`** — never call `window.electronAPI` directly from components.

**State** (`src/renderer/store/`) — single Zustand store with Immer, composed from four slices:
- `projectSlice` — `ProjectFile`, `filePath`, `isDirty`, joint CRUD
- `jointSlice` — `selectedJointId`, live-editing `editingJoint` (separate from persisted project state)
- `calculationSlice` — `status: idle|pending|success|error`, `result`, `error`
- `uiSlice` — active tab, sidebar width, results panel expanded state

**Calculation flow** (`src/renderer/hooks/useCalculation.ts`):
1. Hook watches the selected `MortiseTenonJoint` object
2. On change, waits 300ms debounce, then calls `engine.calculate(request)`
3. Sets `calculationSlice` to pending → then result or error
4. `ResultsPanel` and `CapacitySummary` read from `calculationSlice`

**3D scene** lives in `src/renderer/components/visualization/` and is driven by `jointSlice` state — it is independent of `calculationSlice`.

## Key Type Contract

`src/renderer/types/engine.types.ts` and `engine/include/ipc/Protocol.h` must stay in sync. If you add a field to the JSON protocol, update both files. The TypeScript types are the source of truth for shape; the C++ `Protocol.h` constants must match the exact JSON key strings.

## Project File Format

Projects are saved as `.tjd` files (plain JSON). Schema is defined in `src/renderer/types/project.types.ts`. Current version: `"1.0"`.

## Build System Notes

- `electron-vite` handles all three entry points (main/preload/renderer) in one config — see `electron.vite.config.ts`
- Path aliases: `@renderer` → `src/renderer`, `@main` → `src/main`, `@shared` → `src/shared`
- C++ build uses CMake FetchContent to pull `nlohmann/json` and `spdlog` — no vcpkg required
- CMake preset `debug` outputs to `engine/build/debug/`; `release` to `engine/build/release/`
- `scripts/copy-engine.js` copies the built binary from the build output into `resources/bin/`
- electron-builder picks up `resources/bin/` via `extraResources` in `package.json`
