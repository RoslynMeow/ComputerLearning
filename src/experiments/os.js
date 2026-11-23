// 操作系统：角色、进程线程、虚拟内存、调度、同步、文件系统。

import { shell, table, visual, mountChoiceSteps, mountStepper } from "./shared.js";

function operatingSystems(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "操作系统是硬件与应用之间的资源管理者。",
    steps: [
      {
        visual: () => visual(table(["资源", "操作系统负责"], [["CPU", "调度进程"], ["内存", "分配与隔离"], ["文件", "命名、权限、持久化"]]), "操作系统的职责"),
        prompt: "多个程序同时想用 CPU 时，谁来决定先后？",
        options: [{ value: "os", label: "操作系统调度器" }, { value: "cpu", label: "CPU 自己随机选" }, { value: "user", label: "用户手动切换" }],
        correct: "os",
        correctText: "正确。调度器在就绪进程之间分配 CPU 时间。",
        wrongText: "用户不直接控制每次切换。",
        reveal: "操作系统通过调度、分页、文件系统等机制管理资源。"
      },
      {
        prompt: "程序和进程的区别是？",
        options: [{ value: "running", label: "进程是正在运行的程序实例" }, { value: "same", label: "两者完全一样" }, { value: "file", label: "进程就是一个文件" }],
        correct: "running",
        correctText: "正确。程序是静态代码，进程是运行中的实例。",
        wrongText: "同一个程序可以启动多个进程。",
        reveal: "进程拥有自己的地址空间、寄存器和打开的文件。"
      }
    ]
  });
}

function processesThreads(root, context, experiment) {
  mountChoiceSteps(root, experiment, {
    intro: "进程有独立地址空间；同一进程内的线程共享地址空间。",
    steps: [
      {
        visual: () => visual(table(["对象", "地址空间", "切换成本"], [["进程", "独立", "较高"], ["线程", "共享", "较低"]]), "进程与线程"),
        prompt: "同一进程的两个线程，通常共享什么？",
        options: [{ value: "memory", label: "代码、全局数据与堆" }, { value: "stack", label: "各自的栈" }, { value: "nothing", label: "什么都不共享" }],
        correct: "memory",
        correctText: "正确。线程共享进程的地址空间，但各自有栈和寄存器。",
        wrongText: "线程共享进程级资源，私有的是执行上下文。",
        reveal: "共享内存让通信方便，也带来了同步问题。"
      },
      {
        prompt: "为什么线程切换通常比进程切换便宜？",
        options: [{ value: "space", label: "不用切换整个地址空间" }, { value: "cpu", label: "线程不需要 CPU" }, { value: "disk", label: "线程不访问内存" }],
        correct: "space",
        correctText: "正确。同一进程内线程共享页表，切换时地址空间不变。",
        wrongText: "关键在地址空间与页表是否需要更换。",
        reveal: "进程切换还要更换页表等进程级状态。"
      }
    ]
  });
}

function virtualMemory(root, context, experiment) {
  const frames = [
    "虚拟地址 = 3 × 4096 + 12",
    "页号 VPN = 3，页内偏移 = 12",
    "查页表：VPN 3 → 物理页号 PFN 7",
    "物理地址 = 7 × 4096 + 12 = 28684"
  ];
  mountStepper(root, experiment, {
    intro: "虚拟内存把程序看到的地址翻译成物理地址。",
    frames,
    nextLabel: "继续翻译",
    frameHTML: (frame) => `${visual(`<div class="exp-sequence">${frame}</div>`, "地址翻译")}`,
    question: "页表把 VPN 3 映射到了哪个物理页号？",
    options: [{ value: "3", label: "3" }, { value: "7", label: "7" }, { value: "12", label: "12" }],
    correct: "7",
    correctText: "正确。页表项给出 PFN = 7。",
    wrongText: "页号是 3，偏移是 12，映射结果是 7。",
    footerNote: "页内偏移在翻译前后保持不变。"
  });
}

