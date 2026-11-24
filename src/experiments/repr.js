// 信息表示：位、整数、编码、布尔、逻辑门、加法器、浮点、字节序。

import { esc, shell, table, visual, mountChoiceSteps, mountStepper } from "./shared.js";

function bitButtons(bits, { signed = false } = {}) {
  return `<div class="exp-array">${bits.map((bit, index) => `<button class="exp-cell ${bit ? "best" : ""}" data-bit="${index}" type="button"><b>${bit}</b><small>${signed ? `b<sub>${bits.length - 1 - index}</sub>` : `2<sup>${bits.length - 1 - index}</sup>`}</small></button>`).join("")}</div>`;
}

function valueOfBits(bits) {
  return bits.reduce((value, bit) => (value << 1) | bit, 0);
}

function mountBitLab(root, experiment, config) {
  const bits = [...config.initial];
  let feedback = "";
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-question">${config.prompt}</div>
      ${visual(bitButtons(bits, { signed: config.signed }), "二进制位")}
      ${config.readout(bits)}
      <div class="exp-question">${config.ask.prompt}</div>
      <div class="exp-choices">${config.ask.options.map((option) => `<button class="study-button" data-exp-choice="${esc(option.value)}">${esc(option.label)}</button>`).join("")}</div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelectorAll("[data-bit]").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.bit);
      bits[index] = bits[index] ? 0 : 1;
      feedback = "";
      render();
    }));
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === String(config.ask.correct)
        ? config.ask.correctText
        : config.ask.wrongText;
      render();
    }));
  };
  render();
}

function bitsBytes(root, context, experiment) {
  mountBitLab(root, experiment, {
    initial: [0, 1, 0, 0, 0, 0, 1, 0],
    prompt: "点击每一位，观察一个字节能表示什么。",
    readout: (bits) => `<div class="exp-output">二进制 <b>${bits.join("")}</b>　十进制 <b>${valueOfBits(bits)}</b>　十六进制 <b>0x${valueOfBits(bits).toString(16).toUpperCase().padStart(2, "0")}</b></div>`,
    ask: {
      prompt: "8 个二进制位一共有多少种组合？",
      options: [{ value: "256", label: "256" }, { value: "128", label: "128" }, { value: "8", label: "8" }],
      correct: "256",
      correctText: "正确。每一位有 2 种可能，2⁸ = 256。",
      wrongText: "每位 2 种，连续 8 位相乘。"
    }
  });
}

function unsigned(root, context, experiment) {
  mountBitLab(root, experiment, {
    initial: [1, 1, 1, 1, 1, 1, 1, 1],
    prompt: "把 8 位全部打开，观察无符号整数的最大值。",
    readout: (bits) => `<div class="exp-output">当前值 <b>${valueOfBits(bits)}</b>　范围：0 – 255</div>`,
    ask: {
      prompt: "8 位无符号整数的最大值是多少？",
      options: [{ value: "255", label: "255" }, { value: "256", label: "256" }, { value: "127", label: "127" }],
      correct: "255",
      correctText: "正确。最大是 11111111₂ = 255。",
      wrongText: "最大值是 8 个 1，不是 2⁸。"
    }
  });
}

function twosComplement(root, context, experiment) {
  mountBitLab(root, experiment, {
    initial: [1, 1, 1, 1],
    signed: true,
    prompt: "切换 4 位，比较同一串位的无符号值与补码值。",
    readout: (bits) => {
      const raw = valueOfBits(bits);
      const signed = raw >= 8 ? raw - 16 : raw;
      return `<div class="exp-output">无符号：<b>${raw}</b>　补码：<b>${signed}</b></div>`;
    },
    ask: {
      prompt: "1111 作为 4 位补码表示哪个数？",
      options: [{ value: "-1", label: "−1" }, { value: "15", label: "15" }, { value: "7", label: "7" }],
      correct: "-1",
      correctText: "正确。最高位是 1，按补码解释为 −1。",
      wrongText: "最高位为 1 时，要减去 2⁴。"
    }
  });
}

function overflow(root, context, experiment) {
  const frames = [
    { a: "0111", b: "0001", sum: "1000", note: "7 + 1 的位模式是 1000，但最高位变成了 1。" },
    { a: "1000", b: "", sum: "1000", note: "在 4 位补码里，1000 表示 −8，不是 +8。" }
  ];
  mountStepper(root, experiment, {
    intro: "定长加法只保留固定位数，多出来的进位会被丢掉。",
    frames,
    nextLabel: "观察结果",
    frameHTML: (frame) => `${visual(`<div class="exp-sequence">${frame.a}${frame.b ? ` + ${frame.b}` : ""} = ${frame.sum}</div>`, "4 位加法")}<div class="exp-note">${frame.note}</div>`,
    question: "4 位补码中，7 + 1 的结果实际表示多少？",
    options: [{ value: "8", label: "8" }, { value: "-8", label: "−8" }, { value: "0", label: "0" }],
    correct: "-8",
    correctText: "正确。位模式 1000 在 4 位补码中表示 −8，发生溢出。",
    wrongText: "结果位模式是 1000，按补码解释。",
    footerNote: "两个正数相加得到负数，是补码溢出的典型信号。"
  });
}

