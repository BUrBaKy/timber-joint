# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
        cmake \
        build-essential \
        git \
        rpm \
        fakeroot \
        dpkg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node deps (cached until package.json changes)
COPY package.json package-lock.json ./
RUN npm ci

# Copy full source before cmake — CMake validates source file paths at configure time
COPY . .

# Ensure resources/icon.png exists (electron-builder requires it for AppImage).
RUN mkdir -p resources && node -e "\
  const fs = require('fs'); \
  if (!fs.existsSync('resources/icon.png')) { \
    const b = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQ' + \
      'AABjkB6QAAAABJRU5ErkJggg==', 'base64'); \
    fs.writeFileSync('resources/icon.png', b); \
    console.log('Created placeholder resources/icon.png'); \
  } \
"

# Configure and build C++ engine (Linux Release)
RUN cmake --preset linux-release -S engine \
    && cmake --build engine/build/release \
    && node scripts/copy-engine.js

# Package Electron app for Linux
# APPIMAGE_EXTRACT_AND_RUN=1 lets appimagetool run without FUSE in containers.
ENV APPIMAGE_EXTRACT_AND_RUN=1
RUN npm run build \
    && npx electron-builder --linux --publish never


# ── Stage 2: Artifact image ───────────────────────────────────────────────────
# Extract the AppImage with:
#   docker run --rm -v "$PWD/release":/out burbaky/timber-joint \
#     sh -c "cp /artifacts/*.AppImage /out/"
FROM alpine:3.20

WORKDIR /artifacts
COPY --from=builder /app/dist/ .

CMD ["sh", "-c", "echo 'Built artifacts:' && ls -lh /artifacts/"]
