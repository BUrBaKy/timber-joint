# Timber Joint Designer - Architecture Documentation

## Overview

**Timber Joint Designer** is a desktop application for structural timber joint design according to Eurocode 5 (EC5). The architecture follows an Electron-based three-process model with a separate C++ calculation engine.

```
┌──────────────────────────────────────────────────────────────┐
│                    ELECTRON APPLICATION                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐      ┌─────────────┐      ┌──────────────┐ │
│  │   RENDERER  │◄────►│   PRELOAD   │◄────►│     MAIN     │ │
│  │   PROCESS   │      │   CONTEXT   │      │   PROCESS    │ │
│  │  (React UI) │      │   BRIDGE    │      │  (Node.js)   │ │
│  └─────────────┘      └─────────────┘      └──────┬───────┘ │
│                                                     │         │
└─────────────────────────────────────────────────────┼─────────┘
                                                      │ stdin/stdout
                                                      │ JSON-Lines
                                            ┌─────────▼────────┐
                                            │   C++ ENGINE     │
                                            │ (timber-engine)  │
                                            │ EC5 Calculations │
                                            └──────────────────┘
```

---

## Module Breakdown

### 1. **MAIN PROCESS** (Electron Main - Node.js)

**Entry Point:** `src/main/index.ts`

**Responsibility:**
- Application lifecycle management (window creation, app quit)
- Spawn and manage C++ calculation engine subprocess
- Register IPC handlers for renderer communication
- Handle file system operations (save/open projects)
- Native OS integrations (dialogs, menus)

**Called By:**
- Electron framework (on app ready, window events)

**Calls:**
- `EngineProcess` → to start/stop C++ engine
- `registerAllIpc()` → to set up IPC handlers
- Electron BrowserWindow API → to create/manage windows
- File system APIs → for project I/O

**Key Files:**
- `src/main/index.ts` - Main entry point and window management
- `src/main/engine/EngineProcess.ts` - C++ engine subprocess manager
- `src/main/engine/enginePath.ts` - Locates engine binary
- `src/main/ipc/index.ts` - IPC registration coordinator

---

### 2. **PRELOAD CONTEXT** (Electron Preload)

**Entry Point:** `src/preload/index.ts`

**Responsibility:**
- **Security bridge** between renderer (untrusted) and main process (trusted)
- Exposes safe, typed APIs to renderer via `contextBridge`
- Defines the contract: what renderer can/cannot access
- Type-safe IPC method signatures

**Called By:**
- Electron framework (when creating BrowserWindow)

**Calls:**
- `ipcRenderer.invoke()` → to forward requests to main process
- `contextBridge.exposeInMainWorld()` → to expose APIs to renderer

**Exposed APIs:**
```typescript
window.electronAPI {
  engine: { calculate(request) → Promise<response> }
  project: { openFile(), saveFile() }
}
```

**Key Files:**
- `src/preload/index.ts` - Context bridge definitions

---

### 3. **RENDERER PROCESS** (React + Three.js)

**Entry Point:** `src/renderer/main.tsx`

**Responsibility:**
- User interface and interactions
- 3D visualization of timber joints
- State management (geometry, materials, loads, UI state)
- Form validation and input handling
- Trigger calculations via IPC
- Display results

**Called By:**
- User interactions (clicks, inputs, gestures)
- React lifecycle hooks
- Zustand state changes

**Calls:**
- `window.electronAPI` → to communicate with main process
- Zustand store actions → for state updates
- React Three Fiber → for 3D scene rendering

**Architecture:**

