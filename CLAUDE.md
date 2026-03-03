# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# First-time setup (after clone)
npm install
npm run setup:engine        # CMake configure + debug build + copy binary to resources/bin/

# Daily development — Electron desktop app
npm run dev                 # electron-vite dev server + Electron window (HMR enabled)

# Daily development — Web browser mode
npm run dev:web             # Vite dev server + WebSocket engine server (concurrent)

# C++ engine only
npm run engine:configure    # cmake --preset debug -S engine
npm run engine:build:debug  # cmake --build engine/build/debug
npm run engine:build:release # cmake --build engine/build/release --config Release
npm run engine:copy         # copy built binary to resources/bin/

# Distribution builds
npm run package:win         # NSIS installer
npm run package:linux       # AppImage
npm run package:mac         # DMG

# Web deployment
npm run build:web           # Vite bundle + esbuild server → out/
npm run start:web           # node out/server.js
```

The C++ engine must be built and copied to `resources/bin/timber-engine[.exe]` before `npm run dev` will work. The engine binary is gitignored; it must always be built locally.

There are no tests and no linter configured in this project.

## Architecture

The app has two deployment targets that share the same renderer code but differ in how they communicate with the C++ engine.

### Electron desktop (primary)

```
Renderer (React + R3F)
    ↕  Electron contextBridge (ipcRenderer.invoke)
Main Process (Node.js)
    ↕  stdin/stdout JSON-Lines
C++ Engine (timber-engine binary)
```

### Web browser mode

```
Renderer (React + R3F)
    ↕  WebSocket (bridge.web.ts)
Node.js Server (src/server/)
    ↕  stdin/stdout JSON-Lines
C++ Engine (timber-engine binary)
```

Both modes use the same renderer source. The bridge is swapped at build time via a Vite alias (see Build System Notes).

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

CMake presets: `debug` / `release` (Windows, Visual Studio 17), `linux-debug` / `linux-release` (Unix Makefiles). FetchContent pulls `nlohmann/json` v3.11.3 and `spdlog` v1.14.1 — no vcpkg required.

### Layer 2 — Electron Main Process (`src/main/`)

- `src/main/index.ts` — creates `BrowserWindow`, spawns engine, registers IPC handlers
- `src/main/engine/EngineProcess.ts` — manages the child process; maintains a `Map<id, {resolve, reject}>` for in-flight requests
- `src/main/engine/enginePath.ts` — resolves the binary path: `resources/bin/` in dev, `process.resourcesPath/bin/` when packaged
- `src/main/ipc/engine.ipc.ts` — registers `ipcMain.handle('engine:calculate', ...)` and forwards to `EngineProcess`
- `src/main/ipc/project.ipc.ts` — handles `project:open` and `project:save` (native file dialogs + JSON read/write)

### Layer 3 — Renderer (`src/renderer/`)

**Always call the bridge through `src/renderer/api/bridge.ts`** — never call `window.electronAPI` directly from components. The import `@renderer/api/bridge` is aliased at build time to the correct implementation:
- Electron: `bridge.electron.ts` (calls `window.electronAPI` via contextBridge)
- Web: `bridge.web.ts` (uses a `WsEngineClient` WebSocket + browser File API / download)

**State** (`src/renderer/store/`) — single Zustand store with Immer, composed from five slices:
- `projectSlice` — `ProjectFile`, `filePath`, `isDirty`, joint CRUD
- `jointSlice` — `selectedJointId`, live-editing `editingJoint` (separate from persisted project state)
- `calculationSlice` — `calcStatus: idle|pending|success|error`, `calcResult`, `calcError`
- `uiSlice` — active tab, sidebar width, results panel, view mode, `mainView: '3d' | 'report'`
- `unitsSlice` — `distanceUnit`, `forceUnit`, `stressUnit`, `decimals`

**Calculation flow** (`src/renderer/hooks/useCalculation.ts`):
1. Hook watches the selected `MortiseTenonJoint` object
2. On change, waits 300ms debounce, then calls `engine.calculate(request)`
3. Sets `calculationSlice` to pending → then result or error
4. `ResultsPanel` and `CapacitySummary` read from `calculationSlice`

**3D scene** lives in `src/renderer/components/visualization/` and is driven by `jointSlice` state — it is independent of `calculationSlice`.

**Unit conversion** (`src/renderer/lib/units.ts`) — `DIST_TO_MM`, `FORCE_TO_KN`, `STRESS_TO_MPA` tables plus `fromMm`, `fromKN`, `fromMPa`, `formulaFactor`. Forms convert display values to/from internal mm/kN before storing or sending to the engine.

## Key Type Contract

`src/renderer/types/engine.types.ts` and `engine/include/ipc/Protocol.h` must stay in sync. If you add a field to the JSON protocol, update both files. The TypeScript types are the source of truth for shape; the C++ `Protocol.h` constants must match the exact JSON key strings.

## Project File Format

Projects are saved as `.tjd` files (plain JSON). Schema is defined in `src/renderer/types/project.types.ts`. Current version: `"1.0"`.

## Build System Notes

- `electron-vite` handles the Electron build (main/preload/renderer) — see `electron.vite.config.ts`
- `vite.web.config.ts` handles the browser build; `src/server/index.ts` is bundled separately via esbuild
- Bridge aliasing: `electron.vite.config.ts` maps `@renderer/api/bridge` → `bridge.electron.ts`; `vite.web.config.ts` maps it → `bridge.web.ts`
- Path aliases: `@renderer` → `src/renderer`, `@main` → `src/main`, `@shared` → `src/shared`
- CMake preset `debug` outputs to `engine/build/debug/`; `release` to `engine/build/release/`
- `scripts/copy-engine.js` copies the built binary (tries release first, falls back to debug) into `resources/bin/`
- electron-builder picks up `resources/bin/` via `extraResources` in `package.json`
