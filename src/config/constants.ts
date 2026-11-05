/**
 * src/config/constants.ts
 * Static, non-tunable constants: identifiers, enums-as-const, limits that are
 * structural (not gameplay balance — those live in game-balance.ts).
 */

export const PROJECT_NAME = "rpg-multibot";
export const VERSION = "0.1.0";

/** Platforms the bot can run on. Values match DB CHECK constraints and adapters. */
export const PLATFORMS = ["discord", "telegram", "whatsapp"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const isPlatform = (value: string): value is Platform =>
  (PLATFORMS as readonly string[]).includes(value);

/** Equipment slots (5, per spec section 5). */
export const EQUIPMENT_SLOTS = [
  "weapon",
  "head",
  "body",
  "accessory",
  "charm",
] as const;
export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

/** Item rarities (6), lowest → highest. Colours live in rendering/themes/rarity-colors.ts. */
export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as const;
export type Rarity = (typeof RARITIES)[number];

/** The seven core stats. */
export const STATS = ["hp", "mp", "atk", "def", "mag", "spd", "luck"] as const;
export type StatKey = (typeof STATS)[number];

/** Supported UI languages. */
export const LANGUAGES = ["en", "id"] as const;
export type Language = (typeof LANGUAGES)[number];

/** Ranking board periods accepted by `ranking <board> [period]`. */
export const PERIODS = ["alltime", "weekly", "monthly"] as const;
export type Period = (typeof PERIODS)[number];

/** Command prefix characters accepted on text platforms (Telegram/WhatsApp). */
export const COMMAND_PREFIXES = ["/", "!"] as const;

/** Bot state keys stored in the bot_state table (survives restarts). */
export const BOT_STATE_KEYS = {
  lastShutdownAt: "last_shutdown_at",
  lastStartupAt: "last_startup_at",
  schemaVersion: "schema_version",
  worldBossNextAt: "world_boss_next_at",
  maintenance: "maintenance_mode",
} as const;

/** How long processed-message ids stay in the dedupe table (TTL). */
export const DEDUPE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Link codes: 6 chars, 10 minute expiry (spec section 4). */
export const LINK_CODE_LENGTH = 6;
export const LINK_CODE_TTL_MS = 10 * 60 * 1000;

/** Trade offer confirmation window. */
export const TRADE_OFFER_TTL_MS = 15 * 60 * 1000;

/** Maximum party size (mixed-platform allowed). */
export const PARTY_MAX_SIZE = 4;

/** Health endpoint path. */
export const HEALTH_PATH = "/health";

/** Message length caps per platform used by ai/safety/output-sanitizer.ts. */
export const PLATFORM_TEXT_LIMITS: Record<Platform, number> = {
  discord: 2000,
  telegram: 4096,
  whatsapp: 4096,
};

/** Hard cap for a single rendered image before platform upload (bytes). */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Graceful shutdown budget (ms) — must stay below PM2 kill_timeout / docker stop_grace_period. */
export const SHUTDOWN_GRACE_MS = 15_000;
export const SHUTDOWN_HARD_MS = 20_000;