```
src/renderer/
├── main.tsx              ← Entry point (ReactDOM.render)
├── App.tsx               ← Root component (bootstraps default joint)
├── api/
│   └── bridge.ts         ← Typed wrappers around window.electronAPI
├── store/
│   ├── index.ts          ← Combined Zustand store (immer middleware)
│   ├── projectSlice.ts   ← Project metadata (name, path, modified date)
│   ├── jointSlice.ts     ← Joint data (geometry, material, loads)
│   ├── calculationSlice.ts ← Calculation results from engine
│   └── uiSlice.ts        ← UI state (tabs, selection, view mode)
├── components/
│   ├── layout/           ← App shell, header, sidebar
│   ├── input/            ← Form inputs for geometry/material/loads
│   ├── results/          ← Display calculation results (checks, utilization)
│   └── visualization/    ← 3D scene components (Three.js/R3F)
│       ├── Viewport3D.tsx         ← Canvas container
│       ├── ViewModeControls.tsx   ← Rendered/Transparent/Wireframe buttons
│       └── scene/
│           ├── MortiseTenonScene.tsx ← Main 3D assembly coordinator
│           ├── TimberMember.tsx      ← Reusable beam component
│           ├── Tenon.tsx             ← Tenon geometry
│           ├── Mortise.tsx           ← Mortise cavity (5-sided pocket)
│           └── AxisLabel.tsx         ← Axis endpoint labels (M1S, M1E, M2S, M2E)
├── types/
│   ├── engine.types.ts   ← Engine request/response interfaces
│   └── project.types.ts  ← Project file structure
└── hooks/                ← Custom React hooks (if any)
```

**State Management (Zustand):**
- **Sliced architecture**: 4 independent slices combined into one store
- **Immer middleware**: Draft-based immutable updates
- **Critical pattern**: Use selector functions, NOT destructuring
  ```typescript
  // ✅ CORRECT
  const viewMode = useStore(state => state.viewMode)
  
  // ❌ WRONG (causes black screen/rendering issues)
  const { viewMode } = useStore()
  ```

**3D Visualization Stack:**
- **React Three Fiber** (R3F) - React renderer for Three.js
- **@react-three/drei** - Helper components (Html, OrbitControls)
- **Three.js** - Low-level 3D engine

---

### 4. **IPC LAYER** (Main Process IPC Handlers)

**Entry Point:** `src/main/ipc/index.ts` → `registerAllIpc()`

**Responsibility:**
- Handle IPC requests from renderer
- Route calculation requests to C++ engine
- Manage file dialogs and project I/O
- Data validation and migration (old project files)

**Called By:**
- Renderer process (via preload bridge)

**Calls:**
- `engineProcess.calculate()` → forwards to C++ engine
- Electron dialog APIs → for open/save dialogs
- Node.js `fs/promises` → for file operations

**Registered Handlers:**

| Channel            | Handler File         | Action                                    |
|--------------------|----------------------|-------------------------------------------|
| `engine:calculate` | `engine.ipc.ts`      | Forward calculation request to C++ engine |
| `project:open`     | `project.ipc.ts`     | Open `.tjd` file via dialog               |
| `project:save`     | `project.ipc.ts`     | Save project to `.tjd` file               |

**Key Files:**
- `src/main/ipc/index.ts` - IPC registration
- `src/main/ipc/engine.ipc.ts` - Engine calculation handler
- `src/main/ipc/project.ipc.ts` - Project file I/O handlers (includes migration logic)

---

### 5. **ENGINE PROCESS** (C++ Subprocess)

**Entry Point:** `engine/src/main.cpp` → `main()`

**Responsibility:**
- Structural calculations per Eurocode 5
- JSON-Lines protocol: read from stdin, write to stdout
- Parse geometry/material/load requests
- Execute EC5 verification algorithms
- Return structured results (checks, utilization, pass/fail)

**Called By:**
- `EngineProcess` class in main process (via stdin)

**Calls:**
- `ipc::dispatch()` → parse incoming JSON-Lines
- `ec5::MortiseTenon::verify()` → run EC5 calculations
- `std::cout` → send JSON-Lines responses

**Architecture:**

```
engine/
├── src/
│   ├── main.cpp                    ← Entry point (stdin/stdout loop)
│   ├── ipc/
│   │   └── MessageDispatcher.cpp   ← Parse requests, serialize responses
│   └── ec5/
│       └── MortiseTenon.cpp        ← EC5 verification algorithms
├── include/
│   ├── ipc/
│   │   └── Protocol.h              ← JSON field constants, interfaces
│   └── ec5/
│       └── MortiseTenon.h          ← EC5 data structures, verify() function
└── CMakeLists.txt                  ← Build configuration
```

**Communication Protocol:**
- **Format:** JSON-Lines (one JSON object per line)
- **Direction:** Bidirectional (stdin/stdout)
- **Request:**
  ```json
  {
    "id": "uuid",
    "type": "mortise_tenon",
    "payload": {
      "geometry": { beam_width, beam_height, tenon_width, ... },
      "material": { grade, service_class, load_duration_class },
      "loads": { Fv_Ed, Ft_Ed }
    }
  }
  ```
