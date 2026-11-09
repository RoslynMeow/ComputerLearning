#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { parse as parseHtml } from "node-html-parser";

const root = resolve(process.cwd());
const contentDir = join(root, "content");
const outDir = join(root, "web", "public", "content");
const pdfOutDir = join(root, "pdf", "out");
const typst = process.env.TYPST_BIN || "typst";

const curriculumPath = join(contentDir, "curriculum.yml");
const curriculum = existsSync(curriculumPath)
  ? parseYaml(readFileSync(curriculumPath, "utf8"))
  : {};

const subjects = readdirSync(contentDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter(
    (name) =>
      existsSync(join(contentDir, name, "web.typ")) &&
      existsSync(join(contentDir, name, "main.typ")),
  )
  .sort();

if (subjects.length === 0) {
  console.log("[content] no content/<subject>/web.typ found");
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
mkdirSync(pdfOutDir, { recursive: true });

const manifest = [];

for (const subject of subjects) {
  const title = curriculum?.subjects?.[subject]?.title ?? subject;
  const webFile = join(contentDir, subject, "web.typ");
  const mainFile = join(contentDir, subject, "main.typ");
  const htmlPath = join(pdfOutDir, `${subject}.web.html`);
  const subjectOutDir = join(outDir, subject);
  mkdirSync(subjectOutDir, { recursive: true });

  try {
    execFileSync(
      typst,
      ["compile", "--features", "html", "--root", root, webFile, htmlPath],
      { stdio: ["ignore", "pipe", "inherit"] },
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(
        "[content] Typst not found; skip web HTML build. Install Typst 0.15.1 or set TYPST_BIN.",
      );
      process.exit(0);
    }
    throw error;
  }

  const html = readFileSync(htmlPath, "utf8");
  const doc = parseHtml(html);
  const style = doc.querySelector("style")?.textContent ?? "";
  writeFileSync(join(outDir, "typst.css"), `${style}\n`, "utf8");

  const metadata = JSON.parse(
    execFileSync(
      typst,
      [
        "eval",
        "query(<ku>).map(it => it.value)",
        "--in",
        mainFile,
        "--root",
        root,
        "--pretty",
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ),
  );

  const chapterTitles = new Map(
    (curriculum?.subjects?.[subject]?.chapters ?? []).map((chapter) => [
      chapter.id,
      chapter.title,
    ]),
  );
  const sections = doc.querySelectorAll("section.ku");
  const sectionById = new Map(
    sections
      .map((section) => [section.getAttribute("id"), section])
      .filter(([id]) => Boolean(id)),
  );

  const kus = [];
  for (const ku of metadata) {
    const section = sectionById.get(ku.id);
    if (!section) {
      console.warn(`[content] missing HTML section for ${ku.id}`);
      continue;
    }
    const file = `${ku.id}.html`;
    writeFileSync(join(subjectOutDir, file), `${section.innerHTML}\n`, "utf8");
    kus.push({
      id: ku.id,
      title: ku.title,
      title_en: ku.title_en ?? null,
      chapter: ku.chapter,
      chapterTitle: chapterTitles.get(ku.chapter) ?? ku.chapter,
      order: ku.order,
      file: `/content/${subject}/${file}`,
    });
  }

  const subjectManifest = {
    subject,
    title,
    pdf: `/pdfs/${subject}.pdf`,
    kus,
  };
  writeFileSync(
    join(subjectOutDir, "index.json"),
    `${JSON.stringify(subjectManifest, null, 2)}\n`,
    "utf8",
  );
  manifest.push({
    subject,
    title,
    index: `/content/${subject}/index.json`,
  });
  console.log(`[content] ${subject}: ${kus.length} KU page(s)`);
}

writeFileSync(
  join(outDir, "index.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
console.log(`[content] done: ${subjects.length} subject(s)`);
