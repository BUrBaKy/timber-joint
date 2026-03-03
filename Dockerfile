# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
        cmake \
        build-essential \
        git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node deps (cached until package.json changes)
COPY package.json package-lock.json ./
RUN npm ci

# Copy full source
COPY . .

# Configure and build C++ engine (Linux Release)
RUN cmake --preset linux-release -S engine \
    && cmake --build engine/build/release \
    && node scripts/copy-engine.js

# Build web renderer + bundle server into a single out/server.js
RUN npm run build:web


# ── Stage 2: Production image ──────────────────────────────────────────────────
# Lean Node image — no build tools, no source files, just the compiled output
# and the C++ engine binary.
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/out/web-renderer/ ./out/web-renderer/
COPY --from=builder /app/out/server.js     ./out/server.js
COPY --from=builder /app/resources/bin/timber-engine ./resources/bin/timber-engine

EXPOSE 3000

CMD ["node", "out/server.js"]