- **Response:**
  ```json
  {
    "id": "uuid",
    "type": "result",
    "payload": {
      "checks": [{ id, label, Rd, Ed, utilisation, unit, passed }, ...],
      "summary": { passed, max_utilisation, governing_check }
    }
  }
  ```

**Build System:**
- CMake with Visual Studio 2022 generator
- Output: `resources/bin/timber-engine.exe`
- Bundled with Electron app in production

**Key Files:**
- `engine/src/main.cpp` - Entry point and stdin/stdout loop
- `engine/src/ipc/MessageDispatcher.cpp` - JSON parsing and routing
- `engine/src/ec5/MortiseTenon.cpp` - EC5 calculations
- `engine/include/ipc/Protocol.h` - Protocol constants and types

---

### 6. **ENGINE PROCESS MANAGER** (Main Process Utility)

**Entry Point:** `src/main/engine/EngineProcess.ts` → `new EngineProcess(path)`

**Responsibility:**
- Spawn C++ engine as child process
- Manage process lifecycle (start/stop/restart)
- Request/response correlation (async Promise-based API)
- Timeout handling and error recovery
- Parse JSON-Lines from stdout
- Forward stderr to console

**Called By:**
- Main process (`src/main/index.ts`)

**Calls:**
- Node.js `child_process.spawn()` → start engine
- Node.js `readline` → parse stdout lines
- C++ engine stdin → send JSON requests

**API:**
```typescript
class EngineProcess {
  start(): void                              // Spawn process
  stop(): void                               // Kill process
  calculate(request): Promise<response>      // Send request, await response
  isRunning(): boolean                       // Check health
}
```

**Key Features:**
- **Async correlation:** Maps request IDs to Promise resolve/reject
- **Timeout protection:** 10s timeout per request
- **Graceful errors:** Returns error responses instead of throwing
- **Event emitter:** Can emit process events (exit, error)

**Key Files:**
- `src/main/engine/EngineProcess.ts` - Process manager class
- `src/main/engine/enginePath.ts` - Locate binary in dev/prod

---

## Data Flow Examples

### Example 1: User Triggers Calculation

```
1. User clicks "Calculate" in UI
   └─► React component calls useStore(state => state.calculate)

2. Store action `calculate()` called
   └─► calculationSlice.ts → api/bridge.ts → bridge.calculate(request)

3. Bridge forwards to preload
   └─► window.electronAPI.engine.calculate(request)

4. Preload forwards to main via IPC
   └─► ipcRenderer.invoke('engine:calculate', request)

5. Main IPC handler receives request
   └─► engine.ipc.ts → engineProcess.calculate(request)

6. EngineProcess sends JSON to C++ stdin
   └─► process.stdin.write(JSON.stringify(request) + '\n')

7. C++ engine processes request
   └─► main.cpp → ipc::dispatch() → ec5::MortiseTenon::verify()

8. C++ sends JSON response to stdout
   └─► std::cout << JSON.stringify(response) << '\n'

9. EngineProcess parses stdout line
   └─► Resolves Promise with response

10. IPC handler returns response
    └─► ipcMain.handle() returns to renderer

11. Bridge Promise resolves
    └─► calculationSlice updates store with results

12. React re-renders with new data
    └─► Results component displays checks/utilization
```

### Example 2: User Opens Project File

```
1. User clicks File → Open
   └─► Header component calls useStore(state => state.loadProject)

2. Store action forwards to bridge
   └─► bridge.project.openFile()

3. Preload forwards to main
   └─► ipcRenderer.invoke('project:open')

4. Main shows native dialog
   └─► dialog.showOpenDialog() → user selects .tjd file

5. Main reads file
   └─► fs.readFile(filePath, 'utf-8') → parse JSON

6. Main migrates old data (if needed)
   └─► Add secondary_width, secondary_height, member_angle defaults

7. Main returns file data
   └─► Returns { filePath, data }

8. Store updates project state
   └─► projectSlice + jointSlice updated with loaded data

9. React re-renders entire UI
   └─► Forms, 3D scene, results all update
```

### Example 3: User Changes Geometry Input

