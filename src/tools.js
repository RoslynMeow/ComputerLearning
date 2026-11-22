// 通用学习工具：与单个知识点解耦，可被多个知识点复用。
// 每个工具由 index.html 的实验页与知识点正文共同挂载。

const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function splitList(text, separator = /[,，、\s]+/) {
  return String(text).split(separator).map((s) => s.trim()).filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

function sortValues(values) {
  const numbers = values.map(Number);
  if (values.length && numbers.every((n) => Number.isFinite(n))) return [...values].sort((a, b) => Number(a) - Number(b));
  return [...values].sort((a, b) => String(a).localeCompare(String(b), "zh-CN"));
}

function setText(values) {
  const list = sortValues(unique(values));
  return list.length ? `{${list.map(esc).join(", ")}}` : "∅";
}

function digitValue(ch) {
  return DIGITS.indexOf(String(ch).toUpperCase());
}

function table(head, rows, caption = "") {
  return `<figure class="lesson-fig"><table class="lesson-table">${caption ? `<caption>${esc(caption)}</caption>` : ""}
    <thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></figure>`;
}

/* ------------------------------------------------------------------ */
/* 1. 任意进制转换                                                     */
/* ------------------------------------------------------------------ */

function parseBaseValue(text, base) {
  let s = String(text).trim().replace(/\s+/g, "");
  if (!s) return { ok: false, reason: "请输入数值" };
  let negative = false;
  if (s[0] === "-" || s[0] === "+") {
    negative = s[0] === "-";
    s = s.slice(1);
  }
  const prefix = { 2: "0b", 8: "0o", 16: "0x" }[base];
  if (prefix && s.toLowerCase().startsWith(prefix)) s = s.slice(2);
  if (!s) return { ok: false, reason: "请输入数值" };
  const parts = s.split(".");
  if (parts.length > 2) return { ok: false, reason: "小数点过多" };
  const intText = parts[0] || "0";
  const fracText = parts[1] || "";
  const baseBig = BigInt(base);
  let intVal = 0n;
  for (const ch of intText) {
    const d = digitValue(ch);
    if (d < 0 || d >= base) return { ok: false, reason: `数码「${ch}」不属于 ${base} 进制` };
    intVal = intVal * baseBig + BigInt(d);
  }
  let fracNum = 0n;
  let fracDen = 1n;
  for (const ch of fracText) {
    const d = digitValue(ch);
    if (d < 0 || d >= base) return { ok: false, reason: `数码「${ch}」不属于 ${base} 进制` };
    fracNum = fracNum * baseBig + BigInt(d);
    fracDen *= baseBig;
  }
  return { ok: true, negative, intVal, fracNum, fracDen };
}

function convertInteger(n, base) {
  const b = BigInt(base);
  const steps = [];
  if (n === 0n) steps.push({ n: 0n, q: 0n, r: 0 });
  let cur = n;
  while (cur > 0n) {
    const q = cur / b;
    const r = Number(cur % b);
    steps.push({ n: cur, q, r });
    cur = q;
  }
  return {
    digits: steps.slice().reverse().map((s) => DIGITS[s.r]).join("") || "0",
    steps
  };
}

function convertFraction(num, den, base, maxDigits = 12) {
  if (num === 0n) return { digits: "", steps: [], exact: true };
  const b = BigInt(base);
  let cur = num;
  let digits = "";
  const steps = [];
  for (let i = 0; i < maxDigits && cur > 0n; i++) {
    const before = cur;
    cur *= b;
    const digit = Number(cur / den);
    const rem = cur % den;
    steps.push({
      before: Number(before) / Number(den),
      product: Number(cur) / Number(den),
      digit
    });
    digits += DIGITS[digit];
    cur = rem;
  }
  return { digits, steps, exact: cur === 0n };
}

function decimalText(parsed) {
  const sign = parsed.negative ? "-" : "";
  if (parsed.fracNum === 0n) return `${sign}${parsed.intVal.toString()}`;
  const fraction = Number(parsed.fracNum) / Number(parsed.fracDen);
  const fracText = fraction.toFixed(10).slice(1);
  return `${sign}${parsed.intVal.toString()}${fracText}`;
}

export function mountBaseConverter(root) {
  root.innerHTML = `
    <h3>任意进制转换</h3>
    <p>支持 2–36 进制、负数和小数。整数部分按“除基取余”演算，小数部分按“乘基取整”演算；10 以上的数码用 A–Z 表示。</p>
    <div class="lab-controls">
      <label>数值 <input id="bc-value" value="19" style="width:130px" autocomplete="off"></label>
      <label>原进制 <select id="bc-from">${Array.from({ length: 35 }, (_, i) => i + 2).map((b) => `<option value="${b}" ${b === 10 ? "selected" : ""}>${b}</option>`).join("")}</select></label>
      <label>目标进制 <select id="bc-to">${Array.from({ length: 35 }, (_, i) => i + 2).map((b) => `<option value="${b}" ${b === 2 ? "selected" : ""}>${b}</option>`).join("")}</select></label>
    </div>
    <div class="lab-controls">
      <button class="study-button" data-bc-preset="19|10|2">19₁₀ → 2</button>
      <button class="study-button" data-bc-preset="0.1|10|2">0.1₁₀ → 2</button>
      <button class="study-button" data-bc-preset="FF|16|10">FF₁₆ → 10</button>
      <button class="study-button" data-bc-preset="2024|10|16">2024₁₀ → 16</button>
    </div>
    <div class="lab-output" id="bc-result"></div>
    <div id="bc-steps"></div>
    <details class="lab-help"><summary>数码表（10 以上用字母）</summary>
      <p>${DIGITS.split("").map((d, i) => `${i}→${d}`).join("　")}</p>
    </details>`;

  const valueInput = root.querySelector("#bc-value");
  const fromSelect = root.querySelector("#bc-from");
  const toSelect = root.querySelector("#bc-to");
  const result = root.querySelector("#bc-result");
  const stepsBox = root.querySelector("#bc-steps");

  const update = () => {
    const raw = valueInput.value;
    const from = Number(fromSelect.value);
    const to = Number(toSelect.value);
    const parsed = parseBaseValue(raw, from);
    if (!parsed.ok) {
      result.innerHTML = `<span style="color:#b4533f">无法解析：${esc(parsed.reason)}</span>`;
      stepsBox.innerHTML = "";
      return;
    }
    const intPart = convertInteger(parsed.intVal, to);
    const fracPart = convertFraction(parsed.fracNum, parsed.fracDen, to);
    const sign = parsed.negative && (parsed.intVal > 0n || parsed.fracNum > 0n) ? "-" : "";
    const converted = `${sign}${intPart.digits}${fracPart.digits ? `.${fracPart.digits}` : ""}`;
    result.innerHTML = `
      <b>(${esc(raw.trim())})<sub>${from}</sub> = (${esc(converted)})<sub>${to}</sub></b><br>
      十进制值：${esc(decimalText(parsed))}${fracPart.exact ? "" : "（小数部分在所显示位数内未终止）"}`;

    const intRows = intPart.steps
      .map((s) => `<tr><td>${s.n.toString()}</td><td>÷ ${to}</td><td>${s.q.toString()}</td><td><b>${DIGITS[s.r]}</b></td></tr>`)
      .join("");
    const fracRows = fracPart.steps
      .map((s) => `<tr><td>${s.before.toFixed(6)}</td><td>× ${to}</td><td>${s.product.toFixed(6)}</td><td><b>${DIGITS[s.digit]}</b></td></tr>`)
      .join("");

    stepsBox.innerHTML = `
      ${table(["被除数", "运算", "商", "余数"], intPart.steps.map((s) => [s.n.toString(), `÷ ${to}`, s.q.toString(), DIGITS[s.r]]), `整数部分：除 ${to} 取余，余数自下而上读`)}
      ${fracRows ? table(["当前小数", "运算", "结果", "取整"], fracPart.steps.map((s) => [s.before.toFixed(6), `× ${to}`, s.product.toFixed(6), DIGITS[s.digit]]), `小数部分：乘 ${to} 取整，整数部分自上而下读`) : ""}`;
  };

  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-bc-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const [value, from, to] = button.dataset.bcPreset.split("|");
      valueInput.value = value;
      fromSelect.value = from;
      toSelect.value = to;
      update();
    });
  });
  update();
}

/* ------------------------------------------------------------------ */
/* 2. 图工具                                                           */
/* ------------------------------------------------------------------ */

function graphAnalysis(graph, directed, weighted) {
  const V = graph.vertices;
  const E = graph.edges;
  const byId = new Map(V.map((v) => [v.id, v]));
  const out = new Map(V.map((v) => [v.id, []]));
  const und = new Map(V.map((v) => [v.id, []]));
  for (const e of E) {
    if (!byId.has(e.a) || !byId.has(e.b)) continue;
    out.get(e.a).push({ to: e.b, w: e.w });
    und.get(e.a).push(e.b);
    und.get(e.b).push(e.a);
    if (!directed) out.get(e.b).push({ to: e.a, w: e.w });
  }

  const degree = V.map((v) => {
    if (!directed) return { label: v.label, out: out.get(v.id).length, in: out.get(v.id).length };
    const outDeg = out.get(v.id).length;
    const inDeg = E.filter((e) => e.b === v.id).length;
    return { label: v.label, out: outDeg, in: inDeg };
  });

  const seen = new Set();
  const components = [];
  for (const v of V) {
    if (seen.has(v.id)) continue;
    const stack = [v.id];
    const comp = [];
    seen.add(v.id);
    while (stack.length) {
      const cur = stack.pop();
      comp.push(cur);
      for (const nb of und.get(cur)) {
        if (!seen.has(nb)) {
          seen.add(nb);
          stack.push(nb);
        }
      }
    }
    components.push(comp);
  }

  const start = V.find((v) => v.id === graph.selected)?.id ?? V[0]?.id ?? null;
  const bfs = [];
  if (start) {
    const q = [start];
    const visited = new Set([start]);
    while (q.length) {
      const cur = q.shift();
      bfs.push(cur);
      for (const edge of out.get(cur)) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          q.push(edge.to);
        }
      }
    }
  }
  const dfs = [];
  if (start) {
    const visited = new Set();
    const walk = (id) => {
      visited.add(id);
      dfs.push(id);
      for (const edge of out.get(id)) if (!visited.has(edge.to)) walk(edge.to);
    };
    walk(start);
  }

  const undirectedCycle = () => {
    const visited = new Set();
    const walk = (id, parent) => {
      visited.add(id);
      for (const nb of und.get(id)) {
        if (nb === parent) continue;
        if (visited.has(nb)) return true;
        if (walk(nb, id)) return true;
      }
      return false;
    };
    for (const v of V) if (!visited.has(v.id) && walk(v.id, null)) return true;
    return false;
  };
  const directedCycle = () => {
    const color = new Map();
    const walk = (id) => {
      color.set(id, 1);
      for (const edge of out.get(id)) {
        const c = color.get(edge.to) ?? 0;
        if (c === 1) return true;
        if (c === 0 && walk(edge.to)) return true;
      }
      color.set(id, 2);
      return false;
    };
    for (const v of V) if ((color.get(v.id) ?? 0) === 0 && walk(v.id)) return true;
    return false;
  };
  const hasCycle = directed ? directedCycle() : undirectedCycle();
  const connected = V.length > 0 && components.length === 1;
  const isTree = !directed && connected && E.length === V.length - 1 && !hasCycle;

  let distances = null;
  let previous = null;
  if (start) {
    distances = new Map(V.map((v) => [v.id, Infinity]));
    previous = new Map();
    distances.set(start, 0);
    const done = new Set();
    while (done.size < V.length) {
      let u = null;
      let best = Infinity;
      for (const v of V) {
        if (!done.has(v.id) && distances.get(v.id) < best) {
          best = distances.get(v.id);
          u = v.id;
        }
      }
      if (u === null) break;
      done.add(u);
      for (const edge of out.get(u)) {
        const weight = weighted ? Number(edge.w) : 1;
        if (!Number.isFinite(weight) || weight < 0) continue;
        if (distances.get(u) + weight < distances.get(edge.to)) {
          distances.set(edge.to, distances.get(u) + weight);
          previous.set(edge.to, u);
        }
      }
    }
  }

  const label = (id) => byId.get(id)?.label ?? id;
  const pathTo = (id) => {
    const path = [];
    let cur = id;
    while (cur !== undefined) {
      path.unshift(cur);
      cur = previous?.get(cur);
      if (path.length > V.length + 1) break;
    }
    return path.map(label).join(" → ");
  };

  return {
    V, E, out, degree, components, start, bfs, dfs, hasCycle, connected, isTree, distances, pathTo,
    labels: (ids) => ids.map(label).join(" → ")
  };
}

