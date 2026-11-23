// 教材内的小实验：每个实验只服务一个知识点，1–3 步，旁边给相关工具入口。

import { TOOL_BY_ID } from "./tools.js";

const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[ch]));

function shell(experiment, body) {
  const tools = experiment.toolLinks.map((toolId) => {
    const tool = TOOL_BY_ID[toolId];
    return `<button class="study-button" data-exp-tool="${esc(toolId)}">打开${esc(tool?.title ?? "工具")}</button>`;
  }).join("");
  return `<div class="experiment-shell">
    <div class="experiment-head"><span class="experiment-badge">实验</span><b>${esc(experiment.title)}</b><p>${esc(experiment.summary)}</p></div>
    ${body}
    <div class="experiment-footer"><span>想自己改条件、看意外结果？</span>${tools}</div>
  </div>`;
}

function graphSVG(edgeOn) {
  const points = { A: [48, 92], B: [138, 42], C: [238, 140], D: [328, 92] };
  const edges = [["A", "B"], ["C", "D"]];
  if (edgeOn) edges.push(["B", "C"]);
  const lines = edges.map(([a, b]) => {
    const [x1, y1] = points[a];
    const [x2, y2] = points[b];
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#7fa8a1" stroke-width="2.4" />`;
  }).join("");
  const nodes = Object.entries(points).map(([name, [x, y]]) =>
    `<circle cx="${x}" cy="${y}" r="17" fill="#fff" stroke="#7fa8a1" stroke-width="2" />
     <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" fill="#31515a">${name}</text>`
  ).join("");
  return `<svg viewBox="0 0 380 190" class="exp-graph" role="img" aria-label="连通性小实验图">${lines}${nodes}</svg>`;
}

const BFS_LAYERS = [["A"], ["B", "C"], ["D", "E"], ["F"]];
const BFS_POINTS = { A: [46, 96], B: [140, 38], C: [140, 150], D: [252, 38], E: [252, 150], F: [350, 96] };
const BFS_EDGES = [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["C", "E"], ["D", "F"], ["E", "F"]];
const LAYER_FILL = ["#b9e3d9", "#d7efe9", "#eaf7f3", "#f7fbf9"];

function bfsSVG(shown) {
  const layerOf = {};
  BFS_LAYERS.forEach((nodes, index) => nodes.forEach((name) => { layerOf[name] = index; }));
  const lines = BFS_EDGES.map(([a, b]) => {
    const [x1, y1] = BFS_POINTS[a];
    const [x2, y2] = BFS_POINTS[b];
    const inside = layerOf[a] < shown && layerOf[b] < shown;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${inside ? "#7fb6ab" : "#cfe0db"}" stroke-width="${inside ? 2.6 : 2.2}" />`;
  }).join("");
  const nodes = Object.entries(BFS_POINTS).map(([name, [x, y]]) => {
    const seen = layerOf[name] < shown;
    return `<circle cx="${x}" cy="${y}" r="17" fill="${seen ? LAYER_FILL[layerOf[name]] : "#fff"}" stroke="${seen ? "#4aa696" : "#a9c6c0"}" stroke-width="2" />
      <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" fill="#31515a">${name}</text>
      ${seen ? `<text x="${x}" y="${y + 30}" text-anchor="middle" font-size="9" fill="#7b918d">L${layerOf[name]}</text>` : ""}`;
  }).join("");
  return `<svg viewBox="0 0 392 196" class="exp-graph" role="img" aria-label="BFS 分层小实验图">${lines}${nodes}</svg>`;
}