```
1. User types in "Tenon Width" input
   └─► GeometryForm component onChange handler

2. Handler updates Zustand store
   └─► useStore(state => state.updateGeometry({ tenon_width: value }))

3. Store updates via Immer draft
   └─► jointSlice.ts → draft.geometry.tenon_width = value

4. Multiple components re-render
   ├─► GeometryForm (shows new value)
   ├─► MortiseTenonScene (updates 3D geometry)
   └─► Results panel (clears stale results)

5. If auto-calculate enabled, trigger calculation
   └─► See Example 1 flow
```

---

## Critical Integration Points

### 1. **Preload → Main IPC Channels**
- **Location:** `src/preload/index.ts`
- **Purpose:** Security boundary - defines what renderer can access
- **Pattern:** `ipcRenderer.invoke(channel, args)` → `ipcMain.handle(channel, handler)`

### 2. **Main → Engine stdin/stdout**
- **Location:** `src/main/engine/EngineProcess.ts`
- **Purpose:** Async communication with C++ subprocess
- **Pattern:** Write JSON to stdin → Read JSON from stdout → Correlate by ID

### 3. **Renderer → Zustand Store**
- **Location:** `src/renderer/store/index.ts`
- **Purpose:** Centralized application state
- **Pattern:** Components call `useStore(selector)` → actions update via Immer

### 4. **Zustand → Bridge → IPC**
- **Location:** `src/renderer/api/bridge.ts`
- **Purpose:** Typed abstraction over `window.electronAPI`
- **Pattern:** Store actions call `bridge.engine.calculate()` → IPC → Engine

### 5. **React Three Fiber Scene**
- **Location:** `src/renderer/components/visualization/scene/MortiseTenonScene.tsx`
- **Purpose:** 3D joint visualization coordinator
- **Pattern:** Reads geometry from store → Renders Three.js meshes → Handles user interactions

---

## Build and Package Process

### Development Mode
```bash
npm run dev
# 1. electron-vite dev starts:
#    - Vite dev server for renderer (React + HMR)
#    - TypeScript compilation for main/preload
#    - Electron launches with dev tools
# 2. C++ engine must be pre-built:
#    npm run setup:engine
```

### Production Build
```bash
npm run package:win  # (or :linux, :mac)
# 1. npm run build → electron-vite build
#    - Bundles renderer (Vite production build)
#    - Compiles main/preload (TypeScript → JS)
# 2. npm run engine:build:release
#    - CMake builds C++ engine in Release mode
# 3. npm run engine:copy
#    - Copies binary to resources/bin/
# 4. electron-builder --win
#    - Packages Electron app + resources → installer
```

**Output:**
- Windows: `dist/Timber Joint Designer Setup.exe` (NSIS installer)
- Linux: `dist/Timber Joint Designer.AppImage`
- Mac: `dist/Timber Joint Designer.dmg`

**Bundled Files:**
- `out/main/` - Compiled main process
- `out/preload/` - Compiled preload script
- `out/renderer/` - Bundled React app
- `resources/bin/timber-engine.exe` - C++ calculation engine

---

## Technology Stack Summary

| Layer           | Technology                    | Purpose                          |
|-----------------|-------------------------------|----------------------------------|
| **Desktop App** | Electron 32                   | Cross-platform desktop framework |
| **Main Process**| Node.js + TypeScript          | Process management, file I/O     |
| **Renderer**    | React 18 + TypeScript         | UI framework                     |
| **UI Library**  | Radix UI + Tailwind CSS       | Component primitives + styling   |
| **State**       | Zustand + Immer               | Reactive state management        |
| **3D Graphics** | Three.js + React Three Fiber  | 3D visualization                 |
| **Engine**      | C++ 17 + CMake                | EC5 calculations                 |
| **JSON Parser** | nlohmann/json                 | C++ JSON parsing                 |
| **IPC**         | Electron IPC + JSON-Lines     | Inter-process communication      |
| **Build**       | Vite + electron-vite          | Fast bundling and HMR            |
| **Package**     | electron-builder              | App installers                   |

---

## Security Considerations

1. **Context Isolation Enabled** (`contextIsolation: true`)
   - Renderer cannot access Node.js APIs directly
   - All main process access via `contextBridge`

2. **Node Integration Disabled** (`nodeIntegration: false`)
   - Prevents arbitrary Node.js code execution in renderer

3. **Sandboxed Renderer** (`sandbox: false` - disabled for IPC performance)
   - Trade-off: Performance vs. strict sandboxing

