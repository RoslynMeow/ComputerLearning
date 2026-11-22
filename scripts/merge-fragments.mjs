#!/usr/bin/env node
/**
 * 合并 content/fragments/*.json 到 data/catalog.json。
 * 每个片段格式：{ id, lesson, notes, exercises }
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "data/catalog.json");
const fragmentDir = path.join(root, "content/fragments");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const ids = new Set(catalog.nodes.map((n) => n.id));
const problems = [];
const merged = [];

if (!fs.existsSync(fragmentDir)) {
  console.error("找不到 content/fragments 目录");
  process.exit(1);
}

for (const file of fs.readdirSync(fragmentDir).filter((f) => f.endsWith(".json")).sort()) {
  const full = path.join(fragmentDir, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (error) {
    problems.push(`${file}: JSON 解析失败 — ${error.message}`);
    continue;
  }
  const id = data.id;
  if (!id || !ids.has(id)) {
    problems.push(`${file}: 未知知识点 id ${id}`);
    continue;
  }
  const lesson = data.lesson;
  if (!lesson || typeof lesson.lead !== "string" || !Array.isArray(lesson.sections) || lesson.sections.length < 3) {
    problems.push(`${file}: lesson 缺少 lead 或 sections（至少 3 节）`);
    continue;
  }
  const badSection = lesson.sections.find((s) => !s.title || (!s.body && !s.points && !s.def && !s.table && !s.proof));
  if (badSection) {
    problems.push(`${file}: 存在无内容小节「${badSection.title ?? "(无标题)"}」`);
    continue;
  }
  const exercises = data.exercises;
  if (!Array.isArray(exercises) || exercises.length < 1) {
    problems.push(`${file}: 缺少 exercises`);
    continue;
  }
  const badExercise = exercises.find((q) => q.type !== "written" || !q.prompt || !q.answerText || q.options || q.hint || q.checklist);
  if (badExercise) {
    problems.push(`${file}: 练习题必须是 type=written，且只含 prompt/notation/answerText/answerTable`);
    continue;
  }
  const badAnswerTable = exercises.find((q) => q.answerTable && (!Array.isArray(q.answerTable.head) || !Array.isArray(q.answerTable.rows)));
  if (badAnswerTable) {
    problems.push(`${file}: answerTable 需要 head 与 rows 数组`);
    continue;
  }
  if (!data.notes || !data.notes.worked || !data.notes.pitfall) {
    problems.push(`${file}: notes 需要 worked 与 pitfall`);
    continue;
  }

  catalog.lessonLibrary[id] = lesson;
  catalog.lessonNotes[id] = data.notes;
  catalog.exerciseBank[id] = { questions: exercises };
  merged.push(id);
}

if (problems.length) {
  console.error("校验未通过：");
  for (const p of problems) console.error(" - " + p);
  process.exit(1);
}
if (!merged.length) {
  console.error("没有可合并的片段");
  process.exit(1);
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(`已合并 ${merged.length} 个知识点：${merged.join(", ")}`);
