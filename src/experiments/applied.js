// 应用与工程：数据库、编译器、安全、机器学习、软件工程、测试、版本控制。

import { shell, table, visual, mountChoiceSteps, mountStepper } from "./shared.js";

function databases(root, context, experiment) {
  const users = [
    { id: 1, name: "Ada", age: 36 },
    { id: 2, name: "Bob", age: 19 },
    { id: 3, name: "Cy", age: 25 }
  ];
  let minAge = 25;
  let feedback = "";
  const render = () => {
    const rows = users.filter((user) => user.age >= minAge).map((user) => [String(user.id), user.name, String(user.age)]);
    root.innerHTML = shell(experiment, `
      <div class="lab-controls"><label>WHERE age ≥ <b>${minAge}</b><input type="range" min="18" max="36" value="${minAge}" data-slider></label></div>
      ${visual(table(["id", "name", "age"], users.map((user) => [String(user.id), user.name, String(user.age)])), "users 表")}
      <div class="exp-output">查询结果：${rows.length ? table(["id", "name", "age"], rows) : "空"}</div>
      <div class="exp-question">SELECT name FROM users WHERE age ≥ 25 返回几行？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="1">1 行</button><button class="study-button" data-exp-choice="2">2 行</button><button class="study-button" data-exp-choice="3">3 行</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-slider]").addEventListener("input", (event) => { minAge = Number(event.target.value); render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "2" ? "正确。Ada 36 岁、Cy 25 岁满足条件，Bob 19 岁被过滤。" : "把 age 和 25 比较，注意 ≥ 包含 25。";
      render();
    }));
  };
  render();
}

function compiler(root, context, experiment) {
  const frames = [
    "源代码：let x = 1 + 2;",
    "词法分析：let、x、=、1、+、2、;",
    "语法分析：生成赋值语句的抽象语法树",
    "语义分析：检查 x 是否已声明、类型是否匹配",
    "中间表示 / 优化：1 + 2 折叠为 3",
    "目标代码：把结果写入寄存器或内存"
  ];
  mountStepper(root, experiment, {
    intro: "编译器把源程序逐层翻译成机器能执行的形式。",
    frames,
    nextLabel: "进入下一阶段",
    frameHTML: (frame) => `${visual(`<div class="exp-sequence">${frame}</div>`, "编译阶段")}`,
    question: "检查括号是否配对、语句结构是否合法，属于哪个阶段？",
    options: [{ value: "parse", label: "语法分析" }, { value: "lex", label: "词法分析" }, { value: "link", label: "链接" }],
    correct: "parse",
    correctText: "正确。语法分析按文法检查 token 序列的结构。",
    wrongText: "词法只负责把字符切成 token，结构检查在语法分析。",
    footerNote: "编译器先翻译，链接器再把多个目标文件合成可执行文件。"
  });
}

function cybersecurity(root, context, experiment) {
  let salted = false;
  let feedback = "";
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="lab-controls"><button class="study-button ${salted ? "primary" : ""}" data-toggle>${salted ? "使用随机盐" : "只做哈希"}</button></div>
      ${visual(table(["用户", "存储的密码摘要"], [["Ada", salted ? "9f2c…（盐 x9）" : "e10adc…"], ["Bob", salted ? "71ab…（盐 k2）" : "e10adc…"]]), "密码存储")}
      <div class="exp-note">${salted ? "两个用户即使密码相同，摘要也不同。" : "相同密码得到相同摘要，容易被彩虹表批量破解。"}</div>
      <div class="exp-question">为每个用户加入随机盐，主要解决什么问题？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="rainbow">让相同密码的摘要不同，抵御彩虹表</button><button class="study-button" data-exp-choice="speed">让哈希计算更快</button><button class="study-button" data-exp-choice="encrypt">把密码变成可逆加密</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-toggle]").addEventListener("click", () => { salted = !salted; feedback = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "rainbow" ? "正确。盐让预计算的摘要表失效，也避免相同密码暴露。" : "盐不提高哈希速度，也不是可逆加密。";
      render();
    }));
  };
  render();
}

function machineLearning(root, context, experiment) {
  let epochs = 0;
  let feedback = "";
  const render = () => {
    const target = 2;
    const weight = 2 * (1 - 0.5 ** epochs);
    const loss = (target - weight) ** 2;
    root.innerHTML = shell(experiment, `
      <div class="exp-question">用数据训练一个最简单的模型：真实关系是 y = 2x。</div>
      <div class="lab-controls"><label>训练轮数 = <b>${epochs}</b><input type="range" min="0" max="8" value="${epochs}" data-slider></label></div>
      ${visual(table(["参数", "值"], [["权重 w", weight.toFixed(3)], ["损失 (2−w)²", loss.toFixed(3)]]), "训练过程")}
      <div class="exp-question">训练过程中，模型主要在调整什么？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="weights">权重参数</button><button class="study-button" data-exp-choice="data">训练数据本身</button><button class="study-button" data-exp-choice="cpu">CPU 频率</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-slider]").addEventListener("input", (event) => { epochs = Number(event.target.value); feedback = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "weights" ? "正确。训练通过梯度调整权重，让损失下降。" : "数据是给定的，训练改变的是模型参数。";
      render();
    }));
  };
  render();
}

