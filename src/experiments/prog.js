// 编程与算法：过程、控制流、数组、复杂度、递归、树、函数、排序、哈希、动态规划。

import { esc, shell, table, visual, mountStepper } from "./shared.js";

function sortingBubble(root, context, experiment) {
  let passed = false;
  const render = () => {
    const arr = passed ? [2, 4, 1, 5] : [5, 2, 4, 1];
    root.innerHTML = shell(experiment, `
      <div class="exp-bars">${arr.map((value, index) => `<div class="exp-bar" style="height:${30 + value * 14}px;${passed && index === 3 ? "background:linear-gradient(180deg,#f1c178,#dfa03f);" : ""}"><span>${value}</span></div>`).join("")}</div>
      <div class="lab-controls"><button class="study-button primary" data-pass ${passed ? "disabled" : "data-step"}>${passed ? "已完成第一轮" : "执行第一轮冒泡"}</button></div>
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

function arrayHTML(values, { current = -1, best = -1, interactive = false } = {}) {
  const tag = interactive ? "button" : "div";
  return `<div class="exp-array">${values.map((value, index) => `<${tag} class="exp-cell ${index === current ? "current" : ""} ${index === best ? "best" : ""}" ${interactive ? `data-index="${index}" type="button"` : ""}><b>${value}</b><small>a[${index}]</small></${tag}>`).join("")}</div>`;
}

function algorithm(root, context, experiment) {
  const values = [3, 7, 2];
  const frames = [
    { current: 0, best: 0, note: "从第一个元素开始，最大值暂定为 3。" },
    { current: 1, best: 1, note: "7 > 3，最大值换成 7。" },
    { current: 2, best: 1, note: "2 < 7，最大值保持不变。" }
  ];
  mountStepper(root, experiment, {
    intro: "算法就是一组有限、确定的步骤。用“找最大值”走一遍。",
    frames,
    nextLabel: "比较下一个",
    frameHTML: (frame) => `${visual(arrayHTML(values, frame), "数组找最大值")}<div class="exp-note">${frame.note}</div>`,
    question: "3 个元素找最大值，一共需要比较几次？",
    options: [{ value: "1", label: "1 次" }, { value: "2", label: "2 次" }, { value: "3", label: "3 次" }],
    correct: "2",
    correctText: "正确。第一个元素不用比较，剩下 2 个各比较一次。",
    wrongText: "从第二个元素开始，每个都要和当前最大值比一次。",
    footerNote: "有限步、每步确定、最后得到输出，这是算法的三个基本要求。"
  });
}

function controlFlow(root, context, experiment) {
  const frames = [
    { i: 1, sum: 1, test: "1 ≤ 4 成立" },
    { i: 2, sum: 3, test: "2 ≤ 4 成立" },
    { i: 3, sum: 6, test: "3 ≤ 4 成立" },
    { i: 4, sum: 10, test: "4 ≤ 4 成立" },
    { i: 5, sum: 10, test: "5 ≤ 4 不成立，退出循环" }
  ];
  mountStepper(root, experiment, {
    intro: "循环 = 条件判断 + 重复执行 + 更新变量。",
    frames,
    nextLabel: "执行一轮",
    frameHTML: (frame) => `${visual(`<div class="exp-sequence">sum = ${frame.sum}　i = ${frame.i}</div>`, "循环变量")}${table(["判断", "结果"], [[frame.test, frame.i <= 4 ? "进入循环体" : "结束"]])}`,
    question: "sum 从 0 加到 4，循环体一共执行几次？",
    options: [{ value: "3", label: "3 次" }, { value: "4", label: "4 次" }, { value: "5", label: "5 次" }],
    correct: "4",
    correctText: "正确。i = 1,2,3,4 时各执行一次。",
    wrongText: "i 从 1 开始，到 4 为止都满足条件。",
    footerNote: "第 5 次只做条件判断，不进入循环体。"
  });
}

function arrays(root, context, experiment) {
  const values = [7, 3, 9, 1];
  let selected = -1;
  let feedback = "";
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-question">点击一个下标，看看数组里存的是什么。</div>
      ${visual(arrayHTML(values, { current: selected, interactive: true }), "数组下标")}
      <div class="exp-output">${selected >= 0 ? `a[${selected}] = <b>${values[selected]}</b>` : "还没有选择下标。"}</div>
      <div class="exp-question">a[2] 的值是多少？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="7">7</button><button class="study-button" data-exp-choice="9">9</button><button class="study-button" data-exp-choice="3">3</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelectorAll("[data-index]").forEach((button) => button.addEventListener("click", () => { selected = Number(button.dataset.index); feedback = ""; render(); }));
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "9" ? "正确。下标从 0 开始，a[2] 是第三个元素 9。" : "下标从 0 开始数：a[0]=7，a[1]=3，a[2]=9。";
      render();
    }));
  };
  render();
}