function graphBfs(root) {
  const experiment = EXPERIMENT_BY_ID["graph-bfs"];
  let shown = 1;
  let feedback = "";
  const render = () => {
    const layerText = BFS_LAYERS.slice(0, shown).map((nodes, index) => `<span class="exp-chip">第 ${index} 层：${nodes.join("、")}</span>`).join("");
    root.innerHTML = shell(experiment, `
      <div class="exp-visual">${bfsSVG(shown)}</div>
      <div class="lab-controls"><button class="study-button" data-next-layer ${shown >= BFS_LAYERS.length ? "disabled" : ""}>${shown >= BFS_LAYERS.length ? "分层完成" : `展开第 ${shown} 层`}</button></div>
      <div class="exp-chips">${layerText}</div>
      <div class="exp-question">节点 F 在第几层？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="1">第 1 层</button><button class="study-button" data-exp-choice="2">第 2 层</button><button class="study-button" data-exp-choice="3">第 3 层</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-next-layer]")?.addEventListener("click", () => { shown = Math.min(BFS_LAYERS.length, shown + 1); feedback = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      if (shown < BFS_LAYERS.length) {
        feedback = "先把各层展开，再观察 F 出现在第几层。";
      } else if (button.dataset.expChoice === "3") {
        feedback = "正确。队列先访问完 A 的全部邻居（第 1 层），再访问第 2 层，最后才到 F：A → B C → D E → F。";
      } else {
        feedback = "再看一眼图：A 是第 0 层，B、C 是第 1 层，D、E 是第 2 层，F 是第 3 层。";
      }
      render();
    }));
  };
  render();
}

const DIJKSTRA_POINTS = { A: [46, 100], B: [160, 40], C: [160, 160], D: [300, 100] };
const DIJKSTRA_EDGES = [["A", "B", 4], ["A", "C", 8], ["B", "C", 2], ["C", "D", 3], ["B", "D", 9]];
const DIJKSTRA_STEPS = [
  { from: "A", dist: { B: 4, C: 8 }, note: "从 A 出发：A→B = 4，A→C = 8。" },
  { from: "B", dist: { C: 6, D: 13 }, note: "经 B 松弛：A→B→C = 6 比 8 更短；A→B→D = 13。" },
  { from: "C", dist: { D: 9 }, note: "经 C 松弛：A→B→C→D = 9 比 13 更短。" }
];

function dijkstraSVG(step) {
  const current = DIJKSTRA_STEPS[step - 1]?.from;
  const lines = DIJKSTRA_EDGES.map(([a, b, weight]) => {
    const [x1, y1] = DIJKSTRA_POINTS[a];
    const [x2, y2] = DIJKSTRA_POINTS[b];
    const relaxed = step > 0 && (a === current || b === current);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 5;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${relaxed ? "#7fb6ab" : "#cfe0db"}" stroke-width="${relaxed ? 2.8 : 2.2}" />
      <text x="${mx}" y="${my}" text-anchor="middle" font-size="10" font-weight="700" fill="#5f7b76" paint-order="stroke" stroke="#fbfdfc" stroke-width="3">${weight}</text>`;
  }).join("");
  const nodes = Object.entries(DIJKSTRA_POINTS).map(([name, [x, y]]) =>
    `<circle cx="${x}" cy="${y}" r="18" fill="${name === "A" ? "#b9e3d9" : "#fff"}" stroke="#5aa99b" stroke-width="2" />
     <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" fill="#31515a">${name}</text>`
  ).join("");
  return `<svg viewBox="0 0 350 210" class="exp-graph" role="img" aria-label="Dijkstra 松弛小实验图">${lines}${nodes}</svg>`;
}

