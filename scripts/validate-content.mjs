#!/usr/bin/env node
// 静态内容校验：数学定界符、数学模式中文、编号引用与知识点引用完整性。
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data/catalog.json"), "utf8"));
const errors = [];

const mathChars = /[ℕℤℝΩω∈∉⊆⊂∪∩∅∀∃¬∧∨→⇔≠≤≥×÷ΣΠ∑∏√∫≡∼∘⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿⁱᵏᵐ₀₁₂₃₄₅₆₇₈₉ᵢⱼₖₘₙ]/;
const cjk = /[\u4e00-\u9fff]/;
const stripMath = (text) => String(text).replace(/\$\$[^$]+\$\$|\$[^$]+\$/g, "");
const unwrapped = [];
const cjkInMath = [];

const walk = (value, where) => {
  if (typeof value === "string") {
    const rest = stripMath(value).replace(/·(?=[\u4e00-\u9fff])|(?<=[\u4e00-\u9fff])·/g, "");
    const hit = rest.match(mathChars);
    if (hit) unwrapped.push(`${where}: 「${hit[0]}」`);
    const segments = value.match(/\$\$[^$]+\$\$|\$[^$]+\$/g) ?? [];
    for (const segment of segments) {
      const body = segment.replace(/^\$\$?|\$\$?$/g, "").replace(/\\text\{[^}]*\}/g, "");
      if (cjk.test(body)) cjkInMath.push(`${where}: ${segment.slice(0, 40)}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${where}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) walk(value[key], `${where}.${key}`);
  }
};

for (const node of catalog.nodes) {
  walk(catalog.lessonLibrary[node.id], `${node.id}.lesson`);
  walk(catalog.lessonNotes[node.id], `${node.id}.notes`);
  walk(catalog.exerciseBank[node.id], `${node.id}.exercises`);
}

if (unwrapped.length) errors.push(...unwrapped.map((item) => `未包裹数学符号 ${item}`));
if (cjkInMath.length) errors.push(...cjkInMath.map((item) => `数学模式内含中文 ${item}`));

const nodeIds = new Set(catalog.nodes.map((node) => node.id));
for (const node of catalog.nodes) {
  for (const id of node.pre ?? []) {
    if (!nodeIds.has(id)) errors.push(`${node.id}: 前置知识「${id}」不存在`);
    if (id === node.id) errors.push(`${node.id}: 不能把自己列为前置知识`);
  }
  for (const id of node.ext ?? []) {
    if (!nodeIds.has(id)) errors.push(`${node.id}: 扩展知识「${id}」不存在`);
    if (id === node.id) errors.push(`${node.id}: 不能把自己列为扩展知识`);
  }
  if (node.contentStatus === "complete" && !catalog.lessonLibrary[node.id]) {
    errors.push(`${node.id}: 标记为 complete 但没有教材正文`);
  }
}

const mathGroups = new Set(["logic", "sets", "numbers", "algebra", "calculus", "probability", "combinatorics", "graph"]);
const kinds = ["定义", "定理", "命题", "公理", "例"];
const labelPattern = /(定义|定理|命题|公理|例)\s*([0-9]+\.[0-9]+)/g;
const referenceProblems = [];

for (const node of catalog.nodes.filter((item) => mathGroups.has(item.group))) {
  const lesson = catalog.lessonLibrary[node.id];
  if (!lesson) continue;
  const declared = Object.fromEntries(kinds.map((kind) => [kind, new Set()]));
  const duplicates = [];
  for (const section of lesson.sections ?? []) {
    for (const label of [section.def?.label, section.proof?.label, section.exampleLabel]) {
      if (!label) continue;
      const match = String(label).match(/^(定义|定理|命题|公理|例)\s*([0-9]+\.[0-9]+)/);
      if (!match) continue;
      if (declared[match[1]].has(match[2])) duplicates.push(`${node.id}: ${match[1]} ${match[2]} 重号`);
      declared[match[1]].add(match[2]);
    }
  }
  referenceProblems.push(...duplicates);
  const text = JSON.stringify({ lesson, notes: catalog.lessonNotes[node.id], exercises: catalog.exerciseBank[node.id] });
  const seen = new Set();
  for (const match of text.matchAll(labelPattern)) {
    const key = `${match[1]} ${match[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!declared[match[1]].has(match[2])) referenceProblems.push(`${node.id}: 引用 ${key} 无对应条目`);
  }
}
if (referenceProblems.length) errors.push(...referenceProblems);

console.log(`未包裹数学符号：${unwrapped.length}`);
console.log(`数学模式内含中文（除去 \\text{}）：${cjkInMath.length}`);
console.log(`引用与编号：${referenceProblems.length ? `${referenceProblems.length} 个问题` : "全部一致"}`);
console.log(`知识点引用：${nodeIds.size} 个节点，前置/扩展引用检查完成`);

if (errors.length) {
  console.error("\n错误：");
  errors.forEach((error) => console.error(` - ${error}`));
  process.exit(1);
}
console.log("\n内容校验通过。");