function characterCodes(root, context, experiment) {
  const samples = [
    { char: "A", code: "U+0041", bytes: "41" },
    { char: "é", code: "U+00E9", bytes: "C3 A9" },
    { char: "中", code: "U+4E2D", bytes: "E4 B8 AD" }
  ];
  let index = 0;
  let feedback = "";
  const render = () => {
    const sample = samples[index];
    root.innerHTML = shell(experiment, `
      <div class="exp-choices">${samples.map((item, i) => `<button class="study-button ${i === index ? "primary" : ""}" data-sample="${i}">${item.char}</button>`).join("")}</div>
      ${visual(table(["字符", "码点", "UTF-8 字节"], [[sample.char, sample.code, sample.bytes]]), "字符编码")}
      <div class="exp-question">为什么“中”占 3 个字节，而“A”只占 1 个？</div>
      <div class="exp-choices">
        <button class="study-button" data-exp-choice="variable">UTF-8 是变长编码</button>
        <button class="study-button" data-exp-choice="font">因为中文字体更大</button>
        <button class="study-button" data-exp-choice="error">因为编码出错了</button>
      </div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelectorAll("[data-sample]").forEach((button) => button.addEventListener("click", () => { index = Number(button.dataset.sample); feedback = ""; render(); }));
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "variable"
        ? "正确。码点越大，UTF-8 使用的字节数越多。"
        : "观察三种字符的字节数：1、2、3，并不固定。";
      render();
    }));
  };
  render();
}

function booleanAlgebra(root, context, experiment) {
  let a = true;
  let b = false;
  let feedback = "";
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="lab-controls"><button class="study-button ${a ? "primary" : ""}" data-a>A = ${a ? 1 : 0}</button><button class="study-button ${b ? "primary" : ""}" data-b>B = ${b ? 1 : 0}</button></div>
      ${visual(table(["A", "B", "A ∧ B", "A ∨ B", "¬A"], [[a ? 1 : 0, b ? 1 : 0, a && b ? 1 : 0, a || b ? 1 : 0, a ? 0 : 1]]), "布尔运算")}
      <div class="exp-question">当 A = 1、B = 0 时，A ∧ B 等于多少？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="0">0</button><button class="study-button" data-exp-choice="1">1</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-a]").addEventListener("click", () => { a = !a; render(); });
    root.querySelector("[data-b]").addEventListener("click", () => { b = !b; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "0" ? "正确。与运算只要有一个 0，结果就是 0。" : "与运算要求两个输入都为 1。";
      render();
    }));
  };
  render();
}

function logicGates(root, context, experiment) {
  let gate = "AND";
  let a = 1;
  let b = 0;
  let feedback = "";
  const out = () => gate === "AND" ? a && b : gate === "OR" ? a || b : a ^ b;
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-choices">${["AND", "OR", "XOR"].map((name) => `<button class="study-button ${gate === name ? "primary" : ""}" data-gate="${name}">${name}</button>`).join("")}</div>
      <div class="lab-controls"><button class="study-button ${a ? "primary" : ""}" data-a>输入 A = ${a}</button><button class="study-button ${b ? "primary" : ""}" data-b>输入 B = ${b}</button></div>
      ${visual(`<div class="exp-sequence">${gate}(${a}, ${b}) → <b>${out() ? 1 : 0}</b></div>`, "逻辑门")}
      <div class="exp-question">AND 门什么时候输出 1？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="both">两个输入都为 1</button><button class="study-button" data-exp-choice="either">任意一个输入为 1</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelectorAll("[data-gate]").forEach((button) => button.addEventListener("click", () => { gate = button.dataset.gate; render(); }));
    root.querySelector("[data-a]").addEventListener("click", () => { a = a ? 0 : 1; render(); });
    root.querySelector("[data-b]").addEventListener("click", () => { b = b ? 0 : 1; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "both" ? "正确。AND 是与：全 1 才输出 1。" : "任意一个为 1 是 OR 的规则。";
      render();
    }));
  };
  render();
}

function adders(root, context, experiment) {
  let a = 1;
  let b = 1;
  let feedback = "";
  const render = () => {
    const sum = a ^ b;
    const carry = a & b;
    root.innerHTML = shell(experiment, `
      <div class="lab-controls"><button class="study-button ${a ? "primary" : ""}" data-a>A = ${a}</button><button class="study-button ${b ? "primary" : ""}" data-b>B = ${b}</button></div>
      ${visual(`<div class="exp-sequence">${a} + ${b} → 和 <b>${sum}</b>，进位 <b>${carry}</b></div>`, "一位全加器")}
      <div class="exp-question">1 + 1 时，和与进位分别是多少？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="01">和 1，进位 0</button><button class="study-button" data-exp-choice="10">和 0，进位 1</button><button class="study-button" data-exp-choice="11">和 1，进位 1</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-a]").addEventListener("click", () => { a = a ? 0 : 1; render(); });
    root.querySelector("[data-b]").addEventListener("click", () => { b = b ? 0 : 1; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "10" ? "正确。二进制 1+1 = 10，当前位是 0，向高位进 1。" : "把两个 1 相加，会向高位进位。";
      render();
    }));
  };
  render();
}

