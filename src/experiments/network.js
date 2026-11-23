// 计算机网络：分层封装、路由、TCP、DNS、分布式系统。

import { shell, table, visual, mountChoiceSteps, mountStepper } from "./shared.js";

function networking(root, context, experiment) {
  const frames = [
    { layer: "应用层", pdu: "HTTP 请求：GET /", note: "应用数据还没有网络首部。" },
    { layer: "传输层", pdu: "TCP 首部 + HTTP 请求", note: "TCP 加上源端口、目标端口和序号。" },
    { layer: "网络层", pdu: "IP 首部 + TCP 段", note: "IP 加上源地址和目标地址。" },
    { layer: "链路层", pdu: "帧首部 + IP 包 + 帧尾部", note: "链路层负责在同一段链路上传输。" }
  ];
  mountStepper(root, experiment, {
    intro: "发送数据时，每一层都会加上自己的首部。",
    frames,
    nextLabel: "交给下一层",
    frameHTML: (frame) => `${visual(`<div class="exp-sequence"><b>${frame.layer}</b><br>${frame.pdu}</div>`, "协议封装")}<div class="exp-note">${frame.note}</div>`,
    question: "IP 首部是在哪一层加上的？",
    options: [{ value: "network", label: "网络层" }, { value: "transport", label: "传输层" }, { value: "link", label: "链路层" }],
    correct: "network",
    correctText: "正确。网络层用 IP 首部携带源地址和目标地址。",
    wrongText: "TCP 首部在传输层，IP 首部在它外面。",
    footerNote: "接收方按相反顺序逐层拆掉首部，这叫解封装。"
  });
}

function routing(root, context, experiment) {
  const routes = [
    { network: "192.168.1.0/24", next: "直连" },
    { network: "10.0.0.0/8", next: "10.1.1.1" },
    { network: "0.0.0.0/0", next: "203.0.113.1" }
  ];
  let destination = "10.2.3.4";
  let feedback = "";
  const match = () => destination.startsWith("10.") ? routes[1] : routes[2];
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-choices">${["10.2.3.4", "198.51.100.7"].map((ip) => `<button class="study-button ${destination === ip ? "primary" : ""}" data-dest="${ip}">${ip}</button>`).join("")}</div>
      ${visual(table(["目标网络", "下一跳"], routes.map((route) => [route.network, route.next])), "路由表")}
      <div class="exp-output">发往 ${destination} 时，匹配 <b>${match().network}</b>，下一跳 <b>${match().next}</b></div>
      <div class="exp-question">发往 10.2.3.4 的数据包走哪条路由？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="10">10.0.0.0/8</button><button class="study-button" data-exp-choice="default">默认路由</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelectorAll("[data-dest]").forEach((button) => button.addEventListener("click", () => { destination = button.dataset.dest; feedback = ""; render(); }));
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "10" ? "正确。最长前缀匹配选中 10.0.0.0/8，下一跳是 10.1.1.1。" : "10.2.3.4 属于 10.0.0.0/8，比默认路由更具体。";
      render();
    }));
  };
  render();
}

function transportProtocols(root, context, experiment) {
  const frames = [
    "客户端 → 服务器：SYN，seq = x",
    "服务器 → 客户端：SYN + ACK，seq = y，ack = x + 1",
    "客户端 → 服务器：ACK，ack = y + 1",
    "连接建立，双方都确认了对方的初始序号"
  ];
  mountStepper(root, experiment, {
    intro: "TCP 用三次握手建立可靠连接。",
    frames,
    nextLabel: "发送下一个报文",
    frameHTML: (frame) => `${visual(`<div class="exp-sequence">${frame}</div>`, "TCP 三次握手")}`,
    question: "为什么需要三次握手，而不是两次？",
    options: [
      { value: "both", label: "让双方都确认对方的收发能力" },
      { value: "speed", label: "为了让连接建立得更快" },
      { value: "encrypt", label: "为了交换加密密钥" }
    ],
    correct: "both",
    correctText: "正确。第三次确认让服务器知道客户端也收到了它的 SYN。",
    wrongText: "两次只能让一方确认，第三次补齐另一方向。",
    footerNote: "TCP 还提供序号、确认、重传与流量控制。"
  });
}

