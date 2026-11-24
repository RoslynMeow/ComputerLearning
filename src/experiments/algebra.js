// 代数与函数：映射、向量缩放。

import { shell, table, visual, mountChoiceSteps } from "./shared.js";

function functionsMappings(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "函数要求每个输入只对应一个输出。",
    steps: [
      {
        visual: () => visual(table(["输入 x", "输出 f(x)"], [["1", "1"], ["2", "4"], ["3", "9"], ["4", "16"]]), "平方映射"),
        prompt: "这个“输入一个数，输出它的平方”的对应关系是函数吗？",
        options: [{ value: "yes", label: "是，每个输入只有一个输出" }, { value: "no", label: "不是，输出太多了" }],
        correct: "yes",
        correctText: "正确。输入 2 只对应 4，不会再对应别的值。",
        wrongText: "函数看的是每个输入是否唯一对应一个输出。",
        reveal: "f: x ↦ x² 是一个函数。"
      },
      {
        prompt: "如果规定 1 ↦ 1，同时又规定 1 ↦ −1，它还是函数吗？",
        options: [{ value: "no", label: "不是，一个输入有两个输出" }, { value: "yes", label: "是，只要输出是数就行" }],
        correct: "no",
        correctText: "正确。同一个输入出现两个输出，违反函数定义。",
        wrongText: "回到定义：每个输入只能有一个输出。",
        reveal: "函数是一种特殊的二元关系：输入唯一决定输出。"
      }
    ]
  });
}

function vectorSVG(scale) {
  const cx = 150;
  const cy = 100;
  const unit = 26;
  const x = cx + 2 * scale * unit;
  const y = cy - 1 * scale * unit;
  const grid = Array.from({ length: 7 }, (_, i) => {
    const gx = 20 + i * 40;
    const gy = 20 + i * 26;
    return `<line x1="${gx}" y1="16" x2="${gx}" y2="184" stroke="#edf4f1" stroke-width="1" />
      <line x1="16" y1="${gy}" x2="284" y2="${gy}" stroke="#edf4f1" stroke-width="1" />`;
  }).join("");
  return `<svg viewBox="0 0 300 200" class="exp-graph" role="img" aria-label="向量缩放">
    ${grid}<line x1="16" y1="${cy}" x2="284" y2="${cy}" stroke="#c4d7d2" stroke-width="1.4" />
    <line x1="${cx}" y1="16" x2="${cx}" y2="184" stroke="#c4d7d2" stroke-width="1.4" />
    <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#168c81" stroke-width="3" stroke-linecap="round" />
    <circle cx="${x}" cy="${y}" r="4" fill="#168c81" />
    <text x="${x + 6}" y="${y - 6}" font-size="10" font-weight="700" fill="#31515a">(${2 * scale}, ${scale})</text>
  </svg>`;
}

function linearAlgebra(root, context, experiment) {
  let scale = 1;
  let feedback = "";
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-question">向量 v = (2, 1)。拖动倍数，观察 2v 的坐标。</div>
      <div class="lab-controls"><label>倍数 s = <b>${scale}</b><input type="range" min="1" max="3" step="1" value="${scale}" data-slider></label></div>
      ${visual(vectorSVG(scale), "向量缩放")}
      <div class="exp-output">s · v = <b>(${2 * scale}, ${scale})</b></div>
      <div class="exp-question">2v 等于多少？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="42">(4, 2)</button><button class="study-button" data-exp-choice="22">(2, 2)</button><button class="study-button" data-exp-choice="21">(2, 1)</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-slider]").addEventListener("input", (event) => { scale = Number(event.target.value); render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "42"
        ? "正确。数乘把每个分量都乘以同一个倍数。"
        : "把 s 拖到 2，看看两个分量各自变成多少。";
      render();
    }));
  };
  render();
}

export const EXPERIMENTS = [
  {
    id: "function-mapping",
    title: "一个输入为什么只能有一个输出？",
    nodeId: "functions-mappings",
    domain: "algebra",
    summary: "检查平方映射，再制造一个多输出的反例。",
    steps: 2,
    toolLinks: ["set-toolbox"],
    mount: functionsMappings
  },
  {
    id: "vector-scale",
    title: "数乘把向量拉到哪里？",
    nodeId: "linear-algebra",
    domain: "algebra",
    summary: "拖动倍数，观察 (2,1) 的两个分量同时缩放。",
    steps: 2,
    toolLinks: [],
    mount: linearAlgebra
  }
];
