#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const generatedDir = join(root, "content", "generated");
const publicDir = join(root, "web", "public", "data");

if (!existsSync(generatedDir)) {
  console.log("[data-assets] no content/generated yet; run npm run validate first");
  process.exit(0);
}

mkdirSync(publicDir, { recursive: true });
const files = readdirSync(generatedDir).filter((file) => file.endsWith(".json"));
for (const file of files) {
  copyFileSync(join(generatedDir, file), join(publicDir, file));
}
console.log(`[data-assets] synced ${files.length} file(s) to web/public/data`);