function complexity(root, context, experiment) {
  let n = 10;
  let feedback = "";
  const render = () => {
    const rows = [
      ["n", n],
      ["n log₂ n", Math.round(n * Math.log2(n))],
      ["n²", n * n],
      ["2ⁿ", 2 ** n]
    ];
    root.innerHTML = shell(experiment, `
      <div class="exp-question">拖动规模 n，比较几种增长函数。</div>
      <div class="lab-controls"><label>n = <b>${n}</b><input type="range" min="2" max="20" value="${n}" data-slider></label></div>
      ${table(["函数", "值"], rows.map(([name, value]) => [name, value.toLocaleString("en-US")]))}
      <div class="exp-question">n 变大时，哪一种增长最快？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="nlogn">n log n</button><button class="study-button" data-exp-choice="n2">n²</button><button class="study-button" data-exp-choice="2n">2ⁿ</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-slider]").addEventListener("input", (event) => { n = Number(event.target.value); render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "2n" ? "正确。指数增长最终会超过任何多项式。" : "把 n 拖到 20，再比较一下数量级。";
      render();
    }));
  };
  render();
}

function recursion(root, context, experiment) {
  const frames = [
    "fact(4) = 4 × fact(3)",
    "fact(3) = 3 × fact(2)",
    "fact(2) = 2 × fact(1)",
    "fact(1) = 1 × fact(0)",
    "fact(0) = 1　（基例）",
    "fact(1) = 1 × 1 = 1",
    "fact(2) = 2 × 1 = 2",
    "fact(3) = 3 × 2 = 6",
    "fact(4) = 4 × 6 = 24"
  ];
  mountStepper(root, experiment, {
    intro: "递归先一路向下到基例，再逐层返回。",
    frames,
    nextLabel: "展开 / 返回",
    frameHTML: (frame, index) => `${visual(`<div class="exp-sequence">${esc(frame)}</div>`, "阶乘递归")}<div class="exp-note">${index < 4 ? "正在向下展开。" : index === 4 ? "到达基例，开始返回。" : "正在把结果带回上一层。"}</div>`,
    question: "fact(0) 为什么必须定义为 1？",
    options: [
      { value: "base", label: "它是递归的基例，让展开停下来" },
      { value: "zero", label: "因为 0 的阶乘没有意义" },
      { value: "speed", label: "为了让程序运行得更快" }
    ],
    correct: "base",
    correctText: "正确。没有基例，递归会一直展开下去。",
    wrongText: "递归需要一个不再调用自身的终止点。",
    footerNote: "fact(n) = n × fact(n−1)，fact(0) = 1。"
  });
}

const TREE_POINTS = { A: [150, 26], B: [86, 78], C: [214, 78], D: [44, 132], E: [128, 132] };
const TREE_EDGES = [["A", "B"], ["A", "C"], ["B", "D"], ["B", "E"]];
const PREORDER = ["A", "B", "D", "E", "C"];

function treeSVG(visited) {
  const lines = TREE_EDGES.map(([a, b]) => {
    const [x1, y1] = TREE_POINTS[a];
    const [x2, y2] = TREE_POINTS[b];
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#a9c6c0" stroke-width="2" />`;
  }).join("");
  const nodes = Object.entries(TREE_POINTS).map(([name, [x, y]]) =>
    `<circle cx="${x}" cy="${y}" r="16" fill="${visited.has(name) ? "#b9e3d9" : "#fff"}" stroke="${visited.has(name) ? "#4aa696" : "#a9c6c0"}" stroke-width="2" />
     <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" fill="#31515a">${name}</text>`).join("");
  return `<svg viewBox="0 0 300 165" class="exp-graph" role="img" aria-label="二叉树">${lines}${nodes}</svg>`;
}