function softwareEngineering(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "软件工程用流程降低“写完才发现做错”的风险。",
    steps: [
      {
        prompt: "在写代码之前，最应该先明确什么？",
        options: [{ value: "req", label: "需求与验收标准" }, { value: "color", label: "代码编辑器的主题" }, { value: "micro", label: "微服务框架" }],
        correct: "req",
        correctText: "正确。先知道要解决什么问题，才能判断实现是否正确。",
        wrongText: "技术选型要服务于需求，而不是先于需求。",
        reveal: "需求 → 设计 → 实现 → 测试 → 维护。"
      },
      {
        prompt: "为什么要做代码评审？",
        options: [{ value: "early", label: "在合并前发现缺陷与设计问题" }, { value: "slow", label: "故意拖慢开发速度" }, { value: "replace", label: "完全替代测试" }],
        correct: "early",
        correctText: "正确。评审让问题在进入主干前暴露，成本更低。",
        wrongText: "评审是质量活动，不是替代测试的手段。",
        reveal: "评审 + 自动化测试 + 持续集成共同保证质量。"
      }
    ]
  });
}

function softwareTesting(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "边界值分析关注范围的边缘，因为错误常出现在那里。",
    steps: [
      {
        visual: () => visual(`<div class="exp-sequence">有效输入范围：1 ≤ x ≤ 100</div>`, "输入范围"),
        prompt: "有效范围的边界值是？",
        options: [{ value: "1-100", label: "1 和 100" }, { value: "50", label: "50" }, { value: "0-101", label: "0 和 101" }],
        correct: "1-100",
        correctText: "正确。1 和 100 是有效区间的两个端点。",
        wrongText: "边界是区间两端的有效值。",
        reveal: "边界值测试通常同时测有效边界和刚好越界的值。"
      },
      {
        prompt: "为了检查越界处理，还应该测试哪些值？",
        options: [{ value: "outside", label: "0 和 101" }, { value: "middle", label: "50 和 51" }, { value: "random", label: "任意随机数" }],
        correct: "outside",
        correctText: "正确。0 和 101 刚好越过下界和上界。",
        wrongText: "刚好越界的值最能暴露边界判断错误。",
        reveal: "典型组合：0、1、100、101。"
      }
    ]
  });
}

function versionControl(root, context, experiment) {
  const frames = [
    { branch: "main", commits: ["A"], note: "提交 A 是起点。" },
    { branch: "main", commits: ["A", "B"], note: "在 main 上提交 B。" },
    { branch: "feature", commits: ["A", "B", "C"], note: "从 B 拉出 feature，提交 C。" },
    { branch: "main", commits: ["A", "B", "D"], note: "main 同时前进到 D。" },
    { branch: "main + feature", commits: ["A", "B", "D", "M"], note: "合并 M 同时指向 D 和 C，有两个父提交。" }
  ];
  mountStepper(root, experiment, {
    intro: "提交是一张有向无环图，分支只是指向某个提交的指针。",
    frames,
    nextLabel: "下一步",
    frameHTML: (frame) => `${visual(`<div class="exp-sequence"><b>${frame.branch}</b><br>${frame.commits.join(" → ")}</div>`, "提交历史")}<div class="exp-note">${frame.note}</div>`,
    question: "合并提交 M 有什么特别之处？",
    options: [{ value: "two", label: "它有两个父提交" }, { value: "zero", label: "它没有父提交" }, { value: "copy", label: "它复制了所有文件" }],
    correct: "two",
    correctText: "正确。合并提交同时保留两条历史的父节点。",
    wrongText: "普通提交一个父节点，合并提交有两个。",
    footerNote: "分支只是指针；提交图才是版本控制真正保存的结构。"
  });
}

export const EXPERIMENTS = [
  {
    id: "sql-filter",
    title: "WHERE 到底过滤了谁？",
    nodeId: "databases",
    domain: "data",
    summary: "拖动年龄条件，观察 SELECT 结果集变化。",
    steps: 2,
    toolLinks: ["relational"],
    mount: databases
  },
  {
    id: "compiler-stages",
    title: "代码是怎样被翻译的？",
    nodeId: "compiler",
    domain: "languages",
    summary: "从源码走到目标代码，辨认每个阶段。",
    steps: 2,
    toolLinks: [],
    mount: compiler
  },
  {
    id: "password-salt",
    title: "加盐为什么能防彩虹表？",
    nodeId: "cybersecurity",
    domain: "security",
    summary: "比较相同密码在无盐与加盐下的摘要。",
    steps: 2,
    toolLinks: [],
    mount: cybersecurity
  },
  {
    id: "training-loss",
    title: "训练到底在调整什么？",
    nodeId: "machine-learning",
    domain: "ai",
    summary: "拖动训练轮数，观察权重与损失下降。",
    steps: 2,
    toolLinks: ["gradient"],
    mount: machineLearning
  },
  {
    id: "engineering-flow",
    title: "为什么不能直接开始写代码？",
    nodeId: "software-engineering",
    domain: "software",
    summary: "从需求、设计到评审，理解流程的作用。",
    steps: 2,
    toolLinks: [],
    mount: softwareEngineering
  },
  {
    id: "boundary-testing",
    title: "测试为什么要盯着边界？",
    nodeId: "software-testing",
    domain: "testing",
    summary: "对范围 1–100 选取有效与越界边界值。",
    steps: 2,
    toolLinks: [],
    mount: softwareTesting
  },
  {
    id: "merge-commit",
    title: "合并提交为什么有两个父节点？",
    nodeId: "version-control",
    domain: "version-control",
    summary: "沿着 main 与 feature 两条历史走到合并。",
    steps: 2,
    toolLinks: [],
    mount: versionControl
  }
];