4. **Preload Whitelist**
   - Only explicitly exposed APIs available to renderer
   - Typed contracts prevent misuse

5. **C++ Engine Isolation**
   - Runs as separate subprocess (no direct memory access)
   - Crash-isolated from Electron app
   - stdin/stdout provides safe text-based protocol

---

## Performance Optimizations

1. **Zustand with Immer**
   - Efficient draft-based updates
   - Minimal re-renders (selector-based subscriptions)

2. **React Three Fiber**
   - RequestAnimationFrame-based rendering
   - Automatic disposal of Three.js resources
   - Instanced rendering for repeated geometries

3. **C++ Engine**
   - Compiled native code (faster than JavaScript)
   - Unbuffered stdout for immediate responses
   - Stateless design (no memory leaks)

4. **JSON-Lines Protocol**
   - Streaming parser (no need to buffer entire response)
   - Line-delimited for easy splitting

5. **Vite HMR**
   - Fast development iteration
   - Module-level hot reloading

---

## Known Limitations and Future Work

### Current Limitations
1. **Single Joint Type:** Only mortise-tenon joints supported
2. **2D Analysis:** No 3D stress distribution (EC5 analytical formulas only)
3. **Single Load Case:** No load combinations yet
4. **No Undo/Redo:** State history not implemented
5. **Windows-focused:** Primary development/testing on Windows

### Planned Enhancements
1. Additional joint types (dowel, screw, plate connectors)
2. Multi-joint assemblies
3. Load combination manager (ULS, SLS)
4. Report generation (PDF export)
5. Material database integration
6. Cloud sync for projects

---

## Debugging Tips

### Main Process Debugging
```bash
# Add --inspect flag to Electron
electron-vite dev --inspect
# Attach Chrome DevTools to chrome://inspect
```

### Renderer Debugging
- DevTools auto-open in dev mode
- React DevTools available
- Console logs from renderer appear in DevTools

### C++ Engine Debugging
```bash
# Run engine manually with stdin/stdout
./resources/bin/timber-engine.exe
# Paste JSON request, see response
```

### IPC Debugging
- All IPC calls logged to console with `[IPC]` prefix
- Check `console.log` in `src/main/ipc/*.ts`

### State Debugging
```typescript
// In any component
console.log(useStore.getState())
```

---

## File Structure Overview

```
timber-joint/
├── src/
│   ├── main/           # Electron main process (Node.js)
│   ├── preload/        # Context bridge (security layer)
│   └── renderer/       # React UI (browser context)
├── engine/             # C++ calculation engine
│   ├── src/            # Implementation (.cpp)
│   └── include/        # Headers (.h)
├── resources/          # Assets bundled with app
│   └── bin/            # Compiled engine binary
├── scripts/            # Build utilities (copy-engine.js)
├── out/                # Built Electron app (dev/prod)
└── dist/               # Packaged installers (after electron-builder)
```

---

## Quick Reference: Module Call Graph

```
Startup:
  Electron → Main Process (index.ts)
    → EngineProcess.start() → C++ engine spawned
    → registerAllIpc() → IPC handlers ready
    → createWindow() → Renderer loads

User Action (Calculate):
  Renderer (Button click)
    → Store action (calculationSlice)
      → Bridge (api/bridge.ts)
        → Preload (window.electronAPI)
          → IPC (ipcRenderer.invoke)
            → Main (engine.ipc.ts)
              → EngineProcess.calculate()
                → C++ stdin (JSON request)
                  → C++ stdout (JSON response)
                → Promise resolves
              → IPC returns
            → Preload returns
          → Bridge returns
        → Store updates
      → React re-renders

User Action (Open File):
  Renderer (Menu click)
    → Store action (projectSlice)
      → Bridge (project.openFile)
        → Preload
          → IPC
            → Main (project.ipc.ts)
              → dialog.showOpenDialog()
              → fs.readFile()
              → Data migration
            → Returns { filePath, data }
          → Preload returns
        → Bridge returns
      → Store bulk update
    → All UI re-renders

3D Scene Updates:
  Store geometry change
    → MortiseTenonScene re-renders
      → TimberMember, Tenon, Mortise update positions
      → AxisLabel updates positions
      → Three.js re-renders frame
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-23  
**Project Version:** 0.1.0
