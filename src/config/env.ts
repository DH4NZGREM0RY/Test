/**
 * src/config/env.ts
 * Loads .env (via a tiny built-in parser — no dotenv dependency), validates it
 * with zod, and exposes a frozen, typed `env` object. Every other module reads
 * configuration through this file; nothing touches process.env directly.
 *
 * Also provides `reloadEnvForTests()` used by the test helpers.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Minimal .env parser (KEY=VALUE, # comments, inline values trimmed)  */
/* ------------------------------------------------------------------ */
function parseDotEnv(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // strip an inline comment only when the value isn't quoted
    if (!/^["']/.test(value)) {
      const hash = value.indexOf(" #");
      if (hash !== -1) value = value.slice(0, hash).trim();
    }
    // unwrap quotes
    if (/^".*"$/.test(value) || /^'.*'$/.test(value)) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

function loadDotEnvFile(): void {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  const parsed = parseDotEnv(readFileSync(path, "utf8"));
  for (const [k, v] of Object.entries(parsed)) {
    // real environment wins over the file (container/PM2 env overrides)
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadDotEnvFile();

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */
const boolFromEnv = z
  .string()
  .transform((s) => s.toLowerCase())
  .pipe(z.enum(["true", "false", "1", "0"]))
  .transform((s) => s === "true" || s === "1");

const intFromEnv = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((s) => (s === undefined || s === "" ? fallback : Number.parseInt(s, 10)))
    .refine((n) => Number.isFinite(n), "must be an integer");

const csvList = z
  .string()
  .optional()
  .transform((s) =>
    s === undefined || s.trim() === "" ? [] : s.split(",").map((x) => x.trim()).filter(Boolean),
  );

const EnvSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]).default("production"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  LOG_TO_FILE: boolFromEnv.default("true"),

  DATA_DIR: z.string().default("./data"),
  DB_PATH: z.string().default("./data/db/bot.db"),
  CACHE_DIR: z.string().default("./data/cache"),
  LOCK_DIR: z.string().default("./data/locks"),

  HEALTH_PORT: intFromEnv(8787),

  DISCORD_ENABLED: boolFromEnv.default("false"),
  DISCORD_TOKEN: z.string().optional().default(""),
  DISCORD_CLIENT_ID: z.string().optional().default(""),
  DISCORD_GUILD_ID: z.string().optional().default(""),

  TELEGRAM_ENABLED: boolFromEnv.default("false"),
  TELEGRAM_TOKEN: z.string().optional().default(""),

  WHATSAPP_ENABLED: boolFromEnv.default("false"),
  WA_ACCOUNT_ID: z.string().optional().default("whatsapp-main"),

  AI_ENABLED: boolFromEnv.default("false"),
  AI_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
  AI_API_KEY: z.string().optional().default(""),
  AI_MODEL: z.string().default("gpt-4o-mini"),
  AI_TIMEOUT_MS: intFromEnv(20_000),
  AI_MAX_RETRIES: intFromEnv(2),
  AI_CONCURRENCY: intFromEnv(2),
  AI_KEYWORD_STRICT: boolFromEnv.default("true"),
  AI_SESSION_IDLE_SECONDS: intFromEnv(300),
  AI_CONTEXT_TURNS: intFromEnv(12),
  AI_PER_USER_COOLDOWN_MS: intFromEnv(3_000),
  AI_USER_DAILY_TOKEN_BUDGET: intFromEnv(20_000),
  AI_CHAT_DAILY_TOKEN_BUDGET: intFromEnv(120_000),

  DEFAULT_LANGUAGE: z.enum(["en", "id"]).default("en"),
  DAILY_COOLDOWN_HOURS: intFromEnv(20),
  WEEKLY_COOLDOWN_HOURS: intFromEnv(150),
  WORLD_BOSS_CRON_MINUTES: intFromEnv(180),

  MAINTENANCE_MODE: boolFromEnv.default("false"),
  ADMIN_USER_IDS: csvList,

  BACKUP_INTERVAL_MINUTES: intFromEnv(60),
  BACKUP_KEEP: intFromEnv(24),
  ACTIVITY_FLUSH_SECONDS: intFromEnv(10),
  RESTART_ANNOUNCE_THRESHOLD_SECONDS: intFromEnv(60),
});

export type Env = z.infer<typeof EnvSchema>;

function buildEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return Object.freeze(result.data);
}

export let env: Env = buildEnv();

/** Test-only: rebuild env after mutating process.env (never used in production paths). */
export function reloadEnvForTests(overrides: Record<string, string> = {}): Env {
  for (const [k, v] of Object.entries(overrides)) process.env[k] = v;
  env = buildEnv();
  return env;
}

/** Absolute, resolved paths derived from env (single source of truth). */
export const paths = {
  get data(): string {
    return resolve(process.cwd(), env.DATA_DIR);
  },
  get db(): string {
    return resolve(process.cwd(), env.DB_PATH);
  },
  get backups(): string {
    return resolve(process.cwd(), env.DATA_DIR, "backups");
  },
  get cache(): string {
    return resolve(process.cwd(), env.CACHE_DIR);
  },
  get cacheImages(): string {
    return resolve(process.cwd(), env.CACHE_DIR, "images");
  },
  get cachePreviews(): string {
    return resolve(process.cwd(), env.CACHE_DIR, "previews");
  },
  get waAuthRoot(): string {
    return resolve(process.cwd(), env.DATA_DIR, "wa_auth");
  },
  get locks(): string {
    return resolve(process.cwd(), env.LOCK_DIR);
  },
  get logs(): string {
    return resolve(process.cwd(), env.DATA_DIR, "logs");
  },
  get botAccountsFile(): string {
    return resolve(process.cwd(), "bot-accounts.json");
  },
  get assetsDir(): string {
    // rendering assets live next to compiled code in dist OR in src during tsx dev
    const distPath = resolve(process.cwd(), "dist/rendering/assets");
    const srcPath = resolve(process.cwd(), "src/rendering/assets");
    return existsSync(distPath) ? distPath : srcPath;
  },
};
