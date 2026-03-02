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

# Ensure resources/icon.png exists at 256×256 (electron-builder minimum for AppImage).
# Generates a solid blue placeholder if the file was not committed to the repo.
RUN mkdir -p resources && python3 -c "import struct,zlib,os;os.path.exists('resources/icon.png')and exit();chunk=lambda t,d:struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff);w=256;raw=b''.join(b'\x00'+bytes([37,99,235])*w for _ in range(w));open('resources/icon.png','wb').write(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,w,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))"

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
