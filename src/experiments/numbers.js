// 数系与算术：记数、进制、整数、幂、对数、模运算、皮亚诺与归纳。

import { esc, shell, table, visual, mountChoiceSteps, mountStepper } from "./shared.js";

function baseBinary(root, context, experiment) {
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
        ${table(["被除数", "除以 2", "商", "余数"], [["19", "÷2", "9", "1"], ["9", "÷2", "4", "1"], ["4", "÷2", "2", "0"], ["2", "÷2", "1", "0"], ["1", "÷2", "0", "1"]])}
        <p class="exp-note">余数从下往上读：10011。同一个数换几种常用进制：</p>
        ${table(["进制", "表示"], [["二进制", "10011"], ["八进制", "23"], ["十进制", "19"], ["十六进制", "13"]])}`;
    } else {
      feedback.textContent = "不对。先想想 19 最接近哪个 2 的幂。";
    }
  }));
}

function baseFraction(root, context, experiment) {
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

function numberLineSVG(marks) {
  const min = -4;
  const max = 8;
  const x = (value) => 34 + (value - min) * 26;
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i)
    .map((value) => `<line x1="${x(value)}" y1="48" x2="${x(value)}" y2="56" stroke="#b9cec9" stroke-width="1.4" />
      <text x="${x(value)}" y="70" text-anchor="middle" font-size="8" fill="#8ba09c">${value}</text>`).join("");
  const dots = marks.map(({ value, label, tone = "#4aa696" }) =>
    `<circle cx="${x(value)}" cy="40" r="7" fill="${tone}" />
     <text x="${x(value)}" y="24" text-anchor="middle" font-size="9" font-weight="700" fill="#31515a">${label}</text>`).join("");
  return `<svg viewBox="0 0 350 82" class="exp-graph" role="img" aria-label="数轴">
    <line x1="24" y1="48" x2="338" y2="48" stroke="#7fa8a1" stroke-width="2" />
    <path d="M338 48 l-8 -4 v8 z" fill="#7fa8a1" />${ticks}${dots}</svg>`;
}

function integers(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "把减法看成向相反方向移动。",
    steps: [
      {
        visual: () => visual(numberLineSVG([{ value: -3, label: "−3", tone: "#e3b05f" }, { value: 0, label: "0" }, { value: 5, label: "5" }]), "数轴上的 5 与 −3"),
        prompt: "5 − (−3) 相当于从 5 向哪个方向移动？",
        options: [{ value: "left", label: "向左 3 格" }, { value: "right", label: "向右 3 格" }],
        correct: "right",
        correctText: "正确。减去一个负数，等于加上它的相反数。",
        wrongText: "再想：−(−3) 是正还是负？",
        reveal: "−(−3) = +3，所以从 5 向右移动 3 格。"
      },
      {
        visual: () => visual(numberLineSVG([{ value: 5, label: "5" }, { value: 8, label: "8", tone: "#e3b05f" }]), "从 5 向右到 8"),
        prompt: "因此 5 − (−3) 等于多少？",
        options: [{ value: "2", label: "2" }, { value: "8", label: "8" }, { value: "−8", label: "−8" }],
        correct: "8",
        correctText: "正确，5 − (−3) = 8。",
        wrongText: "方向对了再算一次：5 向右 3 格。",
        reveal: "5 + 3 = 8。减去负数会让结果变大。"
      }
    ]
  });
}

function powers(root, context, experiment) {
  let n = 10;
  let feedback = "";
  const render = () => {
    const value = 2 ** n;
    root.innerHTML = shell(experiment, `
      <div class="exp-question">拖动指数，观察 2ⁿ 的增长。</div>
      <div class="lab-controls"><label>n = <b data-n>${n}</b><input type="range" min="0" max="20" value="${n}" data-slider></label><span class="exp-state">2<sup>${n}</sup> = ${value.toLocaleString("en-US")}</span></div>
      <div class="exp-visual"><div class="place-strip">${[0, 1, 2, 3, 4].map((k) => `<div class="place-card"><b>2<sup>${k}</sup></b><small>${2 ** k}</small></div>`).join("")}</div></div>
      <div class="exp-question">n 每增加 1，2ⁿ 怎么变化？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="double">乘以 2</button><button class="study-button" data-exp-choice="add">加上 2</button><button class="study-button" data-exp-choice="ten">乘以 10</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-slider]").addEventListener("input", (event) => { n = Number(event.target.value); render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "double"
        ? `正确。2^10 = 1024，2^20 = 1,048,576；指数每加 1，值翻倍。`
        : "再看一眼：2³ = 8，2⁴ = 16，是翻倍而不是加 2。";
      render();
    }));
  };
  render();
}

