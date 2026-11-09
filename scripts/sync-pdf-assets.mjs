#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const outDir = join(root, "pdf", "out");
const publicDir = join(root, "web", "public", "pdfs");

if (!existsSync(outDir)) {
  console.log("[pdf-assets] no pdf/out yet; run npm run pdf first");
  process.exit(0);
}

mkdirSync(publicDir, { recursive: true });
const files = readdirSync(outDir).filter(
  (file) => file.endsWith(".pdf") || file.endsWith(".json"),
);
for (const file of files) {
  copyFileSync(join(outDir, file), join(publicDir, file));
}
console.log(`[pdf-assets] synced ${files.length} file(s) to web/public/pdfs`);
