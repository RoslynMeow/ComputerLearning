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

const root = resolve(process.cwd());
const contentDir = join(root, "content");
const generatedDir = join(contentDir, "generated");
const typst = process.env.TYPST_BIN || "typst";
const mainSections = new Set(["问题动机", "形式化定义", "证明与推导", "机制"]);
const notesSections = new Set(["实验", "来源", "连接", "易错点", "练习"]);

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readYaml(path) {
  return parseYaml(readFileSync(path, "utf8"));
}

function sectionTitles(path) {
  const text = readFileSync(path, "utf8");
  return [...text.matchAll(/^\s*===\s+(.+?)\s*$/gm)].map((match) =>
    match[1].trim(),
  );
}

function loadKus(subject) {
  const main = join(contentDir, subject, "main.typ");
  let raw;
  try {
    raw = execFileSync(
      typst,
      [
        "eval",
        "query(<ku>).map(it => it.value)",
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
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        "[validate] Typst not found. Install Typst 0.15.1 or set TYPST_BIN.",
      );
      process.exit(1);
    }
    console.error(String(error.stderr || error.message));
    process.exit(1);
  }
  return JSON.parse(raw).map((ku) => ({ ...ku, subject }));
}

function kuPrefix(ku) {
  const slug = String(ku.id).split(".").pop();
  return `${String(ku.order).padStart(2, "0")}-${slug}`;
}

const bibliographyPath = join(contentDir, "bibliography.yml");
const curriculumPath = join(contentDir, "curriculum.yml");
if (!existsSync(bibliographyPath)) fail("content/bibliography.yml is missing");
if (!existsSync(curriculumPath)) fail("content/curriculum.yml is missing");
if (errors.length > 0) {
  for (const error of errors) console.error(`  x ${error}`);
  process.exit(1);
}

const bibliography = readYaml(bibliographyPath);
const curriculum = readYaml(curriculumPath);
const configuredSubjects = curriculum?.subjects ?? {};

const subjects = readdirSync(contentDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(join(contentDir, name, "main.typ")))
  .sort();

for (const subject of subjects) {
  if (!configuredSubjects[subject]) {
    fail(`subject ${subject} has main.typ but is not in curriculum.yml`);
  }
}
for (const subject of Object.keys(configuredSubjects)) {
  if (!subjects.includes(subject)) {
    warn(`curriculum subject ${subject} has no content main.typ`);
  }
}

const allKus = [];
for (const subject of subjects) {
  const kus = loadKus(subject);
  if (kus.length === 0) fail(`subject ${subject} has no KU metadata`);
  allKus.push(...kus);
}

const byId = new Map();
for (const ku of allKus) {
  if (byId.has(ku.id)) fail(`duplicate KU id: ${ku.id}`);
  byId.set(ku.id, ku);
}

const chapterMap = new Map();
for (const [subject, config] of Object.entries(configuredSubjects)) {
  for (const chapter of config.chapters ?? []) {
    chapterMap.set(chapter.id, { subject, chapter });
  }
}

for (const ku of allKus) {
  for (const field of [
    "id",
    "title",
    "chapter",
    "order",
    "prerequisites",
    "related",
    "sources",
    "labs",
    "exercises",
  ]) {
    if (ku[field] === undefined || ku[field] === null) {
      fail(`${ku.id}: missing field ${field}`);
    }
  }

  if (!chapterMap.has(ku.chapter)) {
    fail(`${ku.id}: unknown chapter ${ku.chapter}`);
  } else if (chapterMap.get(ku.chapter).subject !== ku.subject) {
    fail(
      `${ku.id}: chapter ${ku.chapter} does not belong to subject ${ku.subject}`,
    );
  }

  if (!Array.isArray(ku.prerequisites)) {
    fail(`${ku.id}: prerequisites must be an array`);
  }
  for (const prerequisite of ku.prerequisites ?? []) {
    if (prerequisite === ku.id) fail(`${ku.id}: self prerequisite`);
    if (!byId.has(prerequisite)) {
      fail(`${ku.id}: missing prerequisite ${prerequisite}`);
    }
  }

  for (const related of ku.related ?? []) {
    if (!byId.has(related)) {
      warn(`${ku.id}: related KU not found yet: ${related}`);
    }
  }

  if (!Array.isArray(ku.sources) || ku.sources.length === 0) {
    fail(`${ku.id}: at least one source is required`);
  }
  for (const source of ku.sources ?? []) {
    if (!source.book) {
      fail(`${ku.id}: source without book id`);
      continue;
    }
    const entry = bibliography[source.book];
    if (!entry) fail(`${ku.id}: unknown book ${source.book}`);
    if (
      source.edition !== undefined &&
      entry?.edition !== undefined &&
      String(source.edition) !== String(entry.edition)
    ) {
      fail(
        `${ku.id}: edition ${source.edition} does not match bibliography ${source.book} (${entry.edition})`,
      );
    }
  }

  if (!Array.isArray(ku.labs) || ku.labs.length === 0) {
    fail(`${ku.id}: at least one lab id is required`);
  }
  if (!Array.isArray(ku.exercises) || ku.exercises.length === 0) {
    fail(`${ku.id}: at least one exercise id is required`);
  }

  const prefix = kuPrefix(ku);
  const mainFile = join(contentDir, ku.subject, ku.chapter, `${prefix}.typ`);
  const notesFile = join(
    contentDir,
    ku.subject,
    ku.chapter,
    `${prefix}.notes.typ`,
  );

  if (!existsSync(mainFile)) {
    fail(`${ku.id}: missing main file ${mainFile}`);
  } else {
    const titles = sectionTitles(mainFile);
    for (const title of titles) {
      if (!mainSections.has(title)) {
        fail(`${ku.id}: main file contains non-main section ${title}`);
      }
    }
    for (const title of mainSections) {
      if (!titles.includes(title)) {
        fail(`${ku.id}: main file missing section ${title}`);
      }
    }
  }

  if (!existsSync(notesFile)) {
    fail(`${ku.id}: missing notes file ${notesFile}`);
  } else {
    const titles = sectionTitles(notesFile);
    for (const title of titles) {
      if (!notesSections.has(title)) {
        fail(`${ku.id}: notes file contains non-notes section ${title}`);
      }
    }
    for (const title of notesSections) {
      if (!titles.includes(title)) {
        fail(`${ku.id}: notes file missing section ${title}`);
      }
    }
  }
}