function graphDijkstra(root) {
  const experiment = EXPERIMENT_BY_ID["graph-dijkstra"];
  let step = 0;
  let feedback = "";
  const render = () => {
    const dist = { A: "0", B: "∞", C: "∞", D: "∞" };
    for (let index = 0; index < step; index += 1) Object.assign(dist, DIJKSTRA_STEPS[index].dist);
    const settled = ["A", ...DIJKSTRA_STEPS.slice(0, step).map((item) => item.from)];
    if (step >= DIJKSTRA_STEPS.length) settled.push("D");
    const rows = Object.entries(dist).map(([name, value]) => `<tr><td>${name}</td><td>${value}</td><td>${settled.includes(name) ? "已确定" : "待确定"}</td></tr>`).join("");
    const note = step > 0 ? DIJKSTRA_STEPS[step - 1].note : "初始：起点 A 距离为 0，其余为 ∞。";
    root.innerHTML = shell(experiment, `
      <div class="exp-visual">${dijkstraSVG(step)}</div>
      <div class="lab-controls"><button class="study-button" data-relax ${step >= DIJKSTRA_STEPS.length ? "disabled" : ""}>${step >= DIJKSTRA_STEPS.length ? "松弛完成" : `松弛 ${DIJKSTRA_STEPS[step].from} 的出边`}</button></div>
      <table class="lesson-table exp-table"><thead><tr><th>节点</th><th>当前最短距离</th><th>状态</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="exp-note" data-note>${note}</div>
      <div class="exp-question">全部松弛后，A 到 D 的最短距离是多少？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="9">9</button><button class="study-button" data-exp-choice="13">13</button><button class="study-button" data-exp-choice="inf">∞</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-relax]")?.addEventListener("click", () => { step = Math.min(DIJKSTRA_STEPS.length, step + 1); feedback = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      if (step < DIJKSTRA_STEPS.length) {
        feedback = "先按顺序松弛 A、B、C 的出边，再看 D 的距离。";
      } else if (button.dataset.expChoice === "9") {
        feedback = "正确。A→B→C→D = 4 + 2 + 3 = 9，比 A→B→D 的 13 更短。";
      } else {
        feedback = "还有更短的走法：先走 A→B，再走 B→C，最后 C→D。";
      }
      render();
    }));
  };
  render();
}

function graphConnected(root, context) {
  let edgeOn = true;
  let answer = "";
  const experiment = EXPERIMENT_BY_ID["graph-connected"];
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-visual">${graphSVG(edgeOn)}</div>
      <div class="lab-controls"><button class="study-button" data-toggle-edge>${edgeOn ? "移除 B–C" : "恢复 B–C"}</button><span class="exp-state">${edgeOn ? "B–C 当前相连" : "B–C 已移除"}</span></div>
      <div class="exp-question">B–C 移除后，整张图还连通吗？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="yes">连通</button><button class="study-button" data-exp-choice="no">不连通</button></div>
      <div class="exp-feedback" data-feedback></div>`);
    root.querySelector("[data-toggle-edge]").addEventListener("click", () => { edgeOn = !edgeOn; answer = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      answer = button.dataset.expChoice;
      const feedback = root.querySelector("[data-feedback]");
      const correct = edgeOn ? "yes" : "no";
      if (answer === correct) {
        feedback.innerHTML = edgeOn
          ? "正确。B–C 相连时，A、B、C、D 在同一个连通分量里。"
          : "正确。B–C 移除后，A、B 与 C、D 分成两个连通分量，整张图不连通。";
      } else {
        feedback.textContent = edgeOn ? "再试一次：B–C 还连着，整张图仍连通。" : "再试一次：B–C 已移除，左边和右边没有路径相连。";
      }
    }));
    if (answer) root.querySelector(`[data-exp-choice="${answer}"]`)?.click();
  };
  render();
}

function baseBinary(root) {
  const experiment = EXPERIMENT_BY_ID["base-binary"];
  const choices = ["10011", "11001", "1011"];
  root.innerHTML = shell(experiment, `
    <div class="exp-question">19（十进制）转成二进制是多少？</div>
    <div class="exp-choices">${choices.map((choice) => `<button class="study-button" data-exp-choice="${choice}">${choice}</button>`).join("")}</div>
    <div class="exp-feedback" data-feedback>先预测，再点选答案。</div>
    <div data-reveal></div>`);
  root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
    const feedback = root.querySelector("[data-feedback]");
    if (button.dataset.expChoice === "10011") {
      feedback.textContent = "正确。19 = 16 + 2 + 1，所以是 10011。";
      root.querySelector("[data-reveal]").innerHTML = `
        <table class="lesson-table"><thead><tr><th>被除数</th><th>除以 2</th><th>商</th><th>余数</th></tr></thead>
        <tbody><tr><td>19</td><td>÷2</td><td>9</td><td>1</td></tr><tr><td>9</td><td>÷2</td><td>4</td><td>1</td></tr><tr><td>4</td><td>÷2</td><td>2</td><td>0</td></tr><tr><td>2</td><td>÷2</td><td>1</td><td>0</td></tr><tr><td>1</td><td>÷2</td><td>0</td><td>1</td></tr></tbody></table>
        <p class="exp-note">余数从下往上读：10011。同一个数换几种常用进制：</p>
        <table class="lesson-table exp-table"><thead><tr><th>进制</th><th>表示</th></tr></thead>
        <tbody><tr><td>二进制</td><td>10011</td></tr><tr><td>八进制</td><td>23</td></tr><tr><td>十进制</td><td>19</td></tr><tr><td>十六进制</td><td>13</td></tr></tbody></table>`;
    } else {
      feedback.textContent = "不对。先想想 19 最接近哪个 2 的幂。";
    }
  }));
}

function baseFraction(root) {
  const experiment = EXPERIMENT_BY_ID["base-fraction"];
  root.innerHTML = shell(experiment, `
    <div class="exp-question">0.1（十进制）转成二进制，前 8 位是 <code>0.00011001…</code>。小数部分会终止吗？</div>
    <div class="exp-choices"><button class="study-button" data-exp-choice="yes">会终止</button><button class="study-button" data-exp-choice="no">不会终止</button></div>
    <div class="exp-feedback" data-feedback>先判断，再看解释。</div>
    <div data-reveal></div>`);
  root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
    const feedback = root.querySelector("[data-feedback]");
    if (button.dataset.expChoice === "no") {
      feedback.textContent = "正确。小数部分会进入 0011 的循环。";
      root.querySelector("[data-reveal]").innerHTML = `
        <p class="exp-note">0.1 的二进制展开是 0.0001100110011…，循环节是 0011。有限位浮点格式只能保存它的近似值，所以 0.1 通常不能被二进制浮点精确表示。</p>`;
    } else {
      feedback.textContent = "不对。观察 00011001 之后，数字会继续循环。";
    }
  }));
}