function bitwise(root, context, experiment) {
  let op = "AND";
  const a = 6;
  const b = 3;
  let feedback = "";
  const bitsOf = (value) => value.toString(2).padStart(4, "0");
  const result = () => op === "AND" ? a & b : op === "OR" ? a | b : a ^ b;
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-question">对 6（0110）和 3（0011）做位运算。</div>
      <div class="exp-choices">${["AND", "OR", "XOR"].map((name) => `<button class="study-button ${op === name ? "primary" : ""}" data-op="${name}">${name}</button>`).join("")}</div>
      ${visual(`<div class="exp-sequence">${bitsOf(a)}<br>${bitsOf(b)}<br>────<br><b>${bitsOf(result())}</b> = ${result()}</div>`, "位运算")}
      <div class="exp-question">6 AND 3 的结果是多少？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="2">2</button><button class="study-button" data-exp-choice="7">7</button><button class="study-button" data-exp-choice="5">5</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelectorAll("[data-op]").forEach((button) => button.addEventListener("click", () => { op = button.dataset.op; render(); }));
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "2" ? "正确。0110 ∧ 0011 = 0010 = 2。" : "逐位做 AND：只有两个 1 才留下 1。";
      render();
    }));
  };
  render();
}

function floatingPoint(root, context, experiment) {
  let revealed = false;
  let feedback = "";
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="lab-controls"><button class="study-button primary" data-run>计算 0.1 + 0.2</button></div>
      ${revealed ? `<div class="exp-output">0.1 + 0.2 = <b>0.30000000000000004</b></div>${table(["字段", "内容"], [["符号", "0"], ["指数", "01111011"], ["尾数", "10011001100110011001101"]])}` : '<div class="exp-note">先点击运行，看看实际结果。</div>'}
      <div class="exp-question">为什么结果不是精确的 0.3？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="binary">0.1 无法用有限位二进制精确表示</button><button class="study-button" data-exp-choice="bug">CPU 算错了</button><button class="study-button" data-exp-choice="decimal">十进制比二进制更精确</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-run]").addEventListener("click", () => { revealed = true; feedback = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "binary" ? "正确。0.1 的二进制展开是无限循环，只能保存近似值。" : "这不是算术错误，而是二进制表示的精度限制。";
      render();
    }));
  };
  render();
}

function endianness(root, context, experiment) {
  let little = false;
  let feedback = "";
  const value = 0x12345678;
  const bytes = little ? ["78", "56", "34", "12"] : ["12", "34", "56", "78"];
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="lab-controls"><button class="study-button ${little ? "primary" : ""}" data-toggle>${little ? "小端序" : "大端序"}</button></div>
      ${visual(`<div class="exp-array">${bytes.map((byte, index) => `<div class="exp-cell"><b>${byte}</b><small>地址 +${index}</small></div>`).join("")}</div>`, "字节序")}
      <div class="exp-output">0x12345678 在内存中的字节顺序</div>
      <div class="exp-question">小端序下，最低地址存放哪个字节？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="78">78</button><button class="study-button" data-exp-choice="12">12</button><button class="study-button" data-exp-choice="34">34</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-toggle]").addEventListener("click", () => { little = !little; feedback = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "78" ? "正确。小端序把最低有效字节放在最低地址。" : "切换到大端/小端，看第一个地址里的字节。";
      render();
    }));
  };
  render();
}

