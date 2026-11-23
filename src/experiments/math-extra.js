// 微积分、组合计数、自动机。

import { shell, table, visual, mountChoiceSteps } from "./shared.js";

function calculus(root, context, experiment) {
  let h = 1;
  let feedback = "";
  const render = () => {
    const slope = ((1 + h) ** 2 - 1) / h;
    root.innerHTML = shell(experiment, `
      <div class="exp-question">在 x = 1 附近取割线，让 h 越来越小。</div>
      <div class="lab-controls"><label>h = <b>${h.toFixed(1)}</b><input type="range" min="0.1" max="1" step="0.1" value="${h}" data-slider></label></div>
      ${visual(table(["x", "f(x) = x²"], [["1", "1"], [String((1 + h).toFixed(1)), ((1 + h) ** 2).toFixed(2)]]), "割线两端")}
      <div class="exp-output">割线斜率 = (f(1+h) − f(1)) / h = <b>${slope.toFixed(2)}</b></div>
      <div class="exp-question">当 h 趋近 0 时，割线斜率趋近多少？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="2">2</button><button class="study-button" data-exp-choice="1">1</button><button class="study-button" data-exp-choice="0">0</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-slider]").addEventListener("input", (event) => { h = Number(event.target.value); render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "2"
        ? "正确。斜率 = 2 + h，h → 0 时趋近 2，所以 (x²)′ 在 x = 1 处等于 2。"
        : "把 h 拖到 0.1，看看斜率是不是接近 2。";
      render();
    }));
  };
  render();
}

function combinatorics(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "把 A、B、C 排成一列，第一个位置的选择会影响后面的选择数。",
    steps: [
      {
        prompt: "第一个位置有几种选法？",
        options: [{ value: "3", label: "3 种" }, { value: "2", label: "2 种" }, { value: "1", label: "1 种" }],
        correct: "3",
        correctText: "正确。A、B、C 都可以放在第一个位置。",
        wrongText: "三个字母都还没用过。",
        reveal: "选定第一个字母后，还剩两个字母。"
      },
      {
        prompt: "第二个位置有几种选法？",
        options: [{ value: "3", label: "3 种" }, { value: "2", label: "2 种" }, { value: "1", label: "1 种" }],
        correct: "2",
        correctText: "正确。已经用掉一个，只剩两个选择。",
        wrongText: "第一个位置已经占掉一个字母。",
        reveal: "第三个位置只剩最后一个字母。"
      },
      {
        prompt: "总共有多少种排列？",
        options: [{ value: "6", label: "6 种" }, { value: "9", label: "9 种" }, { value: "3", label: "3 种" }],
        correct: "6",
        correctText: "正确。3 × 2 × 1 = 6。",
        wrongText: "把每一步的选择数乘起来。",
        reveal: "这就是 3! = 6 种排列。"
      }
    ],
    outro: "排列数 = 每一步可选数量的乘积；这里 3! = 6。"
  });
}

function automata(root, context, experiment) {
  let state = "q0";
  let input = "";
  let feedback = "";
  const step = (bit) => {
    state = bit === "1" ? "q1" : "q0";
    input += bit;
    render();
  };
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-question">自动机从 q0 出发，读入 0/1。q1 是接受状态。</div>
      ${visual(`<div class="exp-sequence">${input || "（空串）"}　当前状态：<b>${state}</b>${state === "q1" ? "　接受" : "　不接受"}</div>`, "有限自动机")}
      <div class="lab-controls"><button class="study-button" data-bit="0">读入 0</button><button class="study-button" data-bit="1">读入 1</button><button class="study-button" data-reset>重置</button></div>
      <div class="exp-question">这个自动机接受什么样的二进制串？</div>
      <div class="exp-choices">
        <button class="study-button" data-exp-choice="end1">以 1 结尾的串</button>
        <button class="study-button" data-exp-choice="end0">以 0 结尾的串</button>
        <button class="study-button" data-exp-choice="all">所有二进制串</button>
      </div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelectorAll("[data-bit]").forEach((button) => button.addEventListener("click", () => step(button.dataset.bit)));
    root.querySelector("[data-reset]").addEventListener("click", () => { state = "q0"; input = ""; feedback = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "end1"
        ? "正确。q1 只在最后一个读入的位是 1 时到达。"
        : "试着以 0 结尾：状态会回到 q0，不被接受。";
      render();
    }));
  };
  render();
}

export const EXPERIMENTS = [
  {
    id: "derivative-secant",
    title: "割线怎么变成切线？",
    nodeId: "calculus",
    domain: "calculus",
    summary: "缩小 h，观察割线斜率趋近 2。",
    steps: 2,
    toolLinks: ["derivative"],
    mount: calculus
  },
  {
    id: "permutation-count",
    title: "3 个字母为什么有 6 种排法？",
    nodeId: "combinatorics",
    domain: "combinatorics",
    summary: "逐步选择位置，把 3×2×1 乘起来。",
    steps: 3,
    toolLinks: [],
    mount: combinatorics
  },
  {
    id: "dfa-ending-one",
    title: "自动机怎么记住最后一个位？",
    nodeId: "automata",
    domain: "theory",
    summary: "读入 0/1，观察状态只在最后一位是 1 时接受。",
    steps: 2,
    toolLinks: [],
    mount: automata
  }
];