function scheduling(root, context, experiment) {
  let sjf = false;
  let feedback = "";
  const render = () => {
    const order = sjf ? ["P3 (2)", "P2 (4)", "P1 (8)"] : ["P1 (8)", "P2 (4)", "P3 (2)"];
    const waits = sjf ? [0, 2, 6] : [0, 8, 12];
    const avg = waits.reduce((a, b) => a + b, 0) / waits.length;
    root.innerHTML = shell(experiment, `
      <div class="lab-controls"><button class="study-button ${sjf ? "primary" : ""}" data-toggle>${sjf ? "短作业优先 SJF" : "先来先服务 FCFS"}</button></div>
      ${visual(table(["顺序", "等待时间"], order.map((name, index) => [name, String(waits[index])])), "调度等待时间")}
      <div class="exp-output">平均等待时间 = <b>${avg.toFixed(2)}</b></div>
      <div class="exp-question">哪种调度让平均等待时间更短？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="sjf">SJF</button><button class="study-button" data-exp-choice="fcfs">FCFS</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-toggle]").addEventListener("click", () => { sjf = !sjf; feedback = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "sjf" ? "正确。短作业先做，后面的长作业少等一些。" : "比较两边的平均等待时间。";
      render();
    }));
  };
  render();
}

function synchronization(root, context, experiment) {
  let locked = false;
  let feedback = "";
  const render = () => {
    const rows = locked
      ? [["T1 加锁", "读 100"], ["T1 写 110", "解锁"], ["T2 加锁", "读 110"], ["T2 写 120", "解锁"]]
      : [["T1 读 100", "T2 读 100"], ["T1 写 110", "T2 写 110"], ["最终余额 110", "少了 10"]];
    root.innerHTML = shell(experiment, `
      <div class="lab-controls"><button class="study-button ${locked ? "primary" : ""}" data-toggle>${locked ? "已加互斥锁" : "无锁执行"}</button></div>
      ${visual(table(["步骤", "结果"], rows), "并发更新")}
      <div class="exp-question">无锁时，为什么两次 +10 只得到 110？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="lost">两个线程都基于旧值 100 写入</button><button class="study-button" data-exp-choice="slow">CPU 太慢</button><button class="study-button" data-exp-choice="math">110 是正确结果</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-toggle]").addEventListener("click", () => { locked = !locked; feedback = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "lost" ? "正确。后写入的线程覆盖了前一个线程的更新，发生丢失更新。" : "两次更新都从 100 出发，最后一次写入覆盖了前一次。";
      render();
    }));
  };
  render();
}

function filesystems(root, context, experiment) {
  const frames = [
    { path: "/", entry: "home → inode 12", note: "从根目录开始。" },
    { path: "/home", entry: "me → inode 34", note: "目录项把名字映射到 inode。" },
    { path: "/home/me", entry: "a.txt → inode 56", note: "找到文件名对应的 inode。" },
    { path: "/home/me/a.txt", entry: "inode 56：大小、权限、数据块", note: "inode 保存元数据，不保存文件名。" }
  ];
  mountStepper(root, experiment, {
    intro: "路径解析就是逐级查目录项，最后拿到 inode。",
    frames,
    nextLabel: "进入下一级",
    frameHTML: (frame) => `${visual(`<div class="exp-sequence"><b>${frame.path}</b><br>${frame.entry}</div>`, "路径解析")}<div class="exp-note">${frame.note}</div>`,
    question: "文件名通常保存在哪里？",
    options: [{ value: "dir", label: "目录项里" }, { value: "inode", label: "inode 里" }, { value: "block", label: "数据块里" }],
    correct: "dir",
    correctText: "正确。目录项负责“名字 → inode 号”的映射。",
    wrongText: "inode 保存元数据，文件名在目录项中。",
    footerNote: "多个目录项可以指向同一个 inode，这就是硬链接。"
  });
}

export const EXPERIMENTS = [
  {
    id: "os-role",
    title: "操作系统到底在管什么？",
    nodeId: "operating-systems",
    domain: "os",
    summary: "从 CPU、内存、文件三个角度理解资源管理。",
    steps: 2,
    toolLinks: [],
    mount: operatingSystems
  },
  {
    id: "process-thread",
    title: "线程为什么比进程轻？",
    nodeId: "processes-threads",
    domain: "os",
    summary: "比较独立地址空间与共享地址空间的切换成本。",
    steps: 2,
    toolLinks: [],
    mount: processesThreads
  },
  {
    id: "page-translation",
    title: "虚拟地址怎么变成物理地址？",
    nodeId: "virtual-memory",
    domain: "os",
    summary: "把 VPN 3、偏移 12 翻译成物理地址。",
    steps: 2,
    toolLinks: ["paging"],
    mount: virtualMemory
  },
  {
    id: "scheduling-wait",
    title: "短作业优先为什么更快？",
    nodeId: "scheduling",
    domain: "os",
    summary: "切换 FCFS 与 SJF，比较平均等待时间。",
    steps: 2,
    toolLinks: ["scheduling"],
    mount: scheduling
  },
  {
    id: "lost-update",
    title: "无锁并发为什么会丢更新？",
    nodeId: "synchronization",
    domain: "os",
    summary: "查看两次 +10 如何被覆盖成 110。",
    steps: 2,
    toolLinks: ["race"],
    mount: synchronization
  },
  {
    id: "path-lookup",
    title: "文件名到底存在哪里？",
    nodeId: "filesystems",
    domain: "os",
    summary: "逐级解析路径，区分目录项与 inode。",
    steps: 2,
    toolLinks: [],
    mount: filesystems
  }
];
