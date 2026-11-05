/**
 * src/config/bot-accounts.ts
 * Loads and validates bot-accounts.json with zod. Supports MULTIPLE accounts
 * per platform; each enabled account gets its own adapter instance (Phase 4)
 * and exactly one default persona.
 *
 * Credentials are never stored in the JSON — only the NAME of the env var that
 * holds the token (tokenEnv), resolved through process.env at runtime.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { env, paths } from "./env.js";
import type { Platform } from "./constants.js";

const accountIdSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9._-]*$/i, "accountId must be [A-Za-z0-9._-]");

const BaseAccount = z.object({
  accountId: accountIdSchema,
  platform: z.enum(["discord", "telegram", "whatsapp"]),
  enabled: z.boolean().default(true),
  personaId: z.string().min(1),
  displayName: z.string().min(1).max(80).optional(),
});

const DiscordAccount = BaseAccount.extend({
  platform: z.literal("discord"),
  tokenEnv: z.string().min(1).default("DISCORD_TOKEN"),
  clientIdEnv: z.string().min(1).default("DISCORD_CLIENT_ID"),
});

const TelegramAccount = BaseAccount.extend({
  platform: z.literal("telegram"),
  tokenEnv: z.string().min(1).default("TELEGRAM_TOKEN"),
});

const WhatsAppAccount = BaseAccount.extend({
  platform: z.literal("whatsapp"),
  /** Session folder relative to project root, e.g. data/wa_auth/whatsapp-main */
  authDir: z.string().min(1).default("data/wa_auth/whatsapp-main"),
});

const AccountSchema = z.discriminatedUnion("platform", [
  DiscordAccount,
  TelegramAccount,
  WhatsAppAccount,
]);

const FileSchema = z
  .object({
    accounts: z.array(AccountSchema).min(1, "bot-accounts.json needs at least one account"),
  })
  .superRefine((data, ctx) => {
    // accountId uniqueness + keywords/personas sanity checked later by persona registry
    const seen = new Set<string>();
    for (const a of data.accounts) {
      if (seen.has(a.accountId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accounts"],
          message: `duplicate accountId "${a.accountId}"`,
        });
      }
      seen.add(a.accountId);
    }
  });

export type DiscordAccountConfig = z.infer<typeof DiscordAccount>;
export type TelegramAccountConfig = z.infer<typeof TelegramAccount>;
export type WhatsAppAccountConfig = z.infer<typeof WhatsAppAccount>;
export type BotAccountConfig = z.infer<typeof AccountSchema>;
export type AnyBotAccountConfig = BotAccountConfig & { platform: Platform };

export interface LoadedBotAccounts {
  all: BotAccountConfig[];
  enabled: BotAccountConfig[];
}

/**
 * Resolve the secret token for an account from its `tokenEnv` name.
 * WhatsApp accounts have no token (session on disk) → returns "".
 */
export function resolveToken(account: BotAccountConfig): string {
  switch (account.platform) {
    case "discord":
      return process.env[account.tokenEnv] ?? "";
    case "telegram":
      return process.env[account.tokenEnv] ?? "";
    case "whatsapp":
      return ""; // auth lives in data/wa_auth/<accountId>/
  }
}

/** Absolute path of a WhatsApp account's persisted session folder. */
export function waAuthPath(account: WhatsAppAccountConfig): string {
  return account.authDir.startsWith("/")
    ? account.authDir
    : resolve(process.cwd(), account.authDir);
}

/**
 * Load bot-accounts.json. If the file is missing, fall back to a single
 * default set derived from the simple env flags so small deployments can run
 * without the JSON (documented assumption).
 */
export function loadBotAccounts(): LoadedBotAccounts {
  let parsed: z.infer<typeof FileSchema>;

  if (existsSync(paths.botAccountsFile)) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(paths.botAccountsFile, "utf8"));
    } catch (e) {
      throw new Error(`bot-accounts.json is not valid JSON: ${(e as Error).message}`);
    }
    const result = FileSchema.safeParse(raw);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`bot-accounts.json failed validation:\n${issues}`);
    }
    parsed = result.data;
  } else {
    // Fallback defaults from env flags (one account per enabled platform).
    const fallback: BotAccountConfig[] = [];
    if (env.DISCORD_ENABLED) {
      fallback.push({
        accountId: "discord-main",
        platform: "discord",
        enabled: true,
        personaId: "luna",
        tokenEnv: "DISCORD_TOKEN",
        clientIdEnv: "DISCORD_CLIENT_ID",
      });
    }
    if (env.TELEGRAM_ENABLED) {
      fallback.push({
        accountId: "telegram-main",
        platform: "telegram",
        enabled: true,
        personaId: "kai",
        tokenEnv: "TELEGRAM_TOKEN",
      });
    }
    if (env.WHATSAPP_ENABLED) {
      fallback.push({
        accountId: env.WA_ACCOUNT_ID,
        platform: "whatsapp",
        enabled: true,
        personaId: "mira",
        authDir: `data/wa_auth/${env.WA_ACCOUNT_ID}`,
      });
    }
    parsed = { accounts: fallback };
  }

  return {
    all: parsed.accounts,
    enabled: parsed.accounts.filter((a) => a.enabled),
  };
}
