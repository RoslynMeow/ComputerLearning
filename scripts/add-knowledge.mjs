#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const equal = item.indexOf("=");
    if (equal >= 0) out[item.slice(2, equal)] = item.slice(equal + 1);
    else if (argv[i + 1] && !argv[i + 1].startsWith("--")) out[item.slice(2)] = argv[++i];
    else out[item.slice(2)] = true;
  }
  return out;
}

function usage() {
  console.log(`用法：
  node scripts/add-knowledge.mjs \\
    --id cache-coherence --title "缓存一致性" --en "Cache Coherence" \\
    --domain hardware --book "计算机组成原理 · Cache" \\
    --summary "多处理器如何协调缓存中的共享数据。" \\
    --goal "能解释一致性协议解决的问题。" \\
    --pre cache,memory-hierarchy --ext distributed-systems

选项：
  --id          稳定的英文 ID（小写字母、数字和短横线）
  --title       中文知识点名称
  --en          英文名称（可选，默认使用 ID）
  --domain      已有知识域 ID
  --book        教材与章节来源
  --summary     浮窗中的简短介绍
  --goal        学习目标
  --pre         直接前置知识 ID，逗号分隔（可选）
  --ext         扩展知识 ID，逗号分隔（可选）
  --dry-run     只校验并预览，不写文件
  --help        显示此帮助`);
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}

const required = ["id", "title", "domain", "book", "summary", "goal"];
const missing = required.filter((key) => !args[key]);
if (missing.length) {
  console.error(`缺少必填参数：${missing.map((x) => `--${x}`).join(", ")}\n`);
  usage();
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.id)) {
  console.error("--id 只能包含小写英文字母、数字和单个短横线分隔。");
  process.exit(1);
}

const root = process.cwd();
const catalogPath = path.resolve(root, args.catalog || "data/catalog.json");
const draftDir = path.resolve(root, args["draft-dir"] || "content/drafts");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const { nodes, groupMeta, lessonLibrary, lessonNotes, exerciseBank } = catalog;

if (!groupMeta[args.domain]) {
  console.error(`未知知识域「${args.domain}」。可用值：${Object.keys(groupMeta).join(", ")}`);
  process.exit(1);
}
if (nodes.some((node) => node.id === args.id)) {
  console.error(`知识点 ID「${args.id}」已存在。`);
  process.exit(1);
}

const parseIDs = (value) => value ? [...new Set(String(value).split(",").map((x) => x.trim()).filter(Boolean))] : [];
const pre = parseIDs(args.pre);
const ext = parseIDs(args.ext);
const existingIDs = new Set(nodes.map((node) => node.id));
for (const id of [...pre, ...ext]) {
  if (id === args.id) {
    console.error("知识点不能把自身设为前置或扩展。");
    process.exit(1);
  }
  if (!existingIDs.has(id)) {
    console.error(`关系目标「${id}」不存在。请先创建它，或检查 ID。`);
    process.exit(1);
  }
}

const node = {
  id: args.id,
  title: args.title,
  en: args.en || args.id,
  group: args.domain,
  book: args.book,
  summary: args.summary,
  goal: args.goal,
  pre,
  ext,
  contentStatus: "draft",
};

function hasPrerequisiteCycle(candidateNodes) {
  const byID = new Map(candidateNodes.map((item) => [item.id, item]));
  const state = new Map();
  function visit(id) {
    if (state.get(id) === 1) return true;
    if (state.get(id) === 2) return false;
    state.set(id, 1);
    for (const parent of byID.get(id)?.pre ?? []) if (visit(parent)) return true;
    state.set(id, 2);
    return false;
  }
  return candidateNodes.some((item) => visit(item.id));
}

const nextNodes = [...nodes, node];
if (hasPrerequisiteCycle(nextNodes)) {
  console.error("添加该知识点会造成必需前置关系循环，请调整 --pre。");
  process.exit(1);
}

if (fs.existsSync(path.join(draftDir, `${args.id}.md`))) {
  console.error(`草稿文件已存在：${path.join(draftDir, `${args.id}.md`)}`);
  process.exit(1);
}

catalog.nodes.push(node);
catalog.lessonLibrary[args.id] = {
  lead: args.summary,
  sections: [
    { title: "定义与动机", body: "待撰写：先说明要解决的问题，再给出准确的概念定义。" },
    { title: "核心机制与推导", body: "待撰写：解释概念如何工作，补充公式、图示或逐步推导。" },
    { title: "例题与边界", body: "待撰写：给出一个完整例题，并说明适用条件和常见误区。" },
  ],
};
catalog.lessonNotes[args.id] = {
  worked: "待补充：填写一个可复核的 worked example。",
  pitfall: "待补充：填写一个具体且常见的误解。",
};

const draft = `# ${args.title}

- ID: \`${args.id}\`
- 英文名: ${args.en || args.id}
- 知识域: ${groupMeta[args.domain].label} (\`${args.domain}\`)
- 教材来源: ${args.book}
- 前置知识: ${pre.length ? pre.map((id) => `\`${id}\``).join(", ") : "无"}
- 扩展知识: ${ext.length ? ext.map((id) => `\`${id}\``).join(", ") : "待补充"}

## 学习目标

${args.goal}

## 定义与动机

<!-- 先讲问题从何而来，再给出定义、假设和术语。 -->

## 核心机制 / 推导

<!-- 分步骤解释原理；公式需说明符号和适用条件。 -->

## worked example

<!-- 给出输入、每一步过程、结果和验证。 -->

## 常见误区与边界

<!-- 写清楚概念不适用的情形，以及容易混淆的相邻概念。 -->

## 历史线索与参考资料

<!-- 历史作为理解动机，不作为先修条件；列出可核验来源。 -->

## 练习

<!-- 至少准备一道概念题和一道应用题，并编写答案解析。 -->

## 交互实验

<!-- 描述学生可以调整的参数、观察量和预期学习点。 -->
`;

if (args["dry-run"]) {
  console.log(`校验通过：将新增「${node.title}」(${node.id}) 到 ${catalogPath}`);
  console.log(`前置：${pre.join(", ") || "无"}；扩展：${ext.join(", ") || "无"}`);
  console.log(`将生成草稿：${path.join(draftDir, `${args.id}.md`)}`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
fs.mkdirSync(draftDir, { recursive: true });
const tempPath = `${catalogPath}.tmp`;
fs.writeFileSync(tempPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
fs.renameSync(tempPath, catalogPath);
fs.writeFileSync(path.join(draftDir, `${args.id}.md`), draft, "utf8");
console.log(`已添加「${node.title}」(${node.id})。`);
console.log("重新载入 CSLearning 后，知识图谱会依照知识域与前置深度自动排布。");
console.log(`讲义草稿：${path.join(draftDir, `${args.id}.md`)}`);