function trees(root, context, experiment) {
  mountStepper(root, experiment, {
    intro: "先序遍历：根 → 左子树 → 右子树。",
    frames: PREORDER.map((_, index) => new Set(PREORDER.slice(0, index + 1))),
    nextLabel: "访问下一个",
    frameHTML: (visited, index) => `${visual(treeSVG(visited), "二叉树先序遍历")}<div class="exp-note">已访问：${PREORDER.slice(0, index + 1).join(" → ")}</div>`,
    question: "这棵树的先序遍历顺序是？",
    options: [
      { value: "abdec", label: "A B D E C" },
      { value: "dbeac", label: "D B E A C" },
      { value: "debca", label: "D E B C A" }
    ],
    correct: "abdec",
    correctText: "正确。先根 A，再左子树 B（D、E），最后右子树 C。",
    wrongText: "先序的第一个一定是根 A，然后进入左子树。",
    footerNote: "中序是 D B E A C，后序是 D E B C A。"
  });
}

function functionsProcedures(root, context, experiment) {
  const frames = [
    "f(3) = g(3) + 1",
    "g(3) = 3 × 2 = 6",
    "f(3) = 6 + 1 = 7"
  ];
  mountStepper(root, experiment, {
    intro: "函数调用把参数传进去，再把返回值带回来。",
    frames,
    nextLabel: "执行下一层",
    frameHTML: (frame) => `${visual(`<div class="exp-sequence">${esc(frame)}</div>`, "函数调用")}`,
    question: "f(3) 的返回值是多少？",
    options: [{ value: "6", label: "6" }, { value: "7", label: "7" }, { value: "9", label: "9" }],
    correct: "7",
    correctText: "正确。g(3)=6，再加 1 得到 7。",
    wrongText: "先算 g(3)，再把结果交给 f。",
    footerNote: "f 依赖 g 的返回值；调用顺序是 f → g，返回顺序是 g → f。"
  });
}

