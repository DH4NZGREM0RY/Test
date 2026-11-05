# ---------- build stage ----------
FROM node:20-bookworm-slim AS build

# native deps for better-sqlite3 & @napi-rs/canvas fontconfig
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm i --no-save typescript@5.7.2 tsx@4.19.2 @types/node@20

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc -p tsconfig.json

# ---------- runtime stage ----------
FROM node:20-bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libfontconfig1 tzdata curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# compiled app + bundled assets (fonts/icons live in src/rendering/assets, copied by tsc? no — copy manually)
COPY --from=build /app/dist ./dist
COPY src/rendering/assets ./src/rendering/assets
COPY scripts ./scripts
COPY docs ./docs
COPY ecosystem.config.cjs ./

# runtime dirs (mounted as a volume in docker-compose so restarts keep state)
RUN mkdir -p data/db data/backups data/cache/images data/cache/previews \
             data/wa_auth data/locks data/logs

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8787/health || exit 1

CMD ["node", "dist/main.js"]