function setupGraphStudio(root) {
  root.innerHTML = `
    <h3>图工具</h3>
    <p>点击空白处添加顶点，先点一个顶点再点另一个顶点添加或删除边。顶点可拖动；下方实时给出度数、连通性、遍历和带权最短路等属性。</p>
    <div class="lab-controls">
      <label><input type="checkbox" id="gs-directed"> 有向图</label>
      <label><input type="checkbox" id="gs-weighted" checked> 带权</label>
      <button class="study-button" id="gs-example">示例图</button>
      <button class="study-button" id="gs-ring">环形布局</button>
      <button class="study-button" id="gs-clear">清空</button>
      <button class="study-button" id="gs-delete">删除选中顶点</button>
      <span id="gs-hint" style="color:#8c9b9f"></span>
    </div>
    <svg id="gs-canvas" viewBox="0 0 760 460" style="width:100%;height:auto;background:#fbfdfc;border:1px solid #e5ece9;border-radius:12px;cursor:crosshair;touch-action:none"></svg>
    <div class="lab-output" id="gs-analysis"></div>
    <div id="gs-edges"></div>`;

  const svg = root.querySelector("#gs-canvas");
  const analysisBox = root.querySelector("#gs-analysis");
  const edgeBox = root.querySelector("#gs-edges");
  const hint = root.querySelector("#gs-hint");
  const directedInput = root.querySelector("#gs-directed");
  const weightedInput = root.querySelector("#gs-weighted");
  const graph = { vertices: [], edges: [], selected: null, nextLabel: 0 };
  let drag = null;
  let moved = false;
  let suppressClick = false;

  const labelFor = (index) => String.fromCharCode(65 + (index % 26)) + (index >= 26 ? String(Math.floor(index / 26)) : "");
  const toSvg = (event) => {
    const rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 760,
      y: ((event.clientY - rect.top) / rect.height) * 460
    };
  };
  const vertexById = (id) => graph.vertices.find((v) => v.id === id);

  const drawCanvas = () => {
    const NS = "http://www.w3.org/2000/svg";
    svg.replaceChildren();
    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML = '<marker id="gs-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7fa8a1"></path></marker>';
    svg.append(defs);

    for (const e of graph.edges) {
      const a = vertexById(e.a);
      const b = vertexById(e.b);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", a.x + ux * 18);
      line.setAttribute("y1", a.y + uy * 18);
      line.setAttribute("x2", b.x - ux * 18);
      line.setAttribute("y2", b.y - uy * 18);
      line.setAttribute("stroke", graph.selected === e.a || graph.selected === e.b ? "#5aa99f" : "#9fb6b2");
      line.setAttribute("stroke-width", "2");
      if (directedInput.checked) line.setAttribute("marker-end", "url(#gs-arrow)");
      line.style.pointerEvents = "none";
      svg.append(line);
      if (weightedInput.checked) {
        const weight = document.createElementNS(NS, "text");
        weight.setAttribute("x", (a.x + b.x) / 2);
        weight.setAttribute("y", (a.y + b.y) / 2 - 7);
        weight.setAttribute("text-anchor", "middle");
        weight.setAttribute("font-size", "11");
        weight.setAttribute("fill", "#7a8f8a");
        weight.style.pointerEvents = "none";
        weight.textContent = e.w;
        svg.append(weight);
      }
    }

    for (const v of graph.vertices) {
      const group = document.createElementNS(NS, "g");
      group.setAttribute("transform", `translate(${v.x},${v.y})`);
      const circle = document.createElementNS(NS, "circle");
      circle.setAttribute("r", "17");
      circle.setAttribute("fill", v.id === graph.selected ? "#168c81" : "#ffffff");
      circle.setAttribute("stroke", "#7fa8a1");
      circle.setAttribute("stroke-width", "2");
      circle.dataset.id = v.id;
      circle.style.cursor = "grab";
      group.append(circle);
      const text = document.createElementNS(NS, "text");
      text.textContent = v.label;
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", v.id === graph.selected ? "#ffffff" : "#31515a");
      text.style.pointerEvents = "none";
      group.append(text);
      svg.append(group);
    }
  };

  const renderAnalysis = () => {
    const directed = directedInput.checked;
    const weighted = weightedInput.checked;
    const info = graphAnalysis(graph, directed, weighted);
    if (!graph.vertices.length) {
      analysisBox.textContent = "画布为空。点击空白处添加顶点。";
      return;
    }
    const degreeText = info.degree
      .map((d) => directed ? `${esc(d.label)}：出 ${d.out} / 入 ${d.in}` : `${esc(d.label)}：${d.out}`)
      .join("　");
    const degreeSum = info.degree.reduce((sum, d) => sum + d.out, 0);
    const inSum = info.degree.reduce((sum, d) => sum + d.in, 0);
    const handshake = directed
      ? `握手定理（有向）：Σ出度 = ${degreeSum}，Σ入度 = ${inSum}，|E| = ${info.E.length}`
      : `握手定理：Σdeg = ${degreeSum}，2|E| = ${2 * info.E.length}`;
    const componentText = info.components.map((comp) => comp.map((id) => vertexById(id)?.label ?? id).join(", ")).join("　|　");
    const distanceText = info.distances
      ? graph.vertices.map((v) => {
        const d = info.distances.get(v.id);
        return d === undefined || !Number.isFinite(d) ? `${esc(v.label)}:∞` : `${esc(v.label)}:${d}（${esc(info.pathTo(v.id))}）`;
      }).join("<br>")
      : "";
    const adjacency = (() => {
      if (graph.vertices.length > 8) return "<p style=\"margin:8px 0 0;color:#8c9b9f\">顶点超过 8 个，省略邻接矩阵。</p>";
      const labels = graph.vertices.map((v) => v.label);
      const rows = graph.vertices.map((a) => {
        const cells = graph.vertices.map((b) => {
          const matches = graph.edges.filter((e) => directed ? (e.a === a.id && e.b === b.id) : ((e.a === a.id && e.b === b.id) || (e.a === b.id && e.b === a.id)));
          if (!matches.length) return "0";
          return weighted ? String(matches[0].w) : "1";
        });
        return [esc(a.label), ...cells];
      });
      return table(["", ...labels.map(esc)], rows, "邻接矩阵");
    })();

    analysisBox.innerHTML = `
      <b>顶点 ${info.V.length}　边 ${info.E.length}</b><br>
      度数：${degreeText}<br>
      ${handshake}<br>
      连通分量：${componentText}（${info.connected ? (directed ? "弱连通" : "连通") : "不连通"}）<br>
      含环：${info.hasCycle ? "是" : "否"}　是否树：${directed ? "—（仅对无向图判定）" : info.isTree ? "是" : "否"}<br>
      BFS（从 ${esc(vertexById(info.start)?.label ?? "—")}）：${esc(info.labels(info.bfs) || "—")}<br>
      DFS（从 ${esc(vertexById(info.start)?.label ?? "—")}）：${esc(info.labels(info.dfs) || "—")}<br>
      ${weighted ? `<b>最短路</b>（从 ${esc(vertexById(info.start)?.label ?? "—")}，Dijkstra）<br>${distanceText}` : ""}
      ${adjacency}`;
  };

  const renderEdgeList = () => {
    if (!graph.edges.length) {
      edgeBox.innerHTML = "";
      return;
    }
    const rows = graph.edges.map((e, index) => {
      const a = vertexById(e.a)?.label ?? e.a;
      const b = vertexById(e.b)?.label ?? e.b;
      const weight = weightedInput.checked
        ? `<input type="number" step="any" data-gs-weight="${index}" value="${e.w}" style="width:74px">`
        : "—";
      return [esc(directedInput.checked ? `${a} → ${b}` : `${a} — ${b}`), weight, `<button class="study-button" data-gs-edge-delete="${index}" style="padding:5px 8px">删除</button>`];
    });
    edgeBox.innerHTML = table(["边", "权", "操作"], rows, "边列表");
    edgeBox.querySelectorAll("[data-gs-weight]").forEach((input) => {
      input.addEventListener("change", () => {
        const index = Number(input.dataset.gsWeight);
        graph.edges[index].w = Number(input.value) || 0;
        refresh();
      });
    });
    edgeBox.querySelectorAll("[data-gs-edge-delete]").forEach((button) => {
      button.addEventListener("click", () => {
        graph.edges.splice(Number(button.dataset.gsEdgeDelete), 1);
        refresh();
      });
    });
  };

  const updateHint = () => {
    if (graph.selected) {
      hint.textContent = `已选中 ${vertexById(graph.selected)?.label ?? ""}，再点另一个顶点连边`;
    } else {
      hint.textContent = "";
    }
  };

  const refresh = () => {
    drawCanvas();
    renderAnalysis();
    renderEdgeList();
    updateHint();
  };

  svg.addEventListener("pointerdown", (event) => {
    const id = event.target?.dataset?.id;
    if (!id) return;
    const vertex = vertexById(id);
    if (!vertex) return;
    const point = toSvg(event);
    drag = { id, dx: vertex.x - point.x, dy: vertex.y - point.y, startX: point.x, startY: point.y };
    moved = false;
    svg.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  svg.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const point = toSvg(event);
    if (Math.hypot(point.x - drag.startX, point.y - drag.startY) > 5) moved = true;
    if (!moved) return;
    const vertex = vertexById(drag.id);
    if (!vertex) return;
    vertex.x = Math.max(22, Math.min(738, point.x + drag.dx));
    vertex.y = Math.max(22, Math.min(438, point.y + drag.dy));
    drawCanvas();
  });

  svg.addEventListener("pointerup", () => {
    if (moved) suppressClick = true;
    drag = null;
    moved = false;
  });

  svg.addEventListener("click", (event) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    const id = event.target?.dataset?.id;
    if (id) {
      if (!graph.selected) graph.selected = id;
      else if (graph.selected === id) graph.selected = null;
      else {
        const matches = (e) => directedInput.checked
          ? e.a === graph.selected && e.b === id
          : (e.a === graph.selected && e.b === id) || (e.a === id && e.b === graph.selected);
        const index = graph.edges.findIndex(matches);
        if (index >= 0) graph.edges.splice(index, 1);
        else graph.edges.push({ a: graph.selected, b: id, w: 1 });
        graph.selected = null;
      }
      refresh();
      return;
    }
    const point = toSvg(event);
    const vertex = { id: `v${graph.nextLabel}`, label: labelFor(graph.nextLabel), x: point.x, y: point.y };
    graph.nextLabel += 1;
    graph.vertices.push(vertex);
    refresh();
  });

  root.querySelector("#gs-clear").addEventListener("click", () => {
    graph.vertices = [];
    graph.edges = [];
    graph.selected = null;
    graph.nextLabel = 0;
    refresh();
  });

  root.querySelector("#gs-delete").addEventListener("click", () => {
    if (!graph.selected) return;
    graph.vertices = graph.vertices.filter((v) => v.id !== graph.selected);
    graph.edges = graph.edges.filter((e) => e.a !== graph.selected && e.b !== graph.selected);
    graph.selected = null;
    refresh();
  });

  root.querySelector("#gs-ring").addEventListener("click", () => {
    const count = graph.vertices.length;
    graph.vertices.forEach((v, i) => {
      const angle = (Math.PI * 2 * i) / Math.max(1, count) - Math.PI / 2;
      v.x = 380 + Math.cos(angle) * 180;
      v.y = 230 + Math.sin(angle) * 160;
    });
    refresh();
  });

  root.querySelector("#gs-example").addEventListener("click", () => {
    graph.vertices = [
      { id: "v0", label: "A", x: 140, y: 230 },
      { id: "v1", label: "B", x: 310, y: 105 },
      { id: "v2", label: "C", x: 310, y: 355 },
      { id: "v3", label: "D", x: 500, y: 150 },
      { id: "v4", label: "E", x: 500, y: 355 },
      { id: "v5", label: "F", x: 650, y: 250 }
    ];
    graph.edges = [
      { a: "v0", b: "v1", w: 4 }, { a: "v0", b: "v2", w: 2 },
      { a: "v1", b: "v2", w: 1 }, { a: "v1", b: "v3", w: 5 },
      { a: "v2", b: "v4", w: 8 }, { a: "v3", b: "v4", w: 2 },
      { a: "v4", b: "v5", w: 3 }
    ];
    graph.selected = null;
    graph.nextLabel = 6;
    directedInput.checked = false;
    weightedInput.checked = true;
    refresh();
  });

  directedInput.addEventListener("change", refresh);
  weightedInput.addEventListener("change", refresh);
  refresh();
}

/* ------------------------------------------------------------------ */
/* 3. 带权最短路                                                       */
/* ------------------------------------------------------------------ */

function parseWeightedEdges(text, directed) {
  const edges = [];
  const labels = new Set();
  const clean = String(text).replace(/[；;]/g, ",");
  for (const part of clean.split(/[,\n]+/)) {
    const match = part.trim().match(/^([\w\u4e00-\u9fa5]+)\s*(->|→|-)\s*([\w\u4e00-\u9fa5]+)(?:\s*[:=]\s*(-?\d+(?:\.\d+)?))?$/);
    if (!match) continue;
    const [, a, arrow, b, rawWeight] = match;
    const weight = rawWeight === undefined ? 1 : Number(rawWeight);
    if (!Number.isFinite(weight)) continue;
    labels.add(a);
    labels.add(b);
    edges.push({ a, b, w: weight });
    if (!directed && arrow === "-") edges.push({ a: b, b: a, w: weight });
    else if (!directed) edges.push({ a: b, b: a, w: weight });
  }
  return { edges, labels: [...labels] };
}

function runDijkstra(edges, labels, start) {
  const dist = new Map(labels.map((id) => [id, Infinity]));
  const prev = new Map();
  dist.set(start, 0);
  const done = new Set();
  while (done.size < labels.length) {
    let u = null;
    let best = Infinity;
    for (const id of labels) {
      if (!done.has(id) && dist.get(id) < best) {
        best = dist.get(id);
        u = id;
      }
    }
    if (u === null) break;
    done.add(u);
    for (const edge of edges) {
      if (edge.a !== u) continue;
      if (dist.get(u) + edge.w < dist.get(edge.b)) {
        dist.set(edge.b, dist.get(u) + edge.w);
        prev.set(edge.b, u);
      }
    }
  }
  return { dist, prev };
}

