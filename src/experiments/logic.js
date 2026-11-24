// 数理逻辑：命题、证明、公理系统、量词。

import { esc, shell, table, visual, mountChoiceSteps } from "./shared.js";

function propositional(root, context, experiment) {
  let p = true;
  let q = false;
  let feedback = "";
  const render = () => {
    const rows = [
      [true, true, true],
      [true, false, false],
      [false, true, true],
      [false, false, true]
    ];
    root.innerHTML = shell(experiment, `
      <div class="lab-controls">
        <button class="study-button ${p ? "primary" : ""}" data-toggle-p>P = ${p ? "真" : "假"}</button>
        <button class="study-button ${q ? "primary" : ""}" data-toggle-q>Q = ${q ? "真" : "假"}</button>
      </div>
      ${visual(table(["P", "Q", "P → Q"], rows.map(([a, b, value]) => [a ? "真" : "假", b ? "真" : "假", `<b>${value ? "真" : "假"}</b>`])), "蕴含真值表")}
      <div class="exp-output">当前：P → Q 为 <b>${!p || q ? "真" : "假"}</b></div>
      <div class="exp-question">P → Q 在什么情况下为假？</div>
      <div class="exp-choices">
        <button class="study-button" data-exp-choice="tf">P 真、Q 假</button>
        <button class="study-button" data-exp-choice="ft">P 假、Q 真</button>
        <button class="study-button" data-exp-choice="never">永远为假</button>
      </div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-toggle-p]").addEventListener("click", () => { p = !p; render(); });
    root.querySelector("[data-toggle-q]").addEventListener("click", () => { q = !q; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "tf"
        ? "正确。只有“前提真、结论假”时，蕴含才为假。"
        : "把 P 和 Q 都切换一遍，找出真值表里唯一的“假”。";
      render();
    }));
  };
  render();
}

function proofs(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "证明方法决定你先假设什么、最后得到什么。",
    steps: [
      {
        prompt: "要证明“若 n 是偶数，则 n² 是偶数”，最直接的做法是？",
        options: [
          { value: "direct", label: "设 n = 2k，直接代入 n²" },
          { value: "contra", label: "先假设 n² 是奇数" },
          { value: "induction", label: "对 n 做数学归纳法" }
        ],
        correct: "direct",
        correctText: "正确。由定义设 n = 2k，再算 n² = 4k²。",
        wrongText: "结论里有 n²，先把 n 的偶数定义代进去。",
        reveal: "直接证明：从已知条件出发，经过有效推理得到结论。"
      },
      {
        prompt: "反证法一开始要假设什么？",
        options: [
          { value: "negate", label: "假设结论不成立" },
          { value: "same", label: "假设结论成立" },
          { value: "example", label: "举一个例子" }
        ],
        correct: "negate",
        correctText: "正确。反证法从结论的否定出发，推出矛盾。",
        wrongText: "反证法要暂时站到结论的反面。",
        reveal: "推出矛盾后，说明“结论不成立”是假的，所以结论成立。"
      }
    ]
  });
}

function axiomatic(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "公理系统里，结论必须由公理和推理规则推出。",
    steps: [
      {
        visual: () => visual(table(["前提", "内容"], [["A1", "所有猫都会叫"], ["A2", "Tom 是猫"]]), "公理与事实"),
        prompt: "由 A1、A2 能推出什么？",
        options: [
          { value: "tom", label: "Tom 会叫" },
          { value: "all", label: "所有动物都会叫" },
          { value: "nothing", label: "什么也推不出" }
        ],
        correct: "tom",
        correctText: "正确。把 Tom 代入“所有猫”得到 Tom 会叫。",
        wrongText: "A2 说的是 Tom 属于猫，A1 说的是猫都会叫。",
        reveal: "这就是一条最普通的全称实例化推理。"
      },
      {
        prompt: "如果有人增加公理“所有猫都不会叫”，系统会怎样？",
        options: [
          { value: "inconsistent", label: "系统变得不一致" },
          { value: "stronger", label: "系统仍然一致且更强" },
          { value: "nothing", label: "没有影响" }
        ],
        correct: "inconsistent",
        correctText: "正确。两条公理互相矛盾，系统不一致。",
        wrongText: "同一只猫不能既会叫又不会叫。",
        reveal: "公理系统首先要避免自相矛盾。"
      }
    ]
  });
}

function predicate(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "量词在有限论域上可以逐个检查。",
    steps: [
      {
        visual: () => visual(table(["x", "x 是偶数"], [["1", "否"], ["2", "是"], ["3", "否"]]), "论域 {1,2,3}"),
        prompt: "在论域 {1,2,3} 上，∀x（x 是偶数）为真吗？",
        options: [{ value: "true", label: "真" }, { value: "false", label: "假" }],
        correct: "false",
        correctText: "正确。x = 1 就不是偶数，全称命题被反例推翻。",
        wrongText: "∀ 要求每一个 x 都满足。",
        reveal: "一个反例就足以否定全称命题。"
      },
      {
        prompt: "同一个论域上，∃x（x 是偶数）为真吗？",
        options: [{ value: "true", label: "真" }, { value: "false", label: "假" }],
        correct: "true",
        correctText: "正确。x = 2 就是一个见证。",
        wrongText: "∃ 只要找到一个满足的 x 就够了。",
        reveal: "存在量词需要一个见证；全称量词需要排除所有反例。"
      }
    ]
  });
}

export const EXPERIMENTS = [
  {
    id: "implication-table",
    title: "蕴含什么时候为假？",
    nodeId: "propositional-logic",
    domain: "logic",
    summary: "切换 P、Q，在真值表里找出唯一的假行。",
    steps: 2,
    toolLinks: ["boolean"],
    mount: propositional
  },
  {
    id: "proof-methods",
    title: "直接证明和反证法差在哪？",
    nodeId: "proofs",
    domain: "logic",
    summary: "选择证明策略，看它们各自先假设什么。",
    steps: 2,
    toolLinks: ["induction"],
    mount: proofs
  },
  {
    id: "axiom-consistency",
    title: "公理为什么会打架？",
    nodeId: "axiomatic-method",
    domain: "logic",
    summary: "从两条公理推出结论，再添加一条冲突公理。",
    steps: 2,
    toolLinks: ["rule-system"],
    mount: axiomatic
  },
  {
    id: "quantifier-witness",
    title: "∀ 和 ∃ 在找什么？",
    nodeId: "predicate-logic",
    domain: "logic",
    summary: "在有限论域上检查反例与见证。",
    steps: 2,
    toolLinks: ["quantifier"],
    mount: predicate
  }
];
