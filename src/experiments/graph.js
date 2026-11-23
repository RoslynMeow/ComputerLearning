// 图论：连通性、BFS 分层、Dijkstra 松弛。

import { esc, shell, table, chips, visual } from "./shared.js";

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

function graphConnected(root, context, experiment) {
  let edgeOn = true;
  const render = () => {
    root.innerHTML = shell(experiment, `
      ${visual(graphSVG(edgeOn), "连通性小实验图")}
      <div class="lab-controls"><button class="study-button" data-toggle-edge>${edgeOn ? "移除 B–C" : "恢复 B–C"}</button><span class="exp-state">${edgeOn ? "B–C 当前相连" : "B–C 已移除"}</span></div>
      <div class="exp-question">B–C 移除后，整张图还连通吗？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="yes">连通</button><button class="study-button" data-exp-choice="no">不连通</button></div>
      <div class="exp-feedback" data-feedback></div>`);
    root.querySelector("[data-toggle-edge]").addEventListener("click", () => { edgeOn = !edgeOn; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      const feedback = root.querySelector("[data-feedback]");
      const correct = edgeOn ? "yes" : "no";
      if (button.dataset.expChoice === correct) {
        feedback.innerHTML = edgeOn
          ? "正确。B–C 相连时，A、B、C、D 在同一个连通分量里。"
          : "正确。B–C 移除后，A、B 与 C、D 分成两个连通分量，整张图不连通。";
      } else {
        feedback.textContent = edgeOn ? "再试一次：B–C 还连着，整张图仍连通。" : "再试一次：B–C 已移除，左边和右边没有路径相连。";
      }
    }));
  };
  render();
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

function graphBfs(root, context, experiment) {
  let shown = 1;
  let feedback = "";
  const render = () => {
    const layerText = BFS_LAYERS.slice(0, shown).map((nodes, index) => `第 ${index} 层：${nodes.join("、")}`);
    root.innerHTML = shell(experiment, `
      ${visual(bfsSVG(shown), "BFS 分层小实验图")}
      <div class="lab-controls"><button class="study-button" data-next-layer data-step ${shown >= BFS_LAYERS.length ? "disabled" : ""}>${shown >= BFS_LAYERS.length ? "分层完成" : `展开第 ${shown} 层`}</button></div>
      ${chips(layerText)}
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

function graphDijkstra(root, context, experiment) {
  let step = 0;
  let feedback = "";
  const render = () => {
    const dist = { A: "0", B: "∞", C: "∞", D: "∞" };
    for (let index = 0; index < step; index += 1) Object.assign(dist, DIJKSTRA_STEPS[index].dist);
    const settled = ["A", ...DIJKSTRA_STEPS.slice(0, step).map((item) => item.from)];
    if (step >= DIJKSTRA_STEPS.length) settled.push("D");
    const rows = Object.entries(dist).map(([name, value]) => [name, value, settled.includes(name) ? "已确定" : "待确定"]);
    const note = step > 0 ? DIJKSTRA_STEPS[step - 1].note : "初始：起点 A 距离为 0，其余为 ∞。";
    root.innerHTML = shell(experiment, `
      ${visual(dijkstraSVG(step), "Dijkstra 松弛小实验图")}
      <div class="lab-controls"><button class="study-button" data-relax data-step ${step >= DIJKSTRA_STEPS.length ? "disabled" : ""}>${step >= DIJKSTRA_STEPS.length ? "松弛完成" : `松弛 ${DIJKSTRA_STEPS[step].from} 的出边`}</button></div>
      ${table(["节点", "当前最短距离", "状态"], rows)}
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

function graphRepresentation(root, context, experiment) {
  const vertices = ["A", "B", "C", "D"];
  const edges = [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"]];
  let mode = "matrix";
  let feedback = "";
  const matrix = () => {
    const header = `<div class="exp-cell"></div>${vertices.map((name) => `<div class="exp-cell"><b>${name}</b></div>`).join("")}`;
    const rows = vertices.map((row) => `<div class="exp-cell"><b>${row}</b></div>${vertices.map((col) => {
      const on = edges.some(([a, b]) => (a === row && b === col) || (a === col && b === row));
      return `<div class="exp-cell ${on ? "best" : ""}"><b>${on ? 1 : 0}</b></div>`;
    }).join("")}`).join("");
    return `<div class="exp-matrix">${header}${rows}</div>`;
  };
  const lists = () => `<div class="exp-sequence">${vertices.map((name) => `${name} → ${edges.filter(([a, b]) => a === name || b === name).map(([a, b]) => a === name ? b : a).sort().join(" → ") || "∅"}`).join("<br>")}</div>`;
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-choices">
        <button class="study-button ${mode === "matrix" ? "primary" : ""}" data-mode="matrix">邻接矩阵</button>
        <button class="study-button ${mode === "list" ? "primary" : ""}" data-mode="list">邻接表</button>
      </div>
      ${visual(mode === "matrix" ? matrix() : lists(), "图的两种表示")}
      <div class="exp-question">无向图的邻接矩阵为什么沿对角线对称？</div>
      <div class="exp-choices">
        <button class="study-button" data-exp-choice="both">因为边是双向的</button>
        <button class="study-button" data-exp-choice="loop">因为每个顶点都有自环</button>
        <button class="study-button" data-exp-choice="zero">因为 0 和 1 对称</button>
      </div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.mode; feedback = ""; render(); }));
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "both"
        ? "正确。A 与 B 相邻时，矩阵的 A 行 B 列和 B 行 A 列都是 1。"
        : "无向边没有方向，两个端点互相可达。";
      render();
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
    id: "graph-adjacency",
    title: "同一张图有几种存法？",
    nodeId: "graph-representation",
    domain: "graph",
    summary: "切换邻接矩阵与邻接表，观察边如何被记录。",
    steps: 2,
    toolLinks: ["graph-studio"],
    mount: graphRepresentation
  }
];
