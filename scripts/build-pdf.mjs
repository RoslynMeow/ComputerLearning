#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

const root = resolve(process.cwd());
const contentDir = join(root, "content");
const outDir = join(root, "pdf", "out");
const publicDir = join(root, "web", "public", "pdfs");
const typst = process.env.TYPST_BIN || "typst";

const curriculumPath = join(contentDir, "curriculum.yml");
const curriculum = existsSync(curriculumPath)
  ? parseYaml(readFileSync(curriculumPath, "utf8"))
  : {};

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
mkdirSync(publicDir, { recursive: true });

const manifest = [];

for (const subject of subjects) {
  const title = curriculum?.subjects?.[subject]?.title ?? subject;
  const main = join(contentDir, subject, "main.typ");
  const output = join(outDir, `${subject}.pdf`);
  const indexPath = join(outDir, `${subject}.index.json`);

  console.log(`[pdf] ${subject} -> ${output}`);
  try {
    execFileSync(typst, ["compile", "--root", root, main, output], {
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        "[pdf] Typst not found. Install Typst 0.15.1 or set TYPST_BIN.",
      );
      process.exit(1);
    }
    console.error(String(error.stderr || error.message));
    process.exit(1);
  }

  let kus;
  try {
    const raw = execFileSync(
      typst,
      [
        "eval",
        "query(<ku>).map(it => (id: it.value.id, title: it.value.title, page: it.location().page()))",
        "--in",
        main,
        "--root",
        root,
        "--pretty",
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    kus = JSON.parse(raw);
  } catch (error) {
    console.error(`[pdf] could not read KU index for ${subject}`);
    console.error(String(error.stderr || error.message));
    process.exit(1);
  }

  const index = {
    subject,
    title,
    pdf: `/pdfs/${subject}.pdf`,
    kus,
  };
  writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");

  copyFileSync(output, join(publicDir, `${subject}.pdf`));
  copyFileSync(indexPath, join(publicDir, `${subject}.index.json`));

  manifest.push({
    subject,
    title,
    pdf: index.pdf,
    index: `/pdfs/${subject}.index.json`,
  });
}

const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
writeFileSync(join(outDir, "index.json"), manifestText, "utf8");
writeFileSync(join(publicDir, "index.json"), manifestText, "utf8");

console.log(`[pdf] done: ${subjects.length} subject(s), KU index synced to web/public/pdfs`);