function setupShortestPath(root) {
  root.innerHTML = `
    <h3>最短路工具</h3>
    <p>编辑任意带权边表，选择起点和终点，查看 Dijkstra 的距离表与路径。边写作 <code>A-B:4</code>；有向边写作 <code>A-&gt;B:4</code>，勾选“有向”后生效。</p>
    <div class="lab-controls">
      <label style="flex:1;min-width:320px">边表 <input id="sp-edges" value="A-B:4, A-C:2, C-B:1, B-D:5, C-D:8, C-E:10, D-E:2" style="width:100%"></label>
    </div>
    <div class="lab-controls">
      <label><input type="checkbox" id="sp-directed"> 有向图</label>
      <label>起点 <select id="sp-start"></select></label>
      <label>终点 <select id="sp-end"></select></label>
      <button class="study-button" id="sp-example">示例</button>
      <button class="study-button" id="sp-clear">清空路径</button>
    </div>
    <div class="lab-output" id="sp-output"></div>
    <div id="sp-table"></div>`;

  const edgeInput = root.querySelector("#sp-edges");
  const directedInput = root.querySelector("#sp-directed");
  const startSelect = root.querySelector("#sp-start");
  const endSelect = root.querySelector("#sp-end");
  const output = root.querySelector("#sp-output");
  const tableBox = root.querySelector("#sp-table");

  const update = () => {
    const { edges, labels } = parseWeightedEdges(edgeInput.value, directedInput.checked);
    if (!labels.length) {
      startSelect.innerHTML = endSelect.innerHTML = "";
      output.textContent = "请输入至少一条格式正确的边，例如 A-B:4。";
      tableBox.innerHTML = "";
      return;
    }
    const oldStart = startSelect.value;
    const oldEnd = endSelect.value;
    startSelect.innerHTML = labels.map((id) => `<option value="${esc(id)}">${esc(id)}</option>`).join("");
    endSelect.innerHTML = labels.map((id) => `<option value="${esc(id)}">${esc(id)}</option>`).join("");
    startSelect.value = labels.includes(oldStart) ? oldStart : labels[0];
    endSelect.value = labels.includes(oldEnd) ? oldEnd : labels[labels.length - 1];
    const negative = edges.some((edge) => edge.w < 0);
    if (negative) {
      output.innerHTML = '<span style="color:#b4533f">Dijkstra 不适用于负权边。</span>';
      tableBox.innerHTML = "";
      return;
    }
    const start = startSelect.value;
    const end = endSelect.value;
    const { dist, prev } = runDijkstra(edges, labels, start);
    const pathTo = (id) => {
      const path = [];
      let cur = id;
      while (cur !== undefined) {
        path.unshift(cur);
        cur = prev.get(cur);
        if (path.length > labels.length + 1) break;
      }
      return path.join(" → ");
    };
    const distance = dist.get(end);
    output.innerHTML = Number.isFinite(distance)
      ? `<b>${esc(start)} → ${esc(end)} 的最短距离：${distance}</b><br>路径：${esc(pathTo(end))}`
      : `<b>${esc(start)} 无法到达 ${esc(end)}</b>`;
    tableBox.innerHTML = table(
      ["顶点", "距离", "前驱", "路径"],
      labels.map((id) => [
        esc(id),
        Number.isFinite(dist.get(id)) ? String(dist.get(id)) : "∞",
        esc(prev.get(id) ?? "—"),
        Number.isFinite(dist.get(id)) ? esc(pathTo(id)) : "不可达"
      ]),
      `Dijkstra 距离表（起点 ${start}）`
    );
  };

  edgeInput.addEventListener("input", update);
  directedInput.addEventListener("change", update);
  startSelect.addEventListener("change", update);
  endSelect.addEventListener("change", update);
  root.querySelector("#sp-example").addEventListener("click", () => {
    edgeInput.value = "A-B:4, A-C:2, C-B:1, B-D:5, C-D:8, C-E:10, D-E:2";
    directedInput.checked = false;
    update();
  });
  root.querySelector("#sp-clear").addEventListener("click", () => {
    edgeInput.value = "";
    update();
  });
  update();
}

/* ------------------------------------------------------------------ */
/* 4. 集合工具                                                         */
/* ------------------------------------------------------------------ */