function hashTables(root, context, experiment) {
  const keys = ["cat", "dog", "bird", "ant"];
  const inserted = new Set();
  const buckets = Array.from({ length: 5 }, () => []);
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-question">哈希函数 h(key) = 字符个数 mod 5。点击键，把它放进桶里。</div>
      <div class="exp-choices">${keys.map((key) => `<button class="study-button ${inserted.has(key) ? "primary" : ""}" data-key="${key}">${key}</button>`).join("")}</div>
      <div class="exp-visual"><div class="exp-buckets">${buckets.map((bucket, index) => `<div class="exp-bucket"><b>${index}</b><small>${bucket.length ? bucket.join("、") : "空"}</small></div>`).join("")}</div></div>
      <div class="exp-question">cat 和 dog 会落在同一个桶里吗？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="yes">会</button><button class="study-button" data-exp-choice="no">不会</button></div>
      <div class="exp-feedback" data-feedback></div>`);
    root.querySelectorAll("[data-key]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.key;
      const bucket = buckets[key.length % 5];
      if (!inserted.has(key)) {
        inserted.add(key);
        bucket.push(key);
      }
      render();
    }));
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      const feedback = root.querySelector("[data-feedback]");
      feedback.textContent = button.dataset.expChoice === "yes"
        ? "正确。两个键都是 3 个字符，h = 3，发生哈希冲突。"
        : "数一下字符个数：cat 和 dog 都是 3。";
    }));
  };
  render();
}

function dynamicProgramming(root, context, experiment) {
  const frames = [
    { n: 0, value: 0, note: "F(0) = 0" },
    { n: 1, value: 1, note: "F(1) = 1" },
    { n: 2, value: 1, note: "F(2) = F(1) + F(0) = 1" },
    { n: 3, value: 2, note: "F(3) = F(2) + F(1) = 1 + 1" },
    { n: 4, value: 3, note: "F(4) = F(3) + F(2) = 2 + 1" },
    { n: 5, value: 5, note: "F(5) = F(4) + F(3) = 3 + 2" }
  ];
  mountStepper(root, experiment, {
    intro: "把算过的结果存进表里，后面直接查表。",
    frames,
    nextLabel: "计算下一项",
    frameHTML: (frame, index) => `${visual(`<div class="exp-array">${frames.slice(0, index + 1).map((item) => `<div class="exp-cell"><b>${item.value}</b><small>F(${item.n})</small></div>`).join("")}</div>`, "斐波那契表")}<div class="exp-note">${frame.note}</div>`,
    question: "记忆化为什么能加速斐波那契？",
    options: [
      { value: "repeat", label: "避免重复计算相同的子问题" },
      { value: "sort", label: "因为它先把数组排序了" },
      { value: "less", label: "因为它减少了输入规模" }
    ],
    correct: "repeat",
    correctText: "正确。每个 F(n) 只算一次，之后直接查表。",
    wrongText: "注意表里已经存过的值，后来被直接用了。",
    footerNote: "动态规划 = 子问题 + 记忆化 + 递推关系。"
  });
}

export const EXPERIMENTS = [
  {
    id: "sorting-bubble",
    title: "冒泡第一轮做了什么？",
    nodeId: "sorting",
    domain: "prog",
    summary: "执行一轮冒泡，观察最大值如何移动到末尾。",
    steps: 2,
    toolLinks: ["sorting"],
    mount: sortingBubble
  },
  {
    id: "algorithm-steps",
    title: "算法为什么必须有限步？",
    nodeId: "algorithm",
    domain: "prog",
    summary: "逐步执行找最大值，数一数比较次数。",
    steps: 2,
    toolLinks: ["trace"],
    mount: algorithm
  },
  {
    id: "control-flow-loop",
    title: "循环体到底执行几次？",
    nodeId: "control-flow",
    domain: "prog",
    summary: "逐轮执行 1 到 4 的累加，观察条件退出。",
    steps: 2,
    toolLinks: ["trace"],
    mount: controlFlow
  },
  {
    id: "array-index",
    title: "a[2] 为什么不是第二个元素？",
    nodeId: "arrays",
    domain: "prog",
    summary: "点击下标，确认数组从 0 开始编号。",
    steps: 2,
    toolLinks: ["trace"],
    mount: arrays
  },
  {
    id: "complexity-growth",
    title: "哪种增长最终会赢？",
    nodeId: "complexity",
    domain: "prog",
    summary: "拖动 n，比较 n log n、n² 与 2ⁿ。",
    steps: 2,
    toolLinks: ["growth"],
    mount: complexity
  },
  {
    id: "recursion-unwind",
    title: "递归为什么要先停住？",
    nodeId: "recursion",
    domain: "prog",
    summary: "跟着 fact(4) 展开到基例，再逐层返回。",
    steps: 2,
    toolLinks: ["trace"],
    mount: recursion
  },
  {
    id: "tree-preorder",
    title: "先序遍历先看哪里？",
    nodeId: "trees",
    domain: "prog",
    summary: "按根、左、右的顺序访问一棵小树。",
    steps: 2,
    toolLinks: ["tree"],
    mount: trees
  },
  {
    id: "function-calls",
    title: "返回值是怎么带回来的？",
    nodeId: "functions-procedures",
    domain: "prog",
    summary: "跟踪 f(3) 调用 g(3)，再带着结果返回。",
    steps: 2,
    toolLinks: ["trace"],
    mount: functionsProcedures
  },
  {
    id: "hash-collision",
    title: "哈希冲突是怎么发生的？",
    nodeId: "hash-tables",
    domain: "prog",
    summary: "把几个键放进 5 个桶，观察长度相同导致的碰撞。",
    steps: 2,
    toolLinks: ["trace"],
    mount: hashTables
  },
  {
    id: "dp-memo",
    title: "为什么要记住算过的结果？",
    nodeId: "dynamic-programming",
    domain: "prog",
    summary: "逐项填斐波那契表，避免重复计算。",
    steps: 2,
    toolLinks: ["trace"],
    mount: dynamicProgramming
  }
];