function booleanSimplification(root, context, experiment) {
  let a = true;
  let b = false;
  let feedback = "";
  const render = () => {
    const left = (a && b) || (a && !b);
    root.innerHTML = shell(experiment, `
      <div class="lab-controls"><button class="study-button ${a ? "primary" : ""}" data-a>A = ${a ? 1 : 0}</button><button class="study-button ${b ? "primary" : ""}" data-b>B = ${b ? 1 : 0}</button></div>
      ${visual(table(["A", "B", "A∧B ∨ A∧¬B", "A"], [[a ? 1 : 0, b ? 1 : 0, left ? 1 : 0, a ? 1 : 0]]), "化简前后")}
      <div class="exp-question">A∧B ∨ A∧¬B 可以化简成什么？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="A">A</button><button class="study-button" data-exp-choice="B">B</button><button class="study-button" data-exp-choice="0">0</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-a]").addEventListener("click", () => { a = !a; render(); });
    root.querySelector("[data-b]").addEventListener("click", () => { b = !b; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "A" ? "正确。两种情况下 B 的取值互补，结果只由 A 决定。" : "把 B 分别取 0 和 1，看看表达式是否都等于 A。";
      render();
    }));
  };
  render();
}

export const EXPERIMENTS = [
  {
    id: "bits-byte",
    title: "一个字节能装下多少组合？",
    nodeId: "bits-bytes",
    domain: "repr",
    summary: "切换 8 个位，观察同一个字节的十进制与十六进制。",
    steps: 2,
    toolLinks: ["bitwise"],
    mount: bitsBytes
  },
  {
    id: "unsigned-range",
    title: "8 位无符号整数最大是多少？",
    nodeId: "unsigned",
    domain: "repr",
    summary: "把 8 位全部打开，理解 0–255 的范围。",
    steps: 2,
    toolLinks: ["integer-codes"],
    mount: unsigned
  },
  {
    id: "twos-complement-sign",
    title: "1111 为什么表示 −1？",
    nodeId: "twos-complement",
    domain: "repr",
    summary: "切换 4 位补码，比较无符号值与有符号值。",
    steps: 2,
    toolLinks: ["integer-codes"],
    mount: twosComplement
  },
  {
    id: "overflow-wrap",
    title: "7 + 1 为什么会变成 −8？",
    nodeId: "overflow",
    domain: "repr",
    summary: "观察 4 位补码加法越界后的位模式。",
    steps: 2,
    toolLinks: ["overflow"],
    mount: overflow
  },
  {
    id: "character-utf8",
    title: "为什么“中”要占三个字节？",
    nodeId: "character-codes",
    domain: "repr",
    summary: "切换字符，比较码点与 UTF-8 字节数。",
    steps: 2,
    toolLinks: ["unicode"],
    mount: characterCodes
  },
  {
    id: "boolean-operations",
    title: "与、或、非到底怎么算？",
    nodeId: "boolean-algebra",
    domain: "repr",
    summary: "切换 A、B，观察三个基本布尔运算。",
    steps: 2,
    toolLinks: ["boolean"],
    mount: booleanAlgebra
  },
  {
    id: "logic-gate",
    title: "AND 门什么时候亮？",
    nodeId: "logic-gates",
    domain: "repr",
    summary: "切换门类型与输入，观察输出 0/1。",
    steps: 2,
    toolLinks: ["boolean"],
    mount: logicGates
  },
  {
    id: "half-adder",
    title: "1 + 1 为什么写出 10？",
    nodeId: "adders",
    domain: "repr",
    summary: "查看一位加法的和与进位。",
    steps: 2,
    toolLinks: ["boolean"],
    mount: adders
  },
  {
    id: "bitwise-and",
    title: "6 AND 3 为什么是 2？",
    nodeId: "bitwise-operations",
    domain: "repr",
    summary: "逐位查看与、或、异或的结果。",
    steps: 2,
    toolLinks: ["bitwise"],
    mount: bitwise
  },
  {
    id: "float-approximation",
    title: "0.1 + 0.2 为什么不等于 0.3？",
    nodeId: "floating-point",
    domain: "repr",
    summary: "运行一次浮点加法，查看位字段与误差。",
    steps: 2,
    toolLinks: ["float"],
    mount: floatingPoint
  },
  {
    id: "endian-byte-order",
    title: "同一个整数为什么有两种字节序？",
    nodeId: "endianness",
    domain: "repr",
    summary: "切换大端/小端，观察 0x12345678 的字节排列。",
    steps: 2,
    toolLinks: ["endianness"],
    mount: endianness
  },
  {
    id: "boolean-simplify",
    title: "这个表达式为什么能消掉 B？",
    nodeId: "boolean-simplification",
    domain: "repr",
    summary: "切换 A、B，比较化简前后的真值。",
    steps: 2,
    toolLinks: ["boolean"],
    mount: booleanSimplification
  }
];