function applicationProtocols(root, context, experiment) {
  const frames = [
    "浏览器：example.com 的 IP 是多少？",
    "本地 DNS 缓存未命中，询问递归解析器",
    "解析器依次询问根服务器、.com 服务器、权威服务器",
    "权威服务器返回 A 记录：93.184.216.34",
    "浏览器拿到 IP，开始建立 TCP 连接"
  ];
  mountStepper(root, experiment, {
    intro: "DNS 把域名解析成 IP 地址，HTTP 才有目标可连。",
    frames,
    nextLabel: "下一步",
    frameHTML: (frame) => `${visual(`<div class="exp-sequence">${frame}</div>`, "DNS 解析")}`,
    question: "DNS 的 A 记录返回的是什么？",
    options: [{ value: "ip", label: "域名对应的 IPv4 地址" }, { value: "html", label: "网页的 HTML 内容" }, { value: "port", label: "服务器的端口号" }],
    correct: "ip",
    correctText: "正确。A 记录保存域名到 IPv4 地址的映射。",
    wrongText: "HTML 由 HTTP 传输，DNS 只负责地址解析。",
    footerNote: "HTTPS 先做 TLS 握手，再在 TCP 上发送 HTTP 请求。"
  });
}

function distributedSystems(root, context, experiment) {
  let partition = false;
  let feedback = "";
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="lab-controls"><button class="study-button ${partition ? "primary" : ""}" data-toggle>${partition ? "网络分区：已断开" : "网络正常"}</button></div>
      ${visual(`<div class="exp-array"><div class="exp-cell"><b>节点 A</b><small>余额 100</small></div><div class="exp-cell"><b>节点 B</b><small>余额 100</small></div></div>`, "两个副本")}
      <div class="exp-note">${partition ? "分区期间，A 和 B 无法同步写入。" : "网络正常时，写入可以复制到两个节点。"}</div>
      <div class="exp-question">分区发生时，能同时保证强一致和所有节点都可写吗？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="no">不能，必须在 C 和 A 之间取舍</button><button class="study-button" data-exp-choice="yes">能，复制会自动解决</button></div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-toggle]").addEventListener("click", () => { partition = !partition; feedback = ""; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "no" ? "正确。这就是 CAP：分区时一致性与可用性不能同时满足。" : "分区切断了同步通道，副本无法立即达成一致。";
      render();
    }));
  };
  render();
}

export const EXPERIMENTS = [
  {
    id: "encapsulation-layers",
    title: "数据为什么要一层层加首部？",
    nodeId: "networking",
    domain: "network",
    summary: "跟着 HTTP 数据穿过传输层、网络层和链路层。",
    steps: 2,
    toolLinks: ["encapsulation"],
    mount: networking
  },
  {
    id: "routing-table",
    title: "路由器怎么选下一跳？",
    nodeId: "routing",
    domain: "network",
    summary: "在路由表里做最长前缀匹配。",
    steps: 2,
    toolLinks: ["graph-studio"],
    mount: routing
  },
  {
    id: "tcp-handshake",
    title: "TCP 为什么握三次手？",
    nodeId: "transport-protocols",
    domain: "network",
    summary: "逐步查看 SYN、SYN-ACK 与 ACK。",
    steps: 2,
    toolLinks: [],
    mount: transportProtocols
  },
  {
    id: "dns-lookup",
    title: "输入域名后先发生什么？",
    nodeId: "application-protocols",
    domain: "network",
    summary: "跟踪 DNS 解析，拿到 IP 再建立连接。",
    steps: 2,
    toolLinks: [],
    mount: applicationProtocols
  },
  {
    id: "cap-tradeoff",
    title: "分区时为什么不能全都要？",
    nodeId: "distributed-systems",
    domain: "network",
    summary: "断开两个副本，观察一致性与可用性的取舍。",
    steps: 2,
    toolLinks: [],
    mount: distributedSystems
  }
];
