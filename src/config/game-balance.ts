/**
 * src/config/game-balance.ts
 * EVERY tunable number in the project lives here: XP curves, combat weights,
 * economy rates, cooldowns, anti-abuse limits, AI budgets and — critically —
 * the overall-score weights (section 5B) and the anti-repeat thresholds
 * (section 6.4). Systems/formulas import from this file; nothing hardcodes a
 * gameplay constant elsewhere so balancing never requires hunting the codebase.
 */

export const balance = {
  /* ---------------- Leveling ---------------- */
  leveling: {
    maxLevel: 100,
    /** xpForLevel(n) = ceil(base * n^exponent) — exponential curve. */
    xpBase: 100,
    xpExponent: 1.55,
    statPointsPerLevel: 2,
    hpPerLevel: 12,
    mpPerLevel: 8,
    /** Bonus XP from race/class growth modifiers is multiplied onto kills. */
    levelUpFlashMessage: true,
  },

  /* ---------------- Combat ---------------- */
  combat: {
    baseCritChance: 0.05,
    critMultiplier: 1.75,
    baseDodgeChance: 0.03,
    /** dodge scales with SPD difference, clamped. */
    dodgePerSpdDiff: 0.004,
    dodgeCap: 0.35,
    /** damage = (ATK or MAG) * power * elementMod * random(0.9..1.1) - DEF*defScale */
    defScale: 0.5,
    randomVariance: 0.1,
    defendDamageReduction: 0.5,
    defendMpRegenPct: 0.1,
    fleeBaseChance: 0.45,
    fleeSpdBonus: 0.005, // per point of SPD advantage
    fleeCap: 0.9,
    /** Elemental affinity multipliers (attacker element -> defender element). */
    elemental: { strong: 1.5, weak: 0.75, neutral: 1.0 },
    turnTimeoutSeconds: 120, // idle battles auto-flee after this
    maxPartyCombatants: 4,
  },

  /* ---------------- Exploration & dungeons ---------------- */
  exploration: {
    /** Cooldowns in milliseconds per activity. */
    cooldownsMs: {
      explore: 5 * 60_000,
      hunt: 8 * 60_000,
      mine: 8 * 60_000,
      fish: 8 * 60_000,
      dungeon: 30 * 60_000,
      rest: 6 * 60_000,
    },
    /** Success chances scale with level gap to region; these are baselines. */
    findRatios: { common: 0.6, uncommon: 0.25, rare: 0.11, epic: 0.035, legendary: 0.005 },
    xpScalePerActivity: { explore: 1.0, hunt: 1.3, mine: 1.2, fish: 1.1 },
  },

  dungeons: {
    minParty: 1,
    maxParty: 4,
    bossBonusXpPct: 0.5,
    wipeGoldLossPct: 0.05,
  },

  worldBoss: {
    intervalMinutes: 180, // overridden by WORLD_BOSS_CRON_MINUTES env if set
    damageRankRewards: [
      { rank: 1, gold: 5000, gems: 20 },
      { rank: 2, gold: 3000, gems: 12 },
      { rank: 3, gold: 2000, gems: 8 },
      { rank: 10, gold: 800, gems: 3 },
    ],
  },

  /* ---------------- Economy ---------------- */
  economy: {
    startGold: 100,
    dailyGold: [50, 65, 80, 100, 125, 150, 200], // index = streak day-1, day 7 resets streak
    dailyGemChance: 0.15,
    weeklyGold: 750,
    weeklyGems: 5,
    sellRatio: 0.5, // sell price = buy price * ratio
    giftTaxPct: 0.02, // small sink on gifting
    tradeEscrowEnabled: true,
    maxCarryGold: 100_000_000,
  },

  crafting: {
    baseSuccessChance: 0.7,
    luckFactor: 0.002, // + success per LUCK point
    maxTier: 4,
    enchantMaxLevel: 5,
    enchantStatPctPerLevel: 0.06,
    enchantFailItemLossChance: 0.1,
  },

  inventory: {
    baseCapacity: 80,
    capacityPerLevel: 1,
    maxStack: 99,
    durabilityDecayPerUse: 1,
    repairCostPctOfBuy: 0.25,
  },

  /* ---------------- PvP / ELO ---------------- */
  pvp: {
    eloStart: 1200,
    eloK: 32,
    duelMinWager: 10,
    duelMaxWager: 10_000,
    duelCooldownMs: 10 * 60_000,
    inactivityDecayEloPerDay: 5,
  },

  /* ---------------- Guilds ---------------- */
  guild: {
    createCostGold: 5000,
    createMinLevel: 10,
    bankTaxPct: 0.01,
    warIntervalDays: 7,
    memberRankLevels: [
      { level: 1, xp: 0 },
      { level: 5, xp: 2500 },
      { level: 10, xp: 10_000 },
      { level: 20, xp: 50_000 },
      { level: 30, xp: 150_000 },
    ],
  },

  pets: {
    hatchTimeMs: 24 * 60 * 60_000,
    feedCooldownMs: 6 * 60 * 60_000,
    maxActivePets: 1,
    evolveMinStage: 2,
  },

  quests: {
    dailyCount: 3,
    weeklyCount: 2,
    rerollCooldownMs: 30 * 60_000,
  },

  /* ---------------- Anti-abuse & rate limiting ---------------- */
  rateLimit: {
    /** token bucket: commands */
    commandBucketCapacity: 8,
    commandBucketRefillPerSec: 0.5,
    /** token bucket: plain chat messages (for counting, not replies) */
    chatBucketCapacity: 20,
    chatBucketRefillPerSec: 1,
    /** stricter limits for AI summons (section 9) */
    aiBucketCapacity: 4,
    aiBucketRefillPerSec: 0.1,
    spamMuteThresholdPerMin: 30,
    spamMuteDurationMs: 5 * 60_000,
    /** activity tracker caps counted chat messages at 20/min per player */
    chatCountCapPerMinute: 20,
  },

  /* ---------------- AI limits (env overrides where duplicated) ---------------- */
  ai: {
    contextTurns: 12,
    sessionIdleSeconds: 300,
    perUserCooldownMs: 3000,
    userDailyTokenBudget: 20_000,
    chatDailyTokenBudget: 120_000,
    concurrency: 2,
    timeoutMs: 20_000,
    maxRetries: 2,
    /** generation parameter nudges applied by regeneration-strategy on each retry */
    regenTemperatureStep: 0.2,
    regenFrequencyPenaltyStep: 0.2,
    regenPresencePenaltyStep: 0.15,
    maxRegenerationAttempts: 3,
  },

  /* ---------------- Anti-repeat thresholds (section 6.4) ---------------- */
  antiRepeat: {
    shingleSizeK: [3, 4] as const, // word shingles compared
    jaccardRejectThreshold: 0.5, // >= this vs any of last N replies → reject
    jaccardHistoryWindow: 60,
    consecutiveWordRunLength: 5, // any run of 5+ words reused → reject
    consecutiveRunWindow: 30,
    openingRepeatWindow: 10, // same first-3-words within last 10 → reject
    closingRepeatWindow: 10, // same last-3-words within last 10 → reject
    signatureReuseWindow: 10, // same signature word/emoji pattern max once per 10
    historyPruneKeepLast: 500, // per persona+chat
    historyPruneDays: 30,
  },

  /* ---------------- Overall score weights (ranking "overall" board) ----------------
   * The weighted composite used by game/formulas/overall-score.ts.
   * All component values are normalised to 0..1 against the current server maxima
   * before weighting, then scaled to 1000. Sum of weights = 1.0.
   */
  overallScoreWeights: {
    level: 0.2,
    achievements: 0.15,
    goldBalance: 0.1,
    chatActivity: 0.08,
    commandsUsed: 0.05,
    gamesPlayed: 0.12, // all minigames combined
    dungeonClears: 0.1,
    pvpElo: 0.1,
    questProgress: 0.05,
    guildContribution: 0.05,
  } as Record<string, number>,

  /* ---------------- Rendering ---------------- */
  rendering: {
    statusCard: { width: 1200, height: 700 },
    listCardWidth: 1100,
    renderQueueConcurrency: 2,
    renderTimeoutMs: 5000,
    renderRetries: 1,
    cacheTtlMs: 6 * 60 * 60_000,
    cacheMaxEntries: 500,
    cacheMaxBytes: 100 * 1024 * 1024,
    avatarFetchTimeoutMs: 3000,
  },

  /* ---------------- Ops ---------------- */
  ops: {
    dedupeTtlMs: 10 * 60_000,
    backupIntervalMinutes: 60,
    backupKeep: 24,
    activityFlushSeconds: 10,
    restartAnnounceThresholdSeconds: 60,
    watchdogDisconnectLimitMs: 5 * 60_000, // force-restart after 5 min disconnected
  },
} as const;

export type GameBalance = typeof balance;
