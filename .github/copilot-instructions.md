# Copilot Instructions: Timber Joint Designer

## Project Overview

This is an Electron desktop application for designing structural timber joints according to Eurocode 5 (EC5). It features a React-based UI with 3D visualization (Three.js) and a high-performance C++ calculation engine for structural analysis.

## Architecture

### Hybrid Electron + C++ Engine

The application uses a **process-based IPC architecture**:

1. **Electron main process** (`src/main/`) spawns the C++ engine as a child process
2. **C++ engine** (`engine/`) reads JSON-Lines from stdin, performs EC5 calculations, writes JSON-Lines to stdout
3. **Renderer process** (`src/renderer/`) sends requests via IPC → main → engine, receives structured responses

Communication flow:
```
Renderer (React/Zustand) 
  ↓ window.electronAPI.engine.calculate()
Main process (EngineProcess.ts)
  ↓ stdin/stdout JSON-Lines
C++ Engine (timber-engine binary)
```

### Key Components

- **EngineProcess** (`src/main/engine/EngineProcess.ts`): Manages C++ process lifecycle, request/response queueing with timeout handling
- **State management**: Zustand with Immer middleware, slices in `src/renderer/store/`
- **UI framework**: Radix UI primitives + Tailwind CSS (shadcn/ui components)
- **3D rendering**: React Three Fiber for joint visualization

### Type Safety

TypeScript types in `src/renderer/types/engine.types.ts` **must match** C++ protocol definitions in `engine/include/ipc/Protocol.h`. Both use the same field names and structure.

## Build & Development

### Initial Setup

```bash
# Install Node dependencies
npm install

# Build C++ engine (required before first run)
npm run setup:engine
```

### Development Workflow

```bash
# Start dev server (hot reload for renderer + main)
npm run dev

# Rebuild C++ engine after changes
npm run engine:build:debug && npm run engine:copy
```

### C++ Engine Commands

```bash
# Configure CMake (one-time or after CMakeLists.txt changes)
npm run engine:configure

# Build debug version
npm run engine:build:debug

# Build release version  
npm run engine:build:release

# Copy built binary to resources/bin/
npm run engine:copy

# Full setup (configure + build debug + copy)
npm run setup:engine
```

### Packaging

```bash
# Package for Windows
npm run package:win

# Package for Linux
npm run package:linux

# Package for macOS
npm run package:mac
```

Each package command builds both the Electron app and C++ engine in release mode.

## Project Structure

```
src/
  main/           # Electron main process
    engine/       # C++ engine lifecycle management
    ipc/          # IPC handler registration
  preload/        # Context bridge (exposes electronAPI)
  renderer/       # React UI
    components/   # shadcn/ui + custom components
    store/        # Zustand state slices
    types/        # TypeScript definitions
    
engine/           # C++ calculation engine
  include/
    ec5/          # Eurocode 5 calculation logic
    ipc/          # Protocol definitions
  src/            # Implementation
```

## Key Conventions

### Path Aliases

Configured in `electron.vite.config.ts`:
- `@main` → `src/main`
- `@renderer` → `src/renderer`
- `@shared` → `src/shared` (currently unused)

### State Management Pattern

All stores use Zustand with Immer:
```typescript
export const useStore = create<AppStore>()(
  immer((...a) => ({
    ...createProjectSlice(...a),
    ...createJointSlice(...a),
    // etc.
  }))
)
```

Slices return setters that mutate draft state directly (Immer handles immutability).

### C++ Engine Protocol

- **Request format**: JSON with `{ id, type, payload }`
- **Response format**: JSON with `{ id, type: 'result' | 'error', payload }`
- Engine runs in unbuffered mode for immediate responses
- 10-second timeout per request (configurable in `EngineProcess.ts`)

### Error Handling

The C++ engine is gracefully degraded:
- If engine not built: UI shows error message with build instructions
- If engine crashes: Pending requests receive structured error responses
- Renderer always receives valid `EngineResponse` (never throws)

### Component Organization

- `src/renderer/components/input/`: Form controls for joint parameters
- `src/renderer/components/results/`: Calculation results display
- `src/renderer/components/visualization/`: 3D Three.js rendering
- `src/renderer/components/layout/`: App shell and navigation

## Testing

No test framework is currently configured. The application relies on TypeScript for type safety and manual testing in development mode.

## Development Notes

### Adding New Joint Types

1. Define TypeScript types in `src/renderer/types/engine.types.ts`
2. Add corresponding C++ structs/classes in `engine/include/ec5/`
3. Update protocol constants in `engine/include/ipc/Protocol.h`
4. Implement calculation logic in `engine/src/ec5/`
5. Register dispatcher in `engine/src/ipc/MessageDispatcher.cpp`

### Modifying Geometry/Material Parameters

When changing joint parameters, update in **three places**:
1. TypeScript interfaces (`engine.types.ts`)
2. C++ protocol constants (`Protocol.h`)
3. Calculation implementation (`engine/src/ec5/`)

### C++ Dependencies

Managed via CMake FetchContent (auto-downloaded):
- nlohmann/json (JSON parsing)
- spdlog (logging, optional)

No manual dependency installation required.