for (const [subject, config] of Object.entries(configuredSubjects)) {
  for (const chapter of config.chapters ?? []) {
    const actual = allKus
      .filter((ku) => ku.subject === subject && ku.chapter === chapter.id)
      .sort((left, right) => left.order - right.order);
    const listed = chapter.kus ?? [];

    for (const id of listed) {
      if (!byId.has(id)) fail(`curriculum lists unknown KU ${id}`);
    }
    for (const ku of actual) {
      if (!listed.includes(ku.id)) {
        fail(`curriculum does not list KU ${ku.id}`);
      }
    }
    if (actual.length !== listed.length) {
      fail(
        `chapter ${chapter.id}: curriculum lists ${listed.length} KUs but content has ${actual.length}`,
      );
    }
  }
}

const visiting = new Set();
const visited = new Set();
function visit(id, path) {
  if (visited.has(id)) return;
  if (visiting.has(id)) {
    fail(`prerequisite cycle: ${[...path, id].join(" -> ")}`);
    return;
  }
  visiting.add(id);
  for (const prerequisite of byId.get(id)?.prerequisites ?? []) {
    visit(prerequisite, [...path, id]);
  }
  visiting.delete(id);
  visited.add(id);
}
for (const ku of allKus) visit(ku.id, []);

mkdirSync(generatedDir, { recursive: true });

const nodes = allKus.map((ku) => ({
  id: ku.id,
  title: ku.title,
  chapter: ku.chapter,
  order: ku.order,
  prerequisites: ku.prerequisites,
  related: ku.related,
  sources: ku.sources,
  labs: ku.labs,
  exercises: ku.exercises,
}));
const edges = [];
for (const ku of allKus) {
  for (const prerequisite of ku.prerequisites ?? []) {
    edges.push({ from: prerequisite, to: ku.id, kind: "prerequisite" });
  }
  for (const related of ku.related ?? []) {
    edges.push({ from: ku.id, to: related, kind: "related" });
  }
}
writeFileSync(
  join(generatedDir, "graph.json"),
  `${JSON.stringify({ nodes, edges }, null, 2)}\n`,
);

const coverage = {};
for (const [subject, config] of Object.entries(configuredSubjects)) {
  coverage[subject] = { chapters: [] };
  for (const chapter of config.chapters ?? []) {
    const kus = allKus.filter(
      (ku) => ku.subject === subject && ku.chapter === chapter.id,
    );
    coverage[subject].chapters.push({
      id: chapter.id,
      title: chapter.title,
      kuCount: kus.length,
      sourceCount: kus.reduce((sum, ku) => sum + (ku.sources?.length ?? 0), 0),
      labCount: kus.reduce((sum, ku) => sum + (ku.labs?.length ?? 0), 0),
      exerciseCount: kus.reduce(
        (sum, ku) => sum + (ku.exercises?.length ?? 0),
        0,
      ),
      kus: kus.map((ku) => ku.id),
    });
  }
}
writeFileSync(
  join(generatedDir, "coverage.json"),
  `${JSON.stringify(coverage, null, 2)}\n`,
);

for (const warning of warnings) console.log(`  ! ${warning}`);
if (errors.length > 0) {
  console.error(`[validate] ${errors.length} error(s):`);
  for (const error of errors) console.error(`  x ${error}`);
  process.exit(1);
}
console.log(
  `[validate] OK: ${allKus.length} KUs, ${subjects.length} subject(s), graph + coverage written.`,
);