function peanoAxioms(root, context, experiment) {
  mountStepper(root, experiment, {
    intro: "自然数从一个起点和后继函数开始：0、S(0)、S(S(0))……",
    frames: [0, 1, 2, 3, 4],
    nextLabel: "取后继",
    frameHTML: (value) => `<div class="exp-visual"><div class="exp-sequence">${Array.from({ length: value + 1 }, () => "S(").join("")}0${Array.from({ length: value + 1 }, () => ")").join("")}<br><small class="exp-state">这就是自然数 ${value}</small></div></div>`,
    question: "在皮亚诺公理里，4 的后继是哪个数？",
    options: [{ value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }],
    correct: "5",
    correctText: "正确。后继函数把 4 送到 5，而且不会回到已经出现过的数。",
    wrongText: "后继就是“再数一个”。",
    footerNote: "后继公理同时排除了循环和最大自然数。"
  });
}

function naturalNumbers(root, context, experiment) {
  mountStepper(root, experiment, {
    intro: "递归加法把 m + n 一次次化成后继。",
    frames: [
      "3 + 0 = 3",
      "3 + 1 = S(3 + 0) = S(3) = 4",
      "3 + 2 = S(3 + 1) = S(4) = 5"
    ],
    nextLabel: "展开一层",
    frameHTML: (frame) => `<div class="exp-visual"><div class="exp-sequence">${esc(frame)}</div></div>`,
    question: "按递归定义，m + 0 等于什么？",
    options: [{ value: "0", label: "0" }, { value: "m", label: "m" }, { value: "m+1", label: "m + 1" }],
    correct: "m",
    correctText: "正确。m + 0 = m 是递归的基例。",
    wrongText: "加 0 不会改变原数。",
    footerNote: "m + S(n) = S(m + n)：每展开一次，就把一个后继搬到最外层。"
  });
}

function logarithms(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "对数在问：底数要升到几次方，才能得到这个数？",
    steps: [
      {
        visual: () => visual(table(["n", "2ⁿ"], [["0", "1"], ["1", "2"], ["2", "4"], ["3", "8"], ["4", "16"], ["5", "32"]]), "2 的幂"),
        prompt: "2 的几次方等于 8？",
        options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }],
        correct: "3",
        correctText: "正确。2³ = 8，所以 log₂ 8 = 3。",
        wrongText: "在表里找 2ⁿ = 8 的那一行。",
        reveal: "log₂ 8 就是“2 的多少次方是 8”。"
      },
      {
        prompt: "那么 log₂ 32 等于多少？",
        options: [{ value: "4", label: "4" }, { value: "5", label: "5" }, { value: "6", label: "6" }],
        correct: "5",
        correctText: "正确。2⁵ = 32。",
        wrongText: "从 16 再乘一次 2 就是 32。",
        reveal: "指数每加 1，结果翻倍；对数把乘法关系翻回加法。"
      }
    ]
  });
}

function clockSVG(hour) {
  const cx = 55;
  const cy = 48;
  const angle = (hour % 12) / 12 * Math.PI * 2 - Math.PI / 2;
  const handX = cx + Math.cos(angle) * 26;
  const handY = cy + Math.sin(angle) * 26;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = i / 12 * Math.PI * 2 - Math.PI / 2;
    return `<text x="${cx + Math.cos(a) * 36}" y="${cy + Math.sin(a) * 36 + 3}" text-anchor="middle" font-size="8" fill="#8ba09c">${i === 0 ? 12 : i}</text>`;
  }).join("");
  return `<svg viewBox="0 0 110 96" class="exp-graph" style="max-width:150px" role="img" aria-label="时钟">
    <circle cx="${cx}" cy="${cy}" r="42" fill="#fbfdfc" stroke="#7fa8a1" stroke-width="2" />${ticks}
    <line x1="${cx}" y1="${cy}" x2="${handX}" y2="${handY}" stroke="#168c81" stroke-width="3" stroke-linecap="round" />
    <circle cx="${cx}" cy="${cy}" r="3" fill="#168c81" /></svg>`;
}

