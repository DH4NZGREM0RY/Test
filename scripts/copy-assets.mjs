#!/usr/bin/env node
/**
 * scripts/copy-assets.mjs
 * tsc only compiles .ts files. Rendering assets (fonts, icons, backgrounds,
 * frames) must be copied into dist/ so the built app finds them at runtime.
 * Runs automatically as part of `npm run build`.
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcAssets = resolve(root, "src/rendering/assets");
const dstAssets = resolve(root, "dist/rendering/assets");

if (!existsSync(srcAssets)) {
  console.warn("[copy-assets] src/rendering/assets missing — nothing to copy.");
  process.exit(0);
}

mkdirSync(dstAssets, { recursive: true });

// Copy every asset subfolder that exists (fonts/, icons/, backgrounds/, frames/)
for (const entry of readdirSync(srcAssets, { withFileTypes: true })) {
  const from = resolve(srcAssets, entry.name);
  const to = resolve(dstAssets, entry.name);
  cpSync(from, to, { recursive: true });
  console.log(`[copy-assets] ${entry.name} -> dist/rendering/assets/${entry.name}`);
}

console.log("[copy-assets] done.");
