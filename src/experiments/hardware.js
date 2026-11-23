// 处理器与硬件：指令、数据通路、存储层次、缓存、流水线。

import { shell, table, visual, mountChoiceSteps, mountStepper } from "./shared.js";

function machineInstructions(root, context, experiment) {
  const frames = [
    { pc: 0, instr: "LOAD R1, 5", regs: "R1 = 5", note: "取指、译码后，把立即数 5 写入 R1。" },
    { pc: 1, instr: "ADD R1, 3", regs: "R1 = 8", note: "ALU 读取 R1 和 3，相加后写回 R1。" },
    { pc: 2, instr: "STORE R1, [0]", regs: "R1 = 8", note: "把 R1 的值写回内存地址 0。" }
  ];
  mountStepper(root, experiment, {
    intro: "一条指令通常经过取指、译码、执行、写回。",
    frames,
    nextLabel: "执行下一条",
    frameHTML: (frame) => `${visual(`<div class="exp-sequence"><b>${frame.instr}</b><br>${frame.regs}</div>`, "寄存器状态")}<div class="exp-note">${frame.note}</div>`,
    question: "ADD R1, 3 的结果写到了哪里？",
    options: [{ value: "r1", label: "寄存器 R1" }, { value: "mem", label: "内存地址 3" }, { value: "pc", label: "程序计数器 PC" }],
    correct: "r1",
    correctText: "正确。ADD 的目标操作数是 R1，结果写回 R1。",
    wrongText: "看指令的第一个操作数，它是写回目标。",
    footerNote: "PC 指向下一条指令的地址，不保存运算结果。"
  });
}

function cpuDatapath(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "数据通路是一条“取数 → 运算 → 写回”的路径。",
    steps: [
      {
        visual: () => visual(table(["部件", "作用"], [["PC", "给出下一条指令地址"], ["寄存器堆", "存放操作数与结果"], ["ALU", "执行算术/逻辑运算"], ["内存", "存放指令与数据"]]), "数据通路部件"),
        prompt: "ALU 做加法时，两个操作数通常来自哪里？",
        options: [{ value: "reg", label: "寄存器堆" }, { value: "pc", label: "PC" }, { value: "disk", label: "磁盘" }],
        correct: "reg",
        correctText: "正确。寄存器堆提供操作数，ALU 计算后再写回。",
        wrongText: "PC 只负责地址，不提供算术操作数。",
        reveal: "load/store 指令才会让内存参与数据搬运。"
      },
      {
        prompt: "PC 在一条指令执行完后通常怎么变化？",
        options: [{ value: "next", label: "指向下一条指令" }, { value: "zero", label: "清零" }, { value: "same", label: "保持不变" }],
        correct: "next",
        correctText: "正确。顺序执行时 PC 加上指令长度。",
        wrongText: "PC 是程序计数器，负责跟踪下一条指令。",
        reveal: "遇到跳转指令时，PC 会被改写为跳转目标。"
      }
    ]
  });
}

function memoryHierarchy(root, context, experiment) {
  const levels = [
    { name: "寄存器", latency: "约 1 个周期", size: "几百字节", tone: "#4aa696" },
    { name: "缓存", latency: "约 4–20 个周期", size: "几 MB", tone: "#6cbfae" },
    { name: "内存", latency: "约 100 个周期", size: "几 GB–几十 GB", tone: "#e3b05f" },
    { name: "磁盘 / SSD", latency: "约 10 万+ 个周期", size: "TB 级", tone: "#d78f7a" }
  ];
  let index = 0;
  let feedback = "";
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-choices">${levels.map((level, i) => `<button class="study-button ${i === index ? "primary" : ""}" data-level="${i}">${level.name}</button>`).join("")}</div>
      ${visual(table(["层次", "典型延迟", "容量"], levels.map((level) => [level.name, level.latency, level.size])), "存储层次")}
      <div class="exp-output">${levels[index].name}：${levels[index].latency}，容量 ${levels[index].size}</div>
      <div class="exp-question">哪一层离 CPU 最近、速度最快？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="reg">寄存器</button><button class="study-button" data-exp-choice="cache">缓存</button><button class="study-button" data-exp-choice="disk">磁盘</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelectorAll("[data-level]").forEach((button) => button.addEventListener("click", () => { index = Number(button.dataset.level); feedback = ""; render(); }));
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "reg" ? "正确。寄存器在 CPU 内部，延迟最低、容量最小。" : "越靠近 CPU 的层次越快，但容量越小。";
      render();
    }));
  };
  render();
}