function modularArithmetic(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "模运算像时钟：超过一圈就从头开始。",
    steps: [
      {
        visual: () => visual(clockSVG(10), "指向 10 点的时钟"),
        prompt: "时钟从 10 点再走 5 小时，落在几点？",
        options: [{ value: "3", label: "3 点" }, { value: "15", label: "15 点" }, { value: "5", label: "5 点" }],
        correct: "3",
        correctText: "正确。10 + 5 = 15，15 mod 12 = 3。",
        wrongText: "钟面只有 12 个刻度，超过 12 要绕回来。",
        reveal: "15 除以 12 余 3，所以指针落在 3 点。"
      },
      {
        prompt: "7 × 3 mod 12 等于多少？",
        options: [{ value: "9", label: "9" }, { value: "21", label: "21" }, { value: "3", label: "3" }],
        correct: "9",
        correctText: "正确。21 ÷ 12 余 9。",
        wrongText: "先算 7 × 3 = 21，再对 12 取余。",
        reveal: "mod 只保留除以模数后的余数。"
      }
    ]
  });
}

function induction(root, context, experiment) {
  const dominoes = Array.from({ length: 8 }, (_, i) =>
    `<div class="exp-domino" style="height:${38 + i * 4}px"></div>`).join("");
  mountChoiceSteps(root, experiment, {
    intro: "归纳法像多米诺：先推倒第一块，再保证每一块都能推倒下一块。",
    steps: [
      {
        visual: () => visual(`<div class="exp-dominoes">${dominoes}</div>`, "一排多米诺"),
        prompt: "为什么只推倒第 1 块，后面所有块都会倒？",
        options: [
          { value: "chain", label: "因为每一块倒下都会推倒下一块" },
          { value: "even", label: "因为一共有 8 块，是偶数" },
          { value: "zero", label: "因为第 0 块一定存在" }
        ],
        correct: "chain",
        correctText: "正确。归纳步保证“这一块倒 → 下一块倒”。",
        wrongText: "关键在相邻两块之间的传递关系。",
        reveal: "基础步推倒第 1 块；归纳步保证 n 成立时 n+1 也成立。"
      },
      {
        prompt: "如果第 1 块没有被推倒，结论还成立吗？",
        options: [{ value: "no", label: "不成立" }, { value: "yes", label: "仍然成立" }],
        correct: "no",
        correctText: "正确。缺少基础步，链条不会启动。",
        wrongText: "归纳步只负责传递，启动还需要基础步。",
        reveal: "所以数学归纳法必须同时验证基础步和归纳步。"
      }
    ]
  });
}

export const EXPERIMENTS = [
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
    id: "integer-subtraction",
    title: "减去负数为什么变大？",
    nodeId: "integers",
    domain: "numbers",
    summary: "在数轴上把 −(−3) 看成向相反方向移动。",
    steps: 2,
    toolLinks: ["number-line"],
    mount: integers
  },
  {
    id: "power-growth",
    title: "2ⁿ 增长得有多快？",
    nodeId: "powers",
    domain: "numbers",
    summary: "拖动指数，观察每加 1 就翻倍。",
    steps: 2,
    toolLinks: ["growth"],
    mount: powers
  },
  {
    id: "peano-successor",
    title: "自然数是怎么长出来的？",
    nodeId: "peano-axioms",
    domain: "numbers",
    summary: "从 0 连续取后继，看到自然数的链式结构。",
    steps: 2,
    toolLinks: ["successor"],
    mount: peanoAxioms
  },
  {
    id: "recursive-addition",
    title: "加法为什么能递归展开？",
    nodeId: "natural-numbers",
    domain: "numbers",
    summary: "把 3+2 一层层化成后继。",
    steps: 2,
    toolLinks: ["successor"],
    mount: naturalNumbers
  },
  {
    id: "logarithm-question",
    title: "log₂ 8 到底在问什么？",
    nodeId: "logarithms",
    domain: "numbers",
    summary: "在 2 的幂表里反查指数。",
    steps: 2,
    toolLinks: ["growth"],
    mount: logarithms
  },
  {
    id: "mod-clock",
    title: "模运算为什么像时钟？",
    nodeId: "modular-arithmetic",
    domain: "numbers",
    summary: "在 12 小时钟面上做加法与乘法取余。",
    steps: 2,
    toolLinks: ["number-line"],
    mount: modularArithmetic
  },
  {
    id: "induction-dominoes",
    title: "归纳法为什么要两步？",
    nodeId: "mathematical-induction",
    domain: "numbers",
    summary: "用多米诺理解基础步与归纳步的分工。",
    steps: 2,
    toolLinks: ["induction"],
    mount: induction
  }
];
