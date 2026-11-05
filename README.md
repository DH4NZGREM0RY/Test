# rpg-multibot

A production-grade **semi-RPG chatbot** that runs on **Discord, Telegram and WhatsApp at the same time**, from **one codebase** and **one shared SQLite database**, featuring in-character **AI personas**.

> Full documentation is delivered in Phase 14. This is the Phase 1 skeleton.

## What it does (overview)

- **RPG game**: characters, 5 classes, 8 base races with 3-tier evolution trees, leveling, economy, inventory/crafting/enchanting, turn-based PvE/PvP combat, exploration (hunt/mine/fish), dungeons, parties, quests, achievements + titles, guilds with bank & weekly wars, pets, trades, a scheduled world boss, and 13 ranking boards.
- **AI personas**: each bot account has its own persona (Luna / Kai / Mira). Keyword summoning with strict first-word matching, DB-backed sessions that survive restarts, prompt-injection defenses, provider-agnostic generation (any OpenAI-compatible endpoint: Qwen, Ollama, vLLM, OpenRouter), and a **never-repeat** engine (fingerprinted reply history, shingle similarity, regeneration strategy, persistent shuffle-bags).
- **Image cards** rendered with `@napi-rs/canvas` and bundled fonts only: STATUS CARD, paginated ACHIEVEMENT LIST, RACE TREE, and 13 individually designed RANKING BOARDS.
- **24/7 operation with a hard restart every 3 hours** — PM2 `cron_restart` or Docker — with zero data loss: everything important lives in SQLite; activity counters are batched and flushed on shutdown; WhatsApp sessions persist per account; battles, AI sessions and cooldowns resume automatically.

## Repository layout

See `docs/ARCHITECTURE.md` (Phase 14) for the full diagram. Quick map:

```
src/config      env + bot accounts + tunable game balance
src/bootstrap   startup/shutdown, locks, watchdog, health server
src/platforms   discord / telegram / whatsapp adapters (translation ONLY)
src/core        unified message types, pipeline, middlewares, command router
src/commands    ONE file per command, ALL subcommands inside it (flat folder)
src/ai          persona engine: trigger, sessions, providers, anti-repeat, safety
src/rendering   canvas engine, themes, components, all image cards & boards
src/game        static data, systems, formulas
src/db          client, migrations 001-009, repositories (the only SQL)
src/services    scheduler, recovery, buffers, broadcast, cache, anti-abuse
src/i18n        en + id, variant-array aware
tests           unit + integration (vitest)
scripts         migrate, seed, backup/restore, checks, docs, previews
```

## Quick start (will be fully documented in Phase 14)

```bash
cp .env.example .env            # fill tokens + AI endpoint
cp bot-accounts.example.json bot-accounts.json
npm install
npm run build
npm run migrate && npm run seed
node dist/main.js               # or: pm2 start ecosystem.config.cjs
```

### Platform setup essentials

- **Discord**: enable the **Message Content intent** (privileged) in the developer portal; invite the bot with `bot` + `applications.commands` scopes.
- **Telegram**: disable the bot's **group privacy mode** (`/setprivacy` in @BotFather) so chat counting and keyword summoning work in groups.
- **WhatsApp**: first run prints a QR once; the session persists under `data/wa_auth/<accountId>/` and survives every restart (no re-scan).

## Requirements

Node.js 20+, npm 10+. Native modules (`better-sqlite3`, `@napi-rs/canvas`) need build tools on bare metal; the Docker image handles this automatically.

## Status

Phase 1 complete: root configuration, TypeScript/ESM tooling, environment template, bot-account template, PM2 + Docker deployment files, README skeleton.
