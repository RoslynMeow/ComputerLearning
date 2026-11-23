#!/usr/bin/env node
// 校验实验注册表：ID、知识点覆盖、工具链接与教材中的 experiment 字段。
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data/catalog.json"), "utf8"));
const { EXPERIMENTS, NODE_EXPERIMENT } = await import(pathToFileURL(path.join(root, "src/experiments.js")).href);
const { TOOLS, TOOL_BY_ID, TOOL_CATEGORIES } = await import(pathToFileURL(path.join(root, "src/tools.js")).href);

const errors = [];
const warnings = [];
const nodeIds = new Set(catalog.nodes.map((node) => node.id));
const toolIds = new Set(TOOLS.map((tool) => tool.id));
const experimentIds = new Map();
const experimentNodes = new Map();

for (const experiment of EXPERIMENTS) {
  const where = `实验 ${experiment.id || "(缺少 id)"}`;
  if (!experiment.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(experiment.id)) errors.push(`${where}: id 必须是小写字母、数字和短横线`);
  if (experimentIds.has(experiment.id)) errors.push(`${where}: id 重复`);
  else experimentIds.set(experiment.id, experiment);

  if (!experiment.title || !String(experiment.title).trim()) errors.push(`${where}: 缺少 title`);
  if (!experiment.summary || !String(experiment.summary).trim()) errors.push(`${where}: 缺少 summary`);
  if (!nodeIds.has(experiment.nodeId)) errors.push(`${where}: nodeId「${experiment.nodeId}」不存在`);
  else {
    if (experimentNodes.has(experiment.nodeId)) errors.push(`${where}: 知识点「${experiment.nodeId}」已有实验「${experimentNodes.get(experiment.nodeId)}」`);
    experimentNodes.set(experiment.nodeId, experiment.id);
  }
  if (typeof experiment.mount !== "function") errors.push(`${where}: 缺少 mount 函数`);
  if (!Number.isInteger(experiment.steps) || experiment.steps < 1 || experiment.steps > 3) errors.push(`${where}: steps 必须是 1–3 的整数`);
  if (!Array.isArray(experiment.toolLinks)) {
    errors.push(`${where}: toolLinks 必须是数组`);
  } else {
    const seen = new Set();
    for (const toolId of experiment.toolLinks) {
      if (!toolIds.has(toolId)) errors.push(`${where}: 工具链接「${toolId}」不存在`);
      if (seen.has(toolId)) errors.push(`${where}: 工具链接「${toolId}」重复`);
      seen.add(toolId);
    }
  }
  if (!experiment.domain) warnings.push(`${where}: 没有 domain，实验页会回退到知识点所属域`);
}

const missing = catalog.nodes.filter((node) => !NODE_EXPERIMENT[node.id]);
if (missing.length) errors.push(`以下知识点没有实验：${missing.map((node) => node.id).join(", ")}`);

const referencedTools = new Set(EXPERIMENTS.flatMap((experiment) => experiment.toolLinks ?? []));
const unreferencedTools = TOOLS.filter((tool) => !referencedTools.has(tool.id));
if (unreferencedTools.length) warnings.push(`以下工具没有被任何实验引用：${unreferencedTools.map((tool) => tool.id).join(", ")}`);

const categories = new Set(TOOL_CATEGORIES);
for (const tool of TOOLS) {
  if (!tool.id || !tool.title) errors.push(`工具 ${tool.id || "(缺少 id)"}: 缺少 id 或 title`);
  if (!categories.has(tool.category)) errors.push(`工具 ${tool.id}: 分类「${tool.category}」不在 TOOL_CATEGORIES 中，工具页不会显示`);
  if (!Array.isArray(tool.nodes)) errors.push(`工具 ${tool.id}: nodes 必须是数组`);
  else for (const nodeId of tool.nodes) if (!nodeIds.has(nodeId)) errors.push(`工具 ${tool.id}: 关联知识点「${nodeId}」不存在`);
  if (typeof tool.mount !== "function") errors.push(`工具 ${tool.id}: 缺少 mount 函数`);
}

const sectionRefs = [];
for (const [nodeId, lesson] of Object.entries(catalog.lessonLibrary ?? {})) {
  for (const [index, section] of (lesson.sections ?? []).entries()) {
    if (!section.experiment) continue;
    const value = section.experiment;
    sectionRefs.push(`${nodeId}.sections[${index}] -> ${value}`);
    if (!experimentIds.has(value) && !NODE_EXPERIMENT[value]) {
      errors.push(`${nodeId}.sections[${index}].experiment「${value}」既不是实验 id，也不是有实验的知识点 id`);
    }
  }
}

console.log(`实验：${EXPERIMENTS.length}　知识点：${catalog.nodes.length}　覆盖：${catalog.nodes.length - missing.length}/${catalog.nodes.length}`);
console.log(`工具链接：${EXPERIMENTS.reduce((sum, experiment) => sum + (experiment.toolLinks?.length ?? 0), 0)} 条，引用 ${referencedTools.size}/${TOOLS.length} 个工具`);
console.log(`教材 section.experiment：${sectionRefs.length} 处`);
if (warnings.length) {
  console.log("\n警告：");
  warnings.forEach((warning) => console.log(` - ${warning}`));
}
if (errors.length) {
  console.error("\n错误：");
  errors.forEach((error) => console.error(` - ${error}`));
  process.exit(1);
}
console.log("\n实验注册表校验通过。");
