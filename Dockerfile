# ── Stage 1: Builder ──────────────────────────────────────────────────────────
# Installs all tools, compiles the C++ engine, and packages the Electron app
# into a Linux AppImage.
FROM node:20-bookworm AS builder

# System dependencies:
#   cmake + build-essential  → compile C++ engine
#   git                      → CMake FetchContent (nlohmann/json, spdlog)
#   rpm + fakeroot + dpkg    → electron-builder Linux packaging prerequisites
RUN apt-get update && apt-get install -y --no-install-recommends \
        cmake \
        build-essential \
        git \
        rpm \
        fakeroot \
        dpkg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── npm dependencies (cached until package.json changes) ──────────────────────
COPY package.json package-lock.json ./
RUN npm ci

# ── CMake FetchContent (cached until CMakeLists.txt / presets change) ─────────
# Configure only — this downloads nlohmann/json and spdlog from GitHub.
# Source files are NOT needed at configure time, so this layer is stable.
COPY engine/CMakeLists.txt    engine/CMakeLists.txt
COPY engine/CMakePresets.json engine/CMakePresets.json
RUN cmake --preset linux-release -S engine

# ── Full source ────────────────────────────────────────────────────────────────
COPY . .

# Ensure resources/icon.png exists (electron-builder requires it for AppImage).
# Creates a minimal 1×1 placeholder if the file was not committed to the repo.
RUN mkdir -p resources && node -e "\
  const fs = require('fs'); \
  if (!fs.existsSync('resources/icon.png')) { \
    const b = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQ' + \
      'AABjkB6QAAAABJRU5ErkJggg==', 'base64'); \
    fs.writeFileSync('resources/icon.png', b); \
    console.log('Created placeholder resources/icon.png'); \
  } \
"

# ── Compile C++ engine (Linux Release) ────────────────────────────────────────
RUN cmake --build engine/build/release \
    && node scripts/copy-engine.js

# ── Package Electron app for Linux ────────────────────────────────────────────
# APPIMAGE_EXTRACT_AND_RUN=1 lets appimagetool run without FUSE in containers.
ENV APPIMAGE_EXTRACT_AND_RUN=1
RUN npm run build \
    && npx electron-builder --linux --publish never


# ── Stage 2: Artifact image ───────────────────────────────────────────────────
# A minimal Alpine image that holds the built AppImage.
# Extract it with:
#   docker run --rm -v "$PWD/release":/out burbaky/timber-joint \
#     sh -c "cp /artifacts/*.AppImage /out/"
FROM alpine:3.20

WORKDIR /artifacts
COPY --from=builder /app/dist/ .

CMD ["sh", "-c", "echo 'Built artifacts:' && ls -lh /artifacts/"]
