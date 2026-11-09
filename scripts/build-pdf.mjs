#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const contentDir = join(root, "content");
const outDir = join(root, "pdf", "out");
const typst = process.env.TYPST_BIN || "typst";

const subjects = readdirSync(contentDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(join(contentDir, name, "main.typ")))
  .sort();

if (subjects.length === 0) {
  console.error("[pdf] no content/<subject>/main.typ found");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

for (const subject of subjects) {
  const main = join(contentDir, subject, "main.typ");
  const output = join(outDir, `${subject}.pdf`);
  console.log(`[pdf] ${subject} -> ${output}`);
  try {
    execFileSync(typst, ["compile", "--root", root, main, output], {
      stdio: "inherit",
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        "[pdf] Typst not found. Install Typst 0.15.1 or set TYPST_BIN.",
      );
      process.exit(1);
    }
    throw error;
  }
}

console.log(`[pdf] done: ${subjects.length} subject(s)`);