function setupSetTool(root) {
  root.innerHTML = `
    <h3>集合工具</h3>
    <p>输入两个有限集合与一个元素，检查成员关系、包含关系，并计算并、交、差与对称差。元素用逗号分隔。</p>
    <div class="lab-controls">
      <label>A <input id="set-a" value="1, 2, 3"></label>
      <label>B <input id="set-b" value="2, 3, 4"></label>
      <label>x <input id="set-x" value="2" style="width:70px"></label>
    </div>
    <div class="lab-output" id="set-output"></div>`;

  const parse = (id) => new Set(splitList(root.querySelector(id).value));
  const update = () => {
    const A = parse("#set-a");
    const B = parse("#set-b");
    const x = root.querySelector("#set-x").value.trim();
    const union = unique([...A, ...B]);
    const intersection = [...A].filter((v) => B.has(v));
    const differenceAB = [...A].filter((v) => !B.has(v));
    const differenceBA = [...B].filter((v) => !A.has(v));
    const symmetric = unique([...differenceAB, ...differenceBA]);
    const subsetAB = [...A].every((v) => B.has(v));
    const subsetBA = [...B].every((v) => A.has(v));
    const rows = [
      ["x ∈ A", A.has(x) ? "真" : "假"],
      ["x ∈ B", B.has(x) ? "真" : "假"],
      ["A ⊆ B", subsetAB ? "真" : "假"],
      ["B ⊆ A", subsetBA ? "真" : "假"],
      ["A = B", subsetAB && subsetBA ? "真" : "假"],
      ["A ∪ B", setText(union)],
      ["A ∩ B", setText(intersection)],
      ["A \\ B", setText(differenceAB)],
      ["B \\ A", setText(differenceBA)],
      ["A △ B", setText(symmetric)],
      ["|A|, |B|, |A × B|", `${A.size}, ${B.size}, ${A.size * B.size}`],
      ["幂集大小 2^|A|", A.size <= 30 ? String(2 ** A.size) : "过大"]
    ];
    root.querySelector("#set-output").innerHTML = table(["项目", "结果"], rows);
  };
  root.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 5. 量词真值检查                                                     */
/* ------------------------------------------------------------------ */

function setupQuantifier(root) {
  root.innerHTML = `
    <h3>量词真值检查器</h3>
    <p>在有限论域上选择一个谓词，检查全称命题与存在命题的真值，并给出反例或见证。</p>
    <div class="lab-controls">
      <label>论域 D <input id="q-domain" value="1, 2, 3, 4, 5, 6"></label>
      <label>谓词 <select id="q-mode">
        <option value="even">P(x)：x 是偶数</option>
        <option value="odd">P(x)：x 是奇数</option>
        <option value="ge">P(x)：x ≥ k</option>
        <option value="le">P(x)：x ≤ k</option>
        <option value="eq">P(x)：x = k</option>
      </select></label>
      <label>k <input id="q-k" type="number" value="4" style="width:70px"></label>
    </div>
    <div class="lab-step" id="q-domain-view"></div>
    <div class="lab-output" id="q-output"></div>`;

  const update = () => {
    const domain = splitList(root.querySelector("#q-domain").value).map(Number).filter(Number.isFinite);
    const mode = root.querySelector("#q-mode").value;
    const k = Number(root.querySelector("#q-k").value);
    const holds = (x) => mode === "even" ? x % 2 === 0
      : mode === "odd" ? Math.abs(x % 2) === 1
        : mode === "ge" ? x >= k
          : mode === "le" ? x <= k
            : x === k;
    const truths = domain.filter(holds);
    const falses = domain.filter((x) => !holds(x));
    root.querySelector("#q-domain-view").innerHTML = domain.map((x) => `<span class="lab-token ${holds(x) ? "active" : ""}">${x}</span>`).join("") || "<span style='color:#8c9b9f'>论域为空</span>";
    root.querySelector("#q-output").innerHTML = `
      满足 P(x) 的对象：${truths.length ? `{${truths.join(", ")}}` : "∅"}<br>
      ∀x∈D P(x)：<b>${truths.length === domain.length && domain.length > 0 ? "真" : "假"}</b>${falses.length ? `（反例：${falses[0]}）` : ""}<br>
      ∃x∈D P(x)：<b>${truths.length > 0 ? "真" : "假"}</b>${truths.length ? `（见证：${truths[0]}）` : ""}`;
  };
  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 6. 后继与递归加法                                                   */
/* ------------------------------------------------------------------ */

function setupSuccessor(root) {
  root.innerHTML = `
    <h3>后继与递归加法器</h3>
    <p>自然数从 0 开始，每应用一次后继函数 S 得到下一个自然数。加法由 a+0=a 与 a+S(b)=S(a+b) 递归定义。</p>
    <div class="lab-controls">
      <label>a <input id="suc-a" type="range" min="0" max="20" value="3"><b id="suc-a-value">3</b></label>
      <label>b <input id="suc-b" type="range" min="0" max="20" value="2"><b id="suc-b-value">2</b></label>
    </div>
    <div class="lab-step" id="suc-steps"></div>
    <div class="lab-output" id="suc-output"></div>`;

  const update = () => {
    const a = Number(root.querySelector("#suc-a").value);
    const b = Number(root.querySelector("#suc-b").value);
    root.querySelector("#suc-a-value").textContent = a;
    root.querySelector("#suc-b-value").textContent = b;
    const steps = Array.from({ length: b + 1 }, (_, i) => i === 0
      ? `${a} + 0 = ${a}`
      : `S(${a} + ${i - 1}) = ${a + i}`);
    root.querySelector("#suc-steps").innerHTML = steps.map((step, i) => `<span class="lab-token ${i === steps.length - 1 ? "active" : ""}">${step}</span>`).join("");
    root.querySelector("#suc-output").innerHTML = `递归定义：a + 0 = a；a + S(b) = S(a + b)<br>因此 ${a} + ${b} = <b>${a + b}</b>，即从 ${a} 出发应用后继函数 S ${b} 次。`;
  };
  root.querySelectorAll("input").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 7. 归纳验证器                                                       */
/* ------------------------------------------------------------------ */

function setupInduction(root) {
  root.innerHTML = `
    <h3>归纳验证器</h3>
    <p>以 P(n)：1+2+…+n = n(n+1)/2 为例，逐步检查基础步、归纳假设与归纳步，并数值核对结论。</p>
    <div class="lab-controls">
      <label>归纳步中的 k <input id="ind-k" type="range" min="1" max="20" value="4"><b id="ind-k-value">4</b></label>
    </div>
    <div class="lab-step" id="ind-steps"></div>
    <div class="lab-output" id="ind-output"></div>
    <div id="ind-table"></div>`;

  const update = () => {
    const k = Number(root.querySelector("#ind-k").value);
    root.querySelector("#ind-k-value").textContent = k;
    const assumed = (k * (k + 1)) / 2;
    const next = assumed + (k + 1);
    const target = ((k + 1) * (k + 2)) / 2;
    root.querySelector("#ind-steps").innerHTML = [
      "基础步：P(1)",
      `归纳假设：P(${k})`,
      `归纳步：P(${k}) ⇒ P(${k + 1})`
    ].map((step, i) => `<span class="lab-token ${i === 2 ? "active" : ""}">${step}</span>`).join("");
    root.querySelector("#ind-output").innerHTML = `
      基础步：1 = 1 × 2 / 2，成立。<br>
      归纳假设：1 + … + ${k} = ${assumed}。<br>
      归纳步：${assumed} + ${k + 1} = ${next} = (${k + 1})(${k + 2}) / 2 = ${target}。<br>
      因此 P(${k}) ⇒ P(${k + 1})。结合基础步，P(n) 对所有正整数 n 成立。`;
    root.querySelector("#ind-table").innerHTML = table(
      ["n", "1+…+n", "n(n+1)/2", "一致"],
      Array.from({ length: Math.min(k + 1, 10) }, (_, i) => {
        const n = i + 1;
        const left = (n * (n + 1)) / 2;
        return [String(n), String(left), String((n * (n + 1)) / 2), "是"];
      }),
      "数值核对"
    );
  };
  root.querySelector("#ind-k").addEventListener("input", update);
  update();
}

/* ------------------------------------------------------------------ */
/* 8. 数轴加减器                                                       */
/* ------------------------------------------------------------------ */

function setupNumberLine(root) {
  root.innerHTML = `
    <h3>数轴加减器</h3>
    <p>把加正数看成向右移动，加负数看成向左移动。调整起点与变化量，观察结果落在数轴上的位置。</p>
    <div class="lab-controls">
      <label>起点 a <input id="nl-a" type="range" min="-20" max="20" value="3"><b id="nl-a-value">3</b></label>
      <label>变化量 b <input id="nl-b" type="range" min="-20" max="20" value="-5"><b id="nl-b-value">−5</b></label>
    </div>
    <div class="lab-step" id="nl-line"></div>
    <div class="lab-output" id="nl-output"></div>`;

  const update = () => {
    const a = Number(root.querySelector("#nl-a").value);
    const b = Number(root.querySelector("#nl-b").value);
    root.querySelector("#nl-a-value").textContent = a;
    root.querySelector("#nl-b-value").textContent = b < 0 ? `−${-b}` : b;
    const values = Array.from({ length: 41 }, (_, i) => i - 20);
    root.querySelector("#nl-line").innerHTML = values.map((n) => `<span class="lab-token ${n === a || n === a + b ? "active" : ""}" style="padding:5px 6px">${n}</span>`).join("");
    root.querySelector("#nl-output").innerHTML = `${a} + (${b}) = <b>${a + b}</b>。${b < 0 ? `从 ${a} 向左移动 ${-b} 格。` : `从 ${a} 向右移动 ${b} 格。`}`;
  };
  root.querySelectorAll("input").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 9. 整数编码器                                                       */
/* ------------------------------------------------------------------ */

function setupIntegerCodes(root) {
  root.innerHTML = `
    <h3>整数编码器</h3>
    <p>输入任意整数，选择位宽与解释方式，查看无符号、原码、反码与补码表示。位宽范围为 2–32 位。</p>
    <div class="lab-controls">
      <label>位宽 <input id="ic-width" type="range" min="2" max="32" value="8"><b id="ic-width-value">8 bit</b></label>
      <label>整数 <input id="ic-value" value="-5" style="width:110px"></label>
      <label>解释 <select id="ic-mode"><option value="signed">有符号</option><option value="unsigned">无符号</option></select></label>
    </div>
    <div class="lab-output" id="ic-output"></div>`;

  const update = () => {
    const width = Number(root.querySelector("#ic-width").value);
    const mode = root.querySelector("#ic-mode").value;
    const rawText = root.querySelector("#ic-value").value.trim();
    root.querySelector("#ic-width-value").textContent = `${width} bit`;
    const output = root.querySelector("#ic-output");
    let value;
    try {
      value = BigInt(rawText);
    } catch {
      output.innerHTML = '<span style="color:#b4533f">请输入十进制整数。</span>';
      return;
    }
    const mod = 1n << BigInt(width);
    const min = mode === "signed" ? -(1n << BigInt(width - 1)) : 0n;
    const max = mode === "signed" ? (1n << BigInt(width - 1)) - 1n : mod - 1n;
    const bits = ((value % mod) + mod) % mod;
    const binary = bits.toString(2).padStart(width, "0");
    const hex = bits.toString(16).toUpperCase().padStart(Math.ceil(width / 4), "0");
    const unsignedValue = bits;
    const signedValue = bits >= (1n << BigInt(width - 1)) ? bits - mod : bits;
    const magnitude = value < 0n ? -value : value;
    const magnitudeBits = magnitude & (mod - 1n);
    const magnitudeField = magnitude & ((1n << BigInt(width - 1)) - 1n);
    const signMagnitude = value < 0n
      ? (1n << BigInt(width - 1)) | magnitudeField
      : magnitudeBits;
    const onesComplement = value < 0n
      ? (mod - 1n) ^ magnitudeField
      : magnitudeBits;
    const inRange = value >= min && value <= max;
    const group = (s) => s.replace(/(.{4})(?=.)/g, "$1 ");
    output.innerHTML = `
      可表示范围：<b>${min.toString()} 到 ${max.toString()}</b><br>
      二进制：<code>${group(binary)}</code><br>
      十六进制：<code>0x${hex}</code><br>
      无符号值：${unsignedValue.toString()}　有符号值：${signedValue.toString()}<br>
      原码：<code>${group(signMagnitude.toString(2).padStart(width, "0"))}</code><br>
      反码：<code>${group(onesComplement.toString(2).padStart(width, "0"))}</code><br>
      补码：<code>${group(binary)}</code><br>
      ${inRange ? "当前数值在所选格式的表示范围内。" : '<span style="color:#b4533f">当前数值超出所选格式的表示范围。</span>'}`;
  };
  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 10. 定长加法与溢出                                                  */
/* ------------------------------------------------------------------ */

function setupOverflow(root) {
  root.innerHTML = `
    <h3>定长加法与溢出</h3>
    <p>在固定位宽下执行加法，查看保留低位的位串、进位标志与溢出标志。可选择补码有符号数或无符号数解释。</p>
    <div class="lab-controls">
      <label>位宽 <input id="ov-width" type="range" min="2" max="16" value="4"><b id="ov-width-value">4 bit</b></label>
      <label>a <input id="ov-a" type="number" value="7" style="width:80px"></label>
      <label>b <input id="ov-b" type="number" value="1" style="width:80px"></label>
      <label>解释 <select id="ov-mode"><option value="signed">补码有符号数</option><option value="unsigned">无符号数</option></select></label>
    </div>
    <div class="lab-output" id="ov-output"></div>`;

  const update = () => {
    const width = Number(root.querySelector("#ov-width").value);
    const a = Math.trunc(Number(root.querySelector("#ov-a").value) || 0);
    const b = Math.trunc(Number(root.querySelector("#ov-b").value) || 0);
    const signed = root.querySelector("#ov-mode").value === "signed";
    const mod = 2 ** width;
    const min = signed ? -(mod / 2) : 0;
    const max = signed ? mod / 2 - 1 : mod - 1;
    const raw = a + b;
    const bits = ((raw % mod) + mod) % mod;
    const decoded = signed && bits >= mod / 2 ? bits - mod : bits;
    const overflow = signed ? (a >= 0 && b >= 0 && decoded < 0) || (a < 0 && b < 0 && decoded >= 0) : raw > max;
    const carry = raw >= mod || raw < 0;
    root.querySelector("#ov-width-value").textContent = `${width} bit`;
    root.querySelector("#ov-output").innerHTML = `
      可表示范围：${min} 到 ${max}<br>
      数学结果：${a} + ${b} = <b>${raw}</b><br>
      保留低 ${width} 位：<code>${bits.toString(2).padStart(width, "0")}</code>，按当前格式解释为 <b>${decoded}</b><br>
      进位标志 CF：${carry ? "1" : "0"}　溢出标志 OF：${overflow ? "1" : "0"}<br>
      ${overflow || raw < min || raw > max ? '<span style="color:#b45d47">结果超出可表示范围，位串结果与数学结果不同。</span>' : "当前结果未超出表示范围。"}`;
  };
  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 11. 布尔运算与加法器                                                */
/* ------------------------------------------------------------------ */

function setupBoolean(root) {
  root.innerHTML = `
    <h3>布尔运算与加法器</h3>
    <p>选择二元逻辑运算并查看真值表；切换到一位全加器，检查和位与进位。</p>
    <div class="lab-controls">
      <label>模式 <select id="bool-mode"><option value="binary">二元逻辑运算</option><option value="adder">一位全加器</option></select></label>
      <span id="bool-extra"></span>
    </div>
    <div id="bool-body"></div>`;

  const extra = root.querySelector("#bool-extra");
  const body = root.querySelector("#bool-body");

  const update = () => {
    const mode = root.querySelector("#bool-mode").value;
    if (mode === "adder") {
      const a = Number(root.querySelector("#bool-a").value);
      const b = Number(root.querySelector("#bool-b").value);
      const c = Number(root.querySelector("#bool-c").value);
      const sum = a ^ b ^ c;
      const carry = (a & b) | (c & (a ^ b));
      const rows = [];
      for (let i = 0; i < 8; i++) {
        const x = (i >> 2) & 1;
        const y = (i >> 1) & 1;
        const z = i & 1;
        const s = x ^ y ^ z;
        const co = (x & y) | (z & (x ^ y));
        const active = x === a && y === b && z === c;
        rows.push([`${x}`, `${y}`, `${z}`, active ? `<b>${s}</b>` : `${s}`, active ? `<b>${co}</b>` : `${co}`]);
      }
      body.innerHTML = `<div class="lab-output">当前：A=${a}，B=${b}，C<sub>in</sub>=${c} → 和 S=<b>${sum}</b>，进位 C<sub>out</sub>=<b>${carry}</b><br>
        S = A ⊕ B ⊕ C<sub>in</sub>，C<sub>out</sub> = AB + C<sub>in</sub>(A ⊕ B)</div>
        ${table(["A", "B", "Cin", "S", "Cout"], rows, "一位全加器真值表")}`;
      return;
    }
    const op = root.querySelector("#bool-op").value;
    const a = Number(root.querySelector("#bool-a").value);
    const b = Number(root.querySelector("#bool-b").value);
    const evaluate = (x, y) => op === "AND" ? x & y
      : op === "OR" ? x | y
        : op === "XOR" ? x ^ y
          : op === "NAND" ? 1 - (x & y)
            : op === "NOR" ? 1 - (x | y)
              : op === "XNOR" ? 1 - (x ^ y)
                : 1 - x;
    const rows = op === "NOT"
      ? [0, 1].map((x) => [String(x), `<b>${evaluate(x, 0)}</b>`])
      : [[0, 0], [0, 1], [1, 0], [1, 1]].map(([x, y]) => [String(x), String(y), x === a && y === b ? `<b>${evaluate(x, y)}</b>` : String(evaluate(x, y))]);
    body.innerHTML = `<div class="lab-output">当前：A=${a}${op === "NOT" ? "" : `，B=${b}`} → <b>${evaluate(a, b)}</b></div>
      ${table(op === "NOT" ? ["A", "NOT A"] : ["A", "B", `${op} 结果`], rows, "真值表")}`;
  };

  const buildControls = () => {
    const mode = root.querySelector("#bool-mode").value;
    if (mode === "adder") {
      extra.innerHTML = `<label>A <select id="bool-a"><option>0</option><option>1</option></select></label>
        <label>B <select id="bool-b"><option>0</option><option>1</option></select></label>
        <label>进位输入 C<sub>in</sub> <select id="bool-c"><option>0</option><option>1</option></select></label>`;
    } else {
      extra.innerHTML = `<label>运算 <select id="bool-op">
        <option value="AND">AND（与）</option><option value="OR">OR（或）</option>
        <option value="XOR">XOR（异或）</option><option value="NAND">NAND（与非）</option>
        <option value="NOR">NOR（或非）</option><option value="XNOR">XNOR（同或）</option>
        <option value="NOT">NOT A（非）</option>
      </select></label>
        <label>A <select id="bool-a"><option>0</option><option>1</option></select></label>
        <label>B <select id="bool-b"><option>0</option><option>1</option></select></label>`;
    }
    extra.querySelectorAll("select").forEach((select) => select.addEventListener("change", update));
    update();
  };

  root.querySelector("#bool-mode").addEventListener("change", buildControls);
  buildControls();
}

/* ------------------------------------------------------------------ */
/* 12. IEEE 754 浮点                                                   */
/* ------------------------------------------------------------------ */

function setupFloat(root) {
  root.innerHTML = `
    <h3>IEEE 754 浮点查看器</h3>
    <p>输入十进制小数，查看它舍入为单精度或双精度浮点数后的值、误差与位字段。</p>
    <div class="lab-controls">
      <label>精度 <select id="fl-precision"><option value="single">单精度 32 位</option><option value="double">双精度 64 位</option></select></label>
      <label>数值 <input id="fl-value" type="number" step="any" value="0.1" style="width:130px"></label>
    </div>
    <div class="lab-output" id="fl-output"></div>`;

  const update = () => {
    const precision = root.querySelector("#fl-precision").value;
    const value = Number(root.querySelector("#fl-value").value);
    const output = root.querySelector("#fl-output");
    if (!Number.isFinite(value)) {
      output.innerHTML = '<span style="color:#b4533f">请输入有限实数。</span>';
      return;
    }
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    let stored;
    let bits;
    let sign;
    let exponent;
    let fraction;
    let bias;
    if (precision === "single") {
      stored = new Float32Array([value])[0];
      view.setFloat32(0, value, false);
      bits = view.getUint32(0, false).toString(2).padStart(32, "0");
      sign = bits.slice(0, 1);
      exponent = bits.slice(1, 9);
      fraction = bits.slice(9);
      bias = 127;
    } else {
      stored = new Float64Array([value])[0];
      view.setFloat64(0, value, false);
      bits = view.getBigUint64(0, false).toString(2).padStart(64, "0");
      sign = bits.slice(0, 1);
      exponent = bits.slice(1, 12);
      fraction = bits.slice(12);
      bias = 1023;
    }
    const exponentValue = parseInt(exponent, 2) - bias;
    const hex = BigInt(`0b${bits}`).toString(16).toUpperCase().padStart(bits.length / 4, "0");
    output.innerHTML = `
      存储值：<b>${stored}</b><br>
      舍入误差：${Math.abs(stored - value)}<br>
      符号位：<code>${sign}</code>　指数位：<code>${exponent}</code>（偏置 ${bias}，实际指数 ${exponentValue}）<br>
      有效数字字段：<code>${fraction}</code><br>
      完整位串：<code>${bits.replace(/(.{4})(?=.)/g, "$1 ")}</code><br>
      十六进制：<code>0x${hex}</code>`;
  };
  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 13. Unicode / UTF-8                                                 */
/* ------------------------------------------------------------------ */

function setupUnicode(root) {
  root.innerHTML = `
    <h3>Unicode 与 UTF-8 编码器</h3>
    <p>输入文本，逐字符查看 Unicode 码点、UTF-16 码元与 UTF-8 字节序列。一个可见字符可能由多个码点组成。</p>
    <div class="lab-controls"><label>文本 <input id="uni-text" value="A中🙂" maxlength="40"></label></div>
    <div class="lab-output" id="uni-output"></div>`;

  const update = () => {
    const text = root.querySelector("#uni-text").value;
    const encoder = new TextEncoder();
    const rows = Array.from(text).map((ch) => {
      const cp = ch.codePointAt(0);
      const bytes = [...encoder.encode(ch)].map((x) => x.toString(16).padStart(2, "0").toUpperCase()).join(" ");
      const units = Array.from({ length: ch.length }, (_, i) => `0x${ch.charCodeAt(i).toString(16).toUpperCase().padStart(4, "0")}`).join(" ");
      return [esc(ch), `U+${cp.toString(16).toUpperCase().padStart(cp <= 0xffff ? 4 : 6, "0")}`, String(cp), `<code>${units}</code>`, `<code>${bytes}</code>`, String(bytes ? bytes.split(" ").length : 0)];
    });
    const stream = [...encoder.encode(text)].map((x) => x.toString(16).padStart(2, "0").toUpperCase()).join(" ");
    root.querySelector("#uni-output").innerHTML = `UTF-8 字节流：<code>${stream || "（空）"}</code>
      ${table(["字符", "码点", "十进制", "UTF-16 码元", "UTF-8 字节", "字节数"], rows)}`;
  };
  root.querySelector("#uni-text").addEventListener("input", update);
  update();
}

/* ------------------------------------------------------------------ */
/* 14. 字节序                                                          */
/* ------------------------------------------------------------------ */

function setupEndianness(root) {
  root.innerHTML = `
    <h3>字节序查看器</h3>
    <p>输入一个十六进制数，比较大端序和小端序中字节在内存地址上的排列。</p>
    <div class="lab-controls">
      <label>位宽 <select id="en-width"><option value="16">16 位</option><option value="32" selected>32 位</option><option value="64">64 位</option></select></label>
      <label>数值 <input id="en-value" value="12345678" maxlength="16"></label>
    </div>
    <div class="lab-output" id="en-output"></div>`;

  const update = () => {
    const width = Number(root.querySelector("#en-width").value);
    const digits = width / 4;
    const hex = root.querySelector("#en-value").value.replace(/[^0-9a-f]/gi, "").slice(-digits).padStart(digits, "0").toUpperCase();
    const bytes = hex.match(/../g) || [];
    const big = bytes;
    const little = [...bytes].reverse();
    const render = (arr) => table(["地址", "内容"], arr.map((b, i) => [String(i), b]), "");
    root.querySelector("#en-output").innerHTML = `数值：<code>0x${hex}</code>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px">
        <div><b>大端：低地址存最高有效字节</b>${render(big)}</div>
        <div><b>小端：低地址存最低有效字节</b>${render(little)}</div>
      </div>`;
  };
  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 15. 位运算                                                          */
/* ------------------------------------------------------------------ */

function setupBitwise(root) {
  root.innerHTML = `
    <h3>位运算器</h3>
    <p>选择位宽和运算，查看两个无符号整数的按位结果。移位会丢弃移出的位，并在空位补 0。</p>
    <div class="lab-controls">
      <label>位宽 <select id="bw-width"><option value="8" selected>8 位</option><option value="16">16 位</option><option value="32">32 位</option></select></label>
      <label>A <input id="bw-a" type="number" min="0" value="180" style="width:100px"></label>
      <label>B / 移位数 <input id="bw-b" type="number" min="0" value="15" style="width:100px"></label>
      <label>运算 <select id="bw-op">
        <option value="and">AND</option><option value="or">OR</option><option value="xor">XOR</option>
        <option value="not">NOT A</option><option value="shl">A 左移</option><option value="shr">A 右移</option><option value="rotl">A 循环左移</option>
      </select></label>
    </div>
    <div class="lab-output" id="bw-output"></div>`;

  const update = () => {
    const width = Number(root.querySelector("#bw-width").value);
    const mod = 2 ** width;
    const mask = mod - 1;
    const a = Math.max(0, Math.min(mask, Math.trunc(Number(root.querySelector("#bw-a").value) || 0)));
    const b = Math.max(0, Math.min(mask, Math.trunc(Number(root.querySelector("#bw-b").value) || 0)));
    const op = root.querySelector("#bw-op").value;
    const shift = b % width;
    const A = BigInt(a);
    const B = BigInt(b);
    const widthBig = BigInt(width);
    const maskBig = (1n << widthBig) - 1n;
    const shiftBig = BigInt(shift);
    const rotate = shift === 0 ? A : ((A << shiftBig) | (A >> (widthBig - shiftBig))) & maskBig;
    const valueBig = op === "and" ? A & B
      : op === "or" ? A | B
        : op === "xor" ? A ^ B
          : op === "not" ? (~A) & maskBig
            : op === "shl" ? (A << shiftBig) & maskBig
              : op === "shr" ? A >> shiftBig
                : rotate;
    const value = Number(valueBig);
    const bin = (x) => x.toString(2).padStart(width, "0").replace(/(.{4})(?=.)/g, "$1 ");
    root.querySelector("#bw-output").innerHTML = `
      A = <code>${bin(a)}</code> (${a})<br>
      B = <code>${bin(b)}</code> (${b})<br>
      ${op === "not" ? "~A" : op === "shl" ? `A << ${shift}` : op === "shr" ? `A >> ${shift}` : op === "rotl" ? `rotl(A, ${shift})` : `A ${op.toUpperCase()} B`}<br>
      结果 = <b><code>${bin(value)}</code> (${value})</b>，十六进制 <code>0x${value.toString(16).toUpperCase()}</code>`;
  };
  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 16. 增长率比较                                                       */
/* ------------------------------------------------------------------ */

function setupGrowth(root) {
  root.innerHTML = `
    <h3>增长率比较器</h3>
    <p>调整输入规模 n，比较线性、n log n、平方与指数级工作量的增长。条形长度按对数刻度绘制。</p>
    <div class="lab-controls"><label>输入规模 n <input id="gr-n" type="range" min="2" max="64" value="20"><b id="gr-n-value">20</b></label></div>
    <div class="lab-output" id="gr-output"></div>
    <div id="gr-table"></div>`;

  const update = () => {
    const n = Number(root.querySelector("#gr-n").value);
    root.querySelector("#gr-n-value").textContent = n;
    const values = [
      ["n", n, "#68a9d2"],
      ["n log₂ n", Math.round(n * Math.log2(n)), "#8f80cb"],
      ["n²", n * n, "#e6a14a"],
      ["2ⁿ", 2 ** n, "#c96b6b"]
    ];
    const max = Math.max(...values.map(([, v]) => v), 2);
    const bars = values.map(([name, value, color]) => {
      const percent = Math.max(2, Math.min(100, (Math.log2(value + 1) / Math.log2(max + 1)) * 100));
      return `<div style="margin:8px 0">${name}：${value.toLocaleString("en-US")}
        <div style="height:7px;width:${percent}%;background:${color};border-radius:8px"></div></div>`;
    }).join("");
    root.querySelector("#gr-output").innerHTML = bars;
    root.querySelector("#gr-table").innerHTML = table(
      ["函数", "n = " + n, "相对 n"],
      values.map(([name, value]) => [name, value.toLocaleString("en-US"), (value / Math.max(1, n)).toFixed(2)]),
      "增长量对照"
    );
  };
  root.querySelector("#gr-n").addEventListener("input", update);
  update();
}

/* ------------------------------------------------------------------ */
/* 17. 函数与导数                                                       */
/* ------------------------------------------------------------------ */

function setupDerivative(root) {
  root.innerHTML = `
    <h3>函数与导数观察器</h3>
    <p>选择函数并移动 x，比较函数值、精确导数与数值差商，观察切线斜率。</p>
    <div class="lab-controls">
      <label>函数 <select id="dv-fn">
        <option value="square">f(x) = x²</option>
        <option value="cube">f(x) = x³</option>
        <option value="sin">f(x) = sin x</option>
        <option value="exp">f(x) = eˣ</option>
      </select></label>
      <label>x <input id="dv-x" type="range" min="-3" max="3" step="0.1" value="1.2"><b id="dv-x-value">1.2</b></label>
    </div>
    <div class="lab-output" id="dv-output"></div>`;

  const update = () => {
    const fn = root.querySelector("#dv-fn").value;
    const x = Number(root.querySelector("#dv-x").value);
    const f = fn === "square" ? (t) => t * t
      : fn === "cube" ? (t) => t ** 3
        : fn === "sin" ? (t) => Math.sin(t)
          : (t) => Math.exp(t);
    const df = fn === "square" ? (t) => 2 * t
      : fn === "cube" ? (t) => 3 * t * t
        : fn === "sin" ? (t) => Math.cos(t)
          : (t) => Math.exp(t);
    const h = 0.001;
    const numeric = (f(x + h) - f(x - h)) / (2 * h);
    const y = f(x);
    const slope = df(x);
    root.querySelector("#dv-x-value").textContent = x.toFixed(1);
    root.querySelector("#dv-output").innerHTML = `
      f(${x.toFixed(1)}) = <b>${y.toFixed(5)}</b><br>
      精确导数 f′(${x.toFixed(1)}) = <b>${slope.toFixed(5)}</b><br>
      数值差商 ≈ ${numeric.toFixed(5)}<br>
      切线：y − ${y.toFixed(5)} = ${slope.toFixed(5)}(x − ${x.toFixed(1)})`;
  };
  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 18. 梯度下降                                                         */
/* ------------------------------------------------------------------ */

function setupGradient(root) {
  root.innerHTML = `
    <h3>梯度下降观察器</h3>
    <p>在损失函数 L(w) = (w − w*)² 上调整初始值、学习率和迭代次数，观察参数如何向最小值移动。</p>
    <div class="lab-controls">
      <label>目标 w* <input id="gd-target" type="number" value="3" style="width:70px"></label>
      <label>初始 w₀ <input id="gd-start" type="number" value="-4" style="width:70px"></label>
      <label>学习率 η <input id="gd-rate" type="range" min="0.05" max="1.2" step="0.05" value="0.2"><b id="gd-rate-value">0.20</b></label>
      <label>迭代次数 <input id="gd-steps" type="range" min="1" max="20" value="6"><b id="gd-steps-value">6</b></label>
    </div>
    <div class="lab-output" id="gd-output"></div>
    <div id="gd-table"></div>`;

  const update = () => {
    const target = Number(root.querySelector("#gd-target").value) || 0;
    const start = Number(root.querySelector("#gd-start").value) || 0;
    const rate = Number(root.querySelector("#gd-rate").value);
    const steps = Number(root.querySelector("#gd-steps").value);
    root.querySelector("#gd-rate-value").textContent = rate.toFixed(2);
    root.querySelector("#gd-steps-value").textContent = steps;
    let w = start;
    const history = [{ step: 0, w, loss: (w - target) ** 2, grad: 2 * (w - target) }];
    for (let i = 1; i <= steps; i++) {
      w -= rate * 2 * (w - target);
      history.push({ step: i, w, loss: (w - target) ** 2, grad: 2 * (w - target) });
    }
    const last = history[history.length - 1];
    root.querySelector("#gd-output").innerHTML = `最终参数 w = <b>${last.w.toFixed(6)}</b>，损失 L = <b>${last.loss.toFixed(8)}</b>${Number.isFinite(last.loss) ? "" : "（发散）"}`;
    root.querySelector("#gd-table").innerHTML = table(
      ["迭代", "w", "L(w)", "梯度"],
      history.map((row) => [String(row.step), row.w.toFixed(6), row.loss.toFixed(8), row.grad.toFixed(6)]),
      "迭代记录"
    );
  };
  root.querySelectorAll("input").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 19. 排序过程                                                         */
/* ------------------------------------------------------------------ */

function setupSorting(root) {
  root.innerHTML = `
    <h3>排序过程可视化</h3>
    <p>输入一组整数，选择排序算法与升序/降序，逐步查看数组如何变化。</p>
    <div class="lab-controls">
      <label>数组 <input id="so-values" value="8, 3, 6, 1, 5"></label>
      <label>算法 <select id="so-method"><option value="bubble">冒泡排序</option><option value="selection">选择排序</option><option value="insertion">插入排序</option></select></label>
      <label>顺序 <select id="so-order"><option value="asc">升序</option><option value="desc">降序</option></select></label>
      <button class="study-button primary" id="so-start">生成步骤</button>
    </div>
    <div id="so-bars" style="height:190px;display:flex;align-items:flex-end;gap:9px;padding:12px 4px"></div>
    <div class="lab-output" id="so-caption"></div>
    <div class="lab-controls">
      <button class="study-button" id="so-prev">上一步</button>
      <input id="so-step" type="range" min="0" max="0" value="0" style="flex:1">
      <button class="study-button" id="so-next">下一步</button>
      <span id="so-counter"></span>
    </div>`;

  let frames = [];
  let index = 0;
  const compare = (x, y, order) => order === "asc" ? x > y : x < y;
  const build = () => {
    const values = splitList(root.querySelector("#so-values").value).map(Number).filter(Number.isFinite).slice(0, 12);
    if (!values.length) return;
    const arr = values.slice();
    const method = root.querySelector("#so-method").value;
    const order = root.querySelector("#so-order").value;
    frames = [{ arr: arr.slice(), a: -1, b: -1, text: "初始数组" }];
    if (method === "bubble") {
      for (let end = arr.length - 1; end > 0; end--) {
        for (let j = 0; j < end; j++) {
          let text = `比较位置 ${j} 与 ${j + 1}`;
          if (compare(arr[j], arr[j + 1], order)) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            text += "，顺序相反，交换";
          } else text += "，顺序正确，不交换";
          frames.push({ arr: arr.slice(), a: j, b: j + 1, text });
        }
      }
    } else if (method === "selection") {
      for (let i = 0; i < arr.length - 1; i++) {
        let pick = i;
        for (let j = i + 1; j < arr.length; j++) {
          if (compare(arr[pick], arr[j], order)) pick = j;
          frames.push({ arr: arr.slice(), a: pick, b: j, text: `在未排序部分寻找${order === "asc" ? "最小" : "最大"}值：检查位置 ${j}` });
        }
        if (pick !== i) {
          [arr[i], arr[pick]] = [arr[pick], arr[i]];
          frames.push({ arr: arr.slice(), a: i, b: pick, text: `将${order === "asc" ? "最小" : "最大"}值放到位置 ${i}` });
        }
      }
    } else {
      for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && compare(arr[j], key, order)) {
          arr[j + 1] = arr[j];
          frames.push({ arr: arr.slice(), a: j, b: j + 1, text: `将 ${arr[j]} 后移，为 ${key} 腾出位置` });
          j--;
        }
        arr[j + 1] = key;
        frames.push({ arr: arr.slice(), a: j + 1, b: i, text: `插入 ${key} 到位置 ${j + 1}` });
      }
    }
    frames.push({ arr: arr.slice(), a: -1, b: -1, text: "排序完成" });
    index = 0;
    const slider = root.querySelector("#so-step");
    slider.max = frames.length - 1;
    slider.value = 0;
    show();
  };
  const show = () => {
    if (!frames.length) return;
    const frame = frames[index];
    const max = Math.max(...frames[0].arr.map(Math.abs), 1);
    root.querySelector("#so-bars").innerHTML = frame.arr.map((v, i) => `<div style="flex:1;max-width:58px;height:${Math.max(28, 135 * Math.abs(v) / max)}px;border-radius:8px 8px 3px 3px;background:${i === frame.a || i === frame.b ? "#e6a34b" : "#68a8a1"};display:flex;align-items:flex-start;justify-content:center;padding-top:6px;color:#fff;font-weight:750;font-size:12px">${v}</div>`).join("");
    root.querySelector("#so-caption").textContent = frame.text;
    root.querySelector("#so-counter").textContent = `${index + 1} / ${frames.length}`;
    root.querySelector("#so-step").value = index;
  };
  root.querySelector("#so-start").addEventListener("click", build);
  root.querySelector("#so-prev").addEventListener("click", () => { index = Math.max(0, index - 1); show(); });
  root.querySelector("#so-next").addEventListener("click", () => { index = Math.min(frames.length - 1, index + 1); show(); });
  root.querySelector("#so-step").addEventListener("input", (event) => { index = Number(event.target.value); show(); });
  build();
}

/* ------------------------------------------------------------------ */
/* 20. 查找与循环追踪                                                   */
/* ------------------------------------------------------------------ */

function setupTrace(root) {
  root.innerHTML = `
    <h3>查找与循环追踪器</h3>
    <p>输入数组和目标值，选择线性查找、二分查找或循环累加，逐步查看每一步的状态。</p>
    <div class="lab-controls">
      <label>数组 <input id="tr-array" value="7, 2, 9, 4, 6"></label>
      <label>目标 <input id="tr-target" type="number" value="4" style="width:70px"></label>
      <label>模式 <select id="tr-mode"><option value="linear">线性查找</option><option value="binary">二分查找</option><option value="sum">循环累加</option></select></label>
      <button class="study-button primary" id="tr-build">生成步骤</button>
    </div>
    <div class="lab-step" id="tr-items"></div>
    <div class="lab-output" id="tr-state"></div>
    <div class="lab-controls">
      <button class="study-button" id="tr-prev">上一步</button>
      <input id="tr-step" type="range" min="0" max="0" value="0" style="flex:1">
      <button class="study-button" id="tr-next">下一步</button>
      <span id="tr-counter"></span>
    </div>`;

  let frames = [];
  let index = 0;
  const build = () => {
    const values = splitList(root.querySelector("#tr-array").value).map(Number).filter(Number.isFinite).slice(0, 20);
    const target = Number(root.querySelector("#tr-target").value);
    const mode = root.querySelector("#tr-mode").value;
    frames = [];
    if (!values.length) return;
    if (mode === "linear") {
      frames.push({ values, active: -1, done: [], text: `准备从索引 0 开始比较目标 ${target}。` });
      for (let i = 0; i < values.length; i++) {
        frames.push({ values, active: i, done: [], text: `比较索引 ${i} 的值 ${values[i]} 与目标 ${target}。` });
        if (values[i] === target) {
          frames.push({ values, active: i, done: [i], text: `在索引 ${i} 找到目标 ${target}。` });
          break;
        }
        if (i === values.length - 1) frames.push({ values, active: -1, done: [], text: `扫描结束：数组中没有 ${target}。` });
      }
    } else if (mode === "binary") {
      const sorted = values.slice().sort((a, b) => a - b);
      let lo = 0;
      let hi = sorted.length - 1;
      frames.push({ values: sorted, active: -1, done: [], text: `先排序，得到 [${sorted.join(", ")}]。` });
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        frames.push({ values: sorted, active: mid, done: [], text: `区间 [${lo}, ${hi}]，中点 ${mid}，值 ${sorted[mid]}。` });
        if (sorted[mid] === target) {
          frames.push({ values: sorted, active: mid, done: [mid], text: `在索引 ${mid} 找到目标 ${target}。` });
          break;
        }
        if (sorted[mid] < target) {
          frames.push({ values: sorted, active: mid, done: [], text: `${sorted[mid]} < ${target}，舍弃左半部分。` });
          lo = mid + 1;
        } else {
          frames.push({ values: sorted, active: mid, done: [], text: `${sorted[mid]} > ${target}，舍弃右半部分。` });
          hi = mid - 1;
        }
        if (lo > hi) frames.push({ values: sorted, active: -1, done: [], text: `区间为空：数组中没有 ${target}。` });
      }
    } else {
      let sum = 0;
      frames.push({ values, active: -1, done: [], text: `初始 sum = 0。` });
      for (let i = 0; i < values.length; i++) {
        sum += values[i];
        frames.push({ values, active: i, done: Array.from({ length: i + 1 }, (_, j) => j), text: `i = ${i}：sum = ${sum}。` });
      }
      frames.push({ values, active: -1, done: values.map((_, i) => i), text: `循环结束，总和为 ${sum}。` });
    }
    index = 0;
    root.querySelector("#tr-step").max = Math.max(0, frames.length - 1);
    root.querySelector("#tr-step").value = 0;
    show();
  };
  const show = () => {
    if (!frames.length) return;
    const frame = frames[index];
    root.querySelector("#tr-items").innerHTML = frame.values.map((v, i) => `<span class="lab-token ${i === frame.active || frame.done.includes(i) ? "active" : ""}">${i}: ${v}</span>`).join("");
    root.querySelector("#tr-state").textContent = frame.text;
    root.querySelector("#tr-counter").textContent = `${index + 1} / ${frames.length}`;
    root.querySelector("#tr-step").value = index;
  };
  root.querySelector("#tr-build").addEventListener("click", build);
  root.querySelector("#tr-prev").addEventListener("click", () => { index = Math.max(0, index - 1); show(); });
  root.querySelector("#tr-next").addEventListener("click", () => { index = Math.min(frames.length - 1, index + 1); show(); });
  root.querySelector("#tr-step").addEventListener("input", (event) => { index = Number(event.target.value); show(); });
  root.querySelector("#tr-mode").addEventListener("change", build);
  build();
}

/* ------------------------------------------------------------------ */
/* 21. 二叉树遍历                                                       */
/* ------------------------------------------------------------------ */

function setupTree(root) {
  root.innerHTML = `
    <h3>二叉树遍历器</h3>
    <p>按层序输入节点（用 <code>null</code> 或 <code>-</code> 表示空位），选择前序、中序、后序或层序，逐步查看访问顺序。</p>
    <div class="lab-controls">
      <label style="flex:1;min-width:300px">层序节点 <input id="tree-values" value="A, B, C, D, E, F, G" style="width:100%"></label>
      <label>遍历 <select id="tree-order"><option value="pre">前序</option><option value="in">中序</option><option value="post">后序</option><option value="level">层序</option></select></label>
    </div>
    <div class="lab-controls">
      <button class="study-button" id="tree-prev">上一步</button>
      <button class="study-button primary" id="tree-next">下一步</button>
      <button class="study-button" id="tree-reset">重置</button>
    </div>
    <svg id="tree-svg" viewBox="0 0 760 300" style="width:100%;height:auto;background:#fbfdfc;border:1px solid #e5ece9;border-radius:12px"></svg>
    <div class="lab-step" id="tree-nodes"></div>
    <div class="lab-output" id="tree-state"></div>`;

  let nodes = [];
  let order = [];
  let step = 0;
  const parse = () => {
    const raw = splitList(root.querySelector("#tree-values").value);
    nodes = raw.map((value) => (value === "null" || value === "-" || value === "∅" ? null : value));
    return nodes;
  };
  const buildOrder = () => {
    const tree = parse();
    const type = root.querySelector("#tree-order").value;
    order = [];
    const visit = (index) => {
      if (index >= tree.length || !tree[index]) return;
      if (type === "pre") order.push(index);
      visit(index * 2 + 1);
      if (type === "in") order.push(index);
      visit(index * 2 + 2);
      if (type === "post") order.push(index);
    };
    if (type === "level") {
      const queue = [0];
      while (queue.length) {
        const index = queue.shift();
        if (index >= tree.length || !tree[index]) continue;
        order.push(index);
        queue.push(index * 2 + 1, index * 2 + 2);
      }
    } else visit(0);
    step = 0;
    draw();
    show();
  };
  const draw = () => {
    const NS = "http://www.w3.org/2000/svg";
    const svg = root.querySelector("#tree-svg");
    svg.replaceChildren();
    const current = step > 0 ? order[step - 1] : -1;
    nodes.forEach((value, index) => {
      if (!value) return;
      const depth = Math.floor(Math.log2(index + 1));
      const first = 2 ** depth - 1;
      const position = index - first;
      const count = 2 ** depth;
      const x = ((position + 0.5) / count) * 720 + 20;
      const y = 36 + depth * 66;
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      for (const child of [left, right]) {
        if (child >= nodes.length || !nodes[child]) continue;
        const childDepth = Math.floor(Math.log2(child + 1));
        const childFirst = 2 ** childDepth - 1;
        const childPosition = child - childFirst;
        const childCount = 2 ** childDepth;
        const cx = ((childPosition + 0.5) / childCount) * 720 + 20;
        const cy = 36 + childDepth * 66;
        const line = document.createElementNS(NS, "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", y);
        line.setAttribute("x2", cx);
        line.setAttribute("y2", cy);
        line.setAttribute("stroke", "#c9d8d4");
        line.setAttribute("stroke-width", "2");
        svg.append(line);
      }
      const circle = document.createElementNS(NS, "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", "17");
      circle.setAttribute("fill", index === current ? "#168c81" : "#ffffff");
      circle.setAttribute("stroke", "#7fa8a1");
      circle.setAttribute("stroke-width", "2");
      svg.append(circle);
      const text = document.createElementNS(NS, "text");
      text.setAttribute("x", x);
      text.setAttribute("y", y);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", index === current ? "#ffffff" : "#31515a");
      text.textContent = value;
      svg.append(text);
    });
  };
  const show = () => {
    const current = step > 0 ? order[step - 1] : -1;
    root.querySelector("#tree-nodes").innerHTML = order.map((index, i) => `<span class="lab-token ${i < step ? "active" : ""} ${i === step - 1 ? "active" : ""}">${esc(nodes[index])}</span>`).join("");
    root.querySelector("#tree-state").textContent = `已访问：${order.slice(0, step).map((i) => nodes[i]).join(" → ") || "—"}　下一节点：${step < order.length ? nodes[order[step]] : "遍历完成"}`;
    root.querySelector("#tree-next").disabled = step >= order.length;
    root.querySelector("#tree-prev").disabled = step <= 0;
    draw();
  };
  root.querySelector("#tree-order").addEventListener("change", buildOrder);
  root.querySelector("#tree-values").addEventListener("change", buildOrder);
  root.querySelector("#tree-next").addEventListener("click", () => { step = Math.min(order.length, step + 1); show(); });
  root.querySelector("#tree-prev").addEventListener("click", () => { step = Math.max(0, step - 1); show(); });
  root.querySelector("#tree-reset").addEventListener("click", buildOrder);
  buildOrder();
}

/* ------------------------------------------------------------------ */
/* 22. 缓存模拟                                                         */
/* ------------------------------------------------------------------ */

function setupCache(root) {
  root.innerHTML = `
    <h3>直接映射缓存模拟器</h3>
    <p>输入内存块访问序列，选择缓存行数，查看每次访问映射到的行、标签以及命中或未命中。</p>
    <div class="lab-controls">
      <label>块地址序列 <input id="ca-sequence" value="0, 1, 4, 0, 2, 4"></label>
      <label>缓存行数 <select id="ca-size"><option>2</option><option selected>4</option><option>8</option></select></label>
    </div>
    <div class="lab-output" id="ca-result"></div>`;

  const update = () => {
    const sequence = splitList(root.querySelector("#ca-sequence").value).map(Number).filter((x) => Number.isInteger(x) && x >= 0).slice(0, 30);
    const size = Number(root.querySelector("#ca-size").value);
    const lines = Array(size).fill(null);
    let hits = 0;
    const rows = sequence.map((address, index) => {
      const line = address % size;
      const tag = Math.floor(address / size);
      const hit = lines[line] === tag;
      if (hit) hits++;
      lines[line] = tag;
      return [String(index + 1), String(address), String(line), String(tag), `<span style="color:${hit ? "#16806f" : "#bd6c46"}">${hit ? "命中" : "未命中"}</span>`];
    });
    root.querySelector("#ca-result").innerHTML = `<b>命中 ${hits} 次 / 共 ${sequence.length} 次，命中率 ${(sequence.length ? (hits / sequence.length * 100).toFixed(1) : "0.0")}%</b>
      ${table(["次序", "块地址", "缓存行", "标签", "结果"], rows)}`;
  };
  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 23. 流水线                                                           */
/* ------------------------------------------------------------------ */

function setupPipeline(root) {
  root.innerHTML = `
    <h3>五级流水线时空图</h3>
    <p>观察多条指令如何在 IF、ID、EX、MEM、WB 阶段重叠；勾选 load-use 依赖以插入一个停顿。</p>
    <div class="lab-controls"><label><input id="pi-stall" type="checkbox"> 第 2 条 load 后立即使用结果</label></div>
    <div id="pi-table"></div>
    <div class="lab-output" id="pi-info"></div>`;

  const update = () => {
    const stall = root.querySelector("#pi-stall").checked;
    const instructions = ["I₁: add", "I₂: lw", "I₃: add", "I₄: sub"];
    const stages = ["IF", "ID", "EX", "MEM", "WB"];
    const starts = stall
      ? [[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 5, 6, 7], [4, 5, 6, 7, 8]]
      : [[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 4, 5, 6, 7]];
    const cycles = Math.max(...starts.flat()) + 1;
    const rows = instructions.map((name, row) => [
      esc(name),
      ...Array.from({ length: cycles }, (_, cycle) => {
        if (stall && row === 2 && cycle === 4) return '<span style="color:#a87524">停顿</span>';
        const stage = starts[row].indexOf(cycle);
        return stage >= 0 ? `<span style="color:#438173">${stages[stage]}</span>` : "";
      })
    ]);
    root.querySelector("#pi-table").innerHTML = table(["指令", ...Array.from({ length: cycles }, (_, i) => `C${i + 1}`)], rows);
    const total = cycles;
    const ideal = instructions.length + stages.length - 1;
    root.querySelector("#pi-info").innerHTML = `${stall ? "load-use 依赖使消费者停顿一个周期，后续指令也相应延后。" : "理想情况下阶段重叠，每周期可推进一条新指令。"}<br>
      完成 ${instructions.length} 条指令共需 <b>${total}</b> 个周期；无停顿的理想值为 ${ideal} 个周期。`;
  };
  root.querySelector("#pi-stall").addEventListener("change", update);
  update();
}

/* ------------------------------------------------------------------ */
/* 24. 调度器                                                           */
/* ------------------------------------------------------------------ */

function setupScheduling(root) {
  root.innerHTML = `
    <h3>CPU 调度器</h3>
    <p>所有进程同时到达。选择 FCFS、SJF 或轮转调度，比较执行区间、完成时间与平均等待时间。</p>
    <div class="lab-controls">
      <label>运行时间 <input id="sc-bursts" value="5, 3, 2"></label>
      <label>策略 <select id="sc-policy"><option value="fcfs">FCFS</option><option value="sjf">SJF</option><option value="rr">轮转</option></select></label>
      <label>时间片 <input id="sc-quantum" type="number" min="1" max="10" value="2" style="width:60px"></label>
    </div>
    <div class="lab-step" id="sc-gantt"></div>
    <div class="lab-output" id="sc-stats"></div>`;

  const update = () => {
    const bursts = splitList(root.querySelector("#sc-bursts").value).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 8);
    const policy = root.querySelector("#sc-policy").value;
    const quantum = Math.max(1, Number(root.querySelector("#sc-quantum").value) || 1);
    let time = 0;
    const segments = [];
    const completion = Array(bursts.length).fill(0);
    if (policy === "fcfs" || policy === "sjf") {
      const order = bursts.map((_, i) => i);
      if (policy === "sjf") order.sort((a, b) => bursts[a] - bursts[b]);
      for (const i of order) {
        segments.push({ i, start: time, end: time + bursts[i] });
        time += bursts[i];
        completion[i] = time;
      }
    } else {
      const remain = bursts.slice();
      const queue = bursts.map((_, i) => i);
      while (queue.length) {
        const i = queue.shift();
        const run = Math.min(quantum, remain[i]);
        segments.push({ i, start: time, end: time + run });
        time += run;
        remain[i] -= run;
        if (remain[i] === 0) completion[i] = time;
        else queue.push(i);
      }
    }
    root.querySelector("#sc-gantt").innerHTML = segments.map((segment) => `<span class="lab-token" style="flex:${segment.end - segment.start};background:${["#dcefe8", "#e8e2f4", "#f7e9d6", "#dcecf2"][segment.i % 4]}">P${segment.i + 1}<br><small>${segment.start}–${segment.end}</small></span>`).join("");
    const waiting = bursts.map((burst, i) => completion[i] - burst);
    const turnaround = bursts.map((burst, i) => completion[i]);
    root.querySelector("#sc-stats").innerHTML = bursts.map((burst, i) => `P${i + 1}：运行 ${burst}，完成 ${completion[i]}，等待 ${waiting[i]}`).join("<br>") +
      `<br><b>平均等待时间 ${(waiting.reduce((a, b) => a + b, 0) / Math.max(1, waiting.length)).toFixed(2)}，平均周转时间 ${(turnaround.reduce((a, b) => a + b, 0) / Math.max(1, turnaround.length)).toFixed(2)}</b>`;
  };
  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 25. 分页地址转换                                                     */
/* ------------------------------------------------------------------ */

function setupPaging(root) {
  root.innerHTML = `
    <h3>分页地址转换器</h3>
    <p>选择页大小，编辑页表，输入虚拟地址，查看虚拟页号、页内偏移、物理页框与物理地址。</p>
    <div class="lab-controls">
      <label>页大小 <select id="pg-size"><option value="4">4 字节</option><option value="8">8 字节</option><option value="16">16 字节</option></select></label>
      <label>虚拟地址 <input id="pg-address" type="number" min="0" value="9" style="width:100px"></label>
      <label style="flex:1;min-width:260px">页表（页号:页框，- 表示未驻留）<input id="pg-table" value="0:2, 1:0, 2:3, 3:1, 4:-, 5:-, 6:-, 7:-" style="width:100%"></label>
    </div>
    <div class="lab-output" id="pg-output"></div>`;

  const update = () => {
    const pageSize = Number(root.querySelector("#pg-size").value);
    const address = Math.max(0, Math.trunc(Number(root.querySelector("#pg-address").value) || 0));
    const tableText = root.querySelector("#pg-table").value;
    const mapping = new Map();
    for (const part of tableText.split(/[,，;；\s]+/)) {
      const match = part.match(/^(\d+)\s*[:=]\s*(-|\d+)$/);
      if (match) mapping.set(Number(match[1]), match[2] === "-" ? null : Number(match[2]));
    }
    const page = Math.floor(address / pageSize);
    const offset = address % pageSize;
    const frame = mapping.get(page);
    const rows = [...mapping.entries()].sort((a, b) => a[0] - b[0]).map(([p, f]) => [String(p), f === null ? "未驻留" : String(f)]);
    root.querySelector("#pg-output").innerHTML = `虚拟页号：<b>${page}</b>　页内偏移：<b>${offset}</b><br>
      ${frame === undefined ? "页表中没有该页：地址越界。" : frame === null ? "该页当前不在物理内存中：发生缺页。" : `物理页框：<b>${frame}</b>　物理地址：<b>${frame * pageSize + offset}</b>`}
      ${table(["虚拟页", "物理页框"], rows, "页表")}`;
  };
  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 26. 关系查询                                                         */
/* ------------------------------------------------------------------ */

function setupRelational(root) {
  const rows = [
    { id: 1, name: "Ada", course: "数学", score: 92 },
    { id: 2, name: "Lin", course: "计算机", score: 88 },
    { id: 3, name: "Grace", course: "计算机", score: 97 },
    { id: 4, name: "Alan", course: "数学", score: 76 }
  ];
  root.innerHTML = `
    <h3>关系查询工具</h3>
    <p>在示例关系表上设置选择条件与排序方式，观察关系代数中的选择、投影和排序如何作用于元组。</p>
    <div class="lab-controls">
      <label>课程 <select id="rq-course"><option value="all">全部</option><option>数学</option><option>计算机</option></select></label>
      <label>最低分 <input id="rq-min" type="number" min="0" max="100" value="80" style="width:70px"></label>
      <label>排序 <select id="rq-sort"><option value="id">按 id</option><option value="score-desc">按分数降序</option><option value="score-asc">按分数升序</option></select></label>
    </div>
    <div class="lab-output" id="rq-output"></div>`;

  const update = () => {
    const course = root.querySelector("#rq-course").value;
    const min = Number(root.querySelector("#rq-min").value) || 0;
    const sort = root.querySelector("#rq-sort").value;
    let result = rows.filter((row) => (course === "all" || row.course === course) && row.score >= min);
    if (sort === "score-desc") result = result.slice().sort((a, b) => b.score - a.score);
    if (sort === "score-asc") result = result.slice().sort((a, b) => a.score - b.score);
    root.querySelector("#rq-output").innerHTML = `返回 ${result.length} 行
      ${table(["id", "name", "course", "score"], result.map((row) => [String(row.id), esc(row.name), esc(row.course), String(row.score)]), "查询结果")}
      <p style="margin:8px 0 0">等价条件：course ${course === "all" ? "不限" : `= '${esc(course)}'`} 且 score ≥ ${min}。</p>`;
  };
  root.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", update));
  update();
}

/* ------------------------------------------------------------------ */
/* 27. 协议封装                                                         */
/* ------------------------------------------------------------------ */

function setupEncapsulation(root) {
  const layers = [
    { name: "应用层", header: "HTTP 首部", payload: "GET /index.html" },
    { name: "运输层", header: "TCP 首部", payload: "源端口 → 目标端口" },
    { name: "网络层", header: "IP 首部", payload: "源地址 → 目标地址" },
    { name: "链路层", header: "以太网帧头", payload: "帧头 + 帧校验" }
  ];
  root.innerHTML = `
    <h3>协议封装查看器</h3>
    <p>选择发送端封装或接收端解封装，逐步查看每一层添加或移除的首部。</p>
    <div class="lab-controls">
      <label>方向 <select id="pk-direction"><option value="down">发送端：封装</option><option value="up">接收端：解封装</option></select></label>
      <button class="study-button" id="pk-prev">上一步</button>
      <button class="study-button primary" id="pk-next">下一步</button>
      <button class="study-button" id="pk-reset">重置</button>
    </div>
    <div class="lab-step" id="pk-layers"></div>
    <div class="lab-output" id="pk-state"></div>`;

  let step = 0;
  const update = () => {
    const down = root.querySelector("#pk-direction").value === "down";
    const activeIndex = down ? step - 1 : step >= layers.length ? -1 : layers.length - step;
    root.querySelector("#pk-layers").innerHTML = layers.map((layer, index) => `<span class="lab-token ${index === activeIndex ? "active" : ""}">${layer.name}</span>`).join("");
    const visible = down ? layers.slice(0, step) : layers.slice(0, layers.length - step);
    const detail = down
      ? (step === 0 ? "原始应用数据尚未封装。" : `已添加 ${step} 层首部；当前数据单元：${visible.map((layer) => `${layer.header} + ${layer.payload}`).join("  |  ")}`)
      : (step === 0 ? "收到的完整链路帧尚未解封装。" : step >= layers.length ? "链路、网络与运输层首部已移除，应用数据交付给应用程序。" : `已移除 ${step} 层首部；剩余：${visible.map((layer) => `${layer.header} + ${layer.payload}`).join("  |  ")}`);
    root.querySelector("#pk-state").textContent = detail;
    root.querySelector("#pk-next").disabled = step >= layers.length;
    root.querySelector("#pk-prev").disabled = step <= 0;
  };
  root.querySelector("#pk-next").addEventListener("click", () => { step = Math.min(layers.length, step + 1); update(); });
  root.querySelector("#pk-prev").addEventListener("click", () => { step = Math.max(0, step - 1); update(); });
  root.querySelector("#pk-reset").addEventListener("click", () => { step = 0; update(); });
  root.querySelector("#pk-direction").addEventListener("change", () => { step = 0; update(); });
  update();
}

/* ------------------------------------------------------------------ */
/* 28. 竞态与互斥                                                       */
/* ------------------------------------------------------------------ */

function setupRace(root) {
  root.innerHTML = `
    <h3>竞态与互斥模拟器</h3>
    <p>两个线程都执行“读取 counter、加一、写回”。比较无锁交错执行与互斥执行的结果。</p>
    <div class="lab-controls">
      <label>执行方式 <select id="ra-mode"><option value="race">交错执行（无锁）</option><option value="serial">互斥执行</option></select></label>
      <button class="study-button primary" id="ra-run">运行</button>
    </div>
    <div class="lab-step" id="ra-steps"></div>
    <div class="lab-output" id="ra-result"></div>`;

  const run = () => {
    const serial = root.querySelector("#ra-mode").value === "serial";
    const steps = serial ? [
      ["T1", "读取 counter = 0"], ["T1", "写回 counter = 1"],
      ["T2", "读取 counter = 1"], ["T2", "写回 counter = 2"]
    ] : [
      ["T1", "读取 counter = 0"], ["T2", "读取 counter = 0"],
      ["T1", "写回 counter = 1"], ["T2", "写回 counter = 1"]
    ];
    root.querySelector("#ra-steps").innerHTML = steps.map(([thread, action], index) => `<span class="lab-token">${index + 1}. ${thread}：${action}</span>`).join("");
    root.querySelector("#ra-result").innerHTML = `最终 counter = <b>${serial ? 2 : 1}</b><br>${serial ? "互斥让两个读-改-写操作依次完成，结果正确。" : "两个线程都读到旧值 0，后写入的 1 覆盖了另一个更新，发生丢失更新。"}`;
  };
  root.querySelector("#ra-run").addEventListener("click", run);
  root.querySelector("#ra-mode").addEventListener("change", run);
  run();
}

/* ------------------------------------------------------------------ */
/* 29. 规则系统检验                                                     */
/* ------------------------------------------------------------------ */

function setupRuleSystem(root) {
  const hands = ["石头", "剪刀", "布"];
  const presets = {
    standard: { rock: ["剪刀"], scissors: ["布"], paper: ["石头"] },
    variant: { rock: ["剪刀", "布"], scissors: ["布"], paper: [] }
  };
  root.innerHTML = `
    <h3>规则系统检验器</h3>
    <p>编辑三种手势之间的胜负关系，检查是否存在一种手势能胜过其余全部手势。这是公理化方法中“用模型检验推论”的具体操作。</p>
    <div class="lab-controls">
      <label>预设 <select id="ru-preset"><option value="standard">标准规则</option><option value="variant">变体：石头胜布</option><option value="custom">自定义</option></select></label>
      <button class="study-button primary" id="ru-check">检验推论</button>
    </div>
    <div id="ru-table"></div>
    <div class="lab-output" id="ru-result"></div>`;

  const key = { 石头: "rock", 剪刀: "scissors", 布: "paper" };
  let beats = JSON.parse(JSON.stringify(presets.standard));

  const renderTable = () => {
    const rows = hands.map((a) => [
      esc(a),
      ...hands.map((b) => {
        if (a === b) return '<span style="color:#93a2a8">平</span>';
        return `<select data-ru-a="${key[a]}" data-ru-b="${key[b]}" style="border:1px solid #dfe8e5;border-radius:6px;padding:3px 5px">
          <option value="win" ${beats[key[a]].includes(b) ? "selected" : ""}>胜</option>
          <option value="lose" ${!beats[key[a]].includes(b) && beats[key[b]].includes(a) ? "selected" : ""}>负</option>
          <option value="draw" ${!beats[key[a]].includes(b) && !beats[key[b]].includes(a) ? "selected" : ""}>平</option>
        </select>`;
      })
    ]);
    root.querySelector("#ru-table").innerHTML = table(["出手方 \\ 对方", ...hands], rows, "胜负关系（行为出手方，列为对方）");
    root.querySelectorAll("[data-ru-a]").forEach((select) => {
      select.addEventListener("change", () => {
        const a = select.dataset.ruA;
        const b = select.dataset.ruB;
        const aHand = hands.find((hand) => key[hand] === a);
        const bHand = hands.find((hand) => key[hand] === b);
        beats[a] = beats[a].filter((item) => item !== bHand);
        beats[b] = beats[b].filter((item) => item !== aHand);
        if (select.value === "win") beats[a].push(bHand);
        if (select.value === "lose") beats[b].push(aHand);
        root.querySelector("#ru-preset").value = "custom";
        root.querySelector("#ru-result").textContent = "";
        renderTable();
      });
    });
  };

  const check = () => {
    const rows = hands.map((a) => {
      const others = hands.filter((b) => b !== a);
      const wins = others.filter((b) => beats[key[a]].includes(b));
      const loses = others.filter((b) => beats[key[b]].includes(a));
      return { hand: a, wins, loses, all: wins.length === others.length };
    });
    const all = rows.filter((row) => row.all);
    root.querySelector("#ru-result").innerHTML = rows.map((row) => `${row.hand}：胜 ${row.wins.join("、") || "无"}；负于 ${row.loses.join("、") || "无"} → ${row.all ? "能胜过其余全部" : "不能胜过其余全部"}`).join("<br>") +
      `<br><br>结论：${all.length ? `存在能胜过其余全部手势的手势——<b>${all.map((row) => row.hand).join("、")}</b>。` : "<b>不存在</b>能胜过其余全部手势的手势。"}`;
  };
  root.querySelector("#ru-preset").addEventListener("change", (event) => {
    if (event.target.value === "custom") return;
    beats = JSON.parse(JSON.stringify(presets[event.target.value]));
    renderTable();
    root.querySelector("#ru-result").textContent = "";
  });
  root.querySelector("#ru-check").addEventListener("click", check);
  renderTable();
  check();
}

/* ------------------------------------------------------------------ */
/* 工具注册表                                                          */
/* ------------------------------------------------------------------ */

const FORMULAS = {
  "rule-system": [
    String.raw`x\succ y`,
    String.raw`\forall y\in H\setminus\{x\}:x\succ y`
  ],
  "set-toolbox": [
    String.raw`A\cup B=\{x\mid x\in A\lor x\in B\}`,
    String.raw`A\cap B=\{x\mid x\in A\land x\in B\}`,
    String.raw`A\setminus B=\{x\mid x\in A\land x\notin B\}`,
    String.raw`|A\times B|=|A|\cdot|B|`
  ],
  "quantifier": [
    String.raw`\forall x\in D\,P(x)`,
    String.raw`\exists x\in D\,P(x)`,
    String.raw`\neg\forall x\in D\,P(x)\iff\exists x\in D\,\neg P(x)`
  ],
  "successor": [
    String.raw`a+0=a`,
    String.raw`a+S(b)=S(a+b)`
  ],
  "induction": [
    String.raw`P(1)\land(\forall k\,(P(k)\Rightarrow P(k+1)))\Rightarrow\forall n\,P(n)`,
    String.raw`1+2+\cdots+n=\frac{n(n+1)}{2}`
  ],
  "number-line": [
    String.raw`a+(-b)=a-b`,
    String.raw`|a-b|`
  ],
  "base-converter": [
    String.raw`(d_{n-1}\cdots d_0.d_{-1}\cdots d_{-m})_b=\sum_{i=-m}^{n-1}d_i b^i`,
    String.raw`n=\sum_{i=0}^{k}r_i b^i,\quad 0\le r_i<b`
  ],
  "integer-codes": [
    String.raw`u=\sum_{i=0}^{n-1}b_i2^i`,
    String.raw`-x\equiv2^n-x\pmod{2^n}`,
    String.raw`v=\begin{cases}u,&u<2^{n-1}\\u-2^n,&u\ge2^{n-1}\end{cases}`
  ],
  "overflow": [
    String.raw`s=(a+b)\bmod2^n`,
    String.raw`-2^{n-1}\le a+b\le2^{n-1}-1`
  ],
  "boolean": [
    String.raw`S=A\oplus B\oplus C_{\mathrm{in}}`,
    String.raw`C_{\mathrm{out}}=AB+C_{\mathrm{in}}(A\oplus B)`,
    String.raw`\overline{A+B}=\bar A\cdot\bar B`
  ],
  "float": [
    String.raw`(-1)^s(1.f)_2\,2^{e-\mathrm{bias}}`,
    String.raw`\left|\hat x-x\right|`
  ],
  "unicode": [
    String.raw`\texttt{U+4E2D}`,
    String.raw`\text{UTF-8}(\texttt{U+4E2D})=\texttt{E4B8AD}`
  ],
  "endianness": [
    String.raw`\texttt{12\,34\,56\,78}`,
    String.raw`\texttt{78\,56\,34\,12}`
  ],
  "bitwise": [
    String.raw`A\ \&\ B,\quad A\ \texttt{|}\ B,\quad A\oplus B`,
    String.raw`A\ll k=(A\cdot2^k)\bmod2^n`,
    String.raw`A\gg k=\left\lfloor A/2^k\right\rfloor`
  ],
  "graph-studio": [
    String.raw`\sum_{v\in V}\deg(v)=2|E|`,
    String.raw`d(v)\leftarrow\min\{d(v),d(u)+w(u,v)\}`
  ],
  "shortest-path": [
    String.raw`d(v)=\min_{P:A\to v}\sum_{e\in P}w(e)`,
    String.raw`d(v)\leftarrow\min\{d(v),d(u)+w(u,v)\}`
  ],
  "growth": [
    String.raw`O(1)\subseteq O(\log n)\subseteq O(n)\subseteq O(n\log n)\subseteq O(n^2)\subseteq O(2^n)`
  ],
  "sorting": [
    String.raw`a_{\pi(1)}\le a_{\pi(2)}\le\cdots\le a_{\pi(n)}`,
    String.raw`\#\{(i,j):i<j,\ a_i>a_j\}`
  ],
  "trace": [
    String.raw`\exists i\in[0,n-1]:a_i=t`,
    String.raw`mid=\left\lfloor\frac{lo+hi}{2}\right\rfloor`,
    String.raw`S=\sum_{i=0}^{n-1}a_i`
  ],
  "tree": [
    String.raw`\left\lfloor\log_2(i+1)\right\rfloor`,
    String.raw`\text{preorder}(T)=r,\text{preorder}(L),\text{preorder}(R)`
  ],
  "cache": [
    String.raw`\ell=b\bmod m`,
    String.raw`\mathrm{tag}=\left\lfloor b/m\right\rfloor`,
    String.raw`\text{hit rate}=H/N`
  ],
  "pipeline": [
    String.raw`T_{\text{pipe}}=k+(n-1)`,
    String.raw`S=\frac{T_{\text{seq}}}{T_{\text{pipe}}}`
  ],
  "scheduling": [
    String.raw`W_i=C_i-A_i-B_i`,
    String.raw`\bar W=\frac{1}{n}\sum_{i=1}^{n}W_i`
  ],
  "paging": [
    String.raw`VPN=\left\lfloor VA/S\right\rfloor`,
    String.raw`\text{offset}=VA\bmod S`,
    String.raw`PA=PF\cdot S+\text{offset}`
  ],
  "race": [
    String.raw`\text{read}:r_i\leftarrow counter`,
    String.raw`\text{write}:counter\leftarrow r_i+1`
  ],
  "relational": [
    String.raw`\sigma_{\text{cond}}(R)`,
    String.raw`\pi_{\text{attrs}}(R)`
  ],
  "encapsulation": [
    String.raw`PDU_i=H_i\parallel PDU_{i-1}`
  ],
  "derivative": [
    String.raw`f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h}`,
    String.raw`f'(x)\approx\frac{f(x+h)-f(x-h)}{2h}`
  ],
  "gradient": [
    String.raw`L(w)=(w-w^*)^2`,
    String.raw`w_{t+1}=w_t-\eta\nabla L(w_t)`
  ]
};

export const TOOLS = [
  { id: "rule-system", title: "规则系统检验器", group: "math", summary: "编辑胜负关系，检验一条推论在模型中是否成立。", nodes: ["axiomatic-method"], mount: setupRuleSystem },
  { id: "set-toolbox", title: "集合工具", group: "math", summary: "检查成员与包含关系，计算并、交、差、对称差。", nodes: ["sets", "set-operations"], mount: setupSetTool },
  { id: "quantifier", title: "量词真值检查器", group: "math", summary: "在有限论域上检查 ∀ 与 ∃ 的真值，给出反例或见证。", nodes: ["predicate-logic"], mount: setupQuantifier },
  { id: "successor", title: "后继与递归加法器", group: "math", summary: "用后继函数逐步展开自然数加法。", nodes: ["peano-axioms", "natural-numbers"], mount: setupSuccessor },
  { id: "induction", title: "归纳验证器", group: "math", summary: "检查基础步、归纳假设与归纳步，并数值核对结论。", nodes: ["mathematical-induction"], mount: setupInduction },
  { id: "number-line", title: "数轴加减器", group: "math", summary: "在数轴上观察正负数加减的移动方向。", nodes: ["integers"], mount: setupNumberLine },
  { id: "base-converter", title: "任意进制转换", group: "repr", summary: "2–36 进制互换，支持负数与小数，并展示完整演算。", nodes: ["place-value", "base-conversion"], mount: mountBaseConverter },
  { id: "integer-codes", title: "整数编码器", group: "repr", summary: "任意位宽下查看无符号、原码、反码与补码。", nodes: ["bits-bytes", "unsigned", "twos-complement"], mount: setupIntegerCodes },
  { id: "overflow", title: "定长加法与溢出", group: "repr", summary: "执行定长加法，查看 CF、OF 与位串结果。", nodes: ["overflow"], mount: setupOverflow },
  { id: "boolean", title: "布尔运算与加法器", group: "repr", summary: "查看逻辑运算真值表或一位全加器的和与进位。", nodes: ["boolean-algebra", "logic-gates", "boolean-simplification", "adders"], mount: setupBoolean },
  { id: "float", title: "IEEE 754 浮点查看器", group: "repr", summary: "查看十进制小数舍入后的位字段与误差。", nodes: ["floating-point"], mount: setupFloat },
  { id: "unicode", title: "Unicode 与 UTF-8 编码器", group: "repr", summary: "逐字符查看码点、UTF-16 码元与 UTF-8 字节。", nodes: ["character-codes"], mount: setupUnicode },
  { id: "endianness", title: "字节序查看器", group: "repr", summary: "比较 16/32/64 位整数在大端与小端中的字节排列。", nodes: ["endianness"], mount: setupEndianness },
  { id: "bitwise", title: "位运算器", group: "repr", summary: "在 8/16/32 位下执行与、或、异或、取反与移位。", nodes: ["bitwise-operations"], mount: setupBitwise },
  { id: "graph-studio", title: "图工具", group: "prog", summary: "自由构造有向/无向、带权图，查看度数、连通性、遍历与最短路。", nodes: ["graph-theory", "graph-representation", "bfs-dfs"], mount: setupGraphStudio },
  { id: "shortest-path", title: "最短路工具", group: "prog", summary: "编辑带权边表，运行 Dijkstra 并查看距离表与路径。", nodes: ["shortest-paths", "routing"], mount: setupShortestPath },
  { id: "growth", title: "增长率比较器", group: "prog", summary: "比较 n、n log n、n² 与 2ⁿ 随规模增长的速度。", nodes: ["complexity"], mount: setupGrowth },
  { id: "sorting", title: "排序过程可视化", group: "prog", summary: "输入任意数组，逐步查看冒泡、选择或插入排序。", nodes: ["sorting"], mount: setupSorting },
  { id: "trace", title: "查找与循环追踪器", group: "prog", summary: "逐步执行线性查找、二分查找或循环累加。", nodes: ["algorithm", "control-flow"], mount: setupTrace },
  { id: "tree", title: "二叉树遍历器", group: "prog", summary: "按层序构造二叉树，逐步查看四种遍历顺序。", nodes: ["trees"], mount: setupTree },
  { id: "cache", title: "直接映射缓存模拟器", group: "hardware", summary: "输入块地址序列，查看缓存行、标签与命中率。", nodes: ["cache"], mount: setupCache },
  { id: "pipeline", title: "五级流水线时空图", group: "hardware", summary: "观察指令重叠执行，以及 load-use 停顿的影响。", nodes: ["cpu-pipeline"], mount: setupPipeline },
  { id: "scheduling", title: "CPU 调度器", group: "os", summary: "比较 FCFS、SJF 与轮转调度的执行区间与等待时间。", nodes: ["scheduling"], mount: setupScheduling },
  { id: "paging", title: "分页地址转换器", group: "os", summary: "编辑页表，把虚拟地址转换为物理地址或缺页。", nodes: ["virtual-memory"], mount: setupPaging },
  { id: "race", title: "竞态与互斥模拟器", group: "os", summary: "比较无锁交错执行与互斥执行的丢失更新。", nodes: ["synchronization", "processes-threads"], mount: setupRace },
  { id: "relational", title: "关系查询工具", group: "data", summary: "在关系表上组合选择、投影与排序条件。", nodes: ["databases"], mount: setupRelational },
  { id: "encapsulation", title: "协议封装查看器", group: "network", summary: "逐步查看应用数据如何加上各层首部并解封装。", nodes: ["networking", "transport-protocols", "application-protocols"], mount: setupEncapsulation },
  { id: "derivative", title: "函数与导数观察器", group: "math", summary: "比较函数值、精确导数与数值差商，观察切线。", nodes: ["calculus"], mount: setupDerivative },
  { id: "gradient", title: "梯度下降观察器", group: "ai", summary: "调整目标、初始值、学习率与迭代次数，观察收敛。", nodes: ["machine-learning"], mount: setupGradient }
];

for (const tool of TOOLS) {
  if (FORMULAS[tool.id]) tool.formulas = FORMULAS[tool.id];
}

export const TOOL_BY_ID = Object.fromEntries(TOOLS.map((tool) => [tool.id, tool]));

export const NODE_TOOL = Object.fromEntries(TOOLS.flatMap((tool) => tool.nodes.map((nodeId) => [nodeId, tool.id])));

export function mountTool(toolId, root, context = {}) {
  const tool = TOOL_BY_ID[toolId];
  if (!tool) return false;
  root.innerHTML = "";
  tool.mount(root, context);

  if (tool.formulas?.length) {
    const formulaBox = document.createElement("div");
    formulaBox.className = "lab-formulas";
    formulaBox.innerHTML = `<b>公式</b>${tool.formulas.map((tex) => `<div class="lab-formula">$$${esc(tex)}$$</div>`).join("")}`;
    const intro = root.querySelector("p");
    if (intro) intro.insertAdjacentElement("afterend", formulaBox);
    else root.prepend(formulaBox);
  }

  if (typeof context.applyMath === "function") {
    let queued = false;
    const typeset = () => {
      queued = false;
      context.applyMath(root);
    };
    const observer = new MutationObserver(() => {
      if (!queued) {
        queued = true;
        queueMicrotask(typeset);
      }
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    context.applyMath(root);
  }
  return true;
}
