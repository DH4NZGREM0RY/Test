# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow SemVer.

## [0.1.0] - 2026-11-05

### Added — Phase 1: root configuration & tooling
- `package.json` — ESM + TypeScript build, PM2/Docker-ready scripts (`migrate`, `seed`, `backup`, `restore`, `register-commands`, `check:structure`, `check:personas`, `render:preview`, `verify:restart`).
- `tsconfig.json` — strict TS (NodeNext ESM, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- `vitest.config.ts` — fork pool for native modules (canvas, better-sqlite3).
- `eslint.config.js` — flat config with architecture guards (dependency-direction rules for platforms/core/game/ai/rendering) and commands-folder restrictions.
- `.prettierrc`, `.editorconfig`, `.gitignore`, `.dockerignore`.
- `.env.example` — every secret/tunable documented (platform tokens, AI endpoint & limits, paths, ops flags).
- `bot-accounts.example.json` — multi-account template: `discord-main→luna`, `telegram-main→kai`, `whatsapp-main→mira`.
- `ecosystem.config.cjs` — PM2 with `cron_restart "0 */3 * * *"`, exponential backoff, kill_timeout for graceful shutdown.
- `Dockerfile` (multi-stage, native build deps, healthcheck) + `docker-compose.yml` (`restart: unless-stopped`, `./data` volume so DB/WA-sessions/backups survive restarts).
- `README.md` skeleton.

### Pending phases
- Phase 2: database (client, migrations 001–009, repositories, backup) + migrate/seed scripts
- Phase 3: core pipeline, middleware, i18n with variants, utils, cache & activity-buffer services
- Phase 4: platform adapters (Discord / Telegram / WhatsApp, multi-account, per-account WA sessions)
- Phases 5–7: game data, formulas and all systems
- Phases 8–9: rendering engine, themes, components, status card, achievement list, race tree, 13 ranking boards
- Phases 10–11: AI personas, triggers, sessions, providers, safety, anti-repeat engine
- Phase 12: commands (three batches) + structure/persona/doc scripts
- Phase 13: bootstrap, scheduler, recovery, deployment finalisation
- Phase 14: tests, docs, full README