function sortingBubble(root) {
  const experiment = EXPERIMENT_BY_ID["sorting-bubble"];
  let passed = false;
  const render = () => {
    const arr = passed ? [2, 4, 1, 5] : [5, 2, 4, 1];
    root.innerHTML = shell(experiment, `
      <div class="exp-bars">${arr.map((value, index) => `<div class="exp-bar" style="height:${30 + value * 14}px;${passed && index === 3 ? "background:linear-gradient(180deg,#f1c178,#dfa03f);" : ""}"><span>${value}</span></div>`).join("")}</div>
      <div class="lab-controls"><button class="study-button primary" data-pass>${passed ? "已完成第一轮" : "执行第一轮冒泡"}</button></div>
      <div class="exp-question">第一轮结束后，最大值 5 到了哪里？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="start">开头</button><button class="study-button" data-exp-choice="middle">中间</button><button class="study-button" data-exp-choice="end">末尾</button></div>
      <div class="exp-feedback" data-feedback></div>`);
    root.querySelector("[data-pass]").addEventListener("click", () => { passed = true; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      const feedback = root.querySelector("[data-feedback]");
      if (!passed) { feedback.textContent = "先执行第一轮，再观察数组。"; return; }
      if (button.dataset.expChoice === "end") feedback.textContent = "正确。第一轮把最大的 5 冒到了末尾，下一轮只需要处理前 3 个元素。";
      else feedback.textContent = "再看一眼数组：5 已经在最右边。";
    }));
  };
  render();
}

export const EXPERIMENTS = [
  {
    id: "graph-connected",
    title: "图什么时候连通？",
    nodeId: "graph-theory",
    domain: "graph",
    summary: "切换 B–C 这条边，观察连通分量如何变化。",
    steps: 2,
    toolLinks: ["graph-studio"],
    mount: graphConnected
  },
  {
    id: "graph-bfs",
    title: "BFS 为什么要分层？",
    nodeId: "bfs-dfs",
    domain: "graph",
    summary: "逐层展开队列，观察广度优先的访问顺序。",
    steps: 2,
    toolLinks: ["graph-studio"],
    mount: graphBfs
  },
  {
    id: "graph-dijkstra",
    title: "Dijkstra 怎么一步步变短？",
    nodeId: "shortest-paths",
    domain: "graph",
    summary: "只做三次松弛，观察 D 的距离如何从 ∞ 降到 9。",
    steps: 2,
    toolLinks: ["shortest-path", "graph-studio"],
    mount: graphDijkstra
  },
  {
    id: "base-binary",
    title: "19 的二进制是多少？",
    nodeId: "place-value",
    domain: "numbers",
    summary: "先预测，再用除基取余验证。",
    steps: 2,
    toolLinks: ["base-converter"],
    mount: baseBinary
  },
  {
    id: "base-fraction",
    title: "0.1 为什么转不完？",
    nodeId: "base-conversion",
    domain: "numbers",
    summary: "观察二进制小数的循环节，理解有限精度。",
    steps: 2,
    toolLinks: ["base-converter"],
    mount: baseFraction
  },
  {
    id: "sorting-bubble",
    title: "冒泡第一轮做了什么？",
    nodeId: "sorting",
    domain: "prog",
    summary: "执行一轮冒泡，观察最大值如何移动到末尾。",
    steps: 2,
    toolLinks: ["sorting"],
    mount: sortingBubble
  }
];

export const EXPERIMENT_BY_ID = Object.fromEntries(EXPERIMENTS.map((experiment) => [experiment.id, experiment]));

export const NODE_EXPERIMENT = Object.fromEntries(EXPERIMENTS.map((experiment) => [experiment.nodeId, experiment.id]));

export function mountExperiment(experimentId, root, context = {}) {
  const experiment = EXPERIMENT_BY_ID[experimentId];
  if (!experiment) return false;
  root.innerHTML = "";
  experiment.mount(root, context);
  root.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-exp-tool]");
    if (button) context.openTool?.(button.dataset.expTool);
  });
  return true;
}