function cacheSim(root, context, experiment) {
  const addresses = [0, 1, 0, 4];
  const lines = Array.from({ length: 4 }, () => ({ tag: null, valid: false }));
  const frames = addresses.map((address, step) => {
    const lineIndex = address % 4;
    const tag = Math.floor(address / 4);
    const hit = lines[lineIndex].valid && lines[lineIndex].tag === tag;
    if (!hit) lines[lineIndex] = { tag, valid: true };
    return {
      address,
      lineIndex,
      tag,
      hit,
      step,
      lines: lines.map((line, index) => ({ ...line, index }))
    };
  });
  mountStepper(root, experiment, {
    intro: "直接映射缓存：地址 mod 4 决定放在哪一行。",
    frames,
    nextLabel: "访问下一个地址",
    frameHTML: (frame) => `${visual(table(["行", "标签", "有效", "本次"], frame.lines.map((line) => [String(line.index), line.tag === null ? "—" : String(line.tag), line.valid ? "1" : "0", line.index === frame.lineIndex ? (frame.hit ? "命中" : "未命中") : ""])), "4 行直接映射缓存")}<div class="exp-note">访问地址 ${frame.address}：映射到第 ${frame.lineIndex} 行，${frame.hit ? "命中" : "未命中并装入"}。</div>`,
    question: "这四次访问中，一共有几次命中？",
    options: [{ value: "0", label: "0 次" }, { value: "1", label: "1 次" }, { value: "2", label: "2 次" }],
    correct: "1",
    correctText: "正确。只有第二次访问 0 命中。",
    wrongText: "访问 0、1、0、4：第三次与第一次地址相同。",
    footerNote: "地址 4 与地址 0 映射到同一行，会把它替换掉。"
  });
}

function cpuPipeline(root, context, experiment) {
  let stall = false;
  let feedback = "";
  const stages = ["取指", "译码", "执行", "访存", "写回"];
  const rows = () => {
    const base = [
      ["lw R1, 0(R2)", [1, 2, 3, 4, 5]],
      ["add R3, R1, R4", stall ? [3, 4, 5, 6, 7] : [2, 3, 4, 5, 6]]
    ];
    return base.map(([instr, cycles]) => [instr, ...Array.from({ length: 7 }, (_, index) => {
      const at = cycles.indexOf(index + 1);
      return at >= 0 ? stages[at] : "";
    })]);
  };
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="lab-controls"><button class="study-button ${stall ? "primary" : ""}" data-toggle>${stall ? "有 load-use 停顿" : "无停顿"}</button></div>
      ${visual(table(["指令", "1", "2", "3", "4", "5", "6", "7"], rows()), "五级流水线时空图")}
      <div class="exp-question">为什么 add 不能紧接着 lw 使用 R1？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="hazard">R1 还没写回，发生数据冒险</button><button class="study-button" data-exp-choice="cache">缓存容量不够</button><button class="study-button" data-exp-choice="clock">时钟频率太低</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-toggle]").addEventListener("click", () => { stall = !stall; feedback = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "hazard" ? "正确。load 的数据要到访存后才可用，需要停顿或转发。" : "问题出在两条指令之间的数据依赖。";
      render();
    }));
  };
  render();
}

export const EXPERIMENTS = [
  {
    id: "instruction-cycle",
    title: "一条指令经历了什么？",
    nodeId: "machine-instructions",
    domain: "hardware",
    summary: "逐条执行 load / add / store，观察寄存器变化。",
    steps: 2,
    toolLinks: [],
    mount: machineInstructions
  },
  {
    id: "datapath-roles",
    title: "ALU 的操作数从哪里来？",
    nodeId: "cpu-datapath",
    domain: "hardware",
    summary: "辨认 PC、寄存器堆、ALU 与内存的分工。",
    steps: 2,
    toolLinks: [],
    mount: cpuDatapath
  },
  {
    id: "memory-levels",
    title: "为什么存储要分层？",
    nodeId: "memory-hierarchy",
    domain: "hardware",
    summary: "比较寄存器、缓存、内存与磁盘的延迟和容量。",
    steps: 2,
    toolLinks: ["cache"],
    mount: memoryHierarchy
  },
  {
    id: "cache-lines",
    title: "哪一次缓存访问命中了？",
    nodeId: "cache",
    domain: "hardware",
    summary: "跟踪地址 0、1、0、4 在 4 行缓存中的命中与替换。",
    steps: 2,
    toolLinks: ["cache"],
    mount: cacheSim
  },
  {
    id: "pipeline-stall",
    title: "流水线为什么要停一下？",
    nodeId: "cpu-pipeline",
    domain: "hardware",
    summary: "切换 load-use 停顿，比较两条指令的时空图。",
    steps: 2,
    toolLinks: ["pipeline"],
    mount: cpuPipeline
  }
];
